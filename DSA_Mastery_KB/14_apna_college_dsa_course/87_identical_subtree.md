# Identical Tree (Same Tree) & Subtree of Another Tree

Simple words, step by step.

## Part 1: Check if Two Trees Are Identical
Two trees are identical if they have the exact same structure AND the exact same values at every corresponding position.

```python
def is_same_tree(p, q):
    if not p and not q:
        return True               # both empty -- identical (base case)
    if not p or not q:
        return False               # one is empty, the other isn't -- different structure
    if p.val != q.val:
        return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)
```
```javascript
function isSameTree(p, q) {
    if (!p && !q) return true;        // both empty -- identical (base case)
    if (!p || !q) return false;         // one is empty, the other isn't -- different structure
    if (p.val !== q.val) return false;
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}
```
**Speed**: O(min(n, m)) — the recursion stops as soon as any mismatch is found, so in the worst case (truly identical trees) it visits every node of the smaller tree once.

## Part 2: Is One Tree a Subtree of Another?
A tree `s` is a subtree of `t` if there's some node in `t` such that the subtree rooted at that node is **identical** to `s` (reusing Part 1's function directly).

```python
def is_subtree(t, s):
    if not t:
        return False if s else True     # if s also empty, trivially a subtree; otherwise no match possible
    if is_same_tree(t, s):
        return True                       # t ITSELF matches s exactly
    return is_subtree(t.left, s) or is_subtree(t.right, s)   # check recursively in either subtree
```
```javascript
function isSubtree(t, s) {
    if (!t) return !s;                     // if s also empty, trivially a subtree; otherwise no match
    if (isSameTree(t, s)) return true;       // t ITSELF matches s exactly
    return isSubtree(t.left, s) || isSubtree(t.right, s);   // check recursively in either subtree
}
```
**Speed**: O(n × m) worst case — for each of the `n` nodes in `t`, a comparison against `s` can cost up to O(m).

## Rules to remember
- **Reusing `is_same_tree` as a subroutine inside `is_subtree` is the key design choice** — rather than writing a brand-new, from-scratch comparison, Part 2 is really "try `is_same_tree` at every possible starting node in `t`." Recognizing when a new problem is "an earlier solved problem, called repeatedly at different positions" is a core transferable skill across this entire course.
- A common edge case: `s` being empty (`None`) should typically be considered a trivial subtree of anything (or of an also-empty `t`) — always clarify this boundary case with the interviewer rather than assuming.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Optimize subtree-checking using SERIALIZATION + string matching, instead of repeated tree comparisons
```python
def serialize(node):
    if not node:
        return "#"
    return f"^{node.val} {serialize(node.left)} {serialize(node.right)}"   # ^ marks a new node explicitly

def is_subtree_optimized(t, s):
    return serialize(s) in serialize(t)
```
**The trap**: the serialization must include a marker that distinguishes "a node with this value" from "just this value appearing as part of a longer number or an unrelated value" — using a prefix like `^` before each value (and `#` for null) prevents false matches like a tree containing `12` falsely matching a search for `2` purely because the string `"2"` happens to be a substring of `"12"`. This is a genuinely subtle string-matching correctness trap that's easy to miss.

### Twist 2: Check if two trees are "flip-equivalent" — identical allowing left/right children to be swapped at any node
```python
def flip_equivalent(root1, root2):
    if not root1 and not root2:
        return True
    if not root1 or not root2 or root1.val != root2.val:
        return False
    return (
        (flip_equivalent(root1.left, root2.left) and flip_equivalent(root1.right, root2.right))
        or
        (flip_equivalent(root1.left, root2.right) and flip_equivalent(root1.right, root2.left))
    )
```
**The trap**: this requires checking **both** possible pairings (left-with-left + right-with-right, OR left-with-right + right-with-left) at every single node — a true structural match might require different swap decisions at different nodes throughout the tree, so a single global "swap or don't swap" flag applied uniformly would be incorrect; the decision must be made independently, recursively, at each node.

## Interview Q&A

**Q1: Why does checking "is one tree a subtree of another" have a worse time complexity (O(n × m)) than simply comparing two trees for equality (O(min(n, m)))?**
Checking equality compares two trees exactly once. Checking "is `s` a subtree of `t`" effectively requires potentially comparing `s` against the subtree rooted at **every single node** in `t`, since `s` could match starting at any position — in the worst case, this means performing up to `n` separate O(m) equality checks, giving O(n × m) overall.

**Q2: How does the serialization-based optimization (Twist 1) improve the time complexity, and what's the catch?**
Serializing both trees into strings takes O(n + m) time, and then checking if one string is a substring of another can be done in O(n + m) using an efficient string-matching algorithm (like KMP), giving an overall improvement from O(n × m) down to O(n + m). The catch is correctness: the serialization must carefully distinguish node boundaries (using markers like `^` and `#`) to avoid false-positive substring matches that don't correspond to genuine subtree structure — getting this wrong silently produces incorrect results on specific adversarial inputs, even though it passes on most simple test cases.

**Q3: In the flip-equivalence variant, why must both pairing possibilities be checked at every node, rather than deciding once globally whether to "flip" or not?**
Because different nodes in the tree might independently need different swap decisions to achieve an overall match — one subtree might need its children swapped to align with the comparison tree, while a different subtree elsewhere in the same tree might need its children left as-is. A single global flag couldn't capture this per-node independence; only checking both possibilities recursively, independently at each node, correctly explores every valid combination of swap decisions.
