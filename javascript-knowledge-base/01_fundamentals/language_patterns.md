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

