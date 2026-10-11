# 0/1 Knapsack (Recursion → Memoization → Tabulation → Space-Optimized)

Simple words, step by step.

## The question
Same setup as Fractional Knapsack (file 142) — items with `weight` and `value`, a capacity limit — but now each item must be taken **entirely or not at all** (no fractions). Maximize total value.

## Why greedy (file 142) fails here — a concrete counterexample
Capacity = 50. Item A: weight 10, value 60 (ratio 6). Item B: weight 20, value 100 (ratio 5). Item C: weight 30, value 120 (ratio 4).
Greedy (by ratio): take A (60) + B (100) = 160, using 30 capacity, 20 left — can't fit C (needs 30) → total = 160.
Optimal: take B (100) + C (120) = 220, using exactly 50 capacity → total = 220, which BEATS greedy's result.
This single counterexample is sufficient proof that greedy is NOT optimal here — a fundamentally different approach (DP) is required.

## Step 1: Brute-force recursion — for each item, choose to INCLUDE or EXCLUDE it
```python
def knapsack_recursive(weights, values, capacity, i=0):
    if i == len(weights) or capacity == 0:
        return 0
    if weights[i] > capacity:
        return knapsack_recursive(weights, values, capacity, i + 1)     # can't include -- too heavy
    exclude = knapsack_recursive(weights, values, capacity, i + 1)
    include = values[i] + knapsack_recursive(weights, values, capacity - weights[i], i + 1)
    return max(exclude, include)
```
**Speed**: O(2ⁿ) — at every item, two branches (include/exclude), exactly the same exponential blowup pattern as naive Fibonacci (file 136).

## Step 2: Memoization — cache on (index, remaining capacity), since that pair fully determines a subproblem
```python
def knapsack_memo(weights, values, capacity):
    n = len(weights)
    cache = {}

    def solve(i, remaining):
        if i == n or remaining == 0:
            return 0
        if (i, remaining) in cache:
            return cache[(i, remaining)]
        if weights[i] > remaining:
            result = solve(i + 1, remaining)
        else:
            exclude = solve(i + 1, remaining)
            include = values[i] + solve(i + 1, remaining - weights[i])
            result = max(exclude, include)
        cache[(i, remaining)] = result
        return result

    return solve(0, capacity)
```
**Speed**: O(n × capacity) — exactly `n × capacity` distinct `(i, remaining)` pairs exist, each computed once.

## Step 3: Tabulation — 2D DP table, built bottom-up
```python
def knapsack_tabulation(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for cap in range(capacity + 1):
            if weights[i - 1] > cap:
                dp[i][cap] = dp[i - 1][cap]                 # can't include item i-1 -- same as without it
            else:
                dp[i][cap] = max(
                    dp[i - 1][cap],                              # exclude item i-1
                    values[i - 1] + dp[i - 1][cap - weights[i - 1]]     # include item i-1
                )
    return dp[n][capacity]
```
```javascript
function knapsackTabulation(weights, values, capacity) {
    const n = weights.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let cap = 0; cap <= capacity; cap++) {
            if (weights[i - 1] > cap) {
                dp[i][cap] = dp[i - 1][cap];                    // can't include item i-1 -- same as without it
            } else {
                dp[i][cap] = Math.max(
                    dp[i - 1][cap],                                 // exclude item i-1
                    values[i - 1] + dp[i - 1][cap - weights[i - 1]]    // include item i-1
                );
            }
        }
    }
    return dp[n][capacity];
}
```
**Speed**: O(n × capacity) time AND space — identical time bound to memoization, but no recursion overhead.

## Step 4: Space-Optimized — only the PREVIOUS row is ever needed, so collapse to a 1D array
```python
def knapsack_optimized(weights, values, capacity):
    n = len(weights)
    dp = [0] * (capacity + 1)

    for i in range(n):
        for cap in range(capacity, weights[i] - 1, -1):      # iterate BACKWARD -- critical, see Rules below
            dp[cap] = max(dp[cap], values[i] + dp[cap - weights[i]])
    return dp[capacity]
```
```javascript
function knapsackOptimized(weights, values, capacity) {
    const n = weights.length;
    const dp = new Array(capacity + 1).fill(0);

    for (let i = 0; i < n; i++) {
        for (let cap = capacity; cap >= weights[i]; cap--) {      // iterate BACKWARD -- critical, see Rules below
            dp[cap] = Math.max(dp[cap], values[i] + dp[cap - weights[i]]);
        }
    }
    return dp[capacity];
}
```
**Speed**: O(n × capacity) time, O(capacity) space — a direct space reduction from the 2D table, since each row only ever depends on the row directly above it.

## Why the space-optimized version MUST iterate `cap` BACKWARD (descending), not forward
Each item can only be used ONCE (0/1, not unlimited). If the inner loop iterated FORWARD (ascending `cap`), `dp[cap - weights[i]]` could already reflect an update made EARLIER in the SAME pass for the SAME item `i` — effectively allowing item `i` to be counted twice (using it to update a smaller capacity, then using that already-updated value to update a larger capacity within the same item's pass). Iterating backward ensures `dp[cap - weights[i]]` always reflects the PREVIOUS item's state only, correctly enforcing "each item used at most once."

## Rules to remember
- **The full Recursion → Memoization → Tabulation → Space-Optimized progression (file 136's template) is on full display here, end to end** — this problem is the capstone demonstration of that entire methodology applied to a genuinely two-dimensional state space (item index AND remaining capacity), rather than the simpler one-dimensional states of files 137-141.
- **Greedy fails specifically because whole-item constraints remove the "perfect topping off" guarantee that made greedy provably correct for the Fractional version (file 142)** — this problem exists specifically to teach that exact contrast.
- The backward-iteration requirement in the space-optimized version is a frequently-tested, easy-to-get-wrong detail — always double-check this direction when implementing any space-optimized 0/1 (not unlimited) selection DP.

## Twisted Tricky Examples (with Solutions)

### Twist 1: UNLIMITED supply of each item (Unbounded Knapsack) — does the backward-iteration rule still apply?
```python
def unbounded_knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)
    for cap in range(1, capacity + 1):
        for i in range(len(weights)):
            if weights[i] <= cap:
                dp[cap] = max(dp[cap], values[i] + dp[cap - weights[i]])     # note: FORWARD iteration now
    return dp[capacity]
```
**The trap**: this is the exact OPPOSITE rule — since items can be reused unlimited times, iterating `cap` FORWARD is now CORRECT (and desired), since `dp[cap - weights[i]]` is SUPPOSED to potentially reflect an already-updated value involving the same item `i`, which is precisely what allows unlimited reuse; confusing the 0/1 and Unbounded variants' iteration direction is one of the most common DP bugs at this level.

### Twist 2: Reconstruct the ACTUAL set of items chosen, not just the maximum value
**The trap**: directly parallels files 124/138/141's path-reconstruction twists — requires retaining the FULL 2D `dp` table (not the space-optimized 1D version) and walking backward from `dp[n][capacity]`, checking at each step whether `dp[i][cap] == dp[i-1][cap]` (item NOT included) or not (item WAS included, so subtract its weight and move to `dp[i-1][cap - weight]`) — the same general "retain full history, walk backward comparing values" technique used throughout this entire course whenever an actual choice-sequence (not just an optimal value) is needed.

## Interview Q&A

**Q1: Why does the greedy strategy that works perfectly for Fractional Knapsack provably fail for 0/1 Knapsack?**
Greedy's correctness in the fractional case relies entirely on the ability to "perfectly top off" any remaining capacity with a fraction of the next-best-ratio item, guaranteeing no capacity is ever wasted by greedily committing to the current best choice. Once items must be taken whole-or-not-at-all, this topping-off guarantee disappears — greedily taking the single best-ratio item can leave an awkward amount of leftover capacity that no remaining single item fits into efficiently, while a different combination of items (individually lower-ratio, but collectively a better numeric fit for the capacity) could have produced strictly more total value, as demonstrated by the concrete A/B/C counterexample.

**Q2: Why does the recursive solution's state need to track BOTH the current item index AND the remaining capacity, rather than just one of these two dimensions?**
Both pieces of information are independently necessary to fully determine a subproblem: the item index determines WHICH items are still available to consider (items already decided upon, earlier in the index order, are no longer in play), while the remaining capacity determines HOW MUCH room is left for whatever gets chosen among those remaining items. Two different subproblems with the same item index but different remaining capacities are genuinely different problems (different amounts of room constrain different sets of valid choices), and similarly, two subproblems with the same remaining capacity but different item indices are also different (different sets of items are still available) — losing track of either dimension would make it impossible to correctly identify which subproblems are truly identical and eligible for caching/reuse.

**Q3: Why must the space-optimized 1D version iterate capacity BACKWARD for 0/1 Knapsack, but FORWARD for Unbounded Knapsack (unlimited item reuse)?**
The direction of iteration controls whether an update made to a smaller capacity value, using the CURRENT item, can influence the computation for a LARGER capacity value within that SAME item's processing pass. Iterating backward (descending capacity) ensures that by the time `dp[cap - weight]` is read, it still reflects only the PREVIOUS item's contribution (not yet updated by the current item), correctly enforcing that each item is used at most once. Iterating forward (ascending capacity) does the opposite — it deliberately allows `dp[cap - weight]` to already reflect an update made earlier in the SAME item's pass, which is exactly the mechanism that permits the same item to be effectively "reused" multiple times when building up to larger capacities, which is precisely the desired behavior for the Unbounded variant where unlimited copies of each item are allowed.
