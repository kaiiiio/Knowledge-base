# Production Roadmap

The roadmap is ordered by risk reduction, not novelty. Items labelled Roadmap are not claimed as implemented.

## Current milestone: interview-ready vertical slice

**Implemented**

- canonical signal contract and schema alignment;
- deterministic fingerprints and database-enforced signal idempotency;
- atomic OANDA trade reservation before broker submission;
- auditable OANDA fill/rejection outcomes;
- timing-safe signal webhook secret;
- Stripe raw-body signature verification;
- startup configuration validation and secret-safe errors;
- recursive structured-log redaction;
- adapter boundaries for signal persistence, recipient lookup, Telegram delivery, and OANDA execution;
- 43 isolated automated tests; and
- architecture, runbook, testing, decisions, and interview documentation.

## Phase 1: P0 correctness and security

Target: safe sandbox operation with explicit external-side-effect guarantees.

| Work item | Backend concept | Definition of done |
|---|---|---|
| Protect/remove `/grant_sub` | Authorization and audit | Only allow-listed admins can invoke it; every change records actor, target, reason, and timestamp. |
| Stripe event store | Idempotent consumer | Unique event ID, processing status, result, and safe retry behavior tested under duplicates. |
| Novus reservation | Idempotent external command | Stable key reserved before market order; duplicate callback never calls Novus twice. |
| Ambiguous outcome state | Distributed-systems uncertainty | Timeout/partial protection becomes `NEEDS_ATTENTION`, never a blind automatic retry. |
| Order reconciliation | Source-of-truth repair | Worker compares local and broker state and records/alerts mismatches. |
| Authenticated encryption | Confidentiality and integrity | AES-GCM or KMS envelope encryption with key version and rotation path. |
| Request limits and rate policy | Abuse resistance | Body-size limits, per-route rate limits, and provider allow-list/signature policy tested. |
| Database migration | Schema evolution | Old flat signals are backed up, transformed, fingerprinted, validated, and rollback-ready. |

## Phase 2: P1 reliable asynchronous processing

Target: webhook latency is independent of Telegram and broker latency.

1. Add Redis/BullMQ or a managed queue.
2. Store signal plus outbox record atomically.
3. Relay outbox messages to queues.
4. Return `202 Accepted` after durable acceptance.
5. Deliver Telegram notifications in bounded batches.
6. Retry only classified transient errors with exponential backoff and jitter.
7. Move exhausted jobs to a dead-letter queue with replay tooling.
8. Use unique job IDs to make queue redelivery safe.
9. Move subscription expiry from in-process cron to a uniquely scheduled job.

Suggested retry policy:

| Failure | Retry? | Reason |
|---|---|---|
| Telegram 429 | Yes, using server retry delay | Explicit throttling response |
| Telegram 400 invalid chat | No | Permanent recipient problem |
| Broker network timeout after submission | No blind retry | Outcome may be ambiguous; reconcile first |
| Mongo transient primary change | Yes, bounded | Normally transient infrastructure event |
| Validation error | No | Same input will fail again |

## Phase 3: P1 observability and operations

Target: an operator can answer what failed, where, and for whom without reading raw server files.

- Correlation ID from webhook through signal, notification, trade, and order.
- OpenTelemetry HTTP, MongoDB, Telegram, Stripe, and broker spans.
- Central JSON log collection.
- Metrics:
  - `signals_received_total`
  - `signals_duplicate_total`
  - `signal_notifications_total{outcome}`
  - `trade_reservations_total{broker,outcome}`
  - `broker_requests_total{broker,outcome}`
  - `broker_request_duration_seconds`
  - `reconciliation_mismatches_total`
  - queue depth, age, retries, and DLQ size
- Alerts on sustained errors, oldest job age, reconciliation mismatch, and zero signal intake when traffic is expected.
- Operator view for order timeline and manual reconciliation.

Initial SLO examples, to validate with real traffic:

- 99.9% of authenticated signal webhooks durably accepted within 500 ms.
- 99% of eligible Telegram notifications attempted within 10 seconds.
- 100% of accepted trade requests have a terminal or `NEEDS_ATTENTION` audit record.
- Zero duplicate broker submissions for the same idempotency key.

## Phase 4: P2 delivery and scale

Target: repeatable deployments and independent process scaling.

- Container image with non-root runtime and health checks.
- API, bot, worker, and scheduler process commands.
- CI gates: unit tests, integration tests, lint, formatting, dependency review, image scan.
- Staging with Telegram test bot, Stripe test mode, Mongo test database, and OANDA practice account.
- Rolling deployment with graceful drain and rollback.
- Managed secrets and separate identities per environment.
- Database backups plus tested restore procedure.
- Load tests for burst webhooks and large recipient counts.

## Phase 5: P3 advanced engineering

Only after measurements justify it:

- cache stable instrument metadata and account summaries with explicit TTLs;
- partition very large notification jobs;
- event archive for analytics;
- broker-specific circuit breakers;
- multi-region read/acceptance design;
- dedicated services where team ownership or scaling genuinely requires a network boundary.

## Dependency modernization

The locked dependency installation reports 100 audit findings. Do not run an unreviewed `npm audit fix --force` immediately before an interview or deployment. Use this sequence:

1. identify direct versus transitive findings;
2. remove unused template dependencies;
3. replace deprecated/unmaintained packages such as `xss-clean`;
4. upgrade one integration group at a time;
5. run tests and sandbox contract checks after every batch;
6. document accepted temporary risk with owner and expiry date; and
7. enable automated dependency update pull requests after the baseline is controlled.

## Why microservices are not the next phase

Queues, idempotency, observability, and process isolation solve the immediate risks. Microservices would add network failure, distributed tracing, versioned contracts, deployment coordination, and cross-service data consistency before the project has evidence those costs are needed. The modular boundaries preserve a future extraction path without paying that cost today.
