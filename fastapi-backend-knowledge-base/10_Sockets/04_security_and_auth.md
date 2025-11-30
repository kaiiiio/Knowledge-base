# 04. Security & Authentication: Locking it Down

## 1. The "No Header" Problem

In HTTP, we send `Authorization: Bearer <token>`.
In the JavaScript `WebSocket` API, **you cannot set custom headers**.

```javascript
// This throws an error
const ws = new WebSocket("ws://api.com", { headers: { "Authorization": "..." } });
```

So how do we authenticate?

---

## 2. Strategy A: Query Parameters (The Standard)

Pass the token in the URL.
`ws://api.example.com/ws?token=eyJhbGciOiJIUz...`

**The Risk**: URLs are often logged in server access logs (Nginx, AWS ALB). Your tokens might be visible to sysadmins.

**The Mitigation**:
1.  Use short-lived tokens.
2.  Configure logs to mask the `token` parameter.

```python
from fastapi import WebSocket, Query, status

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    user = verify_token(token)
    if not user:
        # Close with Policy Violation (1008)
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    await websocket.accept()
    # ...
```

---

## 3. Strategy B: The Ticket Pattern (The Fort Knox)

If you are paranoid about URL logging.

1.  **Client** sends standard HTTP POST to `/auth/ticket` with Bearer Token.
2.  **Server** validates token, generates a `ticket_uuid`, stores it in Redis with 10-second TTL.
3.  **Server** returns `ticket_uuid`.
4.  **Client** connects `ws://api.com/ws?ticket=ticket_uuid`.
5.  **Server** checks Redis. If valid, deletes ticket (One-time use) and accepts.

---

## 4. Strategy C: Protocol-Level Auth

Connect first, authenticate second.

1.  **Client** connects.
2.  **Server** accepts (but marks connection as "Unauthenticated").
3.  **Client** sends `{"type": "auth", "token": "..."}`.
4.  **Server** validates. If fail, close connection.

**Pros**: No URL logging.
**Cons**: You accept a TCP connection from *anyone*. Easy to DDoS.

**Verdict**: Use **Strategy A** for most apps. Use **Strategy B** for banking/healthcare.

---

## 5. WSS (TLS/SSL) is Mandatory

Never use `ws://` in production. Always use `wss://`.
- **Encryption**: Prevents Man-in-the-Middle attacks.
- **Firewalls**: Corporate firewalls often block non-standard traffic on port 80. But they *trust* encrypted traffic on port 443. `wss://` passes through firewalls much better than `ws://`.

---

## 6. Cross-Origin Resource Sharing (CORS)

WebSockets **do not** follow the Same-Origin Policy. A malicious site can connect to your localhost WebSocket!

**FastAPI Protection**:
FastAPI does NOT check origin by default for WebSockets. You must check it manually or use a middleware.

```python
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    origin = websocket.headers.get("origin")
    if origin not in ["https://myapp.com", "https://www.myapp.com"]:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
        
    await websocket.accept()
```
