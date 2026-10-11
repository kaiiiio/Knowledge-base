# Course Schedule

Simple words, step by step.

## The question
Given `numCourses` and a list of prerequisite pairs `[course, prerequisite]` (meaning `prerequisite` must be taken before `course`), determine whether it's possible to finish all courses.

## The reframing: this IS cycle detection in a directed graph
Each course is a node; each prerequisite pair `[course, prerequisite]` is a directed edge `prerequisite -> course`. "Is it possible to finish all courses" is exactly "does this directed graph contain a cycle" (if there's a cycle, those courses depend on each other circularly and can never be completed) — this is a direct, near-verbatim application of file 118's cycle detection.

```python
def can_finish(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    for course, prereq in prerequisites:
        graph[prereq].append(course)          # prereq -> course

    visited = [False] * num_courses
    in_path = [False] * num_courses

    def has_cycle(node):
        visited[node] = True
        in_path[node] = True
        for neighbor in graph[node]:
            if in_path[neighbor]:
                return True
            if not visited[neighbor] and has_cycle(neighbor):
                return True
        in_path[node] = False
        return False

    for course in range(num_courses):
        if not visited[course]:
            if has_cycle(course):
                return False                     # a cycle exists -- impossible to finish all courses
    return True
```
```javascript
function canFinish(numCourses, prerequisites) {
    const graph = Array.from({ length: numCourses }, () => []);
    for (const [course, prereq] of prerequisites) {
        graph[prereq].push(course);               // prereq -> course
    }

    const visited = new Array(numCourses).fill(false);
    const inPath = new Array(numCourses).fill(false);

    function hasCycle(node) {
        visited[node] = true;
        inPath[node] = true;
        for (const neighbor of graph[node]) {
            if (inPath[neighbor]) return true;
            if (!visited[neighbor] && hasCycle(neighbor)) return true;
        }
        inPath[node] = false;
        return false;
    }

    for (let course = 0; course < numCourses; course++) {
        if (!visited[course] && hasCycle(course)) return false;    // a cycle exists -- impossible
    }
    return true;
}
```
**Speed**: O(V + E) where V = numCourses, E = number of prerequisite pairs — identical to plain cycle detection.

## Rules to remember
- **This problem exists specifically to test whether you recognize a word problem as a disguised graph problem** — the actual algorithmic content (directed cycle detection) was already fully solved in file 118; the entire "new" skill here is the translation step: "prerequisite pairs" → "directed edges," "can all courses be finished" → "is the graph acyclic." Recognizing this translation quickly, rather than trying to invent a new algorithm from scratch, is the real interview signal.
- Getting the EDGE DIRECTION right is a common, easy-to-make mistake: the edge must point FROM the prerequisite TO the course that depends on it (`prereq -> course`), not the reverse — since "finishing course X requires prerequisite Y first" means Y must come before X in any valid completion order, matching the "topological order" framing from file 119 directly.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Return the ACTUAL valid course order (not just yes/no) — this is "Course Schedule II"
**The trap**: this is explicitly the next file (121) — recognizing this problem as "topological sort" rather than "just cycle detection" the moment an actual ORDER is requested (not just a boolean feasibility check) is the key realization; the graph construction is identical, but the algorithm needed shifts from pure cycle detection (file 118) to full topological sort (file 119), since producing an order requires the complete topological-sort machinery, not just a cycle check.

### Twist 2: Solve using Kahn's Algorithm (BFS-based) instead of DFS — does the cycle-detection logic look different?
```python
from collections import deque

def can_finish_bfs(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    in_degree = [0] * num_courses
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1

    queue = deque([c for c in range(num_courses) if in_degree[c] == 0])
    completed = 0
    while queue:
        node = queue.popleft()
        completed += 1
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    return completed == num_courses          # if not all courses were processed, a cycle blocked some of them
```
**The trap**: this is Kahn's Algorithm (full treatment in file 123) applied directly — instead of explicit `in_path` tracking, cycle presence is detected implicitly: if the graph has a cycle, the courses involved in that cycle will NEVER reach `in_degree == 0` (since their dependencies include each other, circularly), so they never get added to the queue or counted in `completed` — checking `completed == num_courses` at the end is a clean, different-looking but equally valid way to detect the exact same underlying cycle condition.

## Interview Q&A

**Q1: Why does "can all courses be finished" reduce exactly to "does this directed graph contain a cycle," rather than needing some other graph property check?**
Because a cycle in this specific graph means a group of courses that depend on each other in a circular chain — course A requires course B, which requires course C, which requires course A again. There's no possible starting point to begin satisfying this chain of prerequisites, since every course in the cycle is blocked waiting on another course within the same cycle. Conversely, if NO cycle exists (the graph is a genuine DAG), a valid topological ordering is guaranteed to exist (this is in fact the defining property of a DAG), meaning there's always some valid sequence in which every course's prerequisites are satisfied before attempting it — so acyclicity is both necessary and sufficient for "all courses can be finished."

**Q2: What's the easy-to-make mistake regarding edge direction when translating "prerequisite pairs" into a graph, and why does getting it backward not immediately look wrong?**
The natural-sounding direction might seem to be "course -> prerequisite" (reading the pair `[course, prerequisite]` left to right as if it were describing an edge directly), but the CORRECT direction is actually "prerequisite -> course," since the prerequisite must be completed FIRST, meaning it should point TOWARD the thing that depends on it, matching the topological-order convention "A -> B means A comes before B." Getting this backward doesn't immediately "look" wrong because cycle detection would still run and produce some answer — the subtle bug is that it would be checking cycles on a graph representing the exact opposite dependency relationship, which could, depending on the specific input, happen to still output the correct boolean answer by coincidence in simple cases, while being fundamentally conceptually wrong and prone to producing incorrect results for more complex dependency graphs or if ever extended to need an actual valid order (file 121).

**Q3: How does Kahn's Algorithm implicitly detect a cycle without any explicit `in_path`/ancestor-tracking logic, the way the DFS approach requires?**
Kahn's Algorithm repeatedly processes nodes whose in-degree has dropped to zero (meaning all of their prerequisites have already been satisfied and removed from consideration) — a node trapped in a cycle can never reach in-degree zero, because its in-degree only decreases when one of ITS prerequisites gets processed first, but within a cycle, every node's prerequisites circularly depend on other nodes within that same cycle, none of which can ever become eligible for processing first. This means nodes caught in a cycle simply never get added to the queue or counted as completed — checking whether the total number of successfully processed nodes equals the total number of nodes in the graph is therefore a clean, indirect way of detecting "some nodes were permanently blocked by a cycle," without needing to explicitly track or reason about ancestor relationships the way the DFS-based `in_path` approach does.
