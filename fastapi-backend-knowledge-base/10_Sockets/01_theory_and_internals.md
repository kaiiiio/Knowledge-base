# 01. Theory & Internals: Understanding the Wire Protocol

## 1. The "Why" of WebSockets

HTTP is great for documents, but terrible for real-time. **HTTP** is request → response → close (stateless, high overhead). **Polling** asks "Are we there yet?" every second (wastes bandwidth, high latency). **Long Polling** says "Wake me up when we get there" (better, but holds connections open awkwardly).

**WebSockets** provide a persistent, full-duplex, low-latency TCP connection. **Persistent:** The connection stays open for hours/days. **Full-Duplex:** Server can send to client, client can send to server, simultaneously. **Low-Latency:** No HTTP headers overhead per message. Just raw data.

---

## 2. The Handshake (The "Upgrade")

Every WebSocket connection starts its life as an HTTP request. This ensures compatibility with existing infrastructure (port 80/443). The handshake upgrades the connection from HTTP to WebSocket.

### The Client Request
```http
GET /chat HTTP/1.1
Host: api.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
```
- `Upgrade: websocket`: "I want to switch protocols."
- `Sec-WebSocket-Key`: A random base64 string. The server must sign this to prove it understands WebSockets (prevents caching proxies from getting confused).

### The Server Response
```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```
- `101 Switching Protocols`: "Okay, let's do it."
- `Sec-WebSocket-Accept`: The signed key (proves server understands WebSocket).

**After this empty line, the HTTP protocol ends.** The socket remains open, and binary frames start flowing (protocol switched to WebSocket).

---

## 3. The Framing Protocol

Data isn't sent as a continuous stream; it's chopped into **Frames**.

### Frame Structure (Simplified)
```
[Fin, Opcode] [Mask, Payload Length] [Masking Key] [Payload Data]
```
- **Fin (1 bit)**: Is this the last frame of the message? (Messages can be fragmented across multiple frames).
- **Opcode (4 bits)**: What kind of data is this? `0x1` is text (UTF-8), `0x2` is binary, `0x8` is close, `0x9` is ping, and `0xA` is pong.
- **Mask (1 bit)**: Is the payload masked? (Client-to-Server must always be masked to prevent cache poisoning).

### Control Frames
These are crucial for keeping the connection healthy. **Ping** asks "Are you there?", **Pong** replies "Yes, I'm here" (must reply to ping immediately), and **Close** says "I'm leaving" (contains a 2-byte code explaining why).

---

## 4. Close Codes (Debugging Life-Savers)

When a connection dies, check the Close Code.

| Code | Meaning | Common Cause |
| :--- | :--- | :--- |
| **1000** | Normal Closure | User closed the tab. |
| **1001** | Going Away | Browser navigated away / Server restarting. |
| **1005** | No Status | Connection dropped without a close frame (Network error). |
| **1006** | Abnormal Closure | **The most common error.** Usually means the server crashed or the network died abruptly. |
| **1008** | Policy Violation | Auth failed / Invalid token. |
| **1011** | Internal Error | Unhandled exception in your backend code. |

**Pro Tip**: If you see `1006` in your logs, it means the TCP connection was ripped apart. If you see `1011`, check your server error logs.
