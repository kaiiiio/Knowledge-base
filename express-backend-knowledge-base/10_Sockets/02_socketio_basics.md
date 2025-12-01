# Socket.io Basics: Real-Time Communication in Express.js

Socket.io is the most popular WebSocket library for Node.js. This guide teaches you Socket.io from basics to production patterns.

## Understanding Socket.io

**What is Socket.io?** WebSocket library with fallbacks (works even if WebSockets are blocked), automatic reconnection, room support (group messaging), and event-based API (like Express routes).

**Why Socket.io?** Works everywhere (fallback to polling if WebSockets blocked), easy to use (simple API), built-in features (rooms, namespaces), and production-ready (handles reconnection, heartbeats).

## Step 1: Basic Setup

### Installation

```bash
npm install socket.io
```

### Express.js Integration

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.io server: Attach to HTTP server.
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",  // Frontend URL
        methods: ["GET", "POST"]
    }
});

// Socket.io connection: Handle new client connections.
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle disconnect: Client closed connection.
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

**Explanation:** Socket.io attaches to an HTTP server. The `connection` event fires when a client connects. Each connection gets a unique `socket.id`.

## Step 2: Basic Communication

### Sending and Receiving Messages

```javascript
// Basic Socket.io: Send and receive messages.
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Receive message: Listen for 'message' event from client.
    socket.on('message', (data) => {
        console.log('Received:', data);
        
        // Send response: Send message back to same client.
        socket.emit('response', { message: 'Message received', data });
    });
    
    // Send to all clients: Broadcast to everyone except sender.
    socket.on('broadcast', (data) => {
        socket.broadcast.emit('message', data);  // Send to all except sender
    });
    
    // Send to all: Include sender.
    socket.on('announce', (data) => {
        io.emit('announcement', data);  // Send to everyone including sender
    });
});
```

### JSON Messages

```javascript
// JSON messages: Socket.io automatically handles JSON serialization.
io.on('connection', (socket) => {
    // Receive JSON: Automatically parses JSON.
    socket.on('chat', (data) => {
        // data is already a JavaScript object
        console.log('Chat message:', data.message);
        
        // Send JSON: Automatically serializes to JSON.
        socket.emit('chat_response', {
            status: 'ok',
            echo: data.message
        });
    });
});
```

## Step 3: Connection Manager Pattern

You need a way to store active connections. Here's a production-ready manager:

```javascript
// ConnectionManager: Manages active Socket.io connections for broadcasting.
class ConnectionManager {
    constructor() {
        this.activeConnections = new Map();  // socket.id -> socket object
        this.userSockets = new Map();  // user_id -> Set of socket.id
    }
    
    // connect: Add connection to active list.
    connect(socket, userId = null) {
        this.activeConnections.set(socket.id, socket);
        
        if (userId) {
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId).add(socket.id);
        }
    }
    
    // disconnect: Remove connection from active list.
    disconnect(socketId) {
        this.activeConnections.delete(socketId);
        
        // Remove from user mapping
        for (const [userId, socketIds] of this.userSockets.entries()) {
            socketIds.delete(socketId);
            if (socketIds.size === 0) {
                this.userSockets.delete(userId);
            }
        }
    }
    
    // sendToUser: Send message to specific user (all their connections).
    sendToUser(userId, event, data) {
        const socketIds = this.userSockets.get(userId);
        if (socketIds) {
            socketIds.forEach(socketId => {
                const socket = this.activeConnections.get(socketId);
                if (socket) {
                    socket.emit(event, data);
                }
            });
        }
    }
    
    // broadcast: Send to all connected clients.
    broadcast(event, data) {
        this.activeConnections.forEach(socket => {
            socket.emit(event, data);
        });
    }
}

const manager = new ConnectionManager();

// Use in Socket.io
io.on('connection', (socket) => {
    manager.connect(socket);
    
    socket.on('disconnect', () => {
        manager.disconnect(socket.id);
    });
});
```

## Step 4: Rooms (Group Messaging)

Rooms allow you to group sockets together:

```javascript
// Rooms: Group sockets for targeted messaging.
io.on('connection', (socket) => {
    // Join room: Add socket to a room.
    socket.on('join_room', (roomId) => {
        socket.join(roomId);  // Join room
        console.log(`Socket ${socket.id} joined room ${roomId}`);
        
        // Notify others in room: Broadcast to room members.
        socket.to(roomId).emit('user_joined', {
            socketId: socket.id,
            roomId: roomId
        });
    });
    
    // Leave room: Remove socket from room.
    socket.on('leave_room', (roomId) => {
        socket.leave(roomId);
        socket.to(roomId).emit('user_left', { socketId: socket.id });
    });
    
    // Send to room: Broadcast message to all in room.
    socket.on('room_message', (data) => {
        const { roomId, message } = data;
        // Send to all in room except sender: socket.to() excludes sender.
        socket.to(roomId).emit('message', {
            socketId: socket.id,
            message: message
        });
    });
    
    // Send to all in room: Include sender.
    socket.on('room_announce', (data) => {
        const { roomId, message } = data;
        // io.to() sends to all in room including sender.
        io.to(roomId).emit('announcement', {
            socketId: socket.id,
            message: message
        });
    });
});
```

## Step 5: Authentication with Socket.io

```javascript
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/jwt');

// Authentication middleware: Verify JWT before allowing connection.
io.use(async (socket, next) => {
    try {
        // Get token: Extract from handshake query or auth object.
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        
        if (!token) {
            return next(new Error('Authentication error: No token'));
        }
        
        // Verify token: Validate JWT.
        const payload = verifyToken(token);
        
        // Attach user to socket: Available in connection handler.
        socket.userId = payload.userId;
        socket.userEmail = payload.email;
        
        next();  // Allow connection
    } catch (error) {
        next(new Error('Authentication error: Invalid token'));
    }
});

// Authenticated connection: User is verified.
io.on('connection', (socket) => {
    console.log('Authenticated user connected:', socket.userId);
    
    // User-specific room: Join room for this user.
    socket.join(`user:${socket.userId}`);
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.userId);
    });
});
```

## Step 6: Error Handling

```javascript
// Error handling: Catch and handle Socket.io errors.
io.on('connection', (socket) => {
    // Handle errors: Catch errors from event handlers.
    socket.on('error', (error) => {
        console.error('Socket error:', error);
        socket.emit('error', { message: 'An error occurred' });
    });
    
    // Try-catch in handlers: Prevent crashes.
    socket.on('message', async (data) => {
        try {
            // Process message
            await processMessage(data);
            socket.emit('success', { message: 'Processed' });
        } catch (error) {
            console.error('Message processing error:', error);
            socket.emit('error', { message: 'Failed to process message' });
        }
    });
});
```

## Best Practices

### 1. **Use Rooms for Scalability**
```javascript
// ✅ Good: Use rooms for targeted messaging
socket.join(`room:${roomId}`);
io.to(`room:${roomId}`).emit('message', data);

// ❌ Bad: Store connections in array
const connections = [];
connections.forEach(socket => socket.emit('message', data));
```

### 2. **Handle Disconnects Gracefully**
```javascript
socket.on('disconnect', (reason) => {
    console.log('Disconnect reason:', reason);
    // Cleanup: Remove from rooms, update user status, etc.
    cleanupUser(socket.userId);
});
```

### 3. **Rate Limiting**
```javascript
const rateLimit = new Map();

socket.on('message', (data) => {
    const now = Date.now();
    const userMessages = rateLimit.get(socket.id) || [];
    
    // Remove old messages (last minute)
    const recent = userMessages.filter(time => now - time < 60000);
    
    if (recent.length >= 10) {
        return socket.emit('error', { message: 'Rate limit exceeded' });
    }
    
    recent.push(now);
    rateLimit.set(socket.id, recent);
    
    // Process message
    handleMessage(data);
});
```

## Summary

Socket.io basics in Express.js require: Installing socket.io, attaching to HTTP server, handling connection events, sending/receiving messages, using rooms for group messaging, implementing authentication, and handling errors gracefully. Socket.io provides real-time bidirectional communication with automatic reconnection and fallback support.

