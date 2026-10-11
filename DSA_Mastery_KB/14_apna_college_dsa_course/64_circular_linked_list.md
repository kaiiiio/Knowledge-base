# Circular Linked List

Simple words, step by step.

## What is a circular linked list?
A regular linked list ends with `None`/`null`. A **circular** linked list has its last node point **back to the first node** instead — there is no "end," the list forms a loop. (Note: this is a deliberate design, different from the accidental "cycle bug" in files 57/60 — here, the loop is the intended structure, not an error to detect and remove.)

```
Regular:   A -> B -> C -> None
Circular:  A -> B -> C -> (back to A)
```

## Creating a circular linked list
```python
class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def make_circular(values):
    if not values:
        return None
    head = Node(values[0])
    curr = head
    for v in values[1:]:
        curr.next = Node(v)
        curr = curr.next
    curr.next = head          # the key step -- last node points back to head, not None
    return head
```
```javascript
function makeCircular(values) {
    if (values.length === 0) return null;
    const head = new Node(values[0]);
    let curr = head;
    for (let i = 1; i < values.length; i++) {
        curr.next = new Node(values[i]);
        curr = curr.next;
    }
    curr.next = head;           // the key step -- last node points back to head, not None
    return head;
}
```

## Traversing a circular linked list (the trap for beginners)
```python
def print_circular(head, count=None):
    if not head:
        return
    curr = head
    i = 0
    while True:
        print(curr.val, end=" ")
        curr = curr.next
        i += 1
        if curr == head or (count and i >= count):
            break               # MUST have an explicit stopping condition -- there is no natural "end"
```
**The trap**: a normal `while curr:` traversal loop (which works fine for a regular linked list) becomes an **infinite loop** on a circular list, because `curr` never becomes `None` — it just keeps cycling forever. Every traversal of a circular list needs an explicit stopping rule: either "stop when we get back to where we started" or "stop after visiting a known number of nodes."

## Why circular linked lists are genuinely useful (not just a trick question)
- **Round-robin scheduling** (like a CPU scheduler cycling through processes, or a multiplayer game cycling through players' turns) — naturally modeled as "go to the next node, and if you reach the end, wrap back to the start," which a circular list gives you for free.
- **Josephus Problem** (a classic puzzle: people in a circle eliminate every k-th person until one remains) — naturally modeled with a circular linked list, since "wrap around" is exactly the behavior needed.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Detect if a linked list is circular (vs a normal "cycle that doesn't include the head")
This is actually the exact same Floyd's Cycle Detection algorithm from files 57/60 — "circular" and "has a cycle" are detected identically (slow/fast pointers meeting). The distinction between a fully circular list (cycle includes the head) and a list with a cycle *somewhere in the middle* only matters if you need to find *where* the cycle starts (Phase 2 of Floyd's algorithm, covered in file 57) — detecting that a cycle exists at all uses identical code either way.

### Twist 2: Split a circular linked list into two halves, each also circular
```python
def split_circular(head):
    if not head:
        return None, None
    slow = fast = head
    while fast.next != head and fast.next.next != head:
        slow = slow.next
        fast = fast.next.next

    head1 = head
    head2 = slow.next

    if fast.next == head:              # odd number of nodes
        fast = fast.next
    fast.next = head2                    # close the loop for the second half
    slow.next = head1                    # close the loop for the first half
    return head1, head2
```
**The trap**: the loop condition (`fast.next != head and fast.next.next != head`) must check against `head`, not `None` — the standard fast/slow "find the middle" loop condition (`while fast and fast.next`) would never terminate on a circular list, since `fast` can never become `None`.

## Interview Q&A

**Q1: Why does a standard `while curr:` traversal loop infinite-loop on a circular linked list?**
Because `curr` is only ever reassigned to the next node in the circle — it visits every node repeatedly, forever, and is never assigned `None`, which is the only condition the loop checks for. Any traversal of a circular structure needs an explicit alternate stopping condition, typically "have I returned to my starting point?"

**Q2: Is detecting a circular linked list the same algorithm as detecting a "cycle" in a normal linked list (like in LeetCode 141)?**
Yes, mechanically identical — Floyd's slow/fast pointer technique detects the presence of *any* cycle, whether the entire list is circular (cycle includes the head) or only part of it loops back (cycle starts partway through). The algorithm doesn't need to know or care which case it is to successfully detect that a loop exists.
