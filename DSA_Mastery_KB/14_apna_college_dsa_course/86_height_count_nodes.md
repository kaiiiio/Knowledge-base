# Height of a Binary Tree & Count of Nodes

Simple words, step by step.

## Height of a Binary Tree
The height of a tree is the number of edges on the longest path from the root to a leaf (some definitions count nodes instead of edges — always clarify which convention is expected).

```python
def height(root):
    if not root:
        return -1              # convention: empty tree has height -1, a single node has height 0
    return 1 + max(height(root.left), height(root.right))
```
```javascript
function height(root) {
    if (!root) return -1;         // convention: empty tree has height -1, a single node has height 0
    return 1 + Math.max(height(root.left), height(root.right));
}
```
**The recursive promise**: "this function returns the height of the subtree rooted here." The parent trusts both children's heights and just takes the larger one, plus 1 for the edge connecting to the parent itself.
**Speed**: O(n) — every node is visited exactly once.

## Count of Nodes in a Binary Tree
```python
def count_nodes(root):
    if not root:
        return 0
    return 1 + count_nodes(root.left) + count_nodes(root.right)
```
```javascript
function countNodes(root) {
    if (!root) return 0;
    return 1 + countNodes(root.left) + countNodes(root.right);
}
```
**Speed**: O(n) — same single-pass visit-every-node shape.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Count nodes in a COMPLETE binary tree faster than O(n)
A complete binary tree (every level full except possibly the last, filled left-to-right) allows a cleverer approach than visiting every node.
```python
def left_height(node):
    h = 0
    while node:
        h += 1
        node = node.left
    return h

def right_height(node):
    h = 0
    while node:
        h += 1
        node = node.right
    return h

def count_nodes_complete(root):
    if not root:
        return 0
    lh = left_height(root)
    rh = right_height(root)
    if lh == rh:
        return (1 << lh) - 1          # it's a PERFECT subtree -- count formula: 2^height - 1
    return 1 + count_nodes_complete(root.left) + count_nodes_complete(root.right)
```
**Why this is faster**: if the leftmost-path height equals the rightmost-path height, the tree is **perfect** (every level completely full), so its node count can be computed instantly with the formula `2^height - 1`, with no need to recurse into it at all. Only genuinely incomplete subtrees need further recursion. **Speed**: O(log² n) — at each level of recursion, computing `left_height`/`right_height` takes O(log n), and the recursion itself only goes O(log n) levels deep before hitting a perfect subtree (since a complete tree can only be "incomplete" along one path at a time).

### Twist 2: Find the height WITHOUT recursion (iterative, using level-order/BFS)
```python
from collections import deque

def height_iterative(root):
    if not root:
        return -1
    queue = deque([root])
    height = -1
    while queue:
        height += 1
        for _ in range(len(queue)):        # process one full level
            node = queue.popleft()
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return height
```
**The trap**: counting the number of **levels processed** (not the number of nodes) is what gives the height — a common bug is incrementing the counter per node instead of per level, which conflates height with node count.

## Interview Q&A

**Q1: Why is computing node count in a complete binary tree possible in better than O(n), while it's not possible for an arbitrary binary tree?**
A complete tree's structural guarantee (every level full except possibly the last, filled left-to-right) means that comparing the leftmost-path height to the rightmost-path height tells you, in O(log n) time, whether an entire subtree is perfectly full — and if so, its size is computable instantly via a formula, with no need to actually visit every node in it. An arbitrary binary tree has no such structural guarantee, so there's no shortcut — you genuinely must visit every node to know how many there are.

**Q2: What does the recursive height function actually compute at each step, and why does it need to handle the empty-tree base case specially?**
At each node, it returns "1 plus the taller of my two children's heights" — correctly handling the case where a node has only one real child, because the missing child (`None`/`null`) returns `-1` from the base case, so `1 + (-1) = 0` correctly reflects that a leaf (no real children) has height 0, not some undefined or incorrect value.

**Q3: Is there a way to compute height and check if a tree is balanced in a single pass, rather than two separate traversals?**
Yes — instead of computing height and separately checking the balance condition at every node (which would be O(n²) if done naively, since checking balance at each of n nodes requires an O(n) height computation), a combined function can return "height, or a sentinel value like -2 meaning 'already found unbalanced'" from each recursive call — propagating the failure signal upward immediately short-circuits further unnecessary work, achieving O(n) overall instead of O(n²).
