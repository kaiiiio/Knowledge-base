# Order Management System: Visual Diagrams

## 1. Order Management Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web/Mobile App]
        Admin[Admin Dashboard]
    end
    
    subgraph "API Gateway"
        Gateway[API Gateway<br/>Authentication<br/>Rate Limiting]
    end
    
    subgraph "Core Services"
        Order[Order Service]
        Inventory[Inventory Service]
        Payment[Payment Service]
        Fulfillment[Fulfillment Service]
        Notification[Notification Service]
    end
    
    subgraph "State Management"
        Workflow[Order Workflow<br/>State Machine]
    end
    
    subgraph "Message Queue"
        Queue[RabbitMQ/Kafka<br/>Event Bus]
    end
    
    subgraph "Databases"
        OrderDB[(PostgreSQL<br/>Orders & Transactions)]
        InventoryDB[(PostgreSQL<br/>Inventory)]
        Cache[(Redis<br/>Order Cache)]
    end
    
    Web --> Gateway
    Admin --> Gateway
    Gateway --> Order
    
    Order --> Workflow
    Order --> Inventory
    Order --> Payment
    
    Workflow --> Queue
    Queue --> Fulfillment
    Queue --> Notification
    
    Order --> OrderDB
    Inventory --> InventoryDB
    Order --> Cache
```

## 2. Order State Machine

```mermaid
stateDiagram-v2
    [*] --> Pending: Create Order
    
    Pending --> PaymentPending: Reserve Inventory
    PaymentPending --> Confirmed: Payment Success
    PaymentPending --> Cancelled: Payment Failed
    
    Confirmed --> Processing: Start Fulfillment
    Processing --> Packed: Items Packed
    Packed --> Shipped: Shipped
    Shipped --> InTransit: In Transit
    InTransit --> OutForDelivery: Out for Delivery
    OutForDelivery --> Delivered: Delivered
    
    Delivered --> [*]: Complete
    
    Confirmed --> Cancelled: Cancel Request
    Processing --> Cancelled: Cancel Request
    Cancelled --> [*]: Refund Processed
    
    Delivered --> ReturnRequested: Return Request
    ReturnRequested --> ReturnApproved: Approve Return
    ReturnRequested --> ReturnRejected: Reject Return
    ReturnApproved --> Refunded: Process Refund
    ReturnRejected --> Delivered: Keep Order
    Refunded --> [*]: Complete
```

## 3. Order Creation Flow

```mermaid
sequenceDiagram
    participant User
    participant OrderSvc as Order Service
    participant InvSvc as Inventory Service
    participant PaySvc as Payment Service
    participant Queue as Message Queue
    participant NotifSvc as Notification Service
    
    User->>OrderSvc: Create Order
    OrderSvc->>OrderSvc: Generate Order Number
    OrderSvc->>InvSvc: Reserve Inventory
    
    alt Inventory Available
        InvSvc-->>OrderSvc: Reserved (15 min timeout)
        OrderSvc->>OrderSvc: Create Order (Status: Pending)
        OrderSvc->>PaySvc: Process Payment
        
        alt Payment Success
            PaySvc-->>OrderSvc: Payment Confirmed
            OrderSvc->>OrderSvc: Update Status: Confirmed
            OrderSvc->>Queue: Publish OrderConfirmed Event
            Queue->>NotifSvc: Send Confirmation Email
            NotifSvc->>User: Email + SMS
            OrderSvc-->>User: Order Created Successfully
        else Payment Failed
            PaySvc-->>OrderSvc: Payment Failed
            OrderSvc->>InvSvc: Release Inventory
            OrderSvc->>OrderSvc: Update Status: Cancelled
            OrderSvc-->>User: Payment Error
        end
    else Out of Stock
        InvSvc-->>OrderSvc: Insufficient Stock
        OrderSvc-->>User: Out of Stock Error
    end
```

## 4. Inventory Reservation with Timeout

```mermaid
graph TB
    subgraph "Reservation Process"
        Start[Order Created]
        Start --> Reserve[Reserve Inventory<br/>Timeout: 15 min]
        Reserve --> Timer[Start Expiry Timer]
    end
    
    subgraph "Payment Process"
        Timer --> Payment{Payment<br/>Completed?}
    end
    
    subgraph "Outcomes"
        Payment -->|Yes, within 15 min| Confirm[Confirm Reservation<br/>Deduct Stock]
        Payment -->|No, timeout| Release[Release Reservation<br/>Return Stock]
        Payment -->|No, cancelled| Cancel[Cancel Order<br/>Return Stock]
    end
    
    subgraph "Background Job"
        Cron[Cron Job<br/>Every 1 min]
        Cron --> Check[Check Expired<br/>Reservations]
        Check --> Release
    end
```

## 5. Order Fulfillment Workflow

```mermaid
flowchart TD
    Start[Order Confirmed] --> Assign[Assign to Warehouse]
    Assign --> Pick[Create Pick List]
    Pick --> Picker[Assign to Picker]
    
    Picker --> Scan1[Scan Items]
    Scan1 --> Verify{All Items<br/>Scanned?}
    Verify -->|No| Scan1
    Verify -->|Yes| Pack[Pack Items]
    
    Pack --> Weight[Weigh Package]
    Weight --> Label[Generate Shipping Label]
    Label --> Ship[Hand to Carrier]
    
    Ship --> Track[Update Tracking Info]
    Track --> Notify[Notify Customer]
```

## 6. Multi-Warehouse Order Splitting

```mermaid
graph TB
    subgraph "Order Items"
        Order[Order: 3 Items]
        Item1[Item A - Qty: 2]
        Item2[Item B - Qty: 1]
        Item3[Item C - Qty: 1]
    end
    
    subgraph "Warehouse Inventory"
        WH1[Warehouse 1<br/>Item A: 1<br/>Item B: 5]
        WH2[Warehouse 2<br/>Item A: 10<br/>Item C: 3]
    end
    
    subgraph "Shipments"
        Ship1[Shipment 1<br/>From WH1<br/>Item A: 1<br/>Item B: 1]
        Ship2[Shipment 2<br/>From WH2<br/>Item A: 1<br/>Item C: 1]
    end
    
    Order --> Item1
    Order --> Item2
    Order --> Item3
    
    Item1 --> WH1
    Item1 --> WH2
    Item2 --> WH1
    Item3 --> WH2
    
    WH1 --> Ship1
    WH2 --> Ship2
```

## 7. Order Cancellation Flow

```mermaid
sequenceDiagram
    participant User
    participant OrderSvc
    participant StateMachine
    participant InvSvc
    participant PaySvc
    participant NotifSvc
    
    User->>OrderSvc: Request Cancellation
    OrderSvc->>StateMachine: Check if cancellable
    
    alt Can Cancel
        StateMachine-->>OrderSvc: Allowed
        OrderSvc->>InvSvc: Release Inventory
        InvSvc-->>OrderSvc: Released
        OrderSvc->>PaySvc: Initiate Refund
        PaySvc-->>OrderSvc: Refund Processed
        OrderSvc->>OrderSvc: Update Status: Cancelled
        OrderSvc->>NotifSvc: Send Cancellation Email
        NotifSvc->>User: Confirmation Email
        OrderSvc-->>User: Cancellation Successful
    else Cannot Cancel
        StateMachine-->>OrderSvc: Not Allowed (Already Shipped)
        OrderSvc-->>User: Cannot Cancel - Already Shipped
    end
```

## 8. Return and Refund Process

```mermaid
stateDiagram-v2
    [*] --> Delivered: Order Delivered
    Delivered --> ReturnRequested: Customer Requests Return
    
    ReturnRequested --> UnderReview: Admin Reviews
    UnderReview --> ReturnApproved: Approved
    UnderReview --> ReturnRejected: Rejected
    
    ReturnApproved --> ReturnShipped: Customer Ships Back
    ReturnShipped --> ReturnReceived: Warehouse Receives
    ReturnReceived --> QualityCheck: Inspect Items
    
    QualityCheck --> RefundApproved: Items OK
    QualityCheck --> RefundRejected: Items Damaged
    
    RefundApproved --> RefundProcessed: Process Refund
    RefundProcessed --> [*]: Complete
    
    RefundRejected --> [*]: No Refund
    ReturnRejected --> [*]: No Return
```

## 9. Order State Transitions Audit

```mermaid
erDiagram
    ORDERS ||--o{ ORDER_STATE_TRANSITIONS : has
    ORDERS {
        bigint id PK
        string order_number UK
        string status
        timestamp created_at
    }
    
    ORDER_STATE_TRANSITIONS {
        bigint id PK
        bigint order_id FK
        string from_state
        string to_state
        string reason
        jsonb metadata
        bigint created_by
        timestamp created_at
    }
```

## 10. Order Monitoring Dashboard

```mermaid
graph TB
    subgraph "Real-time Metrics"
        M1[Orders/Hour<br/>Current: 450]
        M2[Average Order Value<br/>$85.50]
        M3[Fulfillment Rate<br/>98.5%]
        M4[Cancellation Rate<br/>2.1%]
    end
    
    subgraph "Order Status Distribution"
        S1[Pending: 45]
        S2[Confirmed: 120]
        S3[Processing: 85]
        S4[Shipped: 200]
        S5[Delivered: 1500]
    end
    
    subgraph "Alerts"
        A1[High Cancellation Rate]
        A2[Low Inventory Alert]
        A3[Payment Gateway Down]
    end
    
    M1 --> Dashboard[Grafana Dashboard]
    M2 --> Dashboard
    M3 --> Dashboard
    M4 --> Dashboard
    
    S1 --> Dashboard
    S2 --> Dashboard
    S3 --> Dashboard
    S4 --> Dashboard
    S5 --> Dashboard
    
    Dashboard --> A1
    Dashboard --> A2
    Dashboard --> A3
```

## Key Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Order Creation Time | \u003c 500ms | 300ms | ✅ |
| Payment Processing | \u003c 3s | 2.1s | ✅ |
| Fulfillment Time | \u003c 24h | 18h | ✅ |
| Order Accuracy | \u003e 99% | 99.2% | ✅ |
| Cancellation Rate | \u003c 5% | 2.1% | ✅ |
| Return Rate | \u003c 10% | 7.5% | ✅ |

## State Transition Rules

```mermaid
flowchart TD
    Check{Current State?} --> Pending
    Check --> Confirmed
    Check --> Processing
    Check --> Shipped
    
    Pending -->|Can Cancel| Yes1[✓ Allow]
    Confirmed -->|Can Cancel| Yes2[✓ Allow]
    Processing -->|Can Cancel| Maybe[⚠ Check Packing Status]
    Shipped -->|Can Cancel| No[✗ Deny - Use Return]
    
    Maybe -->|Not Packed| Yes3[✓ Allow]
    Maybe -->|Already Packed| No
```
