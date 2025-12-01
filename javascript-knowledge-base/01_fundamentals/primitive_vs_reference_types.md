# Primitive Types vs Reference Types: Memory and Behavior

Understanding the difference between primitive and reference types is crucial for avoiding bugs and understanding JavaScript's memory model.

## Primitive Types

**Primitive types** are immutable values stored directly in memory.

### Primitive Types in JavaScript

```javascript
// Primitive types:
// - String
// - Number
// - Boolean
// - Undefined
// - Null
// - Symbol
// - BigInt

let str = 'Hello';
let num = 42;
let bool = true;
let undef = undefined;
let nul = null;
let sym = Symbol('id');
let big = 9007199254740991n;
```

### Primitive Behavior

```javascript
// Primitives are copied by value
let a = 10;
let b = a;  // b gets a copy of the value
b = 20;
console.log(a);  // 10 (unchanged)
console.log(b);  // 20

// Primitives are immutable
let str = 'Hello';
str[0] = 'h';  // Cannot change
console.log(str);  // 'Hello' (unchanged)
```

## Reference Types

**Reference types** are objects stored as references in memory.

### Reference Types

```javascript
// Reference types:
// - Object
// - Array
// - Function
// - Date
// - RegExp
// - Map, Set, etc.

let obj = { name: 'John' };
let arr = [1, 2, 3];
let func = function() {};
```

### Reference Behavior

```javascript
// References are copied by reference
let obj1 = { name: 'John' };
let obj2 = obj1;  // obj2 references same object
obj2.name = 'Jane';
console.log(obj1.name);  // 'Jane' (changed!)
console.log(obj2.name);  // 'Jane'

// Arrays behave the same
let arr1 = [1, 2, 3];
let arr2 = arr1;  // arr2 references same array
arr2.push(4);
console.log(arr1);  // [1, 2, 3, 4] (changed!)
```

## Comparison

### Primitive Comparison

```javascript
// Primitives compared by value
let a = 5;
let b = 5;
console.log(a === b);  // true (same value)

let str1 = 'Hello';
let str2 = 'Hello';
console.log(str1 === str2);  // true (same value)
```

### Reference Comparison

```javascript
// References compared by reference (memory address)
let obj1 = { name: 'John' };
let obj2 = { name: 'John' };
console.log(obj1 === obj2);  // false (different references)

let obj3 = obj1;
console.log(obj1 === obj3);  // true (same reference)

// Arrays
let arr1 = [1, 2, 3];
let arr2 = [1, 2, 3];
console.log(arr1 === arr2);  // false (different references)
```

## Real-World Examples

### Example 1: Function Parameters

```javascript
// Primitive: Passed by value
function changePrimitive(x) {
    x = 10;  // Changes local copy
}

let num = 5;
changePrimitive(num);
console.log(num);  // 5 (unchanged)

// Reference: Passed by reference
function changeReference(obj) {
    obj.value = 10;  // Changes original object
}

let myObj = { value: 5 };
changeReference(myObj);
console.log(myObj.value);  // 10 (changed!)
```

### Example 2: Array Methods

```javascript
// Array methods that modify original
let arr = [1, 2, 3];
arr.push(4);  // Modifies original
console.log(arr);  // [1, 2, 3, 4]

// Array methods that return new array
let arr2 = [1, 2, 3];
let newArr = arr2.map(x => x * 2);  // Returns new array
console.log(arr2);   // [1, 2, 3] (unchanged)
console.log(newArr); // [2, 4, 6] (new array)
```

### Example 3: Copying Objects

```javascript
// Shallow copy
let original = { a: 1, b: { c: 2 } };
let shallow = Object.assign({}, original);
// or
let shallow2 = { ...original };

shallow.b.c = 3;
console.log(original.b.c);  // 3 (changed! - nested object still referenced)

// Deep copy
let deep = JSON.parse(JSON.stringify(original));
deep.b.c = 4;
console.log(original.b.c);  // 3 (unchanged)
console.log(deep.b.c);      // 4

// Deep copy with structuredClone (modern)
let deep2 = structuredClone(original);
```

## Type Checking

### typeof Operator

```javascript
// typeof for primitives
typeof 'hello';      // 'string'
typeof 42;           // 'number'
typeof true;         // 'boolean'
typeof undefined;    // 'undefined'
typeof Symbol('id'); // 'symbol'
typeof 9007199254740991n; // 'bigint'

// typeof for null (quirk)
typeof null;         // 'object' (historical bug)

// typeof for references
typeof {};           // 'object'
typeof [];           // 'object'
typeof function(){}; // 'function'
```

### instanceof Operator

```javascript
// instanceof for reference types
[] instanceof Array;        // true
{} instanceof Object;       // true
new Date() instanceof Date; // true

// Primitives
'hello' instanceof String; // false (primitive, not object)
new String('hello') instanceof String; // true (object wrapper)
```

## Best Practices

1. **Understand Copying**: Know when values are copied vs referenced
2. **Immutable Updates**: Create new objects/arrays for immutability
3. **Deep Copy**: Use when needed (structuredClone, JSON.parse)
4. **Type Checking**: Use typeof and instanceof appropriately
5. **Avoid Mutations**: Prefer immutable patterns

## Summary

**Primitive vs Reference Types:**

1. **Primitives**: Immutable, copied by value, compared by value
2. **References**: Mutable, copied by reference, compared by reference
3. **Behavior**: Primitives don't change, references share memory
4. **Copying**: Shallow vs deep copy for objects
5. **Best Practice**: Understand memory model, prefer immutability

**Key Takeaway:**
Primitive types are immutable values copied by value. Reference types are objects copied by reference. Primitives compared by value, references by memory address. Understand when copying creates new values vs sharing references. Use deep copy when needed. Prefer immutable patterns.

**Type Strategy:**
- Understand primitive vs reference
- Know copying behavior
- Use deep copy when needed
- Prefer immutability
- Check types appropriately

**Next Steps:**
- Learn [Type Coercion](type_coercion_equality.md) for conversions
- Study [Objects](objects_property_descriptors.md) for object behavior
- Master [Memory Model](memory_model_garbage_collection.md) for memory

