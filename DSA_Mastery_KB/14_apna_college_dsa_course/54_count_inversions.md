# Count Inversions — Brute and Optimal (Merge Sort Reused)

Simple words, step by step.

## The question
An **inversion** is a pair `(i, j)` where `i < j` but `arr[i] > arr[j]` — a pair that is "out of order." Count how many such pairs exist in the array. A fully sorted array has 0 inversions; a fully reverse-sorted array has the maximum possible number.

Example: `[2, 4, 1, 3, 5]` has 3 inversions: `(2,1)`, `(4,1)`, `(4,3)`.

## Brute Force
Check every pair.
```python
def count_inversions_brute(arr):
    n = len(arr)
    count = 0
    for i in range(n):
        for j in range(i + 1, n):
            if arr[i] > arr[j]:
                count += 1
    return count
```
```javascript
function countInversionsBrute(arr) {
    const n = arr.length;
    let count = 0;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (arr[i] > arr[j]) {
                count++;
            }
        }
    }
    return count;
}
```
**Speed**: O(n²) — checking every pair.

## Optimal — Reusing Merge Sort's Merge Step
This is a great example of **recognizing that a sorting algorithm's internal mechanics can answer a different question, almost for free.** During Merge Sort's `merge` step, every time an element from the **right** half is taken *before* an element from the **left** half, that single move actually resolves several inversions at once: it means that this right-half element is smaller than **every remaining element in the left half** — because the left half is already sorted internally.
```python
def count_inversions_optimal(arr):
    def merge_and_count(left, right):
        merged = []
        i = j = inv_count = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                j += 1
                inv_count += len(left) - i    # EVERY remaining element in `left` forms an inversion with right[j]
        merged.extend(left[i:])
        merged.extend(right[j:])
        return merged, inv_count

    def sort_and_count(arr):
        if len(arr) <= 1:
            return arr, 0
        mid = len(arr) // 2
        left, left_inv = sort_and_count(arr[:mid])
        right, right_inv = sort_and_count(arr[mid:])
        merged, split_inv = merge_and_count(left, right)
        return merged, left_inv + right_inv + split_inv

    _, total_inversions = sort_and_count(arr)
    return total_inversions
```
```javascript
function countInversionsOptimal(arr) {
    function mergeAndCount(left, right) {
        const merged = [];
        let i = 0, j = 0, invCount = 0;
        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) {
                merged.push(left[i]);
                i++;
            } else {
                merged.push(right[j]);
                j++;
                invCount += left.length - i;   // EVERY remaining element in `left` forms an inversion
            }
        }
        return [merged.concat(left.slice(i)).concat(right.slice(j)), invCount];
    }

    function sortAndCount(arr) {
        if (arr.length <= 1) {
            return [arr, 0];
        }
        const mid = Math.floor(arr.length / 2);
        const [left, leftInv] = sortAndCount(arr.slice(0, mid));
        const [right, rightInv] = sortAndCount(arr.slice(mid));
        const [merged, splitInv] = mergeAndCount(left, right);
        return [merged, leftInv + rightInv + splitInv];
    }

    const [, totalInversions] = sortAndCount(arr);
    return totalInversions;
}
```
**Speed**: O(n log n) — the exact same complexity as Merge Sort itself, since we're just piggybacking one extra counter onto the existing merge step, not adding any new passes over the data.

**Watching the key insight work**, merging `left=[1,3,5]` and `right=[2,4]`:
```
compare 1 vs 2 -> take 1 (left)  -- no inversion
compare 3 vs 2 -> take 2 (right) -- 2 is smaller than 3 AND everything after 3 in left (5)
                                     -- that's 2 inversions added: (3,2) and (5,2)... wait, only remaining left counts
                                     -- remaining left = [3, 5], so len(left)-i = 2 -- add 2 inversions
compare 3 vs 4 -> take 3 (left)  -- no inversion
compare 5 vs 4 -> take 4 (right) -- remaining left = [5], so add 1 inversion
left exhausted -> append remaining right: none left
Total from this merge: 2 + 1 = 3 inversions found in this single merge step
```

## Rules to remember
- The key trick: `inv_count += len(left) - i` works specifically because **`left` is already sorted** at this point in the recursion — so if `right[j]` is smaller than `left[i]`, it is *also* smaller than every element after `left[i]` in the (sorted) left half, without needing to check them individually.
- This problem is the clearest example in this whole course of a general lesson: **sometimes the fastest way to solve a new problem is to notice it's secretly hiding inside an algorithm you already know**, rather than inventing something from scratch.

## Interview Q&A

**Q1: Why does taking an element from the right half during merge tell you about MULTIPLE inversions at once, not just one?**
Because the left half is already sorted (a guarantee Merge Sort's recursion provides). If `right[j]` is smaller than the current `left[i]`, sortedness guarantees it's also smaller than every element still remaining in `left` after position `i` — so instead of comparing `right[j]` against each of those remaining left elements individually, you can count all of them as inversions in one O(1) step (`len(left) - i`).

**Q2: What is the overall time complexity, and why doesn't counting inversions cost anything extra beyond the sort itself?**
O(n log n) — identical to plain Merge Sort. The inversion count is accumulated as a byproduct of work the merge step is already doing (comparing elements and deciding which to place next) — no additional passes over the data are introduced, just one extra counter variable being incremented during comparisons that were happening anyway.

**Q3: Could you solve this problem using Quick Sort's partitioning instead of Merge Sort's merging?**
Not as cleanly. Merge Sort's merge step naturally compares two *already internally sorted* halves against each other, which is exactly the structure that makes "count how many stay out of order" efficient to compute in bulk. Quick Sort's partition step is organized around a single pivot rather than merging two sorted sequences, so it doesn't offer the same natural "if this one is out of place, so are all these others" shortcut — this is a genuine reason Merge Sort, not Quick Sort, is the standard tool reached for on inversion-counting problems.
