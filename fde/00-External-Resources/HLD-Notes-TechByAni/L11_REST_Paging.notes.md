# REST Pagination — Notes (from L11_REST_Paging.pdf)

Source: TechByAni HLD-Notes. Also merged/cross-referenced in [../../04-System-Design-HLD/11_graphql_grpc_and_pagination.md](../../04-System-Design-HLD/11_graphql_grpc_and_pagination.md).

## Why pagination

APIs often return large datasets (all orders, all products, all posts). If the API dumps everything in one response: too slow (takes time to fetch), too heavy (wastes bandwidth), too costly (server load increases).

**Solution → break data into pages** (like a book or search results). In short: pagination = splitting large results into smaller, manageable chunks.

**Why it matters**: performance (faster responses, less memory usage), user experience (don't overload users with 10,000 results at once), cost (saves bandwidth and API costs — some APIs charge per call/data size), control (lets client apps choose how much data to fetch).

## Offset + Limit (page-based pagination)

Most common, especially in SQL-based systems.

```
GET /products?page=3&limit=20        (page style)
GET /products?limit=20&offset=40     (offset style)
-- page 3 ↔ offset = (3-1)*20 = 40
```

```sql
SELECT id, name, price
FROM products
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 40;
```

**Response shape (good practice)**:
```json
{
  "data": [ /* 20 products */ ],
  "pagination": {
    "type": "offset",
    "page": 3,
    "limit": 20,
    "total_items": 1243,
    "total_pages": 63,
    "next": "/products?page=4&limit=20",
    "prev": "/products?page=2&limit=20"
  }
}
```

**Pros**: easy to implement & debug, supports jump-to-page UIs ("page 17"), most ORMs support `.limit().offset()`, great for small/mostly-static lists (admin tables, reports).

**Cons**: deep offsets are slow (DB still scans/steps past skipped rows), inconsistent under writes (inserts/deletes before your offset shift rows → duplicates/missing items), expensive to return exact total counts on huge tables.

**Best practices**:
- Cap `limit` (e.g. max 100).
- Avoid deep offsets — forbid `offset > 10k`, or switch to cursor after page N.
- Compute `has_more` via `LIMIT (limit+1)` — don't `COUNT(*)` every time.
- Cache `total_items`, or return an "estimated_total."

**When to use**: small/medium lists, mostly read-only data during a session, when jump-to-page is required.

## Cursor-based pagination (opaque token)

Instead of an offset, the API returns a **cursor** (base64 or signed token) — like a bookmark.

```
GET /products?limit=20&cursor=eyJjcmVhdGVkQXQiOjE3MTYzMDAwMDAwMDAsImlkIjo1MDB9
```

**Token contents (server-side)**:
```json
{ "createdAt": 1716300000000, "id": 500,
  "filters": { "q": "phone", "brand": "Acme" },
  "sort": "createdAt.desc,id.desc" }
```
Include sort + filters used to create the cursor → reject the cursor if the client changes them.

**Good practice**: opaque + signed (HMAC) so clients can't forge cursors; include expiry in the cursor if data moves fast; implement reverse pagination by generating a `previous_cursor` and using `>` vs `<` with reversed order.

```sql
SELECT id, name, price, created_at
FROM products
WHERE (created_at, id) < (:cursor_created_at, :cursor_id)
ORDER BY created_at DESC, id DESC
LIMIT :limit;
```

**Response**:
```json
{
  "data": [ /* 20 products */ ],
  "pagination": {
    "type": "cursor",
    "limit": 20,
    "next_cursor": "eyJjcmVhdGVkQXQiOjE3MTYzMDAwMDAwMDAsImlkIjo1MDB9",
    "has_more": true
  }
}
```

**Pros**: consistent with concurrent inserts/deletes, fast (seek via index), hides internal keys (token can be signed/expiring), you can tuck filters/sort inside the token for validation.
**Cons**: needs encoding/decoding + signing, harder to support jump-to-page, tokens are tied to a particular sort — must return 400 if the sort/filters change.

## Keyset (seek) pagination

Paginate by values, not positions: "give me items after this key."
```
GET /products?limit=20&after_id=500&after_ts=1716300000000
```
This is the same underlying idea as cursor pagination, just with the key exposed in plain query params instead of wrapped in an opaque token.

## Time-window pagination (temporal slices)

Page by time ranges — great for logs/analytics.
```
GET /events?start=2025-04-01T00:00:00Z&end=2025-04-01T01:00:00Z&limit=1000
```

## Summary — when to use which

| Strategy | Best for |
|---|---|
| Offset/limit | Small/medium lists, admin tables, jump-to-page needed |
| Cursor (opaque token) | Infinite scroll, feeds, anything under concurrent writes |
| Keyset (seek) | Same as cursor, but with plain/visible key params |
| Time-window | Logs, analytics, event streams |
