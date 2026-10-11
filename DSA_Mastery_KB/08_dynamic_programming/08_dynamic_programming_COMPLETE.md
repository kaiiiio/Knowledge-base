# 08 — Dynamic Programming (Complete)

> Consolidated from all sub-notes into one comprehensive file.


---

# Intuition — Mental Models


## Overlapping Subproblems
_(source: `intuition\overlapping_subproblems.md`)_


# 🧠 Intuition: Overlapping Subproblems

When should you use Dynamic Programming?
When you are solving the **same problem** over and over again.

## Example: Fibonacci(5)
```
      F(5)
     /    \
   F(4)   F(3)
   /  \   /  \
 F(3) F(2) F(2) F(1)
```
Notice `F(3)` is calculated TWICE.
`F(2)` is calculated THREE times.

## The Fix: Memoization (Caching)
"If I've seen this input before, return the saved answer."

## DP vs Divide & Conquer
*   **Divide & Conquer (Merge Sort)**: Subproblems are unique (splitting unique array parts).
*   **DP**: Subproblems overlap (same index, same state).


---

# Implementation — Blueprint Code


## 0 1 Knapsack
_(source: `implementation\0_1_knapsack.py`)_


```python
def knapsack_01(weights, values, capacity):
    """
    Classic 0/1 Knapsack Problem.
    Time: O(N * W)
    Space: O(N * W)
    """
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            weight = weights[i-1]
            value = values[i-1]
            
            if weight <= w:
                # Max of: (Include Item) vs (Exclude Item)
                include = value + dp[i-1][w-weight]
                exclude = dp[i-1][w]
                dp[i][w] = max(include, exclude)
            else:
                # Cannot include
                dp[i][w] = dp[i-1][w]
                
    return dp[n][capacity]

if __name__ == "__main__":
    w = [1, 2, 3]
    v = [10, 15, 40]
    cap = 6
    print(knapsack_01(w, v, cap)) # 55
```


## Climbing Stairs
_(source: `implementation\climbing_stairs.py`)_


```python
def climb_stairs(n):
    """
    Problem: You can take 1 or 2 steps. How many ways to reach top?
    Same as Fibonacci.
    Time: O(N)
    Space: O(1) - Optimized Bottom-Up
    """
    if n <= 2: return n
    
    one_step_before = 2
    two_steps_before = 1
    
    for _ in range(3, n + 1):
        current = one_step_before + two_steps_before
        two_steps_before = one_step_before
        one_step_before = current
        
    return one_step_before

if __name__ == "__main__":
    print(climb_stairs(5)) # 8
```


## Dp
_(source: `implementation\dp.py`)_


```python
def fib_memo(n, memo={}):
    """
    Top-Down (Recursion + Memoization)
    """
    if n in memo: return memo[n]
    if n <= 1: return n
    
    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
    return memo[n]

def fib_tabulation(n):
    """
    Bottom-Up (Iteration + Table)
    """
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
        
    return dp[n]

if __name__ == "__main__":
    print(fib_memo(10))      # 55
    print(fib_tabulation(10)) # 55
```


---

# Visual Walkthroughs & Animations


## Dp Grid Filler
_(source: `visual\dp_grid_filler.py`)_


```python
import time
import os

def visualize_dp_grid(rows, cols):
    dp = [[0] * cols for _ in range(rows)]
    
    print("🕸️ DP GRID FILLER (Unique Paths)")
    print("--------------------------------")
    
    for r in range(rows):
        for c in range(cols):
            if r == 0 or c == 0:
                dp[r][c] = 1
            else:
                dp[r][c] = dp[r-1][c] + dp[r][c-1]
            
            print_grid(dp, r, c)
            time.sleep(0.5)

def print_grid(dp, curr_r, curr_c):
    os.system('cls' if os.name == 'nt' else 'clear')
    print("🕸️ DP GRID FILLER (Unique Paths)")
    
    for r in range(len(dp)):
        row_str = ""
        for c in range(len(dp[0])):
            val = dp[r][c]
            if r == curr_r and c == curr_c:
                row_str += f"[{val:2}] " # Highlight current
            elif val == 0:
                row_str += " .   "
            else:
                row_str += f" {val:2}  "
        print(row_str)

if __name__ == "__main__":
    visualize_dp_grid(4, 5)
```


## Dp Table Fibonacci
_(source: `visual\dp_table_fibonacci.md`)_


# DP Table: Fibonacci

"Bottom-Up: Solving small problems to solve big ones."

Goal: `Fib(5)`
Base Cases: `Fib(0)=0`, `Fib(1)=1`

## The Table
| Index | 0 | 1 | 2 | 3 | 4 | 5 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Val** | 0 | 1 | 1 | 2 | 3 | 5 |

## The Logic
`dp[i] = dp[i-1] + dp[i-2]`

1.  `dp[2] = 1 + 0 = 1`
2.  `dp[3] = 1 + 1 = 2`
3.  `dp[4] = 2 + 1 = 3`
4.  `dp[5] = 3 + 2 = 5`

**Result**: 5.
**Time**: O(N). **Space**: O(N) (or O(1) if optimized).


## Memoization Tree
_(source: `visual\memoization_tree.md`)_


# DP: Memoization Tree (Top-Down)

## Problem: Fibonacci(5)
Without Memoization: O(2^N) - Exponential
With Memoization: O(N) - Linear

### The Pruned Tree
```
          fib(5)
         /      \
    fib(4)      fib(3)  <-- CACHED! (Don't recompute)
    /    \
fib(3)  fib(2)
  |       |
Cached  Cached
```

### The Cache (HashMap)
`{ 0:0, 1:1, 2:1, 3:2, 4:3, 5:5 }`

**Key Insight**: We only compute each sub-problem ONCE.
The tree becomes a straight line (conceptually).


---

# Real-World Applications


## Cover Letter Generation Paths
_(source: `real_world\cover_letter_generation_paths.md`)_


# 🌍 Real World: Cover Letter Generation

**Scenario**: You want to generate a cover letter.
You have 3 paragraphs. For each paragraph, you have 2 variations (Formal vs Casual).
You want to pick the best combination that fits the "Tone Limit" (e.g., total words < 200).

## The Problem
This is the **Knapsack Problem** (or Shortest Path in DAG).
*   Items: Paragraph variants.
*   Weight: Word count.
*   Value: "Fit Score".

## The Solution: DP
`dp[i][w]` = Max score using first `i` paragraphs with total words `w`.

We build the letter by choosing the path that maximizes score while staying under the word limit.


---

# Practice Problems


## Leetcode 70 Climbing Stairs
_(source: `practice\leetcode_70_climbing_stairs.md`)_


# ⚔️ LeetCode 70: Climbing Stairs

**Difficulty**: Easy
**Pattern**: DP (Fibonacci)

## Problem
You are climbing a staircase. It takes `n` steps to reach the top.
Each time you can climb 1 or 2 steps.
How many distinct ways can you climb to the top?

## Approach
To reach step `i`, you could have come from:
1.  Step `i-1` (took 1 step).
2.  Step `i-2` (took 2 steps).

So: `Ways(i) = Ways(i-1) + Ways(i-2)`.
This is exactly the Fibonacci sequence.

*   Time: O(N)
*   Space: O(1) (Optimized)

```python
def climbStairs(n):
    if n <= 2: return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b
```


---

# Reference Data (JSON State Snapshots)


## Dp Table
_(source: `json\dp_table.json`)_


```json
[
    [
        1,
        1,
        2
    ],
    [
        1,
        2,
        3
    ],
    [
        2,
        3,
        5
    ]
]
```


## Dp Table State
_(source: `json\dp_table_state.json`)_


```json
{
    "problem": "Unique Paths (3x3)",
    "grid": [
        [
            1,
            1,
            1
        ],
        [
            1,
            2,
            3
        ],
        [
            1,
            3,
            6
        ]
    ],
    "formula": "dp[r][c] = dp[r-1][c] + dp[r][c-1]",
    "result": 6
}
```
