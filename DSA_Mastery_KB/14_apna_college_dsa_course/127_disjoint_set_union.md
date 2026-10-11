# Disjoint Set Union (Union-Find)

Simple words, step by step.

## The problem this data structure solves
Efficiently answer two questions repeatedly, as elements get grouped together over time: **"are these two elements in the same group?"** (`find`) and **"merge these two elements' groups into one"** (`union`) — without needing to re-scan or rebuild group structures from scratch on every query.

## The core idea: each group is represented by a tree, and each element points toward its group's "representative" (root)
```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))       # initially, every element is its own group's root
        self.rank = [0] * n                  # tracks approximate tree height, for union by rank

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])     # PATH COMPRESSION -- flatten the tree as we go
        return self.parent[x]

    def union(self, x, y):
        root_x, root_y = self.find(x), self.find(y)
        if root_x == root_y:
            return False                        # already in the same group -- union would create a cycle (file 115, Twist 1)
        if self.rank[root_x] < self.rank[root_y]:         # UNION BY RANK -- attach smaller tree under bigger tree's root
            root_x, root_y = root_y, root_x
        self.parent[root_y] = root_x
        if self.rank[root_x] == self.rank[root_y]:
            self.rank[root_x] += 1
        return True
```
```javascript
class DSU {
    constructor(n) {
        this.parent = Array.from({ length: n }, (_, i) => i);    // initially, every element is its own group's root
        this.rank = new Array(n).fill(0);                            // tracks approximate tree height, for union by rank
    }

    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);     // PATH COMPRESSION -- flatten the tree as we go
        }
        return this.parent[x];
    }

    union(x, y) {
        let rootX = this.find(x), rootY = this.find(y);
        if (rootX === rootY) return false;          // already in the same group -- union would create a cycle
        if (this.rank[rootX] < this.rank[rootY]) {       // UNION BY RANK -- attach smaller tree under bigger tree's root
            [rootX, rootY] = [rootY, rootX];
        }
        this.parent[rootY] = rootX;
        if (this.rank[rootX] === this.rank[rootY]) {
            this.rank[rootX] += 1;
        }
        return true;
    }
}
```
**Speed**: both `find` and `union` run in **nearly O(1)** amortized time — more precisely, O(α(n)), where α is the **inverse Ackermann function**, a function that grows so incredibly slowly that it's effectively a constant (never exceeding 4 or 5) for any `n` that could ever realistically occur in practice. This near-constant speed is achieved ONLY when BOTH path compression AND union by rank are used together.

## Why path compression matters
Without it, repeated `find` calls could walk through a long chain of parent pointers every single time, giving O(n) worst-case per `find` call (if the tree degenerates into a long chain). Path compression makes every node ALONG THE PATH point DIRECTLY to the root the moment it's discovered, so future `find` calls on those same nodes become O(1) immediately.

## Why union by rank matters
Without it, naively attaching one tree under the other (e.g., always attaching `x`'s root under `y`'s root, regardless of size) can produce long, skewed chains over many union operations — exactly analogous to the BST skewing problem (file 98). Union by rank always attaches the SMALLER (shallower) tree under the LARGER one's root, keeping the overall tree height logarithmic in the worst case, independent of path compression's own flattening effect.

## Rules to remember
- **Path compression and union by rank are two INDEPENDENT optimizations that combine multiplicatively** — either one alone already gives a good (though not optimal) time bound; using BOTH together is what achieves the near-constant O(α(n)) bound, which is why production-quality Union-Find implementations almost always include both, not just one.
- This data structure is the natural fit whenever a problem is fundamentally about "track evolving groups of connected things, and answer connectivity/merging queries efficiently over time" — a genuinely different tool from BFS/DFS (which answer "explore a fixed, already-built graph structure"), reserved specifically for problems framed around incremental connectivity.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Count the number of connected components, maintained incrementally as edges are added one at a time
```python
def count_components_incremental(n, edges):
    dsu = DSU(n)
    components = n           # start: every element is its own separate component
    for x, y in edges:
        if dsu.union(x, y):
            components -= 1       # a successful union REDUCES the component count by exactly one
    return components
```
**The trap**: this is a minor, elegant extension — simply tracking a running `components` counter, decremented by exactly one on every SUCCESSFUL union (returns `True`, meaning the two elements weren't already connected); recognizing that a successful union always reduces the component count by exactly one (never more, never less) is the entire insight needed.

### Twist 2: Use Union-Find to build a Minimum Spanning Tree — this is Kruskal's Algorithm (full treatment in file 128)
**The trap**: this is a direct forward pointer — Kruskal's Algorithm sorts all edges by weight and greedily adds each edge to the MST ONLY if its two endpoints aren't already connected (checked via `find`), using `union` to merge them once added; recognizing Union-Find as the enabling data structure for an entirely different MST algorithm (distinct from Prim's heap-based approach, file 126) is worth flagging now, even though the full algorithm gets its own dedicated treatment next.

## Interview Q&A

**Q1: Why do path compression and union by rank need to be used TOGETHER to achieve the near-constant O(α(n)) time bound, rather than either one alone being sufficient?**
Union by rank alone guarantees the tree's height stays logarithmic (O(log n)) by always attaching the shorter tree under the taller one's root — a good bound, but not as strong as true near-constant time. Path compression alone also provides strong amortized bounds by flattening trees as `find` is called, but its full benefit compounds specifically when combined with the structural guarantee union by rank already provides (since compression works on trees that are already kept reasonably balanced to begin with, rather than potentially very tall ones that could still form without union by rank's balancing discipline). The mathematically proven near-constant O(α(n)) bound specifically requires both optimizations working together — either one alone gives a weaker (though still quite good) guarantee on its own.

**Q2: Why is Union-Find considered a fundamentally different tool from BFS/DFS, even though both are used to answer "are these things connected" style questions?**
BFS/DFS operate on a graph structure that's assumed to be fully built and static at the time of traversal — they answer connectivity questions by exploring that fixed structure from scratch (or from a cached traversal) each time a query is asked. Union-Find, by contrast, is specifically designed for scenarios where the graph's connectivity is being built up INCREMENTALLY over time (edges/unions being added one at a time, interspersed with connectivity queries), maintaining and updating its internal group structure efficiently as each new union happens, without ever needing to re-traverse or rebuild anything from scratch. This makes Union-Find the natural fit for problems framed around a STREAM or SEQUENCE of incremental union operations with interspersed queries, whereas BFS/DFS fit problems framed around exploring one fixed, already-complete graph structure.

**Q3: Why does a successful `union` operation always decrease the total connected-component count by exactly one, never by more or less?**
A `union(x, y)` call only has an actual effect (returns true, indicating success) when `x` and `y` were previously in two DIFFERENT, separate components — merging exactly these two previously-distinct components into a single one reduces the total count of distinct components by precisely one, regardless of how large or small either of the two merging components happened to be. If `x` and `y` were already in the SAME component (the union call returns false, a no-op), no merging actually happens and the component count rightly stays unchanged — this clean, predictable relationship between "successful union" and "component count decreases by exactly one" is what makes incrementally tracking the total component count via a simple counter, updated only on successful unions, both correct and efficient.
