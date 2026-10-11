# Min Cost to Connect All Points

Simple words, step by step.

## The question
Given points on a 2D plane, connect all of them using edges whose cost is the **Manhattan distance** between the two points, at **minimum total cost** — this is a Minimum Spanning Tree problem (files 126/128) on an **implicit complete graph** (every pair of points has an edge).

## The idea: build the complete graph's edges implicitly, then run Prim's or Kruskal's
Since every pair of points is connected (a complete graph with `n` points has `n(n-1)/2` edges), explicitly building an adjacency list is wasteful — Prim's Algorithm (file 126) is usually preferred here since it can compute edge weights "on the fly" without ever materializing the full edge list.

```python
import heapq

def min_cost_connect_points(points):
    n = len(points)
    visited = [False] * n
    min_heap = [(0, 0)]              # (cost, point_index) -- start from point 0
    total_cost = 0
    edges_used = 0

    while edges_used < n:
        cost, u = heapq.heappop(min_heap)
        if visited[u]:
            continue
        visited[u] = True
        total_cost += cost
        edges_used += 1
        for v in range(n):
            if not visited[v]:
                manhattan = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1])
                heapq.heappush(min_heap, (manhattan, v))        # compute edge weight ON THE FLY, no precomputed graph

    return total_cost
```
```javascript
function minCostConnectPoints(points) {
    const n = points.length;
    const visited = new Array(n).fill(false);
    const heap = new MinHeap();           // reusing MinHeap from file 124
    heap.push([0, 0]);
    let totalCost = 0;
    let edgesUsed = 0;

    while (edgesUsed < n) {
        const [cost, u] = heap.pop();
        if (visited[u]) continue;
        visited[u] = true;
        totalCost += cost;
        edgesUsed += 1;
        for (let v = 0; v < n; v++) {
            if (!visited[v]) {
                const manhattan = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
                heap.push([manhattan, v]);       // compute edge weight ON THE FLY, no precomputed graph
            }
        }
    }
    return totalCost;
}
```
**Speed**: O(n² log n) — for each of the n points added to the tree, we scan all remaining points (O(n)) and push onto the heap (O(log n) each); this is a direct consequence of the graph being complete (O(n²) edges total).

## Rules to remember
- **This is MST (file 126) applied to an implicit, on-the-fly-computed complete graph** — the only new idea is recognizing that "connect all points, minimizing total distance cost" IS the MST problem, with Manhattan distance simply serving as the edge weight function; no new MST algorithm is needed.
- Prim's is preferred over Kruskal's here specifically because materializing and sorting all O(n²) edges upfront (which Kruskal's needs) is wasteful compared to Prim's incremental, on-demand edge weight computation — a direct, practical application of the "dense graph favors Prim's" guidance from file 128.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Using Euclidean distance instead of Manhattan distance
**The trap**: purely a one-line change to the distance formula (`sqrt((x1-x2)^2 + (y1-y2)^2)` instead of the Manhattan sum) — the MST algorithm itself is completely unaffected by which specific distance metric defines edge weight, reinforcing that the MST machinery is agnostic to what the weights actually represent.

### Twist 2: Why not use Kruskal's here, given it's also a valid MST algorithm?
**The trap**: Kruskal's would require explicitly generating and sorting all O(n²) candidate edges upfront before even starting the Union-Find process — for a complete graph, this means O(n² log n) just for the sort, with no way to avoid materializing the full edge set first; Prim's avoids ever needing the full edge list by only ever considering edges from already-included points to not-yet-included ones, computed fresh each time — making it the more natural and often more efficient choice specifically for implicit, complete-graph MST problems like this one.

## Interview Q&A

**Q1: Why is "Min Cost to Connect All Points" fundamentally the same problem as Minimum Spanning Tree, despite not explicitly mentioning "graph" or "tree" in its description?**
Connecting all points with minimum total edge cost, with no cycles needed (since a cycle would mean paying for a redundant connection that doesn't help reach any new point), is exactly the definition of a Minimum Spanning Tree — the points are the vertices, and the Manhattan distance between any two points serves as that implicit edge's weight, making this a direct real-world instance of the MST problem with a geometric edge-weight function.

**Q2: Why is Prim's Algorithm generally preferred over Kruskal's for this specific problem?**
Because the graph is complete (every pair of points is implicitly connected), Kruskal's would require generating and sorting all O(n²) possible edges upfront before it could even begin — an expensive, wasteful step given most of those edges will never be used in the final MST. Prim's avoids this entirely by only ever computing edge weights from the current tree's points to the remaining, not-yet-included points, on demand, never needing the full edge set materialized at once.

**Q3: How does the specific choice of distance metric (Manhattan vs. Euclidean vs. any other) affect the overall algorithm's structure?**
It doesn't affect the algorithm's structure at all — the distance metric only determines HOW the edge weight between any two points is computed, which is a completely separable, swappable piece of the algorithm; the core MST-building logic (growing a tree via a min-heap, tracking visited points, accumulating total cost) is entirely agnostic to what formula produces those weights, as long as that formula consistently produces a valid non-negative weight for any pair of points.
