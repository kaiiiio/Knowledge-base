# 06 — Hashing (Complete)

> Consolidated from all sub-notes into one comprehensive file.


---

# Intuition — Mental Models


## Why Hash For O1 Lookup
_(source: `intuition\why_hash_for_o1_lookup.md`)_


# 🧠 Why Hash for O(1) Lookup?

## The Magic of Arrays
Arrays give O(1) access if you know the **Index**.
`arr[5]` is instant.

## The Problem
We want to look up by **Name** (String), not Index (Integer).
`arr["John"]` ???

## The Solution: Hashing
Turn the **Name** into an **Index**.
`"John" --(Hash Function)--> 5`

Now we can do `arr[5]`.
It's like a magic trick that turns any data into an array index.

## The Cost
*   **Space**: You need a big array (buckets) to avoid collisions.
*   **Collisions**: Sometimes two keys map to the same index.


---

# Implementation — Blueprint Code


## Hashmap
_(source: `implementation\hashmap.py`)_


```python
class ListNode:
    def __init__(self, key, val):
        self.key = key
        self.val = val
        self.next = None

class HashMap:
    """
    Simple HashMap with Chaining.
    """
    def __init__(self, capacity=100):
        self.capacity = capacity
        self.buckets = [None] * capacity
        
    def _hash(self, key):
        return hash(key) % self.capacity
        
    def put(self, key, val):
        index = self._hash(key)
        head = self.buckets[index]
        
        # Check if key exists (Update)
        curr = head
        while curr:
            if curr.key == key:
                curr.val = val
                return
            curr = curr.next
            
        # Insert new node at head
        new_node = ListNode(key, val)
        new_node.next = head
        self.buckets[index] = new_node
        
    def get(self, key):
        index = self._hash(key)
        curr = self.buckets[index]
        while curr:
            if curr.key == key:
                return curr.val
            curr = curr.next
        return -1

if __name__ == "__main__":
    hm = HashMap()
    hm.put("name", "Alice")
    hm.put("age", 30)
    print(hm.get("name")) # Alice
```


---

# Visual Walkthroughs & Animations


## Hash Collision Chaining
_(source: `visual\hash_collision_chaining.md`)_


# Hash Collision: Chaining

What happens when two keys hash to the same bucket?
`Hash("John") = 1`
`Hash("Jane") = 1`

## The Solution: Linked Lists (Chaining)
Each bucket holds a Linked List of entries.

```
Bucket 0: [ Null ]
Bucket 1: [ "John" ] -> [ "Jane" ] -> Null
Bucket 2: [ "Bob" ] -> Null
```

## Lookup "Jane"
1.  Compute Hash("Jane") -> 1.
2.  Go to Bucket 1.
3.  Walk the list: "John"? No. "Jane"? Yes!

## Complexity
*   **Best Case**: O(1) (List length is small).
*   **Worst Case**: O(N) (All keys in one bucket).


---

# Real-World Applications


## Resume Deduplication By Hash
_(source: `real_world\resume_deduplication_by_hash.md`)_


# 🌍 Real World: Resume Deduplication

**Scenario**: Candidates apply 10 times to the same job.
Parsing a PDF is expensive (OCR, AI).
We want to skip parsing if we've seen this file before.

## The Solution: Content Hashing
1.  Read the file bytes.
2.  Compute SHA-256 Hash. `Hash(FileBytes) -> "a1b2c3..."`
3.  Check DB: `SELECT * FROM resumes WHERE file_hash = "a1b2c3..."`

## Why Hash?
*   **Speed**: Comparing 32-byte hashes is instant. Comparing 5MB files is slow.
*   **Privacy**: You can store the hash without storing the file (if needed).

## Code
```python
import hashlib

def get_file_hash(file_path):
    hasher = hashlib.sha256()
    with open(file_path, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()
```


---

# Practice Problems


## Leetcode 1 Two Sum Hash
_(source: `practice\leetcode_1_two_sum_hash.md`)_


# ⚔️ LeetCode 1: Two Sum (Hash Map)

**Difficulty**: Easy
**Pattern**: Hash Map

## Problem
Find two numbers that add up to `target`.

## Approach
Iterate through the array.
For each number `x`, we need `y = target - x`.
Check if `y` is in our Hash Map.
If yes, return indices.
If no, add `x` to Hash Map.

*   Time: O(N)
*   Space: O(N)

```python
def twoSum(nums, target):
    seen = {} # Val -> Index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
```


---

# Reference Data (JSON State Snapshots)


## Hashmap Snapshot
_(source: `json\hashmap_snapshot.json`)_


```json
{
    "buckets": {
        "1": [
            "John",
            "Jane"
        ],
        "2": [
            "Bob"
        ],
        "5": [
            "Alice"
        ]
    },
    "load_factor": 0.75,
    "capacity": 16
}
```
