# Tools, Platforms, and Resources

Curated, real, well-known resources for security learning and practice.

## Learning Platforms

| Platform | URL | Description / When to Use |
|---|---|---|
| TryHackMe | https://tryhackme.com | Guided, beginner-friendly rooms and structured learning paths (SOC Level 1/2, Offensive Pentesting, Pre Security). Best starting point for total beginners. |
| HackTheBox | https://hackthebox.com | Less hand-holding than THM; realistic boxes and labs for intermediate-to-advanced practice; includes Academy (structured courses) and Pro Labs (enterprise-style networks). |
| PortSwigger Web Security Academy | https://portswigger.net/web-security | Free, extremely high-quality web app security labs written by the makers of Burp Suite. The gold standard for learning OWASP Top 10 hands-on, with guided theory for each vuln class. |
| PentesterLab | https://pentesterlab.com | Paid, focused exercises bridging code-level vulnerability understanding with exploitation — good for web + some code review practice. |
| OverTheWire Wargames | https://overthewire.org/wargames | Classic SSH-based wargames (Bandit, Natas, Narnia) for Linux fundamentals, web basics, and binary exploitation fundamentals. Free. |
| PicoCTF | https://picoctf.org | Beginner-friendly, free, CTF-style challenges originally built by Carnegie Mellon; great for younger/newer learners and intro binary/web/crypto challenges. |

## Core Tools

| Tool | URL | Purpose / When to Use |
|---|---|---|
| Burp Suite | https://portswigger.net/burp | The standard intercepting proxy for web app testing — manual request manipulation, Repeater, Intruder for fuzzing, Scanner (Pro). Use for nearly all authorized web pentests. |
| OWASP ZAP | https://www.zaproxy.org | Free, open-source alternative to Burp with automated scanning and a proxy; good budget-friendly or CI-integrated option. |
| Nmap | https://nmap.org | Network discovery and port/service scanning. Use first in almost any authorized network engagement to map attack surface. |
| Wireshark | https://www.wireshark.org | Deep packet capture/analysis. Use to understand protocols, debug network issues, or analyze captured traffic from an attack/incident. |
| Metasploit Framework | https://www.metasploit.com | Exploitation framework with a large module library for known vulnerabilities; used in authorized engagements to validate exploitability safely. |
| John the Ripper | https://www.openwall.com/john/ | Offline password hash cracking — good for format auto-detection and simple wordlist/rule-based attacks. |
| Hashcat | https://hashcat.net/hashcat/ | GPU-accelerated password cracking — faster than John for large hash sets, supports more modes/masks. |
| Nikto | https://cirt.net/Nikto2 | Fast web server vulnerability/misconfiguration scanner — good for a quick first pass before deeper manual testing. |
| SQLmap | https://sqlmap.org | Automated SQL injection detection and exploitation tool — use only against authorized targets to confirm and demonstrate SQLi impact. |
| Gobuster | https://github.com/OJ/gobuster | Fast directory/file/subdomain brute-forcing via wordlists. |
| ffuf | https://github.com/ffuf/ffuf | Flexible, very fast web fuzzer — directories, parameters, vhosts; highly configurable filtering. |
| BloodHound | https://github.com/BloodHoundAD/BloodHound | Maps Active Directory trust/permission relationships as a graph to identify attack paths to Domain Admin (used both offensively and defensively). |
| Suricata | https://suricata.io | Open-source IDS/IPS/NSM engine; writes and evaluates detection rules against live or captured traffic. |
| Snort | https://www.snort.org | One of the original open-source IDS/IPS engines; large community rule-sharing ecosystem (Snort rules and Suricata rules are largely compatible). |

## Vulnerability Databases

| Resource | URL | Description |
|---|---|---|
| CVE (MITRE) | https://cve.mitre.org | The canonical dictionary of publicly disclosed vulnerability identifiers (CVE-YYYY-NNNNN). |
| NVD (NIST) | https://nvd.nist.gov | Enriches CVE entries with CVSS severity scores, CWE classification, and references. |
| Exploit-DB | https://www.exploit-db.com | Archive of public proof-of-concept exploits, maintained by Offensive Security; also hosts GHDB (Google Hacking Database). |

## Bug Bounty Platforms

| Platform | URL | Description |
|---|---|---|
| HackerOne | https://hackerone.com | Largest bug bounty/vulnerability disclosure platform; hosts programs for companies ranging from startups to the US DoD. |
| Bugcrowd | https://www.bugcrowd.com | Major competitor to HackerOne; similar managed bug bounty/VDP marketplace. |
| Synack | https://www.synack.com | Vetted, invite-only crowdsourced pentesting platform — higher barrier to entry, more selective researcher pool. |

## Communities & Blogs

| Resource | URL | Description |
|---|---|---|
| PortSwigger Research Blog | https://portswigger.net/research | Cutting-edge web security research, often introducing new vuln classes (e.g., request smuggling research originated here). |
| HackerOne Hacktivity | https://hackerone.com/hacktivity | Public feed of disclosed bug bounty reports — excellent real-world learning material on how vulns were actually found and reported. |
| r/netsec | https://www.reddit.com/r/netsec | Community-curated feed of security research, write-ups, and tool releases. |
| SANS Internet Storm Center | https://isc.sans.edu | Daily threat/vulnerability analysis diary from SANS. |

## Certification Bodies

| Body | URL | Notable Certs |
|---|---|---|
| Offensive Security | https://www.offsec.com | OSCP, OSWE, OSEP, OSED, OSWA |
| ISC2 | https://www.isc2.org | CISSP, SSCP, CCSP |
| CompTIA | https://www.comptia.org | Security+, Network+, PenTest+, CySA+ |
| SANS / GIAC | https://www.sans.org / https://www.giac.org | GCIH, GPEN, GCFA, GWAPT, GSEC, and many specialized tracks |
| EC-Council | https://www.eccouncil.org | CEH, CHFI |

## Quick Guidance on When to Reach for Which Tool

- **Starting recon on a web target:** Nmap (port/service scan) → Gobuster/ffuf (content discovery) → Burp Suite (manual analysis & interception).
- **Suspect SQLi manually found:** confirm manually first (single quote, boolean logic), then use SQLmap to automate extraction depth/impact demonstration.
- **Cracking a captured password hash:** identify hash type, try John the Ripper for quick wordlist attempts, switch to Hashcat with GPU for larger/slower hash types (bcrypt, NTLM at scale).
- **Analyzing suspicious network traffic from an incident:** Wireshark for packet-level detail; Suricata/Snort if you need to write a repeatable detection signature going forward.
- **Mapping an Active Directory environment (authorized assessment):** BloodHound after initial domain enumeration, to visualize privilege-escalation paths.
