# Rotting Oranges (Multi-Source BFS)

Simple words, step by step.

## The question
A grid has cells: `0` (empty), `1` (fresh orange), `2` (rotten orange). Every minute, any fresh orange ADJACENT to a rotten orange becomes rotten too. Return the minimum number of minutes until no fresh orange remains, or `-1` if some fresh orange can never become rotten.

## The key insight: MULTI-SOURCE BFS
This is NOT "BFS from one starting point" — it's BFS starting simultaneously from **every** rotten orange at once. All rotten oranges spread in parallel, minute by minute. The trick: push **all** initially-rotten cells into the queue **before** starting the BFS loop, rather than starting from a single source.

```python
from collections import deque

def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh_count = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c, 0))          # (row, col, minute-it-became-rotten)
            elif grid[r][c] == 1:
                fresh_count += 1

    max_minutes = 0
    directions = [(-1,0), (1,0), (0,-1), (0,1)]
    while queue:
        r, c, minute = queue.popleft()
        max_minutes = max(max_minutes, minute)
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                grid[nr][nc] = 2                    # rot this fresh orange
                fresh_count -= 1
                queue.append((nr, nc, minute + 1))

    return max_minutes if fresh_count == 0 else -1
```
```javascript
function orangesRotting(grid) {
    const rows = grid.length, cols = grid[0].length;
    const queue = [];
    let freshCount = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === 2) {
                queue.push([r, c, 0]);               // [row, col, minute-it-became-rotten]
            } else if (grid[r][c] === 1) {
                freshCount += 1;
            }
        }
    }

    let maxMinutes = 0;
    const directions = [[-1,0],[1,0],[0,-1],[0,1]];
    let head = 0;
    while (head < queue.length) {
        const [r, c, minute] = queue[head++];
        maxMinutes = Math.max(maxMinutes, minute);
        for (const [dr, dc] of directions) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
                grid[nr][nc] = 2;                       // rot this fresh orange
                freshCount -= 1;
                queue.push([nr, nc, minute + 1]);
            }
        }
    }

    return freshCount === 0 ? maxMinutes : -1;
}
```
**Speed**: O(rows × cols) — every cell is enqueued and processed at most once, same bound as single-source BFS.

## Rules to remember
- **Multi-source BFS is a direct generalization of regular BFS: instead of initializing the queue with ONE start node, initialize it with ALL simultaneous starting points.** The BFS mechanics afterward are completely unchanged — this is the single core insight, and it's a broadly reusable pattern whenever a problem describes several things "spreading" or "starting" at the same time (fire spreading from multiple points, multiple infected cells, nearest distance to ANY of several target cells).
- Tracking "distance" (here, minutes) alongside each queue entry — exactly as in file 112's shortest-distance BFS variant — is what allows computing the final answer (`max_minutes`) as a byproduct of the traversal, without needing a separate pass.
- The `fresh_count == 0` final check is essential and easy to forget: if any fresh orange is unreachable (isolated by walls of `0`s from every rotten orange), the BFS naturally terminates without rotting it, and the function must explicitly detect this remaining-fresh-count to correctly return `-1`, rather than incorrectly returning whatever `max_minutes` happened to reach before running out of reachable oranges.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Multiple fire/infection sources spreading at DIFFERENT speeds or starting at DIFFERENT times
**The trap**: if different sources don't all start at minute 0 (e.g., some rotten oranges appear "already rotten" from the start, but others are described as becoming rotten only after some initial delay), the simple "push everything with distance 0 upfront" trick needs adjustment — each source should be pushed with ITS OWN actual starting time/distance, not uniformly 0, and `max_minutes`/distance tracking must correctly account for these different starting offsets; always carefully re-read the problem statement to confirm all sources genuinely start simultaneously before assuming the simple uniform-start multi-source template applies unchanged.

### Twist 2: Find the SPECIFIC cell that takes the LONGEST to become rotten (not just the total time)
```python
def last_rotten_cell(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    last_cell = None
    max_minutes = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c, 0))

    directions = [(-1,0), (1,0), (0,-1), (0,1)]
    while queue:
        r, c, minute = queue.popleft()
        if minute > max_minutes:
            max_minutes = minute
            last_cell = (r, c)                 # track WHICH cell achieved the new maximum, not just the number
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                grid[nr][nc] = 2
                queue.append((nr, nc, minute + 1))

    return last_cell
```
**The trap**: a minor, low-risk extension — simply tracking the cell coordinates alongside the running maximum, rather than discarding them; the core BFS logic is completely unchanged, reinforcing that many "find the specific X" variants of a counting/distance problem just require retaining slightly more information during an otherwise-identical traversal.

## Interview Q&A

**Q1: Why does this problem require pushing ALL rotten oranges into the BFS queue at the start, rather than starting from just one and running BFS repeatedly?**
Because all rotten oranges spread simultaneously and in parallel each minute — a fresh orange adjacent to ANY rotten orange becomes rotten in the same minute, regardless of which specific rotten orange it was adjacent to. Starting BFS from just one rotten orange at a time (running it once per rotten source, sequentially) would incorrectly model the spread as happening one source at a time, producing wrong (too-large) minute counts, since real rotting happens in lockstep across all sources simultaneously. Initializing the queue with every rotten orange at once, all tagged with minute 0, correctly captures this simultaneous, parallel spreading behavior within a single unified BFS pass.

**Q2: Why is checking `fresh_count == 0` at the end essential, rather than just returning `max_minutes` directly?**
Because some fresh oranges might be completely unreachable from any rotten orange — for instance, isolated by a wall of empty (`0`) cells on all sides, with no path for rotting to ever spread to them. In that scenario, the BFS naturally terminates once it has rotted everything it CAN reach, having computed some `max_minutes` value based only on the oranges that successfully got rotted — but this value says nothing about the oranges that were never reached at all. Explicitly tracking and checking `fresh_count` (decrementing it only when an orange actually gets rotted) is the only way to detect this "some oranges remain permanently fresh" scenario and correctly return `-1` instead of a misleadingly specific, but wrong, minute count.

**Q3: How does the "multi-source BFS" technique generalize beyond this specific rotting-oranges scenario — what's the broader pattern to recognize?**
Multi-source BFS applies to any problem describing multiple things spreading, starting, or being measured from SIMULTANEOUSLY, rather than from one single fixed point — the generalization is simply "instead of initializing the BFS queue with one starting node, initialize it with every starting point at once, all at the same initial distance/time, then run the exact same BFS traversal mechanics unchanged." This same template directly applies to problems like "find the distance from every cell to its NEAREST occurrence of some target value" (initialize the queue with every cell containing the target), or "simulate multiple fires/infections spreading simultaneously across a grid" — recognizing "several simultaneous starting points" as the signal to reach for this specific, minor generalization of standard BFS is the key transferable skill.
