# Aggressive Cows Problem — Binary Search on the Answer (Maximize the Minimum)

Simple words, step by step.

## The question
You have stalls at given positions along a line, and `c` cows to place in them (one cow per stall, at most). Place the cows to **maximize the minimum distance** between any two cows.

Example: stalls at `[1, 2, 4, 8, 9]`, `c = 3` cows. The best placement is stalls `1, 4, 9`, giving a minimum gap of `3` (between 1-4 and 4-9) — no other placement of 3 cows can achieve a bigger minimum gap.

## Why this flips the direction from Book Allocation
Book Allocation and Painter's Partition **minimize a maximum**. This problem **maximizes a minimum** — a mirror-image goal. The "Binary Search on the Answer" skeleton is identical, but the feasibility check and the direction we move `low`/`high` are flipped.

## The feasibility check
*"Can we place all `c` cows such that every pair of adjacent cows is at least `min_dist` apart?"*
```python
def can_place_cows(stalls, c, min_dist):
    count = 1                     # place the first cow at the first stall
    last_position = stalls[0]
    for i in range(1, len(stalls)):
        if stalls[i] - last_position >= min_dist:
            count += 1
            last_position = stalls[i]
            if count >= c:
                return True
    return count >= c
```
```javascript
function canPlaceCows(stalls, c, minDist) {
    let count = 1;                  // place the first cow at the first stall
    let lastPosition = stalls[0];
    for (let i = 1; i < stalls.length; i++) {
        if (stalls[i] - lastPosition >= minDist) {
            count++;
            lastPosition = stalls[i];
            if (count >= c) {
                return true;
            }
        }
    }
    return count >= c;
}
```
**Important**: `stalls` must be **sorted first** — the greedy "place a cow as soon as the gap is big enough" logic only works left-to-right on sorted positions.

## The full solution
```python
def max_min_distance(stalls, c):
    stalls.sort()
    low, high = 1, stalls[-1] - stalls[0]     # smallest possible gap, largest possible gap
    result = 0
    while low <= high:
        mid = low + (high - low) // 2
        if can_place_cows(stalls, c, mid):
            result = mid            # this gap works -- remember it, try for something even BIGGER
            low = mid + 1
        else:
            high = mid - 1          # this gap is too big -- try something smaller
    return result
```
```javascript
function maxMinDistance(stalls, c) {
    stalls.sort((a, b) => a - b);
    let low = 1, high = stalls[stalls.length - 1] - stalls[0];
    let result = 0;
    while (low <= high) {
        const mid = low + Math.floor((high - low) / 2);
        if (canPlaceCows(stalls, c, mid)) {
            result = mid;             // this gap works -- remember it, try for something even BIGGER
            low = mid + 1;
        } else {
            high = mid - 1;           // this gap is too big -- try something smaller
        }
    }
    return result;
}
```
**Speed**: O(n log(max position)) — same style of complexity as Book Allocation, with sorting added (O(n log n)) if the stalls aren't already sorted.

**Watching it work** on `[1, 2, 4, 8, 9]`, `c = 3`:
```
low=1, high=8: mid=4 -> can we place 3 cows with gap >= 4? Try: 1, then 4 is only +3 (skip),
  8 is +7 from 1 (place, count=2), 9 is +1 from 8 (skip) -> only 2 cows placed -> FALSE -> high=3

low=1, high=3: mid=2 -> place 1 (count=1), 4 is +3>=2 (place, count=2), 8 is +4>=2 (place, count=3)
  -> 3 cows placed -> TRUE -> result=2, low=3

low=3, high=3: mid=3 -> place 1 (count=1), 4 is +3>=3 (place, count=2), 8 is +4>=3 (place, count=3)
  -> TRUE -> result=3, low=4

low=4, high=3: loop ends -> answer: 3  (matches the expected answer!)
```

## Rules to remember
- Notice the direction flip compared to Book Allocation: here, when the feasibility check succeeds, we push `low = mid + 1` to search for something **bigger** (because we want to *maximize*). In Book Allocation, a successful check pushed `high = mid - 1` to search for something **smaller** (because that one wanted to *minimize*). Mixing these two directions up is the single most common mistake when solving "Binary Search on the Answer" problems.
- The stalls array **must be sorted first** — this is easy to forget since the previous two problems (Book Allocation, Painter's Partition) didn't need their input pre-sorted (order didn't matter there, since boards/books are placed in whatever order they're given).

## Interview Q&A

**Q1: What's the general rule for which direction to move `low`/`high` after a successful feasibility check?**
If the problem asks to **minimize** something (like Book Allocation's max-pages), a successful check means "try for something smaller" — move `high` down. If the problem asks to **maximize** something (like this problem's min-distance), a successful check means "try for something bigger" — move `low` up. Getting this backwards is the most common bug in this entire pattern.

**Q2: Why must the stalls be sorted, when Book Allocation didn't need to sort its input?**
The feasibility check here relies on walking through stall positions left to right and greedily placing a cow whenever the gap since the last placed cow is big enough — that greedy logic is only correct if positions are visited in increasing order. Book Allocation's feasibility check sums up contiguous groups in whatever order the boards/books are given — the boards' *order* is part of the problem's constraint (a painter's assigned boards must be contiguous *in the given order*), so there's nothing to sort there.

**Q3: How would you explain, out loud, why binary search even applies to this "maximize the minimum" framing?**
The feasibility check ("can we achieve at least this minimum gap?") is monotonic in the opposite direction from Book Allocation: if gap `g` is achievable, every *smaller* gap is also achievable (looser constraint, easier to satisfy); if gap `g` is *not* achievable, every *larger* gap is also not achievable. That "true, true, true, ..., false, false, false" shape (as the candidate gap increases) is still a clean boundary a binary search can find — we just want the rightmost `true` instead of the leftmost, which is exactly why the search direction flips.
