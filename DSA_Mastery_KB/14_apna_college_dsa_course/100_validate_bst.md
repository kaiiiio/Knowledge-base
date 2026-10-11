# Validate Binary Search Tree

Simple words, step by step.

## The question
Given a binary tree, determine whether it's a **valid** BST — meaning the ordering invariant (left subtree all smaller, right subtree all larger) holds at **every** node, recursively, throughout the entire tree.

## The classic bug: only checking immediate children
```python
# WRONG approach -- only compares a node to its direct children, missing violations further down
def is_valid_bst_WRONG(root):
    if not root:
        return True
    if root.left and root.left.val >= root.val:
        return False
    if root.right and root.right.val <= root.val:
        return False
    return is_valid_bst_WRONG(root.left) and is_valid_bst_WRONG(root.right)
```
**Why this is wrong**: consider a tree where root is `10`, with right child `15`, and `15` has a LEFT child `6`. Checking only immediate parent-child relationships: `10 < 15` ✓ (valid so far), `6 < 15` ✓ (valid locally) — but `6` is in the ROOT's right subtree, and the BST invariant requires everything in the root's right subtree to be **greater than 10**. `6` violates this, but a check that only looks at immediate parent-child pairs never catches it.

## The correct idea: pass down a valid RANGE (min, max) at every recursive call
```python
def is_valid_bst(root):
    def validate(node, low, high):
        if not node:
            return True
        if not (low < node.val < high):           # node must fit within the range inherited from ALL ancestors
            return False
        return (
            validate(node.left, low, node.val) and        # left subtree's upper bound tightens to node.val
            validate(node.right, node.val, high)             # right subtree's lower bound tightens to node.val
        )

    return validate(root, float('-inf'), float('inf'))
```
```javascript
function isValidBST(root) {
    function validate(node, low, high) {
        if (!node) return true;
        if (!(node.val > low && node.val < high)) {       // node must fit within the range inherited from ALL ancestors
            return false;
        }
        return (
            validate(node.left, low, node.val) &&          // left subtree's upper bound tightens to node.val
            validate(node.right, node.val, high)              // right subtree's lower bound tightens to node.val
        );
    }

    return validate(root, -Infinity, Infinity);
}
```
**Speed**: O(n) — every node visited once, carrying an ever-tightening valid range down from its ancestors.

## Alternative approach: inorder traversal must produce strictly increasing values
```python
def is_valid_bst_inorder(root):
    prev = [float('-inf')]      # use a mutable container to allow modification inside the nested function

    def inorder(node):
        if not node:
            return True
        if not inorder(node.left):
            return False
        if node.val <= prev[0]:          # current value must be strictly greater than the previous one visited
            return False
        prev[0] = node.val
        return inorder(node.right)

    return inorder(root)
```
```javascript
function isValidBSTInorder(root) {
    let prev = -Infinity;

    function inorder(node) {
        if (!node) return true;
        if (!inorder(node.left)) return false;
        if (node.val <= prev) return false;           // current value must be strictly greater than the previous one visited
        prev = node.val;
        return inorder(node.right);
    }

    return inorder(root);
}
```
**Speed**: O(n), and arguably more elegant — it directly leverages the single most important BST fact (inorder traversal is sorted) rather than reasoning about ranges explicitly.

## Rules to remember
- **This problem is the canonical trap for "only checking immediate parent-child relationships."** Recognizing why that naive approach fails — and being able to construct a concrete counterexample on the spot — is itself a strong interview signal.
- Two genuinely different, equally valid correct approaches exist: (1) pass down a shrinking valid `(low, high)` range, or (2) check that inorder traversal produces strictly increasing values. Both are O(n); which one feels more natural often depends on whether you're thinking "structurally" (range-based) or "sequence-based" (inorder-based) about the problem.
- **Strict inequality matters**: a BST typically does not allow duplicate values by convention (file 98's Twist 2) — using `<=` instead of `<` in the range check, or allowing `node.val == prev` in the inorder check, would incorrectly accept a tree with duplicate values as valid, when the intended definition usually disallows them.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Two nodes have been SWAPPED in an otherwise-valid BST — find and fix them
```python
def recover_bst(root):
    first = second = prev = None

    def inorder(node):
        nonlocal first, second, prev
        if not node:
            return
        inorder(node.left)
        if prev and prev.val > node.val:          # found a violation of increasing order
            if not first:
                first = prev             # first violation: the EARLIER node of the swapped pair
            second = node                  # always update -- handles both adjacent-swap and non-adjacent-swap cases
        prev = node
        inorder(node.right)

    inorder(root)
    first.val, second.val = second.val, first.val    # swap the values back
```
**The trap**: there are two sub-cases — if the swapped nodes are adjacent in inorder order, there's exactly ONE violation detected (`prev.val > node.val` happens once); if they're NOT adjacent, there are exactly TWO violations detected, and the fix requires taking the first node of the FIRST violation and the second node of the SECOND violation — using `first = prev` only on the very first violation found, but always updating `second = node` on every violation encountered, correctly handles both cases uniformly without needing separate branches.

### Twist 2: Validate a BST where values could be at the boundary of integer limits (edge case with the range approach)
**The trap**: using a placeholder "minimum possible value minus 1" as an initial lower bound (common in some languages to avoid using float infinity) can silently break if the tree actually legitimately contains that exact boundary value — using Python's `float('-inf')`/`float('inf')` (or equivalent) as the initial bounds, rather than a finite sentinel value like `-2**31`, sidesteps this entirely, since no real node value can ever equal actual infinity.

## Interview Q&A

**Q1: Why does checking only "is each node's value less than its direct right child, and greater than its direct left child" fail to correctly validate a BST?**
Because the BST invariant is transitive and applies to an entire subtree, not just immediate parent-child pairs — a node two or more levels down can locally satisfy its immediate parent's comparison while still violating the ordering requirement relative to a grandparent or higher ancestor. For example, a node in the root's right subtree must be greater than the root, not just greater than its own immediate parent — a check that only ever compares direct parent-child pairs has no mechanism to enforce constraints inherited from further up the tree.

**Q2: How does passing down a `(low, high)` range at every recursive call correctly capture the "transitive" nature of the BST invariant?**
Each node's valid range is inherited from its ancestors and then tightened before being passed to its own children — specifically, going left always lowers the upper bound to the current node's value (everything further left must be smaller than this node), and going right always raises the lower bound to the current node's value (everything further right must be larger). Because this range accumulates and tightens through every level of recursion, by the time any node is checked, its valid range correctly reflects every single ancestor's constraint, not just its immediate parent's.

**Q3: In the "two swapped nodes" variant, why does the fix for first/second need different update logic (`first` set only once, `second` updated every time)?**
Because when the swapped nodes are adjacent in the correct inorder sequence, exactly one violation is detected during the inorder scan, and both the problem node and the one right after it are identified in that single event. But when the swapped nodes are NOT adjacent, two separate violations occur at two different points in the scan — the first violation correctly identifies the earlier swapped node (via `prev`), but the true second swapped node isn't found until the second violation occurs later in the traversal. Always updating `second` on every violation (rather than only the first) ensures that in the non-adjacent case, `second` ends up holding the correct final node from the later violation, while `first` — set only once, on the very first violation — correctly stays locked onto the earlier swapped node throughout.
