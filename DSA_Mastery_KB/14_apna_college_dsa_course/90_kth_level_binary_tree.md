# Kth Level of a Binary Tree

Simple words, step by step.

## The question
Given a binary tree and a number `k`, return all the node values that sit at depth `k` from the root (root itself is depth 0, or sometimes depth 1 depending on convention — always confirm with the interviewer).

## Approach 1: BFS (level order), stop at the right level
```python
from collections import deque

def kth_level_bfs(root, k):
    if not root:
        return []
    queue = deque([root])
    current_depth = 0
    while queue:
        if current_depth == k:
            return [node.val for node in queue]
        for _ in range(len(queue)):
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        current_depth += 1
    return []                   # k was deeper than the tree
```
```javascript
function kthLevelBFS(root, k) {
    if (!root) return [];
    let queue = [root];
    let currentDepth = 0;
    while (queue.length > 0) {
        if (currentDepth === k) {
            return queue.map(node => node.val);
        }
        const nextQueue = [];
        for (const node of queue) {
            if (node.left) nextQueue.push(node.left);
            if (node.right) nextQueue.push(node.right);
        }
        queue = nextQueue;
        currentDepth += 1;
    }
    return [];                   // k was deeper than the tree
}
```
**Speed**: O(n) worst case (if `k` is close to the last level, nearly every node gets visited).

## Approach 2: DFS (recursive, tracking current depth)
```python
def kth_level_dfs(root, k):
    result = []

    def dfs(node, depth):
        if not node:
            return
        if depth == k:
            result.append(node.val)
            return                     # no need to go deeper once the target level is reached
        dfs(node.left, depth + 1)
        dfs(node.right, depth + 1)

    dfs(root, 0)
    return result
```
```javascript
function kthLevelDFS(root, k) {
    const result = [];

    function dfs(node, depth) {
        if (!node) return;
        if (depth === k) {
            result.push(node.val);
            return;                      // no need to go deeper once the target level is reached
        }
        dfs(node.left, depth + 1);
        dfs(node.right, depth + 1);
    }

    dfs(root, 0);
    return result;
}
```
**Speed**: O(n) worst case, same as BFS — but notice the DFS version naturally preserves a **left-to-right** ordering within the level too, same as BFS, because `dfs(node.left, ...)` is always called before `dfs(node.right, ...)`.

## Rules to remember
- Both BFS and DFS solve this in O(n) worst case — there is no asymptotic advantage of one over the other here; the choice is mostly about which traversal style fits the broader problem (e.g., if you're already doing level-order processing for other reasons, BFS is natural; if the tree is being processed recursively elsewhere, DFS fits more naturally).
- BFS can **short-circuit early** and return immediately upon reaching depth `k`, without needing to process any deeper levels at all — making it strictly better in **practice** (not asymptotically) when `k` is small relative to the tree's total height, since it avoids visiting nodes below level `k` entirely.
- DFS, by contrast, must still visit every node down every path to confirm there's nothing left to explore at depth `k` in every branch, even wasted exploration below where the answer would be found along any single path — though it does prune by returning early on each individual branch once depth `k` is hit on that branch.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Kth level counting from the BOTTOM, not the top (distance from the deepest leaf)
This is harder because you don't know the tree's total height in advance without a separate pass.
```python
def kth_level_from_bottom(root, k):
    def height(node):
        if not node:
            return -1
        return 1 + max(height(node.left), height(node.right))

    total_height = height(root)
    target_depth_from_top = total_height - k      # convert "from bottom" into "from top"
    if target_depth_from_top < 0:
        return []
    return kth_level_dfs(root, target_depth_from_top)
```
**The trap**: "distance from the bottom" is ambiguous unless you first establish the tree's total height — a naive attempt to track "distance from the nearest leaf in this subtree" per node, rather than from the single deepest leaf overall, produces a different (and usually wrong) answer, since different leaves can be at different depths in an unbalanced tree.

### Twist 2: Return nodes at level k in ZIGZAG order (left-to-right on even levels, right-to-left on odd levels)
```python
def zigzag_level(root, k):
    if not root:
        return []
    queue = deque([root])
    current_depth = 0
    while queue:
        if current_depth == k:
            values = [node.val for node in queue]
            return values if k % 2 == 0 else values[::-1]   # reverse order on odd levels
        for _ in range(len(queue)):
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        current_depth += 1
    return []
```
**The trap**: the BFS traversal itself still proceeds strictly left-to-right internally (pushing left child before right child) — only the **final output order** for odd levels gets reversed at the very end; conflating "traversal order" with "output order" is a common source of bugs in zigzag-style problems.

## Interview Q&A

**Q1: Between BFS and DFS for finding the kth level, is one asymptotically faster than the other?**
No — both are O(n) in the worst case, since in the worst case (e.g., `k` equal to the tree's maximum depth), nearly every node must be visited regardless of traversal strategy. The practical difference is that BFS can stop immediately once it reaches depth `k`, without even enqueueing nodes below that level, which can save real (constant-factor) work when `k` is much smaller than the tree's height — though this doesn't change the big-O worst-case bound.

**Q2: Why does the DFS version add `return` immediately after appending to `result` once `depth == k` is reached, rather than continuing to recurse into children?**
Because once a node is confirmed to be exactly at depth `k`, none of its descendants (which would be at depth `k+1`, `k+2`, etc.) are relevant to the answer — continuing to recurse into them would be wasted work that doesn't affect the output, so returning early prunes that unnecessary subtree exploration on this particular path.

**Q3: Why is finding "the kth level from the bottom" harder than finding it from the top, and how is this difficulty resolved?**
It's harder because "distance from the bottom" is inherently relative to the single deepest leaf in the *entire* tree, which isn't known without first fully exploring the tree — you can't determine during a single top-down pass how deep the tree ultimately goes. The clean resolution is a two-pass approach: first compute the tree's total height (one full traversal), then convert the "from bottom" requirement into an equivalent "from top" depth value (`total_height - k`), and reuse the already-solved from-top algorithm for the second pass.
