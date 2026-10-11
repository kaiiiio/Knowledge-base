# CAP Theorem (and PACELC) — Notes (from L24_CAP_Theorem.pdf)

Source: TechByAni HLD-Notes. Also see [../../05-Distributed-Systems/01_cap_consistency_models.md](../../05-Distributed-Systems/01_cap_consistency_models.md) for the deeper technical treatment (quorum math, linearizability formalism).

## The Instagram scenario (motivating example)

Instagram runs two major data centers: Mumbai (serves West/South India), Delhi (serves North/East India).

**Normal situation**: Riya (Pune) updates her Instagram bio on the Mumbai server → the update replicates to the Delhi server → Aman (Delhi) opens Riya's profile and sees the updated bio. Everything works perfectly.

**Then a network issue hits**: a routing problem, fiber-cut, or regional outage causes the Mumbai↔Delhi connection to fail. The two servers can't sync data. **This is where things get tricky.**

**What happens when Aman opens Riya's profile now?** Two options:
- **Option A — Consistency (correct but unavailable)**: don't show Riya's profile, because the Delhi server can't confirm whether the new bio from Mumbai is up to date. Aman gets an error or a blank profile.
- **Option B — Availability (available but maybe outdated)**: the Delhi server still shows the old bio it already has. Aman sees Riya's older info, but at least the profile loads.

**What should Instagram do?** For a social media app, the answer is obvious: it's better to show an old bio than show an error. A slightly outdated profile is harmless; a "profile cannot be loaded" message is frustrating. **For Instagram profiles, availability is the better choice.**

## CAP theorem in real life

Network problems **will** happen, so partition tolerance is mandatory. That leaves one important decision: during a network partition, should the system favor **Consistency** (show an error if uncertain) or **Availability** (show old data but keep working)?

## What is CAP Theorem?

In a distributed system, when a network partition occurs, you must choose between Consistency and Availability. **You cannot guarantee all three**: Consistency, Availability, and Partition Tolerance. In a distributed system, network issues will definitely happen — so the system must handle broken connections. CAP is really asking one simple thing: **if the network breaks, what do you want more — correct data or a working service?**

The CAP theorem explains a fundamental limitation of distributed systems: when data is spread across multiple machines, the system can guarantee only **two** of the following three characteristics at any moment:

1. **Consistency** — every part of the system shows the exact same data. If one machine accepts a write, then any read from any other machine should immediately return that new value.
2. **Availability** — each healthy machine must always reply to a request. However, the response may not always contain the latest update.
3. **Partition Tolerance** — the system must keep running even if the network between machines is disrupted, messages are lost, or some nodes get isolated.

## When Availability should be the priority

In many applications, having the system remain online is far more important than having every piece of data updated instantly. These systems work fine even if different users momentarily see different versions of the data. This relies on **eventual consistency** — data will sync and become correct shortly, even with a small delay.

**Examples where availability matters more**:
- **Social platforms** — if someone changes their display picture, it's not a big issue if another user sees the older picture for a short while. The app should continue loading smoothly.
- **Streaming services (Netflix, JioHotstar)** — when a show's description is updated, some users might continue seeing the previous text for a little time. Doesn't disrupt the watching experience.
- **Food delivery apps (Zomato)** — imagine a restaurant updates its menu, prices, or temporarily switches off delivery. Even if some customers still see the older menu or slightly outdated prices for a minute or two, the app should continue loading normally. Showing stale information briefly is far better than showing an error page or failing to load the restaurant altogether.

## When a system must prioritize Consistency

There are situations where showing outdated or conflicting information can cause serious problems. In such cases, the system must ensure that every user sees the exact same, correct data — even if that means rejecting some requests during a network issue.

**BookMyShow seat booking**: suppose someone from Delhi reserves Seat A12 for a movie. If the servers are unable to synchronize due to a network partition, another user in Bengaluru might still see A12 as vacant. If both are allowed to book, two people arrive expecting the same seat — an unacceptable situation. **This is why strict consistency is essential here.**

**Flipkart inventory control**: imagine Flipkart has only one unit left of a popular smartphone. If the system can't sync inventory updates, multiple users might be shown that the item is still in stock. This leads to overselling, cancellations, and a poor customer experience. To avoid this, consistency must be maintained.

**Banking transactions**: consider someone transferring ₹5,000 from their savings account. If the system shows outdated balances across different servers, one side might think the money is still available while another has already deducted it. This could let a customer spend more than they truly have, or result in mismatched ledgers. Banks must always maintain accurate, synchronized data — **consistency is non-negotiable here.**

## The decision heuristic

Ask: **"Will it cause serious problems if users momentarily see outdated or mismatched information?"** If the situation becomes harmful or unacceptable → consistency must be enforced. If a short delay in accuracy doesn't really matter → availability should take priority.

## Consistency in CAP vs Consistency in ACID (don't confuse them — asked constantly)

**1. Consistency in CAP (distributed systems consistency)** — how up-to-date and uniform the data is **across multiple nodes** in a distributed system. Every node should return the same, latest value; if one node gets a write, all other nodes must reflect that write before answering reads. Basically linearizability / read-after-write correctness across replicas. Mental model: *"If I write something, will every server immediately show the same value?"*
- Instagram example: if Riya updates her bio on the Mumbai server but the Delhi server still shows the old bio → CAP Consistency is broken. **But the data (bio text) is still valid — no rule is violated.**

**2. Consistency in ACID (database consistency)** — maintaining valid data according to rules, constraints, and schema. This is **internal to a single database transaction**, not multiple servers. ACID consistency ensures: no foreign-key violations, no constraint violations, no invalid data, the database remains in a "valid state." Mental model: *"Does the transaction keep the database logically correct?"*
- Banking example: if a transaction makes an account balance negative when it shouldn't be allowed → **ACID Consistency** is broken. But this might happen in only one database, not across replicas.

**Remember**: ACID consistency = correctness of data. CAP consistency = same data across distributed nodes. **They solve completely different problems.**

## Types of Consistency Models

1. **Strong Consistency** — you always read the latest, most up-to-date value immediately after a write. The moment data is updated anywhere, every node reflects that update. Behaves like a single, perfect machine. Guarantees correctness but often adds latency. *Example: if you change your Instagram bio, every user everywhere sees the updated bio instantly.*

2. **Bounded Staleness** — reads may return slightly old data, but only within a guaranteed limit. The system promises data will not be older than X seconds or Y versions. You know exactly how stale the data might be. *Example: a social app might guarantee profile updates become visible everywhere within 5 seconds max.*

3. **Read-Your-Write Consistency** — the user who made the update will always see their latest change, even if others see it later. Prevents confusion for the writer. Good for user-facing apps where people expect instant reflection of their own changes. *Example: you update your profile picture — you will always see the new picture, even if others still see the old one for a short while.*

4. **Eventual Consistency** — no guarantee about how old the data may be at the moment — but all replicas will eventually become consistent, as long as no new writes occur. Prioritizes availability and speed. Most **AP** systems (Cassandra, DynamoDB default mode) use this model. *Example: if you update your status, some friends may see the old one for a while, but eventually everyone sees the same final value.*

5. **Causal Consistency** — if one operation logically depends on another, every user must see them in that same order. Order of related actions is preserved; unrelated operations may still appear in different orders. *Example: on Instagram, you comment "This café looks amazing!" A friend replies "Yes! It's in Mumbai — you should try it." Since the reply only makes sense after your comment, every user must see: your comment, then the friend's reply. If the reply appears before the original comment, the conversation becomes confusing. Causal consistency prevents this by ensuring the logical order of related comments is maintained. But likes or comments from other users can appear in different sequences.*

## How CAP Theorem fits into system design interviews

After you clarify what the system needs to do (functional requirements), the next step is understanding: reliability expectations, response time targets, scaling goals, failure tolerance. While discussing these qualities, a key question naturally arises: **"If the network breaks between nodes, should the system preserve accuracy or remain responsive?"**

## If the system must stay consistent — design techniques

**Consistency-first systems** ensure all components see the same data before performing any operation, even if this slows things down.

- **Coordinated Writes** — all updates must be confirmed by several machines before they're accepted. Avoids conflicting values but increases the time needed for writes.
- **Centralized Datastore** — run everything through one main database instance so there's always one definitive truth. Scalability becomes harder, but correctness becomes easier.

**Tools typically used for strong consistency**: PostgreSQL/MySQL with a single primary, Google Spanner (global consistency via TrueTime), DynamoDB in strongly-consistent read mode, Zookeeper/Etcd for coordination.

## If the system prioritizes availability — design techniques

For many applications, it's far more important that the system keeps answering requests even if some parts briefly fall behind.

```
     write
A ─────────→ (async) ─────────→ C
 \___________________________/
  \                          asynchronously
   ─────────→ B
```

- **Asynchronous Replication** — writes go to a primary node and are pushed to replicas later. Keeps the system fast but may momentarily show older data.
- **Distributed Read Nodes** — multiple replicas handle read traffic independently. Even if one replica hasn't caught up, the system continues serving users without interruption.
- **Event Streams / CDC Pipelines** — changes from the main database are captured and forwarded to caches, analytics systems, and search indexes as background tasks. The core system stays online even during spikes.

**Common high-availability technologies**: Cassandra, DynamoDB in multi-AZ/multi-region setups, Redis clusters with replicas.

## Expert CAP thinking (per-feature, not per-system)

As products grow larger, the decision isn't simply "consistency vs availability" for the whole system. Instead, you choose the right consistency model **for each feature** depending on how the business uses it.

- **BookMyShow**: Seat Reservation → needs strong consistency. Viewing event information → availability is fine.
- **Instagram**: Messaging (DMs) → needs consistency. Viewing a profile → availability is more important.

## PACELC Theorem — the extension that matters more day-to-day

CAP theorem only talks about what happens **during a network partition**. But what about the times when the network is perfectly fine (which is most of the time)? That's where **PACELC** comes in.

**PACELC says**: if there is a **Partition (P)**, a system must choose **Availability (A)** or **Consistency (C)**. **Else (E** — when there is no partition), it must choose **Latency (L)** or **Consistency (C)**.

So the full idea: **P → A or C. Else → L or C.**

### Why PACELC exists

CAP focuses only on one rare event: network partitions. But most of the time, systems operate *without* partitions. PACELC adds another dimension: what trade-off do we make during normal operation? This makes PACELC much more realistic for modern distributed systems.

### Examples of PACELC in real systems

**Amazon DynamoDB is generally PA/EL**: during a partition, prioritizes Availability over consistency (AP design). Else (normal conditions), prioritizes low Latency over strict consistency. This is why DynamoDB is super fast and highly available but uses eventual consistency by default.

**Google Spanner is a PC/EC system**: during a partition, chooses Consistency over availability (CP design). Else, still chooses Consistency, even though it increases latency because of TrueTime and global coordination. This gives global strong consistency but at the cost of higher latency.

**Cassandra generally behaves like PA/EL**: prioritizes availability during partitions. Under normal operation, prefers low latency, using asynchronous replication.

**The one-line summary**: "CAP tells you what happens when the network fails. PACELC tells you what happens the rest of the time."

## Cross-reference

See [../../05-Distributed-Systems/01_cap_consistency_models.md](../../05-Distributed-Systems/01_cap_consistency_models.md) for the formal treatment — why "CA" is a category error, the full consistency spectrum with concrete anomalies per model, session guarantees, and tunable-consistency quorum math (R+W>N) with worked examples.
