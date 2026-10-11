# BST Iterator

Simple words, step by step.

## The question
Design a class that supports iterating over a BST's values **in sorted (inorder) order**, with two operations: `next()` (returns the next smallest value) and `hasNext()` (returns whether more values remain) — both operations should ideally run in O(1) **amortized** time, and the total extra space should be O(h), not O(n).

## Why "just precompute the whole inorder list upfront" is not the expected answer
It works and is O(n) time overall, but uses O(n) space, and defeats the purpose of calling it an "iterator" — a true iterator should produce values lazily, on demand, without needing to know or store the entire sequence in advance. The expected solution uses O(h) space instead of O(n).

## The idea: controlled, lazy version of the iterative inorder traversal (file 85, Twist 1)
Maintain an explicit stack, pre-populated with the leftmost path from the root. Each `next()` call pops the top (the current smallest remaining value), then pushes that popped node's right subtree's leftmost path onto the stack, preparing for the following call.

```python
class BSTIterator:
    def __init__(self, root):
        self.stack = []
        self._push_left_path(root)

    def _push_left_path(self, node):
        while node:
            self.stack.append(node)
            node = node.left

    def next(self):
        node = self.stack.pop()                 # the current smallest remaining value
        self._push_left_path(node.right)          # prepare the stack for the NEXT call
        return node.val

    def has_next(self):
        return len(self.stack) > 0
```
```javascript
class BSTIterator {
    constructor(root) {
        this.stack = [];
        this._pushLeftPath(root);
    }

    _pushLeftPath(node) {
        while (node) {
            this.stack.push(node);
            node = node.left;
        }
    }

    next() {
        const node = this.stack.pop();             // the current smallest remaining value
        this._pushLeftPath(node.right);               // prepare the stack for the NEXT call
        return node.val;
    }

    hasNext() {
        return this.stack.length > 0;
    }
}
```
**Speed**: `next()` is O(1) **amortized** — a single call might take up to O(h) time (if it needs to push a long left path), but across all `n` calls over the iterator's lifetime, each node is pushed and popped exactly once total, so the TOTAL work across all calls is O(n), giving O(n)/n = O(1) amortized per call. `hasNext()` is always O(1). **Space**: O(h) — the stack never holds more than one path's worth of ancestors at any given time.

## Why this achieves O(h) space, not O(n)
Unlike precomputing the entire inorder list (O(n) space), the stack at any moment only contains the "pending ancestors" needed to eventually reach further-right values — at most, this is bounded by the tree's height, since the stack essentially represents "the path from the root down to the current position," not the entire remaining sequence.

## Rules to remember
- **This is "amortized analysis," the same concept explicitly introduced for dynamic array resizing and queue-via-two-stacks** — a single `next()` call's cost varies (sometimes O(1), sometimes up to O(h)), but the TOTAL cost summed across all calls is bounded by O(n), which is what justifies calling each individual call "O(1) amortized."
- The `_push_left_path` helper is literally the "go left, pushing" half of the iterative inorder traversal template from file 85 — recognizing this connection means the BST Iterator isn't a new technique, just that same template refactored to pause and resume across multiple separate method calls instead of running to completion in one function call.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Add a `peek()` method — see the next value WITHOUT consuming it
```python
class BSTIteratorWithPeek(BSTIterator):
    def peek(self):
        return self.stack[-1].val          # top of stack IS the next value to be returned by next() -- just don't pop it
```
**The trap**: this is almost trivial given the existing design — the top of the stack always represents exactly "the next value `next()` would return," so peeking requires no new logic at all, just reading `stack[-1]` instead of popping it; this simplicity is itself a reward for having designed the underlying stack-based approach correctly in the first place.

### Twist 2: Support `hasNext()` and `next()` on TWO BST iterators simultaneously, interleaved, to merge two BSTs' sorted outputs lazily (without upfront full extraction, unlike file 105)
```python
def merge_bsts_lazily(root1, root2):
    it1, it2 = BSTIterator(root1), BSTIterator(root2)
    result = []
    v1 = it1.next() if it1.has_next() else None
    v2 = it2.next() if it2.has_next() else None
    while v1 is not None or v2 is not None:
        if v2 is None or (v1 is not None and v1 <= v2):
            result.append(v1)
            v1 = it1.next() if it1.has_next() else None
        else:
            result.append(v2)
            v2 = it2.next() if it2.has_next() else None
    return result
```
**The trap**: this demonstrates the real practical value of a true O(h)-space iterator — file 105's merge approach needed O(m+n) space to fully extract both trees' inorder sequences upfront before merging; using two BST Iterators instead, values are pulled lazily one at a time from each tree as needed by the merge comparison, reducing total extra space to O(h1 + h2) instead of O(m + n) — a meaningful improvement when the trees are large but reasonably balanced.

## Interview Q&A

**Q1: Why is "precompute the full inorder list in the constructor, then just return values from an index counter" considered an inferior solution, even though it technically satisfies the O(1)-per-call time requirement?**
Because it uses O(n) space immediately upon construction, regardless of how many `next()` calls actually end up being made — if the iterator is created but only a few values are ever requested before it's discarded, that upfront O(n) work and space was entirely wasted. A true lazy iterator, by contrast, only does the work needed to produce each value right when it's requested and uses only O(h) space at any point in time, which is a meaningfully better space guarantee and better reflects genuine "on-demand" iterator semantics rather than disguising an eager precomputation as if it were lazy.

**Q2: Explain precisely why `next()` is described as O(1) "amortized" rather than simply O(1) — what's the distinction, and why does it still hold?**
A single `next()` call's actual cost varies: if the popped node has no right subtree, the call does O(1) work; but if the popped node has a right subtree with a long leftmost path, pushing that entire path costs up to O(h) for that one call. However, across the ENTIRE lifetime of the iterator (all `n` eventual `next()` calls combined), every single node in the tree gets pushed onto the stack exactly once and popped exactly once, total — meaning the sum of all individual push/pop operations across every call is bounded by O(n). Dividing this total O(n) work across n calls gives an average of O(1) work per call, which is the precise meaning of "amortized" — some individual calls cost more, but the average, spread across all calls, is constant.

**Q3: How does having a true lazy BST Iterator (O(h) space) provide a genuine practical advantage over the "convert to sorted list, then merge" approach from file 105, specifically when merging two BSTs?**
File 105's approach requires fully materializing both BSTs' complete inorder sequences as lists before merging can even begin, costing O(m + n) space upfront regardless of whether the full merged result is ever actually needed in its entirety. Using two BST Iterators instead, values are pulled one at a time, lazily, exactly as the merge comparison logic needs them — meaning the extra space used at any point is bounded by O(h1 + h2) (just the two iterators' internal stacks), not O(m + n). This becomes a meaningful practical difference when working with large, well-balanced trees, or in scenarios where only a portion of the merged output is ultimately needed (e.g., only the first k merged values), since the lazy approach would only do proportional work, while the eager approach always pays the full O(m+n) upfront cost regardless.
