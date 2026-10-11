# Articulation Points (Tarjan's Algorithm)

Simple words, step by step.

## The question
An **articulation point** (cut vertex) is a node that, if removed (along with all its edges), increases the number of connected components. Find all articulation points in an undirected graph.

## The idea: the SAME disc/low-link machinery as Bridges (file 132), with a different final condition
A node `u` (that is NOT the DFS root) is an articulation point if it has at least one child `v` in the DFS tree such that `low[v] >= disc[u]` (note: `>=`, not strict `>` as in the bridge condition) — meaning `v`'s subtree has no way to reach back to an ANCESTOR of `u` (it's allowed to reach `u` itself, unlike the bridge case, which is why the condition uses `>=` instead of `>`).

**The ROOT node is a special case**: it's an articulation point if and only if it has **two or more children** in the DFS tree (removing it would split those children's subtrees into separate components).

```python
def find_articulation_points(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)
        graph[v].append(u)

    disc = [-1] * n
    low = [-1] * n
    articulation = [False] * n
    timer = [0]

    def dfs(node, parent):
        disc[node] = low[node] = timer[0]
        timer[0] += 1
        children = 0
        for neighbor in graph[node]:
            if neighbor == parent:
                continue
            if disc[neighbor] == -1:
                children += 1
                dfs(neighbor, node)
                low[node] = min(low[node], low[neighbor])
                if parent != -1 and low[neighbor] >= disc[node]:
                    articulation[node] = True          # non-root articulation point condition
            else:
                low[node] = min(low[node], disc[neighbor])
        if parent == -1 and children >= 2:
            articulation[node] = True                    # ROOT special case: needs 2+ children
        return

    for start in range(n):
        if disc[start] == -1:
            dfs(start, -1)
    return [i for i in range(n) if articulation[i]]
```
```javascript
function findArticulationPoints(n, edges) {
    const graph = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) {
        graph[u].push(v);
        graph[v].push(u);
    }

    const disc = new Array(n).fill(-1);
    const low = new Array(n).fill(-1);
    const articulation = new Array(n).fill(false);
    let timer = 0;

    function dfs(node, parent) {
        disc[node] = low[node] = timer++;
        let children = 0;
        for (const neighbor of graph[node]) {
            if (neighbor === parent) continue;
            if (disc[neighbor] === -1) {
                children += 1;
                dfs(neighbor, node);
                low[node] = Math.min(low[node], low[neighbor]);
                if (parent !== -1 && low[neighbor] >= disc[node]) {
                    articulation[node] = true;              // non-root articulation point condition
                }
            } else {
                low[node] = Math.min(low[node], disc[neighbor]);
            }
        }
        if (parent === -1 && children >= 2) {
            articulation[node] = true;                        // ROOT special case: needs 2+ children
        }
    }

    for (let start = 0; start < n; start++) {
        if (disc[start] === -1) dfs(start, -1);
    }
    return Array.from({ length: n }, (_, i) => i).filter(i => articulation[i]);
}
```
**Speed**: O(V + E) — identical structure and cost to Bridges (file 132), reusing the exact same disc/low-link machinery.

## Rules to remember
- **Bridges use strict `>`; articulation points use `>=` — this single symbol difference is the entire distinction between the two algorithms**, and it's rooted in a real conceptual difference: a bridge requires the child's subtree to have NO path back to `u` OR anything before it; an articulation point only requires NO path back to anything BEFORE `u` (reaching `u` itself through some other route is fine, since removing `u` would still disconnect that subtree from the rest of the graph regardless).
- **The root special case is the single most commonly forgotten detail** — the general `low[child] >= disc[node]` condition is explicitly guarded with `parent != -1` (skipping it for the root), and a SEPARATE check (`children >= 2`) handles the root instead; forgetting this split logic is the most common bug when implementing this algorithm from memory.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Why does the root need 2+ DFS children specifically, rather than just 1?
**The trap**: a root with only ONE child necessarily has its entire reachable graph structured as a single subtree hanging off of it — removing the root in that case still leaves that one subtree fully connected to itself (nothing was relying on routing THROUGH the root to reach something else), so it's not actually a cut vertex. Only when the root has TWO OR MORE separate children does removing the root actually split those children's respective subtrees apart from each other, since (in an undirected DFS tree) there's no other edge connecting sibling subtrees except through their shared root.

### Twist 2: A graph with NO articulation points at all — what does that structurally imply?
**The trap**: a connected graph with zero articulation points is called **biconnected** — meaning every pair of nodes has at least TWO independent paths between them (no single point of failure anywhere), a genuinely useful structural property in network reliability contexts; recognizing this terminology ("biconnected graph/component") is a reasonable thing an interviewer might probe for, as a direct consequence of understanding what "zero articulation points" structurally means.

## Interview Q&A

**Q1: Why does the articulation point condition use `low[child] >= disc[node]` while the bridge condition uses strict `low[child] > disc[node]` — what's the conceptual reason for this difference?**
A bridge requires that removing the SINGLE EDGE disconnects the graph — this demands the child's subtree have absolutely no alternate path back to `node` or anything before it, including no path back to `node` itself, hence strict `>`. An articulation point instead asks whether removing the NODE disconnects things — in this case, the child's subtree being able to reach back to `node` itself (but not any ancestor OF `node`) doesn't help, because `node` itself is the thing being removed; what matters is whether the subtree can escape to anything that exists independently of `node`, which is exactly what `>=` correctly captures by still flagging `node` as critical even when the child's low-link value only reaches back as far as `node` itself (not past it).

**Q2: Why does the root of the DFS tree require special-case handling (checking for 2+ children) rather than using the same general low-link condition applied to every other node?**
The general condition fundamentally relies on comparing a child's low-link value against the root's OWN discovery time to detect whether removing the current node would cut off that child's escape route — but the root has no parent and no ancestor to compare against in the first place, making the general low-link-based reasoning not directly applicable to it. Instead, the root is an articulation point specifically based on a structural fact unique to roots: if it has two or more separate DFS children, those children's entire subtrees have no other connection to each other except through the root itself (since all paths between different subtrees in an undirected DFS tree must pass through their common ancestor), so removing the root would isolate those subtrees from one another.

**Q3: What does it mean, structurally, for a connected graph to have ZERO articulation points, and what is the standard term for this property?**
A connected graph with no articulation points at all is called "biconnected" — it means that for every single node in the graph, removing that node (and its edges) still leaves the rest of the graph fully connected, which in turn implies that every pair of nodes in the graph has at least two independent, non-overlapping paths connecting them (no reliance on any single "bottleneck" node). This is a meaningful structural robustness property, often relevant in network design contexts where resilience to any single point of failure is a design goal.
