# Painter's Partition Problem — Binary Search on the Answer

Simple words, step by step.

## The question
You have `k` painters and `n` boards, each with a certain length. Each painter paints a **contiguous** group of boards, and every painter works at the same speed (1 unit of length takes 1 unit of time). Minimize the **total time to finish painting all boards** — which is really the same as minimizing the maximum amount of "board length" any single painter is assigned.

## Why this is the same problem as Book Allocation
This is **exactly** the same shape as `21_book_allocation.md` — "boards" instead of "books," "painters" instead of "students," "time" instead of "pages" — but the underlying question (split a list into `k` contiguous groups, minimize the maximum group-sum) is identical.

## The feasibility check (identical structure to Book Allocation)
```python
def can_paint(boards, k, max_time):
    painters_needed = 1
    current_sum = 0
    for length in boards:
        if length > max_time:
            return False              # one board alone takes too long -- impossible
        if current_sum + length > max_time:
            painters_needed += 1       # this board needs a new painter
            current_sum = length
        else:
            current_sum += length
    return painters_needed <= k
```
```javascript
function canPaint(boards, k, maxTime) {
    let paintersNeeded = 1;
    let currentSum = 0;
    for (const length of boards) {
        if (length > maxTime) {
            return false;               // one board alone takes too long -- impossible
        }
        if (currentSum + length > maxTime) {
            paintersNeeded++;            // this board needs a new painter
            currentSum = length;
        } else {
            currentSum += length;
        }
    }
    return paintersNeeded <= k;
}
```

## The full solution
```python
def min_time_to_paint(boards, k):
    low, high = max(boards), sum(boards)
    result = high
    while low <= high:
        mid = low + (high - low) // 2
        if can_paint(boards, k, mid):
            result = mid
            high = mid - 1
        else:
            low = mid + 1
    return result
```
```javascript
function minTimeToPaint(boards, k) {
    let low = Math.max(...boards);
    let high = boards.reduce((a, b) => a + b, 0);
    let result = high;
    while (low <= high) {
        const mid = low + Math.floor((high - low) / 2);
        if (canPaint(boards, k, mid)) {
            result = mid;
            high = mid - 1;
        } else {
            low = mid + 1;
        }
    }
    return result;
}
```
**Speed**: O(n log(sum of board lengths)) — same reasoning as Book Allocation.

## Rules to remember
- If you can solve Book Allocation, you can solve this one by simply renaming variables — recognizing that two differently-worded questions are actually the **same underlying pattern** is a real, valuable interview skill, not "cheating."
- The number of painters/students can be at most the number of boards/books — if `k` (or `m`) exceeds the count, the extra painters/students simply have nothing to do, which is usually treated as invalid input worth an explicit check.

## Interview Q&A

**Q1: What is genuinely different between this problem and Book Allocation, if anything?**
Nothing about the algorithm's structure — they are the same "Binary Search on the Answer with a greedy feasibility check" pattern, just relabeled. The only "difference" is the story wrapped around it. Recognizing this out loud in an interview ("this is structurally identical to the book allocation problem I just solved") is a strong, senior-level signal — it shows you see through surface-level rewording to the underlying pattern.

**Q2: Why is the feasibility check greedy, and why does greedy work here?**
It greedily piles boards onto the *current* painter for as long as possible, only starting a new painter when the current pile would exceed the allowed time. This greedy approach is provably optimal *for the feasibility question specifically* ("can we finish within this time limit using at most k painters?") — because delaying the start of a new painter for as long as possible can never make the total painter count worse, and it can only ever help or stay the same.

**Q3: What would change if painters could work on non-contiguous boards (any boards, not just a consecutive group)?**
The problem would become a different, and generally harder, kind of partition/load-balancing problem — the "contiguous group" constraint is exactly what makes the simple linear greedy feasibility check valid. Without contiguity, you would typically need a different approach (like a different greedy strategy — e.g. always assigning the next board to whichever painter currently has the least work — which is a common real-world load-balancing heuristic, though it isn't guaranteed optimal for arbitrary inputs either).
