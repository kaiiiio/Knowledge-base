# ⚔️ LeetCode 1: Two Sum

**Difficulty**: Easy
**Pattern**: Hash Map

## 1. Problem Detail

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have **exactly one solution**, and you may not use the *same* element twice.

You can return the answer in any order.

**Example 1:**
```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

**Example 2:**
```
Input: nums = [3,2,4], target = 6
Output: [1,2]
```

**Constraints:**
*   `2 <= nums.length <= 10^4`
*   `-10^9 <= nums[i] <= 10^9`
*   `-10^9 <= target <= 10^9`
*   Only one valid answer exists.

---

## 2. Approach: Hash Map (One Pass)

We need to find two numbers `a` and `b` such that `a + b = target`. This means for any number `a`, we are looking for `b = target - a`.

Instead of scanning the entire array for `b` (which gives O(N^2)), we can store each number we visit in a **Hash Map** (Dictionary) mapping `value -> index`.

As we iterate through the array:
1.  Calculate `complement = target - current_number`.
2.  Check if `complement` is already in the Hash Map.
3.  If yes, we found the pair! Return the current index and the index from the map.
4.  If no, add the `current_number` and its `index` to the map.

*   **Time Complexity**: O(N) - We traverse the list containing N elements only once. Each look up in the table costs only O(1) time.
*   **Space Complexity**: O(N) - The extra space required depends on the number of items stored in the hash table, which stores at most N elements.

---

## 3. Visualization

```mermaid
graph TD
    subgraph Iteration 1
    A1[Current: 2, Index: 0] --> B1{Check Map for (9-2)=7}
    B1 -- No --> C1[Add {2: 0} to Map]
    end
    
    subgraph Iteration 2
    A2[Current: 7, Index: 1] --> B2{Check Map for (9-7)=2}
    B2 -- Yes! --> C2[Found 2 at Index 0]
    C2 --> D2[Return [0, 1]]
    end
```

**Step-by-Step Execution:**
`nums = [2, 7, 11, 15]`, `target = 9`

| Index | Num | Complement (Target - Num) | Map Check (Is Complement in Map?) | Action | Map State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | 2 | 9 - 2 = 7 | No | Add `2: 0` | `{2: 0}` |
| 1 | 7 | 9 - 7 = 2 | **Yes** (Found at index 0) | **Return `[0, 1]`** | `{2: 0}` |

---

## 4. Solution

```python
def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}  # val -> index
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
        
    return []
```

---

## 5. Variations

### Variation 1: Two Sum II - Input Array Is Sorted (LeetCode 167)

#### Problem Detail
Given a **1-indexed** array of integers `numbers` that is already **sorted in non-decreasing order**, find two numbers such that they add up to a specific `target` number. Return the indices of the two numbers, index1 and index2, added by one as an integer array `[index1, index2]` of length 2.

#### Approach: Two Pointers
Since the array is sorted, we can use two pointers.
1.  Initialize `left` at the start (0) and `right` at the end (n-1).
2.  Calculate `current_sum = numbers[left] + numbers[right]`.
3.  If `current_sum == target`, return `[left + 1, right + 1]`.
4.  If `current_sum < target`, we need a larger sum. Move `left` pointer to the right.
5.  If `current_sum > target`, we need a smaller sum. Move `right` pointer to the left.

*   **Time**: O(N)
*   **Space**: O(1)

#### Visualization
`numbers = [2, 7, 11, 15]`, `target = 9`

```
Iteration 1:
[2, 7, 11, 15]
 L          R
Sum = 2 + 15 = 17
17 > 9 -> Decrement R

Iteration 2:
[2, 7, 11, 15]
 L      R
Sum = 2 + 11 = 13
13 > 9 -> Decrement R

Iteration 3:
[2, 7, 11, 15]
 L  R
Sum = 2 + 7 = 9
9 == 9 -> Found! Return [1, 2]
```

#### Solution
```python
def twoSum(numbers: list[int], target: int) -> list[int]:
    left, right = 0, len(numbers) - 1
    
    while left < right:
        s = numbers[left] + numbers[right]
        
        if s == target:
            return [left + 1, right + 1]
        elif s < target:
            left += 1
        else:
            right -= 1
            
    return []
```

---

### Variation 2: Two Sum III - Data Structure Design (LeetCode 170)

#### Problem Detail
Design a data structure that accepts a stream of integers and checks if it has a pair of integers that sum up to a particular value.
Implement the `TwoSum` class:
*   `TwoSum()` Initializes the `TwoSum` object, with an empty map.
*   `void add(int number)` Adds `number` to the data structure.
*   `boolean find(int value)` Returns `true` if there exists any pair of numbers whose sum is equal to `value`, otherwise, return `false`.

#### Approach: Hash Map for Frequency
We optimize for `find` or `add` depending on requirements. Here, we optimize `add` to O(1) and `find` to O(N).
*   **Add**: Store the count of each number in a Hash Map.
*   **Find**: Iterate through the unique keys of the map. For each `key`, check if `target - key` exists in the map.
    *   Special case: If `key == target - key` (e.g., target 10, key 5), we need at least 2 occurrences of 5.

#### Visualization
`add(1)`, `add(3)`, `add(5)` -> Map: `{1:1, 3:1, 5:1}`
`find(4)`:
1. Check key `1`: Need `3`. Is `3` in map? Yes. Return True.

`add(3)` -> Map: `{1:1, 3:2, 5:1}`
`find(6)`:
1. Check key `3`: Need `3`. Is `3` in map? Yes. Count > 1? Yes. Return True.

#### Solution
```python
class TwoSum:
    def __init__(self):
        self.counts = {}

    def add(self, number: int) -> None:
        self.counts[number] = self.counts.get(number, 0) + 1

    def find(self, value: int) -> bool:
        for num in self.counts:
            complement = value - num
            if complement in self.counts:
                # If complement is the same number, we need at least 2 of them
                if complement != num or self.counts[num] > 1:
                    return True
        return False
```
