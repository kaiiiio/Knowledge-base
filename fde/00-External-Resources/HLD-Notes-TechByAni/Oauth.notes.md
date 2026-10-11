# OAuth 2.0 (General Overview) — Notes (from Oauth.pdf)

Source: TechByAni HLD-Notes.

> **Legibility note**: this PDF renders very small/dense at the resolution available for OCR — individual step labels in the "Complete Authorization Code Flow" diagram (steps 1–4, consent screen, authorization code, token exchange) weren't reliably readable beyond the section headers. This appears to be the general/introductory OAuth 2.0 lesson that the PKCE lesson (see `PKCE.notes.md`) builds on directly.

## Visible structure

- **The problem before OAuth** — motivates why a delegated-authorization protocol is needed (the "why not just share your password with the app" framing).
- **The four actors** — Resource Owner (user), Client (the app), Authorization Server, Resource Server.
- **Complete Authorization Code Flow** — a step-by-step walkthrough (Step 1 → Step 4: authorization request, login, consent screen, authorization code, token exchange), ending in a full sequence diagram.
- **Consent Screen** — the "Allow this app to access X" step.
- **Token Exchange** — swapping the authorization code for an access token.

## Where the full detail lives in this knowledge base

Rather than reconstruct uncertain step-by-step text, use the already-comprehensive treatment in this repo, which covers everything this PDF's outline implies and more:

- [../../07-Security/02_oauth2_oidc.md](../../07-Security/02_oauth2_oidc.md) — Q1 covers the four roles and why "OAuth is authentication" is wrong; Q2 walks the full Authorization Code + PKCE flow with actual HTTP requests; Q7 covers the deprecated Implicit flow (which older OAuth-only content sometimes still shows); Q14–15 cover redirect URI validation and `state`/`nonce`.
- [PKCE.notes.md](PKCE.notes.md) (this folder) — the companion lesson to this PDF, covering the public-client / PKCE-specific flow in full step-by-step detail, already transcribed.

If you have a clearer copy or screenshots of this specific PDF's step-by-step diagram, paste it and this file can be filled in with the exact wording rather than a structural summary.
