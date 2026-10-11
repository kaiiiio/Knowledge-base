# Bridges in a Graph (Tarjan's Algorithm)

Simple words, step by step.

## The question
A **bridge** is an edge that, if removed, increases the number of connected components (i.e., disconnects the graph, or part of it). Find all bridges in an undirected graph.

## The idea: track DISCOVERY TIME and LOW-LINK VALUE for every node during a single DFS
- **`disc[node]`**: the time step at which `node` was first visited during DFS.
- **`low[node]`**: the smallest discovery time reachable from `node`'s subtree, including through AT MOST ONE back-edge to an ancestor (not through the edge back to its immediate parent).

An edge `(u, v)` (where `v` is `u`'s child in the DFS tree) is a bridge **if and only if** `low[v] > disc[u]` — meaning `v`'s subtree has NO way to reach back to `u` or any of `u`'s ancestors except through this single edge.

```python
def find_bridges(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)

    disc = [-1] * n
    low = [-1] * n
    bridges = []
    timer = [0]

    def dfs(node, parent):
        disc[node] = low[node] = timer[0]
        timer[0] += 1
        for neighbor in graph[node]:
            if neighbor == parent:
                continue                        # skip the edge straight back to parent (like file 114's trick)
            if disc[neighbor] == -1:
                dfs(neighbor, node)
                low[node] = min(low[node], low[neighbor])      # pull up the child's low-link value
                if low[neighbor] > disc[node]:
                    bridges.append((node, neighbor))              # genuine bridge found
            else:
                low[node] = min(low[node], disc[neighbor])       # back-edge to an ancestor -- update low-link

    for start in range(n):
        if disc[start] == -1:
            dfs(start, -1)
    return bridges
```
```javascript
function findBridges(n, edges) {
    const graph = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) {
        graph[u].push(v);
        graph[v].push(u);
    }

    const disc = new Array(n).fill(-1);
    const low = new Array(n).fill(-1);
    const bridges = [];
    let timer = 0;

    function dfs(node, parent) {
        disc[node] = low[node] = timer++;
        for (const neighbor of graph[node]) {
            if (neighbor === parent) continue;        // skip the edge straight back to parent
            if (disc[neighbor] === -1) {
                dfs(neighbor, node);
                low[node] = Math.min(low[node], low[neighbor]);     // pull up the child's low-link value
                if (low[neighbor] > disc[node]) {
                    bridges.push([node, neighbor]);                    // genuine bridge found
                }
            } else {
                low[node] = Math.min(low[node], disc[neighbor]);     // back-edge to an ancestor -- update low-link
            }
        }
    }

    for (let start = 0; start < n; start++) {
        if (disc[start] === -1) dfs(start, -1);
    }
    return bridges;
}
```
**Speed**: O(V + E) — a single DFS pass, with O(1) extra bookkeeping per node/edge.

## Rules to remember
- **`low[node] > disc[child]` is the entire test** — it directly expresses "this child's entire subtree has no back-edge escape route to anything at or before `node` itself," meaning the edge connecting them is the sole connection, hence a bridge.
- This is a genuinely advanced topic (explicitly flagged as such, similar to Morris Traversal, file 96) — the disc/low-link mechanism is the foundational technique also used for Articulation Points (file 133) and Strongly Connected Components (file 134); understanding it once here pays off across all three.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Multi-edges between the same pair of nodes — does the "skip parent" trick still work correctly?
**The trap**: similar to file 114's Twist 2 caveat — if TWO separate edges connect the same pair of nodes, naively skipping "the parent" by node identity alone would incorrectly treat the SECOND parallel edge as "just the parent edge" and wrongly suppress a legitimate back-edge detection; a fully robust implementation needs to track specific edge identities (e.g., edge indices) rather than just comparing node identity, exactly mirroring the same caveat raised for undirected cycle detection.

### Twist 2: Count the number of bridges without listing them individually
**The trap**: no special handling needed — simply track `len(bridges)` instead of (or alongside) the full list; the underlying detection logic is completely unchanged regardless of whether the final output needs to be a count or a full list.

## Interview Q&A

**Q1: What does `low[node]` represent conceptually, and why does its definition specifically exclude the edge directly back to the immediate parent?**
`low[node]` represents the earliest (smallest) discovery time reachable from `node`'s entire DFS subtree, via at most one "back-edge" — a non-tree edge connecting back to an already-visited ancestor. The immediate parent edge is deliberately excluded from this calculation because it's always trivially present in an undirected graph (every edge is stored both ways) and would otherwise always make every single node appear to have a path back to its parent, making the low-link value meaningless for distinguishing genuine alternate escape routes from this universally-present, structurally-expected parent connection.

**Q2: Why does `low[child] > disc[node]` specifically indicate that the edge between them is a bridge?**
This condition means that the entire subtree rooted at `child` has NO way to reach back to `node` or any node visited BEFORE `node` (i.e., any ancestor of `node`), except through the direct tree edge connecting `node` to `child`. If that one single edge were removed, `child`'s entire subtree would become completely disconnected from the rest of the graph, since there's provably no alternate back-edge path bridging the two sides — which is exactly the definition of what makes an edge a "bridge."

**Q3: Why is special care needed when applying this algorithm to a graph that might have multiple parallel edges between the same pair of nodes?**
The "skip the edge back to parent" logic, as written, identifies the parent edge purely by comparing NODE identity (is this neighbor the same node as my parent) — but with multiple distinct edges connecting the exact same pair of nodes, there could be a second, genuinely different edge also connecting back to the parent, which should NOT be skipped, since it represents a real, additional connection (effectively guaranteeing that specific pair can never be disconnected by removing just one of those parallel edges). Correctly handling this requires tracking which specific EDGE (not just which node) was used to arrive at the current node, so that only the exact edge actually traversed to get here is excluded from the back-edge consideration, while any other parallel edges to the same parent are still properly considered as valid alternate connections.
