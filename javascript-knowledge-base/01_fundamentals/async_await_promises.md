# Async/Await & Promises: Microtask Queue and Promise States

Understanding async/await and promises is essential for handling asynchronous operations in JavaScript.

## Promises

**Promise** represents a value that may be available now or in the future.

### Promise States

```javascript
// Promise has three states:
// 1. Pending: Initial state
// 2. Fulfilled: Operation completed successfully
// 3. Rejected: Operation failed

const promise = new Promise((resolve, reject) => {
    // Pending state
    setTimeout(() => {
        resolve('Success');  // Fulfilled
        // or
        reject('Error');    // Rejected
    }, 1000);
});
```

### Creating Promises

```javascript
// Promise constructor
const promise = new Promise((resolve, reject) => {
    if (condition) {
        resolve(value);  // Fulfill promise
    } else {
        reject(error);  // Reject promise
    }
});

// Promise.resolve
const resolved = Promise.resolve('value');

// Promise.reject
const rejected = Promise.reject('error');
```

### Promise Methods

```javascript
// then: Handle fulfillment
promise.then(
    value => {
        console.log(value);  // Success handler
    },
    error => {
        console.error(error);  // Error handler
    }
);

// catch: Handle rejection
promise
    .then(value => console.log(value))
    .catch(error => console.error(error));

// finally: Always execute
promise
    .then(value => console.log(value))
    .catch(error => console.error(error))
    .finally(() => {
        console.log('Always runs');
    });
```

## Async/Await

**async/await** provides syntactic sugar for promises.

### Basic Async Function

```javascript
// async function returns a promise
async function fetchData() {
    return 'data';
}

// Equivalent to:
function fetchData() {
    return Promise.resolve('data');
}
```

### Await Keyword

```javascript
// await pauses execution until promise settles
async function fetchUser() {
    const response = await fetch('/api/user');
    const user = await response.json();
    return user;
}

// Equivalent to:
function fetchUser() {
    return fetch('/api/user')
        .then(response => response.json());
}
```

### Error Handling

```javascript
// try/catch with async/await
async function fetchUser() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) {
            throw new Error('Network error');
        }
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
```

## Microtask Queue

**Microtask queue** processes promises and other microtasks before macrotasks.

### Execution Order

```javascript
// Macrotasks: setTimeout, setInterval, I/O
// Microtasks: Promises, queueMicrotask

console.log('1');

setTimeout(() => {
    console.log('2');  // Macrotask
}, 0);

Promise.resolve().then(() => {
    console.log('3');  // Microtask
});

console.log('4');

// Output: 1, 4, 3, 2
// Microtasks run before macrotasks
```

### Promise Execution

```javascript
// Promise callbacks are microtasks
Promise.resolve().then(() => {
    console.log('Promise 1');
});

Promise.resolve().then(() => {
    console.log('Promise 2');
});

// Both execute before next macrotask
```

## Real-World Examples

### Example 1: Sequential Async Operations

```javascript
// Sequential execution
async function processData() {
    const user = await fetchUser();
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    return { user, posts, comments };
}

// Parallel execution
async function processDataParallel() {
    const [user, posts, comments] = await Promise.all([
        fetchUser(),
        fetchPosts(),
        fetchComments()
    ]);
    return { user, posts, comments };
}
```

### Example 2: Promise Chaining

```javascript
// Promise chaining
fetch('/api/user')
    .then(response => response.json())
    .then(user => {
        return fetch(`/api/posts/${user.id}`);
    })
    .then(response => response.json())
    .then(posts => {
        console.log(posts);
    })
    .catch(error => {
        console.error(error);
    });

// Async/await equivalent
async function fetchUserPosts() {
    try {
        const userResponse = await fetch('/api/user');
        const user = await userResponse.json();
        const postsResponse = await fetch(`/api/posts/${user.id}`);
        const posts = await postsResponse.json();
        console.log(posts);
    } catch (error) {
        console.error(error);
    }
}
```

### Example 3: Promise Utilities

```javascript
// Promise.all: Wait for all
const [user, posts] = await Promise.all([
    fetchUser(),
    fetchPosts()
]);

// Promise.allSettled: Wait for all (even if some fail)
const results = await Promise.allSettled([
    fetchUser(),
    fetchPosts()
]);

// Promise.race: First to settle
const result = await Promise.race([
    fetchUser(),
    timeout(5000)
]);

// Promise.any: First to fulfill
const result = await Promise.any([
    fetchUser(),
    fetchBackupUser()
]);
```

## Unhandled Rejections

```javascript
// Unhandled promise rejection
Promise.reject('Error');  // Unhandled rejection warning

// Handle rejections
Promise.reject('Error')
    .catch(error => {
        console.error(error);
    });

// Global handler
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled rejection:', event.reason);
    event.preventDefault();
});
```

## Best Practices

1. **Always Handle Errors**: Use try/catch or .catch()
2. **Avoid Promise Constructor**: Use async/await when possible
3. **Parallel Operations**: Use Promise.all for parallel execution
4. **Error Propagation**: Let errors bubble up appropriately
5. **Cleanup**: Use finally for cleanup code

## Summary

**Async/Await & Promises:**

1. **Promises**: Represent async operations
2. **States**: Pending, fulfilled, rejected
3. **async/await**: Syntactic sugar for promises
4. **Microtask Queue**: Processes promises before macrotasks
5. **Best Practice**: Handle errors, use async/await, parallel when possible

**Key Takeaway:**
Promises represent async operations with three states. async/await provides cleaner syntax. Microtask queue processes promises before macrotasks. Always handle errors. Use Promise.all for parallel operations. Understand promise execution order.

**Async Strategy:**
- Use async/await
- Handle errors
- Parallel when possible
- Understand microtask queue
- Avoid promise constructor

**Next Steps:**
- Learn [Async Generators](async_generators_for_await_of.md) for async iteration
- Study [Event Loop](../03_asynchrony_concurrency/event_loop_deep_dive.md) for execution model
- Master [Promises Internals](../03_asynchrony_concurrency/promises_internals.md) for deep dive

