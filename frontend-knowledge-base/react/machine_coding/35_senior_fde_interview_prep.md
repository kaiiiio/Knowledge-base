# Senior MERN / Forward Deployed Engineer (FDE) Interview Preparation

This guide covers senior-level questions for a Forward Deployed Engineer role, focusing on JS runtime internals, React architecture, resilient client-facing system design, and tricky coding implementations relevant to deploying and supporting software directly at client sites.

---

## ⚙️ Round 1: Advanced JS Runtime Internals

### 1. Event Loop: Microtask vs Macrotask Ordering (Tricky Trace)
**Question**: What is the exact output order of the following code, and why?

```javascript
console.log('1: script start');

setTimeout(() => console.log('2: setTimeout'), 0);

Promise.resolve()
  .then(() => console.log('3: promise 1'))
  .then(() => console.log('4: promise 2'));

queueMicrotask(() => console.log('5: queueMicrotask'));

(async function () {
  console.log('6: async start');
  await null;
  console.log('7: async end');
})();

console.log('8: script end');

// Output order:
// 1: script start
// 6: async start
// 8: script end
// 3: promise 1
// 5: queueMicrotask
// 7: async end
// 4: promise 2
// 2: setTimeout
```

**Key Points**:
*   The synchronous call stack always drains first (1, 6, 8 — note `async function` runs synchronously until the first `await`).
*   After the stack is empty, the **entire microtask queue** is drained before a single macrotask (`setTimeout`) runs — and new microtasks queued *during* draining are also processed in the same pass.
*   `await null` schedules the continuation as a microtask, queued *after* `.then(promise 1)` was already registered but *before* `.then(promise 2)` resolves, since each `.then` only queues its callback once the prior one resolves.

### Oral Explanation (Interview Ready)

> "The event loop has one call stack, one macrotask queue, and a microtask queue that drains completely between every macrotask. People get this wrong because they assume `setTimeout(fn, 0)` runs 'immediately after' synchronous code — it doesn't. Every microtask, including ones added while we're still draining the queue, runs first. In this trace, the IIFE is an async function, so it executes synchronously up to the `await`, which is why `'6: async start'` prints before `'8: script end'` — only the code *after* the `await` is deferred as a microtask. Then once the script finishes, we drain microtasks in FIFO order: the queueMicrotask callback, the first `.then`, the async function's resumption, and finally the second chained `.then` which was only queued once the first one resolved. Only after that entire queue is empty does the engine pick up the macrotask queue and run the `setTimeout` callback."

1.  **Chained `.then()` behavior**: Each `.then()` in a chain only gets added to the microtask queue once its predecessor has resolved — so a `.then().then()` chain spans two microtask ticks, not one.
2.  **`await` is sugar for `.then()`**: Code after `await` is functionally a `.then()` callback on the resolved value, so it's subject to the same microtask-queue ordering as any promise continuation.
3.  **Starvation risk**: If microtasks keep queuing more microtasks (e.g., a recursive `Promise.resolve().then()` loop), macrotasks like rendering or timers can be starved indefinitely — this is a real production bug pattern to watch for.

---

### 2. Memory Leaks: WeakMap and WeakRef Use Cases
**Question**: How do you prevent memory leaks when attaching metadata to DOM nodes or caching objects, and when would you reach for `WeakMap`/`WeakRef`?

```javascript
// PROBLEM: using a regular Map leaks every DOM node forever,
// even after it's removed from the document, because the Map
// holds a strong reference to the key.
const metadataLeak = new Map();
function attachMetadata(domNode, data) {
  metadataLeak.set(domNode, data); // node can never be GC'd
}

// SOLUTION: WeakMap holds keys weakly — once the DOM node has
// no other references, both the node and its entry are GC'd.
const metadataSafe = new WeakMap();
function attachMetadataSafe(domNode, data) {
  metadataSafe.set(domNode, data);
}

// WeakRef + FinalizationRegistry: observe when large cached
// objects are actually collected, without preventing collection.
class ImageCache {
  #cache = new Map(); // key -> WeakRef(value)
  #registry = new FinalizationRegistry((key) => {
    console.log(`Evicted ${key} from cache after GC`);
    this.#cache.delete(key);
  });

  set(key, value) {
    this.#cache.set(key, new WeakRef(value));
    this.#registry.register(value, key);
  }

  get(key) {
    const ref = this.#cache.get(key);
    if (!ref) return undefined;
    const value = ref.deref(); // may be undefined if already GC'd
    if (value === undefined) this.#cache.delete(key);
    return value;
  }
}
```

### Oral Explanation (Interview Ready)

> "The classic leak pattern on client sites is attaching event handlers or metadata to DOM nodes via a plain `Map` or a global object, and then the SPA router swaps the view but never clears that Map — the detached nodes stay reachable forever and memory climbs on every navigation. Switching the key storage to a `WeakMap` fixes this for free: once nothing else references that DOM node, the garbage collector can reclaim both the node and its associated entry, because `WeakMap` keys don't count as strong references. `WeakRef` solves a different problem — it lets you hold onto a large object, like a decoded image or a parsed dataset, without preventing it from being collected under memory pressure, and `FinalizationRegistry` lets you react when that cleanup actually happens, which is useful for cache eviction logging or releasing an associated native resource."

1.  **Non-enumerability**: `WeakMap`/`WeakSet` are deliberately not iterable — you can't list their keys, which is precisely what allows unpredictable GC timing without breaking consistency guarantees.
2.  **When not to use `WeakRef`**: It's not a replacement for proper cleanup (removing listeners, unsubscribing) — GC timing is non-deterministic, so `FinalizationRegistry` callbacks must never be relied on for correctness, only for best-effort memory hygiene.
3.  **Real FDE scenario**: On long-running kiosk or dashboard deployments (days without a refresh), this exact leak class is often the root cause of a client site "getting slow after a few hours."

---

### 3. Reactive State via Proxy and Reflect
**Question**: Implement a minimal reactive state object (like the core of Vue 3's reactivity) using `Proxy` and `Reflect`.

```javascript
function reactive(target, onChange) {
  return new Proxy(target, {
    get(obj, key, receiver) {
      const value = Reflect.get(obj, key, receiver);
      // Recursively wrap nested objects so deep mutations are tracked too.
      if (typeof value === 'object' && value !== null) {
        return reactive(value, onChange);
      }
      return value;
    },
    set(obj, key, value, receiver) {
      const oldValue = obj[key];
      const result = Reflect.set(obj, key, value, receiver);
      if (oldValue !== value) {
        onChange({ key, oldValue, newValue: value });
      }
      return result; // must return boolean to satisfy the Proxy invariant
    },
    deleteProperty(obj, key) {
      const existed = key in obj;
      const result = Reflect.deleteProperty(obj, key);
      if (existed) onChange({ key, oldValue: obj[key], newValue: undefined });
      return result;
    },
  });
}

// Usage
const state = reactive({ count: 0, user: { name: 'Karan' } }, (change) => {
  console.log('State changed:', change);
});

state.count++;           // logs { key: 'count', oldValue: 0, newValue: 1 }
state.user.name = 'KS';  // nested mutation also tracked
```

### Oral Explanation (Interview Ready)

> "`Proxy` lets us intercept fundamental operations on an object — get, set, delete — and `Reflect` gives us the default implementation of those same operations so we don't have to reimplement object semantics ourselves, we just wrap them. The trap here is nested objects: a shallow Proxy only intercepts top-level property access, so `state.user.name = 'x'` would bypass our `set` trap entirely unless the `get` trap also wraps any object it returns in a new reactive Proxy — that's what makes deep reactivity work recursively and lazily, only wrapping objects as they're actually accessed rather than eagerly walking the whole tree upfront."

1.  **Why `Reflect` over direct manipulation**: Using `Reflect.set(obj, key, value, receiver)` instead of `obj[key] = value` correctly preserves `this` binding and inheritance behavior when the target has its own Proxy higher up a prototype chain.
2.  **Lazy wrapping**: We only wrap nested objects when `get` is actually called on them, avoiding the cost of deep-cloning the entire state tree upfront — this is exactly how Vue 3's reactivity avoids Vue 2's performance cliff with large objects.
3.  **Invariant enforcement**: Proxy traps have strict return-value contracts (e.g., `set` must return a boolean) — violating them throws a `TypeError`, which is a common debugging gotcha.

---

## 🏗️ Round 2: Senior React Architecture

### 4. Compound Components Pattern
**Question**: Design a `<Tabs>` component using the compound components pattern so consumers control markup/styling while the parent manages shared state implicitly.

```jsx
import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext(null);

function Tabs({ defaultIndex = 0, children }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabList({ children }) {
  return <div className="tab-list" role="tablist">{children}</div>;
}

function Tab({ index, children }) {
  const { activeIndex, setActiveIndex } = useContext(TabsContext);
  return (
    <button
      role="tab"
      aria-selected={activeIndex === index}
      className={activeIndex === index ? 'tab active' : 'tab'}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
}

function TabPanels({ children }) {
  const { activeIndex } = useContext(TabsContext);
  return React.Children.toArray(children)[activeIndex];
}

Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;

export default Tabs;

// Usage — consumer fully controls structure:
// <Tabs defaultIndex={0}>
//   <Tabs.List>
//     <Tabs.Tab index={0}>Overview</Tabs.Tab>
//     <Tabs.Tab index={1}>Settings</Tabs.Tab>
//   </Tabs.List>
//   <Tabs.Panels>
//     <OverviewPanel />
//     <SettingsPanel />
//   </Tabs.Panels>
// </Tabs>
```

### Oral Explanation (Interview Ready)

> "Compound components solve the 'prop explosion' problem you get with a monolithic `<Tabs tabs={[...]} activeIndex={} onChange={} />` API. Instead, the parent `Tabs` component owns the shared state and exposes it through Context, while the sub-components — `Tabs.List`, `Tabs.Tab`, `Tabs.Panels` — are just consumers of that context. This gives the integration team at the client site full control over markup, styling, and composition order, without us having to anticipate every layout variation upfront. It's the same pattern behind `<select>`/`<option>` in native HTML, and it's what libraries like Radix and Headless UI are built around."

1.  **Implicit vs explicit state sharing**: Context removes the need for prop-drilling `activeIndex` through every layer, while still keeping the public API declarative and readable at the call site.
2.  **Attaching sub-components as statics** (`Tabs.Tab = Tab`) keeps the related pieces namespaced together without needing a separate import for each.
3.  **FDE relevance**: Client teams often want to restyle or rearrange your components to match their existing design system — compound components make that possible without forking your code.

---

### 5. Render Props vs Custom Hooks: Trade-off Analysis
**Question**: You need to share "mouse position tracking" logic across components. Compare implementing it as a render prop vs a custom hook, and justify which you'd choose for a client-facing component library.

```jsx
// Render Props approach
class MouseTracker extends React.Component {
  state = { x: 0, y: 0 };
  handleMove = (e) => this.setState({ x: e.clientX, y: e.clientY });
  render() {
    return <div onMouseMove={this.handleMove}>{this.props.children(this.state)}</div>;
  }
}
// Usage: <MouseTracker>{({ x, y }) => <Cursor x={x} y={y} />}</MouseTracker>

// Custom Hook approach
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  return position;
}
// Usage: const { x, y } = useMousePosition(); return <Cursor x={x} y={y} />;
```

**Key Points**:
*   Render props compose via JSX nesting — stacking several leads to deeply nested "wrapper hell" in the tree.
*   Hooks compose by just calling multiple hooks in one function body — flatter, easier to read, and easier to unit test in isolation (`renderHook`).
*   Render props still have a niche: when you need to control *where in the DOM tree* the logic's consumer renders (e.g., a `<Downshift>`-style component injecting ARIA props onto arbitrary children) — hooks can't inject markup, only state/behavior.

### Oral Explanation (Interview Ready)

> "Both patterns solve the same problem — sharing stateful, non-visual logic — but hooks almost always win for new code because they avoid the nesting problem. If you need mouse tracking, drag state, and window size all in one component, hooks let you just call three functions, while render props would force you into three levels of nested children-as-functions, which hurts both readability and React DevTools profiling. I'd only reach for render props today when the logic needs to *inject props into a child's rendering* that the consumer controls positionally — things like scroll-into-view helpers or accessible listbox primitives — because a hook can hand you state and handlers, but it can't decide where in the JSX tree something renders."

1.  **Testing story**: Hooks can be tested directly with `@testing-library/react-hooks`'s `renderHook`, without needing to mount a full component tree, which render props generally require.
2.  **Migration path**: Most render-prop libraries (Formik, Downshift) now ship hook-based APIs alongside the legacy render-prop API for backward compatibility — a sign of where the ecosystem settled.
3.  **Performance nuance**: Render props re-create the child function on every render unless memoized, which can cause unnecessary re-renders of the consumer — hooks avoid this since there's no function-as-child indirection.

---

### 6. Error Boundaries + Suspense for Data Fetching Architecture
**Question**: Design a data-fetching architecture for a client dashboard where failures in one widget must not crash the whole page, and loading states should be handled declaratively.

```jsx
import React, { Suspense, useState } from 'react';

class WidgetErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Ship to telemetry so we know which client's widget failed, not just that "something" did.
    reportError({ error, componentStack: info.componentStack, widget: this.props.widgetName });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="widget-error" role="alert">
          <p>{this.props.widgetName} failed to load.</p>
          <button onClick={() => this.setState({ hasError: false })}>Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// A resource wrapper that throws a promise (for Suspense) or the error (for the boundary).
function createResource(promiseFn) {
  let status = 'pending', result, suspender = promiseFn().then(
    (r) => { status = 'success'; result = r; },
    (e) => { status = 'error'; result = e; }
  );
  return {
    read() {
      if (status === 'pending') throw suspender;
      if (status === 'error') throw result;
      return result;
    },
  };
}

function RevenueWidget({ resource }) {
  const data = resource.read(); // throws promise -> Suspense catches it
  return <div>Revenue: {data.total}</div>;
}

function Dashboard() {
  const [resource] = useState(() => createResource(() => fetch('/api/revenue').then((r) => r.json())));
  return (
    <WidgetErrorBoundary widgetName="Revenue">
      <Suspense fallback={<Spinner />}>
        <RevenueWidget resource={resource} />
      </Suspense>
    </WidgetErrorBoundary>
  );
}
```

### Oral Explanation (Interview Ready)

> "The key architectural decision is isolation per widget, not per page. Each dashboard widget gets its own `Suspense` boundary for the loading state and its own `ErrorBoundary` for the failure state, wrapped tightly around just that widget. That way, if the revenue API times out on a client's flaky network, only that one card shows a retry button — the rest of the dashboard keeps working. I pair `Suspense` with a resource that throws a promise while pending, which is the contract Suspense expects, and I make sure `componentDidCatch` reports the widget name and stack to telemetry, because in an FDE context, when something breaks at 2am at a client site, the difference between 'the app crashed' and 'the inventory widget failed, here's why' is the difference between a 10-minute fix and a 2-hour outage call."

1.  **Boundary granularity**: Wrapping each independent data dependency in its own boundary prevents one slow or broken API from cascading into a full white-screen for the whole page.
2.  **Error boundaries don't catch everything**: They don't catch errors in event handlers, async code outside of render, SSR, or the boundary's own render — those need manual try/catch and reporting.
3.  **Retry affordance**: Resetting `hasError` to `false` on retry only works if the resource itself is also recreated/refetched — otherwise you'll just re-throw the same cached error immediately.

---

### 7. Micro-Frontend Integration Approach
**Question**: A client wants to embed your product's UI inside their existing legacy portal (different framework, different build pipeline). How do you architect this integration?

**Key Points**:
*   **Isolation strategy**: Prefer an iframe with `postMessage` for hard isolation (CSS/JS can't leak either direction) when the host app's stability can't be guaranteed — common in client-site deployments where you don't control the host's dependency versions.
*   **Module Federation** (Webpack 5 / Vite plugin) when you *do* control both build pipelines, letting the host dynamically load your remote's exposed component at runtime without bundling it — better UX (no iframe scroll/resize issues) at the cost of shared dependency version conflicts (React version mismatches are the #1 failure mode).
*   **Communication contract**: Define a versioned message schema (`{ type, version, payload }`) over `postMessage` or a shared event bus — never let the host call your internal functions directly, to preserve the ability to redeploy independently.
*   **Styling containment**: Shadow DOM or scoped CSS (CSS Modules / `:where()` scoping) to avoid the host's global stylesheet clobbering your component's styles, and vice versa.

```javascript
// Host <-> Micro-frontend contract via postMessage, versioned for compatibility.
window.addEventListener('message', (event) => {
  if (event.origin !== TRUSTED_HOST_ORIGIN) return; // always validate origin
  const { type, version, payload } = event.data;
  if (version !== '1.0') return console.warn('Unsupported contract version', version);
  switch (type) {
    case 'HOST_THEME_CHANGE':
      applyTheme(payload.theme);
      break;
    case 'HOST_USER_CONTEXT':
      setUserContext(payload.user);
      break;
  }
});

function notifyHost(type, payload) {
  window.parent.postMessage({ type, version: '1.0', payload }, TRUSTED_HOST_ORIGIN);
}
```

### Oral Explanation (Interview Ready)

> "This is a classic FDE scenario — you rarely get to dictate the client's tech stack. My first question is always: do I control both ends of the build, or just mine? If the client's portal is legacy and I have no influence over their dependency graph, I isolate hard with an iframe and a versioned `postMessage` contract — it's less elegant, but it guarantees that a jQuery conflict or an old React version on their side can never break my app, and vice versa. If I do control both sides, Module Federation gives a much better integrated experience, but I go in expecting the first real bug to be a shared-dependency version mismatch, usually React itself, so I pin and expose the exact singleton version explicitly rather than trusting the default sharing heuristics."

1.  **Origin validation**: Every `postMessage` listener must validate `event.origin` against an allowlist — skipping this is a real security hole, not just a style nitpick.
2.  **Versioned contracts**: Including a `version` field in the message schema from day one avoids painful breaking changes later when either side redeploys independently.
3.  **Failure containment**: Hard iframe isolation trades some UX polish (resize, scroll, focus management) for guaranteed blast-radius containment — the right trade for an environment you don't control.

---

### 8. Designing a Design-System Component API
**Question**: Design the public API for a reusable `<DataTable>` component that needs to support sorting, custom cell rendering, and pagination — usable across many different client teams with different needs.

```jsx
// Composable, controlled-or-uncontrolled API with sensible defaults.
function DataTable({
  columns,          // [{ key, header, render?, sortable? }]
  data,
  sortBy: controlledSortBy,
  onSortChange,
  pageSize = 25,
  renderEmptyState = () => <p>No data available.</p>,
}) {
  const [internalSortBy, setInternalSortBy] = useState(null);
  const [page, setPage] = useState(0);

  // Support both controlled (consumer owns sort state) and uncontrolled usage.
  const sortBy = controlledSortBy ?? internalSortBy;
  const setSortBy = (next) => {
    setInternalSortBy(next);
    onSortChange?.(next);
  };

  const sorted = useMemo(() => sortData(data, sortBy, columns), [data, sortBy, columns]);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  if (data.length === 0) return renderEmptyState();

  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} onClick={() => col.sortable && setSortBy(col.key)}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {paged.map((row, i) => (
          <tr key={row.id ?? i}>
            {columns.map((col) => (
              <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Oral Explanation (Interview Ready)

> "Designing an API for internal reuse across different client teams is fundamentally about choosing the right defaults while leaving escape hatches. I make the column definitions data-driven — a `columns` array with an optional `render` function per column — so teams get sensible default rendering for free but can fully customize a cell when they need a badge, a link, or a formatted date. For sorting, I support both controlled and uncontrolled modes: most teams just want it to work out of the box, so internal state handles that, but teams that need to sync sort state with a URL query param or a backend-driven sort can pass `sortBy`/`onSortChange` and take over. The goal is that the 80% use case takes zero configuration, and the 20% edge cases are still possible without forking the component."

1.  **Controlled/uncontrolled duality**: Using `controlledSortBy ?? internalSortBy` is the same pattern React's own `<input>` uses — it lets the same component serve both simple and advanced consumers.
2.  **Composition over configuration explosion**: Passing a `render` function per column avoids an ever-growing list of boolean props (`isBadge`, `isDate`, `isLink`...) that balloons unmaintainably.
3.  **Accessibility and empty states as first-class props**: `renderEmptyState` as a prop (not a hardcoded string) lets consuming teams match their own tone/branding without a fork.

---

## 🌐 Round 3: Resilient Client-Facing System Design

### 9. Handling Flaky Customer APIs Gracefully in the UI
**Question**: You're integrating with a client's legacy backend that intermittently times out or returns malformed responses. How do you keep the UI usable?

```jsx
function useResilientQuery(fetchFn, { staleData = null } = {}) {
  const [state, setState] = useState({
    status: 'idle', data: staleData, error: null, isStale: false,
  });

  const run = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    try {
      const data = await fetchFn();
      setState({ status: 'success', data, error: null, isStale: false });
    } catch (error) {
      // Keep showing the last known good data, flagged as stale,
      // instead of wiping the UI and showing a blank error screen.
      setState((s) => ({
        status: 'error',
        data: s.data,
        error,
        isStale: s.data !== null,
      }));
    }
  }, [fetchFn]);

  useEffect(() => { run(); }, [run]);

  return { ...state, retry: run };
}

function AccountBalance() {
  const { data, status, isStale, error, retry } = useResilientQuery(fetchAccountBalance);

  return (
    <div>
      {data && (
        <div className={isStale ? 'balance stale' : 'balance'}>
          {isStale && <span title={error?.message}>⚠ Showing last known data</span>}
          Balance: {data.amount}
        </div>
      )}
      {!data && status === 'loading' && <Spinner />}
      {!data && status === 'error' && (
        <ErrorState message="Unable to load balance" onRetry={retry} />
      )}
    </div>
  );
}
```

### Oral Explanation (Interview Ready)

> "With client-site integrations, especially legacy backends, I assume intermittent failure is the normal case, not the exception. The UI principle I follow is: never discard good data just because the next request failed. If we successfully loaded the balance five minutes ago and the refresh now times out, the right behavior is to keep showing that balance with a 'stale data' indicator and a manual retry — not to blank the screen with a generic error. This keeps the app usable during a client's backend hiccup instead of looking broken. I also always validate the response shape before trusting it — a flaky API that returns malformed JSON or an unexpected schema should fail the same resilient path as a network timeout, not throw an uncaught exception deep in a render."

1.  **Stale-while-error, not just stale-while-revalidate**: The pattern explicitly distinguishes "no data yet" from "have data, latest refresh failed" — these need very different UI treatments.
2.  **Schema validation at the boundary**: Running fetched data through a schema check (Zod/Yup) before it enters component state turns "malformed backend response" into a handled error path instead of a runtime crash.
3.  **User trust**: Surfacing *why* data might be stale (a tooltip with the error, a timestamp of last successful fetch) builds more client trust than silently retrying in the background.

---

### 10. Resilient Polling Layer: Exponential Backoff with Jitter
**Question**: Implement a polling/retry utility for a field-deployed app that needs to survive unreliable networks without hammering the server or synchronizing retry storms across many clients.

```javascript
class ResilientPoller {
  constructor({
    fn,                 // async function to call
    baseDelay = 1000,
    maxDelay = 30000,
    maxRetries = Infinity,
    onError = () => {},
  }) {
    this.fn = fn;
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
    this.maxRetries = maxRetries;
    this.onError = onError;
    this.attempt = 0;
    this.timer = null;
    this.stopped = false;
  }

  // Full jitter: random delay between 0 and the exponential cap.
  // This is what prevents thundering-herd retry storms across many field devices
  // that all failed at the same moment (e.g., a brief server-side outage).
  #nextDelay() {
    const exp = Math.min(this.maxDelay, this.baseDelay * 2 ** this.attempt);
    return Math.random() * exp;
  }

  async #run() {
    if (this.stopped) return;
    try {
      const result = await this.fn();
      this.attempt = 0; // reset backoff on success
      this.#schedule(this.baseDelay);
      return result;
    } catch (error) {
      this.attempt++;
      this.onError(error, this.attempt);
      if (this.attempt > this.maxRetries) {
        this.stop();
        return;
      }
      this.#schedule(this.#nextDelay());
    }
  }

  #schedule(delay) {
    if (this.stopped) return;
    this.timer = setTimeout(() => this.#run(), delay);
  }

  start() {
    this.stopped = false;
    this.#run();
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.timer);
  }
}

// Usage: poll a sync endpoint, backing off on failure, resetting on success.
const poller = new ResilientPoller({
  fn: () => fetch('/api/sync').then((r) => {
    if (!r.ok) throw new Error(`Sync failed: ${r.status}`);
    return r.json();
  }),
  onError: (err, attempt) => console.warn(`Sync attempt ${attempt} failed:`, err.message),
});
poller.start();
```

### Oral Explanation (Interview Ready)

> "Two things matter here beyond basic exponential backoff. First, **jitter** — if I have a hundred field devices that all lose connectivity to the same server at the same moment, pure exponential backoff means they'll all retry at exactly the same synchronized intervals, creating repeated load spikes right when the server is trying to recover. Adding randomness — full jitter, where the delay is a random value between zero and the exponential cap — spreads those retries out so the server sees a smooth trickle of requests instead of a thundering herd. Second, the backoff state resets to zero on any successful call, so a device that had five consecutive failures and then succeeds goes right back to fast polling rather than staying artificially throttled. I also cap the delay at a maximum so a long outage doesn't mean the device effectively stops trying for hours."

1.  **Full jitter vs decorrelated jitter**: Full jitter (`random(0, cap)`) is simpler and is what AWS's own architecture blog recommends as the best general-purpose choice over equal-jitter or no-jitter variants.
2.  **Reset-on-success**: Without this, a single transient blip would permanently slow down polling for the rest of the session, which is a subtle but real UX regression.
3.  **`maxRetries` vs indefinite retry**: For a field-deployed app, indefinite retry with backoff is usually correct — giving up outright means the device needs a manual relaunch, which isn't viable when nobody's there to do it.

---

### 11. Offline-First Sync Strategy for a Field-Deployed App
**Question**: Design the data layer for an app used by field technicians who frequently lose connectivity, need to keep working offline, and must sync changes once back online without losing or duplicating data.

**Key Points**:
*   **Local-first storage**: Write every change to IndexedDB (via Dexie or idb) immediately and optimistically update the UI — never block a user action on network availability.
*   **Outbox pattern**: Every mutation is appended to a local "outbox" queue with a client-generated UUID and a timestamp, independent of whether the network is up.
*   **Idempotency keys**: Each outbox entry's UUID is sent to the server as an idempotency key, so if a sync retries after a partial failure (e.g., the server processed it but the response was lost on a flaky connection), the server can detect and ignore the duplicate rather than double-applying it.
*   **Conflict resolution**: Use a `last-write-wins` with vector-clock or `updatedAt` comparison for simple fields, but flag genuine conflicts (same record edited differently offline on two devices) for manual merge rather than silently overwriting — silent data loss is worse than asking the user.

```javascript
// Simplified outbox-based sync engine.
class SyncEngine {
  constructor(db, apiClient) {
    this.db = db;               // local IndexedDB wrapper
    this.api = apiClient;
    this.syncing = false;
  }

  // Called by UI actions — always succeeds locally and instantly.
  async applyChange(entity, change) {
    const op = {
      id: crypto.randomUUID(),      // idempotency key
      entity,
      change,
      timestamp: Date.now(),
      status: 'pending',
    };
    await this.db.outbox.add(op);
    await this.db.applyLocally(entity, change); // optimistic local update
    this.trySync(); // fire and forget; safe to call when offline
    return op.id;
  }

  async trySync() {
    if (this.syncing || !navigator.onLine) return;
    this.syncing = true;
    try {
      const pending = await this.db.outbox.where('status').equals('pending').toArray();
      for (const op of pending) {
        try {
          // idempotencyKey lets the server safely ignore a duplicate replay.
          await this.api.applyChange(op.entity, op.change, { idempotencyKey: op.id });
          await this.db.outbox.update(op.id, { status: 'synced' });
        } catch (error) {
          if (error.status === 409) {
            await this.db.outbox.update(op.id, { status: 'conflict' });
            this.flagConflictForUser(op, error.serverState);
          } else {
            break; // stop on network errors, resume via next trySync()
          }
        }
      }
    } finally {
      this.syncing = false;
    }
  }
}

window.addEventListener('online', () => syncEngine.trySync());
```

### Oral Explanation (Interview Ready)

> "For field-deployed apps, the core principle is that the UI must never wait on the network — every user action writes to local storage first, updates the UI optimistically, and then gets queued in an outbox for sync whenever connectivity returns. The two things that make this safe rather than just 'eventually consistent chaos' are idempotency keys and explicit conflict handling. Every queued operation gets a client-generated UUID that's sent to the server as an idempotency key — so if the sync call succeeds on the server but the technician's device loses signal before it gets the response, retrying that same operation is safe; the server recognizes the UUID and no-ops instead of double-applying the change. For actual conflicts — two technicians editing the same work order offline — I don't silently pick a winner with last-write-wins, because that quietly destroys someone's work. Instead I surface it as a conflict the user has to resolve, because in a field-service context, losing an inspection note or a safety flag is a much worse outcome than asking someone to manually merge two versions."

1.  **Optimistic local-first writes**: Blocking the UI on network state is the single most common failure mode in field-deployed software — avoiding it entirely is the design's first goal.
2.  **Idempotency over deduplication-by-guessing**: Trying to detect duplicates after the fact (by comparing payloads) is fragile; a client-generated UUID sent as an idempotency key is a server-side guarantee, not a heuristic.
3.  **Explicit conflict surfacing**: Silent last-write-wins is only acceptable for low-stakes fields (e.g., a UI preference); anything safety- or business-critical should force a visible merge step.

---

## 🧩 Round 4: Tricky Coding Implementations

### 12. Custom EventEmitter Class
**Question**: Implement a Node-style `EventEmitter` from scratch, supporting `on`, `off`, `once`, and `emit`.

```javascript
class EventEmitter {
  #listeners = new Map(); // event name -> Set of { fn, once }

  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    const entry = { fn, once: false };
    this.#listeners.get(event).add(entry);
    return () => this.#listeners.get(event)?.delete(entry); // returns an unsubscribe fn
  }

  once(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());
    const entry = { fn, once: true };
    this.#listeners.get(event).add(entry);
    return () => this.#listeners.get(event)?.delete(entry);
  }

  off(event, fn) {
    const entries = this.#listeners.get(event);
    if (!entries) return;
    for (const entry of entries) {
      if (entry.fn === fn) entries.delete(entry);
    }
  }

  emit(event, ...args) {
    const entries = this.#listeners.get(event);
    if (!entries) return false;
    // Snapshot before iterating: a listener may call off()/once-removal
    // during emit, which would otherwise mutate the Set mid-iteration.
    for (const entry of [...entries]) {
      entry.fn(...args);
      if (entry.once) entries.delete(entry);
    }
    return true;
  }
}

// Usage
const bus = new EventEmitter();
const unsubscribe = bus.on('sync:complete', (payload) => console.log('synced', payload));
bus.once('sync:error', (err) => console.error('error (only logged once):', err));
bus.emit('sync:complete', { count: 12 });
unsubscribe();
```

### Oral Explanation (Interview Ready)

> "The subtle bug most implementations miss is mutating the listener collection while iterating over it during `emit` — if a `once` listener removes itself mid-loop, or a listener calls `off` on another listener from inside its own callback, iterating directly over a live `Set` can skip entries or throw. So I always snapshot the listeners into an array at the start of `emit`, before invoking anything, and only mutate the real `Set` afterward. I also return an unsubscribe function from `on`/`once` rather than only supporting `off` by reference — that's the ergonomic pattern React's `useEffect` cleanup and most modern event systems use, because it avoids needing to keep the original function reference around just to unsubscribe later."

1.  **Snapshot-before-iterate**: This is the same class of bug as mutating an array while `for...of`-ing over it — a Set is no safer unless you explicitly copy it first.
2.  **Returning an unsubscribe closure**: More ergonomic than requiring callers to retain a reference to the exact function passed to `on`, especially with inline arrow functions.
3.  **Memory consideration**: Long-lived emitters (e.g., a global app event bus) are a classic leak source if consumers forget to unsubscribe — this is exactly where the `WeakMap`/cleanup discussion from Q2 applies in practice.

---

### 13. Token Bucket Rate Limiter
**Question**: Implement a token bucket rate limiter to throttle outgoing API calls to a client's backend that enforces a strict rate limit (e.g., 5 requests/second, bursts up to 10).

```javascript
class TokenBucket {
  constructor({ capacity, refillRatePerSec }) {
    this.capacity = capacity;           // max burst size
    this.tokens = capacity;             // start full
    this.refillRate = refillRatePerSec; // tokens added per second
    this.lastRefill = Date.now();
  }

  #refill() {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    const newTokens = elapsedSec * this.refillRate;
    this.tokens = Math.min(this.capacity, this.tokens + newTokens);
    this.lastRefill = now;
  }

  tryConsume(cost = 1) {
    this.#refill();
    if (this.tokens >= cost) {
      this.tokens -= cost;
      return true;
    }
    return false;
  }

  // Async variant: wait until a token is available instead of rejecting immediately.
  async consume(cost = 1) {
    for (;;) {
      this.#refill();
      if (this.tokens >= cost) {
        this.tokens -= cost;
        return;
      }
      const deficit = cost - this.tokens;
      const waitMs = (deficit / this.refillRate) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

// Usage: throttle a queue of client API calls to 5/sec with bursts to 10.
const limiter = new TokenBucket({ capacity: 10, refillRatePerSec: 5 });

async function callClientApi(request) {
  await limiter.consume(); // blocks here until a token frees up
  return fetch(request.url, request.options);
}
```

### Oral Explanation (Interview Ready)

> "Token bucket is the right rate-limiting algorithm here instead of a fixed window counter because it naturally allows short bursts while still enforcing a long-run average rate — which matches how most client-side rate limits are actually specified, like '5 requests per second, burst up to 10.' The implementation tracks a token count and lazily refills it based on elapsed wall-clock time whenever `tryConsume` or `consume` is called, rather than running a `setInterval` to add tokens continuously — that's both more efficient and immune to timer drift or the tab being backgrounded and throttled by the browser. For the blocking variant, instead of busy-polling, I calculate exactly how long to wait until enough tokens will exist and schedule a single `setTimeout` for that duration, which is much cheaper than checking every few milliseconds."

1.  **Lazy refill over interval-based refill**: Computing elapsed time on each access avoids drift and unnecessary timers, and keeps working correctly even if the tab was suspended and timers were throttled.
2.  **Burst capacity vs sustained rate**: `capacity` and `refillRate` are deliberately separate knobs — this is what lets the bucket express "burst to 10, but average no more than 5/sec" in one structure.
3.  **Where this fits architecturally**: In an FDE context, this sits as a shared utility wrapping any outbound call to a client's rate-limited API, so every integration point respects the same limit without each call site reimplementing throttling.

---

### 14. Deep Equality Check with Circular Reference Handling
**Question**: Implement a `deepEqual(a, b)` function that correctly handles nested objects/arrays, `NaN`, and circular references (a naive recursive implementation will stack-overflow on circular structures).

```javascript
function deepEqual(a, b, seen = new WeakMap()) {
  // Primitives and reference equality (also correctly handles NaN === NaN as true).
  if (Object.is(a, b)) return true;

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  if (a.constructor !== b.constructor) return false;

  // Circular reference guard: if we've already started comparing this exact
  // pair, assume equal and let the recursion unwind instead of looping forever.
  if (seen.has(a) && seen.get(a) === b) return true;
  seen.set(a, b);

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i], seen));
  }

  if (a instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a) {
      if (!b.has(key) || !deepEqual(val, b.get(key), seen)) return false;
    }
    return true;
  }

  if (a instanceof Date) return a.getTime() === b.getTime();

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every(
    (key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key], seen)
  );
}

// Circular reference example that would stack-overflow naively:
const objA = { name: 'a' };
objA.self = objA;
const objB = { name: 'a' };
objB.self = objB;
console.log(deepEqual(objA, objB)); // true, no stack overflow
```

### Oral Explanation (Interview Ready)

> "There are three gotchas a naive `deepEqual` misses. First, `NaN` — `NaN !== NaN` with the strict equality operator, but intuitively two `NaN` values should compare equal, so I use `Object.is` as the base case, which handles that correctly along with `+0`/`-0` distinction if needed. Second, circular references — if an object references itself, directly or through a cycle, a naive recursive comparison will recurse infinitely and blow the call stack. I handle that with a `WeakMap` that tracks which pairs of objects we're already in the middle of comparing; if we hit the same pair again, we assume equality and let the recursion unwind rather than looping forever — this is the same technique `JSON.stringify` uses internally to detect circular structures, just applied to comparison instead of serialization. Third, I special-case `Map`, `Array`, and `Date` explicitly rather than treating everything as a generic object, because comparing a `Map`'s entries by `Object.keys()` would silently return `true` for two completely different maps."

1.  **Why `WeakMap` specifically for the `seen` tracker**: Using a `WeakMap` instead of a regular `Map` means the cycle-tracking structure doesn't itself prevent garbage collection of the objects being compared once the function returns.
2.  **`Object.is` vs `===`**: `Object.is(NaN, NaN)` is `true` while `NaN === NaN` is `false` — a one-line detail that's an easy interview trap if you default to `===`.
3.  **Constructor check before structural check**: Comparing `a.constructor !== b.constructor` early correctly rejects comparing, say, a plain object against a class instance with identical own-enumerable keys, which a pure key-by-key comparison would wrongly call equal.

---
