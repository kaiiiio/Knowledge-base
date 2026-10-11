# React 19 & Latest Features: Complete Guide

Complete guide to React 19 (released Dec 2024) and newer APIs — the features most likely to show up in 2025/2026 machine-coding rounds: `useActionState`, `useFormStatus`, `useOptimistic`, Form Actions, the `use()` API, `ref` as a prop, Document Metadata, Custom Elements, and the React Compiler.

## 1. `useActionState` (replaces `useFormState`)

### Question
How do you manage a form's pending state, error state, and result in React 19 without manually wiring up `useState` + `useTransition`?

### Solution

```jsx
import { useActionState } from 'react';

// Simulated server/async call
async function updateNameAction(previousState, formData) {
    const name = formData.get('name');

    await new Promise((resolve) => setTimeout(resolve, 1000)); // fake latency

    if (!name || name.trim().length < 3) {
        return { error: 'Name must be at least 3 characters', name };
    }

    return { error: null, name, success: true };
}

function UpdateNameForm() {
    const [state, formAction, isPending] = useActionState(updateNameAction, {
        error: null,
        name: '',
        success: false,
    });

    return (
        <form action={formAction}>
            <input type="text" name="name" defaultValue={state.name} disabled={isPending} />
            <button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save'}
            </button>

            {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
            {state.success && <p style={{ color: 'green' }}>Saved!</p>}
        </form>
    );
}
```

### Oral Explanation (Interview Ready)

> "**`useActionState`** (formerly `useFormState` in the canary/experimental React DOM APIs) wraps an action function and gives you back `[state, dispatchAction, isPending]`. It removes the boilerplate of manually tracking a 'submitting' flag with `useState` + `useTransition`."

1.  **Signature**: `useActionState(actionFn, initialState, permalink?)`. `actionFn` receives `(previousState, formData)` and must return the new state — this mirrors a reducer, but async.
2.  **Automatic Pending Tracking**: `isPending` is `true` from the moment the action is dispatched until the returned promise resolves — no manual `setIsLoading(true/false)` needed.
3.  **State Threading**: The previous state is automatically passed as the first argument to the next call, so you can accumulate / validate across submissions (e.g., show the last entered value on error).
4.  **Works outside forms too**: You don't have to use it with `<form>` — `formAction` can be called like a normal event handler (`onClick={() => formAction(someFormData)}`), but it's most ergonomic with `<form action={formAction}>`.

### Usage Example

```jsx
function App() {
    return (
        <div>
            <h1>Update Profile</h1>
            <UpdateNameForm />
        </div>
    );
}
```

### Best Practices / Gotchas
- `useActionState` is imported from `react` (not `react-dom`) in React 19, unlike the older experimental `useFormState` which lived in `react-dom`.
- The action function should be resilient to being called multiple times in rapid succession (React will not block double submits automatically — disable the button via `isPending` yourself, as shown above).
- Return a **new object** each time (don't mutate the previous state) to keep state transitions predictable.

---

## 2. `useFormStatus`

### Question
How can a deeply nested child component (e.g., a reusable `<SubmitButton />`) know whether its **parent `<form>`** is currently submitting, without prop drilling?

### Solution

```jsx
import { useFormStatus } from 'react-dom';

// Reusable, form-agnostic submit button
function SubmitButton() {
    const { pending, data, method, action } = useFormStatus();

    return (
        <button type="submit" disabled={pending}>
            {pending ? 'Submitting...' : 'Submit'}
        </button>
    );
}

async function submitFeedback(formData) {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log('Feedback:', formData.get('feedback'));
}

function FeedbackForm() {
    return (
        <form action={submitFeedback}>
            <textarea name="feedback" placeholder="Your feedback..." />
            {/* SubmitButton has NO direct access to FeedbackForm's state,
                yet it knows the submission status via context set up by <form> */}
            <SubmitButton />
        </form>
    );
}
```

### Oral Explanation (Interview Ready)

> "**`useFormStatus`** reads the status of the nearest parent `<form>` — but only works for a component that is **rendered inside** that form, it will NOT work if called in the same component that renders the `<form>` itself."

1.  **Must be a child, not the parent**: Calling `useFormStatus()` directly inside `FeedbackForm` (the component that renders `<form>`) will always return the default/idle status. It must be called from a component that is a **descendant** of the `<form>` JSX element.
2.  **Returned fields**: `pending` (boolean), `data` (the `FormData` being submitted), `method` ('get' | 'post'), and `action` (reference to the action function) — great for building shared `<SubmitButton>`, `<FormSpinner>`, or `<FieldsetDisabler>` components used across many forms.
3.  **Why it matters**: Before this, building a generic "disable while submitting" button required passing `isSubmitting` down as a prop everywhere, or reaching for a library like Formik/React Hook Form just for this.

### Usage Example

```jsx
function App() {
    return <FeedbackForm />;
}
```

### Best Practices / Gotchas
- Imported from `react-dom`, not `react` (it's DOM-specific, tied to the `<form>` element).
- Common mistake: putting `useFormStatus()` in the same component as `<form>` — it returns stale/default values there. Always extract a child component.
- Combine with `useActionState` on the parent and `useFormStatus` on children for a fully decoupled form architecture.

---

## 3. `useOptimistic`

### Question
How do you instantly show a "liked" state or a new todo item in the UI before the server confirms it, and automatically roll back on failure?

### Solution — Optimistic Like Button

```jsx
import { useOptimistic, useState, useTransition } from 'react';

async function likePost(postId) {
    await new Promise((resolve, reject) =>
        setTimeout(() => (Math.random() > 0.1 ? resolve() : reject(new Error('Network error'))), 800)
    );
}

function LikeButton({ postId, initialLikes, initiallyLiked }) {
    const [likes, setLikes] = useState(initialLikes);
    const [liked, setLiked] = useState(initiallyLiked);
    const [isPending, startTransition] = useTransition();

    const [optimisticState, setOptimisticState] = useOptimistic(
        { likes, liked },
        (currentState, newLiked) => ({
            liked: newLiked,
            likes: newLiked ? currentState.likes + 1 : currentState.likes - 1,
        })
    );

    const handleToggleLike = () => {
        const nextLiked = !optimisticState.liked;

        startTransition(async () => {
            setOptimisticState(nextLiked); // instantly update UI
            try {
                await likePost(postId);
                // Confirm: commit the real state once the server succeeds
                setLiked(nextLiked);
                setLikes((prev) => (nextLiked ? prev + 1 : prev - 1));
            } catch (err) {
                // On failure, optimisticState automatically reverts because
                // it is derived from `likes`/`liked`, which we never changed
                console.error('Like failed, reverting:', err.message);
            }
        });
    };

    return (
        <button onClick={handleToggleLike} disabled={isPending}>
            {optimisticState.liked ? '❤️' : '🤍'} {optimisticState.likes}
        </button>
    );
}
```

### Solution — Optimistic Todo List

```jsx
import { useOptimistic, useState, useRef } from 'react';

async function addTodoOnServer(text) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { id: Date.now(), text, sending: false };
}

function OptimisticTodoList() {
    const [todos, setTodos] = useState([{ id: 1, text: 'Learn React 19', sending: false }]);
    const inputRef = useRef(null);

    const [optimisticTodos, addOptimisticTodo] = useOptimistic(
        todos,
        (currentTodos, newTodoText) => [
            ...currentTodos,
            { id: `temp-${Date.now()}`, text: newTodoText, sending: true },
        ]
    );

    async function formAction(formData) {
        const text = formData.get('todo');
        if (!text) return;

        addOptimisticTodo(text); // shows the new item immediately, greyed out
        inputRef.current.value = '';

        const savedTodo = await addTodoOnServer(text); // real persistence
        setTodos((prev) => [...prev, savedTodo]); // reconcile with real state
    }

    return (
        <div>
            <form action={formAction}>
                <input ref={inputRef} name="todo" placeholder="Add a todo" />
                <button type="submit">Add</button>
            </form>
            <ul>
                {optimisticTodos.map((todo) => (
                    <li key={todo.id} style={{ opacity: todo.sending ? 0.5 : 1 }}>
                        {todo.text} {todo.sending && '(sending...)'}
                    </li>
                ))}
            </ul>
        </div>
    );
}
```

### Oral Explanation (Interview Ready)

> "**`useOptimistic`** lets you render a 'hoped-for' version of state immediately, while the real async operation is still in-flight, and then automatically reverts to the real state if you never commit the optimistic change."

1.  **Signature**: `const [optimisticValue, addOptimistic] = useOptimistic(realState, updateFn)`. `updateFn(currentState, actionPayload)` returns what the UI should **temporarily** show.
2.  **Auto-revert on failure**: Because `optimisticValue` is derived from `realState` on every render, if your async action fails and you never call `setRealState(...)`, the optimistic value naturally snaps back to the last confirmed `realState` the next time it re-renders.
3.  **Must be used inside a transition**: Optimistic updates are meant to be set from inside an action / `startTransition`, so React can mark them as interruptible and knows to clean them up correctly.
4.  **Difference vs. manual `useState` hack**: Previously developers manually tracked "pending" copies of state and manually reverted on `catch` — `useOptimistic` encodes this pattern as a primitive, including automatic rollback.

### Usage Example

```jsx
function App() {
    return (
        <div>
            <LikeButton postId={1} initialLikes={42} initiallyLiked={false} />
            <OptimisticTodoList />
        </div>
    );
}
```

### Best Practices / Gotchas
- Always pair it with `useTransition` (or a Form Action) — calling `addOptimistic` outside a transition throws a warning in dev mode.
- Keep the `updateFn` pure and fast — it runs synchronously during render to compute the temporary UI.
- Don't forget to eventually call the **real** state setter (`setLikes`, `setTodos`, etc.) on success — otherwise the optimistic value will revert even though the server succeeded.

---

## 4. Form Actions (`<form action={fn}>`)

### Question
How does React 19 let you pass an async function directly as a form's `action`, and what is "progressive enhancement" in this context?

### Solution

```jsx
// Can be a plain async function — no event.preventDefault() needed!
async function subscribeToNewsletter(formData) {
    const email = formData.get('email');

    const response = await fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error('Subscription failed');
    }
}

function NewsletterForm() {
    return (
        <form action={subscribeToNewsletter}>
            <input type="email" name="email" placeholder="you@example.com" required />
            <button type="submit">Subscribe</button>
        </form>
    );
}
```

Combined with `useActionState` for error/pending handling:

```jsx
import { useActionState } from 'react';

async function subscribeAction(previousState, formData) {
    const email = formData.get('email');
    try {
        const response = await fetch('/api/subscribe', {
            method: 'POST',
            body: JSON.stringify({ email }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error();
        return { success: true, error: null };
    } catch {
        return { success: false, error: 'Could not subscribe. Try again.' };
    }
}

function NewsletterFormWithState() {
    const [state, formAction, isPending] = useActionState(subscribeAction, {
        success: false,
        error: null,
    });

    return (
        <form action={formAction}>
            <input type="email" name="email" required disabled={isPending} />
            <button disabled={isPending}>{isPending ? 'Subscribing...' : 'Subscribe'}</button>
            {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
            {state.success && <p style={{ color: 'green' }}>Subscribed!</p>}
        </form>
    );
}
```

### Oral Explanation (Interview Ready)

> "Before React 19, the `action` attribute on a `<form>` was treated as a plain HTML URL string. React 19 lets you pass a **function** there directly: React calls it with the form's `FormData`, automatically resets uncontrolled inputs on success, and handles pending/error state for you when combined with `useActionState`."

1.  **No manual `preventDefault`**: React intercepts the native form submission itself; you never call `event.preventDefault()` because there's no raw submit `event` — you just get `formData`.
2.  **Automatic form reset**: After an action completes successfully, React automatically resets uncontrolled `<input>` fields (no need to manually clear them via refs), unlike manual `onSubmit` handlers.
3.  **Progressive enhancement**: Because `action` is still a real DOM attribute concept, if the function form is used with Server Actions (e.g., in frameworks like Next.js App Router), the form can still work even before JavaScript hydrates — the browser performs a real POST navigation as a fallback, then React "upgrades" it to a client-side action once hydrated. In a pure client-side SPA (plain React, no server actions), this specific JS-less fallback doesn't apply, but the API shape is designed around that capability.
4.  **Error handling**: If the action function throws, the nearest Error Boundary catches it (for uncaught errors) — or, more commonly, you catch it yourself inside the action and return an error in state (as shown with `useActionState`).

### Usage Example

```jsx
function App() {
    return (
        <div>
            <NewsletterForm />
            <NewsletterFormWithState />
        </div>
    );
}
```

### Best Practices / Gotchas
- You can still use `onSubmit` alongside `action` if you need custom validation before the action runs — call `event.preventDefault()` there to stop the action from firing.
- `formData.get('name')` returns `null` if the field doesn't exist — always guard against `null`/empty strings.
- A `<button formAction={fn}>` inside a form can override the parent form's action for that specific button (useful for "Save Draft" vs "Publish" buttons in the same form).

---

## 5. The `use()` API

### Question
How does `use()` differ from `useContext`/`useEffect`, and how can it read a Promise or Context **conditionally** (inside an `if` or loop), which hooks never allowed?

### Solution — Reading Context Conditionally

```jsx
import { createContext, use, useState } from 'react';

const ThemeContext = createContext('light');

function Box({ showThemed }) {
    // Regular hooks CANNOT be called conditionally — `use()` can!
    let theme = 'default';
    if (showThemed) {
        theme = use(ThemeContext); // ✅ legal — only called when needed
    }

    return <div className={theme}>Box content</div>;
}
```

### Solution — Reading a Promise with Suspense

```jsx
import { Suspense, use } from 'react';

// Simulates fetching user data — returns a Promise
function fetchUser(id) {
    return new Promise((resolve) => {
        setTimeout(() => resolve({ id, name: 'Karan Shah', role: 'FDE' }), 1500);
    });
}

// Cache the promise per id so it isn't re-created on every render
const userPromiseCache = new Map();
function getUserPromise(id) {
    if (!userPromiseCache.has(id)) {
        userPromiseCache.set(id, fetchUser(id));
    }
    return userPromiseCache.get(id);
}

function UserProfile({ userPromise }) {
    // `use()` suspends this component until the promise resolves,
    // and the nearest <Suspense> boundary shows its fallback meanwhile.
    const user = use(userPromise);

    return (
        <div>
            <h2>{user.name}</h2>
            <p>{user.role}</p>
        </div>
    );
}

function App() {
    const userPromise = getUserPromise(1);

    return (
        <Suspense fallback={<p>Loading user...</p>}>
            <UserProfile userPromise={userPromise} />
        </Suspense>
    );
}
```

### Oral Explanation (Interview Ready)

> "**`use()`** is not a traditional hook — it's a new kind of API that can read the value of a resource (a Promise or a Context) and can be called conditionally, inside loops, or after early returns, which violates the 'Rules of Hooks' that `useState`/`useEffect`/`useContext` must follow."

1.  **Two use cases**: (a) `use(Promise)` — suspends the component until the promise settles, integrating with a parent `<Suspense>` boundary for the loading state and an Error Boundary for rejection; (b) `use(Context)` — functionally equivalent to `useContext`, but callable conditionally.
2.  **Not for creating promises in render**: You should NOT create a brand-new promise inside the component body on every render (e.g., `use(fetch(...))` directly) — that would refetch forever. Promises should come from a stable source: a cache, a Suspense-enabled data library (React Query, Relay), or be passed down from a Server Component.
3.  **Replaces some `useEffect` + `useState` fetch patterns**: Instead of `useEffect(() => { fetch().then(setData) }, [])` plus a `loading` boolean, you pass a promise down and let `use()` + `Suspense` handle the loading UI declaratively.
4.  **Error handling**: A rejected promise passed to `use()` throws, and must be caught by an Error Boundary — same mental model as Suspense throwing to the nearest fallback.

### Usage Example

```jsx
import { ErrorBoundary } from 'react-error-boundary';

function RootApp() {
    return (
        <ErrorBoundary fallback={<p>Something went wrong.</p>}>
            <App />
        </ErrorBoundary>
    );
}
```

### Best Practices / Gotchas
- `use()` can be called inside conditionals/loops, but it must still be called during render — not inside a `setTimeout`, event handler, or `useEffect`.
- Always memoize/cache promises passed to `use()` (via `useMemo`, a module-level cache, or a library) — a fresh promise on every render causes an infinite Suspense loop.
- Pairs extremely well with Server Components, where the Promise can originate on the server and be passed straight to a Client Component.

---

## 6. `ref` as a Prop (No More `forwardRef`)

### Question
How did passing refs to custom components change in React 19, and what does the old vs. new code look like?

### Solution — Before (React 18, `forwardRef` required)

```jsx
import { forwardRef, useRef } from 'react';

// React 18: must wrap in forwardRef to accept a ref
const FancyInput = forwardRef(function FancyInput(props, ref) {
    return <input ref={ref} className="fancy-input" {...props} />;
});

function FormOld() {
    const inputRef = useRef(null);
    return (
        <div>
            <FancyInput ref={inputRef} placeholder="Old way" />
            <button onClick={() => inputRef.current.focus()}>Focus (old)</button>
        </div>
    );
}
```

### Solution — After (React 19, `ref` is a normal prop)

```jsx
import { useRef } from 'react';

// React 19: ref is just a regular prop — no forwardRef wrapper needed
function FancyInput({ ref, ...props }) {
    return <input ref={ref} className="fancy-input" {...props} />;
}

function FormNew() {
    const inputRef = useRef(null);
    return (
        <div>
            <FancyInput ref={inputRef} placeholder="New way" />
            <button onClick={() => inputRef.current.focus()}>Focus (new)</button>
        </div>
    );
}
```

### Oral Explanation (Interview Ready)

> "In React 18 and earlier, `ref` was a special prop that React stripped out before your function component ever saw `props` — the only way to receive it was to wrap your component in `forwardRef(props, ref)`. In React 19, function components can simply declare `ref` as a destructured prop, like any other prop."

1.  **Simplification**: This removes an entire category of boilerplate (and the common interview/code-review gotcha of 'why isn't my ref working — did you forget forwardRef?').
2.  **Backward compatible**: `forwardRef` still works in React 19 (it's deprecated, not removed), so existing codebases don't break; new code just doesn't need it.
3.  **Still a special prop under the hood**: You can't do generic things like `console.log(props.ref)` from outside — you still must explicitly destructure `ref` in the function signature to use it, same restriction as before, just without the wrapper.

### Usage Example

```jsx
function App() {
    return <FormNew />;
}
```

### Best Practices / Gotchas
- Codemod tools exist to strip `forwardRef` automatically — but do it incrementally in large codebases, not all at once.
- `ref` as a prop does NOT apply to class components or raw DOM elements differently — this change is specifically about **function components** receiving refs without `forwardRef`.
- `useImperativeHandle` still works exactly the same way for customizing what the parent's ref actually points to.

---

## 7. Document Metadata (`<title>`, `<meta>`, `<link>` in components)

### Question
How can a component render `<title>`, `<meta>`, and `<link>` tags directly, and have React automatically hoist them into `<head>`?

### Solution

```jsx
function BlogPostPage({ post }) {
    return (
        <article>
            {/* React 19 automatically hoists these into <head>, 
                even though they're rendered deep inside <article> */}
            <title>{post.title} | My Blog</title>
            <meta name="description" content={post.excerpt} />
            <meta property="og:title" content={post.title} />
            <meta property="og:image" content={post.coverImage} />
            <link rel="canonical" href={`https://myblog.com/posts/${post.slug}`} />

            <h1>{post.title}</h1>
            <p>{post.body}</p>
        </article>
    );
}

function App() {
    const post = {
        title: 'Understanding React 19',
        excerpt: 'A deep dive into the newest React features.',
        coverImage: '/images/react19-cover.png',
        slug: 'understanding-react-19',
        body: '...',
    };

    return <BlogPostPage post={post} />;
}
```

### Oral Explanation (Interview Ready)

> "Previously, rendering document metadata from deep inside a component tree required a library like `react-helmet`, because `<title>`/`<meta>` tags rendered by a component would just end up incorrectly nested inside `<body>`. In React 19, React recognizes these specific tags anywhere in the tree and automatically moves (hoists) them into `<head>` for you."

1.  **Works in both Client and Server rendering**: Whether server-rendering (SSR) or client-rendering, React de-duplicates and places these tags correctly in `<head>` — during SSR they're streamed into `<head>` before the rest of the content.
2.  **Per-route / per-component metadata**: This is especially powerful for apps with client-side routing — each "page" component can own its own `<title>` and `<meta>` tags without a central metadata registry.
3.  **De-duplication**: If multiple nested components each render a `<title>`, the last one rendered (deepest/closest to being committed) generally wins — similar to how `react-helmet` resolved conflicts, letting child routes override parent defaults.
4.  **No `react-helmet` needed for the basics**: For simple `title`/`meta`/`link` needs, this built-in support removes a common third-party dependency; `react-helmet`-style libraries are still useful for more advanced merge strategies.

### Usage Example

```jsx
function App() {
    return <BlogPostPage post={{ title: 'Hello React 19', excerpt: '...', coverImage: '/a.png', slug: 'hello', body: 'Hi!' }} />;
}
```

### Best Practices / Gotchas
- This only applies to `<title>`, `<meta>`, and `<link>` — other `<head>`-only tags like `<style>`/`<script>` have their own separate (also improved) resource-loading support in React 19, but are conceptually different.
- Don't rely on render order across sibling routes for de-duplication guarantees — if precise control matters, still consider a dedicated metadata-management pattern.
- These tags are plain JSX — you can conditionally render them, interpolate props into them, exactly like any other element.

---

## 8. Improved Custom Elements (Web Components) Support

### Question
What changed in React 19 regarding how props/attributes are passed to native Custom Elements (Web Components)?

### Solution

```jsx
// Assume a Web Component registered elsewhere:
// customElements.define('user-card', class extends HTMLElement { ... });

function Profile({ user }) {
    return (
        <user-card
            // React 19 can now pass complex JS values (objects/arrays) as
            // PROPERTIES on the custom element instance, not just string attributes
            userData={user}
            theme="dark"
            onUserClick={(e) => console.log('Clicked user:', e.detail)}
        />
    );
}
```

### Oral Explanation (Interview Ready)

> "React 19 ships full support for Custom Elements: it now correctly distinguishes between setting a DOM **property** (for complex values like objects, arrays, functions) versus a plain HTML **attribute** (for strings), and it properly forwards custom events. Before this, React would often stringify everything or silently fail to pass non-primitive props to web components."

1.  **Property vs. Attribute Heuristic**: If the value passed is a primitive (string/number/boolean) and matches a known HTML attribute, React sets it as an attribute; otherwise (objects, functions, arrays) it sets it as a JS property directly on the DOM node instance — which is what most Web Components expect for rich data.
2.  **Why it matters**: This makes React finally play nicely as a "host" for Design System web components (common in enterprise micro-frontend setups) without manual `ref`-based workarounds to set properties imperatively.
3.  **Interview relevance**: Mostly a "know it exists" topic — rarely the centerpiece of a machine coding round, but commonly asked as a rapid-fire "what's new in React 19" question.

### Best Practices / Gotchas
- Still test specific Web Components for compatibility — behavior depends on how the custom element itself is authored (attributeChangedCallback vs. property setters).
- Custom event listeners (`onXyz`) on custom elements work differently than on built-in DOM elements — verify the event name casing matches what the Web Component actually dispatches.

---

## 9. React Compiler (RC)

### Question
What is the React Compiler, what does it automatically memoize, and how does it change the advice around `useMemo`, `useCallback`, and `React.memo`?

### Solution — Before (Manual Memoization, React 18 style)

```jsx
import { useMemo, useCallback, memo } from 'react';

const ExpensiveListItem = memo(function ExpensiveListItem({ item, onSelect }) {
    console.log('Rendering item:', item.id);
    return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
});

function ProductList({ products, filterText }) {
    // Manually memoize the derived/filtered list so identity is stable
    const filteredProducts = useMemo(
        () => products.filter((p) => p.name.includes(filterText)),
        [products, filterText]
    );

    // Manually memoize the callback so ExpensiveListItem doesn't re-render needlessly
    const handleSelect = useCallback((id) => {
        console.log('Selected product', id);
    }, []);

    return (
        <ul>
            {filteredProducts.map((product) => (
                <ExpensiveListItem key={product.id} item={product} onSelect={handleSelect} />
            ))}
        </ul>
    );
}
```

### Solution — After (React Compiler enabled)

```jsx
// With the React Compiler enabled (via its Babel/SWC plugin), this is the
// SAME logic, but written without ANY manual memoization. The compiler
// analyzes the component at build time and automatically inserts the
// equivalent of useMemo/useCallback/React.memo behind the scenes.

function ExpensiveListItem({ item, onSelect }) {
    console.log('Rendering item:', item.id);
    return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
}

function ProductList({ products, filterText }) {
    const filteredProducts = products.filter((p) => p.name.includes(filterText));

    const handleSelect = (id) => {
        console.log('Selected product', id);
    };

    return (
        <ul>
            {filteredProducts.map((product) => (
                <ExpensiveListItem key={product.id} item={product} onSelect={handleSelect} />
            ))}
        </ul>
    );
}
```

### Oral Explanation (Interview Ready)

> "The **React Compiler** (previously known as 'React Forget', released as RC in 2024/2025) is a build-time tool that statically analyzes your component and hook code, and automatically inserts fine-grained memoization — the equivalent of `useMemo` for expensive values, `useCallback` for function props, and `React.memo` for components — without you writing any of it by hand."

1.  **What it automatically memoizes**: Any value derived during render (filtered arrays, computed objects, inline callbacks, JSX subtrees) that the compiler can prove is safe to cache gets memoized, so it's only recomputed when its actual dependencies change — mirroring what a careful developer would do manually with `useMemo`/`useCallback`, but comprehensively and consistently across the whole component, not just the spots a developer remembered to optimize.
2.  **Changes the advice around manual memoization**: The new guidance is to **write plain, idiomatic React** and let the compiler handle performance — manually reaching for `useMemo`/`useCallback`/`React.memo` becomes mostly unnecessary in compiler-enabled codebases, and in interviews it's now acceptable (even preferred) to say 'I'd rely on the React Compiler here instead of hand-rolling memoization' for straightforward cases.
3.  **Still relevant to know manual memoization**: Interviewers still expect you to understand *why* `useMemo`/`useCallback`/`React.memo` exist and how they work, because (a) not every codebase has the compiler enabled yet, (b) the compiler has rules it needs your code to follow (the 'Rules of React' — no mutating props/state during render, etc.) to safely apply its optimizations, and (c) there are still edge cases (e.g., memoizing values that must be referentially stable for a dependency array in a *manual* `useEffect`) where you may still reach for them explicitly.
4.  **Opt-in, build-time only**: It's a Babel (or SWC) plugin added to your build pipeline — it doesn't change runtime behavior of hooks like `useState`, it only changes what extra caching code is injected around your component/hook bodies at compile time.
5.  **ESLint plugin integration**: The compiler ships with `eslint-plugin-react-compiler`, which flags code that violates the Rules of React (e.g., mutating a prop, conditionally calling hooks) — because the compiler literally cannot safely optimize code that breaks those rules.

### Usage Example (project setup, conceptual)

```jsx
// babel.config.js (conceptual — syntax may evolve as the compiler matures)
module.exports = {
    plugins: [
        'babel-plugin-react-compiler', // must run before other React-related transforms
    ],
};

// Then write components normally — no useMemo/useCallback/memo needed
// for the common cases, as demonstrated in the "After" example above.
```

### Best Practices / Gotchas
- The compiler relies on your code following the **Rules of React** (pure render functions, no mutating state/props during render, hooks called unconditionally at the top level — except the new `use()` API) — breaking these rules can cause the compiler to skip optimizing that component (it bails out safely rather than producing incorrect behavior).
- It is **incremental/opt-in per directory/file** in many setups, so you can adopt it gradually in a large existing codebase rather than all-or-nothing.
- Don't rip out every `useMemo`/`useCallback` blindly before verifying the compiler is actually enabled and successfully compiling that file — check build output/compiler diagnostics first.
- `React.memo` is still meaningful in one case the compiler doesn't replace: explicitly opting a component out of re-rendering due to context changes when props are unchanged — though in most everyday list/prop-drilling scenarios, the compiler's automatic memoization covers it.

---

## 10. What Changed from React 18: Cheat Sheet

| Feature | React 18 Way | React 19 Way |
|---|---|---|
| Form submission state | Manual `useState` + `useTransition` | `useActionState(action, initialState)` |
| Child reading form status | Prop drilling `isSubmitting` | `useFormStatus()` in a child of `<form>` |
| Optimistic UI | Manual temp state + manual rollback on `catch` | `useOptimistic(state, updateFn)` |
| Form submit handler | `onSubmit={(e) => { e.preventDefault(); ... }}` | `<form action={asyncFn}>` (no `preventDefault`, auto-reset) |
| Reading a Promise in render | `useEffect` + `useState` + loading boolean | `use(promise)` + `<Suspense>` |
| Reading Context conditionally | Not allowed (Rules of Hooks) | `use(Context)` — callable in `if`/loops |
| Passing `ref` to a function component | `forwardRef((props, ref) => ...)` | `function Comp({ ref, ...props })` |
| `<title>`/`<meta>`/`<link>` from a component | `react-helmet` or manual `document.title` | Rendered directly in JSX, auto-hoisted to `<head>` |
| Passing complex props to Web Components | Often stringified/broken | Proper property vs. attribute handling |
| Performance memoization | Manual `useMemo`/`useCallback`/`React.memo` everywhere | React Compiler auto-memoizes; manual use becomes the exception |
| Error messages (hydration, etc.) | Often vague, needed devtools diffing | Significantly improved diffs and messages in React 19 |
| `propTypes` / default props on function components | Supported (with warnings for some) | Removed `propTypes` support for strings refs; use JS/TS default params |

---

### Quick Interview Soundbite

> "React 19's theme is **removing boilerplate around async UI and refs**: `useActionState`/`useFormStatus`/`useOptimistic`/Form Actions collapse the 'pending + error + rollback' dance that used to need `useState` + `useTransition` + manual try/catch; `use()` lets you read promises and context without the Rules-of-Hooks restriction; `ref`-as-a-prop kills the `forwardRef` wrapper; and the React Compiler shifts memoization from something *you* write to something the build step figures out for you — so idiomatic React 19 code reads simpler than equivalent React 18 code, while behaving the same or better at runtime."
