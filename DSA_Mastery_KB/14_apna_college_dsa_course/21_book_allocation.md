# Book Allocation Problem — Binary Search on the Answer

Simple words, step by step. This is the first "Binary Search on the Answer" problem in this module — a genuinely different way to use binary search than files 17-20, so read carefully.

## The question
You have `m` students and `n` books, each with a number of pages. Each student gets a **contiguous** group of books. Every student must get at least one book. Minimize the **maximum number of pages any single student has to read**.

Example: pages `[12, 34, 67, 90]`, students `m = 2`. One good split is `[12, 34, 67]` and `[90]`, giving max-pages = max(113, 90) = 113. A better split is `[12, 34]` and `[67, 90]`, giving max(46, 157) = 157 (worse!). The actual best split here is `[12,34,67]` / `[90]` → 113.

## Why this is NOT a normal binary search
There is no sorted array of "answers" to search through directly. Instead, we binary search over the **range of possible answer values** — from the largest single book (the smallest possible max-pages, since one student must read at least the biggest book) up to the sum of all pages (if one student had to read everything). For each candidate "max pages allowed," we check: *"can I actually split the books into `m` or fewer groups, each with total pages ≤ this candidate?"* This check is called the **feasibility function**.

## The feasibility check
```python
def can_allocate(pages, m, max_allowed):
    students_needed = 1
    current_sum = 0
    for p in pages:
        if p > max_allowed:
            return False              # a single book is already too big -- impossible
        if current_sum + p > max_allowed:
            students_needed += 1       # start a new student's pile
            current_sum = p
        else:
            current_sum += p
    return students_needed <= m
```
```javascript
function canAllocate(pages, m, maxAllowed) {
    let studentsNeeded = 1;
    let currentSum = 0;
    for (const p of pages) {
        if (p > maxAllowed) {
            return false;               // a single book is already too big -- impossible
        }
        if (currentSum + p > maxAllowed) {
            studentsNeeded++;            // start a new student's pile
            currentSum = p;
        } else {
            currentSum += p;
        }
    }
    return studentsNeeded <= m;
}
```
**Speed of this check alone**: O(n) — one pass through the books.

## Why binary searching over "max pages allowed" works
The feasibility check has a **monotonic** property: if `max_allowed = 100` is feasible (some valid split exists), then any `max_allowed > 100` is also feasible (more room only makes splitting easier, never harder). And if `100` is *not* feasible, then no smaller value can be feasible either. This "false, false, false, ..., true, true, true" shape across increasing values of `max_allowed` is exactly the shape binary search needs — we are searching for the boundary where it flips from infeasible to feasible, and the leftmost `true` is our answer.

## The full solution
```python
def min_max_pages(pages, m):
    if m > len(pages):
        return -1                       # can't give every student at least one book

    low, high = max(pages), sum(pages)  # smallest possible answer, largest possible answer
    result = high
    while low <= high:
        mid = low + (high - low) // 2
        if can_allocate(pages, m, mid):
            result = mid                 # this works -- remember it, try for something even smaller
            high = mid - 1
        else:
            low = mid + 1                # this doesn't work -- need to allow more pages
    return result
```
```javascript
function minMaxPages(pages, m) {
    if (m > pages.length) {
        return -1;                        // can't give every student at least one book
    }

    let low = Math.max(...pages);
    let high = pages.reduce((a, b) => a + b, 0);
    let result = high;
    while (low <= high) {
        const mid = low + Math.floor((high - low) / 2);
        if (canAllocate(pages, m, mid)) {
            result = mid;                   // this works -- remember it, try for something even smaller
            high = mid - 1;
        } else {
            low = mid + 1;                  // this doesn't work -- need to allow more pages
        }
    }
    return result;
}
```
**Speed**: O(n log(sum of pages)) — the binary search runs O(log(sum)) times, and each feasibility check costs O(n).

## Rules to remember
- The search boundaries are `low = max(pages)` (you can never go below the single biggest book) and `high = sum(pages)` (the worst case is one student reading everything).
- **Whenever a "minimize the maximum" or "maximize the minimum" question shows up, and you can write a yes/no feasibility check that is monotonic across a range, think "Binary Search on the Answer."** This is a distinct, reusable signal — different from "the input array itself is sorted."

## Interview Q&A

**Q1: How do you recognize that a problem needs "Binary Search on the Answer" instead of a normal search?**
Look for the phrase pattern "minimize the maximum" or "maximize the minimum" (or "find the smallest X such that Y is possible"). If you can write a yes/no function that checks "is this candidate value achievable?", and that function is monotonic (once true, always true for bigger values, or vice versa), that is the signal — you binary search over possible *answers*, not over the input data itself.

**Q2: Why is the feasibility check guaranteed to be monotonic here?**
Because increasing the allowed max-pages-per-student can only ever make splitting *easier*, never harder — any valid split at a lower limit is still valid at a higher limit (you're not forced to use the extra room). This one-directional relationship is what makes the "false...false, true...true" boundary well-defined and searchable.

**Q3: What is the time complexity, and why is it "n log(sum)" and not just "log(sum)"?**
Each single check inside the binary search ("can this max-pages value work?") costs O(n), because it has to walk through every book once. The binary search itself runs O(log(sum of all pages)) times (shrinking the range from `sum(pages)` down to 1 each time it halves). Multiplying the per-check cost by the number of checks gives O(n log(sum)).

**Q4: How is this problem related to Painter's Partition and Aggressive Cows (the next two files)?**
All three are "Binary Search on the Answer" problems with the exact same shape: define a range of possible answers, write a monotonic feasibility check, and binary search for the boundary. Painter's Partition is *literally the same problem* with different wording (painters instead of students, boards instead of books). Aggressive Cows flips the direction (maximize the *minimum* distance instead of minimize the *maximum* sum), but uses the identical binary-search-on-feasibility skeleton.
