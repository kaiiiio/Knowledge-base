# 07 — Sorting & Searching (Complete)

> Consolidated from all sub-notes into one comprehensive file.


---

# Intuition — Mental Models


## When To Use Quick Vs Merge
_(source: `intuition\when_to_use_quick_vs_merge.md`)_


# 🧠 Quick Sort vs Merge Sort

Both are O(N log N). Which one wins?

## Quick Sort
*   **Pros**: Faster in practice (better cache locality). In-place (O(log N) stack space).
*   **Cons**: Worst case O(N^2) (rare with random pivot). Unstable (reorders equal elements).
*   **Use When**: General purpose in-memory sorting (Arrays.sort in Java uses Dual-Pivot Quicksort for primitives).

## Merge Sort
*   **Pros**: Stable. Guaranteed O(N log N). Good for Linked Lists (no random access needed).
*   **Cons**: Uses O(N) extra memory.
*   **Use When**: Sorting Linked Lists, External Sorting (Data too big for RAM), or Stability is required (Python's Timsort is based on Merge Sort).


---

# Implementation — Blueprint Code


## Binary Search
_(source: `implementation\binary_search.py`)_


```python
def binary_search(arr, target):
    """
    Time: O(log N)
    Space: O(1)
    Pre-req: Array MUST be sorted.
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1
```


## Merge Sort
_(source: `implementation\merge_sort.py`)_


```python
def merge_sort(arr):
    """
    Time: O(N log N) - Always
    Space: O(N) - Aux array
    Stable: Yes
    """
    if len(arr) <= 1:
        return arr
        
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    sorted_arr = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            sorted_arr.append(left[i])
            i += 1
        else:
            sorted_arr.append(right[j])
            j += 1
            
    sorted_arr.extend(left[i:])
    sorted_arr.extend(right[j:])
    return sorted_arr
```


## Quick Sort
_(source: `implementation\quick_sort.py`)_


```python
import random

def quick_sort(arr):
    """
    Time: O(N log N) avg, O(N^2) worst
    Space: O(log N) stack
    Stable: No
    """
    if len(arr) <= 1:
        return arr
        
    pivot = random.choice(arr)
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)
```


---

# Visual Walkthroughs & Animations


## Binary Search Bounds
_(source: `visual\binary_search_bounds.md`)_


# Binary Search: The Bounds

"Halving the search space."

Target: **7**
Array: `[1, 3, 5, 7, 9, 11]`

## Step 1
`L=0`, `R=5`. `Mid=2` (Val: 5).
5 < 7. Target is to the RIGHT.
`L = Mid + 1 = 3`.

```
[1, 3, 5, 7, 9, 11]
          ^  ^   ^
          L  M   R
```

## Step 2
`L=3`, `R=5`. `Mid=4` (Val: 9).
9 > 7. Target is to the LEFT.
`R = Mid - 1 = 3`.

```
[1, 3, 5, 7, 9, 11]
          ^
        L,R,M
```

## Step 3
`L=3`, `R=3`. `Mid=3` (Val: 7).
7 == 7. **FOUND!**


## Merge Sort Divide Conquer
_(source: `visual\merge_sort_divide_conquer.md`)_


# Merge Sort: Divide and Conquer

"Divide the problem until it's trivial, then combine."

## The Process
1.  **Divide**: Split array in half.
2.  **Conquer**: Recursively sort both halves.
3.  **Combine**: Merge two sorted halves.

```
       [38, 27, 43, 3]
          /      \
    [38, 27]    [43, 3]
     /    \      /    \
   [38]  [27]  [43]  [3]  <-- Base Case (Sorted!)
     \    /      \    /
    [27, 38]    [3, 43]   <-- Merge
          \      /
       [3, 27, 38, 43]    <-- Final Merge
```

## Complexity
*   **Time**: O(N log N) always.
*   **Space**: O(N) (Auxiliary array).


## Merge Sort Split
_(source: `visual\merge_sort_split.py`)_


```python
import time

def visualize_merge_sort(arr, depth=0):
    indent = "  " * depth
    print(f"{indent}⬇️ Splitting: {arr}")
    time.sleep(0.5)
    
    if len(arr) <= 1:
        print(f"{indent}✅ Base Case: {arr}")
        return arr
        
    mid = len(arr) // 2
    left = visualize_merge_sort(arr[:mid], depth+1)
    right = visualize_merge_sort(arr[mid:], depth+1)
    
    print(f"{indent}🔄 Merging {left} and {right}")
    merged = merge(left, right)
    print(f"{indent}⬆️ Result: {merged}")
    time.sleep(0.5)
    return merged

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

if __name__ == "__main__":
    arr = [38, 27, 43, 3]
    print("🧩 MERGE SORT VISUALIZER")
    visualize_merge_sort(arr)
```


## Quick Sort Pivot
_(source: `visual\quick_sort_pivot.py`)_


```python
import time

def visualize_quick_sort(arr):
    print(f"\n⚡ QUICK SORT: {arr}")
    if len(arr) <= 1:
        return arr
        
    pivot = arr[len(arr) // 2]
    print(f"🎯 Pivot selected: {pivot}")
    
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    print(f"   Left (<{pivot}): {left}")
    print(f"   Middle (={pivot}): {middle}")
    print(f"   Right (>{pivot}): {right}")
    time.sleep(1)
    
    return visualize_quick_sort(left) + middle + visualize_quick_sort(right)

if __name__ == "__main__":
    arr = [10, 7, 8, 9, 1, 5]
    print("Sorted:", visualize_quick_sort(arr))
```


---

# Real-World Applications


## Ranking Jobs By Hybrid Score
_(source: `real_world\ranking_jobs_by_hybrid_score.md`)_


# 🌍 Real World: Ranking Jobs (Hybrid Score)

**Scenario**: You want to show "Best Matches" first.
Score = `(SkillMatch * 0.7) + (Recency * 0.2) + (Salary * 0.1)`

## The Problem
You have 10,000 jobs. You calculate the score for all of them.
Now you need to sort them.

## The Solution: Custom Comparator
Most languages allow sorting objects with a custom function.

```python
jobs = [
    {"id": 1, "score": 0.85},
    {"id": 2, "score": 0.92},
    {"id": 3, "score": 0.60}
]

# Sort descending by score
jobs.sort(key=lambda x: x["score"], reverse=True)
```

## Under the Hood
Python uses **Timsort** (Hybrid Merge Sort + Insertion Sort).
It's stable and incredibly fast for real-world data (which is often partially sorted).


---

# Practice Problems


## Leetcode 912 Sort Array
_(source: `practice\leetcode_912_sort_array.md`)_


# ⚔️ LeetCode 912: Sort an Array

**Difficulty**: Medium
**Pattern**: Merge Sort / Heap Sort

## Problem
Sort an array of integers in O(N log N) time.

## Approach: Merge Sort
Implement Merge Sort from scratch.
(Quick Sort might TLE on LeetCode due to worst-case test cases).

```python
def sortArray(nums):
    if len(nums) <= 1:
        return nums
        
    mid = len(nums) // 2
    left = sortArray(nums[:mid])
    right = sortArray(nums[mid:])
    
    return merge(left, right)

def merge(left, right):
    res = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            res.append(left[i])
            i += 1
        else:
            res.append(right[j])
            j += 1
    res.extend(left[i:])
    res.extend(right[j:])
    return res
```


---

# Reference Data (JSON State Snapshots)


## Sort Snapshot
_(source: `json\sort_snapshot.json`)_


```json
{
    "algorithm": "Merge Sort",
    "steps": [
        {
            "step": 1,
            "arr": [
                38,
                27,
                43,
                3
            ],
            "action": "Split"
        },
        {
            "step": 2,
            "arr": [
                [
                    38,
                    27
                ],
                [
                    43,
                    3
                ]
            ],
            "action": "Split"
        },
        {
            "step": 3,
            "arr": [
                [
                    38
                ],
                [
                    27
                ],
                [
                    43
                ],
                [
                    3
                ]
            ],
            "action": "Base Case"
        },
        {
            "step": 4,
            "arr": [
                [
                    27,
                    38
                ],
                [
                    3,
                    43
                ]
            ],
            "action": "Merge"
        },
        {
            "step": 5,
            "arr": [
                3,
                27,
                38,
                43
            ],
            "action": "Final Merge"
        }
    ]
}
```


## Sorted Jobs Snapshot
_(source: `json\sorted_jobs_snapshot.json`)_


```json
[
    {
        "jobId": "J102",
        "score": 0.95,
        "title": "Senior Dev"
    },
    {
        "jobId": "J505",
        "score": 0.88,
        "title": "Mid Dev"
    },
    {
        "jobId": "J001",
        "score": 0.72,
        "title": "Junior Dev"
    }
]
```
