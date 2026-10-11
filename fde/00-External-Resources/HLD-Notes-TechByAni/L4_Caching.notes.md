# Caching — Notes (from L4_Caching.pdf)

Source: TechByAni HLD-Notes.

## What is caching?

Storing frequently accessed data, or data which takes a lot of time to compute, in a **faster storage (RAM)**.

```
Client ⇄ Server ⇄ DB (permanent storage, disk-based, slow)
                ⇕
              Cache (temporary storage)
```

**Cache properties**: TTL (Time To Live) to stay fresh; it's in RAM (volatile, small, expensive); rebuild anytime from the DB. **Examples**: Redis, Memcached.

## Cache Invalidation — how to update?

Scenario: some data in cache (e.g. a profile pic) changes in the DB — how does the cache learn about it?

### Time-to-Live (TTL / Expiry-based)
Set an expiry time on the cache entry. **Simple**, but data may be stale — so not perfect. **Use case**: product catalog, profile pictures.

### Write-through
Data is written **at the same time** to both DB and cache.
```
Client → Server → DB
             ↘→ Cache
```
**Consistency guaranteed. Slower writes** (two writes per request). **Use case**: account balances.

### Write-around
Writes go to the **DB only**, not the cache. Cache updates lazily — only "when read happens."
```
Client → Server → DB
                    ↘ (cache updates when read happens) → Cache
```

### Write-back (Write-behind)
Writes go to the **cache first**, then the DB is updated **asynchronously**, later.
```
Client → Server → Cache —asynchronously→ DB
```
**Fast writes.** **Data loss risk** if the cache crashes before syncing to the DB. **Use case**: logging systems (where losing a few recent log lines is acceptable in exchange for write speed).

## Cache eviction — what to remove when the cache gets full?

### FIFO (First-In-First-Out)
Evict in the order items were added, regardless of usage — the oldest inserted item goes first.

### LRU (Least Recently Used)
Removes the item that hasn't been used for the longest time — tracks the *last accessed* timestamp per item and evicts the one accessed longest ago.

### LFU (Least Frequently Used)
Tracks an access-frequency counter per item and evicts the item with the **lowest frequency count** — not the oldest or least-recently-touched, but the least-*often*-touched overall.

## CDN (Content Delivery Network)

A network of geographically distributed servers that cache and deliver content (images, videos, JS, CSS, API responses) to users from the **nearest** server.

**Popular CDNs**: Akamai, Cloudflare, AWS CloudFront.

```
User (India) ⇄ CDN (nearby edge node)
                 ↕ if not in CDN, fetch from origin
              Server (USA)
```

## Client-side caching

Caching that happens **on the client** (browser, mobile app, desktop app) rather than on the server.

**Mechanisms**: Browser/HTTP caching, LocalStorage, App/Mobile cache.

**Good for**: read-heavy apps, offline support, reducing latency. **Combine with** server-side caching and CDNs for a full picture.

## Cross-reference

See [../../04-System-Design-HLD/01_hld_building_blocks.md](../../04-System-Design-HLD/01_hld_building_blocks.md) for caching patterns + stampede protection (locks, XFetch, request coalescing) in more depth, and the Express KB's [07_caching_layer/](../../../express-backend-knowledge-base/07_caching_layer/) for Redis-specific implementation.
