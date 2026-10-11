# Best Time to Buy and Sell Stock + Pow(x, n)

Simple words, step by step.

## Part 1: Best Time to Buy and Sell Stock

> Full version already in `13_leetcode_pattern_playbook/01_arrays_two_pointers_sliding_window.md` — this is the short version for this course's lecture order.

### The question
You are given the price of a stock on different days. You may buy once and sell once (buy day must come before sell day). Find the biggest possible profit.

### Brute Force
```python
def max_profit_brute(prices):
    n = len(prices)
    best = 0
    for i in range(n):
        for j in range(i + 1, n):     # j is always a LATER day than i
            best = max(best, prices[j] - prices[i])
    return best
```
```javascript
function maxProfitBrute(prices) {
    const n = prices.length;
    let best = 0;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {   // j is always a LATER day than i
            best = Math.max(best, prices[j] - prices[i]);
        }
    }
    return best;
}
```
**Speed**: O(n²) — checking every pair of days.

### Optimal
Walk through the prices once, remembering the lowest price seen so far.
```python
def max_profit_optimal(prices):
    lowest_so_far = float('inf')
    best_profit = 0
    for price in prices:
        lowest_so_far = min(lowest_so_far, price)                # track the cheapest buy day so far
        best_profit = max(best_profit, price - lowest_so_far)    # profit if we sold TODAY
    return best_profit
```
```javascript
function maxProfitOptimal(prices) {
    let lowestSoFar = Infinity;
    let bestProfit = 0;
    for (const price of prices) {
        lowestSoFar = Math.min(lowestSoFar, price);                // track the cheapest buy day so far
        bestProfit = Math.max(bestProfit, price - lowestSoFar);   // profit if we sold TODAY
    }
    return bestProfit;
}
```
**Speed**: O(n) — one walk through the list.

## Part 2: Pow(x, n) — Fast Exponentiation

### The question
Calculate `x` raised to the power `n` (that is, `x` multiplied by itself `n` times) — but do it fast, not by multiplying one at a time.

### Brute Force
```python
def pow_brute(x, n):
    result = 1
    for _ in range(n):
        result *= x           # one multiplication per step -- slow for big n
    return result
```
```javascript
function powBrute(x, n) {
    let result = 1;
    for (let i = 0; i < n; i++) {
        result *= x;            // one multiplication per step -- slow for big n
    }
    return result;
}
```
**Speed**: O(n) — one multiplication per step, so `n` steps total.

### Optimal — Fast Power (Binary Exponentiation)
The trick: `x^n` can be broken in half. If `n` is even, `x^n = (x^(n/2))^2`. If `n` is odd, `x^n = x * (x^(n-1))`. This cuts the problem in half every step, instead of counting down one at a time.
```python
def pow_optimal(x, n):
    if n < 0:
        x = 1 / x
        n = -n
    result = 1
    while n > 0:
        if n % 2 == 1:        # n is odd -- take one x out first
            result *= x
        x *= x                 # square x
        n //= 2                 # halve n
    return result
```
```javascript
function powOptimal(x, n) {
    if (n < 0) {
        x = 1 / x;
        n = -n;
    }
    let result = 1;
    while (n > 0) {
        if (n % 2 === 1) {          // n is odd -- take one x out first
            result *= x;
        }
        x *= x;                       // square x
        n = Math.floor(n / 2);        // halve n
    }
    return result;
}
```
**Speed**: O(log n) — because `n` is cut in half every step, instead of shrinking by just 1.

**Watching it work** on `pow(2, 10)`:
```
n=10 (even): x=2*2=4,  n=5
n=5  (odd):  result=1*4=4, x=4*4=16, n=2
n=2  (even): x=16*16=256, n=1
n=1  (odd):  result=4*256=1024, x=..., n=0
loop ends -> answer: 1024   (2^10 = 1024, correct!)
```

## Rules to remember
- Buy/Sell Stock: the buy day must always be **before** the sell day — the running "lowest price so far" trick only works because we walk left to right, always keeping the lowest price *up to this point*, never a price from the future.
- Fast Power: watch out for negative `n` — this is handled by flipping `x` to `1/x` and making `n` positive first, otherwise the halving logic (`n // 2`) breaks on negative numbers.

## More Topics Like This (harder wording, for extra reading)
- **Best Time to Buy and Sell Stock II / III / with Cooldown** — variations allowing multiple transactions, limited transactions, or a cooldown day; these need dynamic programming, not the simple running-minimum trick.
- **Modular exponentiation** (`pow(x, n, mod)`) — the same binary-exponentiation idea, but taking a modulo at every multiplication step to keep numbers from overflowing; essential in cryptography and competitive programming.
