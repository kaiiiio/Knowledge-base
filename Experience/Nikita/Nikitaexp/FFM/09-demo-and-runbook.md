# Demo and Runbook — FFM

## 5-minute demo script

1. **Open a project → play** (30s): point at the waveform coloring played/unplayed and the moving playhead. Say: "one currentTime from the audio clock drives everything you see."
2. **Click-to-seek + lyrics** (30s): seek mid-song; lyrics jump with it. Say: "timestamped alignedWords filtered against the same clock — nothing can drift."
3. **Stem editor** (2 min): drag a Chorus before a Verse; playback stays gapless. Say: "dnd-kit reorder → memoized prefix-sum recomputes every stem's start/end → Tone.js schedules on the Web Audio clock. Seek lands inside the right stem at the right internal offset."
4. **Save as version** (1 min): show the request payload — a `stem_config`, not audio. Say: "local-first editing; the Python service is the single renderer."
5. **Credits** (1 min): show a purchase and the batch ledger. Say: "FIFO batches, idempotent webhooks — a replayed event or a double-click cannot double-charge."

## Triage runbook

### "My song is stuck generating"
1. Find the job row → status + timestamps (which stage stalled?)
2. Reserved but no worker pickup → check Redpanda consumer group lag
3. Worker picked up but no outcome → worker logs by job ID; if dead, at-least-once redelivery should re-run it — verify status is not stuck in `processing` without a lease/timeout
4. Terminal failure → confirm the credit reservation was released; if not, that's the reconciler gap — release manually and log the incident

### "I paid but got no credits"
1. Stripe dashboard → did the event fire? (checkout.session.completed)
2. Our webhook log by event ID → received? verified? processed?
3. Received-but-unprocessed → replay is safe (idempotent by event ID)
4. Never received → webhook endpoint health/signature config; Stripe retries for days — fix the endpoint and let the retry land

### "Editor is slow / audio glitches"
1. Check decoded-buffer cache size (RAM) — long session with many projects?
2. Main-thread stalls: look for accidental re-renders on timeupdate (should be refs/transforms, not state-driven lists)
3. Network: stems served without CDN/ranged requests will stall first play, not reorders — distinguish the two

### "A saved remix sounds wrong"
1. Fetch the saved stem_config — do the IDs and order match what the user built?
2. Stale stem reference (regenerated stems) → the save-time validation gap; re-render with corrected config
3. Config correct but audio wrong → merge-service logs for that render; golden-file test reproduces encoder issues

## Env / operational notes

- Stripe webhook secret and signature verification are load-bearing — never disable in any environment.
- Redpanda consumer groups: one group per worker type; lag on the generation topic is the earliest saturation signal.
- Merge service is CPU-bound: scale by queue depth, workers ≈ cores.
