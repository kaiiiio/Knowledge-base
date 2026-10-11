# Strongly Connected Components (Kosaraju's Algorithm)

Simple words, step by step.

## What is a Strongly Connected Component (SCC)?
In a DIRECTED graph, an SCC is a maximal group of nodes where every node can reach every other node in the group, following directed edges (in both directions, via some path). This is a directed-graph-specific concept — undirected connected components (file 111) don't need this distinction, since undirected reachability is automatically symmetric.

## The idea: Kosaraju's Algorithm — three clean steps
1. Run DFS on the original graph, and record nodes in order of **finish time** (postorder — exactly file 119's topological-sort technique, reused here for a different purpose).
2. **Reverse every edge** in the graph (transpose it).
3. Run DFS on the REVERSED graph, processing nodes in **decreasing finish-time order** (from step 1) — each DFS tree formed in this step is exactly one SCC.

```python
def kosaraju_scc(n, edges):
    graph = [[] for _ in range(n)]
    reverse_graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        reverse_graph[v].append(u)          # build the TRANSPOSE graph simultaneously

    visited = [False] * n
    finish_order = []

    def dfs1(node):                            # Step 1: record finish order on the ORIGINAL graph
        visited[node] = True
        for neighbor in graph[node]:
            if not visited[neighbor]:
                dfs1(neighbor)
        finish_order.append(node)

    for node in range(n):
        if not visited[node]:
            dfs1(node)

    visited = [False] * n
    sccs = []

    def dfs2(node, component):                  # Step 3: explore the REVERSED graph
        visited[node] = True
        component.append(node)
        for neighbor in reverse_graph[node]:
            if not visited[neighbor]:
                dfs2(neighbor, component)

    for node in reversed(finish_order):          # process in DECREASING finish-time order
        if not visited[node]:
            component = []
            dfs2(node, component)
            sccs.append(component)

    return sccs
```
```javascript
function kosarajuSCC(n, edges) {
    const graph = Array.from({ length: n }, () => []);
    const reverseGraph = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) {
        graph[u].push(v);
        reverseGraph[v].push(u);                   // build the TRANSPOSE graph simultaneously
    }

    let visited = new Array(n).fill(false);
    const finishOrder = [];

    function dfs1(node) {                             // Step 1: record finish order on the ORIGINAL graph
        visited[node] = true;
        for (const neighbor of graph[node]) {
            if (!visited[neighbor]) dfs1(neighbor);
        }
        finishOrder.push(node);
    }

    for (let node = 0; node < n; node++) {
        if (!visited[node]) dfs1(node);
    }

    visited = new Array(n).fill(false);
    const sccs = [];

    function dfs2(node, component) {                     // Step 3: explore the REVERSED graph
        visited[node] = true;
        component.push(node);
        for (const neighbor of reverseGraph[node]) {
            if (!visited[neighbor]) dfs2(neighbor, component);
        }
    }

    for (let i = finishOrder.length - 1; i >= 0; i--) {     // process in DECREASING finish-time order
        const node = finishOrder[i];
        if (!visited[node]) {
            const component = [];
            dfs2(node, component);
            sccs.push(component);
        }
    }

    return sccs;
}
```
**Speed**: O(V + E) — two full DFS passes (one on the original graph, one on the transpose), each O(V + E), plus O(E) to build the transpose.

## Why this works (the intuition, without a full formal proof)
Processing nodes in DECREASING finish-time order on the REVERSED graph guarantees that whenever a new DFS tree is started, the chosen node cannot be reached by anything already explored (since it was true in the original graph that this node's SCC "finished late," implying nothing else can route back into it from already-completed components, now using reversed edges) — each resulting DFS tree correctly captures exactly one complete SCC, no more and no less.

## Rules to remember
- **This directly reuses file 119's topological-sort DFS technique for Step 1** — recognizing "finish-time ordering" as a tool, not just a topological-sort-specific trick, is the key transferable insight; it's repurposed here for a completely different end goal (finding SCCs rather than finding a dependency order).
- **The "reverse the graph" step is the single most distinctive, easy-to-forget operation specific to this algorithm** — building a correct transpose graph (every edge flipped) is essential and easy to get backward if rushed.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Condense each SCC into a single "super-node" — what structure results?
**The trap**: condensing every SCC into one node and keeping only the edges BETWEEN different SCCs always produces a DAG (Directed Acyclic Graph) — this is a provable structural fact (if the condensation had a cycle, those "different" SCCs would actually all be reachable from each other, contradicting that they were separate SCCs to begin with); this "condensation graph" concept is a common follow-up question testing deeper understanding of what SCCs structurally represent.

### Twist 2: Tarjan's Algorithm (single-pass, using disc/low-link, similar to files 132-133) also finds SCCs — how does it differ from Kosaraju's?
**The trap**: Tarjan's SCC algorithm uses the SAME disc/low-link machinery from Bridges/Articulation Points, combined with an explicit stack tracking "nodes currently being considered," finding all SCCs in a SINGLE DFS pass (rather than Kosaraju's two full passes) — it's more efficient in practice (one traversal instead of two) but conceptually more intricate to implement correctly; recognizing that multiple valid SCC algorithms exist, with different tradeoffs between implementation simplicity (Kosaraju's, easier to reason about) and single-pass efficiency (Tarjan's) is a reasonable thing to mention even without implementing Tarjan's version from scratch.

## Interview Q&A

**Q1: Why does Strongly Connected Components matter as a concept specifically for DIRECTED graphs, but not really for undirected graphs?**
In an undirected graph, if node A can reach node B via some path, then by definition node B can also reach node A (simply traverse that same path backward, since every edge works both ways) — meaning "connected component" and "strongly connected component" collapse into the exact same concept trivially. In a directed graph, reachability is NOT automatically symmetric: A might be able to reach B via directed edges without B being able to reach A back — SCCs specifically capture groups where this mutual, bidirectional reachability genuinely holds for every pair within the group, a meaningfully distinct and non-trivial property specific to directed graphs.

**Q2: Why does processing nodes in DECREASING finish-time order (from the first DFS pass) on the REVERSED graph correctly isolate individual SCCs, rather than some other processing order?**
The finish-time ordering from the first pass essentially ranks nodes by "how deep/late their exploration concluded" in the original graph's directed structure — a node that finishes LAST is guaranteed to not be reachable (in the original graph) from nodes that already finished earlier in a way that would "swallow" it into their already-explored subtree. When exploring the REVERSED graph starting from the latest-finishing remaining node, the DFS can only reach nodes that are part of the SAME strongly connected component (since reaching anything further, via reversed edges, would have implied a mutual reachability relationship that should have already been captured by an earlier, differently-ordered exploration) — this specific combination of "reverse the graph" and "process in decreasing finish-time order" is precisely what the formal correctness proof of Kosaraju's algorithm establishes, and the intuition above captures the gist without needing the full formal argument.

**Q3: What is the "condensation graph" of a directed graph's SCCs, and why is it guaranteed to always be a DAG, regardless of the original graph's structure?**
The condensation graph is formed by collapsing each entire SCC into a single representative "super-node," keeping only the edges that connect DIFFERENT SCCs to each other (edges within the same SCC are discarded, since they're now internal to a single super-node). This resulting graph is always acyclic because if it DID contain a cycle among super-nodes, that would mean there's a way to travel from any one of those "different" SCCs, through the cycle, and back to itself — which would actually prove all of those SCCs are mutually reachable from each other and should have been merged into one single larger SCC in the first place, directly contradicting the assumption that they were correctly identified as separate, maximal SCCs.
