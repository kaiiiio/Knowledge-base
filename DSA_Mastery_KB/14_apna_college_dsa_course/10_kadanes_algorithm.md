# Kadane's Algorithm — Maximum Subarray Sum

Simple words, step by step.

> This exact problem has a full, deeper write-up already in `13_leetcode_pattern_playbook/01_arrays_two_pointers_sliding_window.md` (Level 2 section). This file is the short, standalone version for this course's lecture order.

## The question
You have a list of numbers (some can be negative). Find the group of numbers next to each other (a "subarray") whose sum is the biggest.

Example: `[-2, 1, -3, 4, -1, 2, 1, -5, 4]` → the best group is `[4, -1, 2, 1]`, which adds up to `6`.

## Brute Force
Try every possible group, add each one up, and keep the best.
```python
def max_subarray_brute(arr):
    n = len(arr)
    best = float('-inf')
    for i in range(n):
        for j in range(i, n):
            total = sum(arr[i:j+1])   # add up this whole group every time -- the slow part
            best = max(best, total)
    return best
```
```javascript
function maxSubarrayBrute(arr) {
    const n = arr.length;
    let best = -Infinity;
    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            let total = 0;
            for (let k = i; k <= j; k++) {   // add up this whole group every time -- the slow part
                total += arr[k];
            }
            best = Math.max(best, total);
        }
    }
    return best;
}
```
**Speed**: checking every group, and adding up each one, takes a long time when the list is big (roughly O(n³)).

## Optimal — Kadane's Algorithm
Walk through the list once. At each number, ask: *"is my running sum so far still helping me, or is it dragging me down?"* If the running sum is negative, throw it away and start fresh from the current number.
```python
def kadane(arr):
    best = arr[0]
    current = arr[0]
    for i in range(1, len(arr)):
        current = max(arr[i], current + arr[i])   # extend, or start fresh
        best = max(best, current)
    return best
```
```javascript
function kadane(arr) {
    let best = arr[0];
    let current = arr[0];
    for (let i = 1; i < arr.length; i++) {
        current = Math.max(arr[i], current + arr[i]);   // extend, or start fresh
        best = Math.max(best, current);
    }
    return best;
}
```
**Speed**: one single walk through the list — O(n).

**Watching it work**, step by step, on `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`:
```
-2: current=-2, best=-2
 1: old sum -2 is bad -> restart: current=1, best=1
-3: current=1-3=-2, best stays 1
 4: old sum -2 is bad -> restart: current=4, best=4
-1: current=4-1=3, best stays 4
 2: current=3+2=5, best=5
 1: current=5+1=6, best=6
-5: current=6-5=1, best stays 6
 4: current=1+4=5, best stays 6   -> final answer: 6
```

## Rules to remember
- Kadane's only works for "biggest sum of numbers next to each other" style questions — it does not apply if the numbers can be picked from anywhere in the list (not next to each other).
- The array must have at least one number — an empty list has no valid answer for this question.

## More Topics Like This (harder wording, for extra reading)
See `13_leetcode_pattern_playbook/01_arrays_two_pointers_sliding_window.md` for Maximum Product Subarray and Maximum Circular Subarray Sum, which extend this exact idea.

## Twisted Tricky Examples (with Solutions)

### Twist 1: All numbers are negative
`[-8, -3, -6, -2, -5, -4]` — what does Kadane's return?

Walk it through: `current = max(-3, -8-3)=-3` → `current=max(-6,-3-6)=-6`... wait, trace carefully:
```
start: best=-8, current=-8
-3: current=max(-3, -8-3=-11)=-3, best=-3
-6: current=max(-6, -3-6=-9)=-6, best stays -3
-2: current=max(-2, -6-2=-8)=-2, best=-2
-5: current=max(-5, -2-5=-7)=-5, best stays -2
-4: current=max(-4, -5-4=-9)=-4, best stays -2
final answer: -2
```
**The trick**: when every number is negative, the answer is the **single largest (least negative) number**, not zero. A common bug is initializing `best = 0` instead of `best = arr[0]` — that would wrongly return `0`, implying "pick an empty subarray," which most versions of this problem do NOT allow (the subarray must be non-empty, contain at least one element). Always initialize `best` and `current` to `arr[0]`, never to `0`, unless the problem explicitly allows an empty subarray.

### Twist 2: Return the actual subarray, not just the sum
```python
def kadane_with_indices(arr):
    best = current = arr[0]
    start = end = temp_start = 0
    for i in range(1, len(arr)):
        if arr[i] > current + arr[i]:
            current = arr[i]
            temp_start = i            # a new subarray is starting here
        else:
            current += arr[i]
        if current > best:
            best = current
            start, end = temp_start, i   # remember the boundaries of the BEST subarray so far
    return best, arr[start:end + 1]
```
```javascript
function kadaneWithIndices(arr) {
    let best = arr[0], current = arr[0];
    let start = 0, end = 0, tempStart = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > current + arr[i]) {
            current = arr[i];
            tempStart = i;              // a new subarray is starting here
        } else {
            current += arr[i];
        }
        if (current > best) {
            best = current;
            start = tempStart; end = i;   // remember the boundaries of the BEST subarray so far
        }
    }
    return [best, arr.slice(start, end + 1)];
}
```
**The trick**: Kadane's basic version only tracks the *sum*, throwing away *where* the best subarray actually started and ended. To recover the actual subarray, you need a `temp_start` marker that updates every time you "restart fresh," and you only commit `start`/`end` when a NEW best sum is found — not every time `temp_start` changes.

### Twist 3: What if the subarray is allowed to be empty, and all numbers are negative?
If empty subarrays ARE allowed, the answer is simply `max(0, kadane_result)` — compare the best non-empty-subarray sum against 0 (the sum of an empty subarray), and take whichever is bigger. This single-line addition completely changes the answer for an all-negative array (from "the least negative number" to flatly "0").

### Twist 4: Maximum sum of a subarray with EXACTLY one negative number allowed/removed (a genuine twist, not in the original problem)
Example: `[2, -1, 3, -4, 5]`, you may remove **at most one** element — find the max subarray sum after the optional removal.
```python
def max_sum_one_removal(arr):
    n = len(arr)
    # fwd[i] = max subarray sum ending at i (normal Kadane's, forward)
    fwd = [0] * n
    fwd[0] = arr[0]
    for i in range(1, n):
        fwd[i] = max(arr[i], fwd[i - 1] + arr[i])

    # bwd[i] = max subarray sum starting at i (Kadane's run backward)
    bwd = [0] * n
    bwd[n - 1] = arr[n - 1]
    for i in range(n - 2, -1, -1):
        bwd[i] = max(arr[i], bwd[i + 1] + arr[i])

    best = max(fwd)                            # best without removing anything
    for i in range(1, n - 1):
        best = max(best, fwd[i - 1] + bwd[i + 1])   # skip index i entirely -- "remove" it
    return best
```
**The trick**: this combines Kadane's algorithm run **forward** AND **backward** — a pattern that shows up constantly once you look for it (it's the exact same two-pass shape as `15_product_except_self.md`'s prefix/suffix trick). Skipping index `i` means joining "best ending just before `i`" with "best starting just after `i`," which is only possible because both directions were precomputed for every index upfront.

## Tricky Interview Traps to Watch For
- **"Find the maximum sum" vs "find the maximum AVERAGE"** — these sound similar but need completely different approaches; maximum average subarray (of a fixed minimum length) typically needs binary search on the answer, not Kadane's.
- **Circular arrays** — if the subarray is allowed to wrap around from the end back to the start, plain Kadane's gives the wrong answer; you need `max(normal Kadane's result, total sum - minimum subarray sum)` (see `13_leetcode_pattern_playbook` for the full derivation).
- **2D version (Maximum Sum Rectangle in a 2D Matrix)** — fix a pair of rows, collapse all columns between those rows into a single 1D array of column-sums, then run plain Kadane's on that 1D array; repeat for every possible row-pair. This turns an O(rows² × cols²) brute force into O(rows² × cols).
