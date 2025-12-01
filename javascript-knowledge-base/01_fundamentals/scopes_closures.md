# Scopes & Closures: Understanding Scope Chain and Closure

Scopes and closures are fundamental concepts in JavaScript. Understanding them is essential for writing effective code.

## Scopes

**Scope** determines the accessibility of variables, functions, and objects.

### Global Scope

```javascript
// Global scope: Accessible everywhere
var globalVar = 'I am global';

function example() {
    console.log(globalVar);  // Accessible
}

console.log(globalVar);  // Accessible
```

### Function Scope

```javascript
// Function scope: Variables accessible within function
function example() {
    var functionVar = 'I am in function scope';
    console.log(functionVar);  // Accessible
}

console.log(functionVar);  // ReferenceError: functionVar is not defined
```

### Block Scope

```javascript
// Block scope: Variables accessible within block (let/const)
if (true) {
    let blockVar = 'I am in block scope';
    const another = 'Me too';
    console.log(blockVar);  // Accessible
}

console.log(blockVar);  // ReferenceError: blockVar is not defined
```

## Scope Chain

**Scope Chain** is the hierarchy of scopes that JavaScript uses to resolve variables.

```javascript
var global = 'global';

function outer() {
    var outerVar = 'outer';
    
    function middle() {
        var middleVar = 'middle';
        
        function inner() {
            var innerVar = 'inner';
            
            // Scope chain: inner → middle → outer → global
            console.log(innerVar);   // inner (current scope)
            console.log(middleVar);  // middle (parent scope)
            console.log(outerVar);  // outer (grandparent scope)
            console.log(global);     // global (global scope)
        }
        
        inner();
    }
    
    middle();
}

outer();
```

## Closures

**Closure** is a function that has access to variables in its outer (enclosing) scope even after the outer function has returned.

### Basic Closure

```javascript
function outer() {
    var outerVar = 'I am outer';
    
    function inner() {
        console.log(outerVar);  // Accesses outerVar
    }
    
    return inner;  // Return inner function
}

const closure = outer();
closure();  // "I am outer" (still has access to outerVar)
```

### Closure with Parameters

```javascript
function createCounter() {
    let count = 0;
    
    return function() {
        count++;  // Accesses count from outer scope
        return count;
    };
}

const counter1 = createCounter();
const counter2 = createCounter();

console.log(counter1());  // 1
console.log(counter1());  // 2
console.log(counter2());  // 1 (separate closure)
console.log(counter1());  // 3
```

## Real-World Examples

### Example 1: Module Pattern

```javascript
// Module pattern using closure
const module = (function() {
    var privateVar = 'I am private';
    
    function privateFunction() {
        return privateVar;
    }
    
    return {
        publicMethod: function() {
            return privateFunction();
        }
    };
})();

console.log(module.publicMethod());  // "I am private"
console.log(module.privateVar);       // undefined (private)
```

### Example 2: Event Handlers

```javascript
// Closure in event handlers
function setupButtons() {
    for (let i = 0; i < 3; i++) {
        const button = document.createElement('button');
        button.textContent = `Button ${i}`;
        
        button.addEventListener('click', function() {
            console.log(`Button ${i} clicked`);  // Closure captures i
        });
        
        document.body.appendChild(button);
    }
}

// With var (problem):
function setupButtonsBad() {
    for (var i = 0; i < 3; i++) {
        // All buttons log "Button 3" (var is function-scoped)
    }
}
```

### Example 3: Memoization

```javascript
// Memoization using closure
function memoize(fn) {
    const cache = {};  // Closure variable
    
    return function(...args) {
        const key = JSON.stringify(args);
        
        if (cache[key]) {
            return cache[key];
        }
        
        const result = fn.apply(this, args);
        cache[key] = result;
        return result;
    };
}

const expensiveFunction = memoize(function(n) {
    console.log('Computing...');
    return n * 2;
});

expensiveFunction(5);  // Computing... 10
expensiveFunction(5);  // 10 (from cache)
```

## Common Pitfalls

### Loop with var

```javascript
// ❌ Problem: var in loop
var functions = [];
for (var i = 0; i < 3; i++) {
    functions.push(function() {
        console.log(i);  // All print 3
    });
}

functions[0]();  // 3
functions[1]();  // 3
functions[2]();  // 3

// ✅ Solution: Use let
var functions = [];
for (let i = 0; i < 3; i++) {
    functions.push(function() {
        console.log(i);  // 0, 1, 2
    });
}

// ✅ Alternative: IIFE
var functions = [];
for (var i = 0; i < 3; i++) {
    functions.push((function(j) {
        return function() {
            console.log(j);  // 0, 1, 2
        };
    })(i));
}
```

## Best Practices

1. **Understand Scope Chain**: Know how variables are resolved
2. **Use Closures Wisely**: Don't create unnecessary closures
3. **Avoid var in Loops**: Use let for block scope
4. **Memory Leaks**: Be aware of closure memory implications
5. **Module Pattern**: Use closures for encapsulation

## Summary

**Scopes & Closures:**

1. **Scopes**: Global, function, block
2. **Scope Chain**: Hierarchy for variable resolution
3. **Closures**: Functions with access to outer scope
4. **Use Cases**: Module pattern, event handlers, memoization
5. **Best Practice**: Understand scope chain, use closures wisely

**Key Takeaway:**
Scope determines variable accessibility. Scope chain resolves variables through hierarchy. Closures allow functions to access outer scope variables. Use closures for encapsulation, memoization, and event handlers. Be aware of common pitfalls like var in loops.

**Scope Strategy:**
- Understand scope types
- Know scope chain
- Use closures effectively
- Avoid var in loops
- Watch for memory leaks

**Next Steps:**
- Learn [Hoisting](hoisting_var_let_const.md) for variable behavior
- Study [Execution Context](execution_context_call_stack.md) for internals
- Master [Memory Model](memory_model_garbage_collection.md) for memory

