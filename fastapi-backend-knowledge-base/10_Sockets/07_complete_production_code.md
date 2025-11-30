# 07. Complete Production Code

Here is a full, copy-pasteable implementation of a Scalable, Authenticated Chat Server.

### Requirements
```bash
pip install fastapi uvicorn[standard] broadcaster[redis] pydantic
```

### `main.py`

```python
import asyncio
import json
from contextlib import asynccontextmanager
from typing import Optional

from broadcaster import Broadcast
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, status
from pydantic import BaseModel

# --- Configuration ---
REDIS_URL = "redis://localhost:6379"
broadcast = Broadcast(REDIS_URL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await broadcast.connect()
    yield
    await broadcast.disconnect()

app = FastAPI(lifespan=lifespan)

# --- Models ---
class ChatMessage(BaseModel):
    user: str
    message: str
    room: str

# --- Connection Manager ---
# Note: We don't need a complex manager class because 'broadcaster' 
# handles the pub/sub logic. We just need to handle the loop.

# --- Auth Stub ---
def verify_token(token: str) -> Optional[str]:
    # In production, decode JWT here
    if token == "secret123":
        return "Alice"
    if token == "secret456":
        return "Bob"
    return None

# --- WebSocket Endpoint ---
@app.websocket("/ws/{room_id}")
async def chat_endpoint(
    websocket: WebSocket, 
    room_id: str, 
    token: str = Query(...)
):
    # 1. Authentication
    user = verify_token(token)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Accept Connection
    await websocket.accept()
    
    # 3. Join Redis Channel
    async with broadcast.subscribe(channel=room_id) as subscriber:
        try:
            while True:
                # 4. Event Loop: Listen to Client AND Redis
                
                # Task A: Receive from Client
                client_task = asyncio.create_task(websocket.receive_text())
                
                # Task B: Receive from Redis
                redis_task = asyncio.create_task(subscriber.get())
                
                # Wait for first completion
                done, pending = await asyncio.wait(
                    [client_task, redis_task],
                    return_when=asyncio.FIRST_COMPLETED
                )
                
                # Cleanup pending
                for task in pending:
                    task.cancel()
                
                # Handle Client Message
                if client_task in done:
                    try:
                        data = client_task.result()
                        # Parse and Validate
                        # Expecting: {"message": "hello"}
                        payload = json.loads(data)
                        chat_msg = ChatMessage(
                            user=user, 
                            message=payload["message"], 
                            room=room_id
                        )
                        
                        # Publish to Redis (so everyone sees it)
                        await broadcast.publish(
                            channel=room_id, 
                            message=chat_msg.json()
                        )
                    except Exception as e:
                        await websocket.send_json({"error": "Invalid format"})

                # Handle Redis Message
                if redis_task in done:
                    event = redis_task.result()
                    # Send to my connected client
                    await websocket.send_text(event.message)
                    
        except WebSocketDisconnect:
            # Optional: Announce departure
            # await broadcast.publish(channel=room_id, message=f"{user} left")
            pass
```

### Running it
```bash
uvicorn main:app --reload
```

### Testing it (Browser Console)
```javascript
// Alice
var ws = new WebSocket("ws://localhost:8000/ws/general?token=secret123");
ws.onmessage = (e) => console.log("Alice heard:", e.data);
ws.send(JSON.stringify({message: "Hi everyone!"}));

// Bob (Open a new tab)
var ws = new WebSocket("ws://localhost:8000/ws/general?token=secret456");
ws.onmessage = (e) => console.log("Bob heard:", e.data);
```
