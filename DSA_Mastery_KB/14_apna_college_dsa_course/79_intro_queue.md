# Introduction to Queue

Simple words, step by step.

## What is a queue?
A queue is a collection where items are added at one end (the **rear**) and removed from the other end (the **front**). This gives it **FIFO** behavior: First In, First Out — the earliest item added is always the first one removed.

Think of a line of people waiting for a ticket counter: the first person in line gets served first, and new people join at the back.

## The core operations
| Operation | What it does | Speed |
|---|---|---|
| `enqueue(x)` | Add `x` to the rear | O(1) |
| `dequeue()` | Remove and return the item at the front | O(1) *(if implemented correctly — see below)* |
| `front()` / `peek()` | Look at the front item without removing it | O(1) |
| `is_empty()` | Check if the queue has anything in it | O(1) |

## The naive array implementation — and why it's actually O(n), not O(1)
```python
class NaiveQueue:
    def __init__(self):
        self.items = []

    def enqueue(self, x):
        self.items.append(x)        # O(1) -- adding to the end is fine

    def dequeue(self):
        return self.items.pop(0)      # O(n) !! -- removing from the FRONT shifts every other element
```
**The trap**: `pop(0)` on a Python list (or `shift()` on a JavaScript array) is **O(n)**, not O(1) — removing the first element forces every remaining element to shift down by one position. A naive array-based queue silently fails the "O(1) dequeue" requirement that queues are supposed to guarantee.

## The correct implementation — `collections.deque` / a Linked-List-Based Queue
```python
from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()           # a real double-ended queue, O(1) at both ends

    def enqueue(self, x):
        self.items.append(x)

    def dequeue(self):
        return self.items.popleft()      # O(1) -- deque is specifically built for this

    def front(self):
        return self.items[0]

    def is_empty(self):
        return len(self.items) == 0
```
```javascript
// JavaScript has no built-in deque -- a linked-list-based queue is the standard fix
class QueueNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

class Queue {
    constructor() {
        this.frontNode = null;
        this.rearNode = null;
    }

    enqueue(x) {
        const node = new QueueNode(x);
        if (!this.rearNode) {
            this.frontNode = this.rearNode = node;
        } else {
            this.rearNode.next = node;
            this.rearNode = node;
        }
    }

    dequeue() {
        if (!this.frontNode) throw new Error("dequeue from empty queue");
        const val = this.frontNode.val;
        this.frontNode = this.frontNode.next;
        if (!this.frontNode) this.rearNode = null;   // queue became empty
        return val;
    }

    isEmpty() {
        return this.frontNode === null;
    }
}
```
**Why `deque` solves the O(n) problem**: Python's `collections.deque` is implemented as a doubly linked list of blocks internally, specifically designed so that **both** ends support O(1) insertion and removal — unlike a plain `list`, which is a flat array optimized for O(1) only at the *end*.

## Real-world uses of queues
- **Task scheduling** — jobs processed in the order they arrive (first-come, first-served).
- **BFS (Breadth-First Search)** on trees and graphs — covered in the Graphs module; a queue is the entire mechanism that makes "explore level by level" possible.
- **Printer/request queues** — print jobs or server requests handled in arrival order.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Implement a queue using only an array, but with O(1) enqueue AND dequeue (no shifting)
This is exactly what a **Circular Queue** achieves, using modular arithmetic to wrap indices around a fixed-size array instead of shifting elements — full treatment in file 80.

### Twist 2: A "priority" queue, where items come out in priority order, not arrival order
A plain queue is purely FIFO. If items need to come out in some other order (e.g., "most urgent first"), that's a fundamentally different structure — a **Priority Queue**, typically implemented with a **heap** (covered in the Trees module) — not a variation of a plain queue at all, despite the similar name.

## Interview Q&A

**Q1: Why is `list.pop(0)` in Python (or `array.shift()` in JavaScript) a bad way to implement `dequeue`?**
Because removing the first element of a flat array requires shifting every remaining element one position to the left to close the gap — this is an O(n) operation, not O(1). A correctly implemented queue must guarantee O(1) for *both* enqueue and dequeue, which requires a structure (like `deque`, or a linked list with both head and tail references) specifically designed for efficient operations at both ends.

**Q2: What's the fundamental structural difference between a stack and a queue, given that both support "add" and "remove" in O(1)?**
A stack's add and remove both happen at the **same** end (the top) — LIFO. A queue's add and remove happen at **opposite** ends (rear and front) — FIFO. This single difference in *which end* operations target is the entire distinction between the two structures, despite both being simple, O(1)-per-operation linear collections.

**Q3: Why does Python's `collections.deque` support O(1) operations at both ends, when a plain Python `list` doesn't?**
A plain `list` is backed by a contiguous array in memory, optimized for O(1) access and append at the end, but O(n) insert/remove at the front (requires shifting). `deque` is implemented internally as a doubly linked list of fixed-size blocks, specifically designed so that both ends can be modified without needing to shift any other elements — a different internal data structure chosen specifically to serve this "fast at both ends" use case.
