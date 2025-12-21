# 🎵 Spotify-Like Architecture — Complete DevOps Implementation

> **Real-world example**: How Redis, BullMQ, RabbitMQ, Docker, NGINX, Monitoring work together in a music streaming platform

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Key Concepts Explained](#key-concepts-explained)
3. [Windows Setup & CLI Commands](#windows-setup--cli-commands)
4. [Architecture Diagram](#architecture-diagram)
5. [Technology Stack](#technology-stack)
6. [Step-by-Step Flow](#step-by-step-flow)
7. [Implementation Details](#implementation-details)
8. [Deployment & Monitoring](#deployment--monitoring)

---

## System Overview

### Core Features
- 🎵 Music streaming
- 👤 User authentication
- 📊 Personalized recommendations
- 🔔 Real-time notifications
- 📈 Analytics & tracking
- 💾 Playlist management

### Scale Requirements
- **100M+ users**
- **10M+ concurrent streams**
- **Billions of events/day**
- **99.9% uptime**

---

## Key Concepts Explained

### 🔒 What is SSL Termination?

**SSL Termination** = Decrypting HTTPS traffic at the load balancer (NGINX) instead of at the application server.

#### Without SSL Termination (Bad)
```
Client (HTTPS) → App Server (decrypts HTTPS) → Process Request
```
**Problems**:
- App server wastes CPU on decryption
- Need SSL certificates on every server
- Complex certificate management

#### With SSL Termination (Good)
```
Client (HTTPS) → NGINX (decrypts HTTPS) → App Server (HTTP)
```
**Benefits**:
- ✅ NGINX handles SSL/TLS (faster, optimized)
- ✅ App servers only deal with HTTP (simpler)
- ✅ Single place to manage certificates
- ✅ Better performance

**Example NGINX Config**:
```nginx
server {
    listen 443 ssl;  # SSL termination happens here
    server_name spotify.com;
    
    # SSL certificates
    ssl_certificate /etc/ssl/certs/spotify.crt;
    ssl_certificate_key /etc/ssl/private/spotify.key;
    
    # Forward to app as plain HTTP
    location / {
        proxy_pass http://app-server:3000;  # HTTP, not HTTPS!
    }
}
```

---

### 🔀 What is Request Routing?

**Request Routing** = Directing different requests to different backend services based on URL path, headers, or other criteria.

#### Example: Spotify Request Routing
```
User Request → NGINX → Routes to appropriate service

/api/auth/*        → Auth Service (FastAPI on port 8000)
/api/songs/*       → Music Service (Node.js on port 3000)
/api/users/*       → User Service (Node.js on port 3001)
/api/playlists/*   → Playlist Service (Node.js on port 3002)
/stream/*          → Streaming Service (Node.js on port 4000)
/ws                → WebSocket Service (port 5000)
```

**NGINX Configuration**:
```nginx
server {
    listen 80;
    
    # Route authentication requests
    location /api/auth/ {
        proxy_pass http://auth-service:8000;
    }
    
    # Route music requests
    location /api/songs/ {
        proxy_pass http://music-service:3000;
    }
    
    # Route streaming requests
    location /stream/ {
        proxy_pass http://streaming-service:4000;
        proxy_buffering off;  # Important for streaming
    }
    
    # Route WebSocket connections
    location /ws {
        proxy_pass http://websocket-service:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Why it matters**:
- Different services can scale independently
- Easier to maintain (each service has one job)
- Can use different technologies per service

---

### 🎵 What is Streaming API?

**Streaming API** = An API that delivers audio/video data in chunks (not all at once).

#### Regular API (Downloads entire file)
```
Client → GET /song.mp3 → Server sends entire 5MB file → Client waits → Play
```
**Problem**: User waits for entire download before playing

#### Streaming API (Sends chunks)
```
Client → GET /stream/song → Server sends chunk 1 (256KB) → Client plays
                          → Server sends chunk 2 (256KB) → Client buffers
                          → Server sends chunk 3 (256KB) → Continues...
```
**Benefits**:
- ✅ Instant playback (no waiting)
- ✅ Less bandwidth if user skips
- ✅ Adaptive quality (can change bitrate mid-stream)

#### Spotify Streaming Flow
```javascript
// Streaming Service (Node.js)
app.get('/stream/:songId', async (req, res) => {
  const { songId } = req.params;
  
  // Get song file from S3
  const s3Stream = s3.getObject({
    Bucket: 'spotify-songs',
    Key: `${songId}.mp3`
  }).createReadStream();
  
  // Set headers for streaming
  res.set({
    'Content-Type': 'audio/mpeg',
    'Accept-Ranges': 'bytes',
    'Transfer-Encoding': 'chunked'
  });
  
  // Pipe S3 stream to response (sends chunks)
  s3Stream.pipe(res);
  
  // Track analytics
  await kafka.publish('song_played', { userId, songId });
});
```

**Technologies Used**:
- **HLS (HTTP Live Streaming)**: Apple's protocol, breaks audio into segments
- **DASH**: Similar to HLS, more flexible
- **WebRTC**: Real-time streaming (live audio/video)

---

### 💾 What is Cache in This Context?

**Cache** = Temporary storage of frequently accessed data to avoid hitting the database repeatedly.

#### Cache Layers in Spotify

**1. Browser Cache (Client-side)**
```
User's browser stores:
- Images (album covers)
- CSS/JavaScript files
- Previously played songs
```

**2. CDN Cache (Edge)**
```
CloudFront caches:
- Static assets (images, CSS, JS)
- Popular songs (audio files)
- Thumbnails
```

**3. Redis Cache (Application-level)**
```
Redis stores:
- Song metadata (title, artist, duration)
- User sessions
- Recently played lists
- Search results
- Trending songs
```

#### Example: Song Metadata Caching

**Without Cache** (Slow):
```
User requests song → API → Database query (50ms) → Return
Every request = 50ms + database load
```

**With Redis Cache** (Fast):
```
User requests song → API → Check Redis (1ms) → Return (if found)
                         → Database (50ms) → Cache in Redis → Return (if not found)

First request: 50ms
Subsequent requests: 1ms (50x faster!)
```

**Code Example**:
```javascript
async function getSong(songId) {
  const cacheKey = `song:${songId}`;
  
  // 1. Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log('Cache HIT');
    return JSON.parse(cached);
  }
  
  console.log('Cache MISS');
  
  // 2. Query database
  const song = await db.query('SELECT * FROM songs WHERE id = ?', [songId]);
  
  // 3. Store in cache (expire after 1 hour)
  await redis.setex(cacheKey, 3600, JSON.stringify(song));
  
  return song;
}
```

**Cache Strategies**:

| Strategy | When to Use |
| -------- | ----------- |
| **Cache-Aside** | Most common, app manages cache |
| **Write-Through** | Write to cache and DB simultaneously |
| **Write-Behind** | Write to cache first, DB later (async) |
| **Read-Through** | Cache automatically loads from DB |

---

## Windows Setup & CLI Commands

### Prerequisites (Windows)

1. **Install Docker Desktop for Windows**
   - Download: https://www.docker.com/products/docker-desktop
   - Includes Docker CLI and Docker Compose

2. **Install Git Bash** (optional, for Unix-like commands)
   - Download: https://git-scm.com/download/win
   - Or use PowerShell (built-in)

3. **Install Node.js** (for local development)
   - Download: https://nodejs.org/

---

### Windows CLI Tools

| Tool | Purpose | Command Prompt |
| ---- | ------- | -------------- |
| **PowerShell** | Built-in Windows shell | `powershell` |
| **CMD** | Classic command prompt | `cmd` |
| **Git Bash** | Unix-like shell for Windows | Install separately |
| **Docker CLI** | Manage containers | Comes with Docker Desktop |

**Recommended**: Use **PowerShell** or **Git Bash**

---

### Running the Architecture on Windows

#### Step 1: Clone Repository
```powershell
# PowerShell
cd C:\Users\nikit\Projects
git clone https://github.com/your-repo/spotify-clone.git
cd spotify-clone
```

#### Step 2: Start Docker Desktop
- Open Docker Desktop application
- Wait for "Docker is running" status

#### Step 3: Build and Run with Docker Compose
```powershell
# PowerShell (in project directory)

# Build all services
docker-compose build

# Start all services in background
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api-gateway

# List running containers
docker-compose ps

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

#### Step 4: Access Services
```powershell
# Open in browser or use curl

# API Gateway
curl http://localhost:3000/health

# RabbitMQ Management UI
# Open browser: http://localhost:15672
# Login: guest / guest

# Grafana
# Open browser: http://localhost:3001
# Login: admin / admin

# Prometheus
# Open browser: http://localhost:9090
```

---

### Common Docker Commands (Windows PowerShell)

```powershell
# List all containers
docker ps -a

# View container logs
docker logs <container-name>
docker logs -f api-gateway  # Follow logs

# Execute command in container
docker exec -it <container-name> sh
docker exec -it redis redis-cli  # Access Redis CLI

# Stop container
docker stop <container-name>

# Remove container
docker rm <container-name>

# List images
docker images

# Remove image
docker rmi <image-name>

# View container stats (CPU, memory)
docker stats

# Inspect container
docker inspect <container-name>

# Copy files from container
docker cp <container-name>:/path/to/file ./local-path

# Clean up unused resources
docker system prune -a
```

---

### Redis CLI Commands (Windows)

```powershell
# Access Redis CLI in container
docker exec -it redis redis-cli

# Inside Redis CLI:
# Get a key
GET song:123

# Set a key with expiration
SETEX session:abc 3600 "user-data"

# Check if key exists
EXISTS song:123

# Get all keys (use carefully in production!)
KEYS *

# View sorted set (trending songs)
ZREVRANGE trending:songs 0 9 WITHSCORES

# Increment counter
INCR play_count:song:123

# Delete key
DEL song:123

# Check memory usage
INFO memory

# Exit
exit
```

---

### MongoDB CLI Commands (Windows)

```powershell
# Access MongoDB shell in container
docker exec -it mongodb mongosh

# Inside MongoDB shell:
# Show databases
show dbs

# Use database
use spotify

# Show collections
show collections

# Find documents
db.playlists.find({ userId: "123" })

# Insert document
db.playlists.insertOne({
  userId: "123",
  name: "My Playlist",
  songs: []
})

# Update document
db.playlists.updateOne(
  { _id: ObjectId("...") },
  { $push: { songs: "song-456" } }
)

# Exit
exit
```

---

### PostgreSQL CLI Commands (Windows)

```powershell
# Access PostgreSQL CLI in container
docker exec -it postgres psql -U postgres -d spotify

# Inside psql:
# List tables
\dt

# Describe table
\d songs

# Query
SELECT * FROM songs WHERE artist = 'Queen';

# Insert
INSERT INTO songs (title, artist, duration) 
VALUES ('Bohemian Rhapsody', 'Queen', 354);

# Exit
\q
```

---

### RabbitMQ CLI Commands (Windows)

```powershell
# Access RabbitMQ container
docker exec -it rabbitmq bash

# Inside container:
# List queues
rabbitmqctl list_queues

# List exchanges
rabbitmqctl list_exchanges

# List bindings
rabbitmqctl list_bindings

# Purge queue
rabbitmqctl purge_queue <queue-name>

# Exit
exit
```

---

### Useful PowerShell Aliases

```powershell
# Add to PowerShell profile: $PROFILE

# Docker shortcuts
function dps { docker ps $args }
function dlog { docker logs -f $args }
function dexec { docker exec -it $args }
function dcup { docker-compose up -d $args }
function dcdown { docker-compose down $args }
function dclogs { docker-compose logs -f $args }

# Usage:
dps                    # List containers
dlog api-gateway       # View logs
dexec redis redis-cli  # Access Redis
dcup                   # Start all services
```

---

### Troubleshooting on Windows

#### Issue: Docker commands not found
```powershell
# Solution: Add Docker to PATH
# Or restart PowerShell after installing Docker Desktop
```

#### Issue: Port already in use
```powershell
# Find process using port
netstat -ano | findstr :3000

# Kill process
taskkill /PID <process-id> /F
```

#### Issue: Permission denied
```powershell
# Run PowerShell as Administrator
# Right-click PowerShell → Run as Administrator
```

#### Issue: Containers won't start
```powershell
# Check Docker Desktop is running
# Restart Docker Desktop
# Check logs
docker-compose logs
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  Web App (React) | Mobile App (React Native) | Desktop (Electron)│
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CDN (CloudFront)                            │
│  - Static assets (images, CSS, JS)                              │
│  - Audio files (cached)                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX (Load Balancer)                         │
│  - SSL Termination                                              │
│  - Rate Limiting                                                │
│  - Request Routing                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   API Gateway   │ │  Streaming API  │ │   WebSocket     │
│   (Node.js)     │ │   (Node.js)     │ │   (Real-time)   │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Auth Service   │ │  Music Service  │ │  User Service   │
│  (FastAPI)      │ │  (Node.js)      │ │  (Node.js)      │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Redis Cluster  │ │   PostgreSQL    │ │   MongoDB       │
│  - Cache        │ │  - User data    │ │  - Playlists    │
│  - Sessions     │ │  - Metadata     │ │  - Preferences  │
│  - Leaderboards │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      MESSAGE LAYER                               │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   BullMQ        │   RabbitMQ      │   Kafka                     │
│   (Redis)       │                 │                             │
│  - Emails       │  - Notifications│  - Analytics                │
│  - Thumbnails   │  - Recommendations│ - Event Stream            │
│  - Reports      │  - Sync tasks   │  - User activity           │
└────────┬────────┴────────┬────────┴────────┬────────────────────┘
         ↓                 ↓                 ↓
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Worker Service │ │  Notification   │ │  Analytics      │
│  (Background)   │ │  Service        │ │  Pipeline       │
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                                 │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   S3 / GCS      │   ElasticSearch │   Data Warehouse            │
│  - Audio files  │  - Search       │  - BigQuery                 │
│  - Images       │  - Lyrics       │  - Analytics                │
└─────────────────┴─────────────────┴─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  MONITORING & OBSERVABILITY                      │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Prometheus     │   Grafana       │   Loki / ELK                │
│  - Metrics      │  - Dashboards   │  - Logs                     │
│  - Alerts       │  - Visualization│  - Search                   │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Web**: React + TypeScript
- **Mobile**: React Native
- **Desktop**: Electron

### Backend Services
- **API Gateway**: Node.js + Express
- **Auth Service**: FastAPI (Python)
- **Music Service**: Node.js + Express
- **User Service**: Node.js + Express
- **Streaming Service**: Node.js + HLS

### Databases
- **PostgreSQL**: User data, subscriptions, metadata
- **MongoDB**: Playlists, user preferences, listening history
- **Redis**: Cache, sessions, real-time data

### Message Queues
- **BullMQ**: Background jobs (emails, thumbnails)
- **RabbitMQ**: Service-to-service messaging
- **Kafka**: Event streaming, analytics

### Infrastructure
- **Docker**: Containerization
- **Kubernetes**: Orchestration
- **NGINX**: Load balancing, reverse proxy
- **CDN**: CloudFront / Cloudflare

### Monitoring
- **Prometheus**: Metrics
- **Grafana**: Dashboards
- **Loki**: Logs
- **Sentry**: Error tracking

---

## Step-by-Step Flow

### Flow 1: User Plays a Song 🎵

```
1. User clicks "Play" on song
   ↓
2. Frontend → API Gateway
   GET /api/songs/123/stream
   ↓
3. API Gateway → Auth Service
   Verify JWT token
   ↓
4. Auth Service → Redis
   Check session validity
   ↓
5. API Gateway → Music Service
   Get song metadata & streaming URL
   ↓
6. Music Service → Redis
   Check cache for song metadata
   ├─ HIT → Return cached data
   └─ MISS → Query PostgreSQL → Cache in Redis
   ↓
7. Music Service → S3/CDN
   Get signed URL for audio file
   ↓
8. Return streaming URL to client
   ↓
9. Client streams audio from CDN
   ↓
10. ASYNC: Publish event to Kafka
    Event: "song_played"
    Data: { userId, songId, timestamp }
    ↓
11. Kafka → Analytics Pipeline
    - Update play count
    - Track user behavior
    - Feed recommendation engine
    ↓
12. ASYNC: BullMQ Job
    Job: "update_recently_played"
    - Update user's recently played list
    - Update artist stats
```

**Technologies Used**:
- ✅ **Redis**: Cache song metadata, session validation
- ✅ **Kafka**: Stream play events for analytics
- ✅ **BullMQ**: Background job to update stats
- ✅ **S3/CDN**: Serve audio files
- ✅ **PostgreSQL**: Store song metadata

---

### Flow 2: Personalized Recommendations 🎯

```
1. User opens "Discover Weekly"
   ↓
2. Frontend → API Gateway
   GET /api/recommendations
   ↓
3. API Gateway → Redis
   Check cache: "recommendations:user:123"
   ├─ HIT → Return cached recommendations
   └─ MISS → Continue
   ↓
4. API Gateway → RabbitMQ
   Publish: "get_recommendations"
   Exchange: "recommendations"
   Routing Key: "user.123"
   ↓
5. Recommendation Service (Consumer)
   - Fetch user listening history (MongoDB)
   - Fetch similar users (PostgreSQL)
   - Run ML model
   - Generate recommendations
   ↓
6. Recommendation Service → Redis
   Cache recommendations (TTL: 1 hour)
   ↓
7. Recommendation Service → RabbitMQ
   Publish result back
   ↓
8. API Gateway receives result
   Return to client
```

**Technologies Used**:
- ✅ **Redis**: Cache recommendations
- ✅ **RabbitMQ**: Request-response pattern
- ✅ **MongoDB**: User listening history
- ✅ **PostgreSQL**: User similarity data

---

### Flow 3: Real-time Notifications 🔔

```
1. Artist releases new song
   ↓
2. Admin uploads song via CMS
   ↓
3. Music Service → PostgreSQL
   Insert song metadata
   ↓
4. Music Service → RabbitMQ
   Publish: "song_released"
   Exchange: "notifications" (fanout)
   ↓
5. Multiple Consumers:
   
   A) Notification Service
      - Query followers (PostgreSQL)
      - For each follower:
        → BullMQ: "send_push_notification"
        → BullMQ: "send_email"
   
   B) Search Service
      - Index song in ElasticSearch
   
   C) Cache Service
      - Invalidate related caches
      - Pre-warm popular caches
   ↓
6. BullMQ Workers:
   
   Worker 1: Push Notifications
   - Send via Firebase/APNs
   - Track delivery status
   
   Worker 2: Email Notifications
   - Render email template
   - Send via SendGrid
   - Track opens/clicks
   ↓
7. WebSocket Server
   - Push real-time notification to connected clients
   - Update UI instantly
```

**Technologies Used**:
- ✅ **RabbitMQ**: Fanout to multiple services
- ✅ **BullMQ**: Background jobs (push, email)
- ✅ **PostgreSQL**: Follower relationships
- ✅ **WebSocket**: Real-time updates
- ✅ **ElasticSearch**: Search indexing

---

### Flow 4: User Creates Playlist 📝

```
1. User creates playlist
   ↓
2. Frontend → API Gateway
   POST /api/playlists
   Body: { name, description, songs: [] }
   ↓
3. API Gateway → Auth Service
   Verify user is authenticated
   ↓
4. API Gateway → User Service
   Create playlist
   ↓
5. User Service → MongoDB
   Insert playlist document
   {
     userId: "123",
     name: "My Playlist",
     songs: [],
     createdAt: "2025-12-15"
   }
   ↓
6. User Service → Redis
   Invalidate cache: "playlists:user:123"
   ↓
7. User Service → Kafka
   Publish event: "playlist_created"
   {
     userId: "123",
     playlistId: "abc",
     timestamp: "..."
   }
   ↓
8. Kafka Consumers:
   
   A) Analytics Service
      - Track playlist creation metrics
      - Update user engagement score
   
   B) Recommendation Service
      - Update user preferences
      - Trigger recommendation refresh
   ↓
9. Return success to client
```

**Technologies Used**:
- ✅ **MongoDB**: Store playlist (flexible schema)
- ✅ **Redis**: Cache invalidation
- ✅ **Kafka**: Event streaming for analytics

---

### Flow 5: Search for Songs 🔍

```
1. User types in search box
   ↓
2. Frontend → API Gateway (debounced)
   GET /api/search?q=bohemian
   ↓
3. API Gateway → Redis
   Check cache: "search:bohemian"
   ├─ HIT → Return cached results
   └─ MISS → Continue
   ↓
4. API Gateway → ElasticSearch
   Query: {
     query: {
       multi_match: {
         query: "bohemian",
         fields: ["title", "artist", "album"]
       }
     }
   }
   ↓
5. ElasticSearch returns results
   ↓
6. API Gateway → Redis
   Cache results (TTL: 5 minutes)
   ↓
7. Return results to client
   ↓
8. ASYNC: Kafka event
   Event: "search_performed"
   - Track search queries
   - Improve search ranking
```

**Technologies Used**:
- ✅ **ElasticSearch**: Full-text search
- ✅ **Redis**: Cache search results
- ✅ **Kafka**: Track search analytics

---

### Flow 6: Daily Analytics Report 📊

```
1. Cron job triggers (daily at 2 AM)
   ↓
2. Scheduler → BullMQ
   Add job: "generate_daily_report"
   Priority: LOW
   ↓
3. Worker picks up job
   ↓
4. Worker → Kafka
   Consume events from last 24 hours
   - song_played
   - playlist_created
   - user_signed_up
   ↓
5. Worker → Data Warehouse (BigQuery)
   Run aggregation queries:
   - Total plays
   - Top songs
   - User growth
   - Revenue
   ↓
6. Worker generates PDF report
   ↓
7. Worker → S3
   Upload report
   ↓
8. Worker → BullMQ
   Add job: "send_report_email"
   To: executives@spotify.com
   ↓
9. Email Worker
   - Fetch report from S3
   - Send via SendGrid
   ↓
10. Mark job as complete
```

**Technologies Used**:
- ✅ **BullMQ**: Scheduled jobs
- ✅ **Kafka**: Event source
- ✅ **BigQuery**: Analytics warehouse
- ✅ **S3**: Report storage

---

## Implementation Details

### 1. Redis Usage

#### Cache Layer
```javascript
// Song metadata caching
async function getSongMetadata(songId) {
  const cacheKey = `song:${songId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    metrics.increment('cache.hit');
    return JSON.parse(cached);
  }
  
  metrics.increment('cache.miss');
  
  // Fetch from database
  const song = await db.query(
    'SELECT * FROM songs WHERE id = ?',
    [songId]
  );
  
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(song));
  
  return song;
}
```

#### Session Management
```javascript
// Store session
async function createSession(userId, token) {
  const sessionKey = `session:${token}`;
  const sessionData = {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  
  await redis.setex(
    sessionKey,
    7 * 24 * 60 * 60, // 7 days in seconds
    JSON.stringify(sessionData)
  );
}

// Validate session
async function validateSession(token) {
  const sessionKey = `session:${token}`;
  const session = await redis.get(sessionKey);
  
  if (!session) {
    throw new Error('Invalid session');
  }
  
  return JSON.parse(session);
}
```

#### Real-time Leaderboards
```javascript
// Track song plays
async function incrementPlayCount(songId) {
  await redis.zincrby('trending:songs', 1, songId);
}

// Get top 10 trending songs
async function getTrendingSongs() {
  const songIds = await redis.zrevrange('trending:songs', 0, 9, 'WITHSCORES');
  
  // songIds = ['song1', '1000', 'song2', '800', ...]
  const songs = [];
  for (let i = 0; i < songIds.length; i += 2) {
    songs.push({
      songId: songIds[i],
      plays: parseInt(songIds[i + 1])
    });
  }
  
  return songs;
}
```

---

### 2. BullMQ Implementation

#### Queue Setup
```javascript
// queues/index.js
const { Queue, Worker } = require('bullmq');

const connection = {
  host: 'redis',
  port: 6379
};

// Define queues
const emailQueue = new Queue('email', { connection });
const notificationQueue = new Queue('notifications', { connection });
const analyticsQueue = new Queue('analytics', { connection });

module.exports = { emailQueue, notificationQueue, analyticsQueue };
```

#### Producer (API Service)
```javascript
// services/music.service.js
const { notificationQueue, analyticsQueue } = require('../queues');

async function handleSongPlay(userId, songId) {
  // Immediate response
  const playSession = await createPlaySession(userId, songId);
  
  // Queue background tasks
  await notificationQueue.add('update-recently-played', {
    userId,
    songId,
    timestamp: Date.now()
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  });
  
  await analyticsQueue.add('track-play', {
    userId,
    songId,
    timestamp: Date.now()
  }, {
    priority: 5 // Lower priority
  });
  
  return playSession;
}
```

#### Worker (Background Service)
```javascript
// workers/notification.worker.js
const { Worker } = require('bullmq');

const worker = new Worker('notifications', async (job) => {
  const { userId, songId, timestamp } = job.data;
  
  console.log(`Processing notification for user ${userId}`);
  
  // Update recently played
  await db.query(`
    INSERT INTO recently_played (user_id, song_id, played_at)
    VALUES (?, ?, ?)
  `, [userId, songId, new Date(timestamp)]);
  
  // Invalidate cache
  await redis.del(`recently-played:${userId}`);
  
  // Update progress
  await job.updateProgress(100);
  
  return { success: true };
}, {
  connection: { host: 'redis', port: 6379 },
  concurrency: 10 // Process 10 jobs in parallel
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});
```

---

### 3. RabbitMQ Implementation

#### Setup
```javascript
// rabbitmq/connection.js
const amqp = require('amqplib');

let connection, channel;

async function connect() {
  connection = await amqp.connect('amqp://rabbitmq:5672');
  channel = await connection.createChannel();
  
  // Declare exchanges
  await channel.assertExchange('notifications', 'fanout', { durable: true });
  await channel.assertExchange('recommendations', 'direct', { durable: true });
  
  return channel;
}

module.exports = { connect };
```

#### Publisher (Music Service)
```javascript
// services/release.service.js
async function publishNewSong(song) {
  const channel = await rabbitmq.connect();
  
  const message = {
    songId: song.id,
    artistId: song.artistId,
    title: song.title,
    releasedAt: new Date()
  };
  
  // Fanout to all interested services
  channel.publish(
    'notifications',
    '', // Routing key ignored for fanout
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
  
  console.log('Published new song release');
}
```

#### Consumer (Notification Service)
```javascript
// services/notification.consumer.js
async function startConsumer() {
  const channel = await rabbitmq.connect();
  
  // Create queue
  const queue = await channel.assertQueue('notification-service', {
    durable: true
  });
  
  // Bind to exchange
  await channel.bindQueue(queue.queue, 'notifications', '');
  
  // Consume messages
  channel.consume(queue.queue, async (msg) => {
    if (msg) {
      const data = JSON.parse(msg.content.toString());
      
      try {
        // Get followers
        const followers = await db.query(
          'SELECT user_id FROM followers WHERE artist_id = ?',
          [data.artistId]
        );
        
        // Queue push notifications
        for (const follower of followers) {
          await emailQueue.add('push-notification', {
            userId: follower.user_id,
            message: `${data.title} just released!`
          });
        }
        
        // Acknowledge message
        channel.ack(msg);
      } catch (error) {
        console.error('Failed to process:', error);
        // Requeue with delay
        channel.nack(msg, false, true);
      }
    }
  });
}
```

---

### 4. Kafka Implementation

#### Producer (All Services)
```javascript
// kafka/producer.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'spotify-app',
  brokers: ['kafka:9092']
});

const producer = kafka.producer();

async function publishEvent(topic, event) {
  await producer.connect();
  
  await producer.send({
    topic,
    messages: [
      {
        key: event.userId,
        value: JSON.stringify(event),
        timestamp: Date.now()
      }
    ]
  });
}

// Usage
await publishEvent('user-activity', {
  userId: '123',
  action: 'song_played',
  songId: '456',
  timestamp: Date.now()
});
```

#### Consumer (Analytics Service)
```javascript
// analytics/consumer.js
const consumer = kafka.consumer({ groupId: 'analytics-group' });

async function startAnalytics() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'user-activity', fromBeginning: false });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());
      
      // Process event
      switch (event.action) {
        case 'song_played':
          await updatePlayCount(event.songId);
          await updateUserHistory(event.userId, event.songId);
          break;
        
        case 'playlist_created':
          await trackPlaylistCreation(event.userId);
          break;
      }
      
      // Write to data warehouse
      await bigquery.insert('events', event);
    }
  });
}
```

---

## Deployment & Monitoring

### Docker Compose (Development)

```yaml
version: '3.8'

services:
  # API Gateway
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
      - RABBITMQ_URL=amqp://rabbitmq:5672
      - KAFKA_BROKERS=kafka:9092
    depends_on:
      - redis
      - rabbitmq
      - kafka

  # Music Service
  music-service:
    build: ./services/music
    environment:
      - DATABASE_URL=postgresql://postgres:5432/spotify
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  # Worker Service
  worker:
    build: ./services/worker
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  # PostgreSQL
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=spotify
      - POSTGRES_PASSWORD=secret
    volumes:
      - postgres-data:/var/lib/postgresql/data

  # MongoDB
  mongodb:
    image: mongo:6
    volumes:
      - mongo-data:/data/db

  # RabbitMQ
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

  # Kafka
  kafka:
    image: confluentinc/cp-kafka:latest
    environment:
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
    depends_on:
      - zookeeper

  zookeeper:
    image: confluentinc/cp-zookeeper:latest

  # Monitoring
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"

volumes:
  redis-data:
  postgres-data:
  mongo-data:
```

---

### Monitoring Setup

#### Prometheus Metrics
```javascript
// metrics.js
const promClient = require('prom-client');

const register = new promClient.Registry();

// Metrics
const songPlaysCounter = new promClient.Counter({
  name: 'spotify_song_plays_total',
  help: 'Total number of song plays',
  labelNames: ['song_id', 'user_id']
});

const streamingDuration = new promClient.Histogram({
  name: 'spotify_streaming_duration_seconds',
  help: 'Duration of streaming sessions',
  buckets: [10, 30, 60, 120, 300, 600]
});

const activeUsers = new promClient.Gauge({
  name: 'spotify_active_users',
  help: 'Number of currently active users'
});

register.registerMetric(songPlaysCounter);
register.registerMetric(streamingDuration);
register.registerMetric(activeUsers);

// Usage
songPlaysCounter.inc({ song_id: '123', user_id: '456' });
streamingDuration.observe(180); // 3 minutes
activeUsers.set(15000);
```

#### Grafana Dashboards

**Dashboard 1: System Health**
- Request rate
- Error rate
- Response time (p50, p95, p99)
- Active connections

**Dashboard 2: Business Metrics**
- Active users
- Song plays per minute
- New signups
- Premium conversions

**Dashboard 3: Infrastructure**
- CPU/Memory usage
- Redis hit rate
- Queue length
- Kafka lag

---

## Summary

### Technology Usage

| Technology | Use Cases |
| ---------- | --------- |
| **Redis** | Cache, sessions, leaderboards, rate limiting |
| **BullMQ** | Background jobs (emails, thumbnails, reports) |
| **RabbitMQ** | Service-to-service messaging, notifications |
| **Kafka** | Event streaming, analytics, user activity |
| **PostgreSQL** | User data, metadata, relationships |
| **MongoDB** | Playlists, preferences, flexible data |
| **ElasticSearch** | Full-text search |
| **Docker** | Containerization |
| **Kubernetes** | Orchestration, auto-scaling |
| **NGINX** | Load balancing, SSL, routing |
| **Prometheus** | Metrics collection |
| **Grafana** | Visualization |

### Key Patterns

1. **Cache-Aside**: Check Redis → Miss → Database → Cache
2. **Event Sourcing**: Kafka stores all events
3. **CQRS**: Separate read/write paths
4. **Circuit Breaker**: Prevent cascading failures
5. **Retry with Backoff**: Handle transient failures
6. **Idempotency**: Safe retries
7. **Graceful Degradation**: Fallback to basic features

---

## Next Steps

1. **Implement one flow** end-to-end
2. **Add monitoring** to all services
3. **Load test** with realistic traffic
4. **Set up CI/CD** pipeline
5. **Deploy to Kubernetes**

---

**This is how real production systems work!** 🚀
