# Majority Element (Moore's Voting Algorithm) + Pair Sum

Simple words, step by step.

## Part 1: Majority Element

### The question
Given a list of numbers, find the value that appears **more than half the time**. (The question guarantees this value always exists.)

Example: `[2, 2, 1, 1, 1, 2, 2]` → `2` appears 4 times out of 7, which is more than half, so `2` is the answer.

### Brute Force
For every number, count how many times it appears, and check if that count is more than half the list.
```python
def majority_brute(arr):
    n = len(arr)
    for num in arr:
        count = arr.count(num)   # scans the WHOLE list again, every single time -- slow
        if count > n // 2:
            return num
    return -1
```
```javascript
function majorityBrute(arr) {
    const n = arr.length;
    for (const num of arr) {
        const count = arr.filter(x => x === num).length;   // scans the WHOLE array again -- slow
        if (count > Math.floor(n / 2)) {
            return num;
        }
    }
    return -1;
}
```
**Speed**: for every number, we scan the whole list again to count it — roughly O(n²).

### Better (using a hash map to count)
Count every number's appearances in one pass using a hash map, then check which one is over half.
```python
def majority_better(arr):
    n = len(arr)
    counts = {}
    for num in arr:
        counts[num] = counts.get(num, 0) + 1   # bump this number's count by 1
        if counts[num] > n // 2:
            return num
    return -1
```
```javascript
function majorityBetter(arr) {
    const n = arr.length;
    const counts = new Map();
    for (const num of arr) {
        counts.set(num, (counts.get(num) || 0) + 1);   // bump this number's count by 1
        if (counts.get(num) > Math.floor(n / 2)) {
            return num;
        }
    }
    return -1;
}
```
**Speed**: O(n) time, but uses extra memory (O(n)) for the hash map.

### Optimal — Moore's Voting Algorithm
Keep a "current candidate" and a "count." Walk through the list once:
- If count is 0, pick the current number as the new candidate.
- If the next number matches the candidate, add 1 to count.
- If it does not match, subtract 1 from count.

```python
def majority_optimal(arr):
    candidate = None
    count = 0
    for num in arr:
        if count == 0:
            candidate = num          # no strong candidate right now -- pick this one
        if num == candidate:
            count += 1                # this number "votes for" the candidate
        else:
            count -= 1                # this number "votes against" the candidate
    return candidate
```
```javascript
function majorityOptimal(arr) {
    let candidate = null;
    let count = 0;
    for (const num of arr) {
        if (count === 0) {
            candidate = num;          // no strong candidate right now -- pick this one
        }
        if (num === candidate) {
            count++;                   // this number "votes for" the candidate
        } else {
            count--;                   // this number "votes against" the candidate
        }
    }
    return candidate;
}
```
**Speed**: O(n) time, and only O(1) extra memory — no hash map needed.

**Why this works (in plain words)**: think of it like a tug of war. The real majority element shows up so many times that even after every "vote against it" from other numbers, it can never fully lose. Every non-majority number can cancel out at most one appearance of the majority number, but since the majority number appears more than half the time, there simply aren't enough "votes against" to cancel it out completely.

**Watching it work** on `[2, 2, 1, 1, 1, 2, 2]`:
```
2: count=0 -> candidate=2, count=1
2: matches -> count=2
1: no match -> count=1
1: no match -> count=0
1: count=0 -> candidate=1, count=1
2: no match -> count=0
2: count=0 -> candidate=2, count=1
final candidate: 2  (correct!)
```

## Part 2: Pair Sum (a quick recap, full version in Two Sum)

### The question
Given a list and a target number, find two numbers that add up to the target.

### Optimal (hash map)
```python
def pair_sum(arr, target):
    seen = set()
    for num in arr:
        needed = target - num       # what other number would complete the pair?
        if needed in seen:
            return (needed, num)
        seen.add(num)
    return None
```
```javascript
function pairSum(arr, target) {
    const seen = new Set();
    for (const num of arr) {
        const needed = target - num;   // what other number would complete the pair?
        if (seen.has(needed)) {
            return [needed, num];
        }
        seen.add(num);
    }
    return null;
}
```
**Speed**: O(n) — one walk through the list, using a hash set to remember what we've already seen.

## Rules to remember
- Moore's Voting Algorithm only works correctly if a majority element is **guaranteed to exist**. If the list might not have one, you must do a second pass afterward to actually confirm the candidate appears more than half the time.
- Pair Sum's hash-set trick only finds **one** pair; a slightly different version is needed if you must find **all** pairs (then duplicates and repeated values need extra care).

## More Topics Like This (harder wording, for extra reading)
- **Majority Element II (find all elements appearing more than n/3 times)** — extends Moore's Voting to track two candidates and two counters at once.
- See `13_leetcode_pattern_playbook/01_arrays_two_pointers_sliding_window.md` for the full Two Sum writeup, including the Brute → Better → Optimal progression.

## Twisted Tricky Examples (with Solutions)

### Twist 1: No majority element actually exists -- does Moore's Voting silently lie to you?
`[1, 2, 3, 4]` — no value appears more than half the time. Run the algorithm anyway:
```
1: count=0 -> candidate=1, count=1
2: no match -> count=0
3: count=0 -> candidate=3, count=1
4: no match -> count=0
final candidate: 4 (but 4 only appears ONCE -- WRONG if treated as "the" majority!)
```
**The trap**: Moore's Voting Algorithm will happily return *some* candidate even when no true majority exists — it never "fails" on its own. **You must always do a second verification pass** afterward (count the candidate's actual occurrences and check `count > n // 2`) before trusting the result, unless the problem explicitly guarantees a majority element exists.
```python
def majority_safe(arr):
    candidate = majority_optimal(arr)     # from the main lesson above
    if arr.count(candidate) > len(arr) // 2:
        return candidate
    return -1   # no true majority element
```

### Twist 2: Majority Element II — find all elements appearing MORE THAN n/3 times
Key insight: **at most 2** such elements can exist (if 3 elements each appeared more than n/3 times, together they'd need more than `n` total slots — impossible). So track **two** candidates and **two** counters instead of one.
```python
def majority_element_ii(nums):
    cand1 = cand2 = None
    count1 = count2 = 0
    for num in nums:
        if cand1 == num:
            count1 += 1
        elif cand2 == num:
            count2 += 1
        elif count1 == 0:
            cand1, count1 = num, 1
        elif count2 == 0:
            cand2, count2 = num, 1
        else:
            count1 -= 1
            count2 -= 1

    result = []
    for c in (cand1, cand2):
        if c is not None and nums.count(c) > len(nums) // 3:
            result.append(c)
    return result
```
```javascript
function majorityElementII(nums) {
    let cand1 = null, cand2 = null;
    let count1 = 0, count2 = 0;
    for (const num of nums) {
        if (cand1 === num) {
            count1++;
        } else if (cand2 === num) {
            count2++;
        } else if (count1 === 0) {
            cand1 = num; count1 = 1;
        } else if (count2 === 0) {
            cand2 = num; count2 = 1;
        } else {
            count1--; count2--;
        }
    }

    const result = [];
    for (const c of [cand1, cand2]) {
        if (c !== null && nums.filter(x => x === c).length > Math.floor(nums.length / 3)) {
            result.push(c);
        }
    }
    return result;
}
```
**The trap**: the order of the `if/elif` checks matters a lot — you must check "does this match an EXISTING candidate" before checking "is a counter at zero" — otherwise a value could incorrectly knock out a valid running candidate.

### Twist 3: Pair Sum, but find ALL pairs (not just one), with no duplicate pairs in the output
`[1, 5, 7, -1, 5]`, target `6` → pairs: `(1,5)` and `(7,-1)` — but `5` appears twice, so naive code might return `(1,5)` twice.
```python
def all_pair_sums(arr, target):
    seen = {}       # value -> how many times we've seen it so far
    result = []
    for num in arr:
        needed = target - num
        if seen.get(needed, 0) > 0:
            result.append((needed, num))
            seen[needed] -= 1          # "use up" one occurrence so it can't be reused incorrectly
        else:
            seen[num] = seen.get(num, 0) + 1
    return result
```
**The trap**: a plain `set` (like the single-pair version) can't tell you "how many times" a value is available — using a `set` here would let the same `5` be matched against multiple different partners incorrectly if it only appears once. A `dict`/`Map` that counts occurrences, and is decremented on use, is required once you need *all* pairs instead of just one.

### Twist 4: Pair Sum on a SORTED array where you need the pair closest to (not exactly equal to) the target
```python
def closest_pair_sum(arr, target):
    arr.sort()
    left, right = 0, len(arr) - 1
    best_pair = (arr[0], arr[1])
    best_diff = float('inf')
    while left < right:
        current_sum = arr[left] + arr[right]
        diff = abs(current_sum - target)
        if diff < best_diff:
            best_diff = diff
            best_pair = (arr[left], arr[right])
        if current_sum < target:
            left += 1
        elif current_sum > target:
            right -= 1
        else:
            return (arr[left], arr[right])   # exact match -- can't get closer than 0
    return best_pair
```
**The trap**: this looks like plain Two Sum, but a hash map does NOT help here — "closest to target" needs to explore the sum landscape in a controlled, monotonic way, which only the two-pointer approach (on a sorted array) naturally gives you. A hash map can tell you "does this exact value exist," not "what's the nearest sum I can form."

## Tricky Interview Traps to Watch For
- **Always ask: "is a majority element GUARANTEED to exist?"** If not, add the verification pass (Twist 1) — forgetting this is the #1 way candidates lose points on this exact problem.
- **"Find one pair" vs "find all pairs" vs "find the closest pair"** are three genuinely different problems wearing the same name — identify which one is actually being asked before picking hash-set, hash-map-with-counts, or two-pointer-on-sorted-array.
- **Moore's Voting generalizes to "more than n/k times" for any k** — you track `k-1` candidates and `k-1` counters, by the same pigeonhole-style reasoning used in Twist 2 above (at most `k-1` elements can each exceed `1/k` of the total).
