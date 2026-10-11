# Inorder Predecessor and Successor in a BST

Simple words, step by step.

## The question
Given a BST and a target value, find its **inorder predecessor** (the largest value smaller than the target) and **inorder successor** (the smallest value larger than the target) — ideally without doing a full inorder traversal, using the BST's ordering invariant directly instead.

## The idea: walk down from the root, tracking the "best candidate so far"
This directly reuses the BST search pattern (file 98): at each node, compare the target to decide which direction to go, but along the way, remember the best predecessor/successor candidate encountered so far.

```python
def inorder_successor(root, target):
    successor = None
    curr = root
    while curr:
        if target < curr.val:
            successor = curr              # curr is a CANDIDATE successor (it's bigger than target) -- remember it
            curr = curr.left                 # but maybe a SMALLER valid successor exists further left
        else:
            curr = curr.right                # curr is too small (or equal) -- successor must be further right
    return successor

def inorder_predecessor(root, target):
    predecessor = None
    curr = root
    while curr:
        if target > curr.val:
            predecessor = curr             # curr is a CANDIDATE predecessor (it's smaller than target) -- remember it
            curr = curr.right                # but maybe a LARGER valid predecessor exists further right
        else:
            curr = curr.left                  # curr is too large (or equal) -- predecessor must be further left
    return predecessor
```
```javascript
function inorderSuccessor(root, target) {
    let successor = null;
    let curr = root;
    while (curr) {
        if (target < curr.val) {
            successor = curr;               // curr is a CANDIDATE successor (it's bigger than target) -- remember it
            curr = curr.left;                  // but maybe a SMALLER valid successor exists further left
        } else {
            curr = curr.right;                 // curr is too small (or equal) -- successor must be further right
        }
    }
    return successor;
}

function inorderPredecessor(root, target) {
    let predecessor = null;
    let curr = root;
    while (curr) {
        if (target > curr.val) {
            predecessor = curr;              // curr is a CANDIDATE predecessor (it's smaller than target) -- remember it
            curr = curr.right;                  // but maybe a LARGER valid predecessor exists further right
        } else {
            curr = curr.left;                    // curr is too large (or equal) -- predecessor must be further left
        }
    }
    return predecessor;
}
```
**Speed**: O(h) — a single downward path walk, exactly mirroring BST search's efficiency (and BST LCA's, file 103).

## Dry run (successor)
BST: `8` root; left child `3`; `3`'s right child `6`; `6`'s children `4` and `7`. Find inorder successor of `6`.
- `curr = 8`: `target(6) < 8` → `successor = 8` (candidate), move left: `curr = 3`.
- `curr = 3`: `target(6) > 3` → go right: `curr = 6`.
- `curr = 6`: `target(6) < 6` is false (equal) → go right (else branch): `curr = 7`.
- `curr = 7`: `target(6) < 7` → `successor = 7` (a BETTER, smaller candidate than the earlier `8`!), move left: `curr = None`.
- Loop ends. Return `successor = 7` — correct, since `7` is indeed the smallest value greater than `6` in this tree.

## Rules to remember
- **The core trick: every time you move LEFT (because the current node is a valid candidate), record that node as your current best answer — because going left might reveal an even BETTER (closer) candidate, but if it doesn't, the current node remains your best answer so far.** This "keep a running best candidate while navigating by comparisons" pattern is conceptually similar to binary-search-on-the-answer's feasibility tracking (files 21-23), just applied to tree navigation instead of array index ranges.
- Successor and predecessor are mirror images of each other (swap `<`/`>`, swap `left`/`right`) — understanding one deeply means the other requires only a careful, mechanical mirroring, not fresh reasoning.

## Twisted Tricky Examples (with Solutions)

### Twist 1: What if the target value doesn't actually exist in the tree?
**The trap**: the algorithm as written handles this gracefully without any special-casing — it was never actually searching for an exact match in the first place, only ever comparing the target's value against nodes to decide direction and update candidates; whether or not the target itself exists in the tree is irrelevant to finding the predecessor/successor of that VALUE, since the algorithm is really just asking "what's the tightest bound in each direction," a question that makes sense regardless of whether the exact value is present.

### Twist 2: Find predecessor/successor in a BST where each node ALSO has a `parent` pointer, and you're given the actual NODE (not just a value) — can this be done without starting from the root?
```python
def successor_with_parent_pointer(node):
    if node.right:
        # successor is the leftmost node in the right subtree
        curr = node.right
        while curr.left:
            curr = curr.left
        return curr
    # no right subtree -- walk up until we find an ancestor we're in the LEFT subtree of
    curr = node
    while curr.parent and curr == curr.parent.right:
        curr = curr.parent
    return curr.parent
```
**The trap**: this is a genuinely different technique, not just a variant of the root-down approach — it exploits the `parent` pointer to avoid needing to restart from the root at all, directly connecting to the exact same "walk up until you're someone's LEFT child" logic used in LCA-with-parent-pointers (file 91, Twist 2) — recognizing this is the same underlying pattern (walking up via parent pointers until a specific structural condition is met) reused yet again is valuable pattern-recognition across seemingly different problems.

## Interview Q&A

**Q1: Why does moving left after finding a "candidate" successor make sense, rather than just returning that candidate immediately?**
Because the current node being a candidate only establishes that it's LARGER than the target — it doesn't establish that it's the SMALLEST such value. Moving further left explores values that are smaller than the current candidate but potentially still larger than the target, which would be an even tighter (better) successor. Only once the traversal runs out of further-left nodes to explore (reaching a dead end) does the last recorded candidate become confirmed as the true, tightest successor — recording it along the way and continuing to search for something even better is exactly how this single-pass approach avoids needing to revisit or backtrack.

**Q2: Why does finding the inorder predecessor/successor using only the BST's structure (no full traversal) work in O(h) time, directly paralleling BST search's efficiency?**
Because the exact same ordering invariant that lets BST search discard half the remaining tree at every step also applies here — at each node, comparing the target to the current node's value immediately tells you with certainty which direction to continue searching, without needing to explore the other subtree at all. The only addition beyond plain search is remembering a running "best candidate so far" as you descend, which adds no extra traversal cost — it's just an O(1) bookkeeping step added to the same O(h) downward walk that search already performs.

**Q3: How does the parent-pointer-based approach for finding a successor (given a node directly, not searching from the root) connect to a technique already seen earlier in the course?**
When the given node has no right subtree, the correct successor is found by walking UP via parent pointers until reaching a node that is specifically its parent's LEFT child (rather than right child) — at that point, the parent itself is the successor. This "walk up until you're someone's left child" structural condition is the exact same underlying technique used in the parent-pointer version of LCA in a Binary Tree (file 91, Twist 2), where walking up via parent pointers to find a specific ancestor relationship was similarly central — recognizing "walking up through parent pointers until some structural condition holds" as a reusable technique, independent of the specific problem it's applied to, is valuable broader pattern recognition.
