# Event-Driven Architecture (EDA) — Notes (from L17_EDA.pdf)

Source: TechByAni HLD-Notes.

> **Legibility note**: this PDF renders very small/dense — most detail wasn't reliably OCR-able. What follows is a standard-knowledge summary of Event-Driven Architecture matching the topic; open the PDF directly for the deck's exact wording, tables, and diagrams.

## What is Event-Driven Architecture?

An architectural style where services communicate by **producing and consuming events** — a fact that something happened (`order.created`, `payment.succeeded`, `user.signed_up`) — rather than by calling each other directly. Producers publish events without knowing who (if anyone) is listening; consumers subscribe to the event types they care about.

## Core components

- **Event** — an immutable record that something happened, usually with a payload (`{type, timestamp, data}`).
- **Event Producer** — the service that detects/causes the event and publishes it.
- **Event Broker / Bus** — the middleware that routes events from producers to consumers (Kafka, RabbitMQ, SNS/SQS, Redpanda).
- **Event Consumer** — a service that subscribes to and reacts to events.

## Choreography vs Orchestration (the classic EDA design choice)

- **Choreography** — each service reacts to events and publishes its own next event; no central coordinator. Decoupled, but the overall flow isn't visible anywhere in code — you have to trace events across services to understand the full picture.
- **Orchestration** — a central orchestrator service explicitly calls/sequences each step. Easier to reason about and debug, but reintroduces a coordination point.

## Why EDA over direct request-response

- **Loose coupling** — producers don't need to know which/how many consumers exist; new consumers can be added without changing the producer.
- **Scalability** — consumers scale independently, and can process events at their own pace.
- **Resilience** — a slow/down consumer doesn't block the producer (unlike synchronous calls).
- **Auditability/Replay** — with a log-based broker (Kafka), the event history itself becomes a source of truth that can be replayed.

## Trade-offs to name in an interview

- **Eventual consistency** — consumers process asynchronously, so there's a window where different parts of the system have seen different events.
- **Harder debugging/tracing** — a single user action can fan out into many events across many services; needs distributed tracing (a shared trace/correlation ID) to follow.
- **Ordering guarantees** — not automatic; only guaranteed where the broker provides it (e.g. Kafka's per-partition ordering) — see cross-reference below.
- **Duplicate/out-of-order events** — consumers must be idempotent, since most brokers offer at-least-once delivery, not exactly-once.

## Cross-reference

See [../../05-Distributed-Systems/05_messaging_kafka_rabbitmq_sqs.md](../../05-Distributed-Systems/05_messaging_kafka_rabbitmq_sqs.md) for delivery/ordering semantics per broker, [../../05-Distributed-Systems/04_distributed_transactions_and_sagas.md](../../05-Distributed-Systems/04_distributed_transactions_and_sagas.md) for sagas (choreography vs orchestration with a full worked example) and the outbox pattern (how to publish an event atomically with a DB write).
