# Time & Space Complexity

Simple words, step by step.

## Why we need this at all
Two pieces of code can both give the correct answer, but one can be much slower than the other once the input gets big. Time and space complexity are how we **talk about speed and memory use** without needing to actually run the code on a real computer.

## Time complexity — how the running time grows
We use a special notation called **Big O**. It answers the question: *"if the input has `n` items, roughly how many steps does this code take?"*

| Notation | Name | What it means, simply | Example |
|---|---|---|---|
| O(1) | Constant | Same speed no matter how big the input is | Reading `arr[5]` |
| O(log n) | Logarithmic | Cuts the problem in half each step | Binary search |
| O(n) | Linear | One pass through the input | A single loop |
| O(n log n) | Linearithmic | A bit more than one pass | Merge sort, quicksort |
| O(n²) | Quadratic | A loop inside a loop | Checking every pair |
| O(n³) | Cubic | A loop inside a loop inside a loop | Checking every triplet |
| O(2ⁿ) | Exponential | Doubles with every extra item — gets huge fast | Trying every possible subset |

**How to read code and guess its Big O (a simple checklist)**:
- One simple loop over `n` items → O(n).
- A loop inside another loop, both going up to `n` → O(n²).
- Cutting the search space in half each time (like binary search) → O(log n).
- Calling a function on half the input, twice, then combining (like merge sort) → O(n log n).

**Example**:
```python
def example(arr):        # arr has n items
    total = 0
    for num in arr:       # one loop over all n items
        total += num
    return total
# This is O(n) -- one pass, one step per item.
```
```javascript
function example(arr) {        // arr has n items
    let total = 0;
    for (const num of arr) {    // one loop over all n items
        total += num;
    }
    return total;
}
// This is O(n) -- one pass, one step per item.
```
```python
def example2(arr):
    n = len(arr)
    for i in range(n):        # outer loop: n times
        for j in range(n):    # inner loop: n times, for EACH outer step
            print(arr[i], arr[j])
# This is O(n^2) -- a loop inside a loop.
```
```javascript
function example2(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {        // outer loop: n times
        for (let j = 0; j < n; j++) {    // inner loop: n times, for EACH outer step
            console.log(arr[i], arr[j]);
        }
    }
}
// This is O(n^2) -- a loop inside a loop.
```

## Space complexity — how much extra memory is used
Same idea, but for memory instead of time. It asks: *"how much EXTRA memory (not counting the input itself) does this code need, as the input grows?"*

```python
def sum_array(arr):
    total = 0            # just ONE extra variable, no matter how big arr is
    for num in arr:
        total += num
    return total
# Space complexity: O(1) -- constant extra memory
```
```javascript
function sumArray(arr) {
    let total = 0;         // just ONE extra variable, no matter how big arr is
    for (const num of arr) {
        total += num;
    }
    return total;
}
// Space complexity: O(1) -- constant extra memory
```
```python
def double_all(arr):
    result = []                    # a NEW list, same size as arr
    for num in arr:
        result.append(num * 2)
    return result
# Space complexity: O(n) -- extra memory grows with the input size
```
```javascript
function doubleAll(arr) {
    const result = [];               // a NEW array, same size as arr
    for (const num of arr) {
        result.push(num * 2);
    }
    return result;
}
// Space complexity: O(n) -- extra memory grows with the input size
```

## Worst case, best case, average case
- **Best case**: the fastest the code could ever run (like finding the target on the very first check in a search).
- **Worst case**: the slowest the code could ever run (like never finding the target at all in a search, or finding it only at the very last position).
- **Average case**: roughly how it behaves "typically."

**Rule to remember**: when someone says "the time complexity is O(n)" without saying which case, they almost always mean the **worst case** — that is the standard, default meaning used in interviews and in this whole course.

## Rules to remember
- Big O ignores small constant numbers — O(2n) and O(n) are both just written as O(n), because as `n` grows huge, that constant `2` stops mattering compared to how fast things grow overall.
- Big O only cares about **how things grow as the input gets very large** — it is not a promise about exact real-world speed on a specific small input.

## More Topics Like This (harder wording, for extra reading)
- **Amortized complexity** — some operations are usually fast but occasionally slow (like a dynamic array resizing itself); amortized analysis averages this cost over many operations instead of judging by the rare slow one alone.
- **Master Theorem** — a formula for quickly working out the time complexity of recursive, divide-and-conquer algorithms (like merge sort) without manually expanding the recursion by hand every time.
