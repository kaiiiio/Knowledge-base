# Implement Queue using Stack & Stack using Queue

Simple words, step by step. This file covers both directions — building a FIFO structure from LIFO building blocks, and vice versa — because the core trick (one expensive operation absorbing all the reordering cost) is the same insight both ways.

## Part 1: Implement a Queue using Two Stacks

## The idea
A stack reverses order (LIFO); applying that reversal **twice** restores the original order. Keep two stacks: `in_stack` (for incoming enqueues) and `out_stack` (for outgoing dequeues). When `out_stack` is empty and a dequeue is needed, dump everything from `in_stack` into `out_stack` — this single dump reverses the order back to FIFO.

```python
class QueueUsingStacks:
    def __init__(self):
        self.in_stack = []
        self.out_stack = []

    def enqueue(self, x):
        self.in_stack.append(x)       # always O(1) -- just push

    def dequeue(self):
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())   # reverse everything, ONCE
        if not self.out_stack:
            raise IndexError("dequeue from empty queue")
        return self.out_stack.pop()
```
```javascript
class QueueUsingStacks {
    constructor() {
        this.inStack = [];
        this.outStack = [];
    }

    enqueue(x) {
        this.inStack.push(x);          // always O(1) -- just push
    }

    dequeue() {
        if (this.outStack.length === 0) {
            while (this.inStack.length > 0) {
                this.outStack.push(this.inStack.pop());   // reverse everything, ONCE
            }
        }
        if (this.outStack.length === 0) {
            throw new Error("dequeue from empty queue");
        }
        return this.outStack.pop();
    }
}
```
**Speed**: `enqueue` is always O(1). `dequeue` is O(1) **amortized** — any individual dequeue *might* trigger an O(n) full transfer, but each element only ever gets moved from `in_stack` to `out_stack` **once** in its entire lifetime, so the total transfer cost across all operations is bounded by O(n) overall, averaging out to O(1) per operation.

**Watching it work**: enqueue `1, 2, 3` (all into `in_stack`: `[1,2,3]`), then dequeue twice:
```
dequeue(): out_stack empty -> transfer: pop 3,2,1 from in_stack, push onto out_stack -> out_stack=[3,2,1]
           pop from out_stack -> returns 1 (correct! FIFO order preserved)
dequeue(): out_stack=[3,2] (not empty) -> no transfer needed -> pop -> returns 2 (correct!)
```

## Part 2: Implement a Stack using Two Queues

## The idea (the mirror image)
Push normally into one queue. To make the *newest* element come out first (LIFO), after pushing, rotate the queue so the new element moves to the front.
```python
from collections import deque

class StackUsingQueue:
    def __init__(self):
        self.q = deque()

    def push(self, x):
        self.q.append(x)
        for _ in range(len(self.q) - 1):
            self.q.append(self.q.popleft())   # rotate everything BEFORE x to go behind it

    def pop(self):
        if not self.q:
            raise IndexError("pop from empty stack")
        return self.q.popleft()                 # the most recent push is now at the front

    def top(self):
        return self.q[0]
```
```javascript
class StackUsingQueue {
    constructor() {
        this.q = [];
    }

    push(x) {
        this.q.push(x);
        for (let i = 0; i < this.q.length - 1; i++) {
            this.q.push(this.q.shift());   // rotate everything BEFORE x to go behind it
        }
    }

    pop() {
        if (this.q.length === 0) {
            throw new Error("pop from empty stack");
        }
        return this.q.shift();               // the most recent push is now at the front
    }

    top() {
        return this.q[0];
    }
}
```
**Speed**: `push` is O(n) (every push rotates the whole queue), `pop`/`top` are O(1) — the **opposite** trade-off direction from Part 1's amortized-O(1) dequeue. This is the exact same alternative construction flagged in file 68's Twist 2.

## Rules to remember
- **Part 1's amortization argument is the single most important thing to be able to explain**: just because one `dequeue` call *can* cost O(n) doesn't mean the structure is O(n) per operation — the total work across a *sequence* of operations is what determines the true amortized cost per operation, and here, each element is moved at most twice in its entire lifetime (once into `in_stack`, once transferred to `out_stack`), bounding the total work.
- Part 2 trades an expensive `push` for cheap `pop`/`top` — this is a legitimate, different design choice, not a worse solution; which one is "better" depends entirely on whether the real use case does more pushes or more pops.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Implement a queue using a SINGLE stack plus recursion (no second stack at all)
```python
class QueueUsingOneStack:
    def __init__(self):
        self.stack = []

    def enqueue(self, x):
        self.stack.append(x)

    def dequeue(self):
        if not self.stack:
            raise IndexError("dequeue from empty queue")
        x = self.stack.pop()
        if not self.stack:
            return x                    # this was the last (and therefore oldest) element
        result = self.dequeue()           # recursively dig to the bottom first
        self.stack.append(x)               # then put this one back on top
        return result
```
**The trap**: this uses the **call stack itself** as the "second stack" — a clever but genuinely O(n) *per call* solution (no amortization benefit at all, since the full recursive unwind-and-repack happens on every single dequeue), worth knowing exists as a space-vs-explicit-structure trade-off, but not actually an improvement over the two-stack version's amortized O(1).

## Interview Q&A

**Q1: Why is the two-stack queue's `dequeue` considered O(1) "amortized" rather than simply O(n)?**
Because although a single dequeue call *can* trigger transferring every element from `in_stack` to `out_stack` (an O(n) operation), this transfer only happens when `out_stack` is empty — and critically, once transferred, those elements can be popped directly from `out_stack` in O(1) each, without being transferred again. Summed across a long sequence of operations, each element is moved a constant number of times (at most twice total: once in, once across) over its entire lifetime, so the *average* cost per operation, amortized across the whole sequence, is O(1), even though individual calls have variable actual cost.

**Q2: Why does reversing a stack's order twice restore the original order — what's the underlying principle?**
A stack is LIFO: popping everything off reverses the order it was pushed in. Pushing those reversed elements onto a second stack reverses them *again* — two reversals cancel out, restoring the original (FIFO-correct) order. This "two stacks = one queue" trick is a direct, concrete application of that double-reversal principle.

**Q3: In the stack-using-queue version, why does rotating the queue after every push correctly maintain LIFO order?**
After pushing a new element to the back of the queue, rotating every *other* element (everything pushed earlier) to go behind it effectively moves the newest element to the front of the queue. Since the stack's `pop` always reads from the front, this guarantees the most recently pushed element is always the one retrieved next — exactly the LIFO behavior a stack requires, achieved using only queue operations (enqueue at the back, dequeue from the front).
