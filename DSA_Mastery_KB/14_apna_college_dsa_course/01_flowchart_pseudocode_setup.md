# Flowchart, Pseudocode, and Setting Up C++

Simple words, step by step. This is the very first lesson — no coding yet, just how to *think* before you code.

## What is a flowchart?
A flowchart is a **picture** of the steps your program will take, using shapes:
- **Oval** = Start or End
- **Rectangle** = A step (do something)
- **Diamond** = A question (yes/no, true/false)
- **Arrow** = Which step comes next

Example — a flowchart for "check if a number is even or odd":
```
   (Start)
      |
      v
[ Read the number ]
      |
      v
 < Is number % 2 == 0 ? >
   /              \
 Yes               No
  |                 |
  v                 v
[Print "Even"]  [Print "Odd"]
      \              /
       \            /
        v          v
        (End)
```
**Why bother with this?** Before writing any code, drawing the flow in your head (or on paper) stops you from getting lost. Big, hard problems become a list of small, clear steps.

## What is pseudocode?
Pseudocode is writing your steps in **plain English**, but in a code-like shape — no real programming language rules, just the logic.

Example — pseudocode for the same even/odd check:
```
START
  READ number
  IF number MOD 2 EQUALS 0
      PRINT "Even"
  ELSE
      PRINT "Odd"
  END IF
END
```
This is not real C++ or Python — it is just a plan. Once the plan is clear, turning it into real code is much easier.

## Setting up C++ (the basic idea)
To run C++ code, you need:
1. A **compiler** — a program that turns your C++ code into something the computer can actually run (C++ code by itself does nothing; it must be compiled first).
2. A place to write code — this can be a simple text editor, or a website like an "online compiler," or a full program called an IDE (like VS Code, Code::Blocks, or CLion).

**The very first C++ program** (just to see the shape of it):
```cpp
#include <iostream>     // brings in tools for input/output, like printing text
using namespace std;    // lets us write "cout" instead of "std::cout"

int main() {            // every C++ program starts running here
    cout << "Hello, World!" << endl;   // print text to the screen
    return 0;            // tells the computer "the program finished with no errors"
}
```
Line by line, in plain words:
- `#include <iostream>` — "give me the printing/reading tools."
- `int main() { ... }` — "this is where my program begins and ends."
- `cout << "..."` — "print this text."
- `return 0;` — "everything went fine."

## The same idea in Python and JavaScript
```python
# Python -- no compile step, no semicolons, no "main" function needed
print("Hello, World!")
```
```javascript
// JavaScript -- also no compile step needed (runs in a browser or in Node.js)
console.log("Hello, World!");
```

## Rules to remember (comparing all three languages)
- **C++**: needs a **semicolon `;`** at the end of most lines (forgetting it is the #1 beginner mistake), curly braces `{ }` group code blocks, and the code **must be compiled** before it can run.
- **Python**: no semicolons needed, no curly braces — **indentation (spacing)** itself shows what is "inside" a block. Runs directly, no separate compile step.
- **JavaScript**: semicolons are technically optional in most cases (the language tries to guess where a line ends), but writing them anyway is the safer habit. Curly braces `{ }` are used just like C++. Like Python, it runs directly with no separate compile step — but unlike Python, it usually runs inside a **browser** or inside **Node.js**, not as a standalone program by itself.
- **The one big three-way split to remember**: C++ is compiled ahead of time; Python and JavaScript are both run directly (interpreted/JIT-compiled on the fly) — but Python is used mostly for backend scripts and data work, while JavaScript is the one language that runs natively inside every web browser.

## More Topics Like This (harder wording, for extra reading)
- **Pseudocode standards (IB/AP-style pseudocode)** — some exams expect a very specific pseudocode format; know that "pseudocode" has no single universal syntax, only shared conventions.
- **Compiler vs Interpreter** — C++ is compiled ahead-of-time; Python is interpreted line-by-line at runtime; this single difference explains most "why does this error show up differently" confusions between the two languages.
