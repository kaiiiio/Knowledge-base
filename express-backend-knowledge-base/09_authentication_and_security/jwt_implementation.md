# JWT Implementation: Complete Guide

JSON Web Tokens (JWT) are the standard for stateless authentication in modern APIs. This guide teaches you JWT from basics to production implementation in Express.js.

## Understanding JWT

**What is JWT?** A compact, URL-safe way to securely transmit information between parties as a JSON object.

**JWT Structure:**
```
header.payload.signature
```

**Parts explained:** **Header** contains algorithm and token type. **Payload** contains claims (data about user). **Signature** verifies token hasn't been tampered with.

**Example:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Why JWT?** Stateless (no server-side session storage), scalable (works across multiple servers), self-contained (user info in token), and standard (works with any language).

## Step 1: Installing Dependencies

```bash
npm install jsonwebtoken bcryptjs dotenv
npm install --save-dev @types/jsonwebtoken @types/bcryptjs  # If using TypeScript
```

**What each package does:** `jsonwebtoken` handles JWT encoding/decoding. `bcryptjs` handles password hashing. `dotenv` loads environment variables.

## Step 2: JWT Configuration

```javascript
require('dotenv').config();

// Security configuration: JWT and password settings.
const config = {
    // JWT settings
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',  // Used to sign tokens (keep secret!)
    JWT_ALGORITHM: 'HS256',  // Signing algorithm
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30m',  // Token expiration (30 minutes)
    JWT_REFRESH_EXPIRES_IN: '7d',  // Refresh token expiration (7 days)
    
    // Password hashing
    BCRYPT_ROUNDS: 10  // Number of bcrypt rounds
};

module.exports = config;
```

**Understanding the settings:** `JWT_SECRET` is used to sign/verify tokens (must be secret!). `JWT_ALGORITHM` is how to sign (HS256 = symmetric key). `JWT_EXPIRES_IN` is how long token is valid. `JWT_REFRESH_EXPIRES_IN` is for token refresh (longer-lived).

## Step 3: Creating and Verifying Tokens

### Create Access Token

```javascript
const jwt = require('jsonwebtoken');
const config = require('../config/env');

// createAccessToken: Generate JWT access token with user data.
function createAccessToken(data, expiresIn = null) {
    /**
     * Create a JWT access token.
     * 
     * @param {Object} data - Data to encode in token (typically user ID, email)
     * @param {string} expiresIn - Custom expiration time (optional)
     * @returns {string} Encoded JWT token string
     * 
     * @example
     * const token = createAccessToken({ userId: 123, email: 'user@example.com' });
     */
    const payload = {
        ...data,  // User data (userId, email, etc.)
        type: 'access'  // Token type: Distinguishes access from refresh tokens
    };
    
    // Sign token: Creates JWT with signature.
    const token = jwt.sign(
        payload,
        config.JWT_SECRET,  // Secret key signs token, prevents tampering
        {
            algorithm: config.JWT_ALGORITHM,  // HS256 = symmetric key algorithm
            expiresIn: expiresIn || config.JWT_EXPIRES_IN  // Token expiration time
        }
    );
    
    return token;
}
```

**Understanding the token creation:** Copy user data to payload, add token type, sign with secret key, and return encoded token.

### Verify Access Token

```javascript
// verifyToken: Validate and decode JWT token.
function verifyToken(token) {
    /**
     * Verify and decode a JWT token.
     * 
     * @param {string} token - JWT token string
     * @returns {Object} Decoded payload
     * @throws {Error} If token is invalid, expired, or tampered with
     */
    try {
        // Decode and verify token: Validates signature and expiration automatically.
        const payload = jwt.verify(
            token,
            config.JWT_SECRET,  // Must match key used to sign
            {
                algorithms: [config.JWT_ALGORITHM]  // Must match signing algorithm
            }
        );
        
        // Check token type: Ensures this is an access token, not refresh token.
        if (payload.type !== 'access') {
            throw new Error('Invalid token type');
        }
        
        return payload;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw error;
    }
}
```

**Understanding the verification:** Decode token with secret key, verify signature, check expiration, validate token type, and return payload.

## Step 4: Password Hashing

```javascript
const bcrypt = require('bcryptjs');
const config = require('../config/env');

// hashPassword: Hash password using bcrypt.
async function hashPassword(password) {
    /**
     * Hash a password using bcrypt.
     * 
     * @param {string} password - Plain text password
     * @returns {string} Hashed password
     */
    const salt = await bcrypt.genSalt(config.BCRYPT_ROUNDS);  // Generate salt
    const hashed = await bcrypt.hash(password, salt);  // Hash password with salt
    return hashed;
}

// verifyPassword: Compare plain password with hash.
async function verifyPassword(plainPassword, hashedPassword) {
    /**
     * Verify a password against a hash.
     * 
     * @param {string} plainPassword - Plain text password
     * @param {string} hashedPassword - Hashed password from database
     * @returns {boolean} True if password matches
     */
    return await bcrypt.compare(plainPassword, hashedPassword);  // Compare passwords
}
```

## Step 5: Authentication Flow

### Login Endpoint

```javascript
const express = require('express');
const router = express.Router();
const userRepository = require('../repositories/userRepository');
const { hashPassword, verifyPassword } = require('../utils/password');
const { createAccessToken } = require('../utils/jwt');

// POST /auth/login: Login endpoint that returns JWT token.
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // Find user: Look up user by email.
        const user = await userRepository.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Verify password: Compare provided password with stored hash.
        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Create token: Generate JWT with user data.
        const token = createAccessToken({
            userId: user.id,
            email: user.email
        });
        
        // Return token: Send JWT to client.
        res.json({
            access_token: token,
            token_type: 'Bearer',
            expires_in: '30m'
        });
    } catch (error) {
        next(error);  // Pass to error handler
    }
});

module.exports = router;
```

### Authentication Middleware

```javascript
const { verifyToken } = require('../utils/jwt');
const userRepository = require('../repositories/userRepository');

// authenticate: Middleware to verify JWT token on protected routes.
const authenticate = async (req, res, next) => {
    try {
        // Get token: Extract from Authorization header.
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const token = authHeader.substring(7);  // Remove 'Bearer ' prefix
        
        // Verify token: Validate and decode JWT.
        const payload = verifyToken(token);
        
        // Get user: Fetch user from database (optional, for fresh user data).
        const user = await userRepository.findById(payload.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        // Attach user to request: Available in route handlers.
        req.user = user;
        req.userId = payload.userId;
        
        next();  // Continue to route handler
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = { authenticate };
```

**Explanation:** Middleware extracts token from Authorization header, verifies token, fetches user from database, and attaches user to request object for use in route handlers.

### Protected Route Example

```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const userController = require('../controllers/userController');

// GET /users/me: Get current user (requires authentication).
router.get('/me', authenticate, userController.getCurrentUser);

// In controller:
async function getCurrentUser(req, res, next) {
    try {
        // req.user is available from authenticate middleware
        res.json(req.user);
    } catch (error) {
        next(error);
    }
}
```

## Step 6: Refresh Tokens

```javascript
// createRefreshToken: Generate long-lived refresh token.
function createRefreshToken(data) {
    const payload = {
        ...data,
        type: 'refresh'  // Token type: Refresh token
    };
    
    return jwt.sign(
        payload,
        config.JWT_SECRET,
        {
            algorithm: config.JWT_ALGORITHM,
            expiresIn: config.JWT_REFRESH_EXPIRES_IN  // Longer expiration (7 days)
        }
    );
}

// Refresh token endpoint: Exchange refresh token for new access token.
router.post('/refresh', async (req, res, next) => {
    try {
        const { refresh_token } = req.body;
        
        // Verify refresh token: Validate refresh token.
        const payload = jwt.verify(refresh_token, config.JWT_SECRET);
        
        if (payload.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid token type' });
        }
        
        // Create new access token: Generate fresh access token.
        const accessToken = createAccessToken({
            userId: payload.userId,
            email: payload.email
        });
        
        res.json({
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: '30m'
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});
```

## Best Practices

### 1. **Store Secrets Securely**
Never commit secrets to git. Use environment variables:

```javascript
// .env file (not in git)
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=30m
```

### 2. **Token Expiration**
Use short-lived access tokens (15-30 minutes) and longer refresh tokens (7 days):

```javascript
const accessToken = createAccessToken(data, '30m');  // Short-lived
const refreshToken = createRefreshToken(data);  // Long-lived
```

### 3. **Secure Token Storage**
Store tokens securely on client (httpOnly cookies or secure storage):

```javascript
// Set httpOnly cookie (more secure than localStorage)
res.cookie('token', token, {
    httpOnly: true,  // Not accessible via JavaScript
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    sameSite: 'strict'  // CSRF protection
});
```

### 4. **Error Handling**
Provide clear error messages:

```javascript
catch (error) {
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
    }
    next(error);
}
```

## Summary

JWT implementation in Express.js requires: Installing dependencies (jsonwebtoken, bcryptjs), configuring JWT settings (secret, algorithm, expiration), creating and verifying tokens, hashing passwords with bcrypt, implementing authentication middleware, and handling refresh tokens for long-lived sessions.

