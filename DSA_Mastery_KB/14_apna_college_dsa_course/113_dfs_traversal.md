# DFS Traversal (Graphs)

Simple words, step by step.

## The idea
Go as deep as possible down one path before backtracking — exactly the recursive tree traversal idea (preorder, file 85), generalized to graphs with an explicit `visited` set to handle cycles.

```python
def dfs(start, graph):
    visited = set()
    order = []

    def explore(node):
        visited.add(node)
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                explore(neighbor)

    explore(start)
    return order
```
```javascript
function dfs(start, graph) {
    const visited = new Set();
    const order = [];

    function explore(node) {
        visited.add(node);
        order.push(node);
        for (const neighbor of graph.get(node)) {
            if (!visited.has(neighbor)) {
                explore(neighbor);
            }
        }
    }

    explore(start);
    return order;
}
```
**Speed**: O(V + E), same bound as BFS, for the same reason (every node visited once, every edge examined once per endpoint).

## Iterative version (explicit stack, avoids recursion depth limits on very large/deep graphs)
```python
def dfs_iterative(start, graph):
    visited = {start}
    stack = [start]
    order = []
    while stack:
        node = stack.pop()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                stack.append(neighbor)
    return order
```
**The subtlety**: this doesn't produce the EXACT same visiting order as the recursive version in all cases (since a stack processes the most-recently-added neighbor first, which can differ from the recursive version's strict left-to-right neighbor order) — if an exact order match matters, pushing neighbors onto the stack in reverse order restores the match; usually, for pure reachability/connectivity purposes, the specific order doesn't matter at all.

## Rules to remember
- **DFS and BFS both achieve O(V + E) and both correctly determine reachability/connectivity** — the real choice between them depends on what ELSE the problem needs: shortest path in an unweighted graph specifically needs BFS (file 112); cycle detection, topological sort, and connected-components-style counting work with either, though DFS is often more naturally recursive for these.
- **Recursive DFS risks stack overflow on very deep/large graphs** (a graph with thousands of nodes in a single long chain could exceed a language's default recursion limit) — the iterative stack-based version sidesteps this risk entirely, which is worth mentioning as a practical consideration in an interview even if the recursive version is what gets coded first for clarity.

## Twisted Tricky Examples (with Solutions)

### Twist 1: DFS used to detect a CYCLE in an undirected graph
```python
def has_cycle_undirected(n, graph):
    visited = set()

    def dfs(node, parent):
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                if dfs(neighbor, node):
                    return True
            elif neighbor != parent:          # visited AND not the node we just came from -- genuine cycle
                return True
        return False

    for start in range(n):
        if start not in visited:
            if dfs(start, -1):
                return True
    return False
```
**The trap**: in an UNDIRECTED graph, every edge is stored twice (once from each endpoint, file 111) — meaning a naive check of "is this neighbor already visited" would ALWAYS trigger on the edge leading straight back to the node's own parent (since that parent was obviously just visited), falsely reporting a cycle on every single edge. The essential fix is explicitly tracking and excluding the immediate parent from the "already visited" cycle check — only a visited neighbor that is NOT the direct parent indicates a genuine cycle (full detail in file 114).

### Twist 2: Count the number of DISTINCT PATHS between two nodes (not just whether a path exists)
```python
def count_paths(start, end, graph):
    visited = set()
    count = [0]

    def dfs(node):
        if node == end:
            count[0] += 1
            return
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                dfs(neighbor)
        visited.remove(node)          # BACKTRACK -- unmark so other paths can still use this node

    dfs(start)
    return count[0]
```
**The trap**: this requires explicit BACKTRACKING (`visited.remove(node)` after exploring), unlike standard reachability DFS which never un-marks a visited node — because counting ALL distinct paths means a node might legitimately need to be revisited as part of a DIFFERENT path later in the exploration; forgetting the backtrack step would silently undercount valid paths that happen to share some intermediate nodes with already-explored paths.

## Interview Q&A

**Q1: Why does cycle detection in an undirected graph require tracking the parent node explicitly, when BFS/DFS reachability traversal doesn't need this at all?**
Because in an undirected graph, every single edge is represented twice in the adjacency list (once from each endpoint) — meaning that from any non-root node's perspective, its own parent will always appear in its neighbor list and will always already be marked visited (since the parent was visited immediately before traversing to this node). Without excluding the parent specifically, this universally-present "parent edge, already visited" situation would be indistinguishable from a genuine cycle, causing every single edge to falsely register as a cycle; explicitly passing along and comparing against the parent node is what correctly distinguishes "this is just the edge back to where we came from" from "this is a genuinely different path back to an already-visited node," which is what a real cycle requires.

**Q2: Why does counting all distinct paths between two nodes require explicit backtracking (un-marking nodes as they're no longer needed on the current path), unlike simple reachability DFS?**
Standard reachability DFS only needs to know "has this node been visited AT ALL, ever" — once visited, there's no need to reconsider it, since establishing reachability only requires finding ONE path, and a node already proven reachable doesn't need re-exploring. Counting ALL distinct paths, however, requires exploring every possible route independently — a node might legitimately be part of multiple different valid paths from start to end, each using it at a different point in a different exploration branch. Marking it as permanently visited (without ever un-marking) would incorrectly prevent it from being considered again in a different path's exploration, undercounting the true number of distinct paths; backtracking (un-marking once a particular exploration branch is done considering that node) correctly allows it to participate in other valid paths explored later.

**Q3: What's the main practical risk of using recursive DFS over the iterative stack-based version, and when does this risk actually matter in practice?**
Recursive DFS relies on the language's call stack, which has a finite (and often surprisingly small, by default) maximum depth — a graph structured as one very long chain of connected nodes (or any deeply nested structure) can cause the recursion to exceed this limit, resulting in a stack overflow error that crashes the program, even though the algorithm itself is logically correct. This risk becomes a real practical concern specifically with very large or adversarially-structured inputs (e.g., a graph with tens of thousands of nodes in a single connected chain) — in such cases, switching to the iterative, explicit-stack-based version sidesteps the language's call-stack depth limit entirely, since the "stack" being used is just a regular data structure on the heap, which typically has a much larger practical capacity.
