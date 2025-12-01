# Type Coercion & Equality: == vs === and Truthy/Falsy

Understanding type coercion and equality operators is essential for writing correct JavaScript code and avoiding bugs.

## Type Coercion

**Type coercion** is the automatic conversion of values from one type to another.

### Implicit Coercion

```javascript
// String coercion
'5' + 3;        // '53' (number coerced to string)
'5' - 3;        // 2 (string coerced to number)
'5' * '2';      // 10 (both coerced to numbers)

// Boolean coercion
if ('hello') {  // 'hello' coerced to true
    console.log('Truthy');
}

// Number coercion
+'5';          // 5 (unary plus coerces to number)
-'5';          // -5 (unary minus coerces to number)
```

### Explicit Coercion

```javascript
// String()
String(123);        // '123'
String(true);       // 'true'
String(null);       // 'null'

// Number()
Number('123');      // 123
Number('abc');      // NaN
Number(true);       // 1
Number(false);      // 0

// Boolean()
Boolean(1);         // true
Boolean(0);         // false
Boolean('');        // false
Boolean('hello');   // true
```

## Equality Operators

### == (Loose Equality)

**==** performs type coercion before comparison.

```javascript
// == coerces types
5 == '5';          // true (string coerced to number)
0 == false;        // true (boolean coerced to number)
'' == false;       // true (both coerced to number)
null == undefined; // true (special case)
null == 0;         // false (null doesn't coerce to 0)
```

### === (Strict Equality)

**===** compares without type coercion.

```javascript
// === no coercion
5 === '5';         // false (different types)
0 === false;       // false (different types)
'' === false;      // false (different types)
null === undefined; // false (different types)
5 === 5;           // true (same type and value)
```

## Truthy and Falsy Values

### Falsy Values

```javascript
// Falsy values (coerce to false):
false
0
-0
0n          // BigInt zero
''          // Empty string
null
undefined
NaN

// All falsy values
if (!value) {
    // value is falsy
}
```

### Truthy Values

```javascript
// Everything else is truthy:
true
1
-1
'hello'
'0'         // String '0' is truthy
'false'     // String 'false' is truthy
[]
{}
function(){}
```

## Real-World Examples

### Example 1: Common Pitfalls

```javascript
// ❌ Problem: == with falsy values
if (value == false) {
    // This matches: false, 0, '', null, undefined
}

// ✅ Solution: === for exact comparison
if (value === false) {
    // Only matches false
}

// ❌ Problem: Checking array length
if (array.length) {  // Fails if length is 0
    // Only runs if length > 0
}

// ✅ Better: Explicit comparison
if (array.length > 0) {
    // Clear intent
}
```

### Example 2: Type Coercion in Operations

```javascript
// String concatenation
'Hello' + ' ' + 'World';  // 'Hello World'
'5' + 3;                   // '53' (number coerced to string)

// Arithmetic operations
'5' - 3;                   // 2 (string coerced to number)
'5' * '2';                 // 10 (both coerced to numbers)
'5' / '2';                 // 2.5

// Comparison
'10' > '2';                // false (string comparison: '1' < '2')
10 > '2';                  // true (number comparison)
```

### Example 3: Boolean Contexts

```javascript
// if statements
if (value) {
    // value is truthy
}

// Logical operators
const result = value || 'default';  // Returns first truthy value
const result2 = value && 'exists';  // Returns first falsy or last truthy

// Ternary
const output = value ? 'truthy' : 'falsy';
```

## Coercion Rules

### To String

```javascript
String(null);        // 'null'
String(undefined);   // 'undefined'
String(true);        // 'true'
String(false);       // 'false'
String(123);         // '123'
String({});          // '[object Object]'
String([]);          // ''
String([1, 2, 3]);   // '1,2,3'
```

### To Number

```javascript
Number('123');       // 123
Number('abc');       // NaN
Number('');          // 0
Number(true);        // 1
Number(false);       // 0
Number(null);        // 0
Number(undefined);   // NaN
Number([]);          // 0
Number([1, 2]);      // NaN (unless single number)
```

### To Boolean

```javascript
Boolean(0);          // false
Boolean(1);           // true
Boolean('');         // false
Boolean('hello');     // true
Boolean(null);        // false
Boolean(undefined);   // false
Boolean([]);          // true (empty array is truthy!)
Boolean({});          // true
Boolean(NaN);         // false
```

## Best Practices

1. **Use ===**: Always use strict equality (===)
2. **Explicit Coercion**: Use String(), Number(), Boolean()
3. **Truthy Checks**: Be aware of falsy values
4. **Type Checking**: Use typeof, instanceof, Array.isArray()
5. **Avoid ==**: Only use == when you need coercion

## Summary

**Type Coercion & Equality:**

1. **Coercion**: Automatic type conversion
2. **==**: Loose equality with coercion
3. **===**: Strict equality without coercion
4. **Truthy/Falsy**: Values that coerce to true/false
5. **Best Practice**: Use ===, explicit coercion, understand truthy/falsy

**Key Takeaway:**
Type coercion automatically converts values between types. == performs coercion, === doesn't. Understand truthy/falsy values. Use === for comparisons. Use explicit coercion (String(), Number(), Boolean()). Be aware of coercion in operations.

**Equality Strategy:**
- Always use ===
- Understand coercion rules
- Know truthy/falsy values
- Use explicit coercion
- Avoid == unless needed

**Next Steps:**
- Learn [Primitive vs Reference](primitive_vs_reference_types.md) for types
- Study [Objects](objects_property_descriptors.md) for object behavior
- Master [Functions](functions_bind_call_apply.md) for function methods

