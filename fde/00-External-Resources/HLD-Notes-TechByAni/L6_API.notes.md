# API & REST Fundamentals — Notes (from L6_API.pdf)

Source: TechByAni HLD-Notes.

## What is an API?

With APIs, one software/system talks to another **without exposing internals** — like a waiter bringing you the order you want at a restaurant (you don't talk to the kitchen directly).

```
Client → Service ⇄ (via API) ⇄ Service → Service
```

**Real examples**:
- **Swiggy/Zomato** — when you search "Burger," the app calls an API → returns available items.
- **Flight booking (MakeMyTrip)** — airline APIs to fetch flight schedules, prices, and book tickets.
- **Weather app** — weather apps don't calculate weather themselves → they hit a Weather API (like OpenWeatherMap).

**Types of APIs**: REST, GraphQL, gRPC, SOAP (old-school).

## REST APIs

**REST = Representational State Transfer.** It's an **architectural style** (not a protocol, not a library). Uses HTTP for communication between client ↔ server — using web URLs + HTTP methods to talk between services.

### Key principles of REST

- **Client–Server Separation** — client (frontend, mobile app) and server (backend) are independent.
- **Statelessness** — each API request is independent; the server doesn't remember past requests.
- **Uniform Interface** — APIs look consistent; HTTP methods used in standard ways:
  - `GET` → fetch data
  - `POST` → create data
  - `PUT`/`PATCH` → update data
  - `DELETE` → remove data
- **Resource-Based URLs** — everything is treated as a resource with a unique URL. Example: `GET /users/123` → get user with ID 123; `POST /orders` → create new order.
- **Use of JSON/XML** — REST usually exchanges data in JSON (lightweight).

### Data returned

Response body + status code.

**Path Parameter** — part of the URL path itself → identifies a specific resource. Example: `GET /users/123`.

**Query Parameter** — extra key-value data added to the URL after a `?`, used for filtering, sorting, searching, pagination. Example: `GET /users?age=25&city=Delhi` — `age=25` and `city=Delhi` are query parameters.

**Response Body** — the data the server sends back (usually JSON). Example response for `GET /users/123`:
```json
{ "id": 123, "name": "Aniket", "city": "Delhi" }
```
This is the actual "food" you get back from the kitchen (server).

**Status Code** — a number in the HTTP response telling you whether the request worked or failed.
- `200 OK` → Success
- `201 Created` → New resource created
- `400 Bad Request` → Client error (wrong input)
- `401 Unauthorized` → Need login/authentication
- `404 Not Found` → Resource doesn't exist
- `500 Internal Server Error` → Something broke on the server

## When should we use REST APIs?

1. **Client-Server apps** — mobile app ↔ backend communication. Example: Swiggy mobile app fetching restaurants via `GET /restaurants?city=Delhi`.
2. **Web applications** — frontend (React, Angular, Vue) ↔ backend (Node, Spring Boot, Django). REST gives a clean way for frontend to fetch/update data.
3. **Public APIs** — when you want third-party devs to use your service. Examples: Stripe Payments API, Google Maps API, Twitter API. REST is easy to understand + widely supported.
4. **Microservices communication** — different services in a system talk over REST. Example: Order Service calls Inventory Service → `GET /inventory/123`.
5. **CRUD applications** (Create, Read, Update, Delete) — REST fits perfectly when managing resources (users, posts, orders). Standard HTTP verbs map directly to CRUD.

## When NOT to use REST (and what to use instead)

1. **Real-time communication needed** — e.g. chat apps, live updates → better with **WebSockets** or **gRPC**.
2. **Over-fetching / under-fetching data** — REST returns a fixed structure → client may get too much or too little data. Example: a mobile app needs only name and photo, but REST returns the full user profile. Better → **GraphQL**.
3. **High-performance service-to-service** — REST uses text (JSON) → slower for very high-performance systems. Better → **gRPC** (binary, faster).
