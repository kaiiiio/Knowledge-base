# Memory Model & Garbage Collection: Mark-and-Sweep, Retention, Leaks

Understanding JavaScript's memory model and garbage collection is crucial for writing efficient, leak-free code.

## Memory Model

### Stack and Heap

```javascript
// Stack: Stores primitive values and references
let num = 42;        // Stack
let str = 'hello';   // Stack
let obj = { name: 'John' };  // Stack stores reference, heap stores object

// Heap: Stores objects and arrays
const obj = { name: 'John', age: 30 };  // Stored in heap
const arr = [1, 2, 3];  // Stored in heap
```

### Memory Allocation

```javascript
// Primitive values: Stored in stack
let x = 10;
let y = x;  // Copy of value

// Reference types: Stored in heap
let obj1 = { name: 'John' };
let obj2 = obj1;  // Copy of reference (both point to same object)
```

## Garbage Collection

**Garbage Collection** automatically frees memory for objects that are no longer referenced.

### Mark-and-Sweep Algorithm

```javascript
// Mark-and-Sweep process:
// 1. Mark: Mark all reachable objects
// 2. Sweep: Remove unmarked objects

// Example:
let obj = { name: 'John' };
obj = null;  // Object becomes unreachable, will be garbage collected
```

### Reachability

```javascript
// Objects are reachable if:
// - Referenced by global variable
let globalObj = { name: 'John' };

// - Referenced by local variable
function example() {
    let localObj = { name: 'John' };
    // localObj is reachable during function execution
}

// - Referenced by another object
const parent = {
    child: { name: 'John' }
};
// child is reachable through parent
```

## Memory Leaks

**Memory leaks** occur when objects are not garbage collected even though they're no longer needed.

### Common Leak Patterns

```javascript
// 1. Global variables
window.leak = { data: 'large data' };  // Never garbage collected

// 2. Closures holding references
function createLeak() {
    const largeData = new Array(1000000).fill('data');
    return function() {
        console.log('Closure');  // Holds reference to largeData
    };
}

// 3. Event listeners
const button = document.getElementById('button');
button.addEventListener('click', function() {
    // Handler holds reference to button
    // If button removed, handler still references it
});

// 4. Timers
const timer = setInterval(() => {
    // Timer holds reference to closure
}, 1000);
// Must clear: clearInterval(timer)
```

## Real-World Examples

### Example 1: Closure Leak

```javascript
// ❌ Memory leak: Closure holds large data
function processData() {
    const largeData = new Array(1000000).fill('data');
    
    return function() {
        // Closure holds reference to largeData
        console.log('Processing');
    };
}

// ✅ Fix: Don't hold unnecessary references
function processData() {
    const largeData = new Array(1000000).fill('data');
    // Process data
    const result = largeData.map(x => x.toUpperCase());
    
    return function() {
        // Only reference what's needed
        console.log('Processing', result.length);
    };
}
```

### Example 2: Event Listener Leak

```javascript
// ❌ Memory leak: Event listener not removed
function setupButton() {
    const button = document.getElementById('button');
    button.addEventListener('click', function handler() {
        console.log('Clicked');
        // Handler holds reference to button
    });
    // Button removed from DOM, but handler still references it
}

// ✅ Fix: Remove event listener
function setupButton() {
    const button = document.getElementById('button');
    function handler() {
        console.log('Clicked');
    }
    button.addEventListener('click', handler);
    
    // Remove when done
    return () => {
        button.removeEventListener('click', handler);
    };
}
```

### Example 3: Timer Leak

```javascript
// ❌ Memory leak: Timer not cleared
function startTimer() {
    setInterval(() => {
        console.log('Tick');
    }, 1000);
    // Timer runs forever
}

// ✅ Fix: Clear timer
function startTimer() {
    const timer = setInterval(() => {
        console.log('Tick');
    }, 1000);
    
    // Clear when done
    return () => clearInterval(timer);
}
```

## Weak References

**WeakMap** and **WeakSet** don't prevent garbage collection.

```javascript
// WeakMap: Keys are weak references
const weakMap = new WeakMap();
let obj = { name: 'John' };
weakMap.set(obj, 'data');

obj = null;  // obj can be garbage collected
// weakMap entry is automatically removed

// WeakSet: Values are weak references
const weakSet = new WeakSet();
let obj = { name: 'John' };
weakSet.add(obj);

obj = null;  // obj can be garbage collected
```

## Best Practices

1. **Avoid Global Variables**: Don't store large data globally
2. **Clear Event Listeners**: Remove listeners when done
3. **Clear Timers**: Clear intervals and timeouts
4. **Use WeakMap/WeakSet**: For metadata that shouldn't prevent GC
5. **Monitor Memory**: Use DevTools to monitor memory usage

## Summary

**Memory Model & Garbage Collection:**

1. **Stack**: Primitive values and references
2. **Heap**: Objects and arrays
3. **Garbage Collection**: Automatic memory management
4. **Mark-and-Sweep**: GC algorithm
5. **Memory Leaks**: Objects not garbage collected

**Key Takeaway:**
Stack stores primitives, heap stores objects. Garbage collection automatically frees unreachable objects. Mark-and-sweep algorithm marks reachable objects and removes unmarked. Avoid memory leaks by clearing event listeners, timers, and avoiding unnecessary closures. Use WeakMap/WeakSet for metadata.

**Memory Strategy:**
- Avoid global variables
- Clear event listeners
- Clear timers
- Use WeakMap/WeakSet
- Monitor memory usage

**Next Steps:**
- Learn [Closures](scopes_closures.md) for scope understanding
- Study [Objects](objects_property_descriptors.md) for object behavior
- Master [Performance](../21_performance_optimization/) for optimization

---

## 🎯 Interview Questions: JavaScript

### Q1: Explain the JavaScript memory model, including the stack and heap. How are primitive values and objects stored differently, and why does this matter?

**Answer:**

**Memory Model Overview:**

JavaScript's memory is divided into two main areas: the stack and the heap. Understanding how data is stored in each area is fundamental to understanding JavaScript's behavior, performance, and memory management.

**The Stack:**

**1. Purpose:**

The stack is used for storing primitive values and references (pointers) to objects. It's a fast, LIFO (Last In, First Out) data structure that's managed automatically.

**2. What's Stored:**

- Primitive values (numbers, strings, booleans, null, undefined, symbols, bigints)
- References (memory addresses) to objects stored in the heap
- Function call frames (local variables, parameters, return addresses)

**3. Characteristics:**

- Fast access (direct memory access)
- Fixed size per variable
- Automatically managed (variables are pushed/popped as functions are called/return)
- Limited size (stack overflow can occur with deep recursion)

**The Heap:**

**1. Purpose:**

The heap is used for storing objects (including arrays, functions, dates, etc.) and other complex data structures. It's a larger, more flexible memory area.

**2. What's Stored:**

- Objects and their properties
- Arrays and their elements
- Functions (as objects)
- Closures and their captured variables

**3. Characteristics:**

- Slower access (requires dereferencing)
- Dynamic size (can grow/shrink)
- Managed by garbage collector
- Larger size (can use more memory)

**How Primitives Are Stored:**

**1. Direct Storage:**

Primitive values are stored directly in the stack (or in the variable's memory location). When you assign a primitive to a variable, the actual value is stored.

**2. Value Copying:**

When you assign a primitive to another variable, a copy of the value is created. Each variable has its own independent copy.

**3. Immutability:**

Primitive values are immutable. Operations that appear to modify primitives actually create new values.

**How Objects Are Stored:**

**1. Reference Storage:**

Objects are stored in the heap, and variables store references (memory addresses) to those objects, not the objects themselves.

**2. Reference Copying:**

When you assign an object to another variable, you copy the reference, not the object. Both variables point to the same object in memory.

**3. Mutability:**

Objects are mutable. Changes to an object are visible through all references to that object.

**Why This Matters:**

**1. Performance:**

Understanding stack vs. heap helps understand performance characteristics. Stack operations are faster, but stack size is limited.

**2. Memory Management:**

Understanding where data is stored helps understand garbage collection and memory leaks.

**3. Behavior:**

Understanding how primitives vs. objects are stored explains many JavaScript behaviors (value vs. reference, immutability, etc.).

**4. Debugging:**

Understanding the memory model helps debug memory-related issues and understand variable behavior.

**System Design Consideration**: The memory model is fundamental to JavaScript:
1. **Performance**: Understanding stack vs. heap helps optimize performance
2. **Memory Management**: Essential for understanding garbage collection
3. **Behavior**: Explains many JavaScript behaviors and quirks
4. **Debugging**: Helps debug memory-related issues

The stack/heap distinction is fundamental to understanding how JavaScript works. It explains performance characteristics, memory management, and many language behaviors.

---

### Q2: Explain how garbage collection works in JavaScript. What is the mark-and-sweep algorithm, and how does it determine which objects can be garbage collected?

**Answer:**

**Garbage Collection Definition:**

Garbage collection is the automatic process of freeing memory that is no longer needed. JavaScript engines automatically manage memory by identifying and removing objects that are no longer reachable (cannot be accessed by any code).

**Why Garbage Collection is Needed:**

**1. Automatic Memory Management:**

Unlike languages like C/C++, JavaScript doesn't require manual memory management. The garbage collector automatically frees memory, preventing memory leaks and simplifying development.

**2. Memory Leak Prevention:**

Without garbage collection, developers would need to manually free memory, which is error-prone and can lead to memory leaks or use-after-free bugs.

**3. Developer Experience:**

Automatic garbage collection makes JavaScript easier to use, as developers don't need to worry about memory management in most cases.

**Mark-and-Sweep Algorithm:**

**1. Mark Phase:**

The garbage collector starts from "root" objects (global variables, currently executing function's local variables, etc.) and marks all objects that are reachable from these roots. It follows all references, marking each object it encounters.

**2. Sweep Phase:**

After marking, the garbage collector sweeps through all objects in memory. Objects that were not marked (unreachable) are considered garbage and are freed. Their memory is reclaimed and can be reused.

**3. Reachability:**

An object is reachable if it can be accessed through a chain of references starting from a root. If there's no path from any root to an object, that object is unreachable and can be garbage collected.

**How Objects Become Unreachable:**

**1. No References:**

When all references to an object are removed (variables are set to `null`, go out of scope, etc.), the object becomes unreachable.

**2. Circular References:**

Even if objects reference each other, if there's no path from a root to the cycle, the entire cycle is unreachable and can be garbage collected.

**3. Closures:**

Variables captured in closures remain reachable as long as the closure exists. When the closure is no longer referenced, captured variables can be garbage collected.

**Modern Garbage Collection:**

**1. Generational Collection:**

Modern garbage collectors use generational collection, where objects are divided into generations (young and old). Young objects are collected more frequently, as they're more likely to be short-lived.

**2. Incremental Collection:**

Garbage collection is often done incrementally to avoid blocking the main thread for long periods.

**3. Optimization:**

Modern collectors use various optimizations (like marking in parallel, compacting memory, etc.) to improve performance.

**System Design Consideration**: Understanding garbage collection is important for:
1. **Memory Management**: Writing code that doesn't create memory leaks
2. **Performance**: Understanding when garbage collection might impact performance
3. **Debugging**: Understanding why objects might not be garbage collected
4. **Best Practices**: Writing code that works well with garbage collection

Garbage collection is a crucial part of JavaScript that makes memory management automatic. Understanding how it works helps you write better code and avoid memory leaks.

---

### Q3: Explain what memory leaks are in JavaScript and how they occur. What are common causes of memory leaks, and how can they be prevented?

**Answer:**

**Memory Leak Definition:**

A memory leak occurs when memory that is no longer needed is not freed by the garbage collector. This happens when objects remain reachable (have references) even though they're no longer used, preventing garbage collection.

**How Memory Leaks Occur:**

**1. Unreachable but Referenced:**

Objects that are no longer needed but still have references cannot be garbage collected. These references keep the objects "alive" even though they're not being used.

**2. Growing References:**

If references to objects accumulate over time (e.g., in arrays, closures, event listeners), memory usage grows continuously, even if the objects are no longer needed.

**3. Circular References:**

While circular references themselves aren't a problem (garbage collectors handle them), if the cycle is reachable from a root, the entire cycle cannot be garbage collected.

**Common Causes:**

**1. Event Listeners:**

Event listeners that are not removed keep references to their handlers and the DOM elements, preventing garbage collection. This is one of the most common causes of memory leaks.

**2. Closures:**

Closures that capture large objects or DOM elements keep those objects in memory as long as the closure exists. If closures are stored in long-lived objects, this can cause leaks.

**3. Timers:**

`setInterval` and `setTimeout` that are not cleared keep references to their callbacks, preventing garbage collection.

**4. Global Variables:**

Global variables keep references to objects, preventing garbage collection. Large objects stored globally are never freed.

**5. Cached Data:**

Caches that grow without bounds can cause memory leaks. If cached data is never cleared or has no size limit, memory usage grows continuously.

**6. DOM References:**

References to DOM elements that are removed from the DOM but still referenced in JavaScript prevent those elements from being garbage collected.

**How to Prevent Memory Leaks:**

**1. Remove Event Listeners:**

Always remove event listeners when they're no longer needed, especially when removing DOM elements.

**2. Clear Timers:**

Clear `setInterval` and `setTimeout` when they're no longer needed.

**3. Avoid Global Variables:**

Avoid storing large objects in global variables. Use local variables or proper scoping.

**4. Limit Closure Scope:**

Be careful about what closures capture. Don't capture large objects or DOM elements unnecessarily.

**5. Clear Caches:**

Implement cache size limits and clearing strategies. Use `WeakMap` or `WeakSet` for caches when appropriate.

**6. Null References:**

Explicitly set references to `null` when objects are no longer needed, especially for large objects.

**7. Use Weak References:**

Use `WeakMap` and `WeakSet` for metadata that shouldn't prevent garbage collection.

**System Design Consideration**: Preventing memory leaks is crucial for:
1. **Application Stability**: Memory leaks can cause applications to crash or become unresponsive
2. **Performance**: Growing memory usage degrades performance
3. **User Experience**: Memory leaks can make applications unusable over time
4. **Best Practices**: Proper memory management is essential for production applications

Memory leaks are a common problem in JavaScript applications. Understanding their causes and how to prevent them is essential for writing robust, long-running applications.

---

### Q4: Explain what WeakMap and WeakSet are and how they differ from Map and Set. When would you use WeakMap/WeakSet, and how do they help prevent memory leaks?

**Answer:**

**WeakMap and WeakSet Definition:**

WeakMap and WeakSet are collections that hold "weak" references to their keys (WeakMap) or values (WeakSet). Weak references don't prevent garbage collection—if an object is only referenced by a WeakMap or WeakSet, it can still be garbage collected.

**Key Differences from Map/Set:**

**1. Weak References:**

- **WeakMap/WeakSet**: Use weak references—don't prevent garbage collection
- **Map/Set**: Use strong references—prevent garbage collection

**2. Key/Value Types:**

- **WeakMap**: Keys must be objects (not primitives)
- **WeakSet**: Values must be objects (not primitives)
- **Map/Set**: Can use any type as keys/values

**3. Iteration:**

- **WeakMap/WeakSet**: Not iterable (no `forEach`, `for...of`, `keys()`, `values()`, `entries()`)
- **Map/Set**: Fully iterable

**4. Size:**

- **WeakMap/WeakSet**: No `size` property (size is unknown and can change due to garbage collection)
- **Map/Set**: Have `size` property

**5. Use Cases:**

- **WeakMap/WeakSet**: For metadata that shouldn't prevent garbage collection
- **Map/Set**: For general-purpose collections

**When to Use WeakMap:**

**1. Object Metadata:**

Store metadata about objects without preventing those objects from being garbage collected. When the object is garbage collected, the WeakMap entry is automatically removed.

**2. Private Data:**

Store private data associated with objects. The WeakMap entry is automatically cleaned up when the object is garbage collected.

**3. Caching:**

Cache computed values associated with objects. The cache entry is automatically removed when the object is garbage collected, preventing memory leaks.

**When to Use WeakSet:**

**1. Object Tracking:**

Track which objects have been processed or visited. Entries are automatically removed when objects are garbage collected.

**2. Object Membership:**

Check if objects belong to a set without preventing garbage collection. Useful for tracking objects that should be treated specially.

**How They Prevent Memory Leaks:**

**1. Automatic Cleanup:**

When an object is garbage collected, its WeakMap/WeakSet entries are automatically removed. This prevents the collection from growing indefinitely.

**2. No Strong References:**

Weak references don't keep objects alive. If an object is only referenced by a WeakMap/WeakSet, it can still be garbage collected.

**3. Metadata Without Cost:**

You can store metadata about objects without the cost of preventing garbage collection. This is perfect for temporary metadata.

**Example Use Cases:**

**1. DOM Element Metadata:**

Store metadata about DOM elements. When elements are removed from the DOM and garbage collected, the metadata is automatically cleaned up.

**2. Object Caching:**

Cache expensive computations for objects. When objects are garbage collected, cache entries are automatically removed.

**3. Private Properties:**

Implement private properties for objects without preventing garbage collection.

**System Design Consideration**: WeakMap and WeakSet are powerful tools for:
1. **Memory Management**: Storing metadata without preventing garbage collection
2. **Preventing Leaks**: Automatic cleanup prevents memory leaks from metadata
3. **Private Data**: Implementing private data patterns
4. **Caching**: Creating caches that don't cause memory leaks

WeakMap and WeakSet provide a way to associate data with objects without preventing garbage collection. They're essential for preventing memory leaks when storing metadata, caches, or private data.

---

### Q5: Explain how closures relate to memory management and garbage collection. How can closures cause memory leaks, and what are best practices for avoiding closure-related memory issues?

**Answer:**

**Closures and Memory:**

Closures capture variables from their outer scope, and these captured variables remain in memory as long as the closure exists. This is necessary for closures to work, but it can also lead to memory issues if closures capture more than needed or live longer than expected.

**How Closures Keep Memory Alive:**

**1. Captured Variables:**

When a closure is created, it captures references to variables in its outer scope. These variables (and any objects they reference) remain in memory as long as the closure exists.

**2. Scope Chain:**

The closure maintains a reference to its outer scope's execution context, which includes all variables in that scope. This prevents those variables from being garbage collected.

**3. Long-Lived Closures:**

If a closure is stored in a long-lived object (like a global variable, DOM element, or event listener), the captured variables remain in memory for the lifetime of that object.

**How Closures Can Cause Memory Leaks:**

**1. Capturing Large Objects:**

If a closure captures a large object (like a large array or DOM element), that object remains in memory as long as the closure exists, even if only a small part of it is needed.

**2. Event Listeners:**

Event listeners are closures that often capture DOM elements and other objects. If listeners are not removed, they prevent garbage collection of captured objects.

**3. Circular References:**

Closures can create circular references (closure references object, object references closure), which can prevent garbage collection if the cycle is reachable.

**4. Accidental Captures:**

Closures can accidentally capture more than intended (like entire objects when only a property is needed), keeping unnecessary data in memory.

**Best Practices:**

**1. Minimize Captured Variables:**

Only capture what you need. If you only need a property, capture just that property, not the entire object.

**2. Clear Event Listeners:**

Always remove event listeners when they're no longer needed. This breaks the reference chain and allows garbage collection.

**3. Null References:**

Explicitly set captured variables to `null` in closures when they're no longer needed (if the closure must continue to exist).

**4. Avoid Global Closures:**

Avoid storing closures in global variables or long-lived objects when possible. Use local closures that can be garbage collected.

**5. Use WeakMap for Metadata:**

If you need to store metadata about objects in closures, consider using WeakMap instead, which doesn't prevent garbage collection.

**6. Break Circular References:**

If closures create circular references, break the cycle by nullifying references when no longer needed.

**7. Profile Memory:**

Use memory profiling tools to identify closures that are keeping large amounts of memory alive.

**System Design Consideration**: Understanding closures and memory is crucial for:
1. **Memory Management**: Writing closures that don't cause memory leaks
2. **Performance**: Avoiding unnecessary memory retention
3. **Best Practices**: Following patterns that work well with garbage collection
4. **Debugging**: Understanding why memory might not be freed

Closures are powerful but can cause memory issues if not used carefully. Understanding how closures interact with garbage collection helps you write efficient, leak-free code.

