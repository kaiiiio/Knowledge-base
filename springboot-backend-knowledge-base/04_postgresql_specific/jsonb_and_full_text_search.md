# JSONB and Full-Text Search in PostgreSQL with Spring Boot

PostgreSQL's JSONB and full-text search capabilities are powerful features. This guide shows how to use them effectively in Spring Boot.

## JSONB in PostgreSQL

### What is JSONB?

**JSONB (JSON Binary):**
- Binary format for JSON data
- Indexed and queryable
- More efficient than JSON
- Supports operators and functions

### Entity Mapping

**Using @Type from Hibernate:**
```java
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> attributes;
    
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> tags;
}
```

**Using JPA Attribute Converter:**
```java
@Converter
public class JsonConverter implements AttributeConverter<Map<String, Object>, String> {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public String convertToDatabaseColumn(Map<String, Object> attribute) {
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    
    @Override
    public Map<String, Object> convertToEntityAttribute(String dbData) {
        try {
            return objectMapper.readValue(dbData, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

@Entity
public class Product {
    @Convert(converter = JsonConverter.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> attributes;
}
```

### Querying JSONB

**Native Query:**
```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    @Query(value = "SELECT * FROM products WHERE attributes->>'color' = :color", nativeQuery = true)
    List<Product> findByColor(@Param("color") String color);
    
    @Query(value = "SELECT * FROM products WHERE attributes->>'price'::numeric > :minPrice", nativeQuery = true)
    List<Product> findByMinPrice(@Param("minPrice") BigDecimal minPrice);
    
    @Query(value = "SELECT * FROM products WHERE attributes @> '{\"category\": \"electronics\"}'::jsonb", nativeQuery = true)
    List<Product> findByCategory(String category);
}
```

**Using Criteria API:**
```java
@Service
public class ProductService {
    
    @Autowired
    private EntityManager entityManager;
    
    public List<Product> findProductsByJsonAttribute(String key, String value) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Product> query = cb.createQuery(Product.class);
        Root<Product> root = query.from(Product.class);
        
        // Use native function
        Expression<String> jsonValue = cb.function(
            "jsonb_extract_path_text",
            String.class,
            root.get("attributes"),
            cb.literal(key)
        );
        
        query.where(cb.equal(jsonValue, value));
        
        return entityManager.createQuery(query).getResultList();
    }
}
```

## Full-Text Search

### Setting Up Full-Text Search

**Create Index:**
```sql
-- Migration
CREATE INDEX idx_products_name_search ON products 
USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

**Entity with Full-Text Search:**
```java
@Entity
@Table(name = "products",
    indexes = @Index(name = "idx_products_search", columnList = "search_vector"))
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    
    @Column(name = "search_vector", columnDefinition = "tsvector")
    private String searchVector;
    
    @PrePersist
    @PreUpdate
    public void updateSearchVector() {
        // This will be handled by database trigger or manual update
    }
}
```

### Querying with Full-Text Search

**Native Query:**
```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    @Query(value = """
        SELECT *, ts_rank(search_vector, query) AS rank
        FROM products, to_tsquery('english', :searchTerm) query
        WHERE search_vector @@ query
        ORDER BY rank DESC
        """, nativeQuery = true)
    List<Product> fullTextSearch(@Param("searchTerm") String searchTerm);
    
    @Query(value = """
        SELECT * FROM products
        WHERE to_tsvector('english', name || ' ' || COALESCE(description, '')) 
        @@ plainto_tsquery('english', :query)
        """, nativeQuery = true)
    List<Product> searchProducts(@Param("query") String query);
}
```

**Using Full-Text Search Functions:**
```java
@Service
public class ProductService {
    
    @Autowired
    private EntityManager entityManager;
    
    public List<ProductSearchResult> search(String query) {
        String sql = """
            SELECT 
                id,
                name,
                description,
                ts_rank(search_vector, plainto_tsquery('english', :query)) AS rank
            FROM products
            WHERE search_vector @@ plainto_tsquery('english', :query)
            ORDER BY rank DESC
            LIMIT 20
            """;
        
        Query nativeQuery = entityManager.createNativeQuery(sql, "ProductSearchMapping");
        nativeQuery.setParameter("query", query);
        
        return nativeQuery.getResultList();
    }
}
```

### Combined JSONB and Full-Text Search

```java
@Query(value = """
    SELECT * FROM products
    WHERE search_vector @@ plainto_tsquery('english', :query)
    AND attributes->>'category' = :category
    ORDER BY ts_rank(search_vector, plainto_tsquery('english', :query)) DESC
    """, nativeQuery = true)
List<Product> searchByCategoryAndQuery(@Param("query") String query, 
                                       @Param("category") String category);
```

## Best Practices

1. ✅ **Index JSONB columns** for frequently queried fields
2. ✅ **Use GIN indexes** for full-text search
3. ✅ **Normalize data structure** when possible
4. ✅ **Use prepared statements** for security
5. ✅ **Consider materialized views** for complex queries

## Summary

PostgreSQL JSONB and full-text search provide:
- ✅ Flexible schema with JSONB
- ✅ Powerful search capabilities
- ✅ Efficient indexing
- ✅ Rich query operators

Use these features for flexible data models and advanced search functionality!

