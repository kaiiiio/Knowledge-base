# Design a Min Stack

Simple words, step by step.

## The question
Design a stack that supports `push`, `pop`, `top`, AND `get_min()` — returning the minimum element currently in the stack — **all in O(1) time**.

## Why this is tricky
A plain stack has no idea what its minimum is without scanning every element (O(n)). The minimum can also **change** as elements are popped — if the current minimum gets popped, the "new" minimum is whatever the minimum was *before* that element was pushed, which isn't obviously available.

## Brute Force
```python
class MinStackBrute:
    def __init__(self):
        self.stack = []

    def push(self, x):
        self.stack.append(x)

    def pop(self):
        self.stack.pop()

    def top(self):
        return self.stack[-1]

    def get_min(self):
        return min(self.stack)        # O(n) -- scans everything, every time
```
**Speed**: `push`/`pop`/`top` are O(1), but `get_min()` is O(n) — not good enough.

## Optimal — Auxiliary Min Stack
Maintain a **second stack** alongside the main one, which always tracks "what is the minimum so far, up to this point in the main stack." Every push also pushes the current minimum (old minimum vs new value, whichever is smaller) onto this second stack. Every pop removes from both stacks together — so the second stack's top is always correct for whatever remains in the main stack.

```python
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []         # min_stack[i] = the minimum of stack[0..i]

    def push(self, x):
        self.stack.append(x)
        if not self.min_stack:
            self.min_stack.append(x)
        else:
            self.min_stack.append(min(x, self.min_stack[-1]))   # record the running minimum

    def pop(self):
        self.stack.pop()
        self.min_stack.pop()          # keep both stacks in sync

    def top(self):
        return self.stack[-1]

    def get_min(self):
        return self.min_stack[-1]      # O(1) -- always up to date
```
```javascript
class MinStack {
    constructor() {
        this.stack = [];
        this.minStack = [];         // minStack[i] = the minimum of stack[0..i]
    }

    push(x) {
        this.stack.push(x);
        if (this.minStack.length === 0) {
            this.minStack.push(x);
        } else {
            this.minStack.push(Math.min(x, this.minStack[this.minStack.length - 1]));
        }
    }

    pop() {
        this.stack.pop();
        this.minStack.pop();           // keep both stacks in sync
    }

    top() {
        return this.stack[this.stack.length - 1];
    }

    getMin() {
        return this.minStack[this.minStack.length - 1];   // O(1) -- always up to date
    }
}
```
**Speed**: every operation is O(1). Space: O(n) extra, for the second stack — this is the real trade-off: doubling the memory usage in exchange for O(1) minimum lookups.

**Watching it work**, pushing `5, 3, 7, 2`:
```
push 5: stack=[5],       min_stack=[5]             (5 is the only element, so it's the min)
push 3: stack=[5,3],     min_stack=[5,3]            (min(3, 5)=3)
push 7: stack=[5,3,7],   min_stack=[5,3,3]          (min(7, 3)=3 -- 7 doesn't change the running min)
push 2: stack=[5,3,7,2], min_stack=[5,3,3,2]        (min(2, 3)=2)
get_min() -> 2 (correct, top of min_stack)
pop() -> stack=[5,3,7], min_stack=[5,3,3]
get_min() -> 3 (correct -- the min after removing 2 really is 3)
```

## Rules to remember
- **`pop` must remove from BOTH stacks together, every time** — if you only pop the main stack, `min_stack` falls out of sync, and `get_min()` starts returning stale, incorrect values.
- The space trade-off (O(n) extra memory) is a deliberate, worthwhile cost for turning `get_min()` from O(n) into O(1) — a classic example of trading memory for speed.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Space-optimized version — don't duplicate every value, only push to `min_stack` when the minimum actually changes
```python
class MinStackOptimized:
    def __init__(self):
        self.stack = []
        self.min_stack = []

    def push(self, x):
        self.stack.append(x)
        if not self.min_stack or x <= self.min_stack[-1]:
            self.min_stack.append(x)        # only push when x IS the new minimum (or ties it)

    def pop(self):
        x = self.stack.pop()
        if self.min_stack and x == self.min_stack[-1]:
            self.min_stack.pop()              # only pop min_stack if the popped value WAS the minimum

    def top(self):
        return self.stack[-1]

    def get_min(self):
        return self.min_stack[-1]
```
**The trap**: the `pop` logic must check "was the value I just removed actually the current minimum?" rather than unconditionally popping `min_stack` — this version can save meaningful memory on inputs with few new minimums, but it requires carefully keeping the two stacks' pop conditions in sync, which is subtler than the simpler always-synchronized version above.

### Twist 2: Support `get_max()` as well as `get_min()`, both in O(1)
Just maintain a third, parallel `max_stack`, following the exact same logic as `min_stack` but tracking the running maximum instead (`max(x, max_stack[-1])` instead of `min(...)`). **The trap**: candidates sometimes assume tracking both min and max requires a fundamentally different data structure — it doesn't; it's simply "do the same trick twice, independently," which is a good test of whether the underlying auxiliary-stack idea was actually understood versus just memorized for the minimum case specifically.

## Interview Q&A

**Q1: Why can't you just track a single "current minimum" variable instead of a whole second stack?**
Because the minimum can change when elements are popped, and a single variable has no memory of what the minimum *used to be* before the current minimum was pushed. If you pop the current minimum, you need to know what the minimum was immediately before it was pushed — exactly the information a full history (the second stack) preserves, which one variable cannot.

**Q2: What is the space-time trade-off being made here, and is it always worth it?**
The trade-off is O(n) extra space (the auxiliary min-stack) in exchange for O(1) `get_min()` instead of O(n). This is worth it whenever `get_min()` is called frequently relative to how much memory is available — if memory is extremely tight and `get_min()` is rarely called, the O(n)-scan brute force might be acceptable instead, but for a structure explicitly designed to support frequent minimum queries, the space trade-off is the entire point.

**Q3: How would the space-optimized version (Twist 1) behave differently from the simple version if there are many duplicate minimum values, like pushing `3, 3, 3, 3`?**
In the simple version, `min_stack` grows by one entry for every single push, regardless of duplicates (`min_stack` becomes `[3,3,3,3]`). In the optimized version, since each new `3` ties the current minimum (`x <= min_stack[-1]`), it still gets pushed onto `min_stack` too (to correctly track that there are multiple `3`s, so popping one still leaves `3` as the minimum) — so in this specific all-duplicates case, the optimization doesn't actually save space; the savings only show up when later-pushed values are *strictly greater* than the running minimum.
