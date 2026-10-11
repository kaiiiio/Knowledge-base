# Interview Story — FFM

Do not memorize word for word. Keep the structure, speak naturally, and be ready to open the code behind each claim.

## 30-second project introduction

> FFM is an AI music publishing platform — think a browser DAW on top of an AI pipeline. Users buy credits through Stripe, generate songs and stems through a Suno-based pipeline running over Redpanda streams, then remix stem arrangements in a multi-track editor I built with Tone.js, and save server-rendered versions. The two hard problems were keeping audio, waveform, and lyrics sample-accurately in sync in the browser, and making the credit/billing path idempotent so retries and double-clicks can never double-charge.

## "What is your best work so far?"

> Two candidates, one frontend and one backend — I pick based on the interviewer.
>
> **Frontend**: the sync engine. One `currentTime` from the native audio clock drives the waveform playhead, timestamped lyric highlighting, and section markers. For remix mode, separate stem files play gaplessly because Tone.js schedules them on the Web Audio clock with look-ahead — and on seek I compute which stem is active and its internal offset. React never fights the audio: refs hold the high-frequency objects, memos hold the timeline math, and re-renders happen only for what the user watches.
>
> **Backend**: the credit engine. Credits are a FIFO ledger of purchase batches, not a counter — so expiry, refunds, and cost-attribution are per-batch and auditable. Debits are reservations tied to generation jobs; failures release them, and webhooks are idempotent by Stripe event ID. It taught me that billing correctness is architecture, not `if` statements.

## The approach I followed

1. **Found the single source of truth per domain** — audio clock for playback, webhook events for money, stem_config for remixes.
2. **Made every retryable path idempotent** — event IDs, request keys, no-op double-releases.
3. **Kept long work off HTTP** — publish to Redpanda, poll/push status.
4. **Kept editing local-first** — instant UX, one authoritative server renderer.
5. **Named the gaps honestly** — polling latency and reservation reconciliation are the known next steps.

## A small decision with outsized value: buffer caching

> Decoded audio buffers live in a ref-based cache, so reordering stems never re-downloads or re-decodes multi-megabyte files — reorder feels instant. The trade-off is RAM (decoded PCM is much bigger than the compressed file), so the follow-up is an LRU cap. Small decision, but it's the difference between an editor that feels native and one that stutters.

## A failure I found and how I handled it

> The payment success redirect could land before the webhook credited the batch — users saw "0 credits" right after paying. Classic webhook-vs-redirect race. I stopped treating the redirect as truth: the UI shows a processing state and reconciles from the webhook-driven data. It reframed how I build anything with an async money event — design the UI for the gap.

## "Why polling and not WebSockets?"

> Honest answer: polling shipped faster and React Query made it nearly free to implement, with staleness bounded at 20 seconds — acceptable for a generation that takes minutes. Push is the planned upgrade, but I'd keep a slow fallback poll anyway, because push systems fail silently and the poll is the heartbeat that catches missed events.

## "What would you do differently?"

> Build the reconciler on day one. Every system with reserve-then-outcome semantics eventually strands a reservation — a worker dies, a network blips. The cron that sweeps orphans is 50 lines and turns a support-ticket generator into a non-event.
