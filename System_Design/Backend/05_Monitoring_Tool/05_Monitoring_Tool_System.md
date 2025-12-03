# High-Write Throughput Monitoring System: Complete System Design

## Problem Statement

**Context**: Building monitoring tool (like Datadog). 5,000 servers sending CPU/RAM metrics every 10 seconds = 500,000 writes/second.

**Bug**: PostgreSQL at 100% CPU, disk I/O saturated. API returning 503 Service Unavailable.

**Task**: Architect storage layer that handles 500k writes/second without crashing.

**Constraint**: Must never lose metrics data.

---

## Solution Architecture

```
5,000 Servers → API Gateway → Kafka (Message Queue) → Workers (Batch) → Time-Series DB
```

**Key Components**:
1. **Message Queue (Kafka)**: Buffers writes, handles spikes
2. **Batch Processing**: Reduces database writes (500k → 50k batches)
3. **Time-Series Database**: Optimized for time-series data (InfluxDB/TimescaleDB)

---

## Implementation

### 1. API Endpoint: Accept Metrics

```javascript
// Express.js endpoint
app.post('/metrics', async (req, res) => {
    const metrics = req.body; // { serverId, cpu, ram, timestamp }
    
    // Validate
    if (!metrics.serverId || !metrics.cpu || !metrics.ram) {
        return res.status(400).json({ error: 'Invalid metrics' });
    }
    
    // Send to Kafka (non-blocking, fast)
    await kafkaProducer.send({
        topic: 'metrics',
        messages: [{
            key: metrics.serverId,
            value: JSON.stringify({
                ...metrics,
                timestamp: metrics.timestamp || Date.now()
            })
        }]
    });
    
    // Return immediately (202 Accepted)
    res.status(202).json({ received: true });
});
```

### 2. Kafka Producer Configuration

```javascript
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'metrics-producer',
    brokers: ['kafka1:9092', 'kafka2:9092', 'kafka3:9092']
});

const producer = kafka.producer({
    maxInFlightRequests: 1,
    idempotent: true, // Exactly-once semantics
    transactionTimeout: 30000
});

await producer.connect();
```

### 3. Worker: Batch Process Metrics

```javascript
const { Kafka } = require('kafkajs');
const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const kafka = new Kafka({
    clientId: 'metrics-consumer',
    brokers: ['kafka1:9092', 'kafka2:9092', 'kafka3:9092']
});

const consumer = kafka.consumer({ groupId: 'metrics-processors' });
const influxDB = new InfluxDB({
    url: process.env.INFLUXDB_URL,
    token: process.env.INFLUXDB_TOKEN
});

const writeApi = influxDB.getWriteApi(
    process.env.INFLUXDB_ORG,
    process.env.INFLUXDB_BUCKET,
    'ns' // nanoseconds precision
);

await consumer.connect();
await consumer.subscribe({ topic: 'metrics', fromBeginning: false });

// Batch buffer
let batch = [];
const BATCH_SIZE = 1000;
const BATCH_TIMEOUT = 5000; // 5 seconds

async function flushBatch() {
    if (batch.length === 0) return;
    
    const points = batch.map(metric => {
        return new Point('server_metrics')
            .tag('server_id', metric.serverId)
            .floatField('cpu', metric.cpu)
            .floatField('ram', metric.ram)
            .timestamp(new Date(metric.timestamp));
    });
    
    writeApi.writePoints(points);
    await writeApi.flush();
    
    console.log(`Flushed ${batch.length} metrics`);
    batch = [];
}

// Process messages
await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
        const metric = JSON.parse(message.value.toString());
        batch.push(metric);
        
        // Flush if batch size reached
        if (batch.length >= BATCH_SIZE) {
            await flushBatch();
        }
    }
});

// Flush periodically (even if batch not full)
setInterval(flushBatch, BATCH_TIMEOUT);
```

### 4. Alternative: TimescaleDB (PostgreSQL Extension)

```javascript
// If using PostgreSQL with TimescaleDB
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20
});

// Create hypertable (TimescaleDB)
// CREATE TABLE metrics (
//     time TIMESTAMPTZ NOT NULL,
//     server_id VARCHAR(255) NOT NULL,
//     cpu FLOAT NOT NULL,
//     ram FLOAT NOT NULL
// );
// SELECT create_hypertable('metrics', 'time');

// Batch insert
async function insertBatch(metrics) {
    const values = metrics.map((m, i) => 
        `($${i*4+1}, $${i*4+2}, $${i*4+3}, $${i*4+4})`
    ).join(', ');
    
    const params = metrics.flatMap(m => [
        new Date(m.timestamp),
        m.serverId,
        m.cpu,
        m.ram
    ]);
    
    await pool.query(
        `INSERT INTO metrics (time, server_id, cpu, ram) VALUES ${values}`,
        params
    );
}
```

---

## Why This Works

**Message Queue (Kafka)**:
- Buffers writes, handles spikes
- Decouples servers from database
- Durable (persists to disk)
- Scales horizontally

**Batch Processing**:
- Reduces writes: 500k/sec → 50k batches/sec
- 10x reduction in database load
- More efficient than individual inserts

**Time-Series Database**:
- Optimized for time-series data
- Compression (10-100x smaller)
- Fast queries on time ranges
- Automatic retention policies

---

## Visual Flow

```
5,000 Servers (every 10 seconds)
    │
    ├─→ 500,000 metrics/second
    │
    ▼
API Gateway (rate limiting, validation)
    │
    ▼
Kafka Topic: 'metrics'
    │
    ├─→ Partition 0 → Worker 1 → Batch (1000) → InfluxDB
    ├─→ Partition 1 → Worker 2 → Batch (1000) → InfluxDB
    ├─→ Partition 2 → Worker 3 → Batch (1000) → InfluxDB
    └─→ Partition 3 → Worker 4 → Batch (1000) → InfluxDB
    
Result: 500k writes/sec → 500 batches/sec (1000 each)
```

---

## Alternative Solutions

### Option 1: Write-Ahead Log (WAL) + Batch

```
Servers → WAL → Batch Processor → PostgreSQL
```
- Pros: Uses existing PostgreSQL
- Cons: Still slower than time-series DB

### Option 2: Redis + Background Worker

```
Servers → Redis (in-memory) → Background Worker → Database
```
- Pros: Very fast writes
- Cons: Risk of data loss if Redis crashes

### Option 3: Direct Batch Insert

```
Servers → API → Batch Buffer → PostgreSQL (batch insert)
```
- Pros: Simple
- Cons: Can't handle 500k/sec, no durability

---

## Best Solution

**Kafka + Time-Series DB (InfluxDB/TimescaleDB)**:
- ✅ Handles 500k+ writes/sec
- ✅ Durable (Kafka persistence)
- ✅ Scalable (add workers)
- ✅ Optimized storage (time-series DB)
- ✅ Production-ready

---

## Performance Metrics

**Throughput**:
- Kafka: 1M+ messages/sec per partition
- InfluxDB: 100k+ writes/sec per node
- Batch: 10x reduction in writes

**Latency**:
- API response: < 10ms (202 Accepted)
- Processing: 5-10 seconds (batch window)
- Query: < 100ms (time-series optimized)

