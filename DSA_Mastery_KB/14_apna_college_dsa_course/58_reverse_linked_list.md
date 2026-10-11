# Reverse a Linked List

> Full write-up (Python + JavaScript, dry run, tough-portion callout): `02_linked_lists/02_linked_lists_COMPLETE.md`, Level 1 — "Reverse a Linked List (LeetCode 206)". The core trick: three pointers (`prev`, `curr`, `next_temp`), and **always save `next` before overwriting `curr.next`** — the one rule that prevents every reversal bug.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Reverse only a SUB-PORTION of the list (between position `left` and `right`)
```python
def reverse_between(head, left, right):
    dummy = ListNode(0)
    dummy.next = head
    prev = dummy
    for _ in range(left - 1):
        prev = prev.next              # walk to just before the sub-portion

    curr = prev.next
    for _ in range(right - left):
        next_temp = curr.next
        curr.next = next_temp.next
        next_temp.next = prev.next
        prev.next = next_temp          # classic "insert at front of sub-list" reversal trick
    return dummy.next
```
```javascript
function reverseBetween(head, left, right) {
    const dummy = new ListNode(0);
    dummy.next = head;
    let prev = dummy;
    for (let i = 0; i < left - 1; i++) {
        prev = prev.next;               // walk to just before the sub-portion
    }

    let curr = prev.next;
    for (let i = 0; i < right - left; i++) {
        const nextTemp = curr.next;
        curr.next = nextTemp.next;
        nextTemp.next = prev.next;
        prev.next = nextTemp;             // classic "insert at front of sub-list" reversal trick
    }
    return dummy.next;
}
```
**The trap**: this is NOT "reverse the whole list, then splice the ends back" — that approach is much harder to get right. The clean trick is: `curr` stays fixed as the sub-list's *new tail*, and each iteration pulls the *next* node and re-inserts it right after `prev` (the position just before the sub-list) — effectively building the reversed portion one node at a time, at the front of where the reversal started.

### Twist 2: Reverse the list, but it's a DOUBLY linked list (must fix `prev` pointers too, not just `next`)
```python
def reverse_doubly(head):
    curr = head
    new_head = head
    while curr:
        curr.prev, curr.next = curr.next, curr.prev   # swap prev and next on EVERY node
        new_head = curr
        curr = curr.prev           # note: curr.prev is now the OLD curr.next, due to the swap above
    return new_head
```
**The trap**: in a doubly linked list, reversing means swapping `prev` and `next` on every single node, not just rewiring `next` pointers like a singly linked list — forgetting to also fix `prev` leaves the list's backward traversal broken even though forward traversal looks correct.

## Interview Q&A

**Q1: Why must `next_temp` be saved before reassigning `curr.next`?**
Once `curr.next = prev` executes, the original link to the rest of the list is gone — there is no other reference to it anywhere. Without saving it first, the rest of the list becomes permanently unreachable, and the reversal cannot continue.

**Q2: Could you reverse a linked list using recursion instead of the iterative three-pointer approach? What's the trade-off?**
Yes: recursively reverse the rest of the list first, then fix the current node's link to point backward. The trade-off is space — recursion uses O(n) call-stack space (one frame per node), versus the iterative version's O(1) space, making the iterative approach generally preferred for long lists where stack depth could be a concern.
