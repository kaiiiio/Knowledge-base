# House Robber

Simple words, step by step.

## The question
Given an array of house values, find the maximum total value you can rob, given the constraint that you **cannot rob two adjacent houses** (robbing adjacent houses triggers the alarm).

## The recurrence: at each house, choose to ROB it or SKIP it
Reasoning backward from house `i` (the standard technique from file 137): either you rob house `i` (in which case you could NOT have robbed house `i-1`, so you add house `i`'s value to the best result up to `i-2`), or you skip house `i` entirely (keeping whatever the best result was up to `i-1`). Take the MAX of these two choices.

```python
def house_robber(nums):
    if not nums:
        return 0
    if len(nums) == 1:
        return nums[0]
    prev2, prev1 = 0, nums[0]          # best result considering houses up to index -1, and up to index 0
    for i in range(1, len(nums)):
        current = max(prev1, prev2 + nums[i])      # SKIP house i, or ROB house i (+ best up to i-2)
        prev2, prev1 = prev1, current
    return prev1
```
```javascript
function houseRobber(nums) {
    if (nums.length === 0) return 0;
    if (nums.length === 1) return nums[0];
    let prev2 = 0, prev1 = nums[0];
    for (let i = 1; i < nums.length; i++) {
        const current = Math.max(prev1, prev2 + nums[i]);     // SKIP house i, or ROB house i (+ best up to i-2)
        [prev2, prev1] = [prev1, current];
    }
    return prev1;
}
```
**Speed**: O(n) time, O(1) space — same "sliding window of last 2 values" shape as Climbing Stairs (file 137), but with a MAX instead of a SUM, directly illustrating the counting-vs-optimization recurrence-shape distinction flagged in file 137's Twist 2.

## Dry run
`nums = [2, 7, 9, 3, 1]`.
- `prev2=0, prev1=2` (after house 0).
- `i=1` (house 7): `current = max(2, 0+7) = 7`. `prev2=2, prev1=7`.
- `i=2` (house 9): `current = max(7, 2+9) = 11`. `prev2=7, prev1=11`.
- `i=3` (house 3): `current = max(11, 7+3) = 11`. `prev2=11, prev1=11`.
- `i=4` (house 1): `current = max(11, 11+1) = 12`. `prev2=11, prev1=12`.
- Final answer: `12` (rob houses 7, 9... wait, check: robbing house index 1 (7) and index 4 (1) gives 8; robbing index 0 (2), index 2 (9), index 4 (1) gives 12 — correctly non-adjacent and matches the computed maximum).

## Rules to remember
- **The core recurrence `dp[i] = max(dp[i-1], dp[i-2] + nums[i])` is the canonical "rob or skip" DP shape** — this exact "take the current item plus best-excluding-neighbor, or skip it and keep best-so-far" pattern reappears in many "non-adjacent selection, maximize/minimize total" problems beyond just this one.
- Just like Climbing Stairs, this problem's recurrence only depends on the last 2 values, enabling the same O(1) space optimization — recognizing this shape (sum-of-two-previous vs. max-of-two-previous-combinations) quickly is the key skill, not deriving it from scratch each time.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Houses are arranged in a CIRCLE (first and last houses are also "adjacent") — this is House Robber II (file 139)
**The trap**: this is a direct forward pointer — the circular constraint means the simple linear recurrence can't be applied directly across the WHOLE array (since robbing both the first and last house would violate the circular-adjacency rule); the standard fix (full treatment in file 139) is running the LINEAR version TWICE — once excluding the last house, once excluding the first house — and taking the max of those two results, since at least one of those two houses must be excluded in any valid circular solution anyway.

### Twist 2: Return the ACTUAL set of houses robbed, not just the maximum total value
```python
def house_robber_with_houses(nums):
    n = len(nums)
    if n == 0:
        return []
    dp = [0] * n
    dp[0] = nums[0]
    if n > 1:
        dp[1] = max(nums[0], nums[1])
    for i in range(2, n):
        dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])

    robbed = []
    i = n - 1
    while i >= 0:
        if i == 0 or dp[i] != dp[i - 1]:          # dp[i] changed -- house i WAS robbed (or we're at the start)
            robbed.append(i)
            i -= 2
        else:
            i -= 1
    return sorted(robbed)
```
**The trap**: reconstructing the actual choice sequence (not just the optimal value) requires keeping the FULL `dp` array (not the space-optimized O(1) version), then walking BACKWARD through it, comparing adjacent values to infer which choice ("rob" vs "skip") was made at each step — a direct parallel to reconstructing the actual path in Dijkstra's Algorithm (file 124, Twist 1), where tracking just the optimal VALUE isn't enough if the actual SEQUENCE of choices is also needed.

## Interview Q&A

**Q1: Why does the recurrence `dp[i] = max(dp[i-1], dp[i-2] + nums[i])` correctly capture the "no two adjacent houses" constraint?**
At house `i`, there are only two possible decisions: rob it, or don't. If you rob house `i`, the adjacency constraint means house `i-1` must NOT have been robbed — so the best total in that case is house `i`'s value PLUS the best achievable total using only houses up to `i-2` (completely skipping the possibility of also robbing `i-1`). If you don't rob house `i`, the best total is simply whatever the best achievable total was using houses up to `i-1`, unconstrained by anything involving house `i`. Taking the MAX of these two mutually exclusive, exhaustive choices at every step correctly builds up the true optimal answer respecting the adjacency constraint throughout.

**Q2: Why does House Robber use a MAX in its recurrence while Climbing Stairs uses a SUM, despite both having the identical "depends on the previous two values" shape?**
Climbing Stairs is fundamentally a COUNTING problem — it asks "in how many DISTINCT ways can this state be reached," and since reaching the current step via a 1-step move and reaching it via a 2-step move are two separate, non-overlapping categories of ways, the total count is correctly obtained by ADDING them together. House Robber is fundamentally an OPTIMIZATION problem — it asks "what is the BEST (maximum) achievable value," and since "rob this house" and "skip this house" are two alternative strategies where only ONE can actually be chosen (not both, and not some combination), the correct way to combine them is to take whichever single strategy yields the higher value, i.e., a MAX rather than a SUM.

**Q3: Why does reconstructing the actual set of robbed houses require retaining the full `dp` array, rather than being derivable from just the final optimized O(1) space variables?**
The O(1) space version only ever keeps the two most recent values needed to compute the NEXT value — it deliberately discards all earlier history once it's no longer needed for forward computation, which is exactly what makes it space-efficient. But reconstructing the actual sequence of choices requires walking BACKWARD through the complete history of decisions made at every single step, comparing each `dp[i]` against its neighbors to infer whether robbing or skipping was the choice that led to that particular value — information that's only available if the full array of intermediate results was preserved throughout the computation, which directly conflicts with the space-optimized version's entire strategy of discarding unneeded history as it goes.
