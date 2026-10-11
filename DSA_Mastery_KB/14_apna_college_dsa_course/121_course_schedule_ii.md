# Course Schedule II

Simple words, step by step.

## The question
Same setup as Course Schedule (file 120), but now return an ACTUAL valid order to complete all courses — or an empty array if it's impossible (a cycle exists).

## The reframing: this is topological sort (file 119), applied to the same graph construction as file 120
The only difference from file 120 is that a boolean "is it possible" answer is no longer enough — the full ordering itself is needed, so the complete topological-sort machinery must be used, not just cycle detection.

```python
def find_order(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    for course, prereq in prerequisites:
        graph[prereq].append(course)

    visited = [False] * num_courses
    in_path = [False] * num_courses
    result = []
    has_cycle = [False]

    def dfs(node):
        visited[node] = True
        in_path[node] = True
        for neighbor in graph[node]:
            if in_path[neighbor]:
                has_cycle[0] = True
                return
            if not visited[neighbor]:
                dfs(neighbor)
                if has_cycle[0]:
                    return
        in_path[node] = False
        result.append(node)          # postorder -- same reverse-postorder trick as file 119

    for course in range(num_courses):
        if not visited[course]:
            dfs(course)
            if has_cycle[0]:
                return []                # cycle detected -- no valid order exists

    result.reverse()
    return result
```
```javascript
function findOrder(numCourses, prerequisites) {
    const graph = Array.from({ length: numCourses }, () => []);
    for (const [course, prereq] of prerequisites) {
        graph[prereq].push(course);
    }

    const visited = new Array(numCourses).fill(false);
    const inPath = new Array(numCourses).fill(false);
    const result = [];
    let hasCycle = false;

    function dfs(node) {
        visited[node] = true;
        inPath[node] = true;
        for (const neighbor of graph[node]) {
            if (inPath[neighbor]) {
                hasCycle = true;
                return;
            }
            if (!visited[neighbor]) {
                dfs(neighbor);
                if (hasCycle) return;
            }
        }
        inPath[node] = false;
        result.push(node);              // postorder -- same reverse-postorder trick as file 119
    }

    for (let course = 0; course < numCourses; course++) {
        if (!visited[course]) {
            dfs(course);
            if (hasCycle) return [];        // cycle detected -- no valid order exists
        }
    }

    result.reverse();
    return result;
}
```
**Speed**: O(V + E) — combines cycle detection and topological sort into a single traversal (no need to run them as two separate passes).

## Alternative: Kahn's Algorithm (BFS) version — arguably cleaner for this specific problem
```python
from collections import deque

def find_order_bfs(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    in_degree = [0] * num_courses
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1

    queue = deque([c for c in range(num_courses) if in_degree[c] == 0])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return order if len(order) == num_courses else []     # incomplete order -- a cycle blocked some courses
```
**Why this is often preferred here**: Kahn's Algorithm naturally builds the order directly (in forward order, no need to reverse anything) WHILE simultaneously detecting cycles as a side effect (via the final length check) — combining both needs (order + cycle detection) with slightly less bookkeeping than the DFS version's explicit `has_cycle` flag threading.

## Rules to remember
- **This is file 120 + file 119, combined into a single pass** — recognizing "I already know how to do both of these pieces separately, I just need to combine them" is the key skill, rather than treating this as an unfamiliar new problem.
- When cycle detection AND the actual order are both needed from the same single traversal, it's more efficient to fold the cycle check directly into the topological-sort DFS (as shown) rather than running two completely separate full passes (one for cycle detection, one for the order) — though running them separately is also correct, just slightly less efficient.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Return ALL possible valid topological orderings, not just one
**The trap**: this requires a fundamentally different, more expensive approach — backtracking (files 44-50) over the choice of "which currently-eligible (in-degree 0) node to process next" at each step, exploring every possible choice recursively rather than greedily picking any available one; the number of valid orderings can be exponential in the worst case (a graph with many independent, unordered courses), so this variant is considerably more expensive and is really a backtracking problem wearing a topological-sort costume, not a simple extension of the single-order algorithms here.

### Twist 2: Some courses have MULTIPLE prerequisites — does the algorithm need any special handling?
**The trap**: no special handling needed at all — this is purely a confirmation, not a coding trap. The `in_degree` array (in the BFS/Kahn's version) or the `graph` adjacency list (in the DFS version) already naturally accumulates however many prerequisite relationships exist per course; a course only becomes eligible (in-degree reaches 0, or gets visited in the DFS version) once genuinely ALL of its prerequisites have been accounted for — the algorithm's correctness doesn't depend on any course having exactly one or any particular fixed number of prerequisites.

## Interview Q&A

**Q1: Why can the cycle-detection check and the topological-sort construction be combined into a single DFS pass here, rather than needing two completely separate traversals?**
Because both checks rely on fundamentally the same underlying traversal mechanics (DFS with `visited`/`in_path` tracking) — the cycle check (`in_path[neighbor]` being true) and the postorder-append-then-reverse logic for building the order can simply coexist within the same recursive function, checking for a cycle at exactly the same point where neighbors are being explored for the ordering purpose anyway. There's no inherent conflict or extra traversal needed to check both properties simultaneously, since they're both naturally computed as different observations made during the exact same single pass over the graph's structure.

**Q2: Why does Kahn's Algorithm (BFS-based) naturally produce the order in correct forward sequence without needing a final reversal step, unlike the DFS-based approach?**
Kahn's Algorithm processes nodes in the order they become "eligible" (reach in-degree zero), which directly corresponds to the order in which their prerequisites have all been satisfied — a node is only added to the queue (and subsequently to the output order) once everything it depends on has already been processed and removed from consideration. This means nodes are naturally appended to the result in a genuinely valid forward topological order as the algorithm runs, with no need for any reversal trick — contrasting with the DFS-based approach, where nodes get appended in POSTORDER (after all their dependents, the things that depend on THEM, in a different sense specific to that algorithm's own mechanics) specifically requiring the final list to be reversed to become a valid forward order.

**Q3: Why does the "return ALL possible valid topological orderings" variant require backtracking rather than being a simple extension of the single-order algorithms?**
Both the DFS-based and Kahn's-Algorithm-based single-order approaches work by making ONE specific (often arbitrary, among several valid) choice at each decision point — which unvisited neighbor to explore next in DFS, or which eligible (in-degree zero) node to process next in Kahn's — and committing to that choice without ever reconsidering it. Finding ALL valid orderings instead requires exploring EVERY possible choice at every single decision point, not just one, and then undoing (backtracking from) that choice to try the next alternative, which is exactly the "choose, explore, un-choose" backtracking template from the Recursion/Backtracking module (files 44-50) — a structurally different kind of exhaustive exploration than either of the single-order algorithms perform, and one that can produce an exponential number of total outputs in graphs with many independent branches.
