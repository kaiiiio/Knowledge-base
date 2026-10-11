# Tools & Resources Directory

Curated, real, currently-active platforms and tools for cloud/infra learning and daily work. Organized by category.

## Learning Platforms

| Resource | URL | Description |
|---|---|---|
| AWS Skill Builder | https://skillbuilder.aws | AWS's own free/paid learning platform — official digital courses, exam prep, and hands-on labs directly from AWS. |
| A Cloud Guru (part of Pluralsight) | https://www.pluralsight.com/cloud-guru | Cloud-focused video courses and hands-on "cloud playgrounds" covering AWS, Azure, GCP, and Kubernetes. |
| KodeKloud | https://kodekloud.com | Strong hands-on labs specifically for Kubernetes (CKA/CKAD prep), Docker, Terraform, DevOps. Known for browser-based interactive terminals. |
| Kubernetes official docs | https://kubernetes.io/docs/home/ | The canonical, always-current reference for every Kubernetes object, concept, and API — primary source of truth, not a secondary summary. |
| Terraform Registry docs | https://registry.terraform.io/ | Official provider/module registry and documentation — the definitive resource for resource arguments and published community modules. |
| HashiCorp Developer (Terraform docs/tutorials) | https://developer.hashicorp.com/terraform | HashiCorp's own tutorials and conceptual docs for Terraform, Vault, Consul, etc. |
| Exam Pro / Tutorials Dojo | https://tutorialsdojo.com | Widely used AWS certification practice exams and cheat sheets, especially strong for SAA/SAP prep. |

## Hands-On Practice

| Resource | URL | Description |
|---|---|---|
| AWS Free Tier | https://aws.amazon.com/free/ | 12 months of limited free usage plus always-free service tiers — the standard way to get real AWS hands-on experience without major cost. |
| Killercoda | https://killercoda.com | Browser-based, in-browser Kubernetes/Docker/Linux scenarios and interactive playgrounds (spiritual successor to the now-retired Katacoda). |
| Play with Kubernetes | https://labs.play-with-k8s.com | Free, ephemeral, browser-based multi-node Kubernetes playground for quick experimentation without any local setup. |
| Play with Docker | https://labs.play-with-docker.com | Same idea as Play with Kubernetes, but for Docker — free ephemeral containers in the browser. |
| KillerCoda CKA/CKAD scenarios | https://killercoda.com/killer-shell-cka | Simulated exam environments specifically mirroring the real CKA/CKAD exam interface. |

## Core Tools

| Tool | URL | Description |
|---|---|---|
| Terraform | https://www.terraform.io | The dominant open-source IaC tool; declarative, multi-cloud, large provider/module ecosystem. |
| Pulumi | https://www.pulumi.com | IaC using general-purpose languages (TypeScript, Python, Go, C#) instead of a DSL — useful when you want real loops/functions/type-checking in infra code. |
| Ansible | https://www.ansible.com | Agentless configuration management and automation — commonly used for configuring servers/software after Terraform provisions the infrastructure. |
| Helm | https://helm.sh | The package manager for Kubernetes — templated, versioned, reusable application manifests ("charts"). |
| Lens | https://k8slens.dev | Desktop GUI IDE for Kubernetes clusters — visual pod/log/resource inspection on top of `kubectl`. |
| k9s | https://k9scli.io | Terminal UI for Kubernetes — fast keyboard-driven navigation of pods, logs, and resources, very popular for day-to-day cluster work. |
| Prometheus | https://prometheus.io | The de facto standard open-source metrics collection and alerting system for cloud-native environments (pull-based, PromQL query language). |
| Grafana | https://grafana.com | Visualization/dashboarding layer, commonly paired with Prometheus, Loki, and cloud-native data sources. |
| Datadog | https://www.datadoghq.com | Commercial, all-in-one observability platform (metrics, logs, traces, APM, security) — widely used in industry, SaaS-hosted. |
| AWS CLI | https://aws.amazon.com/cli/ | Official command-line interface for every AWS service — essential for scripting and automation. |
| AWS CDK | https://aws.amazon.com/cdk/ | IaC using real programming languages that synthesizes to CloudFormation — AWS's answer to the Pulumi approach, AWS-only. |
| Trivy | https://aquasecurity.github.io/trivy/ | Open-source vulnerability/misconfiguration scanner for container images, filesystems, and IaC. |
| ArgoCD | https://argo-cd.readthedocs.io | Declarative GitOps continuous delivery tool for Kubernetes — syncs cluster state to a Git repo automatically. |

## Architecture & Design References

| Resource | URL | Description |
|---|---|---|
| AWS Well-Architected Framework | https://aws.amazon.com/architecture/well-architected/ | The official framework and review tool covering the six pillars (operational excellence, security, reliability, performance, cost, sustainability). |
| AWS Architecture Center | https://aws.amazon.com/architecture/ | Reference architectures, whitepapers, and diagrams for real-world AWS solutions across industries. |
| C4 Model | https://c4model.com | A lightweight, widely adopted standard for software architecture diagrams at four levels of abstraction (Context, Container, Component, Code) — good for communicating architecture clearly to varied audiences. |
| Azure Architecture Center | https://learn.microsoft.com/en-us/azure/architecture/ | Microsoft's equivalent reference architecture catalog for Azure. |
| Google Cloud Architecture Center | https://cloud.google.com/architecture | GCP's equivalent reference architecture and best-practices catalog. |

## Certification Bodies

| Body | URL | Description |
|---|---|---|
| AWS Certification | https://aws.amazon.com/certification/ | Official AWS certification paths (Cloud Practitioner, Solutions Architect Associate/Professional, Specialty certs) — exam guides, registration, and sample questions. |
| CNCF (Cloud Native Computing Foundation) | https://www.cncf.io/certification/cka/ | Governs CKA (Certified Kubernetes Administrator) and CKAD (Certified Kubernetes Application Developer) — the vendor-neutral Kubernetes certifications. |
| HashiCorp Certification | https://www.hashicorp.com/certification | Official HashiCorp certs, including Terraform Associate — vendor-specific but widely respected for IaC roles. |
