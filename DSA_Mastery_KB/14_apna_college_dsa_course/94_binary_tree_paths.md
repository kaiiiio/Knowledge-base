# Binary Tree Paths (Root-to-Leaf)

Simple words, step by step.

## The question
Return all root-to-leaf paths in a binary tree, each formatted as a string like `"1->2->5"`.

## The idea
A classic **backtracking** problem (connecting directly back to the Backtracking module, files 42-55): build a path as you go down, and when you hit a leaf, record the completed path. The "undo" step (removing the last node from the path) happens naturally here because each recursive call works with its own local copy of the path-so-far, rather than mutating a single shared list — though a shared-list version with explicit backtracking is equally valid and more memory-efficient.

```python
def binary_tree_paths(root):
    result = []

    def dfs(node, path):
        if not node:
            return
        path = path + [str(node.val)]          # build a NEW list each call -- no manual "undo" needed
        if not node.left and not node.right:
            result.append("->".join(path))       # reached a leaf -- record the completed path
            return
        dfs(node.left, path)
        dfs(node.right, path)

    dfs(root, [])
    return result
```
```javascript
function binaryTreePaths(root) {
    const result = [];

    function dfs(node, path) {
        if (!node) return;
        path = [...path, String(node.val)];       // build a NEW array each call -- no manual "undo" needed
        if (!node.left && !node.right) {
            result.push(path.join("->"));            // reached a leaf -- record the completed path
            return;
        }
        dfs(node.left, path);
        dfs(node.right, path);
    }

    dfs(root, []);
    return result;
}
```
**Speed**: O(n²) worst case — there are up to n leaf paths, and each path can be up to O(n) long to build/join, giving O(n²) total string work in the worst case (a completely skewed tree).

## Explicit backtracking version (shared mutable path, true "undo")
```python
def binary_tree_paths_explicit_backtrack(root):
    result = []
    path = []

    def dfs(node):
        if not node:
            return
        path.append(str(node.val))                 # CHOOSE: add to the shared path
        if not node.left and not node.right:
            result.append("->".join(path))
        else:
            dfs(node.left)
            dfs(node.right)
        path.pop()                                    # UNDO: remove before returning to the parent call

    dfs(root)
    return result
```
**Why this matters**: this is the textbook "choose, explore, un-choose" backtracking template applied directly to trees — the exact same three-step structure from subsets/permutations/N-Queens (files 44-48), just walking down a tree's branches instead of across an array's choices.

## Rules to remember
- **Two valid styles exist for tracking "path so far" in recursive tree problems**: (1) pass a brand-new copy of the path at every call (simpler to reason about, no risk of forgetting to undo, but costs extra memory for the copies), or (2) mutate one shared list with explicit append/pop (more memory-efficient, but requires remembering the `pop()` "undo" step — forgetting it is a very common bug).
- The leaf-detection condition (`not node.left and not node.right`) is the same "what counts as a leaf" check that appears throughout the Trees module (height, diameter, sum tree) — worth recognizing as a recurring idiom, not re-deriving each time.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Return the path with the MAXIMUM sum, not all paths
```python
def max_sum_path(root):
    best = {"path": [], "sum": float('-inf')}

    def dfs(node, path, current_sum):
        if not node:
            return
        path = path + [node.val]
        current_sum += node.val
        if not node.left and not node.right:
            if current_sum > best["sum"]:
                best["sum"] = current_sum
                best["path"] = path
            return
        dfs(node.left, path, current_sum)
        dfs(node.right, path, current_sum)

    dfs(root, [], 0)
    return best["path"]
```
**The trap**: this is a direct, minor variant — the only real change is tracking a running sum alongside the path and comparing at each leaf, rather than unconditionally recording every path; a common oversight is forgetting that this still requires reaching an actual leaf before comparing, since an incomplete path's partial sum is not comparable to a full root-to-leaf path's sum.

### Twist 2: Check if there EXISTS a root-to-leaf path summing to a target value (don't need the actual path, just yes/no)
```python
def has_path_sum(root, target_sum):
    if not root:
        return False
    if not root.left and not root.right:            # leaf check
        return root.val == target_sum
    remaining = target_sum - root.val
    return has_path_sum(root.left, remaining) or has_path_sum(root.right, remaining)
```
**The trap**: this is dramatically simpler and more efficient than building full path strings — by subtracting the current node's value from the target as you descend, there's no need to track a growing path or running sum at all; recognizing when a problem only needs a yes/no existence answer (rather than the actual path) often unlocks a much leaner solution than the general template.

## Interview Q&A

**Q1: What are the tradeoffs between passing a new path copy at every recursive call versus mutating one shared list with explicit backtracking?**
Passing a new copy at every call is simpler to reason about and eliminates an entire class of bugs (forgetting to "undo" a mutation before returning to the parent), but costs extra memory and time, since a fresh list is allocated at every single node visited — proportional to the path length each time. The shared-mutable-list approach with explicit `append`/`pop` is more memory-efficient (one list reused throughout), but requires strict discipline: the `pop()` undo step must happen for every corresponding `append()`, on every code path (including early returns), or the shared state becomes corrupted for sibling recursive calls.

**Q2: Why is "does a root-to-leaf path sum to a target value" solvable without tracking the actual path or a running total sum explicitly, just by subtracting as you go?**
Because the only thing that ultimately matters is whether the *remaining* amount needed, after subtracting out everything consumed so far, equals exactly the current node's value once a leaf is reached — reformulating the problem as "does `target - root.val` have a valid path in the left or right subtree" recursively shrinks the target itself at every step, which is equivalent to tracking a running sum but requires no extra data structure or path-building overhead at all.

**Q3: Why does the simple collect-all-paths solution have O(n²) worst-case time complexity, and in what tree shape does this worst case actually occur?**
Because in the worst case — a completely skewed tree where every node has only one child, forming essentially a straight line — there is effectively one single path of length n, but similarly, in a tree where there are many leaves each at depth proportional to n (such as certain balanced-but-wide configurations), the total work of building and joining all paths sums to O(n²): each of up to O(n) leaf paths can itself take up to O(n) time to construct and join into a string, and summing path lengths across all leaves in various tree shapes bounds out at O(n²) in the worst realistic case.
