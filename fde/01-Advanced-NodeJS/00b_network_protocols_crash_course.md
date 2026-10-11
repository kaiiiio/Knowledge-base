# Network Protocols Crash Course

The protocols that actually run the internet, explained in the order data touches them: how your device finds an IP address (DNS), how it establishes a reliable connection (TCP) or a fast unreliable one (UDP), how that connection gets encrypted (TLS), and what rides on top of all of it (HTTP and friends). Pairs with [00a_osi_model_explained.md](00a_osi_model_explained.md) — this file is "which protocol lives at which layer, and how does it actually work."

## Table of Contents
1. [DNS — Turning Names into Addresses](#dns)
2. [TCP — The Reliable, Ordered Connection](#tcp)
3. [UDP — Fast and Unordered, On Purpose](#udp)
4. [TCP vs UDP — the Decision Table](#tcp-vs-udp)
5. [TLS/SSL — Encrypting the Connection](#tls)
6. [HTTP — the Application Protocol You Actually Write Code Against](#http)
7. [Other Protocols Worth Knowing By Name](#other)
8. [The Full Journey: typing a URL and hitting Enter](#full-journey)
9. [Interview Q&A](#qna)

---

<a name="dns"></a>
## 1. DNS — Turning Names into Addresses

**The problem it solves**: humans remember `google.com`, computers need `142.250.183.14`. DNS (Domain Name System) is the internet's phonebook — a distributed, hierarchical system that translates domain names into IP addresses.

**Why distributed and hierarchical, not one giant database**: no single server could handle every DNS lookup on Earth, and no single organization should control the whole internet's naming. So it's split into a tree of authority.

**The resolution flow, step by step**:
```
Your browser → OS resolver cache (checked first — did we look this up recently?)
             → Recursive Resolver (usually your ISP's, or public ones like 8.8.8.8/1.1.1.1)
                    → Root Server ("I don't know api.example.com, but I know who handles .com")
                    → TLD Server for .com ("I don't know api.example.com specifically, but here's
                                             who's authoritative for example.com")
                    → Authoritative Nameserver for example.com ("Here's the A record: 93.184.216.34")
             ← Recursive Resolver caches this answer and returns it to your browser
```

**Key record types**:
- **A record** — maps a name to an IPv4 address.
- **AAAA record** — maps a name to an IPv6 address.
- **CNAME** — an alias: "this name is really just another name" (e.g. `www.example.com` → `example.com`).
- **MX** — mail server for the domain (where email should be delivered).
- **TXT** — arbitrary text, commonly used for domain verification and SPF/DKIM email security records.
- **NS** — which nameservers are authoritative for this domain.

**TTL (Time To Live)** — every DNS record has a TTL in seconds, telling resolvers how long they may cache the answer before asking again. Low TTL = you can change your DNS and have it propagate fast, but every resolver re-queries more often (more load, slightly slower average lookups). High TTL = faster average lookups, but a DNS change takes longer to fully propagate everywhere.

**DNS hijacking / cache poisoning** (a real attack, and a good thing to know about): an attacker tricks a resolver into caching a *false* IP address for a domain — so when you type your bank's URL, DNS silently sends you to the attacker's server instead. Defenses: **DNSSEC** (cryptographically signs DNS responses so resolvers can verify authenticity), and **DoH/DoT** (DNS-over-HTTPS / DNS-over-TLS — encrypts the DNS query itself so it can't be tampered with or snooped on in transit).

---

<a name="tcp"></a>
## 2. TCP — The Reliable, Ordered Connection

TCP (Transmission Control Protocol) guarantees: your data arrives, arrives in order, and arrives without duplication — even over a network that can lose, duplicate, delay, and reorder packets underneath it. It does this at a real cost: setup latency and overhead.

**The Three-Way Handshake** — how a TCP connection is established, *before any application data is sent*:
```
Client                                          Server
  │──────────────── SYN (seq=x) ─────────────────►│   "I want to talk, my starting sequence number is x"
  │◄────────── SYN-ACK (seq=y, ack=x+1) ───────────│   "OK, acknowledged your x, here's my starting number y"
  │──────────────── ACK (ack=y+1) ────────────────►│   "Acknowledged your y — connection established"
  │                                                 │
  │◄══════════ Application data flows ════════════►│
```
This is why every new TCP connection pays a **round trip of latency** before a single byte of your actual request goes anywhere — a core reason "connection reuse" (HTTP keep-alive, connection pooling) matters so much for performance: skip the handshake cost on every request by reusing an already-open connection.

**How reliability actually works**: every byte sent gets a sequence number. The receiver sends back ACKs (acknowledgments) confirming what it received. If the sender doesn't get an ACK within a timeout, it **retransmits** — assuming the packet was lost. Packets arriving out of order get buffered and reassembled in the correct order before being handed to the application — the application layer never sees out-of-order or duplicate data, TCP hides all of that complexity.

**Flow control and congestion control** (the two throttling mechanisms, often confused):
- **Flow control** — protects the *receiver* from being overwhelmed. The receiver advertises a "window size" (how many more bytes it can currently buffer) — the sender must not exceed it.
- **Congestion control** — protects the *network* from being overwhelmed. TCP starts sending slowly (slow start), increases its send rate as ACKs confirm successful delivery, and backs off sharply if it detects packet loss (interpreted as a sign of congestion). This is why a brand new TCP connection is initially slower than one that's been transferring data for a while — it hasn't "ramped up" yet.

**Closing a connection** — a four-way handshake (FIN/ACK from each side, since either side can independently decide it's done sending, even if the other side is still sending):
```
Client ──FIN──► Server        "I'm done sending"
Client ◄─ACK─── Server        "Acknowledged"
Client ◄─FIN─── Server        "I'm done sending too"
Client ──ACK──► Server        "Acknowledged — fully closed"
```

**Nagle's algorithm** — TCP by default tries to batch small writes together into fewer, larger packets, to avoid flooding the network with tiny packets. This is great for bulk data transfer, but actively *hurts* latency-sensitive request/response patterns (like a chat app sending small messages) — which is why performance-sensitive Node.js servers often set `socket.setNoDelay(true)` (`TCP_NODELAY`) to disable this batching for connections where every millisecond of latency matters more than packet efficiency.

---

<a name="udp"></a>
## 3. UDP — Fast and Unordered, On Purpose

UDP (User Datagram Protocol) is TCP's opposite philosophy: **no handshake, no ordering guarantee, no retransmission, no congestion control** — just "fire this datagram at the destination and hope it arrives." That sounds worse, but it's a deliberate trade for a specific benefit: **lower latency and lower overhead**, because there's no connection setup cost and no waiting for out-of-order packets to be reassembled before your application can use the data.

**Why you'd ever want this**: for real-time media (video calls, live streaming, online gaming), a dropped or late packet from half a second ago is *useless* even if it eventually arrives — you'd rather skip it and keep playing live audio/video than pause everything waiting for TCP to retransmit and reorder it. **Real-world users of UDP**: DNS (small, single-round-trip queries — doesn't need TCP's overhead for a lookup that fits in one packet), video conferencing (Zoom, WebRTC), online multiplayer games, VoIP, DHCP, and increasingly, QUIC (which HTTP/3 is built on — UDP underneath, but with its own reliability layer built in userspace, avoiding TCP's head-of-line blocking — see the HTTP evolution notes elsewhere in this knowledge base).

---

<a name="tcp-vs-udp"></a>
## 4. TCP vs UDP — the Decision Table

| | TCP | UDP |
|---|---|---|
| Connection | Connection-oriented (handshake required) | Connectionless |
| Reliability | Guaranteed delivery, retransmits lost packets | No guarantee — packets can be lost silently |
| Ordering | Guaranteed in-order delivery | No ordering guarantee |
| Speed | Slower (handshake, ACKs, retransmission overhead) | Faster (no setup, no waiting) |
| Overhead | Higher (sequence numbers, ACKs, flow/congestion control) | Minimal header |
| Use when | Correctness matters more than speed | Speed matters more than occasional loss |
| Examples | HTTP/1.1 & 2 (over TCP), databases, file transfer, email | DNS, video/voice calls, live streaming, gaming, HTTP/3's QUIC layer |

**The one-line interview answer**: "TCP trades speed for guaranteed, ordered, reliable delivery via a handshake and retransmission; UDP trades reliability for speed by skipping all of that — you pick based on whether a late or missing packet is worse than the latency cost of guaranteeing it arrives."

---

<a name="tls"></a>
## 5. TLS/SSL — Encrypting the Connection

TLS (Transport Layer Security — SSL is its deprecated predecessor, but people still say "SSL" colloquially to mean TLS) sits on top of TCP and encrypts everything that flows through the connection, so that even though the raw packets travel across untrusted networks (your ISP, routers you don't control), nobody in between can read or tamper with the content. This is the difference between HTTP (plaintext) and HTTPS (HTTP running inside a TLS-encrypted tunnel).

**The TLS Handshake (simplified, TLS 1.2-style — TLS 1.3 shaves a round trip off this)**:
```
Client                                              Server
  │──── ClientHello (supported TLS versions,        │
  │      cipher suites, a random number) ──────────►│
  │◄──── ServerHello (chosen cipher suite, a random  │
  │       number, server's certificate) ─────────────│
  │   (Client verifies the certificate against a     │
  │    trusted Certificate Authority — CA)            │
  │──── Key exchange material (encrypted with the    │
  │      server's public key from the certificate) ──►│
  │            (both sides now derive the SAME        │
  │             symmetric session key independently)   │
  │◄═══ All further traffic encrypted with the ═══════►│
  │      shared symmetric session key                  │
```

**Why a handshake exchanges keys at all — the asymmetric-then-symmetric trick**: asymmetric encryption (public/private key pairs — the kind in the server's certificate) is mathematically expensive and slow for large amounts of data. Symmetric encryption (one shared secret key both sides know) is fast, but you need a *safe* way to agree on that shared secret over an insecure network first. TLS's answer: use the slow-but-secure asymmetric method **once**, just to safely establish a fast symmetric session key, then switch to the fast symmetric cipher for the actual bulk data transfer. This is the core trick behind essentially all secure communication on the internet.

**Certificate Authorities (CAs)** — a server's TLS certificate is a claim: "I am `api.example.com`, and here's my public key." Anyone could generate a fake certificate claiming to be your bank. **CAs** are trusted third parties (built into every OS/browser's trust store) who cryptographically sign real certificates after verifying domain ownership — so your browser can check "is this certificate signed by a CA I trust?" instead of blindly believing any claim.

**TLS session resumption** — because the full handshake costs a round trip (or more) of latency, TLS supports resuming a *previous* session with an already-agreed-upon key, skipping most of the handshake on reconnect. This matters a lot for HTTP performance at scale — it's why keeping connections warm (keep-alive) compounds with TLS session reuse to make repeat requests to the same server dramatically cheaper than the first one.

**SNI (Server Name Indication)** — a field in the TLS ClientHello that tells the server *which* hostname the client is trying to reach, sent in plaintext *before* encryption is established. Why it's needed: many servers host multiple HTTPS domains on the same IP address (shared hosting, CDNs) — without SNI, the server wouldn't know which certificate to present until it already knows which domain is being requested, which is a chicken-and-egg problem TLS had to solve explicitly.

---

<a name="http"></a>
## 6. HTTP — the Application Protocol You Actually Write Code Against

HTTP (HyperText Transfer Protocol) is the Layer 7 protocol nearly all backend/frontend work happens in — a request/response protocol where a client sends a request (method + URL + headers + optional body) and a server sends back a response (status code + headers + optional body).

```
GET /users/42 HTTP/1.1              <- request line: METHOD /path HTTP-version
Host: api.example.com               <- headers
Authorization: Bearer eyJhbGc...
Accept: application/json

                                     <- blank line separates headers from body
(no body on a GET)
```
```
HTTP/1.1 200 OK                     <- status line
Content-Type: application/json
Content-Length: 42

{"id": 42, "name": "Aniket"}        <- body
```

**HTTP methods and their meaning** (already covered in depth elsewhere in this knowledge base — the SQL/DBMS interview file's Q13 and the JS/Node MCQ bank both touch on this): `GET` (safe, idempotent, no body semantics), `POST` (create/process, not safe, not idempotent), `PUT` (replace, idempotent), `PATCH` (partial update), `DELETE` (remove, idempotent).

**HTTP is stateless** — each request is independent; the server doesn't inherently remember anything about previous requests from the same client. Statefulness (sessions, "am I logged in") is bolted on *on top* of HTTP using cookies, tokens, or server-side session stores — HTTP itself has no memory.

**HTTP's evolution (1.0 → 1.1 → 2 → 3)** is covered in full detail elsewhere in this knowledge base (`fde/00-External-Resources/HLD-Notes-TechByAni/L9_HTTP.notes.md`) — the short version: 1.0 opened a new TCP connection per request (slow), 1.1 added persistent connections but suffered head-of-line blocking, HTTP/2 added multiplexing over one connection via a binary framing layer, and HTTP/3 moved off TCP entirely onto QUIC (over UDP) to eliminate TCP-level head-of-line blocking altogether.

---

<a name="other"></a>
## 7. Other Protocols Worth Knowing By Name

- **WebSocket** — starts as an HTTP request (`Upgrade: websocket` header) then "upgrades" the same TCP connection into a persistent, full-duplex channel where either side can push data anytime — no more request/response back-and-forth. Covered in depth in `fde/00-External-Resources/HLD-Notes-TechByAni/WebSockets.notes.md`.
- **FTP (File Transfer Protocol)** — older protocol specifically for transferring files; mostly superseded by HTTP-based transfer or SFTP (which runs over SSH) for anything security-conscious.
- **SSH (Secure Shell)** — encrypted remote terminal access and secure file transfer (via SFTP/SCP built on top of it); how you administer a remote Linux server without your credentials/commands traveling in plaintext.
- **SMTP / IMAP / POP3** — email protocols: SMTP for *sending* mail between servers, IMAP/POP3 for a client *retrieving* mail from a mailbox (IMAP keeps mail synced across devices; POP3 traditionally downloads and removes it).
- **ICMP** — the protocol behind `ping` and `traceroute`; used for network diagnostics and error reporting (e.g., "destination unreachable"), not for carrying application data.
- **ARP (Address Resolution Protocol)** — resolves an IP address to a MAC address *within* a local network segment — the missing link between Layer 3 (IP) and Layer 2 (MAC) addressing mentioned in the OSI file.
- **gRPC** — not a wire-level protocol in the same sense as the above, but worth mentioning here: it's an RPC framework built on top of HTTP/2, using Protocol Buffers for binary serialization. Covered in depth in `fde/04-System-Design-HLD/11_graphql_grpc_and_pagination.md`.

---

<a name="full-journey"></a>
## 8. The Full Journey: Typing a URL and Hitting Enter

Putting every protocol in this file together, in order:

```
1. You type https://api.example.com/users and hit Enter.

2. DNS resolution: browser checks its cache, then OS cache, then asks a recursive
   resolver, which walks Root -> .com TLD -> authoritative nameserver, returning
   an IP address (e.g. 93.184.216.34).

3. TCP three-way handshake: browser and server exchange SYN / SYN-ACK / ACK to
   establish a reliable connection on port 443.

4. TLS handshake: ClientHello/ServerHello, certificate verification against a
   trusted CA, key exchange, both sides derive a shared symmetric session key.
   (SNI was sent early in this handshake so the server knew which cert to present.)

5. HTTP request sent (now encrypted by TLS, carried reliably by TCP):
   GET /users HTTP/1.1, Host: api.example.com, ...headers...

6. Server's application layer (your Express/FastAPI/etc. code) processes the
   request entirely unaware of steps 2-4 -- it just sees a clean HTTP request.

7. HTTP response flows back through the same encrypted TCP connection.

8. Browser decrypts (TLS), parses the HTTP response, and renders/uses the data.

9. If keep-alive is active, the SAME TCP+TLS connection is reused for the next
   request to the same host -- skipping steps 3 and 4 entirely.
```

---

<a name="qna"></a>
## 9. Interview Q&A

**Q: Why does TCP need a three-way handshake specifically — why not two-way?**
Both sides need to prove they can both *send* and *receive*. SYN proves the client can send. SYN-ACK proves the server can both receive (it acknowledged the SYN) and send. The final ACK proves the client can receive the server's message. Two-way wouldn't confirm the client's ability to receive — the server would be blindly trusting an unconfirmed channel.

**Q: A page uses HTTPS. Where exactly does encryption start and stop?**
Encryption is applied by TLS, which wraps the TCP payload. The IP and TCP headers themselves are *not* encrypted (a network observer can still see which IP addresses and ports are talking to each other, and roughly how much data — that's why VPNs exist, to hide even that). Only the actual application data (the HTTP request/response) is encrypted and unreadable to an eavesdropper.

**Q: Why is DNS mostly UDP, but sometimes TCP?**
Most DNS queries and responses are small enough to fit in a single UDP packet — no need for TCP's handshake overhead for a one-shot lookup. DNS falls back to TCP when the response is too large for one UDP packet (some DNSSEC responses, zone transfers between DNS servers) or when reliability is specifically needed for a larger exchange.

**Q: If TCP already guarantees reliable delivery, why does HTTP itself define retry logic in client libraries (like axios)?**
TCP guarantees delivery of bytes *within an established connection*. It does not guarantee the *connection itself* won't fail entirely (server crashes mid-response, network partition, connection timeout), and it has no concept of "retry the whole request" — that's an application-level decision, because only the application knows whether a request is safe to retry (is it idempotent?) and what backoff strategy makes sense.

**Q: What's actually different about HTTP/3 at the protocol level, not just "it's faster"?**
HTTP/1.1 and HTTP/2 both run on TCP — meaning a single lost packet stalls *every* stream multiplexed over that one TCP connection (TCP-level head-of-line blocking) until it's retransmitted. HTTP/3 runs on **QUIC**, which is built on UDP but implements its own reliability, ordering, and congestion control *per stream*, in userspace — so a lost packet only stalls the one stream it belonged to, not the whole connection. It also folds the TLS handshake into the same initial exchange (fewer round trips) and supports 0-RTT resumption for repeat connections.
