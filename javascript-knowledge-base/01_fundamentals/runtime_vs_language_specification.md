# Runtime vs Language Specification: ECMAScript and Implementations

Understanding the difference between the language specification (ECMAScript) and runtime implementations is crucial for JavaScript development.

## ECMAScript Specification

**ECMAScript** is the language specification that defines JavaScript syntax and behavior.

### What ECMAScript Defines

```javascript
// ECMAScript defines:
// - Syntax (how to write code)
// - Semantics (what code means)
// - Built-in objects (Array, Object, String)
// - Standard library
// - Language features

// Example: ECMAScript defines how arrays work
const arr = [1, 2, 3];
arr.push(4);  // ECMAScript defines push behavior
```

### TC39 Process

**TC39** is the committee that maintains ECMAScript.

```javascript
// TC39 process:
// 1. Proposals submitted
// 2. Stages (0-4)
// 3. Finalized in specification
// 4. Implemented by engines
```

## Runtime Implementations

**Runtimes** are implementations of the ECMAScript specification.

### V8 (Chrome, Node.js)

```javascript
// V8 implements ECMAScript
// - Chrome browser
// - Node.js runtime
// - Edge browser (Chromium)

// V8-specific features:
// - V8 heap snapshots
// - V8 profiler
```

### SpiderMonkey (Firefox)

```javascript
// SpiderMonkey implements ECMAScript
// - Firefox browser
// - Different optimization strategies
```

### JavaScriptCore (Safari)

```javascript
// JavaScriptCore implements ECMAScript
// - Safari browser
// - WebKit engine
```

## Specification vs Implementation

### What Spec Defines

```javascript
// ECMAScript defines:
// - How Array.map works
// - Promise behavior
// - Class syntax
// - Module system

// Example: Spec defines Array.map signature
Array.prototype.map = function(callback, thisArg) {
    // Spec defines behavior, not implementation
};
```

### What Engines Implement

```javascript
// Engines implement:
// - How to execute code efficiently
// - Memory management
// - Optimization strategies
// - Performance characteristics

// Example: V8 optimizes array operations
// - Inline caching
// - Hidden classes
// - TurboFan compilation
```

## Real-World Examples

### Example 1: Promise Implementation

```javascript
// ECMAScript defines Promise behavior
const promise = new Promise((resolve, reject) => {
    // Spec defines: executor function
    // Spec defines: resolve/reject behavior
    // Spec defines: then/catch chain
});

// Engines implement:
// - Microtask queue
// - Promise resolution
// - Async execution
```

### Example 2: Array Methods

```javascript
// ECMAScript defines Array.map
const doubled = [1, 2, 3].map(x => x * 2);

// Spec defines:
// - Callback signature
// - Return value
// - Behavior with sparse arrays

// Engines implement:
// - Optimization strategies
// - Memory allocation
// - Execution speed
```

## Best Practices

1. **Follow Spec**: Write spec-compliant code
2. **Avoid Engine-Specific**: Don't rely on engine quirks
3. **Test Multiple Engines**: Test in different browsers
4. **Use Polyfills**: For missing features
5. **Stay Updated**: Follow spec updates

## Summary

**Runtime vs Language Specification:**

1. **ECMAScript**: Language specification
2. **Runtimes**: Engine implementations (V8, SpiderMonkey, JSC)
3. **Spec Defines**: Syntax, semantics, behavior
4. **Engines Implement**: Execution, optimization, performance
5. **Best Practice**: Write spec-compliant code

**Key Takeaway:**
ECMAScript is the language specification that defines JavaScript. Runtimes (V8, SpiderMonkey, JavaScriptCore) implement the specification. The spec defines what, engines define how. Write spec-compliant code for portability. Test in multiple engines for compatibility.

**Specification Strategy:**
- Follow ECMAScript spec
- Avoid engine-specific code
- Test in multiple engines
- Use polyfills
- Stay updated

**Next Steps:**
- Learn [Execution Context](execution_context_call_stack.md) for internals
- Study [JavaScript Engines](../02_javascript_engines_runtimes/) for implementations
- Master [Modern Features](../04_advanced_language_features/) for advanced patterns

