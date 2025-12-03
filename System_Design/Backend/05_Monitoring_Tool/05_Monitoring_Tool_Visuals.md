# Monitoring Tool System: Visual Diagrams

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              5,000 Servers                              │
│  (Sending metrics every 10 seconds)                     │
└──────────────┬──────────────────────────────────────────┘
               │
               │ 500,000 metrics/second
               ▼
┌─────────────────────────────────────────────────────────┐
│          API Gateway / Load Balancer                     │
│  (Rate limiting, batching)                              │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│          Kafka Cluster (Message Queue)                    │
│  Topic: 'metrics'                                        │
│  Partitions: 0, 1, 2, 3                                 │
└──────────────┬──────────────────────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Worker 1│ │ Worker 2│ │ Worker 3│
│ (Batch) │ │ (Batch) │ │ (Batch) │
└────┬────┘ └────┬────┘ └────┬────┘
     │           │           │
     └───────────┼───────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│      Time-Series Database (InfluxDB/TimescaleDB)         │
│  (Optimized for high write throughput)                   │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

```
Server 1 → { serverId: "s1", cpu: 45, ram: 60 }
Server 2 → { serverId: "s2", cpu: 78, ram: 82 }
Server 3 → { serverId: "s3", cpu: 32, ram: 45 }
...
Server 5000 → { serverId: "s5000", cpu: 55, ram: 70 }

    │
    ▼
API Gateway (validates, rate limits)
    │
    ▼
Kafka Topic: 'metrics'
    │
    ├─→ Partition 0: [s1, s5, s9, ...]
    ├─→ Partition 1: [s2, s6, s10, ...]
    ├─→ Partition 2: [s3, s7, s11, ...]
    └─→ Partition 3: [s4, s8, s12, ...]
    
    │
    ▼
Workers (batch processing)
    │
    ├─→ Worker 1: Collects 1000 metrics → Batch insert
    ├─→ Worker 2: Collects 1000 metrics → Batch insert
    ├─→ Worker 3: Collects 1000 metrics → Batch insert
    └─→ Worker 4: Collects 1000 metrics → Batch insert
    
    │
    ▼
InfluxDB (time-series storage)
    │
    └─→ Compressed, indexed by time
```

## Batch Processing Timeline

```
Time →
T=0s:    Metrics arrive → Kafka
T=1s:    Worker collects 1000 metrics
T=2s:    Batch full → Flush to InfluxDB
T=3s:    Next batch starts
T=4s:    Batch full → Flush
...

Result: 500k metrics/sec → 500 batches/sec (1000 each)
```

## Scaling Strategy

```
Initial: 1 Kafka broker, 1 Worker, 1 InfluxDB node
    ↓
Scale: 3 Kafka brokers, 4 Workers, 3 InfluxDB nodes
    ↓
Result: 3M+ metrics/sec capacity
```

