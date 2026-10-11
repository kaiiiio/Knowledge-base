# Recursion — Part 2 (Fibonacci, Recursive Binary Search, Sorted Check)

Simple words, step by step. This file uses recursion on three more problems, each teaching a different lesson.

## Problem 1: Fibonacci Numbers
The Fibonacci sequence: `0, 1, 1, 2, 3, 5, 8, 13, ...` — each number is the sum of the two before it. `fib(n) = fib(n-1) + fib(n-2)`.

```python
def fib(n):
    if n <= 1:
        return n                       # base case: fib(0)=0, fib(1)=1
    return fib(n - 1) + fib(n - 2)      # recursive case
```
```javascript
function fib(n) {
    if (n <= 1) {
        return n;                        // base case: fib(0)=0, fib(1)=1
    }
    return fib(n - 1) + fib(n - 2);       // recursive case
}
```

### The hidden problem — exponential time
This looks clean, but it is **very slow**: O(2^n). The reason is repeated work — `fib(5)` calls `fib(4)` and `fib(3)`, but `fib(4)` *also* calls `fib(3)` — so `fib(3)` gets computed twice. `fib(2)` gets computed even more times. This waste multiplies as `n` grows.
```
                    fib(5)
                 /          \
            fib(4)            fib(3)
           /      \           /     \
       fib(3)    fib(2)    fib(2)  fib(1)
       /    \     /   \     /   \
   fib(2) fib(1) fib(1)fib(0) fib(1)fib(0)
   ...notice fib(3) and fib(2) are computed multiple separate times!
```

### The fix — remembering answers (a preview of Dynamic Programming)
```python
def fib_memo(n, cache={}):
    if n <= 1:
        return n
    if n in cache:
        return cache[n]              # already computed -- reuse it, don't recompute
    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)
    return cache[n]
```
```javascript
function fibMemo(n, cache = new Map()) {
    if (n <= 1) {
        return n;
    }
    if (cache.has(n)) {
        return cache.get(n);           // already computed -- reuse it, don't recompute
    }
    const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);
    cache.set(n, result);
    return result;
}
```
**Speed**: O(n) — each `fib(k)` value is computed only once, ever. This trick (storing answers to avoid recomputing them) is called **memoization**, and it is the doorway into the entire Dynamic Programming module later in this course.

## Problem 2: Recursive Binary Search
A recursive rewrite of the iterative binary search from file 17 — same idea, expressed as "solve a smaller version of the same search."
```python
def binary_search_recursive(arr, target, low, high):
    if low > high:
        return -1
    mid = low + (high - low) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, high)   # search the smaller right half
    else:
        return binary_search_recursive(arr, target, low, mid - 1)    # search the smaller left half
```
```javascript
function binarySearchRecursive(arr, target, low, high) {
    if (low > high) {
        return -1;
    }
    const mid = low + Math.floor((high - low) / 2);
    if (arr[mid] === target) {
        return mid;
    } else if (arr[mid] < target) {
        return binarySearchRecursive(arr, target, mid + 1, high);   // search the smaller right half
    } else {
        return binarySearchRecursive(arr, target, low, mid - 1);    // search the smaller left half
    }
}
```
**The lesson here**: recursion doesn't just apply to "compute a number" problems (like factorial/Fibonacci) — it applies naturally anywhere a problem can be reduced to "the same problem, on a smaller piece of the input." Binary search shrinking its search range every call is exactly that shape.

## Problem 3: Check if an Array is Sorted (recursively)
```python
def is_sorted_recursive(arr, i=0):
    if i == len(arr) - 1:
        return True                                  # base case: reached the last element, all good
    if arr[i] > arr[i + 1]:
        return False                                  # found a violation
    return is_sorted_recursive(arr, i + 1)             # check the rest of the array
```
```javascript
function isSortedRecursive(arr, i = 0) {
    if (i === arr.length - 1) {
        return true;                                    // base case: reached the last element, all good
    }
    if (arr[i] > arr[i + 1]) {
        return false;                                    // found a violation
    }
    return isSortedRecursive(arr, i + 1);                 // check the rest of the array
}
```
**The lesson here**: this problem doesn't strictly *need* recursion — the iterative version from file 04's warm-up is simpler and doesn't risk any call-stack depth issues. It's included specifically to show that recursion is a **choice**, not a requirement, for problems that could just as easily use a simple loop.

## Rules to remember
- Plain recursive Fibonacci is the textbook example of "recursion can be catastrophically slow without memoization" — always ask "am I solving the same sub-problem more than once?" when writing a recursive solution.
- Not every problem that *can* be written recursively *should* be — prefer the simpler, iterative version when a problem doesn't have a naturally recursive/self-similar structure (like the "is sorted" check above).

## Interview Q&A

**Q1: Why is plain recursive Fibonacci O(2^n), and how does memoization fix it?**
Without memoization, the recursion tree branches into two calls at every level, and many of those branches compute the exact same `fib(k)` value independently and repeatedly — the total number of function calls roughly doubles with each increase in `n`, giving exponential growth. Memoization stores each `fib(k)` result the first time it's computed, so every subsequent request for that same value is an O(1) lookup instead of a fresh recursive computation — collapsing the total work from exponential down to linear, O(n).

**Q2: What is the time and space complexity of the memoized Fibonacci, including the recursion itself?**
Time is O(n), since each of the `n` distinct sub-problems is computed exactly once. Space is also O(n): O(n) for the cache storing each computed value, plus O(n) for the recursion call stack in the worst case (since the first call chain goes all the way down from `n` to the base case before anything returns).

**Q3: When would you prefer an iterative solution over a recursive one, even if the recursive one is "cleaner" to read?**
When the input size could be large enough to risk hitting the recursion depth limit (stack overflow), when the recursive version does redundant work that isn't trivially memoized, or when the extra call-stack memory usage matters in a performance-sensitive context. Iterative solutions are generally preferred in production systems handling unpredictable or large inputs, while recursive solutions are often preferred for clarity when the input size is bounded and the problem's structure is naturally recursive (like tree/graph traversal).
