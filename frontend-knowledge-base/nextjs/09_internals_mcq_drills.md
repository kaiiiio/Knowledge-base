# Internals MCQ Drills — Next.js / React / Node

Tricky multiple-choice questions on *how things actually work* — the kind used in screening rounds. Answers with reasoning are at the end of each section (don't peek until you've committed to an option; the misses are where the learning is).

Sections: [Rendering & Hydration](#rendering) · [Caching & Data](#caching) · [Server Actions & Route Handlers](#actions) · [React Internals](#react) · [Node/Event Loop](#node) · [Speed-Round True/False](#tf)

---

<a name="rendering"></a>
## A. Rendering & Hydration (10 MCQs)

**A1.** A component marked `'use client'` — where does its code execute?
- a) Only in the browser
- b) Only on the server
- c) On the server for initial HTML, then in the browser for hydration
- d) Depends on `export const runtime`

**A2.** During hydration, React finds the server HTML doesn't match the client render. React 18 will:
- a) Throw and show a blank page
- b) Keep the server HTML and skip attaching handlers
- c) Discard that subtree's server HTML and re-render it on the client, logging an error
- d) Silently patch only the differing attributes

**A3.** Which is a **valid** cause of a hydration mismatch?
- a) `useEffect(() => setState(Date.now()), [])`
- b) `<p><div>text</div></p>` in JSX
- c) Using `useState(0)` as initial state
- d) A server component rendering `new Date().toISOString()`

**A4.** `<Link>` navigation to another App Router route fetches:
- a) The full HTML document
- b) Only the RSC payload for the new route segments
- c) Nothing — everything was inlined at build
- d) A JSON of getServerSideProps

**A5.** A server component's `async` body runs:
- a) Once per request (or at build time for static routes)
- b) Once per request AND once in the browser
- c) On every client re-render
- d) Only when props change

**A6.** Which prop can you NOT pass from a server component to a client component?
- a) `<ServerComp/>` as children
- b) A `Date` object
- c) An inline arrow function `onClick={() => ...}`
- d) A promise unwrapped with `use()`

**A7.** `loading.tsx` in a route segment is implemented as:
- a) A route-level HTTP 102 response
- b) An automatic `<Suspense>` boundary wrapping `page.tsx`
- c) A client-side spinner shown during fetch()
- d) A skeleton injected by middleware

**A8.** With streaming SSR, a slow component inside `<Suspense>` blocks:
- a) TTFB of the whole page
- b) Nothing initially — its HTML streams later and is swapped in by an inline script
- c) Hydration of the entire page
- d) The router cache

**A9.** Selective hydration means:
- a) Only `'use client'` components hydrate — true but not what the term means
- b) React hydrates Suspense boundaries independently, prioritizing the one the user interacts with
- c) Next.js skips hydration for static routes
- d) Hydration runs in a web worker

**A10.** One component in a route calls `cookies()`. The route becomes:
- a) Client-rendered
- b) Fully dynamic (unless the dynamic part is isolated with PPR/Suspense)
- c) ISR with revalidate 0
- d) An edge route automatically

<details><summary><b>Answers A</b></summary>

**A1: c.** 'use client' components SSR too — that's the #1 misconception filter. (d is a distractor: runtime picks node/edge, not server/client.)
**A2: c.** Client re-render wins for that subtree; you lose the SSR benefit and get the console error.
**A3: b.** The browser's parser "fixes" invalid nesting, so the real DOM ≠ React's expected tree. (a is the *fix* pattern, not a cause; d runs only on the server — nothing to mismatch.)
**A4: b.** Client navigations fetch the serialized RSC payload (`?_rsc=`), not HTML.
**A5: a.** Server components never re-run in the browser; they re-run on the server on navigation/refresh/revalidation.
**A6: c.** Props across the boundary must be RSC-serializable; plain functions aren't (server action references are the exception). Date, promises, and rendered server components as children are all fine.
**A7: b.** It's sugar for a Suspense boundary around the segment.
**A8: b.** The fallback ships in the first flush; the real HTML streams when ready. That's the whole point.
**A9: b.** Out-of-order, interaction-prioritized hydration per boundary (React 18).
**A10: b.** One dynamic API opts the whole route out of static rendering — PPR is the escape hatch.

</details>

---

<a name="caching"></a>
## B. Caching & Data (10 MCQs)

**B1.** Same `fetch(url)` called in `layout.tsx` and `page.tsx` during one request. Network calls made:
- a) 2  b) 1 — request memoization  c) 0 — build time  d) Depends on `cache` option only

**B2.** Request memoization applies automatically to:
- a) Any async function
- b) `fetch` with identical URL+options (and functions wrapped in `React.cache`)
- c) Prisma queries
- d) Only GET route handlers

**B3.** `revalidateTag('posts')` does what, exactly, at call time?
- a) Immediately re-renders all pages using that tag
- b) Marks matching data-cache entries stale; next request re-fetches and re-renders
- c) Clears the browser's router cache for all users
- d) Deletes the tag's entries from the CDN only

**B4.** In **Next.js 15**, a plain `fetch(url)` in a server component is:
- a) Cached forever  b) Cached 30s  c) Not cached by default  d) Cached only in production

**B5.** A user submits a form via a **server action** that calls `revalidatePath('/posts')`. Their browser shows fresh data without a manual refresh because:
- a) The action response carries the re-rendered RSC payload and busts the client router cache
- b) Next.js opens a websocket to push updates
- c) The page polls every 30 seconds
- d) It doesn't — a manual refresh is required

**B6.** You update data through a **plain client-side `fetch('/api/posts', {method:'POST'})`** (not an action). The page still shows old data after success. Most likely culprit:
- a) The data cache — POST responses are cached
- b) The client router cache still holds the old RSC payload; you need `router.refresh()`
- c) Hydration mismatch
- d) The full route cache can't be cleared at runtime

**B7.** Which does **NOT** make a route dynamic?
- a) `await cookies()`  b) `searchParams` in the page  c) `fetch(url, { next: { revalidate: 60 } })`  d) `headers()`

**B8.** `unstable_cache` (or `'use cache'`) exists because:
- a) `fetch` caching is broken
- b) The data cache only wraps `fetch` — direct DB/ORM calls need explicit wrapping to be cached
- c) Redis is required for ISR
- d) Server components can't be async

**B9.** ISR page with `revalidate: 60`. A request arrives at t=90s after the last generation. The user receives:
- a) A freshly rendered page (they wait for it)
- b) The stale cached page, while regeneration happens in the background
- c) A 404 until regeneration completes
- d) The loading.tsx fallback

**B10.** Self-hosted Next.js on 3 replicas, default config. You call `revalidatePath` on replica 1. Replicas 2 and 3:
- a) Also purge — it's coordinated via the build ID
- b) Keep serving their own stale cached copy — the default ISR cache is per-instance disk; you need a shared cacheHandler
- c) Crash with a cache-consistency error
- d) Proxy all requests to replica 1

<details><summary><b>Answers B</b></summary>

**B1: b.** Memoized within one render pass.
**B2: b.** Automatic only for fetch; DB calls need `React.cache()` — that's why option c is the trap.
**B3: b.** It's lazy invalidation (mark-stale), not eager re-render.
**B4: c.** The big 14→15 flip: uncached by default.
**B5: a.** Actions return the updated RSC tree in the same POST response and invalidate the router cache.
**B6: b.** Router cache doesn't know your API call happened. `router.refresh()` (or use a server action instead) is the fix. Classic real-world bug.
**B7: c.** Time-based revalidate keeps the route static (ISR). The other three read per-request data.
**B8: b.** Data cache hooks `fetch`; ORMs bypass it entirely.
**B9: b.** Stale-while-revalidate semantics — nobody waits; freshness arrives for the *next* visitor.
**B10: b.** The famous self-hosting gotcha — shared cache handler (Redis) required for consistency.

</details>

---

<a name="actions"></a>
## C. Server Actions & Route Handlers (8 MCQs)

**C1.** How does the browser invoke a server action under the hood?
- a) GET with query params
- b) POST to the current page URL with a `Next-Action: <id>` header and serialized args
- c) WebSocket RPC frame
- d) POST to `/api/_actions/<name>`

**C2.** Who can call an exported server action in production?
- a) Only components in your repo
- b) Only same-origin pages (enforced cryptographically)
- c) Anyone who sends a request with a valid action ID — treat it as a public endpoint
- d) Only logged-in users

**C3.** `redirect('/dashboard')` inside a server action works by:
- a) Returning a 302 object
- b) Throwing a special error that Next.js catches — which is why bare try/catch around it breaks redirects
- c) Setting a Location header via cookies()
- d) Client-side router.push injected into the response

**C4.** Two rapid submissions of the same server action from one page:
- a) Run in parallel on the server
- b) Are queued — actions from a client run sequentially
- c) Second is dropped automatically
- d) Cause a 409

**C5.** In a route handler you call `await req.json()` and later `await req.text()`. Result:
- a) Both work — body is buffered
- b) The second call fails/returns empty — the body is a one-shot stream (clone first)
- c) text() returns the JSON string
- d) TypeError at compile time

**C6.** A `GET` route handler with no dynamic APIs, in Next 15 default config, is:
- a) Cached at build like a static page
- b) Executed on every request — 15 made GET handlers uncached by default
- c) Cached 5 minutes
- d) Edge-cached only

**C7.** A Stripe webhook handler must verify the signature against:
- a) `await req.json()` re-stringified
- b) The raw body text, before any parsing — re-serialization breaks the signature
- c) The `stripe-signature` header alone
- d) The request URL

**C8.** Why can't a Server Component call `cookies().set()`?
- a) Cookies are read-only in Node
- b) By render time the response may already be streaming — headers are committed; only actions/handlers/middleware can set
- c) It can, since Next 14
- d) Security policy blocks it

<details><summary><b>Answers C</b></summary>

**C1: b.** Same-URL POST + Next-Action header; args as multipart/RSC-serialized.
**C2: c.** Hashed IDs are obscurity, not auth. Authorize inside every action.
**C3: b.** Thrown control-flow error — same mechanism as `notFound()`.
**C4: b.** Per-client sequential queue; a slow action head-of-line-blocks the next.
**C5: b.** Web streams are consumed once; `req.clone()` if you need two reads.
**C6: b.** Next 14 cached them by default, 15 doesn't — version-sensitive question, name both if asked orally.
**C7: b.** Raw-body-first is the eternal webhook bug.
**C8: b.** Streaming means headers may be gone; setting is only legal where the response hasn't started.

</details>

---

<a name="react"></a>
## D. React Internals (8 MCQs)

**D1.** `setCount(count + 1); setCount(count + 1);` in one click handler (initial 0). Final value:
- a) 2  b) 1 — both closures saw 0; updates were batched  c) 0  d) Race — sometimes 1, sometimes 2

**D2.** `setCount(c => c + 1); setCount(c => c + 1);` — final value:
- a) 2 — functional updates receive the pending state  b) 1  c) 0  d) Throws

**D3.** In React 18, `setState` calls inside a `setTimeout` callback are:
- a) Not batched — each causes a render
- b) Batched automatically (automatic batching extends beyond event handlers)
- c) Ignored
- d) Batched only with `flushSync`

**D4.** `useEffect` vs `useLayoutEffect` — the real difference:
- a) Dependencies array behavior
- b) useLayoutEffect fires synchronously after DOM mutation, **before paint**; useEffect after paint
- c) useLayoutEffect runs on the server
- d) They're aliases since React 18

**D5.** Why does React Strict Mode (dev) mount → unmount → remount every component?
- a) A known bug
- b) To surface effects with missing cleanups and non-idempotent logic before they break with concurrent features
- c) To warm the JIT
- d) To test error boundaries

**D6.** A memoized child `React.memo(Child)` still re-renders every parent render. Most likely:
- a) memo doesn't work with function components
- b) A prop is a new reference each render — inline object/array/function — so shallow compare fails
- c) Children can't be memoized
- d) Strict mode disables memo

**D7.** Reconciliation compares two elements of **different types** (`<div>` → `<span>`). React:
- a) Morphs attributes in place
- b) Tears down the whole subtree (state lost) and rebuilds it
- c) Keeps children, swaps only the tag
- d) Warns and keeps the div

**D8.** `useRef` vs `useState` — which statement is TRUE?
- a) Ref changes trigger re-render
- b) Ref `.current` mutations are visible to the next render but never *cause* a render — for values that must persist without re-rendering
- c) State survives unmount, refs don't
- d) Refs are shared across component instances

<details><summary><b>Answers D</b></summary>

**D1: b.** Stale closure + batching: both read 0, wrote 1.
**D2: a.** Functional form queues against the latest pending value.
**D3: b.** Automatic batching (18) covers timeouts, promises, native handlers.
**D4: b.** Before-paint (blocking, for measuring/flicker-free positioning) vs after-paint.
**D5: b.** Double-invoke reveals missing cleanup/idempotency issues.
**D6: b.** Shallow prop compare defeated by new references — `useMemo`/`useCallback` on the props, not more memo.
**D7: b.** Different type = full teardown; that's why conditional wrapper-type changes reset child state.
**D8: b.** The canonical distinction.

</details>

---

<a name="node"></a>
## E. Node / Event Loop (8 MCQs)

**E1.** Output order?
```js
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('tick'));
console.log('sync');
```
- a) sync, tick, promise, timeout|immediate (last two order non-deterministic from main script)
- b) sync, promise, tick, timeout, immediate
- c) tick, sync, promise, immediate, timeout
- d) sync, tick, promise, immediate, timeout — always

**E2.** Inside an **I/O callback** (e.g. `fs.readFile`), `setImmediate` vs `setTimeout(0)`:
- a) timeout first  b) immediate first, always — check phase follows poll  c) random  d) they merge

**E3.** `process.nextTick` recursion (each tick schedules another) causes:
- a) Nothing — ticks are throttled
- b) I/O starvation — the nextTick queue drains completely before the loop proceeds
- c) A stack overflow
- d) Automatic promotion to setImmediate

**E4.** Which of these runs on the libuv **threadpool** (not the OS async I/O)?
- a) HTTP socket reads  b) `crypto.pbkdf2`, `fs.*`, `dns.lookup`, zlib  c) setTimeout  d) Promise callbacks

**E5.** Four concurrent `bcrypt.hash` calls (threadpool size 4). A fifth request does `fs.readFile`. It:
- a) Runs immediately — different subsystem
- b) Queues behind the hashes — same threadpool
- c) Fails with EAGAIN
- d) Runs on the main thread

**E6.** `res.write(bigChunk)` returns `false`. Correct handling:
- a) Ignore — Node retries
- b) Stop writing until the `'drain'` event; otherwise you buffer unboundedly in memory
- c) Call res.end()
- d) Increase highWaterMark

**E7.** An Express async handler throws after `await`. Express 4 default behavior:
- a) Error middleware catches it
- b) Unhandled rejection — the request hangs; you must next(err) or wrap (Express 5 forwards it)
- c) 500 sent automatically
- d) Process exits

**E8.** Why does one 300ms synchronous JSON.parse hurt a Node server more than a 300ms DB query?
- a) It doesn't — same latency
- b) The parse blocks the single JS thread for ALL requests; the query blocks only the awaiting request
- c) JSON.parse uses the threadpool
- d) GC pressure only

<details><summary><b>Answers E</b></summary>

**E1: a.** Microtasks: nextTick queue before promise queue — but both after the running sync code; timer-vs-immediate from the main script is non-deterministic.
**E2: b.** Poll → check ordering makes immediate deterministic inside I/O callbacks.
**E3: b.** The starvation footgun; setImmediate recursion is the safe variant.
**E4: b.** Network sockets use epoll/kqueue — no threads; the pool serves fs/crypto/dns.lookup/zlib.
**E5: b.** The hidden coupling — crypto load makes file I/O slow. `UV_THREADPOOL_SIZE` is the lever.
**E6: b.** Backpressure 101; `pipeline()` handles it for you.
**E7: b.** The classic Express 4 async trap.
**E8: b.** Event-loop blocking is *global*; awaited I/O is per-request. This is the sentence to say out loud.

</details>

---

<a name="tf"></a>
## F. Speed-Round True/False (say the correction out loud when False)

1. `'use client'` components never run on the server. **F** — they SSR for initial HTML.
2. Middleware is a safe place for your only auth check. **F** — bypassable; authoritative check in the data layer.
3. `revalidatePath` re-renders pages immediately for all users. **F** — marks stale; next request re-renders.
4. Server actions are automatically protected from external callers. **F** — public endpoints.
5. `React.cache()` persists data across requests. **F** — per-request memoization only; cross-request = data cache.
6. A promise can be passed from server to client component and unwrapped with `use()`. **T**
7. In Next 15, fetch is cached by default. **F** — uncached; 14 was cached.
8. `useLayoutEffect` runs before the browser paints. **T**
9. Keys in a list must be globally unique. **F** — unique among siblings.
10. Two identical fetches in one request hit the network twice. **F** — memoized.
11. `setState` in React 18 inside promises is batched. **T**
12. Edge runtime supports Node's `fs` module. **F** — web-standard APIs only.
13. ISR serves the stale page while regenerating in the background. **T**
14. A server component can be passed as `children` into a client component. **T**
15. `redirect()` in a try/catch block works normally. **F** — it throws; catching swallows it.
16. The RSC payload, not HTML, is fetched on `<Link>` navigation. **T**
17. `process.nextTick` runs after promise microtasks. **F** — before.
18. `await req.json()` twice on one request works. **F** — one-shot stream.
19. Layouts re-render on every navigation within them. **F** — they persist; that's also why layout-only auth checks are a hole.
20. Node handles 10K sockets with ~4 threads because sockets don't use the threadpool. **T**

---

## How to drill (10 min/day)
1. Do one lettered section blind; write your options down *before* opening answers.
2. For every miss, say the correct reasoning **out loud in one sentence** — that converts MCQ knowledge into oral-interview material (pairs with the [speaking guide](08_oral_interview_speaking_guide.md)).
3. Re-attempt missed questions after 2 days. A question isn't "done" until you can explain why every wrong option is wrong.
