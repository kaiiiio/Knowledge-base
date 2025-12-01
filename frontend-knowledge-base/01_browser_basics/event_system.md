# Event System: Capturing, Bubbling, and Delegation

Understanding the browser event system is crucial for handling user interactions efficiently.

## Event Phases

**Events** flow through three phases: capturing, target, and bubbling.

### Event Flow

```
┌─────────────────────────────────┐
│  Capture Phase (top → target)   │
├─────────────────────────────────┤
│  Target Phase (on element)      │
├─────────────────────────────────┤
│  Bubble Phase (target → top)    │
└─────────────────────────────────┘
```

### Example

```html
<div id="outer">
    <div id="inner">
        <button id="button">Click</button>
    </div>
</div>
```

```javascript
// Event flow: outer → inner → button → inner → outer

document.getElementById('outer').addEventListener('click', (e) => {
    console.log('Outer (capture)', e.eventPhase);  // 1 (CAPTURING_PHASE)
}, true);  // Capture phase

document.getElementById('inner').addEventListener('click', (e) => {
    console.log('Inner (bubble)', e.eventPhase);  // 3 (BUBBLING_PHASE)
}, false);  // Bubble phase

document.getElementById('button').addEventListener('click', (e) => {
    console.log('Button (target)', e.eventPhase);  // 2 (AT_TARGET)
});
```

## Event Delegation

**Event delegation** attaches event listeners to parent elements.

```javascript
// ❌ Bad: Attach to each element
document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', handleClick);
});

// ✅ Good: Delegate to parent
document.getElementById('list').addEventListener('click', (e) => {
    if (e.target.classList.contains('item')) {
        handleClick(e);
    }
});
```

## Real-World Examples

### Example 1: Dynamic List with Delegation

```javascript
function addItem(text) {
    const list = document.getElementById('list');
    const item = document.createElement('li');
    item.className = 'item';
    item.textContent = text;
    list.appendChild(item);
}

// Single event listener for all items
document.getElementById('list').addEventListener('click', (e) => {
    if (e.target.classList.contains('item')) {
        console.log('Clicked:', e.target.textContent);
    }
});

// Add items dynamically - no need to attach listeners
addItem('Item 1');
addItem('Item 2');
```

## Best Practices

1. **Event Delegation**: Use for dynamic content
2. **Capture vs Bubble**: Understand phases
3. **Stop Propagation**: Use stopPropagation() carefully
4. **Prevent Default**: Use preventDefault() when needed
5. **Performance**: Delegate events for efficiency

## Summary

**Event System:**

1. **Phases**: Capture, target, bubble
2. **Delegation**: Attach to parent
3. **Best Practice**: Use delegation for dynamic content
4. **Performance**: Fewer listeners, better performance
5. **Use Cases**: Dynamic lists, tables, forms

**Key Takeaway:**
Events flow through capture, target, and bubble phases. Event delegation attaches listeners to parent elements, improving performance for dynamic content. Use delegation for lists, tables, and dynamic content. Understand when to use capture vs bubble phase.

**Event Strategy:**
- Use delegation
- Understand phases
- Stop propagation when needed
- Prevent default appropriately
- Optimize for performance

**Next Steps:**
- Learn [DOM Manipulation](dom_manipulation.md) for elements
- Study [Rendering Pipeline](rendering_pipeline.md) for performance
- Master [CSSOM](cssom_cascade.md) for styling

