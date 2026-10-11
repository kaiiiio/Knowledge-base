# Reverse Nodes in K-Group

> Full write-up (four-pointer tracking, the full mechanism, tough-portion callout): `02_linked_lists/02_linked_lists_COMPLETE.md`, Level 3 — "Reverse Nodes in k-Group." Core idea: reverse exactly `k` nodes at a time, leaving any remaining group smaller than `k` untouched, carefully reconnecting each reversed group to its neighbors.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Reverse every group of k, but if the LAST group has fewer than k nodes, reverse it too anyway (a common variant)
Change the `get_kth_node` check: instead of returning early when fewer than `k` nodes remain, just reverse whatever is left.
```python
def reverse_k_group_always(head, k):
    def reverse_segment(start, end):
        prev, curr = None, start
        while curr != end:
            next_temp = curr.next
            curr.next = prev
            prev = curr
            curr = next_temp
        return prev

    def get_length(node):
        count = 0
        while node:
            count += 1
            node = node.next
        return count

    dummy = ListNode(0)
    dummy.next = head
    group_prev = dummy
    total_length = get_length(head)

    while total_length >= 1:
        kth_count = min(k, total_length)
        kth = group_prev.next
        for _ in range(kth_count - 1):
            kth = kth.next
        group_next = kth.next

        new_head = reverse_segment(group_prev.next, group_next)
        tail = group_prev.next
        group_prev.next = new_head
        tail.next = group_next

        group_prev = tail
        total_length -= kth_count

    return dummy.next
```
**The trap**: this requires precomputing the total list length upfront (`get_length`), because the reversal logic needs to know in advance whether the *final* group should be partially reversed (fewer than k nodes) versus the original problem's rule of leaving a short final group completely untouched — these are genuinely different problems with a one-word difference in their statement ("reverse" vs "leave untouched"), and conflating them is a very easy mistake.

### Twist 2: Reverse in groups of k, but SKIP every other group (reverse group 1, leave group 2 as-is, reverse group 3, ...)
```python
def reverse_alternating_k_group(head, k):
    def reverse_segment(start, count):
        prev, curr = None, start
        for _ in range(count):
            next_temp = curr.next
            curr.next = prev
            prev = curr
            curr = next_temp
        return prev, curr   # new head of reversed segment, and the node right after it

    def skip_segment(start, count):
        curr = start
        for _ in range(count):
            if not curr:
                break
            curr = curr.next
        return curr

    dummy = ListNode(0)
    dummy.next = head
    group_prev = dummy
    curr = head
    should_reverse = True

    while curr:
        if should_reverse:
            tail = curr
            new_head, next_group = reverse_segment(curr, k) if count_remaining(curr, k) >= 0 else (curr, curr)
            group_prev.next = new_head
            tail.next = next_group
            group_prev = tail
            curr = next_group
        else:
            for _ in range(k):
                if not curr:
                    break
                group_prev = curr
                curr = curr.next
        should_reverse = not should_reverse

    return dummy.next
```
**The trap**: alternating behavior between groups means you can no longer use a single, uniform loop body — tracking a `should_reverse` flag that flips after every group processed (reversed OR skipped) is essential, and forgetting to advance `group_prev` correctly during a *skipped* group (not just during reversed ones) breaks the final reconnection.

## Interview Q&A

**Q1: Why must you check if at least k nodes remain BEFORE reversing, rather than reversing greedily and fixing it up afterward?**
Because reversing a partial, final group (fewer than k nodes) and then "fixing it up" would require un-reversing already-mutated links, which is both wasteful and error-prone. It's structurally simpler and less bug-prone to look ahead first (`get_kth_node` walking k steps to check if a full group exists) and only commit to reversing once you know a full group is actually available.

**Q2: How does this problem relate to the basic "Reverse a Linked List" problem from file 58?**
It's the exact same three-pointer reversal mechanism (`prev`, `curr`, `next_temp`), just applied repeatedly to bounded segments of size `k` instead of the whole list at once, with the added complexity of correctly reconnecting each reversed segment's boundaries to its neighbors. Recognizing this as "the same reversal primitive, called in a loop with careful bookkeeping" rather than an entirely new algorithm is the key insight that makes this harder problem approachable.
