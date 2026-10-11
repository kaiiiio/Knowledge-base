# Trapping Rainwater — Two Pointers / Monotonic Stack

Simple words, step by step.

## The question
Given a histogram of wall heights, find how much water gets trapped between the walls after rain.

Example: `[0,1,0,2,1,0,1,3,2,1,2,1]` → `6` units of trapped water.

## The core idea
At any position, the water trapped there is limited by the **shorter** of the tallest wall to its left and the tallest wall to its right: `water[i] = min(max_left[i], max_right[i]) - height[i]` (if positive).

## Brute Force
For each position, scan left and right to find the tallest wall on each side.
```python
def trap_brute(height):
    n = len(height)
    total = 0
    for i in range(n):
        max_left = max(height[:i + 1])
        max_right = max(height[i:])
        total += min(max_left, max_right) - height[i]
    return total
```
**Speed**: O(n²) — scanning left and right for every single position.

## Better — Precompute max_left and max_right Arrays (Prefix/Suffix Pass)
Exactly the same prefix/suffix shape seen in file 15 (Product Except Self) and file 10's "max sum with one removal" twist.
```python
def trap_better(height):
    n = len(height)
    if n == 0:
        return 0
    max_left = [0] * n
    max_right = [0] * n

    max_left[0] = height[0]
    for i in range(1, n):
        max_left[i] = max(max_left[i - 1], height[i])

    max_right[n - 1] = height[n - 1]
    for i in range(n - 2, -1, -1):
        max_right[i] = max(max_right[i + 1], height[i])

    total = 0
    for i in range(n):
        total += min(max_left[i], max_right[i]) - height[i]
    return total
```
**Speed**: O(n) time, O(n) extra space for the two arrays.

## Optimal — Two Pointers (O(1) extra space)
Same two-pointer idea as Container With Most Water (file 14): start from both ends, and always move the pointer on the **shorter** side — because the water level at that side is already fully determined (bounded by the max seen so far on that side, since the other side is guaranteed to have an even taller wall somewhere).
```python
def trap_optimal(height):
    left, right = 0, len(height) - 1
    max_left = max_right = 0
    total = 0

    while left < right:
        if height[left] < height[right]:
            if height[left] >= max_left:
                max_left = height[left]       # new tallest wall on the left -- no water trapped here
            else:
                total += max_left - height[left]   # trapped water = gap below the tallest-so-far
            left += 1
        else:
            if height[right] >= max_right:
                max_right = height[right]
            else:
                total += max_right - height[right]
            right -= 1
    return total
```
```javascript
function trapOptimal(height) {
    let left = 0, right = height.length - 1;
    let maxLeft = 0, maxRight = 0;
    let total = 0;

    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= maxLeft) {
                maxLeft = height[left];          // new tallest wall on the left -- no water trapped here
            } else {
                total += maxLeft - height[left];  // trapped water = gap below the tallest-so-far
            }
            left++;
        } else {
            if (height[right] >= maxRight) {
                maxRight = height[right];
            } else {
                total += maxRight - height[right];
            }
            right--;
        }
    }
    return total;
}
```
**Speed**: O(n) time, O(1) extra space — the real win over the "Better" version, which needed O(n) space for its two arrays.

**Why moving the shorter side is safe**: when `height[left] < height[right]`, we know for certain that somewhere between `right` and the far end, there's a wall at least as tall as `height[right]` — which is itself taller than `height[left]`. So the water level directly above `left` is governed *only* by `max_left` (the tallest wall seen so far on the left side) — we don't need to know the exact `max_right` value yet, because we already know it's irrelevant (it's guaranteed to be at least `height[right]`, which already exceeds what matters for the left side's calculation).

## Rules to remember
- This is structurally the same two-pointer "move the weaker/shorter side" idea as Container With Most Water (file 14), applied to a harder, position-by-position accumulation instead of a single area calculation.
- The "Better" (prefix/suffix array) solution is a perfectly valid, complete answer — the two-pointer version is the follow-up "can you do it in O(1) space" optimization, not a requirement for a correct first pass.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Trapping Rain Water II — a 2D elevation map (a much harder, genuinely different problem)
Instead of a 1D histogram, you're given a 2D grid of heights, and water can flow in any of 4 directions. This requires a completely different technique: a **min-heap** starting from the boundary cells (water can always escape off the edges of the grid), processing cells in order of height, expanding inward — a form of "trapped water flows toward the lowest escape route" simulation. **The trap**: candidates sometimes try to naively extend the 1D two-pointer approach to 2D by applying it row-by-row and column-by-column separately — this does not correctly account for diagonal/combined boundary effects and gives wrong answers; the 2D version genuinely needs the heap-based approach, not an extension of the 1D trick.

### Twist 2: What's the TOTAL volume if this represented a 3D terrain made of unit cubes (heights could be very large)?
The same formula (`min(max_left, max_right) - height[i]`, summed) already computes total trapped *volume* correctly as long as heights represent actual physical units — no change to the algorithm is needed, only the interpretation of the answer changes from "area" (1-unit-wide bars) to "volume" if bars are also given a depth dimension that's uniform across the whole structure.

## Interview Q&A

**Q1: Why is moving the pointer with the SMALLER height always the safe, correct move?**
Because the side with the smaller current height already has enough information to finalize its water calculation — we know a wall at least as tall as the *other* side's current height exists somewhere further in, which already exceeds what the smaller side needs. Moving the taller side's pointer instead would risk using an unconfirmed assumption about what's further in on the smaller side, where the true limiting wall hasn't been fully determined yet.

**Q2: How does the two-pointer solution avoid needing the full `max_left`/`max_right` arrays from the "Better" solution?**
It computes `max_left` and `max_right` incrementally, as running values, exactly where they're needed — the key insight is that at any moment, you only ever need the running maximum of the side you're currently advancing, not the complete array of maximums for every position in both directions simultaneously. This mirrors the general pattern of converting a "precompute two full arrays" solution into an "track two running values instead" solution whenever only one side's information is needed at a time.

**Q3: What's the relationship between this problem and Container With Most Water?**
Both use the identical two-pointer mechanism (start from both ends, always move the shorter side) justified by the identical mathematical argument (moving the taller side can never help, since it's never the limiting factor). The difference is what each problem *does* with that mechanism: Container With Most Water computes one single best area across all possible pairs of walls, while Trapping Rainwater accumulates trapped water at every individual position along the way — same core two-pointer "engine," different bookkeeping on top of it.
