# N-Queens Problem — Backtracking

Simple words, step by step.

## The question
Place `n` queens on an `n × n` chessboard so that **no two queens attack each other** (no two share a row, a column, or a diagonal). Find all such arrangements (or just count them).

## Why this is a backtracking problem
There is no formula to jump straight to an answer — you have to **try** placing a queen, check if it's safe, and if a later placement fails, **go back** and try a different spot. This is the exact choose-explore-unchoose shape from file 44, applied to a much harder "is this choice even valid?" check.

## The idea: one queen per row
Since no two queens can share a row, we only ever need to decide **which column** to place the queen in, for each row, one row at a time. This turns an "n² positions" search into a simpler "n columns per row" search.

```python
def solve_n_queens(n):
    result = []
    cols = set()          # columns that already have a queen
    diag1 = set()          # "/" diagonals already occupied (row - col is constant along this diagonal)
    diag2 = set()          # "\" diagonals already occupied (row + col is constant along this diagonal)
    board = [["."] * n for _ in range(n)]

    def backtrack(row):
        if row == n:
            result.append(["".join(r) for r in board])   # copy the finished board
            return

        for col in range(n):
            if col in cols or (row - col) in diag1 or (row + col) in diag2:
                continue                                    # unsafe -- skip this column

            # CHOOSE
            cols.add(col); diag1.add(row - col); diag2.add(row + col)
            board[row][col] = "Q"

            backtrack(row + 1)                               # EXPLORE

            # UNCHOOSE
            cols.remove(col); diag1.remove(row - col); diag2.remove(row + col)
            board[row][col] = "."

    backtrack(0)
    return result
```
```javascript
function solveNQueens(n) {
    const result = [];
    const cols = new Set();
    const diag1 = new Set();   // "/" diagonals -- row - col is constant
    const diag2 = new Set();   // "\" diagonals -- row + col is constant
    const board = Array.from({ length: n }, () => Array(n).fill("."));

    function backtrack(row) {
        if (row === n) {
            result.push(board.map(r => r.join("")));   // copy the finished board
            return;
        }

        for (let col = 0; col < n; col++) {
            if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
                continue;                                  // unsafe -- skip this column
            }

            // CHOOSE
            cols.add(col); diag1.add(row - col); diag2.add(row + col);
            board[row][col] = "Q";

            backtrack(row + 1);                              // EXPLORE

            // UNCHOOSE
            cols.delete(col); diag1.delete(row - col); diag2.delete(row + col);
            board[row][col] = ".";
        }
    }

    backtrack(0);
    return result;
}
```
**Speed**: worst case is roughly O(n!) (n choices for the first row, fewer for the next due to constraints, and so on), but the diagonal/column checks prune huge parts of the search tree early, making it far faster in practice than a naive "try every n² position for every queen" approach.

## Why the diagonal math works
Every cell on the **same "/" diagonal** (top-right to bottom-left) shares the same value of `row - col`. Every cell on the same **"\" diagonal** (top-left to bottom-right) shares the same value of `row + col`. Instead of checking every previously-placed queen one by one to see if any shares a diagonal (which would be O(n) per check), storing these two values in sets makes each safety check an O(1) lookup.

## Rules to remember
- This is the first problem in this module where the "is this choice valid?" check is not trivial — the three `set` lookups (columns, both diagonal directions) are what make each placement attempt fast; without them, checking safety against every previously placed queen would cost O(n) per attempt instead of O(1).
- The **unchoose** step must undo all three sets *and* the board cell — forgetting even one of the four undo operations corrupts every later branch of the search.

## Interview Q&A

**Q1: Why can each row only need to consider "which column," instead of every one of the n² cells?**
Because the "no two queens share a row" constraint is guaranteed automatically by placing exactly one queen per row, one row at a time, in order. This structural decision alone cuts the search space from n² choices per queen down to n choices per row — a huge, free reduction before any pruning even happens.

**Q2: How do the `row - col` and `row + col` tricks let you check diagonal conflicts in O(1)?**
Every cell along one diagonal direction shares a constant value of `row - col`; every cell along the other diagonal direction shares a constant value of `row + col`. So instead of comparing a candidate cell against every previously placed queen's position individually, you just check "has this exact `row-col` value, or this exact `row+col` value, been used before?" — a direct set membership check, independent of how many queens have already been placed.

**Q3: What is the actual benefit of backtracking's pruning here, compared to generating every possible arrangement of n queens and then checking each one for validity?**
Backtracking abandons an invalid partial arrangement the moment it becomes invalid (as soon as an unsafe column is detected for the current row), rather than finishing a complete, doomed arrangement and only then discovering it's invalid. This "fail fast" property is what makes the real-world runtime far better than the theoretical worst case suggests — most branches are cut off after just a few rows, long before reaching row `n`.

**Q4: How would you modify this solution if you only needed to COUNT the number of valid solutions, not list them all?**
Replace `result.append(...)` with a simple counter increment, and drop the `board` array entirely (it's only needed to actually print/store the solution, not to determine validity) — the `cols`, `diag1`, `diag2` sets are all that's actually required for the safety checks. This is a common, easy follow-up that tests whether you understand which parts of the code exist for correctness versus which parts exist only for output formatting.
