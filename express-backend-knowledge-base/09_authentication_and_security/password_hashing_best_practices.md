# Password Hashing Best Practices

Storing passwords securely is non-negotiable. This guide teaches you password hashing from basics to advanced security practices.

## Why Hash Passwords?

**Never store plaintext passwords!**

**The problem:**
```javascript
// ❌ NEVER DO THIS: Plaintext passwords are a security disaster.
user.password = "myPassword123";  // Stored as plaintext
// If database is breached, all passwords are exposed
```

**The solution:** Hash passwords - one-way encryption that can't be reversed. Even if database is breached, attackers can't get original passwords.

## Understanding Password Hashing

**What is hashing?** One-way function that converts password → hash. Can't reverse hash → password.

**How it works:** "myPassword123" → hash function → "$2a$10$N9qo8uLOickgx2ZMRZoMye..."

**Verification:** Login attempt: "myPassword123" → Hash it → Compare with stored hash → Match = correct password

## Step 1: Using bcrypt

bcrypt is the industry standard for password hashing:

```javascript
const bcrypt = require('bcryptjs');

// hashPassword: Creates one-way hash (can't reverse, secure).
async function hashPassword(password) {
    /**
     * Hash a password using bcrypt.
     * 
     * @param {string} password - Plain text password
     * @returns {string} Hashed password
     * 
     * @example
     * const hashed = await hashPassword("myPassword123");
     * // Returns: "$2a$10$..." (includes salt automatically)
     */
    const saltRounds = 10;  // Number of bcrypt rounds (higher = more secure, slower)
    return await bcrypt.hash(password, saltRounds);
}

// verifyPassword: Compares plain password with hash (secure comparison).
async function verifyPassword(plainPassword, hashedPassword) {
    /**
     * Verify a password against its hash.
     * 
     * @param {string} plainPassword - Plain text password to verify
     * @param {string} hashedPassword - Stored hash from database
     * @returns {boolean} True if password matches
     * 
     * @example
     * const isValid = await verifyPassword("myPassword123", storedHash);
     */
    return await bcrypt.compare(plainPassword, hashedPassword);
}
```

**Understanding bcrypt:** Automatically generates salt (prevents rainbow table attacks), configurable rounds (how many times to hash), and slow by design (prevents brute force).

## Step 2: Complete Authentication Flow

Let's build a complete password system:

```javascript
const { User } = require('../models');
const { hashPassword, verifyPassword } = require('../utils/password');

// User registration: Register new user with hashed password.
async function registerUser(email, password, db) {
    /**
     * Register a new user with hashed password.
     */
    // Check if email exists: Business validation.
    const existing = await User.findOne({ where: { email } });
    if (existing) {
        throw new Error("Email already registered");
    }
    
    // Hash password: Convert plaintext to secure hash.
    const hashed = await hashPassword(password);
    
    // Create user: Store hash, never plaintext!
    const user = await User.create({
        email: email,
        password_hash: hashed  // Store hash, not plaintext!
    });
    
    return user;
}

// User login: Authenticate user by email and password.
async function authenticateUser(email, password, db) {
    /**
     * Authenticate user by email and password.
     * 
     * @returns {Object|null} User object if valid, null if invalid
     */
    // Find user: Look up by email.
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
        return null;  // User not found
    }
    
    // Verify password: Compare plain password with stored hash.
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
        return null;  // Password doesn't match
    }
    
    return user;  // Authentication successful
}
```

## Step 3: Password Requirements

Enforce strong passwords:

```javascript
// PasswordValidator: Validates password strength.
class PasswordValidator {
    static MIN_LENGTH = 8;
    static REQUIRE_UPPERCASE = true;
    static REQUIRE_LOWERCASE = true;
    static REQUIRE_DIGIT = true;
    static REQUIRE_SPECIAL = true;
    
    // validate: Check password meets security requirements.
    static validate(password) {
        /**
         * Validate password meets requirements.
         * 
         * @returns {Object} {isValid: boolean, errors: string[]}
         */
        const errors = [];
        
        // Length check: Minimum length requirement.
        if (password.length < this.MIN_LENGTH) {
            errors.push(`Password must be at least ${this.MIN_LENGTH} characters`);
        }
        
        // Uppercase check: Must contain uppercase letter.
        if (this.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        // Lowercase check: Must contain lowercase letter.
        if (this.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        // Digit check: Must contain number.
        if (this.REQUIRE_DIGIT && !/\d/.test(password)) {
            errors.push('Password must contain at least one digit');
        }
        
        // Special character check: Must contain special char.
        if (this.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Usage in registration
app.post("/register", async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // Validate password strength: Check format requirements.
        const validation = PasswordValidator.validate(password);
        if (!validation.isValid) {
            return res.status(400).json({
                error: 'Password validation failed',
                details: validation.errors
            });
        }
        
        // Hash and create user: Password is valid, proceed.
        const user = await registerUser(email, password, db);
        res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
        next(error);
    }
});
```

## Step 4: Password Reset Flow

```javascript
const crypto = require('crypto');

// generateResetToken: Create secure random token for password reset.
function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');  // 64 character hex string
}

// Password reset request: Generate token and send email.
async function requestPasswordReset(email, db) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        // Don't reveal if email exists (security best practice)
        return { message: 'If email exists, reset link sent' };
    }
    
    // Generate reset token: Secure random token.
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000);  // 1 hour from now
    
    // Store token: Save token and expiry in database.
    await user.update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry
    });
    
    // Send email: Send reset link (implement email service).
    await sendPasswordResetEmail(email, resetToken);
    
    return { message: 'If email exists, reset link sent' };
}

// Reset password: Validate token and update password.
async function resetPassword(token, newPassword, db) {
    const user = await User.findOne({
        where: {
            reset_token: token,
            reset_token_expiry: { [Op.gt]: new Date() }  // Token not expired
        }
    });
    
    if (!user) {
        throw new Error('Invalid or expired reset token');
    }
    
    // Validate new password: Check strength requirements.
    const validation = PasswordValidator.validate(newPassword);
    if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
    }
    
    // Hash new password: Store secure hash.
    const hashed = await hashPassword(newPassword);
    
    // Update password: Clear reset token.
    await user.update({
        password_hash: hashed,
        reset_token: null,
        reset_token_expiry: null
    });
    
    return { message: 'Password reset successful' };
}
```

## Best Practices

### 1. **Never Log Passwords**
```javascript
// ❌ BAD: Never log passwords
console.log('User password:', password);

// ✅ GOOD: Log only that password was received
console.log('Password received for user:', email);
```

### 2. **Use Strong Salt Rounds**
```javascript
// Production: Use 10-12 rounds (balance security vs performance).
const saltRounds = 10;  // Good balance
// Higher = more secure but slower (12+ rounds can be slow)
```

### 3. **Timing Attack Protection**
bcrypt.compare automatically protects against timing attacks (always takes same time regardless of where password differs).

### 4. **Password History**
Prevent reuse of recent passwords:

```javascript
// Check password history: Prevent reusing recent passwords.
async function checkPasswordHistory(userId, newPassword, db) {
    const recentPasswords = await PasswordHistory.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 5  // Check last 5 passwords
    });
    
    for (const oldPassword of recentPasswords) {
        const matches = await verifyPassword(newPassword, oldPassword.hash);
        if (matches) {
            throw new Error('Cannot reuse recent password');
        }
    }
}
```

## Summary

Password hashing in Express.js requires: Using bcrypt for secure hashing, never storing plaintext passwords, validating password strength, implementing password reset flow, and following security best practices (no logging, strong rounds, timing attack protection).

