# Topological Sort — Kahn's Algorithm (BFS-based)

Simple words, step by step.

## The idea (already used in files 120-121, now the full standalone treatment)
Instead of DFS's postorder-then-reverse trick (file 119), Kahn's Algorithm builds the topological order directly, forward, using BFS: repeatedly find and remove nodes that currently have **in-degree 0** (no remaining unprocessed prerequisites), since those are always safe to place next in the order.

```python
from collections import deque

def kahns_topological_sort(n, edges):
    graph = [[] for _ in range(n)]
    in_degree = [0] * n
    for u, v in edges:                  # u -> v
        graph[u].append(v)
        in_degree[v] += 1

    queue = deque([node for node in range(n) if in_degree[node] == 0])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1          # one prerequisite of `neighbor` just got satisfied
            if in_degree[neighbor] == 0:
                queue.append(neighbor)           # neighbor now has ALL prerequisites satisfied -- safe to process

    if len(order) != n:
        return []                          # couldn't process all nodes -- the graph has a cycle
    return order
```
```javascript
function kahnsTopologicalSort(n, edges) {
    const graph = Array.from({ length: n }, () => []);
    const inDegree = new Array(n).fill(0);
    for (const [u, v] of edges) {              // u -> v
        graph[u].push(v);
        inDegree[v] += 1;
    }

    const queue = [];
    for (let node = 0; node < n; node++) {
        if (inDegree[node] === 0) queue.push(node);
    }

    const order = [];
    let head = 0;
    while (head < queue.length) {
        const node = queue[head++];
        order.push(node);
        for (const neighbor of graph[node]) {
            inDegree[neighbor] -= 1;               // one prerequisite of `neighbor` just got satisfied
            if (inDegree[neighbor] === 0) {
                queue.push(neighbor);                 // neighbor now has ALL prerequisites satisfied -- safe to process
            }
        }
    }

    if (order.length !== n) return [];           // couldn't process all nodes -- the graph has a cycle
    return order;
}
```
**Speed**: O(V + E) — every node enqueued/dequeued once, every edge examined once (when decrementing the target's in-degree).

## Why `in_degree 0` is exactly the right condition
A node's in-degree counts how many unprocessed prerequisites it still has. In-degree 0 means every single prerequisite has already been placed in the order — meaning this node is now safe to place next, since nothing it depends on is still pending. This directly mirrors the "find eligible tasks" intuition from the Course Schedule framing (files 120-121).

## Rules to remember
- **This is a direct generalization of BFS (file 112)**, but instead of a `visited` set controlling what gets enqueued, an `in_degree` counter does — a node is only "ready" to enqueue once this counter naturally reaches zero through its neighbors' processing, rather than being marked visited at discovery time as in plain BFS.
- **`len(order) != n` is the cycle-detection mechanism — understand WHY, don't just memorize it.** Nodes trapped in a cycle can never reach in-degree 0 (their prerequisites circularly include each other), so they simply never get enqueued or counted — the final length check catches this indirectly, without needing any separate `in_path`-style ancestor tracking the DFS version requires.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Produce the LEXICOGRAPHICALLY SMALLEST valid topological order
```python
import heapq

def kahns_lexicographically_smallest(n, edges):
    graph = [[] for _ in range(n)]
    in_degree = [0] * n
    for u, v in edges:
        graph[u].append(v)
        in_degree[v] += 1

    heap = [node for node in range(n) if in_degree[node] == 0]
    heapq.heapify(heap)                    # MIN-HEAP instead of a plain queue
    order = []
    while heap:
        node = heapq.heappop(heap)           # always pick the SMALLEST currently-eligible node
        order.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                heapq.heappush(heap, neighbor)

    return order if len(order) == n else []
```
**The trap**: this is exactly the natural extension hinted at in file 119's closing Q&A — simply swapping the plain queue (FIFO, no ordering guarantee among multiple simultaneously-eligible nodes) for a min-heap (always extracts the smallest eligible node first) directly produces the lexicographically smallest valid ordering, with no other change to the algorithm's logic needed; this swap is NOT something the DFS-based topological sort can replicate nearly as cleanly, since DFS's ordering is governed by recursive call structure, not by a simple, swappable "which eligible item to pick next" data structure.

### Twist 2: Determine if the topological order is UNIQUE (only one valid ordering exists for this DAG)
**The trap**: a DAG has a unique topological order if and only if, at every single step of Kahn's Algorithm, the queue/heap contains EXACTLY ONE eligible node at a time (never two or more simultaneously-eligible choices) — if at any point multiple nodes have in-degree 0 simultaneously, there are at least two different valid orderings possible (since either could legitimately be placed first relative to the other), proving non-uniqueness; checking `len(queue) == 1` at every iteration of the BFS loop is a simple, direct way to verify this uniqueness condition as a byproduct of running the algorithm anyway.

## Interview Q&A

**Q1: Why does Kahn's Algorithm's in-degree-based approach naturally and implicitly detect cycles, without any explicit ancestor-tracking mechanism like the DFS version's `in_path`?**
A node's in-degree can only reach zero once every one of its prerequisites has been successfully processed and removed from consideration — but within a cycle, every node's prerequisites circularly include other nodes from that same cycle, meaning none of them can ever be processed first to unblock the others. This creates a permanent deadlock specifically among the cyclic nodes: their in-degrees get stuck above zero forever, so they never get enqueued and never get counted in the final order. Simply checking whether the total count of successfully processed nodes matches the total node count is therefore sufficient to detect this "some nodes were permanently blocked" condition, without needing to explicitly track or compare against ancestor relationships the way DFS's approach does.

**Q2: Why does swapping a plain queue for a min-heap in Kahn's Algorithm correctly produce the lexicographically smallest topological ordering, and why doesn't a similar trick work as cleanly for DFS-based topological sort?**
Kahn's Algorithm, at any point where multiple nodes simultaneously have in-degree zero, has complete freedom to choose any of them next without violating correctness — using a min-heap specifically ensures that whenever there's a choice among multiple eligible nodes, the smallest one is always chosen, directly producing the lexicographically smallest valid sequence by construction. DFS-based topological sort, by contrast, doesn't have this same kind of clean, swappable "choose among currently eligible options" decision point — its ordering emerges from the structure of recursive calls and which neighbor happens to be visited first in the adjacency list, which doesn't offer an equally direct, simple lever to pull for controlling lexicographic ordering of the final result.

**Q3: How would you determine whether a given DAG has a UNIQUE topological ordering, using Kahn's Algorithm as the underlying mechanism?**
Run Kahn's Algorithm as normal, but at every single step, check how many nodes are currently eligible (in-degree zero) at once — if at any point there are two or more eligible nodes simultaneously, that means there's a genuine choice to be made about which one to process first, and either choice would be equally valid, which directly implies at least two different valid topological orderings exist (non-unique). Only if, at every single step throughout the entire algorithm, there is EXACTLY ONE eligible node to choose from (never more) can the resulting order be guaranteed as the one and only valid topological ordering for that specific DAG.
