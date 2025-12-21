# Queues — Why They Exist

## Problem Without Queues

```
User → API → Email → PDF → Payment → Response (10s)
```

Problems:

* Timeouts
* Server crashes
* Bad UX
* Blocking operations
* No retry mechanism

---

## Queue-Based Architecture

```
User → API → Queue → Worker
          ↑
       instant response
```

Queues decouple **request** from **work**.

---

## Key Benefits

### 1. Asynchronous Processing
* User gets immediate response
* Work happens in background
* Better user experience

### 2. Reliability
* Jobs are persisted
* Automatic retries
* Dead letter queues for failures

### 3. Scalability
* Add more workers as needed
* Horizontal scaling
* Load distribution

### 4. Decoupling
* API and workers can scale independently
* Different technologies can be used
* Easier to maintain

---

## Queue Patterns

### 1. Work Queue
```
Producer → Queue → Worker 1
                 → Worker 2
                 → Worker 3
```
Multiple workers process jobs in parallel.

### 2. Priority Queue
```
High Priority Jobs → Process First
Low Priority Jobs  → Process Later
```

### 3. Delayed Queue
```
Schedule Job → Wait → Execute at specific time
```

### 4. Dead Letter Queue
```
Failed Job → Retry 3x → Move to DLQ → Manual Review
```

---

## When to Use Queues

✅ Email sending
✅ Image/video processing
✅ Report generation
✅ Batch operations
✅ Scheduled tasks
✅ Webhook delivery
✅ Data synchronization

❌ Real-time responses needed
❌ Simple, fast operations
❌ User must wait for result

---

## Interview Questions

**Q: What happens if a worker crashes while processing a job?**
A: The job should be marked as "processing" with a timeout. If not completed, it's re-queued for another worker.

**Q: How do you handle job failures?**
A: Implement retry logic with exponential backoff, maximum retry count, and dead letter queue for permanent failures.

**Q: Queue vs Event Stream (like Kafka)?**
A: Queues are for task distribution (job consumed once). Streams are for event logs (multiple consumers can read).

---

## Best Practices

✅ Make jobs idempotent (safe to retry)
✅ Set appropriate timeouts
✅ Implement dead letter queues
✅ Monitor queue length
✅ Log job failures
✅ Use job IDs for tracking

❌ Don't put large payloads in queue
❌ Don't create circular dependencies
❌ Don't ignore failed jobs
