# 06. Client-Side Patterns: The Frontend

## 1. Reconnection Logic (Exponential Backoff)

**NEVER** do this:
```javascript
socket.onclose = () => {
    connect(); // RETRY IMMEDIATELY
}
```
If your server goes down, 10,000 clients will hit it instantly the moment it comes back up, crashing it again. This is a **Thundering Herd**.

**DO this**:
```javascript
let attempts = 0;

function connect() {
    const ws = new WebSocket(url);
    
    ws.onclose = () => {
        // 1s, 2s, 4s, 8s, 16s... max 30s
        const delay = Math.min(1000 * (2 ** attempts), 30000);
        setTimeout(connect, delay);
        attempts++;
    };
    
    ws.onopen = () => {
        attempts = 0; // Reset on success
    };
}
```

---

## 2. Message Queueing (Offline Support)

If the user sends a message while offline, don't throw an error. Queue it.

```javascript
const queue = [];

function send(msg) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
    } else {
        queue.push(msg);
    }
}

ws.onopen = () => {
    while (queue.length > 0) {
        ws.send(queue.shift());
    }
}
```

---

## 3. State Management (React/Vue)

Don't put the WebSocket object directly in your Render loop. Put it in a Context or Store (Redux/Pinia).

**React Hook Example**:
```javascript
export const useWebSocket = (url) => {
    const [messages, setMessages] = useState([]);
    const socket = useRef(null);

    useEffect(() => {
        socket.current = new WebSocket(url);
        
        socket.current.onmessage = (event) => {
            setMessages(prev => [...prev, JSON.parse(event.data)]);
        };

        return () => socket.current.close();
    }, [url]);

    return { messages, sendMessage: socket.current.send };
};
```
