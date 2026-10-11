# PKCE — Notes (from PKCE.pdf)

Source: TechByAni HLD-Notes. Also merged into [../../07-Security/02_oauth2_oidc.md](../../07-Security/02_oauth2_oidc.md) as "The origin story — why PKCE was invented."

## Recap: was OAuth broken?

The previous lesson covered OAuth 2.0 Authorization Code flow — it looked secure: the browser never received the access token, the backend securely exchanged the authorization code. So why was PKCE invented? **Not because OAuth was broken** — but because a gap existed for a specific client type.

## Confidential vs public clients

When registering an app with Google (or any OAuth provider), you declare an application type: Web, iOS, Desktop, SPA, Android, etc.

**Confidential client** — e.g. Spring Boot, ASP.NET. Because the backend server can safely store secrets — nobody can download your server or inspect its memory. Google issues a `client_id` + `client_secret`. During token exchange (`POST /token`), the backend sends the `client_secret`; Google verifies it's correct before issuing the access token.

**Public client** — e.g. Android, React, Vue, Flutter. The problem: users own/run these applications directly. Anyone can reverse-engineer the APK, open browser dev tools, read the JavaScript, or decompile the desktop app. **Therefore a client secret embedded in a public client is not secret.** Google still issues a `client_id`, but public clients don't get a usable secret — the backend/app can't prove its identity with something that stays hidden.

So how does Google know that the application redeeming an authorization code is really the same application that started the OAuth flow? *That's the real problem.*

## The historical problem (Android)

Years ago, Android used **custom URI schemes** for OAuth redirects (e.g. `photoapp://callback`). A legitimate PhotoApp registers this scheme — but a **malicious app can also register the exact same scheme**. When the user logs into Google and Google redirects back, the Android OS receives the redirect and has to decide: which app should open this? If the wrong app receives it, the authorization code goes to the attacker. This is the **Authorization Code Interception Attack**. PKCE was invented specifically to stop this attack.

## Here comes PKCE

Instead of proving identity using a client secret, public clients prove **possession** of a `code_verifier` — a one-time secret generated fresh for this specific flow.

**Is this still relevant today?** iOS now uses Universal Links, Android uses App Links — the custom-URI-hijacking attack is mostly solved at the OS level. So why does PKCE still exist? Because **OAuth is platform-independent** — it cannot depend on Android's or iOS's specific link-verification mechanism. Tomorrow there could be a new platform, new browser, new device, new attack — OAuth needs protocol-level security, not a fix that only works because of one OS's current behavior. Also, the OAuth Security Best Current Practice now recommends Authorization Code + PKCE for all public clients.

## PKCE mechanics

Two new concepts:

1. **`code_verifier`** — a random string, client-generated, unique per flow, never sent until the token-exchange step, kept secret by the client, 43–128 characters.
2. **`code_challenge`** — instead of sending the verifier, encode it: `code_challenge = BASE64URL(SHA256(code_verifier))`. High entropy matters — attackers must not be able to guess it.

If Google (or an attacker intercepting the request) only ever receives the *challenge* during the authorization request, and the hash is one-way, nobody — not Google, not an attacker — can recover the verifier from the challenge.

## Full flow: Authorization Code + PKCE (public client / SPA)

**Example scenario**: a Photo Editor SPA importing photos from Google Photos.

**Actors**: User → Browser → OAuth Client (the React/Angular/Vue app running in the browser) → Google Authorization Server → Google Photos API (Resource Server).

1. **User clicks "Import from Google Photos."**
2. **OAuth Client generates PKCE values.** Before redirecting the user to Google, the app generates a random `code_verifier` (e.g. `a8GkcqxT2pQr...`) — kept secret, never sent in this request. Then computes `code_challenge = SHA256(code_verifier)`, base64url-encoded. Unlike the verifier, the challenge is safe to send because it's one-way. The client stores the `code_verifier` temporarily in browser memory (or another temporary storage) — it will be required later at the token exchange step.
   - At this point: Browser stores `code_verifier`. Google knows only the `code_challenge`.
3. **OAuth Client creates the authorization request** — URL includes `client_id`, `redirect_uri`, `scope`, `state=abc123`, `code_challenge`, `code_challenge_method=S256`. **The request does NOT contain the `code_verifier`** — this is the key idea of PKCE.
4. **Browser redirects the user to Google's authorization endpoint.**
5. **Google validates the authorization request** — checks `redirect_uri`, `response_type`, requested scopes are all registered/valid. Google stores the `code_challenge`, requested scopes, and `state` against this flow. Notice: Google does NOT know the `code_verifier`.
6. **Google shows its login page** to the browser.
7. **User enters credentials** — browser sends them to Google; Google verifies the user's identity.
8. **Google displays the consent screen** — after successful authentication.
9. **User clicks "Allow"** — approves the requested permissions.
10. **Google creates a short-lived authorization code**, tied to the user, requested scopes, expiration, and the stored `code_challenge`. Redirects the browser back to the application's `redirect_uri` with `?code=ABC123&state=abc123`. **Google has never received the `code_verifier`.**
11. **Browser loads the callback URL** — OAuth Client extracts `code` and `state` from the URL.
12. **Client validates `state`** — compares the `state` it generated earlier (`abc123`) against what came back. If they match, accepted; if not, the request is rejected. This protects against **CSRF attacks**.
13. **Client exchanges the authorization code for tokens** — `POST /token` with `authorization_code`, `redirect_uri`, and — for the first time — the real `code_verifier`.
14. **Google verifies PKCE** — recomputes `SHA256(received code_verifier)` and compares it against the `code_challenge` stored against that authorization request. If they match, Google knows this is the same client that started the flow. If they don't match, Google rejects the request and issues no tokens. **This verification is the core security feature PKCE provides.**
    - **Why this is secure against interception**: suppose an attacker steals the authorization code during the redirect (exactly like the historical Android attack) and tries to exchange it for tokens. Google asks for the corresponding `code_verifier`. The attacker only has the *code* — not the secret `code_verifier`, which was stored only by the legitimate client. Without the correct verifier, Google cannot reproduce the stored `code_challenge`; PKCE verification fails; no tokens are issued. This prevents Authorization Code Interception Attacks.
15. **Google issues tokens** — if PKCE verification succeeds: Access Token, Refresh Token (if issued), Token Type, Granted Scopes.
16. **OAuth Client stores tokens** — the access token is stored securely; for SPAs, storing it in memory is preferred over persistent browser storage. The `code_verifier` is no longer required and can now be discarded.
17. **Client calls Google Photos with the Access Token** — `GET /photos` with `Authorization: Bearer <access_token>`.
18. **Google Photos validates the access token** — checks signature, expiration, granted scopes, required permissions. If valid, access is granted; otherwise the request is rejected.
19. **Google Photos returns the requested photos.**
20. **Browser renders the photos** — user can now browse and import their Google Photos.

## Complete summary (20 steps, condensed)

User clicks import → client generates `code_verifier` + `code_challenge` → client stores verifier locally, sends only the challenge to Google → browser redirects to Google → Google validates request and stores the challenge → user logs in → Google shows consent screen → user grants permission → Google generates a code and redirects back → client extracts code + state → client sends the authorization code + the *original* `code_verifier` to the token endpoint → Google recomputes the hash and compares it to the stored challenge → Google issues access + refresh tokens → client stores the access token securely → client calls Google using the token → Google validates the token → Google returns the protected data.

**One-line summary**: PKCE replaces the role of a long-lived shared secret for public clients during token exchange. Instead of proving identity with a shared secret, the client proves **possession of a code verifier** it generated for that specific authorization request.
