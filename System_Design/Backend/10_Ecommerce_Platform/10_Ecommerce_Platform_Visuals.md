# E-commerce Platform: Visual Diagrams

## 1. Microservices Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web App<br/>React/Next.js]
        Mobile[Mobile App<br/>React Native]
        Admin[Admin Dashboard]
    end
    
    subgraph "API Gateway Layer"
        Gateway[API Gateway<br/>Rate Limiting<br/>Authentication<br/>Routing]
    end
    
    subgraph "Microservices"
        User[User Service<br/>Port: 3001]
        Product[Product Service<br/>Port: 3002]
        Cart[Cart Service<br/>Port: 3003]
        Order[Order Service<br/>Port: 3004]
        Payment[Payment Service<br/>Port: 3005]
        Inventory[Inventory Service<br/>Port: 3006]
        Notification[Notification Service<br/>Port: 3007]
    end
    
    subgraph "Message Queue"
        Kafka[Kafka<br/>Event Bus]
    end
    
    subgraph "Databases"
        UserDB[(PostgreSQL<br/>Users)]
        ProductDB[(MongoDB<br/>Products)]
        OrderDB[(PostgreSQL<br/>Orders)]
        CartCache[(Redis<br/>Cart)]
    end
    
    subgraph "External Services"
        Stripe[Stripe<br/>Payment Gateway]
        Email[SendGrid<br/>Email]
        SMS[Twilio<br/>SMS]
    end
    
    Web --> Gateway
    Mobile --> Gateway
    Admin --> Gateway
    
    Gateway --> User
    Gateway --> Product
    Gateway --> Cart
    Gateway --> Order
    Gateway --> Payment
    
    User --> UserDB
    Product --> ProductDB
    Cart --> CartCache
    Order --> OrderDB
    
    Order --> Kafka
    Payment --> Kafka
    Kafka --> Notification
    Kafka --> Inventory
    
    Payment --> Stripe
    Notification --> Email
    Notification --> SMS
```

## 2. Order Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant Cart
    participant Order
    participant Inventory
    participant Payment
    participant Notification
    
    User->>Cart: Add items to cart
    Cart->>Cart: Store in Redis
    
    User->>Order: Checkout
    Order->>Inventory: Reserve inventory
    
    alt Inventory Available
        Inventory-->>Order: Reserved
        Order->>Payment: Process payment
        
        alt Payment Success
            Payment-->>Order: Payment confirmed
            Order->>Order: Create order
            Order->>Notification: Send confirmation
            Notification->>User: Email + SMS
        else Payment Failed
            Payment-->>Order: Payment failed
            Order->>Inventory: Release inventory
            Order-->>User: Payment error
        end
    else Out of Stock
        Inventory-->>Order: Not available
        Order-->>User: Out of stock error
    end
```

## 3. Shopping Cart Architecture

```mermaid
graph LR
    subgraph "Cart Service"
        API[Cart API]
    end
    
    subgraph "Redis Cache"
        Cache[(Redis<br/>TTL: 7 days)]
        Cache --> C1[cart:user123<br/>items: [...]]
        Cache --> C2[cart:user456<br/>items: [...]]
    end
    
    subgraph "Operations"
        Add[Add Item]
        Remove[Remove Item]
        Update[Update Quantity]
        Clear[Clear Cart]
    end
    
    API --> Cache
    Add --> API
    Remove --> API
    Update --> API
    Clear --> API
```

## 4. Product Search Architecture

```mermaid
graph TB
    subgraph "Search Flow"
        User[User Search Query]
        API[Product API]
    end
    
    subgraph "Search Engine"
        ES[(Elasticsearch)]
        ES --> Index1[products-catalog]
        ES --> Index2[products-reviews]
    end
    
    subgraph "Filters"
        F1[Category Filter]
        F2[Price Range]
        F3[Rating Filter]
        F4[Brand Filter]
    end
    
    subgraph "Results"
        Sort[Sort by:<br/>Relevance/Price/Rating]
        Page[Pagination]
    end
    
    User --> API
    API --> ES
    F1 --> ES
    F2 --> ES
    F3 --> ES
    F4 --> ES
    ES --> Sort
    Sort --> Page
    Page --> User
```

## 5. Payment Processing Flow

```mermaid
stateDiagram-v2
    [*] --> Initiated: User clicks Pay
    Initiated --> Processing: Send to Stripe
    Processing --> Authorized: Card authorized
    Authorized --> Captured: Capture payment
    Captured --> Completed: Payment success
    Completed --> [*]
    
    Processing --> Failed: Authorization failed
    Authorized --> Failed: Capture failed
    Failed --> Retry: Retry payment
    Retry --> Processing
    Failed --> [*]: Max retries reached
```

## 6. Inventory Management

```mermaid
graph TB
    subgraph "Inventory Operations"
        Reserve[Reserve Stock]
        Release[Release Stock]
        Deduct[Deduct Stock]
    end
    
    subgraph "Database"
        DB[(PostgreSQL)]
        DB --> Lock[Row-level Lock<br/>FOR UPDATE]
    end
    
    subgraph "Validation"
        Check{Stock >= Quantity?}
    end
    
    Reserve --> Lock
    Lock --> Check
    Check -->|Yes| Update[Update quantity<br/>reserved += qty]
    Check -->|No| Error[Insufficient stock]
    
    Deduct --> Lock
    Lock --> Final[quantity -= qty<br/>reserved -= qty]
```

## 7. Recommendation Engine Integration

```mermaid
graph LR
    subgraph "User Activity"
        Browse[Browse Products]
        View[View Details]
        AddCart[Add to Cart]
        Purchase[Purchase]
    end
    
    subgraph "Event Collection"
        Kafka[Kafka Events]
    end
    
    subgraph "ML Pipeline"
        Batch[Batch Processing<br/>Spark]
        Model[Recommendation Model]
    end
    
    subgraph "Serving"
        Cache[(Redis<br/>Pre-computed Recs)]
        API[Recommendation API]
    end
    
    Browse --> Kafka
    View --> Kafka
    AddCart --> Kafka
    Purchase --> Kafka
    
    Kafka --> Batch
    Batch --> Model
    Model --> Cache
    Cache --> API
    API --> User[User sees recommendations]
```

## 8. Order Status Tracking

```mermaid
stateDiagram-v2
    [*] --> Pending: Order Created
    Pending --> PaymentPending: Inventory Reserved
    PaymentPending --> Confirmed: Payment Success
    PaymentPending --> Cancelled: Payment Failed
    
    Confirmed --> Processing: Start Fulfillment
    Processing --> Packed: Items Packed
    Packed --> Shipped: Shipped
    Shipped --> InTransit: In Transit
    InTransit --> OutForDelivery: Out for Delivery
    OutForDelivery --> Delivered: Delivered
    Delivered --> [*]
    
    Confirmed --> Cancelled: User Cancels
    Processing --> Cancelled: User Cancels
    
    Delivered --> ReturnRequested: Return Request
    ReturnRequested --> ReturnApproved: Approved
    ReturnApproved --> Refunded: Refund Processed
    Refunded --> [*]
```

## 9. Database Sharding Strategy

```mermaid
graph TB
    subgraph "Application"
        App[E-commerce App]
    end
    
    subgraph "Shard Router"
        Router[Shard Router<br/>Hash user_id % 4]
    end
    
    subgraph "Database Shards"
        Shard0[(Shard 0<br/>user_id % 4 = 0)]
        Shard1[(Shard 1<br/>user_id % 4 = 1)]
        Shard2[(Shard 2<br/>user_id % 4 = 2)]
        Shard3[(Shard 3<br/>user_id % 4 = 3)]
    end
    
    App --> Router
    Router --> Shard0
    Router --> Shard1
    Router --> Shard2
    Router --> Shard3
```

## 10. Monitoring Dashboard

```mermaid
graph TB
    subgraph "Metrics"
        M1[Orders/min]
        M2[Revenue/hour]
        M3[Cart Abandonment Rate]
        M4[Conversion Rate]
        M5[API Latency]
        M6[Error Rate]
    end
    
    subgraph "Collection"
        Prom[Prometheus]
    end
    
    subgraph "Visualization"
        Graf[Grafana]
    end
    
    subgraph "Alerts"
        Alert[Alert Manager]
        Slack[Slack]
    end
    
    M1 --> Prom
    M2 --> Prom
    M3 --> Prom
    M4 --> Prom
    M5 --> Prom
    M6 --> Prom
    
    Prom --> Graf
    Prom --> Alert
    Alert --> Slack
```

## Key Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Product Search | \u003c 200ms | 150ms |
| Add to Cart | \u003c 100ms | 50ms |
| Checkout | \u003c 2s | 1.5s |
| Order Confirmation | \u003c 3s | 2s |
| Payment Processing | \u003c 5s | 3s |
| Cart Abandonment | \u003c 70% | 65% |
| Conversion Rate | \u003e 2% | 2.5% |

## Scalability Patterns

```mermaid
flowchart TD
    Start[Traffic Increase] --> Cache{Use Caching?}
    Cache -->|Yes| Redis[Redis for<br/>Cart & Sessions]
    Cache -->|No| DB[Direct DB Access]
    
    Redis --> CDN{Static Assets?}
    CDN -->|Yes| CloudFront[CloudFront CDN]
    CDN -->|No| Server[App Servers]
    
    CloudFront --> Scale{Need More<br/>Capacity?}
    Server --> Scale
    
    Scale -->|Yes| Horizontal[Horizontal Scaling<br/>Add More Servers]
    Scale -->|No| Monitor[Monitor & Optimize]
    
    Horizontal --> LB[Load Balancer]
    LB --> AutoScale[Auto-scaling Group]
```
