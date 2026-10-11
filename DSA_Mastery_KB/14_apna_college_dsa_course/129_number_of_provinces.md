# Number of Provinces

Simple words, step by step.

## The question
Given an `n x n` adjacency matrix `isConnected` where `isConnected[i][j] = 1` means cities `i` and `j` are directly connected, find the number of **provinces** — groups of directly/indirectly connected cities (i.e., connected components, file 111).

## Approach: DFS/BFS (treat the matrix as a graph) or Union-Find
```python
def find_circle_num(is_connected):
    n = len(is_connected)
    visited = [False] * n
    provinces = 0

    def dfs(city):
        visited[city] = True
        for neighbor in range(n):
            if is_connected[city][neighbor] == 1 and not visited[neighbor]:
                dfs(neighbor)

    for city in range(n):
        if not visited[city]:
            provinces += 1
            dfs(city)
    return provinces
```
```javascript
function findCircleNum(isConnected) {
    const n = isConnected.length;
    const visited = new Array(n).fill(false);
    let provinces = 0;

    function dfs(city) {
        visited[city] = true;
        for (let neighbor = 0; neighbor < n; neighbor++) {
            if (isConnected[city][neighbor] === 1 && !visited[neighbor]) dfs(neighbor);
        }
    }

    for (let city = 0; city < n; city++) {
        if (!visited[city]) {
            provinces += 1;
            dfs(city);
        }
    }
    return provinces;
}
```
**Speed**: O(n²) — the matrix itself has n² entries, and every entry is examined at most once total across all DFS calls.

## Rules to remember
- **This is "count connected components" (file 111/116) wearing a matrix-input costume** — the only adaptation needed is iterating neighbors by scanning a matrix row instead of an adjacency list, since the input format is a matrix, not an edge list.
- Equally solvable with Union-Find (file 127): union every pair `(i, j)` where `isConnected[i][j] == 1`, then count the number of distinct roots remaining — both approaches are O(n²) and equally valid; DFS/BFS is usually more direct here since the matrix is small and dense by construction.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Input is an edge list instead of a matrix
**The trap**: purely a reformatting exercise — convert the edge list into an adjacency list first (file 111), then run the identical DFS-count-components logic; recognizing this is the SAME problem under a different input format, not a new problem, avoids wasted re-derivation.

### Twist 2: Solve using Union-Find for comparison
```python
def find_circle_num_dsu(is_connected):
    n = len(is_connected)
    dsu = DSU(n)
    for i in range(n):
        for j in range(i + 1, n):
            if is_connected[i][j] == 1:
                dsu.union(i, j)
    return len({dsu.find(i) for i in range(n)})
```
**The trap**: counting DISTINCT roots after all unions (via a set comprehension over `find(i)` for every node) is the key final step — a common oversight is forgetting to call `find` again at the end (to resolve through any remaining path-compression chains) rather than naively counting distinct `parent[i]` values directly, which could overcount if compression hasn't fully flattened every path yet.

## Interview Q&A

**Q1: Why is "Number of Provinces" identical in substance to "count connected components," despite the different-looking matrix input?**
An adjacency matrix is just another way of encoding exactly the same graph connectivity information as an edge list or adjacency list — `isConnected[i][j] == 1` means an edge exists between `i` and `j`, which is all a connected-components algorithm actually needs, regardless of how that edge information is physically stored or looked up.

**Q2: Why is this problem O(n²) rather than O(n) or O(n log n)?**
The input itself is an n×n matrix, meaning there are inherently n² pieces of information to potentially examine — even in the best case, correctly determining connectivity requires looking at enough of the matrix to confirm which entries are 1s, and in the worst case (a nearly fully-connected graph), DFS will end up examining a significant fraction of all n² matrix entries across its traversal.

**Q3: Why must `find(i)` be called again at the very end when counting provinces via Union-Find, rather than just directly comparing raw `parent[i]` values?**
Because path compression is a lazy, incremental optimization — a node's `parent` pointer only gets updated to point directly at the true root the next time `find` is actually called on it (or on something that calls into it recursively); without a final `find` call per node, some `parent[i]` values might still point to an intermediate (non-root) ancestor rather than the final true root, causing two nodes in the same actual component to appear to have different "roots" if compared naively via raw `parent` values instead of fully-resolved `find` results.
