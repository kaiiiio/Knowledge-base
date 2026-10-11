# Flatten Binary Tree to Linked List

Simple words, step by step.

## The question
Flatten a binary tree into a "linked list" **in place**, where the linked list follows the tree's **preorder** traversal order — specifically, every node's `left` pointer becomes `null`, and every node's `right` pointer points to the next node in preorder sequence.

## Approach 1: Recursive, using the "reverse postorder" trick
Process nodes in `Right -> Left -> Root` order (the reverse of postorder), keeping track of the "previously processed" node, and link each node's `right` to that.

```python
def flatten(root):
    prev = None

    def reverse_postorder(node):
        nonlocal prev
        if not node:
            return
        reverse_postorder(node.right)     # process right FIRST
        reverse_postorder(node.left)        # then left
        node.right = prev                    # link forward to the previously-processed node
        node.left = None                      # left must always become null
        prev = node                            # this node becomes "previous" for the next (earlier) node processed

    reverse_postorder(root)
```
```javascript
function flatten(root) {
    let prev = null;

    function reversePostorder(node) {
        if (!node) return;
        reversePostorder(node.right);     // process right FIRST
        reversePostorder(node.left);        // then left
        node.right = prev;                    // link forward to the previously-processed node
        node.left = null;                      // left must always become null
        prev = node;                            // this node becomes "previous" for the next (earlier) node processed
    }

    reversePostorder(root);
}
```
**Speed**: O(n) time, O(h) space (recursion stack).

**Why this works**: processing in `Right -> Left -> Root` order means the very LAST node processed overall is the root, and the very FIRST node processed is the preorder-last node (the rightmost-deepest node). Since `prev` always holds "the node that should come immediately after the current node in the final flattened order," and we process in the exact reverse of the desired final order, each node correctly gets linked to the right thing by the time we reach it.

## Approach 2: O(1) space, iterative (reusing the Morris Traversal idea from file 96)
```python
def flatten_o1_space(root):
    curr = root
    while curr:
        if curr.left:
            # find the rightmost node in curr's left subtree (its preorder predecessor's end point)
            rightmost = curr.left
            while rightmost.right:
                rightmost = rightmost.right
            rightmost.right = curr.right          # graft curr's original right subtree onto the end
            curr.right = curr.left                  # left subtree becomes the new right (preorder: root->left->right)
            curr.left = None
        curr = curr.right
    return root
```
```javascript
function flattenO1Space(root) {
    let curr = root;
    while (curr) {
        if (curr.left) {
            let rightmost = curr.left;
            while (rightmost.right) {
                rightmost = rightmost.right;
            }
            rightmost.right = curr.right;            // graft curr's original right subtree onto the end
            curr.right = curr.left;                    // left subtree becomes the new right (preorder: root->left->right)
            curr.left = null;
        }
        curr = curr.right;
    }
    return root;
}
```
**Speed**: O(n) time (same amortized argument as Morris Traversal — each node's "find rightmost" search costs extra, but the total work across the whole tree is still bounded), O(1) **extra** space — no recursion, no stack.

## Rules to remember
- **The "reverse postorder" trick (Right -> Left -> Root) is a specific, memorable pattern**: whenever a problem needs to build something in reverse of its natural order (here, building the flattened list from the end backward), processing children in reverse order while tracking a `prev` pointer is a broadly reusable technique.
- The O(1) space iterative version directly reuses the "graft a subtree using its rightmost descendant" idea from Morris Traversal (file 96) — recognizing this family resemblance means these two "advanced, rarely needed but impressive" tricks reinforce each other rather than needing to be memorized as unrelated techniques.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Flatten following a different traversal order (e.g., postorder instead of preorder)
```python
def flatten_postorder(root):
    prev = None

    def reverse_preorder(node):          # process in REVERSE of postorder = Root -> Right -> Left... actually,
        nonlocal prev                      # reverse of postorder (L,R,Root) is (Root,R,L) -- process root first, then right, then left
        if not node:
            return
        node.right = prev
        node.left = None
        prev = node
        reverse_preorder(node.right if False else None)  # placeholder -- see trap note below

    # Correct approach: to build postorder-order linked list, process in the EXACT REVERSE of postorder,
    # which is (Root -> Right -> Left) read backward during assignment -- requires care, often easier
    # to just compute the desired traversal list directly and re-link nodes rather than trying to
    # generalize the "reverse-of-X, track prev" trick blindly for every possible traversal order.
```
**The trap**: this is a genuine "don't force-fit a clever trick where it doesn't naturally generalize" lesson — the elegant reverse-postorder trick for preorder-order flattening doesn't trivially generalize to arbitrary other traversal orders; for an unusual target order, it's often clearer and safer to just compute that traversal into a list directly, then do a simple second pass re-linking nodes in that list order, rather than trying to force an analogous "process in reverse, track prev" trick that may not actually hold for that traversal's specific visiting order.

### Twist 2: Flatten but preserve the ability to still navigate the original tree structure (non-destructive)
```python
def flatten_non_destructive(root):
    result = []

    def preorder(node):
        if not node:
            return
        result.append(node.val)
        preorder(node.left)
        preorder(node.right)

    preorder(root)
    # build a NEW separate linked list, leaving the original tree completely untouched
    dummy = ListNode(0)
    curr = dummy
    for val in result:
        curr.next = ListNode(val)
        curr = curr.next
    return dummy.next
```
**The trap**: "flatten in place" (destroying the original tree structure) and "produce an equivalent linked list while preserving the original tree" are different requirements with very different solutions — always clarify whether the original tree structure needs to survive the operation, since the in-place O(1)-space trick is specifically only valid when destroying the original tree's shape is acceptable.

## Interview Q&A

**Q1: Why does processing nodes in Right -> Left -> Root order (rather than the standard postorder Left -> Right -> Root) produce a correctly preorder-ordered flattened list?**
Because the desired final order is preorder (Root -> Left -> Right), and this algorithm builds that final list by linking from the END backward using a `prev` pointer — the LAST node in preorder order (which is the rightmost-deepest node) must be processed FIRST so it becomes available as `prev` when earlier nodes need to link to it. Processing Right before Left before Root, recursively, visits nodes in the exact reverse of the preorder sequence, which is precisely what's needed to build the links correctly from the tail of the final list backward to its head.

**Q2: How does the O(1) space iterative solution avoid needing any stack or recursion, and what's the core repeated operation?**
For each node with a left child, it finds that left child's rightmost descendant (via a simple pointer walk, no stack needed), grafts the node's original right subtree onto the end of that rightmost descendant, then moves the entire left subtree to become the new right subtree (setting left to null). This "graft and replace" operation is performed once per node that has a left child, and then the algorithm simply advances `curr` to `curr.right` — repeating until the whole tree has been processed into a straight right-only chain, all without ever needing to remember "where to come back to" via an explicit stack.

**Q3: Does the "process in reverse order, track a prev pointer" trick generalize cleanly to flattening a tree into any arbitrary traversal order (e.g., postorder-ordered flattening)?**
Not cleanly or automatically — the trick happens to work elegantly for preorder specifically because reversing a Left-Right-Root (postorder) processing order into Right-Left-Root exactly produces the reverse of preorder's own Root-Left-Right sequence, a happy structural coincidence. For other target orders, forcing an analogous "reverse-and-track-prev" approach doesn't necessarily hold the same way, and it's usually safer and clearer to directly compute the desired traversal order as an explicit list first, then do a straightforward second pass to re-link nodes according to that list, rather than trying to derive a clever single-pass trick that may not actually be correct for that specific traversal order.
