# ⚔️ LeetCode 15: 3Sum

**Difficulty**: Medium
**Pattern**: Two Pointers (Sorting required)

## 1. Problem Detail

Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.

Notice that the solution set must not contain duplicate triplets.

**Example 1:**
```
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]
Explanation: 
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.
nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.
The distinct triplets are [-1,0,1] and [-1,-1,2].
```

**Example 2:**
```
Input: nums = [0,1,1]
Output: []
Explanation: The only possible triplet does not sum to 0.
```

**Constraints:**
*   `3 <= nums.length <= 3000`
*   `-10^5 <= nums[i] <= 10^5`

---

## 2. Approach: Sorting + Two Pointers

The problem asks for `a + b + c = 0`. This is equivalent to `a + b = -c`.
If we fix one number `c` (let's say `nums[i]`), we are reduced to finding two other numbers that sum to `-nums[i]`. This is exactly the **Two Sum II** problem (since we can sort the array).

Steps:
1.  **Sort** the array. This allows us to use the Two Pointers technique and easily skip duplicates.
2.  Iterate through the array with index `i` (this is our first number).
3.  If `nums[i] > 0`, break (since the array is sorted, we can't find two positive numbers that sum to a negative number to make 0).
4.  If `i > 0` and `nums[i] == nums[i-1]`, skip to avoid duplicate triplets.
5.  Set `left = i + 1` and `right = n - 1`.
6.  While `left < right`:
    *   Calculate `sum = nums[i] + nums[left] + nums[right]`.
    *   If `sum < 0`, increment `left`.
    *   If `sum > 0`, decrement `right`.
    *   If `sum == 0`, add triplet to result. Then **skip duplicates** for `left` and `right` to ensure unique triplets.

*   **Time Complexity**: O(N^2) - Sorting takes O(N log N). The nested loop takes O(N^2).
*   **Space Complexity**: O(1) or O(N) depending on sorting implementation (ignoring output space).

---

## 3. Visualization

`nums = [-1, 0, 1, 2, -1, -4]`
Sorted: `[-4, -1, -1, 0, 1, 2]`

```mermaid
graph TD
    subgraph Iteration 1 (i=0, val=-4)
    A1[Target: 4] --> B1[Search in [-1, -1, 0, 1, 2]]
    B1 --> C1[No pair sums to 4]
    end
    
    subgraph Iteration 2 (i=1, val=-1)
    A2[Target: 1] --> B2[Search in [-1, 0, 1, 2]]
    B2 --> C2{Check Pairs}
    C2 -- L=-1, R=2 --> D2[Sum=1. Found! [-1, -1, 2]]
    C2 -- L=0, R=1 --> E2[Sum=1. Found! [-1, 0, 1]]
    end
```

**Pointer Movement (Iteration 2):**
`i = 1` (`nums[i] = -1`) -> Target Sum for L+R is `1`.
Range: `[-1, 0, 1, 2]` (Indices 2 to 5)

1.  `L` at -1 (idx 2), `R` at 2 (idx 5). Sum = 1. **Match!**
    *   Add `[-1, -1, 2]`.
    *   Move `L` forward (skip duplicates if any). Move `R` backward.
2.  `L` at 0 (idx 3), `R` at 1 (idx 4). Sum = 1. **Match!**
    *   Add `[-1, 0, 1]`.
    *   Move pointers. `L > R`, break.

---

## 4. Solution

```python
def threeSum(nums: list[int]) -> list[list[int]]:
    nums.sort()
    res = []
    n = len(nums)
    
    for i in range(n):
        # Optimization: If smallest number is positive, we can't sum to 0
        if nums[i] > 0:
            break
            
        # Skip duplicates for the first number
        if i > 0 and nums[i] == nums[i-1]:
            continue
            
        left, right = i + 1, n - 1
        while left < right:
            s = nums[i] + nums[left] + nums[right]
            
            if s < 0:
                left += 1
            elif s > 0:
                right -= 1
            else:
                res.append([nums[i], nums[left], nums[right]])
                # Skip duplicates for the second number
                while left < right and nums[left] == nums[left+1]:
                    left += 1
                # Skip duplicates for the third number
                while left < right and nums[right] == nums[right-1]:
                    right -= 1
                left += 1
                right -= 1
                
    return res
```

---

## 5. Variations

### Variation 1: 3Sum Closest (LeetCode 16)

#### Problem Detail
Given an integer array `nums` of length `n` and an integer `target`, find three integers in `nums` such that the sum is closest to `target`. Return the sum of the three integers.

#### Approach: Sorting + Two Pointers
Almost identical to 3Sum. Instead of looking for `sum == 0`, we look for `sum` closest to `target`.
We maintain a `closest_sum` variable. In each step, if `abs(target - current_sum) < abs(target - closest_sum)`, we update `closest_sum`.

*   **Time**: O(N^2)
*   **Space**: O(1)

#### Visualization
`nums = [-1, 2, 1, -4]`, `target = 1`
Sorted: `[-4, -1, 1, 2]`

1.  `i = -4`. L=-1, R=2. Sum = -3. Dist = 4. Closest = -3. Sum < Target, L++.
2.  `i = -4`. L=1, R=2. Sum = -1. Dist = 2. Closest = -1. Sum < Target, L++.
3.  `i = -1`. L=1, R=2. Sum = 2. Dist = 1. Closest = 2. Sum > Target, R--.

Result: 2.

#### Solution
```python
def threeSumClosest(nums: list[int], target: int) -> int:
    nums.sort()
    closest_sum = float('inf')
    
    for i in range(len(nums) - 2):
        left, right = i + 1, len(nums) - 1
        while left < right:
            s = nums[i] + nums[left] + nums[right]
            
            if abs(target - s) < abs(target - closest_sum):
                closest_sum = s
            
            if s == target:
                return target
            elif s < target:
                left += 1
            else:
                right -= 1
                
    return closest_sum
```

---

### Variation 2: 4Sum (LeetCode 18)

#### Problem Detail
Given an array `nums` of `n` integers, return an array of all the unique quadruplets `[nums[a], nums[b], nums[c], nums[d]]` such that `a, b, c, d` are distinct and sum to `target`.

#### Approach: Generalized kSum
We can wrap the 3Sum logic in another loop.
1.  Sort `nums`.
2.  Loop `i` from `0` to `n-3`.
3.  Loop `j` from `i+1` to `n-2`.
4.  Use Two Pointers for the remaining two numbers (`left`, `right`).

*   **Time**: O(N^3)
*   **Space**: O(1)

#### Visualization
Nested Loops:
`i` (First Num) -> `j` (Second Num) -> `L` (Third) ... `R` (Fourth)

#### Solution
```python
def fourSum(nums: list[int], target: int) -> list[list[int]]:
    nums.sort()
    res = []
    n = len(nums)
    
    for i in range(n - 3):
        if i > 0 and nums[i] == nums[i-1]: continue
        
        for j in range(i + 1, n - 2):
            if j > i + 1 and nums[j] == nums[j-1]: continue
            
            left, right = j + 1, n - 1
            while left < right:
                s = nums[i] + nums[j] + nums[left] + nums[right]
                
                if s == target:
                    res.append([nums[i], nums[j], nums[left], nums[right]])
                    while left < right and nums[left] == nums[left+1]: left += 1
                    while left < right and nums[right] == nums[right-1]: right -= 1
                    left += 1
                    right -= 1
                elif s < target:
                    left += 1
                else:
                    right -= 1
    return res
```
