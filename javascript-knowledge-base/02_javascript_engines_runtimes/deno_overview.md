# Deno Overview: Design Choices and Architecture

Deno is a modern JavaScript/TypeScript runtime built on V8 and Rust, designed as a secure alternative to Node.js.

## What is Deno?

**Deno** is a secure runtime for JavaScript and TypeScript.

### Key Features

```javascript
// Deno features:
// - Built-in TypeScript support
// - Secure by default (no file/network access without permission)
// - Web standard APIs (fetch, WebSocket, etc.)
// - Single executable
// - Built-in tooling (formatter, linter, test runner)
```

## Design Choices

### Security First

```javascript
// Deno is secure by default
// Must explicitly grant permissions

// ❌ This fails without permission
await Deno.readFile('file.txt');  // PermissionDenied

// ✅ Run with permission
// deno run --allow-read script.ts
await Deno.readFile('file.txt');  // Works
```

### Web Standards

```javascript
// Deno uses Web standard APIs
// No need for node-fetch, etc.

// Fetch API (built-in)
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// WebSocket (built-in)
const ws = new WebSocket('wss://example.com');
```

### TypeScript by Default

```javascript
// Deno supports TypeScript natively
// No compilation step needed

// script.ts
interface User {
    name: string;
    age: number;
}

const user: User = {
    name: 'John',
    age: 30
};

// Run directly: deno run script.ts
```

## Deno vs Node.js

### Module System

```javascript
// Deno: ES modules only
import { serve } from 'https://deno.land/std/http/server.ts';

// Node.js: CommonJS or ESM
const express = require('express');
// or
import express from 'express';
```

### Package Management

```javascript
// Deno: URL-based imports
import { serve } from 'https://deno.land/std/http/server.ts';

// Node.js: npm packages
import express from 'express';
```

### Permissions

```javascript
// Deno: Explicit permissions
// deno run --allow-net --allow-read script.ts

// Node.js: Full access by default
// No permission system
```

## Real-World Examples

### Example 1: HTTP Server

```javascript
// Deno HTTP server
import { serve } from 'https://deno.land/std/http/server.ts';

serve((req) => {
    return new Response('Hello Deno!', {
        headers: { 'content-type': 'text/plain' }
    });
}, { port: 8000 });

// Run: deno run --allow-net server.ts
```

### Example 2: File Operations

```javascript
// Deno file operations
// Read file
const content = await Deno.readTextFile('file.txt');

// Write file
await Deno.writeTextFile('output.txt', 'Hello');

// Run: deno run --allow-read --allow-write script.ts
```

### Example 3: Testing

```javascript
// Deno built-in test runner
import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';

Deno.test('add function', () => {
    assertEquals(1 + 1, 2);
});

// Run: deno test
```

## Best Practices

1. **Use Permissions**: Grant only needed permissions
2. **Web Standards**: Use standard APIs
3. **TypeScript**: Leverage built-in TypeScript
4. **URL Imports**: Use URL-based imports
5. **Security**: Follow security best practices

## Summary

**Deno Overview:**

1. **Security**: Secure by default, explicit permissions
2. **Web Standards**: Uses standard APIs
3. **TypeScript**: Built-in TypeScript support
4. **Modules**: ES modules, URL-based imports
5. **Best Practice**: Use for secure, modern applications

**Key Takeaway:**
Deno is a secure runtime with built-in TypeScript. Uses Web standard APIs. Requires explicit permissions. ES modules only. URL-based imports. Built-in tooling. Good for modern, secure applications.

**Deno Strategy:**
- Use for security
- Leverage Web standards
- TypeScript by default
- Explicit permissions
- Modern tooling

**Next Steps:**
- Learn [Node.js Runtime](../09_nodejs_core_backend/) for Node.js
- Study [Security](../16_security/) for security practices
- Master [TypeScript](../19_typing_tooling_typescript/) for types

