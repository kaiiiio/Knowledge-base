# ⚔️ LeetCode 11: Container With Most Water

**Difficulty**: Medium
**Pattern**: Two Pointers

## 1. Problem Detail

You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i-th` line are `(i, 0)` and `(i, height[i])`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

**Notice** that you may not slant the container.

**Example 1:**
```
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: The max area is between index 1 (height 8) and index 8 (height 7).
Width = 8 - 1 = 7. Height = min(8, 7) = 7. Area = 49.
```

**Example 2:**
```
Input: height = [1,1]
Output: 1
```

**Constraints:**
*   `n == height.length`
*   `2 <= n <= 10^5`
*   `0 <= height[i] <= 10^4`

---

## 2. Approach: Two Pointers (Greedy)

The area of water is determined by the width between lines and the height of the shorter line.
`Area = (right - left) * min(height[left], height[right])`

We want to maximize this area.
1.  Start with pointers at the widest possible width: `left = 0`, `right = n - 1`.
2.  Calculate the area.
3.  To potentially find a larger area, we need to move one of the pointers inward.
    *   If we move the pointer with the **taller** line, the width decreases, and the height is limited by the shorter line (which we didn't move). So the area can only decrease or stay the same.
    *   Therefore, we **must** move the pointer with the **shorter** line, hoping to find a taller line that compensates for the decrease in width.

*   **Time Complexity**: O(N)
*   **Space Complexity**: O(1)

---

## 3. Visualization

`height = [1, 8, 6, 2, 5, 4, 8, 3, 7]`

```mermaid
graph TD
    subgraph Step 1
    A1[L=0 (1), R=8 (7)] --> B1[Width=8, MinH=1]
    B1 --> C1[Area = 8 * 1 = 8]
    C1 --> D1[Move L (1 < 7)]
    end
    
    subgraph Step 2
    A2[L=1 (8), R=8 (7)] --> B2[Width=7, MinH=7]
    B2 --> C2[Area = 7 * 7 = 49]
    C2 --> D2[Move R (7 < 8)]
    end
    
    subgraph Step 3
    A3[L=1 (8), R=7 (3)] --> B3[Width=6, MinH=3]
    B3 --> C3[Area = 6 * 3 = 18]
    C3 --> D3[Move R (3 < 8)]
    end
```

**Trace:**

| Left | Right | H[Left] | H[Right] | Width | Min Height | Area | Action | Max Area |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 0 | 8 | 1 | 7 | 8 | 1 | 8 | Move L | 8 |
| 1 | 8 | 8 | 7 | 7 | 7 | **49** | Move R | **49** |
| 1 | 7 | 8 | 3 | 6 | 3 | 18 | Move R | 49 |
| 1 | 6 | 8 | 8 | 5 | 8 | 40 | Move R | 49 |
| 1 | 5 | 8 | 4 | 4 | 4 | 16 | Move R | 49 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

---

## 4. Solution

```python
def maxArea(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    max_area = 0
    
    while left < right:
        # Calculate current area
        width = right - left
        current_height = min(height[left], height[right])
        max_area = max(max_area, width * current_height)
        
        # Move the shorter line inward
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
            
    return max_area
```
