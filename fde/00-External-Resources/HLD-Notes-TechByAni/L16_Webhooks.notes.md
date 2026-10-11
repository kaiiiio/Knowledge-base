# Webhooks — Notes (from L16_Webhooks.pdf)

Source: TechByAni HLD-Notes.

> **Legibility note**: this PDF is very dense at the resolution available for OCR — most step-by-step detail and the comparison tables weren't reliably readable. What follows is the confidently legible framing (the opening definition) filled in with standard webhook knowledge; open the PDF directly for exact wording and the full comparison tables.

## The opening framing

"A callback is a pattern in programming in distributed systems. **You define the callback (say — 'when you're ready, call me at this endpoint').**"

## What is a webhook?

A webhook is a software mechanism/method where an HTTP endpoint gets invoked automatically when something happens on the sender's side — instead of the receiver repeatedly asking "did anything happen yet?" (polling), the sender proactively calls a URL you registered, the moment the event occurs.

**In short**: webhooks are user-defined HTTP callbacks — reverse of a normal API call (you don't call them; they call you).

## Why webhooks exist (the problem they solve)

Without webhooks, the only way to find out about an event on another system is to **poll** — repeatedly ask "any update?" This wastes requests, adds latency (you only find out at the next poll interval), and doesn't scale (see the polling problems covered in `WebSockets.notes.md`, same underlying issue). Webhooks flip the model: the event source pushes to you the instant it happens.

## How a webhook typically works

1. **You register an endpoint** with the third-party service (e.g. `https://yourapp.com/webhooks/stripe`).
2. **An event happens** on their side (e.g. a payment succeeds).
3. **They send an HTTP POST** to your registered URL with a JSON payload describing the event.
4. **Your endpoint processes it** — usually: verify the signature, then enqueue the work (don't do heavy processing inline — ack fast, process async).

## Security — verifying webhook authenticity

Because your endpoint is a public URL, anyone could POST to it pretending to be the real sender. The standard defense: the sender includes an **HMAC signature** (e.g. `Stripe-Signature` header) computed over the **raw request body** using a shared secret. Your server recomputes the same HMAC over the raw body and compares — reject if they don't match. **Critical detail**: verify against the raw body text *before* any JSON parsing — re-serializing and re-stringifying the payload changes its bytes and breaks the signature.

## Common real-world examples

Stripe (payment success/failure events), GitHub (push/PR events triggering CI), Shopify (order created events), Twilio (SMS delivery status).

## Best practices

- Respond fast (200 OK) and do the actual work asynchronously (queue it) — the sender often has a timeout and will retry if you're slow.
- **Idempotency** — the sender may deliver the same event more than once (at-least-once delivery is standard for webhooks); dedupe by the event's unique ID before processing.
- Retry handling on the sender's side means your endpoint must be safe to call multiple times for the same event.

## Cross-reference

See [../../04-System-Design-HLD/09_design_payment_system.md](../../04-System-Design-HLD/09_design_payment_system.md) for webhooks in/out as part of a payment system design, and [../../05-Distributed-Systems/04_distributed_transactions_and_sagas.md](../../05-Distributed-Systems/04_distributed_transactions_and_sagas.md) for the outbox pattern (the correct way to *reliably send* webhook-triggering events from your own system).
