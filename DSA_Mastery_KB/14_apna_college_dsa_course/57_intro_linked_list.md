# Introduction to Linked List

Simple words, step by step.

> **Full deep-dive already written**: `02_linked_lists/02_linked_lists_COMPLETE.md` (this knowledge base's dedicated Linked Lists module) covers this topic — and the next four lectures in this course's order (Reverse, Middle, Cycle Detection, Merge Two Sorted Lists) — in complete Level 0→3 depth, with Python and JavaScript, edge cases, and a "why" for every technique. Rather than duplicate it here, this file is a short bridge pointing you to the right place, plus the course-specific framing.

## The quick version
A linked list is a chain of nodes, each holding a value and a pointer to the next node, scattered anywhere in memory (unlike an array's contiguous block). See `02_linked_lists_COMPLETE.md`'s **Level 0 — Absolute Basics** section for:
- The full array-vs-linked-list trade-off table (access speed vs insert/delete speed)
- The `ListNode` class and basic traversal/search/insert/delete operations
- The **Dummy Head trick** — the single most useful habit for avoiding head-special-case bugs in every linked list problem

## Where this course's next lectures map to
| This course's lecture | Covered in `02_linked_lists_COMPLETE.md` section |
|---|---|
| Reverse a Linked List | Level 1 — "Reverse a Linked List (LeetCode 206)" |
| Middle of a Linked List | Level 1 — "Find the Middle of a Linked List" |
| Detect & Remove Cycle | Level 1 — "Linked List Cycle (LeetCode 141)" (detection); removal is a direct extension — see the tricky example below |
| Merge Two Sorted Lists | Level 2 — "Merge Two Sorted Lists" |

## Bonus: Detecting AND Removing a cycle (the course asks for both, the base file only covers detection)
Once Floyd's algorithm (slow/fast pointers) finds that `slow == fast` somewhere inside a cycle, finding the cycle's **starting node** (so it can be removed by cutting the link there) needs one more clever step:
```python
def detect_and_remove_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            break
    else:
        return head          # no cycle found -- nothing to remove

    # Reset one pointer to head; move both one step at a time -- they meet AT the cycle's start.
    slow = head
    while slow.next != fast.next:
        slow = slow.next
        fast = fast.next
    fast.next = None           # cut the cycle right before the starting node
    return head
```
```javascript
function detectAndRemoveCycle(head) {
    let slow = head, fast = head;
    let hasCycle = false;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) {
            hasCycle = true;
            break;
        }
    }
    if (!hasCycle) {
        return head;            // no cycle found -- nothing to remove
    }

    slow = head;
    while (slow.next !== fast.next) {
        slow = slow.next;
        fast = fast.next;
    }
    fast.next = null;            // cut the cycle right before the starting node
    return head;
}
```
**Why resetting one pointer to `head` and moving both one step at a time finds the cycle's start**: this relies on a mathematical property of Floyd's algorithm — the distance from `head` to the cycle's start equals the distance from the meeting point to the cycle's start (going around the loop). This is a famous, non-obvious result worth knowing by name ("Floyd's Cycle Detection, Phase 2") rather than re-deriving from scratch under interview pressure.

## Interview Q&A

**Q1: Why does moving one pointer back to `head` (after the initial meeting point) correctly find the cycle's starting node?**
This follows from the arithmetic of how far `slow` and `fast` have traveled when they meet. If the cycle starts at distance `a` from the head and has length `c`, it can be shown that `a` equals the remaining distance from the meeting point back around to the cycle start, modulo the cycle length. Resetting one pointer to `head` and advancing both at the same speed exploits this equality — they're mathematically guaranteed to meet exactly at the cycle's entry point.

**Q2: After removing a cycle, is the linked list guaranteed to be undamaged otherwise?**
Yes — cutting `fast.next = None` at the correct node only removes the single link that created the loop; every other node and link in the list is untouched. The list becomes a normal, finite, acyclic linked list ending at the node where the cut was made.
