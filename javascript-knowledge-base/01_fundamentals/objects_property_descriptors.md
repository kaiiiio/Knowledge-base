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

