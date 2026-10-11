# Knight's Tour — Backtracking

Simple words, step by step.

## The question
A knight starts on an `n × n` chessboard. Moving only in legal knight moves (the L-shape), visit **every single square exactly once**. Find such a tour (or determine none exists).

## The eight possible knight moves
```
(-2,-1) (-2,+1)
(-1,-2)         (-1,+2)
        KNIGHT
(+1,-2)         (+1,+2)
(+2,-1) (+2,+1)
```

## The backtracking idea
From the current square, try each of the 8 possible knight moves. For each move, check if it's **safe** (inside the board, and not already visited). If safe, move there, mark it visited, and recursively try to complete the rest of the tour. If a move leads to a dead end (no further unvisited square is reachable, and the board isn't fully toured yet), **undo** it and try the next move.

```python
def knights_tour(n):
    board = [[-1] * n for _ in range(n)]
    moves = [(-2,-1),(-2,1),(-1,-2),(-1,2),(1,-2),(1,2),(2,-1),(2,1)]

    def is_safe(row, col):
        return 0 <= row < n and 0 <= col < n and board[row][col] == -1

    def backtrack(row, col, move_count):
        if move_count == n * n:
            return True                 # every square has been visited -- tour complete!

        for dr, dc in moves:
            new_row, new_col = row + dr, col + dc
            if is_safe(new_row, new_col):
                board[new_row][new_col] = move_count        # CHOOSE: record the move number
                if backtrack(new_row, new_col, move_count + 1):   # EXPLORE
                    return True
                board[new_row][new_col] = -1                 # UNCHOOSE

        return False                      # no move worked from here -- trigger backtrack

    board[0][0] = 0                      # start at the top-left corner
    if backtrack(0, 0, 1):
        return board
    return None                           # no tour exists from this starting square
```
```javascript
function knightsTour(n) {
    const board = Array.from({ length: n }, () => Array(n).fill(-1));
    const moves = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

    function isSafe(row, col) {
        return row >= 0 && row < n && col >= 0 && col < n && board[row][col] === -1;
    }

    function backtrack(row, col, moveCount) {
        if (moveCount === n * n) {
            return true;                  // every square has been visited -- tour complete!
        }

        for (const [dr, dc] of moves) {
            const newRow = row + dr, newCol = col + dc;
            if (isSafe(newRow, newCol)) {
                board[newRow][newCol] = moveCount;             // CHOOSE: record the move number
                if (backtrack(newRow, newCol, moveCount + 1)) {  // EXPLORE
                    return true;
                }
                board[newRow][newCol] = -1;                      // UNCHOOSE
            }
        }

        return false;                       // no move worked from here -- trigger backtrack
    }

    board[0][0] = 0;                       // start at the top-left corner
    if (backtrack(0, 0, 1)) {
        return board;
    }
    return null;                            // no tour exists from this starting square
}
```
**Speed**: worst case is extremely large (up to 8^(n²) without pruning), but in practice, for standard board sizes, the search succeeds far faster than the worst case suggests, especially with the optimization in Twist 1 below.

## Rules to remember
- The board stores the **move number** at each visited square (not just `True`/`False`), which both marks a square as visited AND records the final tour order for output — a nice two-birds-one-stone trick worth noticing.
- The order the 8 moves are tried in the `moves` list can meaningfully affect how fast a solution is found in practice (though it doesn't change whether a solution exists) — this sets up the much more important optimization below.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Warnsdorff's Rule — a critical heuristic that makes this actually fast in practice
Plain backtracking on Knight's Tour becomes impractically slow for board sizes beyond roughly 5×5-6×6 without this. **The idea**: at each step, instead of trying moves in a fixed order, always move to the **unvisited square that itself has the FEWEST onward unvisited moves available** (the most "constrained" square, likely to become unreachable later if not visited now).
```python
def count_onward_moves(board, row, col, n, moves):
    count = 0
    for dr, dc in moves:
        nr, nc = row + dr, col + dc
        if 0 <= nr < n and 0 <= nc < n and board[nr][nc] == -1:
            count += 1
    return count

def next_move_warnsdorff(board, row, col, n, moves):
    candidates = []
    for dr, dc in moves:
        nr, nc = row + dr, col + dc
        if 0 <= nr < n and 0 <= nc < n and board[nr][nc] == -1:
            onward = count_onward_moves(board, nr, nc, n, moves)
            candidates.append((onward, nr, nc))
    if not candidates:
        return None
    candidates.sort()                  # fewest onward moves first -- the "most urgent" square
    return candidates[0][1], candidates[0][2]
```
**The trap**: this is a **heuristic**, not a guarantee — it dramatically speeds up finding *a* solution in practice (often without needing any actual backtracking at all), but it does not formally prove a tour exists, and in rare cases can still require some backtracking. Confusing "usually very fast in practice" with "provably always optimal/correct" is a common conceptual mistake when discussing heuristics in interviews.

### Twist 2: "Closed" tour -- the knight's LAST move must be able to return to the starting square
Add one extra check in the base case: when `move_count == n*n - 1` (one square left to visit), confirm the final square is also a valid knight's move away from the starting square (`(0,0)`), not just any remaining unvisited square.
```python
def is_closed_tour_possible(final_row, final_col, start_row, start_col, moves):
    for dr, dc in moves:
        if final_row + dr == start_row and final_col + dc == start_col:
            return True
    return False
```
**The trap**: an "open" tour (visit every square, end anywhere) and a "closed" tour (visit every square, end able to return to the start) are genuinely different problems with different solvability — a board size that has an open tour solution doesn't necessarily have a closed one, and vice versa in edge cases.

### Twist 3: Count the TOTAL number of distinct tours, instead of finding just one
Same change as seen in the Sudoku Solver twist: remove the early `return True`/short-circuit, increment a counter at the base case instead, and let the recursion keep exploring all branches. **The trap**: for Knight's Tour specifically, this becomes computationally infeasible extremely fast even for modest board sizes (counting ALL tours on a full 8×8 board is an enormous, famously hard combinatorial computation) — if asked to "count all tours," the honest, correct interview answer includes acknowledging this is impractical to brute-force at real board sizes, not just writing the counting code and calling it done.

## Tricky Interview Traps to Watch For
- **Warnsdorff's Rule is the single most important "trick" question here** — if an interviewer asks "how would you make Knight's Tour practical for larger boards," pure backtracking without this heuristic is the wrong answer.
- **"A tour" vs "a closed tour" vs "count all tours"** are three meaningfully different problems, same as the repeated "enumerate vs optimize vs count" pattern seen across Sudoku, Combination Sum, and Palindrome Partitioning in this module — always nail down exactly which variant is being asked.
- This problem, together with N-Queens, Sudoku, and Rat in a Maze, is part of a family sometimes called **"constraint satisfaction problems"** — recognizing and naming this family out loud is a strong, senior-level signal that shows you see the shared structure across seemingly different puzzle-style questions.
