# Event Loop in Node.js: libuv Deep Dive

The event loop is the core of Node.js's asynchronous, non-blocking I/O model. Understanding libuv and the event loop phases is crucial for Node.js development.

## What is the Event Loop?

**Event Loop** is a single-threaded loop that manages asynchronous operations by checking for completed I/O and executing callbacks.

### Event Loop Phases

```
┌───────────────────────────┐
│   timers                  │ ← setTimeout, setInterval
├───────────────────────────┤
│   pending callbacks       │ ← I/O callbacks (deferred)
├───────────────────────────┤
│   idle, prepare           │ ← Internal use
├───────────────────────────┤
│   poll                    │ ← Fetch new I/O events
├───────────────────────────┤
│   check                   │ ← setImmediate callbacks
├───────────────────────────┤
│   close callbacks         │ ← socket.on('close')
└───────────────────────────┘
```

## Phase 1: Timers

**Executes:** `setTimeout()` and `setInterval()` callbacks

```javascript
setTimeout(() => {
    console.log('Timer 1');
}, 0);

setTimeout(() => {
    console.log('Timer 2');
}, 0);

// Both execute in timers phase
```

## Phase 2: Pending Callbacks

**Executes:** Deferred I/O callbacks from previous iteration

```javascript
const fs = require('fs');

fs.readFile('file.txt', (err, data) => {
    // Executes in pending callbacks phase
    console.log('File read');
});
```

## Phase 3: Poll

**Purpose:** Fetch new I/O events and execute I/O callbacks

```javascript
// Poll phase:
// - Executes I/O callbacks
// - Waits for new events (if queue empty)
// - Processes events until queue empty or max time reached
```

## Phase 4: Check

**Executes:** `setImmediate()` callbacks

```javascript
setImmediate(() => {
    console.log('Immediate 1');
});

setImmediate(() => {
    console.log('Immediate 2');
});

// Executes in check phase
```

## Phase 5: Close Callbacks

**Executes:** Close event callbacks (e.g., `socket.on('close')`)

```javascript
const server = require('http').createServer();

server.on('close', () => {
    console.log('Server closed');
    // Executes in close callbacks phase
});
```

## libuv Thread Pool

**libuv** uses a thread pool for blocking operations:

```javascript
// Operations using thread pool:
// - File system operations (fs module)
// - DNS lookups (dns.lookup)
// - Crypto operations (crypto.pbkdf2)
// - Zlib compression

// Default: 4 threads
// Configure: UV_THREADPOOL_SIZE=8

// Example: File read uses thread pool
const fs = require('fs');
fs.readFile('large-file.txt', (err, data) => {
    // Executed in thread pool, callback in event loop
});
```

## Real-World Examples

### Example 1: Event Loop Order

```javascript
console.log('Start');

setTimeout(() => console.log('Timer'), 0);
setImmediate(() => console.log('Immediate'));

process.nextTick(() => console.log('Next Tick'));

Promise.resolve().then(() => console.log('Promise'));

console.log('End');

// Output:
// Start
// End
// Next Tick        ← Microtask (highest priority)
// Promise          ← Microtask
// Timer            ← Macrotask (timers phase)
// Immediate        ← Macrotask (check phase)
```

### Example 2: Blocking Event Loop

```javascript
// ❌ Bad: Blocks event loop
app.get('/slow', (req, res) => {
    // CPU-intensive operation blocks event loop
    let sum = 0;
    for (let i = 0; i < 10000000000; i++) {
        sum += i;
    }
    res.json({ sum });
});

// ✅ Good: Use worker threads
const { Worker } = require('worker_threads');

app.get('/slow', (req, res) => {
    const worker = new Worker('./compute.js');
    worker.on('message', (result) => {
        res.json({ sum: result });
    });
});
```

## Best Practices

1. **Avoid Blocking**: Don't block event loop
2. **Use Worker Threads**: For CPU-intensive tasks
3. **Understand Phases**: Know execution order
4. **Microtasks**: `process.nextTick()` and Promises execute first
5. **Monitor Lag**: Track event loop lag

## Summary

**Event Loop in Node.js:**

1. **Phases**: Timers, pending, poll, check, close
2. **libuv**: Thread pool for blocking operations
3. **Non-blocking**: Single thread handles many requests
4. **Best Practice**: Avoid blocking, use worker threads
5. **Monitoring**: Track event loop lag

**Key Takeaway:**
Node.js event loop has multiple phases (timers, pending, poll, check, close). libuv uses a thread pool for blocking operations. The event loop is single-threaded but handles many concurrent requests. Avoid blocking the event loop. Use worker threads for CPU-intensive tasks.

**Event Loop Strategy:**
- Understand phases
- Avoid blocking
- Use worker threads
- Monitor lag
- Understand microtasks vs macrotasks

**Next Steps:**
- Learn [Streams](streams_backpressure.md) for data processing
- Study [Buffers](buffers_binary_data.md) for binary data
- Master [Child Processes](child_processes_cluster.md) for parallelism

