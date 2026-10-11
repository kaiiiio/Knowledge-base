# The Celebrity Problem — Stack-Based Elimination

Simple words, step by step.

## The question
In a room of `n` people, a "celebrity" is someone who **everyone else knows**, but **who knows no one else**. Given a matrix `knows[a][b]` (true if person `a` knows person `b`), find the celebrity, if one exists.

## Brute Force
For each candidate, check if every other person knows them, and that they know no one.
```python
def find_celebrity_brute(knows, n):
    for candidate in range(n):
        is_celebrity = True
        for other in range(n):
            if candidate == other:
                continue
            if not knows[other][candidate] or knows[candidate][other]:
                is_celebrity = False
                break
        if is_celebrity:
            return candidate
    return -1
```
**Speed**: O(n²) — checking every candidate against every other person.

## Optimal — Stack-Based Elimination
Push everyone onto a stack. Repeatedly pop two people and compare: if A knows B, A **cannot** be the celebrity (celebrities know no one) — discard A, keep B. If A does NOT know B, B **cannot** be the celebrity (everyone must know the celebrity) — discard B, keep A. After this elimination process, exactly one candidate remains — verify them with one final pass.

```python
def find_celebrity_optimal(knows, n):
    stack = list(range(n))

    while len(stack) > 1:
        a = stack.pop()
        b = stack.pop()
        if knows[a][b]:
            stack.append(b)     # a knows b -- a is disqualified, b survives
        else:
            stack.append(a)     # a doesn't know b -- b is disqualified, a survives

    candidate = stack[0]

    # Final verification pass -- the elimination narrows it down, but doesn't GUARANTEE a celebrity exists
    for other in range(n):
        if other != candidate:
            if not knows[other][candidate] or knows[candidate][other]:
                return -1          # no celebrity exists
    return candidate
```
```javascript
function findCelebrityOptimal(knows, n) {
    const stack = Array.from({ length: n }, (_, i) => i);

    while (stack.length > 1) {
        const a = stack.pop();
        const b = stack.pop();
        if (knows[a][b]) {
            stack.push(b);         // a knows b -- a is disqualified, b survives
        } else {
            stack.push(a);         // a doesn't know b -- b is disqualified, a survives
        }
    }

    const candidate = stack[0];

    // Final verification pass -- elimination narrows it down, doesn't GUARANTEE a celebrity exists
    for (let other = 0; other < n; other++) {
        if (other !== candidate) {
            if (!knows[other][candidate] || knows[candidate][other]) {
                return -1;           // no celebrity exists
            }
        }
    }
    return candidate;
}
```
**Speed**: O(n) — the elimination phase does `n-1` comparisons (each one permanently eliminates exactly one person), and the verification phase is one more O(n) pass — O(n) + O(n) = O(n) overall, a major improvement over the O(n²) brute force.

## Rules to remember
- **The elimination phase alone does NOT prove a celebrity exists** — it only ever narrows the field down to a single remaining *candidate*. The final verification pass is mandatory; skipping it is the single most common bug on this exact problem, since the elimination logic "looks complete" without it.
- Each comparison (`knows[a][b]`) permanently removes exactly one person from contention — this is why `n-1` comparisons are enough to narrow `n` people down to 1 candidate, giving the O(n) elimination phase.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Solve without an explicit stack, using two pointers instead
```python
def find_celebrity_two_pointer(knows, n):
    candidate_a, candidate_b = 0, n - 1
    while candidate_a < candidate_b:
        if knows[candidate_a][candidate_b]:
            candidate_a += 1          # a knows b -- a is disqualified
        else:
            candidate_b -= 1           # a doesn't know b -- b is disqualified

    candidate = candidate_a   # at this point, candidate_a == candidate_b
    for other in range(n):
        if other != candidate:
            if not knows[other][candidate] or knows[candidate][other]:
                return -1
    return candidate
```
**The trap**: this achieves the exact same O(n) elimination as the stack version, without the stack's O(n) extra memory — recognizing that "repeatedly discard one of two candidates based on a comparison" doesn't strictly require a stack (a stack just happens to be the natural way to first think about the elimination order) is a valuable space-optimization insight, parallel to many other "can we drop the explicit auxiliary structure" twists throughout this course.

### Twist 2: What if MULTIPLE people could independently satisfy the celebrity definition?
This can't actually happen if the problem's rules are followed strictly — if two different people, A and B, both qualified as celebrities, then by the celebrity definition, A would have to know B (since B is a celebrity whom everyone must know) — but a celebrity, by definition, knows no one. This is a direct contradiction, which proves **at most one celebrity can ever exist** in a valid input. **The trap**: this means you never need code to "resolve ties between celebrities" — if the input is logically consistent, there is mathematically only ever zero or one possible answer.

## Interview Q&A

**Q1: Why is the final verification pass mandatory, even after the elimination phase?**
The elimination phase only ever determines "if a celebrity exists, this is who it must be" — it never checks "does a celebrity actually exist at all." It's entirely possible for the elimination process to run to completion and leave a candidate who still fails the actual celebrity criteria (someone doesn't know them, or they know someone) — in which case the correct answer is "no celebrity exists," which only the verification pass can reveal.

**Q2: Why does eliminating one person per comparison correctly guarantee the answer is found in O(n) comparisons?**
Each comparison between two people definitively rules out exactly one of them as a possible celebrity (never both, and never neither) — if A knows B, A is disqualified (a celebrity can't know anyone); if A doesn't know B, B is disqualified (everyone must know the celebrity, so if A doesn't, B can't be it). Since exactly one person is eliminated per comparison, and there are `n` people to narrow down to 1, exactly `n-1` comparisons are needed — giving the linear time complexity.

**Q3: Can you prove that at most one celebrity can exist in any valid set of "knows" relationships?**
Yes — suppose two different people, A and B, were both celebrities. By definition, a celebrity is known by everyone else, so B (being a celebrity) must be known by A — meaning A knows B. But also by definition, a celebrity knows no one else, so A (also being a celebrity) must know no one, including B — a direct contradiction (A simultaneously must and must not know B). Therefore, at most one celebrity can exist.
