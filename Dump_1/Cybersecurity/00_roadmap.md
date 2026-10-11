# Cybersecurity Learning Roadmap (Beginner → Advanced)

> This roadmap is for legitimate security career preparation, authorized penetration testing education, and CTF practice. Never test systems you do not own or lack explicit written authorization to test.

This roadmap sequences skills so each stage builds on the previous one. Time estimates assume ~8-12 hours/week of focused study. Full-time study (30+ hrs/week) can compress timelines by roughly 2-3x.

## Overview Tree

```
Stage 0: Foundations (Networking + OS/Linux)         ~8-12 weeks
Stage 1: Security Fundamentals (CIA, threat modeling) ~3-4 weeks
Stage 2: Web Application Security (OWASP Top 10)       ~8-10 weeks
Stage 3: Network Security                              ~6-8 weeks
Stage 4: Cryptography                                  ~4-6 weeks
Stage 5a: Offensive Security Path (Red Team / Pentest) ~6-12 months
Stage 5b: Defensive Security Path (Blue Team / SOC)    ~6-12 months
Stage 6: Cloud Security                                ~2-3 months
Stage 7: Certification Ladder                          ongoing, 1-3 years
```

Stages 5a and 5b can run in parallel or sequentially depending on your target role (red team/pentester vs SOC analyst/defender). Most practitioners benefit from learning offensive techniques even if they end up in a defensive role, and vice versa.

---

## Stage 0: Networking + OS/Linux Fundamentals (8-12 weeks)

You cannot attack or defend what you don't understand structurally.

| Topic | What to Learn | Estimated Time |
|---|---|---|
| Networking basics | OSI model, TCP/IP stack, subnetting/CIDR, routing, DHCP, DNS | 2 weeks |
| Protocols | HTTP/HTTPS, FTP, SSH, SMTP, SMB, Telnet, ARP, ICMP | 2 weeks |
| Packet analysis | Wireshark fundamentals, reading pcap files, TCP handshake | 1-2 weeks |
| Linux fundamentals | Filesystem hierarchy, permissions (chmod/chown), users/groups, processes | 2 weeks |
| Linux shell | Bash scripting, piping, grep/awk/sed, cron, systemd/services | 2 weeks |
| Windows fundamentals | Registry, services, Active Directory basics, PowerShell | 2 weeks |

**Milestone:** Comfortably navigate a Linux server via SSH, read/interpret a Wireshark capture of an HTTP session, explain the 3-way TCP handshake and DNS resolution flow from memory.

**Resources:** TryHackMe "Pre Security" and "Complete Beginner" learning paths, OverTheWire Bandit wargame, Linux Journey.

---

## Stage 1: Security Fundamentals (3-4 weeks)

| Topic | What to Learn |
|---|---|
| CIA Triad | Confidentiality, Integrity, Availability — definitions, trade-offs, real-world examples |
| AAA model | Authentication, Authorization, Accounting |
| Threat modeling | STRIDE (Spoofing, Tampering, Repudiation, Info disclosure, DoS, Elevation of privilege), DREAD scoring, attack trees, data flow diagrams |
| Risk management | Asset identification, threat/vulnerability/risk distinction, likelihood vs impact matrices |
| Security principles | Defense in depth, least privilege, fail-safe defaults, zero trust, separation of duties |
| Common frameworks | NIST CSF, ISO 27001 (awareness level), MITRE ATT&CK (structure, not memorization) |

**Milestone:** Build a simple STRIDE threat model for a basic web app (e.g., a login + file upload feature) on paper.

---

## Stage 2: Web Application Security — OWASP Top 10 (8-10 weeks)

| Week | Focus |
|---|---|
| 1-2 | Broken Access Control (IDOR, path traversal), Cryptographic Failures |
| 3-4 | Injection (SQLi, command injection, NoSQLi), Insecure Design |
| 5 | Security Misconfiguration, Vulnerable & Outdated Components |
| 6 | Identification & Authentication Failures (session mgmt, credential stuffing) |
| 7 | Software & Data Integrity Failures (insecure deserialization, CI/CD risks) |
| 8 | Security Logging & Monitoring Failures, SSRF |
| 9-10 | Practice: PortSwigger Web Security Academy labs, Juice Shop, DVWA |

**Milestone:** Solve 20+ PortSwigger Web Security Academy labs across multiple vulnerability categories unassisted.

---

## Stage 3: Network Security (6-8 weeks)

| Topic | What to Learn |
|---|---|
| Firewalls | Stateless vs stateful, iptables/nftables basics, ACLs |
| IDS/IPS | Signature vs anomaly detection, Snort/Suricata rule writing |
| VPNs | IPSec vs SSL VPN, WireGuard basics |
| Network attacks | ARP spoofing, DNS spoofing/cache poisoning, MITM, VLAN hopping |
| Wireless security | WPA2/WPA3 weaknesses, rogue AP detection |
| Network segmentation | DMZ design, zero trust network architecture |
| Scanning & enumeration | Nmap (TCP/UDP scans, service/version detection, NSE scripts) |

**Milestone:** Set up a home lab with two VMs, capture and analyze an ARP spoofing attack with Wireshark, write one custom Suricata rule.

---

## Stage 4: Cryptography (4-6 weeks)

| Topic | What to Learn |
|---|---|
| Symmetric crypto | AES modes (CBC, GCM), key management, stream vs block ciphers |
| Asymmetric crypto | RSA, Diffie-Hellman, ECC basics |
| Hashing | SHA-256/SHA-3, MD5/SHA1 weaknesses, salting, HMAC |
| Password storage | bcrypt, scrypt, Argon2 and why fast hashes (MD5/SHA1 alone) are unsafe for passwords |
| TLS/PKI | Certificate chains, CA trust model, TLS 1.2/1.3 handshake |
| Applied crypto flaws | Padding oracle, weak randomness, ECB mode leakage, JWT algorithm confusion |

**Milestone:** Explain why `alg: none` and HS256/RS256 confusion are dangerous in JWTs; decode and verify a JWT manually.

---

## Stage 5a: Offensive Security / Pentesting Path (6-12 months)

| Phase | Topics | Time |
|---|---|---|
| Recon & OSINT | Passive recon, Shodan, Google dorking, subdomain enumeration | 2-3 weeks |
| Scanning & Enumeration | Nmap deep dive, service enumeration, Gobuster/ffuf | 3-4 weeks |
| Web exploitation | Burp Suite mastery, manual exploitation of OWASP Top 10, SQLmap | 6-8 weeks |
| Exploitation frameworks | Metasploit, manual exploit development basics, buffer overflows (intro) | 6-8 weeks |
| Active Directory attacks | Kerberoasting, pass-the-hash, BloodHound, lateral movement (defensive-aware study) | 6-8 weeks |
| Privilege escalation | Linux & Windows PrivEsc techniques, LinPEAS/WinPEAS | 4 weeks |
| Post-exploitation & reporting | Persistence concepts, pivoting, professional report writing | 3-4 weeks |
| Practice | HackTheBox machines, TryHackMe paths, CTFs | ongoing |

**Milestone:** Complete 15-20 HackTheBox/TryHackMe boxes spanning Linux and Windows, write a full professional-style penetration test report for one.

---

## Stage 5b: Defensive Security / Blue Team Path (6-12 months)

| Phase | Topics | Time |
|---|---|---|
| SOC fundamentals | SIEM concepts (Splunk/ELK), log sources, alert triage | 3-4 weeks |
| Detection engineering | Writing Sigma rules, Suricata/Snort signatures, YARA rules | 4-6 weeks |
| Incident response | IR lifecycle (prep, identification, containment, eradication, recovery, lessons learned) | 4 weeks |
| Threat intelligence | MITRE ATT&CK mapping, IOCs vs TTPs, threat hunting basics | 4 weeks |
| Digital forensics | Disk/memory forensics basics, Autopsy, Volatility | 4-6 weeks |
| Malware analysis (intro) | Static analysis, sandboxing, basic reverse engineering | 4 weeks |
| Practice | TryHackMe SOC Level 1/2 paths, LetsDefend, Blue Team Labs Online | ongoing |

**Milestone:** Triage a simulated SIEM alert end-to-end and write an incident report with IOC list and recommended containment actions.

---

## Stage 6: Cloud Security (2-3 months)

| Topic | What to Learn |
|---|---|
| Shared responsibility model | What the cloud provider secures vs. what you secure |
| IAM | Least-privilege policies, role assumption, common AWS/Azure/GCP IAM misconfigurations |
| Storage security | S3 bucket misconfigurations, public exposure scanning |
| Container security | Docker basics, image scanning, Kubernetes RBAC and network policies |
| Cloud-native attacks | SSRF to metadata service (169.254.169.254), overly permissive IAM roles, secrets in env vars |
| Cloud security tools | Prowler, ScoutSuite, AWS Security Hub basics |

**Milestone:** Stand up a deliberately misconfigured S3 bucket/IAM policy in a sandbox account and demonstrate the exposure, then fix it.

---

## Stage 7: Certification Ladder

| Certification | Level | Focus | Typical Prep Time | Body |
|---|---|---|---|---|
| CompTIA Security+ | Entry | Broad security fundamentals, compliance | 6-8 weeks | CompTIA |
| CompTIA Network+ (optional, before Security+) | Entry | Networking fundamentals | 4-6 weeks | CompTIA |
| eJPT | Entry/Junior | Practical junior pentest skills | 4-6 weeks | INE |
| CEH (Certified Ethical Hacker) | Intermediate | Broad offensive tooling/concepts (less hands-on than OSCP) | 6-8 weeks | EC-Council |
| OSCP (PEN-200) | Intermediate/Advanced | Hands-on practical penetration testing, 24-hr exam | 4-6 months |
| GCIH / GCFA (SANS/GIAC) | Intermediate/Advanced | Incident handling / forensics | 2-3 months each | SANS/GIAC |
| CISSP | Advanced/Managerial | Broad security management, 8 domains | 3-4 months | ISC2 (requires 5 yrs experience) |
| OSCE3 / OSWE / OSEP | Advanced | Web exploit dev, evasion, advanced pentest | 6-12 months | Offensive Security |

**Suggested order for a pentest-focused career:** Security+ → eJPT → OSCP → OSWE/OSEP → (optional) CISSP for management track.

**Suggested order for a blue-team/SOC-focused career:** Security+ → GCIH → GCFA/GNFA → CISSP (management track) or stay deep technical with GIAC specializations.

---

## Total Realistic Timeline

- **Job-ready junior pentester / SOC analyst:** 12-18 months of consistent part-time study.
- **Mid-level practitioner with OSCP or equivalent:** 18-30 months.
- **Senior/advanced specialist (OSWE, GSE, CISSP + years of experience):** 3-5+ years.

Progress is rarely linear — expect to loop back to fundamentals as you discover gaps while doing practical labs. That is normal and expected.
