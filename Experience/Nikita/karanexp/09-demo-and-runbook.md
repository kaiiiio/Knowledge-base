# Demo and Runbook

## Safety rule

Use a Telegram test bot, Stripe test mode, an isolated MongoDB database, and OANDA practice accounts. Do not demo against real funds or production subscribers.

## Five-minute interview demo

### 0:00–0:45 — orient the system

Open the root README architecture diagram. State the invariant:

> One logical signal should create one alert set, and one logical user trade request should call the broker at most once.

### 0:45–1:30 — show pure domain behavior

Open `src/modules/signals/domain/signal.js` and its tests. Explain provider normalization, validation errors, and execution-field fingerprinting.

### 1:30–2:15 — show concurrent duplicate control

Open `mongooseSignalRepository.js`. Point out that MongoDB uniqueness, not an in-memory flag, is the final race guard.

### 2:15–3:15 — show trade reservation

Open `executeOandaTrade.js` and `order.service.js`. Follow the order:

1. validate account/margin/units;
2. compute key;
3. reserve atomically;
4. return on duplicate;
5. call OANDA only for a new reservation; and
6. persist fill/rejection.

### 3:15–4:00 — show trust boundaries

Open `app.js`, `stripeWebhook.js`, and `signalWebhook.js`. Explain raw Stripe body, signature verification, timing-safe signal secret, and safe error responses.

### 4:00–4:30 — run tests

```powershell
npm test -- --runInBand
```

Expected verified result at handoff: 9 suites and 43 tests passing.

### 4:30–5:00 — close with honesty

Open the roadmap. State that OANDA is the deeply tested slice, while queueing, reconciliation, Novus idempotency, and centralized observability are explicit next steps.

## Local setup

```powershell
Copy-Item .env.example .env
npm ci
npm test -- --runInBand
npm run dev
```

Required for full local startup:

- `MONGODB_URL`
- `BOT_TOKEN`
- `PLATFORM_ENCRYPTION_KEY` as 64 hexadecimal characters

Required for the relevant integration:

- `SIGNAL_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
- Stripe product/success URL values
- Telegram video file IDs
- broker credentials stored through the bot flow

## Example signal request

```powershell
$headers = @{ 'X-Signal-Secret' = $env:SIGNAL_WEBHOOK_SECRET }
$body = @{
  strategy = 'Momentum Breakout'
  symbol = 'EURUSD'
  timeframe = '15m'
  signal = 'buy'
  entry = @{ price = 1.1005 }
  targets = @{ tp1 = 1.11; tp2 = 1.12; tp3 = 1.13 }
  stop_loss = @{ sl = 1.09 }
  score = @{ value = 8; tier = 'A' }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Method Post `
  -Uri 'http://localhost:3000/api/v1/webhook/signals' `
  -Headers $headers `
  -ContentType 'application/json' `
  -Body $body
```

Send the same request twice. The first response should be `created`; the second should be `duplicate` with zero notifications.

## Health check

```powershell
Invoke-RestMethod http://localhost:3000/api/v1/health
```

Current health proves the Node process is responsive. It does not yet prove MongoDB, Telegram, Stripe, or brokers are ready.

## Telegram media runbook

If a configured video `file_id` stops working:

1. locate the original approved source video;
2. upload it once through the correct Telegram bot;
3. capture the returned video `file_id` from the update/message payload;
4. update `START_MESSAGE_VIDEO_FILE_ID` or `SUBSCRIPTION_SUCCESS_MESSAGE_VIDEO_FILE_ID` in the secret/configuration system;
5. restart or reload configuration according to deployment policy;
6. test with an internal chat; and
7. record who changed the ID and why.

Do not commit the media identifier if repository policy treats it as environment-specific.

## Incident: duplicate signals reported

1. Find the normalized execution fields and expected fingerprint.
2. Confirm the unique `fingerprint` index exists in MongoDB.
3. Check whether the messages are truly the same logical signal; changed price/targets intentionally produce a different key.
4. Inspect created/duplicate response counts.
5. Do not delete duplicate evidence before determining whether the database index was absent during migration.
6. Fix the index/migration and replay only after recipient impact is understood.

## Incident: user reports duplicate OANDA trade

1. Stop automated retries for the affected key.
2. Locate orders by user, signal, target-derived idempotency key, account, and time.
3. Query OANDA using broker/client identifiers.
4. Treat local timeout as ambiguous until broker truth is known.
5. If two broker orders exist, follow the approved financial/operator compensation procedure; do not automatically close positions without policy.
6. Preserve request, order, and reconciliation evidence with secrets redacted.

## Incident: market order filled but protection uncertain

1. Escalate immediately as `NEEDS_ATTENTION` operationally, even if the current model has not yet added that state.
2. Query open positions and protective orders at the broker.
3. Notify the authorized operator/user using an approved channel.
4. Never report “trade failed” if the market fill may exist.
5. Reconcile local state after broker truth is confirmed.

## Incident: Stripe webhook failures

1. Confirm endpoint secret belongs to the correct environment.
2. Confirm the route receives raw `application/json` bytes.
3. Use Stripe test-mode delivery logs/CLI to replay one event.
4. Check signature rejection separately from event-processing failure.
5. Check user metadata contains `telegramId`.
6. Before replaying payment success repeatedly, inspect whether subscription state already changed; Stripe event idempotency is roadmap work.

## Pre-deployment checklist

- All automated tests pass.
- Changed files pass formatting and focused lint checks.
- No `.env`, private key, service-account file, or access token is staged.
- MongoDB migrations/index creation are reviewed and backed up.
- Telegram bot and Stripe endpoint belong to the target environment.
- Broker environment is practice/sandbox unless a separately approved production release is occurring.
- Rollback version and database rollback plan are known.
- Alerts and operator contacts are active.

## Post-deployment checks

- `/health` responds.
- MongoDB connection is confirmed in logs.
- Telegram test command works.
- One authenticated test signal produces the expected created/duplicate behavior.
- Stripe test event verifies correctly in non-production.
- Error rate and latency show no regression.
- No secret values appear in structured logs.

## Current operational limitations

- No central queue/DLQ.
- No automatic broker reconciliation.
- No complete readiness endpoint.
- No proven multi-instance cron locking.
- No centralized metrics/tracing.
- No tested production database migration in this repository.

These limitations are explicit so the demo remains credible.
