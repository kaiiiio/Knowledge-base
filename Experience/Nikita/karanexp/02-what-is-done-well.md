# What Is Already Done Well

This document gives credit to concrete engineering choices already present in the project. A good interview explanation should show judgment, not only list problems.

## 1. Telegram `file_id` reuse for video delivery

**Status: Implemented**

The onboarding and subscription-success messages call `sendVideo(chatId, videoFileId, ...)`, where the identifiers come from configuration.

Why this is valuable:

- The application does not read and upload the same video bytes for every user.
- Telegram serves the already-hosted object from its own media infrastructure.
- Application bandwidth, memory use, upload latency, and timeout exposure are reduced.
- The application does not need S3 or a public media URL for those Telegram-only assets.
- Deployments stay smaller because promotional video binaries are not packaged with the service.

The trade-off is platform coupling: a Telegram `file_id` is not a general-purpose asset identifier and may need replacement if the bot or media context changes. Production operations should keep a source asset and a documented re-upload procedure.

## 2. Preference-targeted notifications

**Status: Implemented**

Signals are not broadcast blindly. Recipient queries use both symbol and timeframe preferences plus subscription/signal settings. This reduces irrelevant alerts and makes the notification system user-specific.

The new ingestion use case treats recipient delivery independently: a Telegram failure for one user does not roll back the persisted signal or hide other successful sends.

## 3. Duplicate-signal protection at the database boundary

**Status: Implemented and tested**

The domain creates a deterministic fingerprint from strategy, instrument, timeframe, side, entry, targets, and stop loss. The database enforces uniqueness. This matters because webhooks are normally delivered at least once, not exactly once.

Application-only “check then insert” logic would race under concurrent requests. Catching MongoDB duplicate-key error `11000` makes the database the final concurrency guard.

## 4. Broker call protected by an atomic reservation

**Status: Implemented and tested for OANDA**

The most important idempotency decision happens before the external side effect. A stable trade key is atomically reserved before OANDA submission. A second callback sees the existing reservation and does not call the broker.

This is stronger than deduplicating order rows after submission: post-call deduplication can make the database look clean while two real trades were placed.

## 5. Provider-specific details are moving to adapters

**Status: Implemented for the signal path and OANDA use case; partial project-wide**

Signal validation knows nothing about Express, Telegram, or Mongoose. The ingestion use case depends on repository and notification behavior rather than concrete packages. The OANDA use case accepts account and order ports.

This gives fast deterministic tests and creates a practical path toward broker substitution without creating microservices.

## 6. External API timeout awareness

**Status: Partial**

The OANDA Axios client has a 10-second timeout. This prevents a request from hanging indefinitely and consuming server resources.

The same policy is not yet standardized across every integration, and there is no circuit breaker or retry classification. The good choice exists; it needs to become a cross-adapter policy.

## 7. Stripe raw-body signature verification

**Status: Implemented and tested**

Stripe verification uses `stripe.webhooks.constructEvent` against the raw body before parsing or changing a subscription. Mounting `express.raw` before global JSON parsing avoids the common signature mismatch caused by re-serialization.

## 8. Sensitive configuration stays outside source control

**Status: Implemented, with security roadmap remaining**

`.env` and known credential files are ignored. Runtime values are accessed through configuration getters. A sanitized `.env.example` now documents names without values, and startup validation reports missing key names without printing secrets.

## 9. Structured logs, rotation, and redaction

**Status: Partial**

Winston writes JSON logs with timestamps and daily rotation. The improved logging wrapper recursively redacts token, secret, password, authorization, credential, and API-key fields.

Local disk rotation is useful for a single host but insufficient for horizontally scaled or ephemeral deployments. Central collection, correlation IDs, metrics, and traces remain roadmap items.

## 10. Health and lifecycle awareness

**Status: Partial**

The service exposes uptime and timestamp health data, catches unhandled process errors, responds to `SIGTERM`, and closes the HTTP server.

The next step is separate liveness/readiness checks that include MongoDB state, plus clean shutdown of Telegram polling, cron schedules, and the MongoDB connection.

## How to present these choices

Avoid saying “I used Telegram because it was easy.” A stronger explanation is:

> Telegram provided identity, push delivery, interactive callbacks, and hosted-media reuse in one client. I used `file_id` reuse to keep media off my application path, then isolated Telegram behind a notification adapter so core signal behavior is testable without Telegram.

That answer connects a small implementation detail to latency, bandwidth, failure surface, platform trade-offs, and architecture.
