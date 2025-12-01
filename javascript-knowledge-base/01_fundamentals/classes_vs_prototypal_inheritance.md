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

