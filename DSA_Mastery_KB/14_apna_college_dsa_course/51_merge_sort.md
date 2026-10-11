# Merge Sort — Divide and Conquer

Simple words, step by step.

## The big idea: Divide and Conquer
Instead of sorting the whole array at once, **split it in half, sort each half separately (recursively), then merge the two sorted halves back together.** This is a different shape of recursion than the backtracking files before it — there's no "choose/unchoose," just "split, solve smaller pieces, combine."

## Step 1: Divide
Keep splitting the array in half until each piece has just one element (a single element is always already "sorted").
```
[8, 3, 5, 1, 9, 2]
  split -> [8, 3, 5]  and  [1, 9, 2]
  split -> [8] [3, 5]  and  [1, 9] [2]
  split -> [8] [3] [5]  and  [1] [9] [2]
  -- now every piece has 1 element, all "sorted" by definition
```

## Step 2: Conquer (Merge)
Combine two already-sorted lists into one sorted list, by repeatedly comparing their front elements and taking the smaller one.
```python
def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])     # append whatever is left over in `left`
    result.extend(right[j:])    # append whatever is left over in `right`
    return result
```
```javascript
function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }
    return result.concat(left.slice(i)).concat(right.slice(j));   // append whatever is left over
}
```

## Putting it together
```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr                        # base case -- already sorted
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])           # recursively sort the left half
    right = merge_sort(arr[mid:])          # recursively sort the right half
    return merge(left, right)               # combine the two sorted halves
```
```javascript
function mergeSort(arr) {
    if (arr.length <= 1) {
        return arr;                          // base case -- already sorted
    }
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));    // recursively sort the left half
    const right = mergeSort(arr.slice(mid));       // recursively sort the right half
    return merge(left, right);                      // combine the two sorted halves
}
```
**Speed**: O(n log n) time, always — best, average, and worst case are all the same, which is a genuinely valuable guarantee. Space: O(n), because merging needs a new array to build the combined result (this is not an in-place sort).

**Watching it merge** — combining `[3, 8]` and `[1, 5, 9]`:
```
compare 3 vs 1 -> take 1  -> result: [1]
compare 3 vs 5 -> take 3  -> result: [1, 3]
compare 8 vs 5 -> take 5  -> result: [1, 3, 5]
compare 8 vs 9 -> take 8  -> result: [1, 3, 5, 8]
left is empty -> append remaining right: [9]
final: [1, 3, 5, 8, 9]
```

## Rules to remember
- Merge sort's O(n log n) is guaranteed in **every** case — unlike Quick Sort (next file), which has a worst case that degrades to O(n²) on certain inputs.
- Merge sort is **stable** — two equal elements keep their original relative order after sorting (because the merge step takes from `left` when equal, never disturbing the original left-before-right ordering). This matters when sorting objects by one field while wanting to preserve their existing order on ties.
- The O(n) extra space is a real cost — for huge datasets where memory is tight, an in-place sort (like a well-implemented Quick Sort) may be preferred despite the worst-case risk.

## Interview Q&A

**Q1: Why is Merge Sort's time complexity O(n log n) — walk through the reasoning.**
The "divide" step splits the array in half repeatedly, which takes `log n` levels of splitting to reach single elements (same halving logic as binary search's O(log n)). At **each** of those `log n` levels, the total work across all the merge operations combined is O(n) (every element gets touched once per level during merging). Multiplying the O(n) work per level by the `log n` levels gives O(n log n) total.

**Q2: Why does Merge Sort need O(n) extra space, and can it be made truly in-place?**
The `merge` step needs a separate array to hold the combined, sorted result while it's still reading from both the `left` and `right` halves — merging directly back into the original array while still reading from it would overwrite data it hasn't read yet. Truly in-place merge sort variants exist, but they are significantly more complex and typically sacrifice the clean O(n log n) time complexity, trading time for space — in practice, the O(n) space version is almost always what's used.

**Q3: What does "stable sort" mean, and why does Merge Sort naturally have this property?**
A stable sort preserves the relative order of elements that are considered equal by the sort comparison. Merge Sort is stable because the `merge` step's tie-breaking rule (`if left[i] <= right[j]`) always prefers the left element on a tie — and since `left` always contains elements that came before `right` in the original array, equal elements never get reordered relative to each other.

**Q4: When would you choose Merge Sort over Quick Sort, and vice versa?**
Choose Merge Sort when a guaranteed O(n log n) worst case matters (predictable performance under adversarial or already-sorted input), when stability is required, or when sorting linked lists (merge sort adapts well to linked lists since it doesn't need random access the way in-place partitioning does). Choose Quick Sort when average-case speed and low memory overhead matter more than worst-case guarantees, since Quick Sort is typically faster in practice due to better cache locality and lower constant factors, despite its O(n²) worst case.
