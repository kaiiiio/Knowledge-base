# Copy List with Random Pointer

Simple words, step by step.

## The question
Each node in a linked list has a `next` pointer (normal) AND a `random` pointer, which can point to **any** node in the list (or `None`). Create a complete, independent **deep copy** of this list — a new list where every node is brand new, but the `next` and `random` pointers mirror the original's structure exactly.

## Why this is harder than a normal copy
A normal linked list copy just needs to walk `next` pointers once, creating a new node for each. But the `random` pointer can point to **any node, including one that hasn't been created yet** (if it points forward) — so when you're copying node 3 and its `random` points to node 7, node 7's copy might not exist yet.

## Brute Force — Hash Map (old node → new node)
```python
def copy_random_list_brute(head):
    if not head:
        return None
    old_to_new = {}

    # Pass 1: create all new nodes (without wiring pointers yet), map old -> new
    curr = head
    while curr:
        old_to_new[curr] = Node(curr.val)
        curr = curr.next

    # Pass 2: wire up next and random using the map
    curr = head
    while curr:
        old_to_new[curr].next = old_to_new.get(curr.next)
        old_to_new[curr].random = old_to_new.get(curr.random)
        curr = curr.next

    return old_to_new[head]
```
```javascript
function copyRandomListBrute(head) {
    if (!head) return null;
    const oldToNew = new Map();

    // Pass 1: create all new nodes, map old -> new
    let curr = head;
    while (curr) {
        oldToNew.set(curr, new Node(curr.val));
        curr = curr.next;
    }

    // Pass 2: wire up next and random using the map
    curr = head;
    while (curr) {
        oldToNew.get(curr).next = oldToNew.get(curr.next) || null;
        oldToNew.get(curr).random = oldToNew.get(curr.random) || null;
        curr = curr.next;
    }

    return oldToNew.get(head);
}
```
**Speed**: O(n) time, O(n) extra space for the hash map. This is a perfectly good, acceptable solution — but there's a clever O(1)-extra-space trick worth knowing.

## Optimal — Interweaving Trick (O(1) extra space)
Instead of a hash map, **interleave** each new copied node directly after its original: `A -> A' -> B -> B' -> C -> C'`. Now, a copied node's `random` pointer can be found via `original.random.next` (since every original's copy sits immediately after it). Finally, un-interleave to separate the two lists.
```python
def copy_random_list_optimal(head):
    if not head:
        return None

    # Step 1: interleave -- insert a copy of each node right after the original
    curr = head
    while curr:
        copy = Node(curr.val)
        copy.next = curr.next
        curr.next = copy
        curr = copy.next

    # Step 2: wire up random pointers using the interleaved structure
    curr = head
    while curr:
        if curr.random:
            curr.next.random = curr.random.next   # copy's random = original's random's COPY (which sits right after it)
        curr = curr.next.next

    # Step 3: un-interleave -- separate the two lists back apart
    curr = head
    copy_head = head.next
    while curr:
        copy = curr.next
        curr.next = copy.next
        copy.next = copy.next.next if copy.next else None
        curr = curr.next

    return copy_head
```
```javascript
function copyRandomListOptimal(head) {
    if (!head) return null;

    // Step 1: interleave -- insert a copy of each node right after the original
    let curr = head;
    while (curr) {
        const copy = new Node(curr.val);
        copy.next = curr.next;
        curr.next = copy;
        curr = copy.next;
    }

    // Step 2: wire up random pointers using the interleaved structure
    curr = head;
    while (curr) {
        if (curr.random) {
            curr.next.random = curr.random.next;   // copy's random = original's random's COPY
        }
        curr = curr.next.next;
    }

    // Step 3: un-interleave -- separate the two lists back apart
    curr = head;
    const copyHead = head.next;
    while (curr) {
        const copy = curr.next;
        curr.next = copy.next;
        copy.next = copy.next ? copy.next.next : null;
        curr = curr.next;
    }

    return copyHead;
}
```
**Speed**: O(n) time (three passes, each O(n)), **O(1) extra space** — this is the real win over the hash-map version, which needed O(n) space.

**Watching the key insight work**: after interleaving `A -> A' -> B -> B' -> C -> C'`, if `A.random` points to `C`, then `A'.random` should point to `C'`. Since `C'` is always exactly `C.next` (by construction of the interleaving), the line `curr.next.random = curr.random.next` directly computes this — no hash map lookup needed, the structure itself encodes the mapping.

## Rules to remember
- The hash-map version is simpler to write correctly under interview pressure and is a completely acceptable first answer — the interleaving trick is the "can you push further?" follow-up, not a requirement to pass.
- The un-interleaving step (Step 3) must be done carefully to avoid accidentally breaking the `next` chain of the ORIGINAL list while separating it from the copy — this is the step where most bugs in the optimal solution occur.

## Interview Q&A

**Q1: Why does `curr.next.random = curr.random.next` correctly set up the copied node's random pointer?**
After interleaving, every original node's copy sits immediately after it in the combined list (`curr.next` is always `curr`'s copy). So if `curr.random` points to some original node `X`, then `X`'s copy is `X.next`. Setting `curr.next.random` (the copy's random pointer) to `curr.random.next` (the target's copy) directly wires the relationship, using the interleaved structure as an implicit lookup table instead of an explicit hash map.

**Q2: What's the risk if a node's `random` pointer is `None`, and how does the code handle it?**
The code explicitly checks `if curr.random:` before trying to access `curr.random.next` — without this guard, accessing `.next` on a `None` random pointer would crash. This is a classic "don't forget the null case" trap specific to this problem, since `random` (unlike `next`) is expected to commonly be `None` for many nodes.

**Q3: Why is the interleaving approach considered "optimal" if it still takes O(n) time, same as the hash map version?**
"Optimal" here refers to **space**, not time — both approaches are O(n) time, but the interleaving trick achieves O(1) *extra* space (beyond the output itself), compared to the hash map approach's O(n) extra space for storing the old-to-new mapping. This distinction (same time complexity, better space complexity) is a common and important thing to call out explicitly when discussing why one correct solution is preferred over another equally-correct one.
