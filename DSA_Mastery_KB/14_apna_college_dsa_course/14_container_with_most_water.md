# Container With Most Water

Simple words, step by step.

> Full version already in `13_leetcode_pattern_playbook/01_arrays_two_pointers_sliding_window.md` — this is the short version for this course's lecture order.

## The question
You have vertical lines of different heights standing in a row. Pick two lines that, together with the ground between them, hold the most water. Find the biggest amount of water possible.

## Brute Force
Check every possible pair of lines.
```python
def max_water_brute(height):
    n = len(height)
    best = 0
    for i in range(n):
        for j in range(i + 1, n):
            area = min(height[i], height[j]) * (j - i)    # shorter wall * width between them
            best = max(best, area)
    return best
```
```javascript
function maxWaterBrute(height) {
    const n = height.length;
    let best = 0;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const area = Math.min(height[i], height[j]) * (j - i);   // shorter wall * width between them
            best = Math.max(best, area);
        }
    }
    return best;
}
```
**Speed**: O(n²) — checking every pair takes a long time when there are many lines.

## Optimal — Two Pointers
Start with one pointer at the far left line, one pointer at the far right line — this is the widest possible container to begin with. Always move the pointer standing at the **shorter** line, one step inward.
```python
def max_water_optimal(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        width = right - left
        area = min(height[left], height[right]) * width
        best = max(best, area)
        if height[left] < height[right]:
            left += 1     # the left wall is shorter -- try moving it to find something taller
        else:
            right -= 1    # the right wall is shorter (or equal) -- move it instead
    return best
```
```javascript
function maxWaterOptimal(height) {
    let left = 0, right = height.length - 1;
    let best = 0;
    while (left < right) {
        const width = right - left;
        const area = Math.min(height[left], height[right]) * width;
        best = Math.max(best, area);
        if (height[left] < height[right]) {
            left++;       // the left wall is shorter -- try moving it to find something taller
        } else {
            right--;      // the right wall is shorter (or equal) -- move it instead
        }
    }
    return best;
}
```
**Speed**: O(n) — one walk, with the two pointers moving toward each other.

**Why move the shorter side, and never the taller one**: the water level is always limited by the shorter of the two lines. If you move the taller line inward, the container only gets narrower, and the shorter line is still the limit — so the area can never improve. But moving the shorter line has a real chance of finding a taller line, which could raise the water level. That is why moving the shorter side is always the smart move, and moving the taller side is never worth trying.

## Rules to remember
- The area formula is `min(height[left], height[right]) * width` — always the **shorter** height, because water spills over the shorter wall.
- This only works with two pointers starting from both ends and moving inward — starting from the middle and moving outward does not give the same guarantee.

## More Topics Like This (harder wording, for extra reading)
- **Trapping Rain Water** — a related but harder problem: instead of picking just two lines, water gets trapped between *every* pair of walls across the whole row, and the amount at each position depends on the shorter of the tallest wall to its left and right.
