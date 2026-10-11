# Doubly Linked List

> Core implementation (node class, O(1) `remove_node` given a reference, the LRU-Cache connection) already fully covered: `02_linked_lists/02_linked_lists_COMPLETE.md`, Level 0 — "Warm-up 4: The Doubly Linked List." That section is the primary reference; this file adds course-specific tricky extensions.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Insert a node BEFORE a given node (not just at the tail)
```python
def insert_before(node, new_val):
    new_node = DoublyListNode(new_val)
    prev_node = node.prev

    new_node.prev = prev_node
    new_node.next = node
    node.prev = new_node
    if prev_node:
        prev_node.next = new_node
    return new_node   # caller must update head if prev_node was None
```
**The trap**: four pointer assignments are needed (`new_node.prev`, `new_node.next`, `node.prev`, `prev_node.next`), and they must happen in an order that doesn't overwrite a reference before it's been used — assigning `node.prev = new_node` too early, before reading the old `node.prev` into `prev_node`, loses the reference needed to fix the node on the other side.

### Twist 2: Implement a Doubly Linked List with O(1) "move to front" (the engine behind LRU Cache)
```python
class DLLWithMoveToFront:
    def __init__(self):
        self.head = DoublyListNode(0)   # dummy head
        self.tail = DoublyListNode(0)   # dummy tail
        self.head.next = self.tail
        self.tail.prev = self.head

    def remove(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def add_to_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def move_to_front(self, node):
        self.remove(node)         # O(1) -- no searching needed, we already have the reference
        self.add_to_front(node)    # O(1)
```
**The trap, and why this matters**: using **dummy head AND dummy tail** sentinel nodes (not just a dummy head) eliminates every edge case around "is this the first/last real node" — `remove` and `add_to_front` never need a single `if node is self.real_head` check, because the dummies guarantee every real node always has a valid `.prev` and `.next` to work with. This exact structure, combined with a hash map of key→node, is literally the standard implementation of an **LRU Cache** (covered in Module 6's "Implement LRU Cache" lecture).

## Interview Q&A

**Q1: Why does a doubly linked list allow O(1) deletion given a node reference, while a singly linked list needs O(n) for the same operation?**
Deleting a node requires rewiring its *predecessor's* `next` pointer to skip over it. A doubly linked list node already carries a direct reference to its predecessor via `.prev` — no search needed. A singly linked list node has no way to reach its predecessor directly, so finding it requires walking from the head, which is O(n).

**Q2: Why use two dummy sentinel nodes (head AND tail) instead of just one dummy head?**
A single dummy head still leaves the *tail* end as a special case — inserting or removing at the end still needs to check "is this the last node?" A dummy tail sentinel removes that special case too, so every real node, including the first and last, has guaranteed non-null `.prev` and `.next` references to work with, making insert/remove logic completely uniform regardless of position.
