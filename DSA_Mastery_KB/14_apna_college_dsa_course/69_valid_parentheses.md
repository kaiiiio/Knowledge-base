# Valid Parentheses

Simple words, step by step.

## The question
Given a string containing only `(`, `)`, `{`, `}`, `[`, `]`, determine if the brackets are properly balanced and correctly nested — every opening bracket has a matching closing bracket of the same type, in the correct order.

Example: `"([{}])"` is valid. `"([)]"` is NOT valid (the brackets cross each other incorrectly).

## Why this is a stack problem
Nesting is exactly what a stack is built for: when you see an opening bracket, push it (you're now "inside" it, waiting for its match). When you see a closing bracket, it must match whatever is **currently on top** of the stack (the most recently opened, still-unclosed bracket) — if it doesn't match, the string is invalid.

```python
def is_valid(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}

    for char in s:
        if char in '([{':
            stack.append(char)                  # opening bracket -- push it
        else:
            if not stack or stack[-1] != pairs[char]:
                return False                      # closing bracket with no match, or wrong match
            stack.pop()                            # correctly matched -- remove it

    return len(stack) == 0                          # valid only if every opening bracket got matched
```
```javascript
function isValid(s) {
    const stack = [];
    const pairs = { ')': '(', '}': '{', ']': '[' };

    for (const char of s) {
        if ('([{'.includes(char)) {
            stack.push(char);                       // opening bracket -- push it
        } else {
            if (stack.length === 0 || stack[stack.length - 1] !== pairs[char]) {
                return false;                         // closing bracket with no match, or wrong match
            }
            stack.pop();                               // correctly matched -- remove it
        }
    }

    return stack.length === 0;                          // valid only if every opening bracket got matched
}
```
**Speed**: O(n) time, O(n) space (worst case, if the string is all opening brackets).

**Watching it work** on `"([)]"` (the invalid example):
```
'(' -> push -> stack: ['(']
'[' -> push -> stack: ['(', '[']
')' -> closing bracket, needs top to be '(' -- but top is '[' -- MISMATCH -> return False
```
And on `"([{}])"` (valid):
```
'(' -> push -> ['(']
'[' -> push -> ['(', '[']
'{' -> push -> ['(', '[', '{']
'}' -> matches top '{' -- pop -> ['(', '[']
']' -> matches top '[' -- pop -> ['(']
')' -> matches top '(' -- pop -> []
end of string, stack is empty -> VALID
```

## Rules to remember
- **Checking `len(stack) == 0` at the end is essential** — a string like `"((("` never triggers a mismatch during the loop (every character is a valid opening bracket), but it's clearly invalid because those opening brackets never got closed. Forgetting this final check is one of the most common bugs on this exact problem.
- The `if not stack` check before accessing `stack[-1]` prevents a crash on a string like `")"` — a closing bracket with nothing on the stack to match it.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Minimum number of additions to make a string of parentheses valid
Given only `(` and `)` (no other bracket types), find the fewest insertions needed to balance the string.
```python
def min_add_to_make_valid(s):
    open_needed = 0     # unmatched '(' seen so far, waiting for a ')'
    close_needed = 0     # ')' encountered with no '(' to match -- each needs a NEW '(' inserted before it
    for char in s:
        if char == '(':
            open_needed += 1
        else:
            if open_needed > 0:
                open_needed -= 1          # this ')' matches a pending '('
            else:
                close_needed += 1          # this ')' has nothing to match -- will need an inserted '('
    return open_needed + close_needed       # unmatched '(' (needs a ')') + unmatched ')' (needs a '(')
```
**The trap**: this does NOT need an actual stack — just two counters are enough, because with only one bracket type, "does this closing bracket match the most recent opening bracket" collapses into a simple running count. The moment multiple bracket *types* are involved (as in the main problem), a real stack becomes necessary because you must know *which specific* bracket is waiting to be closed, not just *how many*.

### Twist 2: Remove the minimum number of invalid parentheses to make the string valid (return all possible valid results)
This is a significantly harder variant requiring backtracking (from Module 4), not just a stack — you must try removing different combinations of brackets and check validity, pruning branches that can't possibly lead to a valid result. It's flagged here specifically to show how "Valid Parentheses" escalates into a genuinely different algorithm family once the question changes from "check validity" to "fix invalidity with minimum changes."

### Twist 3: Validate parentheses where `*` can represent `(`, `)`, OR an empty string
```python
def check_valid_string(s):
    low = high = 0      # range of possible "open bracket balance" values
    for char in s:
        if char == '(':
            low += 1; high += 1
        elif char == ')':
            low -= 1; high -= 1
        else:                  # '*' -- could be '(', ')', or nothing
            low -= 1; high += 1
        if high < 0:
            return False          # even in the BEST case, too many closing brackets -- invalid
        low = max(low, 0)          # balance can never meaningfully go negative in the best-case tracking
    return low == 0
```
**The trap**: a single stack can't directly represent "this character might be one of three different things" — tracking a **range** of possible balances (`low` to `high`) instead of one exact number is the key insight that generalizes the stack-based idea to handle genuine ambiguity.

## Interview Q&A

**Q1: Why is a stack the right structure for this problem, rather than, say, a simple counter?**
A simple counter only works for a single bracket type (see Twist 1), because it can only track "how many are open," not "which specific bracket is currently open and needs to be closed next." With multiple bracket types that must nest correctly (`([)]` being invalid despite having equal counts of each bracket), you need to know the exact *identity* of the most recently opened, still-unmatched bracket — which is precisely what a stack's top element gives you.

**Q2: What's the time and space complexity, and when would the space complexity be at its worst?**
Time is O(n) — one pass through the string. Space is O(n) in the worst case, which occurs when the string is composed entirely of opening brackets (e.g., `"((((("`) — every character gets pushed, and nothing ever gets popped, so the stack grows to match the full input length.

**Q3: How would you adapt this solution if the brackets could also be interspersed with other, irrelevant characters (like letters)?**
Simply skip (ignore) any character that isn't one of the six bracket characters — add a check at the top of the loop like `if char not in '()[]{}': continue` — the core push/match/pop logic for actual bracket characters remains completely unchanged.
