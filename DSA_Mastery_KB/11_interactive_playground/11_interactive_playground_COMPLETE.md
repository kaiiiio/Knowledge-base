# 11 — Interactive Playground (Complete)

> Consolidated from all sub-notes into one comprehensive file.


---

# Core Notes


## Heap Animator
_(source: `heap_animator.py`)_


```python
import time
import math

def print_heap_tree(heap, highlight_idx=None):
    """Prints the heap as a tree structure."""
    n = len(heap)
    if n == 0: return
    
    height = int(math.log2(n)) + 1
    width = 2 ** height * 4
    
    print("\n" + "="*width)
    
    for i in range(n):
        level = int(math.log2(i+1))
        indent = width // (2 ** (level + 1))
        
        # Simple level-by-level print (not perfect tree alignment but functional)
        if i == 0 or int(math.log2(i+1)) > int(math.log2(i)):
            print("\n" + " " * (indent - 2), end="")
            
        val_str = str(heap[i])
        if i == highlight_idx:
            val_str = f"[{val_str}]"
            
        print(f"{val_str}".center(6), end=" ")
    print("\n" + "="*width)

def heapify_up(heap, i):
    print(f"Checking index {i} (Val: {heap[i]})...")
    print_heap_tree(heap, highlight_idx=i)
    time.sleep(1)
    
    parent = (i - 1) // 2
    if parent >= 0 and heap[i] < heap[parent]:
        print(f"🔄 Swap {heap[i]} with parent {heap[parent]}")
        heap[i], heap[parent] = heap[parent], heap[i]
        heapify_up(heap, parent)

if __name__ == "__main__":
    heap = [10, 20, 15, 30, 40]
    print("Current Heap:")
    print_heap_tree(heap)
    
    new_val = 5
    print(f"\n➕ Inserting {new_val}...")
    heap.append(new_val)
    heapify_up(heap, len(heap) - 1)
    
    print("\n✅ Final Min Heap:")
    print_heap_tree(heap)
```


## Linked List Visualizer
_(source: `linked_list_visualizer.py`)_


```python
import time

class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def print_list(head, highlight_node=None):
    """Prints the list with ASCII art, highlighting a specific node."""
    curr = head
    nodes = []
    while curr:
        val_str = f"[{curr.val}]"
        if curr == highlight_node:
            val_str = f"\033[92m{val_str}\033[0m" # Green
        nodes.append(val_str)
        curr = curr.next
    nodes.append("None")
    print(" -> ".join(nodes))

def visualize_traversal(head):
    print("\n🚀 Starting Traversal...")
    curr = head
    while curr:
        print_list(head, highlight_node=curr)
        time.sleep(1.0)
        curr = curr.next
    print_list(head, highlight_node=None)
    print("✅ Done!")

if __name__ == "__main__":
    # Setup
    head = Node(10)
    head.next = Node(20)
    head.next.next = Node(30)
    head.next.next.next = Node(40)
    
    visualize_traversal(head)
```


## Trie Explorer
_(source: `trie_explorer.py`)_


```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()
        
    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        self.is_end = True
        
    def search_prefix(self, prefix):
        node = self.root
        path = []
        print(f"\n🔍 Searching for prefix '{prefix}':")
        
        for char in prefix:
            if char in node.children:
                print(f"  Found '{char}' -> Going deeper")
                path.append(char)
                node = node.children[char]
            else:
                print(f"  ❌ '{char}' not found. Stopping.")
                return None
        print(f"✅ Prefix found! Path: {' -> '.join(path)}")
        return node

if __name__ == "__main__":
    t = Trie()
    words = ["python", "pycharm", "pytest", "java"]
    print(f"📚 Dictionary: {words}")
    for w in words: t.insert(w)
    
    while True:
        query = input("\nType a prefix (or 'q' to quit): ")
        if query == 'q': break
        t.search_prefix(query)
```
