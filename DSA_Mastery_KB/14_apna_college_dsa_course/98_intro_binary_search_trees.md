# Binary Search Trees (BST) — Introduction

Simple words, step by step.

## What makes a tree a BST?
A **Binary Search Tree** is a binary tree with one extra invariant, true at **every single node**: everything in that node's left subtree is **smaller** than the node's value, and everything in its right subtree is **larger**. This invariant must hold recursively, for every node, not just direct children.

```
        8
       / \
      3   10
     / \    \
    1   6    14
       / \   /
      4   7 13
```

## Why BSTs matter: O(log n) search, insert, delete (when balanced)
Because of the ordering invariant, searching for a value means you can discard half the remaining tree at every step — exactly the binary search idea (file 17), now applied to a tree structure instead of a sorted array.

```python
def search_bst(root, target):
    if not root:
        return None
    if root.val == target:
        return root
    if target < root.val:
        return search_bst(root.left, target)   # target must be in the left subtree, if anywhere
    return search_bst(root.right, target)        # target must be in the right subtree, if anywhere
```
```javascript
function searchBST(root, target) {
    if (!root) return null;
    if (root.val === target) return root;
    if (target < root.val) {
        return searchBST(root.left, target);    // target must be in the left subtree, if anywhere
    }
    return searchBST(root.right, target);         // target must be in the right subtree, if anywhere
}
```
**Speed**: O(h) where h is the tree's height — O(log n) for a balanced BST, but degrades to O(n) for a skewed BST (e.g., values inserted in already-sorted order, producing a linked-list-shaped tree).

## Insertion
```python
def insert_bst(root, val):
    if not root:
        return TreeNode(val)             # found the empty spot -- insert here
    if val < root.val:
        root.left = insert_bst(root.left, val)
    else:
        root.right = insert_bst(root.right, val)
    return root
```
```javascript
function insertBST(root, val) {
    if (!root) return new TreeNode(val);     // found the empty spot -- insert here
    if (val < root.val) {
        root.left = insertBST(root.left, val);
    } else {
        root.right = insertBST(root.right, val);
    }
    return root;
}
```
**Speed**: O(h) — walks down one path from root to an empty spot, following the BST invariant at each step.

## Deletion (the trickiest of the three — three cases)
```python
def delete_bst(root, key):
    if not root:
        return None
    if key < root.val:
        root.left = delete_bst(root.left, key)
    elif key > root.val:
        root.right = delete_bst(root.right, key)
    else:
        # FOUND the node to delete -- three cases:
        if not root.left:
            return root.right                 # Case 1 & 2: no left child -- replace with right (possibly None)
        if not root.right:
            return root.left                    # Case 2: no right child -- replace with left
        # Case 3: two children -- replace value with INORDER SUCCESSOR (smallest in right subtree),
        # then delete that successor from the right subtree (it's guaranteed to have at most one child)
        successor = root.right
        while successor.left:
            successor = successor.left
        root.val = successor.val
        root.right = delete_bst(root.right, successor.val)
    return root
```
```javascript
function deleteBST(root, key) {
    if (!root) return null;
    if (key < root.val) {
        root.left = deleteBST(root.left, key);
    } else if (key > root.val) {
        root.right = deleteBST(root.right, key);
    } else {
        // FOUND the node to delete -- three cases:
        if (!root.left) return root.right;           // Case 1 & 2: no left child -- replace with right (possibly null)
        if (!root.right) return root.left;             // Case 2: no right child -- replace with left
        // Case 3: two children -- replace value with INORDER SUCCESSOR (smallest in right subtree),
        // then delete that successor from the right subtree (it's guaranteed to have at most one child)
        let successor = root.right;
        while (successor.left) {
            successor = successor.left;
        }
        root.val = successor.val;
        root.right = deleteBST(root.right, successor.val);
    }
    return root;
}
```
**Speed**: O(h) — one path down to find the node, plus (in Case 3) one more path down to find the successor.

## Rules to remember
- **The BST invariant is recursive/global, not just "compare to immediate parent."** A common bug (tested explicitly in file 100, Validate BST) is checking only `node.val` against its immediate children, missing that a right child's entire subtree must be larger than *every* ancestor on the path, not just its direct parent.
- **Inorder traversal of a BST always produces sorted order** (noted first in file 85) — this single fact underlies huge swaths of BST problems: finding the kth smallest (file 102), validating a BST (file 100), finding min distance between nodes (file 101), and more.
- **Deletion's Case 3 (two children) is the one genuinely tricky case** — replacing with either the inorder successor (smallest in right subtree) or the inorder predecessor (largest in left subtree) both work correctly; the successor convention is used here, but both are equally valid and commonly asked about.
- BST performance guarantees (O(log n)) only hold for a **balanced** BST — an adversarially-ordered insertion sequence (e.g., strictly increasing values) degrades a plain BST into an O(n)-per-operation linked list; this is exactly why self-balancing variants (AVL trees, Red-Black trees) exist, though implementing those is rarely expected at this stage.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Deleting using the inorder PREDECESSOR instead of successor — does it matter which one is chosen?
```python
def delete_bst_using_predecessor(root, key):
    if not root:
        return None
    if key < root.val:
        root.left = delete_bst_using_predecessor(root.left, key)
    elif key > root.val:
        root.right = delete_bst_using_predecessor(root.right, key)
    else:
        if not root.left:
            return root.right
        if not root.right:
            return root.left
        predecessor = root.left
        while predecessor.right:
            predecessor = predecessor.right
        root.val = predecessor.val
        root.left = delete_bst_using_predecessor(root.left, predecessor.val)
    return root
```
**The trap**: both successor-based and predecessor-based deletion are equally correct — neither is "more right" than the other; some interviewers specifically ask to implement both to test whether a candidate understands this symmetry is genuine, not a trick with a single correct answer.

### Twist 2: Inserting a DUPLICATE value — where does it go?
**The trap**: this is a convention question, not a universal rule — different implementations handle duplicates differently (reject them outright, always send them right, always send them left, or maintain a count field per node rather than inserting a literal duplicate node). Always explicitly clarify the expected duplicate-handling convention with the interviewer, since the "obvious" choice (`val < root.val` going left, else going right) silently sends duplicates to the right subtree, which may or may not be the desired convention.

## Interview Q&A

**Q1: Why does BST search achieve O(log n) on a balanced tree, but degrade to O(n) on a skewed one?**
The O(log n) guarantee comes from discarding roughly half the remaining nodes at every comparison — but this only holds if each subtree is itself roughly balanced, so that "half the nodes" actually corresponds to "half the remaining height" too. If the tree is skewed (e.g., built by inserting values in already-sorted order, producing a structure where every node has only a right child), there's no meaningful subtree to discard — the search degenerates into checking one node at a time along a single chain, which is exactly the linked-list O(n) case.

**Q2: Why does Case 3 of BST deletion (a node with two children) require finding the inorder successor or predecessor, rather than simply picking any arbitrary value from a subtree?**
Because the replacement value must preserve the BST invariant everywhere in the tree after deletion — it must be larger than everything in the left subtree and smaller than everything in the right subtree, exactly like the original deleted node was. The inorder successor (smallest value in the right subtree) is guaranteed to satisfy this: it's larger than everything in the left subtree (since it comes from the right subtree) and it's the smallest value in the right subtree, so promoting it up preserves correct ordering relative to everything remaining in that right subtree too. Any arbitrary value, picked without this specific "smallest-in-right" (or "largest-in-left") property, could violate the invariant.

**Q3: Why is it guaranteed that the inorder successor found during Case 3 deletion has at most one child, simplifying its own removal?**
The inorder successor is found by walking as far left as possible within the right subtree (`while successor.left`), which means by the time it's found, it has no left child at all (that's literally the stopping condition). It might still have a right child, but it cannot have two children — making its own removal trivially fall into the already-handled "zero or one child" cases of the deletion logic, without ever needing to recursively trigger another "two children" case during that same cleanup step.
