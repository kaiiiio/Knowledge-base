# Frog Jump

Simple words, step by step.

## The question
A frog starts at stone 0 and wants to reach the last stone, jumping either 1 or 2 stones at a time. Each jump `i -> j` costs `abs(height[i] - height[j])`. Find the MINIMUM total cost to reach the last stone.

## The recurrence: at each stone, the minimum cost is the best of arriving via a 1-jump or a 2-jump
```python
def min_cost_frog_jump(heights):
    n = len(heights)
    if n <= 1:
        return 0
    dp = [0] * n
    dp[1] = abs(heights[1] - heights[0])          # only one way to reach stone 1: a 1-jump from stone 0
    for i in range(2, n):
        one_jump = dp[i - 1] + abs(heights[i] - heights[i - 1])
        two_jump = dp[i - 2] + abs(heights[i] - heights[i - 2])
        dp[i] = min(one_jump, two_jump)
    return dp[n - 1]
```
```javascript
function minCostFrogJump(heights) {
    const n = heights.length;
    if (n <= 1) return 0;
    const dp = new Array(n).fill(0);
    dp[1] = Math.abs(heights[1] - heights[0]);          // only one way to reach stone 1: a 1-jump from stone 0
    for (let i = 2; i < n; i++) {
        const oneJump = dp[i - 1] + Math.abs(heights[i] - heights[i - 1]);
        const twoJump = dp[i - 2] + Math.abs(heights[i] - heights[i - 2]);
        dp[i] = Math.min(oneJump, twoJump);
    }
    return dp[n - 1];
}
```
**Speed**: O(n) time; space-optimizable to O(1) using the same sliding-two-values trick (files 136-139), since `dp[i]` only ever depends on `dp[i-1]` and `dp[i-2]`.

## Rules to remember
- **Same exact recurrence SHAPE as House Robber (file 138) — `dp[i] = min/max(option using i-1, option using i-2)`** — the only differences are (1) MIN instead of MAX (this is a cost-minimization problem, not a value-maximization one) and (2) the specific per-transition cost formula (`abs(height difference)` instead of simply adding `nums[i]`). Recognizing this as "yet another instance of the same 2-state-lookback recurrence shape" rather than a brand-new problem is the key transferable skill this module is building.
- This problem is also commonly phrased/taught as "minimum cost path in an array with jump options" — the specific real-world framing (frog, stones) changes, but the underlying DP recurrence is identical regardless of the cover story.

## Twisted Tricky Examples (with Solutions)

### Twist 1: The frog can jump up to K stones (not just 1 or 2)
```python
def min_cost_frog_jump_k(heights, k):
    n = len(heights)
    dp = [float('inf')] * n
    dp[0] = 0
    for i in range(1, n):
        for jump in range(1, k + 1):
            if i - jump >= 0:
                dp[i] = min(dp[i], dp[i - jump] + abs(heights[i] - heights[i - jump]))
    return dp[n - 1]
```
**The trap**: directly parallels file 137's Twist 1 (generalizing Climbing Stairs to 1-2-3 steps) — generalizing the allowed jump distance means the recurrence must consider ALL `k` possible previous stones, not just a fixed 2, meaning the O(1)-space optimization generalizes to O(k) space (tracking the last `k` values) rather than the strict O(1) of the fixed 2-jump version.

### Twist 2: Minimize the MAXIMUM single jump cost along the path, rather than the SUM of all jump costs
**The trap**: this is a meaningfully different objective requiring a different recurrence shape — rather than `dp[i] = min(dp[i-1] + cost, dp[i-2] + cost)` (summing costs along the path), the recurrence becomes `dp[i] = min(max(dp[i-1], cost_to_i_from_i-1), max(dp[i-2], cost_to_i_from_i-2))` (tracking the WORST single jump seen so far along each candidate path, and trying to keep that worst value as small as possible) — a "minimize the maximum" (minimax) objective is a conceptually distinct optimization goal from "minimize the sum," and recognizing which one a problem is actually asking for (easy to misread under interview pressure, since both are phrased using similar-sounding words like "minimum cost") changes the entire recurrence structure needed.

## Interview Q&A

**Q1: Why is Frog Jump considered structurally identical to House Robber, despite having a completely different cover story and cost formula?**
Both problems share the identical underlying recurrence SHAPE: the optimal value at position `i` is computed by considering exactly two possible "ways to have just arrived here" (from `i-1` or from `i-2`), applying some per-transition adjustment specific to that problem (adding a house's value for House Robber, adding a jump's absolute height-difference cost for Frog Jump), and combining those two options with either a MAX (for value-maximization problems like House Robber) or a MIN (for cost-minimization problems like Frog Jump). Once this shared structural skeleton is recognized, the specific problem is really just "fill in this one blank differently" rather than requiring an entirely new algorithmic approach to be derived from scratch.

**Q2: Why does generalizing the frog's jump range from "1 or 2" to "up to K" change the space complexity of the optimized solution from O(1) to O(k), rather than keeping it at O(1)?**
The O(1) space trick works specifically because the recurrence, as originally stated, only ever needs to look back at exactly 2 previous positions to compute the current one — once computed, anything further back than 2 positions is provably never needed again. Generalizing to allow jumps of up to K stones means the recurrence must now consider K different possible previous positions (`i-1` through `i-k`) when computing `dp[i]` — meaning up to K previous values must remain available at any given point in the computation, requiring O(k) space (a sliding window of the last K values) rather than the fixed, constant O(1) that was only possible when exactly 2 previous values were ever relevant.

**Q3: How would the recurrence need to change if the goal were to minimize the MAXIMUM single jump cost along the entire path, rather than minimize the TOTAL (summed) cost of all jumps?**
Instead of accumulating costs additively (`dp[i] = dp[i-1] + current_jump_cost`), the recurrence would need to track, for each candidate path, the WORST (largest) single jump cost encountered so far along that specific path — using `max(dp[i-1], current_jump_cost)` to update this "worst-so-far" value as the path extends, rather than summing. The final optimization would then take the MINIMUM across all candidate paths' respective "worst single jump" values, correctly expressing "find the path whose single worst jump is as small as possible," which is a fundamentally different (minimax-style) objective from "find the path whose total summed cost is as small as possible" — despite both being plausibly described using the phrase "minimum cost" in casual problem wording.
