# Event Loop Deep Dive: Macrotasks vs Microtasks

The event loop is JavaScript's concurrency model. Understanding macrotasks vs microtasks is crucial for understanding async behavior.

## Event Loop Overview

**Event Loop** manages the execution of asynchronous code.

### Event Loop Phases

```
┌─────────────────────────┐
│    Call Stack           │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Microtask Queue        │ ← Processed first
│  - Promises             │
│  - queueMicrotask()     │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Macrotask Queue        │ ← Processed after microtasks
│  - setTimeout           │
│  - setInterval          │
│  - I/O operations       │
└─────────────────────────┘
```

## Microtasks

**Microtasks** are high-priority tasks processed before macrotasks.

### Microtask Sources

```javascript
// Promise callbacks
Promise.resolve().then(() => {
    console.log('Microtask');
});

// queueMicrotask
queueMicrotask(() => {
    console.log('Microtask');
});

// MutationObserver callbacks
const observer = new MutationObserver(() => {
    console.log('Microtask');
});
```

### Microtask Execution

```javascript
console.log('1');

Promise.resolve().then(() => {
    console.log('2');  // Microtask
});

queueMicrotask(() => {
    console.log('3');  // Microtask
});

console.log('4');

// Output: 1, 4, 2, 3
// Microtasks execute after current code, before next macrotask
```

## Macrotasks

**Macrotasks** are lower-priority tasks processed after microtasks.

### Macrotask Sources

```javascript
// setTimeout
setTimeout(() => {
    console.log('Macrotask');
}, 0);

// setInterval
setInterval(() => {
    console.log('Macrotask');
}, 1000);

// I/O operations
fs.readFile('file.txt', () => {
    console.log('Macrotask');
});
```

## Execution Order

### Example 1: Basic Order

```javascript
console.log('1');

setTimeout(() => {
    console.log('2');  // Macrotask
}, 0);

Promise.resolve().then(() => {
    console.log('3');  // Microtask
});

console.log('4');

// Output: 1, 4, 3, 2
// 1. Synchronous code (1, 4)
// 2. Microtasks (3)
// 3. Macrotasks (2)
```

### Example 2: Nested Tasks

```javascript
console.log('1');

setTimeout(() => {
    console.log('2');  // Macrotask
    
    Promise.resolve().then(() => {
        console.log('3');  // Microtask (nested)
    });
    
    setTimeout(() => {
        console.log('4');  // Macrotask (nested)
    }, 0);
}, 0);

Promise.resolve().then(() => {
    console.log('5');  // Microtask
});

console.log('6');

// Output: 1, 6, 5, 2, 3, 4
// Microtasks always run before next macrotask
```

## Real-World Examples

### Example 1: Promise Chain

```javascript
Promise.resolve()
    .then(() => {
        console.log('Promise 1');
        return Promise.resolve();
    })
    .then(() => {
        console.log('Promise 2');
    });

queueMicrotask(() => {
    console.log('Microtask');
});

// Output: Promise 1, Promise 2, Microtask
// All microtasks execute together
```

### Example 2: Async/Await

```javascript
async function example() {
    console.log('1');
    
    await Promise.resolve();
    console.log('2');  // After await (microtask)
    
    setTimeout(() => {
        console.log('3');  // Macrotask
    }, 0);
}

example();
console.log('4');

// Output: 1, 4, 2, 3
// await pauses execution, code after is microtask
```

## Best Practices

1. **Understand Order**: Know microtasks vs macrotasks
2. **Avoid Blocking**: Don't block event loop
3. **Use Microtasks**: For high-priority operations
4. **Use Macrotasks**: For lower-priority operations
5. **Profile**: Monitor event loop performance

## Summary

**Event Loop Deep Dive:**

1. **Event Loop**: Manages async execution
2. **Microtasks**: High-priority, processed first
3. **Macrotasks**: Lower-priority, processed after
4. **Execution Order**: Sync → Microtasks → Macrotasks
5. **Best Practice**: Understand order, avoid blocking

**Key Takeaway:**
Event loop processes microtasks before macrotasks. Promises and queueMicrotask create microtasks. setTimeout and I/O create macrotasks. Microtasks always execute before next macrotask. Understand execution order for async code. Avoid blocking event loop.

**Event Loop Strategy:**
- Understand execution order
- Use microtasks for priority
- Avoid blocking
- Profile performance
- Know task types

**Next Steps:**
- Learn [Promises Internals](promises_internals.md) for promise behavior
- Study [Callbacks vs Promises](callbacks_vs_promises_async_await.md) for patterns
- Master [Scheduling](scheduling_throttling.md) for timing

