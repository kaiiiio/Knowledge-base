# Rendering Pipeline: Critical Rendering Path

Understanding the browser rendering pipeline helps optimize page load and performance.

## Critical Rendering Path

**Critical Rendering Path** is the sequence of steps browsers take to render a page.

### Steps

```
1. HTML Parsing → DOM Tree
2. CSS Parsing → CSSOM Tree
3. Combine → Render Tree
4. Layout (Reflow) → Calculate positions
5. Paint → Fill pixels
6. Composite → Layer composition
```

## DOM and CSSOM Construction

### DOM Tree

```html
<html>
  <body>
    <div>Hello</div>
  </body>
</html>
```

**DOM Tree:**
```
Document
└── html
    └── body
        └── div
            └── "Hello"
```

### CSSOM Tree

```css
body { font-size: 16px; }
div { color: red; }
```

**CSSOM Tree:**
```
StyleSheet
└── body
    └── font-size: 16px
└── div
    └── color: red
```

## Render Tree

**Render Tree** combines DOM and CSSOM, excluding non-visible elements.

```javascript
// Render tree only includes visible elements
// - Excludes: <head>, <script>, display: none
// - Includes: visible elements with styles
```

## Layout (Reflow)

**Layout** calculates element positions and sizes.

```javascript
// Reflow triggers:
// - Window resize
// - Element size changes
// - DOM manipulation
// - Style changes

// Minimize reflows:
// - Batch DOM updates
// - Use transform instead of position
// - Read then write (avoid layout thrashing)
```

## Paint

**Paint** fills pixels based on layout.

```javascript
// Paint operations:
// - Fill background
// - Draw borders
// - Render text
// - Apply images
```

## Composite

**Composite** combines layers into final image.

```javascript
// Compositing:
// - Combines painted layers
// - Handles transforms, opacity
// - GPU-accelerated
```

## Performance Optimization

### Minimize Reflows

```javascript
// ❌ Bad: Multiple reflows
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// ✅ Good: Single reflow
element.style.cssText = 'width: 100px; height: 100px; margin: 10px;';

// ✅ Better: Use classes
element.className = 'new-style';
```

### Use Transform

```javascript
// ❌ Bad: Triggers reflow
element.style.left = '100px';

// ✅ Good: GPU-accelerated, no reflow
element.style.transform = 'translateX(100px)';
```

## Best Practices

1. **Minimize Reflows**: Batch DOM updates
2. **Use Transform**: For animations
3. **Critical CSS**: Inline above-the-fold CSS
4. **Lazy Load**: Defer non-critical resources
5. **Optimize Images**: Compress, use modern formats

## Summary

**Rendering Pipeline:**

1. **Steps**: HTML → DOM, CSS → CSSOM, Render Tree, Layout, Paint, Composite
2. **Optimization**: Minimize reflows, use transform
3. **Performance**: Critical CSS, lazy loading
4. **Best Practice**: Batch updates, GPU acceleration
5. **Metrics**: LCP, FID, CLS

**Key Takeaway:**
Rendering pipeline includes DOM/CSSOM construction, render tree, layout, paint, and composite. Minimize reflows by batching updates. Use transform for animations (GPU-accelerated). Optimize critical rendering path with inline CSS and lazy loading. Monitor performance metrics.

**Rendering Strategy:**
- Minimize reflows
- Use transform
- Critical CSS
- Lazy load
- Optimize images

**Next Steps:**
- Learn [DOM Manipulation](dom_manipulation.md) for elements
- Study [Performance](../07_performance/) for optimization
- Master [CSSOM](cssom_cascade.md) for styling

