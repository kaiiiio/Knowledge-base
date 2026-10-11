# Backend Concepts Learned — FFM

Each concept, the FFM place it lives, and the transferable one-liner.

## 1. Idempotency (the big one)
- **Where**: Stripe webhooks keyed by event ID; generation debits keyed by client request key.
- **Transferable**: "Any handler that can be retried must produce the same result twice. Record the key first, act second."

## 2. Ledgers beat counters
- **Where**: FIFO credit batches instead of `user.credits += n`.
- **Transferable**: "When money or entitlements are involved, store *events/batches*, derive the balance. A counter can't answer 'which purchase did this consume?' — a ledger can."

## 3. Queue-decoupled long work
- **Where**: AI generation via Redpanda; web tier publishes and returns immediately.
- **Transferable**: "HTTP requests must not wait on multi-second work. Publish, respond 202-style, push/poll status."

## 4. At-least-once + reconciliation
- **Where**: worker death can strand a credit reservation → reconciler releases orphans.
- **Transferable**: "Delivery is at-least-once, so effects need idempotency, and a reconciler turns 'usually consistent' into 'eventually always consistent.'"

## 5. Compensation over distributed transactions
- **Where**: reserve credits → job fails → release (saga-style compensation), no 2PC anywhere.
- **Transferable**: "Across services, model rollback as an explicit compensating action, and make it idempotent too."

## 6. Server as the single renderer
- **Where**: remixes are `stem_config` data; only the Python service produces the final .mp3.
- **Transferable**: "Let clients edit *descriptions* of the artifact; one authoritative renderer prevents divergent outputs and giant uploads."

## 7. Cross-cutting concerns via interceptors (AOP)
- **Where**: audit logging in the Python merge service via interceptors, not scattered log lines.
- **Transferable**: "Auth, auditing, timing — wrap them around handlers instead of pasting them into every function."

## 8. Webhook trust boundaries
- **Where**: raw-body signature verification before parsing; redirect page never trusted for payment truth.
- **Transferable**: "The webhook (verified) is the source of truth; the browser redirect is UX only."

## 9. Race between UX and money
- **Where**: success page can render before the credit webhook lands → UI shows 'processing'.
- **Transferable**: "Design UIs for the async gap; never assume the money event has arrived because the user came back."

## 10. Client-side performance economics
- **Where**: decoded-audio caching (RAM vs re-download), refs for high-frequency values, memoized timeline math.
- **Transferable**: "Cache the expensive transform, not the cheap source; re-render only what the user watches."
