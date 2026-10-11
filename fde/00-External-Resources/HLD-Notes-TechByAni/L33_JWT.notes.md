# JWT (JSON Web Token) — Notes (from L33_JWT.pdf)

Source: TechByAni HLD-Notes.

> **Legibility note**: page 2 of this PDF (auth-server scaling, SPOF mechanics, the JWT vs Session comparison table, real-world usage) is small and dense — reconstructed below from standard JWT knowledge matching the visible section headers. Page 1 (the core JWT mechanics) was clearly legible and is transcribed faithfully.

## The real problem (why JWT exists)

Before JWT, we had **session-based authentication**.

**How login worked (old way)**:
```
Client —1. login——→ Server
Client ←2. sessionId—— Server → stores Session Store { sessionId → user data }
Client —3. requests with cookie——→ Server looks up session store
```
User logs in → server creates a session (in DB/Redis) → sends session ID in a cookie → every request: server looks up the session.

**Problems with sessions**:
1. **Scaling issue** — if you have multiple servers, the session must be shared (Redis, DB) → added complexity.
2. **Performance overhead** — every request = a DB/Redis lookup.
3. **Microservices problem** — each service needs session access.
4. **Mobile/APIs** — cookies are not always ideal.

**So we needed**: a way to authenticate each request *without* storing session on the server.

## Enter JWT (the idea)

JWT solves this by making auth **stateless**.

```
Client —1. login——→ Server verifies, no DB lookup needed on future requests
Client ←2. token—— Server
Client —requests with token——→ Server verifies token
```

Instead of storing a session: server gives you a **token**. The token contains your identity. Server just **verifies the token** — no DB lookup.

## What is JWT (fundamental concept)

JWT (JSON Web Token) is a compact, URL-safe token format used to securely transmit data between parties.

**Format**: `HEADER.PAYLOAD.SIGNATURE`

Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

**Key ideas**:
- It's self-contained — carries your data.
- It's stateless — server doesn't store session.
- It's signed (and optionally encrypted).

## Structure of JWT

### 1. Header
```json
{ "alg": "HS256", "typ": "JWT" }
```
`alg` = algorithm used (HS256, RS256, etc.), `typ` = "JWT". The algorithm in the header defines how the token is signed and verified, including the hashing method and key type. It prevents both parties from disagreeing on how to verify the token — the sender and receiver must use the correct algorithm specified in the header to avoid attacks (algorithm-confusion attacks).

- **HS256** — uses a shared secret (symmetric).
- **RS256** — uses a public/private key pair (asymmetric). Prefer RS256 in production (any service holding only the public key can verify tokens without being able to *forge* them — the private key that signs stays on the auth server only).

### 2. Payload (claims)
```json
{ "userId": "123", "role": "admin", "exp": 1716453022 }
```
Contains: user identity, permissions, expiry. **This is visible to anyone.**

JWT's payload is **not encrypted** and can be decoded by anyone (base64 is not encryption — it's just encoding). However, this is safe because the data is signed, and any tampering can be detected. **Sensitive information should never be stored in the payload.**

### 3. Signature
Generated using:
```
HMAC(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```
**Purpose**: token is not tamperable, comes from the (legitimate) server.

## Types of JWT

1. **JWS (Signed JWT)** — read access; only signed, **not encrypted**. This is the standard/common form.
2. **JWE (Encrypted JWT)** — payload encrypted; used when sensitive data is needed inside the token.

## How JWT authentication works (flow)

1. Client logs in with credentials.
2. Server verifies credentials, generates a JWT (header + payload + signature), and returns it to the client.
3. Client stores the token (memory, or `Authorization` header usage) and sends it with every subsequent request: `Authorization: Bearer <token>`.
4. Server verifies the signature (using the secret/public key) and checks `exp` (expiry) — no DB lookup needed for a valid, unexpired token.
5. If valid → request proceeds with the identity/claims from the payload. If invalid/expired → 401.

## What if you have multiple servers? (horizontal scaling)

This is JWT's headline advantage over server-side sessions: **any server instance can independently verify a token** using the shared secret (HS256) or the public key (RS256) — no shared session store, no Redis lookup, no sticky sessions required. Each server node validates the signature and expiry locally.

## Is Auth Server a SPOF?

The **token-issuing** auth server can become a bottleneck/single point of failure *for logins and token issuance*, but **not for verifying already-issued tokens** — verification is stateless and can happen on any resource server independently. Mitigations: run the auth server itself redundantly (multiple instances behind a load balancer), and keep the signing key(s) available to all verifying services (public key distribution for RS256, or a securely shared secret for HS256) — typically via a **JWKS (JSON Web Key Set) endpoint** that resource servers fetch and cache.

## Security mechanisms

Short-lived access tokens (minutes, not days) to bound the damage window of a stolen token, paired with a longer-lived **refresh token** (stored securely, often httpOnly cookie) to get new access tokens without re-login. Always verify `alg`, `exp`, and (for RS256) validate against the correct key ID (`kid`) from a trusted JWKS source — never trust a client-supplied algorithm blindly.

## JWT vs Session

| | Session-based | JWT-based |
|---|---|---|
| State | Server stores session | Stateless — server stores nothing |
| Revocation | Instant (delete session record) | Hard — must wait for expiry or maintain a denylist |
| Scaling | Needs shared store (Redis) across servers | Any server verifies independently |
| Lookup cost | DB/Redis lookup per request | No lookup — just signature verification |
| Typical use | Traditional server-rendered web apps | APIs, mobile apps, microservices, SPAs |

## Real-world usage

**Common patterns**: short-lived JWT access token + long-lived refresh token (the industry-standard hybrid); JWTs as the access-token format inside OAuth 2.0 / OIDC flows; JWKS-based verification across microservices so no service needs to call a central auth server per-request.

**Production setup checklist**: use RS256 (asymmetric) over HS256 in multi-service systems, short access-token TTL, refresh-token rotation with reuse detection, JWKS endpoint with key rotation, never store sensitive data in the payload, always validate `exp`/`aud`/`iss`.

## Cross-reference

See [../../07-Security/01_authentication_deep_dive.md](../../07-Security/01_authentication_deep_dive.md) and [../../07-Security/02_oauth2_oidc.md](../../07-Security/02_oauth2_oidc.md) (Q12–Q13 cover correct JWT validation code and JWKS caching/key rotation in full depth).
