# Patterns Actually Used in Dynasty Frontend — Explained

This file walks through real techniques pulled straight out of `dynasty-frontend/src` — not textbook examples, your actual code. Har pattern: **kya hai, kyun use hua, kaise kaam karta hai** — beginner-friendly, kyunki maksad hai ki tum apna khud ka code explain kar sako.

Stack confirmed from `package.json`: React 18, Redux Toolkit + redux-persist, TanStack React Query + React Table, React Hook Form, React Router v6, **@dnd-kit** (drag & drop), **socket.io-client** (realtime), **@simplewebauthn/browser** (passkeys), **Tone.js + WaveSurfer.js** (audio), i18next, framer-motion, Firebase, Recharts.

## Table of Contents
1. [Drag & Drop Reordering (@dnd-kit)](#dragdrop)
2. [Playing Video/Audio + Opening Media in a New Tab](#media)
3. [Real-time Updates with Socket.IO](#sockets)
4. [Infinite Scroll (React Query + IntersectionObserver)](#infinite-scroll)
5. [Passkeys / WebAuthn (login without passwords)](#webauthn)
6. [Custom Query/Mutation Hooks Wrapping React Query](#custom-hooks)
7. [Debouncing Search Input](#debounce)
8. [Redux Toolkit + Persist for Auth State](#redux)
9. [Modals & Drawers Pattern](#modals)
10. [Quick Glossary](#glossary)

---

<a name="dragdrop"></a>
## 1. Drag & Drop Reordering — `@dnd-kit`

**Where**: `components/StemEditor/StemEditor.jsx` + `StemTrack.jsx` — reordering song sections (verse/chorus/bridge) by dragging.

**What drag-and-drop actually needs, conceptually**: three things — (1) something to know when a drag *starts*, moves, and *ends*, (2) a way to mark which items are "sortable" and give them a stable order, (3) a way to actually re-order your array of data when a drop happens. `@dnd-kit` gives you all three as separate pieces you wire together — it doesn't do the reordering *for* you, it tells you "item A was dropped where item B was" and you update your own array.

**Piece 1 — `DndContext`**: the outer wrapper. It listens for drag events across everything inside it.
```jsx
<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleReorder}>
  <SortableContext items={stems.map(s => s.id)} strategy={horizontalListSortingStrategy}>
    {stemsWithTiming.map(s => <StemTrack key={s.id} stem={s} ... />)}
  </SortableContext>
</DndContext>
```
- `sensors` — *how* a drag can be started. Real code from this project:
  ```jsx
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // mouse/touch, must move 8px first
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }) // arrow keys — accessibility!
  );
  ```
  The `distance: 8` is important: without it, a normal click (mouse down + up in the same spot) would register as a drag, breaking your onClick handlers. Requiring 8px of movement first means "click" and "drag" don't fight each other.
- `SortableContext` — tells dnd-kit which items are sortable, in what order, and using what layout strategy (`horizontalListSortingStrategy` = items reorder left-to-right like a horizontal row; there's also a vertical one for lists).
- `onDragEnd` — fires once, when the user releases. This is the **only** place you actually change your data.

**Piece 2 — `useSortable` per item** (in `StemTrack.jsx`):
```jsx
const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stem.id });
```
- `setNodeRef` — dnd-kit needs a reference to the actual DOM node to measure and move it. You attach it: `<div ref={setNodeRef}>`.
- `attributes` + `listeners` — spread onto whatever element should be the "drag handle". In this project, `listeners` is spread only onto a small grip-icon div (`stem_track_drag_handle`), **not** the whole card — so you can drag by the handle but still click buttons (download, remove) on the card without accidentally starting a drag.
- `transform` + `transition` — the live position while dragging. `CSS.Transform.toString(transform)` turns dnd-kit's internal transform object into a real CSS `transform: translate3d(...)` string you put in `style`.
- `isDragging` — boolean, true only for the item currently being dragged — used here to fade it (`opacity: isDragging ? 0.6 : 1`) and lift it above siblings (`zIndex: isDragging ? 100 : 1`).

**Piece 3 — the actual reorder, in `handleReorder`**:
```jsx
const handleReorder = (event) => {
  const { active, over } = event;          // active = item being dragged, over = item it was dropped onto
  if (!over || active.id === over.id) return;  // dropped outside, or dropped on itself — no-op

  const oldI = stems.findIndex(s => s.id === active.id);
  const newI = stems.findIndex(s => s.id === over.id);
  setStems(prev => arrayMove(prev, oldI, newI));  // arrayMove is a dnd-kit utility — swaps positions immutably
};
```
`arrayMove(array, from, to)` is dnd-kit's own helper — it returns a **new** array with the item moved (doesn't mutate `stems` directly, which matters because React needs a new reference to detect the state change — same rule as everywhere else in React).

**Why this specific pattern matters beyond just "reordering divs"**: once the array is reordered, `StemEditor.jsx` recomputes each stem's `startTime`/`endTime` with a `useMemo` that walks the array and sums up durations — so reordering visually *also* re-times the audio playback sequence. This is the same "derive positions from an ordered array" idea covered in the [03_advanced_components.md](machine_coding/03_advanced_components.md) pagination notes, just applied to audio timing instead of page numbers.

**One-line answer if asked in an interview**: "We use @dnd-kit — DndContext tracks the drag gesture, SortableContext + useSortable per item gives each element a drag handle and live transform, and on drop we call dnd-kit's arrayMove to immutably reorder our state array; a PointerSensor with an 8px activation distance stops normal clicks from being mistaken for drags."

---

<a name="media"></a>
## 2. Playing Video/Audio + Opening Media in a New Tab

**Where**: `components/common/EventMediaCarousel.jsx` (video), `components/StemEditor/StemTrack.jsx` (download link).

**The `<video>` element** — this is just native HTML, React barely gets involved:
```jsx
<video src={active.url} controls preload="metadata" className={mediaClassName} />
```
- `controls` — gives you the browser's built-in play/pause/volume/fullscreen bar for free. Without it, the video is there but has no way to interact with it (you'd have to build your own controls with a `ref` and `.play()`/`.pause()` — see the FFM stem-editor notes elsewhere in this KB for that harder version using Tone.js).
- `preload="metadata"` — tells the browser "don't download the whole video upfront, just enough to know its duration/dimensions." Good default for a carousel showing many videos — you don't want 10 full videos downloading just because they're in a scrollable list.

**Opening in a new tab** — this is just the DOM API `window.open`, called from a button's `onClick`:
```jsx
<button onClick={(e) => {
  e.stopPropagation();
  window.open(active.url, "_blank", "noopener,noreferrer");
}}>
  <ExternalLink size={14} />
</button>
```
Three things worth understanding here:
1. **`e.stopPropagation()`** — this button lives *inside* a clickable carousel card. Without stopping propagation, clicking the "open in new tab" button would also trigger the card's own onClick (e.g. opening a modal) — the click event "bubbles up" through the DOM by default. `stopPropagation()` says "handle it here, don't let parent elements react too."
2. **`"_blank"`** — the second argument to `window.open` is the target — same as `target="_blank"` on an `<a>` tag, means "open in a new tab/window."
3. **`"noopener,noreferrer"`** — the third argument, and the security-critical part. Without it, the newly opened page gets a `window.opener` reference back to *your* page — a malicious site could use that to redirect your original tab to a phishing page (a real attack called "tabnabbing"). `noopener` kills that reference; `noreferrer` additionally stops sending your page's URL in the `Referer` header. **Any time you open user-controlled or third-party URLs in a new tab, always include these two.**

**The equivalent plain-HTML version** (if you're not doing it from a click handler): `<a href={url} target="_blank" rel="noopener noreferrer">`. Same security rule applies — `rel="noopener noreferrer"` on the anchor tag.

---

<a name="sockets"></a>
## 3. Real-time Updates with Socket.IO

**Where**: `context/SocketContext.jsx` — powers live auction bidding and chat messages.

**The core idea**: HTTP request/response is "ask once, get one answer." Socket.IO keeps one connection open so the **server can push to you** whenever something happens (a new bid, a new chat message) — without you asking. This is the same problem WebSockets solve in general (see the WhatsApp system-design notes in `fde/00-External-Resources/`), and Socket.IO is a library that wraps raw WebSockets with easier APIs, automatic reconnection, and a fallback to HTTP long-polling if WebSockets are blocked by a network.

**Connecting**:
```jsx
const socketInstance = io(socketUrl, {
  path: socketPath,
  auth: { token: accessToken },       // sent once, at connect time — for authenticating the socket
  transports: ["polling", "websocket"], // try WebSocket, but can fall back to polling
  timeout: 10000,
  reconnectionAttempts: 5,
});
```
This runs inside a `useEffect` with `[token, shouldSkipSocket]` as dependencies — meaning the socket reconnects if the auth token changes (e.g. after login/logout), and the whole thing is skipped entirely for roles that never need it (`ADMIN`/`SUPER_ADMIN` — a real, deliberate optimization comment in this file: skip the connection to avoid needless handshakes for users who'll never use live auctions).

**Listening for events** — this is the "push" side:
```jsx
socketInstance.on("connect", () => { setConnected(true); joinAllRooms(); });
socketInstance.on(SocketEvents.CHAT_MESSAGE_RECEIVED, (msg) => {
  // update UI: show a toast, bump the unread badge, patch the cached chat list
});
socketInstance.on("disconnect", (reason) => setConnected(false));
```
Every `event.on(eventName, callback)` registers a handler for messages the *server* sends with that event name. `SocketEvents` in this file is a frozen object (`Object.freeze({...})`) listing every event name as a constant — this avoids typos like `"chatMesssage"` silently failing to match, since a typo'd constant would be a reference error, not a silent string mismatch.

**Emitting (sending) — the client-initiated side**:
```jsx
const placeBid = (auctionId, eventProductId, amount) => {
  socketRef.current.emit(SocketEvents.PLACE_BID, { auctionId, eventProductId, amount });
};
```
`.emit()` sends a message *to* the server; `.on()` receives messages *from* the server. A live auction bid flow is: you `emit("placeBid", ...)`, the server validates and broadcasts the result to everyone in that auction "room" via their own `.on("bidPlaced", ...)` handlers — including you.

**Rooms** — `joinRoom`/`leaveRoom` (`emit(SocketEvents.JOIN_ROOM, {...})`) tell the server "only send me events for auction #123," not every auction happening on the platform. This is why the chat flow calls `joinAllRooms()` right after connecting — without joining a room, the server has no reason to push that room's messages to you.

**Cleanup matters**: the `useEffect` returns `() => socketInstance.disconnect()` — critical, because without it, navigating away and back (or a token refresh triggering a re-run) would leave old socket connections open, each still listening and potentially double-firing handlers.

**Cross-updating React Query's cache from a socket event** — the interesting integration point:
```jsx
queryClient.setQueryData(CHAT_UNREAD_QUERY_KEY, (n) => (Number(n) || 0) + 1);
```
Normally React Query refetches data via HTTP. Here, a socket push directly patches the cached value in memory — no network request needed to update the "unread messages" badge. This is a common realtime + React Query combo: **server pushes an event → you manually write into the query cache → every component reading that query re-renders with the new value automatically**, because React Query cache updates trigger subscriber re-renders just like a normal state update would.

---

<a name="infinite-scroll"></a>
## 4. Infinite Scroll — React Query + IntersectionObserver

**Where**: `hooks/useCustomInfiniteQuery.js` + `hooks/useInfiniteScroll.js`.

Two separate concerns, cleanly split:

**Concern 1 — "how do I fetch page after page and know when to stop?"** → `useInfiniteQuery` (from TanStack React Query). You give it a `queryFn` that fetches one page, and a `getNextPageParam` function that looks at the last page's response and decides what the *next* page number/cursor should be — or returns `undefined` to mean "no more pages."
```js
getNextPageParam: (lastPage, allPages) => {
  const currentPage = allPages.length;
  return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
}
```
The real file in this project is defensive about this because the backend's pagination shape isn't always consistent across endpoints — it checks for `hasMore`, then a `pagination.totalPages` object, then a bare `totalPages`, then `totalCount`, then just falls back to "did this page come back full? assume there's more." That's a pragmatic real-world pattern: **normalize inconsistent API shapes in one shared hook, instead of every page re-solving the same problem.**

**Concern 2 — "how do I know when the user has scrolled near the bottom, so I can trigger the next fetch?"** → `IntersectionObserver`, a browser API that tells you when an element enters/leaves the viewport, wrapped in `useInfiniteScroll`:
```js
export default function useInfiniteScroll({ hasNextPage, isFetching, onLoadMore }) {
  const sentinelRef = useRef(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetching) onLoadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetching, onLoadMore]);
  return sentinelRef;
}
```
Usage: render an empty "sentinel" div at the end of your list, attach `sentinelRef` to it. When that invisible div scrolls into view, the observer fires and calls `onLoadMore` (which is `fetchNextPage` from the query hook). `rootMargin: "200px"` means "trigger 200px *before* it's actually visible" — so the next page loads while the user is still scrolling, not after they've already hit the bottom and are staring at nothing.

**Why IntersectionObserver instead of listening to the scroll event directly**: scroll events fire dozens of times per second and force layout recalculation if you naively check `element.getBoundingClientRect()` on every one — expensive. IntersectionObserver is handled natively by the browser off the main thread's hot path, firing only when the intersection state actually changes. This is the standard modern replacement for old-school "onScroll + check scrollTop" infinite scroll code.

**Guard conditions worth noticing**: `if (!hasNextPage) return` (don't even set up an observer if there's nothing more to load) and `!isFetching` inside the callback (don't fire a second fetch while one is already in flight — prevents duplicate page loads if the user scrolls back and forth near the trigger point).

---

<a name="webauthn"></a>
## 5. Passkeys / WebAuthn — Login Without Passwords

**Where**: `api/webauthn.services.js`, using the `@simplewebauthn/browser` library.

**What a passkey actually is, conceptually**: instead of a password (a secret you type, which can be phished or leaked in a breach), your device generates a **public/private key pair**. The private key never leaves your device (it's often hardware-backed — a secure enclave, fingerprint sensor, Windows Hello). The server only ever stores the *public* key. To prove it's you, your device signs a server-issued challenge with the private key; the server verifies the signature with the public key it has on file. Nothing secret ever crosses the network.

**Registration flow** (creating a new passkey), from the real code:
```js
export const handleRegisterPasskey = async () => {
  // 1. Ask the backend for a "challenge" — a random value the server will remember,
  //    tied to a challengeId, so it can verify the response really came from this attempt
  const response = await axiosRequest(getConfig("GET", API.GENERATE_REGISTRATION_OPTIONS));
  const { options: optionsJSON, challengeId } = response.data.data;

  // 2. Hand those options to the browser's native WebAuthn API (via the library helper).
  //    This is what triggers the OS-level "Use Face ID / fingerprint / security key" prompt.
  const attestationResponse = await startRegistration({ optionsJSON });

  // 3. Send the browser's signed response back to the server to verify and store the public key
  return await axiosRequest(getConfig("POST", API.VERIFY_REGISTRATION, { challengeId, response: attestationResponse }));
};
```
`startRegistration` is doing the heavy lifting — it calls the browser's native `navigator.credentials.create()` under the hood, which is what actually pops the OS biometric/security-key prompt. The library exists mainly to smooth over the raw WebAuthn API's verbose binary encoding (challenges and responses are ArrayBuffers that need base64url conversion) — you just pass it the server's JSON options and get back a JSON response to forward.

**Login flow** is the mirror image: `startAuthentication({ optionsJSON })` instead of `startRegistration`, which triggers the *unlock* prompt (not "create new") and returns a signed assertion proving possession of a previously-registered private key.

**`isWebAuthnSupported = () => browserSupportsWebAuthn()`** — always feature-detect before offering the passkey option; not every browser/device supports it, so this UI is typically shown conditionally alongside a fallback (password or OTP).

**Why this is worth understanding even if you never build it yourself**: it's a genuinely modern, phishing-resistant auth mechanism, and interviewers in senior frontend/full-stack rounds increasingly ask "have you worked with passkeys / WebAuthn?" — you now have a real answer: "yes, we used @simplewebauthn/browser's startRegistration/startAuthentication against a challenge-response backend flow."

---

<a name="custom-hooks"></a>
## 6. Custom Query/Mutation Hooks Wrapping React Query

**Where**: `hooks/useCustomQuery.js`, `hooks/useCustomMutation.js` — used almost everywhere instead of raw `useQuery`/`useMutation`.

**The pattern**: rather than every component calling `useQuery({...})` directly and re-implementing error toasts, loading-state conventions, and logging, this codebase wraps React Query in its own hooks once, centrally. This is the same idea as the FFM project's `useCustomQuery`/`useCustomMutation` mentioned elsewhere in this knowledge base — **wrap a third-party hook once so every call site automatically gets your app's conventions** (consistent error toasts, consistent loader integration, consistent logging) without every developer remembering to add them by hand each time.

**Why this matters architecturally**: if you ever need to change *how* errors are shown app-wide (say, switch from toast notifications to a banner), you change it in one file instead of hunting through every component that calls `useQuery`.

---

<a name="debounce"></a>
## 7. Debouncing Search Input

**Where**: `hooks/useDebounce.js`, used in search boxes across admin/vendor tables.

**The problem debounce solves**: a user typing "laptop" into a search box character by character would, without debounce, fire an API call on every keystroke — `l`, `la`, `lap`, `lapt`... six wasted requests for one search. **Debounce delays acting until the user pauses typing** for a set duration (commonly 300–500ms) — if they type another character before that timer fires, the timer resets.

Typical shape of this hook (the general pattern, whether or not it matches this exact file byte-for-byte):
```js
function useDebounce(value, delayMs = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer); // cancels the PREVIOUS timer if value changes again before it fires
  }, [value, delayMs]);
  return debounced;
}
```
Usage: `const debouncedSearch = useDebounce(searchInput, 400);` then trigger your API call (or React Query's `queryKey`) off `debouncedSearch`, not the raw `searchInput` state that updates on every keystroke. The `clearTimeout` in the cleanup function is the whole trick — every time `value` changes, React runs the cleanup for the *previous* effect first, canceling that pending timer before starting a new one, so only the final pause actually fires.

**Debounce vs throttle** (a common interview follow-up, also covered in the mega MCQ bank in `frontend-knowledge-base/nextjs/`): debounce waits for a pause in activity (search-as-you-type); throttle limits execution to at most once per interval *during continuous* activity (scroll-position tracking). Different problems, don't confuse them.

---

<a name="redux"></a>
## 8. Redux Toolkit + Persist — Auth State

**Where**: `redux/slices/` (auth slice referenced throughout — `state.auth.token`, `state.auth.user`), with `redux-persist` in `package.json`.

**Why Redux at all, when React Query already handles server data**: this is the classic split covered in the oral-interview speaking guide — React Query owns *server* state (data that lives in a database and can go stale), Redux owns *global client* state that many unrelated components need synchronously without a network round trip — auth token, current user, role/permissions. `SocketContext.jsx` reads `state.auth.token` and `state.auth.user?.roles` directly via `useSelector` — exactly the kind of cross-cutting value that's awkward to thread through props but trivial via a global store.

**What `redux-persist` adds**: plain Redux state lives only in memory — a page refresh wipes it. `redux-persist` automatically saves specified slices (typically `auth`) to `localStorage` and rehydrates them on app load, so a refreshed page doesn't immediately look logged-out while the real check happens. This is why `SocketContext.jsx` has a fallback: `token || window.localStorage.getItem("accessToken")` — belt-and-suspenders in case the Redux rehydration hasn't finished yet when the socket tries to connect.

---

<a name="modals"></a>
## 9. Modals & Drawers Pattern

**Where**: dozens of `*Modal.jsx` and `*Drawer.jsx` files (`PurchaseModal`, `AssetDetailsDrawer`, `OrderDetailsDrawer`, etc.) — the dominant UI pattern in this codebase for "show more detail / collect input without leaving the page."

**The shared shape, conceptually**: a boolean state flag in the parent (`isModalOpen`), passed down as a prop, with an `onClose` callback:
```jsx
const [isOpen, setIsOpen] = useState(false);
<PurchaseModal isOpen={isOpen} onClose={() => setIsOpen(false)} productId={selectedId} />
```
Inside the modal component, conditionally render nothing at all if `!isOpen` (or use a portal — see below) — and the modal's own internal state (form fields, loading flags) typically resets each time it *mounts*, which is why many of these modals are conditionally rendered (`{isOpen && <Modal/>}`) rather than always-mounted-but-hidden — mounting fresh means you don't have to manually reset every field when reopening for a different item.

**Modal vs Drawer**: same underlying mechanism (an overlay + a boolean open state), different visual treatment — a modal is centered and boxed, a drawer slides in from an edge (usually used for "detail panel" views like `OrderDetailsDrawer`, `AssetDetailsDrawer` where you want to see more context alongside a list, not fully obscure it).

**Why this scales as a pattern**: instead of one giant page component with dozens of `if (showX)` branches, each modal/drawer is its own file, and the parent page just tracks *which one* (if any) should be visible — usually via one `activeModal` string state rather than N separate booleans once a page has many possible modals, to guarantee only one is ever open at a time.

---

<a name="glossary"></a>
## 10. Quick Glossary (for when you're reading your own code and blank on a term)

- **Sensor** (dnd-kit) — the input method that can start a drag: pointer (mouse/touch) or keyboard.
- **Sentinel element** — an invisible marker element used purely to detect a scroll position via IntersectionObserver, not to display anything.
- **Room** (Socket.IO) — a server-side grouping so a broadcast only reaches clients who joined that specific room, not everyone connected.
- **Challenge** (WebAuthn) — a random, server-generated, one-time value the client must sign — proves the response is fresh, not a replayed old one.
- **Rehydration** (redux-persist) — restoring previously-saved Redux state from localStorage back into the live store when the app boots.
- **Query key** (React Query) — the array that uniquely identifies a cached query (e.g. `["products", page, filters]`) — changing any part of it is what triggers a refetch.
- **Query cache patching** — manually calling `queryClient.setQueryData(key, updater)` to update cached data without a network request, typically in response to a websocket push.
- **`stopPropagation`** — stops a DOM event from bubbling up to parent elements' own handlers; needed whenever a clickable element sits inside another clickable element.
- **`noopener,noreferrer`** — security flags on `window.open`/`<a target="_blank">` that prevent the new tab from getting a reference back to your page (stops "tabnabbing").
