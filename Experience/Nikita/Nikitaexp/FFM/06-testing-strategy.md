# Testing Strategy — FFM

What to test, in value order — the answer to "how would you test this?"

## 1. The credit engine (highest value per test)

Pure ledger logic → unit-test without any infra:
- FIFO consumption across batches (partial drains, exact boundaries)
- Expiry: expired batches skipped; refund returns to the *correct* batch
- Reservation → release on failure; double-release is a no-op (idempotent)
- Property-style check: sum(batch.remaining) + consumed == purchased, always

## 2. Webhook idempotency (integration)

- Same Stripe event delivered twice → exactly one batch credited
- Tampered signature (raw-body mutation) → rejected
- Out-of-order events (refund before charge lands) → handled or parked, never crash
- Fixtures from Stripe CLI recordings, not hand-written JSON

## 3. Timeline math (frontend unit)

The `useMemo` that recomputes stem start/end after reorder is pure math — test it directly:
- Reorder swaps → prefix sums correct for every stem
- Seek-offset function: global position → (active stem, offsetInStem) at boundaries (exactly at a stem edge, at 0, at total duration)
- These are the bugs users *hear* — a 100ms error is audible; tests are cheaper than ears.

## 4. Merge service (contract + golden files)

- Given a stem_config, output duration == sum of stem durations (± encoder frame tolerance)
- Golden-file test: known stems + known config → checksum-stable output (or perceptual-hash compare if encoding is non-deterministic)
- Stale stem ID in config → clean 4xx, not a crash

## 5. Pipeline behavior (worker integration)

- Job published → consumed → status transitions `reserved → processing → done` exactly once per job key
- Worker killed mid-job → job re-consumed (at-least-once) → status still ends in exactly one terminal state; credits released once on terminal failure
- Uses a real Redpanda/Kafka container (Testcontainers) — mocking the broker hides the exact failure modes you care about

## 6. E2E (thin, two flows only)

- Buy credits → generate → poll → version appears (Stripe test mode + stubbed AI worker)
- Open editor → reorder → save → new version playable
- Everything else is covered cheaper at lower layers.

## What NOT to test

- Tone.js internals, Stripe's own behavior, Suno output quality — test *your* contracts with them, not their implementations.

## The interview line

> "The test money went where the risk is: the credit ledger and webhook idempotency are exhaustively unit/integration tested because they touch money; timeline math is unit-tested because errors there are audible; and E2E is just two golden paths because everything else is covered cheaper below."
