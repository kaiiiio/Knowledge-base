# Classes vs Prototypal Inheritance: extends and super

JavaScript supports both class syntax (syntactic sugar) and prototypal inheritance. Understanding both is crucial.

## Prototypal Inheritance

**Prototypal inheritance** uses prototypes for inheritance.

### Basic Prototypal Pattern

```javascript
// Parent constructor
function Animal(name) {
    this.name = name;
}

Animal.prototype.eat = function() {
    return `${this.name} is eating`;
};

// Child constructor
function Dog(name, breed) {
    Animal.call(this, name);  // Call parent
    this.breed = breed;
}

// Set up prototype chain
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
    return `${this.name} is barking`;
};

const dog = new Dog('Buddy', 'Golden');
dog.eat();   // "Buddy is eating"
dog.bark();  // "Buddy is barking"
```

## Class Syntax

**Classes** are syntactic sugar over prototypal inheritance.

### Basic Class

```javascript
// Class declaration
class Animal {
    constructor(name) {
        this.name = name;
    }
    
    eat() {
        return `${this.name} is eating`;
    }
}

// Class expression
const Animal = class {
    constructor(name) {
        this.name = name;
    }
};
```

### Class Inheritance

```javascript
// Parent class
class Animal {
    constructor(name) {
        this.name = name;
    }
    
    eat() {
        return `${this.name} is eating`;
    }
}

// Child class with extends
class Dog extends Animal {
    constructor(name, breed) {
        super(name);  // Call parent constructor
        this.breed = breed;
    }
    
    bark() {
        return `${this.name} is barking`;
    }
}

const dog = new Dog('Buddy', 'Golden');
dog.eat();   // "Buddy is eating"
dog.bark();  // "Buddy is barking"
```

## extends Keyword

**extends** sets up prototype chain for inheritance.

```javascript
class Child extends Parent {
    // Child inherits from Parent
}

// Equivalent to:
// Child.prototype = Object.create(Parent.prototype);
// Child.prototype.constructor = Child;
```

## super Keyword

**super** refers to parent class.

### super in Constructor

```javascript
class Child extends Parent {
    constructor(value) {
        super(value);  // Call parent constructor
        this.childProp = value;
    }
}
```

### super in Methods

```javascript
class Child extends Parent {
    method() {
        super.method();  // Call parent method
        // Additional logic
    }
    
    override() {
        return super.override() + ' and more';  // Use parent return value
    }
}
```

## Real-World Examples

### Example 1: Method Overriding

```javascript
class Shape {
    area() {
        throw new Error('Must implement area');
    }
}

class Circle extends Shape {
    constructor(radius) {
        super();
        this.radius = radius;
    }
    
    area() {
        return Math.PI * this.radius ** 2;
    }
}

class Rectangle extends Shape {
    constructor(width, height) {
        super();
        this.width = width;
        this.height = height;
    }
    
    area() {
        return this.width * this.height;
    }
}
```

### Example 2: Static Methods

```javascript
class Parent {
    static staticMethod() {
        return 'Parent static';
    }
    
    instanceMethod() {
        return 'Parent instance';
    }
}

class Child extends Parent {
    static staticMethod() {
        return super.staticMethod() + ' - Child static';
    }
    
    instanceMethod() {
        return super.instanceMethod() + ' - Child instance';
    }
}

Parent.staticMethod();  // "Parent static"
Child.staticMethod();   // "Parent static - Child static"

const child = new Child();
child.instanceMethod();  // "Parent instance - Child instance"
```

### Example 3: Private Fields

```javascript
class BankAccount {
    #balance = 0;  // Private field
    
    deposit(amount) {
        this.#balance += amount;
    }
    
    withdraw(amount) {
        if (amount <= this.#balance) {
            this.#balance -= amount;
        }
    }
    
    getBalance() {
        return this.#balance;
    }
}

class SavingsAccount extends BankAccount {
    #interestRate = 0.05;
    
    addInterest() {
        const balance = this.getBalance();
        this.deposit(balance * this.#interestRate);
    }
}
```

## Class vs Prototypal Comparison

### Prototypal

```javascript
// More flexible
// Direct prototype manipulation
// No hoisting
// Can modify after creation

function Animal(name) {
    this.name = name;
}

Animal.prototype.eat = function() {
    return 'eating';
};

// Can add methods dynamically
Animal.prototype.sleep = function() {
    return 'sleeping';
};
```

### Class

```javascript
// Syntactic sugar
// Cleaner syntax
// Hoisted (but TDZ)
// More structured

class Animal {
    constructor(name) {
        this.name = name;
    }
    
    eat() {
        return 'eating';
    }
}

// Can also add methods dynamically
Animal.prototype.sleep = function() {
    return 'sleeping';
};
```

## Best Practices

1. **Use Classes**: For cleaner syntax and structure
2. **Understand Prototypes**: Know what classes compile to
3. **Use super**: For parent access
4. **Private Fields**: Use # for encapsulation
5. **Static Methods**: Use for utility methods

## Summary

**Classes vs Prototypal Inheritance:**

1. **Prototypal**: Direct prototype manipulation, flexible
2. **Classes**: Syntactic sugar, cleaner syntax
3. **extends**: Sets up prototype chain
4. **super**: Access parent class
5. **Best Practice**: Use classes, understand prototypes

**Key Takeaway:**
Classes are syntactic sugar over prototypal inheritance. extends sets up prototype chain. super accesses parent class. Use classes for cleaner syntax. Understand that classes compile to prototypes. Use private fields (#) for encapsulation.

**Inheritance Strategy:**
- Use classes for structure
- Understand prototype chain
- Use super appropriately
- Private fields for encapsulation
- Static methods for utilities

**Next Steps:**
- Learn [Prototypes](prototypes_prototype_chain.md) for deep dive
- Study [Functions](functions_bind_call_apply.md) for function methods
- Master [Objects](objects_property_descriptors.md) for object behavior

---

## 🎯 Interview Questions: JavaScript

### Q1: Explain how ES6 classes relate to prototypal inheritance in JavaScript. Are classes truly a new inheritance mechanism, or are they syntactic sugar over prototypes?

**Answer:**

**Classes as Syntactic Sugar:**

ES6 classes are syntactic sugar over JavaScript's existing prototypal inheritance mechanism. They don't introduce a new inheritance model—they provide a cleaner, more familiar syntax for creating constructor functions and setting up prototype chains. Under the hood, classes are converted to constructor functions and prototype assignments.

**How Classes Map to Prototypes:**

**1. Class Declaration → Constructor Function:**

A class declaration like `class MyClass {}` is essentially equivalent to a constructor function `function MyClass() {}`. The class body becomes the constructor function body.

**2. Methods → Prototype Properties:**

Methods defined in a class (like `myMethod() {}`) are added to the class's `prototype` property, just like `MyClass.prototype.myMethod = function() {}` in the old syntax.

**3. `extends` → Prototype Chain:**

The `extends` keyword sets up the prototype chain using `Object.setPrototypeOf()` or similar mechanisms. `class Child extends Parent` sets `Child.prototype`'s prototype to `Parent.prototype`, establishing inheritance.

**4. `super` → Parent Access:**

The `super` keyword provides access to the parent class's constructor and methods. It's essentially accessing properties and methods from the parent's prototype.

**5. Static Methods → Constructor Properties:**

Static methods in classes are added as properties of the constructor function itself, not the prototype. This is equivalent to `MyClass.staticMethod = function() {}`.

**What Classes Don't Change:**

**1. Prototype-Based Inheritance:**

Classes still use prototype-based inheritance. Objects created with classes still have prototypes, and property lookup still traverses the prototype chain.

**2. Dynamic Nature:**

While classes provide more structure, JavaScript's dynamic nature remains. You can still modify prototypes at runtime, add methods dynamically, and use all the prototype-based features.

**3. No True Classes:**

JavaScript doesn't have "true" classes like Java or C++. There's no class-based inheritance model—it's all prototypes under the hood.

**Advantages of Classes:**

**1. Cleaner Syntax:**

Classes provide a more familiar, cleaner syntax that's easier to read and write, especially for developers coming from class-based languages.

**2. Better Tooling:**

Classes provide better support for tooling, IDEs, and static analysis, as the structure is more explicit and predictable.

**3. Built-in Features:**

Classes provide built-in support for inheritance (`extends`), parent access (`super`), and static methods, which require manual setup with constructor functions.

**4. Hoisting Behavior:**

Classes have different hoisting behavior (they're in the Temporal Dead Zone), which can prevent some bugs related to using classes before they're defined.

**System Design Consideration**: Understanding that classes are syntactic sugar is important for:
1. **Deep Understanding**: Knowing how classes actually work under the hood
2. **Debugging**: Understanding prototype chains when debugging class-based code
3. **Flexibility**: Knowing that you can still use prototype features even with classes
4. **Migration**: Understanding how to convert between class and constructor function syntax

Classes make JavaScript more accessible and provide a cleaner syntax, but they don't change the fundamental prototype-based nature of JavaScript inheritance. This understanding is crucial for advanced JavaScript development and for understanding how JavaScript actually works.

---

### Q2: Explain how the `super` keyword works in ES6 classes. How does it provide access to parent class methods and constructors, and what are the rules for using `super`?

**Answer:**

**`super` Definition:**

The `super` keyword provides access to the parent class's constructor, methods, and properties. It's used in derived classes (classes that extend another class) to call parent constructors and access parent methods. `super` essentially provides a way to access the parent's prototype and constructor.

**Using `super` in Constructors:**

**1. Calling Parent Constructor:**

In a derived class constructor, `super()` must be called before accessing `this`. This calls the parent class's constructor, which initializes the parent's part of the object. `super()` must be called exactly once in a constructor, and it must be called before `this` is used.

**2. Passing Arguments:**

You can pass arguments to `super()` to initialize the parent class with specific values. The arguments are passed to the parent constructor.

**3. Required in Derived Classes:**

If a class extends another class, its constructor must call `super()` (unless it returns an object, which is rare). This is a requirement of the class syntax.

**Using `super` for Methods:**

**1. Calling Parent Methods:**

You can use `super.methodName()` to call a method from the parent class. This is useful for method overriding, where you want to extend or modify parent behavior while still using the parent's implementation.

**2. Method Overriding:**

When you override a method in a derived class, you can call the parent's version using `super.methodName()`, then add additional logic. This allows you to extend functionality rather than completely replace it.

**3. `this` Binding:**

When you call `super.methodName()`, the method executes with `this` bound to the current instance (the derived class instance), not the parent class. This is important for understanding how `super` works.

**Rules and Restrictions:**

**1. Only in Derived Classes:**

`super` can only be used in classes that extend another class. It cannot be used in base classes or outside of class context.

**2. Constructor Requirement:**

In a derived class constructor, `super()` must be called before `this` is used. This ensures the parent is initialized before the child.

**3. Static Methods:**

In static methods, `super` refers to the parent class itself (the constructor), not an instance. You can use `super.staticMethod()` to call parent static methods.

**4. Arrow Functions:**

Arrow functions don't have their own `this`, so they cannot use `super` (which relies on `this` context). Regular methods must be used when you need `super`.

**How `super` Works Internally:**

`super` is essentially syntactic sugar for accessing the parent's prototype. When you call `super.method()`, JavaScript:
1. Looks up the method on the parent's prototype
2. Calls it with `this` bound to the current instance
3. Returns the result

This is similar to `Parent.prototype.method.call(this)`, but `super` provides a cleaner, more intuitive syntax.

**System Design Consideration**: Understanding `super` is important for:
1. **Inheritance Patterns**: Properly extending parent classes and reusing parent functionality
2. **Method Overriding**: Extending parent methods while maintaining parent behavior
3. **Constructor Chaining**: Properly initializing parent classes in derived classes
4. **Code Organization**: Creating clean inheritance hierarchies

The `super` keyword is a key feature of ES6 classes that makes inheritance more intuitive and provides a clean way to access and extend parent class functionality. Understanding how it works and its rules is essential for effective use of class inheritance in JavaScript.

---

### Q3: Explain the difference between instance methods, static methods, and private fields in ES6 classes. How does each work, and when would you use each?

**Answer:**

**Instance Methods:**

Instance methods are methods defined in a class that are available on instances of the class. They're added to the class's `prototype` property, so all instances share the same method implementation. Instance methods have access to `this`, which refers to the instance, and can access instance properties and other instance methods.

**Static Methods:**

Static methods are methods defined with the `static` keyword that belong to the class itself, not to instances. They're added as properties of the constructor function, not the prototype. Static methods are called on the class itself (e.g., `MyClass.staticMethod()`), not on instances. They don't have access to `this` referring to an instance, but they can access `this` referring to the class (constructor) itself.

**Private Fields:**

Private fields are properties defined with a `#` prefix that are only accessible within the class definition. They cannot be accessed from outside the class, providing true encapsulation. Private fields are instance-specific (each instance has its own private fields) and are not accessible through the prototype chain.

**How Each Works:**

**1. Instance Methods:**

- Defined in class body without `static` keyword
- Added to `Class.prototype`
- Called on instances: `instance.method()`
- Have access to instance via `this`
- Shared by all instances (memory efficient)

**2. Static Methods:**

- Defined with `static` keyword
- Added to constructor function: `Class.staticMethod`
- Called on class: `Class.staticMethod()`
- No access to instance `this` (but can access class via `this`)
- Useful for utility functions related to the class

**3. Private Fields:**

- Defined with `#` prefix: `#privateField`
- Only accessible within class body
- Each instance has its own private fields
- Cannot be accessed from outside or through inheritance
- Provide true data privacy

**When to Use Each:**

**Instance Methods:**

- When the method needs to operate on instance data
- When the method needs access to `this` (the instance)
- For methods that are part of the object's behavior
- Most common type of method in classes

**Static Methods:**

- For utility functions related to the class but not specific to instances
- For factory methods that create instances
- For methods that don't need instance data
- For methods that operate on the class itself or provide class-level functionality

**Private Fields:**

- For internal state that shouldn't be accessible from outside
- For implementation details that should be hidden
- For data that needs to be protected from external modification
- For true encapsulation and data privacy

**System Design Consideration**: Understanding these different types of members is important for:
1. **API Design**: Choosing the right visibility and scope for class members
2. **Encapsulation**: Using private fields to hide implementation details
3. **Code Organization**: Using static methods for class-level functionality
4. **Memory Efficiency**: Understanding how methods are shared vs. instance-specific

Each type of member serves a different purpose. Instance methods provide object behavior, static methods provide class-level functionality, and private fields provide encapsulation. Using them appropriately creates well-designed, maintainable classes with clear APIs and proper encapsulation.

---

### Q4: Explain how class inheritance works in JavaScript, including how `extends` sets up the prototype chain. How does this differ from prototypal inheritance without classes?

**Answer:**

**How `extends` Works:**

When you use `class Child extends Parent`, JavaScript sets up the prototype chain to establish inheritance. Specifically:
1. `Child.prototype`'s prototype is set to `Parent.prototype`
2. `Child`'s prototype (the constructor itself) is set to `Parent`
3. This creates a chain: `childInstance` → `Child.prototype` → `Parent.prototype` → `Object.prototype` → `null`

**Prototype Chain Setup:**

**1. Instance to Child Prototype:**

When you create an instance with `new Child()`, the instance's `__proto__` points to `Child.prototype`. This is the same as with constructor functions.

**2. Child Prototype to Parent Prototype:**

`Child.prototype`'s `__proto__` points to `Parent.prototype`. This is what `extends` establishes—the link between child and parent prototypes.

**3. Constructor Chain:**

The `Child` constructor function's `__proto__` points to `Parent`. This allows static methods and properties to be inherited at the constructor level.

**Difference from Prototypal Inheritance Without Classes:**

**1. Manual Setup:**

Without classes, you must manually set up the prototype chain:
- `Child.prototype = Object.create(Parent.prototype)`
- `Child.prototype.constructor = Child`
- Manually call parent constructor in child constructor

**2. `super` Keyword:**

Classes provide the `super` keyword for accessing parent constructors and methods. Without classes, you must use `Parent.prototype.method.call(this)` or similar patterns.

**3. Syntax:**

Classes provide cleaner, more familiar syntax. Prototypal inheritance without classes requires more verbose constructor function syntax.

**4. Built-in Features:**

Classes provide built-in support for inheritance, static methods, and private fields. These require manual setup with prototypal inheritance.

**5. Hoisting:**

Classes have different hoisting behavior (Temporal Dead Zone), while constructor functions are hoisted. This can affect when code can be used.

**What's the Same:**

**1. Prototype-Based:**

Both approaches use prototype-based inheritance. Classes don't change the fundamental mechanism—they just provide better syntax.

**2. Property Lookup:**

Property lookup works the same way in both—JavaScript traverses the prototype chain until it finds the property or reaches `null`.

**3. Dynamic Nature:**

Both approaches allow dynamic modification of prototypes, adding methods at runtime, and all the flexibility of JavaScript's prototype system.

**System Design Consideration**: Understanding how `extends` works is important for:
1. **Inheritance Understanding**: Knowing how the prototype chain is established
2. **Debugging**: Understanding prototype chains when debugging class-based code
3. **Migration**: Converting between class and prototypal syntax
4. **Advanced Patterns**: Using prototype features even with classes

The `extends` keyword provides a clean way to set up inheritance, but it's still prototype-based inheritance under the hood. Understanding this helps you use classes effectively while still leveraging JavaScript's dynamic prototype system when needed.

---

### Q5: Explain the relationship between classes and constructor functions in JavaScript. Can you mix classes and constructor functions, and what are the implications of doing so?

**Answer:**

**Classes as Constructor Functions:**

Classes are essentially constructor functions with additional features. When you define a class, JavaScript creates a constructor function. You can use classes with `new` just like constructor functions, and they behave similarly in many ways.

**Similarities:**

**1. Both Create Objects:**

Both classes and constructor functions are used with `new` to create objects. The syntax is the same: `new MyClass()` or `new MyConstructor()`.

**2. Both Have Prototypes:**

Both classes and constructor functions have `prototype` properties. Methods defined in classes are added to the prototype, just like with constructor functions.

**3. Both Can Be Called:**

Both can be called as functions (though classes throw an error if called without `new` in strict mode, while constructor functions can be called without `new`).

**Differences:**

**1. Hoisting:**

Constructor functions are hoisted—you can call them before they're defined. Classes are not hoisted in the same way—they're in the Temporal Dead Zone, so you must define them before use.

**2. Strict Mode:**

Class bodies are always in strict mode, even if the surrounding code isn't. Constructor functions follow the strict mode of the surrounding code.

**3. Cannot Call Without `new`:**

Classes cannot be called as regular functions (without `new`)—they throw a `TypeError`. Constructor functions can be called without `new` (though this is generally not recommended).

**4. Methods Are Non-Enumerable:**

Methods defined in classes are non-enumerable by default. Methods added to constructor function prototypes are enumerable unless explicitly made non-enumerable.

**Mixing Classes and Constructor Functions:**

**1. Inheritance:**

You can have a class extend a constructor function, or a constructor function can be used where a class is expected. Since classes are constructor functions, they're compatible in many contexts.

**2. Prototype Manipulation:**

You can still manipulate prototypes when using classes. You can add methods to `Class.prototype` just like with constructor functions, though this is generally not recommended with classes.

**3. `instanceof`:**

Both classes and constructor functions work with `instanceof`. An instance of a class is an `instanceof` that class, just like with constructor functions.

**4. Compatibility:**

Classes are designed to be compatible with existing constructor function code. You can gradually migrate from constructor functions to classes without breaking changes.

**Implications of Mixing:**

**1. Consistency:**

Mixing classes and constructor functions can lead to inconsistent code style. It's generally better to choose one approach and stick with it.

**2. Understanding:**

Developers need to understand both approaches if they're mixed, which can increase cognitive load.

**3. Tooling:**

Some tools and linters may have different rules or support for classes vs. constructor functions, which could cause issues when mixing.

**4. Best Practice:**

Modern JavaScript best practices favor classes for new code, but constructor functions are still valid and widely used. The choice often depends on team preferences and project requirements.

**System Design Consideration**: Understanding the relationship between classes and constructor functions is important for:
1. **Migration**: Converting between class and constructor function syntax
2. **Compatibility**: Understanding how they work together
3. **Best Practices**: Choosing the right approach for your codebase
4. **Deep Understanding**: Knowing that classes are constructor functions under the hood

Classes and constructor functions are closely related—classes are essentially improved constructor functions with better syntax and built-in features. Understanding this relationship helps you use both effectively and migrate between them when needed.

