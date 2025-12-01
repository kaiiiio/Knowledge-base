# Recommended Project Layout for Express.js Applications

A well-organized project structure is crucial for maintainability, scalability, and team collaboration. This guide presents production-ready layouts for Express.js applications.

## Standard Production Layout

```
my_express_app/
├── src/
│   ├── app.js                      # Application entry point
│   ├── server.js                   # Server setup
│   │
│   ├── config/                     # Configuration
│   │   ├── database.js            # Database configuration
│   │   ├── redis.js               # Redis configuration
│   │   └── env.js                 # Environment variables
│   │
│   ├── routes/                     # API routes
│   │   ├── index.js               # Route aggregation
│   │   ├── v1/                    # API versioning
│   │   │   ├── index.js
│   │   │   ├── users.js
│   │   │   ├── auth.js
│   │   │   └── products.js
│   │
│   ├── controllers/                # Route handlers (thin layer)
│   │   ├── userController.js
│   │   ├── authController.js
│   │   └── productController.js
│   │
│   ├── models/                     # Database models (Sequelize/Mongoose)
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── index.js               # Model associations
│   │
│   ├── repositories/               # Data access layer
│   │   ├── baseRepository.js      # Base repository
│   │   ├── userRepository.js
│   │   └── productRepository.js
│   │
│   ├── services/                   # Business logic layer
│   │   ├── userService.js
│   │   ├── authService.js
│   │   └── productService.js
│   │
│   ├── middleware/                 # Custom middleware
│   │   ├── auth.js                # Authentication middleware
│   │   ├── errorHandler.js        # Error handling
│   │   ├── validation.js         # Request validation
│   │   └── logger.js              # Request logging
│   │
│   ├── utils/                      # Utility functions
│   │   ├── jwt.js                 # JWT helpers
│   │   ├── hashPassword.js       # Password hashing
│   │   └── validators.js          # Validation schemas
│   │
│   └── types/                      # TypeScript types (if using TS)
│       ├── user.types.ts
│       └── common.types.ts
│
├── tests/                          # Test suite
│   ├── unit/
│   │   ├── services.test.js
│   │   └── repositories.test.js
│   ├── integration/
│   │   ├── api.test.js
│   │   └── db.test.js
│   └── fixtures/
│       └── factories.js
│
├── migrations/                     # Database migrations
│   └── 20240101000000-create-users.js
│
├── scripts/                        # Utility scripts
│   └── seed.js
│
├── .env                            # Environment variables (not in git)
├── .env.example                    # Example environment file
├── .gitignore
├── package.json                    # Dependencies
├── package-lock.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Detailed Breakdown

### 1. `src/app.js` - Application Entry Point

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./middleware/logger');
const routes = require('./routes');

// Express app: Initialize Express application.
const app = express();

// Security middleware: Helmet sets various HTTP headers for security.
app.use(helmet());

// CORS: Allow cross-origin requests from frontend.
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// Body parsing: Parse JSON and URL-encoded request bodies.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging: Log all HTTP requests.
app.use(morgan('combined'));
app.use(logger);

// Routes: Include all API routes.
app.use('/api/v1', routes);

// Health check: Simple endpoint to verify server is running.
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling: Must be last middleware to catch all errors.
app.use(errorHandler);

module.exports = app;
```

**Explanation:**
The `app.js` file sets up the Express application, middleware (security, CORS, logging), and includes routes. Error handling middleware is added last to catch all errors.

### 2. `src/server.js` - Server Setup

```javascript
const app = require('./app');
const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');

const PORT = process.env.PORT || 3000;

// Start server: Initialize database, Redis, then start HTTP server.
async function startServer() {
    try {
        // Connect to database: Initialize database connection pool.
        await connectDB();
        console.log('✅ Database connected');
        
        // Connect to Redis: Initialize Redis connection.
        await connectRedis();
        console.log('✅ Redis connected');
        
        // Start HTTP server: Listen on specified port.
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown: Close connections on process termination.
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await closeConnections();
    process.exit(0);
});

startServer();
```

**Explanation:**
The `server.js` file handles server startup, database connections, and graceful shutdown. It ensures all connections are established before accepting requests.

### 3. `src/config/env.js` - Configuration Management

```javascript
require('dotenv').config();

// Configuration: Centralized environment variable management.
const config = {
    // Application settings
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 3000,
    PROJECT_NAME: process.env.PROJECT_NAME || 'My Express App',
    
    // Database: PostgreSQL connection string.
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/mydb',
    
    // Redis: Cache/session storage URL.
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    
    // Security: JWT token configuration.
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30m',
    
    // CORS: Allowed origins for cross-origin requests.
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// Validation: Ensure required environment variables are set.
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
requiredEnvVars.forEach(varName => {
    if (!config[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
    }
});

module.exports = config;
```

**Explanation:**
Configuration is centralized in `env.js` using `dotenv`. This ensures type safety and validation of required environment variables. Other parts of the app import `config` from here.

### 4. `src/routes/v1/users.js` - Route Handlers

```javascript
const express = require('express');
const router = express.Router();

const { authenticate } = require('../../../middleware/auth');
const { validateRequest } = require('../../../middleware/validation');
const userController = require('../../../controllers/userController');
const { createUserSchema, updateUserSchema } = require('../../../utils/validators');

// GET /users/:id: Get user by ID (requires authentication).
router.get('/:id', authenticate, userController.getUserById);

// POST /users: Create new user (with validation).
router.post('/', validateRequest(createUserSchema), userController.createUser);

// PUT /users/:id: Update user (requires auth + validation).
router.put('/:id', authenticate, validateRequest(updateUserSchema), userController.updateUser);

// DELETE /users/:id: Delete user (requires auth).
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router;
```

**Explanation:**
Routes are thin - they just define endpoints and apply middleware. Business logic is in controllers, validation is in middleware.

### 5. `src/controllers/userController.js` - Controller Layer

```javascript
const userService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/response');

// Controller: Thin layer that handles HTTP request/response.
class UserController {
    // GET /users/:id: Get user by ID.
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(parseInt(id));
            
            if (!user) {
                return res.status(404).json(errorResponse('User not found'));
            }
            
            res.json(successResponse(user));
        } catch (error) {
            next(error);  // Pass to error handler
        }
    }
    
    // POST /users: Create new user.
    async createUser(req, res, next) {
        try {
            const userData = req.body;  // Already validated by middleware
            const user = await userService.createUser(userData);
            
            res.status(201).json(successResponse(user));
        } catch (error) {
            next(error);
        }
    }
    
    // PUT /users/:id: Update user.
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const updates = req.body;  // Already validated
            const user = await userService.updateUser(parseInt(id), updates);
            
            res.json(successResponse(user));
        } catch (error) {
            next(error);
        }
    }
    
    // DELETE /users/:id: Delete user.
    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            await userService.deleteUser(parseInt(id));
            
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
```

**Explanation:**
Controllers handle HTTP request/response. They call services for business logic and format responses. Errors are passed to error handling middleware.

### 6. `src/services/userService.js` - Business Logic Layer

```javascript
const userRepository = require('../repositories/userRepository');
const { NotFoundError, ValidationError } = require('../utils/errors');

// Service: Business logic layer, coordinates between controllers and repositories.
class UserService {
    // Get user by ID: Business logic for retrieving user.
    async getUserById(userId) {
        const user = await userRepository.findById(userId);
        
        if (!user) {
            throw new NotFoundError('User not found');
        }
        
        return user;
    }
    
    // Create user: Business logic for creating user (validation, email check).
    async createUser(userData) {
        // Business validation: Check if email already exists.
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new ValidationError('Email already exists');
        }
        
        // Create user: Delegate to repository.
        return await userRepository.create(userData);
    }
    
    // Update user: Business logic for updating user.
    async updateUser(userId, updates) {
        // Check if user exists: Business rule.
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        
        // Update user: Delegate to repository.
        return await userRepository.update(userId, updates);
    }
    
    // Delete user: Business logic for deleting user.
    async deleteUser(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        
        await userRepository.delete(userId);
    }
}

module.exports = new UserService();
```

**Explanation:**
Services contain business logic. They coordinate between controllers and repositories, handle business rules (like email uniqueness), and throw appropriate errors.

### 7. `src/repositories/userRepository.js` - Data Access Layer

```javascript
const { User } = require('../models');
const BaseRepository = require('./baseRepository');

// Repository: Data access layer, handles all database operations.
class UserRepository extends BaseRepository {
    constructor() {
        super(User);  // Pass model to base repository
    }
    
    // Find by email: Custom query method.
    async findByEmail(email) {
        return await this.model.findOne({ where: { email } });
    }
    
    // Find with orders: Include related data.
    async findWithOrders(userId) {
        return await this.model.findByPk(userId, {
            include: ['orders']  // Eager load orders
        });
    }
}

module.exports = new UserRepository();
```

**Explanation:**
Repositories handle all database operations. They extend a base repository for common CRUD operations and add custom query methods.

## Best Practices

### 1. **Separation of Concerns**
- **Routes**: Define endpoints and middleware
- **Controllers**: Handle HTTP request/response
- **Services**: Business logic
- **Repositories**: Database operations

### 2. **Dependency Injection**
Use dependency injection for testability:

```javascript
// Service with dependency injection: Easy to test with mocks.
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    
    async getUserById(id) {
        return await this.userRepository.findById(id);
    }
}

// Usage
const userService = new UserService(userRepository);
```

### 3. **API Versioning**
Use version prefixes for API evolution:

```javascript
// v1 routes
app.use('/api/v1', v1Routes);

// v2 routes (when needed)
app.use('/api/v2', v2Routes);
```

### 4. **Error Handling**
Centralized error handling:

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err);
    
    if (err instanceof ValidationError) {
        return res.status(400).json({ error: err.message });
    }
    
    if (err instanceof NotFoundError) {
        return res.status(404).json({ error: err.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
};
```

### 5. **Thin Routes**
Routes should be thin - just define endpoints:

```javascript
// ✅ Good: Thin route
router.get('/:id', authenticate, userController.getUserById);

// ❌ Bad: Business logic in route
router.get('/:id', async (req, res) => {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
});
```

## Alternative Layouts

### Microservices Layout
```
services/
├── user-service/
│   └── [same structure as above]
├── product-service/
│   └── [same structure as above]
└── shared/
    └── common utilities
```

### Monorepo Layout
```
packages/
├── api/              # Express API
├── shared/           # Shared code
└── database/         # Database models
```

## Summary

Effective Express.js project structure requires: Separation of concerns (routes, controllers, services, repositories), dependency injection for testability, API versioning for evolution, centralized error handling, and thin routes (business logic in services).

