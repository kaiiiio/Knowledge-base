# Object Storage — Notes (from Object_Storage.pdf)

Source: TechByAni HLD-Notes.

## What are BLOBs?

**BLOB = Binary Large Object.** Raw binary data — images (JPEG, PNG), videos (MP4), audio (MP3), PDFs, ZIP files. In databases, BLOBs are stored as `BLOB`, `BYTEA`, `VARBINARY`, etc.
```sql
CREATE TABLE users ( id INT, profile_pic BLOB );
```
At first glance this looks convenient ("user data + image in one place"), but it breaks down fast at scale.

## Why storing BLOBs in a database is a bad idea

1. **Databases are optimized for structured data** — rows & columns, indexes, queries, joins, transactions. They're not optimized for large binary payloads. When you store BLOBs: indexes become useless, pages get bloated, cache efficiency drops. *You're using a Ferrari as a truck.*

2. **Performance problems** — say a profile image = 5MB, a user table row = 1KB. Every time you do `SELECT * FROM users WHERE id = 123`, the DB reads the entire row, pulls the BLOB into memory, sends it over the network — even if you don't need the image. Result: higher latency, more memory usage, slower queries.

3. **Backup & restore become nightmares** — databases need regular backups, replication, point-in-time recovery. With BLOBs: backup size explodes, restore takes hours, replication lag increases.

4. **Scaling becomes extremely expensive** — to scale a DB: vertical scaling (bigger machine) or sharding (very complex). Binary data increases storage cost, increases I/O, increases replication traffic. DBs are the *expensive* storage in your system — using them for images/videos is burning money.

5. **Databases are stateful & coupled** — databases are tightly coupled to applications, cannot be easily accessed directly by clients, don't integrate well with CDNs. You don't let a browser talk directly to a DB. That alone disqualifies DBs for media delivery.

**The correct pattern (industry standard)**: Image → Object Storage. Metadata → Database.

## Why we need Object Storage

We want storage that is: cheap, scalable, durable, accessible over HTTP, CDN-friendly, not tied to DB constraints. This is exactly why Object Storage exists.

## What is Object Storage?

Object Storage stores data as **objects**, where each object contains: data (binary content), metadata (key-value info), object ID (key). Objects live inside **buckets** and are accessed using HTTP APIs.

**Example**: `bucket: user-uploads`, `key: profile-pics/aniket.png`.

**Examples of Object Storage services**: Amazon S3, Google Cloud Storage, Azure Blob Storage.

## Upload flow (PUT object)

```
Client —PUT /user-uploads/profile-pics/aniket.png→ API Layer (Auth, Validation) → Metadata Service —create entry (PENDING)→ Data Nodes
```

**Step 1 — Request comes in.** API Layer checks: Auth (IAM/token)? Bucket exists? Permission? Size limits?

**Step 2 — Metadata entry created.** `Metadata DB: key=img1, size=5MB, status=PENDING, locations=NULL`. **Why PENDING?** Upload not finished yet.

**Step 3 — Object is chunked.** A 20MB object is split into chunks (C1, C2, C3, C4). Chunking allows: parallel upload, retry on failure, large object support.

**Step 4 — Chunks distributed to nodes.**
**Step 5 — Durability applied (replication).**
**Step 6 — Metadata updated (COMMITTED).** `key=img1, size=5MB, status=READY`. **Only now does the client get 200 OK.**

## Read flow (GET object)

```
Client —GET /user-uploads/profile-pics/aniket.png→ API Layer (Auth, Validation) → Metadata Service → Data Nodes —Stream→ Client
```
**Step 1 — Lookup metadata**: `key → [Node A, Node B, Node C, Node D]`.
**Step 2 — Fetch chunks (parallel)**: Node A→C1, Node B→C2, Node C→C3, Node D→C4.
**Step 3 — Reassemble object**: C1+C2+C3+C4 = full object.
**Step 4 — Stream to client.**

## Delete flow

`DELETE object` → API Layer (Auth, Validation) → Metadata Service sets `status = DELETED`. **Actual data deletion happens asynchronously** — a garbage collector removes the chunks later.

## Metadata is the brain

Metadata Service tracks: object key, size, version, ACL, checksums, data locations. **If metadata is down, storage is down (even if the data still physically exists).**

## Versioning (overwrite case)

```
PUT img.png (v1)
PUT img.png (v2)
Metadata: img.png → v2 (active), v1 (older)

DELETE img.png → a delete marker is added (not necessarily a hard delete)
```

## Multipart upload (large files)

```
Initiate Upload → Upload Part 1 (→ Node A) → Upload Part 2 (→ Node B) → Upload Part 3 (→ Node C) → Complete Upload
```
**Benefits**: resume (retry only the failed part, not the whole file), parallelism (upload multiple parts simultaneously), reliability.

## Core characteristics

1. **Immutability** — objects cannot be modified in place. You overwrite, or delete + re-upload.
2. **Flat namespace** — no real folders. `/photos/2025/img.png` is just a string key. "Folders" are a UI illusion / prefix-based filtering, not a real directory tree.
3. **Globally unique object key** — bucket + object key uniquely identify an object. Example: `s3://user-uploads/profile-pics/aniket.png`.

## Durability (why your data never gets lost)

Achieved using: **Replication** — multiple full copies (simple but costly), or **Erasure Coding (preferred)** — data split into k+m blocks, you can lose some blocks and still recover (much more storage-efficient than full replication). This is how services like Amazon S3 achieve **99.999999999% durability (11 nines)**.

## Security

- **Encryption**: at rest (AES-256), in transit (TLS).
- **Access Control**: bucket policies, object ACLs, IAM roles.
- **Pre-signed URLs**: temporary access, used for uploads/downloads without exposing credentials.

## Performance characteristics

**Not for**: low-latency random writes, frequent updates, databases.
**Good for**: large objects, streaming, read-heavy workloads, CDN integration.

## Common use cases

Media hosting (video/audio/images), backups & snapshots, logs & analytics, data lakes, ML training datasets.

## Tips for interviews and real-world systems

**1. Never store large files in a database.** Instead, split responsibilities:
- **Object Storage** stores: images, videos, PDFs, large binary files. Example: post image, video file, backup file.
- **Database** stores metadata only. Example `Post`: `id`, `creatorId`, `text`, `linkToObjectStore` — where `linkToObjectStore` is usually an S3 object key or a URL.

**2. Direct upload to Object Storage using pre-signed URLs.**
```
1. Client asks server: "I want to upload a file"
2. Server: authenticates user, generates a pre-signed URL from object storage
3. Server sends the URL back to the client
4. Client uploads DIRECTLY to object storage (S3) — not through the server
```
This is how Instagram, Netflix uploads, and Google Drive work in real systems: server creates a pre-signed URL, browser uploads directly to S3, **server never touches the file bytes**.

**Bad approach** (client → server → S3, server proxying every byte): problems are server bandwidth bottleneck, high memory usage, poor scalability.

**3. Large files are uploaded in chunks (multipart upload).** Why chunked upload is required: large files (like 5–10 GB) cannot be uploaded reliably in one go, and network failures are common. So object storage accepts the file in multiple parts, stores parts independently, and combines them at the end.

## Cross-reference

See [../../04-System-Design-HLD/08_design_google_drive.md](../../04-System-Design-HLD/08_design_google_drive.md) for the deep-dive on chunking strategies (fixed vs content-defined), metadata/blob split, and dedup risk.
