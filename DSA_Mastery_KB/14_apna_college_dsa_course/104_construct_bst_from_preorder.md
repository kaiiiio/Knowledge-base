# Construct BST from Preorder Traversal

Simple words, step by step.

## Why this is EASIER than the general binary tree version (file 92)
File 92's "build tree from preorder and inorder" needed **two** traversal arrays, because a general binary tree's structure can't be inferred from preorder alone — there's genuine ambiguity about which values belong in the left vs. right subtree. A **BST**, however, has the ordering invariant built in: given only the preorder sequence, you can determine the left/right split yourself, simply by comparing values to the root — no second array (inorder) is needed at all.

## Approach 1: Using a valid (low, high) range — mirrors Validate BST (file 100) almost exactly
```python
def bst_from_preorder(preorder):
    index = [0]                           # mutable container so the nested function can advance a shared pointer

    def build(bound):
        if index[0] == len(preorder) or preorder[index[0]] > bound:
            return None                      # next value doesn't belong in this subtree -- stop here
        root = TreeNode(preorder[index[0]])
        index[0] += 1
        root.left = build(root.val)            # left subtree: everything must stay BELOW root.val
        root.right = build(bound)                # right subtree: everything must stay below the inherited bound
        return root

    return build(float('inf'))
```
```javascript
function bstFromPreorder(preorder) {
    let index = 0;

    function build(bound) {
        if (index === preorder.length || preorder[index] > bound) {
            return null;                          // next value doesn't belong in this subtree -- stop here
        }
        const root = new TreeNode(preorder[index]);
        index += 1;
        root.left = build(root.val);                // left subtree: everything must stay BELOW root.val
        root.right = build(bound);                    // right subtree: everything must stay below the inherited bound
        return root;
    }

    return build(Infinity);
}
```
**Speed**: O(n) — each value in preorder is consumed exactly once as the shared `index` pointer advances through the array.

## Approach 2: Simpler but less efficient — just insert values one at a time, in order
```python
def bst_from_preorder_simple(preorder):
    root = None
    for val in preorder:
        root = insert_bst(root, val)        # reusing the standard BST insert from file 98
    return root
```
**Speed**: O(n²) worst case (if the resulting tree is skewed, each insertion can cost O(n)) — much simpler to write, but asymptotically worse than Approach 1 in the worst case.

## Rules to remember
- **The key realization: preorder visits Root first, so the first value in any preorder slice is always that subtree's root — and because it's a BST, everything in the left subtree must be smaller than that root, giving you the split point "for free," without needing inorder at all.** This mirrors exactly how file 103's BST-LCA used the ordering invariant to avoid needing to search both subtrees — a recurring theme: BST structure replaces the need for extra information that a general binary tree would require.
- Approach 1 (bound-based) is the one worth knowing well — it's O(n), elegant, and conceptually ties directly back to the Validate BST range-passing technique (file 100), reinforcing that same pattern in a construction context instead of a validation context.

## Dry run
`preorder = [8, 5, 1, 7, 10, 12]`.
- `build(inf)`: `preorder[0]=8 <= inf` → root = `8`, index becomes 1. Recurse left with bound `8`.
  - `build(8)`: `preorder[1]=5 <= 8` → root = `5`, index becomes 2. Recurse left with bound `5`.
    - `build(5)`: `preorder[2]=1 <= 5` → root = `1`, index becomes 3. Recurse left with bound `1`.
      - `build(1)`: `preorder[3]=7 > 1` → return `None`.
    - Recurse right (of `1`) with bound `5`: `preorder[3]=7 > 5` → return `None`. So `1` is a leaf.
  - Recurse right (of `5`) with bound `8`: `preorder[3]=7 <= 8` → root = `7`, index becomes 4, both children `None` (next value `10 > 7`, and `10` also `> 8` eventually bounds it out going right too — walked through similarly).
  - Back at root `8`'s right: `build(8)` with the now-advanced index picks up `10` next → root = `10`, then `12` becomes its right child.
- Final tree: `8` root, left subtree `5` (with left child `1`, right child `7`), right subtree `10` (with right child `12`) — correctly reconstructs the intended BST shape from preorder alone.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Why does Approach 1 never need to consult an inorder array at all?
**The trap**: this is purely a conceptual confirmation, not a coding trap — the entire reason this works without inorder is that the BST invariant itself tells you, via simple value comparison against an inherited bound, exactly where the left subtree "runs out" of valid values (once a value exceeds the bound). A general binary tree has no such invariant, so file 92's version genuinely needs the extra inorder information to resolve the left/right split unambiguously — recognizing precisely which piece of information the BST invariant replaces (versus the general tree case) is the real interview-level insight here.

### Twist 2: The given preorder sequence does NOT represent a valid BST (malformed input) — does Approach 1 detect this, or silently produce a wrong tree?
**The trap**: Approach 1, as written, will NOT detect malformed input — it simply builds whatever tree the bound-based logic produces, potentially silently discarding or misplacing values if the input wasn't actually a valid BST's preorder sequence to begin with (some values might just never get consumed as the recursion terminates once the range constraints disallow them, and no explicit check confirms every input value was used). A robust production version should explicitly verify, after construction, that `index[0] == len(preorder)` (every value was successfully consumed) — a mismatch there would be a strong signal of malformed/invalid input worth raising an explicit error for.

## Interview Q&A

**Q1: Why does constructing a BST from preorder alone succeed, when constructing a general binary tree requires BOTH preorder and inorder?**
Because a BST carries an ordering invariant (left subtree smaller, right subtree larger) that a general binary tree doesn't have — this invariant means that, given only the preorder sequence, you can determine exactly which subsequent values belong to the current root's left subtree (everything smaller than the root, up until a value exceeds it) purely through value comparisons, without needing any additional traversal data. A general binary tree has no such invariant, so preorder alone is genuinely ambiguous about where the left subtree ends and the right subtree begins — inorder's job in that case.

**Q2: In Approach 1, what does the `bound` parameter represent, and why does it get updated differently when recursing left versus right?**
`bound` represents the maximum value still "valid" for the current recursive call's subtree — essentially the nearest ancestor constraint from above that hasn't yet been superseded. When recursing left, the bound tightens to the current root's own value (everything in the left subtree must be strictly smaller than the root). When recursing right, the bound is passed through UNCHANGED from what this node itself inherited (everything in the right subtree must still respect whatever ancestor constraint applied to this node, since the right subtree's values, while larger than this root, could still legitimately be smaller than some higher ancestor's bound).

**Q3: What's the time complexity tradeoff between the bound-based Approach 1 and the "just insert values one at a time" Approach 2, and when might the simpler approach still be preferred?**
Approach 1 is always O(n), since each value is consumed from the preorder array exactly once as the shared index pointer advances, regardless of the resulting tree's shape. Approach 2 can degrade to O(n²) in the worst case (if the resulting BST ends up skewed, e.g., strictly increasing or decreasing preorder values), since each individual insertion can cost up to O(n) in a skewed tree. Approach 2 might still be preferred when code simplicity and readability matter more than worst-case performance guarantees, or when it's already known (or guaranteed) that the resulting tree will be reasonably balanced, making the practical performance difference negligible.
