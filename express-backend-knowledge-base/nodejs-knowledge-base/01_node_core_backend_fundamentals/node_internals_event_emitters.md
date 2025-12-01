# Node.js Internals: Event Emitters & Native Addons

Understanding Node.js internals helps optimize applications and build native addons. This guide covers event emitters and N-API.

## Event Emitters

**EventEmitter** is the foundation of Node.js's event-driven architecture.

### Basic EventEmitter

```javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const emitter = new MyEmitter();

// Listen to event
emitter.on('event', (data) => {
    console.log('Event received:', data);
});

// Emit event
emitter.emit('event', { message: 'Hello' });
```

### EventEmitter Patterns

```javascript
// Once: Listen only once
emitter.once('connect', () => {
    console.log('Connected');
});

// Remove listener
emitter.removeListener('event', handler);

// Remove all listeners
emitter.removeAllListeners('event');

// Get listeners
const listeners = emitter.listeners('event');

// Max listeners (prevent memory leaks)
emitter.setMaxListeners(20);
```

## Real-World Examples

### Example 1: Custom Event Emitter

```javascript
class Database extends EventEmitter {
    constructor() {
        super();
        this.connected = false;
    }
    
    connect() {
        setTimeout(() => {
            this.connected = true;
            this.emit('connected');
        }, 1000);
    }
    
    query(sql) {
        if (!this.connected) {
            this.emit('error', new Error('Not connected'));
            return;
        }
        
        // Simulate query
        setTimeout(() => {
            this.emit('result', { sql, rows: [] });
        }, 100);
    }
}

// Use
const db = new Database();

db.on('connected', () => {
    console.log('Database connected');
    db.query('SELECT * FROM users');
});

db.on('result', (data) => {
    console.log('Query result:', data);
});

db.on('error', (error) => {
    console.error('Database error:', error);
});

db.connect();
```

## Native Addons (N-API)

**N-API** allows creating native addons that work across Node.js versions.

### Basic N-API Addon

```cpp
// addon.cpp
#include <node_api.h>

napi_value Add(napi_env env, napi_callback_info info) {
    size_t argc = 2;
    napi_value args[2];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
    
    double value1, value2;
    napi_get_value_double(env, args[0], &value1);
    napi_get_value_double(env, args[1], &value2);
    
    napi_value result;
    napi_create_double(env, value1 + value2, &result);
    
    return result;
}

napi_value Init(napi_env env, napi_value exports) {
    napi_value fn;
    napi_create_function(env, nullptr, 0, Add, nullptr, &fn);
    napi_set_named_property(env, exports, "add", fn);
    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
```

### Using Native Addon

```javascript
const addon = require('./build/Release/addon');

const result = addon.add(2, 3);
console.log(result);  // 5
```

## Best Practices

1. **Event Emitters**: Use for event-driven architecture
2. **Memory Leaks**: Set max listeners, remove listeners
3. **Native Addons**: Use N-API for compatibility
4. **Performance**: Native addons for CPU-intensive tasks
5. **Error Handling**: Handle errors in event emitters

## Summary

**Node.js Internals:**

1. **Event Emitters**: Foundation of event-driven architecture
2. **N-API**: Native addons API
3. **Best Practice**: Handle memory leaks, use N-API
4. **Use Cases**: Event-driven systems, performance-critical code
5. **Benefits**: Extensibility, performance

**Key Takeaway:**
EventEmitter is the foundation of Node.js's event-driven architecture. Use for custom event systems. N-API allows creating native addons that work across Node.js versions. Handle memory leaks by setting max listeners and removing listeners. Native addons provide performance for CPU-intensive tasks.

**Internals Strategy:**
- Use EventEmitter for events
- Handle memory leaks
- Use N-API for addons
- Monitor performance
- Test thoroughly

**Next Steps:**
- Learn [Event Loop](event_loop_libuv.md) for async operations
- Study [Performance](../12_performance_optimization/) for optimization
- Master [Deployment](../13_devops_deployment/) for production

