# Quick Sort — Divide and Conquer (In-Place)

Simple words, step by step.

## The big idea
Pick one element as the **pivot**. Rearrange the array so everything smaller than the pivot ends up on its left, and everything bigger ends up on its right (this step is called **partitioning**). The pivot is now in its final, correct sorted position. Recursively do the same thing to the left part and the right part.

## The partition step (the heart of Quick Sort)
```python
def partition(arr, low, high):
    pivot = arr[high]           # choosing the LAST element as the pivot (a common, simple choice)
    i = low - 1                  # boundary of "smaller than pivot" region
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]   # swap into the "smaller" region
    arr[i + 1], arr[high] = arr[high], arr[i + 1]   # place the pivot in its final spot
    return i + 1                  # the pivot's final index
```
```javascript
function partition(arr, low, high) {
    const pivot = arr[high];       // choosing the LAST element as the pivot
    let i = low - 1;                // boundary of "smaller than pivot" region
    for (let j = low; j < high; j++) {
        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];   // swap into the "smaller" region
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];   // place the pivot in its final spot
    return i + 1;                    // the pivot's final index
}
```

## Putting it together
```python
def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pivot_index = partition(arr, low, high)
        quick_sort(arr, low, pivot_index - 1)     # sort everything left of the pivot
        quick_sort(arr, pivot_index + 1, high)     # sort everything right of the pivot
    return arr
```
```javascript
function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        const pivotIndex = partition(arr, low, high);
        quickSort(arr, low, pivotIndex - 1);        // sort everything left of the pivot
        quickSort(arr, pivotIndex + 1, high);         // sort everything right of the pivot
    }
    return arr;
}
```
**Speed**: **average case O(n log n)**, but **worst case O(n²)**. Space: O(log n) on average for the recursion stack (O(n) in the worst case) — but the sorting itself happens **in-place**, unlike Merge Sort's O(n) extra array.

**Watching partition work** on `[8, 3, 5, 1, 9, 2]` with pivot = `2` (the last element):
```
i starts at -1
j=0: arr[0]=8, 8<=2? No -- skip
j=1: arr[1]=3, 3<=2? No -- skip
j=2: arr[2]=5, 5<=2? No -- skip
j=3: arr[3]=1, 1<=2? Yes -- i becomes 0, swap arr[0] and arr[3] -> [1, 3, 5, 8, 9, 2]
j=4: arr[4]=9, 9<=2? No -- skip
loop ends. Place pivot: swap arr[1] and arr[5] -> [1, 2, 5, 8, 9, 3]
pivot (2) is now at index 1, correctly placed with everything smaller (1) to its left
and everything bigger (5,8,9,3 -- unsorted among themselves, but all > 2) to its right
```

## Why the worst case is O(n²), and how to avoid it
If the pivot is always the smallest or largest remaining element (which happens with this "always pick the last element" strategy on an **already-sorted** array), partitioning splits the array into one empty side and one side with everything else — barely reducing the problem size at all. This produces `n` levels of recursion, each doing O(n) work, giving O(n²) total.

**The fix**: pick the pivot **randomly** (or use "median-of-three" — comparing the first, middle, and last elements) instead of always picking a fixed position. A random pivot makes the worst-case pattern (like an already-sorted array) extremely unlikely to actually trigger it, making O(n log n) the practical, expected behavior almost always.

## Rules to remember
- Quick Sort is **not stable** by default — the swapping during partitioning can reorder equal elements relative to each other.
- Quick Sort is generally **faster in practice** than Merge Sort despite the worse worst-case, because it sorts in-place (better cache behavior, less memory allocation overhead) — this is a real, measurable, practical difference, not just theory.
- **Always randomize the pivot choice** (or use median-of-three) in real code — never trust "always pick the first/last element" on inputs that might be sorted or nearly sorted, which is a very common real-world case (partially-sorted logs, re-sorting after a small update, etc.).

## Interview Q&A

**Q1: Why does Quick Sort have a worst case of O(n²), and what specific input triggers it with a naive pivot choice?**
If the pivot chosen is always the smallest or largest element remaining (e.g., always picking the last element on an already-sorted, or reverse-sorted, array), the partition step produces a wildly unbalanced split — one side gets everything, the other side gets nothing. This means the recursion only shrinks the problem by 1 element per level instead of roughly halving it, leading to `n` levels of recursion each doing O(n) work, for O(n²) total.

**Q2: How does randomizing the pivot choice fix this, and does it change the worst-case complexity?**
Randomizing the pivot doesn't change the theoretical worst case — it's still mathematically possible to get an unlucky sequence of pivot choices that triggers O(n²). What it changes is the *probability*: with a random pivot, the specific input patterns that used to reliably trigger worst-case behavior (like sorted arrays) no longer do, because the pivot isn't tied to a fixed position anymore. In practice, this makes the O(n²) case so unlikely that O(n log n) is the behavior you can expect almost always.

**Q3: Why is Quick Sort generally faster in practice than Merge Sort, even though Merge Sort has a better worst-case guarantee?**
Quick Sort sorts in-place, meaning it works within the original array's memory with good cache locality (nearby memory accesses are fast on real hardware) and no extra array allocation. Merge Sort must allocate new arrays during every merge step, which costs both memory and time for allocation. These constant-factor differences, invisible in Big-O notation, make Quick Sort meaningfully faster on typical, real-world (non-adversarial) data.

**Q4: Is Quick Sort stable? Why does that matter, and how would you fix it if stability were required?**
No — the swapping done during partitioning can change the relative order of equal elements. This matters if you're sorting objects by one field (say, sorting employees by department) while wanting to preserve their existing order for employees in the same department. If stability is required, either use Merge Sort instead, or adapt Quick Sort by making the comparison also consider the original index as a tiebreaker (effectively sorting by `(value, original_index)` pairs) — though this adds complexity that usually makes switching to Merge Sort the simpler choice.
