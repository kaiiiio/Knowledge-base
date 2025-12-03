# Idempotent Payment System: Complete System Design

## Problem Statement

**Context**: Integrating Payment Gateway (Stripe/PayPal) for ride-sharing app. User clicks "Pay $50" → Connection drops → Clicks again → Charged $100.

**Bug**: Two POST requests, 200ms apart. User charged twice.

**Task**: Implement Idempotent Payment System with Exactly-Once Processing guarantee.

**Constraints**:
- Network partitions: Stripe charged but DB crashed
- Race conditions: Two requests at same millisecond on different servers

---

## Solution Architecture

```
Client → API Gateway → Servers → Redis (Idempotency) → Stripe → Database
```

**Key Components**:
1. **Idempotency Key**: Client generates UUID, sends in header
2. **Redis Cache**: Fast lookup for processed requests
3. **Distributed Lock**: Prevents concurrent processing
4. **Database Transaction**: Ensures atomicity
5. **Reconciliation Job**: Handles partial failures

---

## Implementation

### 1. Client-Side: Generate Idempotency Key

```javascript
// Mobile App
import { v4 as uuidv4 } from 'uuid';

async function makePayment(amount, userId) {
    let idempotencyKey = await AsyncStorage.getItem('payment_key');
    if (!idempotencyKey) {
        idempotencyKey = uuidv4();
        await AsyncStorage.setItem('payment_key', idempotencyKey);
    }
    
    const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
            'Idempotency-Key': idempotencyKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, userId })
    });
    
    if (response.ok) {
        await AsyncStorage.removeItem('payment_key');
    }
    
    return response.json();
}
```

### 2. Server-Side: Payment Endpoint

```javascript
router.post('/payments', async (req, res) => {
    const idempotencyKey = req.headers['idempotency-key'];
    const { amount, userId, orderId } = req.body;
    
    if (!idempotencyKey) {
        return res.status(400).json({ error: 'Idempotency-Key required' });
    }
    
    // Check Redis cache
    const cached = await redis.get(`idempotency:${idempotencyKey}`);
    if (cached) {
        return res.json(JSON.parse(cached));
    }
    
    // Acquire distributed lock
    const lockKey = `lock:${idempotencyKey}`;
    const locked = await redis.set(lockKey, '1', 'EX', 30, 'NX');
    
    if (!locked) {
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 100));
        const cached = await redis.get(`idempotency:${idempotencyKey}`);
        return res.json(JSON.parse(cached));
    }
    
    try {
        // Check database
        const existing = await Payment.findOne({ where: { idempotencyKey } });
        if (existing) {
            await redis.setex(`idempotency:${idempotencyKey}`, 86400, JSON.stringify(existing));
            await redis.del(lockKey);
            return res.json(existing);
        }
        
        // Charge Stripe
        const stripePayment = await stripe.charges.create({
            amount: amount * 100,
            currency: 'usd',
            customer: userId
        }, { idempotencyKey });
        
        // Save to database (transaction)
        const payment = await db.transaction(async (trx) => {
            const p = await Payment.create({
                id: stripePayment.id,
                idempotencyKey,
                userId,
                amount,
                status: 'completed'
            }, { transaction: trx });
            
            await Order.update(
                { status: 'paid', paymentId: stripePayment.id },
                { where: { id: orderId }, transaction: trx }
            );
            
            return p;
        });
        
        // Cache result
        await redis.setex(`idempotency:${idempotencyKey}`, 86400, JSON.stringify(payment));
        await redis.del(lockKey);
        
        res.json(payment);
        
    } catch (error) {
        await redis.del(lockKey);
        throw error;
    }
});
```

### 3. Reconciliation Job

```javascript
// Handles: Stripe charged but DB crashed
async function reconcilePayments() {
    const stuckPayments = await Payment.findAll({
        where: {
            status: 'processing',
            createdAt: { [Op.lt]: new Date(Date.now() - 5 * 60 * 1000) }
        }
    });
    
    for (const payment of stuckPayments) {
        const stripePayment = await stripe.charges.retrieve(payment.stripeChargeId);
        
        if (stripePayment.status === 'succeeded') {
            await Payment.update({ status: 'completed' }, { where: { id: payment.id } });
            await Order.update({ status: 'paid' }, { where: { paymentId: payment.id } });
        }
    }
}

// Run every minute
cron.schedule('* * * * *', reconcilePayments);
```

---

## Why This Works

**Idempotency Key**:
- Client generates unique key per payment attempt
- Server checks Redis before processing
- If exists: Return cached result
- If not: Process and cache

**Distributed Lock**:
- Prevents concurrent processing
- Redis SET with NX (only if not exists)
- Expires after timeout

**Reconciliation**:
- Handles partial failures
- Checks Stripe, updates database
- Ensures consistency

---

## Visual Flow

```
Request → Check Redis → Exists? → Return cached
                │
                └─→ Not exists → Acquire lock → Check DB → Exists? → Return
                                                      │
                                                      └─→ Not exists → Charge Stripe → Save DB → Cache → Return
```

---

## Best Solution

**Idempotency Key Pattern with Redis + Database**:
- ✅ Exactly-once processing
- ✅ Handles network partitions
- ✅ Prevents race conditions
- ✅ Scales horizontally
- ✅ Production-ready
