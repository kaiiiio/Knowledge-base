# Single Element in a Sorted Array

Simple words, step by step.

## The question
Every number in a sorted array appears **exactly twice**, except one number, which appears exactly **once**. Find that single number. Do it in O(log n) time.

Example: `[1,1,2,2,3,3,4,8,8]` → the single number is `4`.

## Brute Force
```python
def single_element_brute(nums):
    for i in range(0, len(nums) - 1, 2):
        if nums[i] != nums[i + 1]:
            return nums[i]
    return nums[-1]   # if no mismatch found, the last element must be the single one
```
```javascript
function singleElementBrute(nums) {
    for (let i = 0; i < nums.length - 1; i += 2) {
        if (nums[i] !== nums[i + 1]) {
            return nums[i];
        }
    }
    return nums[nums.length - 1];   // if no mismatch found, the last element is the single one
}
```
**Speed**: O(n) — checks pairs one at a time.

## Optimal — Binary Search on Pair-Index Parity
Before the single number, every pair lines up at **(even index, odd index)** — `nums[0]==nums[1]`, `nums[2]==nums[3]`, and so on. After the single number sneaks in, this pattern shifts, and every pair instead lines up at **(odd index, even index)**. Binary search for exactly where that shift happens.
```python
def single_element_optimal(nums):
    low, high = 0, len(nums) - 2   # stop one early -- we always compare mid to mid+1
    while low < high:
        mid = low + (high - low) // 2
        if mid % 2 == 1:
            mid -= 1               # always land on an EVEN index for a clean comparison

        if nums[mid] == nums[mid + 1]:
            low = mid + 2           # this pair is intact -- single element is further right
        else:
            high = mid               # this pair is broken -- single element is here or to the left
    return nums[low]
```
```javascript
function singleElementOptimal(nums) {
    let low = 0, high = nums.length - 2;   // stop one early -- we always compare mid to mid+1
    while (low < high) {
        let mid = low + Math.floor((high - low) / 2);
        if (mid % 2 === 1) {
            mid -= 1;                        // always land on an EVEN index for a clean comparison
        }

        if (nums[mid] === nums[mid + 1]) {
            low = mid + 2;                    // this pair is intact -- single element is further right
        } else {
            high = mid;                        // this pair is broken -- single element is here or to the left
        }
    }
    return nums[low];
}
```
**Speed**: O(log n).

**Watching it work** on `[1,1,2,2,3,3,4,8,8]` (indexes 0–8):
```
low=0, high=7: mid=3 (odd) -> use mid=2. nums[2]=2, nums[3]=2 -- MATCH -> pair intact, low=4
low=4, high=7: mid=5 (odd) -> use mid=4. nums[4]=3, nums[5]=3 -- MATCH -> pair intact, low=6
low=6, high=7: mid=6 (even). nums[6]=4, nums[7]=8 -- NO MATCH -> broken pair, high=6
low=6, high=6: loop ends -> answer: nums[6] = 4  (correct!)
```

## Rules to remember
- The "always round `mid` down to even" step is the entire trick of this problem — without it, the intact-pair-vs-broken-pair logic doesn't line up correctly, because a pair always starts at an even index before the disruption point.
- This only works because the array is **sorted** — the pairs being adjacent to each other depends entirely on that.

## Interview Q&A

**Q1: Why must `mid` always be rounded down to an even index?**
Because "a pair" in this problem is always defined as (even index, the index right after it). If `mid` happens to land on an odd index, checking `nums[mid]` vs `nums[mid+1]` would be comparing the *second* half of one pair to the *first* half of the next pair — a meaningless comparison that breaks the whole "intact vs broken pair" logic the algorithm depends on.

**Q2: What is the connection between this problem and a plain XOR-based solution?**
There's a well-known O(n) trick: XOR every number in the array together, and the result is the single unpaired number (because `x XOR x = 0`, so every pair cancels out, leaving only the unpaired value). That trick is faster to write but only works in O(n) time — it does not use the sorted property at all. This binary-search version specifically exists to show how sortedness can be exploited to get O(log n) instead, which is the actual point of the exercise.

**Q3: What would you need to change if there could be more than one single (unpaired) element?**
This exact algorithm assumes there is **exactly one** unpaired element, which is what keeps the parity-shift boundary clean and unambiguous. With multiple unpaired elements, there could be multiple "breaks" in the pairing pattern, and a single binary search pass could no longer reliably distinguish which broken pair is "the" boundary — the problem would need a fundamentally different approach (likely not solvable in O(log n) in general).
