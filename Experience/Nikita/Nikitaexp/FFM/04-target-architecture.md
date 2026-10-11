# Target Architecture — FFM

Where the system should go next, and why each move is justified by a current pain.

## 1. Push job status (replace polling)

```text
AI worker → status event → Redpanda topic → notifier service → WebSocket/SSE → browser
                                        └→ status row in DB (source of truth for reconnects)
```

- Frontend subscribes per-project; React Query cache is updated by pushed events (`queryClient.setQueryData`) instead of interval refetches.
- Keep one slow poll (60s) as a fallback heartbeat — push systems fail silently; the poll catches missed events.

## 2. Credit engine as a transactional saga

```text
requestGeneration:
  tx: [reserve batch credits (FIFO) + create job row (status=reserved)]
  publish job → worker
worker outcome:
  success → tx: [job=done]
  failure → tx: [job=failed + release reservation back to batch]
reconciler (cron): finds reservations older than T without outcome → release + alert
```

The reconciler is the piece that turns "usually correct" into "correct even when a worker dies mid-job."

## 3. Merge service scaling

- Put consolidation jobs on their own queue with visible depth; scale Python workers horizontally (CPU-bound → workers ≈ cores per pod).
- Content-address outputs: hash(stem_config) → if an identical remix was already rendered, serve the cached .mp3 instead of re-rendering.

## 4. Stem storage & delivery

- Stems on object storage behind a CDN; browser fetches ranged requests for waveform preview before full decode.
- Decoded-buffer cache in the client gets an LRU cap (e.g., current project ± last N stems) to bound memory.

## 5. Billing hardening

- Webhook consumer fully event-sourced: every Stripe event appended to an events table before processing — replayable, auditable, and safe to reprocess after a bug fix.
- Dynamic price generation kept, but with a nightly diff-check against Stripe's catalog to catch drift.

## 6. Deployment shape

- Web/API tier stateless behind LB; workers (AI consumers, merge service, reconciler) deployed separately and scaled by queue depth, not CPU.
- Redpanda as the durable spine: web publishes, workers consume with consumer groups; replay = reset offsets for a re-run after a defect.

## Sequencing rule

Each step must be shippable alone: (1) reconciler, (2) push status, (3) merge-queue metrics + scaling, (4) client cache cap, (5) event-sourced billing. Reliability first, latency second, cost third.
