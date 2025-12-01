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

