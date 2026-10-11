# Lowest Common Ancestor in a Binary Tree

Simple words, step by step.

## The question
Given two nodes `p` and `q` in a binary tree, find their **Lowest Common Ancestor (LCA)** — the deepest node that has both `p` and `q` as descendants (a node is considered a descendant of itself).

## The recursive idea
Ask each subtree: "do you contain `p`, `q`, both, or neither?" The recursive promise for `lca(node)` is: "if both `p` and `q` exist somewhere in this subtree, return their LCA; if only one exists, return that one; if neither exists, return `None`."

```python
def lowest_common_ancestor(root, p, q):
    if not root or root == p or root == q:
        return root                       # found one of the targets, or hit the bottom
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right:
        return root                       # p and q found in DIFFERENT subtrees -- current node IS the LCA
    return left if left else right        # both targets are on the same side -- pass that answer up
```
```javascript
function lowestCommonAncestor(root, p, q) {
    if (!root || root === p || root === q) {
        return root;                        // found one of the targets, or hit the bottom
    }
    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);
    if (left && right) {
        return root;                          // p and q found in DIFFERENT subtrees -- current node IS the LCA
    }
    return left ? left : right;               // both targets are on the same side -- pass that answer up
}
```
**Speed**: O(n) — each node visited once.

## Dry run
Tree: `1` is root, with children `2` and `3`; `2` has children `4` and `5`. Find LCA of `4` and `5`.
- `lca(1)` calls `lca(2)` and `lca(3)`.
- `lca(2)` calls `lca(4)` → returns `4` (it IS `p`); calls `lca(5)` → returns `5` (it IS `q`). Both `left` and `right` are truthy → `lca(2)` returns `2`.
- `lca(3)` → both children are `None` → returns `None`.
- Back at `lca(1)`: `left = 2`, `right = None` → since only `left` is truthy, return `2`.
- Final answer: `2`. Correct — `2` is the deepest node that has both `4` and `5` as descendants.

## Rules to remember
- **The key insight**: a node is the LCA precisely when the two targets are found in **different** subtrees relative to it (or the node itself is one of the targets) — this single `if left and right: return root` check is the entire crux of the algorithm.
- This pattern — "query returns up to 3 kinds of signal (found p, found q, found neither/both), and the parent decides what it means" — is conceptually similar to the "return more than the obvious value" idiom from file 88's diameter problem, just with a different payload being passed up.

## Twisted Tricky Examples (with Solutions)

### Twist 1: LCA when `p` or `q` might NOT actually exist in the tree
The standard solution silently returns a wrong-but-plausible-looking answer if, say, `q` doesn't exist in the tree at all (it would still return whatever node matched `p`, never realizing `q` was never found).
```python
def lca_safe(root, p, q):
    def dfs(node):
        if not node:
            return None
        left = dfs(node.left)
        right = dfs(node.right)
        if node == p or node == q:
            return node
        if left and right:
            return node
        return left if left else right

    def contains(node, target):
        if not node:
            return False
        if node == target:
            return True
        return contains(node.left, target) or contains(node.right, target)

    candidate = dfs(root)
    if contains(root, p) and contains(root, q):          # verify BOTH targets genuinely exist
        return candidate
    return None
```
**The trap**: interviewers sometimes explicitly test this edge case — the naive solution assumes both `p` and `q` are guaranteed present, and silently producing a wrong "LCA" for a non-existent node is a subtle but real correctness bug; a safe version needs an explicit existence check, even at the cost of extra traversal time.

### Twist 2: Find LCA when nodes have a `parent` pointer (no need to search from the root at all)
```python
def lca_with_parent_pointer(p, q):
    ancestors_of_p = set()
    node = p
    while node:
        ancestors_of_p.add(node)
        node = node.parent
    node = q
    while node not in ancestors_of_p:        # walk up from q until hitting a node p already visited
        node = node.parent
    return node
```
**The trap**: this is structurally identical to the classic "detect the intersection point of two linked lists" problem (if you think of "walking up via parent pointers" as traversing a linked list) — recognizing this connection means the two-pointer / set-based intersection techniques from the Linked Lists module transfer directly here, rather than needing an entirely new algorithm.

## Interview Q&A

**Q1: Why does `if left and right: return root` correctly identify the LCA?**
Because it means the search found `p` somewhere in the left subtree AND `q` somewhere in the right subtree (or vice versa) — meaning the current node is the first point where the paths to `p` and `q` diverge into different branches. Since it's the deepest node where both still coexist in its combined subtree before splitting apart, it is by definition the lowest common ancestor.

**Q2: What does it mean when the recursive call returns a non-null value, but it's not immediately root — i.e., what does a non-null return value represent from a subtree where only ONE of left/right was truthy?**
It means that specific subtree contains only one of the two targets (or has already found the actual LCA deeper down, and is simply passing that answer upward unchanged). The parent can't yet tell whether this is "the LCA" or just "one of the two targets, waiting to meet the other one higher up" — it doesn't need to know; it just needs to propagate that single found value further up the call stack until a node is reached where both sides finally have something.

**Q3: How does having a `parent` pointer on each node change the optimal approach, and what well-known problem is it equivalent to?**
With parent pointers, there's no need to search from the root down at all — you can walk directly upward from `p` and `q` toward the root, since every node can reach the root in O(height) steps on its own. Collecting all ancestors of `p` into a set, then walking up from `q` until hitting a node already in that set, finds the LCA directly. This is structurally the exact same problem as "find the intersection node of two linked lists," where "walking up via parent pointers" plays the role of "traversing a linked list toward its tail" — the same two-list-intersection techniques apply unchanged.
