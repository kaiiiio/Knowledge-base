# RabbitMQ — Deep Dive

## What RabbitMQ Is

RabbitMQ is a **message broker implementing AMQP** (Advanced Message Queuing Protocol).

It supports:

* Routing
* Acknowledgements
* Retries
* Dead-letter queues
* Multiple protocols (AMQP, MQTT, STOMP)

---

## RabbitMQ Architecture

```
Producer → Exchange → Queue → Consumer
```

### Key Components

1. **Producer**: Sends messages
2. **Exchange**: Routes messages to queues
3. **Queue**: Stores messages
4. **Consumer**: Receives messages
5. **Binding**: Links exchange to queue

---

## Exchange Types

### 1. Direct Exchange
Routes to queue with exact routing key match

```
Producer --[routing_key: "error"]--> Exchange --> Queue (binding: "error")
```

**Use Case**: Log levels (info, warning, error)

### 2. Fanout Exchange
Broadcasts to ALL bound queues (ignores routing key)

```
Producer --> Exchange --> Queue 1
                      --> Queue 2
                      --> Queue 3
```

**Use Case**: Notifications to multiple services

### 3. Topic Exchange
Routes based on pattern matching

```
Producer --[routing_key: "user.created"]--> Exchange --> Queue (pattern: "user.*")
```

**Use Case**: Event-driven architecture

### 4. Headers Exchange
Routes based on message headers (rarely used)

---

## RabbitMQ vs BullMQ

| Feature          | BullMQ      | RabbitMQ     |
| ---------------- | ----------- | ------------ |
| Complexity       | Low         | Medium       |
| Redis dependency | Yes         | No           |
| Ordering         | Good        | Good         |
| Scale            | Medium      | High         |
| Routing          | Simple      | Advanced     |
| Multi-language   | Node.js     | Any          |
| Message patterns | Work queue  | Pub/Sub, RPC |

---

## When to Use RabbitMQ

✅ Microservices communication
✅ Multi-language systems
✅ Complex routing requirements
✅ Need for message acknowledgments
✅ High reliability requirements
✅ Event-driven architecture

❌ Simple background jobs (use BullMQ)
❌ Event streaming/replay (use Kafka)
❌ Only Node.js (BullMQ is simpler)

---

## Code Examples

### Producer (Node.js)

```ts
import amqp from 'amqplib';

const connection = await amqp.connect('amqp://localhost');
const channel = await connection.createChannel();

const exchange = 'logs';
await channel.assertExchange(exchange, 'fanout', { durable: false });

const message = 'Hello World';
channel.publish(exchange, '', Buffer.from(message));

console.log('Sent:', message);
```

### Consumer (Node.js)

```ts
import amqp from 'amqplib';

const connection = await amqp.connect('amqp://localhost');
const channel = await connection.createChannel();

const exchange = 'logs';
await channel.assertExchange(exchange, 'fanout', { durable: false });

const q = await channel.assertQueue('', { exclusive: true });
await channel.bindQueue(q.queue, exchange, '');

console.log('Waiting for messages...');

channel.consume(q.queue, (msg) => {
  if (msg) {
    console.log('Received:', msg.content.toString());
    channel.ack(msg); // Acknowledge message
  }
}, { noAck: false });
```

---

## Message Acknowledgments

### Manual Ack (Recommended for Production)

```ts
channel.consume(queue, (msg) => {
  try {
    processMessage(msg);
    channel.ack(msg); // Success
  } catch (error) {
    channel.nack(msg, false, true); // Requeue on failure
  }
}, { noAck: false });
```

### Auto Ack (Risky)

```ts
channel.consume(queue, (msg) => {
  processMessage(msg);
}, { noAck: true }); // Message lost if processing fails
```

---

## Dead Letter Exchanges (DLX)

Handle failed messages:

```ts
await channel.assertQueue('main-queue', {
  deadLetterExchange: 'dlx-exchange',
  messageTtl: 60000 // 60 seconds
});

await channel.assertQueue('dead-letter-queue');
await channel.bindQueue('dead-letter-queue', 'dlx-exchange', '');
```

---

## Interview Questions

**Q: What is the difference between RabbitMQ and Kafka?**
A: RabbitMQ is a message broker (queue-based, message deleted after consumption). Kafka is an event log (stream-based, messages retained for replay).

**Q: How does RabbitMQ ensure message delivery?**
A: Through acknowledgments, persistence, and publisher confirms. Messages are only removed after consumer acknowledges.

**Q: When would you choose RabbitMQ over BullMQ?**
A: When you need complex routing, multi-language support, or don't want Redis dependency.

---

## Production Best Practices

✅ Enable message persistence
✅ Use manual acknowledgments
✅ Implement dead letter queues
✅ Set up clustering for HA
✅ Monitor queue length
✅ Use prefetch count to control load

```ts
// Prefetch: only get 1 message at a time
channel.prefetch(1);
```

✅ Implement retry with exponential backoff
✅ Use durable queues and exchanges

```ts
await channel.assertQueue('tasks', { durable: true });
await channel.assertExchange('events', 'topic', { durable: true });
```

---

## Common Patterns

### 1. Work Queue (Task Distribution)
```
Producer → Queue → Worker 1
                 → Worker 2
```

### 2. Pub/Sub (Fanout)
```
Publisher → Exchange → Subscriber 1
                    → Subscriber 2
```

### 3. RPC (Request/Reply)
```
Client → Request Queue → Server
      ← Reply Queue   ←
```

### 4. Event Bus (Topic Exchange)
```
Service A → Exchange → Service B (user.*)
                    → Service C (order.*)
```
