# Blueprint: Sliding Window

**The Analogy**: Think of a **Worm** crawling along a tape.
*   The **Head** (Right Pointer) moves forward to eat (expand).
*   The **Tail** (Left Pointer) moves forward to poop (shrink).
*   The worm stretches and shrinks to satisfy a condition.

## 1. Fixed Size Window (The "Box")

**Use Case**: "Find max sum of subarray of size K".
**Logic**: The window size never changes. We just slide it one step.

```python
def fixed_window(nums, k):
    current_sum = 0
    max_sum = float('-inf')
    
    # 1. Build first window
    for i in range(k):
        current_sum += nums[i]
    max_sum = current_sum
    
    # 2. Slide
    for i in range(k, len(nums)):
        current_sum += nums[i]       # Add Head
        current_sum -= nums[i - k]   # Remove Tail
        max_sum = max(max_sum, current_sum)
        
    return max_sum
```

## 2. Dynamic Window (The "Caterpillar")

**Use Case**: "Longest substring with...", "Smallest subarray with..."
**Logic**: Expand `right` until invalid, then shrink `left` until valid again.

```python
def dynamic_window(s):
    left = 0
    max_len = 0
    window_counts = {}
    
    for right in range(len(s)):
        # 1. EXPAND (Add Head)
        char = s[right]
        window_counts[char] = window_counts.get(char, 0) + 1
        
        # 2. SHRINK (Remove Tail) - While condition is BROKEN
        while window_counts[char] > 1: # Example: No duplicates allowed
            remove_char = s[left]
            window_counts[remove_char] -= 1
            left += 1
            
        # 3. UPDATE RESULT (Window is now Valid)
        max_len = max(max_len, right - left + 1)
        
    return max_len
```

## 3. Common Pitfalls

> [!WARNING]
> **Negative Numbers**: If the problem involves "Sum" and "Negative Numbers", Sliding Window **DOES NOT WORK**.
> *   Why? Adding a number doesn't guarantee the sum increases.
> *   Fix: Use **Prefix Sum**.

> [!TIP]
> **Window Size**: `Length = Right - Left + 1`.
