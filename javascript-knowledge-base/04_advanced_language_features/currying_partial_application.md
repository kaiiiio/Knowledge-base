# Currying, Partial Application & Function Composition

Currying and partial application are powerful functional programming techniques for creating reusable functions.

## Currying

**Currying** transforms a function with multiple arguments into a sequence of functions with single arguments.

### Basic Currying

```javascript
// Regular function
function add(a, b, c) {
    return a + b + c;
}

// Curried function
function curriedAdd(a) {
    return function(b) {
        return function(c) {
            return a + b + c;
        };
    };
}

// Arrow function currying
const curriedAdd = a => b => c => a + b + c;

// Usage
const add5 = curriedAdd(5);
const add5And10 = add5(10);
const result = add5And10(15);  // 30

// Or all at once
curriedAdd(5)(10)(15);  // 30
```

### Generic Curry Function

```javascript
// Generic curry function
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        return function(...nextArgs) {
            return curried.apply(this, args.concat(nextArgs));
        };
    };
}

// Use
const curriedAdd = curry((a, b, c) => a + b + c);
curriedAdd(5)(10)(15);  // 30
curriedAdd(5, 10)(15);  // 30
curriedAdd(5)(10, 15);  // 30
```

## Partial Application

**Partial Application** fixes some arguments of a function, creating a new function.

### Basic Partial Application

```javascript
// Partial application
function multiply(a, b, c) {
    return a * b * c;
}

// Partially apply first argument
function multiplyBy2(b, c) {
    return multiply(2, b, c);
}

// Using bind
const multiplyBy2 = multiply.bind(null, 2);
multiplyBy2(3, 4);  // 24

// Generic partial function
function partial(fn, ...args) {
    return function(...remainingArgs) {
        return fn.apply(this, args.concat(remainingArgs));
    };
}

const multiplyBy2 = partial(multiply, 2);
multiplyBy2(3, 4);  // 24
```

## Function Composition

**Function Composition** combines multiple functions into a single function.

### Basic Composition

```javascript
// Compose functions
function compose(...fns) {
    return function(value) {
        return fns.reduceRight((acc, fn) => fn(acc), value);
    };
}

// Pipe (left to right)
function pipe(...fns) {
    return function(value) {
        return fns.reduce((acc, fn) => fn(acc), value);
    };
}

// Example
const add1 = x => x + 1;
const multiply2 = x => x * 2;
const square = x => x * x;

const composed = compose(square, multiply2, add1);
composed(5);  // ((5 + 1) * 2) ^ 2 = 144

const piped = pipe(add1, multiply2, square);
piped(5);  // ((5 + 1) * 2) ^ 2 = 144
```

## Real-World Examples

### Example 1: API Request Builder

```javascript
// Curried API builder
const apiRequest = method => url => data => {
    return fetch(url, {
        method,
        body: JSON.stringify(data)
    });
};

const post = apiRequest('POST');
const put = apiRequest('PUT');

const postToUsers = post('/api/users');
const putToUsers = put('/api/users');

postToUsers({ name: 'John' });
putToUsers({ id: 1, name: 'Jane' });
```

### Example 2: Data Transformation Pipeline

```javascript
// Compose data transformations
const users = [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 }
];

const filterAdults = users => users.filter(u => u.age >= 18);
const mapNames = users => users.map(u => u.name);
const sortNames = names => names.sort();

const getAdultNames = pipe(
    filterAdults,
    mapNames,
    sortNames
);

getAdultNames(users);  // ['Jane', 'John']
```

### Example 3: Event Handler with Partial Application

```javascript
// Partially applied event handler
function handleClick(id, event) {
    console.log(`Clicked ${id}`, event);
}

const handleButton1 = handleClick.bind(null, 'button1');
const handleButton2 = handleClick.bind(null, 'button2');

button1.addEventListener('click', handleButton1);
button2.addEventListener('click', handleButton2);
```

## Best Practices

1. **Use Currying**: For reusable, configurable functions
2. **Partial Application**: For fixing common arguments
3. **Composition**: For building complex transformations
4. **Readability**: Balance between functional and readable
5. **Performance**: Consider performance for hot paths

## Summary

**Currying, Partial Application & Composition:**

1. **Currying**: Transform multi-arg function to single-arg functions
2. **Partial Application**: Fix some arguments
3. **Composition**: Combine multiple functions
4. **Use Cases**: API builders, data pipelines, event handlers
5. **Best Practice**: Use for reusable, composable functions

**Key Takeaway:**
Currying transforms functions to accept one argument at a time. Partial application fixes some arguments. Function composition combines functions. Use for reusable, configurable functions. Build data transformation pipelines. Create API builders and event handlers.

**Functional Strategy:**
- Currying for configurability
- Partial application for common args
- Composition for pipelines
- Balance readability
- Consider performance

**Next Steps:**
- Learn [Memoization](memoization_lazy_evaluation.md) for optimization
- Study [Generators](../01_fundamentals/generators_iterators.md) for control flow
- Master [Functional Patterns](../24_patterns_architecture_design/) for patterns

