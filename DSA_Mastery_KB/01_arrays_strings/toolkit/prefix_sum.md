# Blueprint: Prefix Sum

**The Concept**: A "Running Total".
Instead of storing `[10, 20, 30]`, we store `[10, 30, 60]`.

## 1. Range Sum Query (Immutable)

**Use Case**: "Calculate sum of `nums[i...j]` many times".
**Formula**: `Sum(i, j) = Prefix[j] - Prefix[i-1]`.

```python
class PrefixSum:
    def __init__(self, nums):
        # Pad with 0 to handle edge case (index -1)
        self.prefix = [0] * (len(nums) + 1)
        for i in range(len(nums)):
            self.prefix[i + 1] = self.prefix[i] + nums[i]
            
    def query(self, left, right):
        # Right is inclusive
        return self.prefix[right + 1] - self.prefix[left]
```

## 2. Subarray Sum Equals K (The Interview Favorite)

**Use Case**: "Find number of subarrays that sum to K".
**Logic**: If `Current_Sum - K` exists in our history, we found a subarray!
**Pattern**: `Hash Map + Prefix Sum`.

```python
def subarray_sum(nums, k):
    count = 0
    current_sum = 0
    
    # Map: {Prefix_Sum : Frequency}
    # Base Case: Sum 0 exists once (empty subarray)
    prefix_map = {0: 1}
    
    for num in nums:
        current_sum += num
        diff = current_sum - k
        
        # Did we see this difference before?
        if diff in prefix_map:
            count += prefix_map[diff]
            
        prefix_map[current_sum] = prefix_map.get(current_sum, 0) + 1
        
    return count
```

> [!TIP]
> **Why Hash Map?**
> Because we need to look up *past* sums instantly ($O(1)$).
