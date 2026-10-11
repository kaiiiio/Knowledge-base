# Detect Cycle in an Undirected Graph (BFS)

Simple words, step by step.

## The idea
The same core insight as file 114 (a visited neighbor that isn't the immediate parent means a cycle), but implemented using a queue instead of recursion — each queue entry needs to carry along "which node discovered me" (its parent at the time of discovery).

```python
from collections import deque

def has_cycle_bfs(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)

    visited = [False] * n

    def bfs(start):
        visited[start] = True
        queue = deque([(start, -1)])          # (node, parent-at-discovery-time)
        while queue:
            node, parent = queue.popleft()
            for neighbor in graph[node]:
                if not visited[neighbor]:
                    visited[neighbor] = True
                    queue.append((neighbor, node))
                elif neighbor != parent:          # visited, but NOT where we discovered this node from -- cycle
                    return True
        return False

    for start in range(n):
        if not visited[start]:
            if bfs(start):
                return True
    return False
```
```javascript
function hasCycleBFS(n, edges) {
    const graph = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) {
        graph[u].push(v);
        graph[v].push(u);
    }

    const visited = new Array(n).fill(false);

    function bfs(start) {
        visited[start] = true;
        const queue = [[start, -1]];           // [node, parent-at-discovery-time]
        let head = 0;
        while (head < queue.length) {
            const [node, parent] = queue[head++];
            for (const neighbor of graph[node]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.push([neighbor, node]);
                } else if (neighbor !== parent) {       // visited, but NOT where we discovered this node from -- cycle
                    return true;
                }
            }
        }
        return false;
    }

    for (let start = 0; start < n; start++) {
        if (!visited[start] && bfs(start)) return true;
    }
    return false;
}
```
**Speed**: O(V + E) — identical bound to the DFS version; BFS and DFS are equally capable here, differing only in traversal mechanics (queue vs. recursion/stack).

## Rules to remember
- **The "track the parent" idea transfers directly from DFS to BFS, but the mechanism differs**: DFS passes the parent down naturally as a function argument through recursive calls; BFS must explicitly store the parent alongside each node inside the queue entry itself, since there's no implicit call-stack "remembering" the path taken to reach each node the way recursion does.
- This confirms the general principle (also seen in files 112-113): BFS and DFS are usually interchangeable for pure connectivity/structural questions (cycle existence, connected components, reachability) — the choice between them mostly matters for problems that specifically need BFS's shortest-path property or DFS's natural recursive backtracking structure, not because one is "more correct" for structural questions like this one.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Detect cycle using Union-Find (Disjoint Set Union) instead of BFS/DFS — a THIRD distinct approach
```python
def has_cycle_union_find(n, edges):
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]        # path compression
            x = parent[x]
        return x

    for u, v in edges:
        root_u, root_v = find(u), find(v)
        if root_u == root_v:
            return True                             # u and v are ALREADY connected -- adding this edge creates a cycle
        parent[root_u] = root_v                       # union them
    return False
```
**The trap**: this is a genuinely different, non-traversal-based technique (full treatment in file 127) worth knowing exists — rather than exploring the graph structurally, Union-Find processes EDGES one at a time, and a cycle is detected the instant an edge is found connecting two nodes that are ALREADY in the same connected group (same "root"), since adding an edge between two already-connected nodes necessarily creates a cycle. This approach is often preferred specifically for problems framed as "process a stream/list of edges and determine something about connectivity as you go," rather than "explore a pre-built graph structure."

### Twist 2: Count the TOTAL number of independent cycles in the graph (not just detect if one exists)
**The trap**: for a graph with `V` vertices, `E` edges, and `C` connected components, the total number of independent cycles (more precisely, the size of the "cycle space" / circuit rank) is given by the formula `E - V + C` — a connected acyclic graph (a tree) has exactly `V-1` edges, so any additional edge beyond that necessarily introduces exactly one more independent cycle; recognizing this formula lets you answer "how many extra edges beyond a spanning forest exist" without needing to explicitly enumerate every individual cycle, which would be considerably more complex.

## Interview Q&A

**Q1: Why must BFS explicitly store the parent alongside each node in the queue, when DFS can simply pass the parent as a function argument?**
DFS's recursive call structure naturally maintains an implicit record of "how did I get here" via the call stack itself — each recursive call for a given node is made directly from its parent's call, so the parent is trivially available as a parameter at each step. BFS has no equivalent implicit structure; it's an iterative process using an explicit queue with no inherent memory of "which node caused this one to be enqueued" unless that information is deliberately stored alongside the node itself when it's added to the queue — without doing so, there would be no way to later retrieve which node was the parent when checking a given node's neighbors.

**Q2: Is there any meaningful difference in correctness or efficiency between detecting an undirected cycle via BFS versus DFS?**
No — both achieve the identical O(V + E) time complexity and both correctly detect cycles using the exact same underlying logical insight (a visited neighbor that isn't the immediate parent indicates two distinct paths to that neighbor, i.e., a cycle). The choice between them for this specific problem is purely a matter of implementation preference or consistency with surrounding code style, not a meaningful correctness or efficiency distinction — unlike, say, shortest-path problems, where BFS has a genuine, provable advantage DFS doesn't share.

**Q3: How does the Union-Find approach to cycle detection differ fundamentally from the BFS/DFS traversal-based approaches, and when might it be preferred?**
Union-Find processes the graph's edges directly, one at a time, maintaining a running record of which nodes already belong to the same connected group — a cycle is detected immediately upon encountering an edge connecting two nodes already in the same group, without needing to have built or traversed a full adjacency-list graph structure at all. This makes it particularly well-suited to problems framed around processing a stream or list of edges incrementally (for instance, "process these edges in order and report the first one that creates a cycle"), or problems that are fundamentally about tracking evolving connectivity over time as edges are added — scenarios where building a full traversable graph structure upfront, just to run BFS/DFS once, would be unnecessary overhead compared to Union-Find's more direct, incremental processing model.
