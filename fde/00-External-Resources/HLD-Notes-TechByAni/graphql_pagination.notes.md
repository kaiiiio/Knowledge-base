# GraphQL Pagination — Notes (from graphql_pagination.pdf)

Source: TechByAni HLD-Notes. Also merged into [../../04-System-Design-HLD/11_graphql_grpc_and_pagination.md](../../04-System-Design-HLD/11_graphql_grpc_and_pagination.md).

## The question

REST offset/cursor pagination — done. But how do you paginate GraphQL APIs?

**In GraphQL we still use those same strategies** — GraphQL just standardizes the query/contract shape around them. Two common approaches:
1. **Simple list (offset/limit)** — familiar, good for dashboards.
2. **Connections (cursor-based)** — GraphQL-idiomatic, correct for infinite scroll, robust under writes.

## Offset/page-based GraphQL

```graphql
type ProductPage {
  items: [Product!]!
  totalItems: Int
  totalPages: Int
  hasMore: Boolean!
  prevPage: Int
}
type Query {
  productsOffset(page: Int, size: Int): ProductPage
}
```

```sql
SELECT * FROM products ORDER BY created_at OFFSET :offset LIMIT :size;
```

```graphql
query {
  productsOffset(page: 2, size: 5) {
    items { id name createdAt }
    hasMore
    prevPage
  }
}
```

**Pros**: easy, supports jump-to-page. **Cons**: duplicates/skips under writes, deep offsets are slow, total count is expensive.

Example response:
```json
{
  "data": {
    "items": [
      { "id": "195", "name": "Product 195", "createdAt": "2025-04-27T10:12:00.000Z" },
      { "id": "192", "name": "Product 192", "createdAt": "2025-04-27T10:12:00.000Z" }
    ],
    "hasMore": true,
    "prevPage": 1
  }
}
```
Trick to compute `hasMore`: fetch one extra record beyond the requested size; if the extra record exists, set `hasMore = true` and drop it before returning.

## Cursor-based pagination (the "Connection" pattern)

Instead of returning a plain array from a query, you return a **Connection object** — an array of **edge** objects, each wrapping the actual node plus a cursor for that node.

**Node** — the real data item you actually care about (a `Product`, `Post`, `User`, etc.). When you query `edges { node { name } }`, the node is exactly `Product`.

**Edge** — a wrapper around the node that carries extra metadata: its cursor (so the client can ask "give me items after/before this node"), and potentially other per-item extras like a `rank` or `matchScore` that's a fact about *this query*, not about the product itself.

```graphql
type ProductConnection {
  edges: [ProductEdge!]!         # array of edges, each with a node + cursor
  pageInfo: PageInfo!            # pagination metadata
  totalCount: Int                # optional
}
type ProductEdge {
  node: Product!                 # actual product
  cursor: String!                # opaque cursor for this product
}
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

**Query (forward pages)**:
```graphql
query {
  products(first: 5, after: "cursorToken") {
    edges {
      node { id name }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Query (backward pages)**:
```graphql
query {
  products(last: 5, before: "cursorToken") {
    edges {
      node { id name }
      cursor
    }
    pageInfo {
      hasPreviousPage
      startCursor
    }
  }
}
```

## What the cursor actually is

An opaque token (usually base64-encoded) that encodes the last-seen key(s), and sometimes filters/sort, e.g. (before encoding):
```json
{ "createdAt": 1695808800000, "id": 127, "sort": "createdAt_desc", "filters": {} }
```
The server decodes and validates the cursor, then translates it into a **keyset query**:
```sql
WHERE (created_at, id) < (:cursor_created_at, :cursor_id)
ORDER BY created_at DESC, id DESC
LIMIT :first;
```

Example encoded cursor value: `products(first: 5, after: "eyJjcmVhdGVkQXQiOjE2OTU4MDg4MDAwMDAsImlkIjoxMjd9")`.

## Pros / Cons

**Pros**: consistent under concurrent inserts/deletes (no shifting-window problem like offset pagination), the edge lets you attach edge-specific data (e.g. rank, score).
**Cons**: no native jump-to-page, cursors must be treated as opaque — clients shouldn't construct or parse them.
