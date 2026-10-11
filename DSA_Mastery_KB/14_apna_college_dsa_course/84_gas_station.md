# Gas Station — Greedy

Simple words, step by step.

## The question
There are `n` gas stations in a circle. Station `i` has `gas[i]` fuel, and it costs `cost[i]` fuel to travel from station `i` to station `i+1`. Starting with an empty tank, find the starting station index from which you can complete a full circular trip — or determine it's impossible.

## The key fact that makes a greedy solution possible
**A valid starting point exists if and only if the total gas across all stations is at least the total cost.** If `sum(gas) < sum(cost)`, it's mathematically impossible no matter where you start — there simply isn't enough fuel in the whole system.

## Brute Force
Try every possible starting station, simulate the full trip.
```python
def can_complete_brute(gas, cost):
    n = len(gas)
    for start in range(n):
        tank = 0
        completed = True
        for i in range(n):
            idx = (start + i) % n
            tank += gas[idx] - cost[idx]
            if tank < 0:
                completed = False
                break
        if completed:
            return start
    return -1
```
**Speed**: O(n²) — for each of `n` possible starting points, an O(n) simulation.

## Optimal — Greedy, Single Pass
Walk through the stations once, tracking a running tank total. **If the tank ever goes negative starting from a candidate station, that candidate (and every station between the old candidate and here) cannot be the answer** — jump the candidate to the very next station and reset the tank to 0.
```python
def can_complete_optimal(gas, cost):
    total_tank = 0
    current_tank = 0
    start = 0

    for i in range(len(gas)):
        diff = gas[i] - cost[i]
        total_tank += diff
        current_tank += diff

        if current_tank < 0:
            start = i + 1          # this station (and everything tried since the last reset) failed
            current_tank = 0        # reset and try again from the next station

    return start if total_tank >= 0 else -1
```
```javascript
function canCompleteOptimal(gas, cost) {
    let totalTank = 0;
    let currentTank = 0;
    let start = 0;

    for (let i = 0; i < gas.length; i++) {
        const diff = gas[i] - cost[i];
        totalTank += diff;
        currentTank += diff;

        if (currentTank < 0) {
            start = i + 1;           // this station (and everything tried since the last reset) failed
            currentTank = 0;           // reset and try again from the next station
        }
    }

    return totalTank >= 0 ? start : -1;
}
```
**Speed**: O(n) — a single pass, no nested loop at all.

**Why this greedy approach is actually correct (the non-obvious part)**: if the tank goes negative while trying candidate `start`, it means **no station between `start` and the current index `i` could have been a valid starting point either** — because starting from any of those in-between stations would only make the available fuel *less* by the time you reach the failure point (you'd be starting with an even smaller head start than the original candidate had). So it's always safe to jump the candidate all the way past the failure point to `i + 1`, never losing a potentially-valid answer by skipping those in-between stations.

**Watching it work** on `gas = [1,2,3,4,5]`, `cost = [3,4,5,1,2]`:
```
i=0: diff=1-3=-2, total_tank=-2, current_tank=-2 -> negative! start=1, current_tank=0
i=1: diff=2-4=-2, total_tank=-4, current_tank=-2 -> negative! start=2, current_tank=0
i=2: diff=3-5=-2, total_tank=-6, current_tank=-2 -> negative! start=3, current_tank=0
i=3: diff=4-1=3,  total_tank=-3, current_tank=3  -> fine, keep going
i=4: diff=5-2=3,  total_tank=0,  current_tank=6  -> fine
Loop ends. total_tank=0 >= 0 -> answer: start=3  (station index 3 is a valid starting point)
```

## Rules to remember
- **Check `total_tank >= 0` at the very end, not during the loop** — a negative `current_tank` mid-loop only tells you the *current candidate* has failed, not that the whole problem is unsolvable; only the final total (summed across the entire circle) determines true feasibility.
- This is a genuinely different algorithm family from this module's monotonic stack/deque problems — **Greedy** means making a locally-optimal choice (reset and move the candidate forward) that's provably globally correct, without needing to backtrack or re-examine discarded options, which is a distinct kind of correctness argument from "maintain an invariant in a stack."

## Twisted Tricky Examples (with Solutions)

### Twist 1: What if MULTIPLE valid starting stations exist — does this algorithm find all of them, or just one?
This algorithm finds **exactly one** valid starting point (if the problem is feasible). A lesser-known but provable fact: **if a solution exists at all, it is unique** — there cannot be two different valid starting stations for the same circular trip (if there were, you could show a contradiction using similar reasoning to why intermediate stations during a failed attempt can't be valid either). So "find all solutions" isn't actually a meaningful extension of this problem — there's at most one answer to find.

### Twist 2: Linear (non-circular) version — just find if ANY contiguous starting point can finish without going negative, given a fixed end point (not a full circle)
This simplifies even further — it becomes a direct question of whether a single running-sum ever dips below the starting value, closely related to the "maximum subarray"-style running-total reasoning from Kadane's Algorithm (file 10) — recognizing the shared "running total, reset on failure" skeleton across both problems, despite their surface-level differences, is a valuable pattern-matching skill.

## Interview Q&A

**Q1: Why does a negative current_tank at station `i` let you safely skip ALL stations between the old `start` and `i`, rather than just moving to `start + 1`?**
If starting from `start` leads to a negative tank by the time you reach `i`, then starting from any intermediate station `j` (where `start < j < i`) would mean you begin your trip with *zero* accumulated surplus from stations before `j` — you'd be in an equal or worse position than starting from `start`, since `start`'s attempt already had whatever surplus existed from `start` to `j` and *still* went negative by `i`. Therefore none of those intermediate stations could possibly succeed either, and it's safe to jump straight past all of them to `i + 1`.

**Q2: Why is checking `sum(gas) >= sum(cost)` both necessary AND sufficient for a solution to exist, rather than just a quick necessary pre-check?**
It's necessary because if total gas is less than total cost, there's categorically not enough fuel across the whole circular trip, regardless of starting point. It's also provably sufficient — this is the non-trivial, genuinely important part — because the greedy algorithm's correctness argument guarantees that if a total surplus exists, the exact single-pass process described above is mathematically guaranteed to land on a valid starting point. This "necessary AND sufficient" property is what justifies using the final `total_tank` check as the complete answer to feasibility, with no further verification needed.

**Q3: Why is this classified as a Greedy algorithm rather than Dynamic Programming, given that both involve "optimal substructure"-like reasoning?**
Greedy algorithms commit to a locally-best choice at each step and never revisit or reconsider that choice — here, once a candidate `start` is abandoned due to going negative, it's permanently discarded, with no need to ever re-examine it under different circumstances. Dynamic Programming, by contrast, typically explores and compares multiple overlapping possibilities, storing and reusing sub-results. The fact that this problem's greedy choice can be mathematically proven correct *without* needing to compare it against alternative choices is exactly what qualifies it as Greedy rather than DP.
