# Sudoku Solver — Backtracking

Simple words, step by step.

## The question
Fill a 9×9 Sudoku grid so that every row, every column, and every 3×3 sub-box contains the digits 1-9 exactly once. Some cells are already filled in; fill in the rest.

## The backtracking idea
Find the next empty cell. Try placing digits 1 through 9, one at a time. For each digit, check if it's **safe** (not already in this row, column, or 3×3 box). If safe, place it and recursively try to solve the rest of the board. If the recursive attempt fails (hits a dead end later), **undo** this placement and try the next digit. If no digit works, backtrack further up.

```python
def solve_sudoku(board):
    def is_safe(row, col, num):
        for i in range(9):
            if board[row][i] == num or board[i][col] == num:
                return False                      # conflict in row or column
        box_row, box_col = 3 * (row // 3), 3 * (col // 3)
        for i in range(box_row, box_row + 3):
            for j in range(box_col, box_col + 3):
                if board[i][j] == num:
                    return False                   # conflict in the 3x3 box
        return True

    def backtrack():
        for row in range(9):
            for col in range(9):
                if board[row][col] == 0:            # found an empty cell
                    for num in range(1, 10):
                        if is_safe(row, col, num):
                            board[row][col] = num     # CHOOSE
                            if backtrack():             # EXPLORE
                                return True
                            board[row][col] = 0        # UNCHOOSE
                    return False                        # no digit worked here -- trigger backtrack
        return True                                      # no empty cells left -- solved!

    backtrack()
    return board
```
```javascript
function solveSudoku(board) {
    function isSafe(row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) {
                return false;                       // conflict in row or column
            }
        }
        const boxRow = 3 * Math.floor(row / 3);
        const boxCol = 3 * Math.floor(col / 3);
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (board[i][j] === num) {
                    return false;                    // conflict in the 3x3 box
                }
            }
        }
        return true;
    }

    function backtrack() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {          // found an empty cell
                    for (let num = 1; num <= 9; num++) {
                        if (isSafe(row, col, num)) {
                            board[row][col] = num;       // CHOOSE
                            if (backtrack()) {             // EXPLORE
                                return true;
                            }
                            board[row][col] = 0;          // UNCHOOSE
                        }
                    }
                    return false;                          // no digit worked here -- trigger backtrack
                }
            }
        }
        return true;                                        // no empty cells left -- solved!
    }

    backtrack();
    return board;
}
```
**Speed**: worst case is astronomically large (up to 9^(number of empty cells) without pruning), but the `is_safe` checks prune the vast majority of branches immediately, making real Sudoku puzzles solve in a fraction of a second in practice.

## Rules to remember
- The `return True`/`return False` propagation is what makes the "undo and try the next digit" chain actually work — if `backtrack()` returns `False` (no digit worked at a deeper cell), the caller knows to undo its OWN most recent placement and try its next option, not just give up entirely. This cascading "if the deeper attempt failed, undo and retry" is the real engine of backtracking.
- `is_safe`'s three checks (row, column, box) must ALL be correct — a bug in just the box-index math (`3 * (row // 3)`) is a very common and hard-to-spot mistake, since it only breaks specific cells, not the whole board.

## Twisted Tricky Examples (with Solutions)

### Twist 1: What if the puzzle has NO solution at all?
The algorithm as written correctly returns `False` from the outermost `backtrack()` call if every digit fails at every empty cell along every explored path — it doesn't hang or crash, it just exhaustively proves no solution exists. **The trap**: some implementations forget to check the top-level return value and incorrectly assume "I ran the solver, so the board must now be solved" — always check the boolean result before trusting the board state.

### Twist 2: Validate a PARTIALLY filled board (no solving, just checking current validity)
This is a much easier, related problem that trips people up by feeling deceptively similar:
```python
def is_valid_sudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    for r in range(9):
        for c in range(9):
            val = board[r][c]
            if val == 0:
                continue
            box_id = (r // 3) * 3 + (c // 3)
            if val in rows[r] or val in cols[c] or val in boxes[box_id]:
                return False
            rows[r].add(val); cols[c].add(val); boxes[box_id].add(val)
    return True
```
**The trap**: this is **not** a backtracking problem at all — it's a single O(81) pass with sets, checking only what's already placed. Candidates sometimes over-engineer this into a backtracking solution by mistake, confusing "is this valid right now" with "can this be solved."

### Twist 3: Count the number of possible solutions, instead of finding just one
Change `if backtrack(): return True` to instead increment a global counter every time an empty-cell-free board is reached, and **do not return early** — let the recursion keep exploring other branches even after finding one solution. **The trap**: if you keep the early-return logic from the original solver, you will only ever find and count exactly one solution, silently giving a wrong count for puzzles with multiple valid solutions.

## Tricky Interview Traps to Watch For
- **"Solve Sudoku" vs "Validate Sudoku" vs "Count solutions"** are three different problems that share the `is_safe`/validity-checking logic but need very different control flow around it — always clarify exactly which is being asked.
- **Picking the empty cell with the FEWEST valid candidate digits first** (instead of always scanning row-by-row for the next empty cell) is a real, significant optimization called "constraint propagation" / "minimum remaining values heuristic" — worth mentioning if asked "how would you make this faster?"
