# Memoization & Lazy Evaluation: Performance Optimization

Memoization and lazy evaluation are optimization techniques for improving performance and reducing computation.

## Memoization

**Memoization** caches function results to avoid recomputation.

### Basic Memoization

```javascript
// Simple memoization
function memoize(fn) {
    const cache = {};
    
    return function(...args) {
        const key = JSON.stringify(args);
        
        if (cache[key]) {
            return cache[key];
        }
        
        const result = fn.apply(this, args);
        cache[key] = result;
        return result;
    };
}

// Use
const expensiveFunction = memoize(function(n) {
    console.log('Computing...');
    return n * 2;
});

expensiveFunction(5);  // Computing..., 10
expensiveFunction(5);  // 10 (from cache)
```

### Memoization with WeakMap

```javascript
// Memoization with WeakMap (for object keys)
function memoizeWeak(fn) {
    const cache = new WeakMap();
    
    return function(obj) {
        if (cache.has(obj)) {
            return cache.get(obj);
        }
        
        const result = fn(obj);
        cache.set(obj, result);
        return result;
    };
}
```

## Lazy Evaluation

**Lazy Evaluation** delays computation until value is needed.

### Lazy Arrays

```javascript
// Lazy array evaluation
function* lazyRange(start, end) {
    for (let i = start; i < end; i++) {
        yield i;
    }
}

// Values computed on demand
const range = lazyRange(0, 1000000);
const first = range.next().value;  // Only computes first value
```

### Lazy Functions

```javascript
// Lazy function evaluation
function lazy(fn) {
    let computed = false;
    let value;
    
    return function() {
        if (!computed) {
            value = fn();
            computed = true;
        }
        return value;
    };
}

// Use
const expensiveValue = lazy(() => {
    console.log('Computing expensive value...');
    return computeExpensiveValue();
});

// Value computed only when accessed
const result = expensiveValue();  // Computing...
const result2 = expensiveValue();  // Cached
```

## Real-World Examples

### Example 1: Fibonacci with Memoization

```javascript
// Fibonacci without memoization (slow)
function fib(n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

// Fibonacci with memoization (fast)
const memoizedFib = memoize(function(n) {
    if (n <= 1) return n;
    return memoizedFib(n - 1) + memoizedFib(n - 2);
});

memoizedFib(40);  // Fast
```

### Example 2: Lazy Data Loading

```javascript
// Lazy data loading
function createLazyLoader(url) {
    let data = null;
    let loading = false;
    
    return {
        get: async function() {
            if (data) return data;
            if (loading) {
                // Wait for ongoing load
                return new Promise(resolve => {
                    const check = setInterval(() => {
                        if (data) {
                            clearInterval(check);
                            resolve(data);
                        }
                    }, 100);
                });
            }
            
            loading = true;
            const response = await fetch(url);
            data = await response.json();
            loading = false;
            return data;
        }
    };
}

const loader = createLazyLoader('/api/data');
const data = await loader.get();  // Loads only when accessed
```

### Example 3: Memoized API Calls

```javascript
// Memoize API calls
const memoizedFetch = memoize(async function(url) {
    const response = await fetch(url);
    return response.json();
});

// First call: fetches data
const data1 = await memoizedFetch('/api/users');

// Second call: returns cached data
const data2 = await memoizedFetch('/api/users');
```

## Best Practices

1. **Use Memoization**: For expensive, pure functions
2. **Cache Keys**: Use appropriate cache key strategy
3. **Memory**: Be aware of memory usage
4. **Lazy Evaluation**: For potentially unused computations
5. **Invalidation**: Implement cache invalidation when needed

## Summary

**Memoization & Lazy Evaluation:**

1. **Memoization**: Cache function results
2. **Lazy Evaluation**: Delay computation until needed
3. **Use Cases**: Expensive computations, API calls
4. **Best Practice**: Use for pure functions, be aware of memory
5. **Performance**: Significant performance improvements

**Key Takeaway:**
Memoization caches function results to avoid recomputation. Lazy evaluation delays computation until needed. Use for expensive, pure functions. Be aware of memory usage. Implement cache invalidation when needed. Significant performance improvements for repeated computations.

**Optimization Strategy:**
- Memoize expensive functions
- Lazy evaluation for unused data
- Cache key strategy
- Memory awareness
- Cache invalidation

**Next Steps:**
- Learn [Currying](currying_partial_application.md) for functional patterns
- Study [Performance](../21_performance_optimization/) for optimization
- Master [Generators](../01_fundamentals/generators_iterators.md) for lazy sequences

