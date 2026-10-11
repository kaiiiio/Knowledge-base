# Cheapest Flights Within K Stops

Simple words, step by step.

## The question
Find the cheapest price from `src` to `dst`, using **at most K stops** (i.e., at most K+1 edges) — a shortest-path variant with an added **edge-count constraint**, which disqualifies plain Dijkstra's (file 124) in its standard form.

## Why plain Dijkstra's doesn't directly work here
Dijkstra's finalizes a node's shortest distance the first time it's popped, with NO regard for how many edges were used to get there — but here, a cheaper overall path that uses MORE than K+1 edges is invalid, while a slightly more expensive path using fewer edges might be the only valid option. Dijkstra's greedy "finalize on first pop" logic has no mechanism to respect this edge-count constraint.

## The idea: Bellman-Ford-style relaxation, but limited to exactly K+1 rounds
```python
def find_cheapest_price(n, flights, src, dst, k):
    distances = [float('inf')] * n
    distances[src] = 0

    for _ in range(k + 1):                     # at most K stops = at most K+1 edges = K+1 relaxation rounds
        temp = distances[:]                       # CRITICAL: use a SNAPSHOT from the previous round, not live updates
        for u, v, price in flights:
            if distances[u] != float('inf') and distances[u] + price < temp[v]:
                temp[v] = distances[u] + price
        distances = temp

    return distances[dst] if distances[dst] != float('inf') else -1
```
```javascript
function findCheapestPrice(n, flights, src, dst, k) {
    let distances = new Array(n).fill(Infinity);
    distances[src] = 0;

    for (let i = 0; i <= k; i++) {                  // at most K stops = at most K+1 edges = K+1 relaxation rounds
        const temp = [...distances];                   // CRITICAL: use a SNAPSHOT from the previous round, not live updates
        for (const [u, v, price] of flights) {
            if (distances[u] !== Infinity && distances[u] + price < temp[v]) {
                temp[v] = distances[u] + price;
            }
        }
        distances = temp;
    }

    return distances[dst] !== Infinity ? distances[dst] : -1;
}
```
**Speed**: O(K × E) — a direct application of Bellman-Ford's relaxation idea (file 125), but intentionally capped at K+1 rounds instead of running the full V-1 rounds.

## Why the snapshot (`temp = distances[:]`) is absolutely essential — the single most important detail in this problem
If relaxation updated `distances` directly (in place) within a single round, an edge processed later in THAT SAME round could use an update that was ALSO made earlier in that same round — effectively allowing more than one additional edge/stop to be used within a single "round," silently violating the K-stops constraint. Using a snapshot from the START of the round ensures every relaxation within a round is based strictly on the PREVIOUS round's finalized state, correctly modeling "exactly one more edge used per round."

## Rules to remember
- **This is Bellman-Ford's relaxation technique, deliberately capped at a fixed number of rounds instead of running to full convergence** — recognizing "shortest path + a hard limit on number of edges/stops" as the signal to reach for this specific capped-Bellman-Ford pattern (rather than Dijkstra's) is the central insight.
- The snapshot trick is a close cousin of "process one full BFS level at a time" (file 85's `for _ in range(len(queue))` pattern) — both are mechanisms for strictly separating "this round's results" from "next round's inputs," preventing information from leaking across round boundaries prematurely.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Why does using Dijkstra's with a modified state (distance, stops_used) as the heap key NOT trivially fix this?
**The trap**: this is a conceptually tempting but subtly broken fix — naively adding `stops_used` to Dijkstra's state and still only "finalizing" based on cheapest distance would incorrectly prune away a MORE EXPENSIVE path that used FEWER stops, even when that pruned path might be the only one that stays within the K-stops budget; a fully correct Dijkstra's-based fix requires tracking and comparing BOTH dimensions (price AND stops used) without simply discarding higher-price-but-fewer-stops states as "worse," which complicates the stale-entry-skipping logic considerably — the capped Bellman-Ford approach sidesteps this complexity entirely by its round-based structure naturally respecting the stop limit.

### Twist 2: K is very large (larger than the number of nodes) — does the algorithm still work correctly, just less efficiently?
**The trap**: yes — if K+1 exceeds what Bellman-Ford's standard V-1-round guarantee would ever need (file 125), running MORE rounds than necessary is harmless (no further improvements would occur past that point, so extra rounds just repeat the same final values) — the algorithm remains correct, just performing some provably unnecessary extra work; capping the round count at `min(k+1, n-1)` would be a valid, free optimization in that scenario.

## Interview Q&A

**Q1: Why can't plain Dijkstra's Algorithm be used directly to solve this problem?**
Dijkstra's core greedy assumption is that once a node's shortest distance is finalized (popped from the heap with its currently smallest known value), that distance is correct and final, regardless of how many edges were used to achieve it — but this problem adds a hard constraint on the NUMBER of edges (stops) used, meaning a technically "more expensive" path using fewer stops might be the only valid answer, while a "cheaper" path exceeding the stop limit must be disqualified entirely. Dijkstra's standard mechanics have no way to track or respect this additional edge-count dimension without being substantially modified beyond its standard form.

**Q2: Why is taking a snapshot of distances at the start of each relaxation round essential, rather than updating the distances array in place as each edge is processed?**
Updating in place within a single round would allow a later edge in the processing order to use an update that was made by an EARLIER edge within that SAME round — effectively chaining two edge relaxations together within what's supposed to represent only one additional "stop" being used. This would incorrectly allow paths using MORE edges than the current round count should permit, violating the K-stops constraint; taking a snapshot at the start of each round and only reading from that frozen snapshot (while writing updates to a separate structure) ensures every relaxation within a round is strictly based on the state as it existed after exactly the previous round's edges, correctly modeling "exactly one more edge used per round, no more."

**Q3: If K is set larger than what the standard Bellman-Ford termination guarantee (V-1 rounds) would ever require, does running extra rounds break correctness or just waste time?**
It only wastes time, not correctness — once all true shortest distances (respecting the overall edge-count-unconstrained graph structure) have stabilized after at most V-1 rounds, any additional relaxation rounds beyond that point will find nothing left to improve (assuming no negative cycles), since there's nothing further to discover with more edges than any genuinely shortest path could ever need. Running more rounds than strictly necessary is therefore safe and still produces the correct final answer — simply at the cost of some avoidable extra computation that could be trimmed by capping the round count at `min(k+1, n-1)` as a straightforward optimization.
