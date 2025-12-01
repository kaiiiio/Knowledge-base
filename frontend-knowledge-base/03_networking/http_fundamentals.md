# HTTP Fundamentals: Methods, Status Codes, Headers

Understanding HTTP fundamentals is essential for frontend development and API integration.

## HTTP Methods

### GET

**GET** retrieves data from server.

```javascript
// GET request
fetch('/api/users')
    .then(res => res.json());

// No body, idempotent, cacheable
```

### POST

**POST** creates new resources.

```javascript
// POST request
fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'John' })
});

// Has body, not idempotent, not cacheable
```

### PUT

**PUT** updates entire resource.

```javascript
// PUT request
fetch('/api/users/1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'John Updated' })
});

// Has body, idempotent
```

### PATCH

**PATCH** partially updates resource.

```javascript
// PATCH request
fetch('/api/users/1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'John Updated' })
});

// Has body, not necessarily idempotent
```

### DELETE

**DELETE** removes resource.

```javascript
// DELETE request
fetch('/api/users/1', {
    method: 'DELETE'
});

// No body, idempotent
```

## HTTP Status Codes

### 2xx Success

```javascript
// 200 OK: Request succeeded
// 201 Created: Resource created
// 204 No Content: Success, no content
```

### 3xx Redirection

```javascript
// 301 Moved Permanently
// 302 Found (temporary)
// 304 Not Modified: Use cached version
```

### 4xx Client Error

```javascript
// 400 Bad Request: Invalid request
// 401 Unauthorized: Authentication required
// 403 Forbidden: Access denied
// 404 Not Found: Resource not found
// 409 Conflict: Resource conflict
```

### 5xx Server Error

```javascript
// 500 Internal Server Error
// 502 Bad Gateway
// 503 Service Unavailable
// 504 Gateway Timeout
```

## HTTP Headers

### Request Headers

```javascript
fetch('/api/users', {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token',
        'Accept': 'application/json',
        'User-Agent': 'MyApp/1.0'
    }
});
```

### Response Headers

```javascript
// Caching
'Cache-Control': 'max-age=3600'
'ETag': 'W/"abc123"'
'Last-Modified': 'Wed, 21 Oct 2015 07:28:00 GMT'

// CORS
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST'
```

## Real-World Examples

### Example 1: RESTful API Client

```javascript
class APIClient {
    constructor(baseURL, token) {
        this.baseURL = baseURL;
        this.token = token;
    }
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
                ...options.headers
            }
        };
        
        const response = await fetch(url, config);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }
    
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}
```

## Best Practices

1. **Use Appropriate Methods**: GET, POST, PUT, DELETE
2. **Handle Status Codes**: Check response status
3. **Set Headers**: Content-Type, Authorization
4. **Error Handling**: Handle 4xx, 5xx errors
5. **Idempotency**: Use PUT for idempotent updates

## Summary

**HTTP Fundamentals:**

1. **Methods**: GET, POST, PUT, PATCH, DELETE
2. **Status Codes**: 2xx success, 4xx client, 5xx server
3. **Headers**: Request and response headers
4. **Best Practice**: Use appropriate methods, handle errors
5. **RESTful**: Follow REST principles

**Key Takeaway:**
HTTP methods define operations (GET retrieve, POST create, PUT update, DELETE remove). Status codes indicate result (2xx success, 4xx client error, 5xx server error). Headers provide metadata. Use appropriate methods and handle all status codes. Follow RESTful principles.

**HTTP Strategy:**
- Use appropriate methods
- Handle all status codes
- Set proper headers
- Error handling
- RESTful design

**Next Steps:**
- Learn [Caching Strategies](caching_strategies.md) for performance
- Study [CORS](cors_configuration.md) for cross-origin
- Master [WebSockets](websockets_sse.md) for real-time

