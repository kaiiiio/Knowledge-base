# Load Balancer: Visual Diagrams

## 1. Load Balancer Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        C1[Client 1]
        C2[Client 2]
        C3[Client 3]
        C4[Client 4]
    end
    
    subgraph "Load Balancer Cluster"
        LB1[Load Balancer 1<br/>ACTIVE<br/>192.168.1.100]
        LB2[Load Balancer 2<br/>STANDBY<br/>192.168.1.101]
        VIP[Virtual IP<br/>192.168.1.100]
    end
    
    subgraph "Health Check Service"
        HC[Health Checker<br/>Monitors every 5s]
    end
    
    subgraph "Backend Servers"
        S1[Server 1<br/>✓ Healthy<br/>Connections: 45]
        S2[Server 2<br/>✓ Healthy<br/>Connections: 38]
        S3[Server 3<br/>✗ Unhealthy<br/>Down]
        S4[Server 4<br/>✓ Healthy<br/>Connections: 52]
    end
    
    C1 --> VIP
    C2 --> VIP
    C3 --> VIP
    C4 --> VIP
    
    VIP --> LB1
    LB1 -.->|Heartbeat| LB2
    
    LB1 --> S1
    LB1 --> S2
    LB1 -.x|Excluded| S3
    LB1 --> S4
    
    HC -->|Check| S1
    HC -->|Check| S2
    HC -->|Check| S3
    HC -->|Check| S4
    HC -->|Update Pool| LB1
    
    style S3 fill:#f99,stroke:#f00
    style S1 fill:#9f9,stroke:#0f0
    style S2 fill:#9f9,stroke:#0f0
    style S4 fill:#9f9,stroke:#0f0
    style LB1 fill:#99f,stroke:#00f
```

## 2. Load Balancing Algorithms Comparison

```mermaid
graph LR
    subgraph "Round Robin"
        RR1[Request 1] --> RRS1[Server 1]
        RR2[Request 2] --> RRS2[Server 2]
        RR3[Request 3] --> RRS3[Server 3]
        RR4[Request 4] --> RRS1
    end
    
    subgraph "Least Connections"
        LC1[Request 1] --> LCS1[Server 1<br/>10 conn]
        LC2[Request 2] --> LCS1
        LC3[Request 3] --> LCS2[Server 2<br/>15 conn]
        LC4[Request 4] --> LCS1
    end
    
    subgraph "IP Hash"
        IH1[IP: 192.168.1.10] --> IHS1[Server 1]
        IH2[IP: 192.168.1.20] --> IHS2[Server 2]
        IH3[IP: 192.168.1.10] --> IHS1
        IH4[IP: 192.168.1.30] --> IHS3[Server 3]
    end
```

## 3. Request Flow with Load Balancer

```mermaid
sequenceDiagram
    participant Client
    participant LB as Load Balancer
    participant HC as Health Check
    participant S1 as Server 1
    participant S2 as Server 2
    participant S3 as Server 3
    
    Note over HC,S3: Health Check Process
    HC->>S1: GET /health
    S1-->>HC: 200 OK
    HC->>S2: GET /health
    S2-->>HC: 200 OK
    HC->>S3: GET /health
    S3--xHC: Timeout
    HC->>LB: Mark S3 as unhealthy
    
    Note over Client,S2: Request Routing
    Client->>LB: HTTP Request
    LB->>LB: Select Server<br/>(Round Robin)
    LB->>S1: Forward Request
    S1->>S1: Process Request
    S1-->>LB: Response
    LB-->>Client: Response
    
    Client->>LB: HTTP Request
    LB->>LB: Select Server<br/>(Skip S3 - unhealthy)
    LB->>S2: Forward Request
    S2->>S2: Process Request
    S2-->>LB: Response
    LB-->>Client: Response
```

## 4. Weighted Round Robin Distribution

```mermaid
pie title Traffic Distribution (Weighted Round Robin)
    "Server 1 (Weight: 5)" : 50
    "Server 2 (Weight: 3)" : 30
    "Server 3 (Weight: 2)" : 20
```

## 5. High Availability Failover

```mermaid
stateDiagram-v2
    [*] --> Active: LB1 Starts
    Active --> Monitoring: Normal Operation
    Monitoring --> Active: Heartbeat OK
    Monitoring --> Failover: Heartbeat Failed
    Failover --> Standby_Active: LB2 Takes Over VIP
    Standby_Active --> Monitoring: LB2 Now Active
    Monitoring --> Recovery: LB1 Comes Back
    Recovery --> Active: LB1 Resumes Active
```

## 6. SSL/TLS Termination

```mermaid
graph LR
    subgraph "Client Side"
        Client[Client Browser]
    end
    
    subgraph "Load Balancer"
        LB[Load Balancer<br/>SSL Termination]
        Cert[SSL Certificate]
    end
    
    subgraph "Backend"
        S1[Server 1<br/>HTTP]
        S2[Server 2<br/>HTTP]
    end
    
    Client -->|HTTPS<br/>Encrypted| LB
    Cert -.->|Decrypt| LB
    LB -->|HTTP<br/>Plain| S1
    LB -->|HTTP<br/>Plain| S2
```

## 7. Connection Pooling

```mermaid
graph TB
    subgraph "Load Balancer"
        Pool[Connection Pool<br/>Max: 100 connections]
    end
    
    subgraph "Backend Servers"
        S1[Server 1]
        S2[Server 2]
        S3[Server 3]
    end
    
    Pool -->|Reuse Connection| S1
    Pool -->|Reuse Connection| S2
    Pool -->|Reuse Connection| S3
    
    Note1[Benefits:<br/>- Reduced latency<br/>- Lower overhead<br/>- Better resource usage]
```

## 8. Layer 4 vs Layer 7 Load Balancing

```mermaid
graph TB
    subgraph "Layer 4 (Transport Layer)"
        L4[TCP/UDP Level]
        L4 --> L4_1[Fast]
        L4 --> L4_2[No content inspection]
        L4 --> L4_3[IP + Port based]
    end
    
    subgraph "Layer 7 (Application Layer)"
        L7[HTTP Level]
        L7 --> L7_1[Content-based routing]
        L7 --> L7_2[URL path routing]
        L7 --> L7_3[Header inspection]
        L7 --> L7_4[Slower but flexible]
    end
```

## 9. Scaling Architecture

```mermaid
graph TB
    subgraph "Global DNS"
        DNS[Route53/CloudFlare]
    end
    
    subgraph "Region: US-East"
        LB1[Load Balancer]
        S1[Servers]
    end
    
    subgraph "Region: EU-West"
        LB2[Load Balancer]
        S2[Servers]
    end
    
    subgraph "Region: Asia-Pacific"
        LB3[Load Balancer]
        S3[Servers]
    end
    
    DNS -->|Geo-routing<br/>US Traffic| LB1
    DNS -->|Geo-routing<br/>EU Traffic| LB2
    DNS -->|Geo-routing<br/>Asia Traffic| LB3
    
    LB1 --> S1
    LB2 --> S2
    LB3 --> S3
```

## 10. Monitoring Dashboard

```mermaid
graph LR
    subgraph "Metrics Collection"
        LB[Load Balancer]
        LB --> M1[Request Rate]
        LB --> M2[Error Rate]
        LB --> M3[Latency p95]
        LB --> M4[Active Connections]
    end
    
    subgraph "Monitoring Stack"
        M1 --> Prom[Prometheus]
        M2 --> Prom
        M3 --> Prom
        M4 --> Prom
        Prom --> Graf[Grafana Dashboard]
    end
    
    subgraph "Alerting"
        Graf --> Alert[Alert Manager]
        Alert --> Slack[Slack]
        Alert --> PD[PagerDuty]
    end
```

## Key Metrics to Monitor

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Request Rate | Requests per second | \u003e 10K/s |
| Error Rate | % of failed requests | \u003e 1% |
| Latency (p95) | 95th percentile response time | \u003e 100ms |
| Active Connections | Current open connections | \u003e 90% capacity |
| Backend Health | % of healthy servers | \u003c 70% |
| CPU Usage | Load balancer CPU | \u003e 80% |

## Algorithm Selection Guide

```mermaid
flowchart TD
    Start[Choose Algorithm] --> Q1{Equal Server<br/>Capacity?}
    Q1 -->|Yes| Q2{Need Session<br/>Persistence?}
    Q1 -->|No| Weighted[Weighted Round Robin]
    
    Q2 -->|Yes| IPHash[IP Hash]
    Q2 -->|No| Q3{Long-lived<br/>Connections?}
    
    Q3 -->|Yes| LeastConn[Least Connections]
    Q3 -->|No| RoundRobin[Round Robin]
```
