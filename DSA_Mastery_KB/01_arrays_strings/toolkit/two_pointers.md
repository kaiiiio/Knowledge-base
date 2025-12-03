# Blueprint: Two Pointers

**The Analogy**: Two people walking on a path.
*   **Opposite Ends**: Walking towards each other to meet.
*   **Same Direction**: One fast runner, one slow walker.

## 1. Opposite Ends (The "Pincer")

**Use Case**: Two Sum (Sorted), Reverse Array, Palindrome.
**Requirement**: Array is usually **Sorted**.

```python
def two_sum_sorted(nums, target):
    left = 0
    right = len(nums) - 1
    
    while left < right:
        current_sum = nums[left] + nums[right]
        
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1  # Need bigger number -> Move Left forward
        else:
            right -= 1 # Need smaller number -> Move Right backward
            
    return []
```

## 2. Same Direction (The "Race")

**Use Case**: Remove Duplicates, Move Zeroes.
**Logic**: `Fast` explores, `Slow` builds the result.

```python
def remove_duplicates(nums):
    slow = 0
    
    for fast in range(1, len(nums)):
        if nums[fast] != nums[slow]:
            slow += 1
            nums[slow] = nums[fast] # Overwrite
            
    return slow + 1 # New length
```

## 3. Merging (The "Zipper")

**Use Case**: Merge Sorted Array, Merge Sort.

```python
def merge(arr1, arr2):
    p1, p2 = 0, 0
    res = []
    
    while p1 < len(arr1) and p2 < len(arr2):
        if arr1[p1] < arr2[p2]:
            res.append(arr1[p1])
            p1 += 1
        else:
            res.append(arr2[p2])
            p2 += 1
            
    # Add leftovers
    res.extend(arr1[p1:])
    res.extend(arr2[p2:])
    return res
```
