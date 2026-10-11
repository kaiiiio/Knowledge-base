# Lowest Common Ancestor in a BST

Simple words, step by step.

## Why this is EASIER than LCA in a general binary tree (file 91)
In a general binary tree, LCA requires searching both subtrees because there's no way to know, without searching, which subtree `p` and `q` live in. In a BST, the ordering invariant tells you **directly, by comparison alone**, which direction to go — no searching required.

## The idea
At any node: if both `p` and `q` are smaller than the current node, the LCA must be in the left subtree. If both are larger, it must be in the right subtree. Otherwise (one is smaller or equal, and the other is larger or equal), the current node IS the LCA — this is exactly the point where `p` and `q`'s paths from the root diverge.

```python
def lca_bst(root, p, q):
    curr = root
    while curr:
        if p.val < curr.val and q.val < curr.val:
            curr = curr.left               # both targets are smaller -- LCA must be further left
        elif p.val > curr.val and q.val > curr.val:
            curr = curr.right                # both targets are larger -- LCA must be further right
        else:
            return curr                        # paths diverge here (or one target IS curr) -- this is the LCA
    return None
```
```javascript
function lcaBST(root, p, q) {
    let curr = root;
    while (curr) {
        if (p.val < curr.val && q.val < curr.val) {
            curr = curr.left;                // both targets are smaller -- LCA must be further left
        } else if (p.val > curr.val && q.val > curr.val) {
            curr = curr.right;                 // both targets are larger -- LCA must be further right
        } else {
            return curr;                          // paths diverge here (or one target IS curr) -- this is the LCA
        }
    }
    return null;
}
```
**Speed**: O(h) — O(log n) for a balanced BST, O(n) for a skewed one; crucially, this is a **single path walk**, not a search through both subtrees like the general binary tree version needed.

## Rules to remember
- **This is the single clearest illustration in the whole course of "a specialized data structure's invariant turning a harder general-tree problem into a trivially simpler one."** The general binary tree LCA (file 91) needed O(n) full-subtree exploration with a 3-way signal propagating upward; the BST version needs only a single O(h) downward walk, using nothing but value comparisons — no recursion into "the other side" is ever needed at all.
- Always explicitly verify with the interviewer whether the input tree is guaranteed to be a BST or just a general binary tree — using this simpler BST algorithm on a tree that isn't actually a valid BST would silently produce wrong answers, since the entire approach depends on the ordering invariant holding true everywhere.

## Twisted Tricky Examples (with Solutions)

### Twist 1: One of `p` or `q` is an ANCESTOR of the other — does the algorithm still work correctly?
Example: BST is `6 -> 2 -> 0, 4` (where `2` has children `0` and `4`); find LCA of `2` and `4`.
- `curr = 6`: `2 < 6` and `4 < 6` → both smaller → go left: `curr = 2`.
- `curr = 2`: `p.val(2) < curr.val(2)` is FALSE (they're equal, not strictly less) → falls into the `else` branch → return `2`.
**Why this works correctly**: the condition `p.val < curr.val` is **strict**, so when `curr` itself equals one of the targets, the "both smaller" (or "both larger") branch condition fails, correctly falling through to "this is the LCA" — exactly matching the LCA definition's rule that a node counts as its own ancestor.

### Twist 2: Find LCA in a BST using RECURSION instead of the iterative while-loop (equally valid, just a style choice)
```python
def lca_bst_recursive(root, p, q):
    if p.val < root.val and q.val < root.val:
        return lca_bst_recursive(root.left, p, q)
    if p.val > root.val and q.val > root.val:
        return lca_bst_recursive(root.right, p, q)
    return root
```
**The trap**: this is purely a style/space-tradeoff choice, not a correctness difference — the recursive version is arguably more readable but uses O(h) call-stack space, while the iterative version achieves the exact same result in genuine O(1) extra space; interviewers sometimes specifically ask "can you do this without recursion" to test awareness of this tradeoff, not because the recursive version is wrong.

## Interview Q&A

**Q1: Why can LCA in a BST be solved with a single downward path walk, while LCA in a general binary tree requires searching both subtrees?**
Because a BST's ordering invariant provides direct, O(1) information at every node about which subtree a target value must live in — comparing a target's value to the current node's value immediately tells you "left" or "right" with certainty, no searching required. A general binary tree has no such invariant; there's no way to know from a value comparison alone which subtree contains `p` or `q`, so the general algorithm must actually explore into subtrees to find out, and track return signals from both sides to determine the divergence point.

**Q2: Why does the comparison `p.val < curr.val and q.val < curr.val` use strict `<` rather than `<=`, and what would break if `<=` were used instead?**
Strict `<` correctly handles the case where `curr` IS one of the target nodes `p` or `q` itself — in that case, `curr.val` equals one target's value exactly, making the "both strictly smaller" or "both strictly larger" condition false (since equality fails strict inequality), correctly falling through to "this is the LCA." If `<=` were used instead, a node equal to one of the targets would incorrectly satisfy "both less than or equal," causing the algorithm to continue descending past the actual LCA (which, per the problem's definition, should be the target node itself when one target is an ancestor of the other) — silently producing a wrong, overly-deep result.

**Q3: What is the space complexity advantage of the iterative version over the recursive version, and is there ever a meaningful reason to prefer the recursive version anyway?**
The iterative version uses O(1) extra space (just a single pointer variable being reassigned in a loop), while the recursive version uses O(h) space for its call stack, since each recursive call adds a new stack frame until the LCA is found. The recursive version might still be preferred purely for code readability or style consistency with the rest of a codebase that favors recursive tree algorithms — but from a pure efficiency standpoint, especially on very deep or heavily skewed trees where h could approach n, the iterative version's constant space usage is a genuine, meaningful advantage.
