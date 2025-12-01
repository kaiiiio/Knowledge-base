# Vue Reactivity System: Deep Dive

Vue's reactivity system automatically tracks dependencies and updates the DOM. Understanding reactivity is crucial for Vue development.

## Reactivity in Vue 2

**Vue 2** uses `Object.defineProperty` for reactivity.

```javascript
// Vue 2 reactivity
function defineReactive(obj, key, val) {
    const dep = new Dep();
    
    Object.defineProperty(obj, key, {
        get() {
            // Track dependency
            if (Dep.target) {
                dep.depend();
            }
            return val;
        },
        set(newVal) {
            if (newVal === val) return;
            val = newVal;
            // Trigger update
            dep.notify();
        }
    });
}
```

## Reactivity in Vue 3

**Vue 3** uses `Proxy` for reactivity.

```javascript
// Vue 3 reactivity
function reactive(target) {
    return new Proxy(target, {
        get(target, key, receiver) {
            // Track dependency
            track(target, key);
            return Reflect.get(target, key, receiver);
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);
            
            if (oldValue !== value) {
                // Trigger update
                trigger(target, key);
            }
            
            return result;
        }
    });
}
```

## ref and reactive

### ref

```javascript
import { ref } from 'vue';

// ref wraps primitive values
const count = ref(0);

// Access value with .value
console.log(count.value);  // 0
count.value++;  // Increment
```

### reactive

```javascript
import { reactive } from 'vue';

// reactive for objects
const state = reactive({
    count: 0,
    name: 'Vue'
});

// Direct access (no .value)
console.log(state.count);  // 0
state.count++;  // Increment
```

## Computed Properties

```javascript
import { ref, computed } from 'vue';

const count = ref(0);
const doubleCount = computed(() => count.value * 2);

// Computed is cached
// Only recalculates when dependencies change
console.log(doubleCount.value);  // 0
count.value = 5;
console.log(doubleCount.value);  // 10
```

## Watchers

```javascript
import { ref, watch, watchEffect } from 'vue';

const count = ref(0);

// watch: Watch specific source
watch(count, (newValue, oldValue) => {
    console.log(`Count changed from ${oldValue} to ${newValue}`);
});

// watchEffect: Watch all dependencies
watchEffect(() => {
    console.log(`Count is ${count.value}`);
});
```

## Real-World Examples

### Example 1: Reactive Form

```vue
<script setup>
import { ref, computed } from 'vue';

const form = reactive({
    email: '',
    password: '',
    confirmPassword: ''
});

const isFormValid = computed(() => {
    return form.email && 
           form.password && 
           form.password === form.confirmPassword;
});

const errors = computed(() => {
    const errs = {};
    if (form.email && !form.email.includes('@')) {
        errs.email = 'Invalid email';
    }
    if (form.password && form.password.length < 8) {
        errs.password = 'Password too short';
    }
    if (form.password !== form.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
});
</script>
```

## Best Practices

1. **Use ref**: For primitives
2. **Use reactive**: For objects
3. **Computed**: For derived state
4. **Watch**: For side effects
5. **Performance**: Avoid deep reactivity when not needed

## Summary

**Vue Reactivity System:**

1. **Vue 2**: Object.defineProperty
2. **Vue 3**: Proxy
3. **ref/reactive**: Create reactive values
4. **Computed**: Derived state
5. **Watch**: Side effects

**Key Takeaway:**
Vue's reactivity system automatically tracks dependencies and updates the DOM. Vue 3 uses Proxy for better performance. Use ref for primitives, reactive for objects. Use computed for derived state. Use watch for side effects. Understand reactivity for optimal performance.

**Reactivity Strategy:**
- Use ref for primitives
- Use reactive for objects
- Computed for derived state
- Watch for side effects
- Understand Proxy benefits

**Next Steps:**
- Learn [Vue Composition API](vue_composition_api.md) for advanced patterns
- Study [Vue Performance](vue_performance.md) for optimization
- Master [Vue Patterns](vue_patterns.md) for best practices

