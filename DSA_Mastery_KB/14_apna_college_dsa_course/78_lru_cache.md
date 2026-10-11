# Implement LRU Cache — Hash Map + Doubly Linked List

Simple words, step by step.

## The question
Design a cache with a fixed capacity, supporting `get(key)` and `put(key, value)`, both in **O(1)** time. When the cache is full and a new key needs to be inserted, evict the **Least Recently Used** item — the one that hasn't been accessed (read or written) for the longest time.

## Why this needs two data structures combined
- A **hash map** gives O(1) lookup by key — but a plain hash map has no sense of "order of use," so it can't tell you what to evict.
- A **doubly linked list** can track usage order (most-recently-used at one end, least-recently-used at the other) and supports O(1) removal of a node **given a reference to it** — but finding a specific key's node within a linked list is normally O(n).

**Combining them**: the hash map stores `key -> node reference` (O(1) lookup), and the doubly linked list maintains the actual usage order (O(1) move-to-front and O(1) remove-from-tail), using the exact "dummy head + dummy tail" trick from file 63.

```python
class Node:
    def __init__(self, key, val):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}             # key -> Node
        self.head = Node(0, 0)       # dummy head (most recently used side)
        self.tail = Node(0, 0)       # dummy tail (least recently used side)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._add_to_front(node)       # accessing it makes it "most recently used"
        return node.val

    def put(self, key, value):
        if key in self.cache:
            self._remove(self.cache[key])

        node = Node(key, value)
        self.cache[key] = node
        self._add_to_front(node)

        if len(self.cache) > self.capacity:
            lru = self.tail.prev           # the node right before the dummy tail = least recently used
            self._remove(lru)
            del self.cache[lru.key]
```
```javascript
class Node {
    constructor(key, val) {
        this.key = key;
        this.val = val;
        this.prev = null;
        this.next = null;
    }
}

class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();       // key -> Node
        this.head = new Node(0, 0);     // dummy head (most recently used side)
        this.tail = new Node(0, 0);     // dummy tail (least recently used side)
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    _remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    _addToFront(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }

    get(key) {
        if (!this.cache.has(key)) {
            return -1;
        }
        const node = this.cache.get(key);
        this._remove(node);
        this._addToFront(node);          // accessing it makes it "most recently used"
        return node.val;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            this._remove(this.cache.get(key));
        }

        const node = new Node(key, value);
        this.cache.set(key, node);
        this._addToFront(node);

        if (this.cache.size > this.capacity) {
            const lru = this.tail.prev;         // node right before dummy tail = least recently used
            this._remove(lru);
            this.cache.delete(lru.key);
        }
    }
}
```
**Speed**: both `get` and `put` are O(1) — hash map gives instant node lookup, and the dummy-sentinel doubly linked list gives instant insert/remove without ever needing to search for a position.

## Rules to remember
- **Every access (both `get` and `put` on an existing key) must move the node to the front** — "recently used" means recently *touched* in any way, not just recently written.
- The dummy head and dummy tail (from file 63) are what make every insert/remove operation uniform — there's never a special case for "is this the first or last real node," which would otherwise be a constant source of bugs.
- Deleting from the hash map (`del self.cache[lru.key]`) must happen whenever a node is evicted from the linked list — forgetting this leaves a stale entry in the map pointing to a node that's no longer part of the actual cache structure.

## Twisted Tricky Examples (with Solutions)

### Twist 1: LFU Cache (Least Frequently Used, not Least Recently Used) — a genuinely harder variant
Instead of evicting based on *recency*, evict based on *frequency of use* (and recency only as a tiebreaker among equally-frequent items). This requires an additional layer: a hash map from frequency count to a doubly linked list of all keys currently at that frequency, plus tracking the minimum frequency currently in use. **The trap**: candidates sometimes assume LRU's structure can be trivially adapted by just adding a counter to each node — but efficiently finding "the least frequently used item, breaking ties by recency" in O(1) genuinely requires this extra frequency-bucketing structure, not just a small tweak to LRU.

### Twist 2: Thread-safe LRU Cache (multiple threads accessing concurrently)
The structure itself doesn't change, but every method needs to be protected by a lock (mutex) to prevent two threads from corrupting the doubly linked list simultaneously (e.g., two threads both trying to `_remove` and `_add_to_front` the same node at the same time, interleaving their pointer updates incorrectly). **The trap**: simply wrapping the whole `get`/`put` method body in one coarse lock is the simplest correct fix, but it serializes all access (no real concurrency benefit) — a deeper follow-up asks about finer-grained locking strategies, which trade implementation complexity for actual parallelism.

## Interview Q&A

**Q1: Why can't a hash map alone achieve O(1) LRU eviction?**
A hash map provides O(1) key lookup, but it has no inherent concept of insertion or access order — there's no O(1) way to ask a plain hash map "which of my entries was touched longest ago." Tracking *order* efficiently requires a structure built for ordered access and removal, which is exactly what the doubly linked list provides.

**Q2: Why specifically a DOUBLY linked list, and not a singly linked list, for the ordering structure?**
Removing a node from anywhere in the list (not just the ends) requires access to that node's predecessor, to rewire its `.next` pointer around the removed node. A doubly linked list node already has a direct `.prev` reference, making removal O(1) given just the node itself. A singly linked list node has no way to find its predecessor without walking from the head, making removal O(n) — which would break the whole point of this design.

**Q3: What's the role of the dummy head and dummy tail nodes specifically, and could the cache work correctly without them?**
They eliminate special-casing for the first and last real nodes in every insert/remove operation — every real node always has a valid, non-null `.prev` and `.next` to work with. Without them, every `_remove` and `_add_to_front` call would need extra conditional logic to check "is this the actual head/tail of the list," adding complexity and more opportunities for bugs, especially around the edge cases of an empty cache or a cache with exactly one item.
