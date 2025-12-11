# Async Generators & for-await-of: Asynchronous Iteration

Async generators combine generators with async/await, enabling asynchronous iteration over data streams.

## Async Generators

**Async generators** are generator functions that yield promises.

### Basic Async Generator

```javascript
// Async generator function
async function* asyncGenerator() {
    yield Promise.resolve(1);
    yield Promise.resolve(2);
    yield Promise.resolve(3);
}

// Use with for-await-of
(async () => {
    for await (const value of asyncGenerator()) {
        console.log(value);  // 1, 2, 3
    }
})();
```

### Async Generator with await

```javascript
// Async generator with await
async function* fetchPages() {
    let page = 1;
    while (true) {
        const response = await fetch(`/api/data?page=${page}`);
        const data = await response.json();
        
        if (data.length === 0) {
            break;
        }
        
        yield data;
        page++;
    }
}

// Iterate over pages
(async () => {
    for await (const page of fetchPages()) {
        console.log('Page:', page);
    }
})();
```

## for-await-of

**for-await-of** iterates over async iterables.

### Basic Usage

```javascript
// for-await-of with async generator
async function* numberGenerator() {
    for (let i = 1; i <= 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        yield i;
    }
}

(async () => {
    for await (const num of numberGenerator()) {
        console.log(num);  // 1, 2, 3, 4, 5 (with delays)
    }
})();
```

### With Async Iterables

```javascript
// Any async iterable works
async function* asyncIterable() {
    yield 1;
    yield 2;
    yield 3;
}

for await (const value of asyncIterable()) {
    console.log(value);
}
```

## Real-World Examples

### Example 1: Streaming Data

```javascript
// Stream data from API
async function* streamData(url) {
    const response = await fetch(url);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    try {
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            yield chunk;
        }
    } finally {
        reader.releaseLock();
    }
}

// Process stream
(async () => {
    for await (const chunk of streamData('/api/stream')) {
        console.log('Chunk:', chunk);
    }
})();
```

### Example 2: Paginated API

```javascript
// Fetch paginated data
async function* fetchAllPages(baseUrl) {
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
        const response = await fetch(`${baseUrl}?page=${page}`);
        const data = await response.json();
        
        yield data.items;
        
        hasMore = data.hasMore;
        page++;
    }
}

// Process all pages
(async () => {
    for await (const items of fetchAllPages('/api/items')) {
        items.forEach(item => {
            console.log('Item:', item);
        });
    }
})();
```

### Example 3: Event Stream

```javascript
// Process event stream
async function* eventStream() {
    const eventSource = new EventSource('/api/events');
    
    for await (const event of eventSource) {
        yield JSON.parse(event.data);
    }
}

// Handle events
(async () => {
    for await (const event of eventStream()) {
        console.log('Event:', event);
    }
})();
```

## Async Iterator Protocol

```javascript
// Async iterable must have Symbol.asyncIterator
const asyncIterable = {
    async *[Symbol.asyncIterator]() {
        yield Promise.resolve(1);
        yield Promise.resolve(2);
        yield Promise.resolve(3);
    }
};

for await (const value of asyncIterable) {
    console.log(value);
}
```

## Error Handling

```javascript
// Error handling in async generators
async function* generatorWithErrors() {
    try {
        yield 1;
        throw new Error('Error occurred');
        yield 2;
    } catch (error) {
        yield `Error: ${error.message}`;
    }
}

(async () => {
    try {
        for await (const value of generatorWithErrors()) {
            console.log(value);
        }
    } catch (error) {
        console.error('Outer error:', error);
    }
})();
```

## Best Practices

1. **Use for Async Streams**: Perfect for streaming data
2. **Error Handling**: Handle errors appropriately
3. **Resource Cleanup**: Clean up resources in finally
4. **Memory**: Be aware of memory usage for large streams
5. **Compatibility**: Check browser support

## Summary

**Async Generators & for-await-of:**

1. **Async Generators**: Generators that yield promises
2. **for-await-of**: Iterates over async iterables
3. **Use Cases**: Streaming, pagination, event streams
4. **Error Handling**: Handle errors in generators
5. **Best Practice**: Use for async data streams

**Key Takeaway:**
Async generators combine generators with async/await. for-await-of iterates over async iterables. Perfect for streaming data, paginated APIs, and event streams. Handle errors appropriately. Clean up resources in finally blocks.

**Async Generator Strategy:**
- Use for async streams
- Handle errors
- Clean up resources
- Memory efficient
- Streaming data

**Next Steps:**
- Learn [Generators](generators_iterators.md) for basics
- Study [Async/Await](async_await_promises.md) for promises
- Master [Streams](../15_streams_pipelines_data_processing/) for data processing

---

## 🎯 Interview Questions: JavaScript

### Q1: Explain what async generators are and how they combine generators with asynchronous operations. How do async generators differ from regular generators?

**Answer:**

**Async Generators Definition:**

Async generators are generator functions that can yield promises and handle asynchronous operations. They're defined using `async function*` syntax, combining the `async` keyword (for asynchronous operations) with the generator syntax (for pausable functions). Async generators yield promises, and when iterated with `for await...of`, they automatically await each yielded promise.

**How They Combine Generators and Async:**

**1. Generator Functionality:**

Async generators have all the features of regular generators—they can pause execution with `yield`, maintain state between yields, and produce sequences of values over time.

**2. Asynchronous Operations:**

Async generators can perform asynchronous operations (like fetching data, reading files, etc.) and yield promises. The `for await...of` loop automatically awaits each yielded promise before continuing.

**3. Sequential Async Processing:**

Async generators enable sequential processing of asynchronous operations in a clean, readable way. Each `yield` can be an async operation, and the generator pauses until that operation completes.

**Differences from Regular Generators:**

**1. Syntax:**

- **Regular Generators**: `function* generator() { yield value; }`
- **Async Generators**: `async function* asyncGenerator() { yield promise; }`

**2. Yielding Values:**

- **Regular Generators**: Yield any value (primitives, objects, etc.)
- **Async Generators**: Typically yield promises (though they can yield other values, which are treated as already-resolved promises)

**3. Iteration:**

- **Regular Generators**: Iterated with `for...of` (synchronous)
- **Async Generators**: Iterated with `for await...of` (asynchronous, awaits promises)

**4. Return Type:**

- **Regular Generators**: Return a synchronous iterator
- **Async Generators**: Return an async iterator (implements `Symbol.asyncIterator`)

**5. Use Cases:**

- **Regular Generators**: Lazy sequences, custom iteration, synchronous data processing
- **Async Generators**: Streaming async data, paginated APIs, event streams, async data processing

**System Design Consideration**: Async generators are powerful for:
1. **Streaming Data**: Processing data as it arrives from async sources
2. **Pagination**: Handling paginated APIs where each page is fetched asynchronously
3. **Event Streams**: Processing events from async event sources
4. **Data Processing**: Processing large datasets that arrive asynchronously

Async generators provide a clean way to work with asynchronous sequences, combining the benefits of generators (lazy evaluation, state management) with asynchronous operations (non-blocking, promise-based).

---

### Q2: Explain how `for await...of` works with async iterables. What is the async iterator protocol, and how does it differ from the regular iterator protocol?

**Answer:**

**`for await...of` Loop:**

The `for await...of` loop is used to iterate over async iterables (objects that implement the async iterator protocol). It's similar to `for...of` but designed for asynchronous iteration. `for await...of` automatically awaits each value from the async iterable before continuing to the next iteration.

**How It Works:**

**1. Getting Async Iterator:**

When `for await...of` encounters an async iterable, it calls the `Symbol.asyncIterator` method to get an async iterator.

**2. Iteration Loop:**

`for await...of` then repeatedly calls the async iterator's `next()` method. Unlike regular iterators, `next()` returns a promise that resolves to `{ value, done }`.

**3. Awaiting Values:**

`for await...of` awaits each promise returned by `next()`, then extracts the `value` and assigns it to the loop variable.

**4. Termination:**

The loop continues until `next()` returns a promise that resolves to `{ done: true }`, at which point the loop terminates.

**5. Error Handling:**

If `next()` rejects or throws an error, the loop terminates, and the error can be caught with try/catch around the loop.

**Async Iterator Protocol:**

**1. `Symbol.asyncIterator` Method:**

An async iterable must implement `Symbol.asyncIterator`, which returns an async iterator object.

**2. Async Iterator Object:**

The async iterator must have a `next()` method that returns a promise. The promise resolves to `{ value: any, done: boolean }`.

**3. Promise-Based:**

Unlike the regular iterator protocol where `next()` returns `{ value, done }` directly, the async iterator protocol's `next()` returns a promise that resolves to `{ value, done }`.

**Differences from Regular Iterator Protocol:**

**1. Symbol:**

- **Regular Iterators**: Use `Symbol.iterator`
- **Async Iterators**: Use `Symbol.asyncIterator`

**2. `next()` Return Type:**

- **Regular Iterators**: `next()` returns `{ value, done }` directly (synchronous)
- **Async Iterators**: `next()` returns a promise that resolves to `{ value, done }` (asynchronous)

**3. Iteration:**

- **Regular Iterators**: Iterated with `for...of` (synchronous)
- **Async Iterators**: Iterated with `for await...of` (asynchronous)

**4. Use Cases:**

- **Regular Iterators**: Synchronous sequences (arrays, strings, etc.)
- **Async Iterators**: Asynchronous sequences (streams, paginated APIs, event sources)

**System Design Consideration**: Understanding the async iterator protocol is important for:
1. **Custom Async Iterables**: Creating objects that can be iterated asynchronously
2. **Streaming**: Working with streaming data sources
3. **API Design**: Designing APIs that work with async iteration
4. **Data Processing**: Processing async data sequences efficiently

The async iterator protocol extends the regular iterator protocol to handle asynchronous sequences. It enables consistent iteration over async data sources, just like the regular iterator protocol enables consistent iteration over synchronous data sources.

---

### Q3: Explain when you would use async generators vs. regular async functions. What are the advantages of async generators for handling streams of asynchronous data?

**Answer:**

**When to Use Async Generators:**

**1. Streaming Data:**

When you need to process data as it arrives from an async source (like a network stream, file stream, or event stream). Async generators allow you to process data incrementally rather than waiting for all data to arrive.

**2. Paginated APIs:**

When working with paginated APIs where you need to fetch multiple pages sequentially. Async generators can yield each page as it's fetched, allowing you to process pages as they arrive.

**3. Infinite Sequences:**

When working with conceptually infinite async sequences (like event streams, real-time data feeds, etc.). Async generators can represent these sequences without loading everything into memory.

**4. Backpressure:**

When you need to control the rate of data processing (backpressure). Async generators allow the consumer to control when the next value is requested, enabling flow control.

**When to Use Regular Async Functions:**

**1. Single Operation:**

When you have a single async operation that returns one result. Regular async functions are simpler and more appropriate for one-time operations.

**2. All Data Needed:**

When you need all data before processing. If you must wait for all data anyway, a regular async function that returns an array is simpler.

**3. Simple Error Handling:**

When error handling is straightforward and doesn't benefit from streaming. Regular async functions with try/catch are simpler for simple error cases.

**Advantages of Async Generators for Streams:**

**1. Memory Efficiency:**

Process data as it arrives rather than loading everything into memory. This is crucial for large datasets or infinite streams.

**2. Early Processing:**

Start processing data as soon as the first values arrive, rather than waiting for all data. This reduces latency and improves user experience.

**3. Backpressure Control:**

The consumer controls when to request the next value, enabling natural backpressure. If the consumer is slow, the generator waits; if fast, it can process quickly.

**4. Composability:**

Async generators can be composed and transformed (like regular generators), enabling powerful data processing pipelines.

**5. Natural Flow:**

The code reads naturally—you iterate over values as they arrive, which matches the mental model of streaming data.

**6. Error Handling:**

Errors can be handled per-item or per-stream, providing fine-grained error handling for streaming scenarios.

**System Design Consideration**: Choosing between async generators and regular async functions depends on:
1. **Data Pattern**: Is data a stream or a single result?
2. **Memory Constraints**: Can all data fit in memory?
3. **Latency Requirements**: Do you need to start processing immediately?
4. **Flow Control**: Do you need backpressure control?

Async generators are the right tool when you're dealing with streams of asynchronous data. They provide memory efficiency, low latency, and natural flow control that regular async functions can't match for streaming scenarios.

---

### Q4: Explain how error handling works with async generators and `for await...of`. How do errors propagate, and what are best practices for handling errors in async iteration?

**Answer:**

**Error Handling in Async Generators:**

**1. Errors in Generator:**

If an error is thrown inside an async generator (either explicitly or from a rejected promise), the error propagates to the caller. When `next()` is called on the async iterator, it returns a rejected promise.

**2. Try/Catch in Generator:**

You can use try/catch inside the async generator to handle errors locally. This allows you to handle errors, transform them, or yield error values instead of throwing.

**3. Error Propagation:**

If an error is not caught inside the generator, it propagates to the `for await...of` loop. The loop terminates, and the error can be caught with try/catch around the loop.

**Error Handling with `for await...of`:**

**1. Loop Termination:**

If `next()` returns a rejected promise, the `for await...of` loop terminates immediately. The error is not caught automatically—you must use try/catch around the loop.

**2. Try/Catch Around Loop:**

To handle errors from async iteration, wrap the `for await...of` loop in a try/catch block. This catches errors from the async generator.

**3. Error from Awaited Promise:**

If a yielded promise rejects, the `for await...of` loop treats it as an error and terminates, allowing try/catch to catch it.

**Best Practices:**

**1. Handle Errors at Appropriate Level:**

Handle errors as close to their source as possible, but also have error handling at the iteration level for unexpected errors.

**2. Graceful Degradation:**

In async generators, consider handling errors and yielding error values or skipping problematic items rather than always throwing. This allows processing to continue.

**3. Resource Cleanup:**

Use `finally` blocks in async generators to ensure resources are cleaned up even if errors occur. This is important for closing connections, files, etc.

**4. Error Context:**

When re-throwing errors, add context to help with debugging. Transform errors to include information about where in the stream the error occurred.

**5. Partial Results:**

Consider yielding partial results or error indicators rather than always throwing. This allows consumers to handle errors per-item rather than failing the entire stream.

**Error Patterns:**

**1. Fail Fast:**

If any error should stop processing, let errors propagate and catch them at the loop level. This is the simplest pattern.

**2. Continue on Error:**

If errors should be handled per-item, catch errors inside the generator and yield error indicators or skip items. This allows processing to continue.

**3. Retry Logic:**

For transient errors, implement retry logic inside the generator. This keeps retry logic encapsulated and allows the consumer to see only successful results.

**System Design Consideration**: Error handling in async iteration requires careful consideration:
1. **Resilience**: Decide whether errors should stop processing or be handled per-item
2. **Resource Management**: Ensure resources are cleaned up even when errors occur
3. **User Experience**: Handle errors gracefully to provide good user experience
4. **Debugging**: Provide enough error context to debug issues

Proper error handling in async generators is crucial for building robust streaming applications. The choice between fail-fast and continue-on-error depends on your use case, but always ensure resources are properly cleaned up.

---

### Q5: Explain how async generators can be used for implementing pagination, event streams, and data processing pipelines. What makes them well-suited for these use cases?

**Answer:**

**Pagination with Async Generators:**

**1. Sequential Page Fetching:**

Async generators can fetch pages sequentially, yielding each page as it's retrieved. The consumer can process pages as they arrive, without waiting for all pages.

**2. Natural API:**

The code reads naturally—you iterate over pages, and each iteration fetches and yields the next page. This is much cleaner than managing pagination state manually.

**3. Memory Efficiency:**

Only one page is in memory at a time (plus any processed data). This is crucial for APIs with many pages or large pages.

**4. Early Termination:**

If the consumer finds what it needs in an early page, it can break out of the loop, and no further pages are fetched. This saves bandwidth and time.

**Event Streams with Async Generators:**

**1. Real-Time Processing:**

Async generators can yield events as they arrive from event sources (like WebSockets, Server-Sent Events, etc.). The consumer processes events in real-time as they occur.

**2. Backpressure:**

The generator naturally handles backpressure—if the consumer is slow, the generator waits. If fast, events are processed quickly.

**3. Clean Abstraction:**

The event source is abstracted away. The consumer just iterates over events, regardless of the underlying event source mechanism.

**4. Error Recovery:**

Errors can be handled per-event or per-stream, allowing the stream to continue even if individual events fail.

**Data Processing Pipelines:**

**1. Composability:**

Async generators can be composed and transformed, enabling powerful data processing pipelines. You can chain generators, filter, map, and transform data as it flows through.

**2. Lazy Evaluation:**

Each stage of the pipeline processes data on-demand, not all at once. This enables efficient processing of large datasets.

**3. Memory Efficiency:**

Data flows through the pipeline incrementally, not all at once. This allows processing datasets larger than available memory.

**4. Parallel Processing:**

Different stages can process data in parallel (with careful design), enabling efficient utilization of resources.

**Why Async Generators Are Well-Suited:**

**1. Natural Abstraction:**

Async generators provide a natural abstraction for sequences of async data. The code reads like synchronous iteration, but handles async operations.

**2. Memory Efficiency:**

They enable processing data incrementally, which is essential for large datasets, infinite streams, or memory-constrained environments.

**3. Flow Control:**

The consumer controls when to request the next value, enabling natural backpressure and flow control.

**4. Composability:**

They can be composed and transformed, enabling powerful, reusable data processing patterns.

**5. Error Handling:**

Errors can be handled at appropriate levels, from per-item to per-stream, providing flexibility in error handling strategies.

**System Design Consideration**: Async generators are ideal for:
1. **Streaming Architectures**: Building systems that process data as it arrives
2. **API Design**: Creating APIs that work with paginated or streaming data
3. **Data Processing**: Building efficient data processing pipelines
4. **Real-Time Systems**: Handling real-time event streams

Async generators provide a powerful, elegant way to work with asynchronous sequences. They're particularly well-suited for scenarios where data arrives over time, needs to be processed incrementally, or is too large to fit in memory. They combine the benefits of generators (lazy evaluation, state management) with asynchronous operations (non-blocking, promise-based) to create a powerful tool for modern JavaScript development.

