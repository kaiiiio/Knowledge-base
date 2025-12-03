# Blueprint: Hash Map Patterns

**The Concept**: The "Magic Lookup".
Find anything in $O(1)$ time.

## 1. Frequency Counter (The Cheat Code)

**Use Case**: Anagrams, Top K Elements, "Most Frequent...".
**Tool**: `collections.Counter`.

```python
from collections import Counter

s = "banana"
counts = Counter(s) 
# Counter({'a': 3, 'n': 2, 'b': 1})

print(counts['a']) # 3
print(counts['z']) # 0 (Safe! Returns 0, doesn't crash)
```

## 2. The "Two Sum" Lookup

**Use Case**: Find pair `(A, B)` such that `A + B = Target`.
**Logic**: We are at `A`. We need `B`. Is `B` in the map?

```python
def two_sum(nums, target):
    seen = {} # {Value : Index}
    
    for i, num in enumerate(nums):
        diff = target - num
        
        if diff in seen:
            return [seen[diff], i]
            
        seen[num] = i
    return []
```

## 3. Grouping (Anagrams)

**Use Case**: "Group strings that are..."
**Tool**: `collections.defaultdict`.

```python
from collections import defaultdict

def group_anagrams(strs):
    # Default value is an empty list []
    groups = defaultdict(list)
    
    for s in strs:
        # Key must be immutable (Tuple)
        key = tuple(sorted(s))
        groups[key].append(s)
        
    return list(groups.values())
```

> [!CAUTION]
> **Mutable Keys**: You cannot use a `list` as a key in a dictionary.
> *   Bad: `d[[1, 2]] = "val"` -> Error.
> *   Good: `d[(1, 2)] = "val"` -> OK (Tuple).
