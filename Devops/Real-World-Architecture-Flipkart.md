# 🛒 Flipkart-Like E-Commerce Architecture — Complete DevOps Implementation

> **Real-world example**: How Redis, BullMQ, RabbitMQ, Kafka, Docker work together in a large-scale e-commerce platform

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
- 🛍️ Product catalog & search
- 🛒 Shopping cart
- 💳 Payment processing
- 📦 Order management
- 🚚 Inventory & logistics
- ⭐ Reviews & ratings
- 🔔 Notifications
- 📊 Analytics & recommendations

### Scale Requirements
- **500M+ users**
- **100M+ products**
- **1M+ orders/day**
- **Peak: 10K orders/second** (Big Billion Days sale)
- **99.99% uptime**

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│   Web (React) | Mobile App (React Native) | Seller Dashboard    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CDN (Akamai / CloudFront)                   │
│  - Product images                                               │
│  - Static assets (CSS, JS)                                      │
│  - Cached API responses                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX (API Gateway)                           │
│  - SSL Termination                                              │
│  - Rate Limiting (prevent bot attacks)                          │
│  - Request Routing                                              │
│  - DDoS Protection                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┬──────────────┐
              ↓              ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Auth Service │ │Product Service│ │ Cart Service │ │Order Service │
│  (FastAPI)   │ │  (Node.js)    │ │  (Node.js)   │ │  (Java)      │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │                │
       └────────────────┼────────────────┼────────────────┘
                        │                │
         ┌──────────────┼────────────────┼──────────────┐
         ↓              ↓                ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Payment Service│ │Inventory Svc │ │Notification  │ │Search Service│
│  (Node.js)    │ │  (Go)        │ │  (Node.js)   │ │(ElasticSearch)│
└───────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ PostgreSQL   │  MongoDB     │  Redis       │  Cassandra        │
│ - Users      │  - Products  │  - Cache     │  - Order history  │
│ - Orders     │  - Reviews   │  - Sessions  │  - Analytics      │
│ - Payments   │  - Cart      │  - Inventory │  - Logs           │
└──────────────┴──────────────┴──────────────┴───────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      MESSAGE LAYER                               │
├──────────────┬──────────────┬──────────────────────────────────┤
│   BullMQ     │   RabbitMQ   │   Kafka                          │
│   (Redis)    │              │                                  │
│ - Emails     │ - Order flow │ - User events                    │
│ - SMS        │ - Inventory  │ - Order events                   │
│ - Reports    │ - Payments   │ - Analytics stream               │
│ - Image proc │ - Refunds    │ - Audit logs                     │
└──────┬───────┴──────┬───────┴──────┬───────────────────────────┘
       ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Worker Service│ │Order Workflow│ │Analytics Pipe│
│(Background)  │ │  Orchestrator│ │   (Spark)    │
└──────────────┘ └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE & SEARCH                              │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│     S3       │ElasticSearch │   Redis      │  Data Warehouse   │
│ - Images     │ - Product    │ - Hot data   │  - BigQuery       │
│ - Documents  │   search     │ - Trending   │  - Redshift       │
│ - Backups    │ - Filters    │ - Flash sale │  - Analytics      │
└──────────────┴──────────────┴──────────────┴───────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  MONITORING & OBSERVABILITY                      │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ Prometheus   │   Grafana    │   ELK Stack  │   Jaeger          │
│ - Metrics    │ - Dashboards │ - Logs       │ - Distributed     │
│ - Alerts     │ - Monitoring │ - Search     │   tracing         │
└──────────────┴──────────────┴──────────────┴───────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│Payment Gateway│  SMS/Email   │  Logistics   │  Recommendation   │
│ - Razorpay   │ - Twilio     │ - Delhivery  │  - ML Models      │
│ - Paytm      │ - SendGrid   │ - BlueDart   │  - Personalization│
└──────────────┴──────────────┴──────────────┴───────────────────┘
```

---

## Technology Stack

### Frontend
- **Web**: React + Redux
- **Mobile**: React Native
- **Seller Dashboard**: Angular

### Backend Services
- **API Gateway**: NGINX
- **Auth Service**: FastAPI (Python)
- **Product Service**: Node.js + Express
- **Cart Service**: Node.js + Express
- **Order Service**: Java Spring Boot
- **Payment Service**: Node.js
- **Inventory Service**: Go (high performance)
- **Search Service**: ElasticSearch

### Databases
- **PostgreSQL**: Users, orders, payments (ACID compliance)
- **MongoDB**: Products, reviews, cart (flexible schema)
- **Redis**: Cache, sessions, inventory counts
- **Cassandra**: Order history, analytics (write-heavy)

### Message Queues
- **BullMQ**: Background jobs (emails, SMS, image processing)
- **RabbitMQ**: Service orchestration (order workflow)
- **Kafka**: Event streaming (analytics, audit logs)

### Infrastructure
- **Docker**: Containerization
- **Kubernetes**: Orchestration
- **NGINX**: Load balancing, API gateway
- **CDN**: Akamai / CloudFront

### Monitoring
- **Prometheus**: Metrics
- **Grafana**: Dashboards
- **ELK Stack**: Logs (Elasticsearch, Logstash, Kibana)
- **Jaeger**: Distributed tracing

---

## Step-by-Step Flows

### Flow 1: User Browses Products 🛍️

```
1. User opens Flipkart app
   ↓
2. Frontend → CDN
   Load static assets (cached)
   ↓
3. Frontend → NGINX → Product Service
   GET /api/products?category=electronics&page=1
   ↓
4. Product Service → Redis
   Check cache: "products:electronics:page:1"
   ├─ HIT → Return cached data (1ms)
   └─ MISS → Continue
   ↓
5. Product Service → ElasticSearch
   Query products with filters
   {
     query: {
       bool: {
         must: [
           { match: { category: "electronics" } },
           { range: { price: { gte: 1000, lte: 50000 } } }
         ]
       }
     },
     sort: [{ popularity: "desc" }],
     from: 0,
     size: 20
   }
   ↓
6. ElasticSearch returns results
   ↓
7. Product Service → Redis
   Cache results (TTL: 5 minutes)
   ↓
8. Product Service → MongoDB
   Fetch additional product details (reviews, ratings)
   ↓
9. Return to client
   ↓
10. ASYNC: Kafka event
    Event: "product_viewed"
    Data: { userId, productId, category, timestamp }
    ↓
11. Kafka → Analytics Pipeline
    - Track user behavior
    - Update trending products
    - Feed recommendation engine
```

**Technologies Used**:
- ✅ **CDN**: Static assets
- ✅ **Redis**: Cache product listings
- ✅ **ElasticSearch**: Fast product search with filters
- ✅ **MongoDB**: Product details, reviews
- ✅ **Kafka**: User behavior tracking

---

### Flow 2: User Adds Product to Cart 🛒

```
1. User clicks "Add to Cart"
   ↓
2. Frontend → NGINX → Cart Service
   POST /api/cart/add
   Body: { productId: "123", quantity: 1 }
   ↓
3. Cart Service → Auth Service
   Validate JWT token
   ↓
4. Cart Service → Redis
   Check session: "session:token:abc"
   ↓
5. Cart Service → Inventory Service
   Check stock availability
   GET /api/inventory/check?productId=123&quantity=1
   ↓
6. Inventory Service → Redis
   Get real-time inventory count
   DECR inventory:product:123
   ↓
7. If available:
   Cart Service → MongoDB
   Update cart document:
   {
     userId: "user123",
     items: [
       { productId: "123", quantity: 1, price: 15000 }
     ],
     updatedAt: "2025-12-15T10:30:00Z"
   }
   ↓
8. Cart Service → Redis
   Invalidate cache: "cart:user:123"
   Update cart count: INCR cart_count:user:123
   ↓
9. Return success to client
   ↓
10. ASYNC: Kafka event
    Event: "cart_item_added"
    - Track cart abandonment
    - Trigger recommendation updates
```

**Technologies Used**:
- ✅ **Redis**: Session validation, inventory count, cart count
- ✅ **MongoDB**: Store cart data
- ✅ **Kafka**: Cart analytics

---

### Flow 3: User Places Order 💳

```
1. User clicks "Place Order"
   ↓
2. Frontend → NGINX → Order Service
   POST /api/orders/create
   Body: {
     cartId: "cart123",
     addressId: "addr456",
     paymentMethod: "UPI"
   }
   ↓
3. Order Service → Cart Service
   Fetch cart items
   ↓
4. Order Service → Inventory Service
   Reserve inventory (hold stock)
   ↓
5. Order Service → PostgreSQL
   Create order record (ACID transaction)
   BEGIN TRANSACTION;
   INSERT INTO orders (user_id, total, status) VALUES (...);
   INSERT INTO order_items (order_id, product_id, quantity) VALUES (...);
   COMMIT;
   ↓
6. Order Service → RabbitMQ
   Publish: "order_created"
   Exchange: "orders" (topic)
   Routing Key: "order.created.user123"
   Message: {
     orderId: "order789",
     userId: "user123",
     total: 15000,
     items: [...]
   }
   ↓
7. Multiple Consumers Process Order:
   
   A) Payment Service (Consumer 1)
      - Initiate payment with Razorpay
      - Create payment link
      - Publish: "payment_initiated"
   
   B) Notification Service (Consumer 2)
      - BullMQ: "send_order_confirmation_email"
      - BullMQ: "send_order_confirmation_sms"
   
   C) Inventory Service (Consumer 3)
      - Confirm inventory reservation
      - Update stock levels
   
   D) Analytics Service (Consumer 4)
      - Kafka: "order_placed" event
      - Update sales metrics
   ↓
8. Return order ID to client
   Redirect to payment page
   ↓
9. User completes payment
   ↓
10. Payment Gateway → Payment Service (Webhook)
    POST /api/payments/webhook
    Body: { orderId, status: "success", transactionId }
    ↓
11. Payment Service → RabbitMQ
    Publish: "payment_completed"
    ↓
12. Order Service (Consumer)
    - Update order status: "PAID"
    - Publish: "order_confirmed"
    ↓
13. Logistics Service (Consumer)
    - Assign delivery partner
    - Generate shipping label
    - BullMQ: "print_shipping_label"
    ↓
14. Notification Service
    - BullMQ: "send_payment_success_email"
    - BullMQ: "send_order_tracking_sms"
    ↓
15. Kafka: "order_confirmed" event
    - Update analytics
    - Trigger seller notification
    - Update inventory forecasting
```

**Technologies Used**:
- ✅ **PostgreSQL**: ACID transactions for order creation
- ✅ **RabbitMQ**: Order workflow orchestration (topic exchange)
- ✅ **BullMQ**: Background jobs (emails, SMS, labels)
- ✅ **Kafka**: Analytics and audit trail
- ✅ **Redis**: Inventory management

---

### Flow 4: Flash Sale (Big Billion Days) ⚡

```
1. Admin schedules flash sale
   ↓
2. Admin Dashboard → Product Service
   POST /api/flash-sale/create
   Body: {
     productId: "123",
     salePrice: 9999,
     originalPrice: 15000,
     startTime: "2025-12-15T12:00:00Z",
     stock: 1000
   }
   ↓
3. Product Service → Redis
   Pre-warm cache with sale data
   SET flash_sale:product:123 "{...}" EX 3600
   SET flash_sale:stock:123 1000
   ↓
4. Product Service → MongoDB
   Update product with sale info
   ↓
5. Product Service → RabbitMQ
   Publish: "flash_sale_scheduled"
   Exchange: "notifications" (fanout)
   ↓
6. Notification Service (Consumer)
   - Get all users who wishlisted this product
   - BullMQ: Queue 1M push notifications
   - BullMQ: Queue 1M emails
   ↓
7. BullMQ Workers (100 workers in parallel)
   - Send push notifications via Firebase
   - Send emails via SendGrid
   - Rate limited: 10K/second
   ↓
8. Flash Sale Starts (12:00 PM)
   ↓
9. 100K users hit "Buy Now" simultaneously
   ↓
10. NGINX → Rate Limiting
    - Allow 10K requests/second
    - Queue remaining requests
    - Return 429 (Too Many Requests) if queue full
    ↓
11. Order Service → Redis (Atomic Operation)
    -- Lua script for atomic stock check and decrement
    local stock = redis.call('GET', 'flash_sale:stock:123')
    if tonumber(stock) > 0 then
      redis.call('DECR', 'flash_sale:stock:123')
      return 1  -- Success
    else
      return 0  -- Out of stock
    end
    ↓
12. If stock available:
    - Create order (same as Flow 3)
    - Reserve inventory
    ↓
13. If out of stock:
    - Return "Out of Stock" immediately
    - Kafka: "flash_sale_stock_out" event
    ↓
14. Real-time Updates via WebSocket
    - Push stock count updates to all connected clients
    - Update UI: "Only 50 left!"
```

**Technologies Used**:
- ✅ **Redis**: Atomic stock management (Lua scripts)
- ✅ **NGINX**: Rate limiting to prevent overload
- ✅ **BullMQ**: Bulk notifications (1M+ jobs)
- ✅ **RabbitMQ**: Fanout notifications
- ✅ **WebSocket**: Real-time stock updates
- ✅ **Kafka**: Analytics and monitoring

---

### Flow 5: Product Search with Filters 🔍

```
1. User searches: "samsung galaxy s24"
   Filters: Price 30K-50K, 4+ stars
   ↓
2. Frontend → NGINX → Search Service
   GET /api/search?q=samsung+galaxy+s24&price_min=30000&price_max=50000&rating=4
   ↓
3. Search Service → Redis
   Check cache: "search:samsung_galaxy_s24:30000:50000:4"
   ├─ HIT → Return cached results
   └─ MISS → Continue
   ↓
4. Search Service → ElasticSearch
   Complex query:
   {
     query: {
       bool: {
         must: [
           {
             multi_match: {
               query: "samsung galaxy s24",
               fields: ["title^3", "description", "brand^2"],
               fuzziness: "AUTO"
             }
           }
         ],
         filter: [
           { range: { price: { gte: 30000, lte: 50000 } } },
           { range: { rating: { gte: 4 } } }
         ]
       }
     },
     aggs: {
       brands: { terms: { field: "brand" } },
       price_ranges: { histogram: { field: "price", interval: 5000 } }
     },
     sort: [
       { _score: "desc" },
       { popularity: "desc" }
     ]
   }
   ↓
5. ElasticSearch returns:
   - Matching products
   - Aggregations (for filter UI)
   ↓
6. Search Service → Redis
   Cache results (TTL: 2 minutes)
   ↓
7. Return to client
   ↓
8. ASYNC: Kafka event
   Event: "search_performed"
   - Track search queries
   - Improve search ranking
   - Identify trending searches
```

**Technologies Used**:
- ✅ **ElasticSearch**: Full-text search, filters, aggregations
- ✅ **Redis**: Cache search results
- ✅ **Kafka**: Search analytics

---

### Flow 6: Order Tracking & Updates 📦

```
1. Order is confirmed
   ↓
2. Logistics Service → RabbitMQ
   Publish: "order_shipped"
   Message: {
     orderId: "order789",
     trackingId: "TRACK123",
     estimatedDelivery: "2025-12-18"
   }
   ↓
3. Notification Service (Consumer)
   - BullMQ: "send_shipping_notification"
   - Email + SMS + Push notification
   ↓
4. Delivery Partner Updates Location (every 5 minutes)
   ↓
5. Logistics Service → Kafka
   Event: "delivery_location_updated"
   Data: {
     orderId: "order789",
     location: { lat: 12.9716, lng: 77.5946 },
     status: "out_for_delivery"
   }
   ↓
6. Real-time Service (Consumer)
   - Redis: Update location
     SET tracking:order789 "{lat, lng, status}"
   - WebSocket: Push to user's device
   ↓
7. User opens "Track Order" page
   ↓
8. Frontend → WebSocket connection
   Subscribe to: "order:order789:updates"
   ↓
9. Receive real-time updates
   - Location on map
   - Status changes
   - Estimated time
   ↓
10. Order Delivered
    ↓
11. Delivery Partner → Logistics Service
    POST /api/delivery/complete
    Body: { orderId, signature, photo }
    ↓
12. Logistics Service → RabbitMQ
    Publish: "order_delivered"
    ↓
13. Multiple Consumers:
    
    A) Order Service
       - Update status: "DELIVERED"
       - Close order
    
    B) Payment Service
       - Release payment to seller
    
    C) Notification Service
       - BullMQ: "send_delivery_confirmation"
       - BullMQ: "request_review" (after 24 hours)
    
    D) Analytics Service
       - Kafka: "order_delivered" event
       - Update delivery metrics
       - Calculate delivery time
```

**Technologies Used**:
- ✅ **RabbitMQ**: Order status workflow
- ✅ **Kafka**: Location tracking events
- ✅ **Redis**: Real-time location data
- ✅ **WebSocket**: Live tracking updates
- ✅ **BullMQ**: Delayed jobs (review request after 24h)

---

## Implementation Details

### 1. Redis Usage in Flipkart

#### Inventory Management (Critical!)
```javascript
// Atomic stock decrement using Lua script
const decrementStockScript = `
  local stock = redis.call('GET', KEYS[1])
  if tonumber(stock) >= tonumber(ARGV[1]) then
    redis.call('DECRBY', KEYS[1], ARGV[1])
    return 1
  else
    return 0
  end
`;

async function reserveStock(productId, quantity) {
  const result = await redis.eval(
    decrementStockScript,
    1,
    `inventory:${productId}`,
    quantity
  );
  
  if (result === 1) {
    console.log('Stock reserved');
    return true;
  } else {
    console.log('Out of stock');
    return false;
  }
}
```

#### Flash Sale Management
```javascript
// Pre-warm cache before flash sale
async function setupFlashSale(productId, stock, salePrice) {
  const pipeline = redis.pipeline();
  
  // Set stock count
  pipeline.set(`flash_sale:stock:${productId}`, stock);
  
  // Set sale price
  pipeline.hset(`flash_sale:${productId}`, {
    price: salePrice,
    startTime: Date.now(),
    stock: stock
  });
  
  // Set expiry (1 hour)
  pipeline.expire(`flash_sale:stock:${productId}`, 3600);
  pipeline.expire(`flash_sale:${productId}`, 3600);
  
  await pipeline.exec();
}
```

#### Cart Management
```javascript
// Store cart in Redis for fast access
async function addToCart(userId, productId, quantity) {
  const cartKey = `cart:${userId}`;
  
  // Add to sorted set (score = timestamp)
  await redis.zadd(cartKey, Date.now(), JSON.stringify({
    productId,
    quantity,
    addedAt: Date.now()
  }));
  
  // Expire after 30 days
  await redis.expire(cartKey, 30 * 24 * 60 * 60);
}

async function getCart(userId) {
  const cartKey = `cart:${userId}`;
  const items = await redis.zrange(cartKey, 0, -1);
  return items.map(item => JSON.parse(item));
}
```

---

### 2. RabbitMQ: Order Workflow Orchestration

#### Setup
```javascript
// exchanges.js
async function setupExchanges(channel) {
  // Topic exchange for orders
  await channel.assertExchange('orders', 'topic', { durable: true });
  
  // Fanout for notifications
  await channel.assertExchange('notifications', 'fanout', { durable: true });
  
  // Direct for payments
  await channel.assertExchange('payments', 'direct', { durable: true });
}
```

#### Publisher (Order Service)
```javascript
async function publishOrderCreated(order) {
  const message = {
    orderId: order.id,
    userId: order.userId,
    total: order.total,
    items: order.items,
    timestamp: Date.now()
  };
  
  // Publish to topic exchange
  channel.publish(
    'orders',
    `order.created.${order.userId}`,  // Routing key
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
  
  console.log(`Published order.created for ${order.id}`);
}
```

#### Consumer (Payment Service)
```javascript
async function startPaymentConsumer() {
  const queue = await channel.assertQueue('payment-service', {
    durable: true
  });
  
  // Bind to orders exchange
  await channel.bindQueue(queue.queue, 'orders', 'order.created.*');
  
  channel.consume(queue.queue, async (msg) => {
    const order = JSON.parse(msg.content.toString());
    
    try {
      // Initiate payment
      const payment = await initiatePayment(order);
      
      // Publish payment initiated
      channel.publish(
        'payments',
        'payment.initiated',
        Buffer.from(JSON.stringify(payment)),
        { persistent: true }
      );
      
      // Acknowledge message
      channel.ack(msg);
    } catch (error) {
      console.error('Payment initiation failed:', error);
      // Requeue with delay
      setTimeout(() => channel.nack(msg, false, true), 5000);
    }
  }, { noAck: false });
}
```

---

### 3. Kafka: Event Streaming & Analytics

#### Producer (All Services)
```javascript
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'flipkart-app',
  brokers: ['kafka1:9092', 'kafka2:9092', 'kafka3:9092']
});

const producer = kafka.producer();

async function publishEvent(topic, event) {
  await producer.send({
    topic,
    messages: [
      {
        key: event.userId || event.orderId,
        value: JSON.stringify(event),
        timestamp: Date.now(),
        headers: {
          'event-type': event.type,
          'source': 'order-service'
        }
      }
    ]
  });
}

// Usage
await publishEvent('order-events', {
  type: 'order_placed',
  orderId: 'order789',
  userId: 'user123',
  total: 15000,
  items: [...]
});
```

#### Consumer (Analytics Service)
```javascript
const consumer = kafka.consumer({ groupId: 'analytics-group' });

await consumer.subscribe({
  topics: ['order-events', 'user-events', 'product-events'],
  fromBeginning: false
});

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const event = JSON.parse(message.value.toString());
    
    switch (event.type) {
      case 'order_placed':
        await updateSalesMetrics(event);
        await updateInventoryForecasting(event);
        break;
      
      case 'product_viewed':
        await updateProductPopularity(event);
        await feedRecommendationEngine(event);
        break;
      
      case 'cart_abandoned':
        await triggerRetargetingCampaign(event);
        break;
    }
    
    // Write to data warehouse
    await bigquery.insert('events', event);
  }
});
```

---

### 4. BullMQ: Background Jobs

#### Email Notifications
```javascript
const { Queue, Worker } = require('bullmq');

const emailQueue = new Queue('email', {
  connection: { host: 'redis', port: 6379 }
});

// Producer
async function sendOrderConfirmation(order) {
  await emailQueue.add('order-confirmation', {
    to: order.userEmail,
    orderId: order.id,
    total: order.total,
    items: order.items
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
}

// Worker
const emailWorker = new Worker('email', async (job) => {
  const { to, orderId, total, items } = job.data;
  
  const emailHtml = renderOrderConfirmationEmail({ orderId, total, items });
  
  await sendGrid.send({
    to,
    from: 'noreply@flipkart.com',
    subject: `Order Confirmed - ${orderId}`,
    html: emailHtml
  });
  
  console.log(`Email sent to ${to}`);
}, {
  connection: { host: 'redis', port: 6379 },
  concurrency: 50  // Process 50 emails in parallel
});
```

#### Delayed Jobs (Review Request)
```javascript
// Request review 24 hours after delivery
async function scheduleReviewRequest(orderId, userEmail) {
  await emailQueue.add('review-request', {
    orderId,
    userEmail
  }, {
    delay: 24 * 60 * 60 * 1000  // 24 hours
  });
}
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
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf

  # Services
  auth-service:
    build: ./services/auth
    environment:
      - DATABASE_URL=postgresql://postgres:5432/flipkart
      - REDIS_URL=redis://redis:6379

  product-service:
    build: ./services/product
    environment:
      - MONGODB_URL=mongodb://mongodb:27017/flipkart
      - REDIS_URL=redis://redis:6379
      - ELASTICSEARCH_URL=http://elasticsearch:9200

  order-service:
    build: ./services/order
    environment:
      - DATABASE_URL=postgresql://postgres:5432/flipkart
      - RABBITMQ_URL=amqp://rabbitmq:5672
      - KAFKA_BROKERS=kafka:9092

  # Databases
  postgres:
    image: postgres:15
    volumes:
      - postgres-data:/var/lib/postgresql/data

  mongodb:
    image: mongo:6
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

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

  # Search
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
    volumes:
      - es-data:/usr/share/elasticsearch/data

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
  mongo-data:
  redis-data:
  es-data:
```

---

## Summary

### Technology Usage

| Technology | Use Cases in Flipkart |
| ---------- | --------------------- |
| **Redis** | Inventory, cart, cache, flash sales, sessions |
| **BullMQ** | Emails, SMS, image processing, reports |
| **RabbitMQ** | Order workflow, payment flow, notifications |
| **Kafka** | Analytics, audit logs, event streaming |
| **PostgreSQL** | Orders, payments, users (ACID) |
| **MongoDB** | Products, reviews, cart (flexible) |
| **ElasticSearch** | Product search, filters |
| **Cassandra** | Order history, logs (write-heavy) |

### Key Patterns

1. **CQRS**: Separate read/write paths
2. **Event Sourcing**: Kafka stores all events
3. **Saga Pattern**: Distributed transactions (order workflow)
4. **Circuit Breaker**: Prevent cascading failures
5. **Rate Limiting**: Protect from DDoS and flash sale overload
6. **Cache-Aside**: Redis for hot data
7. **Atomic Operations**: Lua scripts for inventory

---

**This is how Flipkart handles millions of orders!** 🚀
