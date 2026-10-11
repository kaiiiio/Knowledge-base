# Pattern Playbook — Brute / Better / Optimal, Every Classic Problem

## Scope note (read this first)

This folder was created after a request to cover the same ground as a popular YouTube DSA course playlist (Apna College's "Complete C++ DSA Course"). Two honest constraints shaped what's actually inside:

1. **No transcript access.** There is no tool available to fetch or read YouTube video transcripts, so the exact video-by-video content of that playlist could not be read, and this folder is not a transcription of it.
2. **Reproducing a course's proprietary material verbatim isn't appropriate**, even if it were accessible — the explanations, exact phrasing, and teaching style of a specific course belong to its creator.

What this folder *is*: an **original, independently-written** problem playbook covering the same **standard, industry-wide DSA curriculum** that essentially every serious DSA course (this one included) teaches — because the problems themselves (Two Sum, Kadane's Algorithm, N-Queens, Dijkstra, etc.) are common technical knowledge, not any single course's property. Every solution, explanation, and piece of code here is written fresh for this knowledge base.

**The format every problem follows**: **Brute Force → Better → Optimal**, each with working code, a dry run, and a clear explanation of *why* the next approach improves on the previous one — not just "here's a faster way," but the actual insight that unlocks it.

## Files in this folder

| File | Pattern family covered |
|---|---|
| `01_arrays_two_pointers_sliding_window.md` | Kadane's algorithm, two-pointer techniques, sliding window (fixed and variable size) |
| `02_binary_search_and_search_space.md` | Classic binary search, search-on-answer, rotated array search |
| `03_recursion_backtracking.md` | Subsets, permutations, N-Queens, Sudoku solver, combination sum |
| `04_linked_list_patterns.md` | Reversal, cycle detection, merging, k-group reversal |
| `05_stack_queue_patterns.md` | Monotonic stack, next greater element, histogram, min stack |
| `06_tree_patterns.md` | Traversals, LCA, diameter, BST operations, serialization |
| `07_graph_patterns.md` | BFS/DFS applications, topological sort, Dijkstra, Union-Find |
| `08_dynamic_programming_patterns.md` | Knapsack family, LCS/edit distance, LIS, DP on grids |
| `09_greedy_and_bit_manipulation.md` | Interval scheduling, activity selection, classic bit tricks |

Each file is self-contained and follows the same template per problem, so once you've read one, you know how to read all of them.

## How to use this folder

1. **Read the problem statement, then stop and attempt it yourself** before reading the Brute Force section — the value of "brute force first" only exists if you actually try the naive approach and feel *why* it's slow.
2. **Read Brute → Better → Optimal in order, even if you already know the optimal answer.** The "aha" moment that gets you from Better to Optimal is the actual interview skill; skipping to the answer memorizes code without building the instinct to derive it on a problem you haven't seen before.
3. Cross-reference the topic folders (`01_arrays_strings` through `09_advanced_patterns`) for the deeper theory behind whichever pattern a problem uses — this folder is the *applied problem-solving* layer sitting on top of that theory, not a replacement for it.
