# Detect Cycle in an Undirected Graph (DFS)

Simple words, step by step.

## The question
Given an undirected graph (possibly disconnected), determine if it contains at least one cycle.

## The idea (already introduced in file 113, Twist 1 — now the full standalone treatment)
Run DFS, tracking each node's immediate parent in the traversal. A cycle exists if DFS ever encounters an already-visited neighbor that is NOT the current node's direct parent — since that means there are two genuinely different paths reaching that neighbor, which is the definition of a cycle.

```python
def has_cycle(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)

    visited = [False] * n

    def dfs(node, parent):
        visited[node] = True
        for neighbor in graph[node]:
            if not visited[neighbor]:
                if dfs(neighbor, node):
                    return True
            elif neighbor != parent:          # visited, but NOT where we just came from -- genuine cycle
                return True
        return False

    for start in range(n):              # handle disconnected graphs -- check every component
        if not visited[start]:
            if dfs(start, -1):
                return True
    return False
```
```javascript
function hasCycle(n, edges) {
    const graph = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) {
        graph[u].push(v);
        graph[v].push(u);
    }

    const visited = new Array(n).fill(false);

    function dfs(node, parent) {
        visited[node] = true;
        for (const neighbor of graph[node]) {
            if (!visited[neighbor]) {
                if (dfs(neighbor, node)) return true;
            } else if (neighbor !== parent) {       // visited, but NOT where we just came from -- genuine cycle
                return true;
            }
        }
        return false;
    }

    for (let start = 0; start < n; start++) {       // handle disconnected graphs -- check every component
        if (!visited[start] && dfs(start, -1)) return true;
    }
    return false;
}
```
**Speed**: O(V + E) — a single DFS pass (across all components), same bound as plain traversal.

## Dry run
Graph: edges `(0,1), (1,2), (2,0)` — a triangle (definite cycle).
- `dfs(0, -1)`: visit `0`. Neighbors: `1` (unvisited) → `dfs(1, 0)`.
  - `dfs(1, 0)`: visit `1`. Neighbors: `0` (visited, but `0 == parent(0)` → skip, this is just the edge we came from), `2` (unvisited) → `dfs(2, 1)`.
    - `dfs(2, 1)`: visit `2`. Neighbors: `1` (visited, `1 == parent(1)` → skip), `0` (visited, `0 != parent(1)` → **CYCLE FOUND**, return `True`).
  - Propagates `True` back up through `dfs(1,0)` and `dfs(0,-1)`.
- Final result: `True` — correctly detects the triangle as a cycle.

## Rules to remember
- **The `neighbor != parent` check is the entire fix distinguishing this from plain reachability DFS** — without it, every single edge in an undirected graph would falsely trigger a "cycle," since the edge leading straight back to the parent is always present and always already visited (file 113's core insight, repeated here as the primary content).
- **Must loop over all nodes (not just node 0)** to correctly handle disconnected graphs — a cycle could exist in any component, not just the one containing the first node checked; this reuses the exact same "outer loop over unvisited nodes" pattern from files 111-113.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Detect cycle using BFS instead of DFS (equally valid — covered fully in file 115)
**The trap**: this is purely a forward pointer — BFS can also detect cycles in undirected graphs using an analogous "track the parent, flag if a visited non-parent neighbor is found" idea, but the queue-based mechanics differ enough from DFS's natural recursive parent-passing that it's worth its own dedicated treatment (file 115) rather than assuming the DFS code translates trivially.

### Twist 2: The graph has MULTI-EDGES (two or more edges directly connecting the same pair of nodes) — does this count as a cycle?
**The trap**: this is a genuine edge case directly connected to file 111's Twist 1 — two parallel edges between the same pair of nodes technically DO form a cycle (go from A to B via edge 1, then back from B to A via edge 2), but the naive `neighbor != parent` check would incorrectly treat the second edge back to the parent as "just the edge we came from" and MISS this cycle, since it can't distinguish between "the single edge we arrived via" and "a second, different edge to the same node." A fully robust implementation needs to track which specific EDGE (not just which node) was used to arrive, typically by tracking edge indices rather than just parent node identity, if multi-edges are a possibility — always clarify this assumption with the interviewer, since most standard problem formulations implicitly assume a simple graph (no multi-edges) specifically to avoid this complication.

## Interview Q&A

**Q1: Why does finding an already-visited neighbor that ISN'T the current node's parent specifically indicate a cycle, rather than just indicating "this part of the graph has been explored before"?**
In a tree-like (acyclic) traversal, every node should be reachable via exactly one unique path from the DFS's starting point — if DFS is currently at some node and looks at its neighbors, finding a neighbor that's already visited AND is not simply "where we just came from" (the parent) means there are now provably two distinct paths that both lead to that neighbor: the original path that visited it the first time, and this new path currently being explored. Two distinct paths connecting the same pair of nodes is, by definition, a cycle.

**Q2: Why is this algorithm unreliable (specifically, prone to false negatives) if the graph is allowed to have multiple parallel edges between the same two nodes, and what would need to change to handle that case correctly?**
The algorithm distinguishes "a genuine cycle" from "just the edge back to our parent" purely based on node identity (`neighbor != parent`) — but with multiple parallel edges between the same pair of nodes, there could be a SECOND, entirely different edge connecting the current node back to its parent, which genuinely does constitute a cycle (you can leave via one edge and return via a different one), yet the current check would incorrectly dismiss it as "just the parent edge" since it only compares node identities, not which specific edge was traversed. A correct fix for graphs with potential multi-edges would need to track and compare specific edge identifiers (e.g., edge indices) rather than just the parent node's identity, to correctly distinguish "the exact edge I arrived through" from "a different edge that happens to connect to the same parent node."

**Q3: Why must the algorithm loop over every node from 0 to n-1 and only start a fresh DFS on unvisited nodes, rather than just running one DFS starting from node 0?**
Because the graph might be disconnected — a single DFS starting from node 0 only explores the connected component that node 0 belongs to, leaving any other separate components entirely unexplored and unchecked. A cycle could exist in any one of those other components, independent of whatever is or isn't true about node 0's component — without the outer loop checking every node and starting new DFS traversals for any component not yet covered, cycles hiding in components disconnected from node 0 would be completely missed, incorrectly reporting "no cycle" for a graph that actually does contain one, just not in the first component checked.
