# Binary Search — Iterative and Recursive

Simple words, step by step.

## The question
Given a **sorted** list and a target value, find the position of the target as fast as possible.

## Why linear search is not good enough here
```python
def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1
```
This checks every box one at a time — O(n). But the list is **sorted**, and we are throwing that fact away completely. Sorted data lets us do something much smarter.

## The big idea behind Binary Search
Look at the **middle** box. Since the list is sorted:
- If the middle value **equals** the target, we are done.
- If the middle value is **bigger** than the target, the target (if it exists) must be somewhere in the **left half** — so we can throw away the entire right half.
- If the middle value is **smaller** than the target, the target must be in the **right half** — throw away the entire left half.

Each check throws away **half** of what is left. That is why this is O(log n) instead of O(n) — the search space shrinks by half every single step, instead of shrinking by just one box.

## Iterative Binary Search
```python
def binary_search_iterative(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = low + (high - low) // 2   # NOT (low + high) // 2 -- see the rule below
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1                # target is in the right half
        else:
            high = mid - 1               # target is in the left half
    return -1
```
```javascript
function binarySearchIterative(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        const mid = low + Math.floor((high - low) / 2);   // NOT Math.floor((low + high) / 2)
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            low = mid + 1;                // target is in the right half
        } else {
            high = mid - 1;               // target is in the left half
        }
    }
    return -1;
}
```

## Recursive Binary Search
```python
def binary_search_recursive(arr, target, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low > high:
        return -1               # search space is empty -- target not found
    mid = low + (high - low) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, high)
    else:
        return binary_search_recursive(arr, target, low, mid - 1)
```
```javascript
function binarySearchRecursive(arr, target, low = 0, high = arr.length - 1) {
    if (low > high) {
        return -1;               // search space is empty -- target not found
    }
    const mid = low + Math.floor((high - low) / 2);
    if (arr[mid] === target) {
        return mid;
    } else if (arr[mid] < target) {
        return binarySearchRecursive(arr, target, mid + 1, high);
    } else {
        return binarySearchRecursive(arr, target, low, mid - 1);
    }
}
```

**Speed**: O(log n) time. Space: O(1) for iterative, O(log n) for recursive (because of the call stack building up).

**Watching it work** — searching for `23` in `[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]` (indexes 0–9):
```
low=0, high=9: mid=4, arr[4]=16, 16 < 23 -> search right half, low=5
low=5, high=9: mid=7, arr[7]=56, 56 > 23 -> search left half, high=6
low=5, high=6: mid=5, arr[5]=23  -> FOUND at index 5!
```
Only **3 checks** for a 10-element list. For a 1,000,000-element list, binary search takes at most about 20 checks (log₂ 1,000,000 ≈ 20) — this is the real power of O(log n).

## Rules to remember
- **The array must be sorted first.** Binary search on an unsorted array gives wrong answers, silently — it does not crash, it just returns incorrect results.
- **Use `low + (high - low) // 2`, not `(low + high) // 2`.** In languages with fixed-size integers (like C++'s `int`), `low + high` can overflow if both are very large numbers, giving a wrong (and even negative) middle index. Python's integers never overflow, so this specific bug cannot happen in Python — but writing it the safe way is still good practice, and it is a real, correctness-affecting bug in C++/Java.
- The loop condition is `low <= high`, not `low < high` — using the wrong one causes the search to miss the last remaining candidate.

## Interview Q&A

**Q1: Why is binary search O(log n) and not O(n)?**
Because each comparison eliminates half of the remaining search space, not just one element. Starting with `n` elements: after 1 check, `n/2` remain; after 2 checks, `n/4` remain; after `k` checks, `n/2^k` remain. The search ends when only 1 element is left, so `n/2^k = 1`, which means `k = log₂(n)`. That is exactly what "logarithmic time" means.

**Q2: What happens if you run binary search on an unsorted array?**
It can return a wrong answer, or fail to find a value that is actually present — silently, with no error or crash. The algorithm's correctness *depends entirely* on the sorted-order assumption; it has no way to detect that the assumption is broken.

**Q3: Why write `low + (high - low) // 2` instead of `(low + high) // 2`?**
To avoid integer overflow in languages with fixed-size integers: if `low` and `high` are both close to the maximum value an `int` can hold, `low + high` can overflow into an invalid (even negative) number before the division happens. `low + (high - low) // 2` never adds two large numbers together, so it cannot overflow the same way. This exact bug was found in real production binary search implementations (including, famously, in Java's standard library) years after they were considered "correct."

**Q4: Can you do binary search on a linked list?**
Not efficiently — binary search needs instant (O(1)) access to the middle element, which arrays give you via index arithmetic. A linked list has no such shortcut; reaching the "middle" requires walking node by node, which is O(n) — so doing binary search on a linked list costs O(n log n) overall (O(n) to find each middle, done O(log n) times), which is worse than just doing a linear scan.

**Q5: What is "Binary Search on the Answer," and how is it different from normal binary search?**
Normal binary search finds a value's *position* inside a sorted array. "Binary search on the answer" is a different, more advanced use: instead of searching an array, you search over a *range of possible answers* to a problem (for example, "what is the minimum possible maximum load?"), using a yes/no check ("is this answer feasible?") that is monotonic — true up to some point, then false (or vice versa) — to binary search for the boundary. This pattern is used in the Book Allocation, Painter's Partition, and Aggressive Cows problems later in this module.
