# Twitter Timeline System: Visual Diagrams

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│          User Tweets                                     │
│  (Justin Bieber tweets)                                 │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│      Timeline Service                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Check: Follower count > 1M?                      │  │
│  └──────────┬───────────────────────────────────────┘  │
│             │                                           │
│    ┌────────┴────────┐                                  │
│    │                 │                                  │
│    ▼                 ▼                                 │
│ ┌─────────┐     ┌─────────┐                            │
│ │ Push    │     │ Pull    │                            │
│ │ (Fans)  │     │ (Celeb) │                            │
│ └─────────┘     └─────────┘                            │
└──────────┬──────────────────┬───────────────────────────┘
           │                  │
           ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│ Fan Timelines    │  │ Celebrity Cache  │
│ (Pre-computed)   │  │ (On-demand)     │
│ PostgreSQL       │  │ Redis            │
└──────────────────┘  └──────────────────┘
```

## Data Flow: Push Model

```
Regular User Tweets (10,000 followers)
    │
    ├─→ Create tweet in database
    │
    ├─→ Get all followers (10,000)
    │
    ├─→ Batch insert into timelines
    │   ├─→ Batch 1: 1,000 timelines
    │   ├─→ Batch 2: 1,000 timelines
    │   ├─→ ...
    │   └─→ Batch 10: 1,000 timelines
    │
    └─→ Result: All followers see tweet in timeline
```

## Data Flow: Pull Model

```
Celebrity Tweets (100M followers)
    │
    ├─→ Create tweet in database
    │
    ├─→ Store in Redis cache
    │   └─→ Key: "celebrity:user_123:tweets"
    │       Value: Sorted set by timestamp
    │
    └─→ Result: Tweet stored, fetched on-demand when user views timeline
```

## Timeline Fetch Flow

```
User Requests Timeline
    │
    ├─→ Get regular users' tweets (from database)
    │   └─→ Pre-computed, fast query
    │
    ├─→ Get celebrities followed
    │
    ├─→ Fetch celebrity tweets (from Redis)
    │   └─→ On-demand fetch
    │
    ├─→ Merge and sort by timestamp
    │
    └─→ Return timeline
```

## Comparison: Push vs Pull

```
Push Model (Regular Users):
├─ Write: Insert into N timelines (slower)
├─ Read: Query database (faster)
└─ Use: < 1M followers

Pull Model (Celebrities):
├─ Write: Store in cache (faster)
├─ Read: Fetch from cache (slower, but acceptable)
└─ Use: > 1M followers
```

## Scaling Strategy

```
Initial: 1 database, 1 Redis
    ↓
Scale: Database replicas, Redis cluster
    ↓
Result: Handles millions of users, 100M+ followers
```

