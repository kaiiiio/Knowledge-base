# Binary Trees — Introduction & Traversals

Simple words, step by step.

## What is a binary tree?
A tree where each node has **at most two children**, called `left` and `right`. The topmost node is the **root**. A node with no children is a **leaf**.

```
        1
       / \
      2   3
     / \
    4   5
```

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```
```javascript
class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
```

## Vocabulary (asked constantly, often confused)
- **Depth** of a node: how many edges from the root down to that node.
- **Height** of a node: how many edges from that node down to its deepest leaf.
- **Balanced tree**: for every node, the height difference between its left and right subtrees is at most 1.
- **Complete tree**: every level is fully filled, except possibly the last, which fills left-to-right.
- **Full tree**: every node has either 0 or 2 children (never exactly 1).
- **Perfect tree**: every level is completely filled, and all leaves are at the same depth.

## The three traversal orders
Traversal means visiting every node in some defined order. The names describe **when the current node itself is visited**, relative to its children.

```python
def preorder(root):      # Root -> Left -> Right
    if not root:
        return []
    return [root.val] + preorder(root.left) + preorder(root.right)

def inorder(root):       # Left -> Root -> Right
    if not root:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)

def postorder(root):     # Left -> Right -> Root
    if not root:
        return []
    return postorder(root.left) + postorder(root.right) + [root.val]
```
```javascript
function preorder(root) {       // Root -> Left -> Right
    if (!root) return [];
    return [root.val, ...preorder(root.left), ...preorder(root.right)];
}

function inorder(root) {        // Left -> Root -> Right
    if (!root) return [];
    return [...inorder(root.left), root.val, ...inorder(root.right)];
}

function postorder(root) {      // Left -> Right -> Root
    if (!root) return [];
    return [...postorder(root.left), ...postorder(root.right), root.val];
}
```
On the tree above: **Preorder** = `[1,2,4,5,3]`, **Inorder** = `[4,2,5,1,3]`, **Postorder** = `[4,5,2,3,1]`.

**Why inorder matters specially**: for a Binary **Search** Tree (covered in file 98), inorder traversal visits nodes in **sorted order** — this one fact underlies a huge number of BST problems.

## Level-Order Traversal (BFS)
Visit nodes level by level, left to right — this needs a **queue**, not recursion.
```python
from collections import deque

def level_order(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):       # process exactly one full level at a time
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result
```
```javascript
function levelOrder(root) {
    if (!root) return [];
    const result = [];
    const queue = [root];
    while (queue.length > 0) {
        const level = [];
        const levelSize = queue.length;        // process exactly one full level at a time
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(level);
    }
    return result;
}
```
On the tree above: `[[1], [2,3], [4,5]]`.

## The recursive mental model (the single most important idea for this entire module)
Every recursive tree function should be understood by asking: **"what does this function promise to return for any given node, and how does a parent combine the results from its children?"** For `preorder`, the promise is "the list of values in preorder, for the subtree rooted here." The parent trusts that promise for both children and just arranges the pieces (`[root.val] + left_result + right_result`) — exactly the "trust the recursion" framing from file 42, now applied to trees.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Iterative Inorder Traversal (no recursion, explicit stack)
```python
def inorder_iterative(root):
    result = []
    stack = []
    curr = root
    while curr or stack:
        while curr:                 # go as far left as possible, pushing along the way
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()            # leftmost unvisited node
        result.append(curr.val)
        curr = curr.right              # now explore its right subtree
    return result
```
**The trap**: the inner `while curr:` loop (push and go left) must run to completion **before** popping — forgetting this and popping too early visits nodes out of order. This iterative pattern (go-left-pushing, pop, go-right) is the standard template worth memorizing, since many interviewers specifically ask for the non-recursive version to test pointer/stack discipline.

### Twist 2: Vertical Order Traversal (group nodes by horizontal distance from the root)
```python
from collections import defaultdict, deque

def vertical_order(root):
    if not root:
        return []
    columns = defaultdict(list)
    queue = deque([(root, 0)])      # (node, horizontal distance from root)
    while queue:
        node, col = queue.popleft()
        columns[col].append(node.val)
        if node.left:
            queue.append((node.left, col - 1))
        if node.right:
            queue.append((node.right, col + 1))
    return [columns[c] for c in sorted(columns)]
```
**The trap**: this requires **BFS** (level-order), not DFS — if two nodes land in the same column, BFS guarantees they appear in the output in top-to-bottom, then left-to-right order; a DFS-based approach would need extra sorting logic to recover the same guarantee, since DFS naturally visits nodes in a different relative order.

## Interview Q&A

**Q1: Why does inorder traversal of a BST produce sorted output, while the same traversal on an arbitrary binary tree does not?**
Inorder visits left subtree, then the node itself, then right subtree. In a BST specifically, every node's left subtree contains only smaller values and its right subtree only larger values (the BST invariant, covered in file 98) — so visiting left-then-self-then-right at every node, recursively, naturally produces values in increasing order. A tree without this ordering invariant has no such guarantee; inorder just reflects whatever arbitrary left/right structure already exists.

**Q2: Why does level-order traversal require a queue, while preorder/inorder/postorder are naturally recursive (stack-based, implicitly)?**
Level-order needs to process nodes in a strict "closest to root first" order across the whole tree, which requires FIFO behavior — the first nodes discovered (closer to the root) must be processed before later-discovered ones (farther away). A stack (or recursion's implicit call stack) is LIFO, which naturally produces a depth-first order instead, diving deep down one branch before returning to siblings — the opposite of what level-order needs.

**Q3: Given only a tree's preorder and inorder traversal results, can you reconstruct the original tree uniquely? What if you only had preorder and postorder?**
Preorder + inorder together uniquely reconstruct the tree (file 92 covers this directly) — preorder tells you the root first, and inorder lets you split the remaining values into "everything in the left subtree" and "everything in the right subtree" relative to that root, recursively. Preorder + postorder alone, without inorder, generally does **not** uniquely reconstruct the tree when nodes can have only one child — there can be ambiguity about whether a single child is a left or right child, since both traversals would look the same in that case.
