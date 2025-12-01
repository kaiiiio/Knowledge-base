# Reflect & Proxy: Traps and Use Cases

Reflect and Proxy provide powerful meta-programming capabilities in JavaScript for intercepting and customizing object operations.

## Proxy

**Proxy** wraps an object and intercepts operations (get, set, etc.).

### Basic Proxy

```javascript
// Create proxy
const target = { name: 'John' };
const proxy = new Proxy(target, {
    get(target, prop) {
        console.log(`Getting ${prop}`);
        return target[prop];
    },
    set(target, prop, value) {
        console.log(`Setting ${prop} to ${value}`);
        target[prop] = value;
        return true;
    }
});

proxy.name;        // "Getting name", "John"
proxy.age = 30;    // "Setting age to 30"
```

### Proxy Traps

```javascript
const proxy = new Proxy(target, {
    // get: Intercept property access
    get(target, prop, receiver) {
        return target[prop];
    },
    
    // set: Intercept property assignment
    set(target, prop, value, receiver) {
        target[prop] = value;
        return true;  // Must return boolean
    },
    
    // has: Intercept 'in' operator
    has(target, prop) {
        return prop in target;
    },
    
    // deleteProperty: Intercept delete
    deleteProperty(target, prop) {
        delete target[prop];
        return true;
    },
    
    // ownKeys: Intercept Object.keys()
    ownKeys(target) {
        return Object.keys(target);
    },
    
    // getOwnPropertyDescriptor: Intercept property descriptor access
    getOwnPropertyDescriptor(target, prop) {
        return Object.getOwnPropertyDescriptor(target, prop);
    },
    
    // defineProperty: Intercept Object.defineProperty()
    defineProperty(target, prop, descriptor) {
        Object.defineProperty(target, prop, descriptor);
        return true;
    },
    
    // preventExtensions: Intercept Object.preventExtensions()
    preventExtensions(target) {
        Object.preventExtensions(target);
        return true;
    },
    
    // isExtensible: Intercept Object.isExtensible()
    isExtensible(target) {
        return Object.isExtensible(target);
    },
    
    // getPrototypeOf: Intercept Object.getPrototypeOf()
    getPrototypeOf(target) {
        return Object.getPrototypeOf(target);
    },
    
    // setPrototypeOf: Intercept Object.setPrototypeOf()
    setPrototypeOf(target, proto) {
        Object.setPrototypeOf(target, proto);
        return true;
    },
    
    // apply: Intercept function calls
    apply(target, thisArg, argumentsList) {
        return target.apply(thisArg, argumentsList);
    },
    
    // construct: Intercept 'new' operator
    construct(target, argumentsList, newTarget) {
        return new target(...argumentsList);
    }
});
```

## Reflect

**Reflect** provides methods that mirror Proxy traps for default behavior.

### Reflect Methods

```javascript
const obj = { name: 'John' };

// Reflect.get
Reflect.get(obj, 'name');  // 'John'

// Reflect.set
Reflect.set(obj, 'age', 30);  // true

// Reflect.has
Reflect.has(obj, 'name');  // true

// Reflect.deleteProperty
Reflect.deleteProperty(obj, 'age');  // true

// Reflect.ownKeys
Reflect.ownKeys(obj);  // ['name']

// Reflect.getOwnPropertyDescriptor
Reflect.getOwnPropertyDescriptor(obj, 'name');

// Reflect.defineProperty
Reflect.defineProperty(obj, 'prop', { value: 42 });

// Reflect.preventExtensions
Reflect.preventExtensions(obj);

// Reflect.isExtensible
Reflect.isExtensible(obj);  // false

// Reflect.getPrototypeOf
Reflect.getPrototypeOf(obj);

// Reflect.setPrototypeOf
Reflect.setPrototypeOf(obj, proto);

// Reflect.apply
Reflect.apply(func, thisArg, args);

// Reflect.construct
Reflect.construct(Constructor, args);
```

## Real-World Examples

### Example 1: Validation Proxy

```javascript
// Validate property values
const validator = {
    set(target, prop, value) {
        if (prop === 'age' && (typeof value !== 'number' || value < 0)) {
            throw new TypeError('Age must be a non-negative number');
        }
        if (prop === 'email' && !value.includes('@')) {
            throw new TypeError('Invalid email');
        }
        target[prop] = value;
        return true;
    }
};

const person = new Proxy({}, validator);
person.age = 30;      // OK
person.age = -5;      // TypeError
person.email = 'john@example.com';  // OK
person.email = 'invalid';  // TypeError
```

### Example 2: Default Values

```javascript
// Provide default values
const defaults = {
    name: 'Unknown',
    age: 0
};

const proxy = new Proxy({}, {
    get(target, prop) {
        return target[prop] ?? defaults[prop] ?? undefined;
    }
});

console.log(proxy.name);  // 'Unknown'
console.log(proxy.age);   // 0
console.log(proxy.other); // undefined
```

### Example 3: Logging Proxy

```javascript
// Log all property access
const loggingProxy = new Proxy({}, {
    get(target, prop) {
        console.log(`Accessing property: ${prop}`);
        return target[prop];
    },
    set(target, prop, value) {
        console.log(`Setting property: ${prop} = ${value}`);
        target[prop] = value;
        return true;
    }
});

loggingProxy.name = 'John';  // "Setting property: name = John"
console.log(loggingProxy.name);  // "Accessing property: name", "John"
```

### Example 4: Using Reflect

```javascript
// Use Reflect in Proxy for default behavior
const proxy = new Proxy({}, {
    get(target, prop, receiver) {
        if (prop in target) {
            return Reflect.get(target, prop, receiver);
        }
        return `Property ${prop} not found`;
    },
    
    set(target, prop, value, receiver) {
        if (typeof value === 'string') {
            return Reflect.set(target, prop, value, receiver);
        }
        throw new TypeError('Value must be a string');
    }
});
```

## Best Practices

1. **Use Reflect**: For default behavior in Proxy traps
2. **Validation**: Use Proxy for property validation
3. **Logging**: Use Proxy for debugging and logging
4. **Performance**: Be aware of Proxy performance overhead
5. **Transparency**: Maintain object behavior expectations

## Summary

**Reflect & Proxy:**

1. **Proxy**: Intercepts object operations
2. **Traps**: Methods that intercept operations
3. **Reflect**: Methods that provide default behavior
4. **Use Cases**: Validation, logging, default values
5. **Best Practice**: Use Reflect in Proxy, be aware of performance

**Key Takeaway:**
Proxy wraps objects and intercepts operations via traps. Reflect provides methods that mirror Proxy traps. Use Reflect in Proxy for default behavior. Proxy enables validation, logging, and default values. Be aware of performance overhead.

**Proxy Strategy:**
- Use for validation
- Logging and debugging
- Default values
- Use Reflect for defaults
- Consider performance

**Next Steps:**
- Learn [Symbols](symbols_well_known_symbols.md) for unique values
- Study [Objects](objects_property_descriptors.md) for object behavior
- Master [Meta-programming](../04_advanced_language_features/meta_programming_proxy_reflect.md) for advanced patterns

