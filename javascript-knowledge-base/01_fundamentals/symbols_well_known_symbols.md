# Symbols & Well-known Symbols: Symbol.iterator, toStringTag

Symbols are unique, immutable primitive values used as object property keys. Understanding symbols is essential for advanced JavaScript.

## What are Symbols?

**Symbol** is a unique, immutable primitive type.

### Creating Symbols

```javascript
// Create symbol
const sym1 = Symbol();
const sym2 = Symbol('description');

// Symbols are unique
const sym3 = Symbol('description');
console.log(sym2 === sym3);  // false (different symbols)

// Symbol.for: Global symbol registry
const globalSym1 = Symbol.for('key');
const globalSym2 = Symbol.for('key');
console.log(globalSym1 === globalSym2);  // true (same symbol)
```

### Using Symbols as Keys

```javascript
// Symbols as object keys
const sym = Symbol('id');
const obj = {
    name: 'John',
    [sym]: '12345'  // Symbol key
};

console.log(obj[sym]);  // '12345'
console.log(obj.sym);   // undefined (not accessible with dot notation)

// Symbols are not enumerable by default
Object.keys(obj);       // ['name'] (no symbol)
Object.getOwnPropertySymbols(obj);  // [Symbol(id)]
```

## Well-known Symbols

**Well-known Symbols** are built-in symbols used for internal operations.

### Symbol.iterator

```javascript
// Symbol.iterator: Makes object iterable
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

### Symbol.toStringTag

```javascript
// Symbol.toStringTag: Customize Object.prototype.toString()
class MyClass {
    get [Symbol.toStringTag]() {
        return 'MyClass';
    }
}

const obj = new MyClass();
console.log(Object.prototype.toString.call(obj));  // "[object MyClass]"
```

### Symbol.toPrimitive

```javascript
// Symbol.toPrimitive: Control type conversion
const obj = {
    value: 10,
    [Symbol.toPrimitive](hint) {
        if (hint === 'number') {
            return this.value;
        }
        if (hint === 'string') {
            return String(this.value);
        }
        return this.value;
    }
};

console.log(+obj);      // 10 (number hint)
console.log(String(obj));  // "10" (string hint)
console.log(obj + 5);   // 15 (default hint)
```

### Symbol.hasInstance

```javascript
// Symbol.hasInstance: Customize instanceof
class MyArray {
    static [Symbol.hasInstance](instance) {
        return Array.isArray(instance);
    }
}

console.log([] instanceof MyArray);  // true
```

### Symbol.species

```javascript
// Symbol.species: Control constructor for derived objects
class MyArray extends Array {
    static get [Symbol.species]() {
        return Array;  // Return Array instead of MyArray
    }
}

const myArray = new MyArray(1, 2, 3);
const mapped = myArray.map(x => x * 2);
console.log(mapped instanceof MyArray);  // false
console.log(mapped instanceof Array);    // true
```

## Real-World Examples

### Example 1: Private Properties

```javascript
// Use symbols for "private" properties
const _name = Symbol('name');
const _age = Symbol('age');

class Person {
    constructor(name, age) {
        this[_name] = name;
        this[_age] = age;
    }
    
    getName() {
        return this[_name];
    }
    
    getAge() {
        return this[_age];
    }
}

const person = new Person('John', 30);
console.log(person.getName());  // 'John'
console.log(person[_name]);     // 'John' (but symbol is needed)
```

### Example 2: Metadata

```javascript
// Store metadata with symbols
const METADATA = Symbol('metadata');

function addMetadata(obj, data) {
    obj[METADATA] = data;
}

function getMetadata(obj) {
    return obj[METADATA];
}

const obj = { name: 'John' };
addMetadata(obj, { created: Date.now() });
console.log(getMetadata(obj));  // { created: ... }
```

### Example 3: Custom Iteration

```javascript
// Custom iterator with Symbol.iterator
class Range {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    
    [Symbol.iterator]() {
        let current = this.start;
        return {
            next: () => {
                if (current <= this.end) {
                    return {
                        value: current++,
                        done: false
                    };
                }
                return { done: true };
            }
        };
    }
}

const range = new Range(1, 5);
for (const num of range) {
    console.log(num);  // 1, 2, 3, 4, 5
}
```

## Symbol Methods

```javascript
// Symbol.keyFor: Get key from global symbol
const globalSym = Symbol.for('key');
Symbol.keyFor(globalSym);  // 'key'

// Symbol.description: Get description
const sym = Symbol('description');
sym.description;  // 'description'
```

## Best Practices

1. **Use for Unique Keys**: Symbols provide unique property keys
2. **Well-known Symbols**: Understand built-in symbols
3. **Private Properties**: Use symbols for "private" properties
4. **Metadata**: Store metadata with symbols
5. **Iteration**: Implement Symbol.iterator for custom iteration

## Summary

**Symbols & Well-known Symbols:**

1. **Symbols**: Unique, immutable primitive values
2. **Property Keys**: Use as object property keys
3. **Well-known Symbols**: Built-in symbols for internal operations
4. **Symbol.iterator**: Makes objects iterable
5. **Best Practice**: Use for unique keys, private properties, metadata

**Key Takeaway:**
Symbols are unique primitive values used as property keys. Well-known symbols control internal behavior (iterator, toStringTag, toPrimitive). Use symbols for unique keys and "private" properties. Implement Symbol.iterator for custom iteration. Symbols are not enumerable by default.

**Symbol Strategy:**
- Use for unique keys
- Understand well-known symbols
- Private properties
- Metadata storage
- Custom iteration

**Next Steps:**
- Learn [Reflect & Proxy](reflect_proxy.md) for meta-programming
- Study [Iterators](generators_iterators.md) for iteration
- Master [Objects](objects_property_descriptors.md) for object behavior

