# Detect Cycle in a Directed Graph (DFS)

Simple words, step by step.

## Why the undirected trick (files 114-115) does NOT work for directed graphs
In an undirected graph, "visited but not the parent" correctly signals a cycle. In a **directed** graph, edges only go one way — so a node can be perfectly validly visited through two entirely different, non-cyclic paths (think of a diamond shape: A→B, A→C, B→D, C→D — D is reached twice, but there's no cycle). The undirected approach would incorrectly flag this as a cycle.

## The correct idea: track nodes currently in the ACTIVE recursion path
Maintain two sets: `visited` (ever processed, at any point) and `in_path` (currently on the active DFS call stack, i.e., an ancestor in the current path being explored). A cycle exists specifically when DFS encounters a neighbor that is in `in_path` — meaning there's a path from that neighbor back to the current node, forming a genuine directed cycle (a "back edge").

```python
def has_cycle_directed(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)

    visited = [False] * n
    in_path = [False] * n          # nodes currently on the active recursion stack

    def dfs(node):
        visited[node] = True
        in_path[node] = True
        for neighbor in graph[node]:
            if in_path[neighbor]:
                return True                   # neighbor is an ANCESTOR in the current path -- back edge, genuine cycle
            if not visited[neighbor]:
                if dfs(neighbor):
                    return True
        in_path[node] = False          # BACKTRACK -- node is no longer on the active path once we're done exploring it
        return False

    for start in range(n):
        if not visited[start]:
            if dfs(start):
                return True
    return False
```
```javascript
function hasCycleDirected(n, edges) {
    const graph = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) {
        graph[u].push(v);
    }

    const visited = new Array(n).fill(false);
    const inPath = new Array(n).fill(false);         // nodes currently on the active recursion stack

    function dfs(node) {
        visited[node] = true;
        inPath[node] = true;
        for (const neighbor of graph[node]) {
            if (inPath[neighbor]) return true;            // ANCESTOR in current path -- back edge, genuine cycle
            if (!visited[neighbor]) {
                if (dfs(neighbor)) return true;
            }
        }
        inPath[node] = false;           // BACKTRACK -- node is no longer on the active path once done exploring it
        return false;
    }

    for (let start = 0; start < n; start++) {
        if (!visited[start] && dfs(start)) return true;
    }
    return false;
}
```
**Speed**: O(V + E) — same traversal bound as always; the only addition is the `in_path` bookkeeping, which is O(1) extra work per node.

## Why the `in_path` backtracking step (`in_path[node] = False`) is absolutely essential
Without un-marking a node from `in_path` once its exploration is fully complete, `in_path` would effectively become identical to `visited` (permanently marked, never cleared) — which would incorrectly flag the diamond-shape scenario above as a cycle, since D would still show as "in_path" from the first time it was reached, even after that first exploration branch has fully completed and backtracked.

## Rules to remember
- **This is the single most important distinction between undirected and directed cycle detection**: undirected needs to track "parent" (one specific excluded node); directed needs to track the ENTIRE currently-active path (`in_path`, a whole set of ancestor nodes), because any of them — not just the immediate parent — could be the target of a back edge forming a cycle.
- `visited` and `in_path` serve genuinely different purposes and must NOT be conflated into a single array: `visited` means "processed at some point, ever" (prevents redundant re-exploration); `in_path` means "currently an ancestor in the active exploration branch" (detects genuine back edges). A node can be `visited=True` while `in_path=False` (already fully explored and backtracked from) — and encountering such a node should NOT be treated as a cycle.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Detect cycle in a directed graph using an ITERATIVE (non-recursive) approach, using colors (White/Gray/Black)
```python
def has_cycle_iterative_colors(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)

    WHITE, GRAY, BLACK = 0, 1, 2          # WHITE=unvisited, GRAY=in current path, BLACK=fully done
    color = [WHITE] * n

    for start in range(n):
        if color[start] != WHITE:
            continue
        stack = [(start, iter(graph[start]))]
        color[start] = GRAY
        while stack:
            node, neighbors = stack[-1]
            found_next = False
            for neighbor in neighbors:
                if color[neighbor] == GRAY:
                    return True                     # back edge to a node still in the current path -- cycle
                if color[neighbor] == WHITE:
                    color[neighbor] = GRAY
                    stack.append((neighbor, iter(graph[neighbor])))
                    found_next = True
                    break
            if not found_next:
                color[node] = BLACK           # fully done exploring this node -- equivalent to the recursive backtrack
                stack.pop()
    return False
```
**The trap**: this is the standard "White-Gray-Black" coloring scheme, a well-known equivalent formulation of the `visited`/`in_path` two-array approach — GRAY is exactly equivalent to `in_path=True`, BLACK is equivalent to `visited=True AND in_path=False`; interviewers sometimes specifically ask for this exact terminology (it's the standard academic/CLRS-textbook framing), so recognizing that "White/Gray/Black" and "visited/in_path" describe the identical underlying technique is worth knowing, even if one version feels more natural to code from memory than the other.

### Twist 2: Detect cycle in a directed graph using Kahn's Algorithm (BFS-based topological sort) instead of DFS
**The trap**: this is a genuinely different, equally valid approach worth knowing exists (full treatment in file 123) — a directed graph has a valid topological ordering if and only if it's acyclic; Kahn's Algorithm attempts to build such an ordering via BFS and in-degree tracking, and if it's unable to include ALL nodes in the final ordering (some nodes never reach in-degree 0), that failure itself proves the graph contains a cycle — an entirely different mechanism for proving the same underlying fact (DAG-ness) compared to the DFS-based `in_path` tracking approach here.

## Interview Q&A

**Q1: Why does the "visited but not the parent" trick used for undirected cycle detection fail for directed graphs, requiring the different `in_path` tracking approach instead?**
In an undirected graph, every edge is bidirectional and stored twice, so the only "expected" already-visited neighbor from any node's perspective is its immediate parent — any OTHER already-visited neighbor must indicate a genuine second path, hence a cycle. In a directed graph, edges only go one way, so a node can be legitimately reached via multiple entirely different, non-cyclic directed paths from different ancestors (e.g., a diamond-shaped DAG) — simply checking "is this neighbor visited and not my parent" would incorrectly flag such a legitimately-acyclic structure as cyclic. The correct check needs to distinguish "this neighbor was fully explored on some ENTIRELY SEPARATE earlier branch that has already finished and backtracked" (not a cycle) from "this neighbor is an ANCESTOR still currently being explored on THIS SAME active path" (a genuine cycle, since it means there's a path leading back to something still above us in the current exploration) — exactly what `in_path` tracks that plain `visited` cannot.

**Q2: Why is it critical to un-mark a node from `in_path` (set it back to false) after finishing its exploration, even though it remains permanently marked in `visited`?**
`in_path` is meant to represent "is this node an ancestor on the CURRENTLY active exploration path," which is inherently a temporary condition tied to where the DFS currently is in its exploration — once a node's entire subtree of reachable nodes has been fully explored and the recursion backtracks past it, that node is no longer an ancestor of anything currently being explored, so it must be un-marked to accurately reflect this. If `in_path` were never cleared (left permanently true once set, just like `visited`), it would become functionally identical to `visited`, defeating its entire purpose — any later DFS branch that happens to reach that already-fully-explored node would incorrectly see it as "still in the active path" and falsely report a cycle, even if that node is actually long done and sits on a completely different part of the graph now.

**Q3: What is the conceptual equivalence between the "visited / in_path" two-boolean-array approach and the classic "White / Gray / Black" three-color coding scheme for directed cycle detection?**
They describe the exact same underlying algorithm using different terminology: WHITE corresponds to a node that's entirely unvisited (`visited=False`); GRAY corresponds to a node currently on the active exploration path, equivalent to `visited=True AND in_path=True`; and BLACK corresponds to a node that has been fully explored and backtracked from, equivalent to `visited=True AND in_path=False`. The core cycle-detection logic is identical either way: encountering a GRAY node (or equivalently, a node with `in_path=True`) during exploration signals a genuine back edge and thus a cycle, while encountering a BLACK node (fully done, `visited=True, in_path=False`) is perfectly normal and doesn't indicate anything problematic — the three-color scheme is simply a more compact way of encoding the same two independent pieces of boolean state into a single variable per node.
