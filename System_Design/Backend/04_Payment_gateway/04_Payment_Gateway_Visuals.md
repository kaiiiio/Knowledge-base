# Payment Gateway System: Visual Diagrams

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Client (Mobile App)                        │
│  Generates: idempotency_key = uuid()                    │
└──────────────┬──────────────────────────────────────────┘
               │
               │ POST /payments
               │ Headers: { "Idempotency-Key": "abc-123" }
               ▼
┌─────────────────────────────────────────────────────────┐
│          API Gateway / Load Balancer                     │
└──────────────┬──────────────────────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Server 1│ │ Server 2 │ │ Server 3│
│ (Check  │ │ (Check   │ │ (Check  │
│  Redis) │ │  Redis)   │ │  Redis) │
└────┬────┘ └────┬────┘ └────┬────┘
     │           │           │
     └───────────┼───────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│          Redis Cluster (Idempotency Store)               │
│  Key: "idempotency:abc-123"                             │
│  Value: { status: "completed", paymentId: "pay_123" }  │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│          Payment Gateway (Stripe/PayPal)                 │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│          PostgreSQL Database                              │
│  (Payment records, order status)                          │
└─────────────────────────────────────────────────────────┘
```

## Request Flow Diagram

```
Client Request
    │
    ├─→ Check Redis (idempotency key)
    │       │
    │       ├─→ Exists? → Return cached result ✅
    │       │
    │       └─→ Not exists? → Continue
    │
    ├─→ Acquire Lock (Redis)
    │       │
    │       ├─→ Lock acquired? → Continue
    │       │
    │       └─→ Lock failed? → Wait & retry
    │
    ├─→ Check Database
    │       │
    │       ├─→ Exists? → Return existing payment ✅
    │       │
    │       └─→ Not exists? → Continue
    │
    ├─→ Charge Stripe (with idempotency key)
    │       │
    │       ├─→ Success? → Save to DB
    │       │
    │       └─→ Failed? → Cache error, return
    │
    ├─→ Save to Database (transaction)
    │       │
    │       ├─→ Payment record
    │       └─→ Update order status
    │
    ├─→ Cache Result (Redis)
    │
    └─→ Release Lock
```

## State Machine

```
┌─────────────┐
│  PENDING    │ ← Initial state
└──────┬──────┘
       │
       ├─→ Stripe charge succeeds
       │       │
       │       ▼
       │   ┌─────────────┐
       │   │ PROCESSING  │ ← Saving to DB
       │   └──────┬──────┘
       │          │
       │          ├─→ DB save succeeds
       │          │       │
       │          │       ▼
       │          │   ┌─────────────┐
       │          │   │  COMPLETED  │ ← Final state
       │          │   └─────────────┘
       │          │
       │          └─→ DB save fails
       │                  │
       │                  ▼
       │              ┌─────────────┐
       │              │ RECONCILE   │ ← Reconciliation job
       │              └──────┬──────┘
       │                     │
       │                     └─→ Check Stripe → Update DB
       │
       └─→ Stripe charge fails
               │
               ▼
           ┌─────────────┐
           │   FAILED    │ ← Final state
           └─────────────┘
```

## Concurrent Request Handling

```
Time →
T=0ms:  Request 1 arrives at Server 1
        Request 2 arrives at Server 2 (same idempotency key)
        
T=1ms:  Server 1: Check Redis → Not found
        Server 2: Check Redis → Not found
        
T=2ms:  Server 1: Acquire lock → Success ✅
        Server 2: Acquire lock → Failed (already exists)
        
T=3ms:  Server 1: Process payment
        Server 2: Wait 100ms
        
T=103ms: Server 1: Save to DB, cache result
         Server 2: Check Redis → Found ✅, return cached
```

