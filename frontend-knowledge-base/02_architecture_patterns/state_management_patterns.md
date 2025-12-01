# State Management Patterns: Local, Global, and Libraries

State management is crucial for building scalable frontend applications. This guide covers various state management patterns.

## Local State

**Local state** is component-specific state.

### React Local State

```javascript
import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
}
```

### Vue Local State

```vue
<script setup>
import { ref } from 'vue';

const count = ref(0);
</script>

<template>
    <div>
        <p>Count: {{ count }}</p>
        <button @click="count++">Increment</button>
    </div>
</template>
```

## Global State

### React Context API

```javascript
// Create context
const ThemeContext = React.createContext();

// Provider
function App() {
    const [theme, setTheme] = useState('dark');
    
    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <Toolbar />
        </ThemeContext.Provider>
    );
}

// Consumer
function Toolbar() {
    const { theme, setTheme } = useContext(ThemeContext);
    return <div className={theme}>Toolbar</div>;
}
```

### Vue Provide/Inject

```vue
<!-- Parent -->
<script setup>
import { provide, ref } from 'vue';

const theme = ref('dark');
provide('theme', theme);
</script>

<!-- Child -->
<script setup>
import { inject } from 'vue';

const theme = inject('theme');
</script>
```

## State Management Libraries

### Redux (React)

```javascript
import { createStore } from 'redux';

// Reducer
function counterReducer(state = { count: 0 }, action) {
    switch (action.type) {
        case 'increment':
            return { count: state.count + 1 };
        case 'decrement':
            return { count: state.count - 1 };
        default:
            return state;
    }
}

// Store
const store = createStore(counterReducer);

// Use
store.dispatch({ type: 'increment' });
console.log(store.getState());  // { count: 1 }
```

### Pinia (Vue)

```javascript
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
    state: () => ({
        count: 0
    }),
    actions: {
        increment() {
            this.count++;
        }
    },
    getters: {
        doubleCount: (state) => state.count * 2
    }
});

// Use
const store = useCounterStore();
store.increment();
console.log(store.count);  // 1
```

## Best Practices

1. **Start Local**: Use local state when possible
2. **Lift State**: Lift state up when needed
3. **Global State**: Use for shared state
4. **Libraries**: Use when complexity grows
5. **Performance**: Optimize state updates

## Summary

**State Management Patterns:**

1. **Local State**: Component-specific
2. **Global State**: Shared across components
3. **Libraries**: Redux, Pinia, Zustand
4. **Best Practice**: Start local, lift when needed
5. **Performance**: Optimize updates

**Key Takeaway:**
State management patterns range from local to global. Start with local state. Lift state up when components need to share. Use global state (Context, Provide/Inject) for shared state. Use libraries (Redux, Pinia) when complexity grows. Optimize state updates for performance.

**State Strategy:**
- Start with local state
- Lift when needed
- Use global for shared
- Libraries for complexity
- Optimize updates

**Next Steps:**
- Learn [Data Fetching](data_fetching_patterns.md) for APIs
- Study [Component Architecture](component_architecture.md) for structure
- Master [Performance](../07_performance/) for optimization

