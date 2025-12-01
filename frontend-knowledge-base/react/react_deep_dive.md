# React Deep Dive: Complete Guide

React is a JavaScript library for building user interfaces. This comprehensive guide covers React fundamentals to advanced patterns for mid to senior level engineers.

## What is React?

**React** is a declarative, component-based library for building UIs. It uses a virtual DOM for efficient updates.

### Core Concepts

```javascript
// Component: Building block of React
function Welcome(props) {
    return <h1>Hello, {props.name}</h1>;
}

// JSX: JavaScript XML syntax
const element = <Welcome name="Sara" />;

// Rendering
ReactDOM.render(element, document.getElementById('root'));
```

## JSX Deep Dive

**JSX** is a syntax extension that looks like HTML but is JavaScript.

### JSX Syntax

```javascript
// JSX is syntactic sugar for React.createElement
const element = <h1>Hello, world!</h1>;

// Compiles to:
const element = React.createElement('h1', null, 'Hello, world!');

// JSX with expressions
const name = 'John';
const element = <h1>Hello, {name}</h1>;

// JSX with attributes
const element = <img src={user.avatarUrl} alt={user.name} />;

// JSX with children
const element = (
    <div>
        <h1>Hello!</h1>
        <h2>Good to see you.</h2>
    </div>
);
```

## Components

### Function Components

```javascript
// Simple function component
function Button({ label, onClick }) {
    return <button onClick={onClick}>{label}</button>;
}

// Arrow function component
const Button = ({ label, onClick }) => {
    return <button onClick={onClick}>{label}</button>;
};
```

### Class Components

```javascript
class Button extends React.Component {
    constructor(props) {
        super(props);
        this.state = { clicked: false };
    }
    
    handleClick = () => {
        this.setState({ clicked: true });
    }
    
    render() {
        return (
            <button onClick={this.handleClick}>
                {this.state.clicked ? 'Clicked!' : this.props.label}
            </button>
        );
    }
}
```

## Hooks

### useState

```javascript
import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button>
        </div>
    );
}
```

### useEffect

```javascript
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        // Fetch user data
        fetch(`/api/users/${userId}`)
            .then(res => res.json())
            .then(data => setUser(data));
    }, [userId]);  // Dependency array
    
    if (!user) return <div>Loading...</div>;
    
    return <div>{user.name}</div>;
}
```

### Custom Hooks

```javascript
// Custom hook: useFetch
function useFetch(url) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, [url]);
    
    return { data, loading, error };
}

// Use custom hook
function UserProfile({ userId }) {
    const { data: user, loading, error } = useFetch(`/api/users/${userId}`);
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    
    return <div>{user.name}</div>;
}
```

## Reconciliation & Virtual DOM

**Reconciliation** is React's algorithm for updating the DOM efficiently.

### How It Works

```javascript
// React creates virtual DOM tree
const virtualDOM = {
    type: 'div',
    props: {
        children: [
            { type: 'h1', props: { children: 'Hello' } },
            { type: 'p', props: { children: 'World' } }
        ]
    }
};

// React compares with previous virtual DOM
// Only updates changed nodes
// Updates real DOM efficiently
```

### Keys

```javascript
// Keys help React identify which items changed
function TodoList({ todos }) {
    return (
        <ul>
            {todos.map(todo => (
                <li key={todo.id}>{todo.text}</li>
            ))}
        </ul>
    );
}
```

## State Management

### Local State

```javascript
function Counter() {
    const [count, setCount] = useState(0);
    return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Context API

```javascript
// Create context
const ThemeContext = React.createContext('light');

// Provider
function App() {
    const [theme, setTheme] = useState('dark');
    
    return (
        <ThemeContext.Provider value={theme}>
            <Toolbar />
        </ThemeContext.Provider>
    );
}

// Consumer
function Toolbar() {
    const theme = useContext(ThemeContext);
    return <div className={theme}>Toolbar</div>;
}
```

## Performance Optimization

### useMemo

```javascript
function ExpensiveComponent({ items, filter }) {
    const filteredItems = useMemo(() => {
        return items.filter(item => item.category === filter);
    }, [items, filter]);
    
    return <div>{filteredItems.map(item => <Item key={item.id} item={item} />)}</div>;
}
```

### useCallback

```javascript
function Parent({ items }) {
    const handleClick = useCallback((id) => {
        console.log('Clicked:', id);
    }, []);
    
    return <ChildList items={items} onClick={handleClick} />;
}
```

### React.memo

```javascript
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
    return <div>{/* Expensive rendering */}</div>;
});
```

## Concurrent Features

### Suspense

```javascript
import { Suspense, lazy } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LazyComponent />
        </Suspense>
    );
}
```

### useTransition

```javascript
import { useTransition } from 'react';

function App() {
    const [isPending, startTransition] = useTransition();
    const [tab, setTab] = useState('about');
    
    function selectTab(nextTab) {
        startTransition(() => {
            setTab(nextTab);
        });
    }
    
    return (
        <>
            {isPending && <Spinner />}
            <TabButton onClick={() => selectTab('about')}>About</TabButton>
        </>
    );
}
```

## Real-World Examples

### Example 1: Form Handling

```javascript
function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const newErrors = {};
        if (!email) newErrors.email = 'Email required';
        if (!password) newErrors.password = 'Password required';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        // Submit
        try {
            await login({ email, password });
        } catch (error) {
            setErrors({ submit: error.message });
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span>{errors.email}</span>}
            
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span>{errors.password}</span>}
            
            <button type="submit">Login</button>
        </form>
    );
}
```

## Best Practices

1. **Component Composition**: Compose small components
2. **Hooks Rules**: Only call hooks at top level
3. **Keys**: Always use keys in lists
4. **Performance**: Use memo, useMemo, useCallback
5. **State**: Lift state up when needed

## Summary

**React Deep Dive:**

1. **Core**: Components, JSX, Virtual DOM
2. **Hooks**: useState, useEffect, custom hooks
3. **Performance**: memo, useMemo, useCallback
4. **Concurrent**: Suspense, useTransition
5. **Best Practice**: Composition, performance, state management

**Key Takeaway:**
React is a component-based library using virtual DOM for efficient updates. Use hooks for state and side effects. Optimize with memo, useMemo, and useCallback. Use Suspense for code splitting. Follow hooks rules and component composition patterns.

**React Strategy:**
- Component-based architecture
- Hooks for state/effects
- Performance optimization
- Code splitting
- State management

**Next Steps:**
- Learn [React Hooks Advanced](react_hooks_advanced.md) for advanced patterns
- Study [React Performance](react_performance.md) for optimization
- Master [React Patterns](react_patterns.md) for best practices

