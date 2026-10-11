# Palindrome Partitioning — Backtracking

Simple words, step by step.

## The question
Given a string, split it into pieces such that **every piece is a palindrome** (reads the same forward and backward). Find all possible ways to do this.

Example: `"aab"` → `[["a","a","b"], ["aa","b"]]`.

## The backtracking idea
Starting from the beginning of the string, try every possible "first piece" (every prefix). If that prefix is a palindrome, keep it, and recursively solve the rest of the string the same way. If the prefix is not a palindrome, skip it — there's no point exploring further with an invalid piece.

```python
def partition(s):
    result = []

    def is_palindrome(sub):
        return sub == sub[::-1]

    def backtrack(start, path):
        if start == len(s):
            result.append(path[:])
            return
        for end in range(start + 1, len(s) + 1):
            piece = s[start:end]
            if is_palindrome(piece):
                path.append(piece)                 # CHOOSE
                backtrack(end, path)                 # EXPLORE
                path.pop()                            # UNCHOOSE

    backtrack(0, [])
    return result
```
```javascript
function partition(s) {
    const result = [];

    function isPalindrome(sub) {
        return sub === sub.split("").reverse().join("");
    }

    function backtrack(start, path) {
        if (start === s.length) {
            result.push([...path]);
            return;
        }
        for (let end = start + 1; end <= s.length; end++) {
            const piece = s.slice(start, end);
            if (isPalindrome(piece)) {
                path.push(piece);                      // CHOOSE
                backtrack(end, path);                    // EXPLORE
                path.pop();                               // UNCHOOSE
            }
        }
    }

    backtrack(0, []);
    return result;
}
```
**Speed**: worst case O(2^n × n) — in the absolute worst case (a string of all identical characters, like `"aaaa"`), nearly every possible split point produces a valid palindrome piece, so the recursion tree branches almost maximally (close to 2^n total partitions), and each palindrome check costs O(n).

**Watching it work** on `"aab"`:
```
start=0:
  try "a" (0-1): palindrome! -> recurse from start=1
    start=1: try "a" (1-2): palindrome! -> recurse from start=2
      start=2: try "b" (2-3): palindrome! -> recurse from start=3
        start=3 == len(s) -> SAVE ["a","a","b"]
    start=1: try "ab" (1-3): NOT a palindrome -- skip
  try "aa" (0-2): palindrome! -> recurse from start=2
    start=2: try "b" (2-3): palindrome! -> recurse from start=3
      start=3 == len(s) -> SAVE ["aa","b"]
  try "aab" (0-3): NOT a palindrome -- skip
Final: [["a","a","b"], ["aa","b"]]
```

## Rules to remember
- The for loop's `end` boundary tries **every possible length of piece starting at `start`**, one at a time — `start+1` (shortest, one character) up through `len(s)` (the whole remaining string). This "try every prefix length" shape is the key structural idea, different from the "include/exclude single elements" shape used in Subsets.
- Checking `is_palindrome` freshly for every candidate piece (O(n) per check) is simple but repeats work across recursive calls that re-check overlapping substrings. A common, worthwhile optimization is precomputing a 2D table of "is `s[i:j]` a palindrome?" using Dynamic Programming, so each check during backtracking becomes O(1).

## Twisted Tricky Examples (with Solutions)

### Twist 1: Minimum number of cuts needed (not ALL partitions, just the FEWEST pieces)
This changes the problem from "enumerate everything" (backtracking) to "find an optimum" (Dynamic Programming) — a very common twist pattern across this whole module.
```python
def min_cut(s):
    n = len(s)
    is_pal = [[False] * n for _ in range(n)]
    for i in range(n):
        is_pal[i][i] = True
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j] and (length == 2 or is_pal[i + 1][j - 1]):
                is_pal[i][j] = True

    dp = [0] * n              # dp[i] = min cuts needed for s[0:i+1]
    for i in range(n):
        if is_pal[0][i]:
            dp[i] = 0           # the whole prefix is already a palindrome -- 0 cuts needed
            continue
        dp[i] = i                # worst case: cut after every single character
        for j in range(1, i + 1):
            if is_pal[j][i]:
                dp[i] = min(dp[i], dp[j - 1] + 1)
    return dp[n - 1]
```
**The trap**: candidates sometimes try to adapt the backtracking solution to "just track the minimum path length found" by running the full enumeration and comparing lengths — this technically works but is drastically slower (still O(2^n)-ish) than the proper DP solution (O(n²)), because it still generates every single partition instead of directly computing the optimum.

### Twist 2: Palindrome Partitioning where pieces must have a MINIMUM length
Add one extra condition inside the `if is_palindrome(piece)` check: `if is_palindrome(piece) and len(piece) >= min_length`. **The trap**: this seems trivial, but it's easy to accidentally also require the minimum length in the base case check (`start == len(s)`), which is wrong — the base case should remain purely "did we consume the whole string," independent of individual piece lengths, since the per-piece constraint already gets enforced at the point each piece is chosen.

### Twist 3: Return just ONE valid partitioning (not all of them) — does backtracking still apply?
Yes, but you can short-circuit the search: return immediately on the first complete valid partition found, instead of continuing to explore other branches after a success.
```python
def partition_one(s):
    def is_palindrome(sub):
        return sub == sub[::-1]

    def backtrack(start, path):
        if start == len(s):
            return path[:]
        for end in range(start + 1, len(s) + 1):
            piece = s[start:end]
            if is_palindrome(piece):
                path.append(piece)
                found = backtrack(end, path)
                if found is not None:
                    return found          # SHORT-CIRCUIT -- stop searching once one answer is found
                path.pop()
    return backtrack(0, [])
```
**The trap**: forgetting to `path.pop()` in the failure case (when `found is None`) would leave stale data in `path` for the next sibling branch attempted — the unchoose step still matters even when short-circuiting, it just gets skipped on the one branch that actually succeeds.

## Tricky Interview Traps to Watch For
- **"Find all ways" (backtracking) vs "find the optimal/fewest" (Dynamic Programming)** — same underlying structure (palindrome pieces), completely different algorithm families depending on which is actually asked.
- Precomputing an `is_palindrome` lookup table turns a potentially slow, repeatedly-recomputed check into an O(1) lookup — worth mentioning as an optimization even for the enumerate-everything version.
