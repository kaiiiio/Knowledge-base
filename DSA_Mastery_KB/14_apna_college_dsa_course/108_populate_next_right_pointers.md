# Populate Next Right Pointers in Each Node

Simple words, step by step.

## The question
Each node has an extra `next` pointer (initially null). Set each node's `next` to point to the node immediately to its right **on the same level** — the last node on each level should point to `null`.

## Approach 1: Simple BFS (works on ANY binary tree, not just perfect ones)
```python
from collections import deque

def connect_bfs(root):
    if not root:
        return root
    queue = deque([root])
    while queue:
        level_size = len(queue)
        for i in range(level_size):
            node = queue.popleft()
            if i < level_size - 1:
                node.next = queue[0]          # peek at the next item still in queue -- it's the next node on this level
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return root
```
```javascript
function connectBFS(root) {
    if (!root) return root;
    let queue = [root];
    while (queue.length > 0) {
        const levelSize = queue.length;
        const nextQueue = [];
        for (let i = 0; i < levelSize; i++) {
            const node = queue[i];
            if (i < levelSize - 1) {
                node.next = queue[i + 1];       // the next item still in this level's queue
            }
            if (node.left) nextQueue.push(node.left);
            if (node.right) nextQueue.push(node.right);
        }
        queue = nextQueue;
    }
    return root;
}
```
**Speed**: O(n) time, O(n) space (the queue can hold up to half the nodes, for the widest level).

## Approach 2: O(1) EXTRA space — using the `next` pointers being BUILT as the mechanism for traversal (perfect binary tree only)
This is the clever, commonly-expected "optimal" solution: once a level's `next` pointers are set, those pointers themselves can be used to traverse across that level without needing a queue at all.

```python
def connect_o1_space(root):
    if not root:
        return root
    leftmost = root
    while leftmost.left:                       # leftmost still has a next level below it
        head = leftmost
        while head:
            head.left.next = head.right          # connect the two children of the SAME parent
            if head.next:
                head.right.next = head.next.left    # connect across DIFFERENT parents, using the already-built level above
            head = head.next                        # move to the next node on the CURRENT level, using its next pointer
        leftmost = leftmost.left                  # move down one level
    return root
```
```javascript
function connectO1Space(root) {
    if (!root) return root;
    let leftmost = root;
    while (leftmost.left) {                      // leftmost still has a next level below it
        let head = leftmost;
        while (head) {
            head.left.next = head.right;            // connect the two children of the SAME parent
            if (head.next) {
                head.right.next = head.next.left;       // connect across DIFFERENT parents, using the already-built level above
            }
            head = head.next;                          // move to the next node on the CURRENT level, using its next pointer
        }
        leftmost = leftmost.left;                  // move down one level
    }
    return root;
}
```
**Speed**: O(n) time, O(1) EXTRA space — no queue, no recursion; this is the key selling point of this approach.

**Why this only works cleanly on a PERFECT binary tree**: the logic assumes every node that has a left child also has a right child (`head.left.next = head.right` would crash or misbehave otherwise), and assumes `head.next.left` always exists whenever `head.next` does. A general (non-perfect) binary tree needs a more careful version (Twist 1).

## Rules to remember
- **The O(1) space trick's core idea: use the LEVEL ABOVE's already-completed `next` pointers as the mechanism to traverse the level below, before that below level's own pointers exist yet.** This "use what you've already built to build the next thing" bootstrapping idea is a distinctive, memorable pattern.
- Always clarify whether the input is guaranteed to be a **perfect** binary tree — Approach 2 as written assumes this; a general/arbitrary binary tree requires extra null-checking (Twist 1) to handle missing children gracefully.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Generalize the O(1) space solution to an ARBITRARY (non-perfect) binary tree
```python
def connect_general_tree(root):
    if not root:
        return root
    leftmost = root
    while leftmost:
        dummy = TreeNode(0)          # dummy head simplifies "building the next level's linked list" logic
        tail = dummy
        head = leftmost
        while head:
            if head.left:
                tail.next = head.left
                tail = tail.next
            if head.right:
                tail.next = head.right
                tail = tail.next
            head = head.next
        leftmost = dummy.next          # the next level's leftmost node, discovered via the dummy's next pointer
    return root
```
**The trap**: without the guarantee that every node has exactly 0 or 2 children, the simple `head.left.next = head.right` approach breaks (a node might have only a right child, or only a left child, or neither) — the fix uses a **dummy head + tail pointer** technique (reused directly from Linked Lists, file 57-67) to flexibly build the next level's chain regardless of which specific children exist at each node, skipping gracefully over any missing ones.

### Twist 2: What if `next` pointers need to connect nodes ACROSS THE ENTIRE TREE in full level-order sequence (not per-level, resetting to null at each level's end)?
**The trap**: this is a different (and actually easier) variant — rather than resetting to null at the end of each level, every node's `next` simply points to whatever comes immediately next in a continuous level-order (BFS) traversal across the ENTIRE tree. The straightforward BFS approach (Approach 1) adapts trivially: just always set `node.next = queue[0]` as long as the queue (now spanning ALL remaining nodes across all levels, not just the current level) isn't empty, rather than resetting per-level boundaries — recognizing which variant is actually being asked matters, since the per-level-reset version needs the extra level-size bookkeeping that this continuous version doesn't.

## Interview Q&A

**Q1: Why does the O(1) space solution specifically require a perfect binary tree, and what exactly would go wrong on a general binary tree without modification?**
The core logic assumes every node with a left child also has a right child (`head.left.next = head.right` directly accesses both without checking existence), and assumes that whenever `head.next` exists, `head.next.left` also exists (used to bridge across different parent nodes on the same level). On a general binary tree where nodes can have just one child or no children, these assumptions fail — attempting to access `.next` on a null left or right child would either throw an error or silently produce incorrect connections, since the code has no fallback logic for gracefully skipping over missing children.

**Q2: In the general (non-perfect) tree version, why is a dummy head node used, and what problem does it solve?**
The dummy head is a standard technique for simplifying linked-list construction when the actual first element of the list being built isn't known in advance (reused directly from the Linked Lists module) — rather than needing special-case logic to handle "is this the very first child found at this level" differently from subsequent children, the dummy node provides a placeholder starting point that the first real child can always be safely attached to via `tail.next = ...`, with `dummy.next` afterward correctly pointing to the actual first real node of the next level, regardless of which specific child (left, right, or both) happened to be the first one encountered.

**Q3: What is the key bootstrapping insight that makes the O(1) space solution possible at all — how can you traverse "the next level" before that level's own `next` pointers have been set?**
The insight is that you don't need the NEXT level's own pointers to traverse IT — you need the CURRENT level's (already fully connected) pointers to traverse across the current level while simultaneously setting up the next level's connections as you go. By the time the algorithm moves down to process what becomes the "current level" in the next iteration of the outer loop, that level's pointers were already fully established during the PREVIOUS iteration's inner loop — each level's connections are fully built using the level above, one level at a time, which is exactly why the outer loop variable (`leftmost`) only needs to move down one level at a time, trusting that everything needed to process it was already set up in the prior pass.
