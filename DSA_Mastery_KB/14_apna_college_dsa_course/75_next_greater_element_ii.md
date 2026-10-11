# Next Greater Element II — Circular Array

Simple words, step by step.

## The question
Same as "Next Greater Element" (file 71), but the array is **circular** — after the last element, it wraps back to the first. Find the next greater element for every position, considering this wrap-around.

Example: `[1, 2, 1]` → `[2, -1, 2]` (the last `1` wraps around and finds `2` at index 0).

## The idea — simulate wrap-around without actually duplicating memory
Instead of physically doubling the array, conceptually loop through it **twice** using the modulo operator (`i % n`), while only recording results during a window that correctly reflects the wrap-around.

```python
def next_greater_ii(nums):
    n = len(nums)
    result = [-1] * n
    stack = []        # indices, values kept decreasing

    for i in range(2 * n - 1, -1, -1):     # go through the array twice, from the "end" backward
        idx = i % n
        while stack and nums[stack[-1]] <= nums[idx]:
            stack.pop()
        result[idx] = nums[stack[-1]] if stack else -1
        stack.append(idx)
    return result
```
```javascript
function nextGreaterII(nums) {
    const n = nums.length;
    const result = new Array(n).fill(-1);
    const stack = [];        // indices, values kept decreasing

    for (let i = 2 * n - 1; i >= 0; i--) {     // go through the array twice, from the "end" backward
        const idx = i % n;
        while (stack.length > 0 && nums[stack[stack.length - 1]] <= nums[idx]) {
            stack.pop();
        }
        result[idx] = stack.length > 0 ? nums[stack[stack.length - 1]] : -1;
        stack.push(idx);
    }
    return result;
}
```
**Speed**: O(n) time (2n iterations is still O(n), just with a constant factor of 2), O(n) space for the stack.

**Why the "process twice, backward" approach works**: because we scan from `2n-1` down to `0`, by the time we reach any real index `idx` (in the range `0` to `n-1`), the stack has already been "primed" with information from the conceptual second lap through the array — effectively letting elements near the end of the array "see" elements near the beginning, simulating the wrap-around, without ever allocating a second copy of the array.

## Rules to remember
- Looping `2 * n` times but only ever recording into `result[idx]` (where `idx = i % n`) is safe to do on **every** iteration here, unlike some circular-array variants — because `result` simply gets overwritten with the same (correct) final value by the time the "real" pass (indices `0` to `n-1`, i.e. the second half of the backward loop) completes. Some circular problems need a stricter "only record during the second half" rule (as flagged in file 71's Twist 2) — always verify which behavior a specific solution actually needs by tracing through a small example.
- This is the same monotonic-stack-with-modulo trick used in file 71's Twist 2 — Next Greater Element II is really that twist, promoted to be its own full lecture.

## Twisted Tricky Examples (with Solutions)

### Twist 1: What if the array has all identical elements?
`[5, 5, 5]` → every element's "next greater" should be `-1`, since nothing is ever strictly greater than `5` anywhere in the circular array.
```
Trace: stack uses "<=" for popping, so equal values get popped too (they can't be a valid "next GREATER" answer).
This means the stack never accumulates any value greater than 5, so every result stays -1. Correct!
```
**The trap**: using `<` instead of `<=` for the pop condition would incorrectly treat equal values as valid stack contents, which could cause a `5` to incorrectly report another `5` as its "next greater" — a subtle off-by-one-comparison bug that only manifests on inputs with duplicate values, easy to miss if testing only on all-distinct-value examples.

### Twist 2: Next SMALLER Element II (circular) — the natural counterpart
Flip the comparison direction, same as the non-circular version's left-to-right pairing in file 72:
```python
def next_smaller_ii(nums):
    n = len(nums)
    result = [-1] * n
    stack = []
    for i in range(2 * n - 1, -1, -1):
        idx = i % n
        while stack and nums[stack[-1]] >= nums[idx]:
            stack.pop()
        result[idx] = nums[stack[-1]] if stack else -1
        stack.append(idx)
    return result
```
**The trap**: this is purely a comparison-operator flip (`<=` becomes `>=`) on top of the exact same circular scanning skeleton — a good quick check of whether the "2x2 grid of monotonic stack variants" mental model from file 72 has actually been internalized, rather than each variant being memorized as an unrelated, separate algorithm.

## Interview Q&A

**Q1: Why does processing the array "twice" (2n iterations) correctly simulate circularity, without ever constructing an actual doubled array in memory?**
The `i % n` trick revisits each real index twice across the full 2n-iteration loop, and because the loop runs backward (from `2n-1` down to `0`), the *second* visit to each index (occurring in the first half of the iteration range, indices `n` to `2n-1`) happens *before* the "real," recorded visit (indices `0` to `n-1`). This means the stack has already absorbed information from a full extra lap by the time real results get written, which is exactly equivalent to having wrapped around the array once — all without allocating any extra array storage beyond the stack itself.

**Q2: What is the time complexity, and does doubling the loop range change the Big-O classification?**
Still O(n) — looping `2n` times instead of `n` times is a constant-factor difference (specifically, 2x), and Big-O notation by definition ignores constant factors. So despite visiting twice as many (conceptual) positions, the complexity class remains linear, not quadratic.
