# Peak Index in a Mountain Array

Simple words, step by step.

## The question
A "mountain array" increases, then decreases (like `[1,3,5,7,4,2]`). Find the index of the peak — the highest point.

## Brute Force
```python
def peak_index_brute(arr):
    for i in range(1, len(arr) - 1):
        if arr[i] > arr[i - 1] and arr[i] > arr[i + 1]:
            return i
    return -1
```
```javascript
function peakIndexBrute(arr) {
    for (let i = 1; i < arr.length - 1; i++) {
        if (arr[i] > arr[i - 1] && arr[i] > arr[i + 1]) {
            return i;
        }
    }
    return -1;
}
```
**Speed**: O(n) — checks every position one by one.

## Optimal — Binary Search on the Slope
At any middle position, check the slope: if you're still going **uphill** (`arr[mid] < arr[mid+1]`), the peak must be further to the right. If you're going **downhill** (`arr[mid] > arr[mid+1]`), the peak is at `mid` or somewhere to the left.
```python
def peak_index_optimal(arr):
    low, high = 0, len(arr) - 1
    while low < high:
        mid = low + (high - low) // 2
        if arr[mid] < arr[mid + 1]:
            low = mid + 1        # still climbing -- peak is to the right
        else:
            high = mid            # descending (or at the peak) -- peak is here or to the left
    return low
```
```javascript
function peakIndexOptimal(arr) {
    let low = 0, high = arr.length - 1;
    while (low < high) {
        const mid = low + Math.floor((high - low) / 2);
        if (arr[mid] < arr[mid + 1]) {
            low = mid + 1;         // still climbing -- peak is to the right
        } else {
            high = mid;             // descending (or at the peak) -- peak is here or to the left
        }
    }
    return low;
}
```
**Speed**: O(log n) — one comparison eliminates half of the remaining array.

**Watching it work** on `[1, 3, 5, 7, 4, 2]`:
```
low=0, high=5: mid=2, arr[2]=5 < arr[3]=7 -> still climbing, low=3
low=3, high=5: mid=4, arr[4]=4 > arr[5]=2 -> descending, high=4
low=3, high=4: mid=3, arr[3]=7 > arr[4]=4 -> descending, high=3
low=3, high=3: loop ends -> answer: index 3 (value 7, the peak!)
```

## Rules to remember
- This is **not** searching for a specific target value — it is searching for a *shape* (where does uphill turn into downhill). This is why the comparison is against the *neighbor* (`arr[mid+1]`), not against a target.
- The loop uses `low < high` (not `low <= high`) and `high = mid` (not `mid - 1`), because `mid` itself could still be the answer — narrowing `high` past `mid` could accidentally throw away the correct answer.

## Interview Q&A

**Q1: Why does comparing `arr[mid]` to `arr[mid+1]` work for finding the peak, but comparing to a fixed target wouldn't?**
Because this problem isn't "find a value," it's "find where the trend changes direction." The slope between `mid` and `mid+1` tells you unambiguously which side the peak is on: if it's still rising, the peak can't be at or before `mid` (there's a bigger value ahead); if it's falling, the peak is at `mid` or earlier. A fixed-target binary search instead compares against an unchanging value, which is a different question entirely.

**Q2: What would break if the array is not guaranteed to be a mountain shape (e.g., it's flat, or has multiple peaks)?**
If the array has flat sections (`arr[mid] == arr[mid+1]`), the direction is ambiguous and the algorithm as written may not behave correctly, since the `else` branch would treat equal values as "descending." Multiple peaks also break the guarantee that this binary search approach relies on: the whole technique assumes there's exactly one direction change, so it can only reliably find "a" peak in a general array, not necessarily "the" peak the question intends.

**Q3: How is this related to finding the minimum in a rotated sorted array (from the previous file)?**
Both problems use the same core idea: binary search doesn't have to search for a value — it can search for a *boundary* between two regions with different properties (sorted vs unsorted, ascending vs descending), as long as you can determine, from one comparison at the midpoint, which side of the boundary you're currently on.
