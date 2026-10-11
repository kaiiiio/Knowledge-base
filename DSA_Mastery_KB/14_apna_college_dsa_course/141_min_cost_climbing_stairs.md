# Min Cost Climbing Stairs

Simple words, step by step.

## The question
Each stair has an associated cost. You can start from step 0 or step 1, and from any step you can climb 1 or 2 steps. Find the MINIMUM total cost to reach the TOP (one step past the last stair).

## The recurrence: the cost to reach ANY step is that step's own cost, plus the cheaper of the two ways to have arrived there
```python
def min_cost_climbing_stairs(cost):
    n = len(cost)
    dp = [0] * (n + 1)              # dp[i] = min cost to reach step i (the "top" is index n, one past the last stair)
    for i in range(2, n + 1):
        dp[i] = min(
            dp[i - 1] + cost[i - 1],          # arrive via a 1-step from i-1, paying i-1's cost
            dp[i - 2] + cost[i - 2]             # arrive via a 2-step from i-2, paying i-2's cost
        )
    return dp[n]
```
```javascript
function minCostClimbingStairs(cost) {
    const n = cost.length;
    const dp = new Array(n + 1).fill(0);        // dp[i] = min cost to reach step i (top is index n)
    for (let i = 2; i <= n; i++) {
        dp[i] = Math.min(
            dp[i - 1] + cost[i - 1],              // arrive via a 1-step from i-1, paying i-1's cost
            dp[i - 2] + cost[i - 2]                 // arrive via a 2-step from i-2, paying i-2's cost
        );
    }
    return dp[n];
}
```
**Speed**: O(n) time; trivially space-optimizable to O(1) (same sliding-window pattern as files 136-140).

## Why `dp[0] = dp[1] = 0` (the implicit base cases)
You can START from EITHER step 0 or step 1 for FREE (no cost paid just to begin standing there) — the cost is only paid when you actually STEP OFF of a stair to move forward. This is why `dp[0]` and `dp[1]` are both 0: reaching "step 0" or "step 1" as a STARTING position costs nothing, and the cost formula only charges `cost[i-1]` or `cost[i-2]` when actually LEAVING those steps to advance further.

## Rules to remember
- **The subtle detail that trips people up: the cost array represents the cost of LEAVING a step, not the cost of ARRIVING at it.** This is why the recurrence adds `cost[i-1]` (the cost of the step you're jumping FROM), not `cost[i]` (the step you're jumping TO) — misreading this direction is the single most common bug in this specific problem.
- Yet another instance of the same 2-state-lookback MIN recurrence (files 138, 140) — recognizing the shared shape, then carefully nailing down the exact per-transition cost formula specific to THIS problem's rules (leaving-cost vs. arriving-cost, in this case), is the actual skill being tested.

## Twisted Tricky Examples (with Solutions)

### Twist 1: What if the cost represents the cost of ARRIVING at a step instead (a common variant/rephrasing)?
```python
def min_cost_arriving(cost):
    n = len(cost)
    dp = [0] * n
    dp[0], dp[1] = cost[0], cost[1]          # must pay to arrive at the very first steps taken, in this variant
    for i in range(2, n):
        dp[i] = cost[i] + min(dp[i - 1], dp[i - 2])
    return min(dp[n - 1], dp[n - 2])           # can finish by landing on either of the last two steps
```
**The trap**: re-read the problem statement extremely carefully to determine whether cost is paid upon LEAVING or ARRIVING at a step — these are genuinely different recurrences (note here `cost[i]` is added when COMPUTING `dp[i]`, not when computing `dp[i-1]` or `dp[i-2]`, the opposite of the original problem's direction), and the final answer extraction also differs (the original problem's "top" is a step PAST the array, paid for by leaving the last two steps; this variant's answer is the min of actually landing on either of the last two steps, since there's no extra "past the end" position to pay to reach).

### Twist 2: Reconstruct the actual sequence of steps taken for the minimum cost path
**The trap**: directly parallels file 138's Twist 2 and file 124's Twist 1 — reconstructing an actual path/sequence (not just the optimal value) requires retaining the FULL `dp` array (not the O(1) space-optimized version) and walking backward, comparing which of the two predecessor options (`dp[i-1]+cost` vs `dp[i-2]+cost`) actually matches the final `dp[i]` value at each step, to infer which choice was made.

## Interview Q&A

**Q1: Why does the recurrence use `cost[i-1]` and `cost[i-2]` (the cost of the step being LEFT) rather than `cost[i]` (the cost of the step being reached)?**
Because this specific problem's rules define the cost as being charged for STEPPING OFF of a stair, not for landing on one — so when computing the cost to reach step `i`, the relevant charge is whatever step you're departing FROM (either `i-1` or `i-2`, depending on which jump size is being considered), not the step you're arriving at. This is a problem-specific convention that must be carefully confirmed by re-reading the exact problem wording, since the opposite convention (cost charged on arrival) is an equally common variant with a subtly different recurrence.

**Q2: Why are `dp[0]` and `dp[1]` both initialized to 0, rather than to `cost[0]` and `cost[1]` respectively?**
Because the problem explicitly allows starting from either step 0 or step 1 for free — no cost is incurred simply for being positioned at the starting step; costs are only incurred when actually moving (stepping off a stair) to advance further up the staircase. Since `dp[0]` and `dp[1]` represent the cost of simply BEING at those starting positions (not the cost of any movement), they correctly start at 0, with the actual step-costs only entering the calculation once the recurrence begins computing `dp[2]` onward, which represents genuine movement having occurred.

**Q3: If the problem were rephrased so that cost is charged upon ARRIVING at a step rather than leaving one, what specifically would need to change in both the recurrence and the final answer extraction?**
The recurrence itself would need `cost[i]` added to the result of `min(dp[i-1], dp[i-2])`, rather than adding `cost[i-1]` or `cost[i-2]` to each respective predecessor value — reflecting that the charge is now tied to the step being arrived AT, not departed FROM. Additionally, the final answer extraction would change: in the original "leaving cost" version, the answer is `dp[n]`, a position one step PAST the actual last stair (free to simply stand at, since nothing is being left from there) — but in the "arriving cost" variant, there's no such free "past the end" position; the answer must instead be the minimum of actually arriving at EITHER of the last two real stairs (`min(dp[n-1], dp[n-2])`), since finishing the climb means landing on one of them, each of which did incur its own arrival cost.
