# Web Workers & Worker Threads: Parallel Execution

Web Workers and Worker Threads enable parallel execution in JavaScript, allowing CPU-intensive tasks to run without blocking the main thread.

## Web Workers (Browser)

**Web Workers** run scripts in background threads in the browser.

### Basic Web Worker

```javascript
// main.js
const worker = new Worker('worker.js');

worker.postMessage({ type: 'calculate', data: [1, 2, 3, 4, 5] });

worker.onmessage = (event) => {
    console.log('Result:', event.data);
};

worker.onerror = (error) => {
    console.error('Worker error:', error);
};

// worker.js
self.onmessage = (event) => {
    const { type, data } = event.data;
    
    if (type === 'calculate') {
        const result = data.reduce((sum, num) => sum + num, 0);
        self.postMessage({ result });
    }
};
```

### Dedicated vs Shared Workers

```javascript
// Dedicated Worker: One-to-one communication
const worker = new Worker('worker.js');

// Shared Worker: Multiple scripts can communicate
const sharedWorker = new SharedWorker('shared-worker.js');
sharedWorker.port.onmessage = (event) => {
    console.log(event.data);
};
```

## Worker Threads (Node.js)

**Worker Threads** enable parallel execution in Node.js.

### Basic Worker Thread

```javascript
// main.js
const { Worker } = require('worker_threads');

const worker = new Worker('./worker.js', {
    workerData: { numbers: [1, 2, 3, 4, 5] }
});

worker.on('message', (result) => {
    console.log('Result:', result);
});

worker.on('error', (error) => {
    console.error('Worker error:', error);
});

// worker.js
const { parentPort, workerData } = require('worker_threads');

const { numbers } = workerData;
const result = numbers.reduce((sum, num) => sum + num, 0);

parentPort.postMessage({ result });
```

## Real-World Examples

### Example 1: CPU-Intensive Task

```javascript
// main.js - Web Worker
const worker = new Worker('fibonacci-worker.js');

function calculateFibonacci(n) {
    worker.postMessage({ n });
}

worker.onmessage = (event) => {
    console.log(`Fibonacci(${event.data.n}) = ${event.data.result}`);
};

// fibonacci-worker.js
self.onmessage = (event) => {
    const { n } = event.data;
    
    function fib(num) {
        if (num <= 1) return num;
        return fib(num - 1) + fib(num - 2);
    }
    
    const result = fib(n);
    self.postMessage({ n, result });
};
```

### Example 2: Image Processing

```javascript
// main.js
const worker = new Worker('image-processor.js');

function processImage(imageData) {
    worker.postMessage({ imageData });
}

worker.onmessage = (event) => {
    const processedImage = event.data;
    // Update UI with processed image
};

// image-processor.js
self.onmessage = (event) => {
    const { imageData } = event.data;
    
    // Process image data (CPU-intensive)
    const processed = imageData.map(pixel => {
        // Apply filter
        return processPixel(pixel);
    });
    
    self.postMessage(processed);
};
```

## Message Passing

### Transferable Objects

```javascript
// Transfer ownership (zero-copy)
const buffer = new ArrayBuffer(1024);
worker.postMessage(buffer, [buffer]);  // buffer is transferred

// After transfer, buffer is detached in main thread
```

### Structured Clone

```javascript
// Default: Structured clone (copy)
const data = { name: 'John', age: 30 };
worker.postMessage(data);  // Data is cloned

// Can't transfer functions, symbols, etc.
```

## Best Practices

1. **Use for CPU-Intensive Tasks**: Offload heavy computation
2. **Avoid DOM Access**: Workers can't access DOM
3. **Message Passing**: Use postMessage efficiently
4. **Error Handling**: Always handle errors
5. **Terminate Workers**: Clean up when done

## Summary

**Web Workers & Worker Threads:**

1. **Web Workers**: Browser parallel execution
2. **Worker Threads**: Node.js parallel execution
3. **Use Cases**: CPU-intensive tasks, image processing
4. **Message Passing**: postMessage for communication
5. **Best Practice**: Use for heavy computation, avoid DOM access

**Key Takeaway:**
Web Workers enable parallel execution in browsers. Worker Threads enable parallel execution in Node.js. Use for CPU-intensive tasks. Communicate via postMessage. Workers can't access DOM. Always handle errors and clean up workers.

**Worker Strategy:**
- Use for CPU-intensive tasks
- Efficient message passing
- Error handling
- Clean up workers
- Avoid DOM access

**Next Steps:**
- Learn [Event Loop](event_loop_deep_dive.md) for execution model
- Study [SharedArrayBuffer](shared_arraybuffer_atomics.md) for shared memory
- Master [Performance](../21_performance_optimization/) for optimization

