# Recover Binary Search Tree

Simple words, step by step.

## The question
Exactly two nodes in a BST have had their **values** accidentally swapped, violating the BST invariant. Fix the tree by swapping those two values back, without changing the tree's structure — ideally in O(1) extra space.

## Why this is really the same problem as file 100's Twist 1
This exact problem was already solved as the "Twist" in file 100 (Validate BST) — it's listed here as its own numbered topic because it's commonly asked as a standalone question, but the technique is identical: run an inorder traversal, and whenever the current value is smaller than the previously-visited value (a violation of the expected strictly-increasing order), that's a sign of a swap.

```python
def recover_tree(root):
    first = second = prev = None

    def inorder(node):
        nonlocal first, second, prev
        if not node:
            return
        inorder(node.left)
        if prev and prev.val > node.val:
            if not first:
                first = prev           # the FIRST violation's EARLIER node
            second = node                 # always updated -- correctly becomes the SECOND violation's LATER node if one exists
        prev = node
        inorder(node.right)

    inorder(root)
    first.val, second.val = second.val, first.val
```
```javascript
function recoverTree(root) {
    let first = null, second = null, prev = null;

    function inorder(node) {
        if (!node) return;
        inorder(node.left);
        if (prev && prev.val > node.val) {
            if (!first) first = prev;          // the FIRST violation's EARLIER node
            second = node;                        // always updated -- correctly becomes the SECOND violation's LATER node if one exists
        }
        prev = node;
        inorder(node.right);
    }

    inorder(root);
    [first.val, second.val] = [second.val, first.val];
}
```
**Speed**: O(n) time, O(h) space (recursion stack).

## Why there are exactly two cases (adjacent swap vs. non-adjacent swap)
Picture the correct sorted sequence as `[1, 2, 3, 4, 5]`.
- **Adjacent swap** (e.g., swap `2` and `3` → `[1, 3, 2, 4, 5]`): exactly ONE violation occurs (`3 > 2` at the point where `3` is immediately followed by `2`). Both swapped nodes are identified from that single violation (`prev=3`, `node=2`).
- **Non-adjacent swap** (e.g., swap `2` and `5` → `[1, 5, 3, 4, 2]`): TWO violations occur — first at `5 > 3` (prev=5, node=3), and second at `4 > 2` (prev=4, node=2). The TRUE first swapped node is `5` (caught in the FIRST violation as `prev`), and the true second swapped node is `2` (caught in the SECOND violation as `node`).

This is exactly why the code sets `first` only once (on the first violation) but always updates `second` (so it ends up holding the correct node from whichever violation was the LAST one encountered).

## Rules to remember
- **This problem is identical in technique to file 100's Twist 1** — worth explicitly recognizing the connection rather than treating it as new, since the "first set once, second always updated" logic is the entire solution and is easy to re-derive incorrectly under pressure if not recognized as a known pattern.
- An O(1) space version exists using Morris Traversal (file 96) instead of recursive inorder — directly swapping in the same thread-based mechanism to achieve the inorder scan without a call stack. This is a natural, expected follow-up question ("can you do this in O(1) space?") once the O(n)-space recursive solution is presented.

## Twisted Tricky Examples (with Solutions)

### Twist 1: O(1) space version using Morris Traversal
```python
def recover_tree_o1_space(root):
    first = second = prev = None
    curr = root
    while curr:
        if not curr.left:
            if prev and prev.val > curr.val:
                if not first:
                    first = prev
                second = curr
            prev = curr
            curr = curr.right
        else:
            predecessor = curr.left
            while predecessor.right and predecessor.right != curr:
                predecessor = predecessor.right
            if not predecessor.right:
                predecessor.right = curr        # thread
                curr = curr.left
            else:
                predecessor.right = None          # un-thread
                if prev and prev.val > curr.val:
                    if not first:
                        first = prev
                    second = curr
                prev = curr
                curr = curr.right
    first.val, second.val = second.val, first.val
```
**The trap**: this is a direct merge of two previously-learned techniques (file 96's Morris Traversal mechanics + file 100/106's violation-detection logic) — the violation check (`if prev and prev.val > curr.val`) needs to be inserted at BOTH points where a node gets "visited" in Morris traversal (the no-left-child case, and the un-threading case), since Morris Traversal's visiting logic is split across two different branches of the main loop, unlike a simple recursive inorder where there's just one visiting point.

### Twist 2: More than two nodes have had their values corrupted (not exactly two) — does this algorithm still work?
**The trap**: no — the algorithm's correctness assumption relies specifically on there being EXACTLY one swapped pair (producing exactly one or two violations as analyzed above); if three or more nodes are arbitrarily shuffled, more than two violations could occur, and the simple "first violation's earlier node, last violation's later node" logic no longer correctly identifies which specific nodes need fixing or how to fix them — always confirm this "exactly two nodes swapped" guarantee is actually part of the problem statement before applying this specific algorithm.

## Interview Q&A

**Q1: Why does the algorithm only need to set the `first` pointer once (on the earliest violation) but update `second` on every violation encountered?**
Because when exactly one violation occurs (the swapped nodes are adjacent in sorted order), that single violation correctly identifies both swapped nodes directly (`prev` and `node` at that moment). When two violations occur (the swapped nodes are non-adjacent), the TRUE first swapped node is only correctly identified at the FIRST violation (hence `first` is set once, guarding against being overwritten by the second violation), while the TRUE second swapped node is only correctly identified at the LAST violation to occur (hence `second` must always be updated, so it ends up reflecting whichever violation happened most recently/last).

**Q2: How does this problem directly build on and reuse the technique from Validate BST (file 100)?**
Both problems rely on the exact same core mechanism: performing an inorder traversal while tracking a `prev` variable, and comparing each newly visited node's value against `prev` to detect whether strictly increasing sorted order (the hallmark of a valid BST's inorder traversal) is being violated. Validate BST simply reports failure the moment any violation is found; Recover BST goes a step further, actually recording which specific nodes were involved in each violation, so they can be identified and their values swapped back afterward — the detection mechanism is identical, only the subsequent action taken differs.

**Q3: What would change about this algorithm if it needed to run in genuinely O(1) extra space, and why is that harder to implement than the recursive version?**
Achieving O(1) extra space requires replacing the recursive inorder traversal (which implicitly uses O(h) call-stack space) with Morris Traversal (file 96), which uses temporary thread pointers within the tree itself instead of any external stack or recursion. This is harder to implement correctly because Morris Traversal's "node visiting" logic is split across two different branches of its main loop (once for nodes with no left child, and once when un-threading after a left subtree has been fully processed) — meaning the violation-detection check (`prev.val > curr.val`) must be duplicated and correctly inserted into both of those visiting points, rather than existing in a single unified place as in the simpler recursive version.
