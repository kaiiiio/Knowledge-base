# Current Risks and Gaps

The purpose of this list is engineering prioritization, not self-criticism. Every system has constraints; strong backend work makes them explicit.

## P0: Correctness and security

| Gap | Evidence and impact | Current treatment |
|---|---|---|
| Novus is not idempotent | A repeated callback can still create repeated external orders. | **Partial:** OANDA is protected; Novus is clearly excluded from that guarantee. |
| Novus protection-order compensation | A market order may fill before stop-loss or take-profit creation fails. | **Roadmap:** persist a `NEEDS_ATTENTION` state, alert operators, and reconcile broker truth. |
| Credential encryption lacks authentication | AES-256-CBC hides plaintext but does not detect ciphertext modification. | **Partial:** encrypted password path exists; migrate to AES-256-GCM/KMS envelope encryption. |
| Long-lived broker secrets | API keys and session tokens need rotation and access auditing. | **Roadmap:** managed secret store, per-record key version, rotation worker, least privilege. |
| Stripe event deduplication | Signatures prove origin, not that an event was processed only once. Repeated success can resend confirmation. | **Roadmap:** persist unique Stripe event IDs and the processing outcome. |
| Admin subscription command | `/grant_sub` appears available without a demonstrated authorization guard. | **Roadmap/P0:** remove it or require an allow-listed administrator identity and audit entry. |
| Log API can capture request bodies | The legacy database request logger can persist headers and bodies containing credentials. | **Partial:** new structured logger redacts; migrate or remove the legacy request logger. |

## P1: Reliability and operability

| Gap | Impact | Proposed change |
|---|---|---|
| Webhook processing is synchronous | Slow Telegram fan-out can delay acknowledgement and trigger provider retries. | Persist event, enqueue work, return `202`, retry in a worker. |
| Jobs share the web process | Restarts can miss a run; multiple replicas can run the same job. | Distributed scheduler/queue with a uniqueness lock. |
| No dead-letter queue | Repeated failures are visible only in logs. | Bounded exponential retries and a reviewable DLQ. |
| No reconciliation loop | Local order state can diverge from broker state. | Poll/stream broker truth and reconcile by broker order ID. |
| Health is shallow | A process can report OK while MongoDB is unavailable. | Separate `/live` and `/ready`, with dependency checks and time budgets. |
| Shutdown is incomplete | Telegram polling, cron tasks, and MongoDB may outlive HTTP shutdown. | Central lifecycle manager with stop hooks and a forced-shutdown deadline. |
| Notification burst control | `Promise.allSettled` can fan out without a concurrency cap. | Queue-based delivery or a bounded concurrency limiter. |

## P2: Maintainability and delivery

| Gap | Evidence | Proposed change |
|---|---|---|
| Legacy module boundaries | Some bot callbacks still orchestrate databases and broker APIs directly. | Continue use-case extraction one workflow at a time. |
| No prior automated tests | Baseline contained zero tests. | **Improved:** 43 tests now cover the critical slice; expand around subscriptions and Novus. |
| ESLint was not configured | `npm run lint` failed before reading source files. | Add a versioned config, fix changed paths first, then burn down legacy findings. |
| Formatting drift | Baseline Prettier check reported 86 files. | Format changed files now; schedule a dedicated repository-wide formatting commit. |
| Dependency risk | Locked install reported 100 findings: 10 low, 29 moderate, 52 high, 9 critical. | Triage direct dependencies, remove unused boilerplate packages, upgrade in isolated batches. |
| Old Node engine declaration | `package.json` declares Node 12 compatibility despite modern tooling and dependencies. | Set and test an active LTS floor, then add CI version enforcement. |
| Minimal original README | The system could not be evaluated or reproduced from its documentation. | **Improved:** this documentation suite and runbook now provide the entry point. |
| Orphaned optional imports | The circular scan skips a missing token service, an FCM notifications module, and the intentionally untracked Firebase credential file. | Remove unused subsystems or restore them behind validated optional adapters before claiming those paths work. |

The default `npm run lint` and `npm run prettier` commands gate the maintained interview slice. Repository-wide `npm run lint:all` currently reports 21 legacy errors, and `npm run prettier:all` reports 75 untouched files. This separation keeps new work clean while making the cleanup backlog visible.

## P3: Scale and advanced operations

- OpenTelemetry traces across webhook, use case, database, Telegram, and broker calls.
- Prometheus-style RED metrics: request rate, error rate, duration.
- Business metrics: signals received, duplicates prevented, recipients notified, trade reservations, fills, rejections, and reconciliation mismatches.
- Service-level objectives and error-budget policy.
- API, bot, worker, and scheduler process roles using the same modular codebase.
- Redis/BullMQ or a managed queue with delivery visibility and dead-letter handling.
- Load tests for signal bursts and large recipient sets.
- Backup/restore and disaster-recovery drills.

## Known data migration concern

The canonical signal shape changed from flat fields such as `price`, `tp1`, and `sl` to `entry`, nested `targets`, and `stopLoss`. New code is aligned, but existing database documents may require a one-time migration before old signals can be executed. A safe migration should:

1. back up the collection;
2. transform only documents missing the canonical fields;
3. compute fingerprints;
4. detect fingerprint collisions before enabling the unique index;
5. validate counts and sample documents; and
6. retain a rollback copy until production verification completes.

This repository does not claim that a production database migration has been run.
