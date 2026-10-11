# Current System — FFM (AI Audio Publishing & Billing)

## Purpose

FFM is a DAW-like web platform where creators generate AI music (Suno-based), review versions, remix stem-level arrangements in the browser, and publish — with a credit-based billing system on Stripe. Users buy credits, spend them on AI generation jobs, edit the results in a multi-track editor, and save consolidated versions.

## Runtime components

| Component | Responsibility | Status |
|---|---|---|
| React (Vite) frontend | Song review, stem editor, waveform player, publishing flows | **Implemented** |
| Playback engine (Tone.js) | Sample-accurate multi-stem scheduling, remix mode, seek/offset math | **Implemented** |
| API backend | Projects, versions, stems, credits, auth | **Implemented** |
| AI inference pipeline | Suno generation, vocal separation, audio extension via **Redpanda** (Kafka-compatible) streams | **Implemented** |
| Python merge service | Non-destructive stem consolidation → final .mp3; AOP-style audit logging via interceptors | **Implemented** |
| Stripe billing | Checkout + Link one-tap, idempotent webhooks, dynamic price generation | **Implemented** |
| Credit engine | Batch-based **FIFO credit ledger** (buy batches, consume oldest-first) | **Implemented** |
| Polling layer | React Query polling: ~20s for version generation, ~5s for stems | **Implemented** |

## The core loop

```text
User buys credits (Stripe Checkout / Link)
   → webhook (signature-verified, idempotent) credits a batch
User requests generation
   → credits reserved → job published to Redpanda topic
   → AI worker consumes → generates version/stems → status updated
Frontend polls → version appears → user opens Stem Editor
   → reorders/edits stems locally (Tone.js timeline, dnd-kit)
   → "Save as New Version" → stem_config sent → Python service merges → final .mp3
```

## Frontend state model (three tiers)

| Tier | Tool | Holds |
|---|---|---|
| Server state | React Query (custom `useCustomQuery`/`useCustomMutation` wrappers) | Projects, credits, waveforms, polling |
| Global UI state | Redux Toolkit (`authSlice`, `subscriptionSlice`, `notificationSlice`) | Auth, plan, notifications |
| Domain state | Context (`PlaybackContext`) | isPlaying, position, currentSong — the player "brain" shared by Header/Explore/Project views |

## Data model (billing side, the interesting part)

- **Credit batches**: each purchase creates a batch row (amount, remaining, purchase price, expiry). Consumption walks batches FIFO — oldest first — so refunds/expiry are per-batch, auditable, and price-of-consumed-credit is always known.
- **Stem config**: a saved remix is not a new audio file client-side; it is an ordered list of stem IDs + timing. The server owns final rendering.
- **Idempotency**: Stripe webhook events are recorded by event ID; replays are no-ops. Generation requests carry a client key so double-clicks don't double-charge credits.
