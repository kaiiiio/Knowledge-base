# Patterns (Nested Loop Printing)

Simple words, step by step. "Patterns" means printing shapes (like triangles, squares, pyramids) made of stars or numbers, using loops inside loops. This is not really a new idea — it's just **practice at controlling loops carefully**, which you will need everywhere later.

## The big rule for every pattern
Every pattern problem has two loops:
1. **Outer loop** — controls the **rows** (how many lines you print).
2. **Inner loop** — controls the **columns** (what goes on each line).

Always ask two questions before coding any pattern:
- "How many rows are there, and how does the row number (`i`) change things?"
- "For row `i`, how many things do I print, and does that count depend on `i`?"

## Pattern 1: Simple square
```
* * * *
* * * *
* * * *
* * * *
```
```cpp
for (int i = 1; i <= 4; i++) {         // 4 rows
    for (int j = 1; j <= 4; j++) {     // 4 stars every row, always
        cout << "* ";
    }
    cout << endl;                       // move to the next line after each row
}
```
```python
for i in range(1, 5):          # 4 rows
    for j in range(1, 5):      # 4 stars every row, always
        print("*", end=" ")
    print()                      # move to the next line after each row
```
```javascript
for (let i = 1; i <= 4; i++) {          // 4 rows
    let row = "";
    for (let j = 1; j <= 4; j++) {      // 4 stars every row, always
        row += "* ";
    }
    console.log(row);                    // print the whole row, then move to a new line
}
```
**Nothing here depends on the row number** — every row prints the same 4 stars. This is the simplest pattern; every harder pattern is really just "the inner loop's count changes based on `i`."

## Pattern 2: Right triangle
```
*
* *
* * *
* * * *
```
```cpp
for (int i = 1; i <= 4; i++) {          // 4 rows
    for (int j = 1; j <= i; j++) {      // row i prints exactly i stars
        cout << "* ";
    }
    cout << endl;
}
```
```python
for i in range(1, 5):           # 4 rows
    for j in range(1, i + 1):   # row i prints exactly i stars
        print("*", end=" ")
    print()
```
```javascript
for (let i = 1; i <= 4; i++) {          // 4 rows
    let row = "";
    for (let j = 1; j <= i; j++) {      // row i prints exactly i stars
        row += "* ";
    }
    console.log(row);
}
```
**The one change that matters**: the inner loop now runs `j <= i` instead of a fixed number — so row 1 prints 1 star, row 2 prints 2 stars, and so on. This single change (fixed count → count depends on `i`) is the entire trick behind almost every triangle-shaped pattern.

## Pattern 3: Inverted right triangle
```
* * * *
* * *
* *
*
```
```cpp
for (int i = 4; i >= 1; i--) {          // count DOWN instead of up
    for (int j = 1; j <= i; j++) {
        cout << "* ";
    }
    cout << endl;
}
```
```python
for i in range(4, 0, -1):        # count DOWN from 4 to 1 (the -1 is the step)
    for j in range(1, i + 1):
        print("*", end=" ")
    print()
```
```javascript
for (let i = 4; i >= 1; i--) {          // count DOWN instead of up
    let row = "";
    for (let j = 1; j <= i; j++) {
        row += "* ";
    }
    console.log(row);
}
```
**The change**: just flip the outer loop's direction (counting down instead of up). The inner loop logic stays exactly the same as Pattern 2.

## Pattern 4: Pyramid (with spaces)
```
   *
  * *
 * * *
* * * *
```
```cpp
int n = 4;
for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= n - i; j++) {   // print spaces first
        cout << "  ";
    }
    for (int j = 1; j <= i; j++) {       // then print stars
        cout << "* ";
    }
    cout << endl;
}
```
```python
n = 4
for i in range(1, n + 1):
    for j in range(1, n - i + 1):    # print spaces first
        print("  ", end="")
    for j in range(1, i + 1):        # then print stars
        print("* ", end="")
    print()
```
```javascript
let n = 4;
for (let i = 1; i <= n; i++) {
    let row = "";
    for (let j = 1; j <= n - i; j++) {   // print spaces first
        row += "  ";
    }
    for (let j = 1; j <= i; j++) {       // then print stars
        row += "* ";
    }
    console.log(row);
}
```
**The new idea here**: two inner loops, one after another, in the same row — one for spaces (to push the stars to the middle), one for stars. This "two inner loops per row" shape is how every centered pattern (pyramids, diamonds) is built.

## The general checklist for solving ANY pattern
1. Count the rows. What controls the outer loop?
2. For each row `i`, write down (on paper) how many stars, and how many spaces, that specific row needs. Look for the pattern in those numbers as `i` changes.
3. Turn each of those counts into its own inner loop.
4. Always remember `cout << endl;` after finishing one row, or everything prints on one single line.

## Rules to remember (C++ specific)
- `cout << endl;` moves to a new line (like `print()` in Python automatically does at the end of every `print` call, unless told not to with `end=""`).
- Nested loops in C++ and Python work the same way logically; the only real difference is C++ needs curly braces `{ }` to group the loop body, while Python uses indentation (spacing) to show what is "inside" a loop — no braces at all.

## More Topics Like This (harder wording, for extra reading)
- **Diamond and hourglass patterns** — combine an upward triangle and a downward triangle (Patterns 2 and 3 above) stacked together.
- **Number and character patterns** (printing `1 2 3`, `A B C`, or Pascal's-triangle-style patterns) — same nested-loop skeleton, just replacing the fixed `"* "` with a value computed from `i` and `j`.



