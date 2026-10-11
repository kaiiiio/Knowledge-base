# Interview Story

Do not memorize this word for word. Use the structure, replace phrasing with your normal speech, and be ready to open the code that proves each statement.

## 30-second project introduction

> Solo Trend Bot is a Node.js backend that receives strategy signals, targets subscribed Telegram users by their preferences, and lets them place trades through connected broker accounts. The hard part is not sending a Telegram message; it is preventing retries and double-clicks from producing duplicate alerts or real broker orders. I evolved the project into a modular monolith, created a canonical signal model, added database-enforced idempotency, verified webhooks, isolated provider adapters, and built 43 tests around the critical signal-to-OANDA flow.

## “What is your best work so far?”

> My best work is the reliability redesign of this bot’s signal-to-trade path. It combines user preferences, billing, Telegram, MongoDB, Stripe, and broker APIs, so it exposed me to real backend failure modes.
>
> The key problem I found was inconsistent signal data. The webhook produced nested fields, the schema was moving toward a different model, and trade execution still read old flat fields. Instead of patching individual lines, I defined one canonical signal contract and separated pure validation from infrastructure.
>
> I then focused on idempotency. Signals receive a deterministic fingerprint enforced by a unique Mongo index. For trades, I reserve a key derived from broker, user, signal, target, and account before calling OANDA. If a Telegram callback is delivered twice, the second request returns the existing order and never reaches the broker.
>
> I consider it my best work because the improvement is architectural and measurable: the critical workflow can be tested without live providers, 43 tests now cover it, and I can explain both what is production-ready and what still needs queues, reconciliation, and stronger operations.

## The approach you followed

1. **Mapped the real workflow:** provider to webhook to database to Telegram to user callback to broker.
2. **Identified dangerous invariants:** one canonical signal, one notification per fingerprint, one broker attempt per trade key.
3. **Wrote failing tests first:** proved each behavior was absent before implementing it.
4. **Created boundaries around volatility:** repositories, notification gateway, and broker/account ports.
5. **Put concurrency control in MongoDB:** unique indexes and atomic reservation rather than process memory.
6. **Secured trust boundaries:** Stripe raw-body signatures, signal secret, configuration validation, and log redaction.
7. **Documented trade-offs honestly:** OANDA is the tested vertical slice; Novus and asynchronous operations remain less mature.

## A small decision with outsized value: Telegram video delivery

> For onboarding videos I store Telegram’s returned `file_id` in configuration and reuse it in `sendVideo`. The backend sends a small identifier rather than uploading the binary for every user. That reduces our bandwidth and latency, avoids packaging large media in deployments, and lets Telegram serve the asset. The trade-off is Telegram-specific coupling, so I would keep the original file and a re-upload runbook.

This answer shows that you notice operational details, not only large architecture labels.

## A failure you found and how you handled it

> The signal schema had moved to `entry`, `targets`, and `stopLoss`, but the service still saved `price`, `tp1`, and `sl`, and the trade callback read those old names. That meant a webhook could appear successful while persistence or execution used undefined values. I treated it as a contract problem: wrote normalization tests, introduced a single canonical shape, migrated consumers, and documented that existing database records still need a controlled migration.

## Why this was not split into microservices

> The current scale and team context do not justify distributed services. The important improvement was dependency direction and independently testable modules. A modular monolith keeps transactions and deployment simple. If notification volume grows, I would first separate API, bot, worker, and scheduler processes around a queue; service extraction would follow evidence about ownership or scaling.

## Why Wobot?

Wobot publicly describes a video-intelligence platform that works with existing camera infrastructure, turns camera feeds into operational insights, and supports alerts/reporting across industries such as hospitality and retail. Its careers page currently lists a remote India Backend Developer (NodeJS) opening and emphasizes structured upskilling time. Sources: [Wobot product site](https://wobot.ai/), [Wobot about](https://wobot.ai/about-us), and [Wobot careers](https://wobot.ai/careers).

A natural answer:

> Wobot interests me because the backend sits between high-volume real-world data and decisions people need to act on. Video intelligence is not only a model problem: the platform has to ingest events, manage device/customer configuration, deliver timely alerts, store evidence, and remain observable when integrations fail. Those are the backend problems I enjoyed most in this project—idempotent events, reliable notifications, external adapters, and production operations. I also like that the role is explicitly Node.js and that the company talks about ongoing upskilling, because I want a place where I can contribute now while becoming stronger in distributed systems.

Before the call, personalize one sentence: choose a Wobot use case you genuinely find interesting and explain why.

## How you can add value

> I can add value in three ways. First, I already work comfortably in Node.js around webhooks, MongoDB, scheduled jobs, payments, notifications, and third-party APIs. Second, I think in failure modes: duplicate delivery, partial success, timeouts, data migration, and safe logging. Third, I communicate trade-offs through tests, diagrams, ADRs, and runbooks, which helps a team review and operate a system rather than depending on one person’s memory. I would bring that approach to Wobot’s event and alert pipelines, while learning the scale and domain constraints from the team.

## Likely follow-up questions

### Why SHA-256 for the signal fingerprint?

It gives a compact deterministic key over normalized execution fields. Security is not the primary purpose; collision resistance and stable representation are. The database unique index is the concurrency guarantee.

### Why not use Telegram message ID as idempotency?

Webhook signal creation happens before Telegram delivery and can target many users. A provider/business fingerprint identifies the signal independently of a delivery channel.

### What if two processes receive the same signal simultaneously?

Both may attempt the insert, but the unique index allows one. The other receives duplicate-key error and loads the existing signal. Process-local locks would not protect multiple replicas.

### What if OANDA times out after receiving the order?

That outcome is ambiguous. Do not blindly retry. Persist an attention state and reconcile using client/broker identifiers. The current tested path records known failures; a full reconciliation worker is the next production step.

### Why `Promise.allSettled` for Telegram?

It prevents one recipient failure from rejecting the entire fan-out. At larger scale I would use a queue and bounded concurrency because an unbounded promise set still creates memory and rate-limit risk.

### Why raw body for Stripe?

Stripe signs the exact bytes. JSON parsing and serialization can change whitespace or representation, invalidating the signature.

### Is credential encryption production-grade?

Not yet. AES-CBC provides confidentiality but no built-in integrity, and key rotation is incomplete. I would migrate to AES-GCM or managed KMS envelope encryption with key versions and access audit.

### What would you do with another week?

Add concurrent Mongo integration tests, protect the admin subscription command, add Stripe event idempotency, introduce `NEEDS_ATTENTION` and OANDA reconciliation, then establish CI lint/format/security gates.

## Questions to ask the interviewers

- What kinds of backend events or alerts have the strictest latency and reliability requirements at Wobot?
- How do backend and computer-vision teams define and version the event contract between model output and customer-facing workflows?
- Where does the system currently use synchronous requests versus queues or streams?
- How do you handle observability and debugging across customer sites, camera integrations, and cloud services?
- What would success for this Backend Developer look like in the first 90 days?

## Authenticity checklist

- Explain only code you can navigate to.
- Say “roadmap” for work not implemented.
- Use one real mistake and what it taught you.
- Prefer your own vocabulary over polished memorization.
- If you do not know, explain how you would investigate and test the assumption.
