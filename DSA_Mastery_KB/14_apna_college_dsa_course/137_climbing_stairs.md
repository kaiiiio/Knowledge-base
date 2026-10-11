# Climbing Stairs

Simple words, step by step.

## The question
You can climb 1 or 2 steps at a time. Given `n` stairs, how many distinct ways are there to reach the top?

## The recurrence: this IS Fibonacci in disguise
To reach step `n`, your LAST move was either a 1-step from `n-1`, or a 2-step from `n-2` — so the total number of ways to reach `n` is the SUM of ways to reach `n-1` and ways to reach `n-2`. This is exactly Fibonacci's recurrence (file 136), just with different base cases.

```python
def climb_stairs(n):
    if n <= 2:
        return n
    prev2, prev1 = 1, 2          # ways to reach step 1, ways to reach step 2
    for _ in range(3, n + 1):
        prev2, prev1 = prev1, prev1 + prev2
    return prev1
```
```javascript
function climbStairs(n) {
    if (n <= 2) return n;
    let prev2 = 1, prev1 = 2;
    for (let i = 3; i <= n; i++) {
        [prev2, prev1] = [prev1, prev1 + prev2];
    }
    return prev1;
}
```
**Speed**: O(n) time, O(1) space — directly reusing file 136's space-optimized Fibonacci template.

## Rules to remember
- **This is the single clearest "spot the Fibonacci pattern in disguise" problem** — recognizing that "count ways to reach step n, moving 1 or 2 steps" reduces EXACTLY to Fibonacci's recurrence (just shifted base cases) is the entire insight; no new DP technique is needed beyond what file 136 already established.
- Always derive the recurrence FIRST by reasoning about "what could my LAST move have been" — this backward-reasoning approach ("what are all the ways I could have just arrived at state X") is the standard, reusable technique for deriving DP recurrences across almost every problem in this module.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Allowed to climb 1, 2, OR 3 steps at a time
```python
def climb_stairs_variable(n, max_step=3):
    dp = [0] * (n + 1)
    dp[0] = 1                        # one way to be at step 0: do nothing
    for i in range(1, n + 1):
        for step in range(1, max_step + 1):
            if i - step >= 0:
                dp[i] += dp[i - step]
    return dp[n]
```
**The trap**: generalizing beyond exactly "1 or 2" steps breaks the clean O(1)-space sliding-window trick, since the recurrence now depends on potentially MANY previous values (however many distinct step sizes are allowed), not just the last 2 — the fix is a direct generalization (sum over all allowed step sizes), but the space optimization needs to track the last `max_step` values instead of just 2, or fall back to a full array if `max_step` isn't small/fixed.

### Twist 2: Each step has an associated COST, and you want the MINIMUM cost to reach the top (this is file 141's problem exactly)
**The trap**: this is a direct forward pointer — introducing a "cost" per step transforms this from a pure COUNTING problem ("how many ways") into an OPTIMIZATION problem ("what's the best/cheapest way") — the recurrence shape changes from a SUM (`dp[i] = dp[i-1] + dp[i-2]`) to a MIN (`dp[i] = cost[i] + min(dp[i-1], dp[i-2])`), a transformation that recurs constantly throughout this module: counting problems sum over possibilities, optimization problems take min/max over possibilities.

## Interview Q&A

**Q1: Why is "Climbing Stairs" considered the same underlying problem as computing Fibonacci numbers, despite being phrased completely differently?**
Both problems share the EXACT SAME recurrence relation: the answer for position `n` is the sum of the answers for positions `n-1` and `n-2`. In Climbing Stairs, this falls out of reasoning about "what was my last move" (a 1-step from `n-1`, or a 2-step from `n-2`, these being the only two ways to have just arrived at step `n`) — mathematically this is identical to Fibonacci's own definition, differing only in the starting base case values, which is why the exact same space-optimized O(1) solution template transfers over unchanged.

**Q2: What general technique is used to derive the recurrence relation for Climbing Stairs, and how does this technique generalize to other DP problems?**
The technique is to ask "what could my LAST move/step/decision have been, to arrive at this exact state" — by enumerating all the possible last moves (here: a 1-step or a 2-step) and recognizing that the total count of ways to reach the current state is the SUM of the ways to reach each of the possible "previous states" those last moves could have come from. This backward-reasoning approach — focus on the last decision, not the first — is a broadly reusable technique for deriving correct DP recurrences across nearly every problem in this module, not specific to this one problem alone.

**Q3: Why does generalizing this problem to allow steps of size 1, 2, OR 3 (rather than just 1 or 2) break the O(1) space optimization used in the simpler version, and what would restore some form of space efficiency?**
The O(1) space trick works specifically because the original recurrence only ever depends on the two immediately preceding values (`dp[i-1]` and `dp[i-2]`) — but allowing a third step size introduces a dependency on `dp[i-3]` as well, meaning the "sliding window" of values that must be retained grows to match however many distinct step sizes are allowed. The general fix is to track the last `k` values (where `k` is the largest allowed step size) rather than just the last 2, restoring O(k) space instead of full O(n) — still a meaningful improvement over a full array when `k` is small and fixed, though no longer the pure O(1) of the original two-step version.
