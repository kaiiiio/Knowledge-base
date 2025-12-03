# Strings: Arrays of Characters (But Stricter)

A String is just a sequence of characters, like `['H', 'e', 'l', 'l', 'o']`.
But there is one **Massive Difference**: You cannot change them.

## 1. The Golden Rule: Immutability

> [!IMPORTANT]
> **Strings cannot be changed.**
> If you try to change one letter, Python creates a **whole new string**.

### Visualization
`s = "Cat"`
`s[0] = "R"` -> **ERROR!**

To change "Cat" to "Rat", you must create a new string:
`s = "R" + s[1:]`

```mermaid
graph LR
    Old[Address 100: "Cat"]
    New[Address 200: "Rat"]
    Var[Variable 's']
    
    Var --Points to--> Old
    Var --Update--> New
    
    style Old fill:#ff9,stroke:#333
    style New fill:#9f9,stroke:#333
```

> [!WARNING]
> **The Loop Trap**
> ```python
> # BAD CODE
> s = ""
> for char in huge_list:
>     s += char  # Creates a NEW string 1 million times!
> ```
> **Solution**: Use a list and `join`.
> ```python
> # GOOD CODE
> parts = []
> for char in huge_list:
>     parts.append(char)
> s = "".join(parts) # Creates string ONCE at the end.
> ```

## 2. The Toolkit (Methods you MUST know)

### A. Cleaning & Checking
```python
s = "  Hello World  "

print(s.strip())        # "Hello World" (Removes whitespace)
print(s.lower())        # "  hello world  " (Case insensitive checks)
print(s.startswith(" "))# True
print("World" in s)     # True (Substring check)
```

### B. Splitting & Joining (The Dynamic Duo)
Used constantly in parsing inputs.

```python
# 1. Split: String -> List
sentence = "apple,banana,cherry"
fruits = sentence.split(",")  # ['apple', 'banana', 'cherry']

# 2. Join: List -> String
new_sentence = " - ".join(fruits) # "apple - banana - cherry"
```

### C. Finding Things
```python
s = "banana"

print(s.find("na"))   # 2 (Index of first match)
print(s.find("z"))    # -1 (Not found - Safe!)
# print(s.index("z")) # ERROR! (Don't use this unless you're sure)
```

## 3. Palindromes (The Classic Interview Q)
A palindrome reads the same forwards and backwards.

**The Python One-Liner:**
```python
def is_palindrome(s):
    return s == s[::-1]
```

**The Two-Pointer Way (Memory Efficient):**
```python
def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return False
        l += 1
        r -= 1
    return True
```
