# Prototypes & Prototype Chain: JavaScript Inheritance

Prototypes are the foundation of JavaScript's inheritance model. Understanding prototypes is essential for effective JavaScript development.

## What is a Prototype?

**Prototype** is an object that other objects inherit properties and methods from.

### Prototype Property

```javascript
// Every function has a prototype property
function Person(name) {
    this.name = name;
}

// Add method to prototype
Person.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

const person = new Person('John');
person.greet();  // "Hello, I'm John"
```

## Prototype Chain

**Prototype chain** is the mechanism by which objects inherit properties from their prototypes.

```javascript
// Prototype chain lookup
const obj = {};
obj.toString();  // "[object Object]"

// Lookup process:
// 1. Check obj for toString
// 2. Check obj.__proto__ (Object.prototype)
// 3. Found toString in Object.prototype
```

### Chain Example

```javascript
function Animal(name) {
    this.name = name;
}

Animal.prototype.eat = function() {
    return `${this.name} is eating`;
};

function Dog(name, breed) {
    Animal.call(this, name);  // Call parent constructor
    this.breed = breed;
}

// Set up prototype chain
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
    return `${this.name} is barking`;
};

const dog = new Dog('Buddy', 'Golden Retriever');

// Prototype chain:
// dog → Dog.prototype → Animal.prototype → Object.prototype → null

dog.bark();  // "Buddy is barking" (from Dog.prototype)
dog.eat();   // "Buddy is eating" (from Animal.prototype)
dog.toString();  // "[object Object]" (from Object.prototype)
```

## __proto__ vs prototype

### __proto__

```javascript
// __proto__: Points to object's prototype
const obj = {};
console.log(obj.__proto__ === Object.prototype);  // true

// __proto__ is deprecated, use Object.getPrototypeOf()
const proto = Object.getPrototypeOf(obj);
```

### prototype

```javascript
// prototype: Property of constructor functions
function Person() {}
console.log(Person.prototype);  // Person's prototype object

// Only functions have prototype property
const obj = {};
console.log(obj.prototype);  // undefined
```

## Object.create

**Object.create** creates objects with specified prototype.

```javascript
// Create object with prototype
const animal = {
    eat() {
        return 'eating';
    }
};

const dog = Object.create(animal);
dog.bark = function() {
    return 'barking';
};

dog.eat();   // "eating" (from prototype)
dog.bark();  // "barking" (own property)

// Prototype chain:
// dog → animal → Object.prototype → null
```

## Real-World Examples

### Example 1: Prototype Methods

```javascript
// Add methods to built-in prototypes (use with caution)
Array.prototype.last = function() {
    return this[this.length - 1];
};

[1, 2, 3].last();  // 3

// Better: Use utility functions
function last(array) {
    return array[array.length - 1];
}
```

### Example 2: Inheritance Pattern

```javascript
// Classical inheritance pattern
function Shape(x, y) {
    this.x = x;
    this.y = y;
}

Shape.prototype.move = function(dx, dy) {
    this.x += dx;
    this.y += dy;
};

function Circle(x, y, radius) {
    Shape.call(this, x, y);
    this.radius = radius;
}

Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.area = function() {
    return Math.PI * this.radius ** 2;
};

const circle = new Circle(0, 0, 5);
circle.move(10, 10);
circle.area();  // 78.54...
```

### Example 3: hasOwnProperty

```javascript
// hasOwnProperty: Check if property is own (not inherited)
const obj = {
    ownProp: 'value'
};

obj.hasOwnProperty('ownProp');      // true
obj.hasOwnProperty('toString');      // false (inherited)

// Safe check (Object.prototype might be null)
Object.prototype.hasOwnProperty.call(obj, 'ownProp');  // true
```

## Prototype Methods

### Object.getPrototypeOf

```javascript
// Get object's prototype
const proto = Object.getPrototypeOf(obj);
```

### Object.setPrototypeOf

```javascript
// Set object's prototype (slow, avoid if possible)
const obj = {};
const proto = { method() { return 'hello'; } };
Object.setPrototypeOf(obj, proto);
obj.method();  // "hello"
```

### Object.isPrototypeOf

```javascript
// Check if object is in prototype chain
Animal.prototype.isPrototypeOf(dog);  // true
```

## Best Practices

1. **Use Object.create**: For prototype-based inheritance
2. **Avoid __proto__**: Use Object.getPrototypeOf()
3. **Don't Modify Built-ins**: Avoid modifying Object.prototype
4. **Use hasOwnProperty**: Check own vs inherited properties
5. **Understand Chain**: Know how lookup works

## Summary

**Prototypes & Prototype Chain:**

1. **Prototype**: Object that others inherit from
2. **Chain**: Lookup mechanism through prototypes
3. **__proto__**: Points to prototype (deprecated)
4. **prototype**: Constructor function property
5. **Best Practice**: Use Object.create, understand chain

**Key Takeaway:**
Prototypes enable inheritance in JavaScript. Prototype chain allows property lookup through parent prototypes. Use Object.create for prototype-based inheritance. Understand __proto__ vs prototype. Use hasOwnProperty to check own properties. Avoid modifying built-in prototypes.

**Prototype Strategy:**
- Understand prototype chain
- Use Object.create
- Avoid __proto__
- Check own properties
- Don't modify built-ins

**Next Steps:**
- Learn [Classes vs Prototypal](classes_vs_prototypal_inheritance.md) for inheritance patterns
- Study [Objects](objects_property_descriptors.md) for object behavior
- Master [Functions](functions_bind_call_apply.md) for function methods

---

## 🎯 Interview Questions: JavaScript

### Q1: Explain what a "prototype" is in JavaScript. How does the prototype mechanism enable inheritance, and what is the relationship between objects and their prototypes?

**Answer:**

**Prototype Definition:**

A prototype is an object that serves as a template or blueprint for other objects. In JavaScript, every object has an internal link to another object called its prototype. When you access a property on an object, JavaScript first looks for that property on the object itself. If it's not found, JavaScript follows the prototype link to the prototype object and searches there. This process continues up the "prototype chain" until the property is found or the chain ends at `null`.

**How Prototypes Enable Inheritance:**

**1. Property Lookup:**

When you access a property on an object, JavaScript performs a lookup that traverses the prototype chain. If the property isn't found on the object itself, JavaScript looks in the prototype, then the prototype's prototype, and so on. This allows objects to "inherit" properties from their prototypes.

**2. Shared Properties:**

Properties defined on a prototype are shared by all objects that have that prototype. This is efficient because the property is stored once on the prototype, rather than being duplicated in each object. This is the basis of inheritance in JavaScript.

**3. Dynamic Inheritance:**

Because prototypes are objects, you can modify them at runtime. Adding a property to a prototype makes it immediately available to all objects that inherit from that prototype. This provides dynamic, flexible inheritance.

**4. Method Sharing:**

Methods are commonly defined on prototypes, allowing all instances to share the same method implementation. This is memory-efficient and allows for consistent behavior across instances.

**Relationship Between Objects and Prototypes:**

**1. `__proto__` Property:**

Every object has a `__proto__` property (though it's deprecated) that points to its prototype. This is the link that connects an object to its prototype in the prototype chain.

**2. Constructor Functions:**

When you create an object using a constructor function with `new`, the object's prototype is set to the constructor function's `prototype` property. This is how constructor functions establish inheritance.

**3. `Object.create()`:**

You can explicitly set an object's prototype using `Object.create()`, which creates a new object with a specified prototype. This is the modern, recommended way to create objects with specific prototypes.

**4. Default Prototype:**

All objects ultimately inherit from `Object.prototype` (unless created with `Object.create(null)`), which provides methods like `toString()`, `valueOf()`, `hasOwnProperty()`, etc.

**System Design Consideration**: Prototypes are the foundation of JavaScript's inheritance model. Understanding prototypes is essential for:
1. **Inheritance**: Understanding how objects inherit properties and methods
2. **Memory Efficiency**: Knowing how shared properties work
3. **Dynamic Behavior**: Understanding how prototype modifications affect all instances
4. **Class Understanding**: Understanding that ES6 classes are syntactic sugar over prototypes

Prototypes provide a flexible, dynamic inheritance mechanism that's different from class-based inheritance in languages like Java or C++. This prototype-based inheritance is one of JavaScript's defining characteristics and enables powerful patterns like mixins, object composition, and dynamic method addition.

---

### Q2: Explain how the "prototype chain" works in JavaScript. What is the lookup mechanism, and how does JavaScript traverse the chain to find properties?

**Answer:**

**Prototype Chain Definition:**

The prototype chain is a linked list of prototype objects that JavaScript traverses when looking up properties. Each object has a link to its prototype, which has a link to its prototype, and so on, forming a chain that ends at `null`. When you access a property, JavaScript follows this chain until it finds the property or reaches the end.

**Lookup Mechanism:**

**1. Own Property Check:**

When you access a property (like `obj.property`), JavaScript first checks if the property exists directly on the object itself (an "own" property). This is the fastest check and happens first.

**2. Prototype Traversal:**

If the property isn't found on the object itself, JavaScript follows the `__proto__` link to the object's prototype and searches there. If still not found, it continues to the prototype's prototype, and so on.

**3. Chain Termination:**

The chain continues until either:
- The property is found (and its value is returned)
- The chain reaches `null` (which means the property doesn't exist, and `undefined` is returned)

**4. Method Resolution:**

For methods, the same lookup process applies. When you call a method, JavaScript finds it in the prototype chain, and the method executes with `this` bound to the original object (not the prototype where the method was found).

**Traversal Details:**

**1. First Match Wins:**

The first property found in the chain is used. If an object has its own property with the same name as a property in the prototype, the own property takes precedence (it "shadows" the prototype property).

**2. Write Operations:**

When you write to a property (`obj.property = value`), JavaScript always writes to the object itself, never to the prototype. This creates an own property that shadows the prototype property. This is important for understanding how property assignment works.

**3. Performance:**

Property lookup can be expensive if the chain is long or if properties are frequently accessed. JavaScript engines optimize this through various techniques, but understanding the lookup mechanism helps write efficient code.

**4. `hasOwnProperty()`:**

The `hasOwnProperty()` method checks if a property exists on the object itself, not in the prototype chain. This is useful for distinguishing own properties from inherited properties.

**System Design Consideration**: Understanding the prototype chain is crucial for:
1. **Property Access**: Knowing where properties come from and how they're resolved
2. **Performance**: Understanding lookup costs and optimization opportunities
3. **Shadowing**: Understanding how own properties shadow prototype properties
4. **Debugging**: Understanding why properties might not be found or might have unexpected values

The prototype chain is JavaScript's mechanism for inheritance and property lookup. It's a simple but powerful concept that enables objects to share properties and methods while maintaining the ability to override them at any level in the chain.

---

### Q3: Explain the difference between `__proto__` and `prototype` in JavaScript. When would you use each, and why is `__proto__` considered deprecated?

**Answer:**

**`prototype` Property:**

The `prototype` property is a property of constructor functions (and classes). It's an object that becomes the prototype of instances created with that constructor. When you create an object using `new Constructor()`, the new object's `__proto__` is set to `Constructor.prototype`. The `prototype` property is where you define methods and properties that should be shared by all instances.

**`__proto__` Property:**

The `__proto__` property is a property of object instances (not constructor functions). It points to the object's prototype—the object from which it inherits properties. `__proto__` is the link in the prototype chain that connects an object to its prototype.

**Key Differences:**

**1. Where They Exist:**

- `prototype`: Exists on constructor functions (and classes)
- `__proto__`: Exists on object instances

**2. Purpose:**

- `prototype`: Defines what will be the prototype of instances created with the constructor
- `__proto__`: Points to the actual prototype of an instance

**3. Relationship:**

When you create an object with `new Constructor()`, the relationship is: `instance.__proto__ === Constructor.prototype`. The instance's `__proto__` points to the constructor's `prototype`.

**Why `__proto__` is Deprecated:**

**1. Standardization Issues:**

`__proto__` was not part of the original ECMAScript specification. It was a de facto standard implemented by browsers but not officially part of the language until ES2015, where it was standardized but marked as deprecated.

**2. Performance:**

Directly accessing and modifying `__proto__` can have performance implications. JavaScript engines optimize prototype access, and direct modification can break these optimizations.

**3. Security:**

Allowing direct modification of `__proto__` can be a security concern, as it can be used to modify the prototype chain in unexpected ways.

**4. Better Alternatives:**

Modern JavaScript provides better alternatives: `Object.getPrototypeOf()` to read the prototype and `Object.setPrototypeOf()` or `Object.create()` to set it. These methods are more explicit and safer.

**When to Use Each:**

**`prototype` (Constructor Functions):**

Use `prototype` when defining methods and properties that should be shared by all instances of a constructor. This is the standard way to add methods to constructor functions.

**`__proto__` (Avoid):**

Avoid using `__proto__` directly. Instead, use:
- `Object.getPrototypeOf(obj)` to read the prototype
- `Object.setPrototypeOf(obj, proto)` to set the prototype (though this is also slow and should be avoided when possible)
- `Object.create(proto)` to create objects with a specific prototype

**System Design Consideration**: Understanding the difference between `prototype` and `__proto__` is important for:
1. **Constructor Functions**: Knowing how to add methods to constructors
2. **Instance Behavior**: Understanding how instances inherit from constructors
3. **Best Practices**: Using modern methods instead of deprecated `__proto__`
4. **Prototype Chain**: Understanding how the chain is established

The relationship between `prototype` and `__proto__` is fundamental to understanding JavaScript's inheritance model. While `__proto__` works, modern best practices favor using `Object.getPrototypeOf()` and `Object.create()` for better code quality and performance.

---

### Q4: Explain how `Object.create()` works and how it differs from constructor functions for creating objects with prototypes. When would you choose one approach over the other?

**Answer:**

**How `Object.create()` Works:**

`Object.create(proto)` creates a new object with a specified prototype. It takes a prototype object as an argument and returns a new object whose `__proto__` points to that prototype. You can also pass a second argument with property descriptors to define properties on the new object.

**Difference from Constructor Functions:**

**1. Prototype Setting:**

- **`Object.create()`**: Explicitly sets the prototype when creating the object
- **Constructor Functions**: Set the prototype through the constructor's `prototype` property, which happens automatically with `new`

**2. Initialization:**

- **`Object.create()`**: Doesn't automatically call any initialization function—you must manually set properties
- **Constructor Functions**: Automatically call the constructor function, which can initialize the object

**3. Syntax:**

- **`Object.create()`**: `const obj = Object.create(proto)`
- **Constructor Functions**: `const obj = new Constructor()`

**4. Flexibility:**

- **`Object.create()`**: More flexible—can create objects with any prototype, including `null` for objects with no prototype
- **Constructor Functions**: Less flexible—prototype is tied to the constructor function

**When to Use `Object.create()`:**

**1. Prototype-Based Inheritance:**

When you want to create objects that inherit from a specific prototype without using constructor functions. This is useful for prototype-based inheritance patterns.

**2. Null Prototype:**

When you want to create objects with no prototype (`Object.create(null)`), which is useful for creating pure dictionaries or maps without inheriting from `Object.prototype`.

**3. Dynamic Prototypes:**

When the prototype needs to be determined at runtime or when you want more control over the prototype chain.

**4. Avoiding Constructors:**

When you want to avoid the complexity of constructor functions and prefer a more functional approach to object creation.

**When to Use Constructor Functions:**

**1. Initialization Logic:**

When you need initialization logic that runs when the object is created. Constructor functions provide a natural place for this.

**2. Instance Identity:**

When you want instances to have a clear "type" or identity (checked with `instanceof`). Constructor functions provide this through the constructor property.

**3. Familiar Pattern:**

When working in codebases that use constructor functions or when the pattern is more familiar to the team.

**4. ES6 Classes:**

When using ES6 classes (which are syntactic sugar over constructor functions), the class syntax is cleaner and more familiar.

**System Design Consideration**: The choice between `Object.create()` and constructor functions depends on your needs:
1. **Flexibility**: `Object.create()` is more flexible for prototype manipulation
2. **Initialization**: Constructor functions provide automatic initialization
3. **Pattern Preference**: Constructor functions are more common, but `Object.create()` is more functional
4. **Use Case**: Choose based on whether you need initialization, type checking, or just prototype inheritance

Both approaches have their place. `Object.create()` is powerful for prototype-based patterns and creating objects with specific prototypes, while constructor functions (and classes) are better for traditional object-oriented patterns with initialization and type identity.

---

### Q5: Explain how property shadowing works in the prototype chain. What happens when you assign a value to a property that exists in the prototype, and how does this differ from reading that property?

**Answer:**

**Property Shadowing Definition:**

Property shadowing occurs when an object has its own property with the same name as a property in its prototype chain. The own property "shadows" (hides) the prototype property, so when you access the property, you get the own property's value, not the prototype's value.

**Reading Properties:**

When you read a property, JavaScript traverses the prototype chain and returns the first property it finds. If the object has its own property, that's returned. If not, JavaScript continues up the chain until it finds the property or reaches `null`. This means reading a property can access either an own property or a prototype property.

**Writing Properties (Assignment):**

When you assign a value to a property (`obj.property = value`), JavaScript **always** writes to the object itself, never to the prototype. This is a crucial difference from reading. Even if the property exists in the prototype, assignment creates (or modifies) an own property on the object, which then shadows the prototype property.

**Why Assignment Works This Way:**

**1. Safety:**

Writing to the prototype would affect all objects that inherit from it, which could cause unexpected side effects. By always writing to the object itself, JavaScript ensures that modifications are isolated to that specific object.

**2. Independence:**

Each object can have its own value for a property, even if it inherits a default value from the prototype. This allows objects to customize their behavior independently.

**3. Predictability:**

The behavior is predictable—assignment always modifies the object you're assigning to, not some object up the prototype chain.

**Implications:**

**1. Overriding Defaults:**

You can override default values from prototypes by assigning to the property, creating an own property that shadows the prototype property.

**2. Method Overriding:**

You can override methods from prototypes by assigning a new function to the property. However, this only affects that specific object, not the prototype or other instances.

**3. Prototype Modification:**

If you want to modify a property for all instances, you must modify the prototype itself, not individual instances. Modifying an instance only affects that instance.

**4. Checking Own Properties:**

The `hasOwnProperty()` method can distinguish between own properties and inherited properties, which is useful when you need to know if a property is shadowing a prototype property.

**System Design Consideration**: Understanding property shadowing is important for:
1. **Property Access**: Knowing whether you're accessing own or inherited properties
2. **Modification Behavior**: Understanding that assignment always creates own properties
3. **Inheritance Patterns**: Understanding how to override inherited properties
4. **Debugging**: Understanding why properties might have different values than expected

Property shadowing is a fundamental aspect of JavaScript's prototype-based inheritance. It allows objects to customize inherited behavior while maintaining the ability to share default values through prototypes. The key insight is that reading and writing behave differently—reading traverses the chain, while writing always creates own properties.

