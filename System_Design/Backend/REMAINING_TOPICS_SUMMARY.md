# Summary: Remaining System Design Topics

This document provides concise overviews of the remaining system design topics. Each topic includes key architecture points, database schemas, and interview talking points.

---

## 1. Aarogya Setu (Contact Tracing App)

### Problem Statement
Design a contact tracing application for COVID-19 tracking with privacy preservation.

### Key Requirements
- Bluetooth proximity detection
- Location tracking
- Risk assessment
- Privacy-preserving architecture
- Government data integration
- Notification system

### Architecture Highlights

**Components:**
- Mobile App (Bluetooth + GPS)
- Backend API (Node.js/Express)
- Contact Graph Database (Neo4j)
- Risk Calculation Engine
- Notification Service
- Privacy Layer (Data anonymization)

**Database Schema:**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    phone_hash VARCHAR(64) UNIQUE,  -- Hashed phone number
    risk_score INTEGER DEFAULT 0,
    last_updated TIMESTAMP
);

CREATE TABLE contacts (
    id BIGSERIAL PRIMARY KEY,
    user1_id BIGINT,
    user2_id BIGINT,
    contact_timestamp TIMESTAMP,
    duration_seconds INTEGER,
    distance_meters DECIMAL(5, 2),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8)
);

CREATE TABLE health_status (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    status VARCHAR(50),  -- SAFE, AT_RISK, INFECTED
    test_result VARCHAR(50),
    reported_at TIMESTAMP
);
```

**Key Features:**
1. **Bluetooth Contact Tracing**: Exchange anonymous tokens via Bluetooth
2. **Risk Calculation**: Graph-based algorithm to calculate exposure risk
3. **Privacy**: Store only hashed identifiers, no PII
4. **Notifications**: Alert users of potential exposure

**Interview Points:**
- How to preserve privacy? (Hashing, anonymous tokens, decentralized storage)
- How to calculate risk? (Graph traversal, weighted contacts by duration/distance)
- How to scale? (Sharding by region, async processing)

---

## 2. Google Play Store

### Problem Statement
Design an app marketplace platform for Android applications.

### Key Requirements
- App catalog and search
- User reviews and ratings
- Download management
- Payment processing
- Version control
- Content delivery (CDN)

### Architecture Highlights

**Components:**
- API Gateway
- App Service (catalog, metadata)
- Download Service (CDN integration)
- Review Service
- Payment Service
- Analytics Service

**Database Schema:**
```sql
CREATE TABLE apps (
    id BIGSERIAL PRIMARY KEY,
    package_name VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    developer_id BIGINT,
    category VARCHAR(100),
    description TEXT,
    icon_url VARCHAR(500),
    screenshots JSONB,
    price DECIMAL(10, 2) DEFAULT 0,
    rating_avg DECIMAL(3, 2),
    total_downloads BIGINT DEFAULT 0,
    created_at TIMESTAMP
);

CREATE TABLE app_versions (
    id BIGSERIAL PRIMARY KEY,
    app_id BIGINT REFERENCES apps(id),
    version_code INTEGER,
    version_name VARCHAR(50),
    apk_url VARCHAR(500),
    apk_size_bytes BIGINT,
    min_sdk_version INTEGER,
    release_notes TEXT,
    released_at TIMESTAMP
);

CREATE TABLE downloads (
    id BIGSERIAL PRIMARY KEY,
    app_id BIGINT,
    user_id BIGINT,
    version_id BIGINT,
    device_id VARCHAR(255),
    downloaded_at TIMESTAMP
);
```

**Key Features:**
1. **Search & Discovery**: Elasticsearch for full-text search
2. **CDN Distribution**: CloudFront/Akamai for APK delivery
3. **Version Management**: Support multiple versions
4. **In-app Purchases**: Payment gateway integration

**Interview Points:**
- How to handle millions of downloads? (CDN, parallel downloads, resume support)
- How to prevent piracy? (License verification, DRM)
- How to rank apps? (Downloads, ratings, engagement metrics)

---

## 3. Zoom (Video Conferencing) - LLD

### Problem Statement
Design a video conferencing platform (Low-Level Design focus).

### Key Requirements
- Real-time video/audio streaming
- Screen sharing
- Chat functionality
- Recording
- Multiple participants
- Low latency (\u003c200ms)

### Architecture Highlights

**Components:**
- Signaling Server (WebRTC)
- Media Server (SFU - Selective Forwarding Unit)
- TURN/STUN Servers (NAT traversal)
- Recording Service
- Chat Service

**Class Design:**
```javascript
class Meeting {
    constructor(meetingId, host) {
        this.meetingId = meetingId;
        this.host = host;
        this.participants = [];
        this.status = 'WAITING';
        this.startTime = null;
        this.endTime = null;
    }
    
    join(participant) {
        this.participants.push(participant);
        this.notifyParticipants('USER_JOINED', participant);
    }
    
    leave(participant) {
        this.participants = this.participants.filter(p => p.id !== participant.id);
        this.notifyParticipants('USER_LEFT', participant);
    }
}

class Participant {
    constructor(userId, name) {
        this.id = userId;
        this.name = name;
        this.videoEnabled = true;
        this.audioEnabled = true;
        this.screenSharing = false;
        this.peerConnection = null;
    }
    
    toggleVideo() {
        this.videoEnabled = !this.videoEnabled;
    }
    
    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
    }
}

class MediaStream {
    constructor(participant) {
        this.participant = participant;
        this.videoTrack = null;
        this.audioTrack = null;
    }
    
    startStream() {
        // Initialize WebRTC peer connection
    }
    
    stopStream() {
        // Close peer connection
    }
}
```

**Key Features:**
1. **WebRTC**: Peer-to-peer video/audio
2. **SFU Architecture**: Server forwards streams (scalable)
3. **Adaptive Bitrate**: Adjust quality based on bandwidth
4. **Recording**: Server-side recording to cloud storage

**Interview Points:**
- How to handle 100+ participants? (SFU vs MCU, simulcast)
- How to reduce latency? (UDP, WebRTC, edge servers)
- How to handle poor network? (Adaptive bitrate, FEC)

---

## 4. Waste Management App

### Problem Statement
Design an app for waste collection and management with route optimization.

### Key Requirements
- Route optimization for collection trucks
- Real-time tracking
- Scheduling system
- IoT sensor integration (bin fill levels)
- Analytics dashboard

### Architecture Highlights

**Components:**
- Mobile App (for drivers)
- Admin Dashboard
- Route Optimization Service
- IoT Integration Service
- Analytics Service

**Database Schema:**
```sql
CREATE TABLE bins (
    id BIGSERIAL PRIMARY KEY,
    bin_number VARCHAR(50) UNIQUE,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    capacity_liters INTEGER,
    current_fill_level INTEGER,  -- Percentage
    sensor_id VARCHAR(100),
    zone_id BIGINT,
    last_emptied TIMESTAMP
);

CREATE TABLE collection_routes (
    id BIGSERIAL PRIMARY KEY,
    route_name VARCHAR(255),
    zone_id BIGINT,
    assigned_truck_id BIGINT,
    assigned_driver_id BIGINT,
    scheduled_date DATE,
    status VARCHAR(50),
    optimized_path JSONB  -- Array of bin IDs in order
);

CREATE TABLE collections (
    id BIGSERIAL PRIMARY KEY,
    bin_id BIGINT,
    route_id BIGINT,
    collected_at TIMESTAMP,
    fill_level_before INTEGER,
    weight_kg DECIMAL(10, 2)
);
```

**Key Features:**
1. **Route Optimization**: Traveling Salesman Problem (TSP) algorithm
2. **IoT Integration**: Real-time bin fill level monitoring
3. **Predictive Analytics**: ML model to predict bin fill rates
4. **Real-time Tracking**: GPS tracking of collection trucks

**Interview Points:**
- How to optimize routes? (TSP algorithms, genetic algorithms, Google OR-Tools)
- How to handle IoT data? (MQTT, time-series database)
- How to scale? (Partition by zone, async processing)

---

## 5. Warehouse Management System

### Problem Statement
Design a warehouse operations management system.

### Key Requirements
- Inventory tracking
- Picking and packing workflows
- Barcode/RFID integration
- Space optimization
- Multi-warehouse coordination
- Real-time stock updates

### Architecture Highlights

**Components:**
- Warehouse Management Service
- Inventory Service
- Order Fulfillment Service
- Barcode Scanner Integration
- Analytics Dashboard

**Database Schema:**
```sql
CREATE TABLE warehouses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    location VARCHAR(255),
    total_capacity INTEGER,
    zones JSONB
);

CREATE TABLE warehouse_inventory (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT,
    product_id BIGINT,
    zone VARCHAR(50),
    aisle VARCHAR(50),
    rack VARCHAR(50),
    shelf VARCHAR(50),
    quantity INTEGER,
    last_updated TIMESTAMP
);

CREATE TABLE pick_lists (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT,
    warehouse_id BIGINT,
    picker_id BIGINT,
    status VARCHAR(50),
    items JSONB,
    created_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE packing_slips (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT,
    pick_list_id BIGINT,
    packer_id BIGINT,
    box_dimensions JSONB,
    weight_kg DECIMAL(10, 2),
    shipping_label_url VARCHAR(500),
    packed_at TIMESTAMP
);
```

**Key Features:**
1. **Space Optimization**: Algorithm to assign optimal storage locations
2. **Pick Path Optimization**: Minimize walking distance for pickers
3. **Wave Picking**: Batch multiple orders for efficiency
4. **RFID Integration**: Real-time inventory tracking

**Interview Points:**
- How to optimize picking? (Zone picking, wave picking, batch picking)
- How to handle multi-warehouse? (Inventory allocation algorithm)
- How to ensure accuracy? (Barcode verification, cycle counting)

---

## Common Patterns Across All Systems

### Scalability
- **Horizontal Scaling**: Add more servers
- **Database Sharding**: Partition by region/zone
- **Caching**: Redis for hot data
- **CDN**: For static assets

### Reliability
- **Redundancy**: Multiple instances
- **Health Checks**: Monitor service health
- **Circuit Breakers**: Prevent cascading failures
- **Retry Logic**: Handle transient failures

### Performance
- **Async Processing**: Message queues
- **Batch Operations**: Reduce database calls
- **Connection Pooling**: Reuse database connections
- **Indexing**: Optimize query performance

### Security
- **Authentication**: JWT tokens
- **Authorization**: RBAC (Role-Based Access Control)
- **Encryption**: TLS for data in transit, AES for data at rest
- **Rate Limiting**: Prevent abuse

---

## Interview Preparation Tips

1. **Start with Requirements**: Clarify functional and non-functional requirements
2. **Draw Architecture**: High-level components and data flow
3. **Deep Dive**: Database schema, API design, algorithms
4. **Discuss Trade-offs**: CAP theorem, consistency vs availability
5. **Scale Estimation**: Calculate QPS, storage, bandwidth
6. **Handle Edge Cases**: Failures, race conditions, data inconsistency

---

**For detailed implementations, refer to individual system design documents.**
