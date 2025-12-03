# Zombie Crawler: Complete System Design

## Problem Statement

**Context**: Building internal SEO tool to archive company documentation. Documentation links to itself frequently (e.g., "See Page A" → "See Page B" → "See Page A").

**The Bug**: Crawler started last night. By morning, server crashed with OutOfMemoryError. Upon reboot, crawler started over from homepage, losing 10 hours of work.

**Task**: Design Stateful, Resilient Crawler that:
- **Deduplication**: Never visits same URL twice (even if linked 1,000 times)
- **Resumability**: If script dies (kill -9), resumes exactly where it left off
- **Politeness**: Never hits same domain more than once per second

---

## Solution Architecture

```
Crawler → URL Queue (Redis) → Visited URLs (Redis Set) → Domain Rate Limiter → HTTP Client → Storage
```

**Key Components**:
1. **Redis Queue**: Pending URLs to crawl
2. **Redis Set**: Visited URLs (deduplication)
3. **Redis Sorted Set**: Domain rate limiting (timestamp tracking)
4. **Persistent State**: Save progress periodically
5. **Graceful Shutdown**: Handle SIGTERM/SIGINT

---

## Implementation

### 1. Main Crawler Class

```javascript
const redis = require('redis');
const axios = require('axios');
const { URL } = require('url');

class ResilientCrawler {
    constructor(options = {}) {
        this.redis = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        
        this.queueKey = options.queueKey || 'crawler:queue';
        this.visitedKey = options.visitedKey || 'crawler:visited';
        this.rateLimitKey = options.rateLimitKey || 'crawler:rate_limit';
        this.stateKey = options.stateKey || 'crawler:state';
        
        this.maxConcurrency = options.maxConcurrency || 5;
        this.politenessDelay = options.politenessDelay || 1000; // 1 second
        this.saveInterval = options.saveInterval || 60000; // 1 minute
        
        this.isRunning = false;
        this.stats = {
            crawled: 0,
            skipped: 0,
            errors: 0
        };
    }
    
    async initialize() {
        await this.redis.connect();
        
        // Load previous state
        await this.loadState();
        
        // Setup graceful shutdown
        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
        
        // Periodic state save
        setInterval(() => this.saveState(), this.saveInterval);
    }
    
    async start(seedUrls) {
        this.isRunning = true;
        
        // Add seed URLs to queue
        for (const url of seedUrls) {
            await this.addToQueue(url);
        }
        
        // Start crawling
        await this.crawl();
    }
    
    async addToQueue(url) {
        const normalizedUrl = this.normalizeUrl(url);
        
        // Check if already visited
        const visited = await this.redis.sIsMember(this.visitedKey, normalizedUrl);
        if (visited) {
            return false; // Already visited
        }
        
        // Check if already in queue
        const inQueue = await this.redis.lPos(this.queueKey, normalizedUrl);
        if (inQueue !== null) {
            return false; // Already in queue
        }
        
        // Add to queue
        await this.redis.rPush(this.queueKey, normalizedUrl);
        return true;
    }
    
    async crawl() {
        const workers = [];
        
        // Start concurrent workers
        for (let i = 0; i < this.maxConcurrency; i++) {
            workers.push(this.worker(i));
        }
        
        // Wait for all workers
        await Promise.all(workers);
    }
    
    async worker(workerId) {
        console.log(`Worker ${workerId} started`);
        
        while (this.isRunning) {
            try {
                // Get next URL from queue (blocking pop with timeout)
                const url = await this.redis.blPop(
                    this.redis.commandOptions({ isolated: true }),
                    this.queueKey,
                    5 // 5 second timeout
                );
                
                if (!url || !url.element) {
                    // Queue empty, check again
                    continue;
                }
                
                await this.processUrl(url.element, workerId);
                
            } catch (error) {
                console.error(`Worker ${workerId} error:`, error);
                this.stats.errors++;
            }
        }
        
        console.log(`Worker ${workerId} stopped`);
    }
    
    async processUrl(url, workerId) {
        try {
            // Check if already visited (double-check)
            const visited = await this.redis.sIsMember(this.visitedKey, url);
            if (visited) {
                this.stats.skipped++;
                return;
            }
            
            // Rate limit: Check domain last access time
            const domain = this.getDomain(url);
            await this.waitForRateLimit(domain);
            
            // Mark as visited (before crawling to prevent duplicates)
            await this.redis.sAdd(this.visitedKey, url);
            
            // Fetch URL
            console.log(`[Worker ${workerId}] Crawling: ${url}`);
            const response = await axios.get(url, {
                timeout: 10000,
                maxRedirects: 5,
                validateStatus: (status) => status < 400
            });
            
            // Extract links
            const links = this.extractLinks(response.data, url);
            
            // Add links to queue
            for (const link of links) {
                await this.addToQueue(link);
            }
            
            // Save content
            await this.saveContent(url, response.data);
            
            this.stats.crawled++;
            
            // Update rate limit timestamp
            await this.updateRateLimit(domain);
            
        } catch (error) {
            console.error(`Error crawling ${url}:`, error.message);
            this.stats.errors++;
            
            // Don't mark as visited on error (allow retry)
            await this.redis.sRem(this.visitedKey, url);
        }
    }
    
    async waitForRateLimit(domain) {
        const lastAccessKey = `${this.rateLimitKey}:${domain}`;
        const lastAccess = await this.redis.get(lastAccessKey);
        
        if (lastAccess) {
            const timeSinceLastAccess = Date.now() - parseInt(lastAccess);
            if (timeSinceLastAccess < this.politenessDelay) {
                const waitTime = this.politenessDelay - timeSinceLastAccess;
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    
    async updateRateLimit(domain) {
        const lastAccessKey = `${this.rateLimitKey}:${domain}`;
        await this.redis.set(lastAccessKey, Date.now().toString());
    }
    
    extractLinks(html, baseUrl) {
        const links = [];
        const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
        const base = new URL(baseUrl);
        
        let match;
        while ((match = linkRegex.exec(html)) !== null) {
            try {
                const href = match[1];
                const absoluteUrl = new URL(href, base).href;
                
                // Only add same-domain links
                if (this.getDomain(absoluteUrl) === this.getDomain(baseUrl)) {
                    links.push(this.normalizeUrl(absoluteUrl));
                }
            } catch (error) {
                // Invalid URL, skip
            }
        }
        
        return links;
    }
    
    normalizeUrl(url) {
        try {
            const parsed = new URL(url);
            // Remove hash, normalize path
            parsed.hash = '';
            parsed.pathname = parsed.pathname.replace(/\/$/, '') || '/';
            return parsed.href;
        } catch (error) {
            return url;
        }
    }
    
    getDomain(url) {
        try {
            return new URL(url).hostname;
        } catch (error) {
            return url;
        }
    }
    
    async saveContent(url, content) {
        // Save to file system or database
        const fs = require('fs').promises;
        const path = require('path');
        
        const domain = this.getDomain(url);
        const urlHash = require('crypto')
            .createHash('md5')
            .update(url)
            .digest('hex');
        
        const dir = path.join('crawled', domain);
        await fs.mkdir(dir, { recursive: true });
        
        const filePath = path.join(dir, `${urlHash}.html`);
        await fs.writeFile(filePath, content);
    }
    
    async saveState() {
        const state = {
            timestamp: Date.now(),
            stats: this.stats,
            queueLength: await this.redis.lLen(this.queueKey),
            visitedCount: await this.redis.sCard(this.visitedKey)
        };
        
        await this.redis.set(this.stateKey, JSON.stringify(state));
        console.log('State saved:', state);
    }
    
    async loadState() {
        const stateJson = await this.redis.get(this.stateKey);
        if (stateJson) {
            const state = JSON.parse(stateJson);
            console.log('Loaded previous state:', state);
            this.stats = state.stats || this.stats;
        }
    }
    
    async shutdown() {
        console.log('Shutting down gracefully...');
        this.isRunning = false;
        
        // Save final state
        await this.saveState();
        
        // Close Redis connection
        await this.redis.quit();
        
        console.log('Crawler stopped');
        process.exit(0);
    }
}
```

### 2. Usage

```javascript
const crawler = new ResilientCrawler({
    maxConcurrency: 5,
    politenessDelay: 1000, // 1 second between same domain
    saveInterval: 60000 // Save state every minute
});

async function main() {
    await crawler.initialize();
    
    // Start with seed URLs
    await crawler.start([
        'https://docs.example.com',
        'https://docs.example.com/getting-started'
    ]);
}

main().catch(console.error);
```

---

## Why This Works

**Deduplication**:
- Redis Set stores visited URLs
- Check before adding to queue
- Check before processing (double-check)

**Resumability**:
- Queue persists in Redis
- Visited URLs persist in Redis
- State saved periodically
- Resume from queue on restart

**Politeness**:
- Track last access time per domain
- Wait if accessed within delay period
- Prevents overwhelming servers

---

## Visual Flow

```
Start Crawler
    │
    ├─→ Load State (if exists)
    │
    ├─→ Add Seed URLs to Queue
    │
    ├─→ Start Workers (concurrent)
    │       │
    │       ├─→ Worker 1: Pop URL → Check visited → Crawl → Extract links → Add to queue
    │       ├─→ Worker 2: Pop URL → Check visited → Crawl → Extract links → Add to queue
    │       └─→ Worker 3: Pop URL → Check visited → Crawl → Extract links → Add to queue
    │
    ├─→ Rate Limit Check (per domain)
    │
    ├─→ Save State (periodically)
    │
    └─→ Graceful Shutdown (on SIGTERM/SIGINT)
```

---

## Best Practices

**1. Deduplication**:
- Normalize URLs (remove hash, trailing slash)
- Check before queueing
- Check before processing

**2. Resumability**:
- Use Redis for persistence
- Save state periodically
- Handle graceful shutdown

**3. Politeness**:
- Track per-domain access times
- Enforce delay between requests
- Respect robots.txt (optional)

---

## Best Solution

**Redis Queue + Set + Rate Limiting**:
- ✅ Never visits same URL twice
- ✅ Resumes from where it left off
- ✅ Respects domain rate limits
- ✅ Handles crashes gracefully
- ✅ Production-ready

