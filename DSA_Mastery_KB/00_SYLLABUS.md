# DSA Mastery — Full Course Syllabus (6 Phases)

This is the master roadmap for this knowledge base. It exists to answer one question before we write a single new line of content: **what does "cover everything" actually mean, precisely, so nothing gets skipped?**

This document is the contract. Every phase below lists exactly what will be taught, in what order, and why that order. Once this is approved, we execute it phase by phase — each phase becomes its own deep, content-heavy module (theory + code + edge cases + tough-portion call-outs + interview framing), built strictly to this outline so nothing drifts or gets forgotten.

**Scope decisions locked in for this course:**
- **Languages**: Python (already the dominant language in this KB) + **JavaScript**, added as parallel, equally-complete content — not an afterthought. Every phase ships Python AND JavaScript versions of every pattern, plus a **language-rules section** for each (what idioms exist only in that language, what gotchas are language-specific, what the "canonical" way to write each pattern looks like in that language).
- **Nothing is skipped for brevity.** Edge cases, failure modes, and the "tough portion" of every topic (the part that actually filters candidates in interviews) get an explicit, named section in every phase — not folded quietly into an example and hoped-for.
- **Existing KB alignment**: this syllabus maps onto the 12 topic folders (`01_arrays_strings` → `12_daily_challenges`) already in this repository. Nothing here throws away existing work — the phases sequence and deepen what's there, and the JavaScript add-ons live alongside the existing Python files as siblings, not replacements.

---

## How the Course Is Structured

Every **Phase** below covers multiple **Topics**. Every **Topic**, once we build it out, will consistently include:

1. **Intuition** — the plain-English mental model before any code (why does this pattern exist, what real problem does it solve).
2. **Core Theory** — the mechanism, precisely: invariants, complexity (time AND space, best/average/worst), when each variant applies.
3. **Blueprint Code** — a clean, reusable reference implementation, in **both Python and JavaScript**.
4. **Language Rules** — a dedicated section per language: syntax gotchas, standard-library tools that make or break the pattern (e.g. Python's `heapq`, `collections.deque`, `bisect` vs JavaScript's lack of a built-in heap/deque and what to reach for instead), mutation/reference semantics differences, default-argument traps, integer overflow behavior, etc.
5. **Edge Cases** — an exhaustive, explicit list (empty input, single element, all-duplicates, negative numbers, integer overflow, cycles, disconnected components, unbalanced structures, recursion depth limits — whatever applies to that topic specifically).
6. **Tough Portions** — the sub-skill inside this topic that actually separates a mid-level candidate from a strong one (named explicitly, not left implicit).
7. **Complexity Analysis Drill** — justify the Big-O, don't just state it.
8. **Practice Problems** — categorized easy/medium/hard, with the *pattern signal* named (how do you recognize this problem is "this" pattern from the phrasing alone).
9. **Interview Framing** — how this topic actually gets asked, common follow-up twists, what a great answer sounds like out loud.

---

## PHASE 1 — Foundations: Complexity, Arrays, Strings, and the Core Techniques

**Why first**: every later phase assumes fluency here. If Big-O reasoning or two-pointer/sliding-window thinking isn't automatic, every subsequent phase will be slower to absorb.

### 1.1 Complexity Analysis (Big-O, Big-Θ, Big-Ω)
- What asymptotic notation actually measures, and what it deliberately ignores (constants, lower-order terms).
- Time complexity vs space complexity; auxiliary space vs total space; in-place definitions.
- Amortized analysis (why `list.append`/dynamic array resizing is O(1) amortized, not O(n)).
- Recurrence relations and the Master Theorem (for recursive complexity, needed before Phase 5's DP/divide-and-conquer).
- **Tough portion flagged**: recognizing amortized cost correctly (a classic trap — analyzing one worst-case resize in isolation instead of averaged over the sequence).

### 1.2 Arrays — Fundamentals and Memory Model
- Contiguous memory, indexing cost, cache locality — *why* arrays are fast for random access and slow for insertion/deletion in the middle.
- Static arrays vs dynamic arrays (Python `list`, JS `Array`) — how resizing actually works under the hood.
- Multi-dimensional arrays / matrices — row-major storage, traversal patterns.
- **Language rules preview**: Python lists are dynamic arrays of *references*, not values — mutation/aliasing behavior. JavaScript arrays are also dynamic and can be sparse/mixed-type — a real gotcha.

### 1.3 Strings — Fundamentals
- Strings as arrays of characters — where that mental model holds and where it breaks (Unicode, immutability).
- Immutability in both languages and its performance consequences (string concatenation in a loop — the classic anti-pattern and its fix in each language).
- Common string algorithms: palindrome checks, anagram detection, substring search (naive vs KMP vs Rabin-Karp — full mechanism, not just naming them).

### 1.4 Two Pointers
- Same-direction and opposite-direction variants — when each applies.
- Canonical problems: pair-sum in sorted array, removing duplicates in-place, container-with-most-water, trapping rain water (the hard variant).
- **Tough portion flagged**: proving pointer-movement correctness (why moving the smaller-value pointer is always safe) — the part people memorize instead of understanding.

### 1.5 Sliding Window
- Fixed-size window vs variable-size (expand/shrink) window — the decision tree for which to use.
- Canonical problems: max sum subarray of size k, longest substring without repeating characters, minimum window substring (the hard variant that combines window + hashmap).
- **Tough portion flagged**: the shrink condition — precisely when and why the window contracts, the #1 source of off-by-one bugs.

### 1.6 Prefix Sums and Difference Arrays
- Prefix sum construction and O(1) range-sum queries.
- 2D prefix sums (matrix range-sum).
- Difference arrays for O(1) range-update, O(n) final reconstruction.

### 1.7 Bit Manipulation (foundational subset)
- AND/OR/XOR/NOT, shifts, and the classic bit tricks (check power of 2, count set bits, isolate lowest set bit).
- XOR-based problems (single number, missing number) and why XOR is the tool here specifically.

**Phase 1 deliverables**: full Python + JS blueprint code for every technique above, a dedicated "Python array/string rules" doc, a dedicated "JavaScript array/string rules" doc, and a curated problem set per topic (easy → hard) with pattern-recognition notes.

---

## PHASE 2 — Linear Data Structures: Linked Lists, Stacks, Queues, Hashing

**Why second**: these are the building blocks every later structure (trees, graphs, DP memoization, caching) is built from or built alongside.

### 2.1 Linked Lists
- Singly vs doubly linked lists — structural trade-offs.
- Core operations and their real complexity: insert/delete at head/tail/middle, search, reverse.
- **Tough portion flagged**: pointer manipulation without losing references — the single biggest source of bugs in linked-list code (the "save next before you overwrite" discipline).
- Fast & slow pointers (Floyd's cycle detection) — cycle detection, finding the cycle start, finding the middle node.
- Reversal variants: full reversal, reverse in groups of k, reverse a sublist.
- Merging: merge two sorted lists, merge k sorted lists (ties into Phase 3's heaps).
- **Edge cases**: empty list, single node, list with a cycle, reversing with an odd/even node count.

### 2.2 Stacks
- LIFO mechanics, array-based vs linked-list-based implementation.
- Canonical problems: valid parentheses, next greater/smaller element (monotonic stack — full mechanism), evaluate postfix/infix expressions, largest rectangle in histogram (the hard monotonic-stack problem).
- **Tough portion flagged**: monotonic stack invariant — what exactly the stack is guaranteed to hold at every point, and why that guarantee is what makes O(n) possible instead of O(n²).

### 2.3 Queues
- FIFO mechanics, circular buffer implementation (why a naive array-based queue is wasteful, and the fix).
- Deque (double-ended queue) — and why JavaScript has no built-in deque while Python has `collections.deque` (a real, named language-rules gap to cover explicitly).
- Monotonic deque — sliding window maximum, the textbook problem this structure exists for.
- Priority queues get their own subsection in Phase 3 (they conceptually belong with heaps).

### 2.4 Hashing / Hash Maps / Hash Sets
- How a hash table actually works: hash function, buckets, collision resolution (chaining vs open addressing), load factor and resizing.
- Python `dict`/`set` internals (open addressing, insertion order guarantee since 3.7) vs JavaScript `Map`/`Set`/plain object — a real, consequential language-rules difference (object key coercion to strings being the classic JS gotcha).
- Canonical problems: two sum, group anagrams, longest consecutive sequence (O(n) using a hash set — the non-obvious part is *why* it's O(n) despite looking like nested loops).
- **Tough portion flagged**: recognizing when a hash map turns an O(n²) brute force into O(n) — the single most valuable pattern-recognition skill in this whole course, because it appears constantly disguised as other problems.
- **Edge cases**: hash collisions worst-case degrading to O(n) per operation, using mutable objects as keys (illegal/unsafe in both languages, different failure modes).

**Phase 2 deliverables**: same structure as Phase 1 — Python + JS blueprints, language-rules docs (especially the deque and hash-map internals gaps), full edge-case and tough-portion coverage, categorized problem sets.

---

## PHASE 3 — Trees, Heaps, and Tries (Hierarchical Structures)

**Why third**: trees are the first genuinely recursive structure in the course — this phase is where recursive thinking has to become fluent, because Phase 4 (graphs) and Phase 5 (DP/backtracking) both depend on it.

### 3.1 Binary Trees — Fundamentals
- Terminology precisely defined (depth, height, balanced, complete, full, perfect — these get confused constantly and interviewers notice).
- Traversals: preorder, inorder, postorder (recursive AND iterative-with-explicit-stack versions of each — the iterative versions are the "tough portion" almost everyone skips), level-order (BFS).
- Recursive tree-building patterns: return-value composition (the "what does this function promise to return, and how does the parent use it" mental model — the single most important framing for all tree problems).

### 3.2 Binary Search Trees (BST)
- BST invariant, search/insert/delete complexity and *why* delete is the hardest of the three (the two-children case, successor/predecessor logic).
- Validate BST (the classic trap: checking only immediate children instead of the full valid range).
- BST-to-sorted-array relationship (inorder traversal), and the reverse (build balanced BST from sorted array).
- **Edge cases**: duplicate values policy, deleting the root, unbalanced/degenerate (linked-list-shaped) BSTs and their complexity consequences.

### 3.3 Balanced Trees (conceptual depth, not full from-scratch implementation)
- Why balance matters (degenerate BST complexity collapse) — AVL rotation concept, Red-Black tree concept at the level needed for interviews (know what problem they solve and their guarantees, not necessarily hand-implement rotations from scratch unless targeting that level explicitly).

### 3.4 Heaps / Priority Queues
- Binary heap array representation (why index math `2i+1`/`2i+2`/`(i-1)//2` works — the mechanism, not just the formula).
- Heapify, insert, extract-min/max complexity derivation.
- Python's `heapq` (min-heap only — the max-heap-via-negation trick) vs JavaScript's **lack of a built-in heap** — this is the single biggest Python/JS asymmetry in the whole course and gets a full dedicated write-up (build one from scratch in JS, or when to reach for a library).
- Canonical problems: kth largest element, merge k sorted lists, top-k frequent elements, median from a data stream (two-heap technique — genuinely hard, gets full treatment).

### 3.5 Tries (Prefix Trees)
- Structure and node design, insert/search/startsWith complexity.
- Canonical problems: implement Trie, word search II (Trie + DFS/backtracking combo), autocomplete design.

### 3.6 Tree Algorithms Beyond Basic Traversal
- Lowest Common Ancestor (multiple approaches: recursive, with-parent-pointers, binary-lifting preview).
- Diameter of a tree, path-sum family of problems, serialize/deserialize a tree.
- **Tough portion flagged**: problems where the recursive function needs to return *more than one piece of information* (e.g., diameter needing both "height" and "best diameter so far") — the pattern that trips people who only learned single-return-value recursion.

**Phase 3 deliverables**: full Python + JS blueprints (including a from-scratch JS heap implementation since none exists natively), recursive-thinking framing as its own explicit mini-lesson, edge cases, tough portions, problem sets.

---

## PHASE 4 — Graphs

**Why fourth**: graphs generalize trees (a tree is just a graph with no cycles and one path between any two nodes) — this phase is naturally sequenced right after trees, and everything here (BFS/DFS) is a direct extension of Phase 3's traversal work.

### 4.1 Graph Representations
- Adjacency list vs adjacency matrix — memory/time trade-offs precisely, and when each is the right choice.
- Directed vs undirected, weighted vs unweighted — how representation changes per case.

### 4.2 Traversal — BFS and DFS, Fully
- BFS: mechanism, shortest-path-in-unweighted-graph guarantee (*why* BFS specifically guarantees shortest path and DFS does not).
- DFS: recursive and iterative (explicit stack) versions, entry/exit timestamps, and what they're used for (cycle detection, topological ordering).
- Connected components, flood fill, number of islands (the canonical grid-as-graph problem).
- **Edge cases**: disconnected graphs (must loop over all nodes as potential start points, not just one), self-loops, multi-edges.

### 4.3 Topological Sort
- Kahn's algorithm (BFS-based, in-degree tracking) vs DFS-based (postorder-reversal) — both, with the mechanism for *why* each produces a valid ordering.
- Cycle detection as a natural byproduct (a graph has no valid topological order iff it has a cycle) — the direct connection interviewers probe.

### 4.4 Union-Find (Disjoint Set Union)
- Structure, union-by-rank/size, path compression — and the near-O(1) amortized complexity that results (inverse Ackermann function — know it exists, know why it's "practically constant").
- Canonical problems: number of connected components, redundant connection, accounts merge.
- **Tough portion flagged**: this structure is the one most people can *state* but can't *implement correctly from memory* under pressure — full from-scratch build is mandatory practice here.

### 4.5 Shortest Path Algorithms
- Dijkstra's algorithm (heap-based) — full mechanism and *why* it fails with negative edge weights (the classic interview follow-up).
- Bellman-Ford — handles negative weights, detects negative cycles; complexity trade-off vs Dijkstra.
- 0-1 BFS (deque-based optimization for the special case of only 0/1 edge weights) — a genuinely advanced but high-signal technique.
- Floyd-Warshall (all-pairs shortest path) — mechanism and when all-pairs is actually the right ask.

### 4.6 Minimum Spanning Tree
- Kruskal's algorithm (greedy + Union-Find — direct application of 4.4).
- Prim's algorithm (greedy + heap — direct application of 4.5's heap mechanics).

### 4.7 Advanced Graph Patterns
- Bipartite graph checking (2-coloring via BFS/DFS).
- Clone graph (traversal + hashmap-based node mapping — a common "combine two earlier concepts" problem).
- Word ladder (BFS on an implicit graph — the tough part is realizing the graph isn't given explicitly and must be constructed on the fly).

**Phase 4 deliverables**: full Python + JS blueprints for every algorithm above, explicit "how do you know a problem is secretly a graph problem" pattern-recognition notes, edge cases, tough portions, problem sets.

---

## PHASE 5 — Algorithmic Techniques: Sorting, Searching, Dynamic Programming, Backtracking, Greedy

**Why fifth**: this phase is where raw data-structure knowledge (Phases 1–4) turns into problem-solving *strategy*. It's also historically the hardest phase for most learners, which is exactly why it comes after a fully solid foundation, not before.

### 5.1 Sorting Algorithms
- Comparison-based: bubble/insertion/selection (know them, know why they're rarely the answer), merge sort (full divide-and-conquer mechanism + complexity proof via Master Theorem), quicksort (partitioning schemes — Lomuto vs Hoare — and *why* worst-case O(n²) happens and how randomized pivot selection mitigates it).
- Non-comparison-based: counting sort, radix sort, bucket sort — and the precise conditions under which they beat the O(n log n) comparison-sort lower bound (they don't violate the lower bound — they operate outside its assumptions, a subtlety worth stating explicitly).
- Stability — what it means, which algorithms guarantee it, and *why it matters* in real use (sorting by multiple keys).
- **Tough portion flagged**: quicksort worst-case analysis and why "always pick the first element as pivot" is a genuine interview trap on already-sorted input.

### 5.2 Searching Algorithms
- Binary search — the exact invariant-based template that avoids off-by-one bugs (this gets a dedicated deep section; binary search bugs are disproportionately common even among experienced engineers).
- Binary search on the answer (a distinct, higher-level pattern: search over a *solution space*, not a sorted array — e.g., minimum capacity to ship packages in D days).
- **Tough portion flagged**: recognizing when a problem is "secretly" binary search — the monotonic-predicate signal.

### 5.3 Recursion and Backtracking
- Recursion mental model formalized (base case, recursive case, trusting the recursion / induction thinking).
- Backtracking template: choose → explore → unchoose — and why that third step is the one people forget, causing silent correctness bugs.
- Canonical problems: subsets, permutations, combinations, N-Queens, Sudoku solver, word search.
- Pruning — how to cut a backtracking search space early, and why it's the difference between a solution that times out and one that doesn't.

### 5.4 Dynamic Programming — Full Depth
- The core idea: overlapping subproblems + optimal substructure — both conditions defined precisely, with a counter-example of a problem that has overlapping subproblems but NOT optimal substructure (so DP doesn't naively apply).
- Memoization (top-down) vs tabulation (bottom-up) — full trade-off discussion (call-stack depth risk vs having to figure out iteration order).
- State design as the actual skill being tested — "what does `dp[i]` (or `dp[i][j]`) mean, in one sentence" as the mandatory first step before writing any DP code.
- 1D DP: climbing stairs, house robber, longest increasing subsequence (O(n²) and the O(n log n) patience-sorting variant — both, since the jump between them is a classic hard follow-up).
- 2D DP: longest common subsequence, edit distance, unique paths, knapsack (0/1 and unbounded — the single-line loop-order difference between them, and why that difference matters, gets explicit treatment).
- Interval DP, tree DP, bitmask DP — the advanced DP shapes, each with a canonical problem.
- Space optimization (rolling array technique — collapsing 2D DP into O(n) space) as its own explicit skill.
- **Tough portion flagged, and this is the big one for this whole phase**: going from "I can recognize DP" to "I can derive the recurrence relation from scratch on a novel problem" — every DP topic gets a "derive it yourself" framing, not just "memorize this recurrence."

### 5.5 Greedy Algorithms
- What makes a problem greedy-solvable (the greedy-choice property and optimal substructure — and why greedy is *not* just "DP without memoization," a common misconception worth correcting explicitly).
- Canonical problems: activity selection, jump game, gas station, interval scheduling/merging.
- **Tough portion flagged**: proving a greedy strategy is correct (exchange argument) vs just hoping it works — the difference between a lucky guess and a defensible interview answer.

### 5.6 Divide and Conquer (as its own named technique)
- The general template distinct from "just recursion" — divide, conquer, combine — with merge sort and quicksort revisited explicitly as the canonical examples, plus closest-pair-of-points as a less obvious one.

**Phase 5 deliverables**: full Python + JS blueprints, an explicit "how to derive a DP recurrence from a blank page" mini-lesson (this is the single highest-value piece of content in the whole course), edge cases, tough portions, problem sets from easy through genuinely hard.

---

## PHASE 6 — Advanced Patterns, System-Design-Flavored DSA, and Interview Mastery

**Why last**: this phase assumes everything before it and is where the course turns into direct interview readiness — applying the toolbox to problems shaped like real systems, plus the meta-skills (communication, complexity trade-off articulation, mock-interview reps) that actually decide outcomes.

### 6.1 Advanced Patterns Not Yet Covered
- Sliding window maximum/minimum revisited with monotonic deque (ties Phase 2.3 back in at full strength).
- Segment trees and Fenwick trees (Binary Indexed Trees) — range query + point update, and point query + range update variants, full mechanism and complexity.
- LRU Cache and LFU Cache design from scratch (hashmap + doubly linked list combination — the canonical "combine two structures" interview problem).
- Sparse table (O(1) range queries for static/immutable data, e.g. range minimum query) as a contrast to segment trees (static vs dynamic data trade-off).

### 6.2 System-Design-Flavored DSA
- Rate limiter (sliding window counter / token bucket — DSA concepts applied to a real infrastructure problem).
- Job scheduler with a heap (priority-based scheduling — direct application of Phase 3's heap work).
- Consistent hashing (ties into the distributed-systems knowledge already in this repo's `fde/` module) as a DSA-meets-system-design bridge topic.
- These problems get a distinct framing: not "solve this algorithm," but "design this component," with the DSA as the engine underneath — matches how they're actually asked in senior/FDE-style interviews.

### 6.3 Language Mastery — Consolidated Rules (Python vs JavaScript)
A dedicated, standalone reference (not scattered per-topic) consolidating every language-specific rule surfaced across all six phases:
- Mutability & reference semantics (pass-by-object-reference nuances in both languages, the classic "default mutable argument" Python trap vs JS's own closure/reference gotchas).
- Numeric behavior: Python's arbitrary-precision integers (no overflow) vs JavaScript's `Number` (floating-point double, safe-integer ceiling at 2^53-1, and `BigInt` as the escape hatch) — a real, consequential difference for any problem involving large sums or products.
- Standard library parity table: what Python has built-in (`heapq`, `deque`, `bisect`, `Counter`, `defaultdict`, `itertools`) and its precise JavaScript equivalent or "must build from scratch" status.
- Iteration/comprehension idioms: list/dict/set comprehensions in Python vs `map`/`filter`/`reduce` and spread/destructuring idioms in JS — writing the *same* algorithm idiomatically in each language, not just transliterated.
- Recursion limits: Python's default recursion depth ceiling (and why it matters for deep trees/graphs) vs JavaScript's engine-dependent stack limits — and iterative rewrites as the general fix in both.
- Async is explicitly out of scope for core DSA (irrelevant to algorithm correctness) but flagged once so it isn't mistaken for an oversight.

### 6.4 Interview Mastery
- The complexity-first communication habit: stating time/space complexity out loud before and after coding, not just when asked.
- Clarifying-question discipline (constraints, edge cases, expected input size) as the mandatory first 2 minutes of any interview problem.
- Testing your own solution methodically (empty input, single element, largest scale, adversarial input) before declaring done.
- Mock interview structure — how this course's daily-challenges and interactive-playground folders (already in this KB) get used as spaced-repetition drilling once all 6 phases are built.

**Phase 6 deliverables**: full Python + JS blueprints for every advanced structure, the consolidated language-rules reference document (the capstone artifact of the whole course), and a final interview-mastery playbook.

---

## Sequencing Summary (why this order and not another)

```
Phase 1: Foundations (complexity + arrays/strings + core techniques)
   │  — builds the vocabulary and technique-recognition instinct every later phase assumes
   ▼
Phase 2: Linear structures (lists, stacks, queues, hashing)
   │  — the building blocks; hashing specifically is the single highest-leverage pattern in the whole course
   ▼
Phase 3: Trees, heaps, tries
   │  — first real recursive structure; heaps set up Phase 4's Dijkstra/Prim
   ▼
Phase 4: Graphs
   │  — generalizes trees; Union-Find and heaps from Phase 2-3 get reused directly
   ▼
Phase 5: Techniques (sorting, searching, backtracking, DP, greedy)
   │  — the hardest phase, deliberately placed after a complete structural foundation
   ▼
Phase 6: Advanced patterns + system-design DSA + interview mastery
   — the capstone: combines everything, adds the consolidated language-rules reference,
     and turns the whole course into direct interview readiness
```

## What Happens Next

We build **one phase at a time**, in the order above, each as a complete, standalone-but-connected module — full depth, Python + JavaScript in parallel, nothing summarized away. Confirm this syllabus (or flag anything to add/reorder/cut), and Phase 1 starts on your go-ahead.
