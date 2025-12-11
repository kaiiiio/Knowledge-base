# Language Patterns: IIFE, Module Pattern, Revealing Module, Factory

JavaScript patterns provide reusable solutions to common problems. Understanding these patterns is essential for writing maintainable code.

## IIFE (Immediately Invoked Function Expression)

**IIFE** is a function that executes immediately after definition.

### Basic IIFE

```javascript
// IIFE syntax
(function() {
    console.log('IIFE executed');
})();

// Alternative syntax
(function() {
    console.log('IIFE executed');
}());

// Arrow function IIFE
(() => {
    console.log('IIFE executed');
})();
```

### IIFE with Parameters

```javascript
// Pass parameters to IIFE
(function(name) {
    console.log(`Hello, ${name}`);
})('John');

// Use for variable scoping
(function() {
    var private = 'private';
    // private is not accessible outside
})();
```

## Module Pattern

**Module Pattern** uses closures to create private variables and methods.

### Basic Module

```javascript
// Module pattern
const module = (function() {
    // Private variables
    let count = 0;
    
    // Private function
    function increment() {
        count++;
    }
    
    // Public API
    return {
        getCount: function() {
            return count;
        },
        increment: function() {
            increment();
        }
    };
})();

module.getCount();    // 0
module.increment();
module.getCount();    // 1
// module.count;      // undefined (private)
```

### Module with Parameters

```javascript
// Module with dependencies
const module = (function(dependency) {
    let count = 0;
    
    return {
        increment: function() {
            count += dependency.step;
        },
        getCount: function() {
            return count;
        }
    };
})({ step: 2 });

module.increment();
module.getCount();  // 2
```

## Revealing Module Pattern

**Revealing Module Pattern** exposes private functions as public methods.

```javascript
// Revealing module pattern
const module = (function() {
    let count = 0;
    
    function increment() {
        count++;
    }
    
    function getCount() {
        return count;
    }
    
    // Reveal private functions
    return {
        increment: increment,
        getCount: getCount
    };
})();

module.increment();
module.getCount();  // 1
```

## Factory Pattern

**Factory Pattern** creates objects without specifying exact class.

### Basic Factory

```javascript
// Factory function
function createUser(name, type) {
    const user = {
        name: name,
        type: type
    };
    
    if (type === 'admin') {
        user.permissions = ['read', 'write', 'delete'];
    } else {
        user.permissions = ['read'];
    }
    
    return user;
}

const admin = createUser('John', 'admin');
const user = createUser('Jane', 'user');
```

### Factory with Methods

```javascript
// Factory with methods
function createCounter() {
    let count = 0;
    
    return {
        increment: function() {
            count++;
        },
        decrement: function() {
            count--;
        },
        getCount: function() {
            return count;
        }
    };
}

const counter1 = createCounter();
const counter2 = createCounter();

counter1.increment();
counter1.getCount();  // 1
counter2.getCount();  // 0 (separate instance)
```

## Real-World Examples

### Example 1: Namespace Pattern

```javascript
// Create namespace
const MyApp = MyApp || {};

MyApp.Utils = (function() {
    function formatDate(date) {
        return date.toISOString();
    }
    
    function formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }
    
    return {
        formatDate: formatDate,
        formatCurrency: formatCurrency
    };
})();

MyApp.Utils.formatDate(new Date());
```

### Example 2: Singleton Pattern

```javascript
// Singleton using IIFE
const Singleton = (function() {
    let instance;
    
    function createInstance() {
        return {
            name: 'Singleton',
            getData: function() {
                return 'data';
            }
        };
    }
    
    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

const instance1 = Singleton.getInstance();
const instance2 = Singleton.getInstance();
console.log(instance1 === instance2);  // true
```

### Example 3: Observer Pattern

```javascript
// Observer pattern
const EventEmitter = (function() {
    const events = {};
    
    return {
        on: function(event, callback) {
            if (!events[event]) {
                events[event] = [];
            }
            events[event].push(callback);
        },
        
        emit: function(event, data) {
            if (events[event]) {
                events[event].forEach(callback => callback(data));
            }
        },
        
        off: function(event, callback) {
            if (events[event]) {
                events[event] = events[event].filter(cb => cb !== callback);
            }
        }
    };
})();

EventEmitter.on('click', (data) => {
    console.log('Clicked:', data);
});

EventEmitter.emit('click', 'button');
```

## Best Practices

1. **Use IIFE**: For scoping and immediate execution
2. **Module Pattern**: For encapsulation and privacy
3. **Factory Pattern**: For object creation
4. **Consistency**: Use patterns consistently
5. **Modern Alternatives**: Consider ES6 modules and classes

## Summary

**Language Patterns:**

1. **IIFE**: Immediately invoked function expression
2. **Module Pattern**: Private variables and methods
3. **Revealing Module**: Expose private functions
4. **Factory Pattern**: Object creation
5. **Best Practice**: Use for encapsulation, scoping, object creation

**Key Takeaway:**
IIFE executes immediately and provides scoping. Module pattern uses closures for private variables. Revealing module exposes private functions. Factory pattern creates objects. Use patterns for encapsulation, scoping, and object creation. Consider modern alternatives (ES6 modules, classes).

**Pattern Strategy:**
- Use IIFE for scoping
- Module pattern for encapsulation
- Factory for object creation
- Consistent patterns
- Modern alternatives when appropriate

**Next Steps:**
- Learn [Modules](modules_esm_vs_commonjs.md) for ES6 modules
- Study [Closures](scopes_closures.md) for scope understanding
- Master [Design Patterns](../24_patterns_architecture_design/) for advanced patterns

---

## 🎯 Interview Questions: JavaScript

### Q1: Explain the IIFE (Immediately Invoked Function Expression) pattern. What problems does it solve, and how does it relate to modern JavaScript module systems?

**Answer:**

**IIFE Definition:**

An IIFE (Immediately Invoked Function Expression) is a JavaScript function that is defined and executed immediately. It's created by wrapping a function in parentheses and immediately calling it: `(function() { ... })()`. The function executes once and its scope is isolated from the global scope.

**Problems IIFE Solves:**

**1. Variable Scoping:**

IIFE creates a new function scope, preventing variables from polluting the global scope. Variables declared inside an IIFE are not accessible from outside, providing encapsulation.

**2. Global Namespace Pollution:**

Before ES6 modules, JavaScript had no built-in module system. IIFE was used to create private scopes and avoid polluting the global namespace with variables and functions.

**3. Closure Creation:**

IIFE creates closures, allowing you to create private variables and functions that persist after the IIFE executes. This enables patterns like the module pattern.

**4. Immediate Execution:**

IIFE executes immediately, which is useful for initialization code that should run once when the script loads.

**How It Works:**

**1. Function Expression:**

The function is defined as an expression (not a declaration), which allows it to be called immediately.

**2. Invocation:**

The function is immediately invoked with `()`, causing it to execute right away.

**3. Scope Isolation:**

Variables inside the IIFE are scoped to that function, not the global scope.

**Relation to Modern Module Systems:**

**1. Historical Predecessor:**

IIFE was the primary way to create modules before ES6 modules. It provided encapsulation and namespace management that modern modules now provide natively.

**2. Module Pattern:**

The module pattern (which uses IIFE) was the foundation for JavaScript module systems. ES6 modules provide similar benefits but with native language support.

**3. Still Useful:**

IIFE is still useful in some cases:
- Creating isolated scopes in non-module code
- Wrapping code that needs to execute immediately
- Creating closures for specific purposes
- Polyfills and shims that need to run immediately

**4. Modern Alternative:**

ES6 modules provide better alternatives:
- Native module system
- Static analysis and tree shaking
- Better tooling support
- Cleaner syntax

**System Design Consideration**: Understanding IIFE is important for:
1. **Historical Context**: Understanding how JavaScript modules evolved
2. **Legacy Code**: Understanding and maintaining older JavaScript code
3. **Modern Patterns**: Understanding how modern modules relate to older patterns
4. **Specific Use Cases**: Knowing when IIFE is still appropriate

IIFE was a crucial pattern in JavaScript's evolution, providing encapsulation before native modules. While ES6 modules are preferred for new code, understanding IIFE helps with legacy code and specific use cases.

---

### Q2: Explain the module pattern in JavaScript and how it uses closures for encapsulation. How does it compare to ES6 modules, and when might you still use the module pattern?

**Answer:**

**Module Pattern Definition:**

The module pattern uses an IIFE to create a private scope and returns an object with public methods. Private variables and functions are defined inside the IIFE and are accessible only to the returned public methods through closures.

**How It Uses Closures:**

**1. Private Scope:**

The IIFE creates a private scope where variables and functions are defined. These are not accessible from outside the IIFE.

**2. Closure Preservation:**

The returned object contains methods that form closures over the private scope. These methods can access private variables and functions, but external code cannot.

**3. Encapsulation:**

Private variables and functions are encapsulated—they can only be accessed through the public methods returned by the IIFE.

**How It Works:**

**1. IIFE Wrapper:**

An IIFE creates the private scope and executes immediately.

**2. Private Variables:**

Variables and functions defined inside the IIFE are private.

**3. Public API:**

The IIFE returns an object containing methods that form the public API. These methods have access to private variables through closures.

**Comparison with ES6 Modules:**

**1. Syntax:**

- **Module Pattern**: More verbose, requires IIFE and return statement
- **ES6 Modules**: Cleaner syntax with `import`/`export`

**2. Encapsulation:**

- **Module Pattern**: Uses closures for encapsulation
- **ES6 Modules**: Native module scope provides encapsulation

**3. Static Analysis:**

- **Module Pattern**: Cannot be statically analyzed
- **ES6 Modules**: Can be statically analyzed (enables tree shaking)

**4. Tooling:**

- **Module Pattern**: Limited tooling support
- **ES6 Modules**: Better tooling support (IDEs, bundlers, etc.)

**5. Dependency Management:**

- **Module Pattern**: Manual dependency management
- **ES6 Modules**: Native dependency management

**When to Use Module Pattern:**

**1. Legacy Code:**

When working with legacy codebases that use the module pattern.

**2. Non-Module Environments:**

When you cannot use ES6 modules (older environments, specific build setups, etc.).

**3. Specific Requirements:**

When you need the specific behavior of the module pattern (like dynamic module creation).

**4. Learning:**

For understanding how modules work and how closures enable encapsulation.

**System Design Consideration**: The module pattern demonstrates:
1. **Encapsulation**: How closures enable data privacy
2. **API Design**: How to create clean public APIs
3. **Historical Context**: How JavaScript modules evolved
4. **Closure Understanding**: Practical application of closures

The module pattern is a foundational pattern that demonstrates how closures enable encapsulation. While ES6 modules are preferred for new code, understanding the module pattern helps understand how modules work and when it might still be appropriate.

---

### Q3: Explain the factory pattern in JavaScript. How does it differ from constructor functions and classes, and when would you use a factory function?

**Answer:**

**Factory Pattern Definition:**

The factory pattern is a creational pattern where a function (factory function) creates and returns objects. Instead of using `new` with a constructor, you call a function that returns a new object. Factory functions can encapsulate object creation logic and return different types of objects based on parameters.

**How It Works:**

**1. Factory Function:**

A function that creates and returns objects. It can take parameters to customize the created object.

**2. Object Creation:**

The factory function creates objects (using object literals, other constructors, or any method) and returns them.

**3. No `new` Keyword:**

Factory functions don't require the `new` keyword—you just call them like regular functions.

**Differences from Constructor Functions:**

**1. Invocation:**

- **Factory Functions**: Called like regular functions: `createUser()`
- **Constructors**: Called with `new`: `new User()`

**2. `this` Binding:**

- **Factory Functions**: Don't use `this` (or use it differently)
- **Constructors**: Rely on `this` to set properties

**3. Return Value:**

- **Factory Functions**: Explicitly return an object
- **Constructors**: Implicitly return `this` (or can return a different object)

**4. `instanceof`:**

- **Factory Functions**: Don't work with `instanceof` (unless you manually set prototype)
- **Constructors**: Work with `instanceof`

**Differences from Classes:**

**1. Syntax:**

- **Factory Functions**: Function syntax, more flexible
- **Classes**: Class syntax, more structured

**2. Inheritance:**

- **Factory Functions**: Use composition or manual prototype setup
- **Classes**: Use `extends` for inheritance

**3. Encapsulation:**

- **Factory Functions**: Use closures for private variables
- **Classes**: Use private fields (`#`) for private variables

**When to Use Factory Functions:**

**1. Flexible Object Creation:**

When you need to create different types of objects based on parameters, or when object creation logic is complex.

**2. Composition Over Inheritance:**

When you prefer composition over inheritance. Factory functions make composition natural.

**3. No `new` Required:**

When you want to avoid the `new` keyword and the complexity it can introduce.

**4. Private Variables:**

When you want to use closures for private variables (before private fields were available, or when you prefer closures).

**5. Functional Style:**

When you prefer a more functional programming style over object-oriented patterns.

**Advantages:**

**1. Flexibility:**

Factory functions can return different types of objects, use complex creation logic, and are more flexible than constructors.

**2. No `new` Confusion:**

No need to remember to use `new`, and no risk of forgetting it (which can cause bugs with constructors).

**3. Composition:**

Factory functions make composition natural, which is often preferred over inheritance.

**4. Encapsulation:**

Factory functions can use closures for private variables, providing encapsulation.

**System Design Consideration**: Factory functions are a powerful pattern:
1. **Flexibility**: Enable flexible object creation
2. **Composition**: Support composition over inheritance
3. **Functional Style**: Align with functional programming patterns
4. **Simplicity**: Avoid `new` keyword complexity

Factory functions provide a flexible alternative to constructors and classes. They're particularly useful when you need flexible object creation, prefer composition, or want to avoid the `new` keyword.

---

### Q4: Explain the revealing module pattern and how it differs from the standard module pattern. What are the advantages and trade-offs of each approach?

**Answer:**

**Revealing Module Pattern:**

The revealing module pattern is a variation of the module pattern where you define all functions and variables privately, then return an object that "reveals" only the functions you want to make public. The public API is created by mapping private functions to public property names.

**Standard Module Pattern:**

In the standard module pattern, you define private variables and functions, then return an object with public methods. Public methods are defined inline in the return statement.

**Key Differences:**

**1. Function Definition:**

- **Standard Module**: Public methods are defined in the return statement
- **Revealing Module**: All functions are defined privately, then referenced in the return statement

**2. Code Organization:**

- **Standard Module**: Public API is mixed with private implementation
- **Revealing Module**: Clear separation between private implementation and public API

**3. Readability:**

- **Standard Module**: Can be harder to see what's public vs. private
- **Revealing Module**: Public API is clearly visible at the bottom

**Advantages of Revealing Module:**

**1. Clear Public API:**

The return statement clearly shows what's public, making it easy to see the module's interface.

**2. Consistent Naming:**

Private and public functions can have the same name (private function, public alias), or different names for clarity.

**3. Easier Refactoring:**

Since all functions are defined the same way, it's easier to move functions between public and private.

**4. Better Readability:**

The structure is more readable—implementation at the top, public API at the bottom.

**Advantages of Standard Module:**

**1. Simplicity:**

Slightly simpler syntax—define public methods directly in the return statement.

**2. Less Code:**

Can be more concise for simple modules.

**3. Direct Definition:**

Public methods are defined where they're used (in the return statement).

**Trade-offs:**

**Revealing Module:**

**Pros:**
- Clear public API
- Better organization
- Easier to maintain

**Cons:**
- Slightly more verbose
- Functions defined twice (once privately, once in return)

**Standard Module:**

**Pros:**
- Simpler syntax
- Less code duplication
- Direct definition

**Cons:**
- Less clear separation
- Harder to see public API at a glance

**System Design Consideration**: Both patterns are valid:
1. **Code Organization**: Revealing module provides better organization
2. **Readability**: Revealing module is often more readable
3. **Maintainability**: Revealing module can be easier to maintain
4. **Simplicity**: Standard module is simpler for small modules

The revealing module pattern is often preferred for its clarity and organization, especially for larger modules. However, the standard module pattern is fine for smaller, simpler modules. The choice depends on your preferences and the complexity of your module.

---

### Q5: Explain how JavaScript patterns like IIFE, module pattern, and factory pattern relate to modern JavaScript features like ES6 modules and classes. When should you use traditional patterns vs. modern features?

**Answer:**

**Relationship to Modern Features:**

**1. Historical Evolution:**

Traditional patterns (IIFE, module pattern, factory pattern) were developed to solve problems that modern JavaScript features now solve natively. They represent the evolution of JavaScript's capabilities.

**2. Foundation for Modern Features:**

Modern features build on concepts from traditional patterns. ES6 modules provide what the module pattern achieved, but with native language support. Classes provide what constructor functions and factories achieved, but with better syntax.

**3. Still Relevant:**

Traditional patterns are still relevant for specific use cases, legacy code, and understanding how modern features work.

**When to Use Traditional Patterns:**

**1. Legacy Code:**

When working with legacy codebases that use traditional patterns. Maintaining consistency is important.

**2. Non-Module Environments:**

When you cannot use ES6 modules (older environments, specific build configurations, etc.).

**3. Specific Requirements:**

When traditional patterns provide specific behavior that modern features don't (like dynamic module creation with IIFE).

**4. Learning and Understanding:**

For understanding how JavaScript works and how modern features relate to older patterns.

**5. Polyfills and Shims:**

When creating polyfills or shims that need to work in older environments.

**When to Use Modern Features:**

**1. New Code:**

For all new code, prefer modern features (ES6 modules, classes, etc.) for better tooling, performance, and maintainability.

**2. Static Analysis:**

When you need static analysis benefits (tree shaking, better IDE support, etc.) that ES6 modules provide.

**3. Team Standards:**

When your team or project standards require modern JavaScript features.

**4. Performance:**

When you need the performance benefits and optimizations that modern features enable.

**5. Interoperability:**

When you need to work with modern tooling, bundlers, and frameworks that expect modern JavaScript.

**Migration Strategy:**

**1. Gradual Migration:**

You can gradually migrate from traditional patterns to modern features. Many patterns can coexist during migration.

**2. Compatibility:**

Use build tools (Babel, etc.) to transpile modern features for older environments if needed.

**3. Understanding:**

Understanding traditional patterns helps you understand modern features and when to use each.

**System Design Consideration**: Understanding both traditional and modern approaches is valuable:
1. **Legacy Code**: Essential for working with legacy codebases
2. **Understanding**: Helps understand how JavaScript evolved
3. **Flexibility**: Provides options for different scenarios
4. **Best Practices**: Modern features are preferred for new code, but traditional patterns have their place

Traditional patterns and modern features serve different purposes. Modern features are preferred for new code, but understanding traditional patterns is valuable for legacy code, specific use cases, and understanding JavaScript's evolution.

