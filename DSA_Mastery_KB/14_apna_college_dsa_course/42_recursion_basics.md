# Recursion — Part 1 (Basics)

Simple words, step by step.

## What is recursion?
Recursion is when a function **calls itself**, to solve a smaller version of the same problem, until it reaches a version so small it can answer directly (called the **base case**).

Think of it like Russian nesting dolls: to open the big doll, you open a smaller doll inside it, which has an even smaller doll inside it, and so on — until you reach the smallest doll, which doesn't open into anything else. That smallest doll is the base case.

## The two parts every recursive function needs
1. **Base case** — the smallest, simplest version of the problem, answered directly, with no further function calls. Without this, the function calls itself forever.
2. **Recursive case** — the function calls itself with a *smaller* input, trusting that the smaller call will give the correct answer, and then uses that answer to build the current answer.

## Example 1: Factorial
`5! = 5 × 4 × 3 × 2 × 1 = 120`. Notice: `5! = 5 × 4!`, and `4! = 4 × 3!`, and so on, down to `1! = 1` (or `0! = 1`, the base case).
```python
def factorial(n):
    if n <= 1:
        return 1                  # base case
    return n * factorial(n - 1)    # recursive case -- trust that factorial(n-1) is correct
```
```javascript
function factorial(n) {
    if (n <= 1) {
        return 1;                    // base case
    }
    return n * factorial(n - 1);      // recursive case -- trust that factorial(n-1) is correct
}
```

## Example 2: Sum of first n natural numbers
```python
def sum_n(n):
    if n == 0:
        return 0                # base case
    return n + sum_n(n - 1)      # recursive case
```
```javascript
function sumN(n) {
    if (n === 0) {
        return 0;                  // base case
    }
    return n + sumN(n - 1);        // recursive case
}
```

## The "trust the recursion" mindset (the most important idea in this file)
The hardest part of learning recursion is resisting the urge to mentally trace through every single call by hand. Instead, when you write `n * factorial(n - 1)`, **assume `factorial(n - 1)` already correctly gives you `(n-1)!`** — you don't need to trace how it gets there, you just need to trust it, and then figure out what to *do* with that trusted answer to solve the current, slightly bigger problem. This is exactly like mathematical induction: prove the base case works, then prove that if it works for `n-1`, it also works for `n`.

## What is happening in memory — the Call Stack
Every recursive call is placed on the **call stack** — a stack of "pending" function calls, each waiting for the call below it to finish. `factorial(5)` calls `factorial(4)`, which calls `factorial(3)`, and so on. Only when `factorial(1)` returns does `factorial(2)` finish, then `factorial(3)`, and so on back up.
```
Call stack while computing factorial(5), growing downward:
factorial(5)  -- waiting for factorial(4)
  factorial(4)  -- waiting for factorial(3)
    factorial(3)  -- waiting for factorial(2)
      factorial(2)  -- waiting for factorial(1)
        factorial(1)  -- returns 1 immediately (base case)
      factorial(2) returns 2*1 = 2
    factorial(3) returns 3*2 = 6
  factorial(4) returns 4*6 = 24
factorial(5) returns 5*24 = 120
```

## Rules to remember
- **Always write the base case first**, and make sure it is actually reachable — a recursive case that never shrinks toward the base case (e.g. calling `factorial(n + 1)` by mistake) causes infinite recursion, which eventually crashes with a "stack overflow" or "maximum recursion depth exceeded" error.
- Python has a default recursion depth limit (usually 1000) — deep recursion (like factorial of 100,000) will hit `RecursionError` in Python before it would in C++. JavaScript's limit depends on the engine but is typically a few thousand to tens of thousands of calls deep — both are far smaller than what an iterative loop can handle, since a loop doesn't consume stack space per iteration.
- Every recursive solution can also be written iteratively (with a loop), and vice versa — recursion is a *tool* for organizing certain problems clearly (especially ones with a naturally repeating, self-similar structure like trees), not the only way to solve them.

## Interview Q&A

**Q1: What are the two required parts of any recursive function, and what happens if one is missing?**
A base case and a recursive case. Without a base case, the function has no way to stop, causing infinite recursion until the program crashes. Without a recursive case that actually makes progress toward the base case (shrinking the problem each time), you also get infinite recursion, even if a base case technically exists.

**Q2: What does "trust the recursion" mean, and why is it a useful mental habit?**
It means assuming that a recursive call with a smaller input already returns the correct answer, without mentally simulating every nested call. This mirrors mathematical induction and lets you reason about a recursive function by asking only two questions: "does the base case work?" and "if the smaller call is correct, does my current step correctly build on it?" — rather than getting lost tracing every branch by hand, which becomes impossible for anything beyond the simplest examples.

**Q3: Why does deep recursion risk crashing a program, when an equivalent loop wouldn't?**
Every recursive call adds a new frame to the call stack, which uses real memory and counts against a language-enforced (or hardware-enforced) maximum stack depth. A loop reuses the same stack frame on every iteration, so it can run millions of times without growing the stack at all. This is why some recursive solutions are deliberately rewritten as iterative ones for production code operating on large or unbounded inputs.

**Q4: Give an example of a problem that's naturally recursive, and explain why.**
Tree traversal (covered in the Trees module) is the clearest example: a tree is defined as "a node, with a left subtree and a right subtree, each of which is itself a tree." Processing "the whole tree" naturally reduces to "process this node, then process the (smaller) left subtree, then process the (smaller) right subtree" — the problem's own definition is self-referential, which is exactly what recursion is built to express cleanly.
