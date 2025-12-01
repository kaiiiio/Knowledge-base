# Promises Internals: Job Queue and Unhandled Rejection

Understanding promise internals helps debug async code and handle errors properly.

## Promise States

**Promise** has three states: pending, fulfilled, rejected.

### State Transitions

```javascript
// Pending: Initial state
const promise = new Promise((resolve, reject) => {
    // Pending state
});

// Fulfilled: Resolved successfully
promise.then(value => {
    // Fulfilled state
});

// Rejected: Failed
promise.catch(error => {
    // Rejected state
});
```

## Job Queue

**Job Queue** (microtask queue) processes promise callbacks.

### Promise Callback Execution

```javascript
// Promise callbacks are microtasks
Promise.resolve().then(() => {
    console.log('Microtask');
});

// Executes before next macrotask
setTimeout(() => {
    console.log('Macrotask');
}, 0);

// Output: Microtask, Macrotask
```

### Promise Chain

```javascript
Promise.resolve(1)
    .then(value => {
        console.log(value);  // 1
        return value + 1;
    })
    .then(value => {
        console.log(value);  // 2
        return value + 1;
    })
    .then(value => {
        console.log(value);  // 3
    });

// All then callbacks are microtasks
// Execute in sequence, before next macrotask
```

## Unhandled Rejection

**Unhandled rejection** occurs when promise is rejected without handler.

### Detecting Unhandled Rejections

```javascript
// Unhandled rejection
Promise.reject('Error');  // Warning: Unhandled promise rejection

// Handle rejection
Promise.reject('Error')
    .catch(error => {
        console.error(error);
    });

// Global handler
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled rejection:', event.reason);
    event.preventDefault();  // Prevent default error
});
```

### Node.js Unhandled Rejection

```javascript
// Node.js unhandled rejection
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection:', reason);
});

// Handle all rejections
Promise.reject('Error')
    .catch(error => {
        console.error(error);
    });
```

## Real-World Examples

### Example 1: Promise Execution Order

```javascript
console.log('1');

Promise.resolve().then(() => {
    console.log('2');  // Microtask
});

Promise.resolve().then(() => {
    console.log('3');  // Microtask
});

setTimeout(() => {
    console.log('4');  // Macrotask
}, 0);

console.log('5');

// Output: 1, 5, 2, 3, 4
// Microtasks execute before macrotasks
```

### Example 2: Error Handling

```javascript
// Promise chain error handling
Promise.resolve()
    .then(() => {
        throw new Error('Error');
    })
    .catch(error => {
        console.error('Caught:', error);
        return 'Recovered';
    })
    .then(value => {
        console.log(value);  // 'Recovered'
    });

// Errors propagate through chain
```

### Example 3: Promise.all Error Handling

```javascript
// Promise.all fails fast
Promise.all([
    Promise.resolve(1),
    Promise.reject('Error'),
    Promise.resolve(3)
])
    .then(values => {
        console.log(values);  // Never executes
    })
    .catch(error => {
        console.error(error);  // 'Error'
    });

// Promise.allSettled waits for all
Promise.allSettled([
    Promise.resolve(1),
    Promise.reject('Error'),
    Promise.resolve(3)
])
    .then(results => {
        console.log(results);
        // [
        //   { status: 'fulfilled', value: 1 },
        //   { status: 'rejected', reason: 'Error' },
        //   { status: 'fulfilled', value: 3 }
        // ]
    });
```

## Best Practices

1. **Always Handle Errors**: Use .catch() or try/catch
2. **Global Handlers**: Set up unhandled rejection handlers
3. **Promise Chain**: Understand execution order
4. **Error Propagation**: Let errors bubble appropriately
5. **Cleanup**: Use finally for cleanup code

## Summary

**Promises Internals:**

1. **States**: Pending, fulfilled, rejected
2. **Job Queue**: Microtask queue for callbacks
3. **Unhandled Rejection**: Rejection without handler
4. **Error Handling**: Always handle errors
5. **Best Practice**: Use .catch(), global handlers

**Key Takeaway:**
Promises have three states. Promise callbacks are microtasks. Unhandled rejections occur when promise rejected without handler. Always handle errors with .catch() or try/catch. Set up global handlers for unhandled rejections. Understand promise execution order.

**Promise Strategy:**
- Always handle errors
- Global handlers
- Understand execution order
- Error propagation
- Cleanup with finally

**Next Steps:**
- Learn [Event Loop](event_loop_deep_dive.md) for execution model
- Study [Async/Await](../01_fundamentals/async_await_promises.md) for syntax
- Master [Error Handling](../16_security/) for security

