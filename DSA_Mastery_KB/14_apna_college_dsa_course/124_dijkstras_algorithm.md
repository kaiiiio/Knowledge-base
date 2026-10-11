# Dijkstra's Algorithm (Shortest Path, Weighted Graph, Non-Negative Weights)

Simple words, step by step.

## Why plain BFS (file 112) isn't enough anymore
BFS finds shortest paths correctly only when every edge has the same implicit cost (1). Once edges have different weights, "fewest edges" and "lowest total cost" are no longer the same thing — a path with more edges but smaller total weight could be the true shortest path. Dijkstra's Algorithm generalizes shortest-path-finding to handle arbitrary non-negative edge weights.

## The idea: greedily expand the closest unprocessed node first, using a MIN-HEAP (priority queue) instead of a plain queue
At every step, pick the node with the smallest known distance-from-source that hasn't been finalized yet, and use it to try to improve ("relax") its neighbors' distances.

```python
import heapq

def dijkstra(n, graph, source):          # graph[u] = list of (v, weight)
    distances = [float('inf')] * n
    distances[source] = 0
    heap = [(0, source)]                   # (distance, node) -- heap orders by distance automatically

    while heap:
        dist, node = heapq.heappop(heap)
        if dist > distances[node]:
            continue                          # STALE entry -- a better path to `node` was already found and processed
        for neighbor, weight in graph[node]:
            new_dist = dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                heapq.heappush(heap, (new_dist, neighbor))

    return distances
```
```javascript
class MinHeap {
    constructor() { this.heap = []; }
    push(item) {
        this.heap.push(item);
        let i = this.heap.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (this.heap[parent][0] <= this.heap[i][0]) break;
            [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
            i = parent;
        }
    }
    pop() {
        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = last;
            let i = 0;
            while (true) {
                let smallest = i, left = 2*i+1, right = 2*i+2;
                if (left < this.heap.length && this.heap[left][0] < this.heap[smallest][0]) smallest = left;
                if (right < this.heap.length && this.heap[right][0] < this.heap[smallest][0]) smallest = right;
                if (smallest === i) break;
                [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
                i = smallest;
            }
        }
        return top;
    }
    get size() { return this.heap.length; }
}

function dijkstra(n, graph, source) {        // graph[u] = list of [v, weight]
    const distances = new Array(n).fill(Infinity);
    distances[source] = 0;
    const heap = new MinHeap();
    heap.push([0, source]);

    while (heap.size > 0) {
        const [dist, node] = heap.pop();
        if (dist > distances[node]) continue;        // STALE entry -- a better path already processed
        for (const [neighbor, weight] of graph[node]) {
            const newDist = dist + weight;
            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                heap.push([newDist, neighbor]);
            }
        }
    }

    return distances;
}
```
**Speed**: O((V + E) log V) — each edge can trigger at most one heap push (O(log V) each), and each node can be popped multiple times (but stale entries are skipped in O(1) via the `dist > distances[node]` check), giving this standard bound. **Note**: JavaScript has no built-in heap/priority queue (same gap noted for monotonic structures in the Stacks module) — a custom MinHeap class (or a simpler sorted-insertion approach for small inputs) must be implemented manually.

## Why the "stale entry" check (`if dist > distances[node]: continue`) is essential
A node can be pushed onto the heap MULTIPLE times, via different paths discovered at different points — each push represents "a candidate distance found so far." By the time an OLDER, worse entry for that same node is popped later, a newer, better entry may have already been processed and finalized `distances[node]` to something smaller. The stale check skips reprocessing with outdated information, which would otherwise waste time (and in rare mismanaged implementations, risk incorrect results).

## Why Dijkstra's REQUIRES non-negative weights (and fails silently/incorrectly with negative weights)
The algorithm's greedy core assumption is: "once a node is popped from the heap with its currently-smallest known distance, that distance is FINAL and can never be improved later." This assumption only holds if all remaining edges can only ADD non-negative amounts to any path — a negative-weight edge could, in principle, make a currently-unprocessed, seemingly-longer path cheaper than an already-finalized one, violating this core greedy assumption and leading to silently wrong results (for negative weights, Bellman-Ford, file 125, is the correct tool instead).

## Rules to remember
- **This is BFS's "process in expanding rings" idea (file 112), generalized by replacing the plain queue with a min-heap** — instead of processing nodes in discovery order (implicitly, equal-cost rings), Dijkstra's processes them in TRUE distance order, which a min-heap naturally provides regardless of varying edge weights.
- **Never use Dijkstra's Algorithm on a graph with negative edge weights** — this is a frequently-tested conceptual checkpoint; recognizing "there might be negative weights" as an immediate disqualifier for Dijkstra's (pointing instead to Bellman-Ford) is as important as knowing the algorithm's mechanics.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Reconstruct the ACTUAL shortest PATH (not just its total distance)
```python
def dijkstra_with_path(n, graph, source, target):
    distances = [float('inf')] * n
    distances[source] = 0
    parent = [-1] * n
    heap = [(0, source)]

    while heap:
        dist, node = heapq.heappop(heap)
        if dist > distances[node]:
            continue
        for neighbor, weight in graph[node]:
            new_dist = dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                parent[neighbor] = node          # remember HOW we reached this better distance
                heapq.heappush(heap, (new_dist, neighbor))

    path = []
    curr = target
    while curr != -1:
        path.append(curr)
        curr = parent[curr]
    path.reverse()
    return path if path[0] == source else []       # no path exists if reconstruction didn't reach source
```
**The trap**: reconstructing the actual path (not just the distance) requires the same `parent`-pointer-tracking idea seen across the course (BFS shortest path, BST deletion's successor/predecessor) — every time a node's distance improves, its `parent` must be updated to reflect the NEW best predecessor, not just left as whatever it was on an earlier, now-outdated improvement.

### Twist 2: All edge weights happen to be EQUAL (e.g., all weight 1) — does Dijkstra's reduce to plain BFS?
**The trap**: yes, conceptually — with uniform edge weights, Dijkstra's greedy "always expand the smallest known distance next" behavior becomes equivalent to BFS's natural "process in discovery/ring order," since every single edge adds the same fixed amount; however, Dijkstra's O((V+E) log V) heap-based implementation is strictly SLOWER than plain BFS's O(V+E) in this special case, due to the unnecessary heap overhead — recognizing "if all weights are equal, just use BFS instead" is a valuable practical optimization insight, not just an abstract equivalence to note.

## Interview Q&A

**Q1: Why does Dijkstra's Algorithm fail to produce correct results when the graph contains negative edge weights?**
The algorithm's correctness depends on a core greedy assumption: once a node is popped from the priority queue with the smallest currently-known distance, that distance is guaranteed to be final and can never be improved by any path discovered later. This assumption relies on every remaining possible path only being able to ADD non-negative amounts of additional distance — but a negative-weight edge could allow some currently-unexplored, longer-looking path to actually end up cheaper overall than an already-finalized "shortest" distance, violating the very assumption the algorithm's greedy finalization relies on, and producing an incorrect final distance that the algorithm has no mechanism to later correct.

**Q2: Why is the "stale entry" check (`if dist > distances[node]: continue`) necessary, given that the heap always pops the smallest available distance at any given moment?**
A single node can be pushed onto the heap multiple times over the course of the algorithm, each time representing a different candidate distance discovered via a different path at a different point in the algorithm's execution. Between when an older (worse) entry for a node was pushed and when it eventually gets popped, a newer, better entry for that SAME node might have already been pushed and even already been popped and processed, meaning `distances[node]` has since been updated to something smaller than what this older, now-outdated heap entry represents. Processing this stale entry anyway would be redundant wasted work at best (reprocessing a node whose true shortest distance is already finalized), so checking and skipping it when it no longer matches the authoritative `distances[node]` value is an efficiency-preserving (and in careless implementations, correctness-preserving) necessity.

**Q3: In what specific scenario does Dijkstra's Algorithm become strictly equivalent in OUTCOME to plain BFS, and why is BFS still the better practical choice in that scenario despite the equivalence?**
When every edge in the graph has the identical weight (commonly 1), Dijkstra's greedy "always process the smallest known distance next" strategy produces the exact same processing order and final distances as BFS's natural "process in expanding, equal-cost rings" behavior — the two become logically equivalent in this special case. However, Dijkstra's implementation carries genuine extra overhead specifically from its priority-queue (min-heap) operations, each costing O(log V), whereas BFS's plain queue operations are O(1) — meaning Dijkstra's O((V+E) log V) bound is strictly worse than BFS's O(V+E) bound for this uniform-weight special case, making plain BFS the objectively faster, simpler, and therefore better practical choice whenever all edge weights are known to be equal.
