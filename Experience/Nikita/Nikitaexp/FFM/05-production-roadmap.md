# Production Roadmap — FFM

Priority-ordered; each item names the failure it prevents.

## P0 — Money & correctness

1. **Credit reconciliation job** — finds credit reservations with no job outcome; releases + alerts. Prevents: silent credit loss, the support ticket that erodes trust fastest.
2. **Webhook event ledger** — append every Stripe event before processing; processing is idempotent by event ID. Prevents: double-crediting on replay, unrecoverable state after a handler bug.
3. **stem_config validation at save** — reject configs referencing missing/regenerated stems with an actionable error. Prevents: merge-service crashes on stale references.

## P1 — User-visible reliability

4. **Push status (SSE/WebSocket) + fallback poll** — kills the 20s lag on generation status.
5. **Merge queue metrics + autoscaling** — queue depth and oldest-job age exposed; workers scale on depth. Prevents: save-time blowups during traffic spikes.
6. **Graceful degradation when Suno degrades** — circuit breaker + queued-not-failed UX ("high demand, your job is queued") instead of raw errors.

## P2 — Performance & cost

7. **Decoded-buffer LRU cap** in the client — bounds editor RAM on long sessions.
8. **Content-addressed merge cache** — identical remixes never render twice.
9. **CDN + ranged fetch for stems** — faster editor open, lower egress.

## P3 — Operations

10. **Pipeline tracing** — one trace ID from generation request through Redpanda to worker to status; per-stage timings dashboarded.
11. **Load test the two hot paths** — concurrent editor saves (merge service) and webhook bursts (billing) — before a launch spike finds the limits for you.
12. **Runbooks** — stuck-job triage, credit-dispute lookup (batch ledger makes this fast), provider-outage comms.

## Definition of production-ready

- No single user action can double-charge credits or double-render a merge.
- A dead worker never strands a reservation for more than the reconciler interval.
- "Where is my song?" is answerable from a dashboard in under a minute.
