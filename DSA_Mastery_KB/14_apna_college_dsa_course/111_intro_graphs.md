# Introduction to Graphs

Simple words, step by step.

## What is a graph?
A graph is a set of **nodes (vertices)** connected by **edges**. Unlike trees (which have a strict hierarchical root-to-leaf shape and no cycles), a graph can have cycles, disconnected pieces, and no designated "root" at all.

## Key vocabulary
- **Directed vs Undirected**: in a directed graph, an edge `u -> v` only lets you travel from `u` to `v`, not back. In an undirected graph, an edge `u - v` allows travel both ways.
- **Weighted vs Unweighted**: edges can have a cost/weight (used in shortest-path algorithms like Dijkstra's) or simply represent a connection with no associated cost.
- **Cycle**: a path that starts and ends at the same node without reusing an edge.
- **Connected (undirected graphs)**: every node can reach every other node. A graph can have multiple **connected components** if it's not fully connected.
- **Degree** (undirected): number of edges touching a node. **In-degree / out-degree** (directed): number of incoming / outgoing edges.

## Representations

### 1. Adjacency List (the most commonly used representation)
```python
from collections import defaultdict

def build_adjacency_list(n, edges, directed=False):
    graph = defaultdict(list)
    for u, v in edges:
        graph[u].append(v)
        if not directed:
            graph[v].append(u)          # undirected -- add the reverse edge too
    return graph
```
```javascript
function buildAdjacencyList(n, edges, directed = false) {
    const graph = new Map();
    for (let i = 0; i < n; i++) graph.set(i, []);
    for (const [u, v] of edges) {
        graph.get(u).push(v);
        if (!directed) graph.get(v).push(u);     // undirected -- add the reverse edge too
    }
    return graph;
}
```
**Space**: O(V + E) — this is the standard choice for most graph problems, since it's space-efficient for sparse graphs (where E is much smaller than V²) and allows O(1) average iteration over a node's neighbors.

### 2. Adjacency Matrix
```python
def build_adjacency_matrix(n, edges, directed=False):
    matrix = [[0] * n for _ in range(n)]
    for u, v in edges:
        matrix[u][v] = 1
        if not directed:
            matrix[v][u] = 1
    return matrix
```
**Space**: O(V²) — wasteful for sparse graphs, but offers O(1) "is there an edge between u and v" lookups, which an adjacency list can't do without scanning a neighbor list. Preferred when the graph is dense, or when frequent edge-existence queries are the dominant operation.

## Rules to remember
- **Adjacency list is the default choice for almost all interview problems** — it's what you should reach for unless the problem specifically benefits from O(1) edge-existence checks or the graph is known to be dense.
- A tree (from the entire previous module) is technically a special case of a graph: specifically, a **connected, undirected, acyclic** graph with exactly `n-1` edges for `n` nodes — recognizing this relationship means many graph techniques (BFS, DFS) are actually direct generalizations of tree traversal techniques already learned, not brand-new ideas.
- Graph problems are often given as an **edge list** (pairs of connected nodes) rather than pre-built adjacency structures — converting the input into an adjacency list is almost always the first step of any graph solution.

## Twisted Tricky Examples (with Solutions)

### Twist 1: The graph has SELF-LOOPS (an edge from a node to itself) or MULTIPLE EDGES between the same pair of nodes
**The trap**: self-loops and multi-edges are valid in general graph theory but can silently break algorithms that implicitly assume simple graphs (no self-loops, no duplicate edges) — for instance, a naive cycle-detection algorithm might need explicit handling to avoid treating a self-loop as a trivial always-present cycle in ways that confuse the intended problem; always clarify with the interviewer whether self-loops or multi-edges are possible inputs, since many real-world problem statements implicitly guarantee a "simple graph" without stating it outright.

### Twist 2: Disconnected graph — a single BFS/DFS starting from one node won't visit everything
```python
def visit_all_components(n, graph):
    visited = [False] * n
    components = 0
    for node in range(n):
        if not visited[node]:
            components += 1
            # run BFS or DFS starting from `node`, marking everything reachable as visited
            dfs_mark_visited(node, graph, visited)
    return components
```
**The trap**: a very common bug in graph problems is running a single traversal starting from node `0` (or some assumed starting point) and silently missing entire disconnected components — the standard, essential fix is an OUTER loop over every node from `0` to `n-1`, only starting a new traversal when a node hasn't been visited yet by any previous traversal; this "loop over all nodes, skip already-visited ones" pattern appears in nearly every graph problem that doesn't explicitly guarantee full connectivity.

## Interview Q&A

**Q1: Why is an adjacency list generally preferred over an adjacency matrix for most graph problems, despite the matrix offering faster edge-existence lookups?**
An adjacency list uses O(V + E) space, which scales efficiently with the actual number of edges present — for sparse graphs (common in most realistic and interview scenarios, where E is much smaller than V²), this is dramatically more space-efficient than an adjacency matrix's fixed O(V²) space regardless of how many edges actually exist. Most graph algorithms (BFS, DFS, Dijkstra's, etc.) primarily need to iterate over "all neighbors of a given node," which an adjacency list supports efficiently (proportional to the actual number of neighbors), while a matrix would require scanning an entire row of size V even for a node with very few actual neighbors — making the list representation both more space- and time-efficient for the operations most graph algorithms actually perform.

**Q2: How is a tree related to a graph, and why does understanding this relationship help when learning graph algorithms?**
A tree is a specific, constrained special case of a graph: it's connected (every node reachable from every other), undirected, and acyclic, with exactly one fewer edge than the number of nodes. Recognizing this means that traversal techniques already mastered for trees (BFS/level-order, DFS/preorder-postorder-inorder) are not fundamentally new ideas when applied to graphs — they're direct generalizations, with the key new considerations being the possibility of cycles (requiring a `visited` set to avoid infinite loops, something trees never needed since they're acyclic by definition) and the possibility of disconnected components (requiring the outer "loop over all nodes" pattern, something trees never needed since a single traversal from the root always reaches every node in a connected tree).

**Q3: Why is explicitly tracking a `visited` array/set essential for graph traversal, when it was never strictly necessary for tree traversal?**
Trees are acyclic by definition, meaning there's no way to revisit a node by following edges downward from the root — every node has exactly one path leading to it from the root, so a traversal naturally terminates without ever needing to check if a node was already processed. Graphs, by contrast, can contain cycles — following edges can lead back to an already-visited node, and without explicit tracking, a traversal algorithm would loop infinitely, repeatedly re-processing the same cycle of nodes forever. The `visited` tracking structure is what prevents this, ensuring each node is processed exactly once regardless of how many different paths/cycles might lead back to it.
