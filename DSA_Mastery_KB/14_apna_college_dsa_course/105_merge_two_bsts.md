# Merge Two BSTs

Simple words, step by step.

## The question
Given two BSTs, return all their values combined into a single sorted list (or, as a variant, build a brand-new balanced BST containing all values from both).

## The idea: reuse "merge two sorted lists" (file 58) directly
Convert each BST to its inorder traversal (sorted list, per the central BST fact), then merge those two sorted lists together using the exact same two-pointer merge technique from Merge Sort (file 29) / Merge Two Sorted Lists (file 58).

```python
def merge_two_bsts(root1, root2):
    def inorder(node, result):
        if not node:
            return
        inorder(node.left, result)
        result.append(node.val)
        inorder(node.right, result)

    list1, list2 = [], []
    inorder(root1, list1)
    inorder(root2, list2)

    # standard two-pointer merge of two sorted lists
    merged = []
    i = j = 0
    while i < len(list1) and j < len(list2):
        if list1[i] <= list2[j]:
            merged.append(list1[i])
            i += 1
        else:
            merged.append(list2[j])
            j += 1
    merged.extend(list1[i:])
    merged.extend(list2[j:])
    return merged
```
```javascript
function mergeTwoBSTs(root1, root2) {
    function inorder(node, result) {
        if (!node) return;
        inorder(node.left, result);
        result.push(node.val);
        inorder(node.right, result);
    }

    const list1 = [], list2 = [];
    inorder(root1, list1);
    inorder(root2, list2);

    const merged = [];
    let i = 0, j = 0;
    while (i < list1.length && j < list2.length) {
        if (list1[i] <= list2[j]) {
            merged.push(list1[i]);
            i += 1;
        } else {
            merged.push(list2[j]);
            j += 1;
        }
    }
    while (i < list1.length) merged.push(list1[i++]);
    while (j < list2.length) merged.push(list2[j++]);
    return merged;
}
```
**Speed**: O(m + n) — O(m) and O(n) to produce each inorder list, then O(m + n) to merge them. Total O(m + n).

## Variant: produce a balanced BST from the merged result
Simply feed the merged sorted list into file 99's "Sorted Array to Balanced BST" algorithm directly:
```python
def merge_two_bsts_to_balanced_bst(root1, root2):
    merged = merge_two_bsts(root1, root2)
    return sorted_array_to_bst(merged)      # reusing file 99's function unchanged
```
**This is a direct, clean composition of two already-solved subproblems** — recognizing "merge, then convert to balanced BST" as "chain together two things I already know how to do" rather than inventing a new combined algorithm from scratch is itself the key skill being tested.

## Rules to remember
- **This entire problem is a composition of two previously-learned techniques** (inorder traversal for sorted extraction, two-pointer merge for combining sorted sequences) — there's no new algorithmic idea here, only recognizing which existing tools apply and in what order. This "compose known subroutines" skill becomes increasingly important as problems grow more complex throughout an interview.
- A tempting but inferior alternative is inserting every node of one BST into the other one at a time (reusing file 98's `insert_bst`) — this works but can degrade to O(n²) if the resulting tree becomes skewed, exactly analogous to file 104's Approach 2 tradeoff discussion.

## Twisted Tricky Examples (with Solutions)

### Twist 1: Merge while REMOVING duplicate values (values present in both trees should appear only once in the result)
```python
def merge_two_bsts_dedup(root1, root2):
    merged = merge_two_bsts(root1, root2)
    deduped = []
    for val in merged:
        if not deduped or deduped[-1] != val:      # only add if different from the last added value
            deduped.append(val)
    return deduped
```
**The trap**: because the merged list is already sorted, duplicates are guaranteed to be **adjacent** to each other — meaning deduplication can be done in a single additional O(m+n) pass by just comparing each value to the previously-kept one, rather than needing a hash set (which would still work, but is an unnecessary O(m+n) extra space usage when the adjacency guarantee from sortedness already makes the simpler approach correct).

### Twist 2: Merge in O(1) EXTRA space (not counting the output itself) — is this achievable?
**The trap**: this is a "recognize a genuine limitation" trap — achieving a true O(1) extra-space merge of two separate BSTs into fully sorted output, without using the Morris Traversal idea (file 96) for BOTH trees simultaneously in a carefully interleaved fashion, is quite advanced and rarely expected; a reasonable interview answer is to propose using Morris inorder traversal (O(1) space) for extracting each tree's sorted sequence instead of a standard recursive inorder (which uses O(h) stack space), explicitly acknowledging the tradeoff and complexity involved, rather than claiming a trivial full O(1) solution exists for the complete merge-and-construct pipeline.

## Interview Q&A

**Q1: Why does converting each BST to its inorder traversal before merging make this problem straightforward, rather than needing a BST-specific merge algorithm?**
Because inorder traversal converts the BST-specific structural problem into a well-understood, general "merge two sorted lists" problem — once both BSTs are reduced to sorted lists via inorder traversal (file 85's core fact), the actual merging step has nothing BST-specific left in it at all; it's literally the same two-pointer merge used in Merge Sort (file 29) and Merge Two Sorted Lists (file 58), applied unchanged. Recognizing this reduction avoids having to design a new, BST-structure-aware merging algorithm from scratch.

**Q2: Why is repeatedly inserting every node from one BST into the other (one `insert_bst` call per node) a worse approach than the inorder-and-merge technique, despite being conceptually simpler to write?**
Repeated insertion can degrade to O(n²) time in the worst case, specifically if the combined tree ends up skewed (for instance, inserting already-sorted values one at a time produces a linked-list-shaped BST, where each subsequent insertion costs O(current size) instead of O(log current size)). The inorder-and-merge approach guarantees O(m + n) time regardless of either input tree's shape, since it never depends on maintaining BST structure during the merge process itself — it only extracts sorted data and merges lists, sidestepping the skew-related worst case entirely.

**Q3: If asked to additionally remove duplicate values from the merged result, why is a simple adjacent-comparison pass sufficient, rather than needing a hash set to track seen values?**
Because the merged list is already fully sorted by construction (a direct consequence of merging two already-sorted lists) — any duplicate values are therefore guaranteed to sit immediately next to each other in the merged sequence, with no other distinct values able to appear between two equal values in sorted order. This means checking only "is this value equal to the immediately preceding kept value" is sufficient to catch every duplicate, with no need for the extra O(m+n) space a hash-set-based approach would require to track all previously seen values across the entire list.
