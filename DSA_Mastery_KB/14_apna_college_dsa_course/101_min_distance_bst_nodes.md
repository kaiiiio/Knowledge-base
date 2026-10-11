# Minimum Distance Between BST Nodes

Simple words, step by step.

## The question
Find the minimum absolute difference between the values of any two **distinct** nodes in a BST.

## The key insight: the answer is always between two ADJACENT values in inorder order
Since inorder traversal of a BST produces sorted order (the central BST fact, reused constantly throughout this module), the minimum difference between ANY two nodes must occur between two **consecutive** values in that sorted sequence. There's no need to compare every possible pair — checking only adjacent pairs in the inorder sequence is sufficient, because any two non-adjacent values in a sorted sequence always have at least one value between them that's closer to one of them than they are to each other.

```python
def min_diff_in_bst(root):
    min_diff = float('inf')
    prev = None

    def inorder(node):
        nonlocal min_diff, prev
        if not node:
            return
        inorder(node.left)
        if prev is not None:
            min_diff = min(min_diff, node.val - prev)     # compare only to the IMMEDIATELY previous inorder value
        prev = node.val
        inorder(node.right)

    inorder(root)
    return min_diff
```
```javascript
function minDiffInBST(root) {
    let minDiff = Infinity;
    let prev = null;

    function inorder(node) {
        if (!node) return;
        inorder(node.left);
        if (prev !== null) {
            minDiff = Math.min(minDiff, node.val - prev);    // compare only to the IMMEDIATELY previous inorder value
        }
        prev = node.val;
        inorder(node.right);
    }

    inorder(root);
    return minDiff;
}
```
**Speed**: O(n) — one inorder pass, each node compared to exactly one neighbor (the previous one visited).

## Why comparing only adjacent pairs is sufficient (the proof, in plain words)
Suppose the sorted sequence is `[1, 5, 9, 20]`. The minimum difference must be between some adjacent pair — `5-1=4`, `9-5=4`, or `20-9=11`. Could a non-adjacent pair like `9` and `1` (difference `8`) ever beat the best adjacent pair? No — because the values strictly between them in sorted order (`5`, in this case) must be closer to at least one side than the endpoints are to each other; formally, if `a < b < c`, then `min(b-a, c-b) <= c-a` always holds (since `(b-a) + (c-b) = c-a`, and the smaller of two non-negative numbers summing to a total is always at most half that total, which is itself always <= the total). So checking every adjacent pair is guaranteed to find the true overall minimum.

## Rules to remember
- **This is a direct, elegant application of "inorder traversal = sorted order"** — recognizing that "minimum difference between any two nodes" reduces to "minimum difference between adjacent elements in a sorted sequence" is the entire insight; no BST-specific cleverness beyond that reduction is needed.
- This same reduction (comparing only to the immediately preceding value during an inorder scan) is structurally identical to the "validate BST via inorder" approach (file 100) — both rely on maintaining a `prev` value across the inorder traversal and comparing it to the current node.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Does this approach work on a regular (non-BST) binary tree?
**The trap**: no — the entire algorithm depends critically on inorder traversal producing a sorted sequence, which is a guarantee that holds **only** for BSTs. On an arbitrary binary tree, inorder traversal produces values in whatever order the tree happens to be structured, with no sorting guarantee at all — the "compare only to the immediately previous value" shortcut would be meaningless, and the only correct general approach for an arbitrary tree would be collecting all values, sorting them explicitly, and then finding the minimum adjacent difference — an O(n log n) solution instead of O(n).

### Twist 2: Find the minimum difference, but EXCLUDING a specific "forbidden" pair of nodes (e.g., can't compare a node to its own parent)
```python
def min_diff_excluding_parent_child(root):
    # Requires tracking parent relationships during traversal and filtering out
    # the specific excluded pair relationship when computing differences --
    # the simple "compare only to the inorder-adjacent previous value" shortcut
    # breaks down because the excluded pair might happen to be exactly the
    # pair that would otherwise be identified as the minimum.
    pass
```
**The trap**: this is a "watch out for an added constraint that breaks a clean reduction" trap — once an arbitrary exclusion rule is introduced, the elegant "only check adjacent pairs" shortcut is no longer provably sufficient (the globally minimum valid difference might now require comparing a non-adjacent pair, if the adjacent pair that would normally win happens to be forbidden) — recognizing when an added constraint invalidates a previously-proven reduction is an important skill, even if the fix (e.g., falling back to checking all O(n²) pairs, or a more careful analysis) is more involved.

## Interview Q&A

**Q1: Why is it mathematically sufficient to only compare each node's value to its immediately preceding value in the inorder sequence, rather than checking all possible pairs?**
Because the inorder sequence is sorted (the core BST property), and for any sorted sequence, the minimum difference between any two elements overall is always achieved by some pair of *adjacent* elements. This follows from the fact that any non-adjacent pair has at least one value strictly between them, and that middle value is always closer to one of the two endpoints than the endpoints are to each other — so a non-adjacent pair's difference can never be smaller than the best adjacent pair's difference anywhere along the sequence.

**Q2: Why would this specific algorithm (comparing only to the immediately prior inorder value) give an incorrect or meaningless result if applied to an arbitrary binary tree that isn't a valid BST?**
Because the entire correctness argument relies on inorder traversal producing values in sorted order, which is a guarantee specific to BSTs (following directly from the left-smaller, right-larger invariant holding at every node). An arbitrary binary tree has no such ordering guarantee — its inorder traversal could produce values in essentially any order — so "comparing only to the immediately previous value visited" would just be comparing arbitrary, unrelated values with no mathematical basis for claiming the global minimum has been found.

**Q3: This problem and "Validate BST via inorder" (file 100) both use a `prev` variable tracked across an inorder traversal — what's the common underlying pattern, and how do the two problems' uses of it differ?**
Both problems exploit the same core fact (inorder traversal of a BST is sorted) by maintaining a single `prev` variable that gets updated to the current node's value after processing it, enabling an O(1) comparison between consecutive inorder values without needing to store the entire sequence. They differ in what they *do* with that comparison: Validate BST checks whether the current value is strictly greater than `prev` (failing immediately if not, since sorted order requires strict increase), while Minimum Distance tracks the smallest *difference* seen between consecutive values, rather than just checking a boolean ordering condition — the same traversal-and-compare mechanism, repurposed for a different output.
