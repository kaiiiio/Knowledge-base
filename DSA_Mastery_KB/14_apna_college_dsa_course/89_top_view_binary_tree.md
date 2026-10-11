# Top View of a Binary Tree

Simple words, step by step.

## The question
Imagine standing far above the tree and looking straight down. The **top view** is the set of nodes you'd see — for each vertical "column" (horizontal distance from the root), only the **topmost** node in that column is visible; anything below it is hidden.

## The idea
Reuse the **horizontal distance** idea from vertical order traversal (file 85, Twist 2) — but now, for each column, keep only the **first** node encountered **when traversing level by level (BFS)**. Since BFS visits shallower nodes before deeper ones, the first node recorded for any column is guaranteed to be the topmost one for that column.

```python
from collections import defaultdict, deque

def top_view(root):
    if not root:
        return []
    column_table = {}                      # column -> first (topmost) value seen
    queue = deque([(root, 0)])              # (node, horizontal distance)
    while queue:
        node, col = queue.popleft()
        if col not in column_table:          # only record the FIRST node per column
            column_table[col] = node.val
        if node.left:
            queue.append((node.left, col - 1))
        if node.right:
            queue.append((node.right, col + 1))
    return [column_table[c] for c in sorted(column_table)]
```
```javascript
function topView(root) {
    if (!root) return [];
    const columnTable = new Map();            // column -> first (topmost) value seen
    const queue = [[root, 0]];                 // [node, horizontal distance]
    while (queue.length > 0) {
        const [node, col] = queue.shift();
        if (!columnTable.has(col)) {             // only record the FIRST node per column
            columnTable.set(col, node.val);
        }
        if (node.left) queue.push([node.left, col - 1]);
        if (node.right) queue.push([node.right, col + 1]);
    }
    return [...columnTable.keys()].sort((a, b) => a - b).map(c => columnTable.get(c));
}
```
**Speed**: O(n log n) — O(n) to visit every node via BFS, plus O(n log n) to sort the columns at the end (could be O(n) if using an array with a known column-range offset instead of a sorted-keys dictionary).

## Rules to remember
- **Must use BFS, not DFS.** This is the single most commonly tested subtlety of this problem — using DFS would require extra bookkeeping (tracking depth alongside column, and only overwriting a column's value if the new node is shallower) to correctly identify "topmost," whereas BFS gets this correctness "for free" simply by visiting shallower levels first.
- "Only record the first node encountered per column" is the entire trick — once a column has an entry, it's locked in, since nothing visited later in BFS order can be shallower.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Bottom View instead of Top View
```python
def bottom_view(root):
    if not root:
        return []
    column_table = {}
    queue = deque([(root, 0)])
    while queue:
        node, col = queue.popleft()
        column_table[col] = node.val         # ALWAYS overwrite -- the LAST node per column wins
        if node.left:
            queue.append((node.left, col - 1))
        if node.right:
            queue.append((node.right, col + 1))
    return [column_table[c] for c in sorted(column_table)]
```
**The trap**: the fix is almost comically small (remove the `if col not in column_table` guard) — but understanding *why* removing it is correct matters: since BFS processes nodes level by level, the *last* write to any column is necessarily the *deepest* node seen so far for that column, which is exactly "bottom view" wants.

### Twist 2: Two nodes land in the exact same column AND the exact same row (tie-breaking)
When two nodes at the same depth and same horizontal distance both exist (can happen with certain skewed trees), the standard convention for top view is: whichever one was inserted into the BFS queue **first** (i.e., encountered left-to-right among siblings at that level) wins and is kept, since it was "seen first" scanning left to right.
```python
# No code change needed if iterating queue in strict left-to-right insertion order --
# the FIFO queue processing order already respects this tie-break naturally.
```
**The trap**: this is a subtle point interviewers sometimes probe — confirm that your queue processes strictly in insertion order (true FIFO), since an implementation bug that accidentally processes right children before left children at the same level would silently produce a wrong tie-break result for these edge cases.

## Interview Q&A

**Q1: Why must top view use BFS rather than DFS?**
BFS visits nodes level by level, guaranteeing that the first time any column index is encountered, it's encountered by the shallowest (topmost) node that exists in that column — this correctness is automatic and requires no extra depth-tracking. DFS visits nodes in a depth-first order that doesn't respect "shallowest first" globally across the tree, so a DFS-based solution would need to explicitly track and compare depths per column to achieve the same correctness, adding unnecessary complexity.

**Q2: How would the solution change to produce the Bottom View instead of Top View, and why does that specific change work?**
Simply remove the "only insert if the column is not already present" guard, so that every node visited for a given column **overwrites** the previous entry. Because BFS processes shallower nodes before deeper ones, the very last write to any column's entry is guaranteed to come from the deepest node in that column — exactly matching what "bottom view" requires.

**Q3: What's the relationship between Top View and Vertical Order Traversal (from file 85)? Are they solving the same core subproblem?**
Yes — both rely on the identical core idea of assigning each node a "horizontal distance" from the root (incrementing by -1 going left, +1 going right) and grouping/processing nodes by that value using BFS. Vertical order keeps *all* nodes per column (as a list, in top-to-bottom order), while top view keeps only the *first* node per column and bottom view keeps only the *last* — so all three problems are really just "variations on what to do with nodes once grouped by horizontal distance," not fundamentally different algorithms.
