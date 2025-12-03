# Flash Sale Disaster: Complete System Design

## Problem Statement

**Context**: E-commerce startup running "Black Friday" flash sale. 100 units of Playstation 5. At 10:00 AM, 5,000 users click "Buy Now" simultaneously.

**The Bug**: Database shows inventory: 0, but payment gateway charged 142 users. Sold 42 items that don't exist.

**Task**: Write `purchase_item(item_id)` endpoint that:
- Decrements inventory count
- Returns True (Success) or False (Out of Stock)
- **Strict Constraint**: Must never oversell (Consistency > Availability)
- **Performance**: Cannot lock entire table (other items must be purchasable)

---

## Solution Architecture

```
5,000 Users → API Gateway → Servers → Redis (Distributed Lock) → Database (Row Lock) → Payment Gateway
```

**Key Components**:
1. **Distributed Lock (Redis)**: Prevents concurrent purchases of same item
2. **Database Row Lock**: Atomic inventory decrement
3. **Optimistic Locking**: Version-based concurrency control
4. **Two-Phase Commit**: Reserve → Charge → Confirm

---

## Solution 1: Redis Distributed Lock + Database Row Lock (Recommended)

### Implementation

```javascript
const redis = require('redis');
const { Pool } = require('pg');
const client = redis.createClient();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function purchaseItem(itemId, userId) {
    const lockKey = `purchase:${itemId}`;
    const lockTimeout = 5000; // 5 seconds
    const lockValue = `${Date.now()}-${Math.random()}`;
    
    // Acquire distributed lock (prevents concurrent purchases)
    const lockAcquired = await client.set(
        lockKey,
        lockValue,
        'PX', lockTimeout, // Expire in 5 seconds
        'NX' // Only if not exists
    );
    
    if (!lockAcquired) {
        return { success: false, reason: 'Item currently being purchased' };
    }
    
    try {
        // Start database transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Select with row lock (FOR UPDATE)
            const result = await client.query(
                `SELECT id, inventory, version 
                 FROM items 
                 WHERE id = $1 
                 FOR UPDATE NOWAIT`, // Fail immediately if locked
                [itemId]
            );
            
            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return { success: false, reason: 'Item not found' };
            }
            
            const item = result.rows[0];
            
            // Check inventory
            if (item.inventory <= 0) {
                await client.query('ROLLBACK');
                return { success: false, reason: 'Out of stock' };
            }
            
            // Decrement inventory atomically
            const updateResult = await client.query(
                `UPDATE items 
                 SET inventory = inventory - 1,
                     version = version + 1
                 WHERE id = $1 
                   AND inventory > 0
                   AND version = $2
                 RETURNING inventory`,
                [itemId, item.version]
            );
            
            if (updateResult.rowCount === 0) {
                // Inventory was decremented by another request
                await client.query('ROLLBACK');
                return { success: false, reason: 'Out of stock' };
            }
            
            // Create order record (reserved state)
            const orderResult = await client.query(
                `INSERT INTO orders (user_id, item_id, status, created_at)
                 VALUES ($1, $2, 'reserved', NOW())
                 RETURNING id`,
                [userId, itemId]
            );
            
            const orderId = orderResult.rows[0].id;
            
            await client.query('COMMIT');
            
            // Charge payment (outside transaction)
            try {
                const payment = await chargePayment(userId, itemId, orderId);
                
                if (payment.success) {
                    // Update order to confirmed
                    await pool.query(
                        `UPDATE orders SET status = 'confirmed' WHERE id = $1`,
                        [orderId]
                    );
                    
                    return { success: true, orderId, inventory: updateResult.rows[0].inventory };
                } else {
                    // Payment failed, restore inventory
                    await restoreInventory(itemId, orderId);
                    return { success: false, reason: 'Payment failed' };
                }
            } catch (paymentError) {
                // Payment error, restore inventory
                await restoreInventory(itemId, orderId);
                throw paymentError;
            }
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } finally {
        // Release distributed lock
        const currentLock = await client.get(lockKey);
        if (currentLock === lockValue) {
            await client.del(lockKey);
        }
    }
}

async function restoreInventory(itemId, orderId) {
    await pool.query(
        `UPDATE items SET inventory = inventory + 1 WHERE id = $1`,
        [itemId]
    );
    await pool.query(
        `UPDATE orders SET status = 'cancelled' WHERE id = $1`,
        [orderId]
    );
}

async function chargePayment(userId, itemId, orderId) {
    // Call payment gateway
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    try {
        const charge = await stripe.charges.create({
            amount: 50000, // $500
            currency: 'usd',
            customer: userId,
            metadata: { orderId, itemId }
        });
        
        return { success: true, chargeId: charge.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

---

## Solution 2: Optimistic Locking with Version

### Implementation

```javascript
async function purchaseItemOptimistic(itemId, userId) {
    const maxRetries = 3;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        // Get current item state
        const item = await pool.query(
            `SELECT id, inventory, version FROM items WHERE id = $1`,
            [itemId]
        );
        
        if (item.rows.length === 0) {
            return { success: false, reason: 'Item not found' };
        }
        
        const currentItem = item.rows[0];
        
        if (currentItem.inventory <= 0) {
            return { success: false, reason: 'Out of stock' };
        }
        
        // Try to update with version check
        const updateResult = await pool.query(
            `UPDATE items 
             SET inventory = inventory - 1,
                 version = version + 1
             WHERE id = $1 
               AND inventory > 0
               AND version = $2
             RETURNING inventory, version`,
            [itemId, currentItem.version]
        );
        
        if (updateResult.rowCount === 0) {
            // Version mismatch, retry
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
                continue;
            }
            return { success: false, reason: 'Concurrent modification, please retry' };
        }
        
        // Successfully decremented
        const orderId = await createOrder(userId, itemId);
        const payment = await chargePayment(userId, itemId, orderId);
        
        if (payment.success) {
            return { success: true, orderId, inventory: updateResult.rows[0].inventory };
        } else {
            // Restore inventory
            await pool.query(
                `UPDATE items SET inventory = inventory + 1, version = version - 1 WHERE id = $1`,
                [itemId]
            );
            return { success: false, reason: 'Payment failed' };
        }
    }
}
```

---

## Solution 3: Database-Level Atomic Decrement

### Implementation

```javascript
async function purchaseItemAtomic(itemId, userId) {
    // Use database atomic operation
    const result = await pool.query(
        `UPDATE items 
         SET inventory = inventory - 1
         WHERE id = $1 
           AND inventory > 0
         RETURNING inventory`,
        [itemId]
    );
    
    if (result.rowCount === 0) {
        return { success: false, reason: 'Out of stock' };
    }
    
    // Create order
    const orderResult = await pool.query(
        `INSERT INTO orders (user_id, item_id, status)
         VALUES ($1, $2, 'reserved')
         RETURNING id`,
        [userId, itemId]
    );
    
    const orderId = orderResult.rows[0].id;
    
    // Charge payment
    const payment = await chargePayment(userId, itemId, orderId);
    
    if (payment.success) {
        await pool.query(
            `UPDATE orders SET status = 'confirmed' WHERE id = $1`,
            [orderId]
        );
        return { success: true, orderId, inventory: result.rows[0].inventory };
    } else {
        // Restore inventory
        await pool.query(
            `UPDATE items SET inventory = inventory + 1 WHERE id = $1`,
            [itemId]
        );
        await pool.query(
            `UPDATE orders SET status = 'cancelled' WHERE id = $1`,
            [orderId]
        );
        return { success: false, reason: 'Payment failed' };
    }
}
```

---

## Express.js Endpoint

```javascript
app.post('/purchase/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const userId = req.user.id; // From auth middleware
    
    try {
        const result = await purchaseItem(itemId, userId);
        
        if (result.success) {
            res.json({
                success: true,
                orderId: result.orderId,
                remainingInventory: result.inventory
            });
        } else {
            res.status(400).json({
                success: false,
                reason: result.reason
            });
        }
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({
            success: false,
            reason: 'Internal server error'
        });
    }
});
```

---

## Why This Works

**Distributed Lock (Redis)**:
- Prevents concurrent purchases of same item
- Fast (in-memory)
- Expires automatically (prevents deadlock)

**Database Row Lock**:
- `FOR UPDATE` locks specific row
- Other items remain purchasable
- Atomic decrement operation

**Two-Phase Commit**:
- Phase 1: Reserve inventory (database)
- Phase 2: Charge payment (external)
- Rollback if payment fails

---

## Challenges & Edge Cases

### Challenge 1: Race Condition

**Scenario**: Two requests arrive simultaneously.

**Solution**: Distributed lock + row lock ensures only one succeeds.

### Challenge 2: Payment Failure After Inventory Decrement

**Scenario**: Inventory decremented but payment fails.

**Solution**: Restore inventory in catch block.

### Challenge 3: Server Crash After Decrement

**Scenario**: Server crashes before payment.

**Solution**: Reconciliation job checks reserved orders, restores inventory.

---

## Best Solution

**Redis Distributed Lock + Database Row Lock + Two-Phase Commit**:
- ✅ Never oversells (atomic operations)
- ✅ Fast (Redis lock, row-level lock)
- ✅ Other items remain purchasable
- ✅ Handles payment failures
- ✅ Production-ready

---

## Performance Considerations

**Throughput**:
- Redis lock: < 1ms
- Database row lock: < 10ms
- Payment gateway: 100-500ms
- Total: ~200ms per purchase

**Scalability**:
- Horizontal scaling (multiple servers)
- Redis cluster for high availability
- Database connection pooling
- Handles 5,000+ concurrent requests

