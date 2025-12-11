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

---

## 🎯 Interview Questions: JavaScript

### Q1: Explain the concept of "hoisting" in JavaScript. How does hoisting work for different types of declarations (var, let, const, function declarations, function expressions), and what are the practical implications?

**Answer:**

**Hoisting Definition:**

Hoisting is a JavaScript behavior where variable and function declarations are conceptually moved to the top of their containing scope during the creation phase of the execution context. This means that declarations are processed before the code is executed, allowing variables and functions to be used before they appear in the code (though with important differences between declaration types).

**How Hoisting Works:**

During the creation phase of an execution context, the JavaScript engine scans the code for all declarations in the current scope. These declarations are processed and stored in memory before any code execution begins. This creates the illusion that declarations are "hoisted" to the top, though the code itself isn't physically moved—the engine just processes declarations first.

**Hoisting Behavior by Declaration Type:**

**1. `var` Declarations:**

`var` declarations are hoisted and initialized to `undefined` during the creation phase. This means that `var` variables can be accessed before their declaration line, but they will have the value `undefined` until the assignment line is executed. The variable exists in memory from the start of the scope, but without a value until assignment.

**2. `let` and `const` Declarations:**

`let` and `const` declarations are hoisted but are placed in the Temporal Dead Zone (TDZ). The variables exist in memory from the start of the scope, but accessing them before their declaration line throws a `ReferenceError`. This is different from `var`, which returns `undefined`—`let` and `const` cannot be accessed at all until the declaration line is reached during execution.

**3. Function Declarations:**

Function declarations are fully hoisted—both the declaration and the function definition are hoisted. This means function declarations can be called before they appear in the code. The entire function (name and body) is available from the start of the scope.

**4. Function Expressions:**

Function expressions are not hoisted in the same way. If a function expression is assigned to a `var` variable, only the variable declaration is hoisted (initialized to `undefined`), not the function assignment. The function itself cannot be called until after the assignment line executes. If assigned to a `let` or `const` variable, the variable is in the TDZ until the assignment line.

**5. Class Declarations:**

Class declarations are hoisted but placed in the TDZ, similar to `let` and `const`. Classes cannot be accessed before their declaration line, and attempting to do so throws a `ReferenceError`.

**Practical Implications:**

**1. Variable Access Before Declaration:**

With `var`, accessing a variable before declaration returns `undefined` (which can lead to bugs). With `let`/`const`, accessing before declaration throws an error (which is safer, as it makes the bug immediately apparent).

**2. Function Declaration Order:**

Function declarations can be placed anywhere in their scope and will still be hoisted, allowing for flexible code organization. However, this can make code harder to read if functions are called before they're defined in the source code.

**3. Temporal Dead Zone:**

The TDZ for `let`/`const` prevents accessing variables before initialization, which helps catch bugs early. This is one of the reasons `let` and `const` are preferred over `var` in modern JavaScript.

**4. Block Scoping:**

`let` and `const` are block-scoped, meaning they're hoisted to the top of their block (not function), and the TDZ applies within that block. This provides more predictable scoping behavior compared to `var`'s function scoping.

**System Design Consideration**: Understanding hoisting is essential for writing correct JavaScript code and debugging scope-related issues. The different hoisting behaviors of `var`, `let`, `const`, and function declarations explain many common JavaScript pitfalls. Modern best practices favor `let`/`const` over `var` partly because the TDZ prevents the confusing behavior of accessing variables before they're initialized. Understanding hoisting also helps explain why function declarations can be called before they're defined and why function expressions behave differently.

---

### Q2: Explain the "Temporal Dead Zone" (TDZ) for `let` and `const` declarations. How does it differ from `var` hoisting behavior, and why was it introduced?

**Answer:**

**Temporal Dead Zone Definition:**

The Temporal Dead Zone (TDZ) is the period between the start of a scope and the point where a `let` or `const` variable is declared. During this period, the variable exists in memory (it's been hoisted), but accessing it throws a `ReferenceError`. The variable is "dead" (unusable) until it's "born" (declared) at its declaration line.

**How TDZ Works:**

When the JavaScript engine processes a scope during the creation phase, it hoists `let` and `const` declarations (reserves memory for them) but does not initialize them. The variables are placed in the TDZ, which means they cannot be accessed until the declaration line is reached during the execution phase. Once the declaration line executes, the variable leaves the TDZ and can be used normally.

**Difference from `var` Hoisting:**

**`var` Behavior:**

`var` declarations are hoisted and initialized to `undefined` during the creation phase. This means `var` variables can be accessed before their declaration line, but they return `undefined`. This can lead to subtle bugs where code appears to work (no error) but behaves incorrectly because the variable has an unexpected value.

**`let`/`const` Behavior:**

`let` and `const` declarations are hoisted but not initialized. They remain in the TDZ until their declaration line executes. Accessing them before declaration throws a `ReferenceError`, making the bug immediately apparent. This is safer than `var`'s behavior because it prevents code from running with incorrect values.

**Why TDZ Was Introduced:**

**1. Prevent Bugs:**

The TDZ prevents the common bug of accessing variables before they're initialized. With `var`, accessing a variable before declaration returns `undefined`, which can lead to logic errors that are hard to debug. The TDZ makes these bugs immediately obvious by throwing an error.

**2. Enforce Initialization:**

For `const`, the TDZ ensures that constants must be initialized at declaration (since they cannot be reassigned later). The TDZ prevents accessing a `const` before it's initialized, enforcing that constants always have a value.

**3. Improve Code Quality:**

The TDZ encourages better coding practices by making it impossible to use variables before they're declared. This forces developers to write code in a more logical order and reduces the cognitive load of understanding hoisting behavior.

**4. Align with Block Scoping:**

The TDZ works naturally with block scoping. Since `let` and `const` are block-scoped, the TDZ applies within each block, making the scoping behavior more predictable and easier to reason about.

**TDZ Examples:**

Accessing a `let`/`const` variable before declaration throws a `ReferenceError`, not `undefined`. This error occurs even though the variable has been hoisted (exists in memory). The error is thrown because the variable is in the TDZ and cannot be accessed until the declaration line executes.

**System Design Consideration**: The Temporal Dead Zone is a safety mechanism that makes JavaScript more predictable and less error-prone. It's one of the key improvements of `let` and `const` over `var`. Understanding the TDZ helps developers:
1. **Debug Errors**: Understand why accessing `let`/`const` before declaration throws an error
2. **Write Better Code**: Write code in logical order, avoiding TDZ errors
3. **Understand Hoisting**: Recognize that `let`/`const` are hoisted but in the TDZ (not uninitialized like `var`)
4. **Prevent Bugs**: The TDZ catches bugs early that would be subtle with `var`

The TDZ is a fundamental aspect of how `let` and `const` work and is one of the reasons they're preferred over `var` in modern JavaScript development.

---

### Q3: Explain the differences between `var`, `let`, and `const` in terms of scoping, hoisting, reassignment, and redeclaration. When should you use each, and what are the best practices?

**Answer:**

**Scoping Differences:**

**`var` - Function Scoping:**

`var` declarations are function-scoped, meaning they are accessible throughout the entire function in which they're declared, regardless of block boundaries. If declared outside a function, they're globally scoped. This can lead to unexpected behavior when variables are used in loops or conditionals, as they're accessible outside those blocks.

**`let` and `const` - Block Scoping:**

`let` and `const` declarations are block-scoped, meaning they're only accessible within the block (enclosed by `{}`) in which they're declared. This provides more predictable scoping behavior and prevents variables from leaking outside their intended scope.

**Hoisting Differences:**

**`var`:**

`var` declarations are hoisted and initialized to `undefined` during the creation phase. They can be accessed before their declaration line (returns `undefined`), which can lead to bugs.

**`let` and `const`:**

`let` and `const` declarations are hoisted but placed in the Temporal Dead Zone (TDZ). They cannot be accessed before their declaration line (throws `ReferenceError`), which prevents bugs.

**Reassignment Differences:**

**`var` and `let`:**

Both `var` and `let` allow reassignment. Variables declared with `var` or `let` can have their values changed after initialization.

**`const`:**

`const` does not allow reassignment. Once a `const` variable is initialized, it cannot be reassigned. However, if the value is an object or array, the object/array itself cannot be reassigned, but its properties/elements can be modified (the reference is constant, not the value).

**Redeclaration Differences:**

**`var`:**

`var` allows redeclaration within the same scope. Redeclaring a `var` variable in the same scope doesn't throw an error—it's simply ignored, which can lead to confusion.

**`let` and `const`:**

`let` and `const` do not allow redeclaration within the same scope. Attempting to redeclare a `let` or `const` variable throws a `SyntaxError`, preventing accidental redeclarations.

**When to Use Each:**

**Use `const` by Default:**

Use `const` for variables that won't be reassigned. This is the default choice for most variables, as most variables don't need to be reassigned. Using `const` makes code more predictable and prevents accidental reassignments.

**Use `let` for Reassignment:**

Use `let` only when you need to reassign a variable. This should be the exception, not the rule. If you find yourself using `let` frequently, consider if your code can be restructured to use `const` instead.

**Avoid `var`:**

Avoid using `var` in modern JavaScript. The function scoping, hoisting behavior, and redeclaration issues make `var` error-prone. Use `let` or `const` instead, which provide better scoping and prevent common bugs.

**Best Practices:**

1. **Default to `const`**: Start with `const` for all variables, only use `let` when reassignment is necessary
2. **Minimize `let` Usage**: If you're using `let` frequently, reconsider your code structure
3. **Never Use `var`**: Avoid `var` entirely in new code
4. **Understand Block Scoping**: Be aware that `let`/`const` are block-scoped, which affects their accessibility
5. **Understand TDZ**: Recognize that `let`/`const` are in the TDZ until declaration

**System Design Consideration**: The choice between `var`, `let`, and `const` affects code quality, maintainability, and bug prevention. Modern JavaScript best practices strongly favor `const` by default and `let` only when necessary, completely avoiding `var`. This approach:
1. **Prevents Bugs**: Block scoping and TDZ prevent common scoping and initialization bugs
2. **Improves Readability**: `const` signals that a variable won't change, making code easier to understand
3. **Enables Optimization**: Knowing that `const` variables won't be reassigned can help JavaScript engines optimize code
4. **Enforces Best Practices**: Using `const` by default encourages immutable programming patterns

Understanding these differences is essential for writing modern, maintainable JavaScript code.

---

### Q4: Explain how function hoisting differs from variable hoisting. Why can function declarations be called before they're defined, while function expressions cannot?

**Answer:**

**Function Declaration Hoisting:**

Function declarations are fully hoisted—both the function name and the function body are hoisted during the creation phase. This means the entire function (name, parameters, and body) is available from the start of the scope, allowing function declarations to be called before they appear in the code.

**Variable Hoisting:**

Variable declarations (with `var`, `let`, or `const`) are hoisted, but only the declaration is hoisted, not the assignment. For `var`, the variable is initialized to `undefined`. For `let`/`const`, the variable is placed in the TDZ. The assignment (if any) happens during the execution phase, not the creation phase.

**Function Expression Hoisting:**

Function expressions are not hoisted in the same way as function declarations. If a function expression is assigned to a `var` variable:
- The variable declaration is hoisted (initialized to `undefined`)
- The function assignment is not hoisted
- The function cannot be called until after the assignment line executes

If a function expression is assigned to a `let` or `const` variable:
- The variable is hoisted but placed in the TDZ
- The function assignment is not hoisted
- The function cannot be called until after the assignment line executes (and the variable leaves the TDZ)

**Why Function Declarations Can Be Called Early:**

Function declarations are hoisted as complete units (name + body), so they're fully available from the start of the scope. This allows them to be called before they appear in the code, which is useful for:
1. **Mutual Recursion**: Functions that call each other can be defined in any order
2. **Code Organization**: Functions can be called before they're defined, allowing more flexible code organization
3. **Readability**: Main code can appear first, with helper functions defined later

**Why Function Expressions Cannot Be Called Early:**

Function expressions are assignments, not declarations. The assignment happens during the execution phase, not the creation phase. Until the assignment line executes, the variable either:
- Contains `undefined` (if `var`)—calling it would throw a `TypeError`
- Is in the TDZ (if `let`/`const`)—accessing it would throw a `ReferenceError`

**Practical Implications:**

**Function Declarations:**

Can be called anywhere in their scope, even before the declaration line. This provides flexibility but can make code harder to read if functions are called before they're defined.

**Function Expressions:**

Must be defined before they're called. This enforces a more linear code flow but requires careful ordering of code.

**System Design Consideration**: Understanding the difference between function declaration hoisting and function expression hoisting is important for:
1. **Code Organization**: Knowing when functions can be called helps organize code effectively
2. **Debugging**: Understanding why function expressions throw errors when called before assignment
3. **Code Style**: Choosing between function declarations and expressions based on when functions need to be available
4. **Best Practices**: Modern JavaScript often favors function expressions or arrow functions for consistency, even though function declarations provide hoisting benefits

The hoisting behavior of function declarations is a unique feature that can be useful but also confusing. Understanding this difference helps developers write code that works as expected and choose the right function syntax for their needs.

---

### Q5: Explain how hoisting works in different scopes (global, function, block). How does block scoping affect hoisting behavior for `let` and `const`?

**Answer:**

**Hoisting in Global Scope:**

In the global scope, all declarations (`var`, `let`, `const`, function declarations) are hoisted to the top of the global scope. `var` declarations become properties of the global object (window in browsers, global in Node.js), while `let`/`const` declarations are hoisted but not added to the global object. Function declarations are fully hoisted and can be called anywhere in the global scope.

**Hoisting in Function Scope:**

Within a function, all declarations are hoisted to the top of the function scope (not the block). This means:
- `var` declarations are accessible throughout the entire function
- `let`/`const` declarations are hoisted to the function scope but placed in the TDZ
- Function declarations are fully hoisted within the function scope

**Hoisting in Block Scope:**

Block scoping (introduced with `let` and `const`) changes hoisting behavior significantly. When `let` or `const` is declared inside a block (`{}`), the hoisting applies to the block, not the function or global scope:

- The variable is hoisted to the top of the block (not the function)
- The TDZ applies within that block
- The variable is only accessible within the block
- Each block has its own scope and TDZ

**Block Scoping and Hoisting:**

For `let` and `const`, hoisting is block-scoped. This means:
1. **Block-Level Hoisting**: The variable is hoisted to the top of its containing block
2. **Block-Level TDZ**: The TDZ applies within that block—accessing the variable before its declaration line in that block throws an error
3. **Block Isolation**: Variables in different blocks are isolated, even if they have the same name
4. **Nested Blocks**: Inner blocks can shadow variables from outer blocks, and each block has its own TDZ

**Differences from Function Scoping:**

**`var` (Function Scoping):**

`var` declarations are hoisted to the function scope, not the block scope. This means a `var` declared inside a block (like an `if` statement or loop) is accessible throughout the entire function, not just within the block. This can lead to unexpected behavior, especially in loops.

**`let`/`const` (Block Scoping):**

`let` and `const` declarations are hoisted to the block scope. A variable declared inside a block is only accessible within that block. This provides more predictable scoping behavior and prevents variables from leaking outside their intended scope.

**Practical Implications:**

**Loop Variables:**

With `var`, loop variables are hoisted to the function scope, causing all iterations to share the same variable (leading to closure bugs). With `let`, each iteration gets its own block-scoped variable, fixing this issue.

**Conditional Blocks:**

With `var`, variables declared in `if` blocks are accessible outside the block. With `let`/`const`, variables are only accessible within the block, providing better encapsulation.

**Nested Blocks:**

With block scoping, inner blocks can shadow outer block variables, and each block maintains its own TDZ. This allows for more flexible and predictable variable scoping.

**System Design Consideration**: Understanding how hoisting works in different scopes is crucial for writing correct JavaScript code. Block scoping with `let`/`const` provides more predictable and safer scoping behavior compared to `var`'s function scoping. This understanding helps:
1. **Avoid Bugs**: Block scoping prevents variables from leaking outside their intended scope
2. **Fix Closure Issues**: Block-scoped loop variables fix common closure bugs in loops
3. **Write Better Code**: Understanding block-level hoisting helps write more maintainable code
4. **Debug Scope Issues**: Knowing where variables are hoisted helps debug scope-related problems

The combination of block scoping and TDZ makes `let`/`const` much safer and more predictable than `var`, which is why they're preferred in modern JavaScript development.

