# ⚔️ LeetCode 76: Minimum Window Substring

**Difficulty**: Hard
**Pattern**: Sliding Window

## 1. Problem Detail

Given two strings `s` and `t` of lengths `m` and `n` respectively, return the **minimum window substring** of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `""`.

The testcases will be generated such that the answer is unique.

**Example 1:**
```
Input: s = "ADOBECODEBANC", t = "ABC"
Output: "BANC"
Explanation: The minimum window substring "BANC" includes 'A', 'B', and 'C' from string t.
```

**Example 2:**
```
Input: s = "a", t = "a"
Output: "a"
```

**Example 3:**
```
Input: s = "a", t = "aa"
Output: ""
Explanation: Both 'a's from t must be included in the window.
Since the largest window of s only has one 'a', return empty string.
```

**Constraints:**
*   `m == s.length`, `n == t.length`
*   `1 <= m, n <= 10^5`
*   `s` and `t` consist of uppercase and lowercase English letters.

---

## 2. Approach: Sliding Window

We need to find the smallest window in `s` that contains all characters of `t` with the required frequencies.

1.  **Frequency Map**: Count characters in `t`. This is our "Need".
2.  **Sliding Window**: Expand `right` pointer to include characters.
3.  **Have vs Need**:
    *   Maintain a `window` count map.
    *   Maintain a variable `have` which counts how many unique characters have met the required frequency in `t`.
    *   `need` is the number of unique characters in `t`.
4.  **Shrink**:
    *   When `have == need`, the current window is valid.
    *   Try to shrink from `left` to minimize the window size.
    *   Update global minimum if current window is smaller.
    *   If removing `s[left]` makes the window invalid (count drops below required), decrement `have`.

*   **Time Complexity**: O(N)
*   **Space Complexity**: O(52) -> O(1) (Upper and Lower case English letters).

---

## 3. Visualization

`s = "ADOBECODEBANC", t = "ABC"`
Need: `{A:1, B:1, C:1}`. Need Count = 3.

```mermaid
graph TD
    subgraph Step 1 (Expand)
    A1[Window: ADOBEC] --> B1[Have: A, B, C (3/3)]
    B1 --> C1[Valid! Len: 6]
    C1 --> D1[Shrink L...]
    end
    
    subgraph Step 2 (Shrink)
    A2[Remove A] --> B2[Window: DOBEC]
    B2 --> C2[Have: B, C (2/3)]
    C2 --> D2[Invalid. Stop Shrink.]
    D2 --> E2[Expand R...]
    end
    
    subgraph Step 3 (Found Best)
    A3[Window: BANC] --> B3[Have: A, B, C (3/3)]
    B3 --> C3[Valid! Len: 4]
    C3 --> D3[New Min: BANC]
    end
```

**Trace:**

| Window | Have/Need | Valid? | Action | Min Window |
| :--- | :--- | :--- | :--- | :--- |
| `[ADOBEC]` | 3/3 | Yes | Update Min (6), Shrink | "ADOBEC" |
| `[DOBEC]` | 2/3 (Lost A) | No | Expand | "ADOBEC" |
| `[DOBECODEBA]` | 3/3 (Found A) | Yes | Update Min (10 - worse), Shrink | "ADOBEC" |
| ... | ... | ... | ... | ... |
| `[BANC]` | 3/3 | Yes | Update Min (4), Shrink | **"BANC"** |

---

## 4. Solution

```python
def minWindow(s: str, t: str) -> str:
    if t == "": return ""
    
    countT, window = {}, {}
    for c in t:
        countT[c] = countT.get(c, 0) + 1
        
    have, need = 0, len(countT)
    res, resLen = [-1, -1], float("inf")
    l = 0
    
    for r in range(len(s)):
        c = s[r]
        window[c] = window.get(c, 0) + 1
        
        if c in countT and window[c] == countT[c]:
            have += 1
            
        while have == need:
            # update result
            if (r - l + 1) < resLen:
                res = [l, r]
                resLen = (r - l + 1)
            
            # pop from left of window
            window[s[l]] -= 1
            if s[l] in countT and window[s[l]] < countT[s[l]]:
                have -= 1
            l += 1
            
    l, r = res
    return s[l:r+1] if resLen != float("inf") else ""
```
