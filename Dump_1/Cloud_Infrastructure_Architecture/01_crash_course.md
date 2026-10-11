# Cloud Infrastructure Crash Course

Dense, reference-style coverage of the core concepts you need fluent recall of. Read once deeply, then use as a lookup sheet.

## Table of Contents
1. Core AWS Services
2. Core Cloud Networking Concepts
3. The AWS Well-Architected Framework
4. Containers vs VMs
5. Kubernetes Core Objects + Sample Manifest
6. IaC Basics + Working Terraform Example

---

## 1. Core AWS Services

### EC2 (Elastic Compute Cloud)
Virtual machines in the cloud. You choose an **AMI** (Amazon Machine Image — the OS + preinstalled software snapshot) and an **instance type** (family + size, e.g. `t3.medium`, `m6i.large`, `c7g.xlarge` — the letter indicates purpose: `t`=burstable general purpose, `m`=balanced, `c`=compute-optimized, `r`=memory-optimized, `g`=GPU).

Pricing models:
- **On-Demand** — pay per second/hour, no commitment, most expensive.
- **Reserved Instances / Savings Plans** — commit to 1-3 years for up to ~72% discount.
- **Spot Instances** — bid on spare capacity for up to ~90% discount; can be reclaimed with 2-minute warning. Good for fault-tolerant batch/stateless workloads.

Key concepts: **security groups** (instance-level stateful firewall), **key pairs** (SSH access), **EBS volumes** (persistent block storage attached to an instance), **instance metadata service** (IMDSv2 — how an instance fetches its own IAM role credentials).

### S3 (Simple Storage Service)
Object storage — not a filesystem. You store **objects** (blobs) in **buckets**, addressed by key. Globally unique bucket names, regional data residency.

Storage classes (cost vs retrieval-speed trade-off):
- **S3 Standard** — frequent access.
- **S3 Standard-IA / One Zone-IA** — infrequent access, cheaper storage, cost per retrieval.
- **S3 Glacier Instant/Flexible/Deep Archive** — archival, retrieval takes minutes to hours, very cheap storage.
- **S3 Intelligent-Tiering** — automatically moves objects between tiers based on access patterns.

Key features: **versioning** (keep history of object changes, protects against accidental delete/overwrite), **lifecycle policies** (auto-transition/expire objects), **bucket policies** (resource-based IAM), **presigned URLs** (temporary, time-limited access without making the object public).

### VPC, Subnets, Security Groups
A **VPC (Virtual Private Cloud)** is your isolated network inside AWS, defined by a CIDR block (e.g., `10.0.0.0/16`).

- **Subnets** — subdivisions of the VPC CIDR, each pinned to one Availability Zone. A subnet is "public" if its route table sends `0.0.0.0/0` to an **Internet Gateway**; "private" if it routes outbound traffic through a **NAT Gateway** instead (so instances can reach the internet to pull updates but aren't directly reachable from it).
- **Route tables** — per-subnet routing rules.
- **Security Groups** — stateful, attached to ENIs/instances; return traffic is automatically allowed. You write allow rules only (no explicit deny).
- **Network ACLs** — stateless, attached to subnets; you must explicitly allow both inbound and outbound, evaluated in rule-number order. Used far less often than security groups in practice — mainly for coarse subnet-level blocking.

### IAM (Identity and Access Management)
Global (not regional) service controlling **who** can do **what** to **which resource**.
- **Users** — long-lived human or service identities (avoid for workloads — prefer roles).
- **Groups** — collections of users, for policy attachment convenience.
- **Roles** — assumable identities with temporary credentials (via STS `AssumeRole`), used by EC2 instances (instance profiles), Lambda functions, cross-account access, and federated/SSO users.
- **Policies** — JSON documents listing `Effect`/`Action`/`Resource`/`Condition`. Evaluation logic: an explicit `Deny` always wins; otherwise you need at least one applicable `Allow` and no `Deny`; default is implicit deny.

### RDS (Relational Database Service)
Managed relational databases (Postgres, MySQL, MariaDB, SQL Server, Oracle, or AWS's Aurora). AWS handles patching, backups, failover.
- **Multi-AZ** — synchronous standby replica in another AZ for automatic failover (HA, not for read scaling).
- **Read Replicas** — asynchronous copies for scaling read traffic (can be cross-region).
- **Automated backups & snapshots** — point-in-time recovery within a retention window.

### Lambda
Serverless compute — you upload code (a function), AWS runs it in response to events (API Gateway request, S3 upload, SQS message, schedule, etc.) and you pay per invocation + duration. No servers to manage, but: **cold starts** (latency on first invocation of a new execution environment), execution time limit (15 min max), and **concurrency limits** (account- and function-level, can throttle under burst load unless provisioned concurrency is configured).

### API Gateway
Managed entry point for APIs (REST, HTTP, WebSocket). Handles routing, auth (IAM, Cognito, Lambda authorizers), throttling, request/response transformation, and typically fronts Lambda or any HTTP backend.

### CloudFront
AWS's CDN. Caches content at edge locations close to users. Configured with **origins** (S3, ALB, custom HTTP) and **cache behaviors** (path-based rules for TTL, allowed methods, forwarded headers). Also used for TLS termination at the edge and as a layer for WAF/Shield protection.

### ECS / EKS
- **ECS (Elastic Container Service)** — AWS-native container orchestrator. Define **Task Definitions** (container specs), run as **Services** (desired count, load balancer integration) on either EC2 instances you manage or **Fargate** (serverless — AWS manages the underlying compute).
- **EKS (Elastic Kubernetes Service)** — managed Kubernetes control plane; you still manage worker nodes (or use Fargate profiles for serverless pods). Use when you need Kubernetes portability/ecosystem; use ECS when you want simpler AWS-native orchestration with less operational overhead.

### Route 53
AWS's DNS service, also supports domain registration and health-check-based routing.
Routing policies: **Simple**, **Weighted** (percentage split, e.g. canary), **Latency-based** (route to lowest-latency region), **Geolocation**, **Failover** (active-passive with health checks).

---

## 2. Core Cloud Networking Concepts

### CIDR Notation
`10.0.0.0/16` means the first 16 bits are the fixed network portion, leaving 16 bits (65,536 addresses) for hosts/subnets. A `/24` gives 256 addresses (251 usable in AWS — it reserves 5 per subnet). Smaller the suffix number, larger the network.

Common AWS VPC sizing pattern: VPC `/16`, subnets `/24` per AZ per tier (public/private/data), leaving room to add AZs or tiers later.

### NAT Gateway
Lets instances in a **private subnet** initiate outbound internet connections (e.g., to download packages) without being reachable from the internet inbound. AWS-managed, HA within an AZ (deploy one per AZ for resilience), billed per-hour plus per-GB processed — a notable line item in cost reviews.

### Load Balancers: ALB vs NLB
- **ALB (Application Load Balancer)** — Layer 7 (HTTP/HTTPS). Content-based routing (path/host-based rules), supports WebSocket, gRPC, native integration with ECS/EKS target groups, and WAF.
- **NLB (Network Load Balancer)** — Layer 4 (TCP/UDP/TLS passthrough). Ultra-low latency, millions of requests/sec, preserves client source IP, static IP per AZ. Use for non-HTTP protocols or extreme performance/latency requirements.

### DNS in Practice
Resolution flow: browser cache → OS cache → recursive resolver (ISP or `8.8.8.8`/`1.1.1.1`) → root nameservers → TLD nameservers (`.com`) → authoritative nameserver for the domain → IP returned. `TTL` on each record controls caching duration — lower it before a planned DNS cutover to reduce propagation delay.

---

## 3. The AWS Well-Architected Framework — Six Pillars

1. **Operational Excellence** — run and monitor systems to deliver business value; treat operations as code (IaC, runbooks as scripts), make small frequent reversible changes, anticipate failure through game days.
2. **Security** — implement a strong identity foundation (least privilege), enable traceability (logging/monitoring everywhere), apply security at all layers (defense in depth), automate security best practices, protect data in transit and at rest, keep people away from data directly, prepare for security events (incident response plan).
3. **Reliability** — automatically recover from failure, test recovery procedures, scale horizontally to increase aggregate availability, stop guessing capacity (auto-scale), manage change through automation.
4. **Performance Efficiency** — democratize advanced technologies (use managed services), go global in minutes, use serverless architectures where fit, experiment more often, consider mechanical sympathy (choose the right tool/instance type for the workload's actual access pattern).
5. **Cost Optimization** — adopt a consumption model (pay for what you use), measure overall efficiency, stop spending on undifferentiated heavy lifting (use managed services instead of running your own), analyze and attribute expenditure (tagging), use the right pricing model (Spot/Reserved/On-Demand mix).
6. **Sustainability** — maximize utilization, use efficient hardware/managed services, reduce the footprint of downstream impacts (minimize data movement, right-size, turn off idle resources).

Each pillar comes with a structured set of design principles and a review checklist (the actual "Well-Architected Review" AWS runs with customers) — see `03_tools_and_resources.md` for the official framework link.

---

## 4. Containers vs VMs

| Aspect | Virtual Machine | Container |
|---|---|---|
| Isolation unit | Full OS (own kernel) via hypervisor | Process, isolated via kernel namespaces/cgroups, shares host kernel |
| Boot time | Seconds to minutes | Milliseconds to seconds |
| Image size | GBs (full OS) | MBs to low GBs |
| Density per host | Lower (10s per host typical) | Higher (100s per host typical) |
| Overhead | Full OS overhead per VM | Near-zero marginal overhead per container |
| Use case fit | Strong isolation needs, mixed OS, legacy apps | Microservices, stateless scalable apps, CI/CD artifacts |

Containers and VMs are complementary, not purely competing: cloud providers typically run containers (or Kubernetes nodes) *inside* VMs for the hardware-level isolation boundary, then use containers for fast, dense application-level isolation on top.

---

## 5. Kubernetes Core Objects

- **Pod** — smallest deployable unit; one or more containers that share network namespace (same IP, can talk via `localhost`) and can share storage volumes. Pods are ephemeral and not usually created directly.
- **Deployment** — manages a ReplicaSet of Pods from a template; provides declarative rolling updates and rollback (`kubectl rollout undo`). This is how you normally run stateless apps.
- **Service** — stable virtual IP + DNS name in front of a dynamic set of Pods (selected by label selector). Types: `ClusterIP` (internal only, default), `NodePort` (exposes a port on every node), `LoadBalancer` (provisions a cloud load balancer).
- **Ingress** — L7 HTTP(S) routing (host/path-based) into the cluster, implemented by an Ingress Controller (e.g., NGINX Ingress, AWS Load Balancer Controller). One Ingress + one external load balancer can front many Services, vs one `LoadBalancer` Service per app.
- **ConfigMap** — non-sensitive configuration injected as env vars or mounted files.
- **Secret** — same idea as ConfigMap but for sensitive data; base64-encoded at rest by default (not encryption — enable encryption-at-rest/EKS Secrets encryption with KMS for real protection, and consider an external secrets manager).
- **Namespace** — virtual cluster partition for organizing and scoping access (RBAC), resource quotas, and name collisions between teams/environments.

### Sample Manifest (Deployment + Service + Ingress + ConfigMap)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-config
  namespace: demo
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: demo
  labels:
    app: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
        - name: web-app
          image: myregistry/web-app:1.4.0
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef:
                name: web-config
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: web-app-svc
  namespace: demo
spec:
  selector:
    app: web-app
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-app-ingress
  namespace: demo
  annotations:
    nginx.ingress.class: "nginx"
spec:
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web-app-svc
                port:
                  number: 80
```

Apply with `kubectl apply -f manifest.yaml`, inspect with `kubectl get pods,svc,ingress -n demo`, and debug with `kubectl describe pod <name> -n demo` / `kubectl logs <name> -n demo`.

---

## 6. IaC Basics + Working Terraform Example

**Core idea:** describe desired infrastructure state in declarative config files; the tool diffs that against real-world state and computes a change plan (`terraform plan`) before applying it (`terraform apply`). This replaces manual console clicking with versioned, reviewable, repeatable infrastructure.

Key Terraform concepts:
- **Provider** — plugin that talks to an API (AWS, Azure, GCP, Kubernetes, etc.)
- **Resource** — a managed infrastructure object (`aws_instance`, `aws_s3_bucket`, …)
- **State file** (`terraform.tfstate`) — Terraform's record of what it last created; should live in a remote backend (e.g., S3 + DynamoDB lock) for team use, never just on a laptop.
- **Variables/Outputs** — parameterize modules and expose values for other modules/consumers.
- **Module** — a reusable, packaged set of resources with inputs/outputs.

### Working Example: EC2 + Security Group + S3 Bucket

```hcl
# main.tf
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "my-org-terraform-state"
    key            = "crash-course/demo/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH into the instance"
  type        = string
  default     = "203.0.113.0/32" # replace with your own IP/32
}

# --- S3 bucket for app artifacts/logs ---
resource "aws_s3_bucket" "app_bucket" {
  bucket = "my-org-demo-app-bucket-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_versioning" "app_bucket_versioning" {
  bucket = aws_s3_bucket.app_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "app_bucket_block" {
  bucket                  = aws_s3_bucket.app_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_caller_identity" "current" {}

# --- Security Group ---
resource "aws_security_group" "web_sg" {
  name        = "web-sg"
  description = "Allow HTTP/HTTPS inbound, SSH from trusted IP only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH from trusted IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "web-sg"
    Environment = "demo"
  }
}

data "aws_vpc" "default" {
  default = true
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# --- EC2 instance ---
resource "aws_instance" "web" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              dnf install -y httpd
              systemctl enable --now httpd
              echo "Hello from Terraform-provisioned EC2" > /var/www/html/index.html
              EOF

  tags = {
    Name        = "web-demo-instance"
    Environment = "demo"
  }
}

output "instance_public_ip" {
  value = aws_instance.web.public_ip
}

output "bucket_name" {
  value = aws_s3_bucket.app_bucket.bucket
}
```

Usage:
```bash
terraform init      # downloads providers, configures backend
terraform plan      # shows the diff vs current state - review before applying
terraform apply     # creates resources, prompts for confirmation
terraform destroy   # tears everything down when you're done experimenting
```

Notes on this example:
- The S3 bucket name includes the account ID to guarantee global uniqueness.
- Public access is explicitly blocked on the bucket (secure by default).
- SSH is restricted to a single trusted CIDR, not `0.0.0.0/0` (a very common real-world misconfiguration to avoid).
- State is stored remotely (S3 + DynamoDB lock) so this is safe for team use — swap in your own bucket name created ahead of time via a separate bootstrap step (a backend can't create its own storage).
