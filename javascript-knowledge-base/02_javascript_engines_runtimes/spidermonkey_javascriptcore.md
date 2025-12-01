# SpiderMonkey & JavaScriptCore: Engine Differences

Understanding different JavaScript engines helps write performant, cross-browser compatible code.

## SpiderMonkey (Firefox)

**SpiderMonkey** is Mozilla's JavaScript engine used in Firefox.

### Architecture

```javascript
// SpiderMonkey components:
// - Parser: Parses JavaScript
// - Interpreter: Baseline interpreter
// - IonMonkey: Optimizing compiler
// - WarpMonkey: New optimizing compiler (2021+)

// SpiderMonkey optimizations:
// - Inline caching
// - Type inference
// - JIT compilation
```

### SpiderMonkey Characteristics

```javascript
// SpiderMonkey features:
// - Good at: Object property access, function calls
// - Optimizations: IonMonkey, WarpMonkey
// - Memory: Generational GC
// - Performance: Competitive with V8
```

## JavaScriptCore (Safari)

**JavaScriptCore** (JSC) is Apple's JavaScript engine used in Safari and WebKit.

### Architecture

```javascript
// JavaScriptCore components:
// - Parser: LLInt (Low Level Interpreter)
// - Baseline JIT: Fast JIT compiler
// - DFG (Data Flow Graph): Optimizing compiler
// - FTL (Faster Than Light): Highest optimization tier

// JavaScriptCore optimizations:
// - Value representation (NaN boxing)
// - Inline caching
// - Polymorphic inline caching
```

### JavaScriptCore Characteristics

```javascript
// JavaScriptCore features:
// - Good at: Array operations, numeric operations
// - Optimizations: DFG, FTL
// - Memory: Conservative GC
// - Performance: Excellent for Safari
```

## Engine Comparison

### Performance Characteristics

```javascript
// V8 (Chrome, Node.js):
// - Fast startup
// - Good at: Numeric operations, string operations
// - TurboFan optimization

// SpiderMonkey (Firefox):
// - Good at: Object operations, function calls
// - IonMonkey/WarpMonkey optimization

// JavaScriptCore (Safari):
// - Good at: Array operations, numeric operations
// - DFG/FTL optimization
```

### Optimization Strategies

```javascript
// Each engine optimizes differently:
// - V8: Hidden classes, inline caching
// - SpiderMonkey: Type inference, shape analysis
// - JavaScriptCore: Value representation, PIC

// Write code that works well across engines:
// - Consistent object shapes
// - Avoid type changes in hot code
// - Use appropriate data structures
```

## Real-World Examples

### Example 1: Cross-Engine Compatibility

```javascript
// Code that works well across engines
function processData(items) {
    // Consistent object shapes
    const results = [];
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // Monomorphic access
        results.push({
            id: item.id,
            value: item.value * 2
        });
    }
    
    return results;
}
```

### Example 2: Engine-Specific Optimizations

```javascript
// V8: Prefers arrays over objects for numeric keys
const array = [1, 2, 3];  // Fast in V8

// All engines: Consistent shapes
const obj = { a: 1, b: 2, c: 3 };  // Fast if shape consistent
```

## Best Practices

1. **Test Across Engines**: Test in Chrome, Firefox, Safari
2. **Consistent Shapes**: Keep object shapes consistent
3. **Avoid Type Changes**: Don't change types in hot code
4. **Profile**: Use engine-specific profilers
5. **Polyfills**: Use polyfills for missing features

## Summary

**SpiderMonkey & JavaScriptCore:**

1. **SpiderMonkey**: Firefox engine, IonMonkey/WarpMonkey
2. **JavaScriptCore**: Safari engine, DFG/FTL
3. **Differences**: Optimization strategies vary
4. **Best Practice**: Write cross-engine compatible code
5. **Performance**: Each engine has strengths

**Key Takeaway:**
SpiderMonkey powers Firefox with IonMonkey/WarpMonkey. JavaScriptCore powers Safari with DFG/FTL. Each engine optimizes differently. Write code that works across engines. Test in multiple browsers. Use consistent object shapes for best performance.

**Engine Strategy:**
- Test across engines
- Consistent object shapes
- Avoid type changes
- Profile with engine tools
- Cross-browser compatibility

**Next Steps:**
- Learn [V8 Internals](v8_internals.md) for V8 specifics
- Study [Performance](../21_performance_optimization/) for optimization
- Master [Memory Model](../01_fundamentals/memory_model_garbage_collection.md) for memory

