# Build Binary Tree from Preorder and Inorder Traversal

Simple words, step by step.

## The question
Given two arrays — the preorder traversal and the inorder traversal of the same binary tree (with all unique values) — reconstruct the original tree.

## The key insight
- **Preorder** is `Root -> Left -> Right`, so the **first element of preorder is always the root**.
- **Inorder** is `Left -> Root -> Right`, so once you know the root's value, finding it in the inorder array splits that array into exactly two parts: everything to its left is the **entire left subtree's** inorder sequence, and everything to its right is the **entire right subtree's** inorder sequence.
- This gives a recursive recipe: take the root from the front of preorder, locate it in inorder to learn the sizes of the left and right subtrees, then recurse on the corresponding slices of both arrays.

```python
def build_tree(preorder, inorder):
    index_map = {val: i for i, val in enumerate(inorder)}   # value -> its index in inorder, for O(1) lookup
    self_preorder_index = 0

    def build(in_left, in_right):
        nonlocal self_preorder_index
        if in_left > in_right:
            return None
        root_val = preorder[self_preorder_index]
        self_preorder_index += 1
        root = TreeNode(root_val)
        mid = index_map[root_val]                # where root sits within THIS inorder slice
        root.left = build(in_left, mid - 1)        # must build left BEFORE right --
        root.right = build(mid + 1, in_right)       # preorder pointer must advance through left subtree first
        return root

    return build(0, len(inorder) - 1)
```
```javascript
function buildTree(preorder, inorder) {
    const indexMap = new Map();                        // value -> its index in inorder, for O(1) lookup
    inorder.forEach((val, i) => indexMap.set(val, i));
    let selfPreorderIndex = 0;

    function build(inLeft, inRight) {
        if (inLeft > inRight) return null;
        const rootVal = preorder[selfPreorderIndex];
        selfPreorderIndex += 1;
        const root = new TreeNode(rootVal);
        const mid = indexMap.get(rootVal);               // where root sits within THIS inorder slice
        root.left = build(inLeft, mid - 1);                 // must build left BEFORE right --
        root.right = build(mid + 1, inRight);                // preorder pointer must advance through left subtree first
        return root;
    }

    return build(0, inorder.length - 1);
}
```
**Speed**: O(n) — the hashmap gives O(1) root lookups in inorder (without it, a linear search for the root inside the recursion would make this O(n²)); each of the n nodes is built exactly once.

## Rules to remember
- **The hashmap pre-indexing step is the single most important optimization** — without it, this problem is still correct but becomes O(n²) in the worst case (a skewed tree), because every recursive call would need to linearly scan `inorder` to find the root's position.
- **Order of recursive calls matters**: `build(left)` MUST be called before `build(right)`, because `self_preorder_index` is a single shared pointer advancing through the preorder array — and preorder visits the entire left subtree before moving on to the right subtree. Swapping this order would consume preorder values out of sequence and silently build a wrong tree.
- This is the single concrete illustration of file 85's closing Q&A point: preorder + inorder together uniquely determine the tree, precisely because of this splitting mechanism.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Build tree from POSTORDER and inorder instead
```python
def build_tree_post_in(postorder, inorder):
    index_map = {val: i for i, val in enumerate(inorder)}
    self_postorder_index = len(postorder) - 1          # postorder's LAST element is the root

    def build(in_left, in_right):
        nonlocal self_postorder_index
        if in_left > in_right:
            return None
        root_val = postorder[self_postorder_index]
        self_postorder_index -= 1
        root = TreeNode(root_val)
        mid = index_map[root_val]
        root.right = build(mid + 1, in_right)    # build RIGHT first now (postorder visits right before the root)
        root.left = build(in_left, mid - 1)
        return root

    return build(0, len(inorder) - 1)
```
**The trap**: with postorder, the root is the **last** element, not the first, and the pointer walks **backward**. Crucially, the recursive call order must also flip — build the **right** subtree before the **left** subtree — because postorder's structure is `Left -> Right -> Root`, so reading backward from the end gives `Root -> Right -> Left`, the mirror image of the preorder case.

### Twist 2: Duplicate values present in the tree
The hashmap approach (`value -> index`) silently breaks if the same value appears more than once, since a value can only map to one index.
```python
# With duplicates, there is NO general unique reconstruction possible from preorder+inorder alone --
# the problem must additionally guarantee uniqueness, or provide extra information (like node identity, not just value).
```
**The trap**: this is a "recognize the problem is underspecified" trap rather than a coding trap — always confirm the "all values are unique" constraint explicitly; with duplicates, multiple different trees could produce the exact same preorder and inorder sequences, making the reconstruction genuinely ambiguous, not just harder to code.

## Interview Q&A

**Q1: Why is the hashmap pre-indexing step necessary for an optimal solution, and what breaks without it?**
Without it, every recursive call that needs to find where the current root sits within the current inorder slice would have to linearly scan that slice to find it — in the worst case (e.g., a completely skewed, linked-list-like tree), this turns an O(n) algorithm into O(n²), since the "find root in inorder" step alone costs O(n) at every one of the n levels of recursion. Pre-building a value-to-index hashmap once, up front, reduces this lookup from O(n) to O(1) everywhere it's needed.

**Q2: Why must the left subtree be built before the right subtree in the preorder+inorder version, but the reverse order in the postorder+inorder version?**
Because in both cases, there's a single shared index pointer advancing through the traversal array as nodes are consumed, and that pointer must advance in the exact order the values actually appear in that array. Preorder lists `Root -> Left -> Right`, so after taking the root, the very next values encountered belong to the left subtree — meaning the left subtree must be built (consuming those next preorder values) before attempting the right subtree. Postorder lists `Left -> Right -> Root`; reading it backward from the end gives `Root -> Right -> Left`, so after taking the root (the last element), the right subtree's values come next when reading backward — requiring the right subtree to be built first.

**Q3: Can a binary tree be uniquely reconstructed from preorder and postorder alone, without inorder? Why or why not?**
Generally no, specifically when some nodes have only a single child — because in that case, there's no way to tell from preorder+postorder alone whether that one child is a left child or a right child, since both scenarios would produce identical preorder and postorder sequences. Inorder resolves this ambiguity because it explicitly encodes left/right positioning relative to each root (anything appearing before the root in that slice is definitionally in the left subtree, anything after is in the right) — information that preorder and postorder, which only encode ordering relative to the root's position in the traversal, don't capture on their own.
