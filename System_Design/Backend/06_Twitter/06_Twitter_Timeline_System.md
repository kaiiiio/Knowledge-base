# Twitter Timeline System: Complete System Design

## Problem Statement

**Context**: Building Twitter. Need to implement Timeline (News Feed).

**Constraints**:
- User A follows User B
- When User B tweets, it must show in User A's feed
- User B is celebrity (Justin Bieber) with 100 Million followers

**Problem**: If Justin Bieber tweets, inserting into 100M users' timelines individually would:
- Take hours to complete
- Crash database
- Poor user experience

**Task**: Architect efficient timeline system.

---

## Solution Architecture: Hybrid Push + Pull

```
User Tweets → Timeline Service → Check Follower Count
                                    │
                        ┌───────────┴───────────┐
                        │                       │
                    < 1M followers          > 1M followers
                        │                       │
                        ▼                       ▼
                    Push Model              Pull Model
                (Pre-compute)            (On-demand)
                        │                       │
                        ▼                       ▼
                Fan Timelines            Celebrity Cache
                (Database)                (Redis)
```

**Key Components**:
1. **Push Model**: Pre-compute timelines for regular users (< 1M followers)
2. **Pull Model**: Store in cache, fetch on-demand for celebrities (> 1M followers)
3. **Hybrid**: Best of both worlds

---

## Implementation

### 1. Tweet Creation

```javascript
app.post('/tweets', async (req, res) => {
    const { content, userId } = req.body;
    
    // Create tweet
    const tweet = await Tweet.create({
        content,
        userId,
        createdAt: new Date()
    });
    
    // Get follower count
    const followerCount = await Follower.count({
        where: { followingId: userId }
    });
    
    if (followerCount < 1000000) {
        // Push model: Insert into all followers' timelines
        await pushToTimelines(tweet, userId);
    } else {
        // Pull model: Store in celebrity cache
        await storeInCelebrityCache(tweet, userId);
    }
    
    res.json(tweet);
});
```

### 2. Push Model (Regular Users)

```javascript
async function pushToTimelines(tweet, userId) {
    // Get all followers
    const followers = await Follower.findAll({
        where: { followingId: userId },
        attributes: ['followerId'],
        limit: 10000 // Batch process
    });
    
    // Batch insert into timelines
    const timelineEntries = followers.map(f => ({
        userId: f.followerId,
        tweetId: tweet.id,
        createdAt: new Date()
    }));
    
    // Insert in batches of 1000
    for (let i = 0; i < timelineEntries.length; i += 1000) {
        await Timeline.bulkCreate(timelineEntries.slice(i, i + 1000));
    }
    
    // If more followers, process asynchronously
    if (followers.length === 10000) {
        // Queue background job for remaining followers
        await queueJob('push-timeline', { tweetId: tweet.id, userId });
    }
}
```

### 3. Pull Model (Celebrities)

```javascript
async function storeInCelebrityCache(tweet, userId) {
    // Store in Redis sorted set (by timestamp)
    await redis.zadd(
        `celebrity:${userId}:tweets`,
        Date.now(),
        JSON.stringify({
            id: tweet.id,
            content: tweet.content,
            userId: tweet.userId,
            createdAt: tweet.createdAt
        })
    );
    
    // Keep only last 7 days (remove old tweets)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    await redis.zremrangebyscore(
        `celebrity:${userId}:tweets`,
        0,
        sevenDaysAgo
    );
    
    // Set TTL
    await redis.expire(`celebrity:${userId}:tweets`, 7 * 24 * 60 * 60);
}
```

### 4. Timeline Fetch (Hybrid)

```javascript
app.get('/timeline', async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    
    // Get regular users' tweets (pre-computed, from database)
    const regularTweets = await Timeline.findAll({
        where: { userId },
        include: [{
            model: Tweet,
            include: [{
                model: User,
                attributes: ['id', 'username', 'name']
            }]
        }],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    // Get celebrities followed
    const celebrities = await Follower.findAll({
        where: { followerId: userId },
        include: [{
            model: User,
            where: { isCelebrity: true },
            attributes: ['id']
        }]
    });
    
    // Fetch celebrity tweets from cache (on-demand)
    const celebrityTweets = [];
    for (const celeb of celebrities) {
        const tweets = await redis.zrevrange(
            `celebrity:${celeb.followingId}:tweets`,
            0,
            limit - 1  // Last N tweets
        );
        
        celebrityTweets.push(...tweets.map(t => JSON.parse(t)));
    }
    
    // Merge and sort by timestamp
    const allTweets = [
        ...regularTweets.map(t => ({
            id: t.tweet.id,
            content: t.tweet.content,
            user: t.tweet.user,
            createdAt: t.tweet.createdAt
        })),
        ...celebrityTweets
    ]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, parseInt(limit));
    
    res.json({
        tweets: allTweets,
        page: parseInt(page),
        limit: parseInt(limit)
    });
});
```

### 5. Background Job for Large Push

```javascript
// For users with many followers (but < 1M)
async function processTimelinePush(job) {
    const { tweetId, userId, offset = 0 } = job.data;
    const BATCH_SIZE = 10000;
    
    const followers = await Follower.findAll({
        where: { followingId: userId },
        attributes: ['followerId'],
        limit: BATCH_SIZE,
        offset: offset
    });
    
    if (followers.length === 0) {
        return; // Done
    }
    
    const timelineEntries = followers.map(f => ({
        userId: f.followerId,
        tweetId: tweetId,
        createdAt: new Date()
    }));
    
    await Timeline.bulkCreate(timelineEntries);
    
    // Queue next batch if more followers
    if (followers.length === BATCH_SIZE) {
        await queueJob('push-timeline', {
            tweetId,
            userId,
            offset: offset + BATCH_SIZE
        });
    }
}
```

---

## Why This Works

**Push Model (Regular Users)**:
- Pre-compute timelines in database
- Fast reads (already in database)
- Slower writes (insert into N timelines)
- Good for: < 1M followers

**Pull Model (Celebrities)**:
- Store tweets in Redis cache
- Fast writes (single insert)
- Slower reads (fetch on-demand)
- Good for: > 1M followers

**Hybrid Approach**:
- Best of both worlds
- Regular users: Push (fast reads)
- Celebrities: Pull (fast writes)
- Scales to millions of users

---

## Visual Flow

```
User Tweets
    │
    ├─→ Check Follower Count
    │       │
    │       ├─→ < 1M → Push Model
    │       │       │
    │       │       ├─→ Insert into followers' timelines (DB)
    │       │       └─→ Background job for large batches
    │       │
    │       └─→ > 1M → Pull Model
    │               │
    │               └─→ Store in Redis cache
    │
    └─→ Timeline Fetch
            │
            ├─→ Regular users' tweets (from DB)
            ├─→ Celebrity tweets (from Redis)
            └─→ Merge and sort
```

---

## Alternative Solutions

### Option 1: Pure Push
- ❌ 100M inserts per celebrity tweet
- ❌ Takes hours
- ❌ Database overload

### Option 2: Pure Pull
- ❌ Slow timeline loads
- ❌ High database load on reads
- ❌ Poor user experience

### Option 3: Fan-out on Write (Optimized)
- ✅ Pre-compute for all users
- ❌ Still slow for celebrities
- ❌ Doesn't scale

---

## Best Solution

**Hybrid Push + Pull**:
- ✅ Fast writes for celebrities
- ✅ Fast reads for regular users
- ✅ Scales to millions
- ✅ Good user experience
- ✅ Production-ready

---

## Performance Metrics

**Write Performance**:
- Regular user (< 1M): 1-10 seconds (batch insert)
- Celebrity (> 1M): < 100ms (Redis cache)

**Read Performance**:
- Regular user timeline: < 50ms (database query)
- Celebrity timeline: < 100ms (Redis fetch + merge)

**Scalability**:
- Handles 100M+ followers per celebrity
- Supports millions of users
- Horizontal scaling possible

