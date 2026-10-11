# Middle of a Linked List

> Full write-up: `02_linked_lists/02_linked_lists_COMPLETE.md`, Level 1 — "Find the Middle of a Linked List". Core trick: Fast & Slow pointers — `fast` moves 2 steps for every 1 step of `slow`; when `fast` reaches the end, `slow` sits at the middle.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Even-length list — which "middle" do you return, and how do you control it?
A list of 4 nodes has two middles (2nd and 3rd). The fast/slow trick as usually written returns the **second** middle:
```python
def middle_second(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow
```
To get the **first** middle instead, change the loop condition slightly so `fast` stops one step earlier:
```python
def middle_first(head):
    slow = fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    return slow
```
**The trap**: candidates often don't realize there's a meaningful, controllable choice here — interviewers sometimes specifically ask "which middle, for an even-length list?" to see if you understand *why* the loop condition decides this, rather than just reciting the pattern from memory.

### Twist 2: Delete the middle node (not just find it)
```python
def delete_middle(head):
    if not head or not head.next:
        return None                   # 0 or 1 node -- deleting the middle empties the list
    slow, fast = head, head.next.next   # start fast one step ahead -- finds slow landing on the node BEFORE the middle
    prev = head
    while fast and fast.next:
        prev = slow
        slow = slow.next
        fast = fast.next.next
    prev.next = slow.next              # unlink the middle node
    return head
```
**The trap**: to delete a node, you need a reference to the node *before* it (to rewire `.next`) — a plain middle-finder that lands exactly ON the middle node doesn't give you that for free; the pointer setup has to be adjusted (starting `fast` one step ahead, as shown) so that `prev` naturally ends up trailing one behind `slow`.

## Interview Q&A

**Q1: Why does starting `fast` at `head` vs `head.next` change which middle gets returned?**
It shifts how many total steps `fast` can take before `fast` or `fast.next` becomes `None`, which directly determines how many steps `slow` takes before the loop stops. For an even-length list, this one-step head start is exactly the difference between landing on the first or second of the two middle candidates.

**Q2: Could you solve "find the middle" with two passes (count length, then walk length/2) instead of fast/slow pointers — what's the trade-off?**
Yes, and it's simpler to reason about, but it requires traversing the list **twice** (once to count, once to walk to the middle) versus the fast/slow approach's single pass. Both are O(n) time, but fast/slow does it in one traversal instead of two — a real, if modest, efficiency win, and the more commonly expected "optimal" answer in interviews.
