# ⚔️ LeetCode 5: Longest Palindromic Substring

**Difficulty**: Medium
**Pattern**: Expand Around Center

## 1. Problem Detail

Given a string `s`, return the longest palindromic substring in `s`.

**Example 1:**
```
Input: s = "babad"
Output: "bab"
Explanation: "aba" is also a valid answer.
```

**Example 2:**
```
Input: s = "cbbd"
Output: "bb"
```

**Constraints:**
*   `1 <= s.length <= 1000`
*   `s` consist of only digits and English letters.

---

## 2. Approach: Expand Around Center

A palindrome mirrors around its center.
*   For odd length palindromes (e.g., "aba"), the center is a character (`b`).
*   For even length palindromes (e.g., "abba"), the center is between two characters (`b` and `b`).

For a string of length `N`, there are `N` single-character centers and `N-1` between-character centers. Total `2N - 1` centers.

Algorithm:
1.  Iterate through each index `i` from `0` to `N-1`.
2.  **Odd Expansion**: `left = i`, `right = i`. Expand while `s[left] == s[right]`.
3.  **Even Expansion**: `left = i`, `right = i + 1`. Expand while `s[left] == s[right]`.
4.  Keep track of the longest palindrome found.

*   **Time Complexity**: O(N^2) - Expanding takes O(N), and we do it for each of the 2N-1 centers.
*   **Space Complexity**: O(1)

---

## 3. Visualization

`s = "babad"`

```mermaid
graph TD
    subgraph Center i=1 ('a')
    A1[Odd Expansion] --> B1[L=1, R=1 ('a'=='a')]
    B1 --> C1[Expand: L=0, R=2 ('b'=='b')]
    C1 --> D1[Expand: L=-1, R=3 (Out of bounds)]
    D1 --> E1[Found: 'bab', Len: 3]
    
    A2[Even Expansion] --> B2[L=1, R=2 ('a'!='b')]
    B2 --> C2[Stop]
    end
```

**Trace:**

| Center Index | Type | Start L, R | Expansion Steps | Result | Max So Far |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 0 ('b') | Odd | 0, 0 | `b` (Match) -> `? b ?` (Fail) | "b" | "b" |
| 0 ('b') | Even | 0, 1 | `b` vs `a` (Fail) | "" | "b" |
| 1 ('a') | Odd | 1, 1 | `a` (Match) -> `b a b` (Match) | "bab" | **"bab"** |
| 1 ('a') | Even | 1, 2 | `a` vs `b` (Fail) | "" | "bab" |
| ... | ... | ... | ... | ... | ... |

---

## 4. Solution

```python
def longestPalindrome(s: str) -> str:
    res = ""
    resLen = 0
    
    for i in range(len(s)):
        # Odd length expansion
        l, r = i, i
        while l >= 0 and r < len(s) and s[l] == s[r]:
            if (r - l + 1) > resLen:
                res = s[l:r+1]
                resLen = r - l + 1
            l -= 1
            r += 1
            
        # Even length expansion
        l, r = i, i + 1
        while l >= 0 and r < len(s) and s[l] == s[r]:
            if (r - l + 1) > resLen:
                res = s[l:r+1]
                resLen = r - l + 1
            l -= 1
            r += 1
            
    return res
```

---

## 5. Variations

### Variation 1: Palindromic Substrings (LeetCode 647)

#### Problem Detail
Given a string `s`, return the number of palindromic substrings in it.
A substring is a contiguous sequence of characters within the string.

#### Approach: Expand Around Center (Count)
Exactly the same logic as finding the longest one.
Instead of updating `max_len`, we simply increment a `count` variable every time we successfully match `s[left] == s[right]`.

*   **Time**: O(N^2)
*   **Space**: O(1)

#### Visualization
`s = "abc"`
*   Center 'a' (Odd): "a" (Count=1)
*   Center 'b' (Odd): "b" (Count=2)
*   Center 'c' (Odd): "c" (Count=3)
Total: 3.

`s = "aaa"`
*   Center 0 (Odd): "a" (1)
*   Center 0 (Even): "aa" (2)
*   Center 1 (Odd): "a" (3), "aaa" (4)
*   Center 1 (Even): "aa" (5)
*   Center 2 (Odd): "a" (6)
Total: 6.

#### Solution
```python
def countSubstrings(s: str) -> int:
    count = 0
    
    for i in range(len(s)):
        # Odd
        l, r = i, i
        while l >= 0 and r < len(s) and s[l] == s[r]:
            count += 1
            l -= 1
            r += 1
            
        # Even
        l, r = i, i + 1
        while l >= 0 and r < len(s) and s[l] == s[r]:
            count += 1
            l -= 1
            r += 1
            
    return count
```
