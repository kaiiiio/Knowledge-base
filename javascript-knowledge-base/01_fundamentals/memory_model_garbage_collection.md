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

