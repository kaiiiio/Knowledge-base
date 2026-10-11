# Conditional Statements & Loops

Simple words, step by step.

## What is a conditional statement?
A conditional statement lets your program **make a choice** — "if this is true, do one thing; otherwise, do another thing."

```cpp
int age = 20;
if (age >= 18) {
    cout << "You can vote";
} else {
    cout << "You cannot vote yet";
}
```
```python
age = 20
if age >= 18:              # no parentheses or braces needed -- indentation shows the block
    print("You can vote")
else:
    print("You cannot vote yet")
```
```javascript
let age = 20;
if (age >= 18) {
    console.log("You can vote");
} else {
    console.log("You cannot vote yet");
}
```
In plain words: "check if age is 18 or more. If yes, print the voting message. If no, print the other message."

### Many choices at once (`else if`)
```cpp
int marks = 75;
if (marks >= 90) {
    cout << "Grade A";
} else if (marks >= 75) {
    cout << "Grade B";
} else if (marks >= 50) {
    cout << "Grade C";
} else {
    cout << "Fail";
}
```
```python
marks = 75
if marks >= 90:
    print("Grade A")
elif marks >= 75:          # Python spells "else if" as one word: "elif"
    print("Grade B")
elif marks >= 50:
    print("Grade C")
else:
    print("Fail")
```
```javascript
let marks = 75;
if (marks >= 90) {
    console.log("Grade A");
} else if (marks >= 75) {
    console.log("Grade B");
} else if (marks >= 50) {
    console.log("Grade C");
} else {
    console.log("Fail");
}
```
The computer checks each condition **in order**, top to bottom, and stops at the first one that is true. So even if `marks >= 50` is also true here, it never gets checked, because `marks >= 75` was already true first.

### `switch` — a shortcut for many exact-match choices
```cpp
int day = 3;
switch (day) {
    case 1: cout << "Monday"; break;
    case 2: cout << "Tuesday"; break;
    case 3: cout << "Wednesday"; break;
    default: cout << "Unknown day";
}
```
```python
day = 3
match day:                  # Python 3.10+ only -- older Python uses if/elif instead
    case 1:
        print("Monday")
    case 2:
        print("Tuesday")
    case 3:
        print("Wednesday")
    case _:                 # "_" means "anything else" (the default case)
        print("Unknown day")
```
```javascript
let day = 3;
switch (day) {
    case 1: console.log("Monday"); break;
    case 2: console.log("Tuesday"); break;
    case 3: console.log("Wednesday"); break;
    default: console.log("Unknown day");
}
```
**Rule to remember**: the `break;` after each case is important in both C++ and JavaScript. Without it, the program keeps running the code for every case below it too, even after finding a match — this is called "fall-through," and forgetting `break` is a classic bug. Python's `match` statement does **not** have this fall-through danger at all — each `case` automatically stops after running, no `break` needed or possible.

## What is a loop?
A loop repeats a block of code, so you do not have to copy-paste the same lines again and again.

### `for` loop — use when you know how many times to repeat
```cpp
for (int i = 1; i <= 5; i++) {
    cout << i << " ";
}
// prints: 1 2 3 4 5
```
```python
for i in range(1, 6):     # range(1, 6) means 1,2,3,4,5 -- the end number (6) is NOT included
    print(i, end=" ")
# prints: 1 2 3 4 5
```
```javascript
for (let i = 1; i <= 5; i++) {
    process.stdout.write(i + " ");   // (in a browser, console.log(i) is simpler)
}
// prints: 1 2 3 4 5
```
Three parts, in plain words:
- `int i = 1` — start counting from 1.
- `i <= 5` — keep going as long as this is true.
- `i++` — after each round, add 1 to `i`.

**Rule to remember**: Python's `for` loop does not use this "start; condition; step" shape at all — it always loops over the items of something (like `range(1, 6)`, or a list, or a string). C++ and JavaScript both use the classic three-part shape shown above.

### `while` loop — use when you don't know exactly how many times, only the stopping condition
```cpp
int n = 5;
while (n > 0) {
    cout << n << " ";
    n--;   // n = n - 1
}
// prints: 5 4 3 2 1
```
```python
n = 5
while n > 0:
    print(n, end=" ")
    n -= 1     # Python has no "n--" shortcut -- must write "n -= 1"
# prints: 5 4 3 2 1
```
```javascript
let n = 5;
while (n > 0) {
    process.stdout.write(n + " ");
    n--;   // n = n - 1
}
// prints: 5 4 3 2 1
```
**Danger to watch for**: if you forget to change the variable inside the loop (like forgetting to decrease `n` here), the condition `n > 0` never becomes false, and the loop runs forever — this is called an **infinite loop**, and it is one of the most common beginner bugs, in every language.

### `do-while` loop — like `while`, but always runs at least once
```cpp
int n = 0;
do {
    cout << "This runs at least once, even though n is " << n;
} while (n > 0);
```
```python
n = 0
while True:                       # Python has NO do-while -- this is how you fake it
    print(f"This runs at least once, even though n is {n}")
    if not (n > 0):
        break
```
```javascript
let n = 0;
do {
    console.log(`This runs at least once, even though n is ${n}`);
} while (n > 0);
```
The difference: a normal `while` loop checks the condition **before** running the code even once, so if the condition starts out false, it never runs at all. A `do-while` loop checks the condition **after** running the code, so it is guaranteed to run at least once no matter what.

## Rules to remember (comparing all three languages)
- The three parts of a C++/JavaScript `for` loop are always in the order: start, stop-condition, step. Getting the order wrong is a compile error in C++.
- Python has no `do-while` loop at all — the same effect is written using a `while True:` loop with a manual `break` inside it.
- Python has no `switch` statement in versions before 3.10 (older Python code uses if/elif chains instead); Python 3.10+ added `match` as its equivalent. JavaScript's `switch` behaves like C++'s.
- JavaScript has no shorthand like Python's `range()` for looping over a plain sequence of numbers — the classic three-part `for` loop is the normal way to do it.

## More Topics Like This (harder wording, for extra reading)
- **Loop invariants** — a condition that stays true every time through a loop; used to formally prove a loop is correct, not just "it seemed to work on the examples I tried."
- **`break` and `continue`** — `break` exits a loop entirely; `continue` skips only the rest of the current round and moves to the next one — a common source of off-by-one confusion when combined with `for` loop counters.
