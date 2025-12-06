# Objects & Property Descriptors: Enumerability, Writable, Configurable

Understanding object property descriptors is essential for controlling object behavior and creating robust code.

## Property Descriptors

**Property descriptors** define how properties behave (writable, enumerable, configurable).

### Descriptor Properties

```javascript
// Property descriptor has:
// - value: Property value
// - writable: Can be changed
// - enumerable: Shows in for...in, Object.keys()
// - configurable: Can be deleted/reconfigured

const obj = {};
Object.defineProperty(obj, 'name', {
    value: 'John',
    writable: true,
    enumerable: true,
    configurable: true
});
```

## Descriptor Types

### Data Descriptors

```javascript
// Data descriptor: Has value
Object.defineProperty(obj, 'prop', {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true
});
```

### Accessor Descriptors

```javascript
// Accessor descriptor: Has getter/setter
Object.defineProperty(obj, 'prop', {
    get() {
        return this._prop;
    },
    set(value) {
        this._prop = value;
    },
    enumerable: true,
    configurable: true
});
```

## Property Attributes

### writable

```javascript
// writable: Controls if property can be changed
const obj = {};
Object.defineProperty(obj, 'readonly', {
    value: 'cannot change',
    writable: false
});

obj.readonly = 'new value';  // Silent failure in non-strict
console.log(obj.readonly);   // 'cannot change' (unchanged)

// In strict mode: TypeError
'use strict';
obj.readonly = 'new value';  // TypeError: Cannot assign to read only property
```

### enumerable

```javascript
// enumerable: Controls if property appears in iterations
const obj = {
    visible: 'I am visible',
    hidden: 'I am hidden'
};

Object.defineProperty(obj, 'hidden', {
    enumerable: false
});

// Enumerable properties
for (let key in obj) {
    console.log(key);  // 'visible' only
}

Object.keys(obj);      // ['visible']
Object.values(obj);    // ['I am visible']

// All properties (including non-enumerable)
Object.getOwnPropertyNames(obj);  // ['visible', 'hidden']
```

### configurable

```javascript
// configurable: Controls if property can be deleted/reconfigured
const obj = {};
Object.defineProperty(obj, 'locked', {
    value: 'cannot delete',
    configurable: false
});

delete obj.locked;  // false (cannot delete)
console.log(obj.locked);  // 'cannot delete'

// Cannot reconfigure
Object.defineProperty(obj, 'locked', {
    writable: false  // TypeError: Cannot redefine property
});
```

## Real-World Examples

### Example 1: Read-Only Properties

```javascript
// Create read-only property
function createUser(name, email) {
    const user = {};
    
    Object.defineProperty(user, 'name', {
        value: name,
        writable: false,
        enumerable: true,
        configurable: false
    });
    
    Object.defineProperty(user, 'email', {
        value: email,
        writable: false,
        enumerable: true,
        configurable: false
    });
    
    return user;
}

const user = createUser('John', 'john@example.com');
user.name = 'Jane';  // Silent failure
console.log(user.name);  // 'John' (unchanged)
```

### Example 2: Computed Properties

```javascript
// Computed property with getter/setter
const obj = {
    _value: 0
};

Object.defineProperty(obj, 'value', {
    get() {
        return this._value;
    },
    set(newValue) {
        if (typeof newValue === 'number' && newValue >= 0) {
            this._value = newValue;
        } else {
            throw new Error('Value must be non-negative number');
        }
    },
    enumerable: true,
    configurable: true
});

obj.value = 10;
console.log(obj.value);  // 10
obj.value = -5;          // Error
```

### Example 3: Hidden Properties

```javascript
// Hide internal properties
function createCounter() {
    const counter = {
        count: 0
    };
    
    // Hide internal state
    Object.defineProperty(counter, '_internal', {
        value: 'hidden',
        enumerable: false,
        writable: true,
        configurable: true
    });
    
    // Public method
    counter.increment = function() {
        this.count++;
        this._internal = 'updated';
    };
    
    return counter;
}

const counter = createCounter();
console.log(Object.keys(counter));  // ['count', 'increment'] (no _internal)
```

## Object Methods

### Object.defineProperty

```javascript
// Define single property
Object.defineProperty(obj, 'prop', {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true
});
```

### Object.defineProperties

```javascript
// Define multiple properties
Object.defineProperties(obj, {
    prop1: {
        value: 1,
        writable: true
    },
    prop2: {
        value: 2,
        writable: false
    }
});
```

### Object.getOwnPropertyDescriptor

```javascript
// Get property descriptor
const descriptor = Object.getOwnPropertyDescriptor(obj, 'prop');
console.log(descriptor);
// {
//   value: 42,
//   writable: true,
//   enumerable: true,
//   configurable: true
// }
```

### Object.getOwnPropertyDescriptors

```javascript
// Get all property descriptors
const descriptors = Object.getOwnPropertyDescriptors(obj);
```

## Default Values

```javascript
// Default descriptor values:
// - value: undefined
// - writable: false
// - enumerable: false
// - configurable: false
// - get: undefined
// - set: undefined

const obj = {};
Object.defineProperty(obj, 'prop', { value: 42 });
// writable: false, enumerable: false, configurable: false
```

## Best Practices

1. **Use Descriptors**: Control property behavior
2. **Read-Only**: Use writable: false for constants
3. **Hide Internals**: Use enumerable: false
4. **Lock Properties**: Use configurable: false
5. **Getters/Setters**: Use for computed properties

## Summary

**Objects & Property Descriptors:**

1. **Descriptors**: Control property behavior
2. **writable**: Can property be changed
3. **enumerable**: Shows in iterations
4. **configurable**: Can be deleted/reconfigured
5. **Best Practice**: Use descriptors for control, hide internals

**Key Takeaway:**
Property descriptors control object property behavior. writable controls mutability. enumerable controls visibility in iterations. configurable controls deletion/reconfiguration. Use descriptors for read-only properties, computed properties, and hiding internals. Understand default values.

**Descriptor Strategy:**
- Use descriptors for control
- Make properties read-only when needed
- Hide internal properties
- Use getters/setters
- Lock properties when appropriate

**Next Steps:**
- Learn [Prototypes](prototypes_prototype_chain.md) for inheritance
- Study [Classes vs Prototypal](classes_vs_prototypal_inheritance.md) for inheritance patterns
- Master [Functions](functions_bind_call_apply.md) for function methods

---

## 🎯 Interview Questions: JavaScript

### Q1: Explain what "property descriptors" are in JavaScript. What are the different descriptor attributes, and how do they control object property behavior?

**Answer:**

**Property Descriptors Definition:**

Property descriptors are objects that define the characteristics and behavior of object properties in JavaScript. Every property in a JavaScript object has a descriptor that controls how the property can be accessed, modified, and configured. Property descriptors provide fine-grained control over property behavior, enabling features like read-only properties, non-enumerable properties, and computed properties.

**Descriptor Attributes:**

**1. `value`:**

The `value` attribute holds the actual value of the property. This is the data stored in the property. When you access a property, you're accessing its `value`. The `value` attribute is used for data properties (properties that store values directly).

**2. `writable`:**

The `writable` attribute is a boolean that determines whether the property's value can be changed. If `writable` is `false`, the property is read-only and cannot be reassigned. Attempting to modify a non-writable property in strict mode throws a `TypeError`. This attribute enables creating constants or immutable properties.

**3. `enumerable`:**

The `enumerable` attribute is a boolean that determines whether the property shows up during enumeration (like in `for...in` loops, `Object.keys()`, `Object.values()`, etc.). If `enumerable` is `false`, the property is hidden from enumeration but can still be accessed directly. This is useful for hiding internal implementation details.

**4. `configurable`:**

The `configurable` attribute is a boolean that determines whether the property descriptor can be changed and whether the property can be deleted. If `configurable` is `false`, you cannot change the descriptor attributes (except `writable` from `true` to `false`) and cannot delete the property. This provides a way to lock properties once they're configured.

**5. `get` and `set`:**

For accessor properties (properties with getters/setters), `get` and `set` are functions that define how the property is accessed and modified. When you read the property, the `get` function is called. When you write to the property, the `set` function is called. Accessor properties don't have a `value` or `writable` attribute—they use `get` and `set` instead.

**Default Values:**

When you create a property using normal assignment (`obj.prop = value`), the descriptor has default values: `writable: true`, `enumerable: true`, `configurable: true`. When you use `Object.defineProperty()` without specifying attributes, the defaults are more restrictive: `writable: false`, `enumerable: false`, `configurable: false`.

**System Design Consideration**: Property descriptors are a powerful feature that enables:
1. **Encapsulation**: Creating read-only properties and hiding internal implementation
2. **Computed Properties**: Using getters/setters for properties that compute values on access
3. **API Design**: Controlling what properties are visible in enumeration (public API vs. internal)
4. **Immutability**: Creating properties that cannot be modified or deleted

Understanding property descriptors is essential for advanced JavaScript development, especially when building libraries, frameworks, or APIs where you need to control property behavior precisely.

---

### Q2: Explain the difference between data properties and accessor properties in JavaScript. When would you use each, and what are the trade-offs?

**Answer:**

**Data Properties:**

Data properties are properties that store values directly. They have a `value` attribute that holds the actual data, and they can have `writable`, `enumerable`, and `configurable` attributes. When you access a data property, you directly read or write the `value`. Data properties are the most common type of property in JavaScript.

**Accessor Properties:**

Accessor properties don't store values directly. Instead, they use `get` and `set` functions to define how the property is accessed and modified. When you read an accessor property, the `get` function is called. When you write to it, the `set` function is called. Accessor properties don't have a `value` or `writable` attribute.

**When to Use Data Properties:**

**1. Simple Value Storage:**

Use data properties when you're simply storing and retrieving values without any computation or side effects. Data properties are more efficient and straightforward for simple value storage.

**2. Performance-Critical Code:**

Data properties have less overhead than accessor properties because they don't involve function calls. For performance-critical code or frequently accessed properties, data properties are more efficient.

**3. Direct Access:**

When you want direct, unfiltered access to a value without any interception or computation, data properties are appropriate.

**When to Use Accessor Properties:**

**1. Computed Properties:**

Use accessor properties when the property value needs to be computed from other properties or data. The `get` function can calculate the value on-the-fly based on current state.

**2. Validation:**

Use accessor properties when you need to validate or transform values before storing them. The `set` function can check the value and either store it, transform it, or throw an error.

**3. Side Effects:**

Use accessor properties when reading or writing the property should trigger side effects (like logging, updating related properties, or triggering events).

**4. Lazy Evaluation:**

Use accessor properties for lazy evaluation—computing expensive values only when they're accessed, and potentially caching the result.

**5. Backward Compatibility:**

Accessor properties can be used to maintain backward compatibility when changing internal implementation. You can change a data property to an accessor property without breaking code that uses it.

**Trade-offs:**

**Data Properties:**

- **Pros**: More efficient, simpler, direct access
- **Cons**: No validation, no computation, no side effects

**Accessor Properties:**

- **Pros**: Validation, computation, side effects, flexibility
- **Cons**: Slight performance overhead (function calls), more complex

**System Design Consideration**: The choice between data and accessor properties depends on your needs:
1. **Performance**: Data properties are faster for simple value storage
2. **Flexibility**: Accessor properties provide more control and flexibility
3. **API Design**: Accessor properties can provide a cleaner API by hiding implementation details
4. **Validation**: Accessor properties enable validation and transformation of values

In modern JavaScript development, accessor properties are commonly used in classes (with `get` and `set` keywords) to provide computed properties and validation, while data properties are used for simple value storage.

---

### Q3: Explain what `enumerable` means in property descriptors. How does it affect object iteration and property visibility, and what are the practical use cases for non-enumerable properties?

**Answer:**

**Enumerable Definition:**

The `enumerable` attribute is a boolean property descriptor attribute that controls whether a property appears during property enumeration. Enumeration is the process of iterating over an object's properties, such as in `for...in` loops, `Object.keys()`, `Object.values()`, `Object.entries()`, and the spread operator.

**How Enumerable Affects Iteration:**

**1. `for...in` Loops:**

When `enumerable` is `true`, the property appears in `for...in` loops. When `false`, it's skipped. This allows you to hide properties from iteration while still keeping them accessible.

**2. `Object.keys()`:**

`Object.keys()` returns only enumerable own properties. Non-enumerable properties are excluded from the returned array.

**3. `Object.values()` and `Object.entries()`:**

Similar to `Object.keys()`, these methods only include enumerable properties in their results.

**4. Spread Operator:**

When spreading an object (`{...obj}`), only enumerable properties are copied. Non-enumerable properties are not included in the spread.

**5. `JSON.stringify()`:**

`JSON.stringify()` only serializes enumerable properties. Non-enumerable properties are not included in the JSON output.

**Property Visibility:**

**Enumerable Properties:**

Enumerable properties are visible during enumeration and are considered part of the object's "public" interface. They're what you typically see when iterating over an object or converting it to JSON.

**Non-Enumerable Properties:**

Non-enumerable properties are hidden from enumeration but are still accessible directly. You can still access them using dot notation or bracket notation, but they won't appear in loops or enumeration methods. This makes them useful for internal implementation details.

**Practical Use Cases for Non-Enumerable Properties:**

**1. Internal Implementation:**

Hide internal properties that are part of the implementation but shouldn't be part of the public API. This keeps the object's interface clean and prevents accidental access to internal state.

**2. Methods vs. Data:**

In some patterns, you might want to hide certain methods or properties from enumeration while keeping them accessible. This can be useful for utility methods or internal helpers.

**3. Symbol Properties:**

Symbol properties are often non-enumerable by default, which is useful for creating "hidden" properties that don't interfere with normal object iteration.

**4. Framework/Library Internals:**

Frameworks and libraries often use non-enumerable properties to store internal state, metadata, or implementation details that shouldn't be exposed to users of the library.

**5. Prototype Methods:**

Methods added to prototypes are typically enumerable, but you might want to make them non-enumerable to keep them out of enumeration when iterating over instance properties.

**System Design Consideration**: Understanding `enumerable` is important for:
1. **API Design**: Controlling what's part of the public interface vs. internal implementation
2. **Object Iteration**: Understanding which properties appear in loops and enumeration methods
3. **Serialization**: Knowing which properties are included in JSON serialization
4. **Code Organization**: Separating public API from internal implementation

The `enumerable` attribute provides a way to create a distinction between properties that are part of an object's public interface and properties that are internal implementation details. This is a form of encapsulation that helps create cleaner, more maintainable APIs.

---

### Q4: Explain what `configurable` means in property descriptors. How does it control property modification and deletion, and what are the implications of making a property non-configurable?

**Answer:**

**Configurable Definition:**

The `configurable` attribute is a boolean property descriptor attribute that controls whether a property descriptor can be changed and whether the property can be deleted. When `configurable` is `false`, the property is "locked" and cannot be deleted or have its descriptor modified (with some exceptions).

**How Configurable Controls Modification:**

**1. Descriptor Modification:**

When `configurable` is `false`, you cannot change most descriptor attributes. Once a property is non-configurable, its descriptor is essentially locked. However, there's one exception: you can change `writable` from `true` to `false` (but not from `false` to `true`).

**2. Property Deletion:**

When `configurable` is `false`, you cannot delete the property using the `delete` operator. Attempting to delete a non-configurable property in strict mode throws a `TypeError`. In non-strict mode, the deletion silently fails.

**3. Converting Between Data and Accessor:**

When `configurable` is `false`, you cannot convert a data property to an accessor property (or vice versa). The property type is locked.

**Implications of Non-Configurable Properties:**

**1. Immutability:**

Non-configurable properties provide a form of immutability at the property level. Once a property is non-configurable, it cannot be deleted and its descriptor cannot be changed, making it a permanent part of the object.

**2. API Stability:**

Making properties non-configurable helps ensure API stability. Users of your object cannot accidentally or intentionally delete or modify important properties, which helps maintain the object's integrity.

**3. Security:**

Non-configurable properties can provide a level of security by preventing modification or deletion of critical properties. However, this is not a security feature in the traditional sense—it's more about preventing accidental modification.

**4. Framework/Library Design:**

Frameworks and libraries often make certain properties non-configurable to ensure they remain consistent and cannot be modified by users, which could break the framework's functionality.

**5. Built-in Objects:**

Many built-in JavaScript objects have non-configurable properties. For example, `Math.PI` is non-configurable, preventing accidental modification of this mathematical constant.

**Limitations and Considerations:**

**1. One-Way Operation:**

Making a property non-configurable is generally a one-way operation. Once `configurable` is set to `false`, it cannot be changed back to `true` (because you cannot modify the descriptor of a non-configurable property).

**2. Value Can Still Change:**

Non-configurable doesn't mean the value cannot change. If `writable` is `true`, the value can still be modified. To make a property truly immutable, you need both `writable: false` and `configurable: false`.

**3. Prototype Properties:**

Non-configurable properties on prototypes cannot be shadowed (overridden) by instance properties in strict mode, which can affect inheritance patterns.

**System Design Consideration**: Understanding `configurable` is important for:
1. **Property Protection**: Creating properties that cannot be accidentally deleted or modified
2. **API Design**: Ensuring critical properties remain stable and cannot be changed by users
3. **Object Integrity**: Maintaining object structure and preventing breaking changes
4. **Best Practices**: Knowing when to lock properties vs. allowing flexibility

The `configurable` attribute provides a way to create "locked" properties that are permanent parts of an object. This is useful for creating stable APIs and preventing accidental modification, but it should be used judiciously, as it reduces flexibility.

---

### Q5: Explain how property descriptors enable encapsulation and data privacy in JavaScript. How do descriptors compare to other privacy mechanisms like closures, symbols, and private fields?

**Answer:**

**Property Descriptors for Encapsulation:**

Property descriptors provide several mechanisms for encapsulation:
1. **Non-enumerable properties**: Hide properties from enumeration, making them less visible
2. **Non-writable properties**: Prevent modification of property values
3. **Non-configurable properties**: Prevent deletion and descriptor modification
4. **Accessor properties**: Control how properties are accessed and modified through getters/setters

**Comparison with Other Privacy Mechanisms:**

**1. Property Descriptors:**

- **Visibility**: Non-enumerable properties are hidden from enumeration but still accessible directly
- **Modification Control**: Can prevent modification and deletion
- **Access Control**: Accessor properties can add validation and computation
- **Limitation**: Properties are still accessible if you know the name; not true privacy

**2. Closures:**

- **True Privacy**: Variables in closures are truly private—they cannot be accessed from outside the closure
- **Scope-Based**: Privacy is achieved through scope, not property attributes
- **Memory**: Closures retain memory for private variables
- **Use Case**: Module pattern, factory functions, data privacy

**3. Symbols:**

- **Hidden Properties**: Symbol properties are hidden from normal property access patterns
- **Enumeration**: Symbol properties are non-enumerable by default
- **Access**: Still accessible if you have the symbol reference
- **Use Case**: Creating "hidden" properties that don't conflict with string properties

**4. Private Fields (`#`):**

- **True Privacy**: Private fields are truly private and cannot be accessed from outside the class
- **Syntax**: Uses `#` prefix for private fields
- **Scope**: Only accessible within the class definition
- **Use Case**: Class-based encapsulation, modern JavaScript

**Strengths and Limitations:**

**Property Descriptors:**

- **Strengths**: Fine-grained control, works with all objects, can prevent modification/deletion
- **Limitations**: Not true privacy (still accessible), more verbose, requires `Object.defineProperty()`

**Closures:**

- **Strengths**: True privacy, flexible, works everywhere
- **Limitations**: Memory retention, can't be accessed for debugging, more complex patterns

**Symbols:**

- **Strengths**: Hidden from normal access, don't conflict with string properties
- **Limitations**: Still accessible with symbol reference, not true privacy

**Private Fields:**

- **Strengths**: True privacy, clean syntax, class-based
- **Limitations**: Only in classes, not available in older JavaScript, can't be accessed from outside

**System Design Consideration**: Different privacy mechanisms serve different purposes:
1. **Property Descriptors**: For controlling property behavior and visibility, not true privacy
2. **Closures**: For true privacy in functions and modules
3. **Symbols**: For creating hidden properties that don't interfere with normal access
4. **Private Fields**: For true privacy in classes (modern JavaScript)

Understanding these mechanisms helps you choose the right approach for your needs. Property descriptors are useful for controlling property behavior and creating a clean public API, but for true data privacy, closures or private fields are more appropriate. The choice depends on your use case, JavaScript version, and whether you need true privacy or just controlled access.

