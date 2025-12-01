# Cancellation: AbortController and AbortSignal

AbortController provides a way to cancel asynchronous operations like fetch requests and promises.

## AbortController

**AbortController** allows canceling fetch requests and other async operations.

### Basic Usage

```javascript
// Create AbortController
const controller = new AbortController();
const signal = controller.signal;

// Use with fetch
fetch('/api/data', { signal })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => {
        if (error.name === 'AbortError') {
            console.log('Request aborted');
        }
    });

// Cancel request
controller.abort();
```

### AbortSignal Properties

```javascript
const controller = new AbortController();
const signal = controller.signal;

// Check if aborted
console.log(signal.aborted);  // false

controller.abort();
console.log(signal.aborted);  // true

// Listen for abort
signal.addEventListener('abort', () => {
    console.log('Aborted!');
});
```

## Real-World Examples

### Example 1: Timeout with AbortController

```javascript
// Cancel fetch after timeout
function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    return fetch(url, { signal: controller.signal })
        .then(response => {
            clearTimeout(timeoutId);
            return response.json();
        })
        .catch(error => {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        });
}
```

### Example 2: Cancel Multiple Requests

```javascript
// Cancel all requests when component unmounts
class DataFetcher {
    constructor() {
        this.controller = new AbortController();
    }
    
    async fetchData() {
        const response = await fetch('/api/data', {
            signal: this.controller.signal
        });
        return response.json();
    }
    
    cancel() {
        this.controller.abort();
    }
}

const fetcher = new DataFetcher();
fetcher.fetchData();

// Later: cancel all requests
fetcher.cancel();
```

### Example 3: Custom Cancellable Promise

```javascript
// Create cancellable promise
function cancellablePromise(promise) {
    const controller = new AbortController();
    
    const wrappedPromise = new Promise((resolve, reject) => {
        promise
            .then(resolve)
            .catch(reject);
        
        controller.signal.addEventListener('abort', () => {
            reject(new Error('Cancelled'));
        });
    });
    
    wrappedPromise.cancel = () => controller.abort();
    return wrappedPromise;
}

// Use
const task = cancellablePromise(
    new Promise(resolve => setTimeout(resolve, 5000))
);

task.cancel();  // Cancel the promise
```

## Best Practices

1. **Always Handle AbortError**: Check for AbortError in catch
2. **Clean Up**: Clear timeouts when aborting
3. **Reuse Controllers**: Create new controller for each operation
4. **Signal Propagation**: Pass signal to nested operations
5. **User Cancellation**: Allow users to cancel long operations

## Summary

**AbortController & Cancellation:**

1. **AbortController**: Cancel async operations
2. **AbortSignal**: Signal for cancellation
3. **Use Cases**: Timeouts, user cancellation, cleanup
4. **Best Practice**: Always handle AbortError
5. **Cleanup**: Clear timeouts and resources

**Key Takeaway:**
AbortController enables cancellation of async operations. Use with fetch, promises, and custom operations. Always handle AbortError. Clean up resources when aborting. Allow users to cancel long operations. Pass signal to nested operations.

**Cancellation Strategy:**
- Handle AbortError
- Clean up resources
- User cancellation
- Timeout handling
- Signal propagation

**Next Steps:**
- Learn [Promises](promises_internals.md) for promise behavior
- Study [Async/Await](../01_fundamentals/async_await_promises.md) for async patterns
- Master [Error Handling](../16_security/) for error management

