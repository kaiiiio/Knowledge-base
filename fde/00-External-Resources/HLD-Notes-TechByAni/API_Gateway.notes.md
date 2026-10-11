# API Gateway — Notes (from API_Gateway.pdf)

Source: TechByAni HLD-Notes. Also merged into [../../04-System-Design-HLD/01_hld_building_blocks.md](../../04-System-Design-HLD/01_hld_building_blocks.md).

## Why API Gateway came into existence

**Stage 1 — The Monolith Era (no gateway needed).** Single codebase, one endpoint, simple auth, easy deployment. One service, one URL, one security boundary — a gateway would add no value here.

**Stage 2 — Services started splitting (problems begin).** Once a monolith breaks into microservices (e.g. an e-commerce app: User Service, Cart Service, Order Service, Offer Service), new problems appear:
1. **Too many network calls** — a mobile app makes 4–5 API calls just to load one screen.
2. **Client must know everything** — all service URLs, all API formats, all auth rules.
3. **Security nightmare** — every service re-implements JWT validation, rate limiting, logging, IP filtering → duplicate logic everywhere.
4. **No central control** — no global rate limit, no traffic shaping, no monitoring in one place.
5. **Changing backend breaks clients** — rename one API, the app crashes.

**This is where the API Gateway was born.** Core idea: clients should NOT talk to services directly — introduce a single entry point.

## What it is

An API Gateway is a single entry point for all client requests going to backend services (usually microservices).

| Problem | Solution |
|---|---|
| Multiple endpoints | Single endpoint |
| Repeated auth | Centralized auth |
| No rate limit | Global throttling |
| Chatty APIs | Request aggregation |
| Versioning pain | Central versioning |
| Security leaks | One security wall |

## Core responsibilities

- **Request Routing** — routes by path (`/users`), HTTP method, headers (`x-version`, `x-platform`), query params, user identity, region, canary/A-B rules. Example: `/v1/orders → Order Service v1`, `/v2/orders → Order Service v2`, header `x-beta=true → canary service`.
- **Authentication & Authorization** — handled before the request reaches services: JWT validation, OAuth 2.0, API keys, mTLS. Backend services trust the gateway.
- **Request Validation** — required headers, query params, JSON schema, data types, max length/ranges, Content-Type, API contract. *Gateway validation ≠ business validation (no DB checks here).*
- **Rate Limiting & Throttling** — central point for per-user/per-IP/per-token control. Hard limit (reject after limit) vs soft throttling (slow down). Algorithms: token bucket, leaky bucket, fixed window, sliding window. Example: 100 req/min per user, 10 req/sec per IP.
- **Caching** — gateway-level caching of GET responses / frequently accessed data. Strategies: TTL-based, header-based (Cache-Control), key-based. *Gateway cache ≠ business cache (Redis).*
- **API Aggregation (BFF pattern)** — clients (especially mobile) shouldn't call 5 services and handle failures individually. Gateway calls multiple services, combines responses, returns one payload. Trade-off: fewer network calls, but gateway complexity increases.
- **Request/Response Transformation** — headers, query params, payload fields; e.g. REST → gRPC, XML → JSON, hiding internal field names from the client. Helps: hide internal schema, decouple client from service changes.
- **API Versioning & Compatibility** — gateway routes versions, supports multiple versions simultaneously, helps gradual migrations (`/v1 → legacy service`, `/v2 → new service`).

## Request flow (step by step)

Client sends request → Gateway authenticates → rate limit check → request validation → route to service → retry/timeout handling → response transformation → caching (optional) → response to client.

## Failure handling

- **Timeouts** — protect clients from slow services.
- **Retries** — safe for idempotent requests (GET).
- **Fallbacks** — return cached or default responses.

## Security at the gateway

SSL termination, JWT validation, API keys, IP whitelisting, WAF (SQLi, XSS) — handled at the gateway so services stay clean and simple.

## Performance

**Pros**: reduced client complexity, caching, aggregation.
**Cons**: extra network hop, potential bottleneck.
**Mitigations**: horizontal scaling, stateless gateways, CDN integration.

## Common anti-patterns

- ❌ Putting business logic in the gateway
- ❌ Over-aggregating responses
- ❌ Single gateway without scaling
- ❌ No timeout/retry limits

## Popular implementations

**Cloud-managed**: AWS API Gateway, Azure API Management, GCP API Gateway.
**Open source**: Kong, NGINX, Traefik, Spring Cloud Gateway, Envoy.

## Is API Gateway a Single Point of Failure (SPOF)?

**Logically single ≠ physically single.** An API Gateway is a logical single entry point, but is never deployed as a single machine.

How it's designed NOT to be a SPOF:
1. **Horizontal scaling (stateless)** — gateways are stateless and horizontally scalable; multiple gateway instances sit behind a load balancer.
2. **Managed gateways** (e.g. AWS API Gateway) — run across multiple AZs, auto-scale, no single server.
3. **Redundancy across Availability Zones.**
