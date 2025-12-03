# ⚔️ LeetCode 424: Longest Repeating Character Replacement

**Difficulty**: Medium
**Pattern**: Sliding Window

## 1. Problem Detail

You are given a string `s` and an integer `k`. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most `k` times.

Return the length of the longest substring containing the same letter you can get after performing the above operations.

**Example 1:**
```
Input: s = "ABAB", k = 2
Output: 4
Explanation: Replace the two 'A's with two 'B's or vice versa.
```

**Example 2:**
```
Input: s = "AABABBA", k = 1
Output: 4
Explanation: Replace the one 'A' in the middle with 'B' and form "AABBBBA".
The substring "BBBB" has the longest repeating letters, which is 4.
```

**Constraints:**
*   `1 <= s.length <= 10^5`
*   `s` consists of only uppercase English letters.
*   `0 <= k <= s.length`

---

## 2. Approach: Sliding Window

We want a window where **all characters are the same**.
But we are allowed `k` replacements.
This means: `WindowLength - Count(MostFrequentChar) <= k`.
If this condition holds, the window is valid (we can replace the rest to match the most frequent char).
If not, we must shrink the window.

1.  Expand `right`. Update frequency map.
2.  Update `max_f` (max frequency of any char in current window).
3.  Check condition: `(right - left + 1) - max_f > k`.
    *   If true (invalid), decrement count of `s[left]`, increment `left`.
4.  Update `max_len`.

*   **Time Complexity**: O(N)
*   **Space Complexity**: O(26) -> O(1)

---

## 3. Visualization

`s = "AABABBA", k = 1`

```mermaid
graph TD
    subgraph Step 1
    A1[Window: AAB] --> B1[Counts: {A:2, B:1}]
    B1 --> C1[MaxF: 2 (A)]
    C1 --> D1[Len: 3. Rep: 3-2=1 <= k]
    D1 --> E1[Valid. Max: 3]
    end
    
    subgraph Step 2
    A2[Window: AABA] --> B2[Counts: {A:3, B:1}]
    B2 --> C2[MaxF: 3 (A)]
    C2 --> D2[Len: 4. Rep: 4-3=1 <= k]
    D2 --> E2[Valid. Max: 4]
    end
    
    subgraph Step 3 (Invalid)
    A3[Window: AABAB] --> B3[Counts: {A:3, B:2}]
    B3 --> C3[MaxF: 3 (A)]
    C3 --> D3[Len: 5. Rep: 5-3=2 > k]
    D3 --> E3[INVALID! Shrink Left]
    end
```

**Trace:**

| Window | Counts | Max Freq | Replacements Needed | Valid? | Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `[A]` | A:1 | 1 | 0 | Yes | Expand |
| `[AA]` | A:2 | 2 | 0 | Yes | Expand |
| `[AAB]` | A:2, B:1 | 2 | 1 | Yes | Expand |
| `[AABA]` | A:3, B:1 | 3 | 1 | Yes | Expand |
| `[AABAB]` | A:3, B:2 | 3 | 2 | **No** | Shrink |
| `[ABAB]` | A:2, B:2 | 2 | 2 | **No** | Shrink |
| `[BAB]` | A:1, B:2 | 2 | 1 | Yes | Expand |

---

## 4. Solution

```python
def characterReplacement(s: str, k: int) -> int:
    count = {}
    res = 0
    l = 0
    max_f = 0
    
    for r in range(len(s)):
        count[s[r]] = count.get(s[r], 0) + 1
        max_f = max(max_f, count[s[r]])
        
        # Window length - max_freq > k means we need more than k replacements
        if (r - l + 1) - max_f > k:
            count[s[l]] -= 1
            l += 1
            
        res = max(res, r - l + 1)
        
    return res
```
