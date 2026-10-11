# Transform a Binary Tree into a Sum Tree

Simple words, step by step.

## The question
Convert a binary tree in place so that **every node's new value equals the sum of all values in its original left and right subtrees** (the node's own original value is discarded, except leaves become `0`, since a leaf has no subtrees to sum).

## The idea
This must be done with a **postorder** traversal: process both children completely first (so their new "sum tree" values are finalized), THEN compute the current node's new value using the **original** values of its children, before overwriting them.

```python
def transform_to_sum_tree(root):
    def postorder(node):
        if not node:
            return 0
        old_val = node.val
        left_sum = postorder(node.left)       # recursively transforms left subtree, returns its ORIGINAL total sum
        right_sum = postorder(node.right)      # recursively transforms right subtree, returns its ORIGINAL total sum
        node.val = left_sum + right_sum         # NEW value = sum of original subtree values
        return old_val + left_sum + right_sum    # return the ORIGINAL total (needed by the parent's calculation)

    postorder(root)
    return root
```
```javascript
function transformToSumTree(root) {
    function postorder(node) {
        if (!node) return 0;
        const oldVal = node.val;
        const leftSum = postorder(node.left);     // recursively transforms left subtree, returns its ORIGINAL total sum
        const rightSum = postorder(node.right);    // recursively transforms right subtree, returns its ORIGINAL total sum
        node.val = leftSum + rightSum;               // NEW value = sum of original subtree values
        return oldVal + leftSum + rightSum;           // return the ORIGINAL total (needed by the parent's calculation)
    }

    postorder(root);
    return root;
}
```
**Speed**: O(n) — single postorder pass.

## Dry run
Tree: `10` is root, with children `-2` (left) and `6` (right). `-2` has children `8` (left) and `-4` (right). `6` has no children.
- `postorder(8)` → leaf, `left_sum=0, right_sum=0` → `node.val = 0`, returns `8 + 0 + 0 = 8`.
- `postorder(-4)` → leaf → `node.val = 0`, returns `-4`.
- `postorder(-2)`: `old_val = -2`, `left_sum = 8`, `right_sum = -4` → `node.val = 8 + (-4) = 4`, returns `-2 + 8 + (-4) = 2`.
- `postorder(6)` → leaf → `node.val = 0`, returns `6`.
- `postorder(10)`: `old_val = 10`, `left_sum = 2` (the ORIGINAL total of the left subtree, not its new value!), `right_sum = 6` → `node.val = 2 + 6 = 8`, returns `10 + 2 + 6 = 18`.
- Final tree: root's value becomes `8`, `-2`'s value becomes `4`, `8` and `-4` and `6` (the leaves) all become `0`.

## Rules to remember
- **The critical, easy-to-miss subtlety**: the value a node must use to compute its own new value is the ORIGINAL total sum of each child subtree — NOT each child's brand-new post-transformation value. This is why `postorder` must return `old_val + left_sum + right_sum` (the original total), even though it internally **overwrites** `node.val` to something completely different. Confusing "what gets returned" with "what gets stored" is the single most common bug in this problem.
- This must be postorder specifically (not preorder) because computing any node's new value genuinely requires first knowing the complete original totals of both of its subtrees — information only fully available after those subtrees have been entirely processed.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Transform using PREORDER instead — is it still correct?
```python
# Attempting preorder: compute node's new value FIRST, before recursing into children
def wrong_preorder_attempt(node):
    if not node:
        return 0
    old_val = node.val
    # PROBLEM: at this point, we don't yet know the children's ORIGINAL subtree sums,
    # because we haven't visited them yet -- there's no way to compute node.val correctly here.
```
**The trap**: this is a conceptual trap, not really fixable by adjusting code — preorder visits the parent before its children, but this problem's core requirement is fundamentally "children's information must be known before the parent can be computed," which is the literal definition of why postorder (not preorder) is the only traversal order that can solve this correctly in a single pass.

### Twist 2: Variant — "Sum Tree" that INCLUDES the node's own original value in its new value (not just children)
```python
def transform_include_self(root):
    def postorder(node):
        if not node:
            return 0
        left_sum = postorder(node.left)
        right_sum = postorder(node.right)
        total = node.val + left_sum + right_sum
        node.val = total                     # new value INCLUDES the original self value too
        return total
    postorder(root)
    return root
```
**The trap**: this is a genuinely different (and actually simpler) problem — it's just "every node's new value = sum of its ENTIRE original subtree including itself." Always carefully re-read the problem statement to confirm whether the node's own original value is included or explicitly excluded from its own new value, since both variants are common and the distinction changes the formula by exactly one term (`+ old_val` or not), easy to misread under interview pressure.

## Interview Q&A

**Q1: Why must this transformation use postorder traversal specifically, and not preorder or inorder?**
Because computing any single node's new value requires already knowing the original total sum of both its left and right subtrees in full — information that is only completely available once those subtrees have been fully, recursively processed. Postorder is the only traversal order that visits both children (and everything beneath them) entirely before visiting the current node, which exactly matches this dependency requirement.

**Q2: Why does the function return `old_val + left_sum + right_sum` (the ORIGINAL total) even though it has already overwritten `node.val` to something else earlier in the same function?**
Because the parent one level up needs to know the complete, original sum of this entire subtree (its own original value plus the original sums of everything below it) in order to correctly compute its own new value — the fact that `node.val` was overwritten to the "sum tree" value is irrelevant to that calculation, since the parent's formula operates on the *original* totals, not the post-transformation ones. Returning the pre-overwrite total (captured in `old_val` before it's reassigned) rather than the newly-assigned `node.val` is essential to correctness.

**Q3: What subtle bug would occur if, instead of saving `old_val` first, the code read `node.val` for its return value AFTER the overwrite line?**
It would return the brand-new sum-tree value instead of the original total, which is wrong information for the parent's calculation — the parent needs "how much value, in total, originally existed in this subtree" to correctly sum its own children, not "what this subtree's nodes have now been transformed into." This would silently corrupt every ancestor's computed value further up the tree, producing wrong results that might not be obviously wrong just by looking at the immediate output, making it a particularly sneaky bug to track down.
