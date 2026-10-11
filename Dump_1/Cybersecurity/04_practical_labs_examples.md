# Practical Labs & Hands-On Exercises

> **All exercises below must be performed only against systems you own, deliberately vulnerable applications designed for this purpose, or environments you have explicit written authorization to test (e.g., your own local VMs, authorized CTF infrastructure, or TryHackMe/HackTheBox targets). Never run these techniques against third-party systems without permission.**

---

## Lab 1: Local DVWA + Juice Shop Setup — Find 3 Vulnerability Classes

**Goal:** Stand up two classic deliberately-vulnerable apps locally and manually find instances of SQLi, XSS, and Broken Access Control.

### Step-by-step
1. Install Docker Desktop if not already installed.
2. Run OWASP Juice Shop:
   ```bash
   docker run -d -p 3000:3000 bkimminich/juice-shop
   ```
   Browse to `http://localhost:3000`.
3. Run DVWA:
   ```bash
   docker run -d -p 8080:80 vulnerables/web-dvwa
   ```
   Browse to `http://localhost:8080`, set DVWA security level to "low" first for learning purposes.
4. **Find SQLi (DVWA → SQL Injection module):** try `' OR '1'='1` in the user ID field. Observe all users returned. Then try `1' UNION SELECT user, password FROM users -- -` to extract credentials.
5. **Find stored XSS (Juice Shop):** look for a product review or feedback field; submit `<script>alert(document.cookie)</script>` and confirm it fires when the page is viewed by another "user" (or on reload).
6. **Find Broken Access Control / IDOR (Juice Shop):** log in as a low-privilege user, inspect API calls in browser DevTools Network tab, then try modifying an order/basket ID in the URL or request body to access another user's resource.
7. Document each finding: vulnerable request, payload used, observed impact, and a one-line fix recommendation (parameterized queries, output encoding, server-side ownership checks).

---

## Lab 2: Script to Detect Error-Based SQL Injection

**Goal:** Write a Python script that probes a test parameter for classic error-based SQLi indicators (for use only against your own local DVWA instance).

```python
import requests

TARGET_URL = "http://localhost:8080/vulnerabilities/sqli/"  # your own local DVWA instance only
COOKIES = {"PHPSESSID": "REPLACE_WITH_YOUR_SESSION", "security": "low"}

PAYLOADS = [
    "1",
    "1'",
    "1''",
    "1' OR '1'='1",
    "1' AND '1'='2",
]

SQL_ERROR_SIGNATURES = [
    "you have an error in your sql syntax",
    "warning: mysql",
    "unclosed quotation mark",
    "quoted string not properly terminated",
]

def check_sqli(url, cookies):
    baseline = requests.get(url, params={"id": "1", "Submit": "Submit"}, cookies=cookies)
    for payload in PAYLOADS:
        resp = requests.get(url, params={"id": payload, "Submit": "Submit"}, cookies=cookies)
        body_lower = resp.text.lower()
        for sig in SQL_ERROR_SIGNATURES:
            if sig in body_lower:
                print(f"[+] Possible SQL injection with payload: {payload!r}")
                print(f"    Matched error signature: {sig!r}")
                break
        else:
            if len(resp.text) != len(baseline.text):
                print(f"[?] Response length differs for payload {payload!r} — investigate manually")

if __name__ == "__main__":
    check_sqli(TARGET_URL, COOKIES)
```

**Extension exercise:** Add a time-based blind detection function using `' OR SLEEP(5)-- -` style payloads and measuring response latency.

---

## Lab 3: Build a Simple TCP Port Scanner in Python

**Goal:** Understand what Nmap does under the hood by writing a minimal multi-threaded scanner.

```python
import socket
import sys
from concurrent.futures import ThreadPoolExecutor

TARGET = "127.0.0.1"  # only scan hosts you own or are authorized to scan
PORT_RANGE = range(1, 1025)

def scan_port(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(0.5)
    try:
        result = sock.connect_ex((TARGET, port))
        if result == 0:
            try:
                service = socket.getservbyport(port)
            except OSError:
                service = "unknown"
            print(f"[OPEN] Port {port:5d}  ({service})")
    finally:
        sock.close()

if __name__ == "__main__":
    print(f"Scanning {TARGET} ports {PORT_RANGE.start}-{PORT_RANGE.stop - 1}...")
    with ThreadPoolExecutor(max_workers=200) as executor:
        executor.map(scan_port, PORT_RANGE)
    print("Scan complete.")
```

**Extension exercise:** Add a `--udp` mode (note UDP scanning requires interpreting absence of ICMP port-unreachable as "open|filtered"), and a basic banner-grab (`sock.recv(1024)`) after connecting to identify service versions.

---

## Lab 4: Basic IDS Rule in Suricata — Detect a Port Scan and a Suspicious User-Agent

**Goal:** Install Suricata locally, write custom rules, and trigger them with your own traffic.

### Step-by-step
1. Install Suricata:
   ```bash
   sudo apt install suricata   # Debian/Ubuntu
   ```
2. Create a custom rule file `/etc/suricata/rules/local.rules`:
   ```
   # Detect a classic Nmap SYN scan signature (multiple SYN packets, no data, within a short window)
   alert tcp any any -> $HOME_NET any (msg:"Possible Nmap SYN scan detected"; flags:S; threshold:type both, track by_src, count 20, seconds 10; sid:1000001; rev:1;)

   # Detect a known malicious/test User-Agent string in HTTP traffic
   alert http any any -> $HOME_NET any (msg:"Suspicious scanner User-Agent detected (sqlmap)"; http.user_agent; content:"sqlmap"; nocase; sid:1000002; rev:1;)

   # Detect plaintext password in HTTP traffic (example of a data-leak detection rule)
   alert http any any -> any any (msg:"Possible plaintext password submission over HTTP"; content:"password="; http_client_body; sid:1000003; rev:1;)
   ```
3. Reference the rule file in `/etc/suricata/suricata.yaml` under `rule-files:`.
4. Run Suricata against a live interface or a pcap for testing:
   ```bash
   sudo suricata -c /etc/suricata/suricata.yaml -i eth0
   # or, to test against a saved capture file:
   suricata -r test_traffic.pcap -c /etc/suricata/suricata.yaml -l /var/log/suricata/
   ```
5. Generate test traffic against your own lab VM: run `nmap -sS <your_lab_vm_ip>` from another machine on the same network, or run `sqlmap` against your local DVWA instance, and confirm alerts appear in `/var/log/suricata/fast.log` or `eve.json`.

**Extension exercise:** Tune the SYN-scan rule's `threshold` values to reduce false positives against normal traffic bursts, and add a rule detecting ARP spoofing indicators (rapid, conflicting ARP replies for the same IP from different MAC addresses — Suricata's `arp` keyword support varies by version; alternatively use `arpwatch` for this specific case).

---

## Lab 5: Capture and Analyze an ARP Spoofing Attack

**Goal:** In a local, isolated lab (two VMs on an isolated virtual network you control, e.g., VirtualBox host-only network), observe a MITM attack at the packet level.

### Step-by-step
1. Set up two VMs (e.g., "Victim" and "Attacker") on an isolated host-only virtual network — never your home/production network.
2. On the Attacker VM, install `dsniff` (for `arpspoof`) or Bettercap.
3. Start a Wireshark capture on the Victim VM (or on a third monitoring VM if your virtual switch supports port mirroring).
4. On the Attacker VM, run:
   ```bash
   sudo arpspoof -i eth0 -t <victim_ip> <gateway_ip>
   sudo arpspoof -i eth0 -t <gateway_ip> <victim_ip>
   sudo sysctl -w net.ipv4.ip_forward=1   # so traffic still flows through the attacker transparently
   ```
5. On the Victim VM, generate some traffic (e.g., `curl http://example.com` or ping the gateway) and observe in Wireshark:
   - Duplicate/conflicting ARP replies for the gateway's IP mapped to the attacker's MAC address.
   - The victim's ARP cache (`arp -a` on Victim) now shows the attacker's MAC for the gateway IP.
6. Stop the attack and note how `arp -a` reverts after the cache entries expire or after a clean re-ARP.

**Extension exercise:** Capture the same scenario while the victim loads an HTTPS site, and confirm that despite the MITM position, the attacker cannot read the encrypted payload — then explain in your own notes exactly which layer (TLS, not ARP/IP) is providing that protection, and what would happen if the victim ignored a certificate warning.

---

## Lab 6: Write a Minimal Python HTTP Security Header Auditor

**Goal:** Build a lightweight tool to check whether a web app (your own local app) is setting recommended security headers.

```python
import requests

TARGET_URL = "http://localhost:3000"  # your own local app/lab target

RECOMMENDED_HEADERS = {
    "Content-Security-Policy": "Mitigates XSS by restricting resource origins",
    "Strict-Transport-Security": "Forces HTTPS-only connections",
    "X-Content-Type-Options": "Prevents MIME-sniffing",
    "X-Frame-Options": "Prevents clickjacking",
    "Referrer-Policy": "Limits Referer header leakage",
}

def audit_headers(url):
    resp = requests.get(url)
    print(f"Auditing: {url}  (status {resp.status_code})\n")
    for header, purpose in RECOMMENDED_HEADERS.items():
        if header in resp.headers:
            print(f"[OK]      {header}: {resp.headers[header]}")
        else:
            print(f"[MISSING] {header} — {purpose}")

    set_cookie = resp.headers.get("Set-Cookie", "")
    if set_cookie:
        for flag in ["HttpOnly", "Secure", "SameSite"]:
            status = "OK" if flag.lower() in set_cookie.lower() else "MISSING"
            print(f"[{status}] Cookie flag: {flag}")

if __name__ == "__main__":
    audit_headers(TARGET_URL)
```

**Extension exercise:** Extend the script to accept a list of URLs from a file and output a CSV report summarizing header coverage across an authorized target set — this mirrors a simplified version of what tools like `securityheaders.com` or Nikto check automatically.

---

## General Lab Hygiene Checklist

- [ ] All targets are local VMs, Docker containers, or explicitly authorized lab/CTF infrastructure.
- [ ] Isolated network (host-only/NAT) used for any traffic manipulation exercises (ARP/DNS spoofing).
- [ ] No real personal credentials or production data used in test apps.
- [ ] Findings documented with payload, request/response evidence, and remediation — practicing the reporting skill alongside the technical skill.
- [ ] Lab environment torn down/snapshotted after use (`docker rm`, VM snapshot revert) to keep a clean baseline for the next exercise.
