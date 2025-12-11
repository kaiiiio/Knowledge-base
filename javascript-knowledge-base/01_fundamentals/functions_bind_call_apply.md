# Functions: Declaration, Expression, Arrow, bind/call/apply

Functions are first-class citizens in JavaScript. Understanding function types and methods is essential.

## Function Declarations

**Function declarations** are hoisted and can be called before definition.

```javascript
// Function declaration
function greet(name) {
    return `Hello, ${name}`;
}

// Hoisted: Can call before definition
greet('John');  // Works!

// Equivalent to:
function greet(name) {  // Hoisted
    return `Hello, ${name}`;
}
greet('John');
```

## Function Expressions

**Function expressions** are not hoisted.

```javascript
// Function expression
const greet = function(name) {
    return `Hello, ${name}`;
};

// Not hoisted: Cannot call before definition
greet('John');  // Works (after definition)

// Named function expression
const greet = function greetFunction(name) {
    return `Hello, ${name}`;
};
```

## Arrow Functions

**Arrow functions** have lexical `this` and concise syntax.

```javascript
// Arrow function
const greet = (name) => {
    return `Hello, ${name}`;
};

// Concise: Single expression
const greet = (name) => `Hello, ${name}`;

// Single parameter: No parentheses
const greet = name => `Hello, ${name}`;

// No parameters: Empty parentheses
const greet = () => 'Hello';

// Object literal: Wrap in parentheses
const createUser = (name, age) => ({ name, age });
```

### Arrow Function Characteristics

```javascript
// 1. Lexical this
const obj = {
    name: 'John',
    greet: function() {
        return () => {
            return `Hello, ${this.name}`;  // this refers to obj
        };
    }
};

// 2. No arguments object
const func = () => {
    console.log(arguments);  // ReferenceError
};

// 3. Cannot be constructor
const Person = (name) => {
    this.name = name;  // TypeError: Arrow functions cannot be constructors
};

// 4. No prototype
const func = () => {};
console.log(func.prototype);  // undefined
```

## call, apply, bind

### call

**call** invokes function with specified `this` and arguments.

```javascript
function greet(greeting, punctuation) {
    return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: 'John' };

greet.call(person, 'Hello', '!');  // "Hello, John!"

// call with no arguments
function getFullName() {
    return `${this.firstName} ${this.lastName}`;
}

const person = { firstName: 'John', lastName: 'Doe' };
getFullName.call(person);  // "John Doe"
```

### apply

**apply** invokes function with specified `this` and array of arguments.

```javascript
function greet(greeting, punctuation) {
    return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: 'John' };

greet.apply(person, ['Hello', '!']);  // "Hello, John!"

// Useful for array arguments
const numbers = [1, 2, 3, 4, 5];
Math.max.apply(null, numbers);  // 5
Math.max(...numbers);  // 5 (modern way)
```

### bind

**bind** creates new function with bound `this` and arguments.

```javascript
function greet(greeting, punctuation) {
    return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: 'John' };

// Bind this
const boundGreet = greet.bind(person);
boundGreet('Hello', '!');  // "Hello, John!"

// Bind this and arguments
const boundGreet2 = greet.bind(person, 'Hello');
boundGreet2('!');  // "Hello, John!"

// Partial application
function multiply(a, b, c) {
    return a * b * c;
}

const multiplyByTwo = multiply.bind(null, 2);
multiplyByTwo(3, 4);  // 24 (2 * 3 * 4)
```

## Real-World Examples

### Example 1: Method Borrowing

```javascript
// Borrow array methods
const arrayLike = {
    0: 'a',
    1: 'b',
    2: 'c',
    length: 3
};

// Use Array methods
Array.prototype.forEach.call(arrayLike, (item) => {
    console.log(item);  // 'a', 'b', 'c'
});

// Modern: Array.from
Array.from(arrayLike).forEach(item => {
    console.log(item);
});
```

### Example 2: Event Handlers

```javascript
// bind for event handlers
class Button {
    constructor(label) {
        this.label = label;
        this.clickCount = 0;
    }
    
    handleClick() {
        this.clickCount++;
        console.log(`${this.label} clicked ${this.clickCount} times`);
    }
    
    attach() {
        // bind preserves this
        document.getElementById('button')
            .addEventListener('click', this.handleClick.bind(this));
    }
}

// Arrow function alternative
class Button {
    constructor(label) {
        this.label = label;
        this.clickCount = 0;
    }
    
    handleClick = () => {  // Arrow function preserves this
        this.clickCount++;
        console.log(`${this.label} clicked ${this.clickCount} times`);
    }
}
```

### Example 3: Currying with bind

```javascript
// Currying: Create specialized functions
function add(a, b, c) {
    return a + b + c;
}

const add10 = add.bind(null, 10);
const add10And20 = add10.bind(null, 20);

add10And20(30);  // 60 (10 + 20 + 30)

// Modern: Arrow functions
const add = a => b => c => a + b + c;
const add10 = add(10);
const add10And20 = add10(20);
add10And20(30);  // 60
```

## Best Practices

1. **Use Arrow Functions**: For callbacks and methods
2. **Function Declarations**: For hoisting needs
3. **bind**: For preserving this in callbacks
4. **call/apply**: For method borrowing
5. **Avoid arguments**: Use rest parameters instead

## Summary

**Functions: Declaration, Expression, Arrow, bind/call/apply:**

1. **Declarations**: Hoisted, can call before definition
2. **Expressions**: Not hoisted, assigned to variables
3. **Arrow Functions**: Lexical this, concise syntax
4. **call/apply**: Invoke with specific this
5. **bind**: Create bound function

**Key Takeaway:**
Function declarations are hoisted. Function expressions are not. Arrow functions have lexical this and concise syntax. Use call/apply to invoke with specific this. Use bind to create bound functions. Arrow functions cannot be constructors and don't have prototype.

**Function Strategy:**
- Use arrow functions for callbacks
- Use declarations for hoisting
- Use bind for this preservation
- Use call/apply for method borrowing
- Avoid arguments object

**Next Steps:**
- Learn [Generators & Iterators](generators_iterators.md) for advanced functions
- Study [Async/Await](async_await_promises.md) for asynchronous functions
- Master [Closures](../01_fundamentals/scopes_closures.md) for scope understanding

---

## 🎯 Interview Questions: JavaScript

### Q1: Explain how `this` binding works in JavaScript functions. How does `this` differ between regular functions, arrow functions, and methods, and what determines the value of `this`?

**Answer:**

**`this` Binding Concept:**

`this` is a special keyword in JavaScript that refers to the context in which a function is executed. The value of `this` is determined by how a function is called, not where it's defined. This is different from many other programming languages where `this` is determined lexically (by where it's written).

**How `this` is Determined:**

**1. Function Invocation:**

The value of `this` depends on how the function is invoked:
- **Method Call**: When called as a method (`obj.method()`), `this` refers to the object
- **Function Call**: When called as a standalone function (`func()`), `this` refers to the global object (or `undefined` in strict mode)
- **Constructor Call**: When called with `new`, `this` refers to the newly created object
- **Explicit Binding**: When called with `call()`, `apply()`, or `bind()`, `this` is explicitly set

**2. Regular Functions:**

Regular functions have dynamic `this` binding—the value of `this` is determined at call time based on how the function is invoked. This can lead to `this` changing unexpectedly, especially when functions are passed as callbacks or stored in variables.

**3. Arrow Functions:**

Arrow functions have lexical `this` binding—they don't have their own `this`. Instead, they inherit `this` from the enclosing scope (where they're defined). The value of `this` in an arrow function is fixed at definition time and doesn't change based on how it's called.

**4. Methods:**

When a function is called as a method (a property of an object), `this` refers to the object the method is called on. However, if the method is extracted and called separately, `this` can be lost unless bound.

**Common `this` Issues:**

**1. Lost Context:**

When a method is extracted from an object and called separately, `this` is lost. For example, `const func = obj.method; func()` loses the `this` context.

**2. Callback Functions:**

When passing methods as callbacks, `this` can be lost because the method is called in a different context. This is a common source of bugs.

**3. Nested Functions:**

Nested functions (functions inside methods) have their own `this` context, which is often not what you want. Arrow functions solve this by inheriting `this` from the outer scope.

**System Design Consideration**: Understanding `this` binding is crucial for:
1. **Method Calls**: Knowing how `this` works in object methods
2. **Event Handlers**: Understanding `this` in event callbacks
3. **Callbacks**: Handling `this` when passing functions as arguments
4. **Arrow Functions**: Knowing when to use arrow functions vs. regular functions

The `this` binding mechanism is one of JavaScript's most confusing features because it's determined dynamically. Arrow functions provide a solution by using lexical `this`, but understanding how regular functions work is still essential for effective JavaScript development.

---

### Q2: Explain how `call()`, `apply()`, and `bind()` work in JavaScript. What are the differences between them, and when would you use each?

**Answer:**

**Purpose of These Methods:**

`call()`, `apply()`, and `bind()` are methods available on all functions that allow you to explicitly control the value of `this` when the function is executed. They're used to set the context (`this`) for function calls, which is essential when you need to call a function with a specific `this` value.

**`call()` Method:**

`call()` invokes the function immediately with a specified `this` value and individual arguments. The first argument is the `this` value, and subsequent arguments are passed individually to the function. `call()` executes the function immediately and returns its result.

**`apply()` Method:**

`apply()` is similar to `call()`, but it takes an array (or array-like object) of arguments instead of individual arguments. The first argument is the `this` value, and the second argument is an array of arguments to pass to the function. `apply()` executes the function immediately and returns its result.

**`bind()` Method:**

`bind()` doesn't invoke the function immediately. Instead, it returns a new function with a bound `this` value and optionally pre-filled arguments (partial application). The bound function can be called later, and it will always use the specified `this` value. `bind()` is useful for creating functions with fixed context.

**Key Differences:**

**1. Execution:**

- **`call()`**: Executes immediately
- **`apply()`**: Executes immediately
- **`bind()`**: Returns a new function (doesn't execute)

**2. Arguments:**

- **`call()`**: Takes individual arguments: `func.call(thisArg, arg1, arg2, ...)`
- **`apply()`**: Takes an array of arguments: `func.apply(thisArg, [arg1, arg2, ...])`
- **`bind()`**: Takes individual arguments (for partial application): `func.bind(thisArg, arg1, arg2)`

**3. Use Cases:**

- **`call()`**: When you know the exact number of arguments and want to call immediately
- **`apply()`**: When you have arguments in an array or don't know the number of arguments
- **`bind()`**: When you want to create a function with fixed `this` or pre-filled arguments

**When to Use Each:**

**`call()`:**

- Method borrowing (calling a method from one object on another)
- When you have a fixed number of arguments
- When you want immediate execution with a specific `this`

**`apply()`:**

- When arguments are in an array
- When the number of arguments is variable or unknown
- Passing arguments from one function to another
- Useful with `Math.max()` or similar functions that take variable arguments

**`bind()`:**

- Creating event handlers with fixed `this` context
- Creating functions with pre-filled arguments (currying)
- Storing methods to call later with the correct context
- Creating specialized functions from generic ones

**System Design Consideration**: Understanding these methods is important for:
1. **Context Control**: Explicitly controlling `this` in function calls
2. **Method Borrowing**: Using methods from one object on another
3. **Function Composition**: Creating new functions with bound context or arguments
4. **Event Handling**: Preserving `this` context in event handlers

These methods are fundamental tools for controlling function execution context in JavaScript. While arrow functions have reduced the need for `bind()` in many cases, `call()` and `apply()` are still essential for method borrowing and dynamic function invocation, and `bind()` is useful for creating specialized functions and preserving context.

---

### Q3: Explain what "method borrowing" is in JavaScript and how `call()` and `apply()` enable it. Provide examples of when method borrowing is useful.

**Answer:**

**Method Borrowing Definition:**

Method borrowing is a technique where you use a method from one object on another object, even though the method doesn't belong to that object. This is possible because methods in JavaScript are just functions, and you can call them with any `this` value using `call()` or `apply()`. Method borrowing allows you to reuse functionality without inheritance or copying code.

**How It Works:**

When you borrow a method, you're essentially calling a method that belongs to one object, but setting `this` to point to a different object. The method executes with the borrowed object as its context, allowing it to operate on that object's data.

**Examples of Method Borrowing:**

**1. Array Methods on Array-Like Objects:**

Array-like objects (like `arguments` or DOM NodeLists) have numeric indices and a `length` property but aren't true arrays. You can borrow array methods like `slice()` or `forEach()` to work with them:

```javascript
// arguments is array-like, not a real array
function func() {
    // Borrow Array.prototype.slice to convert arguments to array
    const args = Array.prototype.slice.call(arguments);
    // Now you can use array methods
}
```

**2. Using Array Methods on Objects:**

You can use array methods on any object that has numeric properties and a `length` property, even if it's not an array:

```javascript
const obj = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
Array.prototype.forEach.call(obj, (item) => {
    console.log(item);  // Works on the object
});
```

**3. Borrowing Utility Methods:**

You can borrow useful methods from built-in objects. For example, borrowing `Object.prototype.toString` to check types, or borrowing `Array.prototype` methods for custom data structures.

**When Method Borrowing is Useful:**

**1. Working with Array-Like Objects:**

When you need to use array methods on objects that aren't arrays but have array-like structure (like `arguments`, NodeLists, or custom objects).

**2. Code Reuse:**

When you want to reuse functionality from one object on another without creating inheritance relationships or duplicating code.

**3. Polyfills:**

When implementing polyfills or shims for methods that might not exist, you can borrow similar functionality from related objects.

**4. Functional Programming:**

In functional programming patterns, method borrowing allows you to use methods as standalone functions, applying them to different objects as needed.

**Limitations:**

**1. Method Dependencies:**

The borrowed method must work with the borrowed object's structure. If the method relies on specific properties or methods that don't exist on the target object, it won't work correctly.

**2. Not True Inheritance:**

Method borrowing is a one-time operation—it doesn't establish a permanent relationship. You must explicitly borrow the method each time you want to use it.

**3. Performance:**

Method borrowing involves function calls and context switching, which can have slight performance overhead compared to direct method calls.

**System Design Consideration**: Method borrowing is a powerful technique that demonstrates JavaScript's flexibility:
1. **Code Reuse**: Enables reusing functionality without inheritance
2. **Flexibility**: Works with any object that has compatible structure
3. **Functional Patterns**: Supports functional programming approaches
4. **Practical Solutions**: Solves real-world problems like working with array-like objects

Method borrowing showcases JavaScript's dynamic nature and the power of `call()` and `apply()`. It's a practical technique that's commonly used in JavaScript development, especially when working with array-like objects or when you need to reuse methods across different object types.

---

### Q4: Explain how `bind()` enables "currying" and "partial application" in JavaScript. What are these concepts, and how do they differ from each other?

**Answer:**

**Currying Definition:**

Currying is a technique where a function that takes multiple arguments is transformed into a sequence of functions, each taking a single argument. A curried function returns a new function for each argument until all arguments are provided, at which point it returns the result.

**Partial Application Definition:**

Partial application is a technique where you create a new function by pre-filling some arguments of an existing function. The new function takes the remaining arguments and executes the original function with all arguments (both pre-filled and new).

**How `bind()` Enables These:**

`bind()` can be used for both currying and partial application by pre-filling arguments. When you call `bind()` with arguments beyond the `this` value, those arguments are "bound" to the function and will be used when the bound function is called.

**Currying with `bind()`:**

While `bind()` is more suited for partial application, it can be used to create curried functions by binding arguments one at a time:

```javascript
function add(a, b, c) {
    return a + b + c;
}

// Currying with bind (not ideal, but possible)
const add10 = add.bind(null, 10);
const add10And20 = add10.bind(null, 20);
const result = add10And20(30);  // 60
```

**Partial Application with `bind()`:**

`bind()` is well-suited for partial application, where you pre-fill some arguments:

```javascript
function multiply(a, b, c) {
    return a * b * c;
}

// Partial application: pre-fill first two arguments
const multiplyBy2And3 = multiply.bind(null, 2, 3);
const result = multiplyBy2And3(4);  // 24 (2 * 3 * 4)
```

**Differences:**

**1. Argument Handling:**

- **Currying**: Each function takes one argument, creating a chain
- **Partial Application**: You can pre-fill any number of arguments at once

**2. Function Signature:**

- **Currying**: `f(a)(b)(c)` - each call returns a function
- **Partial Application**: `f(a, b)` returns a function that takes remaining arguments

**3. Flexibility:**

- **Currying**: More rigid structure, must provide arguments in order
- **Partial Application**: More flexible, can pre-fill any arguments in any position

**4. Use Cases:**

- **Currying**: Useful for creating specialized functions and functional composition
- **Partial Application**: Useful for creating functions with default or fixed arguments

**Modern Alternatives:**

**Arrow Functions:**

Arrow functions provide a cleaner syntax for currying and partial application:

```javascript
// Currying with arrow functions
const add = a => b => c => a + b + c;
const add10 = add(10);
const add10And20 = add10(20);

// Partial application
const multiply = (a, b) => c => a * b * c;
const multiplyBy2And3 = multiply(2, 3);
```

**System Design Consideration**: Understanding currying and partial application is important for:
1. **Function Composition**: Creating reusable, composable functions
2. **Specialization**: Creating specialized functions from generic ones
3. **Functional Programming**: These are key patterns in functional programming
4. **Code Reuse**: Creating functions with pre-configured behavior

While `bind()` can be used for these patterns, modern JavaScript (especially with arrow functions) provides cleaner alternatives. However, understanding how `bind()` enables these patterns helps you understand the concepts and provides a fallback for environments without modern JavaScript features.

---

### Q5: Explain how arrow functions differ from regular functions in terms of `this` binding. When should you use arrow functions, and when should you use regular functions?

**Answer:**

**Arrow Functions and `this`:**

Arrow functions don't have their own `this` binding. Instead, they inherit `this` from the enclosing lexical scope (where they're defined). This is called "lexical `this`" because `this` is determined by where the arrow function is written, not how it's called. Once an arrow function is defined, its `this` value is fixed and cannot be changed, even with `call()`, `apply()`, or `bind()`.

**Regular Functions and `this`:**

Regular functions have dynamic `this` binding—the value of `this` is determined at call time based on how the function is invoked. `this` can be different each time the function is called, and it can be explicitly set using `call()`, `apply()`, or `bind()`.

**Key Differences:**

**1. `this` Binding:**

- **Arrow Functions**: Lexical `this` (inherited from outer scope, fixed at definition)
- **Regular Functions**: Dynamic `this` (determined at call time)

**2. Cannot Change `this`:**

- **Arrow Functions**: `call()`, `apply()`, and `bind()` cannot change `this` (they're ignored)
- **Regular Functions**: `call()`, `apply()`, and `bind()` can change `this`

**3. Use as Methods:**

- **Arrow Functions**: Not ideal as object methods if you need `this` to refer to the object
- **Regular Functions**: Work well as methods, `this` refers to the object

**4. Use as Constructors:**

- **Arrow Functions**: Cannot be used as constructors (no `prototype`, cannot use `new`)
- **Regular Functions**: Can be used as constructors

**When to Use Arrow Functions:**

**1. Callbacks:**

Arrow functions are ideal for callbacks where you want to preserve `this` from the outer scope, especially in event handlers, array methods, or promise chains.

**2. Lexical `this` Needed:**

When you need `this` to refer to the outer scope (like in nested functions, class methods that need to preserve `this`, or closures).

**3. Concise Syntax:**

When you want shorter, more readable function syntax for simple operations.

**4. Functional Programming:**

In functional programming patterns where you don't need `this` or want to avoid `this` binding issues.

**When to Use Regular Functions:**

**1. Object Methods:**

When defining methods on objects where `this` should refer to the object itself. Regular functions work better for this because they have dynamic `this` binding.

**2. Constructors:**

When creating constructor functions (though classes are preferred in modern JavaScript).

**3. Dynamic `this` Needed:**

When you need `this` to be determined dynamically based on how the function is called, or when you need to use `call()`, `apply()`, or `bind()` to set `this`.

**4. Method Borrowing:**

When you want to borrow methods and need `this` to be set explicitly using `call()` or `apply()`.

**System Design Consideration**: Understanding when to use arrow functions vs. regular functions is crucial for:
1. **Correct Behavior**: Ensuring `this` works as expected
2. **Code Clarity**: Using the right function type for readability
3. **Performance**: Understanding that arrow functions can't be optimized the same way as regular functions in some cases
4. **Best Practices**: Following modern JavaScript patterns

Arrow functions solve many `this` binding problems, especially in callbacks and nested functions. However, they're not always the right choice—regular functions are still needed for methods, constructors, and cases where dynamic `this` binding is required. The choice depends on your specific use case and whether you need lexical or dynamic `this` binding.

