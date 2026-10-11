# Cloud Infrastructure Architecture — Learning Roadmap

A structured path from zero to cloud/infrastructure architect. Each phase lists goals, topics, estimated time (assuming ~10-15 focused hrs/week), and exit criteria — the thing you should be able to do before moving on.

## Overview Table

| Phase | Focus | Est. Time | Exit Criteria |
|---|---|---|---|
| 1 | Linux & Networking Fundamentals | 4-6 weeks | Comfortable in shell, can debug networking with tcpdump/curl/dig |
| 2 | Virtualization & Containers (Docker) | 3-4 weeks | Can containerize a multi-service app with Docker Compose |
| 3 | Container Orchestration (Kubernetes) | 6-8 weeks | Can deploy, scale, debug workloads on a real cluster |
| 4 | Cloud Provider Deep-Dive (AWS) | 10-12 weeks | Can design and deploy a production VPC + compute + data layer |
| 5 | Infrastructure as Code | 4-6 weeks | Can write reusable Terraform modules with remote state |
| 6 | CI/CD Pipelines | 3-4 weeks | Can build a pipeline: test → build → scan → deploy → rollback |
| 7 | Observability | 3-4 weeks | Can instrument an app with metrics, logs, traces and alert on SLOs |
| 8 | Security & Compliance | 4-5 weeks | Can apply least privilege, encryption, and audit cloud accounts |
| 9 | Cost Optimization | 2-3 weeks | Can read a cost & usage report and cut spend 20-30% |
| 10 | System Design at Scale | Ongoing | Can design HA/DR architectures for given SLAs |
| 11 | Certification Ladder | Parallel track | AWS SAA → SAP, CKA/CKAD, Terraform Associate |

Total realistic timeline for job-ready depth: **9-12 months** of consistent part-time study, or **4-6 months** full-time.

---

## Phase 1: Linux & Networking Fundamentals (4-6 weeks)

**Why first:** every cloud service is ultimately a Linux VM or container behind an API. Weak fundamentals here cause endless cloud-debugging pain later.

### Topics
- Linux filesystem hierarchy, permissions (chmod/chown/umask), processes, signals
- Package management (apt/yum), systemd (services, units, logs via journalctl)
- Shell scripting (bash): variables, loops, conditionals, piping, `awk`/`sed`/`grep`
- SSH: key-based auth, agent forwarding, tunneling/port-forwarding, bastion hosts
- Networking fundamentals:
  - OSI model layers 2-7 in practice
  - IP addressing, subnetting, CIDR notation
  - TCP vs UDP, three-way handshake, ports
  - DNS resolution flow (recursive resolvers, authoritative servers, records: A/AAAA/CNAME/MX/TXT/NS)
  - HTTP/HTTPS, TLS handshake basics, certificates
  - Routing tables, default gateways, NAT
- Debugging tools: `ping`, `traceroute`/`mtr`, `curl`, `dig`/`nslookup`, `netstat`/`ss`, `tcpdump`, `iptables` basics

### Hands-on milestones
1. Spin up a Linux VM (local VM or free-tier cloud), SSH in, harden it (disable password auth, change SSH port, set up a firewall with `ufw`/`iptables`).
2. Write a bash script that monitors disk usage and emails/logs an alert past a threshold.
3. Use `tcpdump` to capture and explain a DNS lookup and an HTTPS handshake.

### Exit criteria
You can explain, without notes, what happens from typing a URL in a browser to the page rendering, and you can SSH into and troubleshoot a misbehaving Linux box.

---

## Phase 2: Virtualization & Containers — Docker (3-4 weeks)

### Topics
- Virtualization concepts: hypervisors (Type 1 vs Type 2), VMs vs containers
- Linux primitives containers are built on: namespaces (PID, net, mnt, UTS, IPC, user), cgroups, union filesystems (overlay2)
- Docker architecture: daemon, CLI, images, layers, registries
- Dockerfile best practices: multi-stage builds, minimal base images (alpine/distroless), layer caching, `.dockerignore`
- Docker networking: bridge, host, overlay networks; container-to-container DNS
- Docker Compose for multi-container local dev
- Image security: scanning (Trivy/Grype), avoiding running as root, pinning versions

### Hands-on milestones
1. Containerize a 2-tier app (API + Postgres) with Docker Compose, including health checks and volumes for persistence.
2. Write a multi-stage Dockerfile that reduces image size by >70% vs a naive build.
3. Scan an image with Trivy and fix at least 2 real CVEs.

### Exit criteria
You can containerize any typical web app, reason about image size/security, and debug container networking issues.

---

## Phase 3: Container Orchestration — Kubernetes (6-8 weeks)

### Topics
- Why orchestration: the problem Kubernetes solves (scheduling, self-healing, scaling, service discovery)
- Architecture: control plane (API server, etcd, scheduler, controller-manager) vs worker nodes (kubelet, kube-proxy, container runtime)
- Core objects: Pod, ReplicaSet, Deployment, StatefulSet, DaemonSet, Job/CronJob
- Networking: Service types (ClusterIP, NodePort, LoadBalancer), Ingress, Network Policies, CNI plugins overview
- Configuration: ConfigMaps, Secrets, environment injection
- Storage: PersistentVolume, PersistentVolumeClaim, StorageClass, dynamic provisioning
- Scheduling: node selectors, affinity/anti-affinity, taints and tolerations, resource requests/limits, quality of service classes
- Scaling: Horizontal Pod Autoscaler (HPA), Vertical Pod Autoscaler (VPA), Cluster Autoscaler
- Helm: charts, templating, releases, values overrides
- RBAC: Roles, RoleBindings, ServiceAccounts
- Troubleshooting workflow: `kubectl describe`, `kubectl logs`, `kubectl exec`, events, readiness/liveness probe failures

### Hands-on milestones
1. Stand up a local cluster with `kind` or `minikube` (3 nodes), deploy an app with Deployment + Service + Ingress.
2. Configure an HPA that scales a deployment under synthetic load (use `hey` or `k6`).
3. Package the app as a Helm chart with configurable replica count and image tag.
4. Deliberately break something (bad image tag, wrong probe path) and diagnose it purely from `kubectl` output.

### Exit criteria
You can deploy, scale, update (rolling update/rollback), and debug a non-trivial application on Kubernetes without looking up basic object syntax.

---

## Phase 4: Cloud Provider Deep-Dive — AWS Primary (10-12 weeks)

Go deep on one provider first; breadth across three providers too early produces shallow knowledge everywhere. AWS is recommended because of market share and job demand; Azure/GCP equivalents are noted so you can translate later.

### Topics by category

**Compute**
- EC2: instance types/families, AMIs, placement groups, Spot vs On-Demand vs Reserved/Savings Plans
- Auto Scaling Groups: launch templates, scaling policies, lifecycle hooks
- ECS (Fargate and EC2 launch types), EKS (managed Kubernetes)
- Lambda: event sources, cold starts, concurrency limits, layers
- *Azure equivalents:* VMs/VMSS, AKS, Azure Functions. *GCP equivalents:* Compute Engine/MIGs, GKE, Cloud Functions/Cloud Run

**Networking**
- VPC: subnets (public/private), route tables, internet gateway, NAT gateway, VPC peering, Transit Gateway
- Security Groups (stateful) vs Network ACLs (stateless)
- Elastic Load Balancing: ALB (L7), NLB (L4), target groups, health checks
- Route 53: DNS routing policies (weighted, latency, geolocation, failover), health checks
- CloudFront CDN: origins, cache behaviors, signed URLs
- *Azure:* VNet, NSGs, Azure Load Balancer/App Gateway, Azure DNS, Front Door/CDN. *GCP:* VPC, firewall rules, Cloud Load Balancing, Cloud DNS, Cloud CDN

**Storage & Databases**
- S3: storage classes, lifecycle policies, versioning, bucket policies, presigned URLs
- EBS vs EFS vs instance store
- RDS (Postgres/MySQL/Aurora): Multi-AZ, read replicas, parameter groups, backups/snapshots
- DynamoDB: partition keys, GSIs/LSIs, on-demand vs provisioned capacity
- *Azure:* Blob Storage, Azure SQL/managed instances, Cosmos DB. *GCP:* Cloud Storage, Cloud SQL, Firestore/Bigtable

**IAM & Identity**
- Users, groups, roles, policies (identity-based vs resource-based)
- Principle of least privilege, policy evaluation logic
- IAM roles for EC2/Lambda (instance profiles), cross-account roles, STS AssumeRole
- *Azure:* Azure AD/Entra ID, RBAC. *GCP:* Cloud IAM

**Messaging & Integration**
- SQS (standard vs FIFO), SNS, EventBridge, Step Functions
- *Azure:* Service Bus, Event Grid. *GCP:* Pub/Sub

**The Well-Architected Framework** (study as a lens across everything above): Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability

### Hands-on milestones
1. Build a VPC from scratch (console first, then Terraform) with public/private subnets across 2 AZs, NAT gateway, and a bastion host.
2. Deploy a 3-tier app: ALB → EC2 ASG (or ECS) in private subnets → RDS Multi-AZ, with security groups scoped tightly per tier.
3. Set up Route 53 failover routing between two regions.
4. Write IAM policies by hand (not console wizard) enforcing least privilege for a CI/CD deploy role.

### Exit criteria
You can whiteboard and then actually deploy a secure, multi-AZ, auto-scaling 3-tier architecture on AWS from memory.

---

## Phase 5: Infrastructure as Code (4-6 weeks)

### Topics
- Why IaC: drift, repeatability, review-as-code, disaster recovery via code
- Terraform: providers, resources, data sources, variables, outputs, state file, remote backends (S3 + DynamoDB locking), workspaces, modules, `plan`/`apply`/`destroy`, `import`
- Terraform at scale: module registries, versioning, environment separation (dirs vs workspaces), policy as code (OPA/Sentinel)
- Alternatives: CloudFormation (native AWS, declarative JSON/YAML, drift detection, nested stacks), Pulumi (IaC in general-purpose languages), AWS CDK (code that synthesizes to CloudFormation)
- Ansible for configuration management (contrast with Terraform's provisioning role)

### Hands-on milestones
1. Write a Terraform module for a VPC (reusable, parameterized by CIDR/AZ count).
2. Configure remote state in S3 with a DynamoDB lock table; demonstrate state locking by running concurrent applies.
3. Recreate one AWS deployment from Phase 4 entirely in Terraform, then destroy and re-apply to prove reproducibility.

### Exit criteria
You can write, review, and safely evolve Terraform modules in a team setting (plan review, state management, no manual console drift).

---

## Phase 6: CI/CD Pipelines (3-4 weeks)

### Topics
- Pipeline stages: lint → unit test → build → security scan → integration test → deploy → smoke test
- GitHub Actions / GitLab CI / Jenkins concepts: runners, jobs, stages, artifacts, caching, secrets management
- Deployment strategies in pipelines: rolling, blue-green, canary (see Phase 3/10 for mechanics)
- Deploying to ECS/EKS from a pipeline (OIDC federation instead of long-lived AWS keys)
- GitOps: ArgoCD/Flux — declarative, pull-based deployment to Kubernetes

### Hands-on milestones
1. Build a GitHub Actions workflow: on push → run tests → build Docker image → push to ECR → deploy to ECS/EKS.
2. Add an automatic rollback step triggered by a failed health check.
3. Set up ArgoCD to sync a Kubernetes manifest repo to a cluster (GitOps).

### Exit criteria
You can design and implement a pipeline that takes code from commit to production safely and automatically, with rollback.

---

## Phase 7: Observability (3-4 weeks)

### Topics
- Three pillars: logs, metrics, traces — what each is good/bad for
- Metrics: Prometheus (pull model, exporters, PromQL), Grafana dashboards, CloudWatch Metrics
- Logging: structured logging, centralized log aggregation (CloudWatch Logs, ELK/EFK stack, Loki)
- Tracing: distributed tracing concepts, OpenTelemetry, trace context propagation, Jaeger/X-Ray
- Alerting: SLIs/SLOs/error budgets, alert fatigue avoidance, Alertmanager routing

### Hands-on milestones
1. Instrument a sample app with Prometheus client libraries; scrape and visualize in Grafana.
2. Define an SLO (e.g., 99.5% availability) and build an alert that fires on error-budget burn rate.
3. Add distributed tracing across 2 microservices with OpenTelemetry + Jaeger.

### Exit criteria
Given a production incident, you can use logs/metrics/traces together to find root cause within minutes, not hours.

---

## Phase 8: Security & Compliance in Cloud (4-5 weeks)

### Topics
- IAM deep dive: policy evaluation order, permission boundaries, SCPs (Service Control Policies) in AWS Organizations
- Encryption: at-rest (KMS, envelope encryption) and in-transit (TLS everywhere)
- Secrets management: AWS Secrets Manager/Parameter Store, HashiCorp Vault
- Network security: security group design, private subnets, VPC endpoints (avoid public internet for AWS API calls), WAF, Shield (DDoS)
- Compliance frameworks overview: SOC 2, ISO 27001, HIPAA, PCI-DSS, GDPR — what they require architecturally (audit logging, encryption, access control)
- Audit & detection: CloudTrail, GuardDuty, Config, Security Hub
- Container/K8s security: image scanning, Pod Security Standards, network policies, RBAC hardening

### Hands-on milestones
1. Write an IAM policy that grants a role access to only a specific S3 prefix and only specific RDS actions.
2. Rotate a secret stored in Secrets Manager and wire it into an ECS task without redeploying.
3. Enable GuardDuty and CloudTrail; trigger and investigate a synthetic suspicious event.

### Exit criteria
You can pass a basic cloud security review: least privilege everywhere, encryption by default, auditable access, no hardcoded secrets.

---

## Phase 9: Cost Optimization (2-3 weeks)

### Topics
- Cost visibility: Cost Explorer, Cost and Usage Reports, tagging strategy for cost allocation
- Compute savings: Reserved Instances/Savings Plans vs Spot, rightsizing with Compute Optimizer
- Storage savings: S3 lifecycle policies/Intelligent-Tiering, EBS volume rightsizing, snapshot cleanup
- Architectural cost levers: serverless vs always-on, data transfer cost awareness (cross-AZ, cross-region, NAT gateway cost), caching to reduce compute/DB load
- FinOps culture: showback/chargeback, budgets and alerts

### Hands-on milestones
1. Tag all resources in a sample account by team/environment and produce a cost-by-tag report.
2. Identify and rightsize 3 over-provisioned resources using Compute Optimizer or manual CloudWatch analysis.
3. Set a AWS Budget with an alert at 80% threshold.

### Exit criteria
Given a cost and usage report, you can identify the top 3 savings opportunities and estimate the dollar impact.

---

## Phase 10: System Design at Scale (ongoing)

### Topics
- Scalability patterns: horizontal vs vertical scaling, stateless services, caching layers (CDN, Redis/Memcached), read replicas, sharding
- High availability: multi-AZ, multi-region, failover mechanics, avoiding single points of failure
- Disaster recovery strategies: backup/restore, pilot light, warm standby, multi-site active-active (see `02_deep_dive_architecture_patterns.md`)
- Event-driven & microservices architecture trade-offs: coupling, eventual consistency, idempotency, saga pattern
- Capacity planning: estimating QPS, storage growth, back-of-envelope calculations
- Trade-off thinking: CAP theorem in practice, consistency vs availability choices

### Hands-on milestones
1. Design (on paper/whiteboard) a system for a given prompt (e.g., "design a URL shortener handling 10K QPS") including data model, caching, scaling plan.
2. Review and critique a real production architecture (your own company's or an open design doc) against the Well-Architected pillars.

### Exit criteria
You can take an ambiguous system design prompt, ask clarifying questions, and produce a defensible architecture with explicit trade-offs under time pressure (interview-ready).

---

## Phase 11: Certification Ladder (run in parallel with phases 4-8)

| Certification | When to attempt | Typical prep time (with above study) |
|---|---|---|
| AWS Certified Cloud Practitioner (optional, foundational) | After Phase 1-2 | 1-2 weeks |
| AWS Certified Solutions Architect – Associate (SAA-C03) | After Phase 4 | 3-4 weeks focused review |
| CKAD (Certified Kubernetes Application Developer) | After Phase 3 | 2-3 weeks |
| CKA (Certified Kubernetes Administrator) | After Phase 3, deeper ops focus | 4-5 weeks |
| HashiCorp Terraform Associate | After Phase 5 | 2 weeks |
| AWS Certified Solutions Architect – Professional (SAP-C02) | After Phases 4-10, 1+ yr practical experience recommended | 6-8 weeks |
| AWS Certified Security – Specialty (optional) | After Phase 8 | 4 weeks |

**Recommended order for a career-focused path:** Cloud Practitioner (optional) → SAA → CKAD → CKA → Terraform Associate → SAP (Professional) → Security Specialty (optional).

---

## Suggested Weekly Cadence (part-time, ~12 hrs/week)

- 4 hrs reading/video (concepts)
- 6 hrs hands-on labs
- 2 hrs review/flashcards/notes consolidation

Revisit this roadmap every 4-6 weeks and adjust based on which job postings/projects you're targeting — e.g., heavier Kubernetes focus for platform engineering roles, heavier data/ML infra focus for data platform roles.
