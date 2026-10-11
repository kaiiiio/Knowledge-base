# 09 — Advanced Patterns (Complete)

> Consolidated from all sub-notes into one comprehensive file.


---

# Implementation — Blueprint Code


## Advanced
_(source: `implementation\advanced.py`)_


```python
def subsets(nums):
    """
    Backtracking to find all subsets (Power Set).
    """
    res = []
    
    def backtrack(start, path):
        res.append(path[:])
        
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop() # Backtrack
            
    backtrack(0, [])
    return res

def dailyTemperatures(temperatures):
    """
    Monotonic Stack.
    """
    res = [0] * len(temperatures)
    stack = [] # (index, temp)
    
    for i, t in enumerate(temperatures):
        while stack and t > stack[-1][1]:
            stack_i, stack_t = stack.pop()
            res[stack_i] = i - stack_i
        stack.append((i, t))
        
    return res
```


## Permutations Subsets
_(source: `implementation\permutations_subsets.py`)_


```python
def permutations(nums):
    """
    Time: O(N!)
    """
    result = []
    
    def backtrack(path, remaining):
        if not remaining:
            result.append(path[:])
            return
            
        for i in range(len(remaining)):
            # Choose
            val = remaining[i]
            path.append(val)
            
            # Explore
            new_remaining = remaining[:i] + remaining[i+1:]
            backtrack(path, new_remaining)
            
            # Un-choose
            path.pop()
            
    backtrack([], nums)
    return result

def subsets(nums):
    """
    Time: O(2^N)
    """
    result = []
    
    def backtrack(start, path):
        result.append(path[:])
        
        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()
            
    backtrack(0, [])
    return result

if __name__ == "__main__":
    print("Permutations:", permutations([1, 2, 3]))
    print("Subsets:", subsets([1, 2]))
```


---

# Visual Walkthroughs & Animations


## Backtracking Decision Tree
_(source: `visual\backtracking_decision_tree.md`)_


# Backtracking: The Decision Tree

"Explore every path. If you hit a wall, go back."

Problem: Permutations of `[1, 2]`

```
          Root
         /    \
      [1]      [2]
       |        |
    [1, 2]    [2, 1]
```

## The Algorithm
1.  **Choose**: Add an element to current path.
2.  **Explore**: Recurse.
3.  **Un-Choose**: Remove element (Backtrack).

## Visual Trace
1.  Start `[]`.
2.  Choose `1` -> `[1]`.
3.  Choose `2` -> `[1, 2]`. (Done!)
4.  Backtrack -> `[1]`.
5.  Backtrack -> `[]`.
6.  Choose `2` -> `[2]`.
7.  Choose `1` -> `[2, 1]`. (Done!)


## Monotonic Stack Temperature
_(source: `visual\monotonic_stack_temperature.md`)_


# Monotonic Stack: Daily Temperatures

**Problem**: For each day, how many days until a warmer temperature?
Input: `[73, 74, 75, 71, 69, 72, 76]`

## The Pattern
We want to find the **Next Greater Element**.
Use a **Decreasing Stack**.

## Visual
Stack stores indices `(index, temp)`.

1.  `73`: Push. Stack: `[(0, 73)]`
2.  `74`: `74 > 73`. Pop `73`. Answer for `0` is `1-0=1`. Push `74`. Stack: `[(1, 74)]`
3.  `75`: `75 > 74`. Pop `74`. Answer for `1` is `2-1=1`. Push `75`. Stack: `[(2, 75)]`
4.  `71`: `71 < 75`. Push. Stack: `[(2, 75), (3, 71)]`
5.  ...
6.  `72`: `72 > 71`. Pop `71`. Answer for `3` is `5-3=2`.

## Key Idea
Keep the stack sorted. When you find a "breaker" (larger element), you resolve everything in the stack smaller than it.


## N Queens Visual
_(source: `visual\n_queens_visual.py`)_


```python
import time
import os

def solve_n_queens(n):
    board = [['.' for _ in range(n)] for _ in range(n)]
    print(f"👑 N-QUEENS VISUALIZER (N={n})")
    backtrack(board, 0, n)

def backtrack(board, row, n):
    if row == n:
        print_board(board, "✅ SOLUTION FOUND!")
        time.sleep(2)
        return
        
    for col in range(n):
        if is_safe(board, row, col, n):
            board[row][col] = 'Q'
            print_board(board, f"Placing Queen at ({row}, {col})")
            time.sleep(0.5)
            
            backtrack(board, row + 1, n)
            
            board[row][col] = '.' # Backtrack
            print_board(board, f"🔙 Backtracking from ({row}, {col})")
            time.sleep(0.5)

def is_safe(board, row, col, n):
    # Check column
    for i in range(row):
        if board[i][col] == 'Q': return False
        
    # Check diagonals
    for i, j in zip(range(row, -1, -1), range(col, -1, -1)):
        if board[i][j] == 'Q': return False
    for i, j in zip(range(row, -1, -1), range(col, n)):
        if board[i][j] == 'Q': return False
        
    return True

def print_board(board, status):
    os.system('cls' if os.name == 'nt' else 'clear')
    print(f"👑 N-QUEENS: {status}")
    print("-----------------------")
    for row in board:
        print(" ".join(row))

if __name__ == "__main__":
    solve_n_queens(4)
```


---

# Real-World Applications


## Resume Bullet Optimization
_(source: `real_world\resume_bullet_optimization.md`)_


# 🌍 Real World: Resume Bullet Optimization

**Scenario**: You have 10 bullet points. You can only fit 5.
You want to pick the set that maximizes "Impact Score" but covers "Required Keywords".

## The Pattern: Backtracking (Constraint Satisfaction)
We need to try combinations.

1.  **State**: `(index, current_score, covered_keywords)`
2.  **Choice**: Include Bullet `i` OR Skip Bullet `i`.
3.  **Constraint**: Total bullets <= 5.
4.  **Goal**: Maximize `current_score`.

## Optimization
If `current_score + max_possible_remaining < best_score_so_far`, **Prune** (Stop exploring this branch).
This turns O(2^N) into something manageable.


---

# Reference Data (JSON State Snapshots)


## Backtracking Path
_(source: `json\backtracking_path.json`)_


```json
[
    "Start",
    "Choose A",
    "Choose B",
    "Hit Wall",
    "Backtrack",
    "Choose C",
    "Success"
]
```


## Decision Tree
_(source: `json\decision_tree.json`)_


```json
{
    "root": "Start",
    "children": [
        {
            "choice": "Take 1",
            "children": [
                {
                    "choice": "Take 2",
                    "result": "[1, 2]"
                },
                {
                    "choice": "Skip 2",
                    "result": "[1]"
                }
            ]
        },
        {
            "choice": "Skip 1",
            "children": [
                {
                    "choice": "Take 2",
                    "result": "[2]"
                },
                {
                    "choice": "Skip 2",
                    "result": "[]"
                }
            ]
        }
    ],
    "note": "Backtracking explores this tree Depth-First."
}
```
