# Parking Lot Reservation System: Visual Diagrams

## 1. Complete System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Mobile[Mobile App]
        Web[Web Portal]
        Kiosk[Entry/Exit Kiosk]
    end
    
    subgraph "API Gateway"
        Gateway[API Gateway<br/>Authentication<br/>Rate Limiting]
    end
    
    subgraph "Core Services"
        Reservation[Reservation Service]
        Availability[Availability Service]
        Payment[Payment Service]
        Pricing[Dynamic Pricing Service]
        EntryExit[Entry/Exit Service]
    end
    
    subgraph "Storage"
        DB[(PostgreSQL<br/>Reservations & Spots)]
        Cache[(Redis<br/>Availability Cache<br/>Distributed Locks)]
    end
    
    subgraph "Hardware Integration"
        Sensors[Parking Sensors<br/>IoT Devices]
        Gates[Entry/Exit Gates<br/>Barrier Control]
        Cameras[License Plate Cameras<br/>OCR Recognition]
    end
    
    subgraph "External Services"
        Maps[Google Maps API]
        PaymentGW[Stripe/PayPal]
        Notifications[Twilio/SendGrid]
    end
    
    Mobile --> Gateway
    Web --> Gateway
    Kiosk --> Gateway
    
    Gateway --> Reservation
    Gateway --> Availability
    Gateway --> Payment
    
    Reservation --> DB
    Availability --> Cache
    Availability --> DB
    
    Sensors --> Availability
    Gates --> EntryExit
    Cameras --> EntryExit
    
    Pricing --> Reservation
    Payment --> PaymentGW
    Reservation --> Notifications
```

## 2. Reservation Flow with Concurrency Control

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Lock as Redis Lock
    participant DB as PostgreSQL
    participant Payment
    
    User->>API: Request Reservation<br/>(lot_id, time_slot)
    API->>Lock: Acquire Lock<br/>lock:lot:123
    
    alt Lock Acquired
        Lock-->>API: Lock Granted (5s timeout)
        API->>DB: BEGIN TRANSACTION
        API->>DB: Find Available Spot<br/>FOR UPDATE SKIP LOCKED
        
        alt Spot Available
            DB-->>API: Spot Found (Spot #45)
            API->>API: Calculate Price<br/>$10 for 2 hours
            API->>DB: Create Reservation
            API->>DB: Update Spot Status: RESERVED
            API->>DB: COMMIT
            API->>Payment: Process Payment
            
            alt Payment Success
                Payment-->>API: Payment Confirmed
                API->>Lock: Release Lock
                API-->>User: Reservation Confirmed<br/>Code: PKG-ABC123
            else Payment Failed
                Payment-->>API: Payment Failed
                API->>DB: Rollback Reservation
                API->>Lock: Release Lock
                API-->>User: Payment Error
            end
        else No Spots Available
            DB-->>API: No Available Spots
            API->>DB: ROLLBACK
            API->>Lock: Release Lock
            API-->>User: No Availability
        end
    else Lock Failed
        Lock-->>API: Lock Timeout
        API-->>User: Please Try Again
    end
```

## 3. Parking Spot State Machine

```mermaid
stateDiagram-v2
    [*] --> Available: Spot Created
    
    Available --> Reserved: Reservation Made
    Available --> Occupied: Walk-in Entry
    
    Reserved --> Occupied: Vehicle Enters
    Reserved --> Available: Reservation Cancelled
    Reserved --> Available: Reservation Expired (No-show)
    
    Occupied --> Available: Vehicle Exits
    Occupied --> Maintenance: Issue Reported
    
    Maintenance --> Available: Maintenance Complete
    
    Available --> Maintenance: Scheduled Maintenance
    
    note right of Reserved
        Auto-expire after
        grace period (15 min)
    end note
```

## 4. Dynamic Pricing Model

```mermaid
graph TB
    subgraph "Pricing Factors"
        Base[Base Rate<br/>$5/hour]
        Time[Time of Day<br/>Peak/Off-peak]
        Demand[Current Demand<br/>Occupancy %]
        Event[Special Events<br/>Concerts, Games]
        Duration[Duration<br/>Hourly/Daily]
    end
    
    subgraph "Calculation"
        Formula[Final Price =<br/>Base × Time Multiplier<br/>× Demand Multiplier<br/>× Event Multiplier]
    end
    
    subgraph "Examples"
        Ex1[Weekday 2 PM<br/>50% Occupancy<br/>$5/hour]
        Ex2[Friday 7 PM<br/>90% Occupancy<br/>Concert Nearby<br/>$15/hour]
        Ex3[Sunday 10 AM<br/>30% Occupancy<br/>$4/hour]
    end
    
    Base --> Formula
    Time --> Formula
    Demand --> Formula
    Event --> Formula
    Duration --> Formula
    
    Formula --> Ex1
    Formula --> Ex2
    Formula --> Ex3
```

## 5. Entry Process Flow

```mermaid
flowchart TD
    Start[Vehicle Arrives] --> Scan{Scan Method?}
    
    Scan -->|QR Code| QR[Scan QR Code<br/>from App]
    Scan -->|License Plate| LPR[Camera OCR<br/>Read Plate]
    Scan -->|Manual| Manual[Enter Code<br/>at Kiosk]
    
    QR --> Validate{Valid<br/>Reservation?}
    LPR --> Validate
    Manual --> Validate
    
    Validate -->|Yes| CheckTime{Within<br/>Time Window?}
    Validate -->|No| Error1[Show Error<br/>Invalid Reservation]
    
    CheckTime -->|Yes| UpdateDB[Update DB<br/>Status: ACTIVE<br/>Entry Time: NOW]
    CheckTime -->|No| Error2[Show Error<br/>Too Early/Late]
    
    UpdateDB --> OpenGate[Open Barrier Gate]
    OpenGate --> Assign[Display Spot Number<br/>"Proceed to Spot #45"]
    Assign --> Close[Close Gate<br/>After Vehicle Passes]
    
    Error1 --> End[Deny Entry]
    Error2 --> End
```

## 6. Exit and Payment Flow

```mermaid
sequenceDiagram
    participant Vehicle
    participant Kiosk
    participant System
    participant Payment
    participant Gate
    
    Vehicle->>Kiosk: Scan Exit Code
    Kiosk->>System: Lookup Reservation
    System-->>Kiosk: Reservation Details
    
    System->>System: Calculate Duration<br/>Entry: 2:00 PM<br/>Exit: 4:30 PM<br/>Duration: 2.5 hours
    
    System->>System: Check Overstay
    
    alt Within Reserved Time
        System-->>Kiosk: No Additional Charge<br/>Paid: $10
        Kiosk->>Gate: Open Gate
    else Overstay
        System-->>Kiosk: Overstay Charge<br/>Extra 30 min: $3
        Kiosk->>Vehicle: Display Payment Due
        Vehicle->>Payment: Pay $3
        Payment-->>Kiosk: Payment Confirmed
        Kiosk->>Gate: Open Gate
    end
    
    Gate->>System: Update Spot Status: AVAILABLE
    System->>System: Complete Reservation
```

## 7. Real-time Availability Dashboard

```mermaid
graph TB
    subgraph "Parking Lot Overview"
        Total[Total Spots: 500]
        Available[Available: 125]
        Occupied[Occupied: 320]
        Reserved[Reserved: 45]
        Maintenance[Maintenance: 10]
    end
    
    subgraph "By Floor"
        F1[Floor 1<br/>Available: 30/150]
        F2[Floor 2<br/>Available: 45/150]
        F3[Floor 3<br/>Available: 50/200]
    end
    
    subgraph "By Type"
        Regular[Regular: 100/400]
        Compact[Compact: 15/60]
        Handicapped[Handicapped: 8/20]
        EV[EV Charging: 2/20]
    end
    
    subgraph "Occupancy Rate"
        Rate[75% Occupied<br/>🟡 Moderate Demand]
    end
    
    Total --> Available
    Total --> Occupied
    Total --> Reserved
    Total --> Maintenance
    
    Available --> F1
    Available --> F2
    Available --> F3
    
    Available --> Regular
    Available --> Compact
    Available --> Handicapped
    Available --> EV
```

## 8. IoT Sensor Integration

```mermaid
sequenceDiagram
    participant Sensor as Parking Sensor
    participant Gateway as IoT Gateway
    participant MQTT as MQTT Broker
    participant Service as Availability Service
    participant DB as Database
    participant WS as WebSocket
    participant App as Mobile App
    
    Sensor->>Sensor: Detect Vehicle<br/>Ultrasonic/Magnetic
    Sensor->>Gateway: Send Status<br/>{spot_id: 45, occupied: true}
    Gateway->>MQTT: Publish to Topic<br/>parking/spot/45
    
    MQTT->>Service: Subscribe & Receive
    Service->>DB: Update Spot Status
    Service->>Service: Update Cache
    Service->>WS: Broadcast Update
    WS->>App: Real-time Update<br/>Spot #45 Now Occupied
```

## 9. No-Show Handling

```mermaid
flowchart TD
    Reservation[Reservation Made<br/>Start Time: 2:00 PM] --> Grace[Grace Period<br/>15 minutes]
    
    Grace --> Check{Vehicle<br/>Entered?}
    
    Check -->|Yes, by 2:15 PM| Active[Reservation Active<br/>Spot Occupied]
    Check -->|No, after 2:15 PM| NoShow[Mark as No-Show]
    
    NoShow --> Release[Release Spot<br/>Status: AVAILABLE]
    Release --> Penalty{Charge<br/>No-Show Fee?}
    
    Penalty -->|Yes| Charge[Charge $5<br/>No-Show Penalty]
    Penalty -->|No| Free[No Charge<br/>First Offense]
    
    Charge --> Notify1[Send Notification<br/>Email + SMS]
    Free --> Notify2[Send Warning<br/>Email]
    
    Notify1 --> Log[Log Incident]
    Notify2 --> Log
```

## 10. Multi-Location Search

```mermaid
graph TB
    subgraph "User Search"
        User[User Location<br/>Lat: 40.7128<br/>Lng: -74.0060]
        Radius[Search Radius<br/>5 km]
        Time[Time Slot<br/>2 PM - 4 PM]
    end
    
    subgraph "Nearby Parking Lots"
        L1[Lot 1<br/>Distance: 0.5 km<br/>Available: 45<br/>Price: $10]
        L2[Lot 2<br/>Distance: 1.2 km<br/>Available: 20<br/>Price: $8]
        L3[Lot 3<br/>Distance: 2.1 km<br/>Available: 60<br/>Price: $12]
    end
    
    subgraph "Sorting Options"
        Sort1[By Distance]
        Sort2[By Price]
        Sort3[By Availability]
    end
    
    subgraph "Results"
        Result[Recommended: Lot 2<br/>Best Balance:<br/>Price & Distance]
    end
    
    User --> L1
    User --> L2
    User --> L3
    Radius -.-> L1
    Radius -.-> L2
    Radius -.-> L3
    
    L1 --> Sort1
    L2 --> Sort1
    L3 --> Sort1
    
    Sort1 --> Result
    Sort2 --> Result
    Sort3 --> Result
```

## Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Reservation Creation | \u003c 500ms | 300ms | ✅ |
| Availability Query | \u003c 200ms | 100ms | ✅ |
| Entry Processing | \u003c 2s | 1.2s | ✅ |
| Exit Processing | \u003c 3s | 2.1s | ✅ |
| Sensor Update Latency | \u003c 1s | 500ms | ✅ |
| System Uptime | \u003e 99.9% | 99.95% | ✅ |

## Concurrency Handling

```mermaid
flowchart TD
    Req1[Request 1<br/>User A] --> Lock{Try Acquire<br/>Redis Lock}
    Req2[Request 2<br/>User B] --> Lock
    
    Lock -->|User A Gets Lock| Process1[Process Reservation<br/>Find & Reserve Spot]
    Lock -->|User B Waits| Wait[Wait for Lock<br/>Timeout: 5s]
    
    Process1 --> Release[Release Lock]
    Release --> Wait
    Wait --> Retry{Lock Available?}
    
    Retry -->|Yes| Process2[Process Reservation<br/>Find Next Available Spot]
    Retry -->|No, Timeout| Error[Return Error<br/>Please Try Again]
    
    Process2 --> Success[Reservation Success]
```
