# Toolkit: Essential Methods Cheatsheet

This is your "Swiss Army Knife" for Array/String problems. Memorize these.

## 1. Sorting

> [!TIP]
> Sorting takes **O(N log N)**. Use it when `N < 10^6`.

```python
nums = [3, 1, 4, 1, 5]

# 1. Sort In-Place (Modifies original)
nums.sort()         # nums is now [1, 1, 3, 4, 5]

# 2. Return New Sorted List (Original stays same)
new_nums = sorted(nums, reverse=True) # [5, 4, 3, 1, 1]

# 3. Custom Sort (Lambda)
words = ["apple", "bat", "cat"]
# Sort by length
words.sort(key=lambda x: len(x)) 
```

## 2. List Comprehensions (Python Superpower)

Write concise, readable code.
`[expression for item in list if condition]`

```python
nums = [1, 2, 3, 4, 5]

# Square everything
squares = [x*x for x in nums]  # [1, 4, 9, 16, 25]

# Filter evens
evens = [x for x in nums if x % 2 == 0] # [2, 4]

# 2D Array (Matrix) of 0s
matrix = [[0] * 5 for _ in range(3)] # 3 rows, 5 cols
```

## 3. Math Helpers

```python
nums = [10, 20, 30]

print(max(nums))    # 30
print(min(nums))    # 10
print(sum(nums))    # 60
print(abs(-5))      # 5
```

## 4. Common Pitfalls (Don't do this!)

### A. Modifying while Iterating
**Bad**:
```python
for item in nums:
    if item < 5:
        nums.remove(item) # CHAOS! Indices shift while you loop.
```
**Good**:
Create a new list or iterate backwards.

### B. The `is` vs `==` Trap
*   `==` checks **Values** (Is the content the same?).
*   `is` checks **Memory Address** (Is it the exact same object?).

```python
a = [1, 2, 3]
b = [1, 2, 3]

print(a == b) # True (Content matches)
print(a is b) # False (Different boxes in memory)
```

### C. Shallow Copy Trap
```python
row = [0, 0]
matrix = [row] * 3  # [[0,0], [0,0], [0,0]]
matrix[0][0] = 1
# Result: [[1,0], [1,0], [1,0]] -> ALL rows changed!
# Why? They all point to the SAME 'row' object.
```
**Fix**: Use List Comprehension: `[[0, 0] for _ in range(3)]`.
