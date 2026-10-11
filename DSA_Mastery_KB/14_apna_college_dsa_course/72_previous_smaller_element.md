# Previous Smaller Element — Monotonic Stack

Simple words, step by step.

## The question
For each element in an array, find the **nearest element to its left** that is smaller than it. If none exists, use `-1`.

Example: `[4, 5, 2, 10, 8]` → `[-1, 4, -1, 2, 2]`.

## The idea — the mirror image of file 71
This is the same monotonic stack mechanism as Next Greater Element, with two things flipped: scan **left-to-right** (since "previous" means "to the left"), and keep the stack in **increasing** order (since we want smaller elements as candidates, not greater ones).

```python
def previous_smaller(arr):
    n = len(arr)
    result = [-1] * n
    stack = []        # values kept in INCREASING order top-to-bottom

    for i in range(n):
        while stack and stack[-1] >= arr[i]:
            stack.pop()                    # not useful anymore -- arr[i] is smaller than it
        result[i] = stack[-1] if stack else -1
        stack.append(arr[i])
    return result
```
```javascript
function previousSmaller(arr) {
    const n = arr.length;
    const result = new Array(n).fill(-1);
    const stack = [];     // values kept in INCREASING order top-to-bottom

    for (let i = 0; i < n; i++) {
        while (stack.length > 0 && stack[stack.length - 1] >= arr[i]) {
            stack.pop();                     // not useful anymore -- arr[i] is smaller than it
        }
        result[i] = stack.length > 0 ? stack[stack.length - 1] : -1;
        stack.push(arr[i]);
    }
    return result;
}
```
**Speed**: O(n), same amortized reasoning as every monotonic stack problem in this module.

**Watching it work** on `[4, 5, 2, 10, 8]`:
```
i=0 (4):  stack empty -> result[0]=-1, push 4 -> stack=[4]
i=1 (5):  4>=5? no -> result[1]=4, push 5 -> stack=[4,5]
i=2 (2):  5>=2? pop 5. 4>=2? pop 4. stack empty -> result[2]=-1, push 2 -> stack=[2]
i=3 (10): 2>=10? no -> result[3]=2, push 10 -> stack=[2,10]
i=4 (8):  10>=8? pop 10. 2>=8? no -> result[4]=2, push 8 -> stack=[2,8]
Final: [-1, 4, -1, 2, 2]  (matches!)
```

## Rules to remember
- **The four-variant family**: Next Greater (scan right-to-left, decreasing stack), Next Smaller (scan right-to-left, increasing stack), Previous Greater (scan left-to-right, decreasing stack), Previous Smaller (scan left-to-right, increasing stack) — these are the same mechanism with "direction" and "which comparison to pop on" as the only two knobs. Memorizing this 2x2 grid of combinations is far more valuable than memorizing four separate pieces of code.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Largest Rectangle in Histogram actually needs BOTH "previous smaller" and "next smaller" simultaneously
This is the direct motivation for file 74 — for each bar, the maximum rectangle using that bar's height as the limiting height extends from just after its *previous smaller* element to just before its *next smaller* element. Seeing this problem as "Previous Smaller + Next Smaller, combined" before diving into file 74's code is the single most useful piece of setup intuition for that much harder problem.

### Twist 2: Sum of (element × its distance to the previous smaller element), across the whole array
```python
def sum_distance_to_previous_smaller(arr):
    n = len(arr)
    stack = []     # stores indices
    total = 0
    for i in range(n):
        while stack and arr[stack[-1]] >= arr[i]:
            stack.pop()
        prev_smaller_index = stack[-1] if stack else -1
        distance = i - prev_smaller_index
        total += arr[i] * distance
        stack.append(i)
    return total
```
**The trap**: this requires switching from storing values to storing **indices** (to compute distance), which is the same adaptation seen in file 71's Twist 1 — a strong signal that "store indices instead of values" is itself a reusable sub-skill across this whole monotonic-stack family, triggered whenever a problem needs *position* information, not just the comparison values themselves.

## Interview Q&A

**Q1: How does this problem relate to Next Greater Element (file 71), mechanically?**
It's the same monotonic stack technique, with the scan direction reversed (left-to-right instead of right-to-left, since "previous" looks backward rather than forward) and the stack's maintained order flipped (increasing instead of decreasing, since the goal is finding smaller elements rather than greater ones). Recognizing these as two knobs on one shared mechanism — rather than two unrelated algorithms — is the actual transferable skill this pair of files is meant to build.

**Q2: Why does the stack need to be kept in increasing order for "previous smaller," rather than decreasing?**
Because the stack represents "candidates that could still be the answer for some future (to-the-right) element." For "previous smaller," a candidate is only useful if it's smaller than whatever comes later — so once a bigger (or equal) value arrives, any stack-top value greater than or equal to it can never be a valid "previous smaller" answer for anything after this point, and gets safely discarded (popped).
