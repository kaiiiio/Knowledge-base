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

---

## 🎯 Interview Questions: JavaScript

### Q1: Explain what promises are in JavaScript and how they solve the "callback hell" problem. What are the three states of a promise, and how do promises represent asynchronous operations?

**Answer:**

**Promises Definition:**

A promise is an object that represents the eventual completion (or failure) of an asynchronous operation and its resulting value. Promises provide a way to handle asynchronous operations more elegantly than callbacks, avoiding the "pyramid of doom" or "callback hell" that occurs with nested callbacks.

**How Promises Solve Callback Hell:**

**1. Chaining:**

Promises enable method chaining with `.then()` and `.catch()`, allowing you to write asynchronous code in a more linear, readable fashion. Instead of nesting callbacks, you chain promise methods, creating a flat structure that's easier to read and maintain.

**2. Error Handling:**

Promises provide centralized error handling with `.catch()`, which catches errors from any point in the promise chain. This is much better than having error handling scattered throughout nested callbacks.

**3. Composition:**

Promises can be easily composed and combined using methods like `Promise.all()`, `Promise.race()`, etc., making it easier to coordinate multiple asynchronous operations.

**4. Separation of Concerns:**

Promises separate the initiation of an async operation from handling its result, making code more modular and easier to reason about.

**Three States of a Promise:**

**1. Pending:**

The initial state of a promise. The promise is neither fulfilled nor rejected. It's waiting for the asynchronous operation to complete. A promise starts in the pending state and remains pending until it's either fulfilled or rejected.

**2. Fulfilled (Resolved):**

The promise has been fulfilled, meaning the asynchronous operation completed successfully. The promise now has a value (the result of the operation). Once fulfilled, a promise cannot change to another state—it's immutable.

**3. Rejected:**

The promise has been rejected, meaning the asynchronous operation failed. The promise now has a reason (typically an error object) explaining why it was rejected. Once rejected, a promise cannot change to another state.

**State Transitions:**

A promise can only transition from pending to either fulfilled or rejected, and once it reaches fulfilled or rejected, it cannot change states. This immutability makes promises predictable and safe to use.

**How Promises Represent Async Operations:**

**1. Future Value:**

A promise represents a value that will be available in the future. You can attach handlers to a promise that will execute when the value becomes available (or when the operation fails).

**2. Placeholder:**

While the async operation is in progress, the promise acts as a placeholder. You can pass the promise around, attach multiple handlers, and compose it with other promises, all before the operation completes.

**3. Result Container:**

Once the operation completes, the promise "contains" the result (or error). Handlers attached to the promise receive this result when they execute.

**4. One-Time Event:**

A promise represents a one-time event—the completion of a single async operation. Once settled (fulfilled or rejected), the promise's state and value are fixed forever.

**System Design Consideration**: Promises are fundamental to modern JavaScript asynchronous programming:
1. **Code Quality**: Promises enable cleaner, more maintainable async code
2. **Error Handling**: Centralized error handling improves reliability
3. **Composition**: Promise methods enable complex async workflows
4. **Foundation**: Promises are the foundation for async/await

Understanding promises is essential for effective JavaScript development. They're not just a library feature—they're a core language mechanism for handling asynchrony, and they form the basis for async/await syntax.

---

### Q2: Explain how async/await works under the hood. How does it relate to promises, and what happens when you use `await` in an async function?

**Answer:**

**Async/Await as Syntactic Sugar:**

Async/await is syntactic sugar over promises. It doesn't introduce a new asynchronous mechanism—it provides a cleaner syntax for working with promises. Under the hood, async functions return promises, and `await` is essentially `.then()` in a more readable form.

**How Async Functions Work:**

**1. Promise Return:**

An `async` function always returns a promise. If you return a value, it's wrapped in a resolved promise. If you throw an error, it's wrapped in a rejected promise. If you return a promise, it's returned as-is.

**2. Automatic Promise Wrapping:**

Even if you don't explicitly return a promise, the function's return value is automatically wrapped in a resolved promise. This means you can use `.then()` on the result of an async function.

**3. Error Handling:**

Errors thrown in an async function are automatically caught and converted to rejected promises. This is why try/catch works with async functions—errors are converted to promise rejections.

**How `await` Works:**

**1. Promise Unwrapping:**

When you use `await` on a promise, it pauses the async function and waits for the promise to settle. If the promise fulfills, `await` returns the fulfilled value. If the promise rejects, `await` throws the rejection reason (which can be caught with try/catch).

**2. Execution Pausing:**

`await` pauses the execution of the async function at that point. The function doesn't block the JavaScript thread—control returns to the caller, and the async function resumes when the awaited promise settles.

**3. Microtask Queue:**

When a promise settles, the continuation of the async function (the code after `await`) is scheduled as a microtask. This ensures it runs before the next event loop iteration, maintaining the expected execution order.

**4. Sequential Execution:**

Multiple `await` statements execute sequentially. Each `await` waits for the previous one to complete before continuing, creating a synchronous-looking flow for asynchronous operations.

**Transformation Example:**

An async function with `await` is essentially transformed into a promise chain. The code after each `await` becomes a `.then()` callback, and errors are handled with `.catch()`.

**System Design Consideration**: Understanding how async/await works under the hood is important for:
1. **Debugging**: Understanding execution flow and error handling
2. **Performance**: Knowing when operations run in parallel vs. sequentially
3. **Error Handling**: Understanding how errors propagate in async functions
4. **Promise Integration**: Knowing how to mix async/await with promise methods

Async/await makes asynchronous code look and feel synchronous, but it's still asynchronous under the hood. The function pauses at `await`, but JavaScript continues executing other code. This understanding is crucial for writing correct async code and debugging async issues.

---

### Q3: Explain the difference between `Promise.all()`, `Promise.allSettled()`, `Promise.race()`, and `Promise.any()`. When would you use each, and what are their behaviors?

**Answer:**

**Promise.all():**

`Promise.all()` takes an array of promises and returns a promise that fulfills when all input promises fulfill, or rejects as soon as any input promise rejects. If all promises fulfill, the returned promise fulfills with an array of all fulfillment values in the same order. If any promise rejects, the returned promise immediately rejects with that rejection reason.

**Use Cases:**
- When you need all operations to succeed
- When you need results in a specific order
- When you want to fail fast if any operation fails

**Promise.allSettled():**

`Promise.allSettled()` takes an array of promises and returns a promise that fulfills when all input promises have settled (either fulfilled or rejected). The returned promise always fulfills (never rejects) with an array of objects describing each promise's outcome. Each object has a `status` property (`'fulfilled'` or `'rejected'`) and either a `value` or `reason` property.

**Use Cases:**
- When you need to know the outcome of all operations, regardless of success or failure
- When you want to handle partial failures gracefully
- When you need to process results even if some operations fail

**Promise.race():**

`Promise.race()` takes an array of promises and returns a promise that settles (fulfills or rejects) as soon as the first input promise settles. The returned promise takes the outcome (fulfillment value or rejection reason) of the first promise to settle.

**Use Cases:**
- When you want the first result, regardless of success or failure
- For implementing timeouts (race a promise against a timeout promise)
- When you want to cancel operations once one completes

**Promise.any():**

`Promise.any()` takes an array of promises and returns a promise that fulfills as soon as any input promise fulfills, or rejects only if all input promises reject. If any promise fulfills, the returned promise fulfills with that fulfillment value. If all promises reject, the returned promise rejects with an `AggregateError` containing all rejection reasons.

**Use Cases:**
- When you want the first successful result
- For fallback strategies (try multiple sources, use the first that succeeds)
- When you want to ignore failures unless everything fails

**Key Differences:**

**1. Fulfillment Condition:**
- `Promise.all()`: All must fulfill
- `Promise.allSettled()`: All must settle (always fulfills)
- `Promise.race()`: First to settle (any outcome)
- `Promise.any()`: First to fulfill (ignores rejections)

**2. Rejection Behavior:**
- `Promise.all()`: Rejects on first rejection
- `Promise.allSettled()`: Never rejects
- `Promise.race()`: Rejects if first to settle is a rejection
- `Promise.any()`: Only rejects if all reject

**3. Result Format:**
- `Promise.all()`: Array of values
- `Promise.allSettled()`: Array of outcome objects
- `Promise.race()`: Single value or rejection
- `Promise.any()`: Single value or AggregateError

**System Design Consideration**: Understanding these promise combinators is crucial for:
1. **Parallel Operations**: Coordinating multiple async operations
2. **Error Handling**: Choosing the right strategy for handling multiple promises
3. **Performance**: Understanding when operations run in parallel vs. sequentially
4. **Resilience**: Implementing fallback and timeout strategies

Each combinator serves a different purpose in managing multiple asynchronous operations. Choosing the right one depends on whether you need all results, the first result, or can handle partial failures.

---

### Q4: Explain the microtask queue and how it relates to promise execution. How does the microtask queue differ from the macrotask queue, and why is this important for promise behavior?

**Answer:**

**Microtask Queue Definition:**

The microtask queue is a queue of tasks that are executed after the current execution context completes but before the next event loop iteration. Promises use the microtask queue—when a promise settles, its `.then()` or `.catch()` callbacks are added to the microtask queue and executed before any macrotasks.

**How Promises Use Microtask Queue:**

**1. Callback Scheduling:**

When a promise settles (fulfills or rejects), its attached handlers (`.then()`, `.catch()`, `.finally()`) are scheduled as microtasks, not regular tasks. This means they execute very soon after the promise settles, before the next event loop iteration.

**2. Execution Order:**

Microtasks have higher priority than macrotasks. After the current JavaScript execution completes, all microtasks are processed before any macrotasks (like `setTimeout` callbacks) are processed.

**3. Promise Chaining:**

In a promise chain, each `.then()` returns a new promise, and when that promise settles, its callbacks are also scheduled as microtasks. This ensures promise chains execute in the correct order.

**Microtask vs. Macrotask Queue:**

**Macrotask Queue:**

The macrotask queue contains tasks like:
- `setTimeout` and `setInterval` callbacks
- I/O operations
- UI rendering
- Script execution

These tasks are processed one per event loop iteration, after all microtasks are processed.

**Microtask Queue:**

The microtask queue contains tasks like:
- Promise callbacks (`.then()`, `.catch()`, `.finally()`)
- `queueMicrotask()` callbacks
- MutationObserver callbacks

These tasks are processed after the current execution context but before the next event loop iteration, and all microtasks are processed before any macrotasks.

**Execution Order:**

**1. Current Code:**

JavaScript executes the current code synchronously.

**2. Microtasks:**

After the current code completes, all microtasks are processed. This includes all promise callbacks that are ready to execute.

**3. Macrotasks:**

Only after all microtasks are processed does the event loop move to the next iteration and process macrotasks.

**Why This Matters:**

**1. Predictable Ordering:**

The microtask queue ensures that promise callbacks execute in a predictable order, before other asynchronous operations like `setTimeout`.

**2. Synchronous-Looking Async:**

This is why async/await feels synchronous—the microtask queue ensures that code after `await` runs as soon as the promise settles, before other async operations.

**3. No Starvation:**

Because microtasks are processed before macrotasks, and all microtasks are processed before moving on, the microtask queue doesn't starve the event loop (though creating too many microtasks can still cause issues).

**System Design Consideration**: Understanding the microtask queue is important for:
1. **Execution Order**: Understanding when promise callbacks execute relative to other async operations
2. **Debugging**: Understanding why code executes in a certain order
3. **Performance**: Being aware that microtasks execute synchronously (blocking) until the queue is empty
4. **Async/Await**: Understanding why async/await feels synchronous

The microtask queue is a key part of how JavaScript handles asynchronous operations. It ensures that promises (and async/await) have predictable, high-priority execution, which is essential for the synchronous-looking async code that modern JavaScript enables.

---

### Q5: Explain how error handling works with promises and async/await. How do errors propagate in promise chains, and how does try/catch work with async functions?

**Answer:**

**Error Handling in Promises:**

**1. Rejection Propagation:**

When a promise is rejected, the rejection propagates through the promise chain until it's caught by a `.catch()` handler. If no `.catch()` is present, the rejection becomes an "unhandled promise rejection."

**2. `.catch()` Method:**

The `.catch()` method is used to handle rejections in promise chains. It catches rejections from the promise it's attached to and any previous promises in the chain that weren't caught. `.catch()` returns a new promise, so you can continue chaining after handling an error.

**3. Error Transformation:**

`.catch()` can transform errors—you can return a value (which fulfills the promise) or throw a new error (which rejects the promise). This allows you to handle errors and either recover or re-throw with additional context.

**4. Unhandled Rejections:**

If a promise is rejected and no `.catch()` handler is attached, it becomes an unhandled rejection. In browsers, this triggers the `unhandledrejection` event. It's important to always handle promise rejections to avoid unhandled rejections.

**Error Handling in Async/Await:**

**1. Try/Catch:**

Async functions can use try/catch blocks to handle errors, just like synchronous code. When an `await`ed promise rejects, the rejection is thrown as an exception, which can be caught by try/catch.

**2. Error Propagation:**

Errors thrown in an async function (either explicitly thrown or from rejected promises) are automatically converted to promise rejections. If not caught, they become unhandled rejections.

**3. Natural Error Handling:**

Try/catch in async functions feels natural because errors propagate synchronously through the try/catch block, even though the underlying operations are asynchronous.

**4. Finally Blocks:**

`finally` blocks work with async functions just like with regular functions, executing cleanup code regardless of whether the async function succeeds or fails.

**Error Propagation Patterns:**

**1. Promise Chain:**

Errors propagate down the chain until caught. Each `.catch()` can handle the error or let it propagate further.

**2. Async Function:**

Errors propagate up the call stack (through try/catch blocks) until caught. If not caught, they become promise rejections.

**3. Mixed Patterns:**

You can mix promises and async/await. Errors from promises can be caught with try/catch in async functions, and errors from async functions can be caught with `.catch()` when the async function is called.

**Best Practices:**

**1. Always Handle Errors:**

Always use `.catch()` with promises or try/catch with async/await. Never leave promise rejections unhandled.

**2. Specific Error Handling:**

Handle errors as close to their source as possible, but also have global error handlers for unexpected errors.

**3. Error Context:**

When re-throwing errors, add context to help with debugging. Transform errors to include useful information.

**4. Cleanup:**

Use `finally` blocks (or `.finally()` with promises) for cleanup code that must run regardless of success or failure.

**System Design Consideration**: Proper error handling is crucial for:
1. **Reliability**: Ensuring errors don't crash applications
2. **Debugging**: Providing useful error information
3. **User Experience**: Handling errors gracefully
4. **Observability**: Logging and monitoring errors

Understanding how errors propagate in promises and async/await is essential for writing robust asynchronous code. Errors in async code can be subtle because they might not be immediately obvious, so proper error handling is even more important than in synchronous code.

