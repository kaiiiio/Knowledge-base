# Kruskal's Algorithm (Minimum Spanning Tree)

Simple words, step by step.

## The idea: sort ALL edges by weight, then greedily add each edge if it doesn't create a cycle
Unlike Prim's Algorithm (file 126), which grows ONE tree outward from a starting vertex, Kruskal's considers edges globally, in increasing weight order, and uses Union-Find (file 127) to efficiently check "would adding this edge create a cycle" (equivalent to "are these two endpoints already connected").

```python
def kruskals_mst(n, edges):            # edges = list of (weight, u, v)
    edges.sort()                             # sort by weight, ascending
    dsu = DSU(n)                               # reusing the DSU class from file 127
    total_weight = 0
    edges_used = 0

    for weight, u, v in edges:
        if dsu.union(u, v):                      # union succeeds only if u and v were NOT already connected
            total_weight += weight
            edges_used += 1
            if edges_used == n - 1:
                break                                  # MST complete -- exactly V-1 edges needed

    return total_weight if edges_used == n - 1 else -1     # -1 if the graph wasn't fully connected
```
```javascript
function kruskalsMST(n, edges) {            // edges = list of [weight, u, v]
    edges.sort((a, b) => a[0] - b[0]);             // sort by weight, ascending
    const dsu = new DSU(n);                           // reusing the DSU class from file 127
    let totalWeight = 0;
    let edgesUsed = 0;

    for (const [weight, u, v] of edges) {
        if (dsu.union(u, v)) {                            // union succeeds only if u and v were NOT already connected
            totalWeight += weight;
            edgesUsed += 1;
            if (edgesUsed === n - 1) break;                   // MST complete -- exactly V-1 edges needed
        }
    }

    return edgesUsed === n - 1 ? totalWeight : -1;      // -1 if the graph wasn't fully connected
}
```
**Speed**: O(E log E) — dominated by sorting the edges; the subsequent Union-Find operations are nearly O(1) each (file 127), contributing only O(E · α(V)) total, which is negligible compared to the sort.

## Why "sort by weight, greedily add if no cycle" correctly produces a Minimum Spanning Tree
This is a direct application of the **greedy choice property** underlying MST construction: always considering the globally cheapest remaining edge first, and accepting it unless it would create a cycle (which would mean it connects two vertices that are already connected via some other, necessarily-no-more-expensive combination of already-accepted edges) — this greedy strategy is provably optimal for this specific problem (a classic result, often proven via an exchange argument in formal algorithms courses, but accepted here as a well-established fact).

## Kruskal's vs. Prim's — when to prefer which
- **Kruskal's** is often more natural when the EDGE LIST is the primary given structure (rather than an adjacency list), and tends to be conceptually simpler to reason about ("sort edges, greedily accept non-cycle-forming ones").
- **Prim's** is often more natural when working with an ADJACENCY LIST representation directly, and can be slightly more efficient on very DENSE graphs (many edges relative to vertices), since it doesn't need to sort the entire edge list upfront.
- **Both produce a correct MST with the same total weight** — they are NOT different results, just different mechanisms; which one to use is primarily a matter of which input representation is more natural for the given problem, or dense vs. sparse graph considerations.

## Rules to remember
- **Kruskal's Algorithm is the single most common and natural application of Union-Find** — recognizing "MST + edge list given + need cycle checks" as the signal to reach for Union-Find (rather than attempting a BFS/DFS-based cycle check per edge addition, which would be far less efficient for this repeated, incremental use case) is the central insight connecting files 127 and 128.
- The early `break` once `edges_used == n - 1` is a worthwhile optimization (an MST always has exactly V-1 edges, so there's no need to keep examining the remaining, more expensive edges once the tree is already complete) — though even without it, the algorithm would still terminate correctly, just with a few wasted (unsuccessful) union attempts on remaining edges.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Return the actual list of edges used in the MST, not just the total weight
```python
def kruskals_mst_with_edges(n, edges):
    edges.sort()
    dsu = DSU(n)
    mst_edges = []

    for weight, u, v in edges:
        if dsu.union(u, v):
            mst_edges.append((u, v, weight))
            if len(mst_edges) == n - 1:
                break

    return mst_edges if len(mst_edges) == n - 1 else []
```
**The trap**: a trivial, low-risk extension — simply appending the accepted `(u, v, weight)` tuple to a result list instead of (or alongside) accumulating just the total weight; no new algorithmic idea is needed beyond what's already present in the base algorithm.

### Twist 2: Find the SECOND-MINIMUM spanning tree (the MST with the smallest total weight STRICTLY GREATER than the true minimum)
**The trap**: this requires a genuinely more involved approach beyond plain Kruskal's — one standard technique is: first compute the true MST using Kruskal's (or Prim's), then for EACH edge actually used in that MST, temporarily remove it (forcing it to be excluded) and recompute the MST of the remaining graph; the minimum total weight among all these "MST with one specific original edge excluded" results gives the second-minimum spanning tree. This requires running a full MST computation up to `V-1` additional times (once per excluded edge), making it considerably more expensive (O(V · E log E) in a naive implementation) than finding the single true MST — a good example of how a seemingly small variation ("second smallest" instead of "smallest") can require a meaningfully more complex algorithmic approach, not just a minor tweak.

## Interview Q&A

**Q1: Why does greedily adding the cheapest remaining edge that doesn't form a cycle correctly produce a Minimum Spanning Tree, rather than potentially getting "stuck" with a suboptimal set of edges?**
This relies on the greedy choice property specific to the MST problem: at every step, the cheapest edge that doesn't create a cycle is guaranteed to be part of SOME minimum spanning tree (a result formally provable via an exchange argument — if it weren't, you could swap it into any candidate MST in place of some more expensive edge on the cycle it would have formed, strictly improving or maintaining that MST's total weight, contradicting its assumed minimality). Because this greedy choice is always safe to make (never prevents reaching a true minimum), repeatedly making it until a complete spanning tree is formed is guaranteed to arrive at a genuinely minimum-weight result, not merely a "good enough" approximation.

**Q2: Given that both Kruskal's and Prim's Algorithms correctly solve the same MST problem, what practical considerations should guide the choice between them for a specific scenario?**
The choice is largely driven by the input's natural representation and the graph's density: Kruskal's works directly and naturally with an edge list input (sort edges, greedily accept), while Prim's works more naturally with an adjacency list (greedily expand a growing tree via a heap). For very dense graphs (many edges relative to vertices), Prim's heap-based approach can have a practical efficiency edge, since it never needs to sort the (potentially very large) entire edge list upfront the way Kruskal's does — though both share the same O(E log V) asymptotic family of bounds in typical implementations, making the choice more about implementation convenience and input format than a hard efficiency requirement in most interview contexts.

**Q3: Why does finding the SECOND-minimum spanning tree require a fundamentally more expensive approach than simply finding the true minimum spanning tree, rather than being a trivial extension of the same greedy algorithm?**
The greedy strategy underlying Kruskal's (and Prim's) is specifically proven correct for finding the SINGLE global minimum — the exchange-argument proof of correctness relies on always making the locally cheapest safe choice, which has no natural generalization to "find the best choice that results in the SECOND cheapest overall outcome," since greedy algorithms are fundamentally built around only ever considering and committing to the immediately best choice at each step, with no mechanism for deliberately reserving or exploring a "runner-up" global solution. Finding the second-best requires a qualitatively different strategy: computing the guaranteed-optimal solution first, then systematically exploring what happens when each individual piece of that optimal solution is deliberately excluded, and taking the best result among all of those exclusions — an approach that inherently requires solving the MST problem multiple times over, rather than being derivable as a simple tweak to the single-pass greedy algorithm itself.
