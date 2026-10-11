# Detect & Remove Cycle in Linked List

> Full write-up: `57_intro_linked_list.md` (this folder) covers detection AND removal in full, including the "why does resetting one pointer to head work" proof. `02_linked_lists/02_linked_lists_COMPLETE.md` Level 1 covers pure detection with a visual walkthrough.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Find the LENGTH of the cycle (not just detect/remove it)
Once `slow` and `fast` meet inside the cycle, keep one pointer moving and count steps until it returns to the same meeting point — that count is the cycle's length.
```python
def cycle_length(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            length = 1
            temp = slow.next
            while temp != slow:
                temp = temp.next
                length += 1
            return length
    return 0   # no cycle
```
**The trap**: you cannot find the cycle length by comparing node *values* — multiple nodes could share the same value. You must compare node *references/identity* (`temp != slow`, not `temp.val != slow.val`), walking by actual pointer identity.

### Twist 2: Determine if TWO separate linked lists intersect (share a common tail), without modifying either list
This looks unrelated but uses the exact same two-pointer mindset: run two pointers, one starting at each list's head; when a pointer reaches the end of its list, redirect it to the *other* list's head. If the lists intersect, both pointers meet exactly at the intersection point (because switching lists equalizes the total distance each pointer travels before reaching the meeting point).
```python
def get_intersection(headA, headB):
    p1, p2 = headA, headB
    while p1 != p2:
        p1 = p1.next if p1 else headB
        p2 = p2.next if p2 else headA
    return p1   # either the intersection node, or None if they never meet
```
**The trap**: this is a genuinely different problem from cycle detection (no loop exists here), but it's frequently grouped with cycle problems in interview prep because both rely on the same core insight: **two pointers covering carefully-equalized total distances are guaranteed to meet at a meaningful point** — recognizing this shared mathematical idea across "different-looking" problems is a strong signal.

## Interview Q&A

**Q1: Why can't you detect a cycle just by checking if you've seen a node's VALUE before?**
Because multiple distinct nodes can legitimately hold the same value — checking values would produce false positives on a perfectly valid, cycle-free list that just happens to repeat a value. Cycle detection must track node *identity* (memory reference), either via Floyd's two-pointer trick (no extra memory) or a hash set of visited node references (O(n) extra memory).

**Q2: What is the time and space complexity of Floyd's algorithm for cycle detection, and why is the space O(1)?**
Time is O(n) — in the worst case, the slow pointer traverses the entire list (and cycle) once before a meeting occurs. Space is O(1) because only two pointer variables are used, regardless of the list's length — no auxiliary data structure (like a hash set) is needed to remember visited nodes, which is precisely what makes this approach preferred over the simpler hash-set-based alternative.
