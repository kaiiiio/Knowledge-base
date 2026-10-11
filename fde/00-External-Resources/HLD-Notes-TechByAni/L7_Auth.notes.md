# Authentication & Authorization Fundamentals — Notes (from L7_Auth.pdf)

Source: TechByAni HLD-Notes.

## Authentication (AuthN) vs Authorization (AuthZ)

**Authentication** — it's about proving **WHO** you are. The system checks your identity using credentials (username/password, OTP, fingerprint, API key). If credentials are valid → you're authenticated.
**Real-life example**: at an airport, security asks for your ID card + ticket. They check if the details match → if yes, you're allowed inside — you are now authenticated.

**Authorization** — it's about **what you are allowed to do AFTER authentication**. Once identity is confirmed, the system checks your permissions/roles, and decides which resources you can access and which actions you can perform.
**Real-life example (continuing airport)**: if you have an economy class ticket, you can't go to business class — even though you're already authenticated.

## Authentication in APIs (AuthN)

Checks WHO is calling the API. The API needs to know the caller's identity. You provide credentials (API key, username/password, OAuth token, etc.). If credentials are valid → API issues a session/token. If authentication fails, server returns **401 Unauthorized**.

## Common authentication methods

### 1. API Key Authentication
The simplest form. A unique key is generated for each developer/user, sent in a header or query string with every request. The server checks if the key is valid.
```
GET /weather
x-api-key: abc123xyz
```
**Pros**: easy to use, widely supported. **Cons**: not very secure (can be leaked if logged or exposed). Almost never used for user-facing APIs.

### 2. Basic Authentication
Uses a username + password encoded in Base64, sent with every request in the `Authorization` header.
```
GET /profile
Authorization: Basic dGVzdCBwYXNzd29yZA==
```
**Pros**: simple to implement. **Cons**: insecure unless used with HTTPS (password exposed in every request).

### 3. Session-Based Authentication (Cookies)
Classic web approach: user logs in → server creates a session and stores it → server sends a cookie back to the client → client (browser) sends the cookie with every request.
```
Cookie: sessionId=abc123xyz
```
**Pros**: common for websites. **Cons**: less common for modern APIs (stateless REST prefers tokens).

### 4. Bearer Token / JWT (JSON Web Token)
User logs in once → server issues a token. Token is sent in the `Authorization` header with every request. JWT can contain user info, roles, expiry time, etc.
```
GET /orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```
**Pros**: secure, stateless (no need to store sessions). **Cons**: if the token is stolen, the attacker has full access until expiry.

### 5. OAuth 2.0
OAuth = Open Authorization. It's a **delegated authorization framework** (not just authentication). It allows a user to grant limited access to their resources (data, account, files) on one service to another app, without sharing their password.
**Example**: you log into an app using "Login with Google." The app doesn't get your Google password — instead it gets a token that says "This app can see this user's email and profile, nothing else."
**Pros**: very secure, supports 3rd-party apps. **Cons**: more complex to implement.

### 6. Mutual TLS (mTLS)
Both client and server present certificates. Ensures not only that the server is trusted, but that the client is also verified. Often used in banking, financial, and enterprise APIs.

## Authorization in APIs (AuthZ)

Checks **WHAT** the caller can do. After authentication, the API checks your roles/permissions. Authorization decides whether your identity has access to the requested resource.

**Example**: authenticated user with `role=user` → can access `/profile`. Authenticated user with `role=admin` → can also access `/admin/reports`. If you try to access something outside your permissions → **403 Forbidden**.

## Practical API flow (login → authorize)

**Step 1 — Authentication (login)**:
```http
POST /login
Host: api.company.com
Content-Type: application/json

{ "username": "aniket", "password": "mypassword" }
```
Response (token):
```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...ffhnjnks3fh" }
```
You are authenticated.

**Step 2 — Authorization (access control)** — now use the token to request data:
```http
GET /admin/reports
Host: api.company.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```
If the token has `role=admin` → success. If the token has `role=user` → forbidden.

**Error codes to remember**:
- **401 Unauthorized** → you are not authenticated (missing/invalid credentials).
- **403 Forbidden** → you are authenticated, but not authorized (no permission).

## API Headers

Headers are key-value pairs sent along with an API request (or response). They give metadata (extra info) about the request/response — what format the data is in, who's sending it, how to cache it, etc. Without headers, servers/clients wouldn't know how to handle the request properly.

**General headers** (apply to both request and response) — e.g. `Date: Sat, 13 Sep 2025 12:00:00 GMT` (tells when the message was sent), `Cache-Control: no-cache` (tells the client/server not to cache).

**Request headers (client → server)** — provide details about what the client wants:
- `Authorization` → carries credentials or tokens. `Authorization: Bearer <token>`
- `Content-Type` → tells the server what format the body is in. `Content-Type: application/json`
- `Accept` → tells the server what kind of response format is expected. `Accept: application/json`
- `User-Agent` → info about the client (browser, app, version). `User-Agent: Mozilla/5.0`
- `Host` → specifies the domain name of the server. `Host: api.example.com`

**Response headers (server → client)** — give metadata about the response:
- `Content-Type` → tells the client the format of the response body.
- `Set-Cookie` → server sets cookies on the client. `Set-Cookie: sessionId=xyz123; HttpOnly`
- `Access-Control-Allow-Origin` → used in CORS (Cross-Origin Resource Sharing). `Access-Control-Allow-Origin: *`
- `Content-Length` → size of the response body in bytes.

**Most common headers in real APIs**: `Authorization` (auth token/API key), `Content-Type` (format of request body), `Accept` (expected response format), `Cache-Control` (caching rules), `User-Agent` (who's making the request).
