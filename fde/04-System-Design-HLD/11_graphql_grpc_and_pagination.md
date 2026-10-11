# GraphQL, gRPC, and Pagination Strategies

> Module: System Design (HLD) | Level: Senior | FDE Prep Phase 4
> Added to close a gap found while cross-referencing this KB against TechByAni's HLD-Notes (L8_GraphQL, graphql_pagination, grpc_notes, L11_REST_Paging).

## 1. REST vs GraphQL vs gRPC — pick the right tool

| | REST | GraphQL | gRPC |
|---|---|---|---|
| Contract | Loose (OpenAPI optional) | Strict schema (SDL), self-documenting | Strict (.proto), code-generated clients |
| Transport | HTTP/1.1 or 2, JSON | HTTP, JSON (usually) | HTTP/2, Protobuf (binary) |
| Over/under-fetching | Common — fixed shape per endpoint | Solved — client asks for exact fields | N/A — RPC calls, not resource shapes |
| Best for | Public APIs, simple CRUD, caching via HTTP semantics | Client-driven UIs with nested/varied data needs (mobile, multiple frontends) | Service-to-service internal calls, low-latency, streaming |
| Caching | Free (HTTP caching, CDNs, ETags) | Hard — POST-based, needs field-level caching (Apollo/Relay normalized cache) | N/A — not resource-oriented |
| Streaming | No (SSE/WebSocket bolt-on) | Subscriptions (usually WS) | Native (unary, server-stream, client-stream, bidi-stream) |
| Interview signal | "I'd default here unless a specific problem argues otherwise" | "Client aggregates many resources with different shapes" | "Two of my own services need fast, typed, high-throughput calls" |

**The honest default**: REST for anything public-facing or cache-friendly; GraphQL when the client (especially multiple clients — web + mobile) needs different slices of the same graph of data; gRPC for internal service-to-service calls where you control both ends and want speed + strict typing over human-readability.

## 2. GraphQL — the interview-relevant internals

### N+1 is the #1 GraphQL interview question
A naive resolver for `posts { author { name } }` runs one query for posts, then **one query per post** for its author — classic N+1, invisible in REST because REST doesn't let you nest arbitrarily.

**Fix: DataLoader (batching + per-request caching)**
```ts
const userLoader = new DataLoader(async (ids) => {
  const users = await db.user.findMany({ where: { id: { in: ids } } });
  const byId = new Map(users.map(u => [u.id, u]));
  return ids.map(id => byId.get(id)); // MUST return in the same order as ids
});

// resolver: author: (post) => userLoader.load(post.authorId)
```
DataLoader collects all `.load()` calls made in the same tick, fires **one** batched query, and caches per-request so the same ID is never fetched twice in one operation.

### Schema design traps interviewers probe
- **Over-permissive queries**: a client can request an arbitrarily deep/wide query (`friends { friends { friends { ... } } }`) — this is a DoS vector unique to GraphQL. Mitigate with **query depth limiting**, **query cost analysis** (assign a cost per field, reject over budget), and persisted queries (client sends a hash, server has a pre-approved allowlist — killing arbitrary queries in production entirely).
- **Nullability**: every field is nullable by default; `!` (non-null) is a promise that if it breaks, the **entire parent object becomes null** (null propagates up until it hits a nullable ancestor). Overusing `!` makes one flaky field take down large chunks of the response.
- **Versioning**: GraphQL avoids REST's `/v1/` churn by **deprecating fields** (`@deprecated(reason: "...")`) instead of versioning endpoints — additive evolution, not breaking versions.

### Mutations and errors
- Mutations should return the **mutated object plus any changed related data** the client's cache needs to update (Relay/Apollo normalize by ID — return enough to patch the cache without a refetch).
- Errors are **200 OK with an `errors` array** alongside `data` (partial success is normal) — REST's HTTP-status-as-error-signal doesn't map cleanly; this trips up people who assume 4xx/5xx semantics.

## 3. GraphQL Pagination

The headline point to state first: **GraphQL doesn't invent new pagination strategies — it just standardizes how you wrap the same offset/cursor techniques inside a query contract.** Two patterns cover almost everything.

### 3.1 Offset/page-based (the simple option)

```graphql
type ProductPage {
  items: [Product!]!
  totalItems: Int
  totalPages: Int
  hasMore: Boolean!
}
type Query {
  productsOffset(page: Int, size: Int): ProductPage
}
```
```sql
SELECT * FROM products ORDER BY created_at OFFSET :offset LIMIT :size;
```
**Pros**: easy to implement, supports jump-to-page UIs ("go to page 7"), fine for dashboards/admin tables.
**Cons**: same offset-pagination problems as REST — deep offsets get slow (DB still scans and discards skipped rows), and concurrent inserts/deletes shift the window, causing duplicate or skipped items between page loads.

### 3.2 Cursor pagination — the "Connection" pattern (GraphQL-idiomatic, Relay spec)

Instead of returning a plain array, you return a **Connection** object — a specific wrapper shape that exists for a real reason, not just convention:

```graphql
type ProductConnection {
  edges: [ProductEdge!]!
  pageInfo: PageInfo!
  totalCount: Int          # optional
}
type ProductEdge {
  node: Product!            # the actual item you care about
  cursor: String!           # opaque pointer to THIS node's position
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

**Why wrap `node` in an `edge` instead of returning `[Product!]!` directly?** Two reasons:
1. Each item needs its **own cursor** — a per-item pointer the client hands back to ask "give me what comes after this one." That cursor isn't a field of `Product` itself; it's metadata about *this item's position in this particular query's ordering*.
2. The `edge` is also the right place for **edge-specific data that isn't a property of the node** — e.g., a `rank` or `matchScore` that only makes sense in the context of *this* connection (a product's search-relevance score is a fact about the query, not a fact about the product).

**Forward pagination**:
```graphql
query {
  products(first: 5, after: "eyJjcmVhdGVkQXQiOjE2OTU4MDg4MDAwMDAsImlkIjoxMjd9") {
    edges { node { id name } cursor }
    pageInfo { hasNextPage endCursor }
  }
}
```

**Backward pagination** (Relay spec defines both directions symmetrically):
```graphql
query {
  products(last: 5, before: "eyJjcmVhdGVkQXQiOjE2OTU4MDg4MDAwMDAsImlkIjoxMjd9") {
    edges { node { id name } cursor }
    pageInfo { hasPreviousPage startCursor }
  }
}
```

**What the opaque cursor actually contains** (base64-decoded, server-side only):
```json
{ "createdAt": 1695808800000, "id": 127, "sort": "createdAt_desc", "filters": {} }
```
The server decodes it, validates it, and translates it into a **keyset query** — the exact same `WHERE (created_at, id) < (:cursorCreatedAt, :cursorId) ORDER BY created_at DESC, id DESC LIMIT :first` seek pattern used in REST cursor pagination. Encoding the sort/filters into the cursor also lets the server **reject a cursor if the client changes filters mid-pagination** (the decoded sort won't match the new query, so the server can 400 instead of silently returning a nonsensical page).

**`hasNextPage` without a separate COUNT query**: fetch `first + 1` rows; if you got one more row than requested, `hasNextPage = true` and you drop the extra row before returning.

**Pros**: consistent under concurrent inserts/deletes (no shifting-window problem), fast (index seek, not a scan), and the edge wrapper gives you a place for per-item pagination metadata.
**Cons**: no native jump-to-page (cursors are positional, not addressable by page number), cursors must be passed back exactly as received (opaque — don't construct or parse them client-side).

**Same idea, REST flavor**: `GET /posts?cursor=eyJpZCI6MTAwfQ==&limit=20` — identical mechanism, just not wrapped in the Relay connection spec. State this equivalence in interviews: **cursor pagination is a general pattern, not a GraphQL-only feature** — REST APIs should use it too for the same reason (offset pagination degrades at scale in both worlds).

**When to pick which**: offset/page for admin tables and small-to-medium lists where jump-to-page matters; cursor/Connection for infinite scroll, feeds, and anything under concurrent writes — which is most consumer-facing lists.

## 4. gRPC — the interview-relevant internals

### What RPC actually is, and why gRPC exists

**RPC (Remote Procedure Call)** is the general idea of calling a function that runs on a *different* machine while it looks, in your code, like an ordinary local function call. `const balance = await getAccountBalance(userId)` — for the caller this reads exactly like a local function; underneath, the RPC framework opens a connection, serializes the arguments, sends them to a remote server, waits for the result, deserializes it, and hands it back. The framework's whole job is to **hide the network** (sockets, addresses, serialization) behind a function-call illusion.

This isn't new — older RPC systems (Java RMI, XML-RPC, SOAP/CORBA) did the same thing but were slow, verbose (XML payloads), and painful to evolve. **gRPC** is Google's modern take: HTTP/2 for transport and **Protobuf** for the wire format, which is what actually makes it fast — not a new idea, a much better implementation of an old one.

**Polyglot by design**: the `.proto` contract auto-generates client and server code in many languages — your Node.js `OrderService` client can call a Go `InventoryService` server with neither side hand-writing the network plumbing, and both sides get compile-time-checked types from the same source of truth.

### Why it's fast
- **HTTP/2** multiplexes many calls over one TCP connection (no head-of-line blocking at the app layer like HTTP/1.1's connection-per-request pattern).
- **Protobuf** is a compact binary format with a schema (`.proto`) — smaller payloads and faster (de)serialization than JSON, at the cost of not being human-readable on the wire (need `grpcurl`/reflection to debug).

### The four call types
```proto
service OrderService {
  rpc GetOrder(OrderId) returns (Order);                       // unary — like a normal REST call
  rpc StreamOrderUpdates(OrderId) returns (stream Status);     // server streaming — live status feed
  rpc UploadEvents(stream Event) returns (Ack);                // client streaming — batch upload
  rpc Chat(stream Message) returns (stream Message);           // bidirectional streaming
}
```
Server-streaming is the gRPC equivalent of "give me an SSE feed but typed and binary" — a strong answer when asked "how would you push live updates between two of your own services without polling."

### Where it fits vs REST/GraphQL in a system design answer
> "For the public API, browser clients, and anything I want a CDN to cache — REST or GraphQL. Between our own internal services — say the order service calling the inventory service — gRPC, because both ends are code I control, I want compile-time-checked contracts via the `.proto`, and the binary framing plus HTTP/2 multiplexing matters at that call volume. I would not put gRPC in front of a browser directly (browsers can't speak native gRPC — needs grpc-web + a proxy translating to HTTP/1.1-friendly transport)."

### Deadlines and cancellation (the concept interviewers dig into)
gRPC calls carry an explicit **deadline** propagated through the call chain — if service A calls B calls C with a 500ms deadline, C should stop work and return early once the deadline passes, rather than B waiting the full timeout only to receive a now-useless response. Contrast with REST, where timeout enforcement is usually per-hop and not automatically propagated — a design smell interviewers want you to name when discussing resilience across a call chain.

## 5. One-paragraph answer if asked "compare REST, GraphQL, and gRPC"

> "They solve different mismatches. REST solves 'expose resources over HTTP with cacheable, human-debuggable semantics' — my default for public/CRUD APIs. GraphQL solves 'the client's data shape doesn't match any single resource' — one query instead of chaining multiple REST calls or over-fetching a fixed shape, at the cost of losing HTTP caching and taking on N+1 risk that DataLoader has to solve. gRPC solves 'two services I control need fast, strictly-typed calls, possibly streaming' — HTTP/2 plus Protobuf beats JSON-over-HTTP/1.1 for internal high-volume traffic, but it's the wrong choice facing a browser directly. In one system I'd realistically use all three: REST/GraphQL at the edge, gRPC between backend services."
