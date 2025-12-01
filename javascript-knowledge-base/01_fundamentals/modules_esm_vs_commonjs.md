# Modules: ESM vs CommonJS, export/import, Dynamic Import

JavaScript modules provide a way to organize and share code. Understanding ESM and CommonJS is essential.

## CommonJS

**CommonJS** is the module system used in Node.js (traditional).

### Export

```javascript
// module.exports: Single export
module.exports = {
    name: 'John',
    greet: function() {
        return 'Hello';
    }
};

// exports: Multiple exports
exports.name = 'John';
exports.greet = function() {
    return 'Hello';
};

// Both are equivalent
```

### Require

```javascript
// require: Import module
const module = require('./module');
const { name, greet } = require('./module');

// Built-in modules
const fs = require('fs');
const path = require('path');
```

## ES Modules (ESM)

**ESM** is the standard module system (ES6+).

### Export

```javascript
// Named export
export const name = 'John';
export function greet() {
    return 'Hello';
}

// Default export
export default {
    name: 'John',
    greet: function() {
        return 'Hello';
    }
};

// Export list
const name = 'John';
function greet() {
    return 'Hello';
}
export { name, greet };

// Rename export
export { name as userName, greet as sayHello };
```

### Import

```javascript
// Named import
import { name, greet } from './module.js';

// Default import
import module from './module.js';

// Mixed import
import module, { name, greet } from './module.js';

// Namespace import
import * as module from './module.js';
module.name;
module.greet();

// Rename import
import { name as userName, greet as sayHello } from './module.js';
```

## ESM vs CommonJS Differences

### Syntax

```javascript
// CommonJS
module.exports = { name: 'John' };
const { name } = require('./module');

// ESM
export const name = 'John';
import { name } from './module.js';
```

### Loading

```javascript
// CommonJS: Synchronous
const module = require('./module');  // Loads immediately

// ESM: Asynchronous
import { name } from './module.js';  // Loaded asynchronously
```

### File Extensions

```javascript
// CommonJS: No extension needed
const module = require('./module');

// ESM: Extension required (usually .js or .mjs)
import { name } from './module.js';
```

## Dynamic Import

**Dynamic import** loads modules at runtime.

### ESM Dynamic Import

```javascript
// Dynamic import returns promise
async function loadModule() {
    const module = await import('./module.js');
    return module;
}

// Conditional loading
if (condition) {
    const module = await import('./module.js');
    module.doSomething();
}

// With destructuring
const { name, greet } = await import('./module.js');
```

### CommonJS Dynamic Import

```javascript
// require() can be used conditionally
if (condition) {
    const module = require('./module');
}

// But it's synchronous
```

## Real-World Examples

### Example 1: Module Structure

```javascript
// utils.js (ESM)
export function add(a, b) {
    return a + b;
}

export function subtract(a, b) {
    return a - b;
}

export default {
    multiply: (a, b) => a * b,
    divide: (a, b) => a / b
};

// main.js (ESM)
import math, { add, subtract } from './utils.js';

console.log(add(1, 2));        // 3
console.log(subtract(5, 2));   // 3
console.log(math.multiply(2, 3));  // 6
```

### Example 2: Code Splitting

```javascript
// Lazy load components
async function loadComponent() {
    const { Component } = await import('./Component.js');
    return Component;
}

// Route-based code splitting
const routes = {
    '/': () => import('./Home.js'),
    '/about': () => import('./About.js'),
    '/contact': () => import('./Contact.js')
};

async function loadRoute(path) {
    const module = await routes[path]();
    return module.default;
}
```

### Example 3: Conditional Imports

```javascript
// Load polyfills conditionally
if (!window.fetch) {
    await import('./polyfills/fetch.js');
}

// Load features based on environment
if (process.env.NODE_ENV === 'development') {
    const devTools = await import('./dev-tools.js');
    devTools.init();
}
```

## Module Scope

```javascript
// Modules have their own scope
// Variables are not global

// module.js
const privateVar = 'private';
export const publicVar = 'public';

// main.js
import { publicVar } from './module.js';
console.log(publicVar);  // 'public'
console.log(privateVar);  // ReferenceError
```

## Best Practices

1. **Use ESM**: Prefer ES modules for new code
2. **File Extensions**: Use .js or .mjs for ESM
3. **Dynamic Import**: Use for code splitting and conditional loading
4. **Tree Shaking**: ESM enables better tree shaking
5. **Consistency**: Use one system consistently

## Summary

**Modules: ESM vs CommonJS:**

1. **CommonJS**: require/module.exports, synchronous
2. **ESM**: import/export, asynchronous
3. **Dynamic Import**: Load modules at runtime
4. **Best Practice**: Use ESM, dynamic import for code splitting
5. **Scope**: Modules have their own scope

**Key Takeaway:**
CommonJS uses require/module.exports and is synchronous. ESM uses import/export and is asynchronous. Dynamic import loads modules at runtime. ESM enables better tree shaking. Use ESM for new code. Modules have their own scope.

**Module Strategy:**
- Use ESM for new code
- Dynamic import for code splitting
- Consistent module system
- Understand scope
- Enable tree shaking

**Next Steps:**
- Learn [Symbols](symbols_well_known_symbols.md) for unique values
- Study [Memory Model](memory_model_garbage_collection.md) for memory
- Master [Language Patterns](language_patterns.md) for patterns

