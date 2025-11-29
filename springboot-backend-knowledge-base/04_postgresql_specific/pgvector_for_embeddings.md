# pgvector for Embeddings in Spring Boot

pgvector enables storing and searching vector embeddings in PostgreSQL. This guide shows how to use it effectively in Spring Boot applications.

## What Are Embeddings?

**Embeddings:** Numerical representations of text, images, or other data that capture semantic meaning.

**Example:**
- "dog" → [0.2, 0.8, 0.1, ...] (1536 numbers)
- "puppy" → [0.21, 0.79, 0.12, ...] (similar numbers)
- "airplane" → [0.9, 0.1, 0.8, ...] (different numbers)

**Why embeddings matter:**
- Semantic search (meaning-based, not keyword-based)
- Similarity matching
- Recommendation systems

## Setup

### Enable pgvector Extension

**Migration (Flyway):**
```sql
-- V1__Enable_vector_extension.sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Migration (Liquibase):**
```xml
<changeSet id="enable-vector" author="developer">
    <sql>CREATE EXTENSION IF NOT EXISTS vector;</sql>
</changeSet>
```

### Entity with Vector Column

**Using Custom Type Handler:**
```java
@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "embedding", columnDefinition = "vector(1536)")
    private float[] embedding;
}
```

**Custom Converter:**
```java
@Converter
public class VectorConverter implements AttributeConverter<float[], String> {
    
    @Override
    public String convertToDatabaseColumn(float[] attribute) {
        if (attribute == null) return null;
        return "[" + Arrays.stream(attribute)
            .mapToObj(String::valueOf)
            .collect(Collectors.joining(",")) + "]";
    }
    
    @Override
    public float[] convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        String cleaned = dbData.replaceAll("[\\[\\]\\s]", "");
        return Arrays.stream(cleaned.split(","))
            .mapToFloat(Float::parseFloat)
            .toArray();
    }
}
```

## Similarity Search

### Query with Cosine Distance

**Native Query:**
```java
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    @Query(value = """
        SELECT *, 
               1 - (embedding <=> CAST(:queryVector AS vector)) AS similarity
        FROM documents
        ORDER BY embedding <=> CAST(:queryVector AS vector)
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findSimilar(@Param("queryVector") String queryVector, 
                                @Param("limit") int limit);
}
```

**Using JDBC Template:**
```java
@Service
public class DocumentService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public List<Document> searchSimilar(float[] queryEmbedding, int limit) {
        String vectorStr = vectorToString(queryEmbedding);
        
        String sql = """
            SELECT *, 
                   1 - (embedding <=> CAST(? AS vector)) AS similarity
            FROM documents
            ORDER BY embedding <=> CAST(? AS vector)
            LIMIT ?
            """;
        
        return jdbcTemplate.query(sql, 
            new Object[]{vectorStr, vectorStr, limit},
            documentRowMapper);
    }
    
    private String vectorToString(float[] vector) {
        return "[" + Arrays.stream(vector)
            .mapToObj(String::valueOf)
            .collect(Collectors.joining(",")) + "]";
    }
}
```

## Vector Index Creation

### HNSW Index (Recommended)

**Migration:**
```sql
-- V2__Create_vector_index.sql
CREATE INDEX ON documents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

**Parameters:**
- `m = 16`: Connections per node
- `ef_construction = 64`: Quality during build

### IVFFlat Index (Alternative)

```sql
CREATE INDEX ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

## Complete Example

```java
@Service
public class EmbeddingService {
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @Autowired
    private EmbeddingClient embeddingClient;
    
    @Transactional
    public Document createDocument(String content) {
        // Generate embedding
        float[] embedding = embeddingClient.generateEmbedding(content);
        
        Document document = new Document();
        document.setContent(content);
        document.setEmbedding(embedding);
        
        return documentRepository.save(document);
    }
    
    public List<Document> searchSimilar(String query, int limit) {
        float[] queryEmbedding = embeddingClient.generateEmbedding(query);
        String vectorStr = vectorToString(queryEmbedding);
        
        return documentRepository.findSimilar(vectorStr, limit);
    }
}
```

## Best Practices

1. ✅ **Use HNSW index** for large datasets
2. ✅ **Match embedding dimensions** (1536 for OpenAI)
3. ✅ **Use cosine distance** for text embeddings
4. ✅ **Batch insert** for multiple embeddings
5. ✅ **Monitor index build time**

## Summary

pgvector provides:
- ✅ Vector storage in PostgreSQL
- ✅ Efficient similarity search
- ✅ Transaction consistency
- ✅ SQL integration

Use pgvector for semantic search and AI-powered features!

