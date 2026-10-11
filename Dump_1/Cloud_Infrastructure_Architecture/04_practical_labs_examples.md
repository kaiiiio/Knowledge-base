# Practical Labs & Hands-On Examples

Six concrete, step-by-step exercises. Do these in order — later labs assume tools/concepts from earlier ones.

## Table of Contents
1. Lab 1 — Local 3-Node Kubernetes Cluster with kind, Deploy Service + Ingress
2. Lab 2 — Terraform Module: VPC with Public/Private Subnets
3. Lab 3 — CI/CD Pipeline: GitHub Actions → Docker → ECS/EKS
4. Lab 4 — Prometheus + Grafana Monitoring for a Sample App
5. Lab 5 — Disaster Recovery Failover Simulation
6. Lab 6 — Helm Packaging + HPA Load Test (bonus, ties labs 1 and 4 together)

---

## Lab 1: Local 3-Node Kubernetes Cluster with kind, Deploy Service + Ingress

**Goal:** stand up a multi-node cluster locally and deploy a real app reachable via Ingress — no cloud account needed.

### Prerequisites
- Docker installed and running
- `kind` and `kubectl` installed

### Steps

1. **Install kind** (if not already):
```bash
# macOS
brew install kind
# Linux
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64
chmod +x ./kind && sudo mv ./kind /usr/local/bin/kind
```

2. **Create a 3-node cluster config** (`kind-cluster.yaml`):
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 80
        hostPort: 8080
        protocol: TCP
  - role: worker
  - role: worker
```

3. **Create the cluster:**
```bash
kind create cluster --name demo-cluster --config kind-cluster.yaml
kubectl cluster-info --context kind-demo-cluster
kubectl get nodes   # should show 1 control-plane + 2 worker nodes, all Ready
```

4. **Install an Ingress controller** (NGINX, kind-specific manifest):
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

5. **Deploy a sample app** (`app.yaml`):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello-app
  template:
    metadata:
      labels:
        app: hello-app
    spec:
      containers:
        - name: hello-app
          image: ealen/echo-server:latest
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: hello-app-svc
spec:
  selector:
    app: hello-app
  ports:
    - port: 80
      targetPort: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hello-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: hello-app-svc
                port:
                  number: 80
```
```bash
kubectl apply -f app.yaml
kubectl get pods -o wide    # confirm pods spread across the 2 worker nodes
```

6. **Verify:**
```bash
curl http://localhost:8080/
# expect a JSON response from the echo server
```

7. **Clean up:**
```bash
kind delete cluster --name demo-cluster
```

### What you learned
Multi-node scheduling, how Ingress routes external traffic into cluster Services, and how to bootstrap a disposable cluster entirely locally for experimentation.

---

## Lab 2: Terraform Module — VPC with Public/Private Subnets

**Goal:** write a reusable, parameterized Terraform module provisioning a production-shaped VPC.

### Directory structure
```
terraform-vpc-lab/
├── modules/
│   └── vpc/
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── envs/
    └── dev/
        └── main.tf
```

### `modules/vpc/variables.tf`
```hcl
variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
}

variable "azs" {
  type        = list(string)
  description = "Availability zones to spread subnets across"
}

variable "public_subnet_cidrs" {
  type = list(string)
}

variable "private_subnet_cidrs" {
  type = list(string)
}

variable "environment" {
  type    = string
  default = "dev"
}
```

### `modules/vpc/main.tf`
```hcl
resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "${var.environment}-vpc" }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
  tags   = { Name = "${var.environment}-igw" }
}

resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "${var.environment}-public-${var.azs[count.index]}" }
}

resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.azs[count.index]
  tags = { Name = "${var.environment}-private-${var.azs[count.index]}" }
}

# One NAT gateway per AZ for resilience (cost note: this is the most expensive part of the VPC)
resource "aws_eip" "nat" {
  count  = length(var.azs)
  domain = "vpc"
}

resource "aws_nat_gateway" "this" {
  count         = length(var.azs)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  tags          = { Name = "${var.environment}-nat-${var.azs[count.index]}" }
  depends_on    = [aws_internet_gateway.this]
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }
  tags = { Name = "${var.environment}-public-rt" }
}

resource "aws_route_table_association" "public" {
  count          = length(var.public_subnet_cidrs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  count  = length(var.azs)
  vpc_id = aws_vpc.this.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.this[count.index].id
  }
  tags = { Name = "${var.environment}-private-rt-${var.azs[count.index]}" }
}

resource "aws_route_table_association" "private" {
  count          = length(var.private_subnet_cidrs)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}
```

### `modules/vpc/outputs.tf`
```hcl
output "vpc_id" {
  value = aws_vpc.this.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}
```

### `envs/dev/main.tf`
```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

module "vpc" {
  source                = "../../modules/vpc"
  vpc_cidr              = "10.10.0.0/16"
  azs                   = ["us-east-1a", "us-east-1b"]
  public_subnet_cidrs   = ["10.10.0.0/24", "10.10.1.0/24"]
  private_subnet_cidrs  = ["10.10.10.0/24", "10.10.11.0/24"]
  environment           = "dev"
}

output "vpc_id" {
  value = module.vpc.vpc_id
}
```

### Run it
```bash
cd envs/dev
terraform init
terraform plan      # review: should show ~15-20 resources to add
terraform apply
terraform destroy   # when done - NAT gateways cost ~$0.045/hr + data processing, don't leave running
```

### What you learned
Writing a parameterized, reusable Terraform module; per-AZ NAT gateway redundancy; separating module definition from environment-specific values.

---

## Lab 3: CI/CD Pipeline — GitHub Actions → Docker → ECS

**Goal:** on every push to `main`, build a Docker image, push it to ECR, and deploy it to an existing ECS service.

### Prerequisites
- An ECR repository already created (`aws ecr create-repository --repository-name demo-app`)
- An ECS cluster + service + task definition already provisioned (via Terraform from earlier labs or console)
- An IAM OIDC identity provider configured for GitHub Actions (avoids long-lived AWS keys in CI)

### Step 1: Configure OIDC trust (one-time, via Terraform or console)
```hcl
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

resource "aws_iam_role" "github_actions_deploy" {
  name = "github-actions-ecs-deploy"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Federated = aws_iam_openid_connect_provider.github.arn }
      Action    = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = { "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com" }
        StringLike   = { "token.actions.githubusercontent.com:sub" = "repo:my-org/my-repo:ref:refs/heads/main" }
      }
    }]
  })
}
```

### Step 2: Dockerfile (multi-stage, for a Node.js app example)
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 8080
USER node
CMD ["node", "dist/server.js"]
```

### Step 3: `.github/workflows/deploy.yml`
```yaml
name: Build and Deploy to ECS

on:
  push:
    branches: [main]

permissions:
  id-token: write   # required for OIDC
  contents: read

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: demo-app
  ECS_CLUSTER: demo-cluster
  ECS_SERVICE: demo-app-service

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials via OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions-ecs-deploy
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        id: ecr-login
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, scan, and push image
        env:
          REGISTRY: ${{ steps.ecr-login.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
            aquasec/trivy image --exit-code 1 --severity CRITICAL \
            $REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Render new ECS task definition
        id: render
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-definition.json
          container-name: demo-app
          image: ${{ steps.ecr-login.outputs.registry }}/${{ env.ECR_REPOSITORY }}:${{ github.sha }}

      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: ${{ steps.render.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
```

### Step 4: Rollback behavior
`wait-for-service-stability: true` makes the GitHub Actions job fail if the new ECS deployment doesn't reach a steady healthy state (new tasks passing health checks) within the deployment timeout — ECS's own deployment circuit breaker (configure `deployment_circuit_breaker { enable = true, rollback = true }` on the ECS service) will then automatically roll back to the last working task definition.

### What you learned
OIDC-based keyless CI auth (far safer than static AWS access keys in GitHub secrets), image scanning as a pipeline gate, and automatic rollback via ECS's deployment circuit breaker.

---

## Lab 4: Prometheus + Grafana Monitoring for a Sample App

**Goal:** scrape custom app metrics with Prometheus and visualize them in Grafana, using the Lab 1 kind cluster.

### Step 1: Install kube-prometheus-stack via Helm (bundles Prometheus, Grafana, Alertmanager)
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
```

### Step 2: Deploy a sample app that exposes Prometheus metrics
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: metrics-app
  labels:
    app: metrics-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: metrics-app
  template:
    metadata:
      labels:
        app: metrics-app
    spec:
      containers:
        - name: metrics-app
          image: brancz/prometheus-example-app:v0.5.0  # exposes /metrics on :8080
          ports:
            - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: metrics-app-svc
  labels:
    app: metrics-app   # label must match ServiceMonitor selector below
spec:
  selector:
    app: metrics-app
  ports:
    - name: metrics
      port: 8080
      targetPort: 8080
```

### Step 3: Tell Prometheus to scrape it (ServiceMonitor CRD, provided by the stack)
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: metrics-app-monitor
  namespace: monitoring
  labels:
    release: monitoring   # must match the Prometheus Operator's serviceMonitorSelector
spec:
  selector:
    matchLabels:
      app: metrics-app
  endpoints:
    - port: metrics
      interval: 15s
  namespaceSelector:
    matchNames:
      - default
```

### Step 4: Access Grafana and verify
```bash
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
# default credentials: admin / prom-operator (get via:
# kubectl get secret -n monitoring monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 -d)
```
Open `http://localhost:3000`, go to Explore, select the Prometheus data source, and query:
```
rate(http_requests_total{job="metrics-app-svc"}[5m])
```

### Step 5: Build a simple dashboard panel + alert
- Add a panel graphing request rate and p99 latency (`histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))`).
- In Alertmanager (or a Grafana alert rule), create an alert: fire if error rate `rate(http_requests_total{code=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05` for 5 minutes.

### What you learned
The pull-based Prometheus scraping model via ServiceMonitors, PromQL basics (`rate`, `histogram_quantile`), and wiring an SLO-style alert off a derived metric.

---

## Lab 5: Disaster Recovery Failover Test Simulation

**Goal:** simulate a regional failure and validate an RDS cross-region failover + DNS cutover (pilot-light style DR, from `02_deep_dive_architecture_patterns.md` section 6), using a low-cost setup.

### Setup (assumes primary in us-east-1, DR in us-west-2)

1. **Create a cross-region read replica** of an existing RDS instance:
```bash
aws rds create-db-instance-read-replica \
  --db-instance-identifier demo-db-replica-west \
  --source-db-instance-identifier arn:aws:rds:us-east-1:123456789012:db:demo-db-primary \
  --region us-west-2 \
  --db-instance-class db.t3.micro
```

2. **Provision minimal pilot-light app infra in us-west-2** via the Terraform VPC module from Lab 2, plus a small ASG/ECS service (scaled to 0 or 1 instance) pointing at a `DB_HOST` environment variable left unset until failover time.

3. **Set up Route 53 failover routing:**
```bash
aws route53 change-resource-record-sets --hosted-zone-id Z123456 \
  --change-batch '{
    "Changes": [
      {
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "app.example.com",
          "Type": "A",
          "SetIdentifier": "primary",
          "Failover": "PRIMARY",
          "AliasTarget": { "HostedZoneId": "Z35SXDOTRQ7X7K", "DNSName": "primary-alb-dns-name", "EvaluateTargetHealth": true }
        }
      },
      {
        "Action": "UPSERT",
        "ResourceRecordSet": {
          "Name": "app.example.com",
          "Type": "A",
          "SetIdentifier": "secondary",
          "Failover": "SECONDARY",
          "AliasTarget": { "HostedZoneId": "Z1H1FL5HABSF5", "DNSName": "dr-alb-dns-name", "EvaluateTargetHealth": true }
        }
      }
    ]
  }'
```

4. **Create a Route 53 health check** against the primary ALB's `/healthz` endpoint — this is what triggers automatic failover routing.

### Running the simulated failover

1. **Inject the failure**: in a controlled test window, deregister the primary ALB's targets (or scale the primary ASG to 0) to simulate a regional outage:
```bash
aws autoscaling update-auto-scaling-group \
  --auto-scaling-group-name demo-app-asg-primary \
  --min-size 0 --max-size 0 --desired-capacity 0
```

2. **Observe**: within the health check's failure threshold (commonly 3 consecutive failed checks at 30s intervals ≈ 90s), Route 53 should mark primary unhealthy and begin resolving `app.example.com` to the secondary (DR) ALB.
```bash
dig app.example.com   # confirm it now resolves to the DR region's ALB
```

3. **Promote the read replica to a standalone writable primary:**
```bash
aws rds promote-read-replica --db-instance-identifier demo-db-replica-west
```
Wait for status `available`, then update the DR app tier's `DB_HOST` to point at the promoted instance (via a Secrets Manager rotation or a Terraform apply updating an environment variable + redeploy).

4. **Scale up the DR app tier** to full production capacity:
```bash
aws autoscaling update-auto-scaling-group \
  --auto-scaling-group-name demo-app-asg-dr \
  --min-size 2 --max-size 6 --desired-capacity 3
```

5. **Validate**: hit `https://app.example.com` and confirm the app responds correctly and can read/write against the promoted DR database.

6. **Measure your actual RTO**: timestamp from step 1 (failure injected) to step 5 (traffic fully healthy again) — this is your real, measured RTO. Compare it against your target RTO from the DR requirements and identify the slowest step (usually RDS promotion, which can take several minutes) to optimize next.

### Cleanup
```bash
aws rds delete-db-instance --db-instance-identifier demo-db-replica-west --skip-final-snapshot
# restore primary ASG to its normal desired-capacity
# revert Route 53 records if this was a one-off test, not a permanent DR posture
```

### What you learned
The real mechanics (not just theory) of health-check-driven DNS failover, read-replica promotion, and — critically — that DR plans must be *tested*, because the slowest, most error-prone step (replica promotion, config cutover) only reveals itself under an actual drill.

---

## Lab 6 (Bonus): Helm Packaging + HPA Load Test

**Goal:** package the Lab 1 app as a Helm chart, add an HPA, and prove it scales under load.

### Step 1: Scaffold and adapt a chart
```bash
helm create hello-chart
# edit hello-chart/values.yaml: set image.repository, replicaCount, resources.requests/limits
# edit hello-chart/templates/deployment.yaml to reference values correctly (default scaffold already does)
```

### Step 2: Add an HPA template (`hello-chart/templates/hpa.yaml`)
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "hello-chart.fullname" . }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "hello-chart.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
```

### Step 3: Install and metrics-server dependency
```bash
# HPA needs metrics-server; kind doesn't ship it by default
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
# patch for kind's self-signed certs:
kubectl patch deployment metrics-server -n kube-system --type='json' \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'

helm install hello ./hello-chart --set autoscaling.minReplicas=2,autoscaling.maxReplicas=10
```

### Step 4: Load test and watch it scale
```bash
kubectl run load-generator --image=busybox --restart=Never -- \
  /bin/sh -c "while true; do wget -q -O- http://hello-chart:80; done"

# in another terminal:
kubectl get hpa -w
# watch TARGETS climb and REPLICAS increase from 2 toward 10
```

### What you learned
Full loop from chart packaging to autoscaling under real generated load, including the easy-to-miss metrics-server prerequisite that trips up most first-time kind/HPA setups.
