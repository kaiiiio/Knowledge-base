# Convert Sorted Array to Balanced BST

Simple words, step by step.

## The question
Given a sorted array, build a **height-balanced** BST from it (height-balanced: for every node, the heights of its left and right subtrees differ by at most 1).

## The idea
Since the array is already sorted, and inorder traversal of a BST produces sorted order (file 98), the array IS essentially "the inorder traversal of the answer, already computed." The question becomes: which element should be the root at each step to guarantee balance?

**Answer: always pick the middle element as the root.** This guarantees the left half and right half (which recursively become the left and right subtrees) are as close to equal in size as possible — directly producing a balanced tree.

```python
def sorted_array_to_bst(nums):
    def build(left, right):
        if left > right:
            return None
        mid = left + (right - left) // 2        # same overflow-safe midpoint formula as binary search (file 17)
        root = TreeNode(nums[mid])
        root.left = build(left, mid - 1)           # left half becomes the left subtree
        root.right = build(mid + 1, right)           # right half becomes the right subtree
        return root

    return build(0, len(nums) - 1)
```
```javascript
function sortedArrayToBST(nums) {
    function build(left, right) {
        if (left > right) return null;
        const mid = left + Math.floor((right - left) / 2);   // same overflow-safe midpoint formula as binary search
        const root = new TreeNode(nums[mid]);
        root.left = build(left, mid - 1);             // left half becomes the left subtree
        root.right = build(mid + 1, right);             // right half becomes the right subtree
        return root;
    }

    return build(0, nums.length - 1);
}
```
**Speed**: O(n) — every element becomes exactly one node, visited once.

## Dry run
`nums = [-10, -3, 0, 5, 9]`.
- `build(0, 4)`: `mid = 2` → root = `0`. Recurse left on `build(0, 1)`, right on `build(3, 4)`.
- `build(0, 1)`: `mid = 0` → root = `-10`. Recurse left on `build(0, -1)` → `None`. Recurse right on `build(1, 1)`: `mid = 1` → root = `-3`, both children `None`.
- `build(3, 4)`: `mid = 3` → root = `5`. Recurse left on `build(3, 2)` → `None`. Recurse right on `build(4, 4)`: `mid = 4` → root = `9`, both children `None`.
- Final tree: root `0`, left subtree `-10` (with right child `-3`), right subtree `5` (with right child `9`) — a balanced BST with height 2.

## Rules to remember
- **"Always pick the middle" is the entire insight** — this directly parallels classic binary search's midpoint selection, just now building a tree structure instead of searching one. Recognizing "sorted array + need for balance → think middle element" is a broadly reusable pattern.
- When the array has an **even** number of elements, there are two valid "middle" choices (the floor-middle or the ceiling-middle) — either produces a valid balanced BST, just a structurally different (but equally valid) one; interviewers sometimes ask about this ambiguity specifically to check understanding, not because one choice is "more correct."

## Twisted Tricky Examples (with Solutions)

### Twist 1: Convert a sorted LINKED LIST (not array) into a balanced BST
```python
def sorted_list_to_bst(head):
    # Convert linked list to array first for O(1) random access to the middle --
    # this trades a bit of extra space for dramatically simpler, faster code.
    values = []
    node = head
    while node:
        values.append(node.val)
        node = node.next
    return sorted_array_to_bst(values)
```
**The trap**: a linked list has no O(1) random access, so directly finding "the middle" requires a slow pointer/fast pointer walk (file 60's technique) at every recursive call, which degrades the overall algorithm to O(n log n) (finding the middle costs O(n) at each of O(log n) recursive levels). Converting to an array first costs O(n) extra space but restores O(n) time overall — a classic space-for-time tradeoff worth explicitly naming and justifying to an interviewer, since "just do the same algorithm" doesn't transfer cleanly between these two input types without acknowledging the complexity cost.

### Twist 2: Multiple valid balanced BSTs exist for the same sorted array — how many, and does it matter which one you produce?
**The trap**: this is a "there is no single correct output" trap — unlike, say, binary search (which has exactly one correct index to return), building *a* balanced BST from a sorted array can validly produce several different tree shapes (differing in which "middle" is chosen when there's a tie), and all of them are equally correct answers. If an interviewer's test harness does an exact structural comparison against one specific expected tree, it's worth clarifying up front whether any valid balanced BST is acceptable, or whether a specific canonical structure (e.g., "always prefer the left-middle on ties") is required.

## Interview Q&A

**Q1: Why does always choosing the middle element as the root guarantee a height-balanced result?**
Choosing the middle splits the remaining array into two halves of nearly equal size (differing by at most one element) at every single recursive step. Since this same balanced-split rule is applied recursively and consistently at every level, the resulting left and right subtrees at every node end up with heights differing by at most one level too — which is exactly the definition of height-balanced, satisfied uniformly throughout the entire tree, not just at the root.

**Q2: Why does converting a sorted linked list to a balanced BST have worse time complexity than doing the same for a sorted array, using the same conceptual algorithm?**
Because arrays support O(1) random access to any index (like the middle element), while linked lists only support O(n) sequential access — finding "the middle node" of a linked list requires an O(n) traversal (even with a fast/slow pointer trick, it's still O(n) per search, just with a smaller constant factor than a naive count-then-walk approach). Since the algorithm recursively needs to find a middle element at each of roughly O(log n) levels of recursion, and each middle-finding operation costs O(n) on a linked list versus O(1) on an array, the overall time complexity rises from O(n) to O(n log n) specifically due to the linked list's access pattern limitation.

**Q3: If the array has an even number of elements, there isn't a single unique middle — does the choice between the two candidate middles actually matter for correctness?**
No, it doesn't affect correctness — both the "lower middle" (`left + (right-left)//2`, which rounds down) and the "upper middle" (rounding up) choices produce a valid height-balanced BST; they simply produce two different, but equally valid, tree shapes. The only time this choice matters is if a specific problem or test harness expects one particular canonical tree structure as the "exact expected output" — in which case the convention needs to be explicitly clarified, since both are mathematically and structurally correct as a "balanced BST from this sorted array."
