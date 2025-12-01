# CORS Configuration: Cross-Origin Resource Sharing

CORS (Cross-Origin Resource Sharing) allows browsers to make requests to different origins. Understanding CORS is essential for API integration.

## What is CORS?

**CORS** is a security mechanism that allows or restricts cross-origin requests.

### Same-Origin Policy

```javascript
// Same origin: Same protocol, domain, port
https://example.com → https://example.com/api  // ✅ Same origin

// Different origin: Different domain
https://example.com → https://api.example.com  // ❌ Different origin

// CORS allows cross-origin requests
```

## CORS Headers

### Access-Control-Allow-Origin

```javascript
// Allow all origins
'Access-Control-Allow-Origin': '*'

// Allow specific origin
'Access-Control-Allow-Origin': 'https://example.com'
```

### Access-Control-Allow-Methods

```javascript
// Allow specific methods
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
```

### Access-Control-Allow-Headers

```javascript
// Allow specific headers
'Access-Control-Allow-Headers': 'Content-Type, Authorization'
```

## Preflight Requests

**Preflight** is an OPTIONS request sent before actual request for complex requests.

```javascript
// Browser sends preflight for:
// - PUT, DELETE, PATCH methods
// - Custom headers
// - Content-Type other than simple

// Preflight request
OPTIONS /api/users HTTP/1.1
Origin: https://example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type

// Server response
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type
```

## Real-World Examples

### Example 1: CORS Configuration

```javascript
// Express.js CORS middleware
const cors = require('cors');

app.use(cors({
    origin: 'https://example.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
```

## Best Practices

1. **Specific Origins**: Don't use '*' in production
2. **Credentials**: Set credentials: true for cookies
3. **Methods**: Allow only needed methods
4. **Headers**: Allow only needed headers
5. **Preflight**: Handle OPTIONS requests

## Summary

**CORS Configuration:**

1. **Purpose**: Allow cross-origin requests
2. **Headers**: Access-Control-Allow-Origin, Methods, Headers
3. **Preflight**: OPTIONS request for complex requests
4. **Best Practice**: Specific origins, needed methods/headers
5. **Security**: Don't use '*' in production

**Key Takeaway:**
CORS allows cross-origin requests. Configure with Access-Control-Allow-Origin, Methods, and Headers. Handle preflight (OPTIONS) requests. Use specific origins, not '*'. Allow only needed methods and headers. Set credentials: true for cookies.

**CORS Strategy:**
- Specific origins
- Needed methods
- Needed headers
- Handle preflight
- Secure configuration

**Next Steps:**
- Learn [XSS Prevention](xss_prevention.md) for security
- Study [CSRF Prevention](csrf_prevention.md) for attacks
- Master [Security Best Practices](security_best_practices.md) for comprehensive security

