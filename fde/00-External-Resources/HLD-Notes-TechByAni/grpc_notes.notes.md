# gRPC — Notes (from grpc_notes.pdf)

Source: TechByAni HLD-Notes. Also merged into [../../04-System-Design-HLD/11_graphql_grpc_and_pagination.md](../../04-System-Design-HLD/11_graphql_grpc_and_pagination.md).

## Netflix example — separate services, different protocols

Netflix-style architecture: Auth Service, Video Streaming, Recommendation — separate services. **REST = JSON (slower)**; internal high-performance calls use **Protobuf (fast + streaming)**.

## What is RPC (Remote Procedure Call)?

RPC lets one program call a function/procedure on another computer (a remote server), hiding network complexity — sockets, IP addresses, serialization — behind a normal-looking function call.

**Example (mental model)**: you call a function in your frontend that looks local. In reality, the call goes to a backend server, which executes the logic (e.g. fetches an account balance) and returns the result. For the caller, it just looks like a normal local function call.

**Older RPC systems**: Java RMI, XML-RPC, SOAP/CORBA — worked, but were slow and verbose (XML-based). This is why gRPC came along.

## gRPC (Google Remote Procedure Call)

A modern RPC framework developed by Google. It uses:
- **HTTP/2** for transport (multiplexed connections).
- **Protobuf** (Protocol Buffers) as the serialization format — binary, faster than JSON.

**Where gRPC is used**: internally at Google, and anywhere performance matters between services you control.

**Multi-language support**: a client can be written in Java, calling a server in Go — all talk easily, because both sides generate code from the same `.proto` contract.

**Streaming support** — defined in a `.proto` file, which auto-generates client and server code:
- **Unary** — one request, one response (like REST).
- **Server streaming** — client sends one request, server sends multiple responses (live updates).
- **Client streaming** — client sends multiple requests, server responds once.
- **Bidirectional streaming** — both sides send multiple messages in real time (like chat).

## Protobuf (Protocol Buffers)

A data format developed by Google — full name Protocol Buffers. Compared to JSON or XML: smaller (less data to send), faster (serialization/deserialization), strongly typed (exact types, not loosely-typed text).

**`.proto` file** — like a contract or specification. You define:
- **Messages** — data structures (like classes/objects).
- **Services** — the APIs (RPC functions) that use those messages.

**JSON vs Protobuf on the wire**:
- JSON request (text-based): `{"item": "Pizza", "quantity": 2}`
- Protobuf request (binary): `08 01 12 05 50 69 7A 7A 61` — looks unreadable to humans, but computers process it much faster (smaller, faster).

**Example `.proto` file**:
```proto
syntax = "proto3";
package food; // namespace

// Service = collection of RPCs
service OrderService {
  rpc PlaceOrder (OrderRequest) returns (OrderResponse);
  rpc TrackDelivery (DeliveryRequest) returns (stream DeliveryLocation);
}

// messages = data types
message OrderRequest {
  string item = 1;
  int32 quantity = 2;
}
message OrderResponse {
  string status = 1;
}
message DeliveryRequest {
  string orderId = 1;
}
message DeliveryLocation {
  double latitude = 1;
  double longitude = 2;
}
```

Note: `PlaceOrder` is unary (one request, one response); `TrackDelivery` is server-streaming (one request, a stream of location updates) — a natural fit for live delivery tracking.

## REST vs GraphQL vs gRPC

| Feature | REST | GraphQL | gRPC |
|---|---|---|---|
| Format | JSON (text, verbose) | JSON | Protobuf (binary) |
| Speed | Slower | Medium | Fast |
| Pattern | Request → Response | Request → Response (client picks fields) | Unary + streaming |
| Contract | Optional | Strong (schema) | Strong `.proto` contract |
| Best for | Public APIs (easy to use) | Frontend-driven data fetching | Microservices & real-time apps |

## Common follow-up questions worth having answers to

- **"For realtime updates, can I use GraphQL subscriptions instead of gRPC?"** — Yes for client-facing realtime (GraphQL subscriptions, typically over WebSocket); gRPC streaming is the equivalent for service-to-service realtime, and is more efficient at high volume due to binary framing.
- **"Doesn't REST also run on HTTP/2?"** — Yes, REST can run over HTTP/2, but most REST frameworks/clients don't take advantage of true multiplexed bidirectional streaming the way gRPC's generated stubs do by default.
- **"Most people say use WebSockets for chat — why?"** — WebSockets are the standard for browser-facing bidirectional realtime (gRPC isn't natively supported in browsers without grpc-web + a proxy). gRPC bidirectional streaming is the equivalent pattern for service-to-service chat-like communication.
