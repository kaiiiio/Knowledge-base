# Search in Rotated Sorted Array

Simple words, step by step.

## The question
A sorted array has been **rotated** at some unknown point. For example, `[0,1,2,4,5,6,7]` rotated becomes something like `[4,5,6,7,0,1,2]`. Find the position of a target value. Do it in O(log n) time — a plain linear scan is not allowed as the "optimal" answer here.

## Brute Force
```python
def search_brute(nums, target):
    for i, val in enumerate(nums):
        if val == target:
            return i
    return -1
```
```javascript
function searchBrute(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        if (nums[i] === target) {
            return i;
        }
    }
    return -1;
}
```
**Speed**: O(n) — correct, but does not use the fact that the array is "mostly sorted," which is the whole point of this question.

## Optimal — Modified Binary Search
Even after rotation, **one half of the array (split at the middle) is always properly sorted.** The trick: figure out which half is sorted, then check if the target could be inside that sorted half. If yes, search there; if no, the target must be in the other half.
```python
def search_optimal(nums, target):
    low, high = 0, len(nums) - 1
    while low <= high:
        mid = low + (high - low) // 2
        if nums[mid] == target:
            return mid

        if nums[low] <= nums[mid]:              # left half [low..mid] is sorted
            if nums[low] <= target < nums[mid]:
                high = mid - 1                    # target is inside the sorted left half
            else:
                low = mid + 1                     # target must be in the other half
        else:                                     # right half [mid..high] is sorted instead
            if nums[mid] < target <= nums[high]:
                low = mid + 1                     # target is inside the sorted right half
            else:
                high = mid - 1                    # target must be in the other half
    return -1
```
```javascript
function searchOptimal(nums, target) {
    let low = 0, high = nums.length - 1;
    while (low <= high) {
        const mid = low + Math.floor((high - low) / 2);
        if (nums[mid] === target) {
            return mid;
        }

        if (nums[low] <= nums[mid]) {                     // left half [low..mid] is sorted
            if (nums[low] <= target && target < nums[mid]) {
                high = mid - 1;                              // target is inside the sorted left half
            } else {
                low = mid + 1;                               // target must be in the other half
            }
        } else {                                            // right half [mid..high] is sorted instead
            if (nums[mid] < target && target <= nums[high]) {
                low = mid + 1;                               // target is inside the sorted right half
            } else {
                high = mid - 1;                              // target must be in the other half
            }
        }
    }
    return -1;
}
```
**Speed**: O(log n) — still cutting the search space in half every step, just with an extra check to figure out which half is sorted.

**Watching it work** on `[4,5,6,7,0,1,2]`, target `0`:
```
low=0, high=6: mid=3, nums[3]=7 (not target)
  nums[0]=4 <= nums[3]=7 -> LEFT half is sorted
  is 4 <= 0 < 7? No -> target is NOT in the sorted left half -> search right: low=4

low=4, high=6: mid=5, nums[5]=1 (not target)
  nums[4]=0 <= nums[5]=1 -> LEFT half [4..5] is sorted
  is 0 <= 0 < 1? Yes -> target IS in this sorted left half -> search there: high=4

low=4, high=4: mid=4, nums[4]=0 -> FOUND at index 4!
```

## Rules to remember
- The key insight is: **at every step, at least one of the two halves (split at mid) is guaranteed to be properly sorted**, even though the whole array is not. Once you know which half is sorted, a normal range check (`low <= target < mid`) tells you if the target could be there.
- This problem assumes **no duplicate values**. If duplicates are allowed, the "which half is sorted" check can become ambiguous (e.g. `[1,1,1,0,1,1,1]`), and the algorithm needs a fallback (shrinking both `low` and `high` by one when they're equal to `mid`), which degrades the worst case to O(n).

## Interview Q&A

**Q1: Why can't you just find the rotation point first, and then do two normal binary searches?**
You can — that is a valid alternative solution, and it also runs in O(log n). But it requires two full binary search passes (one to find the pivot, one on the correct sub-array) instead of one combined pass. The single-pass approach shown above is preferred because it does the same job in one walk instead of two, though both are asymptotically O(log n).

**Q2: What breaks if the array has duplicate values, and why?**
When `nums[low] == nums[mid] == nums[high]`, you cannot tell which half is sorted just by comparing those three values (both halves could look "flat" and ambiguous). The fix is to shrink the search range by one from both ends when this ambiguous case happens (`low += 1; high -= 1`), and try again — but this fallback can, in the worst case (an array of all identical values with one different value hidden somewhere), degrade the search back to O(n).

**Q3: How would you find the minimum element in a rotated sorted array, using the same idea?**
Use the same "which half is sorted" logic, but instead of comparing to a target, always move toward the **unsorted** half, since the minimum (the rotation point) must be there. If `nums[mid] > nums[high]`, the minimum is in the right half (search `mid+1` to `high`); otherwise it's in the left half including `mid` (search `low` to `mid`). This is a very common follow-up question to this exact problem.
