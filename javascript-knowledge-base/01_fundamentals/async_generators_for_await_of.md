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

