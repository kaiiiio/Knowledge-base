# 03 — Stacks & Queues (Complete)

> Consolidated from all sub-notes into one comprehensive file.


---

# Intuition — Mental Models


## Stack For Undo Redo
_(source: `intuition\stack_for_undo_redo.md`)_


# 🧠 Intuition: Stack for Undo/Redo

Why do text editors use Stacks?

## The Problem
User types "A", then "B", then deletes "B".
We need to "go back" in time.

## The Solution: Two Stacks
1.  **Undo Stack**: Stores every action you DO.
2.  **Redo Stack**: Stores every action you UNDO.

### Scenario
1.  Type "Hello": Push "Type Hello" to **Undo Stack**.
2.  Type "World": Push "Type World" to **Undo Stack**.
3.  **User hits Ctrl+Z (Undo)**:
    *   Pop "Type World" from **Undo Stack**.
    *   Reverse it (Delete "World").
    *   Push "Type World" to **Redo Stack**.

Now, if user hits Ctrl+Y (Redo), we pop from Redo Stack and push back to Undo Stack.


---

# Implementation — Blueprint Code


## Queue Using Ll
_(source: `implementation\queue_using_ll.py`)_


```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Queue:
    """
    FIFO (First In First Out) - Like a line at Starbucks.
    Implemented using Linked List for O(1) Enqueue/Dequeue.
    (Array implementation requires O(N) shift on dequeue unless circular).
    """
    def __init__(self):
        self.head = None
        self.tail = None
        self.size = 0
        
    def enqueue(self, val):
        new_node = ListNode(val)
        if not self.tail:
            self.head = new_node
            self.tail = new_node
        else:
            self.tail.next = new_node
            self.tail = new_node
        self.size += 1
        
    def dequeue(self):
        if not self.head: return None
        
        val = self.head.val
        self.head = self.head.next
        if not self.head:
            self.tail = None
            
        self.size -= 1
        return val
```


## Stack Using Array
_(source: `implementation\stack_using_array.py`)_


```python
class Stack:
    """
    LIFO (Last In First Out) - Like a stack of plates.
    """
    def __init__(self):
        self.items = []
        
    def push(self, item):
        # O(1) amortized
        self.items.append(item)
        
    def pop(self):
        # O(1)
        if not self.is_empty():
            return self.items.pop()
        return None
        
    def peek(self):
        if not self.is_empty():
            return self.items[-1]
        return None
        
    def is_empty(self):
        return len(self.items) == 0
        
    def size(self):
        return len(self.items)
```


---

# Visual Walkthroughs & Animations


## Queue Buffer Anim
_(source: `visual\queue_buffer_anim.py`)_


```python
import time
import os

class CircularQueueVisualizer:
    def __init__(self, k):
        self.k = k
        self.queue = [None] * k
        self.head = -1
        self.tail = -1
        
    def enqueue(self, value):
        print(f"\n📥 Enqueue: {value}")
        if (self.tail + 1) % self.k == self.head:
            print("❌ Queue Full!")
            return False
            
        if self.head == -1:
            self.head = 0
            
        self.tail = (self.tail + 1) % self.k
        self.queue[self.tail] = value
        self.print_state()
        time.sleep(1)
        return True
        
    def dequeue(self):
        print("\n📤 Dequeue")
        if self.head == -1:
            print("❌ Queue Empty!")
            return False
            
        self.queue[self.head] = None # Clear for visualization
        
        if self.head == self.tail:
            self.head = -1
            self.tail = -1
        else:
            self.head = (self.head + 1) % self.k
            
        self.print_state()
        time.sleep(1)
        return True
        
    def print_state(self):
        # os.system('cls' if os.name == 'nt' else 'clear')
        print(f"Buffer (Size {self.k}): {self.queue}")
        print(f"Head: {self.head}, Tail: {self.tail}")

if __name__ == "__main__":
    q = CircularQueueVisualizer(3)
    q.enqueue(1)
    q.enqueue(2)
    q.enqueue(3)
    q.enqueue(4) # Full
    q.dequeue()
    q.enqueue(4) # Wrap around
```


## Queue Fifo Animation
_(source: `visual\queue_fifo_animation.md`)_


# Queue: FIFO (First In, First Out)

Think of a line at a store. You join at the **Back** and leave from the **Front**.

```
      Front                            Back
      +---+---+---+      Enqueue(4)    +---+---+---+---+
<---- | 1 | 2 | 3 |   <-------------   | 1 | 2 | 3 | 4 | <----
      +---+---+---+                    +---+---+---+---+
```

## Operations
1.  **Enqueue(x)**: Add `x` to back. O(1).
2.  **Dequeue()**: Remove front. O(1).


## Stack Lifo Animation
_(source: `visual\stack_lifo_animation.md`)_


# Stack: LIFO (Last In, First Out)

Think of a stack of plates. You can only add or remove from the **TOP**.

```
      |     |      Push(3)      |     |
      |     |    ---------->    |  3  |  <-- Top
      |  2  |                   |  2  |
      |  1  |                   |  1  |
      +-----+                   +-----+
```

## Operations
1.  **Push(x)**: Add `x` to top. O(1).
2.  **Pop()**: Remove top. O(1).
3.  **Peek()**: Look at top. O(1).


## Stack Recursion Sim
_(source: `visual\stack_recursion_sim.py`)_


```python
import time
import os

def factorial(n, depth=0):
    indent = "  " * depth
    print_stack(n, depth, "PUSH")
    time.sleep(1)
    
    if n <= 1:
        print(f"{indent}Base Case Reached! Returning 1")
        print_stack(n, depth, "POP")
        time.sleep(1)
        return 1
        
    print(f"{indent}Computing {n} * factorial({n-1})")
    result = n * factorial(n-1, depth+1)
    
    print(f"{indent}Returning {result}")
    print_stack(n, depth, "POP")
    time.sleep(1)
    return result

def print_stack(n, depth, action):
    # os.system('cls' if os.name == 'nt' else 'clear')
    print(f"\n🥞 STACK OPERATION: {action} Frame(n={n})")
    print("Stack State:")
    for i in range(depth, -1, -1):
        print(f"| Frame n={n- (depth-i)} |")
    print("+--------------+")

if __name__ == "__main__":
    print("🚀 Calculating Factorial(3)...")
    factorial(3)
```


---

# Real-World Applications


## Parsing Resume Sections
_(source: `real_world\parsing_resume_sections.md`)_


# 🌍 Real World: Parsing Resume Sections

**Scenario**: You are building a Resume Parser.
Resumes have nested sections (Experience -> Job 1 -> Bullets).
Sometimes formatting is messy.

## The Problem: Matching Tags/Indentation
How do we know when "Job 1" ends and "Job 2" begins?

## The Solution: Stack
We push the current "Context" onto a stack.

1.  Encounter "Experience": Push `SECTION:EXPERIENCE`.
2.  Encounter "Software Engineer": Push `JOB`.
3.  Encounter "  - Built API": It's indented. Add to current top of stack (`JOB`).
4.  Encounter "Product Manager" (Same indentation as "Software Engineer"):
    *   Pop `JOB` (Software Engineer is done).
    *   Push `JOB` (Product Manager).

This ensures bullets are attached to the correct Job, and Jobs are attached to the correct Section.


---

# Practice Problems


## Leetcode 20 Valid Parentheses
_(source: `practice\leetcode_20_valid_parentheses.md`)_


# ⚔️ LeetCode 20: Valid Parentheses

**Difficulty**: Easy
**Pattern**: Stack

## Problem
Given a string containing `(`, `)`, `{`, `}`, `[`, `]`, determine if it is valid.
Valid: `()[]{}`. Invalid: `(]`.

## Approach
1.  Iterate through string.
2.  If **Open Bracket** (`(`, `{`, `[`): Push to Stack.
3.  If **Close Bracket**:
    *   Check if Stack is empty (Invalid).
    *   Pop from Stack.
    *   If popped element doesn't match current close bracket -> Invalid.
4.  At end, Stack must be empty.

*   Time: O(N)
*   Space: O(N)

```python
def isValid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    
    for char in s:
        if char in mapping:
            # Closing bracket
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            # Opening bracket
            stack.append(char)
            
    return not stack
```


---

# Reference Data (JSON State Snapshots)


## Circular Queue
_(source: `json\circular_queue.json`)_


```json
{
    "capacity": 5,
    "items": [
        null,
        null,
        "C",
        "D",
        "E"
    ],
    "head": 2,
    "tail": 4,
    "next_enqueue_index": 0,
    "note": "Indices 0 and 1 are empty. Next item wraps around to index 0."
}
```


## Queue
_(source: `json\queue.json`)_


```json
{
    "items": [
        "job1",
        "job2"
    ],
    "front": "job1",
    "back": "job2",
    "operation": "Enqueue 'job2'"
}
```


## Stack
_(source: `json\stack.json`)_


```json
{
    "items": [
        "(",
        "{",
        "["
    ],
    "top_index": 2,
    "operation": "Push '['"
}
```


## Stack Trace
_(source: `json\stack_trace.json`)_


```json
{
    "function": "factorial(3)",
    "stack_frames": [
        {
            "id": 1,
            "n": 3,
            "status": "Waiting for factorial(2)"
        },
        {
            "id": 2,
            "n": 2,
            "status": "Waiting for factorial(1)"
        },
        {
            "id": 3,
            "n": 1,
            "status": "Active (Base Case)"
        }
    ],
    "note": "Stack grows UP. Frame 3 is on TOP."
}
```
