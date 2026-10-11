# Largest BST Subtree in a Binary Tree

Simple words, step by step.

## The question
Given an arbitrary binary tree (NOT necessarily a valid BST overall), find the size of the **largest subtree** that happens to be a valid BST.

## Why a naive approach is too slow
A naive approach would run "is this subtree a valid BST" (file 100's check) independently at every single node — O(n) work per check, across n nodes, giving O(n²) overall. The optimal solution needs to do better, in a single pass.

## The idea: postorder traversal, returning rich information from every node
Similar to file 88's diameter problem (return more than the obvious value) and file 93's sum tree problem, each recursive call needs to return several pieces of information simultaneously: **is this subtree a valid BST**, **its size** (if valid), and its **min and max values** (needed by the parent to check ITS OWN validity against this subtree).

```python
class Result:
    def __init__(self, is_bst, size, min_val, max_val):
        self.is_bst = is_bst
        self.size = size
        self.min_val = min_val
        self.max_val = max_val

def largest_bst_subtree(root):
    max_size = [0]

    def postorder(node):
        if not node:
            return Result(True, 0, float('inf'), float('-inf'))     # empty subtree: vacuously a valid BST

        left = postorder(node.left)
        right = postorder(node.right)

        if (left.is_bst and right.is_bst and
                left.max_val < node.val < right.min_val):
            size = left.size + right.size + 1
            max_size[0] = max(max_size[0], size)
            return Result(True, size, min(left.min_val, node.val), max(right.max_val, node.val))

        # this subtree itself is NOT a valid BST -- propagate failure upward
        return Result(False, 0, float('-inf'), float('inf'))

    postorder(root)
    return max_size[0]
```
```javascript
function largestBSTSubtree(root) {
    let maxSize = 0;

    function postorder(node) {
        if (!node) {
            return { isBst: true, size: 0, minVal: Infinity, maxVal: -Infinity };   // empty subtree: vacuously valid BST
        }

        const left = postorder(node.left);
        const right = postorder(node.right);

        if (left.isBst && right.isBst && left.maxVal < node.val && node.val < right.minVal) {
            const size = left.size + right.size + 1;
            maxSize = Math.max(maxSize, size);
            return {
                isBst: true,
                size,
                minVal: Math.min(left.minVal, node.val),
                maxVal: Math.max(right.maxVal, node.val),
            };
        }

        // this subtree itself is NOT a valid BST -- propagate failure upward
        return { isBst: false, size: 0, minVal: -Infinity, maxVal: Infinity };
    }

    postorder(root);
    return maxSize;
}
```
**Speed**: O(n) — single postorder pass, each node doing O(1) work using already-computed children results.

## Why the "failure" sentinel values are deliberately inverted (`-inf` for min, `inf` for max`)
Once a subtree is known to be invalid, its reported min/max values are set specifically to make the PARENT's check automatically fail too — using `min_val = -inf, max_val = inf` for a failed subtree guarantees that `left.max_val < node.val` (when the LEFT side failed) or `node.val < right.min_val` (when the RIGHT side failed) will be false at the parent level, correctly propagating the "not a valid BST" signal upward without needing a separate explicit check.

## Rules to remember
- **This is the most information-dense "return multiple things from one recursive call" problem in the entire module** — combining the "return more than one value" idiom from diameter (file 88) with the BST-validity range-checking idiom from Validate BST (file 100), fused into a single postorder pass.
- The deliberately inverted sentinel values for failed subtrees (`-inf` max, `inf` min) is a clever trick worth specifically remembering — it lets failure propagate automatically through the same comparison logic used for success, without needing a separate branch purely to handle "my child already failed."

## Twisted Tricky Examples (with Solutions)

### Twist 1: Return the ROOT of the largest BST subtree, not just its size
```python
def largest_bst_subtree_with_root(root):
    max_size = [0]
    best_root = [None]

    def postorder(node):
        if not node:
            return Result(True, 0, float('inf'), float('-inf'))
        left = postorder(node.left)
        right = postorder(node.right)
        if left.is_bst and right.is_bst and left.max_val < node.val < right.min_val:
            size = left.size + right.size + 1
            if size > max_size[0]:
                max_size[0] = size
                best_root[0] = node          # track the actual node, not just the size
            return Result(True, size, min(left.min_val, node.val), max(right.max_val, node.val))
        return Result(False, 0, float('-inf'), float('inf'))

    postorder(root)
    return best_root[0]
```
**The trap**: this is a minor, low-risk extension — simply tracking the `node` reference alongside the size comparison, rather than discarding it; a common oversight would be updating `max_size` but forgetting to simultaneously update the tracked root reference, leaving them out of sync.

### Twist 2: Values are NOT guaranteed unique — does `left.max_val < node.val < right.min_val` (strict inequality) still correctly handle this?
**The trap**: if duplicate values are allowed in general (non-BST-subtree) parts of the tree, the strict inequality correctly continues to enforce the "no duplicates within a valid BST subtree" convention established back in file 98 — any subtree containing a value equal to its own boundary-neighbor correctly gets REJECTED as not a valid BST by the strict comparison, consistent with the standard convention that BSTs (as defined in this course) don't contain duplicate values.

## Interview Q&A

**Q1: Why does checking "is this subtree a valid BST" independently at every node lead to an O(n²) algorithm, and how does the postorder approach avoid this?**
Checking validity independently at each of the n nodes, where each individual check itself costs O(size of that subtree) in the worst case, sums to O(n²) total work across a skewed or adversarial tree shape (similar to the diameter problem's naive O(n²) trap in file 88). The postorder approach avoids this by computing each node's validity, size, min, and max using ONLY its two children's already-computed results (O(1) additional work per node), rather than re-scanning the entire subtree from scratch at every single node — the same "compute information once, reuse it going up" principle used throughout this module's optimal postorder-based solutions.

**Q2: Why are the failure-case sentinel values intentionally inverted (minVal = infinity, maxVal = negative infinity, or similar) rather than, say, just returning null or zero?**
Because the parent's validity check (`left.maxVal < node.val && node.val < right.minVal`) is a pure comparison-based check with no special-casing for "did my child fail" — by setting a failed subtree's reported maxVal to negative infinity and minVal to positive infinity, any subsequent comparison involving those failed values is mathematically guaranteed to evaluate to false, automatically causing the parent's own validity check to fail too, without needing an extra explicit "if child failed, I also fail" branch cluttering the logic.

**Q3: Why must empty subtrees (null nodes) be treated as "vacuously valid BSTs" with minVal = infinity and maxVal = negative infinity, rather than some other sentinel choice?**
A null/empty subtree genuinely has no values, so it trivially satisfies "all values are ordered correctly" — there's nothing to violate, making `is_bst = True` the logically correct answer. The specific choice of minVal = infinity and maxVal = negative infinity for this EMPTY (not failed) case is what allows a leaf node's single-node check to pass naturally: comparing a leaf's own value against its (empty) children's min/max, `-infinity < leaf.val < infinity` is always true by construction, correctly validating every leaf as a trivial valid BST of size 1, without needing special leaf-specific logic separate from the general recursive case.
