# Maximum Width of a Binary Tree

Simple words, step by step.

## The question
The **width** of a level is the number of slots between (and including) the leftmost and rightmost nodes at that level — crucially, counting the "gaps" as if missing nodes were still present (i.e., imagining the tree as a complete binary tree, even though some positions are actually null). The **maximum width** is the largest such width across all levels.

## Why "number of actual nodes at a level" is NOT the answer
A level might have only 2 actual nodes, but if they're positioned far apart (with several missing nodes in between, where a complete binary tree would have had nodes), the width counts that entire span — not just the 2 nodes physically present.

## The idea: assign each node a positional INDEX, as if the tree were a complete binary tree stored in an array
Using the classic array-based complete-tree indexing (root at index `i`, left child at `2i`, right child at `2i+1`), the width of a level is simply `last_index - first_index + 1` for that level.

```python
from collections import deque

def width_of_binary_tree(root):
    if not root:
        return 0
    max_width = 0
    queue = deque([(root, 0)])            # (node, positional index)
    while queue:
        level_size = len(queue)
        _, first_index = queue[0]            # leftmost node's index at this level
        last_index = first_index               # will be updated to the rightmost node's index
        for _ in range(level_size):
            node, index = queue.popleft()
            last_index = index
            # re-base indices to prevent overflow on deep trees -- subtract first_index of THIS level
            normalized_index = index - first_index
            if node.left:
                queue.append((node.left, 2 * normalized_index))
            if node.right:
                queue.append((node.right, 2 * normalized_index + 1))
        max_width = max(max_width, last_index - first_index + 1)
    return max_width
```
```javascript
function widthOfBinaryTree(root) {
    if (!root) return 0;
    let maxWidth = 0;
    let queue = [[root, 0]];               // [node, positional index]
    while (queue.length > 0) {
        const levelSize = queue.length;
        const firstIndex = queue[0][1];       // leftmost node's index at this level
        let lastIndex = firstIndex;
        const nextQueue = [];
        for (let i = 0; i < levelSize; i++) {
            const [node, index] = queue[i];
            lastIndex = index;
            const normalizedIndex = index - firstIndex;    // re-base to prevent overflow on deep trees
            if (node.left) nextQueue.push([node.left, 2 * normalizedIndex]);
            if (node.right) nextQueue.push([node.right, 2 * normalizedIndex + 1]);
        }
        maxWidth = Math.max(maxWidth, lastIndex - firstIndex + 1);
        queue = nextQueue;
    }
    return maxWidth;
}
```
**Speed**: O(n) — standard BFS, every node visited once.

## Rules to remember
- **The re-basing (normalization) step is the critical, easy-to-miss detail.** Without subtracting `first_index` before doubling for the next level's indices, the index values can grow exponentially large on deep, left-skewed trees (since indices double at every level regardless of how sparse the actual tree is), risking integer overflow in languages with fixed-size integers, and unnecessarily huge numbers even in Python/JS. Re-basing relative to each level's own leftmost node keeps indices small and bounded by the level's actual width.
- This problem is a clever repurposing of the "array representation of a complete binary tree" indexing scheme (`2i`, `2i+1`) that's normally taught for heaps — recognizing that connection is the entire insight.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Why not just track "number of actual non-null nodes" per level?
```python
# WRONG approach for this specific problem:
def level_node_count(root):
    # standard level-order node counting -- this answers a DIFFERENT question
    # ("how many nodes exist per level"), not "how wide is the span between the
    # leftmost and rightmost nodes, counting missing positions in between."
    pass
```
**The trap**: this is purely a problem-definition trap, not a coding bug — re-reading the problem statement carefully to confirm whether "width" means "count of actual nodes" or "span including gaps" is essential, since both are legitimate, differently-named interview questions (this one specifically wants the gap-inclusive span).

### Twist 2: Extremely deep, heavily left-skewed tree causing index overflow WITHOUT the normalization fix
```python
# Without normalization: a left-skewed tree of depth 30 would need indices up to 2^30 --
# depth 60 would need 2^60, which can silently become a performance or overflow problem
# in fixed-width-integer languages (though Python handles big integers natively).
```
**The trap**: even though Python and JavaScript don't suffer hard integer overflow the way fixed-width languages (C++, Java) do, allowing indices to grow unboundedly large still silently degrades performance (big integer arithmetic becomes progressively more expensive) — the per-level re-basing fix should be applied as standard practice regardless of language, not treated as an optional micro-optimization.

## Interview Q&A

**Q1: Why can't maximum width simply be computed as "the maximum number of nodes present at any single level" (i.e., reusing the level-order traversal from file 85 directly)?**
Because "width," as this problem defines it, measures the span between the leftmost and rightmost nodes at a level — including any missing/null positions in between, as if the tree were a complete binary tree. Two nodes at the same level could be positioned far apart with many absent nodes between them, giving a large width despite the actual node *count* at that level being small; simply counting present nodes would undercount the true width in such cases.

**Q2: Why is re-basing (normalizing) each node's index relative to its level's leftmost index necessary, and what specifically goes wrong without it?**
Without it, indices computed via the `2i`/`2i+1` doubling rule grow exponentially with tree depth, regardless of how sparse the tree actually is — a left-skewed tree of depth d would require indices on the order of `2^d`, even though the tree itself might contain very few actual nodes. Re-basing relative to the current level's leftmost node resets the "effective starting point" at every level, keeping index magnitudes bounded by that level's own actual width rather than compounding across the tree's entire depth.

**Q3: What prior topic or data structure does the `2i`, `2i+1` indexing scheme come from, and why does it apply cleanly to this problem?**
This indexing scheme is the standard array-based representation of a complete binary tree, most commonly seen in **heap** implementations, where a node stored at array index `i` has its children at `2i` and `2i+1` with no explicit pointers needed. It applies cleanly here because the width problem is fundamentally asking "how would these nodes be positioned if this were laid out as a complete binary tree array" — which is exactly the question that indexing scheme was designed to answer, making it a natural (if non-obvious) tool to borrow for this specific problem.
