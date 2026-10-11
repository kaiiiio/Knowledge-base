# GraphQL — Notes (from L8_GraphQL.pdf)

Source: TechByAni HLD-Notes. Complements [../../04-System-Design-HLD/11_graphql_grpc_and_pagination.md](../../04-System-Design-HLD/11_graphql_grpc_and_pagination.md).

## What is GraphQL

A **query language for APIs**. Developed by Facebook in 2012. Unlike REST, where the **server** defines what you get, in GraphQL the **client** decides what data it wants.

**The restaurant analogy**: think of REST as a fixed thali in a restaurant (you always get all the items). GraphQL → you order only what you want.

Unlike REST (multiple endpoints), GraphQL exposes a **single endpoint** (`/graphql`) where the client specifies exactly what data it needs.

## Why GraphQL was created (problems with REST)

### Over-fetching
REST may return too much data. Example: `GET /users/123` returns the full profile, but the mobile app only needed name and photo.

### Under-fetching
Sometimes one REST call isn't enough. Example: to show a user's profile + recent posts, you need `GET /users/123` **and** `GET /users/123/posts`. Multiple round trips → slow.

### Versioning mess
REST often needs `/v1/users`, `/v2/users` as APIs evolve. GraphQL avoids versioning → flexible queries (add fields without breaking old clients, deprecate instead of version-bumping).

## GraphQL has 3 core operations

- **Query** → read data (like GET in REST).
- **Mutation** → write/update/delete data (like POST/PUT/DELETE in REST).
- **Subscription** → real-time updates (like WebSockets).

## Real-world example: e-commerce app (Amazon/Flipkart)

**With REST** (multiple round-trips, slow/inefficient):
```
GET /user/123          → name, email, etc.
GET /user/123/orders   → list of orders
GET /product/{id}      → product details for EACH order
```

**With GraphQL (Query — Read Data)**, one request:
```graphql
{
  user(id: "123") {
    name
    email
    orders {
      id
      total
      items {
        product { name price }
        quantity
      }
    }
  }
}
```
Response:
```json
{
  "data": {
    "user": {
      "name": "Aniket",
      "email": "ani@example.com",
      "orders": [
        {
          "id": "567",
          "total": 4599,
          "items": [
            { "product": { "name": "Laptop", "price": 4599 }, "quantity": 1 }
          ]
        }
      ]
    }
  }
}
```
**Only the data needed** → clean, efficient, one round trip.

## Mutation example (place order)

```graphql
mutation {
  createOrder(userId: "123", items: [{productId: "X1", quantity: 2}]) {
    id
    total
    status
  }
}
```
Response:
```json
{ "data": { "createOrder": { "id": "999", "total": 4200, "status": "CONFIRMED" } } }
```

## Subscription example (real-time tracking, like Swiggy)

```graphql
subscription {
  orderStatus(orderId: "999") {
    status
    estimatedDeliveryTime
  }
}
```
Whenever the order status updates → the server pushes new data automatically (**no polling**).

## Schema & Types

GraphQL uses **Schema Definition Language (SDL)**. It's strongly typed: every query must match the schema. Flow: client asks → server checks against schema → returns valid data.

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  orders: [Order]
}
type Order {
  id: ID!
  total: Int!
  items: [OrderItem]
}
type OrderItem {
  product: Product!
  quantity: Int!
}
type Product {
  id: ID!
  name: String!
  price: Int!
}
```

## Benefits of GraphQL

- **Client controls data** → no over/under-fetching.
- **One endpoint** → simpler networking.
- **Strong typing** → safer APIs, better tooling.
- **Versioning not needed** → just deprecate fields instead of bumping `/v1`→`/v2`.
- **Great for mobile apps** → less data = faster.
- **Introspection** → clients can ask the API "what fields exist?" (self-documenting schema).

## Challenges of GraphQL

- **Complexity on the server side** → need resolvers for each field.
- **Caching is harder** → REST can cache by URL (`/users/123`); GraphQL queries vary, so there's no single cache key per "resource" the way REST has.
- **Performance risk** → clients can ask for huge nested data (this is the N+1 / query-depth-bomb risk — see the deep dive cross-reference below).
- **Learning curve** for dev teams.

## When to use GraphQL

Complex systems with lots of relationships (social networks, e-commerce, dashboards). When clients (mobile/web) need different shapes of data. For real-time apps (chat, live tracking).

## Stick to REST if

Simple CRUD APIs. Heavy caching needed (CDNs work best with REST). Small team with simple requirements.

## Cross-reference

[../../04-System-Design-HLD/11_graphql_grpc_and_pagination.md](../../04-System-Design-HLD/11_graphql_grpc_and_pagination.md) covers the deeper interview material this lesson sets up: the N+1 problem + DataLoader batching (the concrete answer to "Performance risk" above), query depth/cost limiting and persisted queries (the concrete answer to "clients can ask for huge nested data"), and the Connection/cursor pagination pattern (which this lesson's schema examples don't cover — GraphQL pagination is its own topic, see `graphql_pagination.notes.md` in this folder).
