# Data Validation vs Business Validation

Understanding the distinction between data validation (syntax) and business validation (semantics) is crucial for building robust Express.js applications.

## Key Differences

### Data Validation (Syntax)
- **What**: Format, type, structure correctness
- **When**: At API boundary (request/response)
- **Where**: Validation middleware, schema validation (Joi, Zod)
- **Purpose**: Ensure data is well-formed

### Business Validation (Semantics)
- **What**: Business rules, domain logic
- **When**: During business operations
- **Where**: Service layer, domain logic
- **Purpose**: Ensure data makes business sense

## Data Validation with Joi/Zod

### Request Validation

```javascript
const Joi = require('joi');

// userCreateSchema: Joi schema for data validation at API boundary.
const userCreateSchema = Joi.object({
    email: Joi.string().email().required(),  // Data validation: email format
    password: Joi.string().min(8).max(100).required(),  // Length validation
    age: Joi.number().integer().min(0).max(150).required(),  // Range validation
});

// Validation middleware: Validates request body before route handler.
function validateRequest(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body);
        
        if (error) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.details.map(d => d.message)
            });
        }
        
        req.validatedData = value;  // Attach validated data to request
        next();
    };
}

// Express route: Validation happens before function runs.
app.post("/users/", validateRequest(userCreateSchema), (req, res, next) => {
    // req.validatedData is already validated: Format, type, structure checked.
    const userData = req.validatedData;
    // Proceed with business logic
});
```

### Using Zod (TypeScript-friendly)

```javascript
const { z } = require('zod');

// UserCreate: Zod schema for data validation.
const userCreateSchema = z.object({
    email: z.string().email(),  // Data validation: email format
    password: z.string().min(8).max(100),  // Length validation
    age: z.number().int().min(0).max(150),  // Range validation
});

// Validation middleware with Zod: Type-safe validation.
function validateRequest(schema) {
    return (req, res, next) => {
        try {
            req.validatedData = schema.parse(req.body);  // Parse and validate
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors
                });
            }
            next(error);
        }
    };
}
```

## Business Validation in Service Layer

### Domain Rules

```javascript
// services/userService.js
const userRepository = require('../repositories/userRepository');
const { BusinessRuleViolation } = require('../utils/errors');

// UserService: Business validation layer. Enforces domain rules.
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    
    async createUser(userData) {
        // Business validation: Check if email exists (requires DB lookup).
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new BusinessRuleViolation(
                "Email already registered",
                "EMAIL_EXISTS"
            );
        }
        
        // Business validation: Check age restrictions (business rule).
        if (userData.age < 18) {
            throw new BusinessRuleViolation(
                "Must be 18 or older to register",
                "AGE_RESTRICTION"
            );
        }
        
        // Create user: Data already validated by middleware (format/type checked).
        return await this.userRepository.create(userData);
    }
}
```

### Complex Business Rules

```javascript
class OrderService {
    async createOrder(userId, items) {
        // Business validation: User must exist
        const user = await this.userRepository.getById(userId);
        if (!user) {
            throw new BusinessRuleViolation("User not found");
        }
        
        // Business validation: User must be active
        if (!user.is_active) {
            throw new BusinessRuleViolation("User account is inactive");
        }
        
        // Business validation: Check inventory
        for (const item of items) {
            const product = await this.productRepository.getById(item.product_id);
            if (!product) {
                throw new BusinessRuleViolation(
                    `Product ${item.product_id} not found`
                );
            }
            if (product.stock < item.quantity) {
                throw new BusinessRuleViolation(
                    `Insufficient stock for ${product.name}`
                );
            }
        }
        
        // Business validation: Minimum order value
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (total < 50) {
            throw new BusinessRuleViolation("Minimum order value is $50");
        }
        
        // All validations passed, create order
        return await this.orderRepository.create(userId, items);
    }
}
```

## Layered Validation Strategy

### Layer 1: Joi/Zod (Data Validation)

```javascript
const paymentCreateSchema = Joi.object({
    amount: Joi.number().positive().precision(2).required(),  // Positive, 2 decimals
    currency: Joi.string().pattern(/^[A-Z]{3}$/).required(),  // ISO currency code
    payment_method: Joi.string().valid('credit_card', 'debit_card', 'paypal').required(),
});
```

### Layer 2: Service Layer (Business Validation)

```javascript
class PaymentService {
    async processPayment(paymentData, userId) {
        // Business validation: User exists and is active
        const user = await this.userRepository.getById(userId);
        if (!user || !user.is_active) {
            throw new BusinessRuleViolation("Invalid user");
        }
        
        // Business validation: Payment method available for user
        if (paymentData.payment_method === 'paypal') {
            if (!user.paypal_account) {
                throw new BusinessRuleViolation("PayPal account not linked");
            }
        }
        
        // Business validation: Account balance sufficient
        if (paymentData.amount > user.account_balance) {
            throw new BusinessRuleViolation("Insufficient funds");
        }
        
        // Business validation: Daily limit check
        const dailyTotal = await this.getDailyPaymentTotal(userId);
        if (dailyTotal + paymentData.amount > 10000) {
            throw new BusinessRuleViolation("Daily limit exceeded");
        }
        
        // Process payment
        return await this.paymentRepository.create(paymentData);
    }
}
```

## Error Handling

### Custom Exception Types

```javascript
// utils/errors.js
class BusinessRuleViolation extends Error {
    constructor(message, code = null) {
        super(message);
        this.name = 'BusinessRuleViolation';
        this.code = code;
        this.statusCode = 400;
    }
}

class ValidationError extends Error {
    constructor(message, details = []) {
        super(message);
        this.name = 'ValidationError';
        this.details = details;
        this.statusCode = 400;
    }
}

module.exports = { BusinessRuleViolation, ValidationError };
```

### Exception Handler Middleware

```javascript
// middleware/errorHandler.js
const { BusinessRuleViolation, ValidationError } = require('../utils/errors');

// Error handler: Centralized error handling middleware.
function errorHandler(err, req, res, next) {
    console.error(err);
    
    // Business rule violations: Return 400 with business error message.
    if (err instanceof BusinessRuleViolation) {
        return res.status(400).json({
            error: err.message,
            code: err.code
        });
    }
    
    // Validation errors: Return 400 with validation details.
    if (err instanceof ValidationError) {
        return res.status(400).json({
            error: err.message,
            details: err.details
        });
    }
    
    // Server errors: Return 500 (don't expose internal errors).
    res.status(500).json({
        error: 'Internal server error'
    });
}

module.exports = errorHandler;
```

## Best Practices

### 1. **Validate Early (Data Validation)**
Validate at API boundary before business logic:

```javascript
// ✅ Good: Validate in middleware before route handler
app.post("/users/", validateRequest(userCreateSchema), userController.createUser);

// ❌ Bad: Validation in route handler
app.post("/users/", (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ error: 'Email required' });
    }
    // ...
});
```

### 2. **Separate Concerns**
Data validation in middleware, business validation in services:

```javascript
// Middleware: Data validation (format, type)
app.post("/users/", validateRequest(userCreateSchema), userController.createUser);

// Service: Business validation (domain rules)
async createUser(userData) {
    if (await this.emailExists(userData.email)) {
        throw new BusinessRuleViolation("Email exists");
    }
    // ...
}
```

### 3. **Clear Error Messages**
Provide helpful error messages:

```javascript
// ✅ Good: Clear, actionable error
throw new BusinessRuleViolation("Email already registered", "EMAIL_EXISTS");

// ❌ Bad: Vague error
throw new Error("Invalid");
```

## Summary

Effective validation in Express.js requires: Data validation at API boundary (Joi/Zod middleware), business validation in service layer (domain rules), clear error types (BusinessRuleViolation vs ValidationError), centralized error handling (error handler middleware), and separation of concerns (format validation vs business logic).

