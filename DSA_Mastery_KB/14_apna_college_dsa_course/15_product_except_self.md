# Product of Array Except Self

Simple words, step by step.

> Full version already in `13_leetcode_pattern_playbook/01_arrays_two_pointers_sliding_window.md` — this is the short version for this course's lecture order.

## The question
For every position in the list, find the product of every *other* number (not the number at that position itself). You are not allowed to use division, and it must run in O(n) time.

Example: `[1, 2, 3, 4]` → answer is `[24, 12, 8, 6]` (for position 0: `2*3*4=24`, and so on).

## Brute Force
For each position, multiply every other number one by one.
```python
def product_except_self_brute(nums):
    n = len(nums)
    result = []
    for i in range(n):
        product = 1
        for j in range(n):
            if i != j:            # skip multiplying the number by itself
                product *= nums[j]
        result.append(product)
    return result
```
```javascript
function productExceptSelfBrute(nums) {
    const n = nums.length;
    const result = [];
    for (let i = 0; i < n; i++) {
        let product = 1;
        for (let j = 0; j < n; j++) {
            if (i !== j) {          // skip multiplying the number by itself
                product *= nums[j];
            }
        }
        result.push(product);
    }
    return result;
}
```
**Speed**: O(n²) — a loop inside a loop.

## Optimal — Prefix and Suffix Products
The answer at any position is: **(product of everything to its left)** times **(product of everything to its right)**. We build both pieces with two simple walks through the list.
```python
def product_except_self_optimal(nums):
    n = len(nums)
    result = [1] * n

    left_product = 1
    for i in range(n):
        result[i] = left_product      # everything to the left of i, multiplied together
        left_product *= nums[i]

    right_product = 1
    for i in range(n - 1, -1, -1):
        result[i] *= right_product     # now multiply in everything to the right of i
        right_product *= nums[i]

    return result
```
```javascript
function productExceptSelfOptimal(nums) {
    const n = nums.length;
    const result = new Array(n).fill(1);

    let leftProduct = 1;
    for (let i = 0; i < n; i++) {
        result[i] = leftProduct;          // everything to the left of i, multiplied together
        leftProduct *= nums[i];
    }

    let rightProduct = 1;
    for (let i = n - 1; i >= 0; i--) {
        result[i] *= rightProduct;         // now multiply in everything to the right of i
        rightProduct *= nums[i];
    }

    return result;
}
```
**Speed**: O(n) — two simple walks through the list, no repeated work, and no division used anywhere.

**Watching it work** on `[1, 2, 3, 4]`:
```
Left pass:
i=0: result[0]=1 (nothing to the left), left_product becomes 1
i=1: result[1]=1,                       left_product becomes 2
i=2: result[2]=2,                       left_product becomes 6
i=3: result[3]=6,                       left_product becomes 24

Right pass:
i=3: result[3] = 6 * 1 = 6,   right_product becomes 4
i=2: result[2] = 2 * 4 = 8,   right_product becomes 12
i=1: result[1] = 1 * 12 = 12, right_product becomes 24
i=0: result[0] = 1 * 24 = 24, right_product becomes 24

Final: [24, 12, 8, 6]   (correct!)
```

## Rules to remember
- The question says "no division" on purpose — a simpler (but disallowed) trick would be to multiply all numbers together once, then divide by each number — but that breaks completely if any number in the list is zero.
- The output array itself does not count as "extra" memory in this problem's rules, since it's the required answer — only the two temporary running-product variables count as the real extra space used, which is why this is described as using O(1) extra space.

## More Topics Like This (harder wording, for extra reading)
- **Trapping Rain Water** uses this exact same prefix-and-suffix-pass shape, applied to heights instead of products.
- **Range Sum Query — Immutable** — the general version of "prefix pass," used for fast range-sum lookups instead of a single except-self product.
