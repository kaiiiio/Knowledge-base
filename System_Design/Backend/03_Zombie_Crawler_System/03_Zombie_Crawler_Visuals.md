# Zombie Crawler: Visual Diagrams

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Crawler Process                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Worker 1, Worker 2, Worker 3 (Concurrent)      │  │
│  └──────────┬───────────────────────────────────────┘  │
└─────────────┼────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│          Redis                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Queue: List of URLs to crawl                      │  │
│  │ Key: "crawler:queue"                              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Visited: Set of crawled URLs                      │  │
│  │ Key: "crawler:visited"                           │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Rate Limit: Domain access timestamps             │  │
│  │ Key: "crawler:rate_limit:domain.com"            │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ State: Crawler progress                          │  │
│  │ Key: "crawler:state"                            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────┬────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│          HTTP Client                                     │
│  (Fetch URLs)                                            │
└─────────────┬────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│          Storage (File System / Database)                │
│  (Save crawled content)                                  │
└─────────────────────────────────────────────────────────┘
```

## Crawling Flow

```
Seed URL: https://docs.example.com
    │
    ├─→ Add to Queue
    │
    ├─→ Worker pops URL
    │
    ├─→ Check Visited Set
    │       │
    │       ├─→ Already visited? → Skip ✅
    │       │
    │       └─→ Not visited? → Continue
    │
    ├─→ Check Rate Limit (domain: example.com)
    │       │
    │       ├─→ Last access < 1 second ago? → Wait
    │       │
    │       └─→ OK? → Continue
    │
    ├─→ Mark as Visited (add to Set)
    │
    ├─→ Fetch URL (HTTP GET)
    │
    ├─→ Extract Links
    │       │
    │       ├─→ Link 1: https://docs.example.com/page-a
    │       ├─→ Link 2: https://docs.example.com/page-b
    │       └─→ Link 3: https://docs.example.com/page-c
    │
    ├─→ Add Links to Queue (if not visited)
    │
    ├─→ Save Content
    │
    └─→ Update Rate Limit Timestamp
```

## Deduplication Flow

```
URL: https://docs.example.com/page-a
    │
    ├─→ Normalize URL
    │       └─→ Remove hash, trailing slash
    │       └─→ Result: https://docs.example.com/page-a
    │
    ├─→ Check Visited Set
    │       │
    │       ├─→ Exists? → Skip (already crawled)
    │       │
    │       └─→ Not exists? → Add to Set, crawl
    │
└─→ Even if linked 1,000 times, only crawls once
```

## Rate Limiting Flow

```
Domain: example.com
    │
    ├─→ Check Last Access Time
    │       │
    │       ├─→ Last access: T=0ms
    │       │   Current time: T=500ms
    │       │   Difference: 500ms < 1000ms → Wait 500ms
    │       │
    │       └─→ Last access: T=0ms
    │           Current time: T=1500ms
    │           Difference: 1500ms >= 1000ms → OK, proceed
    │
    ├─→ Crawl URL
    │
    └─→ Update Last Access Time = Current Time
```

## Resumability Flow

```
Crawler Running
    │
    ├─→ Save State (every 1 minute)
    │       └─→ Queue length, visited count, stats
    │
    ├─→ Crash (kill -9)
    │
    ├─→ Restart Crawler
    │
    ├─→ Load State
    │       └─→ Queue: 1,000 URLs remaining
    │       └─→ Visited: 5,000 URLs
    │
    └─→ Resume from Queue
            └─→ Continues where it left off
```

## State Persistence

```
Redis State:
├─ Queue: ["url1", "url2", "url3", ...]
├─ Visited: Set("url1", "url2", "url3", ...)
├─ Rate Limit: { "example.com": 1234567890 }
└─ State: {
    timestamp: 1234567890,
    stats: { crawled: 5000, skipped: 100, errors: 5 },
    queueLength: 1000,
    visitedCount: 5000
}
```

## Concurrent Workers

```
Queue: [url1, url2, url3, url4, url5, ...]

Worker 1: Pop url1 → Crawl → Extract links → Add to queue
Worker 2: Pop url2 → Crawl → Extract links → Add to queue
Worker 3: Pop url3 → Crawl → Extract links → Add to queue

All workers process concurrently, respecting rate limits
```

## Graceful Shutdown

```
SIGTERM/SIGINT Received
    │
    ├─→ Set isRunning = false
    │
    ├─→ Workers finish current URL
    │
    ├─→ Save final state
    │
    ├─→ Close Redis connection
    │
    └─→ Exit gracefully
```

