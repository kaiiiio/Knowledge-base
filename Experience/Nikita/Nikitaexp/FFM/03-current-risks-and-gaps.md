# Current Risks and Gaps — FFM

Being able to name these unprompted is worth more than pretending the system is perfect.

## Reliability

- **Polling instead of push**: version/stem status arrives by React Query polling (20s/5s). Cost: up to 20s of perceived lag + constant background requests. A WebSocket/SSE push (or at least ETag-cheap polls) is the obvious upgrade.
- **Credit reservation vs job failure**: if an AI job fails after credits are reserved, the refund path must be exercised — needs an explicit compensation step and a reconciliation job that finds "reserved but no completed/failed job" orphans.
- **Merge service as a single choke point**: consolidation of every saved version goes through the Python service; a backlog there delays all saves. No visible queue-depth metric or backpressure signal to the UI.

## Consistency

- **stem_config drift**: the saved config references stem IDs; if a stem is regenerated/deleted between edit and save, the config can point at stale IDs. Needs validation at save time + versioned stem references.
- **Webhook vs redirect race**: the success-redirect page can land before the webhook credits the batch. UI must treat the webhook as the source of truth and show "processing" rather than assuming credited.

## Frontend

- **Buffer memory ceiling**: cached decoded buffers for many stems are RAM-heavy (decoded PCM ≫ compressed size). Long sessions with many projects need an eviction policy on the `useRef` cache.
- **Three state tiers = three mental models**: React Query + Redux + Context is right-sized, but boundaries must stay policed — server data leaking into Redux is the classic rot here.

## Operations

- **AI-provider coupling**: Suno API behavior (latency, quotas, output format changes) directly shapes UX; no formal fallback/queue-drain story if the provider degrades.
- **Observability**: needs per-stage timing on the pipeline (publish → consume → generate → notify) to answer "why is my song stuck" with data instead of guessing.

## Honest interview line

> "The tested, hardened path is the editor-to-merge loop and the Stripe credit path. The weakest links are push-notification of job status and automated reconciliation between credit reservations and job outcomes — I know exactly how I'd fix both."
