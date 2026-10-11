# Variables, Data Types & Operators

Simple words, step by step.

## What is a variable?
A variable is a **named box** that holds a value. You give the box a name, and you can put a value inside it, and change that value later.

```cpp
int age = 20;     // a box named "age", holding the whole number 20
```
```python
age = 20   # a box named "age" -- Python does not ask what TYPE it is, it just stores 20
```
```javascript
let age = 20;   // a box named "age" -- "let" means this box's value CAN change later
```
In plain words: "make a box called `age`, and put `20` inside it."

## What is a data type?
A data type tells the computer **what kind of value** is going inside the box, and **how much memory** to set aside for it.

| Data Type | Holds | Example | Typical size |
|---|---|---|---|
| `int` | Whole numbers | `5`, `-100`, `0` | 4 bytes |
| `float` | Decimal numbers (less precise) | `3.14` | 4 bytes |
| `double` | Decimal numbers (more precise) | `3.14159265` | 8 bytes |
| `char` | One single character | `'A'`, `'z'` | 1 byte |
| `bool` | True or False only | `true`, `false` | 1 byte |
| `string` | A piece of text | `"Hello"` | Varies |

**Rule to remember**: you must pick the right data type for the job. Putting a decimal number like `3.7` into an `int` box will simply **cut off** the decimal part (it becomes `3`), silently, with no warning. This is a very common beginner bug.

## What is an operator?
An operator does an action between two values.

### Arithmetic operators (math)
```cpp
int a = 10, b = 3;
a + b;   // 13  (add)
a - b;   // 7   (subtract)
a * b;   // 30  (multiply)
a / b;   // 3   (divide) -- careful! see below
a % b;   // 1   (modulo -- the remainder left over after dividing)
```
```python
a, b = 10, 3
print(a + b)   # 13  (add)
print(a - b)   # 7   (subtract)
print(a * b)   # 30  (multiply)
print(a / b)   # 3.333...  (Python 3 division ALWAYS gives a decimal answer)
print(a // b)  # 3   (floor division -- this is Python's version of C++'s "/")
print(a % b)   # 1   (modulo -- the remainder)
```
```javascript
let a = 10, b = 3;
console.log(a + b);              // 13  (add)
console.log(a - b);              // 7   (subtract)
console.log(a * b);              // 30  (multiply)
console.log(a / b);              // 3.333...  (JS division always gives a decimal answer too)
console.log(Math.floor(a / b));  // 3   (JS has no built-in "//" -- you must floor it manually)
console.log(a % b);              // 1   (modulo -- the remainder)
```
**The trap every beginner falls into**: `10 / 3` in C++ gives `3`, not `3.333...`, because both `10` and `3` are `int` boxes — dividing two whole numbers gives a whole number answer, throwing away anything after the decimal point. To get `3.333...`, at least one of the numbers must be a `float` or `double`. **Python 3 and JavaScript do NOT have this trap** — plain `/` always gives a decimal answer in both; if you specifically want the "throw away the decimal" behavior, Python has a dedicated `//` operator for it, while JavaScript has no such operator and needs `Math.floor(a / b)` instead.

### Comparison operators (asking yes/no questions)
```cpp
a == b;   // is a equal to b?
a != b;   // is a NOT equal to b?
a > b;    // is a bigger than b?
a < b;    // is a smaller than b?
a >= b;   // is a bigger than or equal to b?
a <= b;   // is a smaller than or equal to b?
```
```python
a == b   # is a equal to b?
a != b   # is a NOT equal to b?
a > b    # is a bigger than b?
a < b    # is a smaller than b?
a >= b   # is a bigger than or equal to b?
a <= b   # is a smaller than or equal to b?
```
```javascript
a === b;   // is a equal to b? ("===" checks value AND type -- the safe choice)
a !== b;   // is a NOT equal to b?
a > b;     // is a bigger than b?
a < b;     // is a smaller than b?
a >= b;    // is a bigger than or equal to b?
a <= b;    // is a smaller than or equal to b?
```
**Common mistake**: using a single `=` (which means "put this value in the box") when you meant `==` (which means "are these two things equal?"). `if (a = 5)` does NOT ask a question — it puts 5 into `a` and always treats that as true. This is a real, famous bug that has broken real production code.

**A JavaScript-only trap to know**: JavaScript actually has TWO equality operators — `==` and `===`. Plain `==` tries to convert the two values to match types before comparing (so `5 == "5"` is `true`, even though one is a number and one is text!). `===` checks both value and type together, with no silent conversion (so `5 === "5"` is `false`). **Always prefer `===` in JavaScript** — this single habit avoids a whole category of confusing bugs. Python and C++ have no equivalent of this loose `==` behavior.

### Logical operators (combining yes/no questions)
```cpp
(a > 5) && (b < 10);   // AND -- both must be true
(a > 5) || (b < 10);   // OR  -- at least one must be true
!(a > 5);              // NOT -- flips true to false, and false to true
```
```python
(a > 5) and (b < 10)   # AND -- both must be true
(a > 5) or (b < 10)    # OR  -- at least one must be true
not (a > 5)            # NOT -- flips True to False, and False to True
```
```javascript
(a > 5) && (b < 10);   // AND -- both must be true
(a > 5) || (b < 10);   // OR  -- at least one must be true
!(a > 5);              // NOT -- flips true to false, and false to true
```
**Rule to remember**: Python spells these out as real words (`and`, `or`, `not`) instead of symbols; C++ and JavaScript both use the same symbols (`&&`, `||`, `!`) for these.

## Rules to remember (C++ specific)
- C++ variables **must have a fixed type declared upfront** (`int age = 20;`) and that type never changes for that variable's life.
- Python does not need this — a Python variable can hold an `int` today and a `string` tomorrow (`age = 20` then later `age = "twenty"` both work fine). This is the difference between C++ being **statically typed** (types fixed and checked before running) and Python being **dynamically typed** (types checked while running, and can change).
- Integer division truncating the decimal (the `10 / 3 = 3` trap above) is a C++/most-compiled-languages behavior; it does the same thing in Python 2, but Python 3 changed `/` to always give a decimal answer (`10 / 3` = `3.333...` in Python 3) — a real, important version difference if you ever read older Python code.

## More Topics Like This (harder wording, for extra reading)
- **Integer overflow** — an `int` in C++ has a fixed size, so adding 1 to its maximum possible value wraps around to a negative number instead of raising an error; Python integers, by contrast, grow automatically with no fixed ceiling.
- **Type casting** — explicitly converting one data type into another (`(float) a / b` forces true decimal division even when both are ints) — the deliberate fix for the truncation trap above.
