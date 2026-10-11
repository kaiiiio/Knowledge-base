# Swap Nodes in Pairs

Simple words, step by step.

## The question
Given a linked list, swap every two adjacent nodes: `1 -> 2 -> 3 -> 4` becomes `2 -> 1 -> 4 -> 3`. You may not just swap the `.val` fields — the actual nodes must be rewired (a common, important constraint this problem is specifically designed to test).

## The idea
This is a special case of "Reverse Nodes in K-Group" (file 66) with `k = 2` — but it's worth solving directly since the smaller scale makes the pointer bookkeeping much easier to fully understand before tackling the general k-group version.

```python
def swap_pairs(head):
    dummy = ListNode(0)
    dummy.next = head
    prev = dummy

    while prev.next and prev.next.next:
        first = prev.next
        second = first.next

        first.next = second.next     # first now points past second
        second.next = first           # second now points to first -- the swap!
        prev.next = second            # whoever came before now points to second (the new first of this pair)

        prev = first                   # move prev forward, past this now-swapped pair
    return dummy.next
```
```javascript
function swapPairs(head) {
    const dummy = new ListNode(0);
    dummy.next = head;
    let prev = dummy;

    while (prev.next && prev.next.next) {
        const first = prev.next;
        const second = first.next;

        first.next = second.next;     // first now points past second
        second.next = first;           // second now points to first -- the swap!
        prev.next = second;            // whoever came before now points to second

        prev = first;                   // move prev forward, past this now-swapped pair
    }
    return dummy.next;
}
```
**Speed**: O(n) time, O(1) extra space.

**Watching it work** on `1 -> 2 -> 3 -> 4`:
```
dummy -> 1 -> 2 -> 3 -> 4
prev=dummy: first=1, second=2
  1.next = 2.next = 3     -> dummy -> 1 -> 3 -> 4,  (2 is now dangling, about to be reattached)
  2.next = 1               -> 2 -> 1 -> 3 -> 4
  prev.next = 2             -> dummy -> 2 -> 1 -> 3 -> 4
  prev = 1 (first)

prev=1: first=3, second=4
  3.next = 4.next = None   -> 1 -> 3 (nothing after, temporarily)
  4.next = 3                -> 4 -> 3
  prev.next = 4              -> 1 -> 4 -> 3
  prev = 3

Final: dummy -> 2 -> 1 -> 4 -> 3   (matches expected output!)
```

## Rules to remember
- **The three reassignment lines must happen in exactly this order**: `first.next = second.next` MUST happen before `second.next = first` — if you reverse the order, `second.next` gets overwritten to `first` *before* you've saved what used to come after `second`, permanently losing the rest of the list.
- Using a **dummy head** here is what makes the very first pair swap (which changes what the "head" of the whole list is) handled identically to every other pair — without it, swapping the first pair would need a special case to update the external `head` variable.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Solve it recursively instead of iteratively
```python
def swap_pairs_recursive(head):
    if not head or not head.next:
        return head                  # 0 or 1 node -- nothing to swap, base case

    first = head
    second = head.next

    first.next = swap_pairs_recursive(second.next)   # recursively swap the REST of the list first
    second.next = first                                 # then attach this pair's swap on top

    return second                                        # second is now the head of this swapped pair
```
**The trap**: the recursive call must happen on `second.next` (everything AFTER this pair), and its result must be assigned to `first.next` — not the other way around. Getting the assignment order backward (attaching `second.next = first` before computing what the rest of the list should look like) silently produces a list where `first.next` still points at the old, un-swapped continuation.

### Twist 2: Swap nodes in pairs, but ONLY if both nodes in the pair have the SAME parity (both even values or both odd values) — otherwise leave that pair alone
```python
def swap_pairs_conditional(head):
    dummy = ListNode(0)
    dummy.next = head
    prev = dummy

    while prev.next and prev.next.next:
        first = prev.next
        second = first.next
        if (first.val % 2) == (second.val % 2):      # only swap if parities match
            first.next = second.next
            second.next = first
            prev.next = second
            prev = first
        else:
            prev = second                               # skip this pair unchanged, move past both
    return dummy.next
```
**The trap**: in the "don't swap" branch, `prev` must still advance **past both nodes** of the skipped pair (`prev = second`), not just one — forgetting this causes the next iteration to re-examine an already-processed node, potentially causing incorrect behavior or an infinite loop if the skip condition persists.

## Interview Q&A

**Q1: Why does the order of the three pointer reassignments matter so much in the iterative solution?**
Each reassignment can destroy information needed by a later step if done in the wrong order. `first.next = second.next` must happen first because it's the only remaining reference to "what comes after this pair" before `second.next` gets overwritten to point back at `first` — do it in the wrong order, and that reference to the rest of the list is permanently lost with no way to recover it.

**Q2: How is this problem related to "Reverse Nodes in K-Group" (file 66)?**
This is the special case where `k = 2` — the same fundamental idea (reverse a bounded segment, carefully reconnect it to its neighbors) applies, just simpler because a 2-element reversal only needs two pointers to track instead of the general k-group version's more involved bookkeeping. Solving this problem well is good practice for building the pointer-manipulation intuition the general k-group version needs.

**Q3: What is the key difference between swapping node VALUES versus swapping the actual NODES, and why does this problem usually require the latter?**
Swapping `.val` fields (`first.val, second.val = second.val, first.val`) is trivially easy but doesn't actually rearrange the list structure — the nodes stay in the same positions, only their stored values change places. Interviewers specifically ask for true node swapping (rewiring `.next` pointers) because it tests real pointer manipulation skill; if node identity matters elsewhere in a larger system (e.g., external references to specific node objects), only a true structural swap preserves correct behavior — simply swapping values would silently break anything relying on node identity.
