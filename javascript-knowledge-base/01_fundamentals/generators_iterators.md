# Generators & Iterators: function*, next(), yield, Iterator Protocol

Generators and iterators provide powerful ways to create custom iteration logic and control flow in JavaScript.

## Iterators

**Iterator** is an object that provides a sequence of values.

### Iterator Protocol

```javascript
// Iterator must have next() method
const iterator = {
    data: [1, 2, 3],
    index: 0,
    next() {
        if (this.index < this.data.length) {
            return {
                value: this.data[this.index++],
                done: false
            };
        }
        return { done: true };
    }
};

console.log(iterator.next());  // { value: 1, done: false }
console.log(iterator.next());  // { value: 2, done: false }
console.log(iterator.next());  // { value: 3, done: false }
console.log(iterator.next());  // { done: true }
```

### Iterable Protocol

```javascript
// Iterable must have Symbol.iterator method
const iterable = {
    data: [1, 2, 3],
    [Symbol.iterator]() {
        let index = 0;
        return {
            next: () => {
                if (index < this.data.length) {
                    return {
                        value: this.data[index++],
                        done: false
                    };
                }
                return { done: true };
            }
        };
    }
};

// Can use with for...of
for (const value of iterable) {
    console.log(value);  // 1, 2, 3
}
```

## Generators

**Generators** are functions that can be paused and resumed, using `function*` and `yield`.

### Basic Generator

```javascript
// Generator function
function* numberGenerator() {
    yield 1;
    yield 2;
    yield 3;
}

const gen = numberGenerator();
console.log(gen.next());  // { value: 1, done: false }
console.log(gen.next());  // { value: 2, done: false }
console.log(gen.next());  // { value: 3, done: false }
console.log(gen.next());  // { value: undefined, done: true }
```

### Generator with for...of

```javascript
function* numberGenerator() {
    yield 1;
    yield 2;
    yield 3;
}

// Iterate with for...of
for (const value of numberGenerator()) {
    console.log(value);  // 1, 2, 3
}

// Spread operator
const numbers = [...numberGenerator()];  // [1, 2, 3]
```

## yield Keyword

**yield** pauses generator execution and returns a value.

```javascript
function* generator() {
    console.log('Start');
    yield 1;
    console.log('Middle');
    yield 2;
    console.log('End');
    yield 3;
}

const gen = generator();
gen.next();  // "Start", { value: 1, done: false }
gen.next();  // "Middle", { value: 2, done: false }
gen.next();  // "End", { value: 3, done: false }
gen.next();  // { done: true }
```

## Real-World Examples

### Example 1: Infinite Generator

```javascript
// Infinite sequence
function* fibonacci() {
    let a = 0, b = 1;
    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}

const fib = fibonacci();
console.log(fib.next().value);  // 0
console.log(fib.next().value);  // 1
console.log(fib.next().value);  // 1
console.log(fib.next().value);  // 2
console.log(fib.next().value);  // 3
```

### Example 2: Generator with Parameters

```javascript
// Pass values into generator
function* generator() {
    const x = yield 'First';
    const y = yield x + ' Second';
    return y + ' Third';
}

const gen = generator();
console.log(gen.next());      // { value: 'First', done: false }
console.log(gen.next('Hello'));  // { value: 'Hello Second', done: false }
console.log(gen.next('World'));   // { value: 'World Third', done: true }
```

### Example 3: Generator Delegation

```javascript
// yield* delegates to another generator
function* generator1() {
    yield 1;
    yield 2;
}

function* generator2() {
    yield* generator1();
    yield 3;
    yield 4;
}

for (const value of generator2()) {
    console.log(value);  // 1, 2, 3, 4
}
```

### Example 4: Async Control Flow

```javascript
// Generator for async control flow
function* asyncFlow() {
    const user = yield fetch('/api/user');
    const posts = yield fetch('/api/posts');
    return { user, posts };
}

// Runner function
function run(generator) {
    const gen = generator();
    
    function handle(result) {
        if (result.done) return Promise.resolve(result.value);
        return Promise.resolve(result.value)
            .then(res => res.json())
            .then(data => handle(gen.next(data)));
    }
    
    return handle(gen.next());
}

run(asyncFlow).then(result => {
    console.log(result);
});
```

## Built-in Iterables

```javascript
// Arrays are iterable
const arr = [1, 2, 3];
for (const value of arr) {
    console.log(value);
}

// Strings are iterable
const str = 'hello';
for (const char of str) {
    console.log(char);
}

// Maps and Sets are iterable
const map = new Map([['a', 1], ['b', 2]]);
for (const [key, value] of map) {
    console.log(key, value);
}
```

## Best Practices

1. **Use Generators**: For lazy evaluation and custom iteration
2. **Infinite Sequences**: Generators handle infinite sequences well
3. **Memory Efficient**: Only compute values when needed
4. **Async Patterns**: Use for async control flow
5. **Iterator Protocol**: Implement for custom data structures

## Summary

**Generators & Iterators:**

1. **Iterators**: Objects with next() method
2. **Iterables**: Objects with Symbol.iterator
3. **Generators**: Functions that yield values
4. **yield**: Pauses execution and returns value
5. **Best Practice**: Use for lazy evaluation, async patterns

**Key Takeaway:**
Iterators provide sequence of values via next(). Iterables implement Symbol.iterator. Generators use function* and yield to create iterators. yield pauses execution. Generators enable lazy evaluation and async control flow. Use for...of to iterate.

**Generator Strategy:**
- Use for lazy evaluation
- Handle infinite sequences
- Async control flow
- Custom iteration
- Memory efficiency

**Next Steps:**
- Learn [Async Generators](async_generators_for_await_of.md) for async iteration
- Study [Async/Await](async_await_promises.md) for promises
- Master [Iterables](iterables_iteration_protocols.md) for custom iterators

