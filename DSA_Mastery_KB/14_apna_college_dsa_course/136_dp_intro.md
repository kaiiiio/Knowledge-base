# Dynamic Programming — Introduction

Simple words, step by step.

## What problem does DP solve?
Dynamic Programming applies to problems that have **overlapping subproblems** and **optimal substructure** — meaning the same smaller calculation gets repeated many times during plain recursion, and the optimal answer to the whole problem can be built from optimal answers to its pieces. DP's entire idea: **compute each distinct subproblem exactly once, and reuse (cache) the result** instead of recomputing it.

## The canonical motivating example: Fibonacci
```python
def fib_naive(n):                    # plain recursion -- exponential time
    if n <= 1:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)
```
Calling `fib_naive(5)` computes `fib_naive(3)` TWICE, `fib_naive(2)` THREE times, and so on — the same subproblems are solved repeatedly, wastefully. **Speed**: O(2ⁿ) — exponential, because the recursion tree branches into two calls at every level without ever reusing prior work.

## Approach 1: Memoization (Top-Down) — recursion + a cache
```python
def fib_memo(n, cache=None):
    if cache is None:
        cache = {}
    if n <= 1:
        return n
    if n in cache:
        return cache[n]                 # already solved this exact subproblem -- reuse it
    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)
    return cache[n]
```
```javascript
function fibMemo(n, cache = new Map()) {
    if (n <= 1) return n;
    if (cache.has(n)) return cache.get(n);        // already solved this exact subproblem -- reuse it
    const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
    cache.set(n, result);
    return result;
}
```
**Speed**: O(n) — each distinct subproblem (`fib(0)` through `fib(n)`) is computed exactly once; every repeated call becomes an O(1) cache lookup.

## Approach 2: Tabulation (Bottom-Up) — build up from the base cases, no recursion at all
```python
def fib_tabulation(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[0], dp[1] = 0, 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]          # build each answer from already-computed smaller answers
    return dp[n]
```
```javascript
function fibTabulation(n) {
    if (n <= 1) return n;
    const dp = new Array(n + 1).fill(0);
    dp[1] = 1;
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];            // build each answer from already-computed smaller answers
    }
    return dp[n];
}
```
**Speed**: O(n) time, same as memoization — but NO recursion at all, avoiding any call-stack overhead or depth-limit risk.

## Approach 3: Space-Optimized Tabulation — only keep the last 2 values needed
```python
def fib_optimized(n):
    if n <= 1:
        return n
    prev2, prev1 = 0, 1
    for _ in range(2, n + 1):
        prev2, prev1 = prev1, prev1 + prev2     # slide the window forward -- no array needed at all
    return prev1
```
```javascript
function fibOptimized(n) {
    if (n <= 1) return n;
    let prev2 = 0, prev1 = 1;
    for (let i = 2; i <= n; i++) {
        [prev2, prev1] = [prev1, prev1 + prev2];     // slide the window forward -- no array needed at all
    }
    return prev1;
}
```
**Speed**: O(n) time, O(1) space — this final optimization is possible specifically because Fibonacci only ever needs the PREVIOUS 2 values, not the entire history; this "only keep what's actually still needed" observation generalizes to many other 1D DP problems (files 137-141).

## Rules to remember
- **The progression Memoization → Tabulation → Space-Optimized is the standard, expected path for essentially every DP problem in this entire module** — always start by writing the brute-force recursive solution first (to nail down the correct recurrence relation), THEN add memoization (the easiest correctness-preserving speedup), THEN consider converting to tabulation (removes recursion overhead), THEN consider space optimization (if only a few previous states are actually needed going forward).
- **Memoization and Tabulation solve the EXACT SAME subproblems and achieve the EXACT SAME time complexity** — the choice between them is about style and practical constraints (memoization is often easier to derive directly from the brute-force recursive solution; tabulation avoids recursion-depth risk and sometimes allows for the space optimization that memoization's recursive structure doesn't as naturally support).

## Twisted Tricky Examples (with Solutions)

### Twist 1: Why doesn't memoization help a problem with NO overlapping subproblems (e.g., plain binary search)?
**The trap**: this is a conceptual check, not a coding trap — memoization's entire benefit comes from avoiding REPEATED computation of the IDENTICAL subproblem; a problem like binary search never calls itself with the same arguments twice (each recursive call operates on a genuinely smaller, non-overlapping range), so there's nothing to cache or reuse — adding a memoization cache to such a problem would be pure overhead with zero benefit, a sign of misapplying the technique without first confirming the "overlapping subproblems" prerequisite actually holds.

### Twist 2: The recursive solution has the CORRECT recurrence relation, but memoization still doesn't speed it up — why?
**The trap**: this usually means the cache KEY is wrong — if the memoization cache is keyed only on part of the relevant state (missing some parameter that actually varies and affects the result), either incorrect results get cached and reused inappropriately, or (if overly specific) no actual cache hits ever occur, silently defeating the entire purpose; always double check that the cache key captures EXACTLY the full set of parameters that uniquely determine a subproblem's answer, no more and no less.

## Interview Q&A

**Q1: Why does plain recursive Fibonacci take O(2ⁿ) time, and how exactly does memoization reduce this to O(n)?**
Plain recursion recomputes the exact same subproblem many times — for instance, `fib(n-2)` gets computed independently as part of both the `fib(n-1)` branch and the direct `fib(n-2)` branch, and this duplication compounds exponentially deeper into the recursion tree, since each of those duplicated calls ALSO independently recomputes ITS OWN subproblems, and so on. Memoization fixes this by storing the result of each distinct subproblem (indexed by its input, here just `n`) the first time it's computed, so every subsequent call with that same input becomes an O(1) lookup instead of a full recomputation — since there are only `n` distinct subproblems total (`fib(0)` through `fib(n)`), and each is now computed exactly once, the total work collapses from exponential to linear.

**Q2: What's the practical difference between memoization (top-down) and tabulation (bottom-up), given they achieve the identical time complexity?**
Memoization preserves the natural recursive structure of the brute-force solution, simply adding a cache check at the top of each call — this often makes it easier to derive directly and quickly from an already-correct recursive solution, at the cost of recursion's inherent overhead (function call overhead, and risk of stack overflow on very deep recursion). Tabulation builds the solution iteratively from the base cases upward, in a loop, with no recursion at all — this avoids any recursion-related overhead or depth-limit risk, and often makes subsequent space optimizations (like Fibonacci's O(1)-space version) more naturally apparent, since the iterative structure makes it obvious exactly which previous values are still needed going forward.

**Q3: Why does the space-optimized version of Fibonacci only need to track the previous TWO values, rather than the entire array of previously computed values?**
Because Fibonacci's recurrence relation (`dp[i] = dp[i-1] + dp[i-2]`) only ever references the two immediately preceding values to compute the current one — none of the earlier history (`dp[i-3]`, `dp[i-4]`, etc.) is ever needed again once `dp[i-1]` and `dp[i-2]` have been used to compute `dp[i]`. This means an entire array isn't actually necessary; just tracking the two most recent values and "sliding" them forward at each step preserves all the information the recurrence actually depends on, reducing space usage from O(n) to O(1) — a pattern worth recognizing in any 1D DP problem whose recurrence only looks back a small, fixed number of steps.
