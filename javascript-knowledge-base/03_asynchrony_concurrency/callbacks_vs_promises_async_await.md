# Callbacks vs Promises vs Async/Await vs Observables

Understanding different async patterns helps choose the right approach for each situation.

## Callbacks

**Callbacks** are functions passed as arguments to be called later.

### Basic Callback

```javascript
// Callback pattern
function fetchData(callback) {
    setTimeout(() => {
        callback(null, 'data');
    }, 1000);
}

fetchData((error, data) => {
    if (error) {
        console.error(error);
    } else {
        console.log(data);
    }
});
```

### Callback Hell

```javascript
// Callback hell (nested callbacks)
fetchUser(userId, (error, user) => {
    if (error) {
        console.error(error);
    } else {
        fetchPosts(user.id, (error, posts) => {
            if (error) {
                console.error(error);
            } else {
                fetchComments(posts[0].id, (error, comments) => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log(comments);
                    }
                });
            }
        });
    }
});
```

## Promises

**Promises** represent async operations with then/catch.

### Basic Promise

```javascript
// Promise pattern
function fetchData() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('data');
        }, 1000);
    });
}

fetchData()
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error(error);
    });
```

### Promise Chain

```javascript
// Promise chain (flatter than callbacks)
fetchUser(userId)
    .then(user => {
        return fetchPosts(user.id);
    })
    .then(posts => {
        return fetchComments(posts[0].id);
    })
    .then(comments => {
        console.log(comments);
    })
    .catch(error => {
        console.error(error);
    });
```

## Async/Await

**Async/await** provides synchronous-looking syntax for promises.

### Basic Async/Await

```javascript
// Async/await pattern
async function fetchData() {
    try {
        const data = await fetch('/api/data');
        return await data.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}

fetchData()
    .then(data => {
        console.log(data);
    });
```

### Async/Await Chain

```javascript
// Async/await (cleanest syntax)
async function fetchUserData(userId) {
    try {
        const user = await fetchUser(userId);
        const posts = await fetchPosts(user.id);
        const comments = await fetchComments(posts[0].id);
        return { user, posts, comments };
    } catch (error) {
        console.error(error);
        throw error;
    }
}
```

## Observables (RxJS)

**Observables** represent streams of values over time.

### Basic Observable

```javascript
// Observable pattern (RxJS)
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
});

observable.subscribe({
    next: value => console.log(value),
    error: error => console.error(error),
    complete: () => console.log('Complete')
});
```

### Observable Operators

```javascript
// Observable with operators
import { from } from 'rxjs';
import { map, filter } from 'rxjs/operators';

from([1, 2, 3, 4, 5])
    .pipe(
        filter(x => x % 2 === 0),
        map(x => x * 2)
    )
    .subscribe(value => {
        console.log(value);  // 4, 8
    });
```

## Comparison

### When to Use Each

```javascript
// Callbacks:
// - Simple one-time operations
// - Event handlers
// - Legacy APIs

// Promises:
// - Single async operation
// - Better error handling
// - Chainable

// Async/Await:
// - Sequential operations
// - Cleaner syntax
// - Error handling with try/catch

// Observables:
// - Streams of data
// - Multiple values over time
// - Complex async flows
```

## Real-World Examples

### Example 1: File Reading

```javascript
// Callback
fs.readFile('file.txt', (error, data) => {
    if (error) {
        console.error(error);
    } else {
        console.log(data);
    }
});

// Promise
fs.promises.readFile('file.txt')
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error(error);
    });

// Async/Await
try {
    const data = await fs.promises.readFile('file.txt');
    console.log(data);
} catch (error) {
    console.error(error);
}
```

### Example 2: Event Stream

```javascript
// Observable for event stream
import { fromEvent } from 'rxjs';

const clicks = fromEvent(document, 'click');

clicks
    .pipe(
        debounceTime(300),
        map(event => event.target)
    )
    .subscribe(target => {
        console.log('Clicked:', target);
    });
```

## Best Practices

1. **Use Async/Await**: For sequential operations
2. **Use Promises**: For single operations
3. **Use Observables**: For streams and complex flows
4. **Avoid Callbacks**: Prefer promises/async-await
5. **Error Handling**: Always handle errors

## Summary

**Callbacks vs Promises vs Async/Await vs Observables:**

1. **Callbacks**: Simple, but callback hell
2. **Promises**: Better error handling, chainable
3. **Async/Await**: Cleanest syntax, sequential
4. **Observables**: Streams, multiple values
5. **Best Practice**: Use async/await for most cases

**Key Takeaway:**
Callbacks are simple but lead to callback hell. Promises provide better error handling. Async/await offers the cleanest syntax. Observables handle streams of data. Choose based on use case: async/await for sequential, observables for streams.

**Async Pattern Strategy:**
- Async/await for sequential
- Promises for single operations
- Observables for streams
- Avoid callbacks
- Always handle errors

**Next Steps:**
- Learn [Event Loop](event_loop_deep_dive.md) for execution
- Study [Promises Internals](promises_internals.md) for behavior
- Master [RxJS](../15_streams_pipelines_data_processing/rxjs_reactive_streams.md) for observables

