# Array Data Structure — Part 1

Simple words, step by step.

## What is an array?
An array is a **row of boxes**, all lined up next to each other in memory, all holding the **same type** of value. Each box has a position number, called an **index**, starting from 0.

```
Index:  0    1    2    3    4
Value: [10] [20] [30] [40] [50]
```

## Creating an array
```cpp
int arr[5];                          // an array of 5 empty int boxes
int arr2[5] = {10, 20, 30, 40, 50};  // an array of 5 boxes, filled right away
```
```python
arr2 = [10, 20, 30, 40, 50]   # Python lists resize themselves -- no fixed size needed upfront
```
```javascript
let arr2 = [10, 20, 30, 40, 50];   // JS arrays also resize themselves automatically
```

## Reading and changing a value
```cpp
cout << arr2[2];   // prints 30 (the box at index 2)
arr2[2] = 99;       // now the box at index 2 holds 99 instead of 30
```
```python
print(arr2[2])   # prints 30 (the box at index 2)
arr2[2] = 99      # now the box at index 2 holds 99 instead of 30
```
```javascript
console.log(arr2[2]);   // prints 30 (the box at index 2)
arr2[2] = 99;             // now the box at index 2 holds 99 instead of 30
```
**Rule to remember**: the first box is always index **0**, not 1, in all three languages. So an array of 5 boxes has valid index positions 0, 1, 2, 3, 4 — trying to use index 5 reaches *past* the array, into memory that does not belong to it. **In C++**, this does not stop your program with a clear error message — it silently reads or writes garbage memory, which can crash your program in a confusing way much later. **In Python**, this raises a clear `IndexError`, stopping the program immediately with an understandable message. **In JavaScript**, reading `arr2[5]` on a 5-element array does not crash at all — it silently returns `undefined`, which can also cause confusing bugs later if not checked for. All three languages handle this danger differently, and none of them are the same — worth knowing cold.

## Walking through every box (traversal)
```cpp
for (int i = 0; i < 5; i++) {
    cout << arr2[i] << " ";
}
```
```python
for i in range(len(arr2)):     # len(arr2) gives the size, so this never hardcodes "5"
    print(arr2[i], end=" ")

# The more "Pythonic" way -- loop over the VALUES directly, no index needed at all:
for value in arr2:
    print(value, end=" ")
```
```javascript
for (let i = 0; i < arr2.length; i++) {
    process.stdout.write(arr2[i] + " ");
}

// A more modern JS way -- loop over the VALUES directly:
for (const value of arr2) {
    process.stdout.write(value + " ");
}
```
**Rule to remember**: the loop condition is `i < 5` (or `i < arr2.length` / `i < len(arr2)`), not `i <= 5` — since valid indexes only go up to 4, using `<=` would try to read index 5, which is one step past the array (this exact mistake is called an **off-by-one error**, and it is extremely common in every language).

## Why arrays are fast for reading, but slow for inserting in the middle
Because all boxes sit next to each other in memory, the computer can jump straight to any box using simple math (`starting address + index × size of one box`) — this is why reading `arr[i]` is instant, no matter how big the array is.

But inserting a new value **in the middle** means every box after that position must **shift over by one**, to make room:
```
Before: [10] [20] [30] [40]
Insert 99 at index 1:
Step 1 - shift everything from index 1 onward: [10] [20] [20] [30] [40]
Step 2 - place 99 at index 1:                  [10] [99] [20] [30] [40]
```
This shifting takes time proportional to how many boxes come after the insert point — the more boxes, the more shifting.

## Finding the biggest and smallest value (a basic array problem)
```cpp
int findMax(int arr[], int n) {
    int maxVal = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > maxVal) {
            maxVal = arr[i];
        }
    }
    return maxVal;
}
```
```python
def find_max(arr):
    max_val = arr[0]
    for i in range(1, len(arr)):
        if arr[i] > max_val:
            max_val = arr[i]
    return max_val
```
```javascript
function findMax(arr) {
    let maxVal = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > maxVal) {
            maxVal = arr[i];
        }
    }
    return maxVal;
}
```
**Speed**: you must look at every box once, so this takes an amount of time proportional to the array's size — there is no shortcut, because the biggest value could be sitting in any box.

## Rules to remember (comparing all three languages)
- A C++ array has a **fixed size**, decided when it is created — you cannot add a 6th box to an array of 5 without creating an entirely new, bigger array and copying everything over.
- C++ does **not** automatically check if an index is valid (no "out of bounds" error by default) — reading or writing past the end of the array is allowed by the language, and the results are unpredictable.
- Python's `list` and JavaScript's `Array` both resize themselves automatically — no fixed size needed upfront, and no manual "create a bigger array and copy everything" step required from you.
- Python raises a clear `IndexError` on an invalid index; JavaScript silently returns `undefined` instead of crashing; C++ does neither and can corrupt memory. Know all three behaviors, since assuming one language's safety net exists in another is a real, common bug.

## More Topics Like This (harder wording, for extra reading)
- **Dynamic arrays** (C++'s `vector`, Python's `list`) — grow automatically by allocating a new, larger block of memory and copying old elements over once the current capacity is full; this copy cost is why adding an element is described as O(1) *amortized*, not strictly O(1) every single time.
- **Multi-dimensional arrays** — an array of arrays (a grid/matrix), stored either as truly contiguous memory (C++'s 2D array) or as an array of separate row-arrays (common in many languages) — the storage choice affects cache performance in ways that matter at large scale.
