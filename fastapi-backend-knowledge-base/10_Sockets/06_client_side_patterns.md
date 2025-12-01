# 06. Client-Side Patterns: The Frontend

## 1. Reconnection Logic (Exponential Backoff)

**NEVER** do this: If your server goes down, 10,000 clients will hit it instantly the moment it comes back up, crashing it again. This is a Thundering Herd.

```javascript
// BAD: Immediate retry causes thundering herd problem.
socket.onclose = () => {
    connect(); // RETRY IMMEDIATELY - All clients retry at once!
}
```

**DO this:** Use exponential backoff to prevent thundering herd.

```javascript
// GOOD: Exponential backoff prevents all clients from retrying at once.
let attempts = 0;

function connect() {
    const ws = new WebSocket(url);
    
    ws.onclose = () => {
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s... max 30s
        const delay = Math.min(1000 * (2 ** attempts), 30000);  // 2^attempts seconds, capped at 30s
        setTimeout(connect, delay);  // Retry after delay
        attempts++;  // Increment attempt counter
    };
    
    ws.onopen = () => {
        attempts = 0; // Reset on success: Connection successful, reset counter
    };
}
```

---

## 2. Message Queueing (Offline Support)

If the user sends a message while offline, don't throw an error. Queue it.

```javascript
// Message queue: Store messages when offline, send when reconnected.
const queue = [];

function send(msg) {
    if (ws.readyState === WebSocket.OPEN) {
        // Connection open: Send immediately.
        ws.send(msg);
    } else {
        // Connection closed: Queue message for later.
        queue.push(msg);
    }
}

// On reconnect: Send all queued messages.
ws.onopen = () => {
    while (queue.length > 0) {
        ws.send(queue.shift());  // Send and remove from queue
    }
}
```

---

## 3. State Management (React/Vue)

Don't put the WebSocket object directly in your Render loop. Put it in a Context or Store (Redux/Pinia).

**React Hook Example:** Custom hook for WebSocket management.

```javascript
// React hook: Manage WebSocket connection and messages.
export const useWebSocket = (url) => {
    const [messages, setMessages] = useState([]);  // State for received messages
    const socket = useRef(null);  // Store WebSocket in ref (persists across renders)

    useEffect(() => {
        // Create WebSocket: Connect when component mounts or URL changes.
        socket.current = new WebSocket(url);
        
        // Handle messages: Add to messages state.
        socket.current.onmessage = (event) => {
            setMessages(prev => [...prev, JSON.parse(event.data)]);  // Parse JSON and add to array
        };

        // Cleanup: Close connection when component unmounts.
        return () => socket.current.close();
    }, [url]);  // Re-run if URL changes

    return { messages, sendMessage: socket.current.send };  // Return messages and send function
};
```
