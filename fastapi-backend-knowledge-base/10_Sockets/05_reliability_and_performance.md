# 05. Reliability & Performance: Keeping it Alive

## 1. The "Zombie Connection" Problem

TCP connections can die silently.
- A router reboots.
- A mobile phone switches from Wi-Fi to 4G.
- The cable is pulled.

In these cases, **no FIN packet is sent**. The server thinks the client is connected. The client thinks the server is connected. Both are waiting forever.

### The Solution: Application-Level Heartbeats

Don't rely on TCP Keepalive (it's too slow, default 2 hours). Implement your own.

1.  **Server** sends `{"type": "ping"}` every 30 seconds.
2.  **Client** must reply `{"type": "pong"}` within 10 seconds.
3.  If no Pong? **Kill the connection**.

```python
# Server-side pseudo-code
async def heartbeat(websocket):
    while True:
        await asyncio.sleep(30)
        try:
            await websocket.send_json({"type": "ping"})
            # Wait for pong logic here (complex to implement in single loop)
        except:
            break
```

*Note: Browsers handle standard Ping frames automatically, but you can't access them in JS. JSON-based ping/pong is easier to debug.*

---

## 2. Backpressure: When the Client is Slow

Imagine your server produces 1000 messages/sec.
The client is on a 2G network and can only read 10 messages/sec.

**What happens?**
The server's memory buffer fills up. RAM usage spikes. Eventually, the server crashes (OOM).

### The Solution
1.  **Detect slow clients**: Check `websocket.client_state`.
2.  **Drop messages**: If the queue is full, drop the oldest messages (QoS 0).
3.  **Disconnect**: If a client is too slow, kick them off.

---

## 3. Nginx / Load Balancer Configuration

If you put Nginx in front of FastAPI (you should), you need specific config.

### Upgrade Headers
Nginx doesn't proxy WebSockets by default.

```nginx
location /ws/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
}
```

### Timeouts
Nginx kills idle connections after 60 seconds (`proxy_read_timeout`).
**If your Heartbeat is 30s, this is fine.**
If your Heartbeat is 5 minutes, Nginx will kill your users.
**Set `proxy_read_timeout` to slightly higher than your heartbeat interval.**

---

## 4. AWS Application Load Balancer (ALB)

ALB supports WebSockets natively.
**Gotcha**: ALB has an idle timeout (default 60s). If no data flows, ALB sends a FIN.
**Fix**: Ensure your Heartbeat runs faster than the ALB timeout.
