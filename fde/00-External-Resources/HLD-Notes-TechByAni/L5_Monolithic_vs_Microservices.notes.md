# Monolithic vs Microservices Architecture — Notes (from L5_Monolithic_vs_Microservices.pdf)

Source: TechByAni HLD-Notes.

## Monolithic Architecture

All the code is bundled together in a single unit → one deployable artifact (like a `.war`, `.jar`, `.exe`, or Docker image). All authentication, payments, search, notifications, etc. live in a single unit.

```
Client ⇄ Server ⇄ DB
```

**Example — Shopping App as a monolith**: one deployable block containing Login & Signup, Product Catalog, Cart, Payments, Order — all talking to one shared DB.

### Pros
- Single unit → easy for a small team to manage.
- Easy deployment: no complex pipelines — example: just copy the `.war` file to your Tomcat server and you're done.
- Fast performance: function calls instead of network calls (everything is in-process).

### Cons
- Scaling problems — you can't scale just the "hot" part; you scale the whole thing.
- Tightly coupled: everything depends on everything.
- Slow development with big teams: multiple teams editing the same codebase = merge conflicts, coordination overhead.
- Hard to adopt new tech (the whole app is on one stack).
- Deployment risk (one bad deploy can take down the entire app, not just one feature).

## Microservices Architecture

The application is split into multiple small, independent services. Each service can be developed, deployed, and scaled independently.

**Example — Shopping App as microservices**: Login & Signup, Product Catalog, Cart, Payments, Order — each is its own service, each with **its own DB**.

### Pros
- Scalability — scale only the service under load (e.g. scale Payments during a sale, leave the rest alone).
- Independent deployment — ship one service without redeploying everything.
- If one service fails, others still work (fault isolation).
- Flexibility in tech — each service can use a different stack if it makes sense.

### Cons
- Complex communication between many services.
- DevOps overhead — need Kubernetes/Docker, CI/CD, monitoring, logging, service discovery.
- Network latency (in-process function calls became network calls).
- Each service may have its own DB, keeping data consistent across them is hard.
- Debugging is harder (a single user action can span many services).

## How to break a monolith into microservices

**1. Don't split randomly — use Domain-Driven Design.** Break by **business capability, not by technical layers**.

❌ Wrong way (technical split): Frontend Service, Backend Service, Database Service — this doesn't actually decouple anything meaningful.

✅ Right way (business split): User Service (authentication, profiles), Order Service (cart, checkout, order history), Payment Service (transactions, refunds), Inventory Service (stock, availability), Notification Service (emails, SMS, push).

**2. One service at a time** — migrate incrementally, don't rewrite everything at once.
**3. Expose APIs** — give each extracted service a clean API contract.
**4. Database** — decide on data ownership per service.
**5. API Gateway** — introduce a single entry point (see `API_Gateway.notes.md` in this folder).
**6. Repeat for others** — extract the next service once the pattern is proven.

## Why separate databases?

If services share the same DB, they're still coupled at the data layer — you haven't actually decoupled anything, you've just split the code. Separate databases give: choice of DB per service (SQL for one, NoSQL for another), fault isolation (one DB going down doesn't take every service down with it).

## Problems with separate databases

Multiple databases = more infra to manage, more monitoring, more backups. **Complex queries** — e.g. "get all orders with user details" now requires calling two services and joining in application code, since you can no longer just JOIN across tables in one DB.

## Hybrid approach (common in real life)

Most real systems land somewhere in between: some services share a database cluster (with logically separate schemas) while the most independent/high-scale services (payments, notifications) get fully separate databases. Pure "one DB per microservice" is the textbook ideal; pragmatic systems often compromise based on team size and operational maturity.

## Cross-reference

See [../../04-System-Design-HLD/05_design_calendly_multitenant.md](../../04-System-Design-HLD/05_design_calendly_multitenant.md) and other HLD walkthroughs in this KB for concrete service-decomposition examples, and [../../05-Distributed-Systems/04_distributed_transactions_and_sagas.md](../../05-Distributed-Systems/04_distributed_transactions_and_sagas.md) for how to keep data consistent across separately-owned databases (sagas, outbox pattern) — the direct answer to "Problems with Separate Databases" above.
