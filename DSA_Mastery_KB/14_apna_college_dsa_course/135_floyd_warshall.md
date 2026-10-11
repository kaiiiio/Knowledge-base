# Floyd-Warshall Algorithm (All-Pairs Shortest Path)

Simple words, step by step.

## The question
Find the shortest path between **every pair** of nodes in a graph (not just from one source, unlike Dijkstra's/Bellman-Ford) — works correctly even with negative edge weights (though not negative cycles, which it can also detect).

## The idea: dynamic programming over an "allowed intermediate nodes" dimension
Define `dist[i][j]` as the shortest path from `i` to `j`. The algorithm iterates over every possible **intermediate node `k`**, and for every pair `(i, j)`, checks: "is it cheaper to go from `i` to `j` by routing THROUGH `k`?"

```python
def floyd_warshall(n, edges):
    INF = float('inf')
    dist = [[INF] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    for u, v, weight in edges:
        dist[u][v] = min(dist[u][v], weight)      # handle potential duplicate/multi edges -- keep the cheapest

    for k in range(n):               # k = the intermediate node being considered
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]      # cheaper to route through k

    for i in range(n):
        if dist[i][i] < 0:
            return None                     # negative cycle detected
    return dist
```
```javascript
function floydWarshall(n, edges) {
    const INF = Infinity;
    const dist = Array.from({ length: n }, () => new Array(n).fill(INF));
    for (let i = 0; i < n; i++) dist[i][i] = 0;
    for (const [u, v, weight] of edges) {
        dist[u][v] = Math.min(dist[u][v], weight);     // handle potential duplicate/multi edges -- keep the cheapest
    }

    for (let k = 0; k < n; k++) {                // k = the intermediate node being considered
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];     // cheaper to route through k
                }
            }
        }
    }

    for (let i = 0; i < n; i++) {
        if (dist[i][i] < 0) return null;             // negative cycle detected
    }
    return dist;
}
```
**Speed**: O(V³) — three nested loops over all n nodes. Space: O(V²) for the distance matrix.

## Why the loop order (`k` OUTERMOST, then `i`, then `j`) is non-negotiable
`dist[i][k]` and `dist[k][j]` must both already reflect "the shortest path using ONLY intermediate nodes considered so far" at the time they're read — this is only guaranteed correct if `k` is the OUTERMOST loop, since that's what ensures every `dist[i][j]` has been fully finalized with respect to all intermediate nodes `0..k-1` before `k` itself is considered as a possible new intermediate stop. Swapping the loop order breaks this invariant and produces incorrect results.

## Floyd-Warshall vs. running Dijkstra's/Bellman-Ford from every single source
- **Floyd-Warshall**: O(V³), works with negative weights (not negative cycles), very simple to implement (three nested loops, no heap needed).
- **Running Dijkstra's from every node**: O(V × (V+E) log V) — often FASTER than Floyd-Warshall on sparse graphs (where E is much smaller than V²), but requires non-negative weights.
- **Running Bellman-Ford from every node**: O(V × V × E) = O(V²E) — handles negative weights, but is typically slower than Floyd-Warshall for dense graphs, and offers no particular advantage over it in the all-pairs setting.
- **Rule of thumb**: for all-pairs shortest paths, Floyd-Warshall is the standard default specifically because of its implementation simplicity and its applicability regardless of edge weight sign (short of negative cycles) — "all-pairs shortest path" should trigger Floyd-Warshall as the first idea to consider.

## Rules to remember
- **This is a genuinely different algorithmic FAMILY from Dijkstra's/Bellman-Ford (both single-source)** — recognizing "I need shortest paths between EVERY pair of nodes, not just from one source" as the signal to reach for Floyd-Warshall specifically (rather than just running a single-source algorithm V times, which also works but is a different tradeoff) is the central insight.
- The negative-cycle detection trick here (`dist[i][i] < 0` after the main loops) directly parallels Bellman-Ford's own detection mechanism (file 125) — both rely on the same underlying idea: a negative cycle means a "distance" that should be fixed (here, a node's distance to ITSELF, which should always be exactly 0) keeps improving below what's logically possible.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Reconstruct the ACTUAL shortest path between any pair, not just its distance
```python
def floyd_warshall_with_path(n, edges):
    INF = float('inf')
    dist = [[INF] * n for _ in range(n)]
    next_node = [[None] * n for _ in range(n)]
    for i in range(n):
        dist[i][i] = 0
    for u, v, weight in edges:
        if weight < dist[u][v]:
            dist[u][v] = weight
            next_node[u][v] = v

    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
                    next_node[i][j] = next_node[i][k]          # path from i to j now starts by going toward k's path

    def reconstruct_path(u, v):
        if next_node[u][v] is None:
            return []
        path = [u]
        while u != v:
            u = next_node[u][v]
            path.append(u)
        return path

    return dist, reconstruct_path
```
**The trap**: path reconstruction requires maintaining a `next_node` table alongside the distance table, updated in lockstep whenever a distance improves — a common oversight is updating `dist[i][j]` without also updating `next_node[i][j]` to match, leaving the path-reconstruction data silently out of sync with the actual shortest distances.

### Twist 2: Detect WHICH SPECIFIC pairs of nodes are affected by a negative cycle (not just that one exists somewhere)
**The trap**: a pair `(i, j)` is affected by a negative cycle if there's SOME node `k` with `dist[k][k] < 0` such that `i` can reach `k` and `k` can reach `j` — checking this for all pairs after the main algorithm completes (an additional O(V³) or O(V²) pass, depending on implementation) is needed to identify every specific CORRUPTED pair, rather than just the fact that negative cycles exist somewhere in the graph.

## Interview Q&A

**Q1: Why must the intermediate node `k` be the OUTERMOST loop in Floyd-Warshall, rather than `i` or `j`?**
The algorithm's correctness relies on a specific invariant: by the time `dist[i][k]` and `dist[k][j]` are read for any given `k`, both values must already represent the true shortest paths using only intermediate nodes from `0` to `k-1` — essentially, "the best known path using everything considered SO FAR." This invariant only holds if every pair `(i, j)` has been fully finalized with respect to all SMALLER values of `k` before `k` itself is considered as a new possible routing option — which is exactly what making `k` the outermost loop guarantees; reordering the loops would mean reading `dist[i][k]` or `dist[k][j]` before they've been correctly updated for all relevant smaller intermediate nodes, producing incorrect results.

**Q2: When would running Dijkstra's Algorithm from every single node be a better choice than Floyd-Warshall for an all-pairs shortest path problem, and when would it not be?**
Running Dijkstra's from every node achieves O(V × (V+E) log V) total time, which is faster than Floyd-Warshall's O(V³) specifically on SPARSE graphs (where E is much smaller than V²) — the heap-based approach's efficiency gain from not needing to examine all V² pairs directly outweighs the per-source overhead in that case. However, this approach requires non-negative edge weights throughout (Dijkstra's core limitation, file 124), making it inapplicable whenever negative weights are possible — in that scenario, or on genuinely dense graphs where V² and E are comparable in magnitude anyway, Floyd-Warshall's simplicity and broader applicability (short of negative cycles) make it the more practical default choice.

**Q3: How does Floyd-Warshall's negative-cycle detection mechanism (`dist[i][i] < 0`) conceptually relate to Bellman-Ford's own negative-cycle detection (file 125)?**
Both rely on the same underlying logical principle: a node's shortest distance to ITSELF should always be exactly zero in a graph with no negative cycles (there's no reason to ever "improve" upon simply staying put), and similarly, Bellman-Ford's distances should all fully stabilize after V-1 relaxation rounds with nothing further to improve. If either algorithm finds a distance that keeps improving beyond what should be mathematically possible — Floyd-Warshall specifically finding `dist[i][i]` dropping below zero, or Bellman-Ford finding ANY distance still improving on an extra (V-th) relaxation pass — that's only explainable by the existence of a cycle somewhere in the graph with a negative total weight, since only such a cycle could be traversed repeatedly to keep "improving" a distance value indefinitely, violating the otherwise-guaranteed stabilization both algorithms rely on.
