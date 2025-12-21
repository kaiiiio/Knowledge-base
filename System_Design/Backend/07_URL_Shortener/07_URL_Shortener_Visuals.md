# URL Shortener: Visual Diagrams

## 1. System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile App]
    end
    
    subgraph "Load Balancing"
        LB[Load Balancer<br/>Nginx/HAProxy]
    end
    
    subgraph "Application Layer"
        API1[API Server 1<br/>Node.js/Express]
        API2[API Server 2<br/>Node.js/Express]
        API3[API Server 3<br/>Node.js/Express]
    end
    
    subgraph "Caching Layer"
        Redis[(Redis Cache<br/>Hot URLs)]
    end
    
    subgraph "Data Layer"
        Master[(PostgreSQL<br/>Master)]
        Replica1[(PostgreSQL<br/>Read Replica 1)]
        Replica2[(PostgreSQL<br/>Read Replica 2)]
    end
    
    subgraph "Analytics Pipeline"
        Queue[Message Queue<br/>RabbitMQ/Kafka]
        Worker[Analytics Worker]
        AnalyticsDB[(Analytics DB<br/>ClickHouse)]
    end
    
    Browser --> LB
    Mobile --> LB
    LB --> API1
    LB --> API2
    LB --> API3
    
    API1 <--> Redis
    API2 <--> Redis
    API3 <--> Redis
    
    API1 --> Master
    API2 --> Master
    API3 --> Master
    
    API1 --> Replica1
    API2 --> Replica1
    API3 --> Replica2
    
    API1 --> Queue
    API2 --> Queue
    API3 --> Queue
    
    Queue --> Worker
    Worker --> AnalyticsDB
```

## 2. URL Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant API
    participant DB
    participant Cache
    
    User->>API: POST /api/shorten<br/>{url, customAlias}
    
    API->>API: Validate URL
    
    alt Custom Alias
        API->>DB: Check if alias exists
        alt Alias Taken
            API-->>User: 409 Conflict
        end
    else Auto-generate
        API->>API: Generate short code
        API->>DB: Check collision
        alt Collision
            API->>API: Retry with new code
        end
    end
    
    API->>DB: INSERT INTO urls
    DB-->>API: Success
    
    API->>Cache: SET url:shortCode
    Cache-->>API: OK
    
    API-->>User: 200 OK<br/>{shortUrl, shortCode}
```

## 3. URL Redirect Flow (Critical Path)

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Cache
    participant DB
    participant Queue
    
    User->>API: GET /abc123
    
    API->>Cache: GET url:abc123
    
    alt Cache Hit
        Cache-->>API: original_url
    else Cache Miss
        API->>DB: SELECT original_url<br/>WHERE short_code='abc123'
        DB-->>API: original_url
        API->>Cache: SET url:abc123
    end
    
    par Async Analytics
        API->>Queue: Publish click event
        Note over Queue: Non-blocking
    end
    
    API-->>User: 301 Redirect<br/>Location: original_url
```

## 4. Short Code Generation Strategies

```mermaid
graph LR
    subgraph "Method 1: Random"
        R1[Generate Random<br/>6 chars]
        R2[Check DB<br/>for collision]
        R3{Exists?}
        R4[Retry]
        R5[Use Code]
        
        R1 --> R2
        R2 --> R3
        R3 -->|Yes| R4
        R3 -->|No| R5
        R4 --> R1
    end
    
    subgraph "Method 2: Hash-based"
        H1[Hash URL<br/>MD5/SHA256]
        H2[Take first<br/>6 chars]
        H3[Convert to<br/>Base62]
        H4[Check collision]
        
        H1 --> H2
        H2 --> H3
        H3 --> H4
    end
    
    subgraph "Method 3: Counter"
        C1[Redis INCR<br/>counter]
        C2[Convert to<br/>Base62]
        C3[Guaranteed<br/>Unique]
        
        C1 --> C2
        C2 --> C3
    end
```

## 5. Database Schema Visualization

```mermaid
erDiagram
    USERS ||--o{ URLS : creates
    URLS ||--o{ URL_CLICKS : tracks
    
    USERS {
        bigint id PK
        varchar email UK
        timestamp created_at
    }
    
    URLS {
        bigint id PK
        varchar short_code UK
        text original_url
        varchar custom_alias UK
        bigint user_id FK
        timestamp created_at
        timestamp expires_at
        boolean is_active
    }
    
    URL_CLICKS {
        bigint id PK
        varchar short_code FK
        timestamp clicked_at
        inet ip_address
        text user_agent
        text referrer
        varchar country
    }
```

## 6. Caching Strategy

```mermaid
graph TB
    Request[Incoming Request]
    L1[L1: Local Cache<br/>In-Memory Map]
    L2[L2: Redis Cache<br/>Distributed]
    DB[(Database)]
    
    Request --> L1
    L1 -->|Hit| Return1[Return URL<br/>~1ms]
    L1 -->|Miss| L2
    L2 -->|Hit| Return2[Return URL<br/>~5ms<br/>+ Update L1]
    L2 -->|Miss| DB
    DB --> Return3[Return URL<br/>~20ms<br/>+ Update L1 & L2]
```

## 7. Analytics Pipeline

```mermaid
graph LR
    subgraph "Real-time Path"
        API[API Server]
        Queue[Message Queue]
        Worker[Analytics Worker]
    end
    
    subgraph "Storage"
        Hot[(Hot Data<br/>Last 7 days<br/>PostgreSQL)]
        Cold[(Cold Data<br/>>7 days<br/>S3/Archive)]
    end
    
    subgraph "Processing"
        Batch[Batch Aggregation<br/>Hourly/Daily]
        Cache[(Redis<br/>Aggregated Stats)]
    end
    
    API -->|Async| Queue
    Queue --> Worker
    Worker --> Hot
    Hot -->|Archive| Cold
    Worker --> Batch
    Batch --> Cache
```

## 8. Scaling Architecture

```mermaid
graph TB
    subgraph "Global"
        DNS[DNS/Route53]
    end
    
    subgraph "Region 1: US-East"
        LB1[Load Balancer]
        API1[API Servers<br/>Auto-scaling]
        Cache1[(Redis Cluster)]
        DB1[(PostgreSQL<br/>Master)]
    end
    
    subgraph "Region 2: EU-West"
        LB2[Load Balancer]
        API2[API Servers<br/>Auto-scaling]
        Cache2[(Redis Cluster)]
        DB2[(PostgreSQL<br/>Read Replica)]
    end
    
    subgraph "Region 3: Asia"
        LB3[Load Balancer]
        API3[API Servers<br/>Auto-scaling]
        Cache3[(Redis Cluster)]
        DB3[(PostgreSQL<br/>Read Replica)]
    end
    
    DNS -->|Geo-routing| LB1
    DNS -->|Geo-routing| LB2
    DNS -->|Geo-routing| LB3
    
    DB1 -.->|Replication| DB2
    DB1 -.->|Replication| DB3
```

## 9. Failure Handling

```mermaid
graph TB
    Request[Request]
    Cache{Redis<br/>Available?}
    DB{Database<br/>Available?}
    Fallback[Fallback Mode]
    Success[Success]
    Error[Error Response]
    
    Request --> Cache
    Cache -->|Yes| Success
    Cache -->|No| DB
    DB -->|Yes| Success
    DB -->|No| Fallback
    Fallback -->|Retry| DB
    Fallback -->|Max Retries| Error
```

## 10. Performance Optimization

```mermaid
graph LR
    subgraph "Optimization Layers"
        O1[CDN<br/>Static Assets]
        O2[Connection Pooling<br/>Database]
        O3[Batch Operations<br/>Analytics]
        O4[Compression<br/>Gzip/Brotli]
        O5[HTTP/2<br/>Multiplexing]
    end
    
    subgraph "Monitoring"
        M1[Metrics<br/>Prometheus]
        M2[Logging<br/>ELK Stack]
        M3[Tracing<br/>Jaeger]
        M4[Alerting<br/>PagerDuty]
    end
    
    O1 --> M1
    O2 --> M1
    O3 --> M2
    O4 --> M3
    O5 --> M4
```

## Key Metrics to Monitor

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Redirect Latency (p95) | \u003c 50ms | \u003e 100ms |
| Cache Hit Rate | \u003e 80% | \u003c 70% |
| Error Rate | \u003c 0.1% | \u003e 1% |
| Database Connections | \u003c 80% | \u003e 90% |
| Queue Depth | \u003c 1000 | \u003e 5000 |

## Capacity Planning

```mermaid
graph TB
    subgraph "Traffic Estimation"
        T1[Daily Active Users<br/>10M]
        T2[Avg URLs per User<br/>2]
        T3[Total Daily URLs<br/>20M]
    end
    
    subgraph "Resource Calculation"
        R1[Peak QPS<br/>~500/s]
        R2[API Servers<br/>10 instances]
        R3[Database<br/>1 Master + 3 Replicas]
        R4[Redis<br/>3-node cluster]
    end
    
    T1 --> T2
    T2 --> T3
    T3 --> R1
    R1 --> R2
    R1 --> R3
    R1 --> R4
```
