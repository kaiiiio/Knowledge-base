# What is an Index: Understanding Database Indexes

Indexes are one of the most important concepts in database performance. Understanding how they work is crucial for writing efficient queries and designing performant databases.

## What is an Index?

An **index** is a data structure that improves the speed of data retrieval operations on a database table. Think of it like an index in a book - instead of reading every page to find a topic, you look it up in the index and go directly to the right page.

### Real-World Analogy

**Without an index (Full Table Scan):**
```
Finding "John Doe" in a phone book without alphabetization:
- Start at page 1
- Read every name
- Continue until you find "John Doe"
- Time: O(n) - linear search
```

**With an index (Index Scan):**
```
Finding "John Doe" in an alphabetized phone book:
- Jump to "J" section
- Find "Doe"
- Find "John"
- Time: O(log n) - binary search
```

## How Indexes Work

### Without an Index

```sql
-- Query: Find user by email
SELECT * FROM users WHERE email = 'john@example.com';
```

**What happens:**
1. Database scans entire `users` table row by row
2. Compares each `email` value with 'john@example.com'
3. Returns matching row(s)
4. **Time Complexity: O(n)** - Must check every row

**For 1 million users:**
- Worst case: Check all 1,000,000 rows
- Average case: Check ~500,000 rows
- **Very slow!**

### With an Index

```sql
-- Create index on email
CREATE INDEX idx_users_email ON users(email);

-- Same query
SELECT * FROM users WHERE email = 'john@example.com';
```

**What happens:**
1. Database uses index to find email quickly
2. Index points directly to row location
3. Database retrieves only that row
4. **Time Complexity: O(log n)** - Binary search in index

**For 1 million users:**
- Index lookup: ~20 comparisons (log₂(1,000,000) ≈ 20)
- Direct row access: 1 row read
- **Very fast!**

## Index Structure: B-Tree

Most database indexes use **B-Tree** (Balanced Tree) data structure.

### B-Tree Visualization

```
                    [50]
                   /    \
              [25]        [75]
             /   \       /    \
        [10] [30]   [60] [90]
        / |  / |   / |  / |
      [5][15][20][35][55][65][80][95]
```

**Properties:**
- **Balanced**: All leaf nodes at same depth
- **Sorted**: Data is sorted within the tree
- **Efficient**: O(log n) search, insert, delete
- **Wide**: Each node can have many children (reduces depth)

### How B-Tree Index Works

**Example: Finding user with id = 42**

```
Index Structure (simplified):
                    [50]
                   /    \
              [25]        [75]
             /   \       /    \
        [10] [30]   [60] [90]

Search Process:
1. Start at root [50]
   - 42 < 50, go left
2. Check [25]
   - 42 > 25, go right
3. Check [30]
   - 42 > 30, continue right
4. Found! Points to row location
```

**Only 3-4 comparisons instead of scanning thousands of rows!**

## Types of Indexes

### 1. Single-Column Index

Index on one column.

```sql
-- Create index on email column
CREATE INDEX idx_users_email ON users(email);

-- Query uses index
SELECT * FROM users WHERE email = 'john@example.com';
```

**Use when:**
- Frequently filtering by this column
- Column used in WHERE clauses
- Column used in JOIN conditions

### 2. Composite Index (Multi-Column)

Index on multiple columns.

```sql
-- Create composite index
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Query uses index
SELECT * FROM orders 
WHERE user_id = 1 AND created_at > '2024-01-01';
```

**Column Order Matters:**
```sql
-- ✅ Uses index (matches leftmost column)
SELECT * FROM orders WHERE user_id = 1;

-- ✅ Uses index (matches both columns)
SELECT * FROM orders 
WHERE user_id = 1 AND created_at > '2024-01-01';

-- ❌ May not use index efficiently (doesn't match leftmost)
SELECT * FROM orders WHERE created_at > '2024-01-01';
```

**Rule:** Leftmost prefix rule - index is used if query matches columns from left to right.

### 3. Unique Index

Ensures uniqueness and provides fast lookups.

```sql
-- Create unique index
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);

-- Automatically created when you define UNIQUE constraint
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
```

**Benefits:**
- Fast lookups (like regular index)
- Enforces uniqueness
- Prevents duplicate values

### 4. Partial Index

Index on subset of rows (PostgreSQL).

```sql
-- Index only active users
CREATE INDEX idx_users_active_email ON users(email) 
WHERE is_active = true;

-- Query uses index
SELECT * FROM users 
WHERE is_active = true AND email = 'john@example.com';
```

**Benefits:**
- Smaller index size
- Faster for filtered queries
- Less maintenance overhead

## When to Create Indexes

### ✅ Create Indexes For:

1. **Primary Keys** (automatic)
   ```sql
   -- Automatically indexed
   CREATE TABLE users (id INT PRIMARY KEY);
   ```

2. **Foreign Keys** (usually)
   ```sql
   -- Index for JOINs
   CREATE INDEX idx_orders_user_id ON orders(user_id);
   ```

3. **Frequently Queried Columns**
   ```sql
   -- Users often search by email
   CREATE INDEX idx_users_email ON users(email);
   ```

4. **Columns in WHERE Clauses**
   ```sql
   -- Filter by status often
   CREATE INDEX idx_orders_status ON orders(status);
   ```

5. **Columns in ORDER BY**
   ```sql
   -- Sort by created_at often
   CREATE INDEX idx_orders_created ON orders(created_at);
   ```

6. **Columns in JOIN Conditions**
   ```sql
   -- Join on user_id
   CREATE INDEX idx_orders_user_id ON orders(user_id);
   ```

### ❌ Don't Create Indexes For:

1. **Small Tables** (< 1000 rows)
   - Index overhead may exceed benefits
   - Full table scan is fast enough

2. **Columns Rarely Queried**
   - Index maintenance cost > query benefit

3. **Columns with Low Selectivity**
   ```sql
   -- Bad: Only 2-3 distinct values
   CREATE INDEX idx_users_gender ON users(gender);  -- M/F/Other
   ```

4. **Frequently Updated Columns**
   - Every update requires index maintenance
   - Balance: Query speed vs. Write speed

5. **Text Columns (Very Long)**
   ```sql
   -- Very expensive for long text
   CREATE INDEX idx_posts_content ON posts(content);  -- content is TEXT
   ```

## Index Trade-offs

### Benefits

1. **Faster Queries**: O(log n) vs O(n) lookups
2. **Faster Sorts**: Index is already sorted
3. **Faster JOINs**: Index helps find matching rows
4. **Enforce Uniqueness**: Unique indexes prevent duplicates

### Costs

1. **Storage Space**: Indexes take disk space
   ```sql
   -- Index might be 10-20% of table size
   -- Table: 1GB → Index: ~150MB
   ```

2. **Write Performance**: Slower INSERTs, UPDATEs, DELETEs
   ```sql
   -- Every INSERT must update index
   INSERT INTO users (email, name) VALUES ('new@example.com', 'New User');
   -- Updates: users table + email index
   ```

3. **Maintenance Overhead**: Indexes need to be maintained
   - Rebuilding after bulk operations
   - Statistics updates
   - Vacuum operations (PostgreSQL)

## Index Usage Examples

### Example 1: Simple Lookup

```sql
-- Without index
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';
-- Seq Scan on users (cost=0.00..1000.00 rows=1 width=64)

-- With index
CREATE INDEX idx_users_email ON users(email);
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';
-- Index Scan using idx_users_email (cost=0.42..8.44 rows=1 width=64)
```

**Performance Improvement:**
- Without index: 1000 cost units
- With index: 8.44 cost units
- **~118x faster!**

### Example 2: Range Query

```sql
-- Index on created_at
CREATE INDEX idx_orders_created ON orders(created_at);

-- Range query uses index
SELECT * FROM orders 
WHERE created_at BETWEEN '2024-01-01' AND '2024-01-31';
-- Index Scan using idx_orders_created
```

### Example 3: JOIN Performance

```sql
-- Index on foreign key
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- JOIN uses index
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.id = 1;
-- Uses index on orders.user_id for fast lookup
```

## Monitoring Index Usage

### PostgreSQL: Check Index Usage

```sql
-- See which indexes are being used
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,  -- Number of times index was used
    idx_tup_read,  -- Rows read via index
    idx_tup_fetch  -- Rows fetched via index
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Find Unused Indexes

```sql
-- Indexes never used (candidates for removal)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE '%_pkey'  -- Don't remove primary keys
ORDER BY pg_relation_size(indexrelid) DESC;  -- Largest unused indexes first
```

## Index Maintenance

### Rebuild Indexes

```sql
-- PostgreSQL: Rebuild index
REINDEX INDEX idx_users_email;

-- Rebuild all indexes on table
REINDEX TABLE users;

-- Rebuild all indexes in database
REINDEX DATABASE mydb;
```

### Update Statistics

```sql
-- Update table statistics (helps query planner)
ANALYZE users;

-- Analyze all tables
ANALYZE;
```

## Best Practices

### 1. **Index Foreign Keys**

```sql
-- Always index foreign keys (used in JOINs)
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

### 2. **Composite Index Column Order**

```sql
-- Order by selectivity (most selective first)
-- If user_id filters to 1% of rows, created_at to 10%:
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);
-- Not: (created_at, user_id)
```

### 3. **Don't Over-Index**

```sql
-- ❌ Bad: Too many indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created ON users(created_at);
-- Every INSERT updates 4 indexes!

-- ✅ Good: Index only what's needed
CREATE INDEX idx_users_email ON users(email);  -- Most queried
CREATE INDEX idx_users_created ON users(created_at);  -- Used in sorting
```

### 4. **Monitor and Remove Unused Indexes**

```sql
-- Regularly check for unused indexes
-- Remove if not used for 30+ days
DROP INDEX idx_unused_column;
```

### 5. **Use EXPLAIN to Verify**

```sql
-- Always check if index is being used
EXPLAIN ANALYZE 
SELECT * FROM users WHERE email = 'john@example.com';

-- Look for "Index Scan" in output
```

## Common Mistakes

### ❌ Indexing Every Column

```sql
-- Bad: Indexes on everything
CREATE INDEX idx_users_id ON users(id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created ON users(created_at);
-- Slows down writes significantly!
```

### ❌ Wrong Composite Index Order

```sql
-- Bad: Less selective column first
CREATE INDEX idx_orders_status_user ON orders(status, user_id);
-- status has only 5 values, user_id has thousands

-- Good: More selective column first
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

### ❌ Not Indexing Foreign Keys

```sql
-- Bad: No index on foreign key
CREATE TABLE orders (
    id INT PRIMARY KEY,
    user_id INT REFERENCES users(id)  -- No index!
);
-- JOINs will be slow!

-- Good: Index foreign key
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

## Summary

**Index Essentials:**

1. **What**: Data structure for fast lookups (like book index)
2. **Structure**: Usually B-Tree (balanced, sorted tree)
3. **Performance**: O(log n) vs O(n) without index
4. **Types**: Single-column, composite, unique, partial
5. **When to Use**: Foreign keys, frequently queried columns, WHERE/ORDER BY
6. **Trade-offs**: Faster reads, slower writes, storage cost
7. **Best Practice**: Index foreign keys, monitor usage, don't over-index

**Key Takeaway:**
Indexes are essential for database performance. They transform slow O(n) scans into fast O(log n) lookups. Always index foreign keys and frequently queried columns, but avoid over-indexing as it slows down writes.

**Performance Impact:**
- Without index: 1,000,000 row scan = ~1 second
- With index: 1,000,000 row lookup = ~0.01 seconds
- **100x faster!**

**Next Steps:**
- Learn [How Indexes Work Internally](how_indexes_work.md) for deeper understanding
- Study [Composite Indexes](composite_index.md) for multi-column scenarios
- Master [Index Scans vs Seq Scans](index_scans_vs_seq_scans.md) for query optimization

---

## 🎯 Interview Questions: SQL

### Q1: Explain what a database index is and how it improves query performance. Describe the trade-offs of using indexes, including their impact on write operations. Provide a detailed example comparing query execution with and without an index.

**Answer:**

**Database Index Definition:**

A database index is a data structure that improves the speed of data retrieval operations on a database table. It's similar to an index in a book—instead of scanning every page to find a topic, you look it up in the index and go directly to the relevant pages. Indexes create a separate data structure that stores a sorted or hashed representation of one or more columns, allowing the database to quickly locate rows without scanning the entire table.

**How Indexes Improve Query Performance:**

**1. Reduced Scan Operations:**

Without an index, the database must perform a sequential scan (full table scan), examining every row to find matching values. This is an O(n) operation where n is the number of rows. With an index, the database can use an index scan, which is typically O(log n) for B-tree indexes, dramatically reducing the number of rows examined.

**2. Sorted Data Access:**

Indexes maintain data in a sorted order (for B-tree indexes), enabling:
- Fast range queries
- Efficient ORDER BY operations
- Quick MIN/MAX aggregations

**3. Covering Indexes:**

A covering index contains all columns needed for a query, allowing the database to satisfy the query entirely from the index without accessing the table data. This eliminates table lookups entirely.

**4. Join Optimization:**

Indexes on foreign keys and join columns enable efficient join operations, allowing the database to quickly match rows between tables.

**Trade-offs of Using Indexes:**

**1. Storage Overhead:**

Indexes require additional disk space. Each index stores a copy of the indexed column(s) plus pointers to the actual table rows. For large tables with multiple indexes, this can significantly increase storage requirements.

**2. Write Performance Impact:**

**Insert Operations:**
- When inserting a new row, the database must update all indexes on that table
- Each index update requires maintaining the index structure (B-tree rebalancing, etc.)
- Multiple indexes mean multiple write operations per insert

**Update Operations:**
- Updating an indexed column requires updating the index entry
- If the update changes the sort order, the index must be reorganized
- Updates to non-indexed columns don't affect indexes

**Delete Operations:**
- Deleting a row requires removing entries from all indexes
- Index maintenance overhead similar to inserts

**3. Maintenance Overhead:**

Indexes require maintenance:
- Rebuilding after bulk data loads
- Statistics updates for query optimization
- Fragmentation management
- Vacuum/optimization operations

**4. Memory Usage:**

Active indexes consume memory (buffer pool). Large indexes or many indexes can increase memory requirements.

**Detailed Example: Query with and without Index**

**Scenario:** Find a user by email in a table with 10 million users.

**Table Structure:**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255),
    name VARCHAR(255),
    created_at TIMESTAMP
);

-- Initially, no index on email
```

**Query:**
```sql
SELECT id, name, email
FROM users
WHERE email = 'john.doe@example.com';
```

**Execution WITHOUT Index (Sequential Scan):**

```
Execution Plan:
─────────────────────────────────────────────────────────
Seq Scan on users (cost=0.00..250000.00 rows=1 width=45)
  Filter: (email = 'john.doe@example.com'::text)
─────────────────────────────────────────────────────────

Steps:
1. Database starts at first row
2. Reads each row sequentially
3. Compares email column with 'john.doe@example.com'
4. Continues until match found or end of table
5. Worst case: Scans all 10,000,000 rows
6. Average case: Scans ~5,000,000 rows (if email is unique)

Performance:
- I/O Operations: ~10,000,000 row reads (assuming 1 row per page)
- CPU Operations: 10,000,000 string comparisons
- Time: ~2-5 seconds (depending on hardware)
- Cost: High (full table scan)
```

**Execution WITH Index (Index Scan):**

```sql
-- Create index
CREATE INDEX idx_users_email ON users(email);
```

```
Execution Plan:
─────────────────────────────────────────────────────────────
Index Scan using idx_users_email on users 
  (cost=0.43..8.45 rows=1 width=45)
  Index Cond: (email = 'john.doe@example.com'::text)
─────────────────────────────────────────────────────────────

Steps:
1. Database uses B-tree index on email
2. Traverses index tree (logarithmic search)
3. Finds matching index entry (typically 3-4 levels deep)
4. Uses pointer to fetch actual row from table
5. Returns result

Performance:
- I/O Operations: ~4-5 page reads (index traversal + table lookup)
- CPU Operations: ~20-30 comparisons (tree traversal)
- Time: ~0.01-0.05 seconds
- Cost: Low (index scan)

Performance Improvement: 100-500x faster!
```

**Visual Comparison:**

```
Without Index (Sequential Scan):
┌─────────────────────────────────────────────────┐
│  Table: users (10,000,000 rows)                 │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ Row 1│→ │ Row 2│→ │ Row 3│→ │ Row 4│→ ...  │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│     │         │         │         │            │
│     ▼         ▼         ▼         ▼            │
│  Check    Check    Check    Check              │
│  email    email    email    email              │
│     │         │         │         │            │
│     └─────────┴─────────┴─────────┴────────────┘
│                    │
│              Continue until found
│              (may scan all rows)
└─────────────────────────────────────────────────┘

With Index (Index Scan):
┌─────────────────────────────────────────────────┐
│  B-Tree Index on email                          │
│                    ┌─────────────┐              │
│                    │   Root      │              │
│                    │  (m-p)      │              │
│                    └───┬─────┬───┘              │
│            ┌───────────┘     └───────────┐      │
│      ┌─────▼─────┐              ┌─────▼─────┐   │
│      │  Leaf     │              │  Leaf     │   │
│      │ (a-f)     │              │ (q-z)     │   │
│      └─────┬─────┘              └─────┬─────┘   │
│           │                            │         │
│      ┌────▼────┐                       │         │
│      │j@ex.com │→ Row Pointer → Table  │         │
│      └─────────┘                       │         │
│                                        │         │
│  Direct lookup: 3-4 steps              │         │
│  vs scanning 10M rows                  │         │
└─────────────────────────────────────────────────┘
```

**Write Operation Impact Example:**

**Insert Performance Comparison:**

```sql
-- Insert 100,000 new users
INSERT INTO users (email, name) 
SELECT 
    'user' || generate_series || '@example.com',
    'User ' || generate_series
FROM generate_series(1, 100000);
```

**Without Index on email:**
- Time: ~5 seconds
- Operations: Direct table inserts only
- No index maintenance overhead

**With Index on email:**
- Time: ~15-20 seconds
- Operations: Table inserts + index updates
- Each insert requires:
  1. Insert row into table
  2. Insert entry into B-tree index
  3. Maintain B-tree balance
  4. Update index statistics

**Performance Impact: 3-4x slower for writes**

**System Design Consideration**: Indexes are crucial for:
1. **Query Performance**: Dramatically improving read performance
2. **Scalability**: Enabling efficient queries on large datasets
3. **Write Trade-offs**: Understanding that indexes improve reads but slow writes
4. **Index Strategy**: Creating indexes strategically based on query patterns

Indexes are one of the most important tools for database performance optimization. Understanding when to create indexes, which columns to index, and the trade-offs involved is essential for building performant database applications. The key is finding the right balance between read performance and write performance based on your application's access patterns.

---

### Q2: Explain how B-tree indexes work internally. Describe the structure of a B-tree, how searches are performed, and why B-trees are well-suited for database indexes. Compare B-tree indexes with hash indexes and explain when to use each.

**Answer:**

**B-Tree Index Internal Structure:**

A B-tree (Balanced Tree) is a self-balancing tree data structure that maintains sorted data and allows searches, sequential access, insertions, and deletions in logarithmic time. B-trees are the most common index structure in relational databases because they efficiently support both equality and range queries.

**B-Tree Structure:**

**1. Node Organization:**

A B-tree consists of nodes, each containing:
- **Keys**: The indexed values (or portions of them)
- **Pointers**: References to child nodes or data rows
- **Metadata**: Node type (leaf or internal), key count, etc.

**2. Tree Levels:**

```
                    Root Node
                   (Level 0)
                  /    |    \
         Internal Node  Internal Node  Internal Node
         (Level 1)      (Level 1)      (Level 1)
        /   |   \      /   |   \      /   |   \
   Leaf   Leaf  Leaf  Leaf  Leaf  Leaf  Leaf  Leaf  Leaf
  (Level 2) (Level 2) (Level 2) (Level 2) (Level 2) ...
```

**3. Node Capacity:**

Each node can hold multiple keys (typically hundreds or thousands, depending on key size and page size). This "branching factor" is what makes B-trees efficient—they're wide and shallow rather than deep.

**4. Leaf Nodes:**

Leaf nodes contain:
- Key values
- Pointers to actual table rows (or row identifiers)
- Links to adjacent leaf nodes (for range scans)

**5. Internal Nodes:**

Internal nodes contain:
- Key values (separators/ranges)
- Pointers to child nodes

**How B-Tree Searches Work:**

**Example: Searching for email = 'john@example.com'**

```
Step 1: Start at Root
┌─────────────────────────────────────┐
│ Root: [a-f] [g-m] [n-s] [t-z]       │
└───┬──────┬──────┬──────┬───────────┘
    │      │      │      │
    ▼      ▼      ▼      ▼
```

**Step 2: Compare and Navigate**
- Compare 'john@example.com' with root keys
- 'j' falls in range [g-m]
- Follow pointer to [g-m] child node

```
Step 2: Navigate to [g-m] Node
┌─────────────────────────────────────┐
│ [g-m]: [g-i] [j-l] [m]             │
└───┬──────┬──────┬───────────────────┘
    │      │      │
    ▼      ▼      ▼
```

**Step 3: Continue to Leaf**
- 'j' falls in range [j-l]
- Follow pointer to [j-l] leaf node

```
Step 3: Search Leaf Node
┌─────────────────────────────────────────────┐
│ Leaf: [jack@...] [jane@...] [john@...] ... │
│       └──────────┴──────────┴───────────────┘
│              │         │         │
│              ▼         ▼         ▼
│         Row Ptr    Row Ptr   Row Ptr
└─────────────────────────────────────────────┘
```

**Step 4: Find Match and Return**
- Binary search within leaf node finds 'john@example.com'
- Follow pointer to table row
- Return row data

**Time Complexity:**
- Height of tree: O(log n) where n is number of indexed values
- Search within node: O(log m) where m is keys per node
- Total: O(log n) - logarithmic time

**Why B-Trees Are Well-Suited for Databases:**

**1. Balanced Structure:**

B-trees maintain balance automatically, ensuring consistent performance regardless of insertion order. The tree height remains logarithmic, guaranteeing O(log n) search time.

**2. Efficient Range Queries:**

B-trees store data in sorted order, enabling efficient range queries:
```sql
SELECT * FROM users 
WHERE email BETWEEN 'a@example.com' AND 'm@example.com';
```
The database can:
- Find the start of the range
- Scan leaf nodes sequentially
- Stop at the end of the range

**3. Sequential Access:**

Leaf nodes are linked, allowing efficient sequential scans for ORDER BY operations without additional sorting.

**4. Disk-Optimized:**

B-trees are designed for disk storage:
- Nodes fit in disk pages (typically 4KB-8KB)
- Minimizes disk I/O (fewer page reads)
- Wide, shallow trees reduce tree height

**5. Supports Multiple Operations:**

B-trees efficiently support:
- Equality searches (O(log n))
- Range queries (O(log n) + result size)
- Insertions (O(log n))
- Deletions (O(log n))
- Updates (O(log n))

**B-Tree vs Hash Index Comparison:**

**B-Tree Index:**

**Structure:**
```
                    Root
                   /    \
              Internal  Internal
              /    \    /    \
           Leaf  Leaf  Leaf  Leaf
```

**Characteristics:**
- Sorted data structure
- Supports range queries
- Supports ORDER BY optimization
- Supports prefix searches (LIKE 'abc%')
- Logarithmic search time: O(log n)
- Balanced tree structure

**Use Cases:**
- General-purpose indexing
- Range queries
- Sorted results
- Prefix matching
- Most common index type

**Example:**
```sql
-- B-tree index supports all these:
CREATE INDEX idx_email ON users(email);

SELECT * FROM users WHERE email = 'john@example.com';
SELECT * FROM users WHERE email BETWEEN 'a@' AND 'm@';
SELECT * FROM users WHERE email LIKE 'john%';
SELECT * FROM users ORDER BY email;
```

**Hash Index:**

**Structure:**
```
Hash Function: email → bucket number
┌─────────┐  ┌─────────┐  ┌─────────┐
│Bucket 0 │  │Bucket 1 │  │Bucket 2 │
│[hash=0] │  │[hash=1] │  │[hash=2] │
│         │  │         │  │         │
│john@... │  │jane@... │  │bob@...  │
│→ Row   │  │→ Row    │  │→ Row    │
└─────────┘  └─────────┘  └─────────┘
```

**Characteristics:**
- Hash table structure
- Only equality searches
- No range queries
- No sorting support
- Constant average search time: O(1)
- Can have hash collisions

**Use Cases:**
- Exact match queries only
- High-frequency equality lookups
- When range queries aren't needed
- Memory-resident indexes

**Example:**
```sql
-- Hash index (PostgreSQL syntax)
CREATE INDEX idx_email_hash ON users USING HASH(email);

-- Works:
SELECT * FROM users WHERE email = 'john@example.com';

-- Doesn't work efficiently:
SELECT * FROM users WHERE email BETWEEN 'a@' AND 'm@';  -- Full scan
SELECT * FROM users WHERE email LIKE 'john%';            -- Full scan
SELECT * FROM users ORDER BY email;                      -- Full scan
```

**Comparison Table:**

| Feature | B-Tree | Hash |
|---------|--------|------|
| Equality Search | O(log n) | O(1) average |
| Range Queries | ✅ Efficient | ❌ Not supported |
| ORDER BY | ✅ Can use index | ❌ Requires sort |
| LIKE 'prefix%' | ✅ Supported | ❌ Not supported |
| Insert/Update | O(log n) | O(1) average |
| Disk I/O | Optimized | Can be higher |
| Memory Usage | Moderate | Lower |
| Collision Handling | N/A | Required |

**When to Use Each:**

**Use B-Tree When:**
- You need range queries
- You need sorted results
- You need prefix matching (LIKE)
- General-purpose indexing
- Most common use case

**Use Hash When:**
- Only exact match queries
- Very high-frequency lookups
- Range queries never needed
- Memory-resident data
- Specific performance requirements

**System Design Consideration**: Understanding B-tree internals is crucial for:
1. **Index Design**: Creating effective indexes
2. **Query Optimization**: Understanding how queries use indexes
3. **Performance Tuning**: Diagnosing index-related performance issues
4. **Index Selection**: Choosing the right index type for your use case

B-tree indexes are the workhorse of database indexing, providing a good balance of features and performance. Hash indexes offer better performance for exact matches but lack the flexibility of B-trees. Understanding both helps you choose the right index type for your specific use case.

