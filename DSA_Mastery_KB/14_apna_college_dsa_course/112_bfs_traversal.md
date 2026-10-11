# BFS Traversal (Graphs)

Simple words, step by step.

## The idea
Exactly the same level-order/BFS idea from binary trees (file 85), now generalized: visit a starting node, then all its direct neighbors, then all of THEIR unvisited neighbors, and so on — using a queue, and now **requiring an explicit `visited` set** (unlike trees, since graphs can have cycles, file 111's closing Q&A).

```python
from collections import deque

def bfs(start, graph):
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)        # mark visited at ENQUEUE time, not dequeue time -- see Rules below
                queue.append(neighbor)
    return order
```
```javascript
function bfs(start, graph) {
    const visited = new Set([start]);
    const queue = [start];
    const order = [];
    let head = 0;
    while (head < queue.length) {
        const node = queue[head++];
        order.push(node);
        for (const neighbor of graph.get(node)) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);           // mark visited at ENQUEUE time, not dequeue time -- see Rules below
                queue.push(neighbor);
            }
        }
    }
    return order;
}
```
**Speed**: O(V + E) — every node is visited once (O(V)), and every edge is examined once from each endpoint that processes it (O(E) total across all nodes).

## Full traversal over a possibly-disconnected graph
```python
def bfs_full_graph(n, graph):
    visited = set()
    all_components_order = []
    for start in range(n):
        if start not in visited:
            visited.add(start)
            queue = deque([start])
            component_order = []
            while queue:
                node = queue.popleft()
                component_order.append(node)
                for neighbor in graph[node]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
            all_components_order.append(component_order)
    return all_components_order
```
**This directly reuses file 111 Twist 2's "loop over all nodes, skip visited ones" pattern** — essential for any graph not guaranteed to be fully connected.

## Rules to remember
- **Mark a node as visited the moment it's ENQUEUED, not when it's dequeued/processed.** This is the single most common BFS bug: if marking happens at dequeue time instead, the same node can be enqueued multiple times (once by each of several different neighbors that discover it before any of them get dequeued and processed), wasting time and potentially producing incorrect results in problems that count distance/levels.
- BFS explores "outward in rings" — this property specifically makes it the correct tool whenever a problem needs the **shortest path** in an **unweighted** graph (since the first time BFS reaches a node is guaranteed to be via the shortest possible number of edges) — a crucial distinction that DFS does NOT share (file 113).

## Twisted Tricky Examples (with Solutions)

### Twist 1: Find the SHORTEST PATH (number of edges) from a start node to every other node
```python
def bfs_shortest_distances(start, graph, n):
    distances = [-1] * n
    distances[start] = 0
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if distances[neighbor] == -1:            # unvisited (using -1 as the "not yet visited" sentinel)
                distances[neighbor] = distances[node] + 1
                queue.append(neighbor)
    return distances
```
**The trap**: this is barely a trap at all — it's the single most important and common BFS application, and the entire fix compared to plain traversal is simply tracking a `distances` array instead of (or alongside) a `visited` set, where `distances[neighbor] = distances[node] + 1` is set at the exact moment of first discovery; recognizing "shortest path in unweighted graph = BFS" immediately, without hesitation, is a baseline expectation at this stage of interview prep.

### Twist 2: BFS where edges have different "costs" to traverse, but all costs are either 0 or 1 (0-1 BFS)
```python
from collections import deque

def zero_one_bfs(start, graph, n):          # graph[node] = list of (neighbor, weight) where weight is 0 or 1
    distances = [float('inf')] * n
    distances[start] = 0
    dq = deque([start])
    while dq:
        node = dq.popleft()
        for neighbor, weight in graph[node]:
            new_dist = distances[node] + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                if weight == 0:
                    dq.appendleft(neighbor)          # 0-weight edge -- push to FRONT (no additional "distance ring" crossed)
                else:
                    dq.append(neighbor)                # 1-weight edge -- push to BACK (normal BFS behavior)
    return distances
```
**The trap**: standard BFS assumes every edge has the same implicit "cost" of 1 — the moment some edges might cost 0 (free, instant travel) while others cost 1, a plain queue is no longer sufficient to guarantee the first-discovered distance is the true shortest, since a longer PATH with more 0-cost edges could still arrive with a smaller total distance than a shorter path using 1-cost edges that happened to be processed first. Using a **deque** and pushing 0-weight discoveries to the front (so they're processed before anything currently queued) while pushing 1-weight discoveries to the back preserves the "process things in true distance order" guarantee without needing a full priority queue (Dijkstra's, file 124) — this specific variant is called "0-1 BFS."

## Interview Q&A

**Q1: Why must a node be marked visited at the moment it's enqueued, rather than when it's dequeued and processed?**
If marking is delayed until a node is dequeued, multiple different nodes already in the queue could each separately discover the same unvisited neighbor before any of them get processed — since none of them have marked it visited yet at discovery time, the same neighbor gets enqueued multiple times redundantly. This wastes time reprocessing the same node repeatedly, and in problems tracking distances or levels, can cause a node's recorded distance to be incorrectly overwritten if processed out of the intended order, rather than being fixed correctly the first (and only) time it should have been discovered.

**Q2: Why does BFS correctly find the shortest path in an unweighted graph, while DFS does not share this guarantee?**
BFS explores the graph in strictly expanding "rings" outward from the start node — processing all nodes at distance 1 before any node at distance 2, all nodes at distance 2 before any at distance 3, and so on. This means the very first time BFS discovers any given node is guaranteed to be via the shortest possible number of edges from the start. DFS, by contrast, dives as deep as possible down one path before backtracking — it has no such "distance ring" discipline, so the first time DFS reaches a node could easily be via a much longer path than the true shortest one, offering no shortest-path guarantee at all.

**Q3: In the 0-1 BFS variant, why does pushing a 0-weight discovery to the FRONT of the deque (rather than the back, as in standard BFS) preserve the shortest-path guarantee?**
Standard BFS's correctness relies on processing nodes in strict, non-decreasing order of their actual distance from the start — a plain queue achieves this naturally because every edge has the same cost, so "enqueued earlier" always correlates with "smaller distance." Once some edges cost 0, a node reached via a 0-cost edge has the SAME distance as the node that just discovered it — processing it immediately (by placing it at the front) rather than waiting behind other already-queued 1-cost-away nodes preserves the correct non-decreasing distance order of processing, which is exactly what guarantees each node's distance is finalized correctly the first time it's processed, without needing the more expensive general-purpose priority queue that Dijkstra's algorithm would otherwise require for graphs with arbitrary edge weights.
