# Prim's Algorithm (Minimum Spanning Tree)

Simple words, step by step.

## What is a Minimum Spanning Tree (MST)?
Given a connected, undirected, weighted graph, a **spanning tree** is a subset of edges that connects all vertices together with no cycles (exactly `V-1` edges, for `V` vertices — recall file 111's "a tree is a connected, acyclic graph" framing). A **Minimum** Spanning Tree is the spanning tree whose total edge weight is as small as possible.

## Real-world framing
Think of connecting a set of cities with the cheapest possible total length of road, such that every city is reachable from every other — no need for redundant extra roads (which would create cycles and waste money), just enough connections to link everything at minimum total cost.

## The idea: grow the tree one edge at a time, always adding the cheapest edge that extends the tree to a NEW vertex
This is strikingly similar to Dijkstra's Algorithm's mechanics (file 124) — a min-heap, greedily picking the smallest available option — but the quantity being minimized is different: Dijkstra's tracks "distance from source," while Prim's tracks "cheapest edge connecting the growing tree to a new, not-yet-included vertex."

```python
import heapq

def prims_mst(n, graph):          # graph[u] = list of (v, weight)
    visited = [False] * n
    min_heap = [(0, 0)]              # (edge_weight, node) -- start arbitrarily from node 0
    total_weight = 0
    edges_used = 0

    while min_heap and edges_used < n:
        weight, node = heapq.heappop(min_heap)
        if visited[node]:
            continue                     # STALE entry -- this node was already added to the tree via a cheaper edge
        visited[node] = True
        total_weight += weight
        edges_used += 1
        for neighbor, edge_weight in graph[node]:
            if not visited[neighbor]:
                heapq.heappush(min_heap, (edge_weight, neighbor))

    return total_weight if edges_used == n else -1     # -1 if the graph wasn't actually fully connected
```
```javascript
function primsMST(n, graph) {           // graph[u] = list of [v, weight]
    const visited = new Array(n).fill(false);
    const heap = new MinHeap();              // reusing the MinHeap class from file 124
    heap.push([0, 0]);                         // start arbitrarily from node 0
    let totalWeight = 0;
    let edgesUsed = 0;

    while (heap.size > 0 && edgesUsed < n) {
        const [weight, node] = heap.pop();
        if (visited[node]) continue;              // STALE entry -- already added via a cheaper edge
        visited[node] = true;
        totalWeight += weight;
        edgesUsed += 1;
        for (const [neighbor, edgeWeight] of graph[node]) {
            if (!visited[neighbor]) {
                heap.push([edgeWeight, neighbor]);
            }
        }
    }

    return edgesUsed === n ? totalWeight : -1;      // -1 if the graph wasn't actually fully connected
}
```
**Speed**: O((V + E) log V) — structurally identical complexity analysis to Dijkstra's, for the same underlying reason (heap-based greedy expansion).

## Why this is NOT the same as Dijkstra's, despite looking almost identical in code
Dijkstra's compares **cumulative distance from the source** (`dist + weight`) when deciding whether to push a neighbor. Prim's compares only the **single edge weight** connecting the growing tree to that neighbor, completely ignoring how "far" that neighbor is from the original starting node overall. This distinction matters: Prim's doesn't care about total path cost from a fixed origin at all — it only cares about greedily finding the cheapest way to add one more vertex to the tree, regardless of overall distance.

## Rules to remember
- **Prim's and Dijkstra's share the exact same code skeleton (min-heap, visited array, stale-entry skip) but optimize fundamentally different quantities** — mixing up which value to push onto the heap (cumulative distance vs. single edge weight) is the single most common way to accidentally turn one algorithm into a broken, nonsensical hybrid of the other; always be explicit about which quantity is actually being greedily minimized.
- The starting node choice (`node 0` above) is arbitrary and doesn't affect the FINAL MST's total weight — any starting node produces a valid MST with the same minimum total weight (though possibly a structurally different tree, if multiple equally-minimal MSTs exist for the given graph).

## Twisted Tricky Examples (with Solutions)

### Twist 1: Return the ACTUAL edges used in the MST, not just the total weight
```python
def prims_mst_with_edges(n, graph):
    visited = [False] * n
    min_heap = [(0, 0, -1)]              # (edge_weight, node, parent_node)
    mst_edges = []

    while min_heap:
        weight, node, parent = heapq.heappop(min_heap)
        if visited[node]:
            continue
        visited[node] = True
        if parent != -1:
            mst_edges.append((parent, node, weight))
        for neighbor, edge_weight in graph[node]:
            if not visited[neighbor]:
                heapq.heappush(min_heap, (edge_weight, neighbor, node))

    return mst_edges
```
**The trap**: tracking the actual edges requires carrying along the "parent" (which node this edge connects FROM) alongside each heap entry, recorded only at the moment a node is actually accepted into the tree (not at push time, since a node can be pushed multiple times via different candidate edges before the cheapest one is actually popped and accepted) — a minor but easy-to-get-subtly-wrong extension of the base algorithm.

### Twist 2: The graph is DISCONNECTED — what does Prim's Algorithm produce?
**The trap**: Prim's Algorithm, as a single continuous run starting from one node, can only ever discover and connect the single connected component that the starting node belongs to — if the graph is disconnected, it's fundamentally impossible to build a SINGLE spanning tree covering all vertices at all (a disconnected graph has no spanning tree by definition, only a "spanning FOREST," one MST per connected component); the `edges_used == n` check in the base implementation is exactly how this failure case gets detected — if fewer than `n` vertices were ever reached, the graph wasn't fully connected to begin with, and the function should signal this (e.g., returning -1) rather than silently returning a partial, incomplete result as if it were a full MST.

## Interview Q&A

**Q1: Prim's Algorithm and Dijkstra's Algorithm have nearly identical code structure (min-heap, visited array, stale-entry handling) — what is the one critical difference in what value gets compared/pushed, and why does it matter?**
Dijkstra's pushes and compares CUMULATIVE distance from a fixed source node (`current_distance + edge_weight`), since it's answering "what's the cheapest total path from the source to each node." Prim's pushes and compares only the SINGLE edge weight connecting the current growing tree to a candidate new vertex, completely ignoring any notion of cumulative distance from a fixed starting point, since it's answering a fundamentally different question: "what's the cheapest way to extend my current tree to include one more vertex, regardless of how that vertex relates to the original starting point." Confusing these two — for instance, accidentally accumulating distances in a Prim's implementation — would silently produce an incorrect result that doesn't actually minimize total spanning tree weight, despite looking almost identical to a correct implementation.

**Q2: Why doesn't the specific choice of starting vertex affect the total weight of the resulting Minimum Spanning Tree, even though it clearly can affect the EXACT set of edges chosen?**
The Minimum Spanning Tree's total weight is a property of the GRAPH itself — it represents the objectively minimum possible total cost of any spanning tree for that graph, a value determined entirely by the graph's structure and edge weights, independent of any arbitrary algorithmic starting point. While the starting vertex can influence WHICH specific edges end up selected (especially when multiple different edges happen to tie at the same minimal weight, creating multiple equally-valid MSTs with the same total weight but different edge sets), the greedy strategy itself is provably guaranteed (via the "cut property" of MSTs, a standard graph theory result) to always arrive at SOME valid minimum-total-weight spanning tree, regardless of which vertex the growth process happens to begin from.

**Q3: Why does Prim's Algorithm fail to produce a valid complete MST when run on a disconnected graph, and how does the algorithm detect and report this situation?**
A disconnected graph, by definition, has at least two groups of vertices with no edge path connecting them at all — Prim's Algorithm, starting from any single vertex and only ever expanding to vertices reachable via existing edges from the currently-grown tree, can only ever discover and incorporate vertices belonging to that SAME connected component as the starting vertex; it has no mechanism to "jump" to an entirely separate, unreachable component. This means the algorithm will naturally terminate (the heap becomes empty) having successfully visited fewer than all `n` vertices — checking whether `edges_used` (or equivalently, the count of visited vertices) actually equals the total vertex count `n` at the end is exactly how this incompleteness gets detected, correctly signaling that no single spanning tree covering the entire graph could be constructed, rather than silently returning a partial result that might be mistaken for a complete, valid MST.
