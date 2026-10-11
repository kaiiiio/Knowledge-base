# 10 — System Design DSA (Complete)

> Consolidated from all sub-notes into one comprehensive file.


---

# Core Notes


## Inverted Index
_(source: `inverted_index.py`)_


```python
class InvertedIndex:
    """
    The core of Search Engines (Elasticsearch, Google).
    Maps: Word -> List of Document IDs.
    """
    def __init__(self):
        self.index = {} # Map<Word, Set<DocID>>
        
    def add_document(self, doc_id, text):
        words = text.lower().split()
        for word in words:
            if word not in self.index:
                self.index[word] = set()
            self.index[word].add(doc_id)
            
    def search(self, query):
        words = query.lower().split()
        if not words: return set()
        
        # Start with docs containing the first word
        result = self.index.get(words[0], set())
        
        # Intersect with docs containing other words (AND query)
        for word in words[1:]:
            result = result.intersection(self.index.get(word, set()))
            
        return result

if __name__ == "__main__":
    idx = InvertedIndex()
    idx.add_document(1, "The quick brown fox")
    idx.add_document(2, "The lazy dog")
    idx.add_document(3, "The quick red fox")
    
    print(idx.search("quick fox")) # {1, 3}
    print(idx.search("lazy"))      # {2}
```


## Lru Cache
_(source: `lru_cache.py`)_


```python
class Node:
    def __init__(self, key, val):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    """
    Least Recently Used (LRU) Cache.
    Get: O(1)
    Put: O(1)
    Uses HashMap + Doubly Linked List.
    """
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {} # Map<Key, Node>
        
        # Dummy head and tail
        self.head = Node(0, 0)
        self.tail = Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head
        
    def _remove(self, node):
        prev = node.prev
        nxt = node.next
        prev.next = nxt
        nxt.prev = prev
        
    def _add(self, node):
        # Add to right (Most Recently Used)
        prev = self.tail.prev
        prev.next = node
        self.tail.prev = node
        node.prev = prev
        node.next = self.tail
        
    def get(self, key):
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._add(node) # Move to MRU
            return node.val
        return -1
        
    def put(self, key, value):
        if key in self.cache:
            self._remove(self.cache[key])
        
        node = Node(key, value)
        self._add(node)
        self.cache[key] = node
        
        if len(self.cache) > self.capacity:
            # Evict LRU (from left)
            lru = self.head.next
            self._remove(lru)
            del self.cache[lru.key]

if __name__ == "__main__":
    lru = LRUCache(2)
    lru.put(1, 1)
    lru.put(2, 2)
    print(lru.get(1)) # 1 (1 is now MRU)
    lru.put(3, 3)     # Evicts 2
    print(lru.get(2)) # -1 (Not found)
```


## Sliding Window Log
_(source: `sliding_window_log.py`)_


```python
import time
from collections import deque

class RateLimiter:
    """
    Sliding Window Log Algorithm.
    Precision: High
    Space: O(K) where K is limit.
    """
    def __init__(self, limit, window_seconds):
        self.limit = limit
        self.window_seconds = window_seconds
        self.requests = deque()
        
    def allow_request(self):
        now = time.time()
        
        # 1. Remove outdated timestamps
        while self.requests and self.requests[0] < now - self.window_seconds:
            self.requests.popleft()
            
        # 2. Check count
        if len(self.requests) < self.limit:
            self.requests.append(now)
            return True
            
        return False

if __name__ == "__main__":
    limiter = RateLimiter(2, 1) # 2 requests per 1 second
    
    print(f"Req 1: {limiter.allow_request()}") # True
    print(f"Req 2: {limiter.allow_request()}") # True
    print(f"Req 3: {limiter.allow_request()}") # False
    
    time.sleep(1.1)
    print(f"Req 4: {limiter.allow_request()}") # True (Window slid)
```


---

# Reference Data (JSON State Snapshots)


## Index Map
_(source: `json\index_map.json`)_


```json
{
    "term": "fox",
    "postings_list": [
        {
            "doc_id": 1,
            "frequency": 1,
            "positions": [
                3
            ]
        },
        {
            "doc_id": 3,
            "frequency": 1,
            "positions": [
                3
            ]
        }
    ],
    "note": "This allows O(1) lookup to find ALL documents containing 'fox'."
}
```


## Lru State
_(source: `json\lru_state.json`)_


```json
{
    "capacity": 3,
    "map": {
        "A": "Node(A)",
        "B": "Node(B)",
        "C": "Node(C)"
    },
    "list": "Head <-> A <-> B <-> C <-> Tail",
    "status": {
        "LRU": "A (Left side)",
        "MRU": "C (Right side)"
    }
}
```


## Redis Keys
_(source: `json\redis_keys.json`)_


```json
{
    "key": "rate_limit:user_123",
    "type": "Sorted Set (ZSET)",
    "values": [
        {
            "timestamp": 1670000001,
            "member": "req_id_1"
        },
        {
            "timestamp": 1670000002,
            "member": "req_id_2"
        }
    ],
    "command": "ZREMRANGEBYSCORE key 0 (now - window)",
    "note": "Redis ZSETs are perfect for Sliding Window Logs."
}
```


---

# Job Scheduler With Heap


## Job Priority Heap
_(source: `job_scheduler_with_heap\job_priority_heap.json`)_


```json
[
    {
        "priority": 1,
        "job": "Security Patch"
    },
    {
        "priority": 5,
        "job": "Email Report"
    },
    {
        "priority": 10,
        "job": "Cleanup Logs"
    }
]
```


## Job Scheduler With Heap
_(source: `job_scheduler_with_heap\job_scheduler_with_heap.md`)_


# Job Scheduler: Priority Queue

**Goal**: Execute jobs based on Priority, not Arrival Time.
"Critical Security Patch" > "Weekly Email Report".

## The Data Structure: Min Heap (or Max Heap)
Store jobs as `(Priority, Timestamp, JobID)`.

## The Loop
1.  Worker checks Heap.
2.  `Pop()` the highest priority job.
3.  Execute it.

## Why Heap?
*   **Insert**: O(log N). Fast to add new jobs.
*   **Get Best**: O(1). Instant access to the most important task.


---

# Lru Cache Design


## Lru Cache
_(source: `lru_cache_design\lru_cache.json`)_


```json
{
    "map": {
        "A": "Node(A)",
        "B": "Node(B)"
    },
    "list": "Head <-> Node(A) <-> Node(B) <-> Tail",
    "capacity": 2,
    "state": "Full"
}
```


## Lru Cache
_(source: `lru_cache_design\lru_cache.py`)_


```python
class Node:
    def __init__(self, key, val):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {} # Key -> Node
        # Dummy Head (MRU) and Tail (LRU)
        self.head = Node(0, 0)
        self.tail = Node(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head
        
    def _remove(self, node):
        prev = node.prev
        nxt = node.next
        prev.next = nxt
        nxt.prev = prev
        
    def _add(self, node):
        # Add to Head (MRU)
        nxt = self.head.next
        self.head.next = node
        node.prev = self.head
        node.next = nxt
        nxt.prev = node
        
    def get(self, key):
        if key in self.cache:
            node = self.cache[key]
            self._remove(node)
            self._add(node)
            return node.val
        return -1
        
    def put(self, key, value):
        if key in self.cache:
            self._remove(self.cache[key])
        
        node = Node(key, value)
        self._add(node)
        self.cache[key] = node
        
        if len(self.cache) > self.capacity:
            # Evict LRU (Tail.prev)
            lru = self.tail.prev
            self._remove(lru)
            del self.cache[lru.key]
```


## Lru Cache Doubly Linked
_(source: `lru_cache_design\lru_cache_doubly_linked.md`)_


# LRU Cache: The Design

**Goal**: O(1) Get and O(1) Put.
**Eviction Policy**: Remove the Least Recently Used item when full.

## The Data Structure: HashMap + Doubly Linked List
*   **HashMap**: `Key -> Node`. Allows O(1) access.
*   **Doubly Linked List**: Maintains order.
    *   **Head**: Most Recently Used (MRU).
    *   **Tail**: Least Recently Used (LRU).

## Visual
```
      HashMap
    +---+---+
    | A | * |-----> [ Node A ] <---> [ Node B ] <---> [ Node C ]
    | B | * |----->
    | C | * |----->   ^                                   ^
    +---+---+        Head (MRU)                          Tail (LRU)
```

## Operations
1.  **Get(A)**:
    *   Look up A in Map.
    *   Move Node A to **Head**.
2.  **Put(D)** (Capacity Full):
    *   Remove **Tail** (Node C) from List and Map.
    *   Add Node D to **Head**.
    *   Add D to Map.


## Resume Cache
_(source: `lru_cache_design\resume_cache.md`)_


# 🌍 Real World: Resume Cache

**Scenario**: You have 1 million resumes. Parsing them is slow (5 seconds).
Users often view the same resume multiple times (Recruiter A, then Recruiter B).

## The Solution: LRU Cache
Store the *parsed* JSON in memory.

1.  **Key**: Resume ID (or File Hash).
2.  **Value**: Parsed JSON Object.
3.  **Capacity**: 10,000 resumes (approx 1GB RAM).

## Why LRU?
*   **Locality of Reference**: Resumes that are popular *now* (active job application) are likely to be viewed again soon.
*   **Automatic Cleanup**: Old resumes naturally fall off the end.


---

# Rate Limiter Sliding Window


## Rate Limiter Buckets
_(source: `rate_limiter_sliding_window\rate_limiter_buckets.json`)_


```json
{
    "user_id": "user_123",
    "timestamps": [
        1670000001,
        1670000005,
        1670000059
    ],
    "window_start": 1670000000,
    "count": 3,
    "limit": 100
}
```


## Rate Limiter Sliding Window
_(source: `rate_limiter_sliding_window\rate_limiter_sliding_window.md`)_


# Rate Limiter: Sliding Window Log

**Goal**: Limit user to 100 requests per minute.

## The Algorithm
1.  Keep a **Sorted Set** (or List) of timestamps for each user.
2.  When a request comes in at time `T`:
    *   Remove all timestamps smaller than `T - 60 seconds`.
    *   Count remaining timestamps.
    *   If `Count < Limit`: Allow request, Add `T`.
    *   Else: Reject.

## Redis Implementation
Use `ZSET`.
*   `ZREMRANGEBYSCORE key -inf (T - 60)`
*   `ZCARD key`
*   `ZADD key T T`
