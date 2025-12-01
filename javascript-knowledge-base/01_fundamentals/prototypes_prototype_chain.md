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

