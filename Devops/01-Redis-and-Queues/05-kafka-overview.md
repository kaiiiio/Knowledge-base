# Kafka — Overview (For Context)

## Kafka ≠ Queue

**Kafka = Event Log / Stream**

Key difference:
* **Queue**: Message consumed once, then deleted
* **Kafka**: Events stored, can be replayed by multiple consumers

---

## What Kafka Is

Apache Kafka is a **distributed event streaming platform** designed for:

* High throughput
* Fault tolerance
* Event replay
* Real-time data pipelines

---

## Core Concepts

### 1. Topic
A category/feed of events

```
Topic: "user-events"
├── user.created
├── user.updated
└── user.deleted
```

### 2. Partition
Topics are split into partitions for parallelism

```
Topic: orders
├── Partition 0 → Consumer 1
├── Partition 1 → Consumer 2
└── Partition 2 → Consumer 3
```

### 3. Offset
Position in the partition (like a bookmark)

```
Partition 0: [msg1, msg2, msg3, msg4]
             offset: 0, 1, 2, 3
```

### 4. Consumer Group
Multiple consumers share the load

---

## Kafka vs RabbitMQ vs BullMQ

| Feature        | BullMQ       | RabbitMQ     | Kafka           |
| -------------- | ------------ | ------------ | --------------- |
| Type           | Job Queue    | Message Broker | Event Stream   |
| Message Retention | Deleted   | Deleted      | Configurable    |
| Replay         | ❌            | ❌            | ✅               |
| Throughput     | Medium       | Medium       | Very High       |
| Ordering       | Per queue    | Per queue    | Per partition   |
| Use Case       | Background jobs | Microservices | Analytics, Logs |

---

## When to Use Kafka

✅ **Analytics**: Process millions of events
✅ **Event Sourcing**: Replay events to rebuild state
✅ **Data Pipelines**: Stream data between systems
✅ **Log Aggregation**: Centralize logs from multiple services
✅ **CDC (Change Data Capture)**: Track database changes
✅ **Real-time Processing**: Process streams with Kafka Streams

❌ **Not for**:
* Simple background jobs (use BullMQ)
* Request-response patterns (use RabbitMQ)
* Small-scale applications (overkill)

---

## Architecture

```
Producer → Kafka Cluster → Consumer Group 1
                        → Consumer Group 2
                        → Consumer Group 3
```

Each consumer group reads independently!

---

## Code Example (Node.js with KafkaJS)

### Producer

```ts
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

await producer.connect();
await producer.send({
  topic: 'user-events',
  messages: [
    { 
      key: 'user-123',
      value: JSON.stringify({ event: 'created', userId: 123 })
    }
  ]
});

await producer.disconnect();
```

### Consumer

```ts
const consumer = kafka.consumer({ groupId: 'analytics-group' });

await consumer.connect();
await consumer.subscribe({ topic: 'user-events', fromBeginning: true });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    console.log({
      offset: message.offset,
      value: message.value.toString()
    });
  }
});
```

---

## Key Features

### 1. Event Replay
```ts
// Start from beginning
await consumer.subscribe({ topic: 'events', fromBeginning: true });

// Start from specific offset
await consumer.seek({ topic: 'events', partition: 0, offset: '100' });
```

### 2. Multiple Consumer Groups
```
Topic: orders
├── Consumer Group: billing-service (reads all)
├── Consumer Group: analytics-service (reads all)
└── Consumer Group: notification-service (reads all)
```

Each group maintains its own offset!

### 3. Retention
```
Topic Config:
- retention.ms: 604800000 (7 days)
- retention.bytes: 1073741824 (1GB)
```

Messages are kept even after consumption.

---

## Real-World Use Cases

### 1. Activity Tracking
```
User clicks → Kafka → Analytics Dashboard
                   → Recommendation Engine
                   → A/B Testing Service
```

### 2. Log Aggregation
```
Service A logs → Kafka → Elasticsearch
Service B logs →       → S3 Archive
Service C logs →       → Monitoring
```

### 3. Event Sourcing
```
Commands → Kafka (Event Log) → Rebuild State
                             → Audit Trail
                             → Analytics
```

### 4. CDC (Change Data Capture)
```
Database Changes → Kafka → Search Index
                        → Cache Invalidation
                        → Data Warehouse
```

---

## Interview Questions

**Q: When would you use Kafka instead of RabbitMQ?**
A: When you need event replay, multiple independent consumers, or high-throughput data pipelines.

**Q: What is a consumer group in Kafka?**
A: A group of consumers that share the load of reading from a topic. Each partition is consumed by only one consumer in the group.

**Q: How does Kafka achieve high throughput?**
A: Through partitioning (parallelism), sequential disk writes, zero-copy optimization, and batch processing.

**Q: What happens if a Kafka consumer crashes?**
A: The partition is reassigned to another consumer in the group. The new consumer starts from the last committed offset.

---

## Kafka vs Traditional Queue

### Traditional Queue (RabbitMQ/BullMQ)
```
Producer → Queue → Consumer 1 (gets msg1)
                → Consumer 2 (gets msg2)
```
Message deleted after consumption.

### Kafka
```
Producer → Topic → Consumer Group A (reads all)
                → Consumer Group B (reads all)
```
Messages retained, multiple groups read independently.

---

## When NOT to Use Kafka

❌ Simple background jobs
❌ Low message volume
❌ Need immediate message deletion
❌ Small team (operational overhead)
❌ Request-response patterns
❌ Transactional workflows

---

## Production Considerations

✅ **Replication**: Set replication factor ≥ 3
✅ **Partitioning**: More partitions = more parallelism
✅ **Monitoring**: Track lag, throughput, errors
✅ **Retention**: Balance storage cost vs replay needs
✅ **Security**: Enable SSL/SASL authentication
✅ **Backpressure**: Handle slow consumers

---

## Summary

| Scenario                    | Choose        |
| --------------------------- | ------------- |
| Background jobs (Node.js)   | BullMQ        |
| Microservices messaging     | RabbitMQ      |
| Event streaming/analytics   | Kafka         |
| Simple task queue           | BullMQ        |
| Complex routing             | RabbitMQ      |
| Event replay needed         | Kafka         |
| Multi-language services     | RabbitMQ      |
| High throughput (>100k/sec) | Kafka         |

**Rule of thumb**: Start simple (BullMQ), graduate to RabbitMQ for complexity, use Kafka for streaming/analytics.
