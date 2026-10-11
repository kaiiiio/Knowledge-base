# Arrays — Two Pointers, Sliding Window, Kadane's Algorithm

This file uses **very simple language** in the main lessons, so it is easy to read even if English is not your strong language. At the end of each problem, there is a small "More Problems Like This" box — that box uses harder words on purpose, for extra practice later.

We go step by step:
- **Level 0**: The very basics. Start here even if it feels too easy.
- **Level 1**: Easy problems. One idea at a time.
- **Level 2**: Medium problems. Two ideas mixed together.
- **Level 3**: Hard problems. Many ideas mixed together.

Every problem shows three ways to solve it:
1. **Brute Force** — the slow way, but the easy way to think of first.
2. **Better** — a little bit faster.
3. **Optimal** — the best and fastest way.

---

## Level 0 — The Basics (Start Here)

### What is an array?
An array is like a **row of boxes**. Each box has a number on it (called the **index**), starting from 0. Each box holds one value.

```
Index:  0   1   2   3
Value: [10][20][30][40]
```

If you know the box number, you can jump straight to it. That is why reading `arr[2]` is instant — it does not matter if the array has 10 items or 10 million items. This instant jump is called **O(1)** time.

### Simple words for "how fast is this?"
We use letters like **O(1)**, **O(n)**, **O(n²)** to say how slow or fast code is, when the array has `n` items in it.
- **O(1)** = instant, no matter how big the array is.
- **O(n)** = you look at every item once.
- **O(n²)** = you look at every item, and for each one, you look at every item again (a loop inside a loop).
- **O(n³)** = a loop inside a loop inside a loop.

Smaller is better. O(n) is much better than O(n²) when the array is big.

### Table: common array actions and their speed
| What you do | How fast | Why |
|---|---|---|
| Read one box by its number | O(1) | Instant jump |
| Look for a value (array not sorted) | O(n) | You may have to check every box |
| Look for a value (array is sorted) | O(log n) | You can skip half the boxes each time (see file 02) |
| Add/remove at the end | O(1) usually | Nothing else needs to move |
| Add/remove at the start or middle | O(n) | Every box after it must shift over by one |

### Practice 1: Find the biggest number
```python
def find_max(arr):
    biggest = arr[0]          # start by saying the first box is the biggest
    for num in arr[1:]:       # look at every other box
        if num > biggest:
            biggest = num     # found a bigger one, so update
    return biggest
```
**Speed**: O(n) — you must check every box, because the biggest number could be anywhere.
**Careful**: if the array is empty, `arr[0]` will crash. Always think about the empty case.

### Practice 2: Flip an array backwards
```python
def reverse_array(arr):
    left = 0
    right = len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]   # swap the two boxes
        left += 1
        right -= 1
    return arr
```
**Speed**: O(n). This is our first look at **two pointers** — one pointer starts at the left, one starts at the right, and they walk toward each other. We will use this idea a lot below.

### Practice 3: Check if an array is already sorted
```python
def is_sorted(arr):
    for i in range(1, len(arr)):
        if arr[i] < arr[i - 1]:      # this box is smaller than the one before it
            return False
    return True
```
**Speed**: O(n). Many tricks later (like two pointers) only work if the array is sorted first — this little check is how you make sure that rule is true.

### Practice 4: Look for a value, one by one
```python
def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1
```
**Speed**: O(n). This is the slow, simple way to search. Later, better tricks (like a hash map) beat this speed.

### Why do we need "two pointers" and "sliding window" at all?
Imagine you are asked: *"find two boxes that add up to 10."* The simple way is to check every pair of boxes — that is slow (O(n²)). Two pointers and sliding window are tricks that let us find the answer by walking through the array **only one or two times**, instead of checking every possible pair. That is the whole point of this file.

---

## The Main Ideas — When to Use What

**Two Pointers**: Use this when the array is sorted, and you are looking for two (or three) numbers that add up to something. One pointer starts on the left, one starts on the right. If the sum is too small, move the left pointer forward (to get a bigger number). If the sum is too big, move the right pointer backward (to get a smaller number).

**Sliding Window**: Use this when the question is about a **piece of the array that is next to each other** (not scattered) — like "the biggest sum of any 3 numbers in a row," or "the longest piece with no repeated letters." There are two types:
- **Fixed window**: the size (like "3 numbers in a row") is given to you. You slide it one step at a time.
- **Changing window**: you make the window bigger until it breaks a rule, then make it smaller until the rule is okay again.

**Kadane's Algorithm**: Use this only for "find the biggest sum of numbers in a row" type questions. At each number, ask: *"should I keep adding to my current sum, or should I throw away the old sum and start fresh from here?"* If the sum so far is negative, it is only hurting you — start fresh.

---

## Level 2: Maximum Subarray Sum (Kadane's Algorithm)

**The question**: You have a list of numbers (some can be negative). Find the group of numbers next to each other that adds up to the biggest total.

### Brute Force (the slow way)
Try every possible group of numbers, and add them up each time.
```python
def max_subarray_brute(arr):
    n = len(arr)
    best = float('-inf')
    for i in range(n):
        for j in range(i, n):
            current_sum = 0
            for k in range(i, j + 1):   # adding up the same numbers again and again — this is the slow part
                current_sum += arr[k]
            best = max(best, current_sum)
    return best
```
**Speed**: O(n³) — very slow. We are re-adding the same numbers over and over.

### Better
Do not restart the sum from zero every time. Just keep adding the next number to the same running total.
```python
def max_subarray_better(arr):
    n = len(arr)
    best = float('-inf')
    for i in range(n):
        current_sum = 0
        for j in range(i, n):
            current_sum += arr[j]      # keep the running total, do not restart
            best = max(best, current_sum)
    return best
```
**Speed**: O(n²) — faster, but still checking too many groups.

### Optimal (Kadane's Algorithm)
At every number, ask: *"is my current running sum still helping me, or is it dragging me down?"*
```python
def max_subarray_optimal(arr):
    best = arr[0]
    current = arr[0]
    for i in range(1, len(arr)):
        # if the old sum is negative, it only hurts us -- better to start fresh here
        current = max(arr[i], current + arr[i])
        best = max(best, current)
    return best
```
**Speed**: O(n) — we only walk through the array one time.

**Let's watch it work** on `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`:
```
number -2: current = -2, best so far = -2
number  1: old sum -2 is bad, so start fresh: current = 1, best = 1
number -3: current = 1-3 = -2, best stays 1
number  4: old sum -2 is bad, so start fresh: current = 4, best = 4
number -1: current = 4-1 = 3, best stays 4
number  2: current = 3+2 = 5, best = 5
number  1: current = 5+1 = 6, best = 6
number -5: current = 6-5 = 1, best stays 6
number  4: current = 1+4 = 5, best stays 6   -> final answer: 6
```

> **More Problems Like This (harder wording, for extra practice)**
> - **Maximum Product Subarray** — O(n) time, O(1) space. A single negative number can flip a small product into the biggest one, so you must track both a running maximum *and* a running minimum at every step.
> - **Maximum Circular Subarray Sum** — O(n) time, O(1) space. The array can "wrap around" from the end back to the start; solved by comparing normal Kadane's output against `total sum − minimum subarray sum`.
> - **Subarray Sum Equals K (numbers can be negative)** — brute force O(n²); optimal O(n) time/O(n) space using a prefix-sum hash map (`count[prefix_sum - k]`), since negative numbers break the two-pointer precondition of monotonic movement.

---

## Level 1: Two Sum

**The question**: You have a list of numbers and a target number. Find two numbers in the list that add up to the target, and return their positions.

### Brute Force
Check every pair of numbers.
```python
def two_sum_brute(nums, target):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
```
**Speed**: O(n²) — checking every pair takes a long time when the list is big.

### Better (two pointers on a sorted copy)
Sort the numbers first (but remember their original positions), then use two pointers — one from the start, one from the end.
```python
def two_sum_two_pointer(nums, target):
    order = sorted(range(len(nums)), key=lambda i: nums[i])   # positions, sorted by value
    left, right = 0, len(nums) - 1
    while left < right:
        total = nums[order[left]] + nums[order[right]]
        if total == target:
            return sorted([order[left], order[right]])
        elif total < target:
            left += 1     # sum too small, need a bigger number
        else:
            right -= 1    # sum too big, need a smaller number
    return []
```
**Speed**: O(n log n) — mostly from sorting. This idea is very useful for harder questions like 3Sum below, but for plain Two Sum, there is an even faster way.

### Optimal (using a hash map — a fast lookup box)
For every number, ask: *"have I already seen the number that would complete this pair?"* A hash map answers this question instantly.
```python
def two_sum_optimal(nums, target):
    seen = {}   # remembers: value -> its position
    for i, num in enumerate(nums):
        needed = target - num
        if needed in seen:
            return [seen[needed], i]
        seen[num] = i
    return []
```
**Speed**: O(n) — only one walk through the list, because the hash map lookup is instant.
**Big rule to remember**: whenever brute force is slow because "for each number, I check every other number" — try a hash map instead. This one trick fixes many slow problems.

> **More Problems Like This (harder wording)**
> - **Two Sum II — Input Array Is Sorted** — O(n) time, O(1) space, pure two-pointer (no hash map needed since sortedness is already guaranteed).
> - **Two Sum IV — Input is a BST** — O(n) time, O(n) space, in-order traversal + hash set (bridges this pattern into the trees module).

---

## Level 3: 3Sum

**The question**: Find all groups of three numbers in the list that add up to zero, with no repeated groups.

### Brute Force
Check every group of three numbers.
```python
def three_sum_brute(nums):
    n = len(nums)
    result = set()
    for i in range(n):
        for j in range(i + 1, n):
            for k in range(j + 1, n):
                if nums[i] + nums[j] + nums[k] == 0:
                    result.add(tuple(sorted([nums[i], nums[j], nums[k]])))
    return [list(t) for t in result]
```
**Speed**: O(n³) — very slow, three loops inside each other.

### Optimal (sort first, then two pointers)
Sort the numbers. Then pick one number at a time, and use two pointers to find the other two — just like the Two Sum two-pointer idea above.
```python
def three_sum_optimal(nums):
    nums.sort()
    n = len(nums)
    result = []
    for i in range(n):
        if i > 0 and nums[i] == nums[i - 1]:
            continue   # skip repeats of the first number
        left, right = i + 1, n - 1
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            if total == 0:
                result.append([nums[i], nums[left], nums[right]])
                while left < right and nums[left] == nums[left + 1]:
                    left += 1   # skip repeats
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1  # skip repeats
                left += 1
                right -= 1
            elif total < 0:
                left += 1
            else:
                right -= 1
    return result
```
**Speed**: O(n²) — much better than O(n³). Sorting first also makes it easy to skip repeated groups, which is the real reason this way is nicer to use.

> **More Problems Like This (harder wording)**
> - **4Sum** — O(n³) time, O(1) extra space; same sort + two-pointer idea, with one more fixed outer loop; generalizes to k-Sum at O(n^(k-1)).
> - **3Sum Closest** — O(n²) time, O(1) space; same skeleton, but track the closest total to the target instead of an exact-zero match.

---

## Level 1: Best Time to Buy and Sell Stock

**The question**: You are given the price of a stock on different days. You can buy once and sell once (buy day must be before sell day). Find the biggest profit possible.

### Brute Force
Check every pair of buy-day and sell-day.
```python
def max_profit_brute(prices):
    n = len(prices)
    best = 0
    for i in range(n):
        for j in range(i + 1, n):
            best = max(best, prices[j] - prices[i])
    return best
```
**Speed**: O(n²).

### Optimal
Walk through the prices once. Keep track of the **lowest price seen so far**. At each day, check: *"if I sold today, having bought at the lowest price so far, what would my profit be?"*
```python
def max_profit_optimal(prices):
    lowest_so_far = float('inf')
    best_profit = 0
    for price in prices:
        lowest_so_far = min(lowest_so_far, price)
        best_profit = max(best_profit, price - lowest_so_far)
    return best_profit
```
**Speed**: O(n) — one walk through the list. This is the same idea as Kadane's algorithm: keep a "best so far" value instead of comparing everything to everything.

> **More Problems Like This (harder wording)**
> - **Best Time to Buy and Sell Stock II (unlimited transactions)** — O(n) time, O(1) space; greedy — sum every positive day-over-day price increase.
> - **Best Time to Buy and Sell Stock with Cooldown** — O(n) time, O(1) space; requires a small state-machine/DP formulation, not plain greedy.

---

## Level 2: Longest Piece of Text With No Repeated Letters

**The question**: Given a string of letters, find the length of the longest piece (in a row) that has no repeated letter.

### Brute Force
Check every possible piece of the string, and check if all its letters are different.
```python
def longest_substring_brute(s):
    n = len(s)
    best = 0
    for i in range(n):
        for j in range(i, n):
            piece = s[i:j + 1]
            if len(piece) == len(set(piece)):   # checking for repeats takes its own extra time
                best = max(best, len(piece))
    return best
```
**Speed**: O(n³) — very slow.

### Better
Build each piece one letter at a time and stop as soon as a repeat shows up — no need to check the whole piece every time.
```python
def longest_substring_better(s):
    n = len(s)
    best = 0
    for i in range(n):
        seen = set()
        for j in range(i, n):
            if s[j] in seen:
                break        # a repeat showed up, stop here
            seen.add(s[j])
            best = max(best, j - i + 1)
    return best
```
**Speed**: O(n²) — better, but we still restart from scratch too often.

### Optimal (sliding window)
Do not restart from scratch when a repeat shows up. Instead, just shrink the window from the left side, only enough to remove the repeated letter.
```python
def longest_substring_optimal(s):
    last_seen_at = {}   # letter -> the last position we saw it
    left = 0
    best = 0
    for right, char in enumerate(s):
        if char in last_seen_at and last_seen_at[char] >= left:
            left = last_seen_at[char] + 1   # jump left past the old copy of this letter
        last_seen_at[char] = right
        best = max(best, right - left + 1)
    return best
```
**Speed**: O(n). Both pointers (`left` and `right`) only ever move forward, so together they take at most `2n` steps in total — not `n²`.

> **More Problems Like This (harder wording)**
> - **Minimum Window Substring** — O(n + m) time, O(m) space, variable-size window; expand until valid, then shrink aggressively while tracking the minimum length.
> - **Longest Repeating Character Replacement** — O(n) time, O(26) ≈ O(1) space; window stays valid while `(window length − count of most frequent character) ≤ k`.
> - **Permutation in String** — O(n) time, O(26) space; fixed-size window plus a frequency-count comparison instead of a uniqueness check.
> - **Sliding Window Maximum** — O(n) time, O(k) space via a monotonic deque; "max/min of every window of size k" is almost always this structure, not a naive per-window rescan (which costs O(n·k)).

---

## Level 2: Container With Most Water

**The question**: You have vertical lines of different heights. Pick two lines that, together with the ground, hold the most water. Find the biggest amount of water possible.

### Brute Force
Check every pair of lines.
```python
def max_water_brute(height):
    n = len(height)
    best = 0
    for i in range(n):
        for j in range(i + 1, n):
            area = min(height[i], height[j]) * (j - i)
            best = max(best, area)
    return best
```
**Speed**: O(n²).

### Optimal (two pointers)
Start with one pointer at the far left, one at the far right (this is the widest possible container). Always move the pointer with the **shorter** line — moving the taller one can never make things better.
```python
def max_water_optimal(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        width = right - left
        area = min(height[left], height[right]) * width
        best = max(best, area)
        if height[left] < height[right]:
            left += 1     # the short side is holding us back -- try moving it
        else:
            right -= 1
    return best
```
**Speed**: O(n).
**Why moving the shorter side is always the right move**: the water level is decided by the shorter of the two lines. Moving the taller line only makes the container narrower, without any chance of raising the water level — so it can never help. Moving the shorter line is the only move that has a chance to find a taller line and raise the water level.

> **More Problems Like This (harder wording)**
> - **Trapping Rain Water** — O(n) time, O(1) space with two pointers (or O(n) time/O(n) space using prefix-max and suffix-max arrays as an intermediate step); water trapped at each position depends on the shorter of the tallest wall to its left and right — the same "constrained by the weaker side" logic, one level harder.

---

## Level 2: Product of Array Except Self

**The question**: For each position, find the product of every other number in the array (not the number at that position itself). You cannot use division, and it must run in O(n) time.

### Brute Force
For each position, multiply every other number.
```python
def product_except_self_brute(nums):
    n = len(nums)
    result = []
    for i in range(n):
        product = 1
        for j in range(n):
            if i != j:
                product *= nums[j]
        result.append(product)
    return result
```
**Speed**: O(n²).

### Optimal (prefix and suffix products)
The answer at any position is: (product of everything to its left) times (product of everything to its right). Walk the array once left-to-right to build the left products, then once right-to-left to multiply in the right products.
```python
def product_except_self_optimal(nums):
    n = len(nums)
    result = [1] * n

    left_product = 1
    for i in range(n):
        result[i] = left_product
        left_product *= nums[i]

    right_product = 1
    for i in range(n - 1, -1, -1):
        result[i] *= right_product
        right_product *= nums[i]

    return result
```
**Speed**: O(n) — two simple walks through the array, no repeated work.

> **More Problems Like This (harder wording)**
> - **Trapping Rain Water** (see above) uses the same prefix/suffix pass shape.
> - **Range Sum Query — Immutable** — O(1) time per query after an O(n) prefix-sum precompute; the general-purpose extension of "prefix pass" to sums instead of products.

---

## Quick Look-Back Table

| Problem | Level | Brute | Optimal | Main Idea |
|---|---|---|---|---|
| Maximum Subarray Sum | 2 | O(n³) | O(n) | Kadane's — keep going or start fresh |
| Two Sum | 1 | O(n²) | O(n) | Hash map lookup |
| 3Sum | 3 | O(n³) | O(n²) | Sort + two pointers |
| Best Time to Buy/Sell Stock | 1 | O(n²) | O(n) | Track lowest price so far |
| Longest Substring, No Repeats | 2 | O(n³) | O(n) | Sliding window (shrink, don't restart) |
| Container With Most Water | 2 | O(n²) | O(n) | Two pointers, move the shorter side |
| Product of Array Except Self | 2 | O(n²) | O(n) | Prefix products × suffix products |
