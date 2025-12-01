# DOM Manipulation: Working with the Document Object Model

The DOM (Document Object Model) represents HTML documents as a tree of nodes. Understanding DOM manipulation is essential for frontend development.

## What is the DOM?

**DOM** is a tree structure representing HTML documents. Each element is a node.

### DOM Tree Structure

```html
<html>
  <head>
    <title>Page</title>
  </head>
  <body>
    <div id="app">
      <h1>Hello</h1>
      <p>World</p>
    </div>
  </body>
</html>
```

**DOM Tree:**
```
Document
└── html
    ├── head
    │   └── title
    │       └── "Page"
    └── body
        └── div#app
            ├── h1
            │   └── "Hello"
            └── p
                └── "World"
```

## DOM Manipulation

### Selecting Elements

```javascript
// getElementById
const element = document.getElementById('app');

// querySelector
const element = document.querySelector('#app');
const elements = document.querySelectorAll('.item');

// getElementsByClassName
const elements = document.getElementsByClassName('item');

// getElementsByTagName
const divs = document.getElementsByTagName('div');
```

### Creating Elements

```javascript
// Create element
const div = document.createElement('div');
div.textContent = 'Hello World';
div.className = 'container';

// Append to DOM
document.body.appendChild(div);
```

### Modifying Elements

```javascript
// Modify text
element.textContent = 'New text';
element.innerHTML = '<strong>Bold</strong>';

// Modify attributes
element.setAttribute('id', 'new-id');
element.id = 'new-id';
element.className = 'new-class';

// Modify styles
element.style.color = 'red';
element.style.backgroundColor = 'blue';
```

### Removing Elements

```javascript
// Remove element
element.remove();

// Remove child
parent.removeChild(child);
```

## Real-World Examples

### Example 1: Dynamic List

```javascript
function createListItem(text) {
    const li = document.createElement('li');
    li.textContent = text;
    li.className = 'list-item';
    
    const button = document.createElement('button');
    button.textContent = 'Delete';
    button.onclick = () => li.remove();
    
    li.appendChild(button);
    return li;
}

function addItem(text) {
    const list = document.getElementById('list');
    const item = createListItem(text);
    list.appendChild(item);
}
```

## Best Practices

1. **Use querySelector**: Modern API
2. **Batch Updates**: Update DOM in batches
3. **Document Fragment**: For multiple inserts
4. **Event Delegation**: Delegate events
5. **Performance**: Minimize DOM operations

## Summary

**DOM Manipulation:**

1. **Selection**: querySelector, getElementById
2. **Creation**: createElement, appendChild
3. **Modification**: textContent, innerHTML, attributes
4. **Removal**: remove(), removeChild()
5. **Best Practice**: Batch updates, use fragments

**Key Takeaway:**
DOM manipulation allows programmatic control of HTML. Use querySelector for selection. Create elements with createElement. Modify with textContent, innerHTML, attributes. Remove with remove(). Batch updates for performance. Use document fragments for multiple inserts.

**DOM Strategy:**
- Use modern APIs
- Batch updates
- Use fragments
- Event delegation
- Minimize operations

**Next Steps:**
- Learn [Event System](event_system.md) for interactions
- Study [Rendering Pipeline](rendering_pipeline.md) for performance
- Master [CSSOM](cssom_cascade.md) for styling

