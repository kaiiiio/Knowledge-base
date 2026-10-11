# 05 — Graphs (Complete)

> Consolidated from all sub-notes into one comprehensive file.


---

# Intuition — Mental Models


## When To Use Adj List
_(source: `intuition\when_to_use_adj_list.md`)_


# 🧠 When to Use Adjacency List?

## The Two Contenders

### 1. Adjacency Matrix
A 2D Grid `matrix[i][j] = 1`.
*   **Pros**: O(1) to check "Is A connected to B?".
*   **Cons**: Uses O(V^2) space. Huge waste if graph is sparse.

### 2. Adjacency List
A Map `A -> [B, C]`.
*   **Pros**: Uses O(V + E) space. Efficient for sparse graphs (most real-world graphs).
*   **Cons**: O(Degree) to check connection.

## The Verdict
**Always use Adjacency List** unless:
1.  The graph is **Dense** (Every node connected to almost every other node).
2.  You strictly need O(1) edge checking.


---

# Implementation — Blueprint Code


## Adjacency List
_(source: `implementation\adjacency_list.py`)_


```python
class Graph:
    """
    Adjacency List Implementation.
    Pros: Saves space for sparse graphs. O(1) to find neighbors.
    Cons: O(V) to check edge existence.
    """
    def __init__(self):
        self.adj_list = {}
        
    def add_vertex(self, vertex):
        if vertex not in self.adj_list:
            self.adj_list[vertex] = []
            
    def add_edge(self, v1, v2, bidirectional=True):
        self.add_vertex(v1)
        self.add_vertex(v2)
        
        self.adj_list[v1].append(v2)
        if bidirectional:
            self.adj_list[v2].append(v1)
            
    def print_graph(self):
        for vertex, neighbors in self.adj_list.items():
            print(f"{vertex} -> {neighbors}")

if __name__ == "__main__":
    g = Graph()
    g.add_edge("A", "B")
    g.add_edge("A", "C")
    g.print_graph()
```


## Adjacency Matrix
_(source: `implementation\adjacency_matrix.py`)_


```python
class GraphMatrix:
    """
    Adjacency Matrix Implementation.
    Pros: O(1) to check edge existence.
    Cons: O(V^2) space. Bad for sparse graphs.
    """
    def __init__(self, size):
        self.size = size
        self.matrix = [[0] * size for _ in range(size)]
        self.vertex_map = {} # "A" -> 0
        self.index_map = {}  # 0 -> "A"
        self.count = 0
        
    def add_vertex(self, vertex):
        if vertex not in self.vertex_map:
            self.vertex_map[vertex] = self.count
            self.index_map[self.count] = vertex
            self.count += 1
            
    def add_edge(self, v1, v2, weight=1):
        if v1 in self.vertex_map and v2 in self.vertex_map:
            i = self.vertex_map[v1]
            j = self.vertex_map[v2]
            self.matrix[i][j] = weight
            self.matrix[j][i] = weight # Undirected
            
    def print_matrix(self):
        print("  " + " ".join([self.index_map[i] for i in range(self.count)]))
        for i in range(self.count):
            row = [str(val) for val in self.matrix[i][:self.count]]
            print(f"{self.index_map[i]} {' '.join(row)}")

if __name__ == "__main__":
    g = GraphMatrix(3)
    g.add_vertex("A")
    g.add_vertex("B")
    g.add_vertex("C")
    g.add_edge("A", "B")
    g.print_matrix()
```


## Disjoint Set
_(source: `implementation\disjoint_set.py`)_


```python
class DisjointSet:
    """
    Union Find with Path Compression and Union by Rank.
    """
    def __init__(self, size):
        self.parent = [i for i in range(size)]
        self.rank = [1] * size
        
    def find(self, i):
        if self.parent[i] != i:
            # Path Compression
            self.parent[i] = self.find(self.parent[i])
        return self.parent[i]
        
    def union(self, i, j):
        root_i = self.find(i)
        root_j = self.find(j)
        
        if root_i != root_j:
            # Union by Rank
            if self.rank[root_i] < self.rank[root_j]:
                self.parent[root_i] = root_j
            elif self.rank[root_i] > self.rank[root_j]:
                self.parent[root_j] = root_i
            else:
                self.parent[root_j] = root_i
                self.rank[root_i] += 1
            return True
        return False

if __name__ == "__main__":
    dsu = DisjointSet(5)
    dsu.union(0, 1)
    dsu.union(1, 2)
    print(dsu.find(0) == dsu.find(2)) # True
```


---

# Visual Walkthroughs & Animations


## Bfs Shockwave
_(source: `visual\bfs_shockwave.py`)_


```python
import time
import os
from collections import deque

def visualize_bfs(graph, start):
    print(f"🌊 BFS SHOCKWAVE (Start: {start})")
    print("-----------------------------------")
    
    queue = deque([start])
    visited = set([start])
    level = 0
    
    while queue:
        print(f"\n🌊 Wave Level {level}: {list(queue)}")
        time.sleep(1)
        
        level_size = len(queue)
        for _ in range(level_size):
            node = queue.popleft()
            print(f"  👉 Visiting: {node}")
            
            for neighbor in graph[node]:
                if neighbor not in visited:
                    print(f"     Found new neighbor: {neighbor}")
                    visited.add(neighbor)
                    queue.append(neighbor)
        level += 1

if __name__ == "__main__":
    # A -- B -- C
    # |    |
    # D -- E
    graph = {
        "A": ["B", "D"],
        "B": ["A", "C", "E"],
        "C": ["B"],
        "D": ["A", "E"],
        "E": ["B", "D"]
    }
    visualize_bfs(graph, "A")
```


## Dfs Maze Runner
_(source: `visual\dfs_maze_runner.py`)_


```python
import time
import os

def visualize_dfs(graph, node, visited=None, path=None):
    if visited is None: visited = set()
    if path is None: path = []
    
    visited.add(node)
    path.append(node)
    
    print(f"🏃 DFS Runner: At {node} | Path: {' -> '.join(path)}")
    time.sleep(1)
    
    for neighbor in graph[node]:
        if neighbor not in visited:
            print(f"  ⬇️ Going deep into {neighbor}...")
            visualize_dfs(graph, neighbor, visited, path)
            print(f"  ⬆️ Backtracking to {node}")
            
    path.pop()

if __name__ == "__main__":
    # A -- B -- C
    # |
    # D
    graph = {
        "A": ["B", "D"],
        "B": ["A", "C"],
        "C": ["B"],
        "D": ["A"]
    }
    visualize_dfs(graph, "A")
```


## Dfs Vs Bfs Pathfinding
_(source: `visual\dfs_vs_bfs_pathfinding.md`)_


# DFS vs BFS: The Maze Runners

## DFS (Depth-First Search)
"The Bold Explorer". Goes as deep as possible, then backtracks.
**Stack** based (Recursion).

```
    A
   / \
  B   C
 /
D
```
Path: `A -> B -> D -> (back) -> C`
**Use Case**: Maze solving, Finding *any* path, Cycle detection.

## BFS (Breadth-First Search)
"The Cautious Shockwave". Explores neighbors layer by layer.
**Queue** based.

```
    A
   / \
  B   C
 /
D
```
Path: `A -> B -> C -> D`
**Use Case**: **Shortest Path** in unweighted graph, GPS, Social Network degrees.


## Path Compression
_(source: `visual\path_compression.md`)_


# Union Find: Path Compression

## The Problem
Without compression, trees get tall. Finding root takes O(N).
`1 -> 2 -> 3 -> 4 -> 5`

## The Solution: Flattening
When we find the root of `1`, we make `1` point DIRECTLY to the root `5`.
Next time, finding root of `1` is O(1).

### Before Find(1)
```
5 (Root)
^
4
^
3
^
2
^
1
```

### After Find(1)
```
   5 (Root)
  / \
 4   1 (Directly connected!)
 ^
 3
 ^
 2
```
**Result**: The tree gets flatter and flatter.
**Time Complexity**: O(α(N)) - Inverse Ackermann Function (Basically constant).


## Topological Sort Courses
_(source: `visual\topological_sort_courses.md`)_


# Topological Sort: The Course Schedule

**Problem**: You have courses with prerequisites.
`Math 101 -> Math 102 -> Calculus`
`CS 101 -> Algorithms`

You need a linear order to take them.

## The Algorithm (Kahn's Algorithm)
1.  Calculate **In-Degree** (number of prerequisites) for each node.
2.  Add nodes with `In-Degree == 0` to a Queue.
3.  Process Queue:
    *   Add node to result.
    *   Reduce In-Degree of neighbors.
    *   If neighbor's In-Degree becomes 0, add to Queue.

## Visual
```
[Math 101] --> [Math 102]
     |
     v
[CS 101] ----> [Algorithms]
```
Order: `Math 101, CS 101, Math 102, Algorithms`


---

# Real-World Applications


## Job Board Crawling Graph
_(source: `real_world\job_board_crawling_graph.md`)_


# 🌍 Real World: Job Board Crawling

**Scenario**: You are building a Job Aggregator.
You start at `indeed.com`. It links to `company.com/careers`. That links to `linkedin.com/job`.

This is a **Graph Traversal**.

## The Algorithm: BFS (Web Crawler)
We want to visit pages layer by layer.

1.  **Queue**: URLs to visit. Start with `[indeed.com]`.
2.  **Visited Set**: Keep track of URLs to avoid infinite loops (Cycles!).
3.  **Process**:
    *   Dequeue URL.
    *   Download HTML.
    *   Extract links.
    *   If link not in Visited, Enqueue.

## Challenges
*   **Cycles**: A links to B, B links to A. (Solved by Visited Set).
*   **Scale**: The web is infinite. Limit depth or domain.


---

# Practice Problems


## Leetcode 200 Islands
_(source: `practice\leetcode_200_islands.md`)_


# ⚔️ LeetCode 200: Number of Islands

**Difficulty**: Medium
**Pattern**: DFS / BFS (Flood Fill)

## Problem
Given a grid of '1's (land) and '0's (water), count the number of islands.

## Approach
Iterate through every cell.
If we find a '1':
1.  Increment Island Count.
2.  Trigger a **DFS** (or BFS) to sink the island.
    *   Mark current cell as '0' (visited).
    *   Recursively visit up, down, left, right.

*   Time: O(M * N)
*   Space: O(M * N) (Recursion stack)

```python
def numIslands(grid):
    if not grid: return 0
    count = 0
    
    def dfs(r, c):
        if r < 0 or c < 0 or r >= len(grid) or c >= len(grid[0]) or grid[r][c] == '0':
            return
        grid[r][c] = '0' # Sink it
        dfs(r+1, c)
        dfs(r-1, c)
        dfs(r, c+1)
        dfs(r, c-1)
        
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)
    return count
```


## Leetcode 210 Course Schedule
_(source: `practice\leetcode_210_course_schedule.md`)_


# ⚔️ LeetCode 210: Course Schedule II

**Difficulty**: Medium
**Pattern**: Topological Sort

## Problem
Return the ordering of courses you should take to finish all courses.

## Approach: Kahn's Algorithm (BFS)
1.  Build Adjacency List and In-Degree array.
2.  Add courses with 0 In-Degree to Queue.
3.  Process Queue, adding to result list.
4.  If result length == numCourses, valid. Else, cycle detected.

```python
from collections import deque

def findOrder(numCourses, prerequisites):
    adj = {i: [] for i in range(numCourses)}
    in_degree = {i: 0 for i in range(numCourses)}
    
    for course, pre in prerequisites:
        adj[pre].append(course)
        in_degree[course] += 1
        
    queue = deque([c for c in in_degree if in_degree[c] == 0])
    res = []
    
    while queue:
        course = queue.popleft()
        res.append(course)
        
        for neighbor in adj[course]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
                
    return res if len(res) == numCourses else []
```


---

# Reference Data (JSON State Snapshots)


## Dsu Parents
_(source: `json\dsu_parents.json`)_


```json
{
    "nodes": [
        0,
        1,
        2,
        3,
        4
    ],
    "parents": [
        0,
        0,
        0,
        3,
        3
    ],
    "interpretation": {
        "0": "Root of Set A",
        "1": "Child of 0",
        "2": "Child of 0",
        "3": "Root of Set B",
        "4": "Child of 3"
    },
    "sets": [
        "{0, 1, 2}",
        "{3, 4}"
    ]
}
```


## Graph Adj List
_(source: `json\graph_adj_list.json`)_


```json
{
    "A": [
        "B",
        "C"
    ],
    "B": [
        "A",
        "D"
    ],
    "C": [
        "A"
    ],
    "D": [
        "B"
    ],
    "note": "Keys are Nodes. Values are Lists of Neighbors."
}
```


## Graph Matrix
_(source: `json\graph_matrix.json`)_


```json
{
    "nodes": [
        "A",
        "B",
        "C"
    ],
    "matrix": [
        [
            0,
            1,
            1
        ],
        [
            1,
            0,
            0
        ],
        [
            1,
            0,
            0
        ]
    ],
    "interpretation": "Row A has 1s at Col B and Col C. A is connected to B and C."
}
```


## Graph Weighted
_(source: `json\graph_weighted.json`)_


```json
{
    "A": [
        {
            "node": "B",
            "weight": 5
        },
        {
            "node": "C",
            "weight": 10
        }
    ],
    "B": [
        {
            "node": "A",
            "weight": 5
        }
    ],
    "note": "For weighted graphs, store Objects instead of Strings."
}
```
