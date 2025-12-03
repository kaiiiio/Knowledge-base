# ⚔️ LeetCode 3: Longest Substring Without Repeating Characters

**Difficulty**: Medium
**Pattern**: Sliding Window

## 1. Problem Detail

Given a string `s`, find the length of the **longest substring** without repeating characters.

**Example 1:**
```
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
```

**Example 2:**
```
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
```

**Example 3:**
```
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.
```

**Constraints:**
*   `0 <= s.length <= 5 * 10^4`
*   `s` consists of English letters, digits, symbols and spaces.

---

## 2. Approach: Sliding Window

We use a "Sliding Window" defined by two pointers `left` and `right`.
We also use a **Set** (or Hash Map) to keep track of characters currently in the window.

1.  Initialize `left = 0`, `max_len = 0`, `char_set = set()`.
2.  Iterate with `right` from `0` to `n-1`.
3.  If `s[right]` is **not** in `char_set`:
    *   Add `s[right]` to `char_set`.
    *   Update `max_len = max(max_len, right - left + 1)`.
4.  If `s[right]` **is** in `char_set` (Duplicate found):
    *   We have a duplicate character in the current window.
    *   We must shrink the window from the left until the duplicate is removed.
    *   While `s[right]` is in `char_set`:
        *   Remove `s[left]` from `char_set`.
        *   Increment `left`.
    *   After the loop, add `s[right]` to `char_set`.

*   **Time Complexity**: O(N) - Each character is added and removed at most once.
*   **Space Complexity**: O(min(N, A)) - Where A is the size of the alphabet (e.g., 26 or 128).

---

## 3. Visualization

`s = "abcabcbb"`

```mermaid
graph TD
    subgraph Step 1
    A1[Window: 'a'] --> B1[Set: {a}]
    B1 --> C1[Max: 1]
    end
    
    subgraph Step 2
    A2[Window: 'ab'] --> B2[Set: {a, b}]
    B2 --> C2[Max: 2]
    end
    
    subgraph Step 3
    A3[Window: 'abc'] --> B3[Set: {a, b, c}]
    B3 --> C3[Max: 3]
    end
    
    subgraph Step 4 (Duplicate 'a')
    A4[Current: 'a'] --> B4[Duplicate found!]
    B4 --> C4[Remove s[L]='a', L++]
    C4 --> D4[Window: 'bca']
    D4 --> E4[Set: {b, c, a}]
    end
```

**Trace:**
`s = "pwwkew"`

| Left | Right | Char | In Set? | Action | Window | Set | Max Len |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | 0 | p | No | Add p | `[p]` | `{p}` | 1 |
| 0 | 1 | w | No | Add w | `[pw]` | `{p, w}` | 2 |
| 0 | 2 | w | **Yes** | Remove `s[L]` (p), L++ | `[ww]` | `{w}` | 2 |
| | | | **Yes** | Remove `s[L]` (w), L++ | `[w]` | `{w}` | 2 |
| 2 | 3 | k | No | Add k | `[wk]` | `{w, k}` | 2 |
| 2 | 4 | e | No | Add e | `[wke]` | `{w, k, e}` | **3** |
| 2 | 5 | w | **Yes** | Remove `s[L]` (w), L++ | `[kew]` | `{k, e, w}` | 3 |

---

## 4. Solution

```python
def lengthOfLongestSubstring(s: str) -> int:
    char_set = set()
    left = 0
    max_len = 0
    
    for right in range(len(s)):
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_len = max(max_len, right - left + 1)
        
    return max_len
```

---

## 5. Variations

### Variation 1: Longest Substring with At Most K Distinct Characters (LeetCode 340)

#### Problem Detail
Given a string `s` and an integer `k`, return the length of the longest substring of `s` that contains at most `k` distinct characters.

#### Approach: Sliding Window + Hash Map
Instead of checking for duplicates, we check the **size** of our character map.
1.  Expand `right`. Add `s[right]` to map (count frequency).
2.  While `len(map) > k`:
    *   Decrement count of `s[left]`.
    *   If count becomes 0, remove from map.
    *   Increment `left`.
3.  Update `max_len`.

*   **Time**: O(N)
*   **Space**: O(K)

#### Visualization
`s = "eceba", k = 2`

1.  `[e]`, map `{e:1}`, len 1 <= 2. Max: 1.
2.  `[ec]`, map `{e:1, c:1}`, len 2 <= 2. Max: 2.
3.  `[ece]`, map `{e:2, c:1}`, len 2 <= 2. Max: 3.
4.  `[eceb]`, map `{e:2, c:1, b:1}`, len 3 > 2. **Shrink**.
    *   Remove `e` (L=0). Map `{e:1, c:1, b:1}`. Still > 2.
    *   Remove `c` (L=1). Map `{e:1, b:1}`. Valid!
    *   Window `[eb]`.
5.  `[eba]`, map `{e:1, b:1, a:1}`, len 3 > 2. **Shrink**.
    *   Remove `e` (L=2). Map `{b:1, a:1}`. Valid!
    *   Window `[ba]`.

#### Solution
```python
def lengthOfLongestSubstringKDistinct(s: str, k: int) -> int:
    if k == 0: return 0
    char_map = {}
    left = 0
    max_len = 0
    
    for right in range(len(s)):
        char_map[s[right]] = char_map.get(s[right], 0) + 1
        
        while len(char_map) > k:
            char_map[s[left]] -= 1
            if char_map[s[left]] == 0:
                del char_map[s[left]]
            left += 1
            
        max_len = max(max_len, right - left + 1)
        
    return max_len
```
