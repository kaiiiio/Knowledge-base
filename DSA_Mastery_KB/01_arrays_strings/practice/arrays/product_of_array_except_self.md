# ⚔️ LeetCode 238: Product of Array Except Self

**Difficulty**: Medium
**Pattern**: Prefix and Suffix Products

## 1. Problem Detail

Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`.

The product of any prefix or suffix of `nums` is guaranteed to fit in a **32-bit** integer.

You must write an algorithm that runs in **O(n)** time and without using the division operation.

**Example 1:**
```
Input: nums = [1,2,3,4]
Output: [24,12,8,6]
```

**Example 2:**
```
Input: nums = [-1,1,0,-3,3]
Output: [0,0,9,0,0]
```

**Constraints:**
*   `2 <= nums.length <= 10^5`
*   `-30 <= nums[i] <= 30`

---

## 2. Approach: Prefix and Suffix Products

Since we cannot use division (which would make this easy: `total_product / nums[i]`), we need to construct the product from both sides.
For any index `i`, the product except `nums[i]` is:
`(Product of all nums to the left of i) * (Product of all nums to the right of i)`

1.  **Left Pass**: Create an array `res` where `res[i]` contains the product of numbers from `0` to `i-1`.
2.  **Right Pass**: Iterate backwards. Maintain a running `postfix` product. Multiply `res[i]` by this `postfix` to get the final result.

*   **Time Complexity**: O(N) - Two passes.
*   **Space Complexity**: O(1) - If we ignore the output array. We use the output array to store the prefix products first, then update it in place.

---

## 3. Visualization

`nums = [1, 2, 3, 4]`

**Pass 1: Prefix (Left to Right)**
Initialize `res = [1, 1, 1, 1]`, `prefix = 1`

| Index | Num | Prefix (Before mult) | res[i] Update | New Prefix |
| :--- | :--- | :--- | :--- | :--- |
| 0 | 1 | 1 | `res[0] = 1` | `1 * 1 = 1` |
| 1 | 2 | 1 | `res[1] = 1` | `1 * 2 = 2` |
| 2 | 3 | 2 | `res[2] = 2` | `2 * 3 = 6` |
| 3 | 4 | 6 | `res[3] = 6` | `6 * 4 = 24` |

Result after Pass 1: `[1, 1, 2, 6]` (This represents products to the left)

**Pass 2: Postfix (Right to Left)**
`postfix = 1`

| Index | Num | Current res[i] | Postfix | res[i] Update (res[i] * postfix) | New Postfix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 3 | 4 | 6 | 1 | `6 * 1 = 6` | `1 * 4 = 4` |
| 2 | 3 | 2 | 4 | `2 * 4 = 8` | `4 * 3 = 12` |
| 1 | 2 | 1 | 12 | `1 * 12 = 12` | `12 * 2 = 24` |
| 0 | 1 | 1 | 24 | `1 * 24 = 24` | `24 * 1 = 24` |

Final Result: `[24, 12, 8, 6]`

---

## 4. Solution

```python
def productExceptSelf(nums: list[int]) -> list[int]:
    n = len(nums)
    res = [1] * n
    
    # Pass 1: Calculate prefix products
    prefix = 1
    for i in range(n):
        res[i] = prefix
        prefix *= nums[i]
        
    # Pass 2: Calculate postfix products and multiply
    postfix = 1
    for i in range(n - 1, -1, -1):
        res[i] *= postfix
        postfix *= nums[i]
        
    return res
```

---

## 5. Variations

### Variation 1: Space Analysis
The problem asks for O(1) extra space complexity.
The solution above uses O(1) extra space because the output array `res` does not count towards extra space complexity.
If we were forced to use separate arrays for `prefix` and `suffix`, the space complexity would be O(N).

### Variation 2: Handling Zeros
If there is **one zero** in the array:
*   The product for the index with zero will be the product of all other numbers.
*   The product for all other indices will be 0.

If there are **two or more zeros**:
*   The product for ALL indices will be 0.

Our algorithm handles these cases naturally without special `if` conditions.
