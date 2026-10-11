# Merge Two Sorted Lists

> Full write-up: `02_linked_lists/02_linked_lists_COMPLETE.md`, Level 2 — "Merge Two Sorted Lists". Core trick: a dummy head node + repeatedly attaching whichever current node is smaller, in O(n+m) time and O(1) extra space (reusing existing nodes, not allocating new ones).

## Twisted Tricky Examples (with Solutions)

### Twist 1: Merge K sorted lists (not just two)
This is a distinct, harder problem — full treatment with Brute/Better/Optimal (naive sort, repeated pairwise merge, and the optimal min-heap approach) is in `02_linked_lists/02_linked_lists_COMPLETE.md`, Level 3 — "Merge k Sorted Lists." **The trap**: repeatedly applying the two-list merge one list at a time (`result = merge(result, lists[i])` in a loop) is correct but only O(N×k), not the optimal O(N log k) a min-heap gives — many candidates stop at the "Better" solution without being pushed to find the heap-based optimal.

### Twist 2: Merge two sorted DOUBLY linked lists (must also fix `prev` pointers)
```python
def merge_two_doubly(l1, l2):
    dummy = DoublyListNode(0)
    tail = dummy
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next = l1
            l1.prev = tail           # extra step vs singly-linked: fix the backward pointer too
            l1 = l1.next
        else:
            tail.next = l2
            l2.prev = tail
            l2 = l2.next
        tail = tail.next
    remaining = l1 if l1 else l2
    tail.next = remaining
    if remaining:
        remaining.prev = tail
    return dummy.next
```
**The trap**: forgetting `l1.prev = tail` (or the equivalent for `l2`) leaves the merged list's backward links pointing at stale, pre-merge predecessors — forward traversal of the result looks perfectly correct, masking the bug until someone tries to traverse backward.

### Twist 3: Merge two sorted lists, but remove duplicates in the process
```python
def merge_no_duplicates(l1, l2):
    dummy = ListNode(0)
    tail = dummy
    while l1 and l2:
        if l1.val < l2.val:
            smaller = l1; l1 = l1.next
        elif l2.val < l1.val:
            smaller = l2; l2 = l2.next
        else:                           # EQUAL values -- advance BOTH, use only one
            smaller = l1
            l1 = l1.next
            l2 = l2.next
        if tail is dummy or tail.val != smaller.val:
            tail.next = smaller
            tail = tail.next
    remaining = l1 if l1 else l2
    while remaining:
        if tail is dummy or tail.val != remaining.val:
            tail.next = remaining
            tail = tail.next
        remaining = remaining.next
    tail.next = None
    return dummy.next
```
**The trap**: the "skip if equal to the last attached value" check (`tail.val != smaller.val`) must also guard against comparing to the dummy node's placeholder value — using `tail is dummy` as an explicit first condition avoids a subtle bug where a real value of `0` could accidentally match the dummy's default `0` value and get wrongly skipped.

## Interview Q&A

**Q1: Why is a dummy head node used here instead of tracking the real head directly?**
Without knowing in advance which list's first node will be smaller, you'd need an extra `if` to decide what the real head of the merged list should be. A dummy node sidesteps this entirely — `dummy.next` always correctly points to the true head once merging is done, regardless of which list contributed the first node.

**Q2: Why is this O(n + m) and not O(n × m) or O((n+m) log(n+m))?**
Because the merge only ever moves forward through each list once — every node from both lists is visited and attached exactly one time, for a total of `n + m` node visits. There's no re-scanning, re-sorting, or nested comparison against every other node — this is strictly better than approaches that would dump both lists into an array and sort it (which would cost O((n+m) log(n+m))).
