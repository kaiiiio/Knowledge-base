# Unit Testing Services: Complete Guide

Unit tests verify individual components work correctly in isolation. This guide teaches you how to write effective unit tests for service layer code in Express.js.

## Understanding Unit Testing

**What is a unit test?** Tests a single function or class in isolation, with dependencies mocked.

**Key principles:** Fast (run in milliseconds), isolated (no database, no external services), repeatable (same result every time), and independent (can run in any order).

**Real-world analogy:** Testing a car engine in a workshop (isolated) vs testing it while driving (integration test).

## Setting Up Testing Environment

### Project Structure

```
tests/
├── setup.js              # Test configuration
├── unit/
│   ├── services/
│   │   ├── userService.test.js
│   │   └── orderService.test.js
│   └── repositories/
└── integration/
    └── api.test.js
```

### Basic Setup

```javascript
// tests/setup.js
// Jest configuration: Set up test environment.
const jest = require('jest');

// Mock database: Replace real database with mocks.
jest.mock('../config/db', () => ({
    query: jest.fn(),
}));
```

### Using Jest

```bash
npm install --save-dev jest
```

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Step 1: Testing Simple Service Methods

Let's start with our UserService:

```javascript
// services/userService.js
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    
    async getUser(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError(`User ${userId} not found`);
        }
        return user;
    }
}
```

**Writing the test:**

```javascript
// tests/unit/services/userService.test.js
const UserService = require('../../../services/userService');
const { NotFoundError } = require('../../../utils/errors');

describe('UserService', () => {
    let userService;
    let mockUserRepository;
    
    beforeEach(() => {
        // Arrange: Set up mocks (configure mock behavior).
        mockUserRepository = {
            findById: jest.fn(),
        };
        userService = new UserService(mockUserRepository);
    });
    
    test('getUser returns user when found', async () => {
        // Arrange: Set up mock to return a user.
        const expectedUser = { id: 1, email: 'test@example.com', name: 'Test User' };
        mockUserRepository.findById.mockResolvedValue(expectedUser);
        
        // Act: Call the method (execute code under test).
        const result = await userService.getUser(1);
        
        // Assert: Verify results (check expected outcomes).
        expect(result).toEqual(expectedUser);
        expect(result.id).toBe(1);
        expect(result.email).toBe('test@example.com');
        
        // Verify repository was called correctly: Ensure dependencies called as expected.
        expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
        expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
    });
    
    test('getUser throws NotFoundError when user not found', async () => {
        // Arrange: Mock returns null (user not found).
        mockUserRepository.findById.mockResolvedValue(null);
        
        // Act & Assert: Should raise exception.
        await expect(userService.getUser(999))
            .rejects.toThrow(NotFoundError);
        
        await expect(userService.getUser(999))
            .rejects.toThrow('User 999 not found');
        
        // Verify repository was called.
        expect(mockUserRepository.findById).toHaveBeenCalledWith(999);
    });
});
```

**Understanding the test structure:** **Arrange** sets up mocks and test data, **Act** calls the method being tested, and **Assert** verifies the results.

## Step 2: Testing Business Logic

Let's test more complex business logic:

```javascript
// services/userService.js
class UserService {
    async createUser(userData) {
        // Business rule: Email must be unique
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new ValidationError("Email already registered");
        }
        
        // Business rule: Age restriction
        if (userData.age < 18) {
            throw new ValidationError("Must be 18 or older");
        }
        
        // Create user
        return await this.userRepository.create(userData);
    }
}
```

**Testing business rules:**

```javascript
describe('UserService - createUser', () => {
    test('createUser throws ValidationError when email already exists', async () => {
        // Arrange
        const existingUser = { id: 1, email: 'existing@example.com' };
        mockUserRepository.findByEmail.mockResolvedValue(existingUser);
        
        const userData = {
            email: 'existing@example.com',
            age: 25,
            name: 'Test User'
        };
        
        // Act & Assert
        await expect(userService.createUser(userData))
            .rejects.toThrow('Email already registered');
        
        // Verify email_exists was checked
        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('existing@example.com');
        
        // Verify create was NOT called
        expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
    
    test('createUser throws ValidationError when age is under 18', async () => {
        // Arrange
        mockUserRepository.findByEmail.mockResolvedValue(null);
        
        const userData = {
            email: 'young@example.com',
            age: 17,  // Under 18
            name: 'Young User'
        };
        
        // Act & Assert
        await expect(userService.createUser(userData))
            .rejects.toThrow('Must be 18 or older');
    });
    
    test('createUser successfully creates user when valid', async () => {
        // Arrange
        mockUserRepository.findByEmail.mockResolvedValue(null);
        const expectedUser = { id: 1, email: 'new@example.com', age: 25, name: 'New User' };
        mockUserRepository.create.mockResolvedValue(expectedUser);
        
        const userData = {
            email: 'new@example.com',
            age: 25,
            name: 'New User'
        };
        
        // Act
        const result = await userService.createUser(userData);
        
        // Assert
        expect(result).toEqual(expectedUser);
        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
        expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
    });
});
```

## Step 3: Testing with Multiple Dependencies

```javascript
// services/orderService.js
class OrderService {
    constructor(orderRepository, userRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }
    
    async createOrder(userId, items) {
        // Validate user exists
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        
        // Validate products exist and check stock
        for (const item of items) {
            const product = await this.productRepository.findById(item.productId);
            if (!product) {
                throw new NotFoundError(`Product ${item.productId} not found`);
            }
            if (product.stock < item.quantity) {
                throw new ValidationError(`Insufficient stock for ${product.name}`);
            }
        }
        
        // Create order
        return await this.orderRepository.create(userId, items);
    }
}
```

**Testing with multiple dependencies:**

```javascript
describe('OrderService - createOrder', () => {
    let orderService;
    let mockOrderRepository;
    let mockUserRepository;
    let mockProductRepository;
    
    beforeEach(() => {
        mockOrderRepository = {
            create: jest.fn(),
        };
        mockUserRepository = {
            findById: jest.fn(),
        };
        mockProductRepository = {
            findById: jest.fn(),
        };
        orderService = new OrderService(
            mockOrderRepository,
            mockUserRepository,
            mockProductRepository
        );
    });
    
    test('createOrder successfully creates order when all valid', async () => {
        // Arrange
        const user = { id: 1, name: 'Test User' };
        const product1 = { id: 1, name: 'Product 1', stock: 10 };
        const product2 = { id: 2, name: 'Product 2', stock: 5 };
        
        mockUserRepository.findById.mockResolvedValue(user);
        mockProductRepository.findById
            .mockResolvedValueOnce(product1)
            .mockResolvedValueOnce(product2);
        
        const expectedOrder = { id: 1, userId: 1, items: [] };
        mockOrderRepository.create.mockResolvedValue(expectedOrder);
        
        const items = [
            { productId: 1, quantity: 2 },
            { productId: 2, quantity: 3 }
        ];
        
        // Act
        const result = await orderService.createOrder(1, items);
        
        // Assert
        expect(result).toEqual(expectedOrder);
        expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
        expect(mockProductRepository.findById).toHaveBeenCalledTimes(2);
        expect(mockOrderRepository.create).toHaveBeenCalledWith(1, items);
    });
    
    test('createOrder throws NotFoundError when user not found', async () => {
        // Arrange
        mockUserRepository.findById.mockResolvedValue(null);
        
        // Act & Assert
        await expect(orderService.createOrder(999, []))
            .rejects.toThrow('User not found');
    });
});
```

## Best Practices

### 1. **Isolate Tests**
Each test should be independent and not rely on other tests.

### 2. **Use Descriptive Test Names**
```javascript
// ✅ Good
test('getUser returns user when found and active', async () => { ... });

// ❌ Bad
test('test getUser', async () => { ... });
```

### 3. **Arrange-Act-Assert Pattern**
Always follow the AAA pattern for clarity.

### 4. **Mock External Dependencies**
Never use real databases, APIs, or file systems in unit tests.

### 5. **Test Edge Cases**
Test both success and failure scenarios.

## Summary

Unit testing services in Express.js requires: Setting up Jest, mocking dependencies, testing business logic, following Arrange-Act-Assert pattern, testing edge cases, and keeping tests isolated. Unit tests ensure your business logic works correctly in isolation, making debugging and refactoring easier.

