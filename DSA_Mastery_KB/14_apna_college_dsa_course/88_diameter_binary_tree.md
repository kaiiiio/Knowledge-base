# Diameter of Binary Tree

Simple words, step by step.

## The question
The **diameter** is the length (number of edges) of the longest path between any two nodes in the tree — and crucially, this path **does not need to pass through the root**.

## Why a naive approach is tempting but wrong
A first instinct might be "diameter = height of left subtree + height of right subtree, at the root." This is only correct if the longest path actually passes through the root — but the true longest path could be entirely contained within one subtree, never touching the root at all.

## The correct idea
The longest path through **any given node** equals `height(left subtree) + height(right subtree)` (the path dips down the left side, through this node, and down the right side). The true diameter is the **maximum of this quantity, computed at every single node**, not just the root.

```python
def diameter_of_binary_tree(root):
    diameter = 0

    def height(node):
        nonlocal diameter
        if not node:
            return 0
        left_height = height(node.left)
        right_height = height(node.right)
        diameter = max(diameter, left_height + right_height)   # check EVERY node as a potential "peak"
        return 1 + max(left_height, right_height)

    height(root)
    return diameter
```
```javascript
function diameterOfBinaryTree(root) {
    let diameter = 0;

    function height(node) {
        if (!node) return 0;
        const leftHeight = height(node.left);
        const rightHeight = height(node.right);
        diameter = Math.max(diameter, leftHeight + rightHeight);   // check EVERY node as a potential "peak"
        return 1 + Math.max(leftHeight, rightHeight);
    }

    height(root);
    return diameter;
}
```
**Speed**: O(n) — this is the crucial design win: computing height AND tracking the diameter happen in the **same single pass**, rather than computing height separately for every node (which would make a naive "check diameter at every node" approach O(n²)).

**Why one pass suffices**: the `height` function is already visiting every node exactly once to compute subtree heights. Since the diameter calculation at each node only needs the heights of its *immediate* children (which `height` is already computing as part of its normal recursive work), there's no need for a second, separate traversal — the diameter check can be piggybacked directly onto the height computation.

## Rules to remember
- **This is the clearest example in the whole course of "a recursive function needing to return more than one piece of information, implicitly."** The function technically only *returns* height, but it *also* updates the external `diameter` variable (via closure/`nonlocal`) as a side effect at every node — this dual-purpose pattern (return one value, but also track something else found along the way) reappears throughout the Trees module.
- Using a variable captured in an enclosing scope (`nonlocal` in Python, closure in JavaScript) to accumulate a "best answer found so far" across a recursive traversal is a standard, important idiom — worth recognizing by name, not just copying the specific code.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Diameter measured in NODE count, not edge count
Some problem variants define diameter as the number of **nodes** on the longest path, not the number of edges connecting them (`nodes = edges + 1`). The fix is a one-line adjustment:
```python
diameter = max(diameter, left_height + right_height + 1)   # +1 converts edge-count to node-count
```
**The trap**: always clarify with the interviewer (or re-read the problem statement carefully) whether "diameter" or "longest path" means edges or nodes — this single off-by-one convention difference is a very common point of confusion, and getting it wrong on an otherwise-correct solution looks like a careless bug rather than a reasonable ambiguity.

### Twist 2: Diameter of an N-ARY tree (nodes can have more than 2 children)
```python
def diameter_n_ary(root):
    diameter = 0

    def height(node):
        nonlocal diameter
        if not node:
            return 0
        child_heights = sorted([height(child) for child in node.children], reverse=True)
        top_two_sum = sum(child_heights[:2])           # the diameter through this node uses its TWO tallest children
        diameter = max(diameter, top_two_sum)
        return 1 + (child_heights[0] if child_heights else 0)

    height(root)
    return diameter
```
**The trap**: with potentially many children per node, you can no longer just add "left height + right height" — you need the **two tallest** child subtree heights specifically (since the longest path through this node must dip into exactly two of its children, and using the two tallest maximizes that path length) — a direct generalization of the binary case's "left + right," which is really just "the two tallest of exactly two available children."

## Interview Q&A

**Q1: Why is "height of left subtree + height of right subtree, computed only at the root" an incorrect solution?**
Because the longest path in the entire tree doesn't have to pass through the root at all — it could be entirely contained within a deep, unbalanced subtree far from the root, in which case the root's own left+right height sum would underestimate the true diameter. The correct approach must consider every node as a potential "peak" of the longest path, not just the root.

**Q2: Why does this problem's optimal solution avoid the O(n²) trap of calling a separate height function at every node?**
Because the diameter computation is embedded directly inside the single recursive height-computation pass itself — by the time `height(node)` is computing its own return value, it has already recursively obtained `left_height` and `right_height` for free, as a natural byproduct of computing the node's own height. There's no need to call a separate, independent height function at each node (which would re-traverse subtrees repeatedly, causing the O(n²) blowup); the information needed for the diameter check is already sitting right there in local variables during the single pass.

**Q3: What is the deeper lesson this problem teaches about recursive tree algorithms in general?**
That a recursive function's "official" return value (here, height) and the actual information you need to extract from the traversal (here, diameter) don't always have to be the same thing — a function can return one clean value for its parent to use, while *simultaneously* updating a shared, external "best answer so far" as a side effect during the same traversal. This separation of "what gets returned and composed" versus "what gets tracked globally" is a reusable design pattern across many harder tree problems beyond just this one.
