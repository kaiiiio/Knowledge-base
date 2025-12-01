# Async vs Sync in Node.js

Understanding when and how to use async operations in Express.js is crucial for building high-performance backends.

## The Fundamental Difference

### Synchronous (Sync) Code

In synchronous code, each operation **blocks** until it completes:

```javascript
// Synchronous - blocks the event loop: Event loop waits for I/O to complete.
app.get("/users/:user_id", (req, res) => {
    const user = db.getUserSync(req.params.user_id);  // Blocks here, event loop waiting
    res.json(user);  // Only executes after DB call completes
});
```

**Problems:** One request blocks the event loop. Event loop sits idle waiting for I/O (database, API calls, file reads). Limited concurrency (can't handle other requests during wait). CPU underutilized during I/O waits.

### Asynchronous (Async) Code

In asynchronous code, operations can **yield control** during I/O:

```javascript
// Asynchronous - doesn't block: Yields control during I/O, handles other requests.
app.get("/users/:user_id", async (req, res) => {
    const user = await db.getUser(req.params.user_id);  // Yields control, handles other requests
    res.json(user);  // Resumes when DB responds
});
```

**Benefits:** One event loop can handle thousands of concurrent requests. Event loop switches to other tasks during I/O waits. Better resource utilization. Higher throughput for I/O-bound operations.

## When to Use Async

### ✅ Use Async For:

1. **I/O-bound operations**
   - Database queries (SQL, MongoDB, Redis)
   - HTTP API calls (external services)
   - File I/O operations
   - WebSocket connections

2. **High concurrency needs**
   - Many simultaneous requests
   - Long-polling endpoints
   - Real-time features

3. **Mixed operations**
   - Waiting for multiple services
   - Parallel data fetching

```javascript
// Async allows concurrent operations: Run multiple I/O operations in parallel.
async function getUserProfile(userId) {
    // Promise.all: Executes all operations concurrently, not sequentially.
    const [user, orders, preferences] = await Promise.all([
        db.getUser(userId),
        db.getOrders(userId),
        cache.getPreferences(userId)
    ]);
    return combineProfile(user, orders, preferences);
}
```

**Explanation:** `Promise.all` runs all operations concurrently. Instead of waiting for each one sequentially (3× wait time), they all execute in parallel (1× wait time).

### ❌ Don't Use Async For:

1. **CPU-bound operations**
   - Heavy calculations
   - Image processing
   - Machine learning inference
   - Data transformations

2. **Pure synchronous code**
   - Simple CRUD without async DB drivers
   - Synchronous libraries without async support

```javascript
// CPU-bound - use worker threads or background jobs: Don't block event loop with CPU work.
function calculateStatistics(data) {
    // Heavy computation - blocks event loop
    return complexMathOperation(data);
}

// Better: Move to background job: Don't block response.
const Bull = require('bull');
const statsQueue = new Bull('statistics');

app.post("/analyze", async (req, res) => {
    // Queue job: Runs in background, doesn't block.
    const job = await statsQueue.add({ data: req.body.values });
    res.json({ job_id: job.id });
});
```

**Explanation:** CPU-bound operations should run in worker threads or background jobs. This prevents blocking the async event loop, which is optimized for I/O operations.

## Node.js Event Loop

Node.js uses a single-threaded event loop for async operations:

```javascript
// Event loop: Single thread handles all async I/O efficiently.
app.get("/users/:id", async (req, res) => {
    // Step 1: Request received (event loop)
    const user = await db.getUser(req.params.id);  // Step 2: DB query starts, event loop continues
    // Step 3: Event loop handles other requests while waiting
    // Step 4: DB responds, callback queued
    // Step 5: Event loop processes callback, resumes function
    res.json(user);  // Step 6: Response sent
});
```

**How it works:** When `await` is encountered, Node.js yields control back to the event loop. The event loop can process other requests while waiting for the database. When the database responds, the callback is queued and processed by the event loop.

## Real-World Performance Impact

### Scenario: 1000 concurrent requests fetching from database

**Sync approach:**
- Each request blocks the event loop
- With 4 CPU cores: ~400-800 concurrent requests max
- Memory: ~8MB per thread × 800 = ~6.4GB just for threads
- Slow response times under load

**Async approach:**
- All requests share event loop
- Same 4 cores: easily handle 10,000+ concurrent requests
- Memory: ~50-100MB for event loop
- Fast response times, efficient resource usage

## Common Patterns

### 1. Database Operations

```javascript
// Async database with Sequelize
const { User } = require('../models');

app.get("/users/:user_id", async (req, res, next) => {
    try {
        // Async query: Non-blocking database call.
        const user = await User.findByPk(req.params.user_id);
        res.json(user);
    } catch (error) {
        next(error);  // Pass to error handler
    }
});
```

### 2. Multiple External APIs

```javascript
const axios = require('axios');

// fetchUserData: Fetch from multiple APIs concurrently.
async function fetchUserData(userId) {
    // Promise.all: All requests execute in parallel.
    const [user, orders, analytics] = await Promise.all([
        axios.get(`/api/users/${userId}`),
        axios.get(`/api/orders/${userId}`),
        axios.get(`/api/analytics/${userId}`)
    ]);
    
    return {
        user: user.data,
        orders: orders.data,
        analytics: analytics.data
    };
}
```

### 3. Background Jobs

```javascript
const Bull = require('bull');
const emailQueue = new Bull('email');

// sendEmailNotification: Background job doesn't block response.
async function sendEmailNotification(userId) {
    // This runs in background without blocking
    await emailQueue.add({ userId });
}

app.post("/users/", async (req, res, next) => {
    try {
        const newUser = await db.createUser(req.body);
        // Queue email: Doesn't block response.
        await sendEmailNotification(newUser.id);
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
});
```

## Best Practices

1. **Use async for all I/O operations**
   - Database calls
   - External API calls
   - File operations (with fs.promises)
   - Redis operations

2. **Keep CPU-bound work separate**
   - Use worker threads (worker_threads module)
   - Or process in background jobs (Bull, Agenda)

3. **Handle errors properly**
   - Always use try/catch with async/await
   - Or use .catch() with promises
   - Pass errors to Express error handler

4. **Avoid blocking the event loop**
   - Never use sync versions of I/O functions (fs.readFileSync, etc.)
   - Use async versions (fs.promises.readFile)
   - Move CPU work to workers

## Common Mistakes

### ❌ Blocking the Event Loop

```javascript
// BAD: Synchronous file read blocks event loop.
app.get("/data", (req, res) => {
    const data = fs.readFileSync('large-file.json');  // Blocks!
    res.json(JSON.parse(data));
});
```

### ✅ Non-blocking Alternative

```javascript
// GOOD: Async file read doesn't block.
app.get("/data", async (req, res, next) => {
    try {
        const data = await fs.promises.readFile('large-file.json');
        res.json(JSON.parse(data));
    } catch (error) {
        next(error);
    }
});
```

### ❌ Not Handling Errors

```javascript
// BAD: Unhandled promise rejection.
app.get("/users/:id", async (req, res) => {
    const user = await db.getUser(req.params.id);  // What if this throws?
    res.json(user);
});
```

### ✅ Proper Error Handling

```javascript
// GOOD: Errors caught and handled.
app.get("/users/:id", async (req, res, next) => {
    try {
        const user = await db.getUser(req.params.id);
        res.json(user);
    } catch (error) {
        next(error);  // Pass to error handler middleware
    }
});
```

## Summary

Async operations in Express.js are essential for: High performance (handle thousands of concurrent requests), efficient resource usage (event loop handles I/O), better scalability (single thread, low memory), and non-blocking I/O (database, APIs, files).

**Remember:** Use async for I/O-bound operations, use worker threads for CPU-bound work, always handle errors, and never block the event loop.

