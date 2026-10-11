# Backend Concepts Learned Through This Project

This is a learning map: each concept is connected to a real decision in the repository and a next exercise.

## 1. Domain modeling

**Problem:** Provider payloads used `entry.price` and `stop_loss.sl`, while persistence and trade code used several different flat names.

**Applied:** One canonical signal vocabulary now crosses validation, persistence, notification, and trade execution.

**Lesson:** A model is not just a database schema. It is the shared language and invariants used by every workflow.

**Next exercise:** Model explicit signal lifecycle transitions and reject impossible transitions.

## 2. Dependency inversion and ports/adapters

**Problem:** Business logic imported Mongoose, user services, Telegram, and broker clients directly, which made tests require infrastructure.

**Applied:** Signal ingestion accepts repository and notification ports; OANDA execution accepts account and order ports.

**Lesson:** Dependency injection is useful when it reverses control at a volatile boundary. It is not valuable merely because a container library is fashionable.

**Next exercise:** Define a common broker contract and implement OANDA/Novus adapters behind it.

## 3. Idempotency

**Problem:** Webhook senders retry, users double-click, and networks time out. “Exactly once” delivery is not a realistic assumption.

**Applied:** Signal fingerprints prevent duplicate alerts. Trade idempotency keys reserve the command before OANDA submission.

**Lesson:** Idempotency must cover the real side effect. Deduplicating database rows after two broker calls is not sufficient.

**Next exercise:** Add an idempotent Stripe event consumer and a safe request-replay test.

## 4. Race conditions and atomicity

**Problem:** `findOne` followed by `create` allows two concurrent requests to observe absence.

**Applied:** Unique indexes and atomic upsert/duplicate-key handling make MongoDB the concurrency authority.

**Lesson:** Correctness must survive multiple processes, not only JavaScript’s single event loop.

**Next exercise:** Run concurrent integration tests against a real test MongoDB.

## 5. At-least-once delivery

**Problem:** A provider may retry because the response was lost even when the first request completed.

**Applied:** Duplicate signal delivery returns a successful duplicate response instead of erroring or repeating notifications.

**Lesson:** Consumer idempotency converts at-least-once delivery into exactly-once *effect* for a defined key.

**Next exercise:** Introduce queue redelivery and prove the worker remains safe after a crash.

## 6. External-side-effect uncertainty

**Problem:** If a broker call times out, the order may have failed, succeeded, or be pending.

**Applied:** OANDA outcomes are persisted, and the roadmap avoids blind retries for ambiguous submissions.

**Lesson:** Timeout is not the same as rejection. Systems that interact with payments or trading need reconciliation, not optimistic retry everywhere.

**Next exercise:** Add `NEEDS_ATTENTION` plus broker-order lookup/reconciliation.

## 7. State machines

**Problem:** Free-form statuses allow impossible transitions and hide partial failures.

**Applied:** Signals and orders have explicit status enums; the target design adds an uncertainty state.

**Lesson:** State diagrams expose missing transitions, retry rules, and operator actions better than scattered conditionals.

**Next exercise:** Centralize allowed order transitions and test every edge.

## 8. Webhook authentication

**Problem:** A public route that accepts a valid-looking payload is not proof of sender identity.

**Applied:** Signal requests compare a shared secret using `timingSafeEqual`. Stripe uses its signed raw-body verification.

**Lesson:** HMAC/signature verification must operate on the original bytes. Parsing and re-serializing can change the message.

**Next exercise:** Add timestamp/replay windows to signal webhook HMAC authentication.

## 9. Encryption versus authenticated encryption

**Problem:** Broker credentials are sensitive at rest.

**Applied:** Existing AES-CBC encryption avoids plain-text password storage.

**Lesson:** Confidentiality alone is incomplete. AES-CBC does not provide tamper detection; keys also need versioning, access control, and rotation.

**Next exercise:** Implement AES-GCM envelope encryption with a managed KMS key and migration version.

## 10. Queues, retries, and dead-letter handling

**Problem:** Synchronous Telegram fan-out makes webhook latency depend on every recipient.

**Current:** In-process `Promise.allSettled` isolates individual send failures.

**Target:** Durable queue, bounded concurrency, classified retries, exponential backoff with jitter, and a DLQ.

**Lesson:** A queue is not automatically reliability. The consumer must be idempotent and operators must be able to inspect/replay failures.

## 11. Transactional outbox

**Problem:** Saving a signal and publishing a queue message are two writes. Either can succeed alone.

**Target:** Store the signal and outbox event together, then publish asynchronously.

**Lesson:** The outbox pattern trades immediate publication for recoverable consistency without a distributed transaction.

## 12. Observability

**Problem:** “An error occurred” does not reveal which signal, user, broker, or attempt failed.

**Applied:** Structured logs and redaction exist; stable signal/order identities are persisted.

**Target:** Correlation IDs, metrics, traces, dashboards, and alerts.

**Lesson:** Logs explain individual events, metrics show patterns, and traces show cross-boundary latency. None replaces the others.

## 13. SLOs and backpressure

**Problem:** “Fast” and “reliable” are not measurable requirements, and Telegram/broker rate limits are finite.

**Target:** Define acceptance and delivery latency SLOs, monitor queue age, and cap concurrency.

**Lesson:** Backpressure protects dependencies and lets the system degrade predictably under bursts.

## 14. Caching

**Potential use:** Instrument metadata or rate-limited account summaries with explicit TTLs.

**Not appropriate:** Signal deduplication or trade reservation cannot rely only on cache because eviction/restart would re-enable duplicate side effects.

**Lesson:** Cache performance data; persist correctness data.

## 15. Schema migration

**Problem:** Code changed from flat signal fields to a nested canonical schema while old documents may remain.

**Lesson:** Deploying model code is not a data migration. Safe evolution needs backups, reversible transforms, collision checks, observability, and compatibility windows.

## 16. Modular monolith versus microservices

**Decision:** Keep one deployable codebase with explicit module boundaries.

**Lesson:** A good boundary is valuable before it becomes a network boundary. Microservices solve organizational and independent-scaling problems but create distributed-systems costs.

## Suggested learning order after the interview

1. Complete MongoDB concurrency integration tests.
2. Add order state transitions and reconciliation.
3. Add a queue and outbox for signal delivery.
4. Add OpenTelemetry and business metrics.
5. Move runtime roles into separate processes/containers.
6. Migrate credential encryption and rotation.
7. Only then evaluate whether a module deserves service extraction.
