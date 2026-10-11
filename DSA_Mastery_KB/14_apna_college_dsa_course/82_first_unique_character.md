# First Unique Character in a String

Simple words, step by step.

## The question
Given a string, find the index of the first character that does **not** repeat anywhere else in the string. If every character repeats, return `-1`.

Example: `"leetcode"` → `0` (the character `'l'` appears only once, and it's the earliest such character).

## Brute Force
For each character, scan the whole string to count its occurrences.
```python
def first_unique_brute(s):
    for i, char in enumerate(s):
        if s.count(char) == 1:
            return i
    return -1
```
```javascript
function firstUniqueBrute(s) {
    for (let i = 0; i < s.length; i++) {
        const count = s.split("").filter(c => c === s[i]).length;
        if (count === 1) {
            return i;
        }
    }
    return -1;
}
```
**Speed**: O(n²) — for each character, re-scanning the whole string to count it.

## Optimal — Count Frequencies First, Then Scan Once
Count every character's total frequency in one pass (using a hash map), then scan the string again — the first character whose count is exactly 1 is the answer.
```python
def first_unique_optimal(s):
    counts = {}
    for char in s:
        counts[char] = counts.get(char, 0) + 1

    for i, char in enumerate(s):
        if counts[char] == 1:
            return i
    return -1
```
```javascript
function firstUniqueOptimal(s) {
    const counts = new Map();
    for (const char of s) {
        counts.set(char, (counts.get(char) || 0) + 1);
    }

    for (let i = 0; i < s.length; i++) {
        if (counts.get(s[i]) === 1) {
            return i;
        }
    }
    return -1;
}
```
**Speed**: O(n) time (two separate O(n) passes, not nested), O(1) extra space if the character set is bounded (e.g., only lowercase English letters means at most 26 entries in the hash map, regardless of string length).

## Rules to remember
- **This is the exact same "hash map turns a hidden O(n²) into O(n)" trick** that appears throughout this course (Two Sum, Majority Element, and many others) — the frequency-counting pre-pass is the reusable idea; recognizing it quickly is more valuable than memorizing this specific problem.
- Counting first, then scanning again, is a cleaner two-pass structure than trying to cleverly determine uniqueness in one single combined pass — don't over-engineer a one-pass solution when a clear two-pass one is just as fast and easier to get right.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Find the first character that appears EXACTLY k times (a direct generalization)
```python
def first_character_appearing_k_times(s, k):
    counts = {}
    for char in s:
        counts[char] = counts.get(char, 0) + 1
    for i, char in enumerate(s):
        if counts[char] == k:
            return i
    return -1
```
**The trap**: this is a one-line change (`== 1` becomes `== k`) from the original — a good test of whether the underlying "count first, scan again" pattern was actually understood, versus the specific number `1` being hardcoded into the thinking.

### Twist 2: Find the first NON-repeating character in a STREAM of characters (characters arrive one at a time, and you must answer "what's the first unique character so far?" after each new arrival)
```python
from collections import deque

class FirstUniqueInStream:
    def __init__(self):
        self.counts = {}
        self.queue = deque()      # candidates, in order of arrival, that MIGHT still be unique

    def add_char(self, char):
        self.counts[char] = self.counts.get(char, 0) + 1
        self.queue.append(char)
        self._clean_front()

    def _clean_front(self):
        while self.queue and self.counts[self.queue[0]] > 1:
            self.queue.popleft()       # this one is no longer unique -- discard it from consideration

    def first_unique(self):
        return self.queue[0] if self.queue else None
```
**The trap**: this is a genuinely different problem from the static-string version — you can't just re-run the two-pass solution after every new character (that would be O(n²) overall, re-scanning from scratch each time). The queue-based approach lazily removes characters from the "candidate" queue only when they're discovered to be duplicated, amortizing the cleanup cost across the whole stream, similar in spirit to the amortized reasoning used in file 81's two-stack queue.

## Interview Q&A

**Q1: Why does counting frequencies first, then scanning again, beat the brute-force approach's complexity?**
The brute force re-counts each character's frequency from scratch, for every single character in the string, leading to O(n) work repeated n times, an O(n²) total. Precomputing all frequencies in a single pass means each character's count is looked up in O(1) during the second scan, so the total work becomes O(n) + O(n) = O(n), avoiding all of the brute force's redundant re-counting.

**Q2: Why is this problem's space complexity often described as O(1) despite using a hash map that seems to grow with input size?**
If the character set is bounded (for example, only lowercase English letters, so at most 26 possible distinct characters), the hash map can never hold more than a fixed, constant number of entries, regardless of how long the input string is — so the space used doesn't actually grow with `n`, technically qualifying as O(1) "with respect to the bounded alphabet," even though it would become O(k) (where k is the alphabet size) in a more general, unbounded-character-set scenario.

**Q3: How does the streaming variant (Twist 2) avoid becoming O(n²) overall, given that it must answer a query after every single new character?**
Instead of re-scanning the whole stream from the beginning after every new character, it maintains a queue of "still possibly unique" candidates, and only removes a candidate from the front once it's been confirmed to have a duplicate — each character can only ever be removed from the queue once in its entire lifetime, bounding the total cleanup work across the *entire* stream (not per-query) to O(n), giving amortized O(1) per query on top of the O(1) per-character update cost.
