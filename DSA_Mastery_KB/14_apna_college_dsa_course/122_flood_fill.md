# Flood Fill

Simple words, step by step.

## The question
Given a 2D image (grid of colors), a starting pixel `(sr, sc)`, and a new color, change the color of the starting pixel and every pixel connected to it (4-directionally) that shares the **starting pixel's original color** — exactly the "paint bucket" tool in image editing software.

## The idea: this is the exact same grid-DFS/BFS template as Number of Islands (file 116), just with a "same original color" condition instead of "is land"
```python
def flood_fill(image, sr, sc, new_color):
    rows, cols = len(image), len(image[0])
    original_color = image[sr][sc]
    if original_color == new_color:
        return image                  # already the target color -- no-op (see Rules below for why this matters)

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or image[r][c] != original_color:
            return
        image[r][c] = new_color
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    dfs(sr, sc)
    return image
```
```javascript
function floodFill(image, sr, sc, newColor) {
    const rows = image.length, cols = image[0].length;
    const originalColor = image[sr][sc];
    if (originalColor === newColor) {
        return image;                   // already the target color -- no-op (see Rules below for why this matters)
    }

    function dfs(r, c) {
        if (r < 0 || r >= rows || c < 0 || c >= cols || image[r][c] !== originalColor) {
            return;
        }
        image[r][c] = newColor;
        dfs(r + 1, c);
        dfs(r - 1, c);
        dfs(r, c + 1);
        dfs(r, c - 1);
    }

    dfs(sr, sc);
    return image;
}
```
**Speed**: O(rows × cols) — same bound as Number of Islands, each cell visited a constant number of times.

## Rules to remember
- **The `original_color == new_color` early-return guard is NOT just an optimization — it's a correctness fix for a genuine infinite-recursion bug.** Without it, if the new color happens to equal the original color, the `image[r][c] != original_color` check inside `dfs` would NEVER become true for already-painted cells (since painting them doesn't actually change their value), causing the algorithm to revisit the exact same cells forever, infinitely recursing without ever terminating. This is a classic, easy-to-miss edge case worth explicitly calling out, even though it looks like a harmless optimization at first glance.
- This problem is yet another direct instance of the "grid = graph" realization from file 116 — the condition for "is this cell part of the region I'm filling" changes (original color match, instead of land), but the entire traversal skeleton (bounds check, condition check, mark/mutate, recurse in 4 directions) is identical.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Why exactly does `image[r][c] != original_color` fail to terminate if `new_color == original_color`?
```python
# Suppose original_color = 1, new_color = 1 (no actual color change)
# dfs(r, c): image[r][c] == 1 (original_color) -- condition "!= original_color" is FALSE, so we proceed
# image[r][c] = 1  (sets it to new_color, which is the SAME value -- no actual change happened)
# dfs recurses into neighbors... which ALSO still equal original_color (nothing ever changed)
# This repeats forever across the same connected region, with the base case condition never triggering
```
**The trap**: this is purely a conceptual walkthrough of WHY the bug happens, reinforcing that the early-return guard isn't optional cosmetic cleanup — it's the only thing standing between this algorithm and an actual infinite loop (which, in a recursive implementation, would manifest as a stack overflow crash) whenever the new and original colors happen to coincide.

### Twist 2: Flood fill using BFS instead of DFS — any meaningful difference?
```python
from collections import deque

def flood_fill_bfs(image, sr, sc, new_color):
    rows, cols = len(image), len(image[0])
    original_color = image[sr][sc]
    if original_color == new_color:
        return image

    queue = deque([(sr, sc)])
    image[sr][sc] = new_color
    directions = [(-1,0),(1,0),(0,-1),(0,1)]
    while queue:
        r, c = queue.popleft()
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and image[nr][nc] == original_color:
                image[nr][nc] = new_color
                queue.append((nr, nc))
    return image
```
**The trap**: no meaningful difference for this problem — flood fill is a pure connectivity/region-marking problem with no shortest-path or level-based requirement, so BFS and DFS are fully interchangeable here (the same conclusion reached for Number of Islands, file 116); the choice is purely stylistic or driven by practical concerns like recursion depth limits on very large connected regions (where BFS's iterative, non-recursive nature avoids any stack-overflow risk that a deeply recursive DFS might encounter on an enormous single-color region).

## Interview Q&A

**Q1: Why would omitting the `original_color == new_color` check cause this algorithm to infinite-loop, specifically, rather than just producing a wrong (but finite) answer?**
The algorithm's termination relies entirely on the `image[r][c] != original_color` check inside the recursive function eventually becoming true for cells outside the region (stopping further recursion into them) — but if `new_color` equals `original_color`, then "painting" a cell doesn't actually change its stored value at all, meaning that check can never detect "this cell has already been processed and changed," since it's looking for a color MISMATCH that will never occur anywhere within the connected region. Every cell in the region remains indistinguishable from "not yet visited" even after being "visited," causing the DFS to keep recursing into the same cells over and over, forever, rather than naturally running out of new cells to explore.

**Q2: How does this problem relate structurally to Number of Islands (file 116), despite seemingly being about colors and images rather than land and water?**
Both problems reduce to the exact same underlying template: treating a 2D grid as an implicit graph where each cell connects to its 4-directional neighbors, then using DFS or BFS to explore and mark an entire connected region sharing some defining property (same original color here; being land there). The only thing that differs between the two problems is WHAT condition defines "belongs to this region" (`image[r][c] == original_color` versus `grid[r][c] == '1'`) and what action is taken upon visiting a cell (changing its color versus incrementing a counter) — the traversal skeleton itself (bounds check, condition check, mark, recurse in 4 directions) is identical between them.

**Q3: Does switching from a recursive DFS implementation to an iterative BFS implementation provide any genuine correctness or efficiency advantage for flood fill specifically, or is it purely stylistic?**
For flood fill specifically — a pure region-marking/connectivity problem with no shortest-path or level-ordering requirement — BFS and DFS are fully interchangeable in terms of correctness and asymptotic time complexity (both achieve O(rows × cols)). The one genuine practical advantage of the iterative BFS version is avoiding recursion depth limits: a recursive DFS exploring an enormous single-colored connected region (for instance, a large image with one dominant color spanning tens of thousands of pixels) risks a stack overflow due to extremely deep recursion, while the iterative, queue-based BFS version has no such risk, since it doesn't rely on the language's call stack at all — this makes BFS a safer practical default for flood fill specifically on very large images, even though both are equally "correct" in principle.
