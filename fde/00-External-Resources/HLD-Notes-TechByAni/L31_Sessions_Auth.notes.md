# Session-Based Authentication — Notes (from L31_Sessions_Auth.pdf)

Source: TechByAni HLD-Notes.

> **Legibility note**: this PDF is a single, very dense page with small handwriting and many flow diagrams — full step-by-step text wasn't reliably OCR-able at this resolution. What follows is the confidently legible structure plus standard session-auth mechanics matching the diagram flow (login → cookie → subsequent requests → logout → storage → security). Open the PDF directly for the exact wording and diagram details.

## What is a session?

A session is server-side state that represents "this user is currently logged in," created after a successful login and referenced by a unique session ID that's handed to the client.

## What is a cookie?

A small piece of data the server asks the browser to store (`Set-Cookie` response header) and automatically re-send on every subsequent request to the same domain (`Cookie` request header) — the mechanism that carries the session ID without the client having to manually attach it each time.

## Step 1 — Login request

```
POST /login  { username, password }
      ↓
Server verifies credentials → creates a session record (server-side: in memory, DB, or Redis)
      ↓
Server responds: Set-Cookie: sessionId=abc123...; HttpOnly; Secure; SameSite=Lax
```

## Step 2 — Subsequent requests

```
GET /profile
Cookie: sessionId=abc123...
      ↓
Server looks up sessionId in its session store
      ↓
Found + valid → treat request as authenticated, load user context
Not found / expired → 401, force re-login
```

## Session storage

In-process memory (simplest, but doesn't scale across multiple server instances without sticky sessions), a shared store like **Redis** (the standard production answer — any server instance can look up any session, enabling horizontal scaling), or a database table (durable, but slower per-request than Redis).

## Logout flow

Client calls `/logout` → server deletes the session record from the store → server clears the cookie (`Set-Cookie` with an expired date) → subsequent requests with the old sessionId find nothing in the store and are rejected.

## Cookie security attributes (the ones that matter)

- **`HttpOnly`** — JavaScript cannot read the cookie, blocking XSS-based session theft.
- **`Secure`** — cookie is only sent over HTTPS.
- **`SameSite=Lax`/`Strict`** — restricts the cookie from being sent on cross-site requests, mitigating CSRF.

## Session-based auth vs token-based (JWT) — the core trade-off

| | Session (cookie + server store) | JWT (stateless token) |
|---|---|---|
| Revocation | Instant — delete the session record | Hard — must wait for expiry or maintain a denylist |
| Server state | Required (session store) | None — self-contained token |
| Scaling | Needs a shared store (Redis) across instances | Any instance can verify independently |
| Classic use case | Traditional web apps (browser-rendered) | APIs, mobile apps, microservices |

## Cross-reference

See [../../07-Security/01_authentication_deep_dive.md](../../07-Security/01_authentication_deep_dive.md) for the deep-dive version of this trade-off, and [../../07-Security/02_oauth2_oidc.md](../../07-Security/02_oauth2_oidc.md) for the token-based alternative in full detail.
