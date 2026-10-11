# House Robber II (Circular)

Simple words, step by step.

## The question
Same as House Robber (file 138), but now the houses are arranged in a **circle** — meaning the FIRST and LAST houses are also considered adjacent to each other.

## The idea: the first and last house can never BOTH be robbed — so split into two linear subproblems
Since robbing both the first and last house is forbidden (they're adjacent in the circle), the true optimal answer must fall into one of two mutually exclusive scenarios: (1) the first house is NOT robbed, or (2) the last house is NOT robbed. Running the plain linear House Robber algorithm (file 138) on each of these two scenarios (excluding one end each time) and taking the MAX of both results correctly covers every possibility.

```python
def house_robber_ii(nums):
    n = len(nums)
    if n == 1:
        return nums[0]
    if n == 2:
        return max(nums[0], nums[1])

    def rob_linear(houses):              # exact same function as file 138
        prev2, prev1 = 0, 0
        for value in houses:
            current = max(prev1, prev2 + value)
            prev2, prev1 = prev1, current
        return prev1

    return max(
        rob_linear(nums[:-1]),            # scenario 1: exclude the LAST house
        rob_linear(nums[1:])               # scenario 2: exclude the FIRST house
    )
```
```javascript
function houseRobberII(nums) {
    const n = nums.length;
    if (n === 1) return nums[0];
    if (n === 2) return Math.max(nums[0], nums[1]);

    function robLinear(houses) {               // exact same function as file 138
        let prev2 = 0, prev1 = 0;
        for (const value of houses) {
            const current = Math.max(prev1, prev2 + value);
            [prev2, prev1] = [prev1, current];
        }
        return prev1;
    }

    return Math.max(
        robLinear(nums.slice(0, -1)),            // scenario 1: exclude the LAST house
        robLinear(nums.slice(1))                   // scenario 2: exclude the FIRST house
    );
}
```
**Speed**: O(n) — running the O(n) linear algorithm exactly twice is still O(n) overall (constant factor of 2 doesn't change the asymptotic bound).

## Why considering ONLY these two scenarios is sufficient (not missing some third case)
Any valid robbing plan either robs the first house or doesn't. If it robs the first house, it definitely cannot also rob the last house (circular adjacency) — this situation is fully captured by "exclude the last house, solve linearly" (which still ALLOWS robbing the first house if that's optimal, it just never considers robbing the last one). If it doesn't rob the first house, then the last house is NOT constrained by the first house at all anymore, and this situation is captured by "exclude the first house, solve linearly" (which still allows robbing the last house if optimal). Together, these two scenarios exhaustively cover every valid robbing plan.

## Rules to remember
- **This is a direct, clean example of "reduce a harder problem to two instances of an already-solved easier problem."** Recognizing that the circular constraint's ENTIRE complexity boils down to just "the first and last can't both be chosen" — and that this can be handled by simply considering both single-exclusion scenarios and taking the max — avoids needing to invent any new DP recurrence at all; the entire linear solution from file 138 is reused completely unchanged.
- The base cases (`n == 1`, `n == 2`) need explicit handling since slicing `nums[:-1]` or `nums[1:]` on a very small array could otherwise produce an empty array or behave unexpectedly relative to the circular constraint's intent.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Houses arranged in a circle, but now you must determine the ACTUAL set of houses robbed (combining with file 138's Twist 2)
**The trap**: this requires running the path-reconstruction version of House Robber (file 138, Twist 2) on BOTH of the two linear sub-arrays, comparing their final optimal VALUES to determine which of the two scenarios actually produced the true maximum, and then reconstructing the path only from THAT winning scenario's full `dp` array — a direct combination of two already-individually-solved techniques (circular-to-linear reduction + path reconstruction), rather than a fundamentally new problem.

### Twist 2: A "circle" of exactly 3 houses — do both exclusion scenarios still make sense?
**The trap**: with exactly 3 houses arranged circularly, EVERY pair of houses is adjacent to each other (since in a 3-node cycle, every node is adjacent to both others) — meaning you can only ever rob AT MOST ONE house total in this specific edge case, regardless of which exclusion scenario is considered; both `rob_linear(nums[:-1])` and `rob_linear(nums[1:])` would correctly evaluate to "the single best value among the 2 houses being considered in that scenario" in this edge case, and taking the max of the two still correctly produces "the best single house value overall" — the general algorithm handles this edge case correctly without needing any special-casing, which is worth verifying explicitly as a sanity check rather than assuming it "just works."

## Interview Q&A

**Q1: Why is it sufficient to only consider two scenarios (exclude the first house, or exclude the last house), rather than needing to consider more complex combinations given the circular constraint?**
Because the ENTIRE additional complexity introduced by the circular arrangement, compared to the linear version, boils down to exactly one new constraint: the first and last houses cannot both be robbed. Every valid robbing plan necessarily falls into one of two mutually exclusive categories — plans that don't rob the first house, and plans that don't rob the last house (a plan robbing neither falls into both categories harmlessly, which doesn't cause any double-counting issue since we're taking a MAX, not summing) — and considering both categories via two separate linear subproblems, each with one endpoint simply removed from consideration entirely, exhaustively and correctly covers every possible valid robbing plan under the circular constraint.

**Q2: Why does excluding the last house (rather than literally forbidding robbing both ends simultaneously via some more complex constraint-tracking) correctly solve the "first and last can't both be robbed" requirement?**
Excluding the last house entirely from consideration in that specific scenario means the resulting subproblem is now a genuinely LINEAR House Robber problem, with no circular constraint left at all — within that scenario, robbing the first house is still completely allowed (if optimal), but robbing the last house is impossible simply because it's not part of the array being considered at all. This sidesteps the need for any more complex, explicit "track whether house 0 was robbed" state-tracking within a single combined algorithm — instead, the problem is cleanly split into two entirely independent, already-solved simpler problems, with the circular constraint handled implicitly through which houses are or aren't included in each sub-array.

**Q3: Why do the small base cases (n=1, n=2) need explicit separate handling, rather than letting the general two-scenario logic handle them automatically?**
For `n=1`, there's only one house, which trivially has no circular adjacency conflict with itself — the general slicing logic (`nums[:-1]` or `nums[1:]`) would produce an EMPTY array in at least one scenario, and reasoning through what "rob zero houses" versus "the single house's own value" should correctly evaluate to in that edge case requires explicit handling for clarity and correctness, rather than relying on the general algorithm's slicing behavior to coincidentally produce the right answer. For `n=2`, both houses are mutually adjacent in the circular interpretation (the "first" and "second" houses, being the only two, are also each other's "first and last") — meaning at most one can ever be robbed, a conclusion that's clearer and safer to state explicitly as a direct `max(nums[0], nums[1])` base case than to trust the general two-scenario slicing approach to handle correctly without careful verification.
