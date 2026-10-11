# Largest Rectangle in Histogram — Monotonic Stack

Simple words, step by step.

## The question
Given bar heights of a histogram (all bars have the same width, 1 unit), find the area of the **largest rectangle** that can be formed within the histogram's outline.

## Why this combines two earlier ideas
As flagged in file 72's Twist 1: for each bar, the biggest rectangle using that bar's height as the **limiting height** extends from just after its **previous smaller** bar to just before its **next smaller** bar. This problem is "compute Previous Smaller and Next Smaller for every bar, then use them to compute an area" — but the optimal solution finds both in a single pass, without actually building two separate stacks.

## Brute Force
For each bar, expand left and right as far as possible while the height stays `>=` the current bar.
```python
def largest_rectangle_brute(heights):
    n = len(heights)
    max_area = 0
    for i in range(n):
        left = i
        while left > 0 and heights[left - 1] >= heights[i]:
            left -= 1
        right = i
        while right < n - 1 and heights[right + 1] >= heights[i]:
            right += 1
        width = right - left + 1
        max_area = max(max_area, heights[i] * width)
    return max_area
```
**Speed**: O(n²) worst case (e.g., all bars the same height — every bar expands across the whole array).

## Optimal — Monotonic Increasing Stack, Single Pass
Keep a stack of indices with **increasing** heights. When a bar shorter than the stack's top appears, that's the signal the top bar's rectangle can't extend any further right — **pop it and compute its area immediately**, using the current index as its right boundary and the new stack top (after popping) as its left boundary.
```python
def largest_rectangle_optimal(heights):
    stack = []          # indices, heights kept increasing
    max_area = 0
    heights = heights + [0]   # sentinel: forces every remaining bar to be "closed out" at the end

    for i, h in enumerate(heights):
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            width = i if not stack else i - stack[-1] - 1
            max_area = max(max_area, height * width)
        stack.append(i)
    return max_area
```
```javascript
function largestRectangleOptimal(heights) {
    const stack = [];        // indices, heights kept increasing
    let maxArea = 0;
    const h = [...heights, 0];   // sentinel: forces every remaining bar to be "closed out" at the end

    for (let i = 0; i < h.length; i++) {
        while (stack.length > 0 && h[stack[stack.length - 1]] > h[i]) {
            const height = h[stack.pop()];
            const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
            maxArea = Math.max(maxArea, height * width);
        }
        stack.push(i);
    }
    return maxArea;
}
```
**Speed**: O(n) — the same amortized "each index pushed once, popped once" argument as every monotonic stack problem in this module.

**Watching it work** on `[2, 1, 5, 6, 2, 3]` (with sentinel `0` appended → `[2, 1, 5, 6, 2, 3, 0]`):
```
i=0 (h=2): stack empty -> push 0 -> stack=[0]
i=1 (h=1): heights[0]=2 > 1 -> pop 0. height=2, width=1 (stack empty, so width=i=1). area=2*1=2. max_area=2
           stack empty -> push 1 -> stack=[1]
i=2 (h=5): heights[1]=1 > 5? no -> push 2 -> stack=[1,2]
i=3 (h=6): heights[2]=5 > 6? no -> push 3 -> stack=[1,2,3]
i=4 (h=2): heights[3]=6>2 -> pop 3. height=6, width=4-2-1=1. area=6. max_area=6
           heights[2]=5>2 -> pop 2. height=5, width=4-1-1=2. area=10. max_area=10
           heights[1]=1>2? no -> push 4 -> stack=[1,4]
i=5 (h=3): heights[4]=2>3? no -> push 5 -> stack=[1,4,5]
i=6 (h=0): heights[5]=3>0 -> pop 5. height=3, width=6-4-1=1. area=3. max_area stays 10
           heights[4]=2>0 -> pop 4. height=2, width=6-1-1=4. area=8. max_area stays 10
           heights[1]=1>0 -> pop 1. height=1, width=6 (stack empty). area=6. max_area stays 10
Final: max_area = 10   (the rectangle using heights 5 and 6, width 2)
```

## Rules to remember
- **The sentinel `0` appended at the end is what guarantees every bar still on the stack gets "closed out" and its area computed** — without it, any bars remaining on the stack when the real array ends would never have their areas calculated, silently producing a wrong (too small) answer.
- **The width formula depends on whether the stack is empty after popping**: if empty, the popped bar's rectangle extends all the way from index 0 to the current index (`width = i`); if not empty, it extends from just after the new top to just before the current index (`width = i - stack[-1] - 1`). Mixing these two cases up is the most common bug in this problem.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Maximal Rectangle in a binary matrix (2D extension — a famous, genuinely harder follow-up)
Treat each row as the "base" of a histogram, where each cell's "height" is how many consecutive 1s are stacked above it (including itself) in that column, resetting to 0 wherever a 0 appears.
```python
def maximal_rectangle(matrix):
    if not matrix:
        return 0
    n_cols = len(matrix[0])
    heights = [0] * n_cols
    max_area = 0

    for row in matrix:
        for i in range(n_cols):
            heights[i] = heights[i] + 1 if row[i] == '1' else 0   # build this row's histogram
        max_area = max(max_area, largest_rectangle_optimal(heights))   # reuse this file's solution!

    return max_area
```
**The trap**: this is the clearest example in this whole course of **directly reusing a solved problem as a subroutine inside a new one** — recognizing "a binary matrix is just a sequence of histograms, one per row" is the entire insight; the actual rectangle-finding logic is simply the Largest Rectangle in Histogram solution, called once per row, with no modification needed.

## Interview Q&A

**Q1: Why does popping a bar from the stack mean "this bar's rectangle can't extend any further to the right"?**
Because the stack is maintained in increasing height order — if the current bar's height is smaller than the stack top's height, it means the current position is a boundary the stack-top bar's rectangle cannot cross (since a rectangle using the stack-top's height can only span positions where every bar is at least that tall). The moment a shorter bar appears, that's proof the stack-top's rectangle has found its right boundary, so its area can be finalized immediately.

**Q2: Why is the sentinel value (an appended 0) necessary, and what would happen without it?**
Without it, any bars still present on the stack when the input array is fully processed would never get their "pop and compute area" step triggered — since nothing shorter ever arrives to force them off the stack, their potential rectangles would simply never be considered, which could cause the algorithm to miss the actual maximum (for example, if the histogram is a single ever-increasing staircase, the biggest bar's own 1-wide rectangle would still need closing out).

**Q3: How does this problem's monotonic stack differ in spirit from the one used in Next Greater Element (file 71)?**
In Next Greater Element, the stack's purpose is to answer "what's the nearest bigger value" as a direct lookup for each element. Here, the stack's purpose is different: popping an element is the trigger to *finalize a computation* (the area for that bar) using both the newly-revealed left boundary (the new stack top) and the triggering right boundary (the current index) — the stack is less a "lookup structure" and more a mechanism for deciding exactly *when* enough information is available to compute something final.
