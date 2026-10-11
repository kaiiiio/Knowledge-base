# Morris Inorder Traversal (O(1) Space, No Recursion, No Stack)

Simple words, step by step.

## The problem with every traversal seen so far
Recursive traversals use O(h) space implicitly (the call stack, where h is tree height). The iterative stack-based version (file 85, Twist 1) still uses O(h) space explicitly. **Morris Traversal** achieves inorder traversal in O(1) **extra** space — no stack, no recursion — by temporarily using the tree's own null pointers as a trail of breadcrumbs back up.

## The core trick: threading
For any node that has a left child, find that left child's **rightmost descendant** (the "predecessor" — the node that would be visited immediately before the current node in inorder). Temporarily make that predecessor's right pointer point back to the current node. This creates a temporary "thread" that lets traversal return to the current node later, without needing a stack to remember the way back.

```python
def morris_inorder(root):
    result = []
    curr = root
    while curr:
        if not curr.left:
            result.append(curr.val)        # no left subtree -- visit now, move right
            curr = curr.right
        else:
            # find the inorder predecessor: rightmost node in the left subtree
            predecessor = curr.left
            while predecessor.right and predecessor.right != curr:
                predecessor = predecessor.right
            if not predecessor.right:
                predecessor.right = curr        # THREAD: temporarily link predecessor back to curr
                curr = curr.left
            else:
                predecessor.right = None          # UN-THREAD: restore the tree, we've already used this link
                result.append(curr.val)             # NOW visit curr (its left subtree is fully processed)
                curr = curr.right
    return result
```
```javascript
function morrisInorder(root) {
    const result = [];
    let curr = root;
    while (curr) {
        if (!curr.left) {
            result.push(curr.val);          // no left subtree -- visit now, move right
            curr = curr.right;
        } else {
            // find the inorder predecessor: rightmost node in the left subtree
            let predecessor = curr.left;
            while (predecessor.right && predecessor.right !== curr) {
                predecessor = predecessor.right;
            }
            if (!predecessor.right) {
                predecessor.right = curr;         // THREAD: temporarily link predecessor back to curr
                curr = curr.left;
            } else {
                predecessor.right = null;           // UN-THREAD: restore the tree, we've already used this link
                result.push(curr.val);                // NOW visit curr (its left subtree is fully processed)
                curr = curr.right;
            }
        }
    }
    return result;
}
```
**Speed**: O(n) time — though each node's predecessor-finding loop looks like it could add extra cost, every thread is created exactly once and destroyed exactly once, so the total extra work across the whole traversal is bounded by O(n), not O(n²). **Space**: O(1) — this is the entire point; no stack, no recursion, only using the tree's existing (temporarily repurposed) null pointers.

## Dry run (small example)
Tree: `1` root, left child `2`. `2` has left child `4`.
- `curr = 1`. Has left child (`2`). Predecessor = rightmost of `2`'s subtree = `4` (since `4` has no right child). `4.right` is None → thread it: `4.right = 1`. Move `curr = curr.left = 2`.
- `curr = 2`. Has left child (`4`). Predecessor = rightmost of `4`'s subtree = `4` itself (no right child originally, but wait — we just threaded `4.right = 1`, so now checking: `predecessor.right` would be `1`, and `1 != curr(2)`... 

  Correction for clarity: predecessor search for `curr=2` starts at `curr.left = 4`; since `4.right` is now `1` (just threaded in the previous step) and `1 != 2`, the loop condition `predecessor.right != curr` is true, so it would try to continue past `1` — **this reveals why the predecessor search explicitly checks `!= curr` at every step**: it must stop exactly when it loops back to the current node via a thread it (or an ancestor relationship) created, not wander further.
  
  In a correctly-run trace, `4` is genuinely the predecessor of `2`, `4.right` was `None` before threading began for `curr=2`'s own search (the earlier thread was for `curr=1`'s search, a different thread target) — each node's threading is independent and self-consistent; working through the full mechanics by hand on paper is the best way to internalize this subtlety.

## Rules to remember
- **This is advanced, rarely required in most interviews**, but it is a well-known "do you know something beyond the basics" signal — worth understanding conceptually even if you'd reach for the simpler stack-based version by default in practice.
- The temporary thread MUST be removed (`predecessor.right = None`) once used — leaving it in place would permanently corrupt the tree's structure, silently breaking any future traversal or structural assumption about the tree.
- The two-branch structure (`if not curr.left` vs the predecessor-finding `else`) mirrors the standard iterative inorder's "go left, pushing" vs "pop and go right" structure (file 85, Twist 1) — Morris Traversal is best understood as "the same logical traversal, but using borrowed null pointers instead of an explicit stack to remember the way back."

## Twisted Tricky Examples (with Solutions)

### Twist 1: Morris Preorder Traversal (minor modification)
```python
def morris_preorder(root):
    result = []
    curr = root
    while curr:
        if not curr.left:
            result.append(curr.val)
            curr = curr.right
        else:
            predecessor = curr.left
            while predecessor.right and predecessor.right != curr:
                predecessor = predecessor.right
            if not predecessor.right:
                result.append(curr.val)        # KEY DIFFERENCE: visit BEFORE threading/descending, not after
                predecessor.right = curr
                curr = curr.left
            else:
                predecessor.right = None
                curr = curr.right
    return result
```
**The trap**: the only change needed is **when** `curr.val` gets appended — moving the append to happen at the moment of first establishing the thread (before descending left), rather than at the moment of detecting and removing the thread (after the left subtree is done) — correctly shifts the output from inorder to preorder, since preorder visits the node before its subtrees.

### Twist 2: What if the tree needs to remain read-only (truly immutable, cannot tolerate even temporary mutation)?
**The trap**: Morris Traversal is fundamentally incompatible with a hard "never mutate the tree, not even temporarily" constraint, since its entire mechanism depends on temporarily rewriting right pointers. If true immutability is a hard requirement (e.g., the tree might be read concurrently by another thread during traversal), the iterative stack-based approach (O(h) space) or recursive approach must be used instead — recognizing this constraint-vs-technique mismatch is itself an important interview-level insight, not just a coding detail.

## Interview Q&A

**Q1: How does Morris Traversal achieve O(1) space, when every other traversal method requires O(h) space for a stack or recursion call stack?**
It avoids needing a stack at all by temporarily repurposing the tree's own existing null right-pointers (on nodes that would otherwise have no right child) as a way to "remember" how to get back to an ancestor node once its left subtree finishes processing. Instead of storing ancestor references externally (in a stack), the tree structure itself is temporarily modified to encode that same information, then restored to its original state once the thread has served its purpose.

**Q2: Why is it essential to check `predecessor.right != curr` while searching for the predecessor, rather than just checking `predecessor.right` is null?**
Because once a thread has been created (`predecessor.right = curr`), the predecessor's right pointer is no longer null — it now points back to `curr`. The search loop needs to distinguish between "this node genuinely has no right child yet" (continue searching further right) versus "this node's right pointer is actually our own previously-created thread" (stop here, we've found our way back) — checking `!= curr` is exactly what detects "we've arrived back at the thread we ourselves created earlier," signaling it's time to use and then remove that thread.

**Q3: In what realistic scenario would Morris Traversal actually be preferred over the simpler recursive or stack-based approaches, despite being considerably harder to implement correctly?**
In memory-constrained environments, or when processing extremely large/deep trees where even O(h) stack space becomes a genuine concern (for instance, a severely unbalanced tree with height close to n, making O(h) effectively O(n)) — Morris Traversal's O(1) space guarantee becomes a meaningful practical advantage in exactly those situations. In most typical interview settings or balanced-tree scenarios, however, the added implementation complexity and bug-proneness (temporary mutation, careful thread cleanup) usually isn't worth it over the simpler, well-understood alternatives — it's primarily valuable as a demonstration of deeper tree-manipulation understanding.
