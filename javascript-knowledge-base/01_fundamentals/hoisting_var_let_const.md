# Hoisting: var, let, and const Differences

Hoisting is JavaScript's behavior of moving declarations to the top of their scope. Understanding hoisting and the differences between var, let, and const is crucial.

## What is Hoisting?

**Hoisting** moves variable and function declarations to the top of their scope before execution.

### var Hoisting

```javascript
// var is hoisted and initialized with undefined
console.log(x);  // undefined (not ReferenceError)
var x = 5;
console.log(x);  // 5

// Equivalent to:
var x;  // Hoisted
console.log(x);  // undefined
x = 5;
console.log(x);  // 5
```

### let and const Hoisting

```javascript
// let and const are hoisted but not initialized (TDZ)
console.log(y);  // ReferenceError: Cannot access 'y' before initialization
let y = 5;

// Temporal Dead Zone (TDZ):
// - Variables exist but cannot be accessed
// - From start of block until declaration
```

## var vs let vs const

### var Characteristics

```javascript
// 1. Function-scoped or globally-scoped
function example() {
    if (true) {
        var x = 10;
    }
    console.log(x);  // 10 (accessible outside block)
}

// 2. Can be redeclared
var x = 1;
var x = 2;  // No error

// 3. Hoisted with undefined
console.log(x);  // undefined
var x = 5;
```

### let Characteristics

```javascript
// 1. Block-scoped
function example() {
    if (true) {
        let x = 10;
    }
    console.log(x);  // ReferenceError: x is not defined
}

// 2. Cannot be redeclared in same scope
let x = 1;
let x = 2;  // SyntaxError: Identifier 'x' has already been declared

// 3. Hoisted but in TDZ
console.log(x);  // ReferenceError
let x = 5;
```

### const Characteristics

```javascript
// 1. Block-scoped (like let)
if (true) {
    const x = 10;
}
console.log(x);  // ReferenceError

// 2. Must be initialized
const x;  // SyntaxError: Missing initializer

// 3. Cannot be reassigned
const x = 5;
x = 10;  // TypeError: Assignment to constant variable

// 4. Hoisted but in TDZ
console.log(x);  // ReferenceError
const x = 5;
```

## Function Hoisting

### Function Declarations

```javascript
// Function declarations are fully hoisted
greet();  // "Hello" (works!)

function greet() {
    console.log('Hello');
}

// Equivalent to:
function greet() {  // Hoisted
    console.log('Hello');
}
greet();
```

### Function Expressions

```javascript
// Function expressions are not hoisted
greet();  // TypeError: greet is not a function

var greet = function() {
    console.log('Hello');
};

// Equivalent to:
var greet;  // Hoisted as undefined
greet();  // TypeError
greet = function() {
    console.log('Hello');
};
```

## Temporal Dead Zone (TDZ)

**TDZ** is the period between entering scope and variable initialization.

```javascript
// TDZ for let/const
{
    // TDZ starts here
    console.log(x);  // ReferenceError (in TDZ)
    let x = 5;  // TDZ ends here
    console.log(x);  // 5 (TDZ ended)
}
```

## Real-World Examples

### Example 1: Common Pitfall

```javascript
// ❌ Problem: var in loop
for (var i = 0; i < 3; i++) {
    setTimeout(() => {
        console.log(i);  // 3, 3, 3 (all print 3)
    }, 100);
}

// ✅ Solution 1: Use let
for (let i = 0; i < 3; i++) {
    setTimeout(() => {
        console.log(i);  // 0, 1, 2
    }, 100);
}

// ✅ Solution 2: IIFE with var
for (var i = 0; i < 3; i++) {
    (function(j) {
        setTimeout(() => {
            console.log(j);  // 0, 1, 2
        }, 100);
    })(i);
}
```

### Example 2: Block Scope

```javascript
// var: Function scope
function example() {
    if (true) {
        var x = 10;
    }
    console.log(x);  // 10 (accessible)
}

// let/const: Block scope
function example() {
    if (true) {
        let x = 10;
        const y = 20;
    }
    console.log(x);  // ReferenceError
    console.log(y);  // ReferenceError
}
```

## Best Practices

1. **Use const by default**: For values that don't change
2. **Use let for variables**: That need reassignment
3. **Avoid var**: Use let/const instead
4. **Understand TDZ**: Be aware of temporal dead zone
5. **Function declarations**: Use for hoisting benefits

## Summary

**Hoisting & var/let/const:**

1. **var**: Function-scoped, hoisted with undefined, can redeclare
2. **let**: Block-scoped, hoisted in TDZ, cannot redeclare
3. **const**: Block-scoped, hoisted in TDZ, cannot reassign
4. **TDZ**: Temporal Dead Zone for let/const
5. **Best Practice**: Use const by default, let when needed, avoid var

**Key Takeaway:**
Hoisting moves declarations to top of scope. var is hoisted with undefined. let/const are hoisted but in TDZ. var is function-scoped, let/const are block-scoped. Use const by default, let for reassignment, avoid var. Understand TDZ behavior.

**Hoisting Strategy:**
- Use const by default
- Use let for reassignment
- Avoid var
- Understand TDZ
- Know function hoisting

**Next Steps:**
- Learn [Scopes & Closures](scopes_closures.md) for scope chain
- Study [Execution Context](execution_context_call_stack.md) for internals
- Master [Memory Model](memory_model_garbage_collection.md) for memory

