# Number of Islands

Simple words, step by step.

## The question
Given a 2D grid of `'1'` (land) and `'0'` (water), count the number of islands — an island is a group of `'1'`s connected horizontally or vertically (not diagonally, unless stated otherwise).

## The idea: a grid IS a graph in disguise
Each cell is a node; each cell is connected to its up/down/left/right neighbors. "Count the number of islands" is exactly "count the number of connected components" (file 111's vocabulary) — this is the single most important realization: **grid traversal problems are graph traversal problems**, just with an implicit adjacency structure (4 directions) instead of an explicit edge list.

```python
def num_islands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    visited = [[False] * cols for _ in range(rows)]
    count = 0

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or visited[r][c] or grid[r][c] == '0':
            return                          # out of bounds, already visited, or water -- stop
        visited[r][c] = True
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1' and not visited[r][c]:
                count += 1                   # found a NEW island -- sink the whole thing via DFS
                dfs(r, c)
    return count
```
```javascript
function numIslands(grid) {
    if (!grid.length) return 0;
    const rows = grid.length, cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
    let count = 0;

    function dfs(r, c) {
        if (r < 0 || r >= rows || c < 0 || c >= cols || visited[r][c] || grid[r][c] === '0') {
            return;                           // out of bounds, already visited, or water -- stop
        }
        visited[r][c] = true;
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '1' && !visited[r][c]) {
                count += 1;                    // found a NEW island -- sink the whole thing via DFS
                dfs(r, c);
            }
        }
    }
    return count;
}
```
**Speed**: O(rows × cols) — every cell is visited at most a constant number of times (once as the double-loop's entry point, plus revisits blocked immediately by the `visited` check).

## Rules to remember
- **This is the canonical "grid = graph" problem** — recognizing that the exact same "outer loop over all nodes, launch traversal from each unvisited one, count components" pattern from files 111-115 applies unchanged, just with 4-directional grid adjacency replacing an explicit adjacency list, is the single biggest insight. Dozens of grid-based interview problems (flood fill, rotting oranges, surrounded regions, max area of island) are all variations on this exact same template.
- The 4-direction boundary/visited/water check at the top of `dfs` is a standard, memorizable template — it's worth internalizing this exact structure (all four conditions combined into one early-return guard clause) since it reappears in nearly every grid-traversal problem.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Count islands allowing DIAGONAL connections too (8-directional)
```python
def num_islands_diagonal(grid):
    rows, cols = len(grid), len(grid[0])
    visited = [[False] * cols for _ in range(rows)]
    count = 0
    directions = [(-1,-1), (-1,0), (-1,1), (0,-1), (0,1), (1,-1), (1,0), (1,1)]   # all 8 directions

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or visited[r][c] or grid[r][c] == '0':
            return
        visited[r][c] = True
        for dr, dc in directions:
            dfs(r + dr, c + dc)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1' and not visited[r][c]:
                count += 1
                dfs(r, c)
    return count
```
**The trap**: the fix is minor (expand the direction list from 4 to 8), but always explicitly confirm with the interviewer whether diagonal adjacency counts, since this single assumption changes the correct island count for the exact same input grid — it's a classic "clarify the problem definition before coding" trap, not a coding-difficulty trap.

### Twist 2: Modify the grid IN PLACE instead of using a separate `visited` array (saves O(rows×cols) space)
```python
def num_islands_inplace(grid):
    rows, cols = len(grid), len(grid[0])
    count = 0

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '#'          # mark visited by directly overwriting the grid -- no separate visited array needed
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count
```
**The trap**: this is a legitimate, commonly-used space optimization (overwriting the input to double as the "visited" marker), but it's a DESTRUCTIVE mutation of the input — always explicitly clarify whether modifying the input grid in place is acceptable, since some problem contexts (or follow-up questions) might require the original grid to remain unchanged after the function runs, in which case a separate `visited` structure (or a deep-copied grid) is the only acceptable approach despite the extra space cost.

## Interview Q&A

**Q1: Why is "Number of Islands" fundamentally the same problem as "count connected components in a graph," despite looking like a completely different kind of problem on the surface (a 2D grid, not an explicit node/edge list)?**
Because a grid can be modeled exactly as a graph: every cell is a node, and every cell is implicitly connected to its adjacent cells (up/down/left/right, or more, depending on the connectivity rule) that also contain land — this implicit adjacency is conceptually identical to an explicit adjacency list, just computed on the fly via coordinate arithmetic rather than looked up from a stored list. Once this reframing is made, "count the number of islands" becomes literally identical to "count the number of connected components among land cells," solvable with the exact same traversal-and-count algorithm already used for explicit graphs (files 111-115) — no new algorithmic idea is needed, only recognizing the underlying structural equivalence.

**Q2: What's the space tradeoff of marking visited cells by overwriting the grid in place versus using a separate `visited` array, and when would the separate array be the more appropriate (even necessary) choice?**
Overwriting the grid directly saves the O(rows × cols) space that a separate `visited` array would otherwise require, since no additional data structure needs to be allocated — the grid itself encodes both "is this land" and "have I already counted this" information simultaneously. This is only appropriate when destructively modifying the input is acceptable; if the original grid needs to remain unchanged after the function completes (for example, if the caller needs to reuse the same grid for a different query afterward, or if the function is meant to be a pure, non-mutating query), a separate `visited` structure (or an explicit copy of the grid) becomes necessary despite the extra space cost, since in-place marking would permanently and irreversibly alter the caller's original data.

**Q3: Why does the early-return guard clause at the top of the DFS helper function need to check FOUR separate conditions (out of bounds in two directions, already visited, and water) combined into one check, rather than handling them as separate checks or in a different order?**
Combining all four conditions into a single guard clause at the very top of the function is both a correctness and clarity necessity: the out-of-bounds checks MUST come first (or be checked in a way that short-circuits safely), because attempting to access `grid[r][c]` or `visited[r][c]` with an out-of-range index before confirming bounds would cause an index-out-of-range error — in languages/implementations without automatic short-circuit evaluation guarantees for combined boolean conditions, this ordering (bounds checks before any array access) is essential to avoid crashing. Combining them into one guard clause (rather than separate sequential `if` checks) is primarily a readability and conciseness convention, widely used because this exact four-part check recurs identically across nearly every grid-traversal problem, making it worth recognizing and writing as a single memorized unit.
