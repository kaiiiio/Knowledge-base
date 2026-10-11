# Backend Communication Design Patterns

Once you know the protocols (previous file), the next question is: **how should two services actually talk to each other?** Same protocol (HTTP, say) can be used in wildly different *patterns* — a blocking call that waits for an answer, a fire-and-forget event nobody waits on, a queued job processed minutes later. This file is the decision framework: what each pattern is, when it's the right call, and what breaks if you pick wrong. Every pattern here already has deeper coverage elsewhere in this knowledge base — this file's job is to put them all on one map so you know which deep-dive to open.

## Table of Contents
1. [The One Axis That Explains Everything: Sync vs Async](#axis)
2. [Pattern 1 — Request/Response (Synchronous)](#request-response)
3. [Pattern 2 — Polling](#polling)
4. [Pattern 3 — Long Polling](#long-polling)
5. [Pattern 4 — WebSockets (Bidirectional Push)](#websockets)
6. [Pattern 5 — Server-Sent Events (One-Way Push)](#sse)
7. [Pattern 6 — Webhooks (Inverted Request/Response)](#webhooks)
8. [Pattern 7 — Message Queues (Point-to-Point Async)](#queues)
9. [Pattern 8 — Publish/Subscribe (Fan-out Async)](#pubsub)
10. [Pattern 9 — Event-Driven Architecture (The Big Picture)](#eda)
11. [Pattern 10 — RPC-Style Calls (gRPC, GraphQL as an Alternative Shape)](#rpc)
12. [The Decision Table](#decision-table)
13. [Combining Patterns in One Real System](#combining)
14. [Interview Q&A](#qna)

---

<a name="axis"></a>
## 1. The One Axis That Explains Everything: Sync vs Async

Every pattern in this file is really just a different answer to one question: **does the caller wait for a response before moving on?**

- **Synchronous**: caller sends a request and **blocks** until it gets a response. Simple to reason about, but the caller's speed is now capped by the callee's speed — if the callee is slow or down, the caller is stuck too.
- **Asynchronous**: caller sends something and **moves on immediately**, without waiting. The result (if any) arrives later, through a separate mechanism. More resilient (a slow/down downstream doesn't block you), but harder to reason about — you now have to handle "the answer isn't here yet" as a first-class state.

Every pattern below is one specific, named way of being synchronous or asynchronous — knowing which axis a pattern sits on tells you 80% of its trade-offs before you even learn the mechanism. (This exact axis is covered from the Node.js/HLD-notes angle in `fde/00-External-Resources/HLD-Notes-TechByAni/L14_Sync_Async.notes.md` — this file builds the full pattern catalog on top of that foundation.)

---

<a name="request-response"></a>
## 2. Pattern 1 — Request/Response (Synchronous)

**What it is**: the default. Client sends a request over HTTP (or gRPC), server processes it, sends back a response, connection either closes or is reused for the next request. This is REST, this is a typical GraphQL query, this is 90% of API traffic.

```
Client ──request──► Server
Client ◄─response── Server   (client is blocked/waiting the entire time in between)
```

**When to use**: the client genuinely needs the answer *right now* to proceed (fetching a user's profile before rendering a page, validating a login). **When it breaks down**: the work takes a long time (video processing, generating a large report, calling a slow third-party API) — holding an HTTP connection open for minutes is wasteful and fragile (timeouts, proxies killing idle connections, the client giving up). That's the signal to reach for an async pattern instead.

---

<a name="polling"></a>
## 3. Pattern 2 — Polling

**What it is**: the client repeatedly asks "is it ready yet?" on a fixed interval, because the server can't push to the client on its own.
```
Client ──"any update?"──► Server: "No"     (repeat every N seconds)
Client ──"any update?"──► Server: "No"
Client ──"any update?"──► Server: "Yes, here it is"
```
**When to use**: simple to implement, works everywhere (just repeated HTTP calls), fine for low-frequency checks where a few seconds of staleness is acceptable (checking if a background report finished generating). **The cost**: wasted requests when nothing changed, and a real ceiling on freshness (you'll never know about an update faster than your poll interval) — at scale, millions of clients each polling every few seconds is a lot of pointless load for "no" answers. **This is exactly the failure mode message queues and pub/sub exist to fix** — see the message-queue notes' motivating example in `fde/00-External-Resources/HLD-Notes-TechByAni/L15_message_queue.notes.md`.

---

<a name="long-polling"></a>
## 4. Pattern 3 — Long Polling

**What it is**: a half-step improvement on polling — the client makes a request, but the **server holds the connection open** and doesn't respond until there's actually something new to say (or a timeout is hit). The instant a response comes back, the client immediately opens a new long-poll request.
```
Client ──request──► Server (holds connection open, waiting...)
                     Server: "Something happened!" ──► Client
Client ──new request──► Server (holds connection open again...)
```
**Why it's better than plain polling**: far fewer wasted round-trips, and updates arrive close to instantly (as soon as the server has something, not "whenever the next poll happens to land"). **Why it's not the final answer**: it's still fundamentally the request/response model bent out of shape — you're holding HTTP connections open, which costs server resources per waiting client, and it doesn't naturally support the server pushing *multiple* updates without the client re-requesting each time. This is the historical stepping-stone that led to WebSockets.

---

<a name="websockets"></a>
## 5. Pattern 4 — WebSockets (Bidirectional Push)

**What it is**: an HTTP request that "upgrades" into a persistent, full-duplex TCP connection — after the upgrade, either side can send data to the other **at any time**, with no request/response ceremony per message.
```
Client ──HTTP request with "Upgrade: websocket"──► Server
Client ◄──101 Switching Protocols────────────────── Server
Client ⇄════════ raw messages, either direction, anytime ════════⇄ Server
```
**When to use**: true bidirectional realtime — chat, live auctions/bidding, multiplayer games, collaborative editing — anywhere both sides need to push frequently and low latency matters. **The cost**: it's stateful (the connection is tied to one specific server instance, which complicates horizontal scaling — see the WhatsApp/chat system design notes for how to solve that with Redis Pub/Sub or consistent hashing), and it requires you to build your own reliability on top (WebSocket itself gives no delivery guarantee if a message is sent while the connection is momentarily down). Full deep dive: `fde/00-External-Resources/HLD-Notes-TechByAni/WebSockets.notes.md`, with a real production implementation walked through in `frontend-knowledge-base/react/dynasty_frontend_patterns_explained.md` section 3.

---

<a name="sse"></a>
## 6. Pattern 5 — Server-Sent Events (One-Way Push)

**What it is**: like WebSockets, but **one-directional only** — server can push to client, client cannot push back over the same channel (it would use a normal HTTP request for that). Runs over plain HTTP (no special upgrade handshake), and browsers auto-reconnect it if the connection drops.
```
Client ──HTTP request (Accept: text/event-stream)──► Server
Client ◄══ event: message\ndata: {...}\n\n ═══════════ Server   (keeps streaming, one direction)
Client ◄══ event: message\ndata: {...}\n\n ═══════════ Server
```
**When to use**: server-to-client-only feeds — live notifications, stock ticker updates, **LLM token streaming** (this is the standard mechanism for streaming a chat response character-by-character), progress updates for a long-running job. **Why choose it over WebSocket** when you only need one direction: simpler (no upgrade handshake, works through more proxies/firewalls out of the box), and gets free auto-reconnect from the browser's `EventSource` API. **Why not**, if you need the client to talk back on the same channel — that's WebSocket's job.

---

<a name="webhooks"></a>
## 7. Pattern 6 — Webhooks (Inverted Request/Response)

**What it is**: instead of you asking "did anything happen?" (polling), the other system calls **you** — you register a URL, and when their event occurs, they send an HTTP POST to it.
```
You: "Here's my endpoint: POST https://myapp.com/webhooks/stripe"
   ... time passes, a payment succeeds on Stripe's side ...
Stripe ──POST /webhooks/stripe { event: "payment.succeeded", ... }──► Your server
```
**When to use**: integrating with a third-party system (Stripe, GitHub, Shopify, Twilio) where you want to know about *their* events without polling their API constantly. **The two things every webhook implementation must get right**: (1) **verify the signature** (HMAC over the raw request body) before trusting the payload — anyone can POST to a public URL pretending to be Stripe; (2) **treat it as at-least-once delivery** — the sender may retry, so your handler must be idempotent (dedupe by the event's unique ID). Full deep dive with the raw-body-signature gotcha: `fde/00-External-Resources/HLD-Notes-TechByAni/L16_Webhooks.notes.md`.

---

<a name="queues"></a>
## 8. Pattern 7 — Message Queues (Point-to-Point Async)

**What it is**: instead of calling another service directly, you drop a message into a **queue**; a worker (consumer) picks it up whenever it's ready and processes it. The producer never waits, and doesn't even need the consumer to be online at the moment it publishes.
```
Producer ──"process this order"──► [ QUEUE ] ◄──pulls when ready── Consumer/Worker
```
**Why this beats a direct synchronous call for background work**: the producer's response time is no longer coupled to how long the actual work takes (charging a card, sending an email, generating a report) — it just enqueues and returns immediately. It also gives you built-in retry (a failed job can be redelivered), and lets you scale producers and consumers **independently** (add more workers if the queue backs up, without touching the producer at all).
**Key concept — competing consumers**: multiple workers can pull from the same queue, and each message is delivered to exactly *one* of them — this is how you parallelize processing of a backlog. **Real systems**: RabbitMQ, AWS SQS, BullMQ (Redis-backed). Full deep dives: `fde/00-External-Resources/HLD-Notes-TechByAni/L18_RabbitMQ_Notes.txt`, and `express-backend-knowledge-base/08_background_jobs_and_task_queues/03_bullmq_internals_and_hard_questions.md` for the hardest interview-grade internals (at-least-once delivery, idempotency, the outbox pattern for atomically writing-and-enqueueing).

---

<a name="pubsub"></a>
## 9. Pattern 8 — Publish/Subscribe (Fan-out Async)

**What it is**: a producer publishes a message to a **topic/channel**, and *every* subscriber to that topic gets a copy — not just one, like a queue's competing-consumers model. This is the "broadcast" version of async messaging.
```
Publisher ──publish──► [ TOPIC: "order.created" ]
                              ├──► Subscriber A (Email service)
                              ├──► Subscriber B (Inventory service)
                              └──► Subscriber C (Analytics service)
```
**Queue vs Pub/Sub — the distinction that trips people up**: in a queue, one message is consumed by *one* worker (load balancing a stream of work). In pub/sub, one message is delivered to *every* subscriber (broadcasting an event to everyone who cares). Same underlying "async, no direct coupling" idea, completely different delivery semantics — picking the wrong one means either duplicate processing (used a topic where you needed a queue) or missed consumers (used a queue where you needed a broadcast).
**Real systems**: Redis Pub/Sub (simple, at-most-once, no persistence — covered with its real trade-offs in `L23_Redis.txt` in this knowledge base's external resources), Kafka (durable, replayable log — a topic here retains history and supports many independent consumer groups each reading at their own pace), AWS SNS.

---

<a name="eda"></a>
## 10. Pattern 9 — Event-Driven Architecture (The Big Picture)

**What it is**: not a single mechanism but an overall *architectural style* built out of the async patterns above — services communicate primarily by publishing and reacting to events ("order.created", "payment.failed") rather than calling each other directly. Two flavors:
- **Choreography** — each service reacts to events and emits its own next event; no central coordinator. Fully decoupled, but the overall flow isn't written down anywhere in code — you trace it by following events across services.
- **Orchestration** — a central orchestrator service explicitly sequences each step, calling out and waiting for each service's result. Easier to reason about and debug (the whole flow lives in one place), at the cost of a coordination point.

Full deep dive, including the saga pattern for handling multi-step failures without distributed transactions: `fde/05-Distributed-Systems/04_distributed_transactions_and_sagas.md` and `fde/00-External-Resources/HLD-Notes-TechByAni/L17_EDA.notes.md`.

---

<a name="rpc"></a>
## 11. Pattern 10 — RPC-Style Calls (gRPC, GraphQL as an Alternative Shape)

Worth including because it's a different *shape* of synchronous communication than plain REST, even though it's still fundamentally request/response under the hood:
- **gRPC** — makes a remote call look like a local function call, using HTTP/2 + Protocol Buffers underneath for speed and strict typing. Best for service-to-service calls where you control both ends. Also supports streaming variants (server-streaming, client-streaming, bidirectional) that blur into the async patterns above.
- **GraphQL** — still request/response, but the *client* decides the exact shape of data it wants in one round trip, instead of the server dictating a fixed response shape (fixing REST's over-fetching/under-fetching problem) — with a subscription mode that behaves like WebSocket-based push for realtime cases.

Full comparison and internals: `fde/04-System-Design-HLD/11_graphql_grpc_and_pagination.md`.

---

<a name="decision-table"></a>
## 12. The Decision Table

| Need | Pattern |
|---|---|
| Client needs an answer right now to proceed | Request/Response |
| Simple "check back later," low frequency, staleness OK | Polling |
| Need near-instant updates but can't push, want simple infra | Long Polling |
| True bidirectional realtime (chat, live bidding, games) | WebSockets |
| Server → client push only (notifications, LLM streaming, progress) | Server-Sent Events |
| Third party needs to tell YOU about their events | Webhooks (you're the receiver) |
| YOU need to tell a third party about your events | Webhooks (you're the sender) |
| Background work, one worker should handle each job | Message Queue |
| One event, many independent services need to react | Pub/Sub |
| Whole system built around reacting to business events | Event-Driven Architecture |
| Fast, strongly-typed internal service-to-service calls | gRPC |
| Client needs flexible, varying data shapes from one endpoint | GraphQL |

---

<a name="combining"></a>
## 13. Combining Patterns in One Real System

No real system uses just one pattern — a realistic e-commerce checkout flow uses nearly all of them at once:
```
Browser → REST request/response → place order (client waits for order confirmation)
Order Service → Message Queue → background jobs (charge card, reserve inventory, send email)
Payment Provider → Webhook → your server, confirming the charge actually succeeded
Order Service → Pub/Sub event "order.paid" → Inventory, Analytics, Notification services react independently
Notification Service → Server-Sent Events / WebSocket push → live order-status update in the browser
```
This is the "expert" framing worth using in an interview: don't pick one pattern for a whole system — **pick the right pattern per interaction**, based on whether that specific interaction needs an immediate answer, needs to broadcast, needs to survive the receiver being temporarily offline, or needs to push without being asked.

---

<a name="qna"></a>
## 14. Interview Q&A

**Q: When would you choose a message queue over just calling the other service's API directly (synchronously)?**
When the caller doesn't need the result immediately, when the work is slow/unpredictable in duration, when you want the caller resilient to the downstream service being temporarily down, or when you want independent scaling of producer and consumer. The tell-tale sign in a design question: "the user submits X and gets an immediate confirmation, but the actual processing takes a while" — that's a queue, every time.

**Q: What's the actual difference between a queue and a pub/sub topic, mechanically?**
A queue's competing-consumers model means each message is delivered to exactly one consumer — the queue tracks which messages are "claimed" so two workers never process the same job. A pub/sub topic delivers a *copy* of each message to every current subscriber — there's no "claiming," everyone who's listening gets it.

**Q: Why do webhooks need signature verification, but a normal API response doesn't need the same treatment?**
Because with a webhook, *your* server is the one receiving an unsolicited inbound request — anyone on the internet can POST to a public URL pretending to be Stripe/GitHub/whoever. With a normal outbound API call, you initiated the connection to a known, trusted host (verified via TLS certificate) — the trust direction is reversed, so webhooks need an extra layer (HMAC signature) to establish "this really came from who it claims to."

**Q: If WebSockets can push in both directions, why does anything still use Server-Sent Events?**
SSE is simpler where you only need one direction: no upgrade handshake, works over plain HTTP (better proxy/firewall/CDN compatibility out of the box), and the browser's `EventSource` API auto-reconnects for you for free. If you don't need the client pushing back over the same channel, adding WebSocket's extra complexity buys you nothing.

**Q: How do you handle "what if my service publishes an event but crashes right before/after"?**
This is the classic dual-write problem — writing to your database and publishing an event are two separate operations that can't both be guaranteed to succeed or fail together without extra work. The standard fix is the **outbox pattern**: write the event into an "outbox" table in the *same* database transaction as your actual data change, then have a separate relay process read the outbox and publish events, marking them sent — so the event is never lost even if the process crashes mid-way. Full mechanism: `fde/05-Distributed-Systems/04_distributed_transactions_and_sagas.md`.
