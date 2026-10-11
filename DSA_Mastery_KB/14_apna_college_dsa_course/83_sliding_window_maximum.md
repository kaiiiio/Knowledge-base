# Sliding Window Maximum — Monotonic Deque

Simple words, step by step.

## The question
Given an array and a window size `k`, find the maximum value in every window of size `k` as it slides from left to right across the array.

Example: `[1,3,-1,-3,5,3,6,7]`, `k=3` → `[3,3,5,5,6,7]`.

## Brute Force
For every window position, scan all `k` elements to find the max.
```python
def sliding_max_brute(nums, k):
    result = []
    for i in range(len(nums) - k + 1):
        result.append(max(nums[i:i + k]))
    return result
```
**Speed**: O(n × k) — for each of roughly `n` window positions, an O(k) scan.

## Optimal — Monotonic Deque
Keep a deque (double-ended queue) of **indices**, maintained so that the values at those indices are in **decreasing** order from front to back. The front of the deque is always the current window's maximum.

**Two things must be maintained on every step**:
1. Remove indices from the **front** that have fallen out of the current window (too old).
2. Remove indices from the **back** whose values are smaller than the incoming value (they can never be the max again, since the new, later value is both bigger and more recent — strictly more useful going forward).

```python
from collections import deque

def sliding_max_optimal(nums, k):
    dq = deque()      # stores indices, values kept decreasing front-to-back
    result = []

    for i, num in enumerate(nums):
        # Remove indices that have slid out of the window
        if dq and dq[0] <= i - k:
            dq.popleft()

        # Remove indices whose values are smaller than the current one -- they're now useless
        while dq and nums[dq[-1]] < num:
            dq.pop()

        dq.append(i)

        if i >= k - 1:
            result.append(nums[dq[0]])     # front of deque = max of current window
    return result
```
```javascript
function slidingMaxOptimal(nums, k) {
    const dq = [];        // stores indices, values kept decreasing front-to-back
    const result = [];

    for (let i = 0; i < nums.length; i++) {
        // Remove indices that have slid out of the window
        if (dq.length > 0 && dq[0] <= i - k) {
            dq.shift();
        }

        // Remove indices whose values are smaller than the current one -- they're now useless
        while (dq.length > 0 && nums[dq[dq.length - 1]] < nums[i]) {
            dq.pop();
        }

        dq.push(i);

        if (i >= k - 1) {
            result.push(nums[dq[0]]);        // front of deque = max of current window
        }
    }
    return result;
}
```
**Speed**: O(n) — the same amortized argument as every monotonic structure in this module: each index is pushed once and popped (from either end) at most once total, across the entire run.

**Watching it work** on `[1,3,-1,-3,5,3,6,7]`, `k=3`:
```
i=0 (1):  dq=[0]
i=1 (3):  nums[0]=1<3 -> pop 0. dq=[1]
i=2 (-1): nums[1]=3<-1? no -> dq=[1,2]
          i>=k-1=2 -> window [1,3,-1], max=nums[dq[0]]=nums[1]=3. result=[3]
i=3 (-3): dq[0]=1<=3-3=0? no -- wait 1<=0 is false -> don't pop front
          nums[2]=-1<-3? no -> dq=[1,2,3]
          window [3,-1,-3], max=nums[1]=3. result=[3,3]
i=4 (5):  dq[0]=1<=4-3=1? yes -> pop front 1. dq=[2,3]
          nums[3]=-3<5 -> pop 3. nums[2]=-1<5 -> pop 2. dq=[] -> dq=[4]
          window [-1,-3,5], max=nums[4]=5. result=[3,3,5]
i=5 (3):  dq[0]=4<=5-3=2? no -> nums[4]=5<3? no -> dq=[4,5]
          window [-3,5,3], max=nums[4]=5. result=[3,3,5,5]
i=6 (6):  dq[0]=4<=6-3=3? no -> nums[5]=3<6 -> pop 5. nums[4]=5<6 -> pop 4. dq=[6]
          window [5,3,6], max=nums[6]=6. result=[3,3,5,5,6]
i=7 (7):  dq[0]=6<=7-3=4? no -> nums[6]=6<7 -> pop 6. dq=[7]
          window [3,6,7], max=nums[7]=7. result=[3,3,5,5,6,7]
Final: [3,3,5,5,6,7]  (matches!)
```

## Rules to remember
- **Storing indices (not values) is essential here** — the front-removal check (`dq[0] <= i - k`) needs to know *position* to determine if an index has aged out of the window; values alone carry no positional information.
- This is the queue-based cousin of the monotonic *stack* problems earlier in this module (Next Greater Element, Stock Span, etc.) — the key new ingredient is removing from **both ends**, which is exactly why a deque (not a plain stack or plain queue) is required.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Sliding Window Minimum (the mirror image)
Just flip the comparison direction, keeping the deque values **increasing** instead of decreasing:
```python
while dq and nums[dq[-1]] > num:
    dq.pop()
```
**The trap**: this is a pure comparison-flip, same pattern as the Next Greater/Smaller Element pairing — a quick check of whether the monotonic-deque mechanism was understood as one adaptable idea rather than memorized as a single fixed algorithm.

### Twist 2: Sliding Window Median (a significantly harder follow-up)
Finding the *median* (not max/min) of every window cannot be solved with a simple monotonic deque, because median requires knowing the *relative rank* of every element in the window, not just the extreme value. This typically needs a different structure entirely — two heaps (a max-heap for the lower half, a min-heap for the upper half), with careful removal logic for elements sliding out of the window (requiring "lazy deletion," since heaps don't support efficient arbitrary removal). **The trap**: candidates sometimes assume "sliding window + need an aggregate value" always means "adapt the monotonic deque" — recognizing when a different aggregate (median, rather than max/min) requires an entirely different toolset is an important distinction.

## Interview Q&A

**Q1: Why must the deque remove smaller values from the back when a new, larger value arrives?**
Because once a bigger value appears later in the array, any earlier, smaller value in the deque can **never** become the maximum of any future window that still contains the new, bigger value — and since the new value is also more recent (will stay in the window longer), the smaller, older value is strictly dominated and useless to keep around. Discarding it permanently doesn't lose any correctness, because it could never win a future comparison.

**Q2: Why is it correct that the front of the deque is always the current window's maximum, without needing to scan the whole deque?**
Because the deque is maintained in strictly decreasing order from front to back — this invariant is actively preserved by the back-removal step on every insertion. Given that invariant, the largest remaining value in the deque must always be at the front, by construction, without any additional scanning needed.

**Q3: What is the time complexity, and why does the nested popping (both front removal and back removal within the same loop) not make this O(n²)?**
It's O(n) overall. Each index is pushed onto the deque exactly once, and can be removed (from either the front or the back) at most once in its entire lifetime — so even though a single iteration's while loop *could* pop many elements, the total number of removals across the *entire* algorithm's run cannot exceed the total number of pushes, which is `n`. This bounds the total work to O(n), the same amortized argument used throughout every monotonic stack/deque problem in this module.
