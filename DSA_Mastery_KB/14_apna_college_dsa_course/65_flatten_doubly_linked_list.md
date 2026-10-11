# Flatten a Doubly Linked List

Simple words, step by step.

## The question
Each node in a doubly linked list has `next`, `prev`, AND a `child` pointer, which may point to a **separate, independent doubly linked list** (which can itself have children, nested arbitrarily deep). Flatten the whole structure into a single-level doubly linked list, where a node's children are spliced in right after it, before continuing to its original `next`.

```
Before:
1 - 2 - 3 - 4 - 5
        |
        7 - 8 - 9
            |
            11 - 12

After flattening:
1 - 2 - 3 - 7 - 8 - 11 - 12 - 9 - 4 - 5
```

## The recursive idea
When you encounter a node with a `child`, the child list needs to be fully flattened and spliced in **before** continuing to the original `next` — this is naturally recursive: "flatten the child, splice it in, then flatten the rest."

```python
def flatten(head):
    def flatten_dfs(node):
        curr = node
        last = node            # tracks the tail of the flattened segment built so far
        while curr:
            next_node = curr.next
            if curr.child:
                child_tail = flatten_dfs(curr.child)    # recursively flatten the child list first

                curr.next = curr.child                    # splice: link curr -> child
                curr.child.prev = curr
                curr.child = None                          # IMPORTANT: clear the child pointer

                if next_node:
                    child_tail.next = next_node             # reconnect the child's tail to the original next
                    next_node.prev = child_tail

                last = child_tail
                curr = next_node
            else:
                last = curr
                curr = curr.next
        return last

    if head:
        flatten_dfs(head)
    return head
```
```javascript
function flatten(head) {
    function flattenDFS(node) {
        let curr = node;
        let last = node;            // tracks the tail of the flattened segment built so far
        while (curr) {
            const nextNode = curr.next;
            if (curr.child) {
                const childTail = flattenDFS(curr.child);   // recursively flatten the child list first

                curr.next = curr.child;                       // splice: link curr -> child
                curr.child.prev = curr;
                curr.child = null;                             // IMPORTANT: clear the child pointer

                if (nextNode) {
                    childTail.next = nextNode;                  // reconnect child's tail to original next
                    nextNode.prev = childTail;
                }

                last = childTail;
                curr = nextNode;
            } else {
                last = curr;
                curr = curr.next;
            }
        }
        return last;
    }

    if (head) {
        flattenDFS(head);
    }
    return head;
}
```
**Speed**: O(n) time (every node, across all levels of nesting, is visited exactly once), O(d) extra space for the recursion stack, where `d` is the maximum nesting depth of child lists.

## Rules to remember
- **`curr.child = None` after splicing it in is not optional.** If left set, the structure technically still has a non-null `child` pointer even though it's now logically part of the main flattened chain — this breaks the "flattened" guarantee and can cause an infinite loop or incorrect structure if the function (or any other code) is ever run again on the "flattened" result.
- The `next_node` (original next, saved **before** splicing) must be reconnected to the **tail of the flattened child**, not to `curr` directly — forgetting this drops the rest of the original list entirely after flattening the first child encountered.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Iterative version using an explicit stack (avoiding recursion's O(d) stack usage concern)
```python
def flatten_iterative(head):
    if not head:
        return head
    stack = []
    curr = head
    while curr:
        if curr.child:
            if curr.next:
                stack.append(curr.next)    # save where to come back to later
            curr.next = curr.child
            curr.child.prev = curr
            curr.child = None
        if not curr.next and stack:
            next_node = stack.pop()         # resume the saved "come back to" point
            curr.next = next_node
            next_node.prev = curr
        curr = curr.next
    return head
```
**The trap**: the stack here plays the exact same role recursion's call stack would — "remember where to return to after finishing this branch." Recognizing that an iterative-with-explicit-stack solution is just making recursion's implicit mechanism explicit (rather than a totally different algorithm) is a valuable, transferable insight that applies to converting many recursive tree/list algorithms into iterative ones.

### Twist 2: What if `child` pointers can form a CYCLE (a bug/edge case to defend against)?
If child lists aren't guaranteed acyclic (a malformed input), the recursive solution above would recurse infinitely. A defensive version tracks visited nodes:
```python
def flatten_safe(head):
    visited = set()
    def flatten_dfs(node):
        curr = node
        last = node
        while curr:
            if id(curr) in visited:
                raise ValueError("Cycle detected in child structure -- cannot flatten")
            visited.add(id(curr))
            # ... rest of the logic as before
            curr = curr.next
        return last
    if head:
        flatten_dfs(head)
    return head
```
**The trap**: production code should rarely trust that "well-formed input" guarantees actually hold — this twist exists specifically to test whether a candidate assumes the happy path unconditionally, or thinks about what happens when an assumption is violated.

## Interview Q&A

**Q1: Why is this problem naturally recursive, rather than a single flat loop?**
Because the data structure itself is recursive — a child list can contain nodes that themselves have children, to arbitrary depth. "Flatten this list" genuinely means "flatten this list, and wherever you find a child, flatten that first" — the problem's definition directly mirrors a recursive solution shape, the same way tree traversal problems do.

**Q2: Why must `curr.child` be set to `None` after splicing it into the main chain?**
Because the `child` pointer's meaning is "this node has a separate, nested list hanging off it." Once that nested list has been spliced directly into the main `next` chain, the node no longer has a *separate* child structure — leaving `child` pointing at the same nodes now reachable via `next` would make the data structure inconsistent with the "flattened" result it's supposed to represent, and could cause bugs in any code that later checks `if node.child`.

**Q3: What is the time and space complexity, and does the space complexity change between the recursive and iterative versions?**
Time is O(n) for both versions — every node across every level of nesting is visited exactly once, regardless of whether recursion or an explicit stack is used. Space differs only in *where* the "remember where to come back to" information is stored: the recursive version uses the call stack implicitly (O(d) where d is the maximum nesting depth), while the iterative version uses an explicit stack holding the same kind of information — both are O(d) in the worst case, just with the bookkeeping made explicit versus implicit.
