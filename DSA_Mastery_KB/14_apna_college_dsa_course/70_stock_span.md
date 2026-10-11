# Stock Span Problem — Monotonic Stack

Simple words, step by step.

## The question
For each day's stock price, find the **span** — how many consecutive days (including today) up to and before today had a price **less than or equal to** today's price, before hitting a day with a higher price.

Example: prices `[100, 80, 60, 70, 60, 75, 85]` → spans `[1, 1, 1, 2, 1, 4, 6]`.

## Brute Force
For each day, walk backward until a higher price is found.
```python
def stock_span_brute(prices):
    n = len(prices)
    spans = [0] * n
    for i in range(n):
        span = 1
        j = i - 1
        while j >= 0 and prices[j] <= prices[i]:
            span += 1
            j -= 1
        spans[i] = span
    return spans
```
```javascript
function stockSpanBrute(prices) {
    const n = prices.length;
    const spans = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let span = 1;
        let j = i - 1;
        while (j >= 0 && prices[j] <= prices[i]) {
            span++;
            j--;
        }
        spans[i] = span;
    }
    return spans;
}
```
**Speed**: O(n²) worst case — for a strictly increasing price sequence, every day walks all the way back to day 0.

## Optimal — Monotonic Stack
Keep a stack of **indices**, maintained so that the prices at those indices are in **strictly decreasing** order from bottom to top. For each new day, pop off every index whose price is less than or equal to today's price (those days are now "covered" by today's higher price) — each pop means that index's span reaches all the way back to whatever remains on the stack.
```python
def stock_span_optimal(prices):
    n = len(prices)
    spans = [0] * n
    stack = []        # stores INDICES, prices at those indices stay decreasing top-to-bottom... bottom-to-top

    for i in range(n):
        while stack and prices[stack[-1]] <= prices[i]:
            stack.pop()                       # this earlier day is "dominated" by today's price
        spans[i] = i - stack[-1] if stack else i + 1
        stack.append(i)
    return spans
```
```javascript
function stockSpanOptimal(prices) {
    const n = prices.length;
    const spans = new Array(n).fill(0);
    const stack = [];     // stores INDICES, prices at those indices stay decreasing

    for (let i = 0; i < n; i++) {
        while (stack.length > 0 && prices[stack[stack.length - 1]] <= prices[i]) {
            stack.pop();                       // this earlier day is "dominated" by today's price
        }
        spans[i] = stack.length > 0 ? i - stack[stack.length - 1] : i + 1;
        stack.push(i);
    }
    return spans;
}
```
**Speed**: O(n) — this is the key claim to be able to justify: even though there's a `while` loop inside the `for` loop, **each index is pushed exactly once and popped at most once, ever**, across the entire run — so the total number of pop operations across all iterations combined cannot exceed `n`. This "amortized O(1) per element" argument is the single most important thing to be able to explain about every monotonic stack problem in this file.

**Watching it work** on `[100, 80, 60, 70, 60, 75, 85]`:
```
i=0 (100): stack empty -> span=0-(-1)=1, push 0 -> stack=[0]
i=1 (80):  80<=100? top is 100, no pop -> span=1-0=1, push 1 -> stack=[0,1]
i=2 (60):  60<=80? no pop -> span=2-1=1, push 2 -> stack=[0,1,2]
i=3 (70):  70<=60? no... wait check top: prices[2]=60<=70 -> POP 2
           now top is 1 (price 80): 80<=70? no -> stop popping
           span=3-1=2, push 3 -> stack=[0,1,3]
i=4 (60):  60<=70(top)? no pop -> span=4-3=1, push 4 -> stack=[0,1,3,4]
i=5 (75):  75>=60(top,i=4)? pop 4. 75>=70(top,i=3)? pop 3. 75>=80(top,i=1)? no, stop.
           span=5-1=4, push 5 -> stack=[0,1,5]
i=6 (85):  85>=75(top,i=5)? pop 5. 85>=80(top,i=1)? pop 1. 85>=100(top,i=0)? no, stop.
           span=6-0=6, push 6 -> stack=[0,6]
Final spans: [1,1,1,2,1,4,6]  (matches!)
```

## Rules to remember
- **Why store indices, not values**: the span is a *distance* (how many days back), which requires knowing position, not just price. Storing values alone would lose the information needed to compute `i - stack[-1]`.
- **This is the first "monotonic stack" problem in this course** — the core pattern (pop everything that violates a monotonic order before pushing the new element) reappears, nearly unchanged, in every file from here through Largest Rectangle in Histogram. Internalizing this one file deeply pays off across the rest of the module.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Span based on STRICTLY greater (not "less than or equal to")
Just flip the pop condition from `<=` to `<`:
```python
while stack and prices[stack[-1]] < prices[i]:
    stack.pop()
```
**The trap**: this single-character change (`<=` vs `<`) alters how ties are handled — with `<=`, equal prices get absorbed into the span (as in the original problem); with strict `<`, an equal price stops the popping, treating it as a "blocking" day rather than a dominated one. Problems rarely spell this distinction out explicitly in plain English — reading the exact comparison operator expected (often inferable only from a worked example in the problem statement) is a genuine, easy-to-miss trap.

### Twist 2: Return the actual span-starting DAY (not just the span LENGTH)
```python
def stock_span_with_day(prices):
    n = len(prices)
    start_days = [0] * n
    stack = []
    for i in range(n):
        while stack and prices[stack[-1]] <= prices[i]:
            stack.pop()
        start_days[i] = stack[-1] + 1 if stack else 0
        stack.append(i)
    return start_days
```
**The trap**: "span length" and "the index the span starts from" are off by a subtraction from each other (`span = i - start_day + 1`) — candidates sometimes answer the wrong one of these two closely related quantities when a problem is phrased ambiguously.

## Interview Q&A

**Q1: How do you prove this algorithm is O(n) overall, given the nested while loop?**
Each index is pushed onto the stack exactly once (once per iteration of the outer loop) and can be popped at most once (it can never be pushed again after being popped). Since the total number of pushes across the whole algorithm is exactly `n`, the total number of pops across the whole algorithm cannot exceed `n` either — so even though a single iteration's while loop *could* pop many elements, the *sum* of all pop operations across every iteration combined is bounded by `n`, giving O(n) total work, not O(n²).

**Q2: Why must the stack store indices rather than prices?**
Because the span calculation needs the *distance* between the current day and the nearest earlier day with a higher price — that's a position-based quantity. Storing only prices would tell you *that* an earlier day had a higher price, but not *how far back* it was, which is the actual value the problem asks for.

**Q3: What invariant does the stack maintain at all times, and why is that invariant useful?**
At every point, the stack holds indices whose corresponding prices are in strictly decreasing order from bottom to top. This invariant means that whenever a new price arrives, you only ever need to compare it against the stack's current top — if it's bigger, that top is now irrelevant to all *future* days too (since the current day's price "shadows" it with a smaller index gap), so it's safe to permanently discard, keeping future comparisons efficient.
