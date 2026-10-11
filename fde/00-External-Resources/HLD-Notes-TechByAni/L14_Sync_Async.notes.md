# Synchronous and Asynchronous Communication — Notes (from L14_Sync_Async.pdf)

Source: TechByAni HLD-Notes.

In modern architectures, services are constantly talking to each other — Payment Service, Order Service, Notification Service, Inventory Service... **The way they talk defines your system's speed, reliability, and scalability.**

There are two ways services can communicate: **Synchronous** (wait for response) and **Asynchronous** (fire and forget).

## Synchronous Communication

```
Client —request——→ Server
Client ←—response—— Server
```

Client sends a request → waits until the server finishes and sends back a response → only then can the client move forward.

**Real-life example**: you call a restaurant and wait on the phone until they confirm your order.

**Advantages**: simple and predictable, real-time feedback (user gets a result immediately), easier to debug and trace.

**Disadvantages**: slow if the server takes time, if one service fails → the whole chain breaks, poor scalability for large systems.

## Asynchronous Communication

```
Client —1. request——→ Server
Client                  ↓ 2. does some other task (doesn't block waiting)
Client ←—3. Response/Callback (later)—— Server
```

Client sends a request but doesn't wait. Server processes it later. The response (if any) comes later through: a **callback/webhook**, **polling**, or a **message queue**.

**Real-life example**: you order food on Zomato — you get "Order Confirmed" instantly, and the food arrives later.

**Advantages**: fast response for the user (non-blocking), can handle high load easily, more resilient — if one part is slow, others keep working.

**Disadvantages**: harder to debug, responses may come late, data may be **eventually consistent**, not immediate.

## When to use which

**Use Synchronous when**: you need an immediate response, the action must happen in sequence, it's a small/low-latency operation.

**Synchronous examples**: REST API → client waits for a JSON response; gRPC call → immediate result.

**Use Asynchronous when**: you have background or delayed tasks, you want to handle large traffic bursts, you need to decouple services.

**Asynchronous examples**: message queue (RabbitMQ, Kafka, SQS), webhook callbacks, background jobs/worker threads, push notifications.

## Cross-reference

See [../../05-Distributed-Systems/05_messaging_kafka_rabbitmq_sqs.md](../../05-Distributed-Systems/05_messaging_kafka_rabbitmq_sqs.md) for the deep dive on message-queue-based async communication, and the Express KB's [08_background_jobs_and_task_queues/](../../../express-backend-knowledge-base/08_background_jobs_and_task_queues/) for implementation patterns.
