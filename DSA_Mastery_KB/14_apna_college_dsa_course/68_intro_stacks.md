# Introduction to Stacks

Simple words, step by step.

## What is a stack?
A stack is a collection where you can only add or remove from **one end**, called the **top**. This gives it **LIFO** behavior: Last In, First Out — the most recently added item is always the first one removed.

Think of a stack of plates: you put a new plate on top, and you take the top plate off first. You can't pull a plate from the middle without first removing everything above it.

## The four core operations
| Operation | What it does | Speed |
|---|---|---|
| `push(x)` | Add `x` to the top | O(1) |
| `pop()` | Remove and return the top item | O(1) |
| `peek()` / `top()` | Look at the top item without removing it | O(1) |
| `is_empty()` | Check if the stack has anything in it | O(1) |

**Why all four are O(1)**: a stack only ever touches the top — there's no need to shift, search, or walk through other elements for any of these operations.

## Implementing a stack using an array/list
```python
class Stack:
    def __init__(self):
        self.items = []

    def push(self, x):
        self.items.append(x)         # add to the END of the list -- this IS the "top"

    def pop(self):
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self.items.pop()       # removes and returns the LAST element -- O(1)

    def peek(self):
        if self.is_empty():
            raise IndexError("peek from empty stack")
        return self.items[-1]

    def is_empty(self):
        return len(self.items) == 0
```
```javascript
class Stack {
    constructor() {
        this.items = [];
    }

    push(x) {
        this.items.push(x);           // add to the END of the array -- this IS the "top"
    }

    pop() {
        if (this.isEmpty()) {
            throw new Error("pop from empty stack");
        }
        return this.items.pop();       // removes and returns the LAST element -- O(1)
    }

    peek() {
        if (this.isEmpty()) {
            throw new Error("peek from empty stack");
        }
        return this.items[this.items.length - 1];
    }

    isEmpty() {
        return this.items.length === 0;
    }
}
```
**Rule to remember**: implementing a stack with an array means treating the array's **end** (not the beginning) as the "top" — `append`/`push` and `pop` at the end are both O(1) for dynamic arrays, while operating at the *beginning* of an array would cost O(n) (everything would need to shift). This is why a stack is naturally built on the end of a list, never the front.

## Implementing a stack using a linked list (the alternative)
```python
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class LinkedStack:
    def __init__(self):
        self.top_node = None

    def push(self, x):
        new_node = Node(x)
        new_node.next = self.top_node
        self.top_node = new_node          # new node becomes the top -- O(1), no shifting

    def pop(self):
        if self.is_empty():
            raise IndexError("pop from empty stack")
        val = self.top_node.val
        self.top_node = self.top_node.next
        return val

    def is_empty(self):
        return self.top_node is None
```
**Why this also works**: a stack only cares about the top — inserting/removing at the **head** of a linked list is O(1) (no shifting, just repoint a pointer), which maps naturally onto "push/pop at the top."

## Real-world uses of stacks
- **Undo/Redo** in text editors — each action is pushed; undoing pops the most recent one.
- **Browser back button** — visited pages are pushed; going back pops the most recent page.
- **Function call stack** (the mechanism behind recursion, covered in files 42-46) — each function call is "pushed," and returns "pop" it off.
- **Expression evaluation and parsing** (parentheses matching, calculators) — covered in the next several files of this module.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Implement a stack that also supports `get_min()` in O(1) — full solution in file 73 (Min Stack)
This is a genuinely common twist worth flagging here first: a plain stack has no idea what its minimum element is without scanning everything (O(n)). The fix (maintaining a second, auxiliary stack of running minimums) is covered in depth in `73_min_stack.md`.

### Twist 2: Implement a stack using only two queues (no array, no linked list directly)
```python
from collections import deque

class StackUsingQueues:
    def __init__(self):
        self.q1 = deque()
        self.q2 = deque()

    def push(self, x):
        self.q2.append(x)
        while self.q1:
            self.q2.append(self.q1.popleft())   # move everything from q1 behind the new item
        self.q1, self.q2 = self.q2, self.q1       # swap names -- q1 is now "the stack," in correct order

    def pop(self):
        return self.q1.popleft()

    def peek(self):
        return self.q1[0]
```
**The trap**: this makes `push` cost O(n) (to re-order everything behind the new element) in exchange for `pop`/`peek` being O(1) — the opposite trade-off direction from the more commonly expected "cheap push, expensive pop" version. Both are valid; interviewers sometimes specifically ask "can you make push O(1) instead" to see if you can find the alternative construction (keep a single queue, and on push, rotate all previous elements to the back after adding the new one — functionally equivalent, same overall trade-off).

## Interview Q&A

**Q1: Why is building a stack on the END of an array efficient, while building it on the FRONT of the same array would not be?**
A dynamic array's `append`/`push` and `pop` at the end are O(1) because no other elements need to move — the new slot is simply the next available one. Operating at the front would require shifting every existing element by one position to make room (on insert) or to close the gap (on removal), costing O(n) per operation — far worse for something meant to be a constant-time structure.

**Q2: What is the relationship between stacks and recursion?**
Every function call made during recursion is implicitly "pushed" onto the call stack, and every return is implicitly "popped." This is precisely why deep, unbounded recursion can exhaust a program's stack space (a "stack overflow") — it's the same LIFO structure as an explicit stack data structure, just managed automatically by the language runtime rather than by your own code.

**Q3: Can every stack operation really be done in O(1), including when the underlying array needs to resize?**
Individual `push` operations are O(1) **amortized** — most pushes are a simple O(1) append, but occasionally the underlying array runs out of capacity and must be resized (allocating a new, larger block and copying existing elements over, an O(n) operation). Averaged across many pushes, this occasional O(n) cost works out to O(1) per operation overall — this is the same "amortized" reasoning covered for dynamic arrays in file 08.
