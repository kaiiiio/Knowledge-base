# Next Greater Element — Monotonic Stack

Simple words, step by step.

## The question
For each element in an array, find the **next element to its right** that is greater than it. If none exists, use `-1`.

Example: `[4, 5, 2, 10, 8]` → `[5, 10, 10, -1, -1]`.

## Brute Force
```python
def next_greater_brute(arr):
    n = len(arr)
    result = [-1] * n
    for i in range(n):
        for j in range(i + 1, n):
            if arr[j] > arr[i]:
                result[i] = arr[j]
                break
    return result
```
```javascript
function nextGreaterBrute(arr) {
    const n = arr.length;
    const result = new Array(n).fill(-1);
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (arr[j] > arr[i]) {
                result[i] = arr[j];
                break;
            }
        }
    }
    return result;
}
```
**Speed**: O(n²) worst case.

## Optimal — Monotonic Stack, Scanning Right-to-Left
Walk the array from right to left, keeping a stack that stores candidates for "next greater element," maintained in **decreasing** order from bottom to top. For each element, pop everything smaller or equal to it (those can never be a "next greater" for anything earlier) — whatever remains on top (if anything) is the answer for the current element.
```python
def next_greater_optimal(arr):
    n = len(arr)
    result = [-1] * n
    stack = []       # values that COULD be a "next greater" for something to their left

    for i in range(n - 1, -1, -1):
        while stack and stack[-1] <= arr[i]:
            stack.pop()                    # not useful anymore -- arr[i] is bigger than it
        result[i] = stack[-1] if stack else -1
        stack.append(arr[i])
    return result
```
```javascript
function nextGreaterOptimal(arr) {
    const n = arr.length;
    const result = new Array(n).fill(-1);
    const stack = [];     // values that COULD be a "next greater" for something to their left

    for (let i = n - 1; i >= 0; i--) {
        while (stack.length > 0 && stack[stack.length - 1] <= arr[i]) {
            stack.pop();                     // not useful anymore -- arr[i] is bigger than it
        }
        result[i] = stack.length > 0 ? stack[stack.length - 1] : -1;
        stack.push(arr[i]);
    }
    return result;
}
```
**Speed**: O(n) — same amortized argument as file 70: every value is pushed once and popped at most once across the entire run.

**Watching it work** on `[4, 5, 2, 10, 8]`, scanning right to left:
```
i=4 (8):  stack empty -> result[4]=-1, push 8 -> stack=[8]
i=3 (10): 8<=10? pop 8. stack empty -> result[3]=-1, push 10 -> stack=[10]
i=2 (2):  10<=2? no -> result[2]=10, push 2 -> stack=[10,2]
i=1 (5):  2<=5? pop 2. 10<=5? no -> result[1]=10, push 5 -> stack=[10,5]
i=0 (4):  5<=4? no -> result[0]=5, push 4 -> stack=[10,5,4]
Final: [5, 10, 10, -1, -1]  (matches!)
```

## Rules to remember
- **Scanning right-to-left is the natural direction** for "next greater to the RIGHT" — by the time you process index `i`, the stack already holds exactly the useful candidates from everything to its right.
- This same monotonic-stack skeleton solves "next SMALLER element" by just flipping the comparison (`stack[-1] >= arr[i]` instead of `<=`), and solves "PREVIOUS greater/smaller element" by scanning left-to-right instead — four closely related problems, one reusable mechanism.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Next Greater Element, but return the INDEX, not the value
```python
def next_greater_index(arr):
    n = len(arr)
    result = [-1] * n
    stack = []        # stores INDICES this time
    for i in range(n - 1, -1, -1):
        while stack and arr[stack[-1]] <= arr[i]:
            stack.pop()
        result[i] = stack[-1] if stack else -1
        stack.append(i)
    return result
```
**The trap**: switching from storing values to storing indices means every comparison must now look up `arr[stack[-1]]` instead of comparing `stack[-1]` directly — forgetting this and comparing raw indices against values is a quick, easy mistake.

### Twist 2: Next Greater Element in a CIRCULAR array (the array wraps around)
```python
def next_greater_circular(arr):
    n = len(arr)
    result = [-1] * n
    stack = []
    for i in range(2 * n - 1, -1, -1):     # process the array TWICE, conceptually
        idx = i % n
        while stack and stack[-1] <= arr[idx]:
            stack.pop()
        if i < n:                            # only record results during the SECOND pass
            result[idx] = stack[-1] if stack else -1
        stack.append(arr[idx])
    return result
```
**The trap**: processing the array conceptually twice (`2n` iterations using `i % n`) lets elements near the end "see" elements near the beginning as if the array wrapped around — but you must only **record results** during the final `n` iterations (the "real" pass), not the first `n` (the "warm-up" pass that primes the stack with wrap-around candidates) — recording during both passes produces incorrect results from the warm-up pass being overwritten or mixed in.

## Interview Q&A

**Q1: Why does scanning right-to-left (instead of left-to-right) make this problem naturally solvable with a single monotonic stack pass?**
"Next greater to the right" is fundamentally about what comes *after* the current element. Scanning from the right means that by the time you reach any index `i`, the stack already contains the processed, relevant information about everything to its right — no separate second pass or lookahead is needed, because the "future" (relative to the original left-to-right array order) has already been fully processed.

**Q2: How would you adapt this exact mechanism to find the PREVIOUS smaller element instead?**
Scan left-to-right instead of right-to-left (since "previous" means "to the left"), and flip the comparison to pop values that are greater-than-or-equal-to the current element (keeping the stack in increasing order), since you now want the stack to retain candidates that are smaller than the current element. The core mechanism — pop until the top satisfies the desired relationship, record it as the answer, then push — stays identical; only the scan direction and comparison direction change.

**Q3: Why can't a simple nested loop checking "is this the next greater" from the brute force ever be improved to better than O(n) in the worst case for a single arbitrary query, yet the full-array version achieves O(n) overall?**
A single isolated query genuinely can require scanning forward until a greater element is found — there's no way around that for one query in isolation. But when solving for *every* index at once, the monotonic stack reuses work across queries: once an element has been "resolved" (popped because something greater was found), it never needs to be reconsidered again for any other index. This amortization — spreading the total cost across all `n` elements rather than paying the worst case independently for each one — is what brings the *overall* complexity down to O(n), even though any single element's "real" distance to its next greater element could itself be O(n).
