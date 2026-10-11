//  Vid 1

// Data structures-> 1.Primitive
// 2.Non-primitive -> 2.1 Linear -> 2.1.1-> static -> Arrays
// 2.1.2-> Dynamic -> Vector, LinkedList, Stack, Queue

// 2.2 Non-Linear -> 2.2.1-> Tree, graph, table/set


// Diagram ->
// start/exit -> rectangle with rounded corner
// I/O -> parallelogram
// Process -> rectangle
// Condition -> rhombus


// Vid 2
// Data types -> int-4 bytes , char-1 byte, float-4 bytes, double-8 bytes, bool in C++

// Type casting
// conversion -implicite ; casting-explicite
// int/float, float/int -> type will be float, as usme decimals jyada hote or lese jo size wise bada hota vo

// Operators -> arithmentic, relational, logical
// Unary Operators -> a++, b--
// Binary Operators -> +, -, *, /, %, ex -> a^b, a&b, a||b



// Vid 3

// Conditional statements and loops ,


































// Vid - 8 , Array


// -> same type of data, contiguous in memoryUsage, linear in C++ , like 100->104->108->112 ---> if it is int then 4 bytes each
// sizeof(arrayName) / sizeof(arrayName[0]) = size of array
//  Pass by value and pass by reference


// Linear search -> O(n) TC

// 2-pointer approach -> reverse an array,




// Vid - 9 , Vectors

// dynamic in nature from STL -> size can be changed , standard template library**
// Initialize ->  vector<int> v;   or  vector<int> v = {1,2,3};   or vector<int> v(3, 0) --(size, index pe values);
// v.push_back(10); v.pop_back(); v.insert(v.begin(), 10); v.erase(v.begin());

// vector<char> vec={1,2,3,4,5,6,7,8,9,10};  vector<char>::iterator it;   it=vec.begin(); it++;  it=vec.end(); it--;
// it=vec.insert(it, 10);  it=vec.erase(it);

// -> loop -> for(char val : vec)

// -> vector functions -> size, push_back, pop_back, insert, erase, begin, end, at

// static memory allocation -> assigning intially
// dynamic memory allocation -> initially declaring and assigning on runtime

// stack -> static allocation
// heap -> dynamic allocation



// & -> pass by reference   ----> int singleNumber(vector<int>& nums)  ---> alias of original container created
// * -> pass by value





// Vid - 10 -> kadane's algorithm

// ->  if sub array sum becomes -ve -> reset to 0

// maximum subarray sum -> https://youtu.be/9IZYqostl2M?list=PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt&t=142
// https://www.geeksforgeeks.org/dsa/largest-sum-contiguous-subarray/






// Vid 11 -> 
// Majority Element | Brute- Better-Best Approach | Moore's** Voting Algorithm | & Pair Sum

// Pair Sum -> where sum == target -> https://www.geeksforgeeks.org/dsa/check-if-pair-with-given-sum-exists-in-array/


// -> two pointer
// -> moore's -> https://youtu.be/_xqIp2rj8bo?list=PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt&t=1754




// vid 12 -> Time and space complexity***
// sorting algo, recurssion

// time complexity -> amount of time taken as function of input size(n). || number of operations
// space complexity -> amount of space taken as function of input size(n).

// worst case->TC -> O(n^2) , O(nlogn) , O(n)
// best case->TC -> O(n) , O(logn)

// -> worst case->SC -> O(n) , O(1)
// best case->SC -> O(1)

// O(1)-> O(log n)-> O(n)-> O(nlogn)-> O(n^2)-> O(n^3)-> O(2^n)-> O(3^n)-> O(n!)

// https://www.geeksforgeeks.org/dsa/time-complexity-and-space-complexity/
// https://www.geeksforgeeks.org/dsa/understanding-time-complexity-simple-examples/


// loop k ander k operstions ko constant consider karege
// example  // TC-> O(n)
// int fact =1;
// for(int i=1; i<=names; i++){
//     fact*=1;
// }

// https://youtu.be/PwKv8fOcriM?list=PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt&t=1890   IMP

// O(logn) -> jisme bi half ho jae operations -> eg, binary search


// O(2^n) -> recurssion without optimization

// https://youtu.be/PwKv8fOcriM?list=PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt&t=3247https://youtu.be/PwKv8fOcriM?list=PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt&t=3247









































/////////////////////////////////////////////////////////////////////////////////
// Algorithms w3 -> https://www.w3schools.com/dsa/index.php






















//////////////////////////////////////////////////////////////
// https://www.geeksforgeeks.org/dsa/dsa-tutorial-learn-data-structures-and-algorithms/

// Searching Algorithm -> Linear search and binary search
// -> Two Pointers Technique  // https://www.geeksforgeeks.org/dsa/searching-algorithms/
// More Searching Algorithms
// Sentinel Linear Search
// Meta Binary Search | One-Sided Binary Search
// Ternary Search
// Jump Search
// Interpolation Search
// Exponential Search
// Fibonacci Search
// Best First Search (Informed Search)

// Sorting Algorithm -> Sorting Algorithms:
// Comparison Based : Selection Sort, Bubble Sort, Insertion Sort, Merge Sort, Quick Sort, Heap Sort, Cycle Sort, 3-way Merge Sort
// Non Comparison Based : Counting Sort, Radix Sort, Bucket Sort, Pigeonhole Sort
// Hybrid Sorting Algorithms : IntroSort, TimSort

//. Recursion -  Towers of Hanoi (TOH), Inorder/Preorder/Postorder Tree Traversals, DFS of Graph, etc.

// Hashing  // https://www.geeksforgeeks.org/dsa/hashing-data-structure/

// Two pointer technique

// Sliding Window Technique
// Prefix Sum Array - Implementation

// Greedy - https://www.geeksforgeeks.org/dsa/greedy-algorithms/

// Shortest Path
// Dijkstra’s shortest path a
// Bellman–Ford
// Floyd Warshall
// Johnson’s algorithm
// Shortest Path in Directed Acyclic Graph
// Dial’s Algorithm
// Multistage Graph (Shortest Path)
// Shortest path in an unweighted graph
// Minimum mean weight cycle algorithm
// 0-1 BFS (Shortest Path
// Minimum weight cycle
// D’Esopo-Pape Algorithm

// Divide and conqure

// https://www.geeksforgeeks.org/dsa/analysis-algorithms-big-o-analysis/
// https://www.geeksforgeeks.org/dsa/practice-questions-time-complexity-analysis/
// https://www.geeksforgeeks.org/dsa/time-complexities-of-different-data-structures/
// https://www.geeksforgeeks.org/dsa/complete-guide-on-complexity-analysis/
// https://www.geeksforgeeks.org/dsa/understanding-time-complexity-simple-examples/
// https://www.geeksforgeeks.org/dsa/time-complexity-and-space-complexity/


// Arrays, bubble SourceTextModule, selection, Insertion, queueMicrotask. counting, radix, merge, linear, Z_BINARY, trees , pre-In-Post order traversal, AVL trees, Dijstra's, bellman-Ford, Floyd, Johnson, graph, shortest path, cycle detection,, Prim'satisfies, Krushal, Ford-Fulkerson, Edmonds_karp
// https://www.w3schools.com/dsa/dsa_data_arrays.php


Perfect 🔥 — you’re basically asking for a **complete roadmap of DSA algorithms**, divided into:

1. **Must-Know (High Priority)** — the ones that *every developer or interviewer expects you to master*.
2. **Advanced / Optional (Low Priority)** — good for optimization, competitive programming, or research-level learning.

We’ll also include **concepts**, **examples**, **time & space complexities**, and **problem types** where they shine.

---

# 🧠 PART 1 — MUST-KNOW DSA ALGORITHMS (CORE)

These are **fundamentals** — every top company (FAANG, startups, hackathons) expects you to know these thoroughly.

---

## 🔍 Searching Algorithms

| Algorithm              | Concept                                           | Example                       | Time Complexity | Space | Used For                                  |
| ---------------------- | ------------------------------------------------- | ----------------------------- | --------------- | ----- | ----------------------------------------- |
| **Linear Search**      | Scan each element until found.                    | Find `x` in `[1,4,2,5]`       | O(n)            | O(1)  | Unsorted data, small arrays               |
| **Binary Search**      | Divide sorted array and eliminate half each step. | Find `10` in `[1,3,5,7,9,11]` | O(log n)        | O(1)  | Sorted arrays, searching problems         |
| **Two Pointer Search** | Two indices scanning array for pair/sum/etc.      | Check if pair sums to target  | O(n)            | O(1)  | Sorted arrays, pair-sum, palindrome check |

**Problems:**

* Pair with given sum
* Count triplets
* Find first/last occurrence
* Square root (binary search on answer)

---

## 🧩 Sorting Algorithms

| Type             | Algorithm          | Idea                               | Time                    | Space    | Notes                     |
| ---------------- | ------------------ | ---------------------------------- | ----------------------- | -------- | ------------------------- |
| Simple           | **Bubble Sort**    | Repeatedly swap adjacent elements  | O(n²)                   | O(1)     | Learning purpose          |
| Simple           | **Insertion Sort** | Build sorted list one by one       | O(n²)                   | O(1)     | Good for small arrays     |
| Selection        | **Selection Sort** | Pick smallest, place at front      | O(n²)                   | O(1)     | In-place                  |
| Divide & Conquer | **Merge Sort**     | Divide → sort → merge              | O(n log n)              | O(n)     | Stable, used in many libs |
| Divide & Conquer | **Quick Sort**     | Partition + recursive sort         | O(n log n), worst O(n²) | O(log n) | Very fast in practice     |
| Heap             | **Heap Sort**      | Use heap to repeatedly extract max | O(n log n)              | O(1)     | In-place, not stable      |

**Problems:**

* Sort by frequency
* Kth largest/smallest element (Heap)
* Merge intervals
* Meeting room problems

---

## 🔁 Recursion & Backtracking

| Algorithm        | Idea                  | Example                   | Used For                  |
| ---------------- | --------------------- | ------------------------- | ------------------------- |
| **Recursion**    | Function calls itself | Factorial, Fibonacci      | Divide & conquer          |
| **Backtracking** | Try → explore → undo  | N-Queens, Sudoku, Subsets | Constraint-based problems |

**Problems:**

* Permutations / Combinations
* Subset sum
* Rat in a maze
* Palindrome partitioning

---

## 🧮 Prefix Sum & Sliding Window

| Concept            | Use                                 | Example                    | Complexity                     |
| ------------------ | ----------------------------------- | -------------------------- | ------------------------------ |
| **Prefix Sum**     | Precompute cumulative sums          | Range sum queries          | O(n) preprocessing, O(1) query |
| **Sliding Window** | Fixed or variable window operations | Max sum subarray of size K | O(n)                           |

**Problems:**

* Max/Min subarray sum
* Longest substring without repeat
* Average of all subarrays of size K

---

## ⚙️ Hashing

| Concept            | Use                    | Example                     | Complexity |
| ------------------ | ---------------------- | --------------------------- | ---------- |
| **Hash Map / Set** | Constant time lookup   | Frequency count, duplicates | O(1) avg   |
| **Hash Functions** | Compute index for keys | String hashing, caching     | —          |

**Problems:**

* Two-sum
* Longest consecutive sequence
* Count distinct elements

---

## 🪄 Greedy Algorithms

| Algorithm               | Idea                        | Example             | Time       | Used For             |
| ----------------------- | --------------------------- | ------------------- | ---------- | -------------------- |
| **Activity Selection**  | Pick earliest finishing job | Interval scheduling | O(n log n) | Scheduling, meetings |
| **Huffman Encoding**    | Optimal prefix codes        | Compression         | O(n log n) | Data compression     |
| **Kruskal / Prim**      | Minimum Spanning Tree       | Graphs              | O(E log V) | Network design       |
| **Fractional Knapsack** | Choose max profit/weight    | Greedy ratio        | O(n log n) | Optimization         |

**Problems:**

* Job sequencing
* Coin change (greedy version)
* Connecting ropes (min cost)

---

## 🧭 Shortest Path (Graph)

| Algorithm          | Use                                  | Time                | Graph Type         |
| ------------------ | ------------------------------------ | ------------------- | ------------------ |
| **Dijkstra**       | Shortest path (non-negative weights) | O(V²) or O(E log V) | Weighted, directed |
| **Bellman–Ford**   | Handles negative weights             | O(VE)               | Weighted           |
| **Floyd–Warshall** | All-pairs shortest paths             | O(V³)               | Dense graphs       |
| **BFS (0–1 BFS)**  | Unweighted shortest path             | O(V+E)              | Unweighted         |

**Problems:**

* Network delay time
* Cheapest flight within K stops
* Word ladder

---

## 🌳 Trees & Graph Traversals

| Algorithm                          | Description                        | Time   | Used For                  |
| ---------------------------------- | ---------------------------------- | ------ | ------------------------- |
| **DFS (Depth First Search)**       | Explore deeply before backtracking | O(V+E) | Pathfinding, connectivity |
| **BFS (Breadth First Search)**     | Explore level by level             | O(V+E) | Shortest path, levels     |
| **Inorder / Preorder / Postorder** | Binary tree traversals             | O(n)   | Tree processing           |

**Problems:**

* Connected components
* Topological sort
* Cycle detection
* Binary tree views

---

## 🔪 Divide and Conquer

| Algorithm                  | Use                   | Time       | Example  |
| -------------------------- | --------------------- | ---------- | -------- |
| **Binary Search**          | Divide array halves   | O(log n)   | Search   |
| **Merge Sort**             | Divide, sort, merge   | O(n log n) | Sorting  |
| **Quick Sort**             | Divide via pivot      | O(n log n) | Sorting  |
| **Closest Pair of Points** | Divide geometry space | O(n log n) | Geometry |

---

# ⚔️ PART 2 — ADVANCED / OPTIONAL ALGORITHMS

These are **useful for optimization, competitive programming, or specialized domains**.

---

## 🔍 Advanced Searching

| Algorithm                  | Concept                             | Time             | Use Case                       |
| -------------------------- | ----------------------------------- | ---------------- | ------------------------------ |
| **Sentinel Linear Search** | Adds sentinel to reduce comparisons | O(n)             | Minor optimization             |
| **Meta Binary Search**     | Binary search variant               | O(log n)         | Bit-level optimization         |
| **Ternary Search**         | Divide into 3 parts                 | O(log₃ n)        | Find min/max in unimodal array |
| **Jump Search**            | Jump √n steps                       | O(√n)            | Sorted arrays                  |
| **Interpolation Search**   | Proportional index search           | O(log log n) avg | Uniformly distributed data     |
| **Exponential Search**     | Expand range exponentially          | O(log n)         | Unknown array size             |
| **Fibonacci Search**       | Use Fibonacci numbers               | O(log n)         | Low-memory environments        |

---

## 🌀 Advanced Sorting & Hybrids

| Algorithm                 | Idea                         | Time       | Notes                |
| ------------------------- | ---------------------------- | ---------- | -------------------- |
| **Counting Sort**         | Count occurrences            | O(n + k)   | Integers only        |
| **Radix Sort**            | Sort by digits               | O(nk)      | Non-comparison       |
| **Bucket Sort**           | Distribute into buckets      | O(n + k)   | Uniform data         |
| **Cycle Sort**            | Place element in correct pos | O(n²)      | Min swaps            |
| **TimSort (Python/Java)** | Merge + Insertion hybrid     | O(n log n) | Real-world optimized |
| **IntroSort (C++)**       | Quick + Heap + Insertion     | O(n log n) | Adaptive             |

---

## 🔁 Dynamic Programming (DP)

| Concept                                            | Idea                                 | Example             | Time    |
| -------------------------------------------------- | ------------------------------------ | ------------------- | ------- |
| **Overlapping Subproblems + Optimal Substructure** | Store results to avoid recomputation | Fibonacci, Knapsack | O(n²)   |
| **Memoization (Top-Down)**                         | Recursive caching                    | O(n)                | Simpler |
| **Tabulation (Bottom-Up)**                         | Iterative DP                         | O(n)                | Faster  |

**Common DP Patterns:**

* 0/1 Knapsack
* Longest Common Subsequence
* Matrix path problems
* Subset sum
* Coin change

---

## 🧮 Graph Advanced Algorithms

| Algorithm                 | Use                                      | Time             |
| ------------------------- | ---------------------------------------- | ---------------- |
| **Kruskal / Prim**        | MST                                      | O(E log V)       |
| **Topological Sort**      | DAG ordering                             | O(V+E)           |
| **Tarjan’s / Kosaraju’s** | Strongly Connected Components            | O(V+E)           |
| **Union-Find (DSU)**      | Cycle detection, MST                     | O(α(n))          |
| **Johnson’s Algorithm**   | All-pairs shortest path (negative edges) | O(V² log V + VE) |

---

## 🧠 Other Key Techniques

| Technique                     | Use                            | Problems                            |
| ----------------------------- | ------------------------------ | ----------------------------------- |
| **Two Pointer**               | Optimize pair/triplet problems | Sorted array sums, palindrome check |
| **Sliding Window**            | Continuous subarray/substring  | Max sum, longest substring          |
| **Prefix/Suffix Sum**         | Range queries                  | Range updates                       |
| **Binary Lifting**            | LCA in trees                   | Competitive programming             |
| **Bit Manipulation**          | Optimize logic                 | Subsets, counting bits, XOR tricks  |
| **Union-Find (Disjoint Set)** | Graph connectivity             | Kruskal’s MST, network problems     |
| **Topological Sort**          | Task ordering                  | Course schedule, dependencies       |

---

# 🧩 Bonus: Algorithm Categories by Application

| Category                   | Example Problems                      |
| -------------------------- | ------------------------------------- |
| **Array/Strings**          | Two-pointer, Sliding window, Kadane’s |
| **Tree/Graph**             | DFS, BFS, Topo sort, Dijkstra         |
| **Recursion/Backtracking** | N-Queens, Subsets                     |
| **DP**                     | LCS, LIS, Knapsack                    |
| **Greedy**                 | Job sequencing, Huffman               |
| **Divide & Conquer**       | Merge sort, Binary search             |
| **Math/Bit**               | GCD, Sieve, Power, XOR subset         |

---

# 🧱 Priority Summary

| Level                              | Algorithms                                                                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🥇 **Must Learn (Core)**           | Linear/Binary Search, Two-pointer, Sorting (Merge, Quick, Heap), Recursion, BFS/DFS, Dijkstra, Prefix Sum, Sliding Window, Greedy (Activity, Knapsack), Dynamic Programming Basics |
| 🥈 **Good to Know (Intermediate)** | Ternary, Jump, Counting, Radix, Topo Sort, Union-Find, Bellman-Ford, Floyd-Warshall                                                                                                |
| 🥉 **Optional / Advanced**         | Johnson’s, Fibonacci Search, Cycle Sort, TimSort, Binary Lifting, 0-1 BFS, D’Esopo-Pape                                                                                            |

---

If you want, I can make you a **study roadmap (week-wise)** that covers these algorithms in the best order — starting from arrays & recursion to advanced DP & graphs (with problem links from LeetCode + GFG).
Would you like that?

Great question 👌
Let’s go step-by-step — here’s a **clear and complete explanation of *method overloading* in C++**, with examples and notes on how it works under the hood.

---

Excellent list 🔥 — you just mentioned a **power-packed mix of must-know algorithms & data structures** — mostly from **Arrays**, **Sorting**, **Trees**, and **Graphs**.

Let’s do this properly 👇
I’ll explain each **concept + use case + example + time/space complexity + problem types it solves** — all in a clean, reference-style cheat sheet.

---

# 🧠 DSA CHEAT SHEET (For Your List)

---

## 🧩 **1. Arrays**

**Concept:**
A collection of elements stored in contiguous memory. Direct access via index.

**Key Operations:**

* Traversal – O(n)
* Search – O(n) (Linear), O(log n) if sorted (Binary)
* Insert/Delete – O(n)

**Common Problems:**

* Kadane’s algorithm (Max subarray sum)
* Two-sum
* Rotate array
* Merge intervals
* Trapping rain water

---

## 🔄 **2. Bubble Sort**

**Idea:**
Repeatedly swap adjacent elements if they are in the wrong order.

**Example:**
`[5,3,4,1] → [3,4,1,5] → [3,1,4,5] → [1,3,4,5]`

**Complexity:**

* Time: O(n²)
* Space: O(1)
* Stable: ✅ Yes

**Used For:**

* Teaching basic sorting
* Small input optimizations

---

## 🎯 **3. Selection Sort**

**Idea:**
Select the smallest element and put it at the beginning of the unsorted part.

**Example:**
`[4,3,1,2] → [1,3,4,2] → [1,2,4,3] → [1,2,3,4]`

**Complexity:**

* Time: O(n²)
* Space: O(1)
* Stable: ❌ No

**Used For:**

* Small datasets, easy implementation

---

## ✍️ **4. Insertion Sort**

**Idea:**
Insert each element into its correct position among previously sorted elements.

**Example:**
`[5,2,4,6] → [2,5,4,6] → [2,4,5,6]`

**Complexity:**

* Time: O(n²)
* Space: O(1)
* Stable: ✅ Yes
* Best Case: O(n) (when nearly sorted)

**Used For:**

* Nearly sorted data (e.g., small datasets in TimSort)

---

## 🧮 **5. Counting Sort**

**Idea:**
Count frequency of each element, then calculate positions using prefix sums.

**Example:**
Array: `[4,2,2,8,3]` → Count → `[0,0,2,1,1,0,0,0,1]` → Sorted output.

**Complexity:**

* Time: O(n + k)
* Space: O(k)
* Stable: ✅ Yes
* Works only for integers in limited range.

**Used For:**

* Integer sorting
* Radix sort subroutine

---

## 🔢 **6. Radix Sort**

**Idea:**
Sort numbers digit by digit using a stable sort like counting sort.

**Example:**
Sort `[170, 45, 75, 90]` by units → tens → hundreds.

**Complexity:**

* Time: O(nk) (k = number of digits)
* Space: O(n + k)
* Stable: ✅ Yes

**Used For:**

* Sorting integers, phone numbers, IDs

---

## 🪄 **7. Merge Sort**

**Idea:**
Divide array → Sort halves → Merge results.

**Example:**
`[5,3,8,4] → [5,3] + [8,4] → [3,5] + [4,8] → [3,4,5,8]`

**Complexity:**

* Time: O(n log n)
* Space: O(n)
* Stable: ✅ Yes

**Used For:**

* Stable sort required
* Linked list sorting
* External sorting (large datasets)

---

## 🔍 **8. Linear Search**

**Idea:**
Traverse list and compare each element.

**Example:**
Search 7 in `[3,9,7,1]` → found at index 2.

**Complexity:**

* Time: O(n)
* Space: O(1)

**Used For:**

* Unsorted data
* Linked lists, small datasets

---

## 🌳 **9. Trees**

**Concept:**
Hierarchical data structure with parent-child relationship.
Each node can have multiple children.

**Operations:**

* Traversal: O(n)
* Insert/Delete/Search (BST): O(h), where h = tree height

**Used For:**

* Hierarchical data (e.g., DOM, org charts)
* Search, sort, indexing

---

## 🔄 **10. Tree Traversals**

| Type                | Order               | Example (for Tree)    | Used For                        |
| ------------------- | ------------------- | --------------------- | ------------------------------- |
| **Inorder (LNR)**   | Left → Node → Right | Sorted output for BST | Binary Search Trees             |
| **Preorder (NLR)**  | Node → Left → Right | Root-first            | Tree serialization              |
| **Postorder (LRN)** | Left → Right → Node | Children-first        | Deletion, Expression evaluation |

**Complexity:**

* Time: O(n)
* Space: O(h)

---

## 🌲 **11. AVL Trees (Self-Balancing BST)**

**Idea:**
Keeps height difference (balance factor) ≤ 1 for every node.

**Rotations Used:**

* Left, Right, Left-Right, Right-Left

**Complexity:**

* Insert/Delete/Search: O(log n)
* Space: O(n)

**Used For:**

* Databases, search engines, memory indexing

---

## 🌉 **12. Dijkstra’s Algorithm**

**Idea:**
Find shortest path from a source to all vertices in a weighted graph (no negative weights).

**Process:**
Use min-priority queue to pick smallest distance node.

**Complexity:**

* O(V²) (array) or O(E log V) (heap)
* Space: O(V)

**Used For:**

* GPS navigation, routing, network latency

---

## ⚡ **13. Bellman–Ford Algorithm**

**Idea:**
Relax all edges |V|-1 times to find shortest path (handles negative weights).

**Complexity:**

* O(VE)
* Space: O(V)

**Used For:**

* Graphs with negative edges
* Detecting negative cycles

---

## 🌐 **14. Floyd–Warshall Algorithm**

**Idea:**
Dynamic programming approach to find **all pairs shortest paths**.

**Complexity:**

* O(V³)
* Space: O(V²)

**Used For:**

* Dense graphs
* Distance matrix computations

---

## 🧭 **15. Johnson’s Algorithm**

**Idea:**
Reweights graph edges (using Bellman-Ford) → applies Dijkstra for all pairs shortest paths.

**Complexity:**

* O(V² log V + VE)

**Used For:**

* Sparse graphs with negative weights
* All-pairs shortest paths efficiently

---

## 🕸️ **16. Graph**

**Concept:**
Vertices + Edges (directed/undirected, weighted/unweighted).

**Representations:**

* Adjacency list (O(V+E))
* Adjacency matrix (O(V²))

**Traversals:**

* DFS (Depth) → Recursive exploration
* BFS (Breadth) → Level order using queue

**Used For:**

* Networks, social graphs, pathfinding

---

## 🚦 **17. Shortest Path Algorithms (Summary)**

| Algorithm          | Negative Edges | All Pairs? | Complexity       | Type   |
| ------------------ | -------------- | ---------- | ---------------- | ------ |
| **Dijkstra**       | ❌              | ❌          | O(E log V)       | Greedy |
| **Bellman-Ford**   | ✅              | ❌          | O(VE)            | DP     |
| **Floyd–Warshall** | ✅              | ✅          | O(V³)            | DP     |
| **Johnson**        | ✅              | ✅          | O(V² log V + VE) | Hybrid |

---

## 🔁 **18. Cycle Detection**

**Methods:**

* **DFS-based:** Track visited + recursion stack (Directed graph)
* **Union-Find (DSU):** For Undirected graphs

**Complexity:**
O(V+E)

**Used For:**

* Deadlock detection
* Detecting loops in dependency graphs

---

## 🕸️ **19. Prim’s Algorithm**

**Idea:**
Pick minimum edge connecting MST to a new vertex (Greedy).

**Complexity:**

* O(E log V) (with heap)
* O(V²) (adjacency matrix)

**Used For:**

* Minimum Spanning Tree (MST)
* Network cost optimization

---

## 🔗 **20. Kruskal’s Algorithm**

**Idea:**
Sort edges by weight → pick smallest edge that doesn’t form a cycle (using DSU).

**Complexity:**

* O(E log E)
* Space: O(V)

**Used For:**

* MST construction
* Clustering algorithms

---

## 💧 **21. Ford–Fulkerson Algorithm**

**Idea:**
Find **maximum flow** in a network using augmenting paths (via DFS/BFS).

**Complexity:**

* O(E × max_flow)
* Space: O(V)

**Used For:**

* Network flow, max bipartite matching, job assignment

---

## ⚙️ **22. Edmonds–Karp Algorithm**

**Idea:**
Implementation of Ford–Fulkerson using **BFS** for finding shortest augmenting path.

**Complexity:**

* O(V × E²)
* Space: O(V + E)

**Used For:**

* Max flow problems with guaranteed polynomial time

---

# 🧱 Summary Table (All in One)

| Algorithm                      | Category | Time                | Use Case           |
| ------------------------------ | -------- | ------------------- | ------------------ |
| Linear Search                  | Search   | O(n)                | Unsorted data      |
| Binary Search                  | Search   | O(log n)            | Sorted arrays      |
| Bubble / Selection / Insertion | Sort     | O(n²)               | Basic sorting      |
| Counting / Radix / Merge       | Sort     | O(n+k) / O(n log n) | Efficient sorting  |
| Tree Traversals                | Tree     | O(n)                | Tree exploration   |
| AVL Tree                       | BST      | O(log n)            | Balanced searching |
| Dijkstra                       | Graph    | O(E log V)          | Shortest path      |
| Bellman-Ford                   | Graph    | O(VE)               | Neg. edges         |
| Floyd–Warshall                 | Graph    | O(V³)               | All-pairs          |
| Johnson                        | Graph    | O(V² log V)         | Sparse + neg edges |
| Prim / Kruskal                 | Graph    | O(E log V)          | MST                |
| Ford–Fulkerson / Edmonds–Karp  | Flow     | O(VE²)              | Max flow           |
| Cycle Detection                | Graph    | O(V+E)              | Loop detection     |

---

Would you like me to create a **visual study roadmap (week-wise or topic-wise)** showing what to learn in what order (Arrays → Sorting → Trees → Graphs → Flow)?
It’ll help you cover everything from scratch to advanced in structured way.


Perfect 😎 — you want me to **teach you DSA algorithms properly**, not just list them.
We’ll go one-by-one (concept → code → dry run → example → complexity → intuition → problem types).

Let’s start at the **right level** — I’ll pick *medium-level practical algorithms* in the right progression.

---

# 🧩 Step 1 — Arrays & Searching

We’ll begin with **Linear Search** and **Binary Search** (foundation for many other algorithms).

---

## 🔍 **1. Linear Search**

**🧠 Idea:**
Scan each element one by one until you find the target.

**📘 Example:**
Find 5 in `[2, 8, 5, 1, 9]`.

**⚙️ Code (Python):**

```python
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i  # return index
    return -1

print(linear_search([2, 8, 5, 1, 9], 5))
```

**🧮 Dry Run:**

* i=0 → 2≠5
* i=1 → 8≠5
* i=2 → 5✅ found → return 2

**⏱️ Time:** O(n)
**💾 Space:** O(1)

**💡 When to use:**

* Array is **unsorted** or small
* You can’t afford sorting overhead

---

## ⚡ **2. Binary Search**

**🧠 Idea:**
Works only on sorted arrays.
We repeatedly divide the search space in half.

**📘 Example:**
Find 8 in `[1, 3, 5, 7, 8, 10, 12]`

**⚙️ Code:**

```python
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

print(binary_search([1,3,5,7,8,10,12], 8))
```

**🧮 Dry Run:**

* low=0, high=6 → mid=3 (arr[3]=7) → 7<8 → low=4
* low=4, high=6 → mid=5 (arr[5]=10) → 10>8 → high=4
* low=4, high=4 → mid=4 → arr[4]=8 ✅ found.

**⏱️ Time:** O(log n)
**💾 Space:** O(1)

**💡 When to use:**

* Array is sorted
* You need fast searching (e.g., finding element, lower bound, upper bound, etc.)

---

# 🔁 Step 2 — Sorting Algorithms

Let’s cover **Bubble**, **Selection**, **Insertion**, **Merge**, and **Counting Sort**
We’ll go from *slow → efficient*.

---

## 🫧 **3. Bubble Sort**

**🧠 Idea:**
Repeatedly swap adjacent elements if they’re in the wrong order.
After each pass, the largest element “bubbles up” to the end.

**📘 Example:**
`[5, 3, 1, 4]`

**⚙️ Code:**

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr

print(bubble_sort([5,3,1,4]))
```

**🧮 Dry Run:**
Pass 1 → `[3,1,4,5]`
Pass 2 → `[1,3,4,5]`
Sorted ✅

**⏱️ Time:** O(n²), best case O(n)
**💾 Space:** O(1)

**💡 Used For:**
Teaching, very small datasets.

---

## 🎯 **4. Selection Sort**

**🧠 Idea:**
Find smallest element and swap with the first unsorted position.

**📘 Example:**
`[64, 25, 12, 22, 11]`

**⚙️ Code:**

```python
def selection_sort(arr):
    for i in range(len(arr)):
        min_index = i
        for j in range(i+1, len(arr)):
            if arr[j] < arr[min_index]:
                min_index = j
        arr[i], arr[min_index] = arr[min_index], arr[i]
    return arr

print(selection_sort([64,25,12,22,11]))
```

**🧮 Dry Run:**
Step 1 → 11 smallest → `[11,25,12,22,64]`
Step 2 → 12 smallest → `[11,12,25,22,64]`
...

**⏱️ Time:** O(n²)
**💾 Space:** O(1)
**💡 Used For:**
Easy to implement, low memory.

---

## ✍️ **5. Insertion Sort**

**🧠 Idea:**
Take one element at a time and insert it into its correct sorted position.

**📘 Example:**
`[5, 3, 4, 1]`

**⚙️ Code:**

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i-1
        while j >= 0 and arr[j] > key:
            arr[j+1] = arr[j]
            j -= 1
        arr[j+1] = key
    return arr

print(insertion_sort([5,3,4,1]))
```

**🧮 Dry Run:**

* i=1 → key=3 → insert before 5 → `[3,5,4,1]`
* i=2 → key=4 → `[3,4,5,1]`
* i=3 → key=1 → `[1,3,4,5]`

**⏱️ Time:** O(n²), best case O(n)
**💾 Space:** O(1)

**💡 Used For:**

* Nearly sorted arrays
* Adaptive sorts (used inside TimSort)

---

## ⚡ **6. Merge Sort**

**🧠 Idea:**
Divide the array in halves → sort both → merge them in sorted order.

**📘 Example:**
`[5,3,8,4,2]`

**⚙️ Code:**

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr)//2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    res = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            res.append(left[i])
            i += 1
        else:
            res.append(right[j])
            j += 1
    res += left[i:]
    res += right[j:]
    return res

print(merge_sort([5,3,8,4,2]))
```

**🧮 Dry Run:**
Split → `[5,3]`, `[8,4,2]` → merge `[3,5]`, `[2,4,8]` → final `[2,3,4,5,8]`

**⏱️ Time:** O(n log n)
**💾 Space:** O(n)
**💡 Used For:**
Stable sorting, linked lists, big data sorting

---

## 🔢 **7. Counting Sort**

**🧠 Idea:**
Count frequency of each value, then reconstruct sorted array.

**📘 Example:**
`[4, 2, 2, 8, 3]`

**⚙️ Code:**

```python
def counting_sort(arr):
    max_val = max(arr)
    # [0] * n = ek naya list of n zeros. Size max_val+1 isliye taaki index 0 se
    # max_val tak har number ka apna counter-slot mil jaye (INDEX hi number represent karta hai, value nahi).
    count = [0] * (max_val + 1)
    for num in arr:
        count[num] += 1  # jitni baar 'num' aaya, uske apne index pe count badhta jayega

    output = []
    for i in range(len(count)):
        # count[i] = ye number (i) kitni baar tha -> utni baar hi output me daalo.
        # [i] * count[i]: agar count[i]=2 to [i,i]. extend = list ke andar list ko merge karta hai (append nahi karta).
        output.extend([i] * count[i])
    return output

print(counting_sort([4,2,2,8,3]))
```

**🧮 Dry Run:**
Count = [0,0,2,1,1,0,0,0,1] → output `[2,2,3,4,8]`

**⏱️ Time:** O(n + k)
**💾 Space:** O(k)

**💡 Used For:**

* Sorting integers in limited range (0 to k)

---

Would you like me to move next to
➡️ **Tree Algorithms (Inorder, Preorder, Postorder + AVL concept)**
with medium examples and visualization next?
(We’ll cover how recursion builds traversals, and how AVL maintains balance.)



Perfect 👌 — we’ll **learn each algorithm in JavaScript**, step-by-step, with **medium-level examples**, **explanations**, and **complexity analysis**.

We’ll go by categories so you get a full grasp.
Let’s start with **Searching Algorithms**, then move to **Sorting**, **Graph**, **Trees**, and so on.

---

## 🧩 1. Searching Algorithms

### 🔹 Linear Search

Search sequentially from start to end.

```js
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

console.log(linearSearch([10, 25, 30, 45, 50], 45)); // 3
```

🧠 **Time Complexity:** O(n)
💾 **Space Complexity:** O(1)
🎯 **Used for:** Unsorted arrays or small datasets.

---

### 🔹 Binary Search

Requires **sorted array**; divides the range in half each time.

```js
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return -1;
}

console.log(binarySearch([5, 10, 15, 20, 25, 30], 20)); // 3
```

🧠 **Time Complexity:** O(log n)
💾 **Space:** O(1)
🎯 **Used for:** Searching in sorted arrays, like IDs, prices, etc.

---

## 🔢 2. Sorting Algorithms

### 🔹 Bubble Sort

Repeatedly swaps adjacent elements if they’re in the wrong order.

```js
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    }
  }
  return arr;
}

console.log(bubbleSort([5, 3, 8, 4, 2])); // [2, 3, 4, 5, 8]
```

🧠 O(n²) | 💾 O(1)
🎯 **Used for:** Educational purpose, small data, rarely in production.

---

### 🔹 Selection Sort

Selects the smallest element each time and places it in the correct position.

```js
function selectionSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}

console.log(selectionSort([64, 25, 12, 22, 11]));
```

🧠 O(n²) | 💾 O(1)
🎯 **Used for:** Understanding sorting logic, small datasets.

---

### 🔹 Insertion Sort

Inserts each element into its correct position in a sorted part of the array.

```js
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

console.log(insertionSort([12, 11, 13, 5, 6]));
```

🧠 **O(n²)** worst, **O(n)** best (when nearly sorted).
🎯 Used in **online sorting**, **real-time systems**.

---

### 🔹 Merge Sort (Divide and Conquer)

Splits array recursively and merges sorted halves.

```js
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  let res = [], i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) res.push(left[i++]);
    else res.push(right[j++]);
  }
  return res.concat(left.slice(i)).concat(right.slice(j));
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
```

🧠 O(n log n) | 💾 O(n)
🎯 Used for large data sets, **stable sort**.

---

### 🔹 Quick Sort (Divide and Conquer)

Selects a pivot and partitions array.

```js
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = arr.filter(x => x < pivot);
  const right = arr.filter(x => x > pivot);
  const equal = arr.filter(x => x === pivot);
  return [...quickSort(left), ...equal, ...quickSort(right)];
}

console.log(quickSort([10, 7, 8, 9, 1, 5]));
```

🧠 O(n log n) average, O(n²) worst
🎯 Used in **system sort functions**, **databases**, **real-time apps**.

---

Next, we’ll move to **Tree Algorithms** 🌳
like:

* Traversals (Inorder, Preorder, Postorder)
* Binary Search Tree insertion/search
* AVL Tree balancing

Then after that → **Graph Algorithms**
(Dijkstra, Bellman-Ford, Floyd-Warshall, Prim’s, Kruskal, etc.)

---

Would you like me to continue with **Tree algorithms next**, or cover **advanced sorting** like Heap Sort, Counting Sort, and Radix Sort first?


Perfect 🔥
Let’s move on to **Tree Algorithms** — one of the most important foundations for graph and recursion-heavy problems.

---

## 🌳 3. Tree Algorithms in JavaScript

A **Tree** is a hierarchical data structure where each node has:

* `value`
* `left` (child)
* `right` (child)

Let’s start by defining a basic **Binary Tree Node** class.

```js
class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}
```

We’ll use this structure in the next examples.

---

### 🔹 3.1 Tree Traversals

Traversals define **how to visit all nodes** in a tree.

Let’s build this tree 👇

```
        1
       / \
      2   3
     / \
    4   5
```

```js
const root = new Node(1);
root.left = new Node(2);
root.right = new Node(3);
root.left.left = new Node(4);
root.left.right = new Node(5);
```

---

### 🧭 (A) Inorder Traversal (Left → Root → Right)

Used for **Binary Search Trees** to get **sorted order**.

```js
function inorder(node) {
  if (!node) return;
  inorder(node.left);
  console.log(node.value);
  inorder(node.right);
}

inorder(root);
// Output: 4, 2, 5, 1, 3
```

🧠 Time: O(n) | Space: O(h)
🎯 Used in: Printing sorted order from BST.

---

### 🧭 (B) Preorder Traversal (Root → Left → Right)

Used for **tree copying** or **expression tree prefix form**.

```js
function preorder(node) {
  if (!node) return;
  console.log(node.value);
  preorder(node.left);
  preorder(node.right);
}

preorder(root);
// Output: 1, 2, 4, 5, 3
```

---

### 🧭 (C) Postorder Traversal (Left → Right → Root)

Used in **deleting a tree** or **evaluating postfix expressions**.

```js
function postorder(node) {
  if (!node) return;
  postorder(node.left);
  postorder(node.right);
  console.log(node.value);
}

postorder(root);
// Output: 4, 5, 2, 3, 1
```

---

### 🔹 3.2 Level Order (Breadth-First Search on Tree)

Visits nodes level by level using a **queue**.

```js
function levelOrder(root) {
  if (!root) return;
  const queue = [root];

  while (queue.length) {
    const node = queue.shift();
    console.log(node.value);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
}

levelOrder(root);
// Output: 1, 2, 3, 4, 5
```

🧠 Time: O(n) | Space: O(n)

---

## 🌲 3.3 Binary Search Tree (BST)

### Insert and Search in BST

```js
class BST {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const newNode = new Node(value);
    if (!this.root) return (this.root = newNode);

    let curr = this.root;
    while (true) {
      if (value < curr.value) {
        if (!curr.left) {
          curr.left = newNode;
          return;
        }
        curr = curr.left;
      } else {
        if (!curr.right) {
          curr.right = newNode;
          return;
        }
        curr = curr.right;
      }
    }
  }

  search(value) {
    let curr = this.root;
    while (curr) {
      if (curr.value === value) return true;
      curr = value < curr.value ? curr.left : curr.right;
    }
    return false;
  }
}

const bst = new BST();
[8, 3, 10, 1, 6, 14, 4, 7, 13].forEach(v => bst.insert(v));
console.log(bst.search(7)); // true
console.log(bst.search(5)); // false
```

🧠 Average: O(log n), Worst (skewed): O(n)

🎯 **Used in:**

* Fast lookup & insertion (symbol tables, dictionaries)
* Range queries
* Sorted data storage

---

## ⚖️ 3.4 AVL Tree (Self-Balancing BST)

AVL = Adelson-Velsky and Landis Tree
Balances itself so height difference (left-right) ≤ 1 for all nodes.

We’ll look at a simplified version to get the concept:

```js
class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

class AVLTree {
  getHeight(node) {
    return node ? node.height : 0;
  }

  getBalance(node) {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  rightRotate(y) {
    let x = y.left;
    let T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

    return x;
  }

  leftRotate(x) {
    let y = x.right;
    let T2 = y.left;

    y.left = x;
    x.right = T2;

    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

    return y;
  }

  insert(node, value) {
    if (!node) return new AVLNode(value);
    if (value < node.value) node.left = this.insert(node.left, value);
    else if (value > node.value) node.right = this.insert(node.right, value);
    else return node;

    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
    const balance = this.getBalance(node);

    // Balance cases
    if (balance > 1 && value < node.left.value) return this.rightRotate(node); // LL
    if (balance < -1 && value > node.right.value) return this.leftRotate(node); // RR
    if (balance > 1 && value > node.left.value) { // LR
      node.left = this.leftRotate(node.left);
      return this.rightRotate(node);
    }
    if (balance < -1 && value < node.right.value) { // RL
      node.right = this.rightRotate(node.right);
      return this.leftRotate(node);
    }

    return node;
  }
}

const avl = new AVLTree();
let rootAVL = null;
[10, 20, 30, 40, 50, 25].forEach(v => rootAVL = avl.insert(rootAVL, v));
```

🧠 Time: O(log n) | 💾 Space: O(n)
🎯 **Used for:** Maintaining sorted data with guaranteed balance.

---

✅ **Tree Recap:**

| Algorithm   | Best Use             | Time     | Notes               |
| ----------- | -------------------- | -------- | ------------------- |
| Inorder     | Sorted BST traversal | O(n)     | Left → Root → Right |
| Preorder    | Tree serialization   | O(n)     | Root → Left → Right |
| Postorder   | Delete or evaluate   | O(n)     | Left → Right → Root |
| Level Order | BFS                  | O(n)     | Layer-by-layer      |
| BST         | Sorted storage       | O(log n) | Unbalanced → O(n)   |
| AVL         | Balanced BST         | O(log n) | Auto-balancing      |

---

Next up:
⚡ **Graph Algorithms in JavaScript**
We’ll cover:

* Representation (Adjacency List)
* BFS & DFS
* Dijkstra’s, Bellman-Ford, Floyd-Warshall
* Prim’s & Kruskal (MST)
* Cycle detection

Would you like to continue with **Graph algorithms** next?


Excellent 😎 — now we’ll go deep into **Graph Algorithms in JavaScript**.
This is one of the most *interview-heavy* and *real-world applicable* areas — used in **maps, networks, dependencies, and shortest path problems**.

---

# ⚙️ 4. Graph Algorithms in JavaScript

---

## 🔹 4.1 Graph Representation

We can represent a graph in two common ways:

1. **Adjacency List (recommended for sparse graphs)**
2. **Adjacency Matrix (for dense graphs)**

Let’s use **Adjacency List** with a `Map`.

```js
class Graph {
  constructor() {
    this.adjList = new Map();
  }

  addVertex(v) {
    if (!this.adjList.has(v)) this.adjList.set(v, []);
  }

  addEdge(v, w) {
    this.addVertex(v);
    this.addVertex(w);
    this.adjList.get(v).push(w);
    this.adjList.get(w).push(v); // remove if directed
  }

  printGraph() {
    for (let [v, edges] of this.adjList)
      console.log(v, "->", edges.join(", "));
  }
}

const g = new Graph();
g.addEdge("A", "B");
g.addEdge("A", "C");
g.addEdge("B", "D");
g.addEdge("C", "D");
g.printGraph();

/* Output:
A -> B, C
B -> A, D
C -> A, D
D -> B, C
*/
```

---

## 🔹 4.2 Breadth-First Search (BFS)

Used to explore **shortest paths in unweighted graphs**
and **level-order traversal**.

```js
function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];

  while (queue.length) {
    const vertex = queue.shift();
    if (!visited.has(vertex)) {
      console.log(vertex);
      visited.add(vertex);

      const neighbors = graph.adjList.get(vertex);
      for (const n of neighbors) {
        if (!visited.has(n)) queue.push(n);
      }
    }
  }
}

bfs(g, "A");
// Output: A, B, C, D
```

🧠 **Time:** O(V + E) | 💾 O(V)
🎯 **Used for:** Shortest path in **unweighted** graphs, connectivity check.

---

## 🔹 4.3 Depth-First Search (DFS)

Explores **deeply before backtracking** — used for:

* Cycle detection
* Topological sorting
* Path finding in mazes

```js
function dfs(graph, start, visited = new Set()) {
  console.log(start);
  visited.add(start);

  for (const neighbor of graph.adjList.get(start)) {
    if (!visited.has(neighbor)) dfs(graph, neighbor, visited);
  }
}

dfs(g, "A");
// Output (one possible): A, B, D, C
```

🧠 **Time:** O(V + E) | 💾 O(V)
🎯 **Used for:** Topological sort, connected components, cycle detection.

---

## 🛣️ 4.4 Dijkstra’s Algorithm (Shortest Path — Weighted Graph)

Finds **shortest distance from a single source** to all vertices in a weighted graph.

```js
class WeightedGraph {
  constructor() {
    this.adjList = new Map();
  }

  addEdge(u, v, w) {
    if (!this.adjList.has(u)) this.adjList.set(u, []);
    if (!this.adjList.has(v)) this.adjList.set(v, []);
    this.adjList.get(u).push({ node: v, weight: w });
    this.adjList.get(v).push({ node: u, weight: w }); // remove if directed
  }
}

function dijkstra(graph, start) {
  const distances = {};
  const pq = new Set();

  for (const v of graph.adjList.keys()) {
    distances[v] = Infinity;
    pq.add(v);
  }
  distances[start] = 0;

  while (pq.size) {
    let u = [...pq].reduce((a, b) => (distances[a] < distances[b] ? a : b));

    pq.delete(u);

    for (const { node, weight } of graph.adjList.get(u)) {
      let alt = distances[u] + weight;
      if (alt < distances[node]) distances[node] = alt;
    }
  }
  return distances;
}

const wg = new WeightedGraph();
wg.addEdge("A", "B", 4);
wg.addEdge("A", "C", 2);
wg.addEdge("B", "E", 3);
wg.addEdge("C", "D", 2);
wg.addEdge("C", "F", 4);
wg.addEdge("D", "E", 3);
wg.addEdge("E", "F", 1);

console.log(dijkstra(wg, "A"));
/* Output:
{
  A: 0,
  B: 4,
  C: 2,
  D: 4,
  E: 7,
  F: 6
}
*/
```

🧠 O((V + E) log V) (with heap)
🎯 **Used for:** GPS, routing, network optimization

---

## 🔹 4.5 Bellman–Ford Algorithm

Works with **negative weights** (unlike Dijkstra).
Detects **negative weight cycles** too.

```js
function bellmanFord(edges, V, start) {
  const dist = Array(V).fill(Infinity);
  dist[start] = 0;

  for (let i = 0; i < V - 1; i++) {
    for (const [u, v, w] of edges) {
      if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
    }
  }

  // Detect negative cycle
  for (const [u, v, w] of edges) {
    if (dist[u] + w < dist[v]) {
      console.log("Negative weight cycle detected!");
      return;
    }
  }

  return dist;
}

const edges = [
  [0, 1, 4],
  [0, 2, 5],
  [1, 2, -3],
  [2, 3, 4],
];
console.log(bellmanFord(edges, 4, 0));
// [0, 4, 1, 5]
```

🧠 O(V * E)
🎯 **Used for:** Currency arbitrage, negative-weight graph problems.

---

## 🔹 4.6 Floyd–Warshall Algorithm (All Pairs Shortest Path)

Finds shortest paths **between every pair of vertices**.

```js
function floydWarshall(graph) {
  const dist = graph.map(row => [...row]);
  const V = graph.length;

  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j])
          dist[i][j] = dist[i][k] + dist[k][j];
      }
    }
  }
  return dist;
}

const INF = Infinity;
const graphMatrix = [
  [0, 3, INF, 5],
  [2, 0, INF, 4],
  [INF, 1, 0, INF],
  [INF, INF, 2, 0],
];
console.log(floydWarshall(graphMatrix));
```

🧠 O(V³)
🎯 **Used for:** Dense graphs, routing tables, all-pairs paths.

---

## 🔹 4.7 Minimum Spanning Tree (MST)

Connects all vertices with **minimum total edge weight** (no cycles).

### 🟢 Prim’s Algorithm

```js
function primMST(graph) {
  const V = graph.length;
  const selected = Array(V).fill(false);
  const result = [];
  selected[0] = true;

  let edges = 0;
  while (edges < V - 1) {
    let min = Infinity, x = 0, y = 0;
    for (let i = 0; i < V; i++) {
      if (selected[i]) {
        for (let j = 0; j < V; j++) {
          if (!selected[j] && graph[i][j] && graph[i][j] < min) {
            min = graph[i][j];
            x = i;
            y = j;
          }
        }
      }
    }
    result.push([x, y, graph[x][y]]);
    selected[y] = true;
    edges++;
  }
  return result;
}

const primGraph = [
  [0, 2, 0, 6, 0],
  [2, 0, 3, 8, 5],
  [0, 3, 0, 0, 7],
  [6, 8, 0, 0, 9],
  [0, 5, 7, 9, 0],
];
console.log(primMST(primGraph));
```

🧠 O(V²) or O(E log V) (optimized)
🎯 Used for: Network design (minimum cable length, road network).

---

### 🟣 Kruskal’s Algorithm

Uses **Disjoint Set (Union-Find)** to avoid cycles.

```js
function kruskalMST(edges, V) {
  edges.sort((a, b) => a[2] - b[2]);
  const parent = Array(V).fill().map((_, i) => i);

  function find(i) {
    if (parent[i] === i) return i;
    return parent[i] = find(parent[i]);
  }

  function union(x, y) {
    parent[find(x)] = find(y);
  }

  const result = [];
  for (const [u, v, w] of edges) {
    if (find(u) !== find(v)) {
      result.push([u, v, w]);
      union(u, v);
    }
  }
  return result;
}

const edges2 = [
  [0, 1, 10],
  [0, 2, 6],
  [0, 3, 5],
  [1, 3, 15],
  [2, 3, 4],
];

console.log(kruskalMST(edges2, 4));
```

🧠 O(E log E)
🎯 Used for: Building cost-efficient network connections.

---

✅ **Graph Recap:**

| Algorithm      | Type                     | Best Use                      | Time             |
| -------------- | ------------------------ | ----------------------------- | ---------------- |
| BFS            | Unweighted               | Shortest path                 | O(V + E)         |
| DFS            | Traversal                | Path finding, cycle detection | O(V + E)         |
| Dijkstra       | Weighted, no negatives   | Shortest path                 | O((V + E) log V) |
| Bellman–Ford   | Weighted, with negatives | Detect negative cycles        | O(VE)            |
| Floyd–Warshall | All-pairs                | Dense graphs                  | O(V³)            |
| Prim’s         | MST                      | Dense graphs                  | O(V²)            |
| Kruskal’s      | MST                      | Sparse graphs                 | O(E log E)       |

---

Next up, we can cover either:

1. **Dynamic Programming (DP)** — Knapsack, LCS, LIS, Matrix path, etc.
2. **Greedy + Sliding Window + Prefix Sum Techniques** (like for interview patterns)

Which one do you want next — **DP** or **Greedy/Window/Prefix**?



Perfect 👌
Let’s continue with **Graph Algorithms** — the backbone of many real-world systems (like Google Maps, networking, and recommendation engines).
We’ll start from **Shortest Path Algorithms** — and cover **Dijkstra’s, Bellman-Ford, Floyd-Warshall, and Johnson’s** one by one with **JavaScript implementations**, **examples**, and **intuition**.

---

## 🧭 1. Dijkstra’s Algorithm — (Single Source Shortest Path for Positive Weights)

**Goal:**
Find the shortest path from a source node to all other nodes in a weighted graph (only works for **non-negative** weights).

**Time Complexity:**

* Using Min-Heap (Priority Queue): `O((V + E) log V)`
* Using simple array: `O(V^2)`

**Use Cases:**

* GPS navigation (Google Maps)
* Network routing
* Game pathfinding (A*, Dijkstra’s base)

---

### 🧠 Intuition

You start from the source node → pick the **nearest unvisited node** each time → update the distances to its neighbors → repeat until all are visited.

---

### ⚙️ Example Graph

```
    (2)
  A ---- B
  | \     \
 (4) (1)   (7)
  |    \     \
  C ---- D ---- E
     (3)   (2)
```

---

### 🧩 Implementation in JavaScript

```js
class PriorityQueue {
  constructor() {
    this.queue = [];
  }
  enqueue(node, priority) {
    this.queue.push({ node, priority });
    this.queue.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    return this.queue.shift();
  }
  isEmpty() {
    return this.queue.length === 0;
  }
}

function dijkstra(graph, start) {
  const distances = {};
  const pq = new PriorityQueue();

  for (let node in graph) {
    distances[node] = Infinity;
  }
  distances[start] = 0;
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const { node: current } = pq.dequeue();

    for (let neighbor in graph[current]) {
      const distance = graph[current][neighbor];
      const newDist = distances[current] + distance;

      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        pq.enqueue(neighbor, newDist);
      }
    }
  }
  return distances;
}

// Example graph as adjacency list
const graph = {
  A: { B: 2, C: 4, D: 1 },
  B: { A: 2, E: 7 },
  C: { A: 4, D: 3 },
  D: { A: 1, C: 3, E: 2 },
  E: { B: 7, D: 2 }
};

console.log(dijkstra(graph, 'A'));
```

**Output:**

```js
{ A: 0, B: 2, C: 4, D: 1, E: 3 }
```

---

## ⚡ Next: Bellman–Ford Algorithm

Used when the graph **can contain negative weights**.

Would you like me to continue next with **Bellman–Ford**, with code and visual explanation in JS?



// https://www.programiz.com/dsa/getting-started
// https://www.programiz.com/sql/and-or-not

Perfect 👌
Let’s continue with **Graph Algorithms** — the backbone of many real-world systems (like Google Maps, networking, and recommendation engines).
We’ll start from **Shortest Path Algorithms** — and cover **Dijkstra’s, Bellman-Ford, Floyd-Warshall, and Johnson’s** one by one with **JavaScript implementations**, **examples**, and **intuition**.

---

## 🧭 1. Dijkstra’s Algorithm — (Single Source Shortest Path for Positive Weights)

**Goal:**
Find the shortest path from a source node to all other nodes in a weighted graph (only works for **non-negative** weights).

**Time Complexity:**

* Using Min-Heap (Priority Queue): `O((V + E) log V)`
* Using simple array: `O(V^2)`

**Use Cases:**

* GPS navigation (Google Maps)
* Network routing
* Game pathfinding (A*, Dijkstra’s base)

---

### 🧠 Intuition

You start from the source node → pick the **nearest unvisited node** each time → update the distances to its neighbors → repeat until all are visited.

---

### ⚙️ Example Graph

```
    (2)
  A ---- B
  | \     \
 (4) (1)   (7)
  |    \     \
  C ---- D ---- E
     (3)   (2)
```

---

### 🧩 Implementation in JavaScript

```js
class PriorityQueue {
  constructor() {
    this.queue = [];
  }
  enqueue(node, priority) {
    this.queue.push({ node, priority });
    this.queue.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    return this.queue.shift();
  }
  isEmpty() {
    return this.queue.length === 0;
  }
}

function dijkstra(graph, start) {
  const distances = {};
  const pq = new PriorityQueue();

  for (let node in graph) {
    distances[node] = Infinity;
  }
  distances[start] = 0;
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const { node: current } = pq.dequeue();

    for (let neighbor in graph[current]) {
      const distance = graph[current][neighbor];
      const newDist = distances[current] + distance;

      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        pq.enqueue(neighbor, newDist);
      }
    }
  }
  return distances;
}

// Example graph as adjacency list
const graph = {
  A: { B: 2, C: 4, D: 1 },
  B: { A: 2, E: 7 },
  C: { A: 4, D: 3 },
  D: { A: 1, C: 3, E: 2 },
  E: { B: 7, D: 2 }
};

console.log(dijkstra(graph, 'A'));
```

**Output:**

```js
{ A: 0, B: 2, C: 4, D: 1, E: 3 }
```

---

## ⚡ Next: Bellman–Ford Algorithm

Used when the graph **can contain negative weights**.

Would you like me to continue next with **Bellman–Ford**, with code and visual explanation in JS?


Perfect 👍 — ab hum **medium-level** algorithms par aa rahe hain — jo coding interviews (Amazon, Microsoft, etc.) me **“intermediate to tough”** category me aate hain.

We’ll go step-by-step through **Graph + DP + Greedy** type algorithms — with **JavaScript implementations**, **intuition**, and **example problems**.

---

# ⚡ Part 1: Bellman–Ford Algorithm

### (Single Source Shortest Path – Works with Negative Weights)

---

### 🧠 Intuition

Dijkstra fails when edge weights are negative.
Bellman–Ford solves this by **relaxing every edge V-1 times**, ensuring all shortest paths settle.

If a shorter path appears after the V-1 iterations → means a **negative weight cycle** exists.

---

### 🧩 Example

**Graph:**

```
A → B (4)
A → C (5)
B → C (-10)
C → D (3)
```

👉 There’s a negative edge (B → C).

---

### ⚙️ Implementation (JS)

```js
function bellmanFord(vertices, edges, source) {
  const dist = {};
  for (let v of vertices) dist[v] = Infinity;
  dist[source] = 0;

  // Relax edges (V-1) times
  for (let i = 0; i < vertices.length - 1; i++) {
    for (let [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
      }
    }
  }

  // Detect negative cycle
  for (let [u, v, w] of edges) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
      console.log("Graph contains negative weight cycle!");
      return null;
    }
  }

  return dist;
}

// Example
const vertices = ["A", "B", "C", "D"];
const edges = [
  ["A", "B", 4],
  ["A", "C", 5],
  ["B", "C", -10],
  ["C", "D", 3],
];

console.log(bellmanFord(vertices, edges, "A"));
```

**Output:**

```js
{ A: 0, B: 4, C: -6, D: -3 }
```

---

### 💡 When to Use:

* Negative edges exist
* Need to detect **negative cycles**
* Shortest path from a **single source**

### 🧮 Complexity:

* Time: `O(V * E)`
* Space: `O(V)`

---

# ⚡ Part 2: Floyd–Warshall Algorithm

### (All-Pairs Shortest Path)

---

### 🧠 Intuition

It finds shortest paths between **every pair** of vertices.
Dynamic Programming based — gradually checks if a path via `k` is shorter than direct one.

---

### ⚙️ Implementation (JS)

```js
function floydWarshall(graph) {
  const dist = JSON.parse(JSON.stringify(graph));
  const V = graph.length;

  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }
  return dist;
}

// Infinity means no direct path
const INF = 99999;
const graph = [
  [0, 3, INF, 7],
  [8, 0, 2, INF],
  [5, INF, 0, 1],
  [2, INF, INF, 0],
];

console.log(floydWarshall(graph));
```

**Output:**
Matrix of shortest distances between all pairs.

---

### 💡 Use Cases:

* Routing tables
* All-pairs analysis
* Graph distance queries

### 🧮 Complexity:

* Time: `O(V³)`
* Space: `O(V²)`

---

# ⚡ Part 3: Topological Sort (DAG Only)

---

### 🧠 Intuition

Used to order tasks when some tasks depend on others — like **task scheduling**, **compilers**, **build dependencies**.

Works only in **Directed Acyclic Graphs (DAGs)**.

---

### ⚙️ Implementation (JS)

```js
function topologicalSort(V, adj) {
  const visited = new Set();
  const stack = [];

  function dfs(node) {
    visited.add(node);
    for (let neighbor of adj[node]) {
      if (!visited.has(neighbor)) dfs(neighbor);
    }
    stack.push(node);
  }

  for (let i = 0; i < V; i++) {
    if (!visited.has(i)) dfs(i);
  }

  return stack.reverse();
}

// Example
const V = 6;
const adj = {
  5: [2, 0],
  4: [0, 1],
  2: [3],
  3: [1],
  0: [],
  1: [],
};

console.log(topologicalSort(V, adj));
```

**Output:**

```js
[5, 4, 2, 3, 1, 0] // valid order
```

---

### 💡 Uses:

* Course schedule ordering
* Task scheduling
* Dependency resolution

### 🧮 Complexity:

* Time: `O(V + E)`
* Space: `O(V)`

---

# ⚡ Part 4: Prim’s Algorithm (Minimum Spanning Tree)

---

### 🧠 Intuition

Finds MST — connects all vertices with minimum total weight, no cycles.
Start with a node → expand by picking smallest edge connecting new vertex.

---

### ⚙️ Implementation (JS)

```js
function primMST(graph) {
  const V = graph.length;
  const key = Array(V).fill(Infinity);
  const parent = Array(V).fill(-1);
  const mstSet = Array(V).fill(false);

  key[0] = 0; // Start from vertex 0

  for (let count = 0; count < V - 1; count++) {
    let min = Infinity, u = -1;
    for (let v = 0; v < V; v++) {
      if (!mstSet[v] && key[v] < min) {
        min = key[v];
        u = v;
      }
    }

    mstSet[u] = true;

    for (let v = 0; v < V; v++) {
      if (graph[u][v] && !mstSet[v] && graph[u][v] < key[v]) {
        parent[v] = u;
        key[v] = graph[u][v];
      }
    }
  }

  console.log("Edge \tWeight");
  for (let i = 1; i < V; i++) {
    console.log(`${parent[i]} - ${i} \t${graph[i][parent[i]]}`);
  }
}

const graph = [
  [0, 2, 0, 6, 0],
  [2, 0, 3, 8, 5],
  [0, 3, 0, 0, 7],
  [6, 8, 0, 0, 9],
  [0, 5, 7, 9, 0],
];

primMST(graph);
```

---

### 💡 Uses:

* Network design
* Electrical circuits
* Road & cable layout optimization

### 🧮 Complexity:

* Time: `O(V²)` (can be optimized to `O(E log V)` with PQ)

---

Would you like me to continue with the next medium-level ones:
➡️ **Kruskal’s MST**, **Ford-Fulkerson (Max Flow)**, and **Cycle Detection (DFS + Union-Find)** next — all with medium-difficulty examples and JS code?




Perfect ✅ — ab hum **lower-level (beginner → medium transition)** algorithms cover karte hain, jo **foundation** strong karte hain aur interview ke first few rounds me frequently aate hain.

We’ll go in **increasing difficulty** order, all in **JavaScript**, with **examples, explanation, and complexity**.

---

## 🧱 1. Linear Search

---

### 🧠 Intuition

Go one by one through the array until you find the target.

---

### ⚙️ Code

```js
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

console.log(linearSearch([10, 20, 30, 40], 30)); // Output: 2
```

### 🧮 Complexity

* Time: `O(n)`
* Space: `O(1)`

### 🎯 When to use

* Small arrays
* Unsorted data

---

## 🔍 2. Binary Search

---

### 🧠 Intuition

Divide and conquer — repeatedly halve the array until the target is found.
**Works only on sorted arrays.**

---

### ⚙️ Code

```js
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

console.log(binarySearch([10, 20, 30, 40, 50], 40)); // Output: 3
```

### 🧮 Complexity

* Time: `O(log n)`
* Space: `O(1)`

### 🎯 Problems it solves

* Find element in sorted list
* Used in search problems like “find peak”, “minimum in rotated array” etc.

---

## 🔄 3. Bubble Sort

---

### 🧠 Intuition

Repeatedly swap adjacent elements if they’re in wrong order — biggest bubbles to the end.

---

### ⚙️ Code

```js
function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

console.log(bubbleSort([5, 2, 9, 1, 5, 6]));
```

### 🧮 Complexity

* Time: `O(n²)`
* Space: `O(1)`

### 🎯 When to use

* Educational/demo purposes (inefficient in real world)

---

## 🪣 4. Selection Sort

---

### 🧠 Intuition

Find the **minimum element** and put it in the correct place.

---

### ⚙️ Code

```js
function selectionSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}

console.log(selectionSort([64, 25, 12, 22, 11]));
```

### 🧮 Complexity

* Time: `O(n²)`
* Space: `O(1)`

### 🎯 Used for

* When swaps are expensive but comparisons are cheap.

---

## 🧩 5. Insertion Sort

---

### 🧠 Intuition

Build the sorted list one item at a time — insert each new element in its correct position.

---

### ⚙️ Code

```js
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;

    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}

console.log(insertionSort([12, 11, 13, 5, 6]));
```

### 🧮 Complexity

* Time: `O(n²)`
* Space: `O(1)`
* Best case (sorted array): `O(n)`

### 🎯 Used for

* Nearly sorted data
* Small arrays

---

## ⚙️ 6. Counting Sort (Non-Comparison Based)

---

### 🧠 Intuition

Count occurrences of each number and rebuild the sorted array.
Works only for **non-negative integers**.

---

### ⚙️ Code

```js
function countingSort(arr) {
  const max = Math.max(...arr);
  const count = Array(max + 1).fill(0);

  for (let num of arr) count[num]++;
  
  const sorted = [];
  for (let i = 0; i <= max; i++) {
    while (count[i] > 0) {
      sorted.push(i);
      count[i]--;
    }
  }
  return sorted;
}

console.log(countingSort([4, 2, 2, 8, 3, 3, 1]));
```

### 🧮 Complexity

* Time: `O(n + k)`
* Space: `O(k)`
  (`k` = range of numbers)

---

## 🌊 7. BFS (Breadth-First Search)

---

### 🧠 Intuition

Level-by-level traversal of graph/tree using a queue.

---

### ⚙️ Code

```js
function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  visited.add(start);

  while (queue.length) {
    const node = queue.shift();
    console.log(node);

    for (let neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
}

const graph = {
  A: ['B', 'C'],
  B: ['D', 'E'],
  C: ['F'],
  D: [],
  E: ['F'],
  F: []
};

bfs(graph, 'A');
```

### 🧮 Complexity

* Time: `O(V + E)`
* Space: `O(V)`

### 🎯 Used for

* Shortest path in unweighted graph
* Level-order traversal
* Checking connectivity

---

## 🌲 8. DFS (Depth-First Search)

---

### 🧠 Intuition

Go as deep as possible before backtracking.

---

### ⚙️ Code

```js
function dfs(graph, node, visited = new Set()) {
  if (visited.has(node)) return;
  visited.add(node);
  console.log(node);

  for (let neighbor of graph[node]) {
    dfs(graph, neighbor, visited);
  }
}

const graph2 = {
  A: ['B', 'C'],
  B: ['D', 'E'],
  C: ['F'],
  D: [],
  E: ['F'],
  F: []
};

dfs(graph2, 'A');
```

### 🧮 Complexity

* Time: `O(V + E)`
* Space: `O(V)`

### 🎯 Used for

* Detecting cycles
* Topological sort
* Pathfinding in mazes

---

If you’re learning in **steps**, here’s the flow I recommend 👇
**Step 1:** Linear + Binary Search
**Step 2:** Bubble / Selection / Insertion Sort
**Step 3:** BFS + DFS (Traversal Foundation)
**Step 4:** Counting / Merge / Quick sort
**Step 5:** Dijkstra / Bellman-Ford / Prim’s

---

Would you like me to continue next with **Merge Sort + Quick Sort + Binary Search Tree (BST traversals)** — still at this lower–medium level?


Perfect 👌 — ab hum **lower–middle to average–mid level** algorithms cover karte hain.
Ye wo level hai jahan interviewer check karta hai:
👉 “Logic samjhta hai ya sirf syntax?”
👉 “Can you optimize brute-force?”
👉 “Knows recursion, divide & conquer, tree/graph basics?”

We’ll go step by step — **with JavaScript**, **clear intuition**, **real-world usage**, and **complexity**.

---

## ⚡ LEVEL: LOWER–MIDDLE → MID

We’ll cover:

1. **Merge Sort** (Divide & Conquer)
2. **Quick Sort**
3. **Binary Search Tree + Traversals (Pre/In/Post)**
4. **Cycle Detection (Graph)**
5. **Two Pointer & Sliding Window**
6. **Prefix Sum**
7. **Kadane’s Algorithm (Max Subarray Sum)**

---

## 🧩 1. Merge Sort — Divide & Conquer

---

### 🧠 Intuition

Split → Sort each half → Merge them back in order.
Used where **stability** matters (e.g., sorting by names, then by age).

---

### ⚙️ Code (JS)

```js
function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }

  return [...result, ...left.slice(i), ...right.slice(j)];
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
```

**Output:**
`[3, 9, 10, 27, 38, 43, 82]`

### 🧮 Complexity

* Time: `O(n log n)`
* Space: `O(n)`

### 🎯 Used for

* Large data sorting
* External sorting (when data doesn’t fit in memory)

---

## ⚡ 2. Quick Sort — Divide & Conquer (In-place)

---

### 🧠 Intuition

Pick a **pivot**, put smaller elements left, greater right, and recursively sort.

---

### ⚙️ Code

```js
function quickSort(arr) {
  if (arr.length <= 1) return arr;

  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}

console.log(quickSort([10, 7, 8, 9, 1, 5]));
```

**Output:**
`[1, 5, 7, 8, 9, 10]`

### 🧮 Complexity

* Best: `O(n log n)`
* Worst: `O(n²)`
* Space: `O(log n)` (due to recursion)

### 🎯 Used for

* Fastest average-case sort
* Database sorting, compiler optimizations

---

## 🌲 3. Binary Search Tree + Traversals

---

### 🧠 Intuition

Each node: left < root < right
You can **search, insert, delete** efficiently.

---

### ⚙️ Code

```js
class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
    this.root = null;
  }

  insert(value) {
    const newNode = new Node(value);
    if (!this.root) {
      this.root = newNode;
      return;
    }
    let current = this.root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          current.left = newNode;
          return;
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = newNode;
          return;
        }
        current = current.right;
      }
    }
  }

  inorder(node = this.root) {
    if (!node) return;
    this.inorder(node.left);
    console.log(node.value);
    this.inorder(node.right);
  }
}

const bst = new BST();
[5, 3, 7, 2, 4, 6, 8].forEach(n => bst.insert(n));
bst.inorder(); // 2 3 4 5 6 7 8
```

### 🧮 Complexity

* Insert/Search/Delete: `O(log n)` average
* Worst (unbalanced): `O(n)`

---

## 🔁 4. Cycle Detection in Graph (DFS)

---

### 🧠 Intuition

Use recursion + visited set to detect back edges.

---

### ⚙️ Code (Directed Graph)

```js
function hasCycle(graph) {
  const visited = new Set();
  const recStack = new Set();

  function dfs(node) {
    if (!visited.has(node)) {
      visited.add(node);
      recStack.add(node);

      for (let neighbor of graph[node]) {
        if (!visited.has(neighbor) && dfs(neighbor)) return true;
        else if (recStack.has(neighbor)) return true;
      }
    }
    recStack.delete(node);
    return false;
  }

  for (let node in graph) {
    if (dfs(node)) return true;
  }

  return false;
}

const graph = {
  A: ['B'],
  B: ['C'],
  C: ['A'], // cycle here
};

console.log(hasCycle(graph)); // true
```

---

## 🧮 Complexity

* Time: `O(V + E)`
* Space: `O(V)`

---

## 👯‍♂️ 5. Two Pointer Technique

---

### 🧠 Intuition

Move two pointers (start/end) toward each other to reduce search space.

---

### ⚙️ Example — Pair Sum Problem

```js
function hasPairWithSum(arr, target) {
  arr.sort((a, b) => a - b);
  let left = 0, right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return true;
    else if (sum < target) left++;
    else right--;
  }
  return false;
}

console.log(hasPairWithSum([1, 4, 45, 6, 10, -8], 16)); // true
```

---

## ⏳ 6. Sliding Window Technique

---

### 🧠 Intuition

Maintain a window (subarray) that slides across the array to find patterns efficiently.

---

### ⚙️ Example — Max Sum of Subarray of Size `k`

```js
function maxSubarraySum(arr, k) {
  let maxSum = 0, windowSum = 0;

  for (let i = 0; i < k; i++) windowSum += arr[i];
  maxSum = windowSum;

  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

console.log(maxSubarraySum([2, 1, 5, 1, 3, 2], 3)); // 9
```

### 🧮 Complexity

* Time: `O(n)`
* Space: `O(1)`

---

## 💥 7. Kadane’s Algorithm — Maximum Subarray Sum

---

### 🧠 Intuition

Dynamic approach — keep track of max sum ending at each index.

---

### ⚙️ Code

```js
function kadane(arr) {
  let maxSoFar = arr[0];
  let currentMax = arr[0];

  for (let i = 1; i < arr.length; i++) {
    currentMax = Math.max(arr[i], currentMax + arr[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }

  return maxSoFar;
}

console.log(kadane([-2,1,-3,4,-1,2,1,-5,4])); // 6  (subarray [4,-1,2,1])
```

### 🧮 Complexity

* Time: `O(n)`
* Space: `O(1)`

### 🎯 Used for

* Stock profit problems
* Max subarray problems
* Dynamic programming base

---

✅ **Summary Table (Lower–Middle to Mid Level)**

| Algorithm       | Category         | Time           | Common Use                    |
| --------------- | ---------------- | -------------- | ----------------------------- |
| Merge Sort      | Divide & Conquer | O(n log n)     | Sorting large data            |
| Quick Sort      | Divide & Conquer | O(n log n) avg | Fast in-place sorting         |
| BST Traversal   | Tree             | O(n)           | Search / ordered data         |
| Cycle Detection | Graph            | O(V+E)         | Detect infinite loops         |
| Two Pointers    | Array            | O(n)           | Pair / Triplet problems       |
| Sliding Window  | Array            | O(n)           | Subarray / substring problems |
| Kadane’s        | DP               | O(n)           | Max subarray, stock problems  |

---

Would you like me to continue next with **mid → upper-mid** ones (like Merge Intervals, BFS shortest path, DP on grids, Backtracking basics, etc.) — all still in JavaScript, with reasoning?



Perfect 😎
Let’s now go step-by-step into **“lower-middle” level graph algorithms** — these are slightly deeper than basic searching/sorting, but not as math-heavy as dynamic programming or Johnson’s.

We’ll cover 4 must-know algorithms in JavaScript:

1. **Breadth-First Search (BFS)**
2. **Depth-First Search (DFS)**
3. **Cycle Detection (Directed & Undirected Graphs)**
4. **Topological Sort**

These are building blocks for all shortest-path, dependency-resolution, and graph traversal problems.

---

## 🧩 1. Breadth-First Search (BFS)

**Type:** Level-order traversal (uses Queue)
**Use cases:**

* Shortest path in unweighted graphs
* Web crawlers
* Finding connected components

### Example

```
Graph:
A - B - D
|   |
C   E
```

### Implementation

```js
function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  const result = [];

  while (queue.length > 0) {
    const node = queue.shift();
    if (!visited.has(node)) {
      visited.add(node);
      result.push(node);

      for (const neighbor of graph[node]) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }
  return result;
}

// Example graph
const graph = {
  A: ['B', 'C'],
  B: ['A', 'D', 'E'],
  C: ['A'],
  D: ['B'],
  E: ['B']
};

console.log(bfs(graph, 'A')); // ['A', 'B', 'C', 'D', 'E']
```

🧠 **Complexity:** `O(V + E)`
→ Every vertex and edge is visited once.

---

## 🧠 2. Depth-First Search (DFS)

**Type:** Recursive (or stack-based) traversal
**Use cases:**

* Detecting cycles
* Path finding
* Solving puzzles (mazes, Sudoku)

### Implementation (Recursive)

```js
function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  console.log(start);

  for (const neighbor of graph[start]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited);
    }
  }
}

// Example graph
const graph2 = {
  A: ['B', 'C'],
  B: ['D', 'E'],
  C: [],
  D: [],
  E: []
};

dfs(graph2, 'A');
// Output order (depends on adjacency): A B D E C
```

🧠 **Complexity:** `O(V + E)`

---

## 🔁 3. Cycle Detection

### (A) In **Undirected Graph**

Use DFS, and track the parent node.

```js
function hasCycleUndirected(graph) {
  const visited = new Set();

  function dfs(node, parent) {
    visited.add(node);
    for (let neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, node)) return true;
      } else if (neighbor !== parent) {
        return true;
      }
    }
    return false;
  }

  for (let node in graph) {
    if (!visited.has(node)) {
      if (dfs(node, -1)) return true;
    }
  }
  return false;
}

const graph3 = {
  A: ['B'],
  B: ['A', 'C'],
  C: ['B', 'D'],
  D: ['C', 'B'] // Cycle B-C-D-B
};

console.log(hasCycleUndirected(graph3)); // true
```

---

### (B) In **Directed Graph**

Use DFS with a recursion stack.

```js
function hasCycleDirected(graph) {
  const visited = new Set();
  const recStack = new Set();

  function dfs(node) {
    if (recStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recStack.add(node);

    for (let neighbor of graph[node]) {
      if (dfs(neighbor)) return true;
    }

    recStack.delete(node);
    return false;
  }

  for (let node in graph) {
    if (dfs(node)) return true;
  }
  return false;
}

const graph4 = {
  A: ['B'],
  B: ['C'],
  C: ['A'] // Cycle: A → B → C → A
};

console.log(hasCycleDirected(graph4)); // true
```

---

## 🔄 4. Topological Sort (for Directed Acyclic Graphs)

**Use cases:**

* Task scheduling
* Course prerequisite order
* Build system dependencies

### Implementation

```js
function topologicalSort(graph) {
  const visited = new Set();
  const stack = [];

  function dfs(node) {
    visited.add(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) dfs(neighbor);
    }
    stack.push(node);
  }

  for (let node in graph) {
    if (!visited.has(node)) dfs(node);
  }

  return stack.reverse();
}

const graph5 = {
  A: ['C'],
  B: ['C', 'D'],
  C: ['E'],
  D: ['F'],
  E: ['H', 'F'],
  F: ['G'],
  G: [],
  H: []
};

console.log(topologicalSort(graph5));
// Output: ['B', 'D', 'A', 'C', 'E', 'H', 'F', 'G']
```

🧠 **Complexity:** `O(V + E)`

---

## 🎯 Summary Table

| Algorithm        | Type      | Use Case                     | Time   |
| ---------------- | --------- | ---------------------------- | ------ |
| BFS              | Traversal | Shortest path (unweighted)   | O(V+E) |
| DFS              | Traversal | Path, cycle, connected comps | O(V+E) |
| Cycle Detection  | DFS-based | Check loops                  | O(V+E) |
| Topological Sort | DAG only  | Task ordering                | O(V+E) |

---

Next, we can move to **Medium-Level Weighted Graph Algorithms** —
like **Dijkstra, Bellman-Ford, Floyd-Warshall**, and **Prim/Kruskal (MST)**.

Would you like me to start with **Dijkstra (medium version)** next?


Perfect 🔥
Now we’re entering **medium-level weighted graph algorithms** — used heavily in **network routing**, **map systems**, and **cost optimization** problems.

Let’s start with **Dijkstra’s Algorithm (Medium Level)** — with clear explanation, dry run, and clean JS code.

---

## 🚀 DIJKSTRA’S ALGORITHM (Single Source Shortest Path)

**Goal:**
Find the shortest path from one node (source) to all other nodes in a graph with **non-negative weights**.

---

### ⚙️ Example Graph

```
      (4)
  A ------- B
  |  \      |
(2)|   \(5) |(10)
  |     \   |
  C------D--E
   (8)   (2) (3)
```

We’ll find **shortest paths from A**.

---

### 🧠 Step-by-Step Intuition

1. Start at source `A`, distance = 0.
2. Set all other nodes’ distances = `Infinity`.
3. Pick the node with **minimum distance** (like a greedy step).
4. Update its neighbors’ distances if a **shorter path** is found.
5. Mark it “visited”.
6. Repeat until all nodes are visited.

---

### ⚡ JavaScript Implementation (Using Priority Queue)

```js
class PriorityQueue {
  constructor() {
    this.queue = [];
  }
  enqueue(node, priority) {
    this.queue.push({ node, priority });
    this.queue.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    return this.queue.shift();
  }
  isEmpty() {
    return this.queue.length === 0;
  }
}

function dijkstra(graph, start) {
  const distances = {};
  const visited = new Set();
  const pq = new PriorityQueue();

  for (let node in graph) {
    distances[node] = Infinity;
  }

  distances[start] = 0;
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const { node: current } = pq.dequeue();
    if (visited.has(current)) continue;
    visited.add(current);

    for (let neighbor in graph[current]) {
      const newDist = distances[current] + graph[current][neighbor];
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        pq.enqueue(neighbor, newDist);
      }
    }
  }

  return distances;
}

// Example graph (adjacency list)
const graph = {
  A: { B: 4, C: 2 },
  B: { A: 4, D: 5, E: 10 },
  C: { A: 2, D: 8 },
  D: { B: 5, C: 8, E: 2 },
  E: { B: 10, D: 2 }
};

console.log(dijkstra(graph, 'A'));
```

---

### 🧩 Output

```js
{
  A: 0,
  B: 4,
  C: 2,
  D: 9,
  E: 11
}
```

---

### 🔍 Dry Run (short summary)

| Step | Node Picked | Updated Distances |
| ---- | ----------- | ----------------- |
| 1    | A           | A=0, B=4, C=2     |
| 2    | C           | D=10 (via C)      |
| 3    | B           | D=9 (via B)       |
| 4    | D           | E=11              |
| 5    | E           | done ✅            |

Shortest path from A → D is **9** via **A → B → D**.

---

### 📘 Complexity

* **Time:** `O((V + E) log V)` with min-heap
* **Space:** `O(V)`

---

### 💡 Problems Solved Using Dijkstra

* Shortest route in maps (Google Maps)
* Minimum cost in network routing
* Finding optimal travel path or delivery route

---

### 🧩 Practice Problems

1. Shortest path in weighted graph (unidirectional)
2. Minimum time to reach all nodes
3. Network delay time (LeetCode #743)
4. Path with minimum effort (LeetCode #1631)

---

Next we’ll do **Bellman–Ford Algorithm** —
it works even with **negative edge weights** (but not negative cycles).
Would you like me to continue with that next?


Awesome 😎 — you’re now entering the **core graph algorithm zone**.
Let’s go through all three major ones step-by-step in **medium-level + clean JavaScript** style:

---

## 🧭 1. Bellman–Ford Algorithm

(Single Source Shortest Path, Handles Negative Weights)

---

### 🔹 Intuition

Dijkstra fails if you have **negative edge weights**.
Bellman–Ford works by **relaxing** all edges repeatedly.

Think of “relaxing” as:

> If I can reach `v` cheaper by going through `u`, then update `dist[v]`.

You do this **V − 1** times (where V = number of vertices).

---

### ⚙️ Implementation

```js
function bellmanFord(graph, V, start) {
  const distance = Array(V).fill(Infinity);
  distance[start] = 0;

  // Relax all edges (V - 1) times
  for (let i = 0; i < V - 1; i++) {
    for (let [u, v, w] of graph) {
      if (distance[u] !== Infinity && distance[u] + w < distance[v]) {
        distance[v] = distance[u] + w;
      }
    }
  }

  // Detect negative weight cycles
  for (let [u, v, w] of graph) {
    if (distance[u] + w < distance[v]) {
      console.log("Graph contains a negative weight cycle");
      return;
    }
  }

  return distance;
}

// Edges: [source, destination, weight]
const edges = [
  [0, 1, 4],
  [0, 2, 5],
  [1, 2, -3],
  [2, 3, 4]
];

console.log(bellmanFord(edges, 4, 0));
```

### 🧩 Output

```js
[0, 4, 1, 5]
```

---

### 🧠 Complexity

* Time: `O(V * E)`
* Space: `O(V)`

### ✅ When to Use

* Graphs with **negative weights** (but no negative cycles)
* Currency arbitrage, cost optimization, etc.

---

## 🌐 2. Floyd–Warshall Algorithm

(All Pairs Shortest Path)

---

### 🔹 Intuition

Bellman–Ford/Dijkstra → one source → others
Floyd–Warshall → finds **shortest paths between every pair of nodes**.

It uses a **Dynamic Programming (DP)** approach.

> dp[i][j] = shortest distance from i to j

We keep checking:

> If going via some “k” is cheaper than direct route, update it.

---

### ⚙️ Implementation

```js
function floydWarshall(graph) {
  const V = graph.length;
  const dist = JSON.parse(JSON.stringify(graph)); // Deep copy

  for (let k = 0; k < V; k++) {
    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }

  return dist;
}

const INF = 99999;
const graph = [
  [0, 5, INF, 10],
  [INF, 0, 3, INF],
  [INF, INF, 0, 1],
  [INF, INF, INF, 0]
];

console.table(floydWarshall(graph));
```

### 🧩 Output (Distance Matrix)

```
┌─────────┬───┬───┬───┬───┐
│ (index) │ 0 │ 1 │ 2 │ 3 │
├─────────┼───┼───┼───┼───┤
│    0    │ 0 │ 5 │ 8 │ 9 │
│    1    │ ∞ │ 0 │ 3 │ 4 │
│    2    │ ∞ │ ∞ │ 0 │ 1 │
│    3    │ ∞ │ ∞ │ ∞ │ 0 │
└─────────┴───┴───┴───┴───┘
```

---

### 🧠 Complexity

* Time: `O(V³)`
* Space: `O(V²)`

### ✅ When to Use

* Small dense graphs
* To precompute all shortest paths (like routing tables)

---

## 🕸️ 3. Minimum Spanning Tree (MST)

Used to **connect all nodes** with **minimum total edge weight**, **no cycles**.

---

### 🪜 (A) Prim’s Algorithm

**Approach:**
Start from one node → repeatedly add the smallest edge that connects a new node to the tree.

---

#### Implementation

```js
function primMST(graph) {
  const V = graph.length;
  const parent = Array(V).fill(-1);
  const key = Array(V).fill(Infinity);
  const inMST = Array(V).fill(false);
  key[0] = 0;

  for (let count = 0; count < V - 1; count++) {
    let u = -1;
    let min = Infinity;

    for (let v = 0; v < V; v++) {
      if (!inMST[v] && key[v] < min) {
        min = key[v];
        u = v;
      }
    }

    inMST[u] = true;

    for (let v = 0; v < V; v++) {
      if (graph[u][v] && !inMST[v] && graph[u][v] < key[v]) {
        parent[v] = u;
        key[v] = graph[u][v];
      }
    }
  }

  console.log("Edge   Weight");
  for (let i = 1; i < V; i++) {
    console.log(`${parent[i]} - ${i}    ${graph[i][parent[i]]}`);
  }
}

const g = [
  [0, 2, 0, 6, 0],
  [2, 0, 3, 8, 5],
  [0, 3, 0, 0, 7],
  [6, 8, 0, 0, 9],
  [0, 5, 7, 9, 0],
];

primMST(g);
```

**Output:**

```
Edge   Weight
0 - 1    2
1 - 2    3
0 - 3    6
1 - 4    5
```

🧠 **Complexity:** `O(V²)` (with simple arrays)
→ Can be improved to `O(E log V)` using Min-Heap.

---

### 🔗 (B) Kruskal’s Algorithm

**Approach:**
Sort all edges by weight → keep adding the smallest one
→ but **skip** if it creates a cycle (use Disjoint Set Union - DSU).

---

#### Implementation

```js
class DisjointSet {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(x) {
    if (this.parent[x] === x) return x;
    return (this.parent[x] = this.find(this.parent[x]));
  }
  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX !== rootY) this.parent[rootY] = rootX;
  }
}

function kruskalMST(edges, V) {
  edges.sort((a, b) => a[2] - b[2]);
  const ds = new DisjointSet(V);
  const result = [];

  for (let [u, v, w] of edges) {
    if (ds.find(u) !== ds.find(v)) {
      result.push([u, v, w]);
      ds.union(u, v);
    }
  }

  console.log("Edge   Weight");
  for (let [u, v, w] of result) {
    console.log(`${u} - ${v}    ${w}`);
  }
}

const edges2 = [
  [0, 1, 10],
  [0, 2, 6],
  [0, 3, 5],
  [1, 3, 15],
  [2, 3, 4],
];

kruskalMST(edges2, 4);
```

**Output:**

```
Edge   Weight
2 - 3    4
0 - 3    5
0 - 1    10
```

🧠 **Complexity:** `O(E log E)`

---

## 🧭 Summary Table

| Algorithm          | Purpose                       | Handles Negatives | Type         | Time           |
| ------------------ | ----------------------------- | ----------------- | ------------ | -------------- |
| **Dijkstra**       | Shortest Path (Single Source) | ❌                 | Greedy       | O((V+E) log V) |
| **Bellman–Ford**   | Shortest Path (Single Source) | ✅                 | DP           | O(VE)          |
| **Floyd–Warshall** | Shortest Path (All Pairs)     | ✅                 | DP           | O(V³)          |
| **Prim’s**         | MST                           | N/A               | Greedy       | O(V²)          |
| **Kruskal’s**      | MST                           | N/A               | Greedy + DSU | O(E log E)     |

---

Would you like me to continue next with **“Flow Algorithms”** (like **Ford-Fulkerson** and **Edmonds-Karp**) — they’re medium-hard level and very cool for network flow problems (like max bandwidth, bipartite matching)?



Excellent 😎 — let’s now master the **Flow Algorithms** — the last major category of classic graph algorithms, used in **network routing, job assignment, bipartite matching, resource allocation**, etc.

We’ll cover **both** key ones together:

1. **Ford–Fulkerson Algorithm** (concept + DFS-based implementation)
2. **Edmonds–Karp Algorithm** (BFS-based implementation — optimized Ford–Fulkerson)

Both aim to find the **maximum possible flow** from a **source node** to a **sink node** in a **flow network**.

---

# 🌊 1. Ford–Fulkerson Algorithm

---

### 🧠 Intuition

Imagine a **network of pipes** — each edge has a *capacity* (how much water can flow).
You want to push as much flow as possible from the **source (s)** to the **sink (t)**.

Algorithm idea:

1. Start with zero flow on all edges.
2. While there exists a **path from s → t** with available capacity:

   * Find the **minimum capacity** (bottleneck) on that path.
   * Add that to the total flow.
   * Reduce that capacity along the path (and increase reverse flow for backtracking).
3. Repeat until no more augmenting paths exist.

---

### ⚙️ Implementation (DFS-based Ford–Fulkerson in JS)

```js
function fordFulkerson(graph, source, sink) {
  const V = graph.length;
  const residual = graph.map(row => [...row]); // Clone capacity graph
  let maxFlow = 0;

  function dfs(u, visited, path) {
    if (u === sink) return path;
    visited[u] = true;
    for (let v = 0; v < V; v++) {
      if (!visited[v] && residual[u][v] > 0) {
        const result = dfs(v, visited, [...path, v]);
        if (result) return result;
      }
    }
    return null;
  }

  while (true) {
    const visited = Array(V).fill(false);
    const path = dfs(source, visited, [source]);
    if (!path) break; // No more augmenting path

    // Find bottleneck
    let pathFlow = Infinity;
    for (let i = 0; i < path.length - 1; i++) {
      pathFlow = Math.min(pathFlow, residual[path[i]][path[i + 1]]);
    }

    // Update residual capacities
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i], v = path[i + 1];
      residual[u][v] -= pathFlow;
      residual[v][u] += pathFlow;
    }

    maxFlow += pathFlow;
  }

  return maxFlow;
}

const capacityGraph = [
  [0, 16, 13, 0, 0, 0],
  [0, 0, 10, 12, 0, 0],
  [0, 4, 0, 0, 14, 0],
  [0, 0, 9, 0, 0, 20],
  [0, 0, 0, 7, 0, 4],
  [0, 0, 0, 0, 0, 0]
];

console.log("Maximum Flow:", fordFulkerson(capacityGraph, 0, 5));
```

---

### 🧩 Output

```
Maximum Flow: 23
```

---

### ⚡ Complexity

* Worst case: `O(E * maxFlow)`
* Works fine for small/medium graphs but may loop infinitely with irrational capacities.

---

# ⚙️ 2. Edmonds–Karp Algorithm (Optimized Ford–Fulkerson)

---

### 💡 Intuition

It’s just **Ford–Fulkerson using BFS** instead of DFS to find shortest augmenting paths.

This guarantees **polynomial time** instead of exponential — much faster and more stable.

---

### 🧩 Implementation (JavaScript)

```js
function bfs(residual, source, sink, parent) {
  const visited = Array(residual.length).fill(false);
  const queue = [source];
  visited[source] = true;
  parent[source] = -1;

  while (queue.length) {
    const u = queue.shift();

    for (let v = 0; v < residual.length; v++) {
      if (!visited[v] && residual[u][v] > 0) {
        queue.push(v);
        parent[v] = u;
        visited[v] = true;
      }
    }
  }

  return visited[sink];
}

function edmondsKarp(graph, source, sink) {
  const V = graph.length;
  const residual = graph.map(row => [...row]);
  const parent = Array(V);
  let maxFlow = 0;

  while (bfs(residual, source, sink, parent)) {
    let pathFlow = Infinity;
    for (let v = sink; v !== source; v = parent[v]) {
      const u = parent[v];
      pathFlow = Math.min(pathFlow, residual[u][v]);
    }

    for (let v = sink; v !== source; v = parent[v]) {
      const u = parent[v];
      residual[u][v] -= pathFlow;
      residual[v][u] += pathFlow;
    }

    maxFlow += pathFlow;
  }

  return maxFlow;
}

const graph2 = [
  [0, 16, 13, 0, 0, 0],
  [0, 0, 10, 12, 0, 0],
  [0, 4, 0, 0, 14, 0],
  [0, 0, 9, 0, 0, 20],
  [0, 0, 0, 7, 0, 4],
  [0, 0, 0, 0, 0, 0]
];

console.log("Max Flow (Edmonds-Karp):", edmondsKarp(graph2, 0, 5));
```

---

### 🧩 Output

```
Max Flow (Edmonds-Karp): 23
```

Same as Ford–Fulkerson — but faster and guaranteed termination.

---

### 🧠 Complexity

* **Time:** `O(V * E²)`
* **Space:** `O(V²)`

---

# 🧮 Example Dry Run

```
Source = 0, Sink = 5
Path 1: 0 → 1 → 3 → 5  (Flow 12)
Path 2: 0 → 2 → 4 → 5  (Flow 11)
Total Max Flow = 23
```

---

# 🧰 Use Cases of Flow Algorithms

| Application                      | Example                              |
| -------------------------------- | ------------------------------------ |
| **Network Routing**              | Max data/bandwidth through a network |
| **Bipartite Matching**           | Job assignment problems              |
| **Image Segmentation**           | Min-cut/max-flow based partitioning  |
| **Sports Tournament Scheduling** | Valid path allocation                |
| **Project resource allocation**  | Maximize throughput with constraints |

---

# ⚡ Summary Comparison

| Algorithm                | Finds    | Path Method      | Handles Negatives | Time           | Notes                   |
| ------------------------ | -------- | ---------------- | ----------------- | -------------- | ----------------------- |
| **Ford–Fulkerson**       | Max Flow | DFS              | No                | O(E × maxFlow) | Conceptually simple     |
| **Edmonds–Karp**         | Max Flow | BFS              | No                | O(V × E²)      | Faster & guaranteed     |
| **Dinic’s** *(advanced)* | Max Flow | BFS + DFS levels | No                | O(E√V)         | Even faster, used in CP |

---

✅ **Quick Recap:**

* Ford–Fulkerson → DFS-based, intuitive.
* Edmonds–Karp → BFS-based, efficient & safe.
* Both compute **Maximum Flow** = total capacity from `source` to `sink`.

---

Would you like me to continue next with **Dinic’s Algorithm + Minimum Cut**, which is the **advanced flow algorithm (competitive programming level)** — or do you want to shift to **Dynamic Programming** next (medium-level like Knapsack, LIS, Matrix DP)?






























////////////////////////////////////////////////////////////Extra

## 🧠 **What is Method Overloading in C++?**  ---- IMP

**Definition:**
👉 **Method Overloading** (also called **Function Overloading**) in C++ means **defining multiple functions with the same name but different parameter lists** (different number or types of arguments).

The **compiler decides which version to call at compile time** — this is known as **compile-time polymorphism**.

---

## 📘 **Example 1: Basic Method Overloading**

```cpp
#include <iostream>  ---- IMP
using namespace std;

class Print {
public:
    void show(int x) {
        cout << "Integer: " << x << endl;
    }

    void show(double y) {
        cout << "Double: " << y << endl;
    }

    void show(string z) {
        cout << "String: " << z << endl;
    }
};

int main() {
    Print obj;

    obj.show(10);         // calls show(int)
    obj.show(12.5);       // calls show(double)
    obj.show("Nikita");   // calls show(string)

    return 0;
}
```

### 🧩 Output:

```
Integer: 10
Double: 12.5
String: Nikita
```

✅ Here, **all three functions have the same name `show`**, but they take different parameter types — that’s **method overloading**.

---

## ⚙️ **How It Works (Under the Hood)**  ---- IMP

During **compilation**, the C++ compiler **creates a unique function signature** for each overloaded method based on:

* Function name
* Number of parameters
* Parameter types

Example:
For the above code, compiler internally might treat them as:

```
show_int(int)
show_double(double)
show_string(std::string)
```

This process is called **Name Mangling**.

---

## 📘 **Example 2: Different Number of Arguments**

```cpp
class Math {
public:
    int add(int a, int b) {
        return a + b;
    }

    int add(int a, int b, int c) {
        return a + b + c;
    }
};

int main() {
    Math m;
    cout << m.add(5, 10) << endl;       // calls add(int, int)
    cout << m.add(5, 10, 15) << endl;   // calls add(int, int, int)
}
```

### Output:

```
15
30
```

---

## 🚫 **What cannot be overloaded**

You **cannot overload** functions just by:

* Changing the **return type only** (parameters must differ)

❌ Invalid example:

```cpp
int test() {}
double test() {}  // ❌ Error: redefinition of ‘test’
```

Compiler can’t distinguish them because parameters are identical.

---

## 🧱 **Overloading vs Overriding**  ---- IMP

| Concept       | Method Overloading        | Method Overriding               |
| ------------- | ------------------------- | ------------------------------- |
| Type          | Compile-time polymorphism | Run-time polymorphism           |
| Function name | Same                      | Same                            |
| Parameters    | Must differ               | Must be same                    |
| Classes       | Same class                | Different classes (inheritance) |
| Keyword       | None                      | `virtual` / `override` used     |

---

## 🧩 **Example 3: Constructor Overloading**

Constructors can also be overloaded — they just have different parameters.

```cpp
class Student {
public:
    string name;
    int age;

    Student() { // default constructor
        name = "Unknown";
        age = 0;
    }

    Student(string n, int a) { // parameterized constructor
        name = n;
        age = a;
    }

    void display() {
        cout << name << " - " << age << endl;
    }
};

int main() {
    Student s1;
    Student s2("Nikita", 23);

    s1.display();
    s2.display();
}
```

### Output:

```
Unknown - 0
Nikita - 23
```

---

## ✅ **Summary Table**

| Feature          | Description                                      |
| ---------------- | ------------------------------------------------ |
| Purpose          | To use same function name for similar operations |
| Decided at       | Compile-time                                     |
| Based on         | Number/type/order of parameters                  |
| Cannot differ by | Return type only                                 |
| Example          | `void show(int)`, `void show(string)`            |

---

Would you like me to explain **operator overloading** next (e.g., `+`, `==`, `<<` custom behavior for classes)? It’s the next logical topic after method overloading in C++.



