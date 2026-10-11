# MEGA MCQ Bank — Fullstack Next.js Role

One file, every topic: Next.js, React, JavaScript, Node, Express/HTTP, databases, Redis, queues, auth/security, AI/LLM. Format is compact — question, options, then the answer with a one-line why. Cover the answer line with your hand, commit to an option, then check. **A question is "done" only when you can also say why the wrong options are wrong.**

Sections (225 questions):
- [Part 1 — Next.js](#p1) — 60 full MCQs: rendering, hydration, caching, actions, middleware, deployment
- [Part 2 — React Internals](#p2) — 30 rapid
- [Part 3 — JavaScript Internals](#p3) — 25 rapid
- [Part 4 — Node, Express & HTTP](#p4) — 25 rapid
- [Part 5 — Databases, Redis, Queues](#p5) — 30 rapid
- [Part 6 — Auth, Security & AI/LLM](#p6) — 30 rapid
- [Part 7 — ORMs, Migrations & Indexing](#p7) — 25 rapid (Prisma, TypeORM, Liquibase)

Part 1 is full option-style MCQ. Parts 2–7 are rapid-fire: question → bolded answer → the one line to say when they ask "why?". Rapid format doubles as oral practice.

---

<a name="p1"></a>
# Part 1 — Next.js (60 questions)

## 1.1 Rendering & Components

**Q1.** Where does a `'use client'` component's code execute?
a) Browser only b) Server only c) Server for initial HTML + browser for hydration d) Depends on `runtime` export
> **c** — 'use client' components SSR once for first paint, then hydrate. The #1 misconception question.

**Q2.** Where does a server component's code execute?
a) Server per request (or build time), never in browser b) Server + browser c) Browser after payload arrives d) Edge only
> **a** — its JS never ships to the client; the browser gets only its rendered output in the RSC payload.

**Q3.** What does `'use client'` actually mark?
a) One component as client b) A module-graph boundary — that module *and everything it imports* become client code c) A file to skip SSR d) A lazy chunk
> **b** — it's a boundary directive; transitively imported modules join the client bundle.

**Q4.** Which can a server component do that a client component cannot?
a) useState b) onClick c) await a database query directly in the body d) useContext
> **c** — async body + direct backend access; a, b, d are client-only capabilities.

**Q5.** A client component needs a server component inside it. Valid approach:
a) `import` it and render b) Receive it as `children`/prop from a server parent c) Impossible d) `next/dynamic`
> **b** — the slot/donut pattern: the server component is rendered *before* being passed in. Importing would drag it into the client graph.

**Q6.** Which prop CANNOT cross the server→client boundary?
a) `Date` b) A plain object c) An inline arrow function d) A promise
> **c** — props must be RSC-serializable; functions aren't (server action references are the one exception).

**Q7.** Why can promises be passed to client components?
a) They're serialized when resolved and streamed; client unwraps with `use()` b) They can't c) They're converted to callbacks d) Only in Pages Router
> **a** — the streaming serializer supports pending promises; `use()` suspends until the value streams in.

**Q8.** A page uses `cookies()` in one deeply nested component. Effect on the route:
a) Only that component is dynamic b) Whole route becomes dynamic c) Build error d) Cookie is ignored at build
> **b** — one dynamic API opts out the entire route from static rendering (PPR + Suspense is the isolation mechanism).

**Q9.** What is Partial Prerendering (PPR)?
a) Rendering only above-the-fold b) Static shell served instantly + dynamic holes streamed per-request within the same route c) Caching half the RSC payload d) Prerendering only for bots
> **b** — combines static and dynamic in one route via Suspense boundaries.

**Q10.** `generateStaticParams` in App Router replaces which Pages Router API?
a) getStaticProps b) getServerSideProps c) getStaticPaths d) getInitialProps
> **c** — it enumerates dynamic segment values to prerender.

**Q11.** A dynamic route `/posts/[id]` with no `generateStaticParams` and default config. First visit to `/posts/42`:
a) 404 b) Rendered on demand, then can be cached for later visits c) Always SSR every time forever d) Client-rendered
> **b** — on-demand rendering with caching (dynamicParams default true).

**Q12.** `<Link>` navigation fetches:
a) Full HTML document b) Only the RSC payload for the changed segments c) JSON props d) Nothing
> **b** — client navigation = payload fetch (`?_rsc=`), and shared layouts don't re-render.

**Q13.** Layouts across navigation within the same layout:
a) Re-render every navigation b) Persist — do NOT re-render; state inside is kept c) Remount d) Re-fetch data always
> **b** — this persistence is also why auth checks *only* in a layout are a security hole.

**Q14.** `template.tsx` vs `layout.tsx`:
a) Identical b) Template remounts (fresh state/effects) on every navigation; layout persists c) Template is for emails d) Layout is Pages Router only
> **b** — use template when you *want* per-navigation reset (animations, per-page effects).

**Q15.** What does `loading.tsx` compile to?
a) HTTP 102 b) An automatic `<Suspense>` around the segment's page c) Middleware spinner d) A skeleton in the router cache
> **b** — pure Suspense sugar.

**Q16.** `error.tsx` must be:
a) A server component b) A client component (needs the reset interaction + error boundary class behavior) c) async d) In the root only
> **b** — error boundaries are client-side constructs.

**Q17.** Errors thrown in a server component in production reach the client as:
a) Full stack trace b) Generic message + digest (real message stripped to avoid leaking) c) The raw error message d) 500 JSON
> **b** — log the digest server-side to correlate.

**Q18.** `notFound()` and `redirect()` work by:
a) Returning special objects b) Throwing special control-flow errors Next catches c) Setting headers d) Magic comments
> **b** — hence: don't swallow them in try/catch (rethrow if you must catch).

**Q19.** Parallel routes (`@slot` folders) enable:
a) Faster builds b) Rendering multiple pages simultaneously in one layout (dashboards, modals) with independent loading/error states c) Multi-region deploys d) A/B tests
> **b** — each slot is an independent subtree with its own states.

**Q20.** Intercepting routes (`(.)folder`) are typically used for:
a) Auth walls b) Showing a route as a modal on soft navigation while keeping the full page on hard navigation/refresh c) Redirect loops d) Middleware shortcuts
> **b** — e.g., photo modal over feed; direct URL visit gets the full photo page.

## 1.2 Hydration

**Q21.** Hydration is:
a) Re-fetching data on mount b) React rendering in memory and *adopting* the existing server DOM — attaching handlers/state without recreating nodes c) Downloading the RSC payload d) CSS-in-JS injection
> **b** — adopt, not rebuild.

**Q22.** On a hydration mismatch, React 18:
a) Keeps server HTML b) Discards that subtree's server HTML and client-renders it, logging an error c) Blank page d) Patches attributes silently
> **b** — you lose the SSR benefit for that subtree.

**Q23.** Which causes a mismatch?
a) `Date.now()` rendered directly b) `useEffect` setting a date after mount c) Static text d) `suppressHydrationWarning`
> **a** — server and client evaluate at different times → different output. b is the *fix*.

**Q24.** `<p><div>x</div></p>` causes hydration errors because:
a) React forbids div b) The browser's HTML parser restructures invalid nesting, so the real DOM ≠ React's expected tree c) CSS conflict d) It doesn't
> **b** — server sends invalid HTML, browser "fixes" it, comparison fails.

**Q25.** Reading `localStorage` for initial render state. Correct pattern:
a) `useState(() => localStorage.getItem(k))` b) Render a deterministic default, then read+set in `useEffect` (or `useSyncExternalStore` with a server snapshot) c) typeof window ternary in JSX d) Disable SSR globally
> **b** — first client render must match server output; effects run only post-hydration.

**Q26.** The dark-mode "flash + mismatch" problem is properly solved by:
a) ssr:false on the whole app b) A blocking inline script in `<head>` setting the theme class before paint + suppressHydrationWarning on `<html>` c) A cookie only d) CSS variables alone
> **b** — the next-themes approach.

**Q27.** `useEffect` runs on the server:
a) Once b) Never c) Only in App Router d) Only with 'use server'
> **b** — effects are browser-only, after hydration. Foundation of every mismatch fix.

**Q28.** Selective hydration means:
a) Hydrating only visible components b) React hydrates Suspense boundaries independently/out of order, prioritizing the boundary the user interacts with c) Skipping static routes d) Worker-thread hydration
> **b** — plus time-slicing so hydration yields to input.

**Q29.** `dynamic(() => import('./Map'), { ssr: false })` in App Router is allowed:
a) Anywhere b) Only inside client components c) Only in layouts d) Deprecated
> **b** — server components can't opt a child out of SSR; the boundary must already be client.

**Q30.** The biggest lever to reduce hydration cost:
a) Faster server b) Smaller images c) Move 'use client' to leaf components so less of the tree ships JS d) HTTP/3
> **c** — hydration cost scales with client-component JS; RSC parts cost zero.

## 1.3 Caching & Data

**Q31.** The four caches, correctly located:
a) All server-side b) Memoization (per-request, server), Data Cache (persistent, server), Full Route Cache (persistent, server), Router Cache (browser memory) c) All browser d) CDN, Redis, disk, RAM
> **b** — two persistences, one per-request, one client-side.

**Q32.** Same `fetch(url)` in layout AND page during one request → network calls:
a) 2 b) 1 (request memoization) c) 0 d) config-dependent
> **b** — automatic dedupe within a render pass.

**Q33.** To get that same dedupe for a *Prisma* call:
a) Automatic b) Wrap in `React.cache()` c) unstable_noStore d) Impossible
> **b** — memoization is automatic only for fetch.

**Q34.** `React.cache()`'s lifetime:
a) Forever b) One server request c) 30 seconds d) One deployment
> **b** — per-request; cross-request persistence is the Data Cache's job.

**Q35.** Next.js **15** default for plain `fetch` in server components:
a) Cached forever b) Not cached (no-store semantics) — you opt IN c) 60s d) Prod-only caching
> **b** — flipped from 14's cache-by-default. Version-sensitive answer.

**Q36.** `revalidateTag('posts')` at call time:
a) Re-renders everything now b) Marks tagged data-cache entries stale; next request re-fetches/re-renders c) Purges CDN only d) Clears all users' browser caches instantly
> **b** — lazy invalidation.

**Q37.** `revalidatePath` vs `revalidateTag`:
a) Same b) Path targets a route (+ its route cache); tag targets all data entries with that tag across any route c) Tag is Pages-only d) Path is client-side
> **b** — tags scale better for shared data.

**Q38.** `unstable_cache` / `'use cache'` exists because:
a) fetch is broken b) The Data Cache only intercepts fetch — direct DB/ORM results need explicit wrapping to persist across requests c) Redis requirement d) Edge limitation
> **b**.

**Q39.** ISR `revalidate: 60`; request at t=90s gets:
a) Fresh page after waiting b) Stale page instantly; regeneration happens in background for the NEXT visitor c) 404 d) loading.tsx
> **b** — stale-while-revalidate.

**Q40.** After a server action calls `revalidatePath`, the submitting user sees fresh data because:
a) WebSocket push b) The action's response carries the re-rendered RSC payload and invalidates the client router cache c) Polling d) They don't, until refresh
> **b** — one round trip: mutate + fresh UI.

**Q41.** Mutating via plain client `fetch('/api/x', {method:'POST'})`; page shows stale data. Fix:
a) revalidateTag in the client b) `router.refresh()` (router cache doesn't know your API call happened) — or use a server action c) Clear cookies d) force-dynamic
> **b** — classic real bug.

**Q42.** Which does NOT make a route dynamic?
a) cookies() b) headers() c) `{ next: { revalidate: 60 } }` d) searchParams in page
> **c** — time-based revalidation keeps it static (ISR).

**Q43.** `export const dynamic = 'force-static'` on a route using cookies():
a) Errors at build/runtime or returns empty values — you're overriding with static promise b) Works with real cookies c) Hybrid mode d) Ignored
> **a** — forcing static means per-request APIs can't have real values.

**Q44.** Self-hosted, 3 replicas, default ISR cache. revalidatePath on replica 1:
a) All replicas purge b) Replicas 2 & 3 keep serving their own disk-cached copy — need a shared cacheHandler (Redis) c) Crash d) Proxy to replica 1
> **b** — the famous self-hosting question.

**Q45.** Router cache behavior in Next 15 vs 14:
a) Identical b) 14 reused page payloads up to 30s (dynamic)/5min (static); 15 defaults staleTime for dynamic pages to 0 — fresh on every navigation c) 15 caches more d) Removed entirely
> **b** — direction of change: less implicit client caching.

## 1.4 Server Actions, Route Handlers, Middleware

**Q46.** The wire mechanics of invoking a server action:
a) GET with params b) POST to the current page URL with `Next-Action: <hashedId>` header + serialized args c) WebSocket d) POST /api/_actions
> **b**.

**Q47.** Who can invoke an exported server action in production?
a) Only your components b) Anyone crafting the request — it's a public endpoint; authorize inside every action c) Same-origin only, enforced cryptographically d) Authenticated users
> **b** — Origin/Host check mitigates CSRF only; auth is on you.

**Q48.** Multiple rapid action submissions from one client:
a) Parallel b) Queued sequentially per client — a slow action head-of-line-blocks the rest c) Deduped d) 429
> **b** — keep actions fast; offload long work.

**Q49.** `redirect()` inside `try { ... } catch (e) { ... }`:
a) Works fine b) The redirect is swallowed — it throws a control error; rethrow or move it after the try c) Compiler error d) Double redirect
> **b**.

**Q50.** Server action return values must be:
a) Anything b) RSC-serializable (plain data, Date, Map/Set, FormData…) — no class instances/functions; return DTOs not ORM entities c) JSON strings only d) void
> **b**.

**Q51.** `await req.json()` then `await req.text()` on the same request:
a) Both work b) Second fails/empty — the body is a one-shot stream; `req.clone()` first if needed c) text returns JSON string d) TypeError
> **b**.

**Q52.** In Next 15, a GET route handler with no dynamic APIs is by default:
a) Cached like a static page b) Executed every request (uncached by default; 14 cached it) c) Cached 5 min d) Edge-cached
> **b**.

**Q53.** Verifying a Stripe webhook signature requires:
a) Parsed JSON re-stringified b) The RAW body text before parsing — re-serialization breaks the HMAC c) Header only d) URL check
> **b** — eternal webhook bug.

**Q54.** Why can't server components set cookies?
a) Read-only API b) By render time the response may already be streaming — headers committed; setting is legal only in actions/route handlers/middleware c) Security d) They can
> **b**.

**Q55.** Middleware runs on:
a) Node runtime with full APIs b) Edge runtime (web-standard APIs; no TCP DB connections; use `jose` not `jsonwebtoken`) c) The browser d) A worker thread
> **b**.

**Q56.** Middleware `matcher` should exclude `_next/static`, images, etc. because:
a) They error b) Running middleware on every asset request adds pointless latency/cost c) Security d) Matcher is required syntax
> **b**.

**Q57.** Auth ONLY in middleware is insufficient because:
a) It's slow b) Middleware is bypassable (e.g. the x-middleware-subrequest CVE) and is an optimistic UX layer — the authoritative check belongs in the data access layer c) Cookies unavailable d) It logs out users
> **b** — defense in depth.

**Q58.** `NextResponse.rewrite` vs `redirect`:
a) Same b) Rewrite serves different content under the SAME URL (multi-tenant, A/B); redirect changes the browser URL with 307/308 c) Rewrite is client-side d) Redirect is faster
> **b**.

**Q59.** Edge runtime CANNOT:
a) fetch b) Use Node's `fs`, native addons, TCP sockets (so no direct Postgres) c) WebCrypto d) Return streams
> **b** — HTTP-based DB drivers are the workaround.

**Q60.** Putting an edge function in front of a single-region database:
a) Always faster b) Latency trap — compute runs near the user but every query crosses the world to the DB c) Impossible d) Free replication
> **b** — edge wins only for DB-free or globally-distributed-data work.

---

<a name="p2"></a>
# Part 2 — React Internals (30 rapid questions)

Format: question → answer → the one line to say in the interview.

**Q61.** `setCount(count+1)` twice in one handler (start 0) → final? **1.** Both closures read 0; batched into one render. Functional form `c=>c+1` twice gives 2.

**Q62.** React 18 batching covers setState in timeouts/promises? **Yes** — automatic batching went beyond event handlers in 18; `flushSync` is the opt-out.

**Q63.** `setState` with an Object.is-equal value? **Bails out, no re-render.** Also why mutating state then setState(same ref) does nothing — immutability powers change detection.

**Q64.** `<div>` becomes `<span>` at the same tree position? **Full subtree teardown — child state lost.** Type change = new tree. Same reason conditional wrapper swaps reset children.

**Q65.** Index as key breaks when? **List reorders/inserts** — state (inputs, checkboxes) sticks to positions, not items. Stable IDs fix it; `key={userId}` also deliberately forces remounts.

**Q66.** `React.memo` child still re-renders every time — why? **A prop is a fresh reference each render** (inline object/function). Shallow compare fails; memoize the props, not more components.

**Q67.** Context provider `value={{user}}` re-renders all consumers — why? **New object identity per render.** Memoize the value or split contexts. And context has no selectors — any change hits every consumer; that's the case for Zustand on hot state.

**Q68.** `useEffect` vs `useLayoutEffect`? **Layout runs after DOM mutation but BEFORE paint** (sync — measure without flicker); useEffect after paint. Neither runs on the server.

**Q69.** Why does Strict Mode double-mount in dev? **To expose missing effect cleanups and impure renders** before concurrent features break them. It's a lint-by-execution.

**Q70.** Fetch in useEffect without abort — the real bug? **Race**: slow old response overwrites the new one. Cleanup with AbortController; also stops setState-after-unmount.

**Q71.** Object literal in deps `[{id}]`? **Effect runs every render** — Object.is on a fresh reference. Depend on primitives.

**Q72.** Why hooks can't be conditional? **They're tracked by call order** on the fiber — a skipped call shifts every later hook's state slot. The "linked list of hooks" answer.

**Q73.** Custom hooks share state or logic? **Logic only** — each component gets independent state instances per hook call.

**Q74.** How does a component "suspend"? **It throws a promise** (via `use()`/framework APIs); the nearest Suspense renders the fallback until it resolves. Throw-as-protocol, same trick as `redirect()`.

**Q75.** `useTransition` vs `useDeferredValue`? **Transition marks *updates you make* as non-urgent; deferredValue lags *a value you receive*.** Both make expensive renders interruptible — neither is a debounce.

**Q76.** Error boundaries don't catch? **Event handlers, async code, and their own render.** Handlers need try/catch; async needs .catch — a favorite trick MCQ.

**Q77.** `useSyncExternalStore`'s server snapshot argument exists to? **Give SSR + first client render one deterministic value** — the hydration-safe way to read external stores (navigator.onLine, media queries).

**Q78.** `useMemo` guarantee? **None — it's a hint.** React may discard the cache. Never side-effect inside it.

**Q79.** The `children` bailout: parent's own state changes — do children passed from above re-render? **No — same element references skip.** Also exactly how server components sit inside client components in Next.

**Q80.** `useOptimistic` failure case? **Auto-reverts** to real state when the action settles differently — assume success, reconcile later (the WhatsApp grey tick).

**Q81.** Portals escape the DOM tree — do they escape React's tree? **No** — context and event bubbling still follow the React hierarchy. Modals keep their providers.

**Q82.** Controlled vs uncontrolled forms in modern Next? **Uncontrolled + FormData + server actions is back in fashion** — less re-render cost; controlled only where per-keystroke logic is needed.

**Q83.** Fiber in one line? **The reconciler that makes rendering incremental and interruptible** — pausable units of work with priorities; the foundation under concurrent features and selective hydration.

**Q84.** `flushSync` use case? **Force a sync render mid-handler to measure DOM immediately after an update.** Habitual use = you've disabled batching.

**Q85.** Two Counters swap positions with stable keys — state? **Travels with them.** Keys are identity, not decoration.

**Q86.** Render-phase side effect example that Strict Mode catches? **Pushing to an array / firing analytics during render** — renders must be pure because React may run them any number of times and throw results away.

**Q87.** Why lift state up instead of syncing two states? **One source of truth in the common parent** — two synced copies WILL drift; derived data should be computed, not stored.

**Q88.** `useRef` for values — when over useState? **When changing it must NOT re-render** — timer IDs, latest-value mirrors, DOM nodes, "was mounted" flags.

**Q89.** Keys must be unique — globally? **Among siblings only.**

**Q90.** setState during render — ever legal? **Yes, conditionally (derived-state pattern)** — React immediately re-runs with new state. Unconditional = infinite-loop error.

---

<a name="p3"></a>
# Part 3 — JavaScript Internals (25 rapid questions)

**Q91.** `console.log(a); var a=5;` vs with `let`? **var → undefined (hoisted+initialized); let → ReferenceError (temporal dead zone).**

**Q92.** `for (var i=0;i<3;i++) setTimeout(()=>log(i))` prints? **3 3 3** — one shared `i`. `let` prints 0 1 2 (fresh binding per iteration). The closure question.

**Q93.** Closure in one line? **A function that keeps its lexical scope alive after the outer function returns.** Hooks, once(), module counters all ride on it.

**Q94.** `0.1+0.2===0.3`? **false** — IEEE-754. Compare with epsilon; store money as integer cents.

**Q95.** `typeof null`? **'object'** — a fossilized bug.

**Q96.** `NaN == NaN`? **false** — NaN equals nothing; use `Number.isNaN`.

**Q97.** `const obj={a:1}; obj.a=2;` — legal? **Yes** — const freezes the *binding*, not the object. `Object.freeze` is shallow.

**Q98.** Regular vs arrow `this`? **Regular: decided by call site. Arrow: inherited lexically, can't be re-bound.** Detached method `const {fn}=obj; fn()` loses this → bind or call via obj.

**Q99.** Output: `log(1); setTimeout(()=>log(2)); Promise.resolve().then(()=>log(3)); log(4);` → **1 4 3 2** — sync → microtasks (fully drained) → macrotasks.

**Q100.** `process.nextTick` vs promise microtask order (Node)? **nextTick queue drains first**, then promises — and recursive nextTick starves I/O.

**Q101.** `Promise.all` vs `allSettled`? **all rejects fast on first failure; allSettled always resolves with per-item status.** Partial-failure-tolerant batches → allSettled.

**Q102.** `race` vs `any`? **race: first settled (win or lose). any: first FULFILLED, AggregateError only if all reject.** race + timeout promise = the timeout pattern.

**Q103.** `await` inside a for-of over URLs? **Sequential waterfall.** Parallel = map to promises + Promise.all, bounded with a concurrency pool for large sets.

**Q104.** Unhandled rejection in modern Node? **Crashes the process** by default. Every floating promise needs an owner.

**Q105.** `{...obj}` on nested data? **Shallow** — nested objects shared. Deep: `structuredClone` (handles Date/Map/cycles; throws on functions — same rule as RSC props). JSON round-trip silently drops Dates/undefined.

**Q106.** `WeakMap` vs Map? **Weakly-held object keys → entries GC with the key** — leak-free metadata/caches; not iterable.

**Q107.** Debounce vs throttle? **Debounce = after N ms of silence (search box). Throttle = at most once per N ms during activity (scroll).**

**Q108.** Event delegation works because? **Bubbling** — one parent listener + `event.target` covers current AND future children. React's root delegation = same idea.

**Q109.** `stopPropagation` vs `preventDefault`? **One halts bubbling; the other cancels the browser's default action.** Independent.

**Q110.** `a?.b ?? 'x'` returns 'x' when? **a is nullish or a.b is nullish — NOT for '' or 0** (that's `||`). The ??-vs-|| trap.

**Q111.** `[10,9,1].sort()`? **[1,10,9]** — string sort by default; pass `(a,b)=>a-b`.

**Q112.** Tagged templates (`` sql`...${x}` ``) receive? **String parts separate from values** — why $queryRaw tagged templates are injection-safe.

**Q113.** ESM vs CJS in one line? **ESM is static (tree-shakeable, live bindings, top-level await); CJS is dynamic synchronous require with value copies.** Interop pain lives at default exports.

**Q114.** Generators/async iterators — where do you actually use them? **Streaming consumption** — `for await (const chunk of stream)`; LLM token streams are async iterables.

**Q115.** Symbols — real use? **Collision-free keys and protocols** — Symbol.iterator / Symbol.asyncIterator are how for-of / for-await find the iterator.

---

<a name="p4"></a>
# Part 4 — Node, Express & HTTP (25 rapid questions)

**Q116.** Event loop phase order? **timers → pending → poll (I/O; idles here) → check (setImmediate) → close** — with nextTick + promise microtasks fully drained between every callback.

**Q117.** `setTimeout(0)` vs `setImmediate` from main script? **Non-deterministic.** From inside an I/O callback? **setImmediate always wins** (poll → check). Explaining *why* is the answer.

**Q118.** What runs on the libuv threadpool? **fs, crypto (pbkdf2/scrypt/bcrypt), zlib, dns.lookup** — NOT network sockets (epoll/kqueue, zero threads). Default size 4 → four bcrypt calls make file reads queue. The hidden-coupling question.

**Q119.** Why does 300ms of sync JSON.parse hurt more than a 300ms DB query? **Parse blocks the single JS thread for EVERYONE; awaited I/O blocks only that request.** Event-loop blocking is global.

**Q120.** Detect event-loop blocking in prod? **perf_hooks.monitorEventLoopDelay / event-loop utilization** — alert on p99 lag; find culprits with CPU profiles. Causes: big JSON, catastrophic regex (ReDoS), sync crypto.

**Q121.** `res.write()` returns false — meaning? **Socket buffer full — stop until 'drain' or you buffer unboundedly (OOM with slow clients).** `pipeline()` handles it; `.on('data', ...)` + write does not.

**Q122.** `pipe` vs `pipeline`? **pipeline propagates errors and destroys all streams; pipe leaks the source on destination error** — the fd-leak question.

**Q123.** Express error middleware is recognized by? **Arity — exactly 4 params (err, req, res, next).** Three params = it's a normal middleware and your errors sail past it.

**Q124.** Async handler throws after await — Express 4? **Unhandled rejection; request hangs.** Must next(err)/wrap. **Express 5 forwards awaited rejections automatically.**

**Q125.** "Cannot set headers after they are sent"? **Two responses on one request** — usually next() after res.json(), or a missing return in a guard. Single-response discipline; check res.headersSent in late handlers.

**Q126.** Graceful shutdown order? **Fail readiness → server.close() (+ closeIdleConnections for keep-alive sockets) → close workers/pools → flush logs → exit within the grace period.** And `keepAliveTimeout` must exceed the LB idle timeout or you get intermittent 502s.

**Q127.** 401 vs 403? **401 = who are you (unauthenticated); 403 = I know you, no (unauthorized).**

**Q128.** 301 vs 302 vs 307/308? **301/308 permanent, 302/307 temporary; 307/308 preserve the METHOD (a 302 can turn POST into GET).**

**Q129.** PUT vs PATCH? **PUT replaces the whole resource (idempotent by definition); PATCH partial-updates.** POST is the only non-idempotent verb of the four — and why retry logic differs.

**Q130.** ETag / If-None-Match flow? **Server hashes response → client sends hash back → 304 Not Modified with empty body on match.** Bandwidth saved, latency kept.

**Q131.** CORS preflight (OPTIONS) triggers when? **Non-simple requests — custom headers (Authorization!), JSON content-type, non-GET/POST methods.** CORS protects browsers, not servers — curl ignores it entirely.

**Q132.** Slowloris? **Clients trickling bytes to hold sockets open** — mitigated by headersTimeout/requestTimeout. Pair with body-size limits and pagination caps for the DoS checklist.

**Q133.** Cluster vs worker_threads? **Cluster/processes: scale I/O-bound HTTP across cores (in k8s: 1 process/pod, scale replicas). worker_threads: CPU-bound work with shareable memory.** Threads don't help I/O — the loop already does.

**Q134.** SSE vs WebSocket? **SSE: one-way server→client over plain HTTP, auto-reconnect, proxy-friendly — perfect for token streams. WS: bidirectional, needed for collab/games.** EventSource can't POST — real chat UIs parse SSE off a fetch stream.

**Q135.** Idle keep-alive connections and `server.close()`? **close() waits for them forever** — Node 18's closeIdleConnections(), or track sockets. The deploy-hangs question.

**Q136.** ECONNRESET bursts to the DB every ~30s? **Something between (LB/pgbouncer/NAT) kills idle connections and the pool reuses corpses.** Client idle timeout < infra timeout + validation/retry-once.

**Q137.** Request ID pattern? **Generate in middleware, attach to req + every log line + error responses** — the digest that ties a user complaint to server logs.

**Q138.** Rate-limit algorithms ranked for APIs? **Fixed window (bursts at edges) < sliding window (smooth) < token bucket (bursts + steady refill).** Distributed = shared store (Redis + Lua), never per-instance memory.

**Q139.** Fail-open or fail-closed when the rate limiter's Redis dies? **Usually fail-open + alert** — the limiter must not become the outage. (Auth checks: the opposite.)

**Q140.** bcrypt in a route handler — the hidden cost? **CPU-bound: blocks threadpool slots and (sync version) the loop** — why login endpoints get rate limits and sometimes their own service.

---

<a name="p5"></a>
# Part 5 — Databases, Redis, Queues (30 rapid questions)

**Q141.** Two txns read balance=100, both write −50 (READ COMMITTED)? **Final 50 — lost update.** Fixes: atomic `SET balance = balance - 50 WHERE balance >= 50`, SELECT FOR UPDATE, SERIALIZABLE + retry, or version column.

**Q142.** What does SERIALIZABLE catch that REPEATABLE READ doesn't? **Write skew** — two txns each check a constraint then write different rows (the on-call-doctors example). RR = snapshot isolation; skew survives it.

**Q143.** Index exists but Seq Scan anyway — four causes? **Low selectivity (>~10% of rows), function/type mismatch on the column, stale stats (ANALYZE), non-leading composite column.** Bonus: `LIKE '%x'`.

**Q144.** Composite index (a,b) — which queries can use it? **WHERE a, and WHERE a AND b — not b alone.** Leftmost-prefix rule; same in Mongo.

**Q145.** Why did adding an index slow writes AND not speed the query? **Every write maintains every index (and can kill HOT updates); the query didn't match the index shape.** Indexes are workload design.

**Q146.** MVCC in one line + its tax? **Writers create row versions, readers use snapshots — no read/write blocking; the tax is dead tuples → VACUUM, bloat, and wraparound if autovacuum falls behind.** Long idle transactions pin cleanup.

**Q147.** Add a column to a 500M-row table safely? **ADD COLUMN DEFAULT is metadata-only (PG11+); constraint via NOT VALID + VALIDATE; CREATE INDEX CONCURRENTLY; always lock_timeout** — the ALTER's exclusive lock queuing behind one long query stalls the world.

**Q148.** N+1 detection and fix? **1 query for the list + N for relations — logs show repeated identical shapes.** Fix: join/include/eager-load, or batch with IN / DataLoader. Exists in RSC trees too.

**Q149.** Offset vs cursor pagination? **OFFSET 100000 still scans and discards 100k rows and drifts under concurrent writes; cursor (WHERE id < last) is O(page) and stable.** Infinite scroll = cursor, always.

**Q150.** Transaction pooling (pgbouncer) breaks what? **Session state — prepared statements, advisory locks, SET.** The "works locally, breaks behind pgbouncer" question.

**Q151.** Read replica lag symptom? **User writes then immediately reads old data.** Fixes: read-your-writes (pin to primary briefly / LSN token), monotonic reads (same replica per session), or respond with the written data.

**Q152.** When is MongoDB the right call? **Document-shaped data read together, flexible/varied schemas, horizontal scale by design** — and embed vs reference is decided by "what's accessed together" + the 16MB doc cap + unbounded-array ban.

**Q153.** Mongo multi-document transactions? **Exist (replica sets) but signal your schema fights the model** — single-document atomicity is free and should carry most invariants.

**Q154.** Redis single-threaded — when does it bite? **O(n) commands: KEYS, huge LRANGE/SMEMBERS, DEL of giant keys (use UNLINK), slow Lua** — one 500ms command pauses every client. SCAN + SLOWLOG.

**Q155.** Check-then-set race in Redis — proper fix? **Lua script** — read, branch, write atomically server-side. WATCH/MULTI is optimistic-retry; two round trips is always a race.

**Q156.** Correct distributed lock release? **Lua: if GET == myToken then DEL** — unconditional DEL deletes the NEXT holder's lock after yours expired. And why it's still unsafe: pauses outlive leases → fencing tokens; correctness invariants belong in the DB (unique constraints).

**Q157.** Cache stampede defenses? **Per-key mutex, stale-while-revalidate, probabilistic early refresh, jittered TTLs; truly-hot keys refreshed by cron, not by requests.**

**Q158.** The subtle cache-aside race? **Reader misses → reads old DB value → write+invalidate lands → reader sets stale into cache — stale until TTL.** Mitigate: TTL backstop, double delete, versioned keys. And DELETE on write, never update-in-place.

**Q159.** Redis as BullMQ store — the config trap? **maxmemory-policy must be noeviction** — LRU eviction silently deletes job state. Cache and queue want opposite configs; don't share one instance blindly.

**Q160.** BullMQ: why Lua everywhere? **Every state transition (add, moveToActive, complete, fail) must read-branch-write atomically; Redis's single thread executes each script indivisibly — workers never coordinate with each other.**

**Q161.** How does BullMQ detect a dead worker? **Lease locks: lock key with TTL, renewed on a timer; stalled-checker requeues jobs whose lock expired; maxStalledCount then dead-letters repeat offenders.**

**Q162.** The classic BullMQ double-processing bug? **CPU-bound job blocks the event loop → lock renewal can't fire → lock expires → second worker starts the same job.** Fix: sandboxed processors (or chunk with awaits) — not just a bigger lockDuration.

**Q163.** BullMQ delivery guarantee? **At-least-once.** Exactly-once EFFECTS = deterministic jobIds (enqueue dedup) + idempotent processors (transactional marker / provider idempotency keys).

**Q164.** DB write + enqueue atomically? **Outbox pattern** — job row in the same transaction, relay publishes, dedup by deterministic jobId. The answer template for every "atomic X and publish Y".

**Q165.** Queue depth rising — first three checks? **Paused flag, rate limiter engaged, jobs parked in delayed (backoff after failure burst)** — then worker health and the downstream bottleneck (often the DB, not workers).

**Q166.** BullMQ vs Kafka in one line? **BullMQ = jobs to execute (consumed, retried, done); Kafka = a replayable log with per-partition ordering and multiple independent consumer groups.** Need replay or strict per-key order → Kafka.

**Q167.** removeOnComplete unset — what happens over months? **Completed job hashes accumulate → Redis memory creep and slower ops.** `{ age, count }` bounded retention; keep failed longer (it's your DLQ).

**Q168.** Worker concurrency 10 = 10 parallel? **No — 10 interleaved on ONE event loop (I/O concurrency).** True parallelism = more processes/pods or sandboxed processors. Total = pods × concurrency.

**Q169.** Job ordering guarantee? **Only with 1 worker, concurrency 1, no retries/priorities.** Per-entity ordering needs partitioning (Kafka) or BullMQ Pro groups.

**Q170.** Poison message defenses? **attempts cap → failed set, UnrecoverableError for non-retryables (4xx/validation), maxStalledCount for crash-the-worker payloads, alert on failed-set growth.**

---

<a name="p6"></a>
# Part 6 — Auth, Security & AI/LLM (30 rapid questions)

**Q171.** JWT vs DB sessions? **JWT: stateless verify, hard revocation. DB: instant revocation, per-request lookup.** Production hybrid: short JWT (5–15min) + refresh token in DB.

**Q172.** Where do tokens live in the browser? **httpOnly + Secure + SameSite cookie.** localStorage = any XSS exfiltrates the session. httpOnly means JS can't read it — that's the point.

**Q173.** What does SameSite=Lax actually stop? **Cross-site POSTs carrying your cookie (CSRF)** while still sending it on top-level link navigation. Strict breaks arriving-logged-in via external links.

**Q174.** JWT alg:none / algorithm-confusion attacks? **Accepting the header's algorithm blindly** — verify against a fixed expected algorithm and key; reject none. Library defaults have burned people.

**Q175.** Access token 15 min — why so short? **Bounds the damage window of a stolen stateless token; the refresh token (revocable, in DB, rotated on use) does longevity.** Rotation + reuse-detection catches theft.

**Q176.** bcrypt/argon2 over SHA-256 for passwords? **Deliberately slow + salted — brute-force cost.** Fast hashes are for integrity, not secrets. Cost factor ≥12; hashing is CPU-bound → rate limit login.

**Q177.** SQL injection is fully prevented by? **Parameterized queries/ORM (values never concatenated into SQL text).** Escaping is the fragile cousin. Tagged-template raw queries are parameterized.

**Q178.** XSS in React — the actual danger zones? **dangerouslySetInnerHTML (sanitize server-side), javascript: URLs in href, injecting user content into scripts.** React escapes text children by default.

**Q179.** SSRF — the cloud-specific target? **169.254.169.254 metadata endpoint** — any fetch-a-user-URL feature needs protocol/host allowlists + private-IP blocking.

**Q180.** NEXT_PUBLIC_ env vars are? **String-inlined into the client bundle at build time** — visible to everyone, unchangeable without rebuild. Secrets must never carry the prefix; `import 'server-only'` makes leakage a build error.

**Q181.** Open redirect after login? **`?next=` must be validated as a RELATIVE path** — otherwise phishing uses your domain as a trusted bouncer.

**Q182.** CSP nonce approach? **Per-request nonce on your script tags + CSP header allowing only that nonce** — inline injection dies even if XSS lands markup.

**Q183.** Multi-tenant data isolation — enforcement point? **In the QUERY (WHERE tenant_id, ideally Postgres RLS)** — derived from session, never from request body; post-filtering model output is not isolation. Prove with adversarial tests in CI.

**Q184.** Rate limit login by? **IP AND target account** — attacker rotating IPs against one account, and one IP spraying many accounts, are different attacks.

**Q185.** Webhook security = ? **HMAC signature over the RAW body + timestamp tolerance (replay) + fast 200 + queue the work.** Parsing before verifying breaks the signature.

**Q186.** SSE streaming endpoint — the memory bug? **Ignoring res.write()'s false** — slow client → whole LLM answer buffers in Node. Await 'drain'. Plus abort upstream on req 'close' or you pay for unwatched tokens.

**Q187.** Mid-stream LLM error — how do you tell the client? **In-band event** — status is committed after first byte; your error middleware can't help. Protocol needs an error message type.

**Q188.** Provider 429 handling in a queue worker? **worker.rateLimit(retryAfter) + throw RateLimitError — queue pauses globally, attempt not consumed.** Blind per-job retries synchronize into herds; jitter everything.

**Q189.** TPM vs RPM? **Token-per-minute limits count estimated input+output — long prompts hit TPM long before RPM.** Estimate with tiktoken pre-flight; batch where possible.

**Q190.** Why must batch/offline LLM traffic be segregated from chat? **Shared quota — bulk jobs starve interactive latency.** Separate queues/keys; batch APIs (50% cost, 24h) for truly offline.

**Q191.** Embeddings from two different models in one index? **Not comparable — never mix.** Model version is schema; upgrades are online re-embed migrations (dual-write, backfill, flip).

**Q192.** Hybrid search exists because? **Dense vectors miss exact identifiers (SKUs, error codes) — the keyword gap; BM25 misses paraphrase.** Merge with Reciprocal Rank Fusion (rank-based, no score normalization).

**Q193.** Bi-encoder vs cross-encoder? **Bi: query and doc embedded independently — fast, coarse, scales to millions. Cross: joint attention over the pair — accurate, slow.** Retrieve 50 cheap → rerank to 8.

**Q194.** HNSW vs IVFFlat? **HNSW: graph, better recall/latency, RAM-hungry, no training. IVFFlat: clusters, needs training, drifts as data changes.** Default HNSW; remember ANN is approximate — recall is tunable (ef_search).

**Q195.** The multi-tenant vector search trap? **Filter + ANN index interplay — index finds neighbors THEN filters; selective filters scan far or under-return.** Partial indexes/partitioning per tenant, or iterative scans.

**Q196.** Lost-in-the-middle? **Models attend to the start/end of long contexts — stuffing 50 chunks buries the answer.** Best chunks first, fewer chunks, rerank hard.

**Q197.** Semantic cache false hit — why is it worse than a miss? **A confidently wrong answer** ("delete account" vs "delete message"). Threshold conservative (≥0.95), scope the key by tenant/model/prompt-version, invalidate on reindex.

**Q198.** Structured output — schema-valid means correct? **No — constrained decoding guarantees SHAPE, not truth.** Zod at the boundary + nullable fields so the model can legally say "not found" instead of inventing.

**Q199.** LLM retry vs DB retry — the four differences? **Non-deterministic (new output), billed per attempt, rate-limit coupled (jitter/Retry-After), and some errors are permanent for that input (413/content filter) — classify before retrying.**

**Q200.** Bill doubled, traffic flat — where do you look? **usage_events grouped by feature/model/tenant: growing conversation history, broken prompt-cache prefix (cached-token ratio), retry/repair loops (calls per request), top-k/chunk inflation, one scripting tenant.** Meter from the provider's usage object, not estimates.

---

# Closing — how to use this bank

- **10/day, out loud.** Answer, then say the one-liner as if the interviewer asked "why?" — that converts MCQ prep into oral prep (pair with the [speaking guide](08_oral_interview_speaking_guide.md)).
- Wrong answer → open the matching deep-dive file (05/06/07 here, or the express KB) — every question above has a home section.
- Company screens (PropertyLoop-style MERN + AI roles) mix exactly this: React internals + Next caching + Node event loop + one queue/LLM scenario block. Parts 2, 1, 4, 6 in that order are the highest-yield.

---

<a name="p7"></a>
# Part 7 — ORMs, Migrations & Indexing (25 rapid questions)

**Q201.** Prisma vs TypeORM in one line? **Prisma: schema-first (schema.prisma is the source of truth, generated type-safe client, no entities/decorators). TypeORM: code-first entities with decorators, Active Record or Data Mapper.** Prisma's types are generated, not inferred — that's why they're airtight.

**Q202.** `prisma migrate dev` vs `prisma migrate deploy`? **dev: diffs schema, CREATES a new migration, applies it, regenerates client — dev machines only. deploy: applies pending committed migrations, creates nothing — the only one CI/prod should run.** Running dev in prod is the classic footgun.

**Q203.** `prisma db push` is for? **Prototyping — syncs schema directly WITHOUT migration files (no history, can drop data).** Never in prod; migrate is the audited path.

**Q204.** How does Prisma know which migrations already ran? **`_prisma_migrations` table** — same idea as TypeORM's `migrations` table and Liquibase's `DATABASECHANGELOG`. Every migration tool is "a folder of change files + a ledger table."

**Q205.** A teammate edits an ALREADY-APPLIED migration file. What breaks? **Checksum/drift detection — environments that ran the old version now diverge; Prisma flags drift, Liquibase fails checksum validation.** Applied migrations are immutable; fix forward with a NEW migration.

**Q206.** Liquibase vs Prisma Migrate — the conceptual difference? **Liquibase: imperative changelog of changesets (XML/SQL/YAML) with rollback blocks, preconditions, contexts — DB-centric, language-agnostic, DBA-friendly. Prisma: declarative — you edit the desired schema and it generates the diff.** Java/enterprise shops run Liquibase/Flyway; the ledger-table concept is identical.

**Q207.** Why do most teams NOT write down-migrations? **Rolling back schema after prod data landed is usually lossy or impossible (dropped column data is gone).** Fix-forward + backups is the real strategy; down() exists mostly for local dev. Liquibase rollback blocks matter more in regulated environments.

**Q208.** Zero-downtime column rename? **Never a literal RENAME (old code breaks instantly). Expand → migrate → contract: add new column, dual-write, backfill in batches, switch reads, drop old column one deploy later.** Every step compatible with the previous deploy.

**Q209.** Adding a NOT NULL column to a live table — safe sequence? **Add nullable (+ default is metadata-only in PG11+), backfill in batches, add constraint as NOT VALID, then VALIDATE (scan without exclusive lock).** Plus lock_timeout so the ALTER doesn't queue the world behind one long query.

**Q210.** `CREATE INDEX` vs `CREATE INDEX CONCURRENTLY` in prod? **Plain takes a lock blocking writes for the whole build; CONCURRENTLY builds without blocking (slower, can't run in a transaction — Prisma migrations need it split out or run with advisory locks off).** The "migration froze production" postmortem.

**Q211.** Migration + code deploy ordering? **Migrations run BEFORE new code, so schema must accept OLD code (expand phase).** Additive first; destructive changes trail by one release. Never run migrations from app startup with multiple replicas racing — one migration job/step.

**Q212.** B-tree index serves which operators? **=, <, >, BETWEEN, ORDER BY, and LIKE 'prefix%' — not '%suffix'.** It's a sorted tree; anything needing sorted traversal wins.

**Q213.** When GIN over B-tree? **Multi-value cells: JSONB containment, arrays, full-text tsvector.** GIN = inverted index (value → rows). Slower writes, fat index — exactly the tradeoff MCQs probe.

**Q214.** Composite index (user_id, created_at) — which query is NOT served? **WHERE created_at alone** — leftmost-prefix rule. Serves: user_id; user_id+created_at; user_id ORDER BY created_at (the feed query — that's why this exact composite is everywhere).

**Q215.** Partial index use case? **Hot subset: `WHERE deleted_at IS NULL` or `WHERE status='pending'`** — smaller, faster, cheaper writes than indexing all rows for a query that only ever reads the subset.

**Q216.** Covering index / index-only scan? **INCLUDE extra columns so the query is answered entirely from the index — no heap fetch.** Caveat: needs a fresh visibility map (VACUUM), or it degrades to heap checks anyway.

**Q217.** Why does `WHERE lower(email) = $1` skip the index on email? **The index stores email, not lower(email)** — expression mismatch. Fix: expression index on lower(email), or citext. Same family: implicit casts (`text_col = 123`).

**Q218.** Prisma `include` vs `select`? **include pulls relations alongside all scalar fields; select picks exact fields (and can nest relations).** The interview point: both fight over-fetching — and returning full ORM rows to the client leaks fields; map to DTOs.

**Q219.** Prisma's N+1 defenses? **Relation loading in one query via include (JOIN or batched), and the fluent-API dataloader batching `findUnique().posts()` calls in one tick.** In RSC trees, wrap shared lookups in React.cache or fetch at the list level.

**Q220.** `$transaction([a, b])` array vs interactive `$transaction(async tx => ...)`? **Array: batch of independent writes, all-or-nothing, no read-then-branch. Interactive: read → decide → write with the tx client — required for balance checks; keep it short, it holds a connection.**

**Q221.** Optimistic vs pessimistic locking in ORM terms? **Optimistic: version column, `UPDATE ... WHERE id AND version=$n`, check affected rows, retry on 0 — no locks held, great for rare conflicts. Pessimistic: SELECT FOR UPDATE — serializes access, holds a connection, deadlock-prone.** Web apps default optimistic.

**Q222.** TypeORM Active Record vs Data Mapper? **AR: methods live on the entity (`user.save()`) — quick, but entities know the DB. DM: repositories mediate (`repo.save(user)`) — entities stay plain, testable; the pattern serious codebases pick.**

**Q223.** ORM `synchronize: true` (TypeORM) in production? **Auto-alters schema to match entities on boot — can DROP columns. Absolutely never in prod;** it's db-push-style prototyping. This exact question appears in screens because the default burned so many teams.

**Q224.** Raw SQL from an ORM — when is it justified? **Window functions, CTEs, bulk upserts, ANN/vector ops, performance-critical reports — anything the ORM expresses badly.** Keep it parameterized (tagged templates), map to typed DTOs at the edge.

**Q225.** EXPLAIN ANALYZE shows `rows=1` estimated vs `rows=180000` actual — meaning? **Planner statistics are wrong → wrong plan (nested loop over 180k rows).** ANALYZE the table, raise the stats target for skewed columns, or restructure. Estimated-vs-actual divergence is THE thing to read first in a plan.
