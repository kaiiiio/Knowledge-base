# Creating Vector Indexes for pgvector in Spring Boot

Vector indexes are crucial for fast similarity search. This guide covers creating and optimizing vector indexes with pgvector in Spring Boot.

## Understanding Vector Indexes

**Without index:**
- Full table scan for every query
- Slow for large datasets
- O(n) complexity

**With index:**
- Efficient similarity search
- Fast query performance
- O(log n) complexity

## Index Types

### 1. HNSW Index (Recommended)

**Best for:** Large datasets, fast queries

**Characteristics:**
- Graph-based structure
- Fast query times
- Slower to build
- Higher memory usage

**Creation:**
```sql
CREATE INDEX documents_embedding_idx 
ON documents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

**Parameters:**
- `m = 16`: Number of connections per node (higher = more accurate, slower)
- `ef_construction = 64`: Quality during build (higher = better, slower)

### 2. IVFFlat Index

**Best for:** Medium datasets, faster build times

**Characteristics:**
- Cluster-based structure
- Faster to build
- Slower queries than HNSW
- Lower memory usage

**Creation:**
```sql
CREATE INDEX documents_embedding_idx 
ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Parameters:**
- `lists`: Number of clusters (typically sqrt of total rows)

## Migration Setup

### Flyway Migration

**V2__Create_vector_index.sql:**
```sql
-- Enable vector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create HNSW index for cosine similarity
CREATE INDEX IF NOT EXISTS documents_embedding_hnsw_idx 
ON documents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- For large datasets, create index concurrently
-- CREATE INDEX CONCURRENTLY documents_embedding_hnsw_idx ...
```

### Liquibase Migration

**002-create-vector-index.xml:**
```xml
<databaseChangeLog>
    <changeSet id="create-vector-index" author="developer">
        <sql>
            CREATE INDEX IF NOT EXISTS documents_embedding_hnsw_idx 
            ON documents 
            USING hnsw (embedding vector_cosine_ops)
            WITH (m = 16, ef_construction = 64);
        </sql>
    </changeSet>
</databaseChangeLog>
```

## Performance Tuning

### HNSW Parameters

**For High Accuracy:**
```sql
CREATE INDEX documents_embedding_idx 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 32, ef_construction = 128);
```

**For Faster Build:**
```sql
CREATE INDEX documents_embedding_idx 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 8, ef_construction = 32);
```

### Query-Time Parameters

**Set ef_search for better recall:**
```sql
SET hnsw.ef_search = 100;  -- Default is 40

SELECT * FROM documents
ORDER BY embedding <=> '[0.1,0.2,...]'::vector
LIMIT 10;
```

## Index Maintenance

### Rebuilding Index

```sql
-- Drop and recreate
DROP INDEX documents_embedding_hnsw_idx;
CREATE INDEX documents_embedding_hnsw_idx 
ON documents 
USING hnsw (embedding vector_cosine_ops);
```

### Concurrent Index Creation

```sql
-- Non-blocking index creation
CREATE INDEX CONCURRENTLY documents_embedding_hnsw_idx 
ON documents 
USING hnsw (embedding vector_cosine_ops);
```

## Best Practices

1. ✅ **Use HNSW for production** (better query performance)
2. ✅ **Build index after data load** (faster build)
3. ✅ **Tune parameters** based on dataset size
4. ✅ **Monitor index size** and performance
5. ✅ **Use CONCURRENTLY** for production indexes

## Summary

Vector indexes enable:
- ✅ Fast similarity search
- ✅ Scalable to millions of vectors
- ✅ Efficient query performance

Create indexes to optimize vector search performance!

