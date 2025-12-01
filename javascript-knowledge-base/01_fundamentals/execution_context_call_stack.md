# Execution Context & Call Stack: JavaScript Internals

Understanding execution context and call stack is fundamental to understanding how JavaScript executes code.

## Execution Context

**Execution Context** is the environment where JavaScript code is executed.

### Types of Execution Contexts

```javascript
// 1. Global Execution Context
// - Created when script starts
// - One per program
// - Contains global variables and functions

var globalVar = 'I am global';

// 2. Function Execution Context
// - Created when function is called
// - One per function call
// - Contains function parameters and local variables

function greet(name) {
    var localVar = 'Hello';
    return localVar + ', ' + name;
}

// 3. Eval Execution Context
// - Created when eval() is called
// - Rarely used in modern code
```

### Execution Context Components

```javascript
function example(a, b) {
    var x = 10;
    let y = 20;
    const z = 30;
    
    function inner() {
        return x + y + z;
    }
    
    return inner();
}

// Execution Context contains:
// 1. Variable Environment (var declarations)
// 2. Lexical Environment (let, const, functions)
// 3. This binding
// 4. Outer environment reference
```

## Call Stack

**Call Stack** is a data structure that tracks function calls.

### How Call Stack Works

```javascript
function first() {
    console.log('First');
    second();
}

function second() {
    console.log('Second');
    third();
}

function third() {
    console.log('Third');
}

first();

// Call Stack:
// 1. first() called
//    └── Call Stack: [first]
// 2. second() called from first
//    └── Call Stack: [first, second]
// 3. third() called from second
//    └── Call Stack: [first, second, third]
// 4. third() returns
//    └── Call Stack: [first, second]
// 5. second() returns
//    └── Call Stack: [first]
// 6. first() returns
//    └── Call Stack: []
```

### Stack Overflow

```javascript
// Stack overflow occurs when call stack exceeds limit
function recursive() {
    recursive();  // Infinite recursion
}

recursive();  // RangeError: Maximum call stack size exceeded
```

## Execution Context Creation

### Creation Phase

```javascript
function example(a, b) {
    var x;
    let y;
    
    x = 10;
    y = 20;
    
    return x + y;
}

// Creation Phase (before execution):
// 1. Create variable environment
//    - x: undefined (hoisted)
// 2. Create lexical environment
//    - y: <uninitialized> (TDZ)
// 3. Create this binding
// 4. Create outer environment reference
```

### Execution Phase

```javascript
// Execution Phase:
// 1. Assign values
//    - x = 10
//    - y = 20
// 2. Execute code
//    - return x + y
```

## Real-World Examples

### Example 1: Nested Functions

```javascript
function outer() {
    var outerVar = 'outer';
    
    function middle() {
        var middleVar = 'middle';
        
        function inner() {
            var innerVar = 'inner';
            console.log(outerVar, middleVar, innerVar);
        }
        
        inner();
    }
    
    middle();
}

outer();

// Call Stack during inner():
// [outer, middle, inner]
// Each has access to outer scope
```

### Example 2: Recursive Function

```javascript
function factorial(n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

factorial(5);

// Call Stack:
// factorial(5)
//   └── factorial(4)
//       └── factorial(3)
//           └── factorial(2)
//               └── factorial(1)
//                   └── returns 1
```

## Best Practices

1. **Understand Stack**: Know call stack behavior
2. **Avoid Deep Recursion**: Use iteration or tail calls
3. **Debug Stack**: Use stack traces for debugging
4. **Memory**: Be aware of stack size limits
5. **Async**: Understand async call stack behavior

## Summary

**Execution Context & Call Stack:**

1. **Execution Context**: Environment for code execution
2. **Types**: Global, function, eval
3. **Components**: Variable environment, lexical environment, this, outer reference
4. **Call Stack**: Tracks function calls
5. **Best Practice**: Understand stack behavior, avoid deep recursion

**Key Takeaway:**
Execution context is the environment where JavaScript executes. It contains variable environment, lexical environment, this binding, and outer reference. Call stack tracks function calls. Understand creation and execution phases. Be aware of stack limits and recursion depth.

**Context Strategy:**
- Understand execution context
- Know call stack behavior
- Avoid deep recursion
- Use stack traces
- Understand async behavior

**Next Steps:**
- Learn [Hoisting](hoisting_var_let_const.md) for variable behavior
- Study [Scopes & Closures](scopes_closures.md) for scope chain
- Master [Memory Model](../01_fundamentals/memory_model_garbage_collection.md) for memory

