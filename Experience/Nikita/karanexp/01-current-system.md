# Current System

## Purpose

Solo Trend Bot receives strategy signals, selects subscribed users by their configured instruments and timeframes, sends actionable Telegram alerts, and lets a user submit a trade to a connected broker account.

## Runtime components

| Component | Responsibility | Status |
|---|---|---|
| Express API | Health checks and webhook delivery | **Implemented** |
| Telegram bot | Onboarding, settings, billing, account selection, and trade callbacks | **Implemented** |
| Signal module | Canonical validation, fingerprinting, persistence, recipient lookup, notification | **Implemented** |
| OANDA execution | Margin check, atomic reservation, broker submission, outcome audit | **Implemented and tested** |
| Novus execution | Market order, position polling, stop loss, take profit | **Partial** |
| Stripe billing | Checkout creation and verified payment-success webhook | **Implemented** |
| MongoDB | Users, platforms, signals, orders, and application logs | **Implemented** |
| Scheduled jobs | Subscription-expiry checks | **Partial**; runs in the web process |
| Observability | JSON rotating logs and health response | **Partial** |

## Current module map

```text
src/
├── api/                    # Existing HTTP/integration-oriented modules
│   ├── orders/
│   ├── signals/
│   ├── user/
│   ├── webhook/
│   ├── oanda/
│   └── novus/
├── bot/                    # Telegram delivery handlers and callbacks
├── common/                 # Configuration, middleware, logging, utilities
├── jobs/                   # In-process cron jobs
├── modules/
│   ├── signals/
│   │   ├── domain/         # Framework-free signal rules
│   │   ├── application/    # Ingestion orchestration
│   │   └── infrastructure/ # Mongo/user/Telegram adapters
│   └── trading/
│       └── application/    # Tested OANDA execution use case
├── app.js                  # Express middleware and raw Stripe route
├── index.js                # Database/server/process lifecycle
└── startup.js              # Secrets, validation, and application startup
```

This is an incremental migration. Older folders remain operational while the most important workflows move behind explicit boundaries.

## Data model

### User

Stores Telegram identity, subscription state, signal preferences, trade unit settings, and active platform selection.

### Platform

Associates a user with Novus, Sway, or OANDA connection data and an active broker account. Password encryption exists for the credential workflow, but the storage model needs a stronger authenticated-encryption and key-rotation design.

### Signal

The canonical model contains:

- `fingerprint`: unique stable identity for duplicate prevention;
- `strategy`, `symbol`, `timeframe`, and `side`;
- `entry`, three `targets`, and `stopLoss`;
- optional score and reasons;
- lifecycle status and hit-level flags; and
- creation/update timestamps.

### Order

Stores internal and broker identities, user/signal/account relationships, instrument, side, units, protective prices, lifecycle status, broker metadata, and an optional unique idempotency key.

## Main data flows

### New signal

1. Express receives an object or JSON text body.
2. The signal webhook checks the shared secret with a timing-safe comparison.
3. The domain module validates and normalizes provider fields.
4. A SHA-256 fingerprint is generated from execution-relevant fields.
5. MongoDB creates the signal under a unique index.
6. A duplicate-key race is converted into a successful duplicate result.
7. Preference-matching users are loaded.
8. Telegram sends are isolated using `Promise.allSettled`; one failure does not erase the others.

### OANDA trade

1. Telegram callback data selects `tp1`, `tp2`, or `tp3`.
2. The handler checks signal age, user existence, and active platform.
3. The use case checks broker connection, margin, and configured lot size.
4. It derives a stable key from broker, user, signal, target, and account.
5. MongoDB atomically reserves that key before the broker call.
6. An existing reservation returns immediately without calling OANDA.
7. A new reservation submits the order and records `FILLED` or `REJECTED`.

### Stripe subscription

1. Express preserves the raw request bytes on the Stripe route.
2. Stripe verifies the signature with the configured endpoint secret.
3. The handler resolves the Telegram ID from subscription metadata.
4. The exact Stripe billing-period end becomes the local expiry time.
5. The user is activated and receives a Telegram confirmation.

## Deployment shape today

The HTTP server, Telegram long-polling client, MongoDB connection, and cron work share one Node.js process. This is easy to deploy and appropriate for an early modular monolith, but it prevents independent scaling and increases the blast radius of a process failure. The production roadmap separates API, bot consumer, and worker roles without splitting the business model into premature microservices.
