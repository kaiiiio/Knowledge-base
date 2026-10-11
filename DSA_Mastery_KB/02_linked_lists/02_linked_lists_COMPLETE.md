# 02 — Linked Lists (Complete)

> Restructured level-wise: Level 0 (absolute basics) → Level 1 (easy) → Level 2 (medium) → Level 3 (hard). All original content preserved and reorganized; missing canonical problems added.

---

## Level 0 — Absolute Basics (Start Here)

### What a linked list actually is
A linked list is a chain of **nodes** scattered anywhere in memory, each holding a value and a pointer to the next node. Unlike an array (contiguous memory, O(1) access via arithmetic), a linked list has **no contiguous block** — nodes can live at any address, connected only by pointers.

```
[ Address: 0x100 ]      [ Address: 0x200 ]      [ Address: 0x300 ]
+-------+------+       +-------+------+       +-------+------+
| Val: 1| Next |------>| Val: 2| Next |------>| Val: 3| None |
+-------+------+       +-------+------+       +-------+------+
```
Nodes are **scattered in heap memory** (0x100, 0x300, 0x200 — not in order). This is the direct opposite of an array, where element 2 always sits right after element 1 in memory.

**Key vocabulary**:
- **Head**: the first node. If you lose the reference to it, the entire list becomes unreachable garbage.
- **Tail**: the last node — its `next` pointer is `None`/`null`.
- **Singly linked**: each node points only forward (`next`).
- **Doubly linked**: each node points both forward (`next`) and backward (`prev`).

### Linked List vs Array — the trade-off table (the most-asked "why" question in junior interviews)
| Operation | Array | Singly Linked List |
|---|---|---|
| Access by index | O(1) — direct address arithmetic | O(n) — must walk node by node from head |
| Insert/delete at the **front** | O(n) — must shift every element | O(1) — just repoint the head |
| Insert/delete at a **known middle node** | O(n) — must shift | O(1) — just repoint two pointers (if you already have the node reference) |
| Memory layout | Contiguous | Scattered, connected by pointers |
| Extra memory per element | None | One (or two, for doubly linked) pointer per node |

**The one-line answer to memorize**: "Arrays are fast for random access because of contiguous memory; linked lists are fast for insertion/deletion at the ends because there's nothing to shift — you're trading O(1) access for O(1) structural changes."

### Building block: the Node class
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

### Warm-up 1: Traverse and print a list
```python
def print_list(head):
    curr = head
    values = []
    while curr:
        values.append(str(curr.val))
        curr = curr.next
    print(" -> ".join(values) + " -> None")
```
**Complexity**: O(n) time, O(1) extra space (O(n) if you count the string being built). This traversal loop — `while curr: ...; curr = curr.next` — is the single most-repeated shape in every linked list problem in this file. Get it into muscle memory before moving on.

### Warm-up 2: Search for a value
```python
def contains(head, target):
    curr = head
    while curr:
        if curr.val == target:
            return True
        curr = curr.next
    return False
```
**Complexity**: O(n) time, O(1) space — no shortcut exists; unlike a sorted array, there is no binary search on a linked list, because you cannot jump to "the middle" without walking there first (no O(1) index access).

### Warm-up 3: Basic Singly Linked List class (insert at head, insert at tail, delete by index)
```python
class SinglyLinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def add_at_head(self, val):
        # O(1) — no shifting needed, just repoint the head
        new_node = ListNode(val)
        new_node.next = self.head
        self.head = new_node
        self.size += 1

    def add_at_tail(self, val):
        # O(n) — must traverse to the end (unless a tail pointer is kept, then O(1))
        new_node = ListNode(val)
        if not self.head:
            self.head = new_node
            self.size += 1
            return
        curr = self.head
        while curr.next:
            curr = curr.next
        curr.next = new_node
        self.size += 1

    def delete_at_index(self, index):
        # O(n) — traversal to reach the index
        if index < 0 or index >= self.size:
            return
        if index == 0:
            self.head = self.head.next
        else:
            curr = self.head
            for _ in range(index - 1):
                curr = curr.next
            curr.next = curr.next.next
        self.size -= 1
```

### Warm-up 4: The Doubly Linked List (why the extra pointer is worth the memory cost)
```python
class DoublyListNode:
    def __init__(self, val=0, next=None, prev=None):
        self.val = val
        self.next = next
        self.prev = prev

class DoublyLinkedList:
    """
    Pros: O(1) deletion of a node you already have a reference to — no need to
          walk from head to find its predecessor (unlike singly linked lists).
    Cons: 2x pointer memory per node.
    """
    def __init__(self):
        self.head = None
        self.tail = None

    def add_at_tail(self, val):
        new_node = DoublyListNode(val)
        if not self.head:
            self.head = new_node
            self.tail = new_node
        else:
            self.tail.next = new_node
            new_node.prev = self.tail
            self.tail = new_node

    def remove_node(self, node):
        # O(1) -- the entire reason doubly linked lists exist
        if node.prev:
            node.prev.next = node.next
        else:
            self.head = node.next
        if node.next:
            node.next.prev = node.prev
        else:
            self.tail = node.prev
```
**Why this matters beyond the code**: this exact O(1)-removal trick (doubly linked list + a hash map of value→node) is the core mechanism behind the **LRU Cache** design problem — covered in full in `10_system_design_dsa`. Recognizing that connection now is worth more than memorizing either piece in isolation.

### The Dummy Head trick (a Level 0 concept that removes an entire category of bugs)
Linked list edge cases are annoying specifically because of **the head**: deleting the head, or inserting before the head, needs a special `if` that every other position doesn't need.

**Without a dummy head** (notice the special-cased first check):
```python
def delete_val(head, val):
    if head and head.val == val:
        return head.next  # special case for head
    curr = head
    while curr and curr.next:
        if curr.next.val == val:
            curr.next = curr.next.next
        else:
            curr = curr.next
    return head
```
**With a dummy head** — create one fake node in front of the real head, so "the head" is never a special case again:
```python
def delete_val(head, val):
    dummy = ListNode(0)
    dummy.next = head
    curr = dummy
    while curr.next:
        if curr.next.val == val:
            curr.next = curr.next.next
        else:
            curr = curr.next
    return dummy.next  # always returns the (possibly new) real head
```
**The rule**: any time a linked list problem might delete/insert/modify the head itself, start with a dummy node pointing at the real head. This single habit eliminates an entire class of off-by-one, "forgot the head case" bugs that show up constantly in Level 1–3 problems below.

---

## Level 1 — Easy

### Problem: Reverse a Linked List (LeetCode 206)
**Statement**: Given the head of a singly linked list, reverse it in place and return the new head.

**Approach — the only approach that matters here (iterative, O(n)/O(1))**: track three pointers — `prev`, `curr`, and a temporary `next_temp` to avoid losing the rest of the list the moment you rewire `curr.next`.
```python
def reverseList(head):
    prev = None
    curr = head
    while curr:
        next_temp = curr.next   # save BEFORE overwriting — the single rule that prevents every reversal bug
        curr.next = prev        # reverse the pointer
        prev = curr             # advance prev
        curr = next_temp        # advance curr
    return prev
```
**Complexity**: O(n) time, O(1) space. **Tough portion flagged**: "save `next` before you overwrite it" is not optional ceremony — skip it and you permanently lose the rest of the list the instant you rewrite `curr.next`, because nothing else still points to it.

**Dry run** on `1 -> 2 -> 3 -> None`:
```
prev=None, curr=1: next_temp=2, 1.next=None,  prev=1, curr=2
prev=1,    curr=2: next_temp=3, 2.next=1,     prev=2, curr=3
prev=2,    curr=3: next_temp=None, 3.next=2,  prev=3, curr=None (loop ends)
return prev -> 3 -> 2 -> 1 -> None
```

### Problem: Linked List Cycle (LeetCode 141)
**Statement**: Determine if a linked list has a cycle.

**Brute Force — O(n) time, O(n) space**: put every visited node into a hash set; if you ever see a node already in the set, there's a cycle.
```python
def hasCycle_brute(head):
    seen = set()
    curr = head
    while curr:
        if curr in seen:
            return True
        seen.add(curr)
        curr = curr.next
    return False
```

**Optimal — O(n) time, O(1) space (Floyd's Cycle Detection, "Fast & Slow Pointers")**: two pointers, `slow` moves one step, `fast` moves two. If there's a cycle, `fast` will eventually lap `slow` inside the loop and they'll meet; if `fast` reaches `None`, there's no cycle.
```python
def hasCycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
```
**Complexity**: O(n) time, O(1) space — the real win over the brute-force hash-set version, since it needs zero extra memory. **The insight**: if fast moves twice as fast as slow inside a cycle, the gap between them shrinks by exactly one node every step — so they are mathematically guaranteed to meet, not just likely to.

**Visual — the race**:
```
Start:            [1]->[2]->[3]->[4]->[5]->(back to 3)
                   ^
                  S,F

After 1 step:     slow at 2, fast at 3
After 2 steps:    slow at 3, fast at 5
After 3 steps:    slow at 4, fast at 3 (wrapped)
After 4 steps:    slow at 5, fast at 5  -> COLLISION -> cycle detected
```

### Problem: Find the Middle of a Linked List
**Statement**: Return the middle node of a singly linked list (if two middles, return the second one).

**Brute Force — O(n) time, O(1) space, two passes**: count the length first, then walk `length // 2` steps.
```python
def middleNode_brute(head):
    length = 0
    curr = head
    while curr:
        length += 1
        curr = curr.next
    curr = head
    for _ in range(length // 2):
        curr = curr.next
    return curr
```

**Optimal — O(n) time, O(1) space, one pass (Fast & Slow Pointers again)**: when `fast` reaches the end, `slow` is exactly at the middle — same two-pointer mechanism as cycle detection, applied to a different question.
```python
def middleNode_optimal(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow
```
**The insight, stated explicitly**: `fast` travels twice the distance of `slow` in the same number of steps — so the moment `fast` finishes the list, `slow` has covered exactly half of it. This is the same fast/slow mechanism as cycle detection — recognizing "two pointers moving at different speeds" as one reusable idea, not two separate tricks, is the actual skill.

---

## Level 2 — Medium

### Problem: Remove Nth Node From End of List
**Statement**: Given a list and an integer `n`, remove the n-th node from the end and return the head.

**Brute Force — O(n) time (two passes), O(1) space**: find the length, compute the position from the front, then delete using a dummy head.
```python
def removeNthFromEnd_brute(head, n):
    length = 0
    curr = head
    while curr:
        length += 1
        curr = curr.next

    dummy = ListNode(0)
    dummy.next = head
    curr = dummy
    steps_to_target = length - n   # convert "n-th from end" into "position from front"
    for _ in range(steps_to_target):
        curr = curr.next
    curr.next = curr.next.next
    return dummy.next
```

**Optimal — O(n) time, one pass, O(1) space (two pointers with a gap)**: move a `fast` pointer `n` steps ahead first, then move `slow` and `fast` together — when `fast` reaches the end, `slow` is exactly one node before the target.
```python
def removeNthFromEnd_optimal(head, n):
    dummy = ListNode(0)
    dummy.next = head
    slow = fast = dummy

    for _ in range(n):          # open up an n-node gap between fast and slow
        fast = fast.next

    while fast.next:            # move both until fast falls off the end
        slow = slow.next
        fast = fast.next

    slow.next = slow.next.next  # slow is now right before the node to delete
    return dummy.next
```
**Complexity**: O(n) time (single pass instead of two), O(1) space. **Why the dummy head is mandatory here**: the target node to remove could be the head itself (if `n == length`) — without the dummy, that's a separate special case; with it, it's automatically handled the same way as every other node.

### Problem: Merge Two Sorted Lists
**Statement**: Merge two sorted linked lists into one sorted list.

**Optimal — O(n + m) time, O(1) extra space (iterative, dummy head)**: repeatedly attach whichever current node is smaller.
```python
def mergeTwoLists(list1, list2):
    dummy = ListNode(0)
    tail = dummy
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next = list1
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    tail.next = list1 if list1 else list2   # attach whichever list still has leftover nodes
    return dummy.next
```
**Complexity**: O(n + m) time (each node visited once across both lists), O(1) extra space — this reuses existing nodes rather than allocating new ones, which is why it beats any approach that dumps both lists into an array, sorts, and rebuilds a list (that alternative would be O((n+m) log(n+m)) time and O(n+m) space — strictly worse on both counts, and worth naming explicitly as the "why not just sort" answer).

### Problem: Reorder List (interleave first half with reversed second half)
**Statement**: Given `L0 -> L1 -> ... -> Ln`, reorder to `L0 -> Ln -> L1 -> Ln-1 -> ...` in place.

**Optimal — O(n) time, O(1) space, a three-step combination of everything above**:
```python
def reorderList(head):
    # Step 1: find the middle (Level 1 technique)
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

    # Step 2: reverse the second half (Level 1 technique)
    prev, curr = None, slow
    while curr:
        next_temp = curr.next
        curr.next = prev
        prev = curr
        curr = next_temp
    second = prev

    # Step 3: merge the two halves alternately
    first = head
    while second.next:
        first.next, first = second, first.next
        second.next, second = first, second.next
    return head
```
**Why this problem belongs at Level 2, not Level 1**: it isn't a new technique — it's three Level 0/1 techniques (find-middle, reverse, merge-alternate) composed in sequence. Recognizing "I already know all three pieces, I just need to chain them" is exactly the skill Level 2 is meant to build.

---

## Level 3 — Hard

### Problem: Reverse Nodes in k-Group
**Statement**: Given a list, reverse every `k` nodes. If the remaining nodes are fewer than `k`, leave them as-is.

**Optimal — O(n) time, O(1) extra space**: reverse exactly `k` nodes at a time, reconnecting each reversed group to the next.
```python
def reverseKGroup(head, k):
    def get_kth_node(curr, k):
        while curr and k > 0:
            curr = curr.next
            k -= 1
        return curr

    dummy = ListNode(0)
    dummy.next = head
    group_prev = dummy

    while True:
        kth = get_kth_node(group_prev, k)
        if not kth:
            break   # fewer than k nodes remain -- leave them unreversed
        group_next = kth.next

        # reverse this group of k nodes
        prev, curr = group_next, group_prev.next
        while curr != group_next:
            next_temp = curr.next
            curr.next = prev
            prev = curr
            curr = next_temp

        # reconnect: group_prev must now point to the new head of this reversed group (old kth)
        temp = group_prev.next
        group_prev.next = kth
        group_prev = temp

    return dummy.next
```
**Complexity**: O(n) time (every node is visited a constant number of times), O(1) extra space. **Tough portion flagged**: this problem is hard specifically because it requires correctly tracking *four* references simultaneously (`group_prev`, the group's start, the group's end/`kth`, and `group_next`) — most bugs here come from reconnecting the group to its neighbors in the wrong order. Draw the four-pointer picture on paper before coding; this is not a problem to solve directly in your head.

### Problem: Merge k Sorted Lists
**Statement**: Merge `k` sorted linked lists into one sorted list.

**Brute Force — O(N log N) time, O(N) space** (N = total nodes across all lists): dump every value into one array, sort it, rebuild a list.
```python
def mergeKLists_brute(lists):
    values = []
    for head in lists:
        curr = head
        while curr:
            values.append(curr.val)
            curr = curr.next
    values.sort()

    dummy = ListNode(0)
    tail = dummy
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next
```

**Better — O(N × k) time, O(1) extra space**: repeatedly apply the two-list merge from Level 2, one list at a time.
```python
def mergeKLists_better(lists):
    if not lists:
        return None
    result = lists[0]
    for i in range(1, len(lists)):
        result = mergeTwoLists(result, lists[i])   # reuse the Level 2 solution
    return result
```
**Why this is only "Better," not optimal**: merging one more list into the growing result costs up to O(N) each time, and you do this `k` times — O(N × k) total, which is worse than necessary when `k` is large.

**Optimal — O(N log k) time, O(k) space, using a min-heap**: at every step, only compare the *current front* of each of the `k` lists — a min-heap gives you the smallest of those `k` fronts in O(log k) instead of comparing all `k` linearly.
```python
import heapq

def mergeKLists_optimal(lists):
    heap = []
    for i, head in enumerate(lists):
        if head:
            heapq.heappush(heap, (head.val, i, head))   # tie-break on index i to avoid comparing ListNodes directly

    dummy = ListNode(0)
    tail = dummy
    while heap:
        val, i, node = heapq.heappop(heap)
        tail.next = node
        tail = tail.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next
```
**Complexity**: O(N log k) time (each of the N nodes is pushed/popped once, each heap operation is O(log k)), O(k) space for the heap. **The insight that separates Better from Optimal**: you never need to compare all `k` list-fronts against each other from scratch on every step — a heap remembers the ordering and only costs O(log k) to update after removing the minimum, instead of O(k) to re-scan all fronts every time.

---

## Real-World Application: Workflow Step Chains

**Scenario**: A CI/CD pipeline or an approval workflow, where each step depends on the previous one: `Build -> Test -> Deploy -> Notify`. This is structurally a singly linked list.
```python
class WorkflowStep:
    def __init__(self, name, command):
        self.name = name
        self.command = command
        self.next_step = None

    def execute(self):
        print(f"Running {self.name}: {self.command}")
        if self.next_step:
            self.next_step.execute()
```
**Why a linked list and not an array here**: dynamic insertion. A "Security Scan" step can be inserted between "Test" and "Deploy" without rewriting or shifting anything else — exactly the O(1) middle-insertion advantage from the Level 0 comparison table, now applied to a real system.
```python
def insert_step_after(prev_step, new_step):
    new_step.next_step = prev_step.next_step
    prev_step.next_step = new_step
```

---

## Reference Data (Memory Model Snapshots)

Illustrating the Level 0 point about scattered memory addresses, concretely:
```json
{
    "head": {
        "address": "0x100",
        "val": 1,
        "next": {
            "address": "0x500",
            "val": 2,
            "next": {
                "address": "0x200",
                "val": 3,
                "next": null
            }
        }
    },
    "note": "Nodes are SCATTERED in heap memory (0x100, 0x500, 0x200). Unlike arrays, they are NOT contiguous."
}
```

---

## Summary Table

| Problem | Level | Brute | Optimal | Core technique |
|---|---|---|---|---|
| Reverse Linked List | 1 | — | O(n) / O(1) | Three-pointer iterative reversal |
| Linked List Cycle | 1 | O(n) / O(n) | O(n) / O(1) | Fast & slow pointers |
| Find Middle Node | 1 | O(n) / O(1), 2 passes | O(n) / O(1), 1 pass | Fast & slow pointers |
| Remove Nth From End | 2 | O(n) / O(1), 2 passes | O(n) / O(1), 1 pass | Two pointers with an n-gap |
| Merge Two Sorted Lists | 2 | — | O(n+m) / O(1) | Dummy head + pick-smaller |
| Reorder List | 2 | — | O(n) / O(1) | Find-middle + reverse + merge, composed |
| Reverse Nodes in k-Group | 3 | — | O(n) / O(1) | Four-pointer group reversal |
| Merge k Sorted Lists | 3 | O(N log N) / O(N) | O(N log k) / O(k) | Min-heap over k list-fronts |
