# 02. FastAPI Implementation: The Basics

## 1. The `WebSocket` Endpoint

FastAPI wraps Starlette's WebSocket implementation. It handles the handshake, framing, and event loop integration.

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    # 1. Accept
    await websocket.accept()
    
    try:
        while True:
            # 2. Receive
            data = await websocket.receive_text()
            
            # 3. Process & Send
            await websocket.send_text(f"You said: {data}")
            
    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")
```

### Critical Rules
1.  **Always `await`**: WebSockets are async. If you use `time.sleep(1)`, you block the entire server. Use `asyncio.sleep(1)`.
2.  **Handle Disconnects**: The `try...except WebSocketDisconnect` block is **mandatory**. Without it, your server logs will be flooded with errors every time a user closes a tab.
3.  **Accept First**: You cannot send or receive data before `await websocket.accept()`.

---

## 2. The Connection Manager Pattern

You need a way to store active connections. Do not rely on global variables in `main.py` if you can avoid it, but for a single-process app, a Class-based manager is standard.

```python
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        # Iterate over a copy to avoid modification errors if someone disconnects mid-loop
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except RuntimeError:
                # Connection might be closed already
                pass

manager = ConnectionManager()
```

---

## 3. Handling JSON

Most modern apps send JSON, not raw text.

```python
@app.websocket("/ws/json")
async def json_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        # Automatically parses JSON string to Python Dict
        data = await websocket.receive_json() 
        
        # data is now a dict, e.g., {"action": "chat", "msg": "hello"}
        if data.get("action") == "chat":
            response = {"status": "ok", "echo": data["msg"]}
            
            # Automatically dumps Python Dict to JSON string
            await websocket.send_json(response)
```

## 4. Concurrency: `run_in_executor`

If you need to do something CPU intensive (image processing) or blocking (synchronous DB call) inside a WebSocket loop, **do not do it directly**.

```python
import asyncio

@app.websocket("/ws/heavy")
async def heavy_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        
        # BAD: Blocks the event loop
        # result = heavy_computation(data) 
        
        # GOOD: Runs in a thread pool
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, heavy_computation, data)
        
        await websocket.send_text(str(result))
```
