# The Evolution of HTTP — Notes (from L9_HTTP.pdf)

Source: TechByAni HLD-Notes.

## The framing analogy

Imagine ordering 100 items from Amazon:
- **HTTP/1.0** → 1 truck per item (one connection per request)
- **HTTP/1.1** → 1 truck, sequential (one connection, requests one after another)
- **HTTP/2** → 1 truck, parallel (one connection, requests multiplexed simultaneously)
- **HTTP/3** → drones, independent (independent streams, one lost packet doesn't block others)

## HTTP/1.0 (1996)

- Text-based protocol (headers + body in plain text).
- Each request = a **new TCP connection**.
- No persistent connections (no keep-alive).
- Very inefficient for modern websites with many resources (images, CSS, JS).

```
Client                    Server
 —TCP Handshake——————————→
 —Request A——————————————→
 ←————————Response A——————
 —Connection Close———————→
 —TCP Handshake——————————→     (repeats per resource)
 —Request B——————————————→
 ←————————Response B——————
 —Connection Close———————→
```

**Real-life analogy**: imagine every time you ask your friend a question, you hang up the phone and call again for the next question — extremely slow.
**Use case**: early static websites (mostly HTML + few images).

## HTTP/1.1 (1997)

**Improvement**: persistent connections via `Connection: keep-alive`; multiple requests on the same TCP connection.
**Still suffers from Head-of-Line (HOL) blocking** — if one request gets delayed, others behind it on that connection wait.

```
Client                    Server
 —TCP Handshake——————————→
 —Request A——————————————→
 ←————————Response A——————
 —Request B——————————————→
 ←————————Response B——————
 —Request C——————————————→
 ←————————Response C——————
 —Connection Close———————→
```
Faster than 1.0 since the TCP connection is reused, but if Response A is slow, B and C must wait.

**Real-life analogy**: now you keep the phone line open and ask multiple questions in the same call — but if your friend delays answering one, all other answers wait.
**Use case**: dynamic sites with multiple resources (Amazon product page, blogs).

## HTTP/2 (2015)

**Major upgrade**:
- **Binary protocol** (not text).
- **Multiplexing** — many requests/responses simultaneously over a **single TCP connection**.
- **Header compression (HPACK)** — reduces repeated data like cookies, using header tables + Huffman encoding.
- **Server Push** — server can send resources before the client requests them.
- **Still limited by TCP HOL blocking** — if one packet is lost, all streams pause until retransmission (this is a TCP-layer limitation, not an HTTP/2 design flaw).

```
Client                    Server
 —TCP Handshake——————————→
 —Request A——————————————→
 —Request B——————————————→
 —Request C——————————————→
 ←————————Response A——————
 ←————————Response B——————
 ←————————Response C——————
 —Connection Close———————→
```
**Use case**: modern websites with lots of images, scripts, and styles (news portals, e-commerce).

## HTTP/3 (2020s) — QUIC/UDP

**Game changer**:
- Based on **QUIC** (over UDP) → avoids TCP's HOL blocking entirely.
- **Independent streams** — one packet loss doesn't affect other streams.
- **TLS 1.3 built-in** — always encrypted, no extra handshake.
- **0-RTT connection setup** — instant resume of sessions.
- Works great in mobile networks where packet loss + switching between WiFi/mobile data is common.

```
Client                    Server
 —QUIC Handshake————————→
 —Request A——(Stream 1)—→
 —Request B——(Stream 2)—→
 —Request C——(Stream 3)—→
 ←—(Stream 1) Response A—
 ←—(Stream 2) Response B—
 ←—(Stream 3) Response C—
 —Connection Close———————→
```
**Use case**: streaming (YouTube, Netflix), gaming, video conferencing, mobile browsing.

## Myth: REST vs gRPC — it's not about the transport protocol

REST is just an architectural style. If the server and client support HTTP/2 or even HTTP/3, a REST API will automatically run over it — and take advantage of multiplexing, header compression, and lower latency.

**But here's the key difference**: REST was designed in the HTTP/1.1 era, so most implementations don't really leverage all the advanced features of HTTP/2. gRPC, on the other hand, was built from day one on top of HTTP/2.

So yes, REST *can* run on HTTP/2 or even HTTP/3 — but gRPC is *engineered* to unlock the full power of HTTP/2, which is why it's often the better choice for high-performance microservices and APIs.
