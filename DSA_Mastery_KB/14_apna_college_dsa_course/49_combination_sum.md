# Combination Sum — Backtracking

Simple words, step by step.

## The question
Given a list of distinct positive numbers and a target, find all unique combinations that add up to the target. **The same number can be reused multiple times** (this is the key twist that makes this different from Subsets/Permutations).

Example: `candidates = [2, 3, 6, 7]`, `target = 7` → `[[2,2,3], [7]]`.

## The backtracking idea
At each step, try including the current candidate (and **stay at the same index**, since reuse is allowed) or move on to the next candidate. Stop exploring a branch early if the running sum exceeds the target (**pruning**) — no point continuing down a path that's already too big.

```python
def combination_sum(candidates, target):
    result = []
    candidates.sort()                 # sorting enables early pruning (see below)

    def backtrack(start, remaining, path):
        if remaining == 0:
            result.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                break                    # PRUNE: sorted, so every candidate after this is even bigger -- stop
            path.append(candidates[i])                       # CHOOSE
            backtrack(i, remaining - candidates[i], path)      # EXPLORE -- note: "i", not "i+1" -- reuse allowed
            path.pop()                                         # UNCHOOSE

    backtrack(0, target, [])
    return result
```
```javascript
function combinationSum(candidates, target) {
    const result = [];
    candidates.sort((a, b) => a - b);    // sorting enables early pruning

    function backtrack(start, remaining, path) {
        if (remaining === 0) {
            result.push([...path]);
            return;
        }
        for (let i = start; i < candidates.length; i++) {
            if (candidates[i] > remaining) {
                break;                      // PRUNE: sorted, so every candidate after this is even bigger
            }
            path.push(candidates[i]);                           // CHOOSE
            backtrack(i, remaining - candidates[i], path);        // EXPLORE -- "i", not "i+1" -- reuse allowed
            path.pop();                                           // UNCHOOSE
        }
    }

    backtrack(0, target, []);
    return result;
}
```
**Speed**: worst case can be exponential (depends heavily on the target size and candidate values), but the sort-then-break pruning cuts off huge portions of the search early in practice. This is a clean example of **pruning making a brute-force search tree practically much faster**, without changing its theoretical worst case.

## Rules to remember
- **Passing `i` (not `i + 1`) into the recursive call is THE entire trick that allows reusing the same number.** This is the single most important line in the whole solution — get it wrong, and the algorithm either can't reuse numbers (becoming a different problem, Combination Sum II) or reuses them in a way that produces duplicate combinations.
- **Sorting first is what makes the `break` pruning valid** — without a sorted array, a bigger candidate could appear before a smaller one, and `break`ing early could skip over still-valid smaller candidates later in the unsorted list.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Combination Sum II -- each number can be used AT MOST ONCE, and the input may contain duplicates
```python
def combination_sum_ii(candidates, target):
    result = []
    candidates.sort()

    def backtrack(start, remaining, path):
        if remaining == 0:
            result.append(path[:])
            return
        for i in range(start, len(candidates)):
            if i > start and candidates[i] == candidates[i - 1]:
                continue                  # SKIP duplicate values at the SAME recursion depth
            if candidates[i] > remaining:
                break
            path.append(candidates[i])
            backtrack(i + 1, remaining - candidates[i], path)   # "i + 1" now -- no reuse allowed
            path.pop()

    backtrack(0, target, [])
    return result
```
**The trap**: this problem needs TWO separate anti-duplicate mechanisms at once — `i + 1` (instead of `i`) to prevent reusing the *same* array position twice, AND the `candidates[i] == candidates[i-1]` skip to prevent choosing two *different* positions that happen to hold the *same value* at the same branching point (which would generate the identical combination twice from different index paths). Confusing these two distinct duplicate-prevention needs is the most common bug on this exact follow-up.

### Twist 2: Combination Sum III -- use exactly k numbers from 1-9 (each at most once) that sum to target
```python
def combination_sum_iii(k, target):
    result = []

    def backtrack(start, remaining, path):
        if len(path) == k:
            if remaining == 0:
                result.append(path[:])
            return                        # stop either way -- path is already length k
        for i in range(start, 10):
            if i > remaining:
                break                       # pruning, same idea as before
            path.append(i)
            backtrack(i + 1, remaining - i, path)
            path.pop()

    backtrack(1, target, [])
    return result
```
**The trap**: this adds a SECOND stopping condition (`len(path) == k`) alongside the sum condition — candidates who only check `remaining == 0` (copying the original Combination Sum code without adjustment) will find combinations that sum correctly but use the wrong *number* of elements, since nothing in the original code constrained the combination's length.

### Twist 3: What if candidates can include NEGATIVE numbers?
The `if candidates[i] > remaining: break` pruning **completely breaks** if negative numbers are allowed — a negative candidate could still lead to a valid (even infinite, if reuse is allowed) solution after the point where this pruning would have stopped the search. This is why Combination Sum's constraints always specify "distinct **positive** integers" — the pruning trick fundamentally depends on all candidates being non-negative so that "sorted and too big" reliably means "every candidate after this is also too big."

## Tricky Interview Traps to Watch For
- **Reuse allowed (pass `i`) vs not allowed (pass `i + 1`)** is the single detail that distinguishes Combination Sum from Combination Sum II/III — always read the problem statement for this exact detail before writing a single line of code.
- **Pruning requires a sorted array and non-negative values** — don't add a `break`-based pruning optimization to a backtracking loop unless both of these conditions are actually guaranteed by the problem.
- **"Exactly k elements" vs "any number of elements"** changes whether you need an extra length check in your base case, as shown in Twist 2.
