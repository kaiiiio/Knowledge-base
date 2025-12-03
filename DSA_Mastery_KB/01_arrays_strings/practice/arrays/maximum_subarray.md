# ⚔️ LeetCode 53: Maximum Subarray

**Difficulty**: Medium
**Pattern**: Kadane's Algorithm / Dynamic Programming

## 1. Problem Detail

Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

**Example 1:**
```
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.
```

**Example 2:**
```
Input: nums = [1]
Output: 1
```

**Example 3:**
```
Input: nums = [5,4,-1,7,8]
Output: 23
```

**Constraints:**
*   `1 <= nums.length <= 10^5`
*   `-10^4 <= nums[i] <= 10^4`

---

## 2. Approach: Kadane's Algorithm

We traverse the array while maintaining a running sum `current_sum`.
At each step, we have a choice:
1.  Add the current number to the existing `current_sum`.
2.  Start a new subarray with the current number (effectively discarding the previous `current_sum`).

We make this choice based on whether `current_sum` (before adding the number) is negative. If `current_sum` is negative, adding it to the current number will only decrease the total, so we should start fresh.
Alternatively, the logic is: `current_sum = max(num, current_sum + num)`.

We also maintain a `max_sum` to track the global maximum found so far.

*   **Time Complexity**: O(N)
*   **Space Complexity**: O(1)

---

## 3. Visualization

`nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]`

| Index | Num | Current Sum (Before) | Action | New Current Sum | Global Max |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | -2 | 0 | Start Fresh | -2 | -2 |
| 1 | 1 | -2 | Start Fresh (since -2 < 0) | 1 | 1 |
| 2 | -3 | 1 | Add | -2 | 1 |
| 3 | 4 | -2 | Start Fresh (since -2 < 0) | 4 | 4 |
| 4 | -1 | 4 | Add | 3 | 4 |
| 5 | 2 | 3 | Add | 5 | 5 |
| 6 | 1 | 5 | Add | **6** | **6** |
| 7 | -5 | 6 | Add | 1 | 6 |
| 8 | 4 | 1 | Add | 5 | 6 |

**Result**: 6

---

## 4. Solution

```python
def maxSubArray(nums: list[int]) -> int:
    max_sum = nums[0]
    cur_sum = 0
    
    for n in nums:
        if cur_sum < 0:
            cur_sum = 0
        cur_sum += n
        max_sum = max(max_sum, cur_sum)
        
    return max_sum
```

---

## 5. Variations

### Variation 1: Return the Subarray
If we needed to return the actual subarray (start and end indices), we would track `start` and `end` indices.
*   When `cur_sum` is reset to 0, potential `start` index moves to current `i`.
*   When `max_sum` is updated, we update the global `start` and `end`.

### Variation 2: Divide and Conquer
There is an O(N log N) approach using Divide and Conquer, similar to Merge Sort.
1.  Split array into left and right halves.
2.  Recursively find max subarray in left and right.
3.  Find max subarray crossing the midpoint.
4.  Return max of (LeftMax, RightMax, CrossMax).
This is less efficient than Kadane's but good for understanding D&C.
