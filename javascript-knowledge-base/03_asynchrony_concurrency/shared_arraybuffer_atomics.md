# SharedArrayBuffer & Atomics: Shared Memory Concurrency

SharedArrayBuffer and Atomics provide low-level shared memory primitives for true parallel execution in JavaScript.

## SharedArrayBuffer

**SharedArrayBuffer** allows sharing memory between multiple workers.

### Basic Usage

```javascript
// main.js
const worker1 = new Worker('worker1.js');
const worker2 = new Worker('worker2.js');

// Create shared buffer
const sharedBuffer = new SharedArrayBuffer(1024);
const view = new Int32Array(sharedBuffer);

// Share with workers
worker1.postMessage(sharedBuffer);
worker2.postMessage(sharedBuffer);

// workers can now access shared memory
```

### Worker Access

```javascript
// worker.js
self.onmessage = (event) => {
    const sharedBuffer = event.data;
    const view = new Int32Array(sharedBuffer);
    
    // Access shared memory
    view[0] = 42;
    
    // Other workers can see this change
};
```

## Atomics

**Atomics** provide atomic operations for safe concurrent access.

### Atomic Operations

```javascript
// Atomic operations are thread-safe
const sharedBuffer = new SharedArrayBuffer(1024);
const view = new Int32Array(sharedBuffer);

// Atomic add
Atomics.add(view, 0, 5);  // Atomically add 5 to view[0]

// Atomic store
Atomics.store(view, 0, 10);  // Atomically store 10

// Atomic load
const value = Atomics.load(view, 0);  // Atomically load value

// Atomic exchange
const old = Atomics.exchange(view, 0, 20);  // Exchange value

// Atomic compare and exchange
const result = Atomics.compareExchange(view, 0, 10, 20);
// If view[0] === 10, set to 20, return old value
```

### Atomic Wait and Notify

```javascript
// Atomic wait: Block until condition
Atomics.wait(view, 0, 0);  // Wait until view[0] !== 0

// Atomic notify: Wake waiting threads
Atomics.notify(view, 0, 1);  // Notify 1 waiting thread

// Example: Synchronization
// Worker 1
Atomics.store(view, 0, 1);
Atomics.notify(view, 0, 1);  // Wake worker 2

// Worker 2
Atomics.wait(view, 0, 0);  // Wait for worker 1
// Now view[0] === 1
```

## Real-World Examples

### Example 1: Counter with Atomics

```javascript
// main.js
const worker1 = new Worker('counter-worker.js');
const worker2 = new Worker('counter-worker.js');

const sharedBuffer = new SharedArrayBuffer(4);
const counter = new Int32Array(sharedBuffer);

worker1.postMessage({ buffer: sharedBuffer, id: 1 });
worker2.postMessage({ buffer: sharedBuffer, id: 2 });

// counter-worker.js
self.onmessage = (event) => {
    const { buffer, id } = event.data;
    const counter = new Int32Array(buffer);
    
    // Increment counter atomically
    for (let i = 0; i < 1000; i++) {
        Atomics.add(counter, 0, 1);
    }
    
    self.postMessage({ id, done: true });
};
```

### Example 2: Lock Implementation

```javascript
// Simple lock using Atomics
class Lock {
    constructor(sharedBuffer, index) {
        this.view = new Int32Array(sharedBuffer);
        this.index = index;
    }
    
    acquire() {
        while (Atomics.compareExchange(this.view, this.index, 0, 1) !== 0) {
            // Spin until lock acquired
            Atomics.wait(this.view, this.index, 1);
        }
    }
    
    release() {
        Atomics.store(this.view, this.index, 0);
        Atomics.notify(this.view, this.index, 1);
    }
}
```

## Security Considerations

```javascript
// SharedArrayBuffer requires:
// - Cross-Origin Isolation headers
// - COOP (Cross-Origin-Opener-Policy)
// - COEP (Cross-Origin-Embedder-Policy)

// Headers required:
// Cross-Origin-Opener-Policy: same-origin
// Cross-Origin-Embedder-Policy: require-corp
```

## Best Practices

1. **Use Atomics**: Always use atomic operations for shared memory
2. **Synchronization**: Use wait/notify for coordination
3. **Security**: Set required headers for SharedArrayBuffer
4. **Performance**: Shared memory is fast but requires care
5. **Debugging**: Shared memory can be tricky to debug

## Summary

**SharedArrayBuffer & Atomics:**

1. **SharedArrayBuffer**: Shared memory between workers
2. **Atomics**: Thread-safe operations
3. **Use Cases**: High-performance parallel computation
4. **Security**: Requires cross-origin isolation
5. **Best Practice**: Always use atomic operations

**Key Takeaway:**
SharedArrayBuffer enables shared memory between workers. Atomics provide thread-safe operations. Use for high-performance parallel computation. Requires cross-origin isolation headers. Always use atomic operations for shared memory access. Use wait/notify for synchronization.

**Shared Memory Strategy:**
- Use atomic operations
- Proper synchronization
- Security headers
- Performance optimization
- Careful debugging

**Next Steps:**
- Learn [Web Workers](web_workers_worker_threads.md) for workers
- Study [Concurrency Primitives](concurrency_primitives_patterns.md) for patterns
- Master [Performance](../21_performance_optimization/) for optimization

