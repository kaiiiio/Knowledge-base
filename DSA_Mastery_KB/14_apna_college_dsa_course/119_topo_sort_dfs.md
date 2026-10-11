# Topological Sort (DFS)

Simple words, step by step.

## The question
Given a **Directed Acyclic Graph (DAG)** — a directed graph with no cycles — produce an ordering of all nodes such that for every directed edge `u -> v`, `u` appears **before** `v` in the ordering. (If the graph has a cycle, no valid topological ordering exists at all — connecting directly to file 118.)

## Real-world framing
Think of each node as a task, and each edge `u -> v` as "task u must be completed before task v." Topological sort produces a valid order to complete all tasks respecting every such dependency (this is exactly the framing used in Course Schedule, files 120-121).

## The idea: DFS, but add a node to the result only AFTER all its dependencies (everything it points to) have been fully processed
```python
def topological_sort(n, edges):
    graph = [[] for _ in range(n)]
    for u, v in edges:
        graph[u].append(v)

    visited = [False] * n
    result = []

    def dfs(node):
        visited[node] = True
        for neighbor in graph[node]:
            if not visited[neighbor]:
                dfs(neighbor)
        result.append(node)          # add to result AFTER all neighbors (dependencies) are done -- postorder-style

    for start in range(n):
        if not visited[start]:
            dfs(start)

    result.reverse()                  # reverse postorder gives a valid topological order
    return result
```
```javascript
function topologicalSort(n, edges) {
    const graph = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) {
        graph[u].push(v);
    }

    const visited = new Array(n).fill(false);
    const result = [];

    function dfs(node) {
        visited[node] = true;
        for (const neighbor of graph[node]) {
            if (!visited[neighbor]) dfs(neighbor);
        }
        result.push(node);              // add to result AFTER all neighbors (dependencies) are done -- postorder-style
    }

    for (let start = 0; start < n; start++) {
        if (!visited[start]) dfs(start);
    }

    result.reverse();                    // reverse postorder gives a valid topological order
    return result;
}
```
**Speed**: O(V + E) — standard DFS traversal bound, plus O(V) for the final reversal.

## Why "reverse postorder" produces a valid topological order
A node is appended to `result` only once ALL of its outgoing neighbors (things it depends on, or that must come after it) have been fully processed and already appended. This means in the raw (unreversed) `result` list, every node appears AFTER everything it points to — exactly backward from what's needed. Reversing the whole list at the end flips this, so every node now correctly appears BEFORE everything it points to.

## Dry run
Edges: `5->2, 5->0, 4->0, 4->1, 2->3, 3->1`.
- DFS from `5`: visit `5`. Neighbor `2` (unvisited) → DFS into `2`. Visit `2`. Neighbor `3` (unvisited) → DFS into `3`. Visit `3`. Neighbor `1` (unvisited) → DFS into `1`. Visit `1`, no neighbors → append `1`. Back in `3`: no more neighbors → append `3`. Back in `2`: no more neighbors → append `2`. Back in `5`: neighbor `0` (unvisited) → DFS into `0`. Visit `0`, no neighbors → append `0`. Back in `5`: no more neighbors → append `5`.
- `result` so far (raw, before full graph covered): `[1, 3, 2, 0, 5]`.
- DFS from `4` (still unvisited): visit `4`. Neighbor `0` (already visited, skip). Neighbor `1` (already visited, skip). No more neighbors → append `4`.
- Final raw `result`: `[1, 3, 2, 0, 5, 4]`. Reversed: `[4, 5, 0, 2, 3, 1]` — a valid topological order (check: `5` before `2` ✓, `5` before `0` ✓, `4` before `0` ✓, `4` before `1` ✓, `2` before `3` ✓, `3` before `1` ✓).

## Rules to remember
- **Topological sort only exists for a DAG — a graph with a cycle has no valid topological ordering at all.** This algorithm as written doesn't explicitly check for cycles — if cycle-freedom isn't already guaranteed, file 118's `in_path` cycle-detection logic should be combined with (or run before) this algorithm to correctly detect and report the "no valid ordering exists" case.
- **Multiple valid topological orderings can exist for the same DAG** — this algorithm produces exactly one of potentially many valid orderings (depending on which node each loop iteration starts from, and the order neighbors are iterated), and all of them are equally "correct" answers, unless a problem asks for something more specific (like "lexicographically smallest topological order," which needs a different approach, often using a min-heap alongside Kahn's Algorithm, file 123).

## Twisted Tricky Examples (with Solutions)

### Twist 1: The graph has a cycle — how would this specific algorithm behave (silently wrong, or does it detect the problem)?
**The trap**: this is an important, often-overlooked caveat — the plain DFS-based topological sort as written does NOT detect cycles on its own; if run on a graph containing a cycle, it will still produce SOME ordering (just not a logically valid "respects all dependencies" one), silently returning an incorrect result without any error or warning. A robust implementation intended for untrusted/unverified input should explicitly combine this with cycle detection (file 118's `in_path` tracking) and only trust the resulting order if the graph was confirmed acyclic — never assume a "successful-looking" output automatically means the input was a valid DAG.

### Twist 2: Produce the topological order using Kahn's Algorithm (BFS-based) instead — does it give the SAME exact ordering?
**The trap**: not necessarily — Kahn's Algorithm (full treatment in file 123) is a genuinely different mechanism (repeatedly removing nodes with in-degree 0) that also produces a VALID topological ordering, but since multiple valid orderings can exist for the same DAG, DFS-based and BFS-based (Kahn's) approaches can produce DIFFERENT (yet equally valid) orderings for the identical input graph — neither is "more correct" than the other; they're just two different mechanisms that both happen to satisfy the same correctness requirement (respecting all edge dependencies), without necessarily agreeing on every output order.

## Interview Q&A

**Q1: Why does appending a node to the result list only AFTER processing all of its neighbors, then reversing the entire list at the end, produce a valid topological order?**
Appending a node only after its neighbors ensures that, in the raw (unreversed) list, a node always appears somewhere after everything it points to (its dependencies get fully processed and appended first). This is the exact opposite of what a topological order requires (where a node should come BEFORE everything it points to) — but since this "backward" relationship holds consistently for every single edge in the raw list, simply reversing the entire list at the end flips every one of these relationships simultaneously and correctly, producing a list where every node now correctly precedes everything it points to.

**Q2: Why is it important to recognize that the plain DFS-based topological sort algorithm does NOT, by itself, detect whether the input graph actually contains a cycle?**
Because the algorithm's logic (DFS, append after processing neighbors, reverse) will execute to completion and produce SOME ordering regardless of whether the input graph is a genuine DAG or contains a cycle — there's no check built into this specific algorithm that would cause it to fail, error out, or otherwise signal "this input was invalid" if a cycle is present. If the input isn't already guaranteed to be acyclic by the problem's constraints, blindly trusting this algorithm's output without first (or simultaneously) verifying acyclicity via a separate cycle-detection pass (file 118) risks silently accepting a meaningless, logically-invalid ordering as if it were a correct answer.

**Q3: Since both DFS-based and Kahn's-Algorithm-based (BFS) approaches correctly produce valid topological orderings, why might an interviewer still care about which one is used, or ask for both?**
While both are correct for the general "produce a valid ordering" requirement, they differ in auxiliary properties useful for specific follow-up requirements: Kahn's Algorithm, being BFS/queue-based, naturally extends to producing a "lexicographically smallest" topological order by substituting a min-heap for the plain queue (a natural extension that doesn't adapt as cleanly to the DFS-based approach), and Kahn's Algorithm also naturally detects cycles as a side effect of its own mechanics (if it can't process all nodes, a cycle exists) without needing any separate auxiliary tracking, whereas the DFS-based version needs explicit additional `in_path` logic bolted on for the same cycle-detection capability. An interviewer might ask for both specifically to assess whether a candidate understands these practical tradeoffs, rather than just memorizing one specific implementation as "the" way to do topological sort.
