# Circular Queue

Simple words, step by step.

## Why circular queues exist
A fixed-size array-based queue has a problem: once `front` moves forward (past dequeues), that space at the beginning is "wasted" — never reused, even though the array has no more room at the end. A **circular queue** fixes this by treating the array as a loop: when the `rear` pointer reaches the end of the array, it wraps back around to index 0 (if there's free space there).

```
Array of size 5:  [_, _, _, _, _]
After some enqueues/dequeues, front has moved to index 2:
                   [_, _, X, X, X]   (indices 2,3,4 occupied, 0,1 are "wasted" in a naive queue)
Circular queue reuses 0,1 for new enqueues instead of needing a bigger array.
```

## Implementation
```python
class CircularQueue:
    def __init__(self, capacity):
        self.capacity = capacity
        self.queue = [None] * capacity
        self.front_idx = 0
        self.size = 0                 # tracks how many elements are currently in the queue

    def enqueue(self, x):
        if self.size == self.capacity:
            return False                # queue is full
        rear_idx = (self.front_idx + self.size) % self.capacity
        self.queue[rear_idx] = x
        self.size += 1
        return True

    def dequeue(self):
        if self.size == 0:
            return None                   # queue is empty
        val = self.queue[self.front_idx]
        self.front_idx = (self.front_idx + 1) % self.capacity
        self.size -= 1
        return val

    def is_full(self):
        return self.size == self.capacity

    def is_empty(self):
        return self.size == 0
```
```javascript
class CircularQueue {
    constructor(capacity) {
        this.capacity = capacity;
        this.queue = new Array(capacity).fill(null);
        this.frontIdx = 0;
        this.size = 0;                   // tracks how many elements are currently in the queue
    }

    enqueue(x) {
        if (this.size === this.capacity) {
            return false;                  // queue is full
        }
        const rearIdx = (this.frontIdx + this.size) % this.capacity;
        this.queue[rearIdx] = x;
        this.size++;
        return true;
    }

    dequeue() {
        if (this.size === 0) {
            return null;                    // queue is empty
        }
        const val = this.queue[this.frontIdx];
        this.frontIdx = (this.frontIdx + 1) % this.capacity;
        this.size--;
        return val;
    }

    isFull() {
        return this.size === this.capacity;
    }

    isEmpty() {
        return this.size === 0;
    }
}
```
**Speed**: O(1) for every operation — `enqueue`, `dequeue`, `is_full`, `is_empty` — no shifting ever happens, because the modulo operation (`% capacity`) handles the wrap-around for free.

## Rules to remember
- **Tracking `size` as an explicit counter (rather than trying to infer "full vs empty" purely from `front` and `rear` positions) avoids a classic ambiguity bug**: if `front == rear` could mean *either* "completely empty" or "completely full" (both look identical without an explicit count), you'd need an extra flag or to deliberately waste one array slot to disambiguate. Tracking `size` directly sidesteps this entire class of edge-case bugs.
- The formula `(front_idx + size) % capacity` computes the rear position on demand — this avoids needing to separately track and update a `rear_idx` variable, reducing the chance of the two indices (`front` and `rear`) getting out of sync with each other.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Why not just use `rear_idx` directly (tracked separately) instead of computing it from `front_idx + size`?
```python
# Alternative (also valid, but has a known ambiguity to watch for):
class CircularQueueAltDesign:
    def __init__(self, capacity):
        self.capacity = capacity + 1   # deliberately waste ONE slot to disambiguate full vs empty
        self.queue = [None] * self.capacity
        self.front_idx = 0
        self.rear_idx = 0

    def enqueue(self, x):
        next_rear = (self.rear_idx + 1) % self.capacity
        if next_rear == self.front_idx:
            return False                  # would collide with front -- queue is full
        self.queue[self.rear_idx] = x
        self.rear_idx = next_rear
        return True

    def dequeue(self):
        if self.front_idx == self.rear_idx:
            return None                     # empty
        val = self.queue[self.front_idx]
        self.front_idx = (self.front_idx + 1) % self.capacity
        return val
```
**The trap**: this classic alternative design **deliberately wastes one array slot** (`capacity + 1` actual size) specifically so that `front_idx == rear_idx` can unambiguously mean "empty" — if you didn't waste a slot, a completely full queue could also end up with `front_idx == rear_idx` (after wrapping around), making "full" and "empty" indistinguishable by position alone. This is a genuinely different, equally valid trade-off (wasted space vs. an explicit counter) worth being able to discuss if asked "how else could you design this?"

### Twist 2: Design a circular DEQUE (double-ended, insert/remove from both front AND rear)
Extend the same modulo-arithmetic idea symmetrically: `enqueue_front` decrements `front_idx` (wrapping with `% capacity`, careful with negative modulo in some languages), and `enqueue_rear`/`dequeue_rear` work analogously using a tracked rear index. **The trap**: negative modulo behaves differently across languages — in Python, `-1 % 5` correctly gives `4`, but in JavaScript, `-1 % 5` gives `-1` (not `4`) — so a circular structure supporting "move backward" indices needs an explicit adjustment in JavaScript (`((i % n) + n) % n`) that isn't needed in Python, a real, easy-to-miss cross-language trap.

## Interview Q&A

**Q1: Why does a plain (non-circular) array-based queue waste space over time, and how does the circular design fix this?**
In a plain array-based queue, once elements are dequeued from the front, those array slots are never reused — the `front` pointer just keeps advancing forward, and the queue eventually "runs out of room" at the end of the array even if plenty of space exists at the beginning. The circular design fixes this by having `rear` wrap back to index 0 (via modulo arithmetic) once it reaches the end, reclaiming that freed-up space instead of abandoning it.

**Q2: Why is tracking an explicit `size` variable preferable to inferring queue state purely from comparing `front` and `rear` indices?**
Without an explicit count, `front == rear` is ambiguous — it could mean the queue is completely empty OR completely full (after wrapping around), and there's no way to tell which from the indices alone. An explicit `size` counter removes this ambiguity entirely and simplifies both the full-check and empty-check into simple, unambiguous comparisons (`size == capacity`, `size == 0`).

**Q3: In JavaScript specifically, why does `-1 % 5` not behave the way you might expect for circular index arithmetic?**
JavaScript's `%` operator is a *remainder* operator, not a true mathematical modulo — for negative numbers, it returns a result with the same sign as the dividend, so `-1 % 5` evaluates to `-1`, not the mathematically "wrapped" value of `4`. Python's `%` is a true modulo operator and handles this correctly by default. In JavaScript, correct circular wrap-around for potentially negative indices requires the explicit adjustment `((i % n) + n) % n`.
