# BullMQ (Redis-based Queue)

## Why BullMQ Exists

* Node.js friendly
* Uses Redis lists & streams
* Built-in retry logic
* Job prioritization
* Delayed jobs support
* Progress tracking

---

## BullMQ Components

### 1. Queue (Producer)
Adds jobs to the queue

```ts
import { Queue } from 'bullmq';

const emailQueue = new Queue('email', {
  connection: {
    host: 'localhost',
    port: 6379
  }
});

// Add a job
await emailQueue.add('send-welcome', {
  email: 'user@example.com',
  name: 'John'
});
```

### 2. Worker (Consumer)
Processes jobs from the queue

```ts
import { Worker } from 'bullmq';

const worker = new Worker('email', async (job) => {
  console.log(`Processing job ${job.id}`);
  
  // Your business logic
  await sendEmail(job.data.email, job.data.name);
  
  return { success: true };
}, {
  connection: {
    host: 'localhost',
    port: 6379
  }
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed:`, err);
});
```

### 3. Redis (Storage)
Stores job data and state

---

## Advanced Features

### Job Options

```ts
await queue.add('send-email', data, {
  // Retry configuration
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000
  },
  
  // Priority (higher = processed first)
  priority: 10,
  
  // Delay execution
  delay: 5000, // 5 seconds
  
  // Remove on complete
  removeOnComplete: true,
  removeOnFail: false
});
```

### Job Progress

```ts
const worker = new Worker('video-processing', async (job) => {
  await job.updateProgress(25);
  // ... process part 1
  
  await job.updateProgress(50);
  // ... process part 2
  
  await job.updateProgress(75);
  // ... process part 3
  
  await job.updateProgress(100);
  return { done: true };
});
```

### Scheduled/Cron Jobs

```ts
import { QueueScheduler } from 'bullmq';

const scheduler = new QueueScheduler('email');

// Add repeatable job
await queue.add('daily-report', {}, {
  repeat: {
    pattern: '0 9 * * *' // Every day at 9 AM
  }
});
```

---

## When BullMQ is Enough

✅ Monoliths or small microservices
✅ Medium traffic (< 10k jobs/min)
✅ Background jobs (emails, notifications)
✅ Already using Redis
✅ Node.js ecosystem

❌ Not ideal for:
* Event streaming (use Kafka)
* Massive fan-out (use RabbitMQ)
* Multi-language services (use RabbitMQ)
* Complex routing (use RabbitMQ)

---

## Production Setup

### 1. Separate Queue and Worker

**api-service.ts** (Producer)
```ts
const queue = new Queue('tasks');
await queue.add('process-order', orderData);
```

**worker-service.ts** (Consumer)
```ts
const worker = new Worker('tasks', processJob);
```

### 2. Error Handling

```ts
worker.on('failed', async (job, err) => {
  // Log to monitoring service
  logger.error(`Job ${job.id} failed`, { error: err, data: job.data });
  
  // Alert if critical
  if (job.data.critical) {
    await alertTeam(err);
  }
});
```

### 3. Monitoring

```ts
const queue = new Queue('tasks');

// Get queue metrics
const jobCounts = await queue.getJobCounts();
console.log(jobCounts);
// { waiting: 5, active: 2, completed: 100, failed: 3 }

// Get failed jobs
const failed = await queue.getFailed();
```

---

## Interview Questions

**Q: How does BullMQ ensure job reliability?**
A: Jobs are stored in Redis with state tracking. If a worker crashes, the job is automatically re-queued after a timeout.

**Q: Can multiple workers process the same queue?**
A: Yes! BullMQ supports horizontal scaling. Multiple workers can process jobs from the same queue in parallel.

**Q: What happens if Redis goes down?**
A: Jobs in Redis are lost unless you have Redis persistence enabled (RDB/AOF). Always enable persistence in production.

---

## Best Practices

✅ Use separate Redis instance for queues
✅ Enable Redis persistence (AOF)
✅ Set appropriate job timeouts
✅ Monitor queue length and processing time
✅ Implement graceful shutdown for workers
✅ Use job IDs for idempotency

```ts
// Graceful shutdown
process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});
```

---

## Common Patterns

### Pattern 1: Chain Jobs
```ts
await queue.add('step1', data);

worker.on('completed', async (job) => {
  if (job.name === 'step1') {
    await queue.add('step2', job.returnvalue);
  }
});
```

### Pattern 2: Batch Processing
```ts
const jobs = users.map(user => ({
  name: 'send-email',
  data: { email: user.email }
}));

await queue.addBulk(jobs);
```

### Pattern 3: Rate Limiting
```ts
const worker = new Worker('api-calls', processJob, {
  limiter: {
    max: 10,      // 10 jobs
    duration: 1000 // per second
  }
});
```
