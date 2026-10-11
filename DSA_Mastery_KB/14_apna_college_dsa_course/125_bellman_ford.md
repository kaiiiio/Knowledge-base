# Bellman-Ford Algorithm (Shortest Path, Handles Negative Weights)

Simple words, step by step.

## Why this algorithm exists, given Dijkstra's already solves shortest paths
Dijkstra's (file 124) fails with negative edge weights, because its greedy "once finalized, never revisit" assumption breaks down. Bellman-Ford trades away Dijkstra's speed advantage in exchange for correctness even with negative weights — and, as a bonus, it can **detect** negative-weight cycles (a situation where shortest path is actually undefined, since you could loop the negative cycle forever to make the "distance" arbitrarily small).

## The idea: relax every edge, repeatedly, exactly (V-1) times
"Relaxing" an edge `u -> v` with weight `w` means: "if going through `u` gives a shorter path to `v` than what's currently known, update it." Doing this for every edge, repeated (V-1) times, is guaranteed to find the true shortest distances — the reasoning for exactly (V-1) repetitions is explained below.

```python
def bellman_ford(n, edges, source):          # edges = list of (u, v, weight)
    distances = [float('inf')] * n
    distances[source] = 0

    for _ in range(n - 1):                      # repeat relaxation (V-1) times
        for u, v, weight in edges:
            if distances[u] != float('inf') and distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight

    # one MORE pass to detect a negative-weight cycle
    for u, v, weight in edges:
        if distances[u] != float('inf') and distances[u] + weight < distances[v]:
            return None                              # a distance STILL improved -- negative cycle exists

    return distances
```
```javascript
function bellmanFord(n, edges, source) {         // edges = list of [u, v, weight]
    const distances = new Array(n).fill(Infinity);
    distances[source] = 0;

    for (let i = 0; i < n - 1; i++) {                // repeat relaxation (V-1) times
        for (const [u, v, weight] of edges) {
            if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
                distances[v] = distances[u] + weight;
            }
        }
    }

    // one MORE pass to detect a negative-weight cycle
    for (const [u, v, weight] of edges) {
        if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
            return null;                                 // a distance STILL improved -- negative cycle exists
        }
    }

    return distances;
}
```
**Speed**: O(V × E) — (V-1) full passes over all E edges, plus one extra pass for cycle detection. Dramatically slower than Dijkstra's O((V+E) log V) on graphs without negative weights, which is exactly why Dijkstra's is still preferred whenever negative weights are guaranteed absent.

## Why exactly (V-1) repetitions is the right number
The true shortest path between any two nodes, in a graph with no negative cycles, uses at most (V-1) edges (since a path with V or more edges would necessarily revisit some node, meaning it contains a cycle — and revisiting nodes can never help find a SHORTEST path, barring negative cycles specifically). Each full pass over all edges is guaranteed to correctly extend the "shortest paths found so far using at most k edges" to "at most k+1 edges" — so after (V-1) full passes, every shortest path (which needs at most V-1 edges) has been correctly found.

## Why a negative cycle is detected by one MORE pass still finding an improvement
If all TRUE shortest paths have already stabilized after (V-1) passes (as guaranteed above, assuming no negative cycles), then a (V)th pass should find absolutely nothing left to improve. If it DOES still find an improvement, that's only possible if there's a cycle somewhere that keeps providing a "shorter" route no matter how many times you go around it — which is exactly the definition of a negative-weight cycle.

## Rules to remember
- **Bellman-Ford is strictly more general but strictly slower than Dijkstra's** — the choice between them is a clean decision rule: "are negative weights possible? If yes, Bellman-Ford (or confirm no negative cycles exist); if no, Dijkstra's is faster and should be preferred."
- **The one-extra-pass negative-cycle detection trick is the single most distinctive, memorable feature of this algorithm** — it's frequently the actual point of an interview question (not just "find shortest paths," but specifically "detect if a negative cycle exists"), so recognizing this capability as Bellman-Ford's unique selling point (something Dijkstra's categorically cannot do) is important.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Return the SPECIFIC nodes that are affected by (reachable from) a negative cycle
```python
def find_negative_cycle_affected_nodes(n, edges, source):
    distances = [float('inf')] * n
    distances[source] = 0

    for _ in range(n - 1):
        for u, v, weight in edges:
            if distances[u] != float('inf') and distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight

    affected = set()
    for _ in range(n):                     # run n MORE passes -- propagates the "affected" flag outward
        for u, v, weight in edges:
            if distances[u] != float('inf') and distances[u] + weight < distances[v]:
                distances[v] = float('-inf')         # mark as "infinitely improvable" -- affected by negative cycle
                affected.add(v)

    return affected
```
**The trap**: detecting THAT a negative cycle exists only needs one extra pass, but identifying WHICH specific nodes are reachable from (and therefore corrupted by) that cycle requires additional passes, explicitly marking affected nodes with a sentinel like negative infinity and propagating that marking outward — since any node reachable from a node already known to be corrupted is itself also corrupted (its "shortest distance" is equally meaningless, as it inherits the ability to loop the negative cycle first).

### Twist 2: Use Bellman-Ford on a graph with NO negative weights at all — any reason to still prefer it over Dijkstra's?
**The trap**: this is a pure "default to the right tool" reinforcement — there's essentially no legitimate reason to prefer Bellman-Ford's O(V×E) over Dijkstra's O((V+E) log V) when negative weights are provably absent; the only loose justification might be implementation simplicity (Bellman-Ford's core loop is arguably simpler to write correctly than a min-heap-based Dijkstra's, especially in a language without a built-in heap, like JavaScript) for a one-off, small-graph use case where performance genuinely doesn't matter — but this should be an explicit, acknowledged tradeoff, not a default choice.

## Interview Q&A

**Q1: Why does Bellman-Ford need to repeat the edge-relaxation process exactly (V-1) times to guarantee correctness, rather than just running it once or some other arbitrary number of times?**
The reasoning is tied to path length: in a graph without negative cycles, any genuinely shortest path between two nodes can use at most (V-1) edges, since using V or more edges would necessarily mean revisiting some node, forming a cycle — and revisiting a node can never help shorten a path (absent negative cycles, where it uniquely CAN, which is precisely what makes shortest-path undefined there). Each individual full pass over all edges is guaranteed to correctly extend the set of "shortest paths found so far using at most k edges" to correctly cover paths of length up to (k+1) edges — so after (V-1) full passes, paths of every possible length up to the maximum needed (V-1 edges) have been correctly accounted for, guaranteeing all true shortest distances have stabilized.

**Q2: Why does finding an improvement during a (V)th pass — one pass beyond the guaranteed-sufficient (V-1) passes — specifically prove the existence of a negative-weight cycle, rather than just indicating the algorithm needs to run longer?**
If the graph genuinely had no negative cycles, the mathematical guarantee established by the (V-1)-pass reasoning ensures that all true shortest distances must have already fully stabilized by that point — meaning a (V)th pass, under that no-negative-cycle assumption, should find absolutely nothing left to improve, since there's nothing further to discover with more edges than the required maximum of (V-1). Finding that some distance STILL decreases on this (V)th pass therefore directly contradicts the no-negative-cycle assumption — the only way a path can keep "improving" indefinitely, beyond what any acyclic, non-negative path structure could ever produce, is if there's a cycle somewhere whose total weight is negative, letting you traverse it repeatedly to make the reported "distance" arbitrarily smaller each additional time around.

**Q3: Given that Bellman-Ford is strictly more general (handles negative weights, detects negative cycles) than Dijkstra's, why isn't it simply always used as the default shortest-path algorithm, even when negative weights aren't expected?**
Bellman-Ford's time complexity, O(V × E), is substantially worse than Dijkstra's O((V+E) log V) on any reasonably large or dense graph, since it must perform a full pass over every single edge, repeated (V-1) times, regardless of how quickly the true shortest distances might have actually stabilized in practice. Dijkstra's greedy, priority-queue-driven approach is specifically optimized to avoid this blanket repeated-relaxation overhead by processing nodes in guaranteed-correct order (smallest distance first) and immediately finalizing each one — but this optimization is fundamentally unsound whenever negative weights are present. The practical decision rule is therefore to default to Dijkstra's whenever negative weights are provably impossible (the common case), reserving Bellman-Ford specifically for situations where negative weights are a genuine possibility or where detecting negative cycles is itself part of the actual requirement.
