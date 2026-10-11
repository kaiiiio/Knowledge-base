# Deep Dive: Production Architecture Patterns

This file covers the architectural patterns actually used in production systems, with enough technical depth to reason about trade-offs, not just name-drop them.

## Table of Contents
1. Multi-Tier Architecture
2. Microservices on Kubernetes with Service Mesh (Istio)
3. Event-Driven Architecture (SQS/SNS, Kafka)
4. Blue-Green & Canary Deployments
5. Auto-Scaling Strategies
6. Disaster Recovery Strategies (RTO/RPO)
7. Worked Example: HA 3-Tier Web App on AWS

---

## 1. Multi-Tier Architecture

The classic pattern: separate a system into layers with distinct responsibilities and scaling characteristics, each isolated by a network boundary.

- **Presentation tier** — load balancer + web/static assets (often via CDN).
- **Application tier** — stateless compute running business logic (EC2/ECS/EKS/Lambda).
- **Data tier** — databases, caches, object storage.

Why it matters architecturally:
- Each tier scales independently (app tier scales out under load; DB tier scales via read replicas/vertical scaling).
- Network segmentation: only the LB is internet-facing; app tier lives in private subnets reachable only from the LB; data tier lives in private subnets reachable only from the app tier. This minimizes blast radius if one tier is compromised.
- Stateless app tier is a prerequisite for horizontal auto-scaling — session state must live in a shared store (Redis/DynamoDB), not local memory.

Trade-off: added network hops increase latency slightly and operational complexity (more security groups, more subnets) versus a monolithic single-tier deploy — but it's the baseline production pattern because it enables independent scaling, security isolation, and fault containment.

---

## 2. Microservices on Kubernetes with Service Mesh (Istio)

### Why microservices
Splitting a monolith into independently deployable services aligned to business capabilities (team-owned, independently deployed, independently scaled). Trade-offs you take on: network calls replace function calls (latency, partial failure), distributed data consistency, and significantly more operational surface area (hence why this almost always pairs with Kubernetes + strong observability).

### The service mesh problem
Once you have dozens of services calling each other over the network, you need, consistently, across all of them: mutual TLS, retries/timeouts/circuit breaking, traffic shifting for canary releases, and fine-grained traffic observability — without rewriting that logic into every service's code in every language.

### Istio's approach: the sidecar proxy
Istio injects an **Envoy proxy container** into every Pod (sidecar pattern). All inbound/outbound traffic for the Pod's main container is transparently routed through this proxy via iptables rules. This gives you:

- **mTLS everywhere** — Istio's control plane (`istiod`) auto-issues and rotates certificates; services authenticate each other without any app code changes.
- **Traffic management** — `VirtualService` and `DestinationRule` objects let you do weighted traffic splitting (canary), fault injection (chaos testing), retries, and timeouts declaratively.
- **Observability** — every Envoy proxy emits consistent metrics (latency, error rate, request volume) regardless of the language the service is written in — the basis for a service mesh dashboard (often Kiali) and the "golden signals."
- **Policy enforcement** — `AuthorizationPolicy` objects define which services may call which, independent of application-level auth.

### Example: Istio canary traffic split

```yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: reviews-route
spec:
  hosts:
    - reviews
  http:
    - route:
        - destination:
            host: reviews
            subset: v1
          weight: 90
        - destination:
            host: reviews
            subset: v2
          weight: 10
---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: reviews-destination
spec:
  host: reviews
  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
```

This sends 10% of traffic to `v2` while monitoring error rates/latency, then shifts the weight upward incrementally — the mechanics behind canary releases described in section 4.

### Cost of the mesh
Sidecars add CPU/memory overhead per pod and a non-trivial learning curve (CRDs, `istiod` upgrades, debugging proxy config). Many teams start with just Kubernetes NetworkPolicies + an API gateway and adopt a mesh only once the service count and cross-team traffic complexity justify it (rough rule of thumb: 15-20+ services, multiple teams, real need for mTLS/traffic-shifting at the infra layer).

---

## 3. Event-Driven Architecture

Instead of services calling each other synchronously (tight coupling, cascading failure risk), producers emit **events** to a broker and consumers process them independently and asynchronously.

### SQS + SNS (AWS-native, simpler operational model)
- **SNS (Simple Notification Service)** — pub/sub: one message published, fanned out to multiple subscribers (SQS queues, Lambda, HTTP endpoints, email).
- **SQS (Simple Queue Service)** — durable queue; consumers pull messages, process, then delete (or they reappear after a visibility timeout if not deleted — enabling at-least-once processing and retry).
- **Standard queues** — at-least-once delivery, best-effort ordering, very high throughput.
- **FIFO queues** — exactly-once processing and strict ordering per message group, lower throughput ceiling.
- **Dead-letter queues (DLQ)** — messages that fail processing N times are moved here for investigation instead of blocking the queue or silently dropping.

Common pattern: **SNS fan-out to SQS** — one event (e.g., "order placed") published to an SNS topic, multiple SQS queues subscribed (billing service, shipping service, notification service), each processes independently at its own pace.

### Kafka (when you need log-based streaming semantics)
Kafka is a distributed append-only log, not just a queue:
- **Topics** are partitioned; each partition is an ordered, immutable log.
- Consumers track their own **offset** (position read up to) — multiple consumer groups can independently re-read the same topic from different offsets, including replaying history.
- Enables **event sourcing** (the log is the source of truth, current state is derived by replaying events) and **stream processing** (Kafka Streams/Flink computing aggregates over the live event stream).
- Much higher operational complexity than SQS/SNS (or use a managed offering: AWS MSK, Confluent Cloud) but needed when you require replay, very high throughput with strict per-partition ordering, or multiple independent consumers re-reading history.

### When to pick which
| Need | Choice |
|---|---|
| Simple decoupling, AWS-native, low ops overhead | SQS/SNS |
| Need message replay / event sourcing | Kafka |
| Strict per-key ordering at huge scale | Kafka (partition key) or SQS FIFO (lower throughput) |
| Multiple independent consumer groups re-reading same stream | Kafka |
| Serverless-first stack | SQS/SNS/EventBridge |

### Idempotency — the non-negotiable requirement
At-least-once delivery means consumers **will** see duplicate messages eventually. Every consumer must be idempotent (e.g., dedupe by message ID in a transactional check, or use naturally idempotent operations like "set status to X" rather than "increment counter by 1").

---

## 4. Blue-Green & Canary Deployments

Both aim to reduce the blast radius of a bad deploy versus an all-at-once rolling update.

### Blue-Green
1. **Blue** = current production version, fully serving live traffic.
2. Deploy **Green** = new version, fully provisioned in parallel (same scale as Blue), but receiving zero production traffic.
3. Run smoke tests / synthetic checks against Green directly (via internal URL or a small percentage of mirrored traffic).
4. **Cut over**: flip the load balancer / DNS / target group to point 100% of traffic at Green instantly.
5. Keep Blue running, idle, for a defined soak period (e.g., 30-60 min) — if Green misbehaves, flip back instantly (instant rollback, the main benefit).
6. Once confident, decommission Blue (or keep it as the next rollback target, becoming "Blue" again for the next release).

Concrete AWS mechanics: two target groups (blue-tg, green-tg) behind one ALB; cut over by updating the ALB listener's default action to point at green-tg. Or: two full ASGs/ECS services, swap via Route 53 weighted records or ALB listener rule change.

Cost: you run double the infrastructure during the cutover window.

### Canary
1. Deploy the new version alongside the old, but route only a small percentage of real traffic to it (e.g., 5%).
2. Watch error rate, latency, and business metrics closely for the canary slice specifically (this requires your observability stack to be able to segment by version — a tag/label on metrics).
3. If healthy, incrementally increase traffic share (5% → 25% → 50% → 100%) over a period of hours, pausing at each step.
4. If unhealthy at any step, revert traffic weight to 0% for the new version — much smaller blast radius than blue-green's "it's broken for everyone" risk, since only a fraction of users were ever affected.

Concrete mechanics: ALB weighted target groups, Istio `VirtualService` weight splitting (see section 2), or a managed canary tool (AWS CodeDeploy's canary/linear deployment configs for Lambda/ECS).

### Blue-Green vs Canary — when to use which
| | Blue-Green | Canary |
|---|---|---|
| Rollback speed | Instant (flip back) | Gradual (ramp down) |
| Blast radius if bad | 100% momentarily until flip-back | Small % the whole time |
| Infra cost | 2x during cutover | Minimal extra (small canary fleet) |
| Good for | Database migrations needing a hard cutover point, infrequent major releases | Frequent releases, services with good per-version metrics |

---

## 5. Auto-Scaling Strategies

### Horizontal Pod Autoscaler (HPA) — Kubernetes
Scales the **number of Pod replicas** in a Deployment/StatefulSet based on observed metrics (CPU/memory by default, or custom metrics via Prometheus Adapter/KEDA for queue depth, request rate, etc.).

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
  namespace: demo
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 75
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300   # avoid flapping — wait before scaling down
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Pods
          value: 4
          periodSeconds: 60
```

Pairs with the **Cluster Autoscaler** (adds/removes worker *nodes* when Pods can't be scheduled due to insufficient node capacity, or when nodes are underutilized) — HPA scales Pods, Cluster Autoscaler scales the nodes those Pods run on.

### EC2 Auto Scaling Groups (ASG)
Scales the number of **EC2 instances** based on a **Launch Template** (AMI, instance type, user data) plus scaling policies:
- **Target tracking** — e.g., keep average CPU at 50% (ASG automatically adds/removes instances to hit this).
- **Step scaling** — add N instances when a CloudWatch alarm crosses a threshold, different step sizes for different severity.
- **Scheduled scaling** — pre-emptively scale for known traffic patterns (e.g., scale up before a daily 9am spike).
- **Lifecycle hooks** — pause an instance in a `Pending:Wait` or `Terminating:Wait` state to run custom logic (e.g., drain connections gracefully before termination, register with a service mesh before marking healthy).

Health checks: ASG can use EC2 status checks or ELB health checks — an unhealthy instance is terminated and replaced automatically (this is also your baseline self-healing mechanism, independent of scaling).

### General principles
- Scale on a leading indicator, not just CPU, when possible (e.g., request queue depth predicts load before CPU saturates).
- Set sane `minReplicas`/min-size for baseline availability even at zero traffic (don't scale to zero for latency-sensitive synchronous services).
- Always set a `maxReplicas`/max-size — an unbounded scale-up during a traffic anomaly or bug (e.g., retry storm) can produce a shocking cloud bill.
- Scale down more conservatively (longer stabilization window) than scale up — avoid flapping.

---

## 6. Disaster Recovery Strategies

**RTO (Recovery Time Objective)** — how long you can be down before it's unacceptable. **RPO (Recovery Point Objective)** — how much data loss (measured in time) is acceptable. These two numbers drive which DR strategy you can justify, because each level down the list below buys a lower RTO/RPO at a higher steady-state cost.

| Strategy | RTO | RPO | Cost | Description |
|---|---|---|---|---|
| Backup & Restore | Hours | Hours (since last backup) | $ | Regular backups/snapshots stored (ideally cross-region); on disaster, provision fresh infra and restore from backup. |
| Pilot Light | 10s of minutes | Minutes | $$ | Core/critical systems (e.g., DB) kept running at minimal scale in the DR region, continuously replicated; everything else is provisioned on-demand from IaC/AMIs when disaster strikes. |
| Warm Standby | Minutes | Seconds-minutes | $$$ | A scaled-down but fully functional replica of production always running in the DR region; scale it up to full capacity and cut traffic over on disaster. |
| Multi-Site Active-Active | Near-zero (seconds) | Near-zero | $$$$ | Both regions serve live production traffic simultaneously (behind Route 53 latency/weighted routing); if one region fails, the other already has full capacity and traffic simply routes around the failure. |

### Mechanics worth knowing
- **Backup/restore**: automate with AWS Backup (centralizes EBS/RDS/DynamoDB/EFS snapshot schedules + cross-region copy). Test restores regularly — an untested backup is not a real backup.
- **Pilot light**: typically means your RDS instance is a cross-region read replica kept in sync continuously (low RPO for data), while app-tier compute (ASG/ECS) exists only as a Launch Template/Task Definition + Terraform code, ready to `apply` on demand.
- **Warm standby**: the DR region runs the same app stack at e.g. 10-20% of production's scale, continuously, validating that deploys/configs actually work there — then an ASG scaling policy or manual scale-up handles the capacity jump.
- **Active-active**: requires your data layer to support multi-region writes (DynamoDB Global Tables, Aurora Global Database with limited write forwarding, or an application-level conflict-resolution strategy) — this is the hardest and most expensive tier because it pushes you into distributed-data-consistency problems, not just infrastructure replication.

Choosing a tier is a business conversation: translate "we need 4 nines" into an actual RTO/RPO number with the business stakeholders, then pick the cheapest strategy that meets it — don't default to active-active because it's the "best" one.

---

## 7. Worked Example: Highly Available 3-Tier Web App on AWS

**Requirements:** public web app, handles variable traffic, needs to survive an AZ outage, RDS as the data store, static assets cached globally.

### Architecture

```
                                   ┌─────────────────┐
                      Users ──────▶│   Route 53 (DNS)  │
                                   └─────────┬────────┘
                                             │
                                   ┌─────────▼────────┐
                                   │   CloudFront CDN  │ (caches static assets, TLS termination)
                                   └─────────┬────────┘
                                             │ (dynamic requests pass through)
                                   ┌─────────▼────────┐
                                   │        WAF         │ (blocks common exploits/bots)
                                   └─────────┬────────┘
                                             │
                        ┌────────────────────▼───────────────────────┐
                        │        Application Load Balancer (ALB)      │
                        │      spans AZ-a and AZ-b, public subnets    │
                        └─────────────┬──────────────┬────────────────┘
                                      │              │
                  ┌───────────────────▼───┐   ┌──────▼─────────────────┐
                  │   AZ-a: Private Subnet │   │  AZ-b: Private Subnet  │
                  │  ┌──────────────────┐  │   │  ┌──────────────────┐  │
                  │  │ EC2 / ECS tasks  │  │   │  │ EC2 / ECS tasks  │  │
                  │  │ (app tier, ASG)  │◀─┼───┼─▶│ (app tier, ASG)  │  │
                  │  └────────┬─────────┘  │   │  └────────┬─────────┘  │
                  └───────────┼────────────┘   └───────────┼────────────┘
                              │                             │
                  ┌───────────▼────────────┐   ┌────────────▼───────────┐
                  │  AZ-a: Data Subnet      │   │  AZ-b: Data Subnet     │
                  │  RDS Primary (Multi-AZ) │──▶│  RDS Standby (sync)    │
                  └─────────────────────────┘   └────────────────────────┘

                  ElastiCache Redis (session/cache, Multi-AZ) sits beside RDS in data subnets
                  S3 bucket (static assets, user uploads) — origin for CloudFront, outside the VPC
```

### Component decisions and why

| Layer | Choice | Rationale |
|---|---|---|
| DNS | Route 53 | Health-check-based failover if entire ALB/region becomes unhealthy |
| Edge | CloudFront + WAF | Offloads static asset traffic from origin, blocks SQLi/XSS patterns before they reach the ALB |
| Load Balancer | ALB across 2+ AZs | L7 routing, native health checks drop unhealthy targets automatically, integrates with ACM for free TLS certs |
| App tier | ECS Fargate (or EC2 ASG) across 2 private subnets (one per AZ) | Stateless, horizontally scaled via target-tracking (CPU/request count), survives a single AZ failure since the other AZ's tasks keep serving |
| Session/cache | ElastiCache Redis Multi-AZ | Externalizes session state so any app instance can serve any user — required for the app tier to be truly stateless and horizontally scalable |
| Data tier | RDS Multi-AZ (synchronous standby) + read replica(s) if read-heavy | Automatic failover (typically 60-120s) if the primary AZ fails; read replicas offload reporting/read traffic from the primary |
| Static/user assets | S3 + CloudFront | Durable, cheap, globally cached, offloads bandwidth from the app tier entirely |
| Security boundary | 3 subnet tiers (public/app/data), security groups scoped tier-to-tier only (ALB→app on app port only, app→data on DB port only) | Minimizes blast radius — a compromised app instance still can't reach the data tier on any port except the DB port, and the data tier has no route to the internet at all |

### Failure scenarios this design survives
- **One AZ goes down entirely**: ALB stops routing to unhealthy targets in that AZ; ASG/ECS replaces lost capacity in the surviving AZ(s); RDS Multi-AZ fails over to the standby (now primary) automatically.
- **A single app instance crashes**: ALB health check marks it unhealthy within seconds; ASG/ECS replaces it; no user-visible impact beyond the in-flight requests on that instance.
- **Traffic spike**: target-tracking scaling policy adds capacity automatically; CloudFront absorbs most static-asset load without ever hitting the origin.

### What this design does *not* cover (would require the DR strategies in section 6)
- An entire **region** going down — this architecture is single-region HA, not multi-region DR. Adding DR requires picking a tier from the RTO/RPO table (e.g., cross-region RDS read replica + S3 cross-region replication for a pilot-light posture).
