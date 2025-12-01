# Fetch API vs XHR: Modern HTTP Clients

The Fetch API and XMLHttpRequest (XHR) are two ways to make HTTP requests in browsers. Understanding both helps choose the right tool.

## Fetch API

**Fetch API** is the modern, promise-based API for HTTP requests.

### Basic Fetch

```javascript
// GET request
fetch('/api/users')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

// POST request
fetch('/api/users', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: 'John' })
})
    .then(response => response.json())
    .then(data => console.log(data));
```

### Fetch with Async/Await

```javascript
async function fetchUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}
```

## XMLHttpRequest (XHR)

**XHR** is the traditional API for HTTP requests.

### Basic XHR

```javascript
const xhr = new XMLHttpRequest();

xhr.open('GET', '/api/users');
xhr.onload = function() {
    if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        console.log(data);
    }
};
xhr.onerror = function() {
    console.error('Request failed');
};
xhr.send();
```

## Comparison

### Fetch API Advantages

```javascript
// ✅ Promise-based
// ✅ Cleaner syntax
// ✅ Built-in JSON parsing
// ✅ Stream support
// ✅ Modern API
```

### XHR Advantages

```javascript
// ✅ Progress tracking
// ✅ Request cancellation
// ✅ Older browser support
// ✅ More control
```

## Real-World Examples

### Example 1: Fetch with Error Handling

```javascript
async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Request failed');
        }
        
        return await response.json();
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error('Network error');
        }
        throw error;
    }
}
```

## Best Practices

1. **Use Fetch**: For modern browsers
2. **Error Handling**: Check response.ok
3. **Headers**: Set appropriate headers
4. **CORS**: Handle CORS properly
5. **Abort**: Use AbortController for cancellation

## Summary

**Fetch API vs XHR:**

1. **Fetch**: Modern, promise-based, cleaner
2. **XHR**: Traditional, more control, progress
3. **Choose**: Fetch for modern, XHR for legacy
4. **Best Practice**: Use Fetch, handle errors
5. **Features**: Both support cancellation, streaming

**Key Takeaway:**
Fetch API is modern and promise-based, making it easier to use. XHR provides more control and progress tracking. Use Fetch for modern browsers. Handle errors properly. Use AbortController for cancellation. Both support streaming and cancellation.

**HTTP Client Strategy:**
- Use Fetch for modern
- Handle errors
- Set headers
- Use AbortController
- Consider XHR for legacy

**Next Steps:**
- Learn [HTTP Fundamentals](http_fundamentals.md) for protocols
- Study [Caching Strategies](caching_strategies.md) for performance
- Master [WebSockets](websockets_sse.md) for real-time

