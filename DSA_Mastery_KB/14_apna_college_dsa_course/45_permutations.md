# Permutations of an Array/String

Simple words, step by step.

## The question
Given a list of distinct numbers (or a string of distinct characters), print every possible **ordering** of them. `[1,2,3]` has 6 permutations: `[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]`.

## How this is different from Subsets (the previous file)
Subsets asked "include or exclude each element?" — **order didn't matter**, and the length of each subset varied. Permutations asks "in what **order** can I arrange ALL the elements?" — every permutation uses **all** elements, and the *order* is the whole point.

## The backtracking idea
At each step, try placing **every unused element** next in the current arrangement (not just a yes/no choice like Subsets). Once an element is placed, mark it "used" so it can't be placed again in this same arrangement — then explore, then unmark it (backtrack) before trying the next unused element.
```python
def permute(nums):
    result = []
    used = [False] * len(nums)

    def backtrack(current):
        if len(current) == len(nums):
            result.append(current[:])
            return

        for i in range(len(nums)):
            if used[i]:
                continue                    # this element is already placed in the current arrangement
            used[i] = True                  # CHOOSE
            current.append(nums[i])
            backtrack(current)               # EXPLORE
            current.pop()                    # UNCHOOSE
            used[i] = False

    backtrack([])
    return result
```
```javascript
function permute(nums) {
    const result = [];
    const used = new Array(nums.length).fill(false);

    function backtrack(current) {
        if (current.length === nums.length) {
            result.push([...current]);
            return;
        }

        for (let i = 0; i < nums.length; i++) {
            if (used[i]) {
                continue;                     // this element is already placed in the current arrangement
            }
            used[i] = true;                   // CHOOSE
            current.push(nums[i]);
            backtrack(current);                // EXPLORE
            current.pop();                     // UNCHOOSE
            used[i] = false;
        }
    }

    backtrack([]);
    return result;
}
```
**Speed**: O(n! × n) time — there are `n!` permutations, and building/copying each one costs O(n). Space: O(n) for the recursion depth and the `used` array (not counting the space to store all `n!` results).

**Watching the recursion tree grow** for `[1, 2]`:
```
backtrack([])
  place 1: backtrack([1])
    place 2 (1 used): backtrack([1,2]) -> save [1,2]
  place 2: backtrack([2])
    place 1 (2 used): backtrack([2,1]) -> save [2,1]
Final: [1,2], [2,1]  -- both 2! = 2 permutations found
```

## Rules to remember
- The `used` array is what prevents an element from being placed twice in the same arrangement — Subsets didn't need this, because each element only ever got one binary choice (include/exclude), never a chance to be "reused."
- `n!` grows extremely fast — permutations of just 10 elements is already 3,628,800. This is another inherently exponential-class problem (technically factorial, which grows even faster than 2^n), same category as Subsets: the cost isn't a sign of a bad algorithm, it's the true size of the answer.
- If the input has **duplicate values** (e.g., `[1,1,2]`), this exact code will produce duplicate permutations in the output — an extra "skip if this value was already tried at this position" check (usually requiring the array to be sorted first) is needed to avoid that, a very common interview follow-up.

## Interview Q&A

**Q1: Why does Permutations need a `used` array, while Subsets did not?**
Because a permutation must use every element exactly once, in some order — at every recursive step, you must choose from among the elements *not yet placed*. Subsets only ever asks a yes/no question about each element independently; there's no notion of "already used elsewhere in this branch" to track.

**Q2: How would you modify this code to avoid duplicate permutations when the input array has repeated values?**
Sort the array first, then in the loop, skip a candidate value if it equals the previous value in the array **and** the previous occurrence is not currently used (`i > 0 and nums[i] == nums[i-1] and not used[i-1]`). This ensures that among equal values, they're only tried in their original relative order at each branching point, which eliminates duplicate branches that would otherwise produce identical-looking permutations.

**Q3: What is the time complexity, and why is the extra "× n" factor there (not just O(n!))?**
There are `n!` distinct permutations to generate, and each one takes O(n) time just to construct and copy into the results list (since a permutation itself is an array of length n) — so the true total work is O(n! × n), even though people often shorthand it as "O(n!)" in casual conversation.

**Q4: How is generating permutations related to generating subsets, at a conceptual level?**
Both are instances of the same backtracking skeleton — choose, explore, unchoose — applied to a different "what are my options at this step?" question. Subsets asks a binary include/exclude question per element (giving 2^n outcomes); Permutations asks "which unused element goes here?" at every position (giving n! outcomes). Recognizing that both share the identical choose-explore-unchoose scaffolding, just with a different branching rule, is exactly the pattern-recognition skill this whole backtracking module is meant to build.
