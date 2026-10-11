# Cybersecurity Crash Course

> **Scope and ethics note:** This document is written for legitimate security education — career preparation, authorized penetration testing, and CTF practice. All techniques described must only be applied against systems you own or have explicit written authorization to test. Unauthorized access to computer systems is illegal in most jurisdictions (e.g., the Computer Fraud and Abuse Act in the US, the Computer Misuse Act in the UK).

## 1. The CIA Triad

The foundational model for information security:

| Property | Definition | Violation Example |
|---|---|---|
| **Confidentiality** | Only authorized parties can access data | Data breach, eavesdropping, IDOR exposing other users' data |
| **Integrity** | Data is accurate and unaltered except by authorized action | SQL injection modifying records, MITM tampering with traffic |
| **Availability** | Systems/data are accessible when needed | DDoS attack, ransomware encrypting files |

Extended models add **Authenticity** (proving identity) and **Non-repudiation** (proving an action cannot be denied by its actor) — important in digital signatures and audit logging.

---

## 2. Common Attack Types (Fast Reference)

### Cross-Site Scripting (XSS)
Injecting attacker-controlled JavaScript into a page viewed by other users.
- **Reflected XSS:** payload in a request parameter, echoed back immediately (non-persistent).
- **Stored XSS:** payload saved server-side (e.g., in a comment) and served to all viewers — more dangerous.
- **DOM-based XSS:** vulnerability exists entirely in client-side JS manipulating the DOM unsafely (e.g., `innerHTML` from `location.hash`).
- **Impact:** session hijacking (cookie theft), credential phishing, keylogging, full account takeover.

### Cross-Site Request Forgery (CSRF)
Tricks an authenticated user's browser into submitting an unwanted request to a site they're logged into, using the browser's automatically-attached cookies. Mitigated by CSRF tokens, `SameSite` cookies, and checking the `Origin`/`Referer` header.

### SQL Injection (SQLi)
Untrusted input is concatenated directly into a SQL query, letting an attacker alter query logic. Variants: **in-band** (error-based, union-based — results returned directly), **blind** (boolean-based or time-based — inferred one bit at a time), **out-of-band** (exfiltration via DNS/HTTP side channel).

### Server-Side Request Forgery (SSRF)
The server is tricked into making an HTTP request to a location the attacker chooses — often internal infrastructure not exposed to the internet (e.g., cloud metadata endpoint `http://169.254.169.254/latest/meta-data/`). Arises from features like "fetch URL to preview," webhooks, PDF generators, image fetchers.

### Insecure Direct Object Reference (IDOR)
A broken access control flaw: an app exposes an internal identifier (e.g., `/invoice?id=1042`) and fails to verify the requesting user is authorized to access that specific object, letting an attacker iterate IDs to read/modify others' data.

### Command Injection
User input reaches a system shell call (e.g., `os.system`, `child_process.exec`) without sanitization, allowing arbitrary OS command execution via metacharacters like `; | & $()`.

### Insecure Deserialization
An application deserializes untrusted data (e.g., Java objects, Python pickle, PHP `unserialize`) without validation. Crafted serialized objects can trigger remote code execution via "gadget chains" during object reconstruction.

### Authentication Bypass
Flaws letting an attacker log in as another user or skip auth entirely: SQLi in login forms, JWT `alg: none` acceptance, weak password reset tokens, logic flaws (e.g., `admin=false` client-side flag trusted by server).

### Privilege Escalation
- **Vertical:** a low-privilege user gains admin/root rights (e.g., exploiting a SUID binary, unpatched kernel exploit).
- **Horizontal:** a user accesses another same-level user's resources (often an IDOR variant).

---

## 3. Encryption Basics

### Symmetric vs Asymmetric

| | Symmetric | Asymmetric |
|---|---|---|
| Keys | One shared secret key | Public/private key pair |
| Speed | Fast | Slow (computationally expensive) |
| Use case | Bulk data encryption | Key exchange, digital signatures, identity |
| Examples | AES, ChaCha20 | RSA, ECC (ECDSA/ECDHE) |

In practice, TLS uses asymmetric crypto to securely exchange a symmetric session key, then switches to symmetric encryption for the actual data — combining the strengths of both ("hybrid encryption").

### Hashing
A one-way function mapping arbitrary input to a fixed-size output. Properties needed: **deterministic**, **pre-image resistant** (can't reverse), **collision resistant** (hard to find two inputs with same output).
- **Not for passwords alone:** MD5 and SHA-1 are fast and broken (collisions found) — never use for password storage.
- **For passwords:** use slow, memory-hard algorithms: **bcrypt**, **scrypt**, **Argon2** — these include salting and a tunable work factor to resist brute-force/GPU cracking.
- **For integrity/signatures:** SHA-256 or SHA-3 family.

### TLS Handshake (TLS 1.2, simplified step-by-step)

1. **ClientHello** — client sends supported TLS versions, cipher suites, a random value, and optionally SNI (server name).
2. **ServerHello** — server picks a cipher suite and TLS version, sends its own random value.
3. **Certificate** — server sends its X.509 certificate (containing its public key), signed by a Certificate Authority (CA).
4. **ServerKeyExchange / Key Agreement** — for ephemeral key exchange (e.g., ECDHE), server sends parameters for Diffie-Hellman.
5. **Certificate verification (client side)** — client validates the cert chain up to a trusted root CA, checks hostname match and expiry.
6. **ClientKeyExchange** — client computes shared secret material (e.g., its half of the DH exchange) and sends its part.
7. **Both sides derive the same "pre-master secret"**, then both independently derive the same **session keys** using a key derivation function (never sent over the wire).
8. **ChangeCipherSpec + Finished** — both sides switch to symmetric encryption using the derived session key and send a MAC-verified "Finished" message to confirm the handshake wasn't tampered with.
9. **Application data** — subsequent HTTP traffic is encrypted with the symmetric session key (e.g., AES-GCM).

**TLS 1.3** simplifies this to effectively 1 round trip (1-RTT), removes weak/legacy ciphers (no more static RSA key exchange, no CBC-mode-only risk, no renegotiation), and supports 0-RTT resumption for repeat connections (with replay-attack caveats).

---

## 4. Common Security Headers

| Header | Purpose |
|---|---|
| `Content-Security-Policy` | Restricts which scripts/styles/resources can load — primary modern XSS mitigation |
| `Strict-Transport-Security` (HSTS) | Forces browser to only use HTTPS for this domain going forward |
| `X-Content-Type-Options: nosniff` | Prevents MIME-type sniffing that can turn a non-script file into executable script |
| `X-Frame-Options: DENY/SAMEORIGIN` | Prevents clickjacking by blocking the page from being framed |
| `Referrer-Policy` | Controls how much of the URL is leaked to third parties via the Referer header |
| `Set-Cookie: HttpOnly; Secure; SameSite=Strict` | Cookie flags: blocks JS access (HttpOnly), forces HTTPS-only (Secure), restricts cross-site sending (SameSite) |
| `Permissions-Policy` | Restricts browser feature access (camera, geolocation, etc.) |

---

## 5. Authentication & Authorization Concepts

**Authentication** = proving who you are. **Authorization** = what you're allowed to do once identified. Conflating the two is a classic root cause of access-control bugs.

### OAuth2 (in brief)
A delegated-authorization framework, not an authentication protocol itself (OpenID Connect adds identity on top). Core flow (Authorization Code with PKCE — the current recommended flow, even for SPAs):
1. Client redirects user to the Authorization Server's `/authorize` endpoint with a `code_challenge`.
2. User authenticates and consents.
3. Authorization Server redirects back with a short-lived `authorization code`.
4. Client exchanges the code + `code_verifier` for an **access token** (and optionally refresh token) at the `/token` endpoint.
5. Client uses the access token (usually a bearer token) to call the Resource Server's API.

Common OAuth misconfigurations: open redirect in `redirect_uri` validation, missing `state` parameter (CSRF on the auth flow), implicit flow token leakage via browser history/referrer.

### JWT Pitfalls
JSON Web Tokens are self-contained, signed (not necessarily encrypted) tokens. Common vulnerabilities:
- **`alg: none` acceptance** — server trusts a token with no signature at all.
- **Algorithm confusion (RS256 → HS256)** — if a server verifies with the public key as if it were an HMAC secret, an attacker who knows the public key can forge valid-looking tokens.
- **Weak/guessable HMAC secret** — brute-forceable with tools like `hashcat` against the JWT secret.
- **No expiration or revocation** — stolen tokens remain valid indefinitely; mitigate with short expiry + refresh token rotation + a server-side blocklist/allowlist for revocation.
- **Sensitive data in payload** — JWT payloads are only base64-encoded, not encrypted; never put secrets in the claims.

### Session Management
- Use the framework's secure, random session ID generator — never roll your own.
- Regenerate the session ID on privilege change (e.g., after login) to prevent **session fixation**.
- Set `HttpOnly`, `Secure`, and `SameSite` on session cookies.
- Implement idle and absolute timeouts, and server-side logout (invalidate the session, not just clear the cookie client-side).

---

## 6. How a Real Pentest Engagement Flows

1. **Scoping & rules of engagement** — define targets, timing, exclusions, and get signed written authorization (the "get out of jail free" document).
2. **Reconnaissance** — passive (OSINT, WHOIS, Shodan, LinkedIn, Google dorking) and active (DNS enumeration, subdomain discovery).
3. **Scanning & enumeration** — Nmap port/service scans, web content discovery (Gobuster/ffuf), version fingerprinting.
4. **Vulnerability analysis** — map discovered services/versions to known CVEs, manually test for logic flaws.
5. **Exploitation** — gain initial access (exploit a vuln, weak credentials, phishing if in scope).
6. **Post-exploitation** — privilege escalation, lateral movement, data access demonstration (never actual exfiltration of real sensitive data beyond proof), persistence (only if explicitly authorized).
7. **Reporting** — executive summary (business risk, non-technical), technical findings with CVSS scores, reproduction steps, evidence (screenshots/logs), and remediation recommendations.
8. **Remediation retesting** — verify fixes after the client patches identified issues.

A professional report is often the actual deliverable that matters most to the client — technical skill without clear communication has limited business value.
