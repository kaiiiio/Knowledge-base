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

---

## 🎯 Interview Questions: JavaScript

### Q1: Explain what the Proxy object is in JavaScript and how it enables meta-programming. What are "traps" in the context of Proxy, and how do they intercept object operations?

**Answer:**

**Proxy Definition:**

Proxy is an object that wraps another object and intercepts fundamental operations (like property access, assignment, function invocation, etc.). It enables you to customize the behavior of an object by defining handlers (traps) for these operations. Proxy is a powerful meta-programming feature that allows you to create objects with custom behavior for fundamental operations.

**How Proxy Enables Meta-Programming:**

**1. Operation Interception:**

Proxy allows you to intercept and customize fundamental object operations that are normally handled by the JavaScript engine. This gives you control over how objects behave at a low level.

**2. Transparent Wrapping:**

Proxy wraps an object transparently—code using the proxy doesn't need to know it's a proxy. The proxy behaves like the original object but with custom behavior.

**3. Runtime Behavior Modification:**

You can modify object behavior at runtime without modifying the object itself. This enables patterns like validation, logging, lazy loading, and more.

**What Are Traps:**

**1. Definition:**

Traps are methods defined in the handler object that intercept specific operations. When an operation is performed on the proxy, the corresponding trap is called instead of the default behavior.

**2. Operation Mapping:**

Each fundamental operation has a corresponding trap:
- `get` - intercepts property access
- `set` - intercepts property assignment
- `has` - intercepts `in` operator
- `deleteProperty` - intercepts `delete` operator
- `apply` - intercepts function calls
- `construct` - intercepts `new` operator
- And many more...

**3. Custom Behavior:**

Traps allow you to define custom behavior for these operations. You can validate, log, transform, or completely replace the default behavior.

**How Traps Intercept Operations:**

**1. Operation Trigger:**

When code performs an operation on the proxy (like accessing a property), JavaScript checks if a trap is defined for that operation.

**2. Trap Invocation:**

If a trap exists, it's called with relevant arguments (target object, property name, receiver, etc.). The trap can then decide what to do.

**3. Return Value:**

The trap's return value becomes the result of the operation. For some traps (like `set`), the return value indicates success or failure.

**4. Default Behavior:**

If no trap is defined, the operation proceeds with default behavior on the target object.

**System Design Consideration**: Proxy is a powerful meta-programming tool:
1. **Validation**: Intercept property assignments to validate values
2. **Logging**: Log all property access and modifications for debugging
3. **Lazy Loading**: Load properties on-demand
4. **Default Values**: Provide default values for missing properties
5. **Observable Objects**: Create reactive objects that notify on changes

Proxy enables sophisticated patterns that would be difficult or impossible without meta-programming capabilities. It's particularly useful for creating abstractions, implementing frameworks, and building developer tools.

---

### Q2: Explain what the Reflect object is and how it relates to Proxy. Why is Reflect useful when working with Proxy, and what are the benefits of using Reflect methods?

**Answer:**

**Reflect Definition:**

Reflect is an object that provides methods for interceptable JavaScript operations. These methods correspond to the traps available in Proxy. Reflect methods are the default implementations of these operations—they perform the standard behavior that would happen if no proxy trap was defined.

**How Reflect Relates to Proxy:**

**1. Method Correspondence:**

Each Proxy trap has a corresponding Reflect method. For example:
- `Proxy` trap `get` → `Reflect.get()`
- `Proxy` trap `set` → `Reflect.set()`
- `Proxy` trap `has` → `Reflect.has()`
- And so on...

**2. Default Behavior:**

Reflect methods provide the default behavior for operations. When you implement a Proxy trap, you can use the corresponding Reflect method to perform the default behavior, then add your custom logic.

**3. Consistent API:**

Reflect provides a consistent, functional API for operations that are normally done with operators or methods. This makes it easier to work with these operations programmatically.

**Why Reflect is Useful with Proxy:**

**1. Default Behavior:**

In Proxy traps, you often want to perform the default behavior and then add custom logic. Reflect methods provide an easy way to invoke the default behavior.

**2. Return Value Consistency:**

Reflect methods return values in a consistent way that matches what Proxy traps expect. This makes it easy to forward operations correctly.

**3. Error Handling:**

Reflect methods throw errors in the same way as the default operations, providing consistent error behavior.

**4. Receiver Parameter:**

Reflect methods accept a `receiver` parameter that allows you to control what `this` refers to. This is important for maintaining correct behavior with inheritance and getters/setters.

**Benefits of Using Reflect:**

**1. Explicit Default Behavior:**

Using `Reflect.get()` instead of `target[prop]` makes it explicit that you're performing the default get operation, which is clearer and more maintainable.

**2. Proper `this` Binding:**

Reflect methods with the `receiver` parameter ensure that getters, setters, and methods are called with the correct `this` context, which is crucial for correct behavior.

**3. Functional Style:**

Reflect methods enable a functional programming style for operations that are normally done with operators, making code more composable and testable.

**4. Error Consistency:**

Reflect methods throw errors in the same way as default operations, ensuring consistent error handling.

**Example Pattern:**

```javascript
const proxy = new Proxy(target, {
    get(target, prop, receiver) {
        // Custom logic before
        console.log(`Accessing ${prop}`);
        // Default behavior using Reflect
        return Reflect.get(target, prop, receiver);
        // Custom logic after (if needed)
    }
});
```

**System Design Consideration**: Reflect is essential for correct Proxy implementation:
1. **Correct Behavior**: Using Reflect ensures proxy behavior matches default behavior
2. **Maintainability**: Makes proxy code clearer and easier to understand
3. **Inheritance**: Proper `receiver` handling ensures inheritance works correctly
4. **Best Practices**: Using Reflect in Proxy traps is considered a best practice

Reflect and Proxy work together to enable powerful meta-programming. Reflect provides the default behavior that Proxy can then customize, making it easy to add custom logic while maintaining correct default behavior.

---

### Q3: Explain how Proxy can be used for property validation, logging, and creating reactive objects. What are the performance implications of using Proxy?

**Answer:**

**Property Validation with Proxy:**

**1. Intercept Assignment:**

Use the `set` trap to intercept property assignments and validate values before they're set. You can check types, ranges, formats, etc., and throw errors for invalid values.

**2. Type Safety:**

Proxy can provide runtime type checking, ensuring that properties are set to values of the correct type, even in untyped JavaScript.

**3. Business Rules:**

You can enforce business rules (like "age must be positive", "email must be valid", etc.) at the object level, making validation automatic and consistent.

**Logging with Proxy:**

**1. Operation Logging:**

Use traps to log all operations (property access, assignment, method calls, etc.) for debugging purposes. This is useful for understanding how objects are used.

**2. Audit Trail:**

Create an audit trail of all changes to an object, which is useful for debugging, security, or compliance.

**3. Performance Monitoring:**

Log operations to monitor performance and identify bottlenecks in object usage.

**Reactive Objects with Proxy:**

**1. Change Detection:**

Use the `set` trap to detect when properties change and trigger reactions (like updating the UI, notifying observers, etc.).

**2. Computed Properties:**

Implement computed properties that automatically update when their dependencies change.

**3. Two-Way Binding:**

Enable two-way data binding patterns where changes to the object automatically update the view and vice versa.

**Performance Implications:**

**1. Overhead:**

Proxy adds overhead to every intercepted operation. Each property access, assignment, etc., goes through the trap function, which adds function call overhead.

**2. Optimization Impact:**

JavaScript engines have difficulty optimizing code that uses Proxy because the behavior is dynamic and can change at runtime. This can prevent various optimizations.

**3. Performance Considerations:**

- **Use Sparingly**: Only use Proxy when the benefits outweigh the performance cost
- **Minimize Traps**: Only define traps for operations you actually need to intercept
- **Efficient Traps**: Keep trap functions fast—avoid heavy computation in traps
- **Measure**: Profile code that uses Proxy to ensure performance is acceptable

**4. When Performance Matters:**

- **High-Frequency Operations**: Be careful with Proxy in hot code paths
- **Large Objects**: Proxy overhead is multiplied for objects with many properties
- **Real-Time Systems**: May not be suitable for real-time systems with strict performance requirements

**System Design Consideration**: Proxy is powerful but has costs:
1. **Use Cases**: Choose Proxy when the benefits (validation, logging, reactivity) justify the performance cost
2. **Performance Testing**: Always measure performance when using Proxy
3. **Alternatives**: Consider alternatives (like explicit validation functions) for performance-critical code
4. **Best Practices**: Use Proxy for development tools, frameworks, and non-performance-critical code

Proxy enables powerful patterns, but it's important to understand the performance implications. Use it where the benefits (validation, logging, reactivity) outweigh the costs, and always measure performance in your specific use case.

---

### Q4: Explain how Proxy traps work with inheritance and the `receiver` parameter. Why is the `receiver` parameter important, and how does it affect getters, setters, and method calls?

**Answer:**

**Proxy and Inheritance:**

When a Proxy is used in an inheritance chain, operations on the proxy need to maintain correct `this` binding. The `receiver` parameter in Proxy traps represents the object that originally received the operation (the proxy or an object that inherits from the proxy).

**The `receiver` Parameter:**

**1. Definition:**

The `receiver` is the object that the operation was originally performed on. It's the proxy itself or an object that inherits from the proxy. It represents what `this` should be in getters, setters, and methods.

**2. Purpose:**

The `receiver` ensures that getters, setters, and methods are called with the correct `this` context, maintaining proper inheritance behavior.

**3. Why It Matters:**

Without the `receiver`, operations might use the wrong `this` context, breaking inheritance and causing incorrect behavior.

**How It Affects Getters:**

**1. `this` in Getters:**

Getters use `this` to access other properties. If a getter is called through a proxy, `this` should refer to the proxy (or the inheriting object), not the target object.

**2. Without `receiver`:**

If you use `target[prop]` instead of `Reflect.get(target, prop, receiver)`, the getter's `this` will be the target object, not the proxy, which can cause incorrect behavior.

**3. With `receiver`:**

Using `Reflect.get(target, prop, receiver)` ensures the getter's `this` is the `receiver` (the proxy), maintaining correct behavior.

**How It Affects Setters:**

**1. `this` in Setters:**

Setters also use `this` to access other properties. The `receiver` ensures setters are called with the correct `this`.

**2. Property Descriptors:**

Setters defined with property descriptors need the correct `this` to work properly with inheritance.

**How It Affects Method Calls:**

**1. Method Invocation:**

When methods are called through a proxy, they need the correct `this` to access instance properties and call other methods correctly.

**2. Inheritance Chain:**

The `receiver` ensures that methods in the inheritance chain are called with the correct `this`, maintaining proper inheritance behavior.

**Example:**

```javascript
const target = {
    get value() {
        return this._value;  // 'this' should be the proxy, not target
    }
};

const proxy = new Proxy(target, {
    get(target, prop, receiver) {
        // receiver is the proxy
        // Using Reflect.get ensures 'this' in getter is receiver
        return Reflect.get(target, prop, receiver);
    }
});
```

**System Design Consideration**: Understanding `receiver` is crucial for:
1. **Correct Behavior**: Ensures Proxy works correctly with inheritance
2. **Getter/Setter Support**: Enables proper support for getters and setters in proxies
3. **Best Practices**: Using `receiver` with Reflect methods is essential for correct Proxy implementation
4. **Inheritance**: Maintains correct inheritance behavior when using Proxy

The `receiver` parameter is essential for correct Proxy behavior with inheritance, getters, setters, and methods. Always use it when calling Reflect methods in Proxy traps to ensure correct `this` binding and proper inheritance behavior.

---

### Q5: Explain how Proxy can be used to implement patterns like lazy loading, default values, and observable objects. What are the implementation considerations for each pattern?

**Answer:**

**Lazy Loading with Proxy:**

**1. Concept:**

Lazy loading defers the loading or computation of a property until it's actually accessed. Proxy's `get` trap can intercept property access and load/compute the value on-demand.

**2. Implementation:**

In the `get` trap, check if the property exists. If not, load or compute it, store it, then return it. Subsequent accesses return the cached value.

**3. Considerations:**

- **Caching**: Cache loaded values to avoid reloading
- **Error Handling**: Handle errors during loading gracefully
- **Async Loading**: For async loading, return a promise or use async/await
- **Memory**: Be aware of memory usage if many properties are loaded

**Default Values with Proxy:**

**1. Concept:**

Provide default values for properties that don't exist. When a property is accessed but doesn't exist, return a default value instead of `undefined`.

**2. Implementation:**

In the `get` trap, check if the property exists on the target. If not, return a default value from a defaults object or computed default.

**3. Considerations:**

- **Default Source**: Define defaults clearly (object, function, etc.)
- **Type Consistency**: Ensure defaults match expected types
- **Nested Objects**: Handle nested object defaults if needed
- **Performance**: Default lookups should be fast

**Observable Objects with Proxy:**

**1. Concept:**

Observable objects notify listeners when properties change. This enables reactive programming patterns where changes trigger updates.

**2. Implementation:**

In the `set` trap, after setting the value, notify all registered listeners about the change. Listeners can then react to the change (update UI, trigger side effects, etc.).

**3. Considerations:**

- **Listener Management**: Efficiently manage listener registration and removal
- **Change Notification**: Decide what information to include in notifications (property name, old value, new value, etc.)
- **Batching**: Consider batching multiple changes to avoid excessive notifications
- **Memory Leaks**: Ensure listeners are properly removed to avoid memory leaks
- **Performance**: Notification overhead can be significant with many listeners

**Implementation Considerations:**

**1. Performance:**

All these patterns add overhead to property access/assignment. Measure performance and optimize hot paths.

**2. Error Handling:**

Handle errors gracefully. Lazy loading might fail, defaults might be invalid, notifications might throw errors.

**3. Memory:**

Be aware of memory usage. Lazy loading caches values, observables store listeners, defaults might create objects.

**4. Complexity:**

These patterns add complexity. Ensure the benefits justify the added complexity.

**5. Testing:**

Test these patterns thoroughly. Proxy behavior can be subtle, and edge cases are important.

**System Design Consideration**: These patterns demonstrate Proxy's power:
1. **Lazy Loading**: Improves initial load time and memory usage
2. **Default Values**: Provides better developer experience and reduces null checks
3. **Observable Objects**: Enables reactive programming and automatic updates

Each pattern has trade-offs between functionality, performance, and complexity. Choose the pattern that best fits your needs, and always measure performance to ensure it meets your requirements.

