# DBMS Fundamentals — Interview Q&A

Core database-management-system concepts asked at the start of almost every SQL/backend interview — DBMS types, ACID, SQL vs NoSQL, schema design, keys, normalization, joins, and the N+1 problem. Cleaned up and reformatted from a public Q&A set (source: devinterview.io) with corrections and cross-links into this knowledge base's deeper files.

> Note: only 15 of the original list's questions had full answers in the source; that's what's captured here, cleaned up and corrected. For deeper treatment of any topic, follow the cross-links — this file is the fast, interview-ready summary layer.

## Table of Contents
1. [What is a DBMS, and examples](#q1)
2. [ACID properties](#q2)
3. [SQL vs NoSQL](#q3)
4. [Relational database schema](#q4)
5. [Primary key](#q5)
6. [Foreign key](#q6)
7. [Normalization](#q7)
8. [Denormalization](#q8)
9. [DROP vs DELETE vs TRUNCATE](#q9)
10. [Full join vs inner join](#q10)
11. [Finding duplicate records](#q11)
12. [Prepared statements](#q12)
13. [The N+1 query problem](#q13)
14. [GROUP BY and HAVING](#q14)
15. [Indexes — what they are and how they work](#q15)

---

<a name="q1"></a>
## 1. What is a DBMS, and can you name examples?  ---- IMP

A **Database Management System** sits between applications and stored data, handling storage, retrieval, and management through a structured interface — while enforcing **integrity, security, and concurrency control**.

**Core responsibilities**: data modeling (tables/relationships), CRUD via a query language, integrity enforcement, access control, concurrent-access management, backup/recovery, and query optimization.

**Types, with examples**:
- **Relational (RDBMS)**: schema-defined tables, SQL — MySQL, PostgreSQL, SQL Server.
- **NoSQL**: unstructured/semi-structured data, horizontal scale — MongoDB (document), Redis (key-value).
- **Cloud-managed**: Amazon RDS, Google Cloud Bigtable, Azure Cosmos DB.
- **NewSQL**: RDBMS guarantees at NoSQL scale — Google Cloud Spanner, NuoDB.
- **Object-oriented**: persists objects directly — db4o, ObjectStore (niche today).
- **In-memory**: data lives in RAM for speed — Redis, Oracle TimesTen.
- **Multi-model**: several data models in one engine — ArangoDB.
- **Graph**: optimized for traversals/pathfinding — Neo4j.

**See also**: [sql_vs_nosql.md](../01_fundamentals/sql_vs_nosql.md), [database_engines.md](../01_fundamentals/database_engines.md)

---

<a name="q2"></a>
## 2. Explain the ACID properties  ---- IMP

- **Atomicity** — a transaction is all-or-nothing; a transaction log lets the engine roll back an incomplete transaction to the last consistent state. *A bank transfer's debit and credit either both happen or neither does.*
- **Consistency** — a transaction moves the database between valid states, never violating constraints (foreign keys, checks, uniqueness).
- **Isolation** — concurrent transactions don't see each other's uncommitted changes. Controlled by isolation levels: **read uncommitted → read committed → repeatable read → serializable** — each level trades concurrency for stricter guarantees.
- **Durability** — once committed, a transaction survives a crash, typically via write-ahead logging (WAL) flushed to disk before the commit is acknowledged.

**Where it matters**: banking, inventory decrements, booking systems (no partial bookings), order processing, anything where a partial write is worse than a failed one.

**See also**: [09_transactions_concurrency/](../09_transactions_concurrency/) for isolation-level anomalies in depth.

---

<a name="q3"></a>
## 3. SQL vs NoSQL  ---- IMP

| | SQL (RDBMS) | NoSQL |
|---|---|---|
| Structure | Tables, fixed schema | Document / key-value / wide-column / graph |
| Schema | Enforced upfront; changes need migrations | Schema-on-read or ad-hoc per document |
| Query | SQL | Model-specific APIs (Mongo query language, Redis commands...) |
| Scaling | Historically vertical; horizontal via read replicas/sharding | Horizontal by design |
| Consistency | Strong/ACID by default | Often tunable — eventual to strong, per operation |
| Relationships | Foreign keys, JOINs, referential integrity | Usually denormalized/embedded; joins are expensive or absent |
| Best for | Clear relational structure, strict consistency needs, complex multi-table queries | Flexible/evolving schemas, massive horizontal scale, simple access patterns |

The honest framing: this isn't "NoSQL is faster" — it's a different consistency/schema trade-off. Pick by **access pattern and consistency need**, not by trend.

**See also**: [sql_vs_nosql.md](../01_fundamentals/sql_vs_nosql.md), [06_nosql_mongodb/](../../express-backend-knowledge-base/06_nosql_mongodb/) in the Express KB.

---

<a name="q4"></a>
## 4. Describe a relational database schema

A schema defines the tables, columns, types, constraints, and relationships that structure the data.

**Core components**: Tables (relations) → Columns (typed attributes) → Rows (records, uniquely identified by a primary key).

**Relationship types**:
- **One-to-one** — each row in A relates to exactly one row in B.
- **One-to-many** — one row in A relates to many rows in B; each B row points back to exactly one A.
- **Many-to-many** — requires a **junction/linking table** holding both foreign keys.

**Common constraints**: `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`, and indexes for retrieval speed.

```sql
CREATE TABLE Students (
  StudentID INTEGER PRIMARY KEY,
  Name TEXT NOT NULL,
  Age INTEGER CHECK (Age >= 18),
  MajorID INTEGER,
  FOREIGN KEY (MajorID) REFERENCES Majors(MajorID)
);

CREATE TABLE Courses (
  CourseID INTEGER PRIMARY KEY,
  Title TEXT NOT NULL,
  Credits INTEGER CHECK (Credits >= 0)
);

-- Many-to-many: Students <-> Courses via a junction table
CREATE TABLE Enrollments (
  StudentID INTEGER,
  CourseID INTEGER,
  EnrollmentDate DATE DEFAULT CURRENT_DATE,
  PRIMARY KEY (StudentID, CourseID),
  FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
  FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);

CREATE TABLE Majors (
  MajorID INTEGER PRIMARY KEY,
  Name TEXT NOT NULL UNIQUE
);
```

---

<a name="q5"></a>
## 5. What is a primary key, and why is it important?

A **primary key** uniquely identifies each row in a table.

**Core properties**: unique across all rows, never null, and stable (shouldn't change once assigned — that's why surrogate keys like auto-increment IDs or UUIDs are preferred over "natural" keys like email, which can change).

**Why it matters**: data integrity, fast lookups (backed by an index automatically), the anchor that foreign keys reference, and the basis for every table relationship.

**Practical note across engines**: most modern RDBMS (Postgres, MySQL, SQL Server, SQLite) support integers, UUIDs, and most scalar types as primary keys, with engine-specific limits on composite key length — not something worth memorizing per-vendor; know instead **when to pick UUID vs auto-increment** (see cross-link).

**See also**: [uuid_vs_autoincrement.md](../07_database_design/uuid_vs_autoincrement.md)

---

<a name="q6"></a>
## 6. What is a foreign key, and its role?  ---- IMP

A **foreign key** is a column (or set of columns) in one table that references the primary key of another table, enforcing **referential integrity** — you can't insert a child row pointing to a parent that doesn't exist, and (depending on the constraint) you can't delete a parent that still has children without explicitly choosing `CASCADE`, `SET NULL`, or `RESTRICT`.

```sql
CREATE TABLE authors (
    author_id INT PRIMARY KEY,
    author_name VARCHAR(100)
);

CREATE TABLE books (
    book_id INT PRIMARY KEY,
    book_name VARCHAR(255),
    author_id INT,
    FOREIGN KEY (author_id) REFERENCES authors(author_id)
);

SELECT book_name, author_name FROM books
JOIN authors ON books.author_id = authors.author_id;
```

**Inspecting keys** (Postgres/SQL Server, standard information schema):
```sql
SELECT table_name, column_name, constraint_name
FROM information_schema.key_column_usage
WHERE table_name = 'books';
```

**Interview follow-up to expect**: "what happens on delete if you don't specify ON DELETE behavior?" → default is `RESTRICT`/`NO ACTION` — the delete fails if child rows reference the parent.

---

<a name="q7"></a>
## 7. What is database normalization, and why use it?  ---- IMP

Normalization organizes columns and tables to **minimize redundancy and dependency**, so an update only ever needs to happen in one place.

- **1NF** — atomic values per cell, unique rows (no repeating groups).
- **2NF** — 1NF + no partial dependency (every non-key column depends on the **whole** composite primary key, not part of it).
- **3NF** — 2NF + no transitive dependency (non-key columns depend only on the key, not on other non-key columns). **Most production schemas target 3NF.**
- **BCNF** — a stricter 3NF where every determinant is a candidate key.
- **4NF / 5NF** — handle multi-valued and join dependencies; rarely relevant outside academic contexts.

**Trade-off to state explicitly**: normalization optimizes for write consistency and minimal redundancy; it costs you JOINs at read time. That's the exact motivation for question 8.

**See also**: [normalization.md](../07_database_design/normalization.md)

---

<a name="q8"></a>
## 8. What is denormalization, and when would you use it?  ---- IMP

**Denormalization** deliberately reintroduces redundant data to cut down on JOINs and speed up reads — the inverse trade-off of normalization.

```sql
-- Normalized: requires a JOIN every read
-- Customer(ID, Name, StatusID) + Status(StatusID, Description)
SELECT c.Name, s.Description AS Status FROM Customer c
JOIN Status s ON c.StatusID = s.StatusID;

-- Denormalized: Status text duplicated directly onto Customer
SELECT Name, Status FROM Customer;
```

**When it's the right call**:
- **Read-heavy analytics/reporting** — dedicated denormalized read replicas or warehouse tables.
- **Frequently-joined, rarely-changing lookup data** (status names, category labels).
- **High-traffic hot paths** where a JOIN's cost is measured and real.

**The cost you're accepting**: every place the duplicated value lives must be kept in sync on update — a data-integrity liability if not managed carefully (triggers, application-level sync, or accepting eventual staleness).

**See also**: [denormalization.md](../07_database_design/denormalization.md)

---

<a name="q9"></a>
## 9. DROP vs DELETE vs TRUNCATE  ---- IMP

| | Scope | Reversible? | Speed | Resets auto-increment? |
|---|---|---|---|---|
| `DROP TABLE` | Removes the table **and its structure** entirely | No (DDL, auto-commits) | N/A — gone | N/A |
| `DELETE FROM t WHERE ...` | Removes matching **rows**, row-by-row (logged) | Yes, within a transaction, until commit | Slowest (per-row logging, fires triggers) | No |
| `TRUNCATE TABLE` | Removes **all rows**, structure stays | Depends on engine — Postgres: yes within a transaction; MySQL: auto-commits, not rollback-able | Fast (deallocates pages, minimal per-row logging) | Yes (typically) |

**One-line answer**: "DROP kills the table, DELETE removes rows with full transactional control (and can use WHERE), TRUNCATE wipes all rows fast but with fewer guarantees and (in some engines) no rollback."

```sql
CREATE TABLE employees (id SERIAL PRIMARY KEY, name VARCHAR(50), age INT);
INSERT INTO employees (name, age) VALUES ('Alice', 25), ('Bob', 30), ('Charlie', 28);

DELETE FROM employees WHERE age > 29;   -- removes Bob only, needs COMMIT to finalize
TRUNCATE TABLE employees;               -- would remove everything remaining
```

---

<a name="q10"></a>
## 10. Full join vs inner join

- **INNER JOIN** — returns only rows with a match in **both** tables.
- **FULL OUTER JOIN** — returns all rows from both tables, filling `NULL` where no match exists on the other side. Rarely needed in practice (can produce very large result sets); usually a sign you actually want a `LEFT JOIN` in one direction.

```sql
SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.id;
SELECT * FROM table1 FULL OUTER JOIN table2 ON table1.id = table2.id;
```

**See also**: [04_joins/](../04_joins/) for the full join family (LEFT/RIGHT/CROSS/SELF) with visuals.

---

<a name="q11"></a>
## 11. How would you find duplicate records?

**Standard aggregation approach**:
```sql
SELECT name, age, COUNT(*)
FROM mytable
GROUP BY name, age
HAVING COUNT(*) > 1;
```

**`ROW_NUMBER()` approach** — useful when you need to keep one copy and delete the rest, since it preserves each row's identity:
```sql
WITH duplicates AS (
  SELECT *,
         ROW_NUMBER() OVER (PARTITION BY name, age ORDER BY id) AS rnum
  FROM mytable
)
SELECT * FROM duplicates WHERE rnum > 1;

-- To actually delete the extras, keeping the first occurrence:
DELETE FROM mytable WHERE id IN (SELECT id FROM duplicates WHERE rnum > 1);
```

---

<a name="q12"></a>
## 12. What is a prepared statement, and why use one?  ---- IMP

A **prepared statement** separates the SQL command's structure from its data — the query is parsed/compiled once with placeholders, then executed repeatedly with different bound values.

**Why it matters**:
- **Security**: input is always treated as a literal value, never as executable SQL — this is *the* primary defense against SQL injection.
- **Performance**: the query plan can be cached and reused across executions with different parameters.
- **Clarity**: separates query logic from data, easier to read and review.

**Use whenever**: input comes from a user/external source, or the same query shape runs repeatedly (loops, high-volume paths).

**See also**: [12_security/](../12_security/) for SQL injection deep dive.

---

<a name="q13"></a>
## 13. What is the N+1 query problem, and how do you solve it?  ---- IMP

Fetching a list (1 query), then fetching each item's related data in a **separate query per item** (N queries) — total N+1 round trips instead of one.

```sql
-- 1 query
SELECT * FROM Orders;
-- then N queries, one per order:
SELECT * FROM LineItems WHERE order_id = :order_id;
```

**Fixes, in order of preference**:
1. **JOIN** — fetch related data in the same query: `SELECT o.*, li.* FROM Orders o JOIN LineItems li ON o.id = li.order_id`.
2. **Eager loading** in the ORM — explicitly tell it to fetch relations upfront (`include`/`@ManyToOne` eager fetch/JPA `JOIN FETCH`) instead of triggering a query per access.
3. **Batching (DataLoader-style)** — collect all needed IDs and fetch them in one `WHERE id IN (...)` query; the standard fix in GraphQL resolvers.
4. **Projection** — select only the fields you need instead of full entities, reducing what N+1 even costs per hit.
5. **Pagination** — when N is a list that's growing unboundedly, cap it (`LIMIT`/cursor pagination) so the problem doesn't scale with data growth.

**This is asked constantly** because it's the most common real-world ORM performance bug — be ready to explain it for whichever ORM you use (Prisma `include`, Mongoose `.populate()`, TypeORM `relations`, Sequelize `include`).

**See also**: [pagination_queries.md](../13_sql_for_backend_apis/pagination_queries.md)

---

<a name="q14"></a>
## 14. GROUP BY and HAVING

- **`GROUP BY`** collapses rows into groups by the specified column(s), so aggregate functions (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) compute **per group**. Every selected non-aggregated column must appear in the `GROUP BY` list.
- **`HAVING`** filters **after** aggregation — the equivalent of `WHERE` but for aggregate results, since `WHERE` runs before grouping and can't reference aggregate values.

```sql
SELECT DeptID
FROM EMPLOYEE
GROUP BY DeptID
HAVING AVG(Salary) > 50000;
```

**Quick distinction to state**: "`WHERE` filters rows before grouping; `HAVING` filters groups after aggregation."

**See also**: [05_aggregations_grouping/](../05_aggregations_grouping/)

---

<a name="q15"></a>
## 15. What are indexes, and how do they work?  ---- IMP

An **index** is a separate data structure that maintains a sorted/searchable pointer to table rows, trading extra storage and slower writes for dramatically faster reads on the indexed column(s).

**Index types**:
- **B-Tree** — the default everywhere; great for equality, ranges (`<`, `>`, `BETWEEN`), and `ORDER BY`.
- **Hash** — O(1) exact-match lookups only; no range support.
- **Full-text (GIN-backed in Postgres)** — text search.
- **Bitmap** — efficient for low-cardinality columns (few distinct values); common in analytics/data-warehouse engines.

```sql
CREATE INDEX idx_btree ON table_name (column_name);
CREATE INDEX idx_hash ON table_name USING HASH (column_name);
```

**Best practices**:
- Every index speeds up reads but slows down `INSERT`/`UPDATE`/`DELETE` (the index itself must be maintained) — don't index columns you never filter/sort by.
- In a **composite index**, column order matters — put the most selective/most-frequently-filtered column first (leftmost-prefix rule).
- Watch for **index bloat**: too many overlapping indexes waste storage and slow writes for marginal read gains.

**See also**: [08_indexes/](../08_indexes/) — this KB's dedicated, much deeper index module (B-tree internals, covering indexes, index vs seq scan, selectivity, GIN/GiST/BRIN).