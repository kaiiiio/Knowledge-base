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

---

## 🎯 Interview Questions: JavaScript

### Q1: Explain the concept of "execution context" in JavaScript. What are the different types of execution contexts, and what components does each execution context contain?

**Answer:**

**Execution Context Definition:**

An execution context is the environment in which JavaScript code is executed. It's an abstract concept that represents the scope, variable environment, and execution environment for a piece of code. Every time JavaScript code runs, it executes within an execution context, which provides the necessary information for the code to execute correctly.

**Types of Execution Contexts:**

**1. Global Execution Context:**

The global execution context is created when the JavaScript engine first starts executing code. There is only one global execution context per JavaScript program, and it remains active for the entire lifetime of the program. It represents the global scope and contains all global variables, functions, and objects.

**2. Function Execution Context:**

A function execution context is created every time a function is called. Each function invocation creates a new execution context, which is independent of other function execution contexts. When the function completes execution, its execution context is destroyed. This is why functions can have their own local variables that don't interfere with variables in other functions or the global scope.

**3. Eval Execution Context:**

An eval execution context is created when code is executed using the `eval()` function. This is a special case and is generally discouraged in modern JavaScript due to security and performance concerns. Eval execution contexts have their own scope and can create variables that are isolated from the surrounding code.

**Components of Execution Context:**

**1. Variable Environment:**

The variable environment stores variable and function declarations created within the execution context. In the creation phase (before code execution), all variable declarations are hoisted and initialized (var declarations are initialized to `undefined`, let/const declarations are placed in the Temporal Dead Zone). The variable environment is where `var` declarations are stored.

**2. Lexical Environment:**

The lexical environment is similar to the variable environment but is used for `let` and `const` declarations. It also maintains a reference to the outer (enclosing) lexical environment, forming the scope chain. The lexical environment is what enables closures and scope chain resolution.

**3. This Binding:**

The `this` binding determines what the `this` keyword refers to in the current execution context. The value of `this` depends on how a function is called:
- In global context: `this` refers to the global object (window in browsers, global in Node.js)
- In function context: `this` depends on how the function is called (method call, function call, constructor call, etc.)
- In arrow functions: `this` is lexically bound (inherited from enclosing scope)

**4. Outer Environment Reference:**

The outer environment reference (also called the outer lexical environment reference) points to the execution context that contains the current execution context. This forms the scope chain, allowing inner functions to access variables from outer scopes. This is what enables closures—inner functions can access variables from their outer (enclosing) execution contexts even after the outer function has completed execution.

**Execution Context Lifecycle:**

**Creation Phase:**

1. Create the execution context
2. Create the variable environment and lexical environment
3. Hoist variable and function declarations
4. Determine `this` binding
5. Set up the outer environment reference

**Execution Phase:**

1. Execute code line by line
2. Assign values to variables
3. Execute function calls (creating new execution contexts)
4. Return values when functions complete

**System Design Consideration**: Understanding execution contexts is fundamental to understanding how JavaScript works. It explains variable scoping, hoisting behavior, closure mechanics, and `this` binding. Execution contexts are the foundation of JavaScript's execution model, and understanding them is essential for debugging, understanding scope-related bugs, and writing efficient, correct JavaScript code. The concept of execution contexts also explains why JavaScript behaves the way it does with closures, scope chains, and variable access patterns.

---

### Q2: Explain how the call stack works in JavaScript. What happens when a function is called, and how does the call stack manage multiple function calls and their execution contexts?

**Answer:**

**Call Stack Definition:**

The call stack is a data structure that tracks function calls and their execution contexts. It's a LIFO (Last In, First Out) stack that stores execution contexts as functions are called. When a function is invoked, its execution context is pushed onto the call stack. When the function completes execution, its execution context is popped off the stack, and execution resumes in the previous execution context.

**How the Call Stack Works:**

**Function Call Process:**

1. **Function Invocation**: When a function is called, the JavaScript engine creates a new execution context for that function
2. **Push to Stack**: The new execution context is pushed onto the call stack
3. **Execution**: The function's code executes within its execution context
4. **Function Completion**: When the function returns (or completes), its execution context is popped off the stack
5. **Resume Execution**: Execution resumes in the previous execution context (the one that called the function)

**Call Stack Behavior:**

The call stack ensures that JavaScript executes code in a predictable, sequential manner. Only one execution context is active at a time (the one at the top of the stack). When a function calls another function, the new function's execution context is pushed on top, pausing the calling function's execution until the called function completes.

**Visual Representation:**

```
Call Stack (bottom to top):

[Global Execution Context]  ← Base of stack
    ↓
[functionA Execution Context]  ← functionA called
    ↓
[functionB Execution Context]  ← functionB called from functionA
    ↓
[functionC Execution Context]  ← functionC called from functionB (TOP - currently executing)
```

When functionC completes, it's popped off, and execution resumes in functionB. When functionB completes, it's popped off, and execution resumes in functionA, and so on.

**Stack Overflow:**

The call stack has a maximum size limit (varies by JavaScript engine, typically thousands of frames). If too many functions are called recursively without returning, the stack can overflow, resulting in a "Maximum call stack size exceeded" error. This commonly happens with infinite recursion or very deep recursion without proper base cases.

**Synchronous Execution:**

The call stack handles synchronous execution. Asynchronous operations (setTimeout, promises, async/await) are handled differently—they don't block the call stack. Instead, they're managed by the event loop and callback queue, which allows JavaScript to remain non-blocking despite being single-threaded.

**System Design Consideration**: The call stack is fundamental to understanding JavaScript's execution model. It explains how function calls are managed, why recursive functions can cause stack overflow errors, and how execution flows through nested function calls. Understanding the call stack is essential for debugging (stack traces show the call stack), understanding recursion, and writing efficient code. The call stack also explains why JavaScript is single-threaded (only one execution context is active at a time) and how asynchronous operations work (they don't block the call stack, allowing other code to execute).

---

### Q3: Explain the relationship between execution context and scope in JavaScript. How does the scope chain work, and how does it enable closures?

**Answer:**

**Execution Context and Scope Relationship:**

Scope determines the accessibility of variables, while execution context is the environment in which code executes. The scope chain is built from execution contexts—each execution context has a reference to its outer (enclosing) execution context, forming a chain that JavaScript uses to resolve variable references.

**Scope Chain Mechanism:**

When JavaScript needs to access a variable, it first looks in the current execution context's variable environment and lexical environment. If the variable is not found, it follows the outer environment reference to the next execution context in the chain and searches there. This process continues up the scope chain until the variable is found or the global scope is reached (where an error is thrown if the variable still isn't found).

**How Scope Chain is Formed:**

The scope chain is determined by the lexical (physical) structure of the code, not by how functions are called. When a function is defined, it captures a reference to its outer execution context's lexical environment. This reference forms the scope chain and remains constant throughout the function's lifetime, regardless of where or how the function is called.

**Closures and Scope Chain:**

A closure is formed when an inner function has access to variables from its outer (enclosing) execution context, even after the outer function has completed execution. This is possible because:

1. **Lexical Scoping**: Functions have access to variables in their lexical (physical) scope
2. **Outer Environment Reference**: Inner functions maintain a reference to their outer execution context's lexical environment
3. **Execution Context Persistence**: Even after the outer function completes, its execution context's lexical environment is preserved if inner functions still reference it

**Closure Example Explanation:**

When an inner function is defined inside an outer function, the inner function's execution context (when created) includes an outer environment reference pointing to the outer function's execution context. When the outer function completes, its execution context would normally be destroyed, but if the inner function is returned or stored, the reference to the outer function's lexical environment is preserved. This allows the inner function to continue accessing variables from the outer function's scope, even though the outer function has finished executing.

**System Design Consideration**: Understanding the relationship between execution context and scope is crucial for understanding closures, one of JavaScript's most powerful features. Closures enable patterns like module patterns, data privacy, function factories, and event handlers. The scope chain mechanism explains how JavaScript resolves variable references and why closures work the way they do. This understanding is essential for writing correct, efficient JavaScript code and for debugging scope-related issues. The lexical (static) nature of the scope chain means that variable resolution is determined at function definition time, not at function call time, which is a fundamental aspect of how JavaScript works.

---

### Q4: Explain what happens during the "creation phase" and "execution phase" of an execution context. How does hoisting work, and why does it happen during the creation phase?

**Answer:**

**Creation Phase:**

The creation phase occurs before any code in the execution context is executed. During this phase, the JavaScript engine sets up the execution context infrastructure:

1. **Create Variable Environment**: The variable environment is created to store `var` declarations and function declarations
2. **Create Lexical Environment**: The lexical environment is created to store `let` and `const` declarations
3. **Hoist Declarations**: All variable and function declarations are "hoisted" (moved to the top of their scope conceptually)
4. **Initialize Variables**: `var` declarations are initialized to `undefined`, while `let` and `const` declarations are placed in the Temporal Dead Zone (TDZ)
5. **Set `this` Binding**: The value of `this` is determined based on how the function is called
6. **Set Outer Environment Reference**: The reference to the outer (enclosing) lexical environment is established

**Execution Phase:**

The execution phase occurs after the creation phase and involves actually executing the code line by line:

1. **Execute Code**: Code is executed sequentially, line by line
2. **Assign Values**: Variable assignments are performed (variables that were hoisted and initialized to `undefined` now get their actual values)
3. **Function Calls**: When functions are called, new execution contexts are created (going through their own creation and execution phases)
4. **Return Values**: When functions complete, they return values, and their execution contexts are destroyed

**Hoisting Mechanism:**

Hoisting is the behavior where variable and function declarations are moved to the top of their containing scope during the creation phase. This is a conceptual model—the JavaScript engine doesn't physically move code, but it processes declarations first before executing code. This means that variables and functions can be used before they are declared in the code (though with important caveats for `let` and `const`).

**Why Hoisting Happens:**

Hoisting happens because the JavaScript engine needs to know about all declarations in a scope before executing code. This allows the engine to:
1. **Reserve Memory**: Allocate memory for variables before code execution
2. **Build Scope Chain**: Establish the scope chain with all available identifiers
3. **Enable Function Declarations**: Allow functions to be called before they appear in the code (useful for mutual recursion and code organization)

**Differences in Hoisting Behavior:**

- **`var` Declarations**: Hoisted and initialized to `undefined`. Can be accessed before declaration (returns `undefined`)
- **`let` and `const` Declarations**: Hoisted but placed in Temporal Dead Zone. Cannot be accessed before declaration (throws ReferenceError)
- **Function Declarations**: Fully hoisted (both declaration and definition). Can be called before declaration
- **Function Expressions**: Not hoisted (only the variable is hoisted, not the function assignment)

**System Design Consideration**: Understanding the creation and execution phases is fundamental to understanding JavaScript's behavior, especially hoisting. This knowledge is essential for:
1. **Debugging**: Understanding why variables can be accessed before declaration (and why `let`/`const` behave differently)
2. **Code Organization**: Understanding that function declarations can be called before they're defined
3. **Best Practices**: Knowing why `let`/`const` are preferred over `var` (TDZ prevents accessing variables before initialization)
4. **Performance**: Understanding that hoisting happens once during creation phase, not repeatedly during execution

The two-phase approach (creation then execution) is a fundamental aspect of how JavaScript engines work and explains many of the language's behaviors that might seem counterintuitive at first.

---

### Q5: Explain how execution contexts are created and destroyed in JavaScript. What is the relationship between execution context lifecycle and memory management, and how does this relate to closures and memory leaks?

**Answer:**

**Execution Context Creation:**

An execution context is created when:
1. **Global Context**: When the JavaScript engine starts executing a script
2. **Function Context**: When a function is called (each function call creates a new execution context)
3. **Eval Context**: When `eval()` is used (though this is discouraged)

The creation process involves allocating memory for the execution context's components (variable environment, lexical environment, `this` binding, outer environment reference) and setting up the scope chain.

**Execution Context Destruction:**

An execution context is typically destroyed when:
1. **Function Completion**: When a function returns or completes execution, its execution context is popped off the call stack and becomes eligible for garbage collection
2. **No References**: The execution context's memory can be reclaimed by the garbage collector when there are no remaining references to it

**Memory Management and Execution Contexts:**

Execution contexts consume memory (storing variables, function parameters, scope chain references). Normally, when a function completes, its execution context is destroyed and memory is reclaimed. However, if parts of the execution context are still referenced (through closures), the memory cannot be reclaimed, leading to the execution context (or parts of it) persisting in memory.

**Closures and Memory Persistence:**

When a closure is created (an inner function references variables from an outer function), the inner function maintains a reference to the outer function's lexical environment. This prevents the outer function's execution context from being garbage collected, even after the outer function completes. The memory for the outer function's variables is preserved because the closure still needs access to them.

**Memory Leaks and Execution Contexts:**

Memory leaks can occur when:
1. **Unintended Closures**: Closures capture more variables than necessary, preventing garbage collection of large objects
2. **Circular References**: Execution contexts reference each other in ways that prevent garbage collection
3. **Event Listeners**: Event listeners that capture execution context variables and are never removed
4. **Global Variables**: Variables in the global execution context persist for the entire program lifetime

**Garbage Collection and Execution Contexts:**

JavaScript uses garbage collection to automatically manage memory. The garbage collector identifies execution contexts (and their associated memory) that are no longer reachable and reclaims that memory. However, if an execution context is still reachable (through closures, global references, etc.), it cannot be garbage collected.

**System Design Consideration**: Understanding execution context lifecycle and memory management is crucial for:
1. **Performance**: Avoiding memory leaks by ensuring execution contexts can be garbage collected when no longer needed
2. **Closure Design**: Creating closures that only capture necessary variables, avoiding unnecessary memory retention
3. **Debugging**: Understanding why memory usage might be higher than expected (closures keeping execution contexts alive)
4. **Best Practices**: Properly cleaning up event listeners, avoiding circular references, and being mindful of what closures capture

The relationship between execution contexts and memory management explains why closures are powerful but must be used carefully. A well-designed closure captures only what's needed, while a poorly designed closure can lead to memory leaks by preventing garbage collection of large objects or entire execution contexts that are no longer needed.

