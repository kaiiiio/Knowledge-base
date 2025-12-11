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

---

## 🎯 Interview Questions: JavaScript

### Q1: Explain what Symbols are in JavaScript and why they were introduced. How do Symbols differ from strings as property keys, and what makes them unique?

**Answer:**

**Symbols Definition:**

Symbols are a primitive data type in JavaScript that represent unique, immutable values. They were introduced in ES2015 to provide a way to create property keys that are guaranteed to be unique, even if they have the same description. Symbols solve the problem of property name collisions and enable new patterns for object property management.

**Why Symbols Were Introduced:**

**1. Property Name Collisions:**

Before Symbols, all property keys were strings (or numbers, which are coerced to strings). This meant that if you added a property to an object, you risked overwriting existing properties or having your properties overwritten by other code. Symbols provide a way to create property keys that cannot conflict with string keys or other symbols.

**2. Private Properties:**

Symbols provide a mechanism for creating "private" properties. While not truly private (they can be accessed if you have the symbol), they're hidden from normal property access patterns like `Object.keys()`, `for...in` loops, and `JSON.stringify()`, making them effectively private for most use cases.

**3. Well-Known Symbols:**

Symbols enable the well-known symbols pattern, where JavaScript uses special symbols to control internal behavior (like `Symbol.iterator` for iteration). This allows the language to add new capabilities without breaking existing code.

**How Symbols Differ from Strings:**

**1. Uniqueness:**

Every symbol is unique, even if created with the same description. Two symbols with the same description are not equal. This is different from strings, where two strings with the same content are equal.

**2. Immutability:**

Symbols are immutable—once created, they cannot be changed. This makes them safe to use as property keys without worrying about accidental modification.

**3. Non-Enumerable by Default:**

Properties keyed by symbols are not enumerable by default. They don't appear in `Object.keys()`, `for...in` loops, or `Object.getOwnPropertyNames()`. They're hidden from normal property enumeration.

**4. Not Coerced:**

Symbols cannot be coerced to strings or numbers. If you try to use a symbol where a string is expected, it throws a `TypeError`. This prevents accidental string coercion.

**What Makes Symbols Unique:**

**1. Guaranteed Uniqueness:**

Each symbol is guaranteed to be unique. Even `Symbol('same')` creates a different symbol each time. This uniqueness is what makes them safe for property keys.

**2. Global Symbol Registry:**

`Symbol.for()` allows you to create or retrieve symbols from a global registry, enabling symbol sharing across different parts of your code or even different modules.

**3. Well-Known Symbols:**

JavaScript defines well-known symbols (like `Symbol.iterator`, `Symbol.toStringTag`, etc.) that control internal language behavior. These are shared across all JavaScript environments.

**System Design Consideration**: Symbols are a powerful feature for:
1. **Property Safety**: Creating property keys that won't conflict
2. **API Design**: Adding properties to objects without risking collisions
3. **Metadata**: Storing metadata on objects without affecting normal property access
4. **Language Extensibility**: Enabling new language features through well-known symbols

Symbols provide a unique, safe way to create property keys that don't interfere with normal object properties. They're particularly useful for library authors who need to add properties to user objects without risking name collisions.

---

### Q2: Explain what "well-known symbols" are in JavaScript. What are some examples, and how do they enable JavaScript to control internal object behavior?

**Answer:**

**Well-Known Symbols Definition:**

Well-known symbols are predefined symbols in JavaScript that are used to control internal language behavior. They're properties of the `Symbol` object (like `Symbol.iterator`, `Symbol.toStringTag`, etc.) and are used by JavaScript engines to implement special behaviors for objects. When you implement these symbols on your objects, you're customizing how JavaScript treats those objects internally.

**Examples of Well-Known Symbols:**

**1. `Symbol.iterator`:**

Makes an object iterable. When you implement `Symbol.iterator`, you're telling JavaScript how to iterate over your object. This is what enables `for...of` loops, the spread operator, and destructuring to work with your objects.

**2. `Symbol.toStringTag`:**

Controls what `Object.prototype.toString()` returns for your object. When you set `Symbol.toStringTag`, you're customizing the string representation of your object's type.

**3. `Symbol.toPrimitive`:**

Controls how an object is converted to a primitive value. When you implement `Symbol.toPrimitive`, you're telling JavaScript how to convert your object to a number, string, or default primitive.

**4. `Symbol.hasInstance`:**

Controls the behavior of the `instanceof` operator. When you implement `Symbol.hasInstance` on a constructor function, you're customizing how `instanceof` determines if an object is an instance of that constructor.

**5. `Symbol.species`:**

Controls what constructor is used when creating derived objects (like when methods like `map()` or `filter()` create new arrays). This allows you to control what type of object is returned.

**How They Enable Internal Behavior Control:**

**1. Protocol-Based Design:**

Well-known symbols enable a protocol-based design where objects can opt into special behaviors by implementing specific symbols. This is more flexible than requiring objects to inherit from specific classes.

**2. Extensibility:**

Well-known symbols allow JavaScript to add new capabilities without breaking existing code. New symbols can be added to control new behaviors, and objects can opt in by implementing them.

**3. Customization:**

They allow you to customize how JavaScript's built-in operations work with your objects. You're not limited to the default behavior—you can define custom behavior for iteration, type conversion, etc.

**4. Polyfills and Shims:**

Well-known symbols enable polyfills and shims. You can implement these symbols on objects to make them work with new JavaScript features, even in older environments.

**System Design Consideration**: Well-known symbols are fundamental to JavaScript's extensibility:
1. **Custom Types**: Enable creating custom types that work with JavaScript's built-in operations
2. **Protocols**: Enable protocol-based programming where objects opt into behaviors
3. **Interoperability**: Enable objects to work seamlessly with JavaScript's built-in features
4. **Future-Proofing**: Enable adding new capabilities without breaking existing code

Well-known symbols are a powerful mechanism that allows JavaScript to be extensible while maintaining backward compatibility. They enable you to create objects that work naturally with JavaScript's built-in operations, making your code more idiomatic and interoperable.

---

### Q3: Explain how Symbols can be used to create "private" properties in JavaScript. How does this differ from true privacy (like private fields with `#`), and what are the trade-offs?

**Answer:**

**Symbols for Private Properties:**

Symbols can be used to create properties that are effectively private because they're hidden from normal property access patterns. Properties keyed by symbols don't appear in `Object.keys()`, `for...in` loops, `Object.getOwnPropertyNames()`, or `JSON.stringify()`. This makes them effectively private for most practical purposes.

**How It Works:**

**1. Hidden from Enumeration:**

Symbol properties are not enumerable by default, so they don't appear in normal property enumeration. This hides them from code that iterates over object properties.

**2. Access Requires Symbol:**

To access a symbol property, you need the symbol reference. If the symbol is not exported or is kept in a closure, external code cannot access the property, making it effectively private.

**3. Not Truly Private:**

Symbol properties are not truly private—if you have the symbol reference, you can access the property. They're more like "hidden" properties that require knowledge of the symbol to access.

**Difference from True Privacy (`#` Private Fields):**

**1. Access Control:**

- **Symbols**: Accessible if you have the symbol reference
- **Private Fields (`#`)**: Truly inaccessible from outside the class, even with the reference

**2. Scope:**

- **Symbols**: Can be accessed from anywhere if the symbol is available
- **Private Fields**: Only accessible within the class definition

**3. Syntax:**

- **Symbols**: Use bracket notation: `obj[symbol]`
- **Private Fields**: Use `#` prefix: `this.#privateField`

**4. Inheritance:**

- **Symbols**: Inherited like normal properties
- **Private Fields**: Each class has its own private fields, not inherited

**Trade-offs:**

**Symbols:**

**Pros:**
- Work with any object (not just classes)
- Can be shared across instances if needed
- More flexible (can be made accessible when needed)

**Cons:**
- Not truly private (accessible with symbol reference)
- More verbose syntax
- Can be discovered through `Object.getOwnPropertySymbols()`

**Private Fields (`#`):**

**Pros:**
- Truly private (inaccessible from outside)
- Cleaner syntax
- Better encapsulation
- Language-level support

**Cons:**
- Only work in classes
- Not available in older JavaScript versions
- Less flexible (cannot be made accessible)

**System Design Consideration**: Choosing between symbols and private fields depends on:
1. **Privacy Needs**: Do you need true privacy or just hidden properties?
2. **Object Type**: Are you using classes or plain objects?
3. **Flexibility**: Do you need to share properties across instances?
4. **JavaScript Version**: Do you need to support older environments?

Symbols provide a way to create effectively private properties that work with any object and in any JavaScript version. Private fields provide true privacy but only work in classes and require modern JavaScript. The choice depends on your specific needs and constraints.

---

### Q4: Explain the difference between `Symbol()` and `Symbol.for()`. When would you use each, and what is the global symbol registry?

**Answer:**

**`Symbol()` - Unique Symbols:**

`Symbol()` creates a new, unique symbol every time it's called, even if you pass the same description. Each call to `Symbol('description')` creates a completely new symbol that is not equal to any other symbol, including symbols created with the same description.

**`Symbol.for()` - Global Symbols:**

`Symbol.for()` creates or retrieves a symbol from the global symbol registry. If a symbol with the given key already exists in the registry, it returns that symbol. If not, it creates a new symbol, adds it to the registry, and returns it. This means `Symbol.for('key')` will always return the same symbol for the same key.

**Global Symbol Registry:**

The global symbol registry is a global, cross-realm symbol storage. Symbols stored in the registry are shared across:
- Different parts of your code
- Different modules
- Different iframes/windows (in browsers)
- Different realms (in some cases)

This enables symbol sharing across different contexts where you might not have direct access to the symbol reference.

**When to Use `Symbol()`:**

**1. Unique Property Keys:**

When you need a guaranteed unique property key that will never conflict, even if created multiple times. This is the most common use case.

**2. Private Properties:**

When creating private properties where you want each instance or each creation to have its own unique symbol. This ensures true uniqueness.

**3. Internal Implementation:**

When the symbol is only used within a specific scope and doesn't need to be shared. Keeping symbols local provides better encapsulation.

**When to Use `Symbol.for()`:**

**1. Shared Symbols:**

When you need the same symbol across different parts of your code, modules, or contexts. This is useful for well-known symbols or shared metadata keys.

**2. Cross-Module Communication:**

When different modules need to reference the same symbol without importing it. The global registry enables this.

**3. Polyfills and Libraries:**

When creating polyfills or libraries that need to use the same symbol across different parts of the codebase or even across different libraries.

**4. Well-Known Patterns:**

When implementing patterns similar to well-known symbols, where you want a symbol that's consistent across your application.

**Key Differences:**

**1. Uniqueness:**

- **`Symbol()`**: Always unique, even with same description
- **`Symbol.for()`**: Same symbol for same key

**2. Registry:**

- **`Symbol()`**: Not stored in registry
- **`Symbol.for()`**: Stored in and retrieved from global registry

**3. Sharing:**

- **`Symbol()`**: Cannot be shared (each is unique)
- **`Symbol.for()`**: Can be shared (same key = same symbol)

**4. Use Case:**

- **`Symbol()`**: When you need uniqueness
- **`Symbol.for()`**: When you need sharing

**System Design Consideration**: Understanding the difference is important for:
1. **Property Safety**: Using `Symbol()` when you need guaranteed uniqueness
2. **Code Organization**: Using `Symbol.for()` when you need symbol sharing
3. **Library Design**: Choosing the right approach for library internals
4. **Performance**: `Symbol.for()` has a lookup cost, but enables sharing

`Symbol()` is the default choice for most use cases where you need unique property keys. `Symbol.for()` is useful when you need to share symbols across different contexts, but it should be used judiciously to avoid polluting the global registry.

---

### Q5: Explain how `Symbol.iterator` works and how it enables custom iteration. How does implementing `Symbol.iterator` make an object work with `for...of` loops and the spread operator?

**Answer:**

**`Symbol.iterator` Definition:**

`Symbol.iterator` is a well-known symbol that makes an object iterable. When you implement `Symbol.iterator` on an object, you're defining how JavaScript should iterate over that object. The `Symbol.iterator` method should return an iterator object (an object with a `next()` method).

**How It Works:**

**1. Iterator Method:**

When you implement `Symbol.iterator`, you create a method that returns an iterator. The iterator is an object with a `next()` method that returns `{ value, done }` objects.

**2. Iteration Protocol:**

The iterator follows the iterator protocol: it has a `next()` method that returns objects with `value` (the current value) and `done` (whether iteration is complete) properties.

**3. Automatic Invocation:**

When JavaScript encounters an iterable in contexts like `for...of` or the spread operator, it automatically calls the `Symbol.iterator` method to get an iterator, then repeatedly calls `next()` until `done` is `true`.

**How It Enables `for...of`:**

**1. Getting Iterator:**

When `for...of` encounters an iterable, it calls the `Symbol.iterator` method to get an iterator.

**2. Iteration Loop:**

`for...of` then repeatedly calls the iterator's `next()` method in a loop.

**3. Value Extraction:**

Each time `next()` is called, `for...of` extracts the `value` property and assigns it to the loop variable.

**4. Termination:**

The loop continues until `next()` returns `{ done: true }`, at which point the loop terminates.

**How It Enables Spread Operator:**

**1. Getting Iterator:**

The spread operator (`...`) also calls `Symbol.iterator` to get an iterator.

**2. Collecting Values:**

The spread operator calls `next()` repeatedly, collecting all `value` properties into an array (or other collection, depending on context).

**3. Spreading:**

The collected values are then "spread" into the target location (array, function arguments, etc.).

**Implementing `Symbol.iterator`:**

**1. Generator Function:**

The easiest way to implement `Symbol.iterator` is as a generator function, which automatically returns an iterator:

```javascript
*[Symbol.iterator]() {
    yield value1;
    yield value2;
}
```

**2. Manual Iterator:**

You can also manually return an iterator object:

```javascript
[Symbol.iterator]() {
    let index = 0;
    return {
        next: () => {
            if (index < this.items.length) {
                return { value: this.items[index++], done: false };
            }
            return { done: true };
        }
    };
}
```

**System Design Consideration**: `Symbol.iterator` is fundamental to JavaScript's iteration:
1. **Custom Types**: Enables custom data structures to work with JavaScript's iteration mechanisms
2. **Code Consistency**: Makes your objects work consistently with built-in iterables
3. **API Design**: Enables creating APIs that work with standard JavaScript patterns
4. **Functional Programming**: Enables functional programming patterns with iteration

Implementing `Symbol.iterator` makes your objects work seamlessly with JavaScript's built-in iteration features. It's a powerful way to create custom data structures that feel natural and work with standard JavaScript patterns like `for...of`, spread, and destructuring.

