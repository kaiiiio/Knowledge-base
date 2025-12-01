# Express.js Core Concepts: The Pillars of Power

Understanding Express.js core concepts is essential for building robust applications. This guide covers the fundamental building blocks.

## 1. Middleware: The Request Pipeline

Express.js is built around middleware functions. Middleware functions have access to the request object (`req`), the response object (`res`), and the next middleware function in the application's request-response cycle.

### Understanding Middleware

```javascript
// Basic middleware: Logs request details before passing to next handler.
const loggerMiddleware = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();  // Pass control to the next middleware/route handler
};

// Use middleware: Apply to all routes.
app.use(loggerMiddleware);
```

**Explanation:** Middleware runs in order. The `next()` call is crucial; it tells Express to move to the next function in the stack. Without `next()`, the request hangs.

### Middleware Types

**Application-level middleware:**
```javascript
// Applies to all routes: Runs for every request.
app.use(express.json());  // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies
app.use(cors());  // Enable CORS
```

**Router-level middleware:**
```javascript
// Applies to specific routes: Only runs for matching routes.
router.use('/users', authenticateToken);  // Only for /users routes
```

**Error-handling middleware:**
```javascript
// Error handler: Must have 4 parameters (err, req, res, next).
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
```

## 2. Routing: Organizing Endpoints

Express routing matches URL patterns to handler functions.

### Basic Routing

```javascript
// GET route: Handle GET requests.
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;  // Extract from URL
    res.json({ id: userId, name: 'John Doe' });
});

// POST route: Handle POST requests.
app.post('/users', (req, res) => {
    const userData = req.body;  // Request body (parsed by express.json())
    res.status(201).json({ id: 1, ...userData });
});
```

### Router Module

```javascript
// routes/users.routes.js: Organize routes into modules.
const express = require('express');
const router = express.Router();

// Route handlers: Group related routes.
router.get('/', async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const user = await userService.getUser(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
```

```javascript
// app.js: Mount router.
const usersRouter = require('./routes/users.routes');
app.use('/api/v1/users', usersRouter);  // All routes prefixed with /api/v1/users
```

## 3. Request and Response Objects

### Request Object (`req`)

```javascript
app.get('/example/:id', (req, res) => {
    // URL parameters: From route path.
    const id = req.params.id;  // /example/123 → id = "123"
    
    // Query parameters: From URL query string.
    const page = req.query.page;  // /example/123?page=2 → page = "2"
    
    // Request body: Parsed by body-parser middleware.
    const data = req.body;  // POST/PUT request body
    
    // Headers: HTTP headers.
    const auth = req.headers['authorization'];
    
    // Cookies: Parsed cookies (requires cookie-parser).
    const sessionId = req.cookies.sessionId;
    
    // Files: Uploaded files (requires multer).
    const file = req.file;
});
```

### Response Object (`res`)

```javascript
app.get('/example', (req, res) => {
    // Send JSON: Automatically sets Content-Type.
    res.json({ message: 'Hello' });
    
    // Send status: Set status code.
    res.status(201).json({ id: 1 });
    
    // Send text: Plain text response.
    res.send('Hello World');
    
    // Set headers: Custom headers.
    res.setHeader('X-Custom-Header', 'value');
    
    // Set cookies: Requires cookie-parser.
    res.cookie('sessionId', 'abc123', { maxAge: 3600000 });
    
    // Redirect: Redirect to another URL.
    res.redirect('/login');
});
```

## 4. Error Handling

### Try-Catch Pattern

```javascript
// Error handling: Catch errors and pass to error handler.
app.get('/users/:id', async (req, res, next) => {
    try {
        const user = await userService.getUser(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        next(error);  // Pass to error handler middleware
    }
});
```

### Centralized Error Handler

```javascript
// Error handler middleware: Must be last middleware.
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Custom error types: Handle different error types.
    if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message });
    }
    
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
    }
    
    // Default: 500 Internal Server Error
    res.status(500).json({ error: 'Internal server error' });
});
```

## 5. Async/Await in Express

Express supports async route handlers natively (since Express 5, or with express-async-errors).

### Async Route Handlers

```javascript
// Async route: Express handles promises automatically.
app.get('/users/:id', async (req, res, next) => {
    try {
        const user = await userService.getUser(req.params.id);
        res.json(user);
    } catch (error) {
        next(error);  // Pass errors to error handler
    }
});
```

### Express-Async-Errors (Express 4)

```javascript
// Install: npm install express-async-errors
require('express-async-errors');  // Must be imported before routes

// No try-catch needed: Errors automatically passed to error handler.
app.get('/users/:id', async (req, res) => {
    const user = await userService.getUser(req.params.id);
    res.json(user);  // If error occurs, automatically passed to error handler
});
```

## 6. Validation: Request Validation

### Joi Validation

```javascript
const Joi = require('joi');

// Validation schema: Define validation rules.
const userCreateSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    age: Joi.number().integer().min(18).required(),
});

// Validation middleware: Validate request body.
function validateRequest(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map(d => d.message)
            });
        }
        
        req.validatedData = value;  // Attach validated data
        next();
    };
}

// Use validation: Apply to route.
app.post('/users', validateRequest(userCreateSchema), async (req, res) => {
    const user = await userService.createUser(req.validatedData);
    res.status(201).json(user);
});
```

## 7. Path & Query Parameters

### Path Parameters (`/users/:id`)

```javascript
// Path parameter: Extract from URL path.
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;  // Type is string, convert if needed
    const userIdInt = parseInt(req.params.id, 10);
    res.json({ id: userIdInt });
});

// Multiple parameters: Multiple path params.
app.get('/users/:userId/posts/:postId', (req, res) => {
    const { userId, postId } = req.params;
    res.json({ userId, postId });
});
```

### Query Parameters (`/users?page=1&limit=10`)

```javascript
// Query parameters: Optional configuration with defaults.
app.get('/users', (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;  // Default to 1
    const limit = parseInt(req.query.limit, 10) || 10;  // Default to 10
    
    res.json({ page, limit });
});
```

## 8. Static Files

```javascript
// Serve static files: Serve files from directory.
app.use(express.static('public'));  // Serve files from /public directory

// Access: GET /images/logo.png → serves public/images/logo.png
```

## 9. Template Engines

```javascript
// Set template engine: For server-side rendering.
app.set('view engine', 'ejs');
app.set('views', './views');

// Render template: Server-side rendering.
app.get('/profile', (req, res) => {
    res.render('profile', { user: req.user });  // Renders views/profile.ejs
});
```

## Summary

Express.js core concepts include:

1. **Middleware** - Request pipeline functions
2. **Routing** - URL pattern matching
3. **Request/Response** - HTTP request and response handling
4. **Error Handling** - Centralized error management
5. **Async/Await** - Asynchronous route handlers
6. **Validation** - Request data validation
7. **Path/Query Parameters** - URL parameter extraction
8. **Static Files** - Serving static assets
9. **Template Engines** - Server-side rendering

Understanding these concepts is essential for building robust Express.js applications.

