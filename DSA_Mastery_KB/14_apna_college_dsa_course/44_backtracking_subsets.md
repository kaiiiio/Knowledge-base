# Recursion — Part 3: Backtracking, Print All Subsets

Simple words, step by step.

## What is backtracking?
Backtracking is recursion with a very specific shape: **try a choice, explore what happens, then undo that choice (go back) and try the next one.** It's used whenever you need to explore every possible option to build up a solution — like trying every possible path in a maze, and turning back whenever you hit a dead end.

## The three-step backtracking pattern (memorize this shape)
```
1. CHOOSE   -- pick an option (add something to your current partial solution)
2. EXPLORE  -- recursively continue building the rest of the solution
3. UNCHOOSE -- undo the choice (remove what you added), so the next option can be tried cleanly
```
**The most common backtracking bug**: forgetting step 3. Without undoing the choice, the next branch of the recursion tree starts from a "contaminated" state that still has the previous choice baked in — leading to wrong or missing results.

## Problem: Print All Subsets of an Array
Given `[1, 2, 3]`, print every possible subset: `[]`, `[1]`, `[2]`, `[3]`, `[1,2]`, `[1,3]`, `[2,3]`, `[1,2,3]`.

### The idea
For each element, there are exactly two choices: **include it** in the current subset, or **exclude it**. Explore both choices for every element — this naturally produces every possible combination.
```python
def print_subsets(nums):
    result = []

    def backtrack(index, current):
        if index == len(nums):
            result.append(current[:])      # [:] makes a COPY -- very important, see rules below
            return

        current.append(nums[index])         # CHOOSE: include nums[index]
        backtrack(index + 1, current)        # EXPLORE
        current.pop()                        # UNCHOOSE: remove it before trying "exclude"

        backtrack(index + 1, current)        # EXPLORE the "exclude" branch

    backtrack(0, [])
    return result
```
```javascript
function printSubsets(nums) {
    const result = [];

    function backtrack(index, current) {
        if (index === nums.length) {
            result.push([...current]);        // [...current] makes a COPY -- very important
            return;
        }

        current.push(nums[index]);              // CHOOSE: include nums[index]
        backtrack(index + 1, current);            // EXPLORE
        current.pop();                            // UNCHOOSE: remove it before trying "exclude"

        backtrack(index + 1, current);            // EXPLORE the "exclude" branch
    }

    backtrack(0, []);
    return result;
}
```
**Speed**: O(2^n) time (there are exactly 2^n subsets of an n-element set — this is not a slow-algorithm problem, the answer itself is exponentially large), O(n) extra space for the recursion depth (not counting the space needed to store all 2^n results).

**Watching the recursion tree grow** for `[1, 2]` (I = include, E = exclude):
```
                        backtrack(0, [])
                       /                \
              choose 1 (I)          exclude 1 (E)
            backtrack(1,[1])         backtrack(1,[])
             /        \                /         \
        I: [1,2]    E: [1]        I: [2]        E: []
      -> save [1,2] -> save [1]  -> save [2]   -> save []
```
Final result: `[1,2], [1], [2], []` — all four subsets of a 2-element set (2² = 4), found by exploring both choices at every level.

## Why `current[:]` / `[...current]` matters so much
`current` is **one single list object**, being mutated (appended to and popped from) throughout the entire recursion. If you saved `result.append(current)` (without copying), every entry in `result` would just be a *reference* to that same, constantly-changing list — by the time the recursion finishes, every single saved "subset" would incorrectly show the exact same final, fully-emptied state. This is one of the most common and confusing backtracking bugs, and it's exactly the same "shallow copy vs new object" trap covered elsewhere in this knowledge base's JavaScript/Python fundamentals material.

## Rules to remember
- The **CHOOSE → EXPLORE → UNCHOOSE** pattern is not optional ceremony — skipping the "unchoose" step is the single most common bug in every backtracking problem in this entire module (Permutations, N-Queens, Sudoku, Combination Sum, Palindrome Partitioning — all of them).
- Always copy the current partial solution before saving it to the results list — saving a live reference to a list that keeps changing is a guaranteed bug.
- 2^n subsets is a lot even for modest `n` — at `n = 20`, that's already over a million subsets. Backtracking problems like this are inherently exponential; the "optimization" isn't making the algorithm faster in Big-O terms (you can't beat O(2^n) for a problem whose *answer* has 2^n items), it's about pruning branches early when possible (not relevant to plain subset-printing, but very relevant to the next few problems in this module).

## Interview Q&A

**Q1: Why is the "unchoose" (backtrack) step necessary — what breaks without it?**
The `current` list is shared and mutated across the entire recursion. If you never undo a choice (e.g., never `pop()` after trying "include"), then when the recursion returns to try the "exclude" branch, `current` still incorrectly contains the included element — the two branches are supposed to represent mutually exclusive choices, but without undoing, they contaminate each other, producing wrong results.

**Q2: Why is the time complexity O(2^n), and is that actually a sign of a bad algorithm?**
It's O(2^n) because that's the true number of subsets a set of size `n` has — there is no way to enumerate all of them faster than the count of what you're enumerating. This is not a sign of an inefficient algorithm; it's an inherent property of the problem itself. The distinction to know: an algorithm being O(2^n) is only "bad" when a polynomial-time solution *exists* and you failed to find it (like naive Fibonacci) — here, no such faster solution exists, because the output size itself is exponential.

**Q3: How does the "include/exclude" recursion tree relate to binary representations of numbers?**
Each subset corresponds to a unique n-bit binary number, where bit `i` being 1 means "include element i" and 0 means "exclude it." A set of `n` elements has exactly `2^n` such binary numbers (from `00...0` to `11...1`), which is exactly why there are `2^n` subsets — this is a genuinely useful alternate way to generate all subsets iteratively (loop from `0` to `2^n - 1`, and use each number's bits to decide inclusion), without recursion at all.
