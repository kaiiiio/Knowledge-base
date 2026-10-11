# Fractional Knapsack (Greedy)

Simple words, step by step.

## The question
Given items, each with a `weight` and a `value`, and a knapsack with a maximum weight capacity — you're allowed to take FRACTIONS of an item (not just whole items) — maximize the total value carried.

## Why GREEDY works here (but will NOT work for 0/1 Knapsack, file 143)
Because fractions are allowed, the optimal strategy is beautifully simple: always prioritize items with the highest **value-per-unit-weight ratio** first, taking as much of each as possible before moving to the next-best ratio. This greedy strategy is PROVABLY optimal specifically because fractions are allowed — there's no scenario where "saving room" for a worse-ratio item ever beats greedily maximizing ratio first, since any leftover capacity can always be filled with a FRACTION of the current best-ratio item.

```python
def fractional_knapsack(capacity, items):          # items = list of (weight, value)
    items_with_ratio = sorted(items, key=lambda item: item[1] / item[0], reverse=True)    # sort by value/weight, descending
    total_value = 0.0
    remaining_capacity = capacity

    for weight, value in items_with_ratio:
        if remaining_capacity <= 0:
            break
        if weight <= remaining_capacity:
            total_value += value                       # take the WHOLE item
            remaining_capacity -= weight
        else:
            fraction = remaining_capacity / weight
            total_value += value * fraction              # take a FRACTION of this item -- fill remaining capacity exactly
            remaining_capacity = 0

    return total_value
```
```javascript
function fractionalKnapsack(capacity, items) {        // items = list of [weight, value]
    const itemsWithRatio = [...items].sort((a, b) => (b[1] / b[0]) - (a[1] / a[0]));     // sort by value/weight, descending
    let totalValue = 0;
    let remainingCapacity = capacity;

    for (const [weight, value] of itemsWithRatio) {
        if (remainingCapacity <= 0) break;
        if (weight <= remainingCapacity) {
            totalValue += value;                           // take the WHOLE item
            remainingCapacity -= weight;
        } else {
            const fraction = remainingCapacity / weight;
            totalValue += value * fraction;                  // take a FRACTION of this item -- fill remaining capacity exactly
            remainingCapacity = 0;
        }
    }

    return totalValue;
}
```
**Speed**: O(n log n) — dominated entirely by the sort; the subsequent greedy pass is a single O(n) linear scan.

## Rules to remember
- **"Fractions allowed" is the single condition that makes greedy provably correct here** — this is the central, most important conceptual checkpoint of this entire topic: the MOMENT items must be taken whole-or-not-at-all (0/1 Knapsack, file 143), this exact greedy strategy stops being optimal, and a fundamentally different approach (DP) becomes necessary.
- The greedy proof intuition (not a full formal proof, but the right mental model): since any leftover capacity can always be filled with a fraction of whatever item is currently being considered, there's never a scenario where "holding back" from the current best-ratio item to "save room" for something else could possibly help — greedily maximizing ratio, one item at a time, is always at least as good as any alternative ordering.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Why does this EXACT same greedy approach fail for 0/1 Knapsack?
**The trap**: this is the single most important conceptual bridge to the next file — once items can no longer be fractionally split, taking the highest-ratio item FIRST might consume capacity that would have been better allocated to a COMBINATION of two slightly-lower-ratio items that together fit more efficiently and yield more total value; greedy's core assumption (unused capacity can always be filled with a fraction of the current item) breaks down completely once that fractional "filling" option is removed, which is EXACTLY why 0/1 Knapsack requires considering combinations via DP rather than a single greedy pass.

### Twist 2: Multiple items happen to have the IDENTICAL value-per-weight ratio — does tie-breaking order matter?
**The trap**: no — this is a reassuring confirmation, not a hidden trap. When several items share the exact same ratio, taking them in ANY relative order among themselves still produces the same optimal total value, since they're all equally "efficient" uses of capacity; the specific tie-breaking rule used by the sort (stable vs. unstable, or any arbitrary secondary key) has no effect on the final optimal total value in this fractional-allowed setting.

## Interview Q&A

**Q1: Why is the greedy strategy of "always take the highest value-per-weight ratio item first" provably optimal for Fractional Knapsack, but not for 0/1 Knapsack?**
In Fractional Knapsack, any leftover capacity after considering an item can ALWAYS be filled with a fraction of the next item under consideration — meaning there's never a scenario where greedily prioritizing the best available ratio could "waste" capacity in a way that prevents an equally good or better use of that capacity elsewhere; filling the capacity with the best available ratio, continuously, is always at least as good as any other allocation strategy. In 0/1 Knapsack, items must be taken entirely or not at all — this means a greedy choice (take the best-ratio item) might consume capacity in a way that CAN'T be perfectly "topped off," leaving some capacity unusable in a way that a different combination of items (perhaps with slightly lower individual ratios, but better combined whole-number fit) might have used more effectively — the fractional "perfect topping off" guarantee that makes greedy provably safe in the fractional case simply doesn't exist once whole-item-only constraints are introduced.

**Q2: Why does sorting items by value-per-weight ratio, rather than by value alone or by weight alone, produce the optimal greedy strategy?**
Value-per-weight ratio directly measures "how much value is gained per unit of the scarce resource (capacity) consumed" — this is precisely the quantity that should be maximized when capacity is the binding constraint. Sorting by value alone would ignore how much capacity each item actually consumes to achieve that value (a very heavy item with high absolute value might still be a poor use of limited capacity compared to a lighter item with slightly lower absolute value but much higher value PER unit of capacity used); sorting by weight alone would ignore value entirely. The ratio specifically captures the tradeoff between the two competing concerns (maximize value, minimize capacity consumed) in a single comparable number, which is exactly what makes it the correct greedy criterion for this specific resource-allocation structure.

**Q3: What is the deeper, generalizable lesson about greedy algorithms that the contrast between Fractional Knapsack and 0/1 Knapsack illustrates?**
Greedy algorithms are only PROVABLY correct when the problem's structure guarantees that a locally optimal choice (the best immediate option available) never forecloses a better globally optimal outcome — this guarantee has to be explicitly verified for each specific problem, not just assumed because a greedy-sounding strategy seems intuitively reasonable. Fractional Knapsack happens to have exactly this guarantee (thanks to the ability to perfectly "top off" any remaining capacity with a fraction), making greedy provably optimal; 0/1 Knapsack's whole-item-only constraint removes this guarantee, meaning a greedy choice CAN foreclose better combinations, which is precisely why a more exhaustive approach (considering all relevant combinations via DP) becomes necessary — this contrast is a canonical illustration of why "it looks greedy" is never sufficient justification on its own; the specific structural property enabling greedy's correctness must be identified and confirmed for each individual problem.
