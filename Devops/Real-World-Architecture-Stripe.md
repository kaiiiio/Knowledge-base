# 💳 Stripe-Like Payment Architecture — Complete DevOps Implementation

> **Real-world example**: How Redis, BullMQ, RabbitMQ, Kafka, Docker work together in a global payment processing platform

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Technology Stack](#technology-stack)
4. [Step-by-Step Flows](#step-by-step-flows)
5. [Implementation Details](#implementation-details)
6. [Deployment & Monitoring](#deployment--monitoring)

---

## System Overview

### Core Features
- 💳 Payment processing (cards, wallets, bank transfers)
- 🔐 PCI-DSS compliant security
- 🌍 Multi-currency support
- 📊 Real-time fraud detection
- 💰 Subscription billing
- 🔔 Webhooks for events
- 📈 Analytics & reporting
- 🔄 Refunds & disputes

### Scale Requirements
- **Millions of merchants**
- **Billions of transactions/year**
- **99.999% uptime** (5 nines)
- **Sub-second response time**
- **PCI-DSS Level 1 compliance**
- **Multi-region deployment**

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│   Merchant Website | Mobile App | API Integration | Dashboard   │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS (TLS 1.3)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CDN (Cloudflare)                            │
│  - Static assets                                                │
│  - DDoS protection                                              │
│  - Rate limiting                                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (NGINX)                           │
│  - SSL Termination                                              │
│  - Request Routing                                              │
│  - API Key Validation                                           │
│  - Rate Limiting (per merchant)                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┬──────────────┐
              ↓              ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Payment API   │ │Webhook API   │ │Dashboard API │ │Billing API   │
│  (Node.js)   │ │  (Node.js)   │ │  (React)     │ │  (Python)    │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       └────────────────┼────────────────┼────────────────┘
                        │                │
         ┌──────────────┼────────────────┼──────────────┐
         ↓              ↓                ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Fraud Service │ │Token Service │ │Ledger Service│ │Payout Service│
│  (Python)    │ │  (Go)        │ │  (Java)      │ │  (Node.js)   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ PostgreSQL   │  MongoDB     │  Redis       │  Vault (Secrets)  │
│ - Payments   │  - Logs      │  - Cache     │  - Card tokens    │
│ - Customers  │  - Events    │  - Sessions  │  - API keys       │
│ - Ledger     │  - Webhooks  │  - Rate limit│  - Encryption keys│
└──────────────┴──────────────┴──────────────┴───────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      MESSAGE LAYER                              │
├──────────────┬──────────────┬──────────────────────────────────┤
│   BullMQ     │   RabbitMQ   │   Kafka                          │
│   (Redis)    │              │                                  │
│ - Webhooks   │ - Payment    │ - Transaction events             │
│ - Emails     │   processing │ - Audit logs                     │
│ - Reports    │ - Refunds    │ - Analytics stream               │
│ - Payouts    │ - Disputes   │ - Fraud detection                │
└──────┬───────┴──────┬───────┴──────┬───────────────────────────┘
       ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Worker Service│ │Payment Engine│ │Analytics Pipe│
│(Background)  │ │  (Orchestr.) │ │   (Spark)    │
└──────────────┘ └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                         │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│Card Networks │  Banks       │  Fraud Tools │  Compliance       │
│ - Visa       │ - ACH        │ - Sift       │ - KYC/AML         │
│ - Mastercard │ - SEPA       │ - Kount      │ - PCI-DSS         │
│ - Amex       │ - Wire       │ - Ravelin    │ - 3D Secure       │
└──────────────┴──────────────┴──────────────┴───────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  MONITORING & OBSERVABILITY                      │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ Prometheus   │   Grafana    │   ELK Stack  │   PagerDuty       │
│ - Metrics    │ - Dashboards │ - Logs       │ - Alerts          │
│ - Alerts     │ - SLO/SLI    │ - Search     │ - On-call         │
└──────────────┴──────────────┴──────────────┴───────────────────┘
```

---

## Technology Stack

### Frontend
- **Dashboard**: React + TypeScript
- **Checkout**: Vanilla JS (lightweight)
- **Mobile SDK**: React Native

### Backend Services
- **Payment API**: Node.js + Express (high throughput)
- **Fraud Detection**: Python + ML models
- **Token Service**: Go (high performance, secure)
- **Ledger Service**: Java (ACID transactions)
- **Webhook Service**: Node.js + Express

### Databases
- **PostgreSQL**: Payments, customers, ledger (ACID critical)
- **MongoDB**: Event logs, webhook logs, audit trail
- **Redis**: Cache, rate limiting, idempotency keys
- **Vault**: Card tokens, API keys, encryption keys

### Message Queues
- **BullMQ**: Webhooks, emails, reports, payouts
- **RabbitMQ**: Payment processing workflow
- **Kafka**: Event streaming, analytics, fraud detection

### Infrastructure
- **Docker**: Containerization
- **Kubernetes**: Multi-region orchestration
- **NGINX**: API gateway, load balancing
- **Cloudflare**: CDN, DDoS protection

### Security
- **Vault**: Secret management
- **KMS**: Encryption key management
- **WAF**: Web application firewall
- **3D Secure**: Card authentication

### Monitoring
- **Prometheus**: Metrics
- **Grafana**: Dashboards
- **ELK Stack**: Logs
- **Jaeger**: Distributed tracing
- **PagerDuty**: Incident management

---

## Step-by-Step Flows

### Flow 1: Credit Card Payment Processing 💳

```
1. Customer enters card details on merchant website
   ↓
2. Frontend → Stripe.js (client-side)
   Tokenize card (never touches merchant server)
   ↓
3. Stripe.js → Token Service
   POST /v1/tokens
   Body: { card: { number, exp, cvc } }
   ↓
4. Token Service → Vault
   Encrypt card details
   Generate token: tok_abc123
   ↓
5. Return token to frontend
   { id: "tok_abc123", card: { last4: "4242" } }
   ↓
6. Frontend → Merchant Server
   POST /checkout
   Body: { token: "tok_abc123", amount: 5000 }
   ↓
7. Merchant Server → Stripe Payment API
   POST /v1/charges
   Headers: { Authorization: "Bearer sk_live_..." }
   Body: {
     amount: 5000,
     currency: "usd",
     source: "tok_abc123",
     description: "Order #123"
   }
   ↓
8. Payment API → Redis
   Check idempotency key
   SET idempotency:abc123 "processing" EX 300 NX
   ↓
9. Payment API → RabbitMQ
   Publish: "payment_initiated"
   Exchange: "payments" (topic)
   Routing Key: "payment.charge.initiated"
   ↓
10. Payment Engine (Consumer)
    - Validate merchant account
    - Check fraud score
    - Verify funds availability
    ↓
11. Payment Engine → Fraud Service
    POST /v1/fraud/check
    Body: { amount, card_token, customer_ip, merchant_id }
    ↓
12. Fraud Service → ML Model
    - Check velocity (transactions per hour)
    - Check geolocation mismatch
    - Check card BIN database
    - Calculate risk score (0-100)
    ↓
13. If risk_score > 80:
    - Decline payment
    - Kafka: "payment_declined_fraud"
    Else:
    - Continue processing
    ↓
14. Payment Engine → Card Network (Visa/Mastercard)
    ISO 8583 message:
    {
      message_type: "0100", // Authorization request
      pan: "encrypted_card_number",
      amount: 5000,
      merchant_id: "merchant_abc"
    }
    ↓
15. Card Network → Issuing Bank
    Check cardholder account balance
    Apply fraud rules
    ↓
16. Bank Response → Card Network → Payment Engine
    Response: "approved" or "declined"
    Authorization code: "AUTH123"
    ↓
17. Payment Engine → PostgreSQL
    BEGIN TRANSACTION;
    INSERT INTO charges (id, amount, status, auth_code) 
    VALUES ('ch_123', 5000, 'succeeded', 'AUTH123');
    
    INSERT INTO ledger (type, amount, balance)
    VALUES ('charge', 5000, merchant_balance + 5000);
    COMMIT;
    ↓
18. Payment Engine → Redis
    Update cache: "charge:ch_123" = "succeeded"
    Invalidate: "merchant:balance:merchant_abc"
    ↓
19. Payment Engine → RabbitMQ
    Publish: "payment_succeeded"
    ↓
20. Multiple Consumers:
    
    A) Webhook Service
       - BullMQ: "send_webhook"
       - Queue webhook delivery to merchant
    
    B) Email Service
       - BullMQ: "send_receipt"
       - Send receipt to customer
    
    C) Analytics Service
       - Kafka: "charge_succeeded" event
       - Update revenue metrics
    
    D) Ledger Service
       - Update merchant balance
       - Record transaction
    ↓
21. BullMQ Worker: Webhook Delivery
    POST https://merchant.com/webhooks
    Headers: {
      "Stripe-Signature": "computed_signature"
    }
    Body: {
      type: "charge.succeeded",
      data: { id: "ch_123", amount: 5000 }
    }
    ↓
22. Retry logic (if webhook fails):
    - Attempt 1: Immediate
    - Attempt 2: 5 minutes
    - Attempt 3: 30 minutes
    - Attempt 4: 2 hours
    - Attempt 5: 24 hours
    ↓
23. Return response to merchant
    {
      id: "ch_123",
      status: "succeeded",
      amount: 5000,
      created: 1702890000
    }
    ↓
24. ASYNC: Kafka event
    Event: "charge_succeeded"
    - Update analytics dashboard
    - Feed ML fraud model
    - Generate daily reports
```

**Technologies Used**:
- ✅ **Vault**: Secure card tokenization
- ✅ **Redis**: Idempotency, caching
- ✅ **RabbitMQ**: Payment workflow orchestration
- ✅ **BullMQ**: Webhooks, emails (with retries)
- ✅ **Kafka**: Analytics and audit trail
- ✅ **PostgreSQL**: ACID transactions for ledger

---

### Flow 2: Subscription Billing 📅

```
1. Merchant creates subscription
   ↓
2. POST /v1/subscriptions
   Body: {
     customer: "cus_123",
     plan: "plan_monthly_999",
     payment_method: "pm_card_visa"
   }
   ↓
3. Billing Service → PostgreSQL
   INSERT INTO subscriptions (customer_id, plan_id, status)
   VALUES ('cus_123', 'plan_monthly_999', 'active');
   ↓
4. Billing Service → BullMQ
   Schedule recurring job:
   {
     name: "subscription_invoice",
     data: { subscription_id: "sub_123" },
     repeat: { cron: "0 0 1 * *" } // 1st of every month
   }
   ↓
5. On billing date (1st of month):
   BullMQ Worker triggers
   ↓
6. Worker → Billing Service
   Create invoice for subscription
   ↓
7. Billing Service → PostgreSQL
   INSERT INTO invoices (subscription_id, amount, status)
   VALUES ('sub_123', 999, 'pending');
   ↓
8. Billing Service → RabbitMQ
   Publish: "invoice_created"
   ↓
9. Payment Engine (Consumer)
   Attempt to charge payment method
   ↓
10. Payment Engine → Payment API
    POST /v1/charges (same flow as Flow 1)
    ↓
11. If payment succeeds:
    - Update invoice status: "paid"
    - Kafka: "invoice_paid" event
    - BullMQ: Send receipt email
    
    If payment fails:
    - Retry after 3 days
    - Retry after 7 days
    - If still fails: Cancel subscription
    - BullMQ: Send dunning emails
    ↓
12. After 3 failed attempts:
    Billing Service → PostgreSQL
    UPDATE subscriptions SET status = 'canceled'
    WHERE id = 'sub_123';
    ↓
13. BullMQ: "send_subscription_canceled_email"
    ↓
14. Webhook to merchant:
    {
      type: "customer.subscription.deleted",
      data: { id: "sub_123", status: "canceled" }
    }
```

**Technologies Used**:
- ✅ **BullMQ**: Scheduled recurring jobs, dunning emails
- ✅ **PostgreSQL**: Subscription and invoice records
- ✅ **RabbitMQ**: Invoice workflow
- ✅ **Kafka**: Subscription analytics

---

### Flow 3: Refund Processing 🔄

```
1. Merchant initiates refund
   ↓
2. POST /v1/refunds
   Body: {
     charge: "ch_123",
     amount: 5000,
     reason: "requested_by_customer"
   }
   ↓
3. Payment API → PostgreSQL
   Verify charge exists and is refundable
   SELECT * FROM charges WHERE id = 'ch_123';
   ↓
4. Payment API → RabbitMQ
   Publish: "refund_initiated"
   ↓
5. Refund Engine (Consumer)
   Process refund
   ↓
6. Refund Engine → Card Network
   ISO 8583 message:
   {
     message_type: "0400", // Reversal request
     original_auth_code: "AUTH123",
     amount: 5000
   }
   ↓
7. Card Network → Issuing Bank
   Credit cardholder account
   ↓
8. Bank Response → Refund Engine
   Response: "refund_approved"
   ↓
9. Refund Engine → PostgreSQL
   BEGIN TRANSACTION;
   INSERT INTO refunds (id, charge_id, amount, status)
   VALUES ('re_123', 'ch_123', 5000, 'succeeded');
   
   UPDATE charges SET refunded = true WHERE id = 'ch_123';
   
   UPDATE ledger SET balance = balance - 5000
   WHERE merchant_id = 'merchant_abc';
   COMMIT;
   ↓
10. Refund Engine → Redis
    Invalidate cache: "charge:ch_123"
    Update: "refund:re_123" = "succeeded"
    ↓
11. Refund Engine → RabbitMQ
    Publish: "refund_succeeded"
    ↓
12. Multiple Consumers:
    
    A) Webhook Service
       - BullMQ: Send webhook to merchant
    
    B) Email Service
       - BullMQ: Send refund confirmation to customer
    
    C) Analytics Service
       - Kafka: "refund_succeeded" event
       - Update refund rate metrics
    ↓
13. Return response
    {
      id: "re_123",
      status: "succeeded",
      amount: 5000
    }
```

**Technologies Used**:
- ✅ **PostgreSQL**: ACID transactions for ledger updates
- ✅ **RabbitMQ**: Refund workflow
- ✅ **BullMQ**: Webhooks and emails
- ✅ **Redis**: Cache invalidation
- ✅ **Kafka**: Refund analytics

---

### Flow 4: Fraud Detection & Prevention 🛡️

```
1. Payment initiated (from Flow 1, step 11)
   ↓
2. Fraud Service receives request
   ↓
3. Fraud Service → Redis
   Check velocity rules:
   INCR fraud:velocity:card:4242:hour
   EXPIRE fraud:velocity:card:4242:hour 3600
   
   count = GET fraud:velocity:card:4242:hour
   If count > 5:
     risk_score += 30
   ↓
4. Fraud Service → PostgreSQL
   Check historical patterns:
   SELECT COUNT(*) FROM charges
   WHERE customer_id = 'cus_123'
   AND created > NOW() - INTERVAL '24 hours';
   ↓
5. Fraud Service → External API (Sift/Kount)
   POST /v1/fraud/score
   Body: {
     user_id: "cus_123",
     transaction_amount: 5000,
     ip_address: "192.168.1.1",
     device_fingerprint: "abc123"
   }
   ↓
6. Calculate composite risk score:
   risk_score = 
     velocity_score * 0.3 +
     historical_score * 0.2 +
     external_score * 0.3 +
     geolocation_score * 0.2
   ↓
7. Fraud Service → Kafka
   Event: "fraud_check_completed"
   Data: {
     charge_id: "ch_123",
     risk_score: 45,
     decision: "approve"
   }
   ↓
8. If risk_score > 80:
    - Block payment
    - BullMQ: Alert merchant
    - Kafka: "payment_blocked_fraud"
   
   If 50 < risk_score < 80:
    - Require 3D Secure authentication
    - Redirect to bank auth page
   
   If risk_score < 50:
    - Approve payment
    - Continue normal flow
   ↓
9. ML Model Training (Async):
   Kafka Consumer → Spark
   - Collect fraud events
   - Retrain model weekly
   - Update fraud rules
```

**Technologies Used**:
- ✅ **Redis**: Real-time velocity checks
- ✅ **PostgreSQL**: Historical pattern analysis
- ✅ **Kafka**: Fraud event streaming for ML
- ✅ **BullMQ**: Fraud alerts
- ✅ **Spark**: ML model training

---

### Flow 5: Webhook Delivery with Retries 🔔

```
1. Payment event occurs (charge succeeded)
   ↓
2. Event Service → RabbitMQ
   Publish: "charge.succeeded"
   ↓
3. Webhook Service (Consumer)
   Fetch merchant webhook URL from database
   ↓
4. Webhook Service → BullMQ
   Add job: "deliver_webhook"
   {
     merchant_id: "merchant_abc",
     event_type: "charge.succeeded",
     payload: { id: "ch_123", amount: 5000 },
     url: "https://merchant.com/webhooks"
   }
   Priority: HIGH
   ↓
5. BullMQ Worker picks up job
   ↓
6. Worker → Compute Signature
   signature = HMAC_SHA256(
     payload,
     webhook_secret
   )
   ↓
7. Worker → Merchant Endpoint
   POST https://merchant.com/webhooks
   Headers: {
     "Stripe-Signature": signature,
     "Stripe-Event-Type": "charge.succeeded"
   }
   Body: {
     id: "evt_123",
     type: "charge.succeeded",
     data: { id: "ch_123", amount: 5000 }
   }
   Timeout: 5 seconds
   ↓
8. If response = 200 OK:
    - Mark job as complete
    - MongoDB: Log successful delivery
    - Kafka: "webhook_delivered" event
   
   If response = error or timeout:
    - Retry with exponential backoff
    - Attempt 1: Immediate
    - Attempt 2: 5 min (job.attemptsMade * 5)
    - Attempt 3: 30 min
    - Attempt 4: 2 hours
    - Attempt 5: 24 hours
    ↓
9. After 5 failed attempts:
   - Mark webhook as failed
   - BullMQ: Alert merchant via email
   - Dashboard: Show failed webhook
   - Allow manual retry from dashboard
   ↓
10. MongoDB: Store webhook log
    {
      event_id: "evt_123",
      merchant_id: "merchant_abc",
      url: "https://merchant.com/webhooks",
      attempts: 5,
      status: "failed",
      last_error: "Connection timeout",
      created_at: "2025-12-17T10:00:00Z"
    }
```

**Technologies Used**:
- ✅ **RabbitMQ**: Event distribution
- ✅ **BullMQ**: Webhook delivery with retries
- ✅ **MongoDB**: Webhook logs
- ✅ **Kafka**: Webhook analytics

---

### Flow 6: Multi-Currency Payment 🌍

```
1. Merchant charges in EUR, customer pays in USD
   ↓
2. POST /v1/charges
   Body: {
     amount: 1000, // 10.00 EUR
     currency: "eur",
     source: "tok_abc123"
   }
   ↓
3. Payment API → Redis
   Check exchange rate cache:
   GET exchange_rate:EUR:USD
   ↓
4. If cache miss:
   Payment API → External FX API
   GET /v1/rates?base=EUR&symbols=USD
   Response: { USD: 1.08 }
   
   Cache result:
   SET exchange_rate:EUR:USD 1.08 EX 300
   ↓
5. Payment API → Calculate
   usd_amount = 1000 * 1.08 = 1080 (10.80 USD)
   ↓
6. Payment API → Card Network
   Charge customer: 10.80 USD
   ↓
7. Payment API → PostgreSQL
   INSERT INTO charges (
     id, amount, currency,
     amount_captured_usd, exchange_rate
   ) VALUES (
     'ch_123', 1000, 'EUR',
     1080, 1.08
   );
   ↓
8. Kafka: "multi_currency_charge" event
   - Track FX fees
   - Update currency analytics
```

**Technologies Used**:
- ✅ **Redis**: Exchange rate caching
- ✅ **PostgreSQL**: Multi-currency ledger
- ✅ **Kafka**: FX analytics

---

## Implementation Details

### 1. Redis Usage in Stripe

#### Idempotency Keys (Critical for Payments!)

```javascript
// Prevent duplicate charges
async function createCharge(params, idempotencyKey) {
  const lockKey = `idempotency:${idempotencyKey}`;
  
  // Try to acquire lock
  const acquired = await redis.set(lockKey, 'processing', 'EX', 300, 'NX');
  
  if (!acquired) {
    // Request already processing or completed
    const existingCharge = await redis.get(`charge:${idempotencyKey}`);
    if (existingCharge) {
      return JSON.parse(existingCharge);
    }
    throw new Error('Request already processing');
  }
  
  try {
    // Process payment
    const charge = await processPayment(params);
    
    // Cache result
    await redis.setex(
      `charge:${idempotencyKey}`,
      86400, // 24 hours
      JSON.stringify(charge)
    );
    
    return charge;
  } catch (error) {
    // Release lock on error
    await redis.del(lockKey);
    throw error;
  }
}
```

#### Rate Limiting

```javascript
// Rate limit API requests per merchant
async function checkRateLimit(merchantId) {
  const key = `rate_limit:${merchantId}:${Date.now() / 1000 | 0}`;
  
  const count = await redis.incr(key);
  await redis.expire(key, 1); // 1 second window
  
  if (count > 100) {
    throw new Error('Rate limit exceeded: 100 requests/second');
  }
  
  return count;
}
```

#### Fraud Velocity Checks

```javascript
// Check transaction velocity
async function checkVelocity(cardToken) {
  const hourKey = `velocity:card:${cardToken}:hour`;
  const dayKey = `velocity:card:${cardToken}:day`;
  
  const pipeline = redis.pipeline();
  pipeline.incr(hourKey);
  pipeline.expire(hourKey, 3600);
  pipeline.incr(dayKey);
  pipeline.expire(dayKey, 86400);
  
  const results = await pipeline.exec();
  const hourCount = results[0][1];
  const dayCount = results[2][1];
  
  if (hourCount > 5 || dayCount > 20) {
    return { blocked: true, reason: 'velocity_exceeded' };
  }
  
  return { blocked: false };
}
```

---

### 2. BullMQ: Webhook Delivery

```javascript
const { Queue, Worker } = require('bullmq');

const webhookQueue = new Queue('webhooks', {
  connection: { host: 'redis', port: 6379 }
});

// Producer: Add webhook job
async function queueWebhook(event) {
  await webhookQueue.add('deliver', {
    merchantId: event.merchantId,
    eventType: event.type,
    payload: event.data,
    url: event.webhookUrl
  }, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000 // 5s, 25s, 125s, 625s, 3125s
    },
    removeOnComplete: 100, // Keep last 100 completed
    removeOnFail: 1000      // Keep last 1000 failed
  });
}

// Worker: Deliver webhooks
const webhookWorker = new Worker('webhooks', async (job) => {
  const { url, payload, merchantId } = job.data;
  
  // Compute signature
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Stripe-Signature': signature,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    if (response.status === 200) {
      // Log successful delivery
      await logWebhook(merchantId, 'success', job.attemptsMade);
      return { delivered: true };
    }
  } catch (error) {
    // Log failure
    await logWebhook(merchantId, 'failed', job.attemptsMade, error.message);
    throw error; // Trigger retry
  }
}, {
  connection: { host: 'redis', port: 6379 },
  concurrency: 100 // Process 100 webhooks in parallel
});

webhookWorker.on('failed', async (job, err) => {
  if (job.attemptsMade >= 5) {
    // Send alert to merchant
    await emailQueue.add('webhook-failed-alert', {
      merchantId: job.data.merchantId,
      eventType: job.data.eventType,
      error: err.message
    });
  }
});
```

---

### 3. RabbitMQ: Payment Workflow

```javascript
// Setup exchanges and queues
async function setupPaymentWorkflow(channel) {
  // Topic exchange for payment events
  await channel.assertExchange('payments', 'topic', { durable: true });
  
  // Queues for different stages
  await channel.assertQueue('payment-processing', { durable: true });
  await channel.assertQueue('fraud-check', { durable: true });
  await channel.assertQueue('ledger-update', { durable: true });
  await channel.assertQueue('webhook-delivery', { durable: true });
  
  // Bind queues to exchange
  await channel.bindQueue('payment-processing', 'payments', 'payment.charge.*');
  await channel.bindQueue('fraud-check', 'payments', 'payment.charge.initiated');
  await channel.bindQueue('ledger-update', 'payments', 'payment.charge.succeeded');
  await channel.bindQueue('webhook-delivery', 'payments', 'payment.*');
}

// Publisher: Initiate payment
async function initiatePayment(charge) {
  const message = {
    chargeId: charge.id,
    amount: charge.amount,
    currency: charge.currency,
    merchantId: charge.merchantId,
    timestamp: Date.now()
  };
  
  channel.publish(
    'payments',
    'payment.charge.initiated',
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
}

// Consumer: Process payment
async function startPaymentProcessor() {
  channel.consume('payment-processing', async (msg) => {
    const payment = JSON.parse(msg.content.toString());
    
    try {
      // 1. Check fraud
      const fraudCheck = await checkFraud(payment);
      if (fraudCheck.blocked) {
        channel.publish('payments', 'payment.charge.blocked', 
          Buffer.from(JSON.stringify({ ...payment, reason: fraudCheck.reason }))
        );
        channel.ack(msg);
        return;
      }
      
      // 2. Process with card network
      const result = await processWithCardNetwork(payment);
      
      if (result.approved) {
        // 3. Update ledger
        await updateLedger(payment);
        
        // 4. Publish success
        channel.publish('payments', 'payment.charge.succeeded',
          Buffer.from(JSON.stringify({ ...payment, authCode: result.authCode }))
        );
      } else {
        channel.publish('payments', 'payment.charge.failed',
          Buffer.from(JSON.stringify({ ...payment, error: result.error }))
        );
      }
      
      channel.ack(msg);
    } catch (error) {
      console.error('Payment processing failed:', error);
      // Requeue with delay
      setTimeout(() => channel.nack(msg, false, true), 5000);
    }
  });
}
```

---

### 4. Kafka: Event Streaming & Analytics

```javascript
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'stripe-app',
  brokers: ['kafka1:9092', 'kafka2:9092', 'kafka3:9092']
});

// Producer: Stream payment events
const producer = kafka.producer();

async function streamPaymentEvent(event) {
  await producer.send({
    topic: 'payment-events',
    messages: [
      {
        key: event.chargeId,
        value: JSON.stringify(event),
        timestamp: Date.now(),
        headers: {
          'event-type': event.type,
          'merchant-id': event.merchantId
        }
      }
    ]
  });
}

// Consumer: Analytics pipeline
const consumer = kafka.consumer({ groupId: 'analytics-group' });

await consumer.subscribe({ 
  topics: ['payment-events', 'refund-events', 'fraud-events'],
  fromBeginning: false 
});

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString());
    
    switch (event.type) {
      case 'charge_succeeded':
        await updateRevenueMetrics(event);
        await updateMerchantDashboard(event);
        break;
      
      case 'charge_failed':
        await updateFailureRate(event);
        await triggerAlertIfNeeded(event);
        break;
      
      case 'fraud_detected':
        await updateFraudMetrics(event);
        await retrainMLModel(event);
        break;
    }
    
    // Write to data warehouse
    await bigquery.insert('payment_events', event);
  }
});
```

---

## Deployment & Monitoring

### Docker Compose (Simplified)

```yaml
version: '3.8'

services:
  # API Gateway
  nginx:
    image: nginx:latest
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl

  # Payment API
  payment-api:
    build: ./services/payment-api
    environment:
      - DATABASE_URL=postgresql://postgres:5432/stripe
      - REDIS_URL=redis://redis:6379
      - VAULT_ADDR=http://vault:8200
    depends_on:
      - postgres
      - redis
      - vault

  # Fraud Service
  fraud-service:
    build: ./services/fraud
    environment:
      - ML_MODEL_PATH=/models/fraud_detection.pkl
      - REDIS_URL=redis://redis:6379

  # Webhook Worker
  webhook-worker:
    build: ./services/webhook-worker
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  # Databases
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=stripe
      - POSTGRES_PASSWORD=secret
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

  # Vault for secrets
  vault:
    image: vault:latest
    environment:
      - VAULT_DEV_ROOT_TOKEN_ID=root
    ports:
      - "8200:8200"

  # Message Queues
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "15672:15672"

  kafka:
    image: confluentinc/cp-kafka:latest
    depends_on:
      - zookeeper

  zookeeper:
    image: confluentinc/cp-zookeeper:latest

  # Monitoring
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"

volumes:
  postgres-data:
  redis-data:
```

---

## Summary

### Technology Usage

| Technology | Use Cases in Stripe |
| ---------- | -------------------- |
| **Redis** | Idempotency keys, rate limiting, fraud velocity, caching |
| **BullMQ** | Webhook delivery (with retries), emails, reports, payouts |
| **RabbitMQ** | Payment workflow orchestration, refund processing |
| **Kafka** | Event streaming, analytics, fraud ML training, audit logs |
| **PostgreSQL** | Payments, ledger, customers (ACID critical) |
| **MongoDB** | Event logs, webhook logs, audit trail |
| **Vault** | Card tokenization, API keys, encryption keys |
| **Go** | Token service (high performance, secure) |
| **Python** | Fraud detection (ML models) |
| **Java** | Ledger service (ACID transactions) |

### Key Patterns

1. **Idempotency**: Redis-based idempotency keys prevent duplicate charges
2. **Event Sourcing**: Kafka stores all payment events
3. **Saga Pattern**: RabbitMQ orchestrates multi-step payment workflow
4. **Circuit Breaker**: Prevent cascading failures to card networks
5. **Retry with Exponential Backoff**: BullMQ for webhook delivery
6. **CQRS**: Separate read/write paths for ledger
7. **Tokenization**: Vault for PCI-DSS compliance

---

**This is how Stripe processes billions in payments!** 🚀
