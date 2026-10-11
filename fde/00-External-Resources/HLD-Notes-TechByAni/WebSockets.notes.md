# WebSockets — Notes (from WebSockets.pdf)

Source: TechByAni HLD-Notes.

## Why WebSockets came (what was broken in HTTP)

**Original HTTP model**: request → response. HTTP was designed for documents, not real-time systems. Basic rule: client sends a request → server sends a response → connection closes (HTTP/1.1: mostly). That's it.

**Problem**: what if the server has new data, but the client didn't ask? → **Server cannot push data.**

## Real-world use cases that broke HTTP

Modern apps need real-time: chat apps (WhatsApp, Slack), stock price updates, notifications, multiplayer games, live dashboards, online collaboration (Google Docs). HTTP alone cannot do this efficiently.

## Hacks before WebSockets (how we tried to fix HTTP)

### 1. Polling (the worst but simplest)
Client asks the server every X seconds "any update?"
```
Client —Any update?→ Server
Client ←——NO———————— Server   (Connection Closed, repeats)
```
**Problems**: huge number of useless requests, high latency (updates delayed until next poll), wasted CPU/bandwidth/money. Example: 10M users × poll every 5 sec = **120M requests/minute**.

### 2. Long Polling (slightly better)
Client sends a request → server **waits** until data is available → server responds → client immediately sends another request.
**Problems**: still HTTP overhead (headers again and again), connection constantly created & destroyed, hard to scale.

### 3. Server-Sent Events (SSE)
Client opens one HTTP connection → server pushes updates as a stream of events.
**Limitations**: one-way only (server → client), no binary data, not suitable for chat/games.

**HTTP was never meant for real-time.**

## Why WebSockets were invented

**Goal**: create a protocol that (1) keeps one persistent connection, (2) allows full-duplex communication, (3) has low overhead, (4) works well with browsers, (5) plays nicely with existing HTTP infrastructure. WebSockets were standardized to meet exactly these goals.

## What exactly is WebSocket?

A **persistent, full-duplex communication protocol over a single TCP connection**.

**Key properties**: one connection; client ↔ server both can send anytime; very low latency; minimal overhead.

```
Client —Initiate Connection→ Server
Client ←—Connection Established— Server
Client ⇄————Data Flow (either direction, anytime)————⇄ Server
Client ←————Connection Closed———— Server
```

## How a WebSocket connection is established (the handshake)

**Step 0 — TCP connection (happens silently).** Client opens a TCP connection to the server (port 80 for `ws`, 443 for `wss`). If `wss` → a TLS handshake happens first. This is normal TCP/HTTPS, nothing WebSocket-specific yet.

**Step 1 — Client sends an HTTP request (Upgrade request).** Only the **client** can start the upgrade. It sends a normal HTTP request with special headers:
```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: random_key
Sec-WebSocket-Version: 13
```

**What each header means**:
- `Upgrade: websocket` → "I want to switch protocol."
- `Connection: Upgrade` → "This connection should be upgraded."
- `Sec-WebSocket-Key` → a random value (security check).
- `Sec-WebSocket-Version: 13` → the WebSocket protocol version.

**Important**: this is still pure HTTP — no WebSocket frames yet.

**Step 2 — Server validates the request.** Server checks: is `Upgrade: websocket` present? Is version 13 supported? Is this endpoint allowed to upgrade? If any check fails → server replies with a normal HTTP error.

**Step 3 — Server sends HTTP 101 response (upgrade accepted).**
```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: hashed_key
```

**Step 4 — Protocol switches (the magic moment).** After the 101 response: no more HTTP, WebSocket protocol starts. From this point: no HTTP headers, no request/response model, **only WebSocket frames**.

**Step 5 — WebSocket communication begins.** Now both sides can send: text frames, binary frames, ping/pong, close frames. Server can send without waiting; client can send anytime. **This is full-duplex.**

## How a WebSocket connection closes (step by step)

WebSocket closes via a small, graceful handshake using **CLOSE frames** — not by just killing the TCP connection.

**Step 0 — Connection is active.** TCP connection is open, WebSocket frames are flowing (text/binary), ping/pong may be happening.

**Step 1 — One side decides to close.** Either side can start: client (browser refresh, tab close) or server (shutdown, idle timeout, deploy). There is no "request" or "response" here — only frames.

**Step 2 — Initiator sends a CLOSE frame.** Contains a close code (optional but recommended) and a reason string (optional). Example: `Opcode: CLOSE, Code: 1000, Reason: Normal closure`. At this moment: the initiator will NOT send any more data frames — only Close/Pong frames are allowed after this (protocol rule).

**Step 3 — Receiver gets the CLOSE frame.** The other side must: stop sending normal data, and send its own CLOSE frame back (echoing or choosing its own code). This is mandatory for a graceful shutdown.

**Step 4 — TCP connection is closed.** After both sides have exchanged CLOSE frames: TCP connection is closed, file descriptors released, memory cleaned up.
```
Client —CLOSE—→ Server
Client ←—CLOSE—— Server
TCP connection closed
```
Result: WebSocket is fully closed, no resource leak.

## Scaling WebSockets

**Problem**: WebSocket is **stateful** — a connection is tied to one specific server. The load balancer must use **sticky sessions** to keep a client talking to the same server instance.

**Scaling solutions**:
- Sticky load balancing.
- Shared pub/sub (Redis, Kafka, etc.) — so a message published on Server A can reach a user connected to Server B.
- Connection registries — tracking which server holds which user's live connection.
- Horizontal scaling with event fan-out.

```
User A ⇄ Server A ⇄ Message Broker (MB) ⇄ Server B ⇄ User B
```
(This is exactly how a chat app fans a message out to users connected to different server instances.)

## Failure handling in WebSockets

Network drops → connection lost. Server crash → clients disconnect. **Common strategies**: heartbeats (ping/pong), auto-reconnect on client, resume sessions, message acknowledgements (app-level). **Important**: WebSocket itself does **not** guarantee delivery — reliability is something you build on top.

## When you SHOULD use WebSockets

Chat systems, live notifications, real-time dashboards, online games, collaborative editors, live trading apps.

## When you should NOT use WebSockets

Simple CRUD APIs, rare updates, stateless REST services, or when SSE is enough (one-way is all you need).

## Cross-reference

See [../../04-System-Design-HLD/04_design_whatsapp_chat.md](../../04-System-Design-HLD/04_design_whatsapp_chat.md) for WebSocket connection gateways + connection registry at scale, and this folder's `L9_HTTP.notes.md` for how HTTP/2 vs HTTP/3 changed (but didn't eliminate) the case for WebSockets.
