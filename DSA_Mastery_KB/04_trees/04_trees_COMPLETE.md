# 04 — Trees (Complete)

> Consolidated from all sub-notes into one comprehensive file.


---

# Intuition — Mental Models


## Why Bst For Ordered Data
_(source: `intuition\why_bst_for_ordered_data.md`)_


# 🧠 Why BST for Ordered Data?

Why not just use an Array?

## The Problem: Keeping things sorted
If you have a sorted array `[1, 5, 10, 20]`:
*   **Search**: O(log N) (Binary Search) - Great!
*   **Insert**: O(N) (Shift everyone over) - Bad.

## The Solution: Binary Search Tree (BST)
A BST is like a "dynamic sorted array".
*   **Search**: O(log N) (Go left/right).
*   **Insert**: O(log N) (Find spot, link new node). No shifting!

## The Catch: Balance
If you insert `1, 2, 3, 4, 5` in order, the tree becomes a line (Linked List).
Search becomes O(N).
**Fix**: Self-Balancing Trees (AVL, Red-Black) keep height at O(log N).


---

# Implementation — Blueprint Code


## Avl Self Balancing
_(source: `implementation\avl_self_balancing.py`)_


```python
class AVLNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
        self.height = 1

class AVLTree:
    """
    Self-Balancing BST.
    Ensures height difference (Balance Factor) is never > 1.
    """
    def get_height(self, node):
        if not node: return 0
        return node.height
        
    def get_balance(self, node):
        if not node: return 0
        return self.get_height(node.left) - self.get_height(node.right)
        
    def right_rotate(self, y):
        x = y.left
        T2 = x.right
        
        # Rotate
        x.right = y
        y.left = T2
        
        # Update heights
        y.height = 1 + max(self.get_height(y.left), self.get_height(y.right))
        x.height = 1 + max(self.get_height(x.left), self.get_height(x.right))
        
        return x
        
    def left_rotate(self, x):
        y = x.right
        T2 = y.left
        
        # Rotate
        y.left = x
        x.right = T2
        
        # Update heights
        x.height = 1 + max(self.get_height(x.left), self.get_height(x.right))
        y.height = 1 + max(self.get_height(y.left), self.get_height(y.right))
        
        return y
        
    def insert(self, root, val):
        if not root:
            return AVLNode(val)
            
        if val < root.val:
            root.left = self.insert(root.left, val)
        else:
            root.right = self.insert(root.right, val)
            
        root.height = 1 + max(self.get_height(root.left), self.get_height(root.right))
        
        balance = self.get_balance(root)
        
        # Left Left Case
        if balance > 1 and val < root.left.val:
            return self.right_rotate(root)
            
        # Right Right Case
        if balance < -1 and val > root.right.val:
            return self.left_rotate(root)
            
        # Left Right Case
        if balance > 1 and val > root.left.val:
            root.left = self.left_rotate(root.left)
            return self.right_rotate(root)
            
        # Right Left Case
        if balance < -1 and val < root.right.val:
            root.right = self.right_rotate(root.right)
            return self.left_rotate(root)
            
        return root
```


## Bst Insert Delete
_(source: `implementation\bst_insert_delete.py`)_


```python
class TreeNode:
    def __init__(self, val=0):
        self.val = val
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None
        
    def insert(self, val):
        if not self.root:
            self.root = TreeNode(val)
            return
        self._insert_recursive(self.root, val)
        
    def _insert_recursive(self, node, val):
        if val < node.val:
            if node.left:
                self._insert_recursive(node.left, val)
            else:
                node.left = TreeNode(val)
        else:
            if node.right:
                self._insert_recursive(node.right, val)
            else:
                node.right = TreeNode(val)
                
    def search(self, val):
        return self._search_recursive(self.root, val)
        
    def _search_recursive(self, node, val):
        if not node: return False
        if node.val == val: return True
        
        if val < node.val:
            return self._search_recursive(node.left, val)
        return self._search_recursive(node.right, val)
```


## Min Heap
_(source: `implementation\min_heap.py`)_


```python
class MinHeap:
    def __init__(self):
        self.heap = []
        
    def push(self, val):
        self.heap.append(val)
        self._sift_up(len(self.heap) - 1)
        
    def pop(self):
        if not self.heap: return None
        if len(self.heap) == 1: return self.heap.pop()
        
        root = self.heap[0]
        self.heap[0] = self.heap.pop() # Move last to root
        self._sift_down(0)
        return root
        
    def _sift_up(self, i):
        parent = (i - 1) // 2
        if i > 0 and self.heap[i] < self.heap[parent]:
            self.heap[i], self.heap[parent] = self.heap[parent], self.heap[i]
            self._sift_up(parent)
            
    def _sift_down(self, i):
        smallest = i
        left = 2 * i + 1
        right = 2 * i + 2
        
        if left < len(self.heap) and self.heap[left] < self.heap[smallest]:
            smallest = left
            
        if right < len(self.heap) and self.heap[right] < self.heap[smallest]:
            smallest = right
            
        if smallest != i:
            self.heap[i], self.heap[smallest] = self.heap[smallest], self.heap[i]
            self._sift_down(smallest)

if __name__ == "__main__":
    h = MinHeap()
    h.push(10)
    h.push(5)
    h.push(20)
    print(h.pop()) # 5
    print(h.pop()) # 10
```


## Trie
_(source: `implementation\trie.py`)_


```python
class TrieNode:
    def __init__(self):
        self.children = {} # Map<Char, TrieNode>
        self.is_end_of_word = False

class Trie:
    """
    Prefix Tree.
    Insert/Search Time: O(L) where L is length of word.
    Space: O(N * L) in worst case.
    """
    def __init__(self):
        self.root = TrieNode()
        
    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True
        
    def search(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end_of_word
        
    def starts_with(self, prefix):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]
        return True
```


---

# Visual Walkthroughs & Animations


## Array Vs Tree View
_(source: `visual\array_vs_tree_view.md`)_


# Heap: Array vs Tree View

## The Magic Trick
A Heap is a **Tree** that lives inside an **Array**.

### Tree View
```
      10 (Index 0)
     /  \
   20    5 (Index 2)
  /  \
 30  40
```

### Array View
`[ 10, 20, 5, 30, 40 ]`

### The Formulas
For any node at index `i`:
- **Left Child**: `2*i + 1`
- **Right Child**: `2*i + 2`
- **Parent**: `(i - 1) // 2`

**Example**:
Node `20` is at index `1`.
- Left Child: `2*1 + 1 = 3` -> Value `30`
- Right Child: `2*1 + 2 = 4` -> Value `40`
- Parent: `(1 - 1) // 2 = 0` -> Value `10`


## Autocomplete Sim
_(source: `visual\autocomplete_sim.py`)_


```python
import time
import os

class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False

class TrieVisualizer:
    def __init__(self):
        self.root = TrieNode()
        
    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_word = True
        
    def visualize_search(self, prefix):
        print(f"🔎 SEARCHING FOR PREFIX: '{prefix}'")
        print("-----------------------------------")
        
        node = self.root
        path = ""
        
        for char in prefix:
            if char in node.children:
                path += char
                print(f"✅ Found '{char}' -> Current Path: {path}")
                node = node.children[char]
                time.sleep(1)
            else:
                print(f"❌ '{char}' NOT FOUND. Path ends at {path}")
                return
                
        print("\n✨ Suggestions:")
        self._dfs_print(node, path)
        
    def _dfs_print(self, node, current_word):
        if node.is_word:
            print(f"  - {current_word}")
            
        for char, child in node.children.items():
            self._dfs_print(child, current_word + char)

if __name__ == "__main__":
    t = TrieVisualizer()
    words = ["cat", "car", "cart", "dog", "do"]
    print(f"📚 Dictionary: {words}\n")
    
    for w in words: t.insert(w)
    
    t.visualize_search("ca")
```


## Binary Tree Traversal Paths
_(source: `visual\binary_tree_traversal_paths.md`)_


# Binary Tree Traversals

Tree:
```
      1
     / \
    2   3
```

## 1. Preorder (Root -> Left -> Right)
`1 -> 2 -> 3`
Use: Copying tree.

## 2. Inorder (Left -> Root -> Right)
`2 -> 1 -> 3`
Use: Sorted order for BST.

## 3. Postorder (Left -> Right -> Root)
`2 -> 3 -> 1`
Use: Deleting tree (children first).


## Heap Tree Structure
_(source: `visual\heap_tree_structure.md`)_


# Heap: Array vs Tree

## Tree View
```
      10
     /  \
   20    30
```

## Array View
`[10, 20, 30]`

## Index Math
*   Left Child: `2*i + 1`
*   Right Child: `2*i + 2`
*   Parent: `(i-1) // 2`

This allows us to represent a tree without pointers!


## Heapify Sift Down
_(source: `visual\heapify_sift_down.py`)_


```python
import time
import os

def visualize_heapify(arr):
    print("🌋 HEAPIFY VISUALIZATION (Min Heap)")
    print(f"Initial Array: {arr}")
    print("-----------------------------------")
    
    n = len(arr)
    # Start from last non-leaf node
    for i in range(n // 2 - 1, -1, -1):
        sift_down(arr, n, i)
        
    print(f"\n✅ Final Heap: {arr}")

def sift_down(arr, n, i):
    smallest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    print(f"\nChecking Node index {i} (Val: {arr[i]})")
    
    if left < n and arr[left] < arr[smallest]:
        smallest = left
        
    if right < n and arr[right] < arr[smallest]:
        smallest = right
        
    if smallest != i:
        print(f"⬇️ Swapping {arr[i]} with {arr[smallest]}")
        arr[i], arr[smallest] = arr[smallest], arr[i]
        print(f"Current Array: {arr}")
        time.sleep(1)
        sift_down(arr, n, smallest)

if __name__ == "__main__":
    # [10, 5, 20, 2, 4] -> Min Heap
    arr = [10, 5, 20, 2, 4]
    visualize_heapify(arr)
```


## Traversal Paths
_(source: `visual\traversal_paths.md`)_


# Tree Traversals: The Path

Tree:
```
      1
     / \
    2   3
   / \
  4   5
```

## 1. Preorder (Root -> Left -> Right)
"Visit the node BEFORE you visit children."
**Path**: `1 -> 2 -> 4 -> 5 -> 3`
**Use Case**: Copying a tree.

## 2. Inorder (Left -> Root -> Right)
"Visit the node BETWEEN left and right children."
**Path**: `4 -> 2 -> 5 -> 1 -> 3`
**Use Case**: Getting sorted elements from a BST.

## 3. Postorder (Left -> Right -> Root)
"Visit the node AFTER you visit children."
**Path**: `4 -> 5 -> 2 -> 3 -> 1`
**Use Case**: Deleting a tree (delete children first).


## Tree Printer
_(source: `visual\tree_printer.py`)_


```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def print_tree(root, level=0, prefix="Root: "):
    """
    Recursively prints the tree in a horizontal structure.
    """
    if not root:
        return
        
    print(" " * (level * 4) + prefix + str(root.val))
    
    if root.left or root.right:
        if root.left:
            print_tree(root.left, level + 1, "L--- ")
        else:
            print(" " * ((level + 1) * 4) + "L--- None")
            
        if root.right:
            print_tree(root.right, level + 1, "R--- ")
        else:
            print(" " * ((level + 1) * 4) + "R--- None")

if __name__ == "__main__":
    #      10
    #     /  \
    #    5    15
    #   / \     \
    #  2   7     20
    
    root = TreeNode(10)
    root.left = TreeNode(5)
    root.right = TreeNode(15)
    root.left.left = TreeNode(2)
    root.left.right = TreeNode(7)
    root.right.right = TreeNode(20)
    
    print("🌳 TREE VISUALIZER 🌳")
    print_tree(root)
```


---

# Real-World Applications


## Tech Stack Trie
_(source: `real_world\tech_stack_trie.md`)_


# 🌍 Real World: Tech Stack Trie

**Scenario**: You are building a "Skill Normalizer" for resumes.
User types: "React.js", "ReactJS", "React".
We want to map them all to "React".

## The Data Structure: Trie (Prefix Tree)
Store standard skills in a Trie.

## Optimization: Autocomplete
When user types "Re...", we traverse the Trie:
`R -> e -> a -> c -> t`
We find "React", "React Native", "Redis".

## Why Trie?
*   **Speed**: O(L) where L is word length. Faster than Hash Map for prefix search.
*   **Space**: Shared prefixes save memory. "React" and "Reader" share "R-e-a".


## Top K Jobs With Min Heap
_(source: `real_world\top_k_jobs_with_min_heap.md`)_


# 🌍 Real World: Top K Jobs (Min Heap)

**Scenario**: You have 1 million jobs. You want to show the "Top 10" best matches.
Streaming data: New jobs keep coming in.

## The Problem: Sorting is Slow
Sorting 1 million jobs takes O(N log N). Too slow for real-time.

## The Solution: Min Heap of Size K
Keep a small heap of size 10.
1.  Heap contains the 10 *best* jobs seen so far.
2.  The **Root** is the *worst* of the best (the 10th best).
3.  New job comes in?
    *   If `Score(New) > Score(Root)`: Pop Root, Push New.
    *   Else: Ignore.

## Complexity
*   Time: O(N log K).
*   Since K=10, this is basically O(N). Massive speedup!


---

# Practice Problems


## Leetcode 104 Max Depth
_(source: `practice\leetcode_104_max_depth.md`)_


# ⚔️ LeetCode 104: Maximum Depth of Binary Tree

**Difficulty**: Easy
**Pattern**: DFS (Recursion)

## Problem
Find the number of nodes along the longest path from root to leaf.

## Approach
Recursive DFS.
`Depth = 1 + max(Depth(Left), Depth(Right))`
Base case: If node is None, depth is 0.

*   Time: O(N)
*   Space: O(H) (Height of tree)

```python
def maxDepth(root):
    if not root:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))
```


## Leetcode 703 Kth Largest
_(source: `practice\leetcode_703_kth_largest.md`)_


# ⚔️ LeetCode 703: Kth Largest Element in a Stream

**Difficulty**: Easy
**Pattern**: Min Heap

## Problem
Design a class to find the `k`th largest element in a stream.

## Approach
Maintain a Min Heap of size `k`.
The root of the heap is always the `k`th largest element.
When adding a number:
1.  Push to heap.
2.  If size > k, Pop min.
3.  Return heap[0].

*   Time: O(log K) per add.
*   Space: O(K).

```python
import heapq

class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.heap = []
        for n in nums:
            self.add(n)
            
    def add(self, val):
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]
```


---

# Reference Data (JSON State Snapshots)


## Binary Tree
_(source: `json\binary_tree.json`)_


```json
{
    "val": 10,
    "left": {
        "val": 5,
        "left": {
            "val": 2,
            "left": null,
            "right": null
        },
        "right": {
            "val": 7,
            "left": null,
            "right": null
        }
    },
    "right": {
        "val": 15,
        "left": null,
        "right": {
            "val": 20,
            "left": null,
            "right": null
        }
    },
    "note": "Recursive structure. Each node is a sub-tree."
}
```


## Bst
_(source: `json\bst.json`)_


```json
{
    "root": {
        "val": 10,
        "left": {
            "val": 5,
            "left": null,
            "right": null
        },
        "right": {
            "val": 15,
            "left": null,
            "right": null
        }
    },
    "property": "Left < Root < Right"
}
```


## Heap Array Map
_(source: `json\heap_array_map.json`)_


```json
{
    "array": [
        10,
        20,
        5,
        30,
        40
    ],
    "mapping": {
        "index_0": {
            "val": 10,
            "children": [
                1,
                2
            ]
        },
        "index_1": {
            "val": 20,
            "children": [
                3,
                4
            ]
        },
        "index_2": {
            "val": 5,
            "children": []
        }
    },
    "note": "Index 0 is Root. Index 1 is Left Child of 0. Index 2 is Right Child of 0."
}
```


## Trie Dictionary
_(source: `json\trie_dictionary.json`)_


```json
{
    "root": {
        "c": {
            "a": {
                "t": {
                    "isWord": true
                },
                "r": {
                    "isWord": true,
                    "t": {
                        "isWord": true
                    }
                }
            }
        },
        "d": {
            "o": {
                "isWord": true,
                "g": {
                    "isWord": true
                }
            }
        }
    },
    "note": "Common prefixes (c-a, d-o) are shared. This saves massive space for dictionaries."
}
```
