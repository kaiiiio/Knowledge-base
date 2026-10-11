# Rat in a Maze — Backtracking

Simple words, step by step.

## The question
A rat starts at the top-left corner of an `n × n` maze grid and must reach the bottom-right corner. It can only move through open cells (marked `1`), not blocked cells (marked `0`). Find all possible paths.

## The backtracking idea
From the current cell, try moving in each allowed direction (commonly Down, Left, Right, Up — order can vary). For each direction, check if the move is valid (inside the grid, the cell is open, and not already visited in this path). If valid, move there, mark it visited, and recursively continue. If a direction leads to a dead end, **undo** (unmark it) and try the next direction.

```python
def find_paths(maze):
    n = len(maze)
    result = []
    visited = [[False] * n for _ in range(n)]

    def is_safe(row, col):
        return 0 <= row < n and 0 <= col < n and maze[row][col] == 1 and not visited[row][col]

    def backtrack(row, col, path):
        if row == n - 1 and col == n - 1:
            result.append(path)
            return

        visited[row][col] = True          # CHOOSE: mark this cell visited

        moves = [("D", 1, 0), ("L", 0, -1), ("R", 0, 1), ("U", -1, 0)]
        for direction, dr, dc in moves:
            new_row, new_col = row + dr, col + dc
            if is_safe(new_row, new_col):
                backtrack(new_row, new_col, path + direction)   # EXPLORE

        visited[row][col] = False         # UNCHOOSE: let other paths revisit this cell

    if maze[0][0] == 1:
        backtrack(0, 0, "")
    return result
```
```javascript
function findPaths(maze) {
    const n = maze.length;
    const result = [];
    const visited = Array.from({ length: n }, () => Array(n).fill(false));

    function isSafe(row, col) {
        return row >= 0 && row < n && col >= 0 && col < n && maze[row][col] === 1 && !visited[row][col];
    }

    function backtrack(row, col, path) {
        if (row === n - 1 && col === n - 1) {
            result.push(path);
            return;
        }

        visited[row][col] = true;           // CHOOSE: mark this cell visited

        const moves = [["D", 1, 0], ["L", 0, -1], ["R", 0, 1], ["U", -1, 0]];
        for (const [direction, dr, dc] of moves) {
            const newRow = row + dr, newCol = col + dc;
            if (isSafe(newRow, newCol)) {
                backtrack(newRow, newCol, path + direction);    // EXPLORE
            }
        }

        visited[row][col] = false;          // UNCHOOSE: let other paths revisit this cell
    }

    if (maze[0][0] === 1) {
        backtrack(0, 0, "");
    }
    return result;
}
```
**Speed**: worst case O(4^(n²)) without pruning (4 choices at every one of n² cells), but the `visited` check and boundary/blocked-cell checks prune heavily in practice. Space: O(n²) for the `visited` grid and recursion depth.

## Rules to remember
- **`visited[row][col] = False` at the end is essential**, and easy to forget — without undoing it, a cell that was part of one failed path stays permanently marked, incorrectly blocking a *different*, potentially valid path that also needs to pass through it.
- Unlike N-Queens (which places exactly one queen per row, no "undo" of the overall structure needed until backtracking), this problem explores a genuinely branching path structure — the same cell can legitimately be revisited by different candidate paths, just never twice *within the same path*.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Find only the SHORTEST path, not all paths
This is a fundamentally different problem shape: when you only need the *shortest* path (not all paths, not any valid path), **backtracking/DFS is the wrong tool** — BFS is correct instead, because BFS explores layer-by-layer, guaranteeing the first time it reaches the destination, it's via the shortest possible route. DFS/backtracking can easily find a long, winding path before ever finding a short one, since it commits to one direction fully before backing out.
```python
from collections import deque
def shortest_path(maze):
    n = len(maze)
    if maze[0][0] != 1:
        return -1
    queue = deque([(0, 0, 0)])    # (row, col, distance)
    visited = {(0, 0)}
    while queue:
        row, col, dist = queue.popleft()
        if row == n - 1 and col == n - 1:
            return dist
        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            nr, nc = row + dr, col + dc
            if 0 <= nr < n and 0 <= nc < n and maze[nr][nc] == 1 and (nr, nc) not in visited:
                visited.add((nr, nc))
                queue.append((nr, nc, dist + 1))
    return -1   # no path exists
```
**The trap**: candidates often reach for backtracking reflexively for any "find a path" question, without checking whether the question actually wants "any/all paths" (backtracking/DFS) or "the shortest path" (BFS) — these need genuinely different algorithms, not just a tweak.

### Twist 2: The rat can move in ALL 8 directions (including diagonals)
Just add 4 more direction tuples to the `moves` list: `("DR", 1, 1), ("DL", 1, -1), ("UR", -1, 1), ("UL", -1, -1)`. **The trap**: this seemingly tiny change can create many more possible paths and dramatically increases the branching factor (from 4 to 8 choices per cell) — worth explicitly naming the complexity impact if asked, since it changes the practical runtime a lot even though the algorithm's *shape* doesn't change at all.

### Twist 3: Some cells have a "cost" to move through -- find the path with minimum total cost (not just any valid path)
This is secretly **Dijkstra's Algorithm** (covered later in the Graphs module), not plain backtracking — once a "cost" is introduced and you need the *cheapest* path rather than just *a* path, you need a priority-queue-based shortest-path algorithm, not DFS/backtracking or even plain BFS (which only works when every move costs the same "1 step").

## Tricky Interview Traps to Watch For
- **"Find a path" (backtracking/DFS), "find the shortest path" (BFS), and "find the cheapest/weighted path" (Dijkstra's) are three different algorithm families** wearing very similar-sounding problem descriptions — the single most important first question to ask yourself is which of these three is actually being requested.
- Forgetting to unmark `visited` on backtrack is the single most common bug across every maze/path backtracking problem — if your output is missing paths that should clearly exist, this is the first thing to check.
