# Rating System for E-commerce: Visual Diagrams

## 1. Complete Rating System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web App]
        Mobile[Mobile App]
    end
    
    subgraph "API Gateway"
        Gateway[API Gateway<br/>Rate Limiting<br/>Authentication]
    end
    
    subgraph "Core Services"
        Review[Review Service]
        Moderation[Moderation Service]
        Aggregation[Rating Aggregation]
        Voting[Voting Service]
    end
    
    subgraph "ML/AI Services"
        Spam[Spam Detection<br/>ML Model]
        Sentiment[Sentiment Analysis<br/>NLP Model]
        ImageMod[Image Moderation<br/>Vision API]
    end
    
    subgraph "Storage"
        DB[(PostgreSQL<br/>Reviews & Ratings)]
        Cache[(Redis<br/>Aggregated Ratings)]
        Search[(Elasticsearch<br/>Review Search)]
        S3[(S3<br/>Review Images)]
    end
    
    subgraph "Queue"
        Queue[RabbitMQ<br/>Async Processing]
    end
    
    Web --> Gateway
    Mobile --> Gateway
    Gateway --> Review
    Gateway --> Voting
    
    Review --> Moderation
    Moderation --> Spam
    Moderation --> Sentiment
    Moderation --> ImageMod
    
    Review --> Queue
    Queue --> Aggregation
    Aggregation --> Cache
    
    Review --> DB
    Review --> Search
    Review --> S3
```

## 2. Review Submission Flow

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Verify as Purchase Verification
    participant Spam as Spam Detection
    participant Sentiment
    participant DB
    participant Aggregation
    participant Cache
    
    User->>API: Submit Review<br/>(product_id, rating, comment)
    API->>Verify: Verify Purchase
    
    alt Verified Purchase
        Verify-->>API: Verified ✓
        API->>Spam: Check Spam Score
        Spam-->>API: Score: 0.15 (Low)
        API->>Sentiment: Analyze Sentiment
        Sentiment-->>API: Score: 0.75 (Positive)
        
        alt Spam Score < 0.5
            API->>DB: Save Review<br/>Status: APPROVED
            API->>Aggregation: Update Aggregate Rating
            Aggregation->>Cache: Update Cache
            API-->>User: Review Posted ✓
        else High Spam Score
            API->>DB: Save Review<br/>Status: PENDING
            API-->>User: Review Under Moderation
        end
    else Not Verified
        Verify-->>API: Not Verified
        API->>DB: Save Review<br/>is_verified: false
        API-->>User: Review Posted<br/>(Unverified)
    end
```

## 3. Rating Aggregation Process

```mermaid
flowchart TD
    NewReview[New Review Submitted] --> Queue[Add to Queue]
    Queue --> Process[Aggregation Service]
    
    Process --> Calc[Calculate Metrics]
    Calc --> Avg[Average Rating<br/>SUM(ratings) / COUNT]
    Calc --> Dist[Rating Distribution<br/>Count per star]
    Calc --> Total[Total Reviews]
    
    Avg --> Update[Update product_ratings Table]
    Dist --> Update
    Total --> Update
    
    Update --> Cache[Update Redis Cache]
    Cache --> Invalidate[Invalidate Old Cache]
    Invalidate --> Notify[Notify Subscribers]
```

## 4. Spam Detection Pipeline

```mermaid
graph TB
    subgraph "Input"
        Review[Review Text]
        Images[Review Images]
    end
    
    subgraph "Text Analysis"
        Keywords[Spam Keywords<br/>Detection]
        Caps[Excessive Caps<br/>Detection]
        Links[URL Detection]
        Duplicate[Duplicate Content<br/>Check]
    end
    
    subgraph "Image Analysis"
        ImgSpam[Inappropriate Content]
        ImgText[Text in Images<br/>OCR]
    end
    
    subgraph "Behavioral"
        RateLimit[Review Frequency]
        Pattern[User Pattern<br/>Analysis]
    end
    
    subgraph "Scoring"
        Score[Spam Score<br/>0.0 - 1.0]
    end
    
    Review --> Keywords
    Review --> Caps
    Review --> Links
    Review --> Duplicate
    
    Images --> ImgSpam
    Images --> ImgText
    
    Keywords --> Score
    Caps --> Score
    Links --> Score
    Duplicate --> Score
    ImgSpam --> Score
    ImgText --> Score
    RateLimit --> Score
    Pattern --> Score
    
    Score --> Decision{Score > 0.5?}
    Decision -->|Yes| Reject[Flag for Moderation]
    Decision -->|No| Approve[Auto-Approve]
```

## 5. Review Voting System

```mermaid
stateDiagram-v2
    [*] --> NoVote: Initial State
    
    NoVote --> Helpful: User Votes Helpful
    NoVote --> NotHelpful: User Votes Not Helpful
    
    Helpful --> NoVote: Remove Vote
    NotHelpful --> NoVote: Remove Vote
    
    Helpful --> NotHelpful: Change Vote
    NotHelpful --> Helpful: Change Vote
    
    note right of Helpful
        Increment helpful_count
        User can vote once
    end note
    
    note right of NotHelpful
        Increment not_helpful_count
        User can vote once
    end note
```

## 6. Review Moderation Workflow

```mermaid
flowchart TD
    Submit[Review Submitted] --> Auto{Auto-Approve?}
    
    Auto -->|Spam Score < 0.3| Approved[Status: APPROVED<br/>Publish Immediately]
    Auto -->|Spam Score 0.3-0.7| Queue[Status: PENDING<br/>Add to Moderation Queue]
    Auto -->|Spam Score > 0.7| Rejected[Status: REJECTED<br/>Auto-Reject]
    
    Queue --> Moderator[Human Moderator<br/>Reviews Content]
    
    Moderator --> Decision{Moderator<br/>Decision}
    Decision -->|Approve| Approved
    Decision -->|Reject| Rejected
    Decision -->|Flag User| Ban[Ban User<br/>Block Future Reviews]
    
    Approved --> Publish[Publish Review<br/>Update Aggregates]
    Rejected --> Notify[Notify User<br/>Rejection Reason]
    Ban --> Notify
```

## 7. Rating Distribution Visualization

```mermaid
graph LR
    subgraph "Product Rating Summary"
        Avg[Average: 4.2 ⭐<br/>Total Reviews: 1,247]
    end
    
    subgraph "Distribution"
        R5[5 Star: 650<br/>52%]
        R4[4 Star: 380<br/>30%]
        R3[3 Star: 125<br/>10%]
        R2[2 Star: 62<br/>5%]
        R1[1 Star: 30<br/>3%]
    end
    
    subgraph "Filters"
        Verified[Verified Only: 980]
        Recent[Last 30 Days: 145]
        Images[With Images: 420]
    end
    
    Avg --> R5
    Avg --> R4
    Avg --> R3
    Avg --> R2
    Avg --> R1
```

## 8. Review Search and Filtering

```mermaid
flowchart TD
    Search[User Search Query] --> ES[Elasticsearch]
    
    ES --> Filters{Apply Filters}
    
    Filters --> F1[Rating Filter<br/>e.g., 4-5 stars]
    Filters --> F2[Verified Purchase<br/>Only]
    Filters --> F3[Date Range<br/>Last 30 days]
    Filters --> F4[Has Images]
    Filters --> F5[Keyword Search<br/>in review text]
    
    F1 --> Sort{Sort By}
    F2 --> Sort
    F3 --> Sort
    F4 --> Sort
    F5 --> Sort
    
    Sort --> S1[Most Helpful]
    Sort --> S2[Most Recent]
    Sort --> S3[Highest Rating]
    Sort --> S4[Lowest Rating]
    
    S1 --> Results[Paginated Results]
    S2 --> Results
    S3 --> Results
    S4 --> Results
```

## 9. Sentiment Analysis

```mermaid
graph TB
    subgraph "Review Text"
        Text["Great product! Fast shipping.<br/>Highly recommend. Worth the price."]
    end
    
    subgraph "NLP Processing"
        Tokenize[Tokenization]
        POS[Part-of-Speech Tagging]
        Extract[Feature Extraction]
    end
    
    subgraph "Sentiment Scoring"
        Positive[Positive Words:<br/>great, fast, recommend]
        Negative[Negative Words:<br/>none]
        Neutral[Neutral Words:<br/>product, shipping, price]
    end
    
    subgraph "Result"
        Score[Sentiment Score: 0.85<br/>Classification: POSITIVE]
    end
    
    Text --> Tokenize
    Tokenize --> POS
    POS --> Extract
    Extract --> Positive
    Extract --> Negative
    Extract --> Neutral
    
    Positive --> Score
    Negative --> Score
    Neutral --> Score
```

## 10. Performance Monitoring

```mermaid
graph TB
    subgraph "Review Metrics"
        M1[Reviews/Day<br/>Current: 1,250]
        M2[Approval Rate<br/>85%]
        M3[Spam Detection Rate<br/>12%]
        M4[Avg Review Length<br/>145 words]
    end
    
    subgraph "Engagement Metrics"
        E1[Reviews with Votes<br/>45%]
        E2[Reviews with Images<br/>35%]
        E3[Verified Purchase %<br/>78%]
    end
    
    subgraph "Quality Metrics"
        Q1[Helpful Vote Ratio<br/>4.2:1]
        Q2[Sentiment Distribution<br/>Pos: 65%, Neu: 25%, Neg: 10%]
    end
    
    subgraph "Dashboard"
        Grafana[Grafana Dashboard]
    end
    
    M1 --> Grafana
    M2 --> Grafana
    M3 --> Grafana
    M4 --> Grafana
    E1 --> Grafana
    E2 --> Grafana
    E3 --> Grafana
    Q1 --> Grafana
    Q2 --> Grafana
```

## Key Performance Indicators

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Review Submission | \u003c 500ms | 300ms | ✅ |
| Rating Query | \u003c 50ms | 20ms (cached) | ✅ |
| Spam Detection | \u003c 200ms | 150ms | ✅ |
| Search Latency | \u003c 300ms | 200ms | ✅ |
| Approval Rate | \u003e 80% | 85% | ✅ |
| Cache Hit Rate | \u003e 90% | 94% | ✅ |

## Review Quality Scoring

```mermaid
flowchart TD
    Review[Review Submitted] --> Factors{Quality Factors}
    
    Factors --> F1[Length > 50 words<br/>+10 points]
    Factors --> F2[Has Images<br/>+15 points]
    Factors --> F3[Verified Purchase<br/>+20 points]
    Factors --> F4[Detailed Rating<br/>+10 points]
    Factors --> F5[Helpful Votes<br/>+5 per vote]
    
    F1 --> Total[Total Quality Score]
    F2 --> Total
    F3 --> Total
    F4 --> Total
    F5 --> Total
    
    Total --> Rank{Score Range}
    Rank -->|80-100| Featured[Featured Review<br/>Show First]
    Rank -->|50-79| Normal[Normal Review]
    Rank -->|0-49| Low[Low Quality<br/>Show Last]
```

## Abuse Prevention

```mermaid
graph TB
    subgraph "Detection"
        D1[Multiple Reviews<br/>Same Product]
        D2[Review Bombing<br/>Pattern]
        D3[Competitor Attack<br/>Detection]
        D4[Fake Account<br/>Detection]
    end
    
    subgraph "Actions"
        A1[Rate Limiting<br/>1 review/product/user]
        A2[Velocity Check<br/>Max 5 reviews/day]
        A3[Account Age Check<br/>Min 30 days old]
        A4[Purchase History<br/>Verification]
    end
    
    subgraph "Response"
        R1[Flag for Review]
        R2[Temporary Ban]
        R3[Permanent Ban]
    end
    
    D1 --> A1
    D2 --> A2
    D3 --> A3
    D4 --> A4
    
    A1 --> R1
    A2 --> R1
    A3 --> R2
    A4 --> R3
```
