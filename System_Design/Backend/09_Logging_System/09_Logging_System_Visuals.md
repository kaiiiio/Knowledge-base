# Logging System: Visual Diagrams

## 1. Complete Logging Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        App1[Service 1<br/>User Service]
        App2[Service 2<br/>Order Service]
        App3[Service 3<br/>Payment Service]
    end
    
    subgraph "Log Collection"
        Agent1[Filebeat]
        Agent2[Filebeat]
        Agent3[Filebeat]
    end
    
    subgraph "Message Queue"
        Kafka[Kafka<br/>Log Buffer<br/>Retention: 7 days]
    end
    
    subgraph "Processing Pipeline"
        Logstash[Logstash<br/>Parse & Transform]
        Stream[Stream Processor<br/>Flink/Spark]
    end
    
    subgraph "Storage Layer"
        ES[(Elasticsearch<br/>Hot Data<br/>Last 7 days)]
        S3[(S3 Cold Storage<br/>>7 days<br/>Compressed)]
    end
    
    subgraph "Visualization"
        Kibana[Kibana<br/>Search & Dashboards]
        Grafana[Grafana<br/>Metrics]
    end
    
    subgraph "Alerting"
        Alert[Alert Manager]
        Slack[Slack]
        PD[PagerDuty]
    end
    
    App1 -->|Write Logs| Agent1
    App2 -->|Write Logs| Agent2
    App3 -->|Write Logs| Agent3
    
    Agent1 --> Kafka
    Agent2 --> Kafka
    Agent3 --> Kafka
    
    Kafka --> Logstash
    Kafka --> Stream
    
    Logstash --> ES
    ES --> Kibana
    ES --> Grafana
    
    Stream -->|Detect Patterns| Alert
    Alert --> Slack
    Alert --> PD
    
    ES -.->|Archive Old Logs| S3
```

## 2. Log Flow Sequence

```mermaid
sequenceDiagram
    participant App as Application
    participant File as Log File
    participant Agent as Filebeat
    participant Kafka
    participant Logstash
    participant ES as Elasticsearch
    participant Kibana
    
    App->>File: Write structured log
    Note over File: /var/log/app/app.log
    
    Agent->>File: Tail log file
    File-->>Agent: New log entry
    
    Agent->>Agent: Add metadata<br/>(host, timestamp)
    Agent->>Kafka: Publish to topic
    
    Kafka->>Logstash: Consume log
    Logstash->>Logstash: Parse JSON<br/>Extract fields<br/>Enrich data
    
    Logstash->>ES: Index document
    ES->>ES: Store & Index
    
    Kibana->>ES: Query logs
    ES-->>Kibana: Return results
```

## 3. Log Levels and Routing

```mermaid
graph LR
    subgraph "Log Levels"
        DEBUG[DEBUG<br/>Detailed info]
        INFO[INFO<br/>General info]
        WARN[WARN<br/>Warnings]
        ERROR[ERROR<br/>Errors]
        FATAL[FATAL<br/>Critical]
    end
    
    subgraph "Routing"
        DEBUG --> Dev[Development Only]
        INFO --> All[All Environments]
        WARN --> All
        ERROR --> Alert1[Error Index +<br/>Alert Channel]
        FATAL --> Alert2[Critical Index +<br/>Immediate Alert]
    end
    
    Alert1 --> Slack
    Alert2 --> PD[PagerDuty]
```

## 4. Real-time Alerting Pipeline

```mermaid
graph TB
    subgraph "Log Stream"
        Kafka[Kafka Topic:<br/>application-logs]
    end
    
    subgraph "Stream Processing"
        Flink[Apache Flink]
        Flink --> Window[5-minute Window]
    end
    
    subgraph "Alert Rules"
        Window --> R1{Error Rate<br/>> 10/min?}
        Window --> R2{Response Time<br/>> 5s?}
        Window --> R3{Memory<br/>> 90%?}
    end
    
    subgraph "Actions"
        R1 -->|Yes| Alert1[Send Alert]
        R2 -->|Yes| Alert2[Send Alert]
        R3 -->|Yes| Alert3[Send Alert]
        
        Alert1 --> Notify[Notification Service]
        Alert2 --> Notify
        Alert3 --> Notify
    end
    
    Kafka --> Flink
```

## 5. Log Retention Strategy

```mermaid
graph LR
    subgraph "Hot Storage (Elasticsearch)"
        Day0[Day 0-7<br/>Searchable<br/>Fast Access]
    end
    
    subgraph "Warm Storage (Elasticsearch)"
        Day7[Day 7-30<br/>Searchable<br/>Slower Access]
    end
    
    subgraph "Cold Storage (S3)"
        Day30[Day 30+<br/>Archived<br/>Compressed<br/>Rare Access]
    end
    
    Day0 -->|After 7 days| Day7
    Day7 -->|After 30 days| Day30
    Day30 -->|After 1 year| Delete[Delete]
```

## 6. Structured Logging Format

```mermaid
graph TB
    subgraph "Log Entry Structure"
        TS[timestamp]
        Level[level]
        Service[service]
        ReqID[requestId]
        UserID[userId]
        Msg[message]
        Meta[metadata]
        Stack[stack trace]
    end
    
    subgraph "Example JSON"
        JSON["
        {
          'timestamp': '2025-12-21T10:30:00Z',
          'level': 'ERROR',
          'service': 'order-service',
          'requestId': 'req-123',
          'userId': 'user-456',
          'message': 'Payment failed',
          'metadata': {
            'orderId': 'ord-789',
            'amount': 99.99,
            'errorCode': 'INSUFFICIENT_FUNDS'
          },
          'stack': '...'
        }
        "]
    end
    
    TS --> JSON
    Level --> JSON
    Service --> JSON
    ReqID --> JSON
    UserID --> JSON
    Msg --> JSON
    Meta --> JSON
    Stack --> JSON
```

## 7. Elasticsearch Index Strategy

```mermaid
graph TB
    subgraph "Index Pattern"
        Pattern[logs-{environment}-{date}]
    end
    
    subgraph "Examples"
        Prod1[logs-production-2025.12.21]
        Prod2[logs-production-2025.12.22]
        Stage1[logs-staging-2025.12.21]
        Dev1[logs-development-2025.12.21]
    end
    
    Pattern --> Prod1
    Pattern --> Prod2
    Pattern --> Stage1
    Pattern --> Dev1
    
    subgraph "Benefits"
        B1[Easy to delete old data]
        B2[Better query performance]
        B3[Environment isolation]
    end
```

## 8. Log Aggregation Metrics

```mermaid
graph LR
    subgraph "Metrics Collection"
        Logs[Log Stream]
        Logs --> M1[Total Logs/sec]
        Logs --> M2[Error Count]
        Logs --> M3[Warn Count]
        Logs --> M4[Response Times]
    end
    
    subgraph "Aggregation"
        M1 --> Agg[Aggregator]
        M2 --> Agg
        M3 --> Agg
        M4 --> Agg
    end
    
    subgraph "Storage"
        Agg --> TS[(Time Series DB<br/>InfluxDB)]
    end
    
    subgraph "Visualization"
        TS --> Dash[Grafana Dashboard]
    end
```

## 9. Distributed Tracing Integration

```mermaid
sequenceDiagram
    participant Client
    participant API as API Gateway
    participant Order as Order Service
    participant Payment as Payment Service
    participant DB as Database
    
    Note over Client,DB: Trace ID: trace-123
    
    Client->>API: POST /orders
    Note over API: Span ID: span-1<br/>Log: Request received
    
    API->>Order: Create Order
    Note over Order: Span ID: span-2<br/>Parent: span-1<br/>Log: Processing order
    
    Order->>Payment: Process Payment
    Note over Payment: Span ID: span-3<br/>Parent: span-2<br/>Log: Payment processing
    
    Payment->>DB: Save Transaction
    Note over DB: Span ID: span-4<br/>Parent: span-3<br/>Log: DB write
    
    DB-->>Payment: Success
    Payment-->>Order: Payment OK
    Order-->>API: Order Created
    API-->>Client: 201 Created
    
    Note over Client,DB: All logs tagged with trace-123
```

## 10. Monitoring Dashboard Layout

```mermaid
graph TB
    subgraph "Kibana Dashboard"
        D1[Log Volume<br/>Time Series]
        D2[Error Rate<br/>by Service]
        D3[Top Errors<br/>Table]
        D4[Response Time<br/>Histogram]
        D5[Geographic<br/>Distribution]
        D6[Recent Logs<br/>Live Feed]
    end
    
    subgraph "Filters"
        F1[Time Range]
        F2[Service]
        F3[Log Level]
        F4[User ID]
    end
    
    F1 -.-> D1
    F2 -.-> D2
    F3 -.-> D3
    F4 -.-> D6
```

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Ingestion Rate | 100K logs/s | 85K logs/s |
| Ingestion Latency | \u003c 100ms | 50ms |
| Search Latency | \u003c 2s | 500ms |
| Storage Cost | \u003c $100/TB/month | $75/TB/month |
| Retention (Hot) | 7 days | 7 days |
| Retention (Cold) | 1 year | 1 year |

## Alert Configuration

```mermaid
flowchart TD
    Start[Log Entry] --> Check{Error Level?}
    
    Check -->|ERROR| Count1{Count in<br/>5 min > 10?}
    Check -->|FATAL| Immediate[Immediate Alert]
    Check -->|WARN| Count2{Count in<br/>15 min > 50?}
    Check -->|INFO/DEBUG| Ignore[No Alert]
    
    Count1 -->|Yes| Slack[Slack Alert]
    Count1 -->|No| Ignore
    
    Count2 -->|Yes| Email[Email Alert]
    Count2 -->|No| Ignore
    
    Immediate --> PD[PagerDuty]
```
