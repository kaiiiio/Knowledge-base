# 03. WebRTC Deep Dive: Breaking Through Firewalls

## 1. The Impossible Problem

Two computers want to talk.
- Computer A is behind a corporate firewall (NAT). Private IP: `192.168.1.5`.
- Computer B is on a home Wi-Fi (NAT). Private IP: `10.0.0.4`.

If A sends a packet to `10.0.0.4`, it hits a wall. It's a local address.
WebRTC is the technology of **NAT Traversal**. It punches holes in firewalls.

---

## 2. ICE, STUN, and TURN: The Tools

### ICE (Interactive Connectivity Establishment)
The protocol that says: "Let's try every possible way to connect."
It gathers **Candidates**:
1.  **Host Candidate**: My local IP (`192.168.1.5`). Works if we are on the same Wi-Fi.
2.  **Srflx Candidate (Server Reflexive)**: My Public IP (`203.45.x.x`). Found via STUN.
3.  **Relay Candidate**: The IP of a TURN server. The last resort.

### STUN (Session Traversal Utilities for NAT)
A lightweight server.
- **Client**: "Who am I?"
- **STUN Server**: "You are 203.45.12.1:4500".
- **Cost**: Cheap/Free. Uses almost no bandwidth.

### TURN (Traversal Using Relays around NAT)
A heavy-duty relay.
- If P2P is blocked (Symmetric NATs, strict firewalls), traffic goes Client A -> TURN -> Client B.
- **Cost**: Expensive. You pay for bandwidth (video is heavy!).
- **Reality**: Needed for ~15-20% of mobile connections.

---

## 3. The Signaling State Machine

The "Offer/Answer" dance is strict. You can't just send data whenever.

**The Perfect Negotiation:**
1.  **Stable State**: Both peers are idle.
2.  **Peer A (Offerer)**:
    - `createOffer()`
    - `setLocalDescription(offer)`
    - Send Offer to B via Signaling Server (FastAPI).
3.  **Peer B (Answerer)**:
    - Receive Offer.
    - `setRemoteDescription(offer)`
    - `createAnswer()`
    - `setLocalDescription(answer)`
    - Send Answer to A.
4.  **Peer A**:
    - Receive Answer.
    - `setRemoteDescription(answer)`
5.  **Stable State**: Connection opens.

**Race Conditions (Glare)**:
What if A and B both try to call each other at the *exact same millisecond*?
- Both send Offers.
- Both receive Offers while in "Have Local Offer" state.
- **Crash**.
- **Solution**: "Polite Peer" pattern. One peer is designated "Polite" (it rolls back its own offer if a collision happens). The other is "Impolite" (it ignores incoming offers if busy).

---

## 4. FastAPI Implementation: Robust Signaling

The previous example was a simple pipe. A robust server needs to handle **User Presence**.

```python
# A robust Connection Manager
class ConnectionManager:
    def __init__(self):
        # user_id -> WebSocket
        self.active_connections: Dict[str, WebSocket] = {}
        # user_id -> status ("online", "busy")
        self.user_status: Dict[str, str] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_status[user_id] = "online"

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_status:
            del self.user_status[user_id]

    async def send_signal(self, sender_id: str, target_id: str, data: dict):
        if target_id not in self.active_connections:
            # Inform sender that target is offline
            await self.active_connections[sender_id].send_json({"type": "error", "message": "User offline"})
            return

        # Forward the SDP/ICE payload
        payload = {
            "sender": sender_id,
            **data # contains 'type': 'offer'/'answer'/'candidate', 'sdp': ...
        }
        await self.active_connections[target_id].send_json(payload)
```

### Security Note
The Signaling Server sees *everything* during the handshake. However, the actual media (Video/Audio) is encrypted end-to-end (DTLS-SRTP). The server *cannot* spy on the video stream unless it acts as a Man-in-the-Middle TURN server (which you control anyway).
