# Flash Sale Disaster: Visual Diagrams

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              5,000 Users                                  │
│  (Click "Buy Now" simultaneously)                        │
└──────────────┬──────────────────────────────────────────┘
               │
               │ POST /purchase/:itemId
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
│ (Lock   │ │ (Lock    │ │ (Lock   │
│  Redis) │ │  Redis)   │ │  Redis) │
└────┬────┘ └────┬────┘ └────┬────┘
     │           │           │
     └───────────┼───────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│          Redis (Distributed Lock)                        │
│  Key: "purchase:item_123"                               │
│  Value: Lock token                                       │
│  TTL: 5 seconds                                          │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│          PostgreSQL Database                              │
│  Row Lock: SELECT ... FOR UPDATE                         │
│  Atomic: UPDATE ... WHERE inventory > 0                 │
└──────────────┬──────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│          Payment Gateway (Stripe)                         │
│  (Charge user)                                            │
└─────────────────────────────────────────────────────────┘
```

## Request Flow Diagram

```
User Request
    │
    ├─→ Acquire Redis Lock
    │       │
    │       ├─→ Lock acquired? → Continue
    │       │
    │       └─→ Lock failed? → Return "Currently being purchased"
    │
    ├─→ Start Database Transaction
    │
    ├─→ SELECT with Row Lock (FOR UPDATE)
    │       │
    │       ├─→ Item exists? → Continue
    │       │
    │       └─→ Not found? → Rollback, return error
    │
    ├─→ Check Inventory
    │       │
    │       ├─→ inventory > 0? → Continue
    │       │
    │       └─→ inventory = 0? → Rollback, return "Out of stock"
    │
    ├─→ Atomic Decrement Inventory
    │       │
    │       ├─→ Success? → Continue
    │       │
    │       └─→ Failed? → Rollback, return "Out of stock"
    │
    ├─→ Create Order (status: 'reserved')
    │
    ├─→ Commit Transaction
    │
    ├─→ Charge Payment Gateway
    │       │
    │       ├─→ Success? → Update order to 'confirmed'
    │       │
    │       └─→ Failed? → Restore inventory, cancel order
    │
    └─→ Release Redis Lock
```

## Concurrent Request Handling

```
Time →
T=0ms:  Request 1 arrives → Acquire lock ✅
        Request 2 arrives → Acquire lock ❌ (wait)
        Request 3 arrives → Acquire lock ❌ (wait)
        
T=10ms: Request 1: Check inventory → 100 units ✅
        Request 2: Still waiting...
        Request 3: Still waiting...
        
T=20ms: Request 1: Decrement → 99 units ✅
        Request 2: Still waiting...
        Request 3: Still waiting...
        
T=30ms: Request 1: Create order ✅
        Request 2: Still waiting...
        Request 3: Still waiting...
        
T=40ms: Request 1: Release lock ✅
        Request 2: Acquire lock ✅
        Request 3: Still waiting...
        
T=50ms: Request 2: Check inventory → 99 units ✅
        Request 3: Still waiting...
        
...and so on
```

## State Machine

```
┌─────────────┐
│  AVAILABLE  │ ← Initial state (inventory > 0)
└──────┬──────┘
       │
       ├─→ Purchase request
       │       │
       │       ▼
       │   ┌─────────────┐
       │   │  LOCKED     │ ← Redis lock acquired
       │   └──────┬──────┘
       │          │
       │          ├─→ Inventory decremented
       │          │       │
       │          │       ▼
       │          │   ┌─────────────┐
       │          │   │  RESERVED   │ ← Order created
       │          │   └──────┬──────┘
       │          │          │
       │          │          ├─→ Payment succeeds
       │          │          │       │
       │          │          │       ▼
       │          │          │   ┌─────────────┐
       │          │          │   │  CONFIRMED  │ ← Final state
       │          │          │   └─────────────┘
       │          │          │
       │          │          └─→ Payment fails
       │          │                  │
       │          │                  ▼
       │          │              ┌─────────────┐
       │          │              │  CANCELLED  │ ← Inventory restored
       │          │              └─────────────┘
       │          │
       │          └─→ Inventory = 0
       │                  │
       │                  ▼
       │              ┌─────────────┐
       │              │ OUT OF STOCK│ ← Final state
       │              └─────────────┘
       │
       └─→ No inventory
               │
               ▼
           ┌─────────────┐
           │ OUT OF STOCK│
           └─────────────┘
```

## Inventory Decrement Flow

```
Initial: inventory = 100

Request 1: SELECT inventory FROM items WHERE id = 123 FOR UPDATE
           → inventory = 100 ✅
           
Request 1: UPDATE items SET inventory = inventory - 1 WHERE id = 123 AND inventory > 0
           → inventory = 99 ✅
           
Request 2: SELECT inventory FROM items WHERE id = 123 FOR UPDATE
           → Waits for Request 1 to commit
           
Request 1: COMMIT
           
Request 2: SELECT inventory FROM items WHERE id = 123 FOR UPDATE
           → inventory = 99 ✅
           
Request 2: UPDATE items SET inventory = inventory - 1 WHERE id = 123 AND inventory > 0
           → inventory = 98 ✅
           
...and so on
```

## Error Handling Flow

```
Purchase Request
    │
    ├─→ Lock acquisition fails
    │       └─→ Return "Currently being purchased"
    │
    ├─→ Inventory check fails
    │       └─→ Return "Out of stock"
    │
    ├─→ Payment fails
    │       ├─→ Restore inventory
    │       ├─→ Cancel order
    │       └─→ Return "Payment failed"
    │
    └─→ Success
            ├─→ Confirm order
            └─→ Return success
```

