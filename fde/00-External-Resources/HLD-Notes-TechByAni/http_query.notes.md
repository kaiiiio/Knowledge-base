# The HTTP QUERY Method — Notes (from http_query.pdf)

Source: TechByAni HLD-Notes. RFC 10008, June 2026 — a genuinely new HTTP method.

## The problem that existed for 30+ years

Suppose an e-commerce search: filter by category, price, stock status, ratings, availability, nested filters. Now the frontend request becomes something like:
```
GET /products?category=shoes&price_min=1000&price_max=5000&rating=4&inStock=true&color=red&color=blue&...
```
This becomes hard to read, difficult to generate, and sometimes exceeds URL length limits imposed by browsers, servers, or gateways. Caching also becomes messy at that complexity.

## Why not just send a JSON body with GET?

Looks tempting:
```
GET /products
{ "minPrice": 5000, "category": "shoes" }
```
Unfortunately: **HTTP never defined semantics for a GET request body.** Different software behaves differently — some servers accept it, others strip it or reject it, proxies remove it, firewalls block it, some clients don't understand it at all. Because of this, GET-with-a-body never became interoperable. The HTTP working group won't redefine GET to support a body, because that would break decades of existing infrastructure.

## So everyone started using POST instead

People wrote `POST /products/search` with the filters in a JSON body instead of `GET /products?...lots of filters...`. **Every major API does this** — examples include Elasticsearch, countless REST APIs, and internal enterprise APIs.

## Why POST is not the right solution

The server *searches*. No resource is created. No update happens. So logically this is a **read operation**. But HTTP semantics say POST means "process this request" — processing can mean create resources, modify resources, trigger actions, send emails, charge credit cards. **POST is not safe. POST is not idempotent.** HTTP infrastructure therefore assumes: *this request might change server state* — even when, in this case, it doesn't.

## What exactly is QUERY?

QUERY is a request method — but with **GET's read-operation semantics (safe, idempotent) combined with the ability to carry a request body, like POST.** So QUERY is essentially: **GET semantics + POST's request body.**
```
QUERY /products
{ "minPrice": 5000, "category": "shoes" }
```

## Why didn't they simply improve/repurpose POST?

Because **HTTP methods carry meaning, not just syntax.** If every read request uses POST, an intermediary (proxy, cache, gateway) cannot know: is this only searching? Can I retry it safely? Can I prefetch it? It becomes ambiguous. **QUERY makes the intent explicit.**

## Key properties of QUERY

### Safe
QUERY is officially **safe** — it should not intentionally change server state, exactly like GET.
```
QUERY /search      → filter, analytics query, report generation — all allowed
```
Not allowed under QUERY: create user, delete product, update order — those remain POST/PUT/DELETE's job.

### Idempotent
QUERY is also idempotent — calling it 100 times has the same effect as calling it once, because nothing changes. This makes **automatic retries** safe (a proxy or client can retry a failed QUERY without any risk of a double side-effect).

### Cacheable
**QUERY responses can be cached — this is huge.** POST responses are generally not treated as cacheable by default. QUERY explicitly supports caching by incorporating the request body into the cache key.

### Request Body
QUERY supports multiple body formats: JSON (`{"category": "shoes", ...}`), XML (`<Search>...</Search>`), form-encoded, Protocol Buffers — almost any content type, declared via `Content-Type`.

### URI stays clean
Instead of `GET /products?category=...&price_min=...&price_max=...&rating=...` (long, ugly URL), you get:
```
QUERY /search
{ filters as a structured body }
```
Much cleaner.

## Does QUERY replace GET?

No. Use `GET` whenever parameters are simple — `GET /users/10`, `GET /orders/100`. GET remains the right choice for simple, read-only, parameter-light lookups. QUERY is for complex, structured read queries.

## Does QUERY replace POST?

No. POST still handles resource creation, workflows, webhooks — genuine mutations/actions. **QUERY only replaces the specific misused pattern**: `POST /search` when POST is actually being used for a read.

## New `Accept-Query` header

Servers can advertise which query body formats they support using the `Accept-Query` response header. Clients can inspect it to know which content types are accepted for QUERY on that endpoint.

## Status codes

QUERY uses normal HTTP response codes: `200 OK`, `204 No Content` (empty result set), `400 Bad Request`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error` — same vocabulary as any other method.

## Current adoption

The standard is new (**RFC 10008, June 2026**) — ecosystem support is still emerging. Expect adoption to roll out gradually across browsers, API frameworks, and gRPC-adjacent client libraries. Many existing APIs will continue using `POST /search` for a while because of this.

## Should you use QUERY today?

For new **internal** work, it's worth tracking whether your framework and infrastructure support it. For **public production APIs**, `POST /search` remains the most interoperable choice today, unless your entire stack (client, server, CDN, gateway) supports QUERY. Over the next few years, QUERY is expected to become the semantically-correct standard for complex, read-only operations as tooling catches up.

## Cross-reference

Complements [../../04-System-Design-HLD/11_graphql_grpc_and_pagination.md](../../04-System-Design-HLD/11_graphql_grpc_and_pagination.md) — GraphQL queries and gRPC unary calls never had this GET-vs-POST dilemma, because both protocols were designed from day one with a body-carrying "read" request as the default. QUERY is HTTP/REST finally catching up to a problem GraphQL and gRPC sidestepped entirely by design.
