# Hybrid Search: Combining SQL and Vector Search

Hybrid search combines traditional SQL filtering with vector similarity search. This guide shows how to implement it in Spring Boot.

## What is Hybrid Search?

**Hybrid search = SQL filters + Vector similarity**

**Benefits:**
- Filter by metadata (SQL)
- Find by similarity (Vector)
- Best of both worlds

**Example:** Find products similar to a query that are in stock and under $100.

## Implementation

### Query Structure

```java
@Service
public class ProductService {
    
    @Autowired
    private EntityManager entityManager;
    
    public List<Product> hybridSearch(
            String queryText,
            float[] queryEmbedding,
            String category,
            BigDecimal maxPrice,
            int limit) {
        
        String sql = """
            SELECT p.*,
                   1 - (p.embedding <=> CAST(:embedding AS vector)) AS similarity
            FROM products p
            WHERE p.category = :category
            AND p.price <= :maxPrice
            AND p.stock > 0
            AND p.embedding <=> CAST(:embedding AS vector) < 0.5
            ORDER BY similarity DESC, p.price ASC
            LIMIT :limit
            """;
        
        Query query = entityManager.createNativeQuery(sql, Product.class);
        query.setParameter("embedding", vectorToString(queryEmbedding));
        query.setParameter("category", category);
        query.setParameter("maxPrice", maxPrice);
        query.setParameter("limit", limit);
        
        return query.getResultList();
    }
}
```

### Weighted Hybrid Search

```java
public List<Product> weightedHybridSearch(
        String queryText,
        float[] queryEmbedding,
        double vectorWeight,
        double textWeight) {
    
    String sql = """
        SELECT p.*,
               (:vectorWeight * (1 - (p.embedding <=> CAST(:embedding AS vector)))) +
               (:textWeight * ts_rank(p.search_vector, plainto_tsquery('english', :query)))
               AS combined_score
        FROM products p
        WHERE p.embedding <=> CAST(:embedding AS vector) < 0.8
        OR p.search_vector @@ plainto_tsquery('english', :query)
        ORDER BY combined_score DESC
        LIMIT 20
        """;
    
    // Execute query...
}
```

### Repository Pattern

```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    @Query(value = """
        SELECT p.*,
               1 - (p.embedding <=> CAST(:embedding AS vector)) AS similarity
        FROM products p
        WHERE p.category = :category
        AND p.price <= :maxPrice
        AND p.embedding <=> CAST(:embedding AS vector) < :maxDistance
        ORDER BY similarity DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> hybridSearch(
            @Param("embedding") String embedding,
            @Param("category") String category,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("maxDistance") double maxDistance,
            @Param("limit") int limit);
}
```

## Best Practices

1. ✅ **Index both SQL and vector columns**
2. ✅ **Use filters first** (reduces vector search space)
3. ✅ **Tune similarity thresholds**
4. ✅ **Combine with full-text search** when appropriate
5. ✅ **Monitor query performance**

## Summary

Hybrid search provides:
- ✅ SQL filtering + Vector similarity
- ✅ Flexible querying
- ✅ Best of both approaches

Use hybrid search for complex search requirements!

