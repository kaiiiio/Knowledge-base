# What Is Done Well — FFM

The parts worth bragging about in an interview, with the *why it matters* attached.

## 1. The Sync Engine (audio ↔ UI ↔ lyrics)

One `currentTime` source of truth (native audio clock) drives three consumers:
- **Waveform playhead** — `left: (currentTime/duration)*100%`
- **Lyrics highlighting** — filtered from a timestamped `alignedWords` array
- **Section markers** — Intro/Verse/Chorus rendered at percentage offsets

Why it's good: the native audio clock can never drift from the sound, so all three UIs stay in sync even under rapid seeking. This is the "synchronizing disparate data streams" story — the strongest senior-frontend signal in the project.

## 2. Custom waveform instead of Wavesurfer.js

100–200 divs whose color flips played/unplayed by simple index math; click-to-seek converts click-X → percentage → `audio.currentTime`. Why it's good: no heavy library on the hot path, render cost is trivial, and behavior is fully controllable (custom playhead handle, section overlays).

## 3. Sample-accurate remix playback (Tone.js)

- Stems scheduled on the **Web Audio API clock** (look-ahead scheduling), not `setInterval` — gapless transitions between separate files.
- **Offset math on seek**: click at 65s when the active stem starts at 60s → start that stem's player with an internal buffer offset of 5s.
- **Buffer caching in `useRef`** — decoded audio survives reorders; no re-downloading multi-MB stems.

## 4. Local-first editing, server-side rendering

Reorders are instant (dnd-kit `arrayMove` + a `useMemo` that recomputes every stem's start/end by prefix-summing durations). The server is only involved at "Save as New Version," receiving a `stem_config` — then the Python service renders the consolidated .mp3. Why it's good: zero-latency editing UX, one authoritative renderer, no giant uploads.

## 5. FIFO credit engine on batches

Credits are not one integer on the user. Each purchase = a batch; consumption drains oldest-first. Why it's good: per-batch expiry and refunds, exact cost attribution of consumed credits, and a clean audit trail — the difference between "a counter" and "a ledger."

## 6. Idempotent money paths

Signature-verified Stripe webhooks recorded by event ID; generation debits guarded by client keys. Retries and double-clicks cannot double-charge. Dynamic price generation removes the manual Stripe-catalog bottleneck when plans change.

## 7. Resilient AI pipeline shape

Generation flows through **Redpanda** topics — the web tier only publishes; workers consume, retry, and update status. Long AI jobs never hold an HTTP request open; the frontend polls React Query (20s versions / 5s stems) for seamless progress.

## 8. Performance discipline in the player

`useRef` for high-frequency objects (audio instances, intervals), `useMemo` for heavy timeline math, re-renders only for what the user visually tracks (timer text, playhead transform). The editor stays at 60fps during playback.
