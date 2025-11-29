# Array and Enum Types in PostgreSQL with Spring Boot

PostgreSQL supports native array and enum types. This guide shows how to use them effectively in Spring Boot applications.

## Array Types

### Entity with Array Column

**Using @Type:**
```java
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Type(IntArrayType.class)
    @Column(name = "category_ids", columnDefinition = "integer[]")
    private Integer[] categoryIds;
    
    @Type(StringArrayType.class)
    @Column(name = "tags", columnDefinition = "text[]")
    private String[] tags;
}
```

**Custom Array Type:**
```java
public class StringArrayType implements UserType<String[]> {
    
    @Override
    public int[] sqlTypes() {
        return new int[]{Types.ARRAY};
    }
    
    @Override
    public Class<String[]> returnedClass() {
        return String[].class;
    }
    
    @Override
    public Object nullSafeGet(ResultSet rs, String[] names, SessionImplementor session, Object owner) 
            throws SQLException {
        Array array = rs.getArray(names[0]);
        return array != null ? (String[]) array.getArray() : null;
    }
    
    @Override
    public void nullSafeSet(PreparedStatement st, String[] value, int index, SessionImplementor session) 
            throws SQLException {
        if (value != null) {
            Array array = st.getConnection().createArrayOf("text", value);
            st.setArray(index, array);
        } else {
            st.setNull(index, Types.ARRAY);
        }
    }
}
```

### Querying Arrays

**Native Query:**
```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    @Query(value = "SELECT * FROM products WHERE :tag = ANY(tags)", nativeQuery = true)
    List<Product> findByTag(@Param("tag") String tag);
    
    @Query(value = "SELECT * FROM products WHERE array_length(tags, 1) > :minTags", nativeQuery = true)
    List<Product> findByMinTags(@Param("minTags") int minTags);
    
    @Query(value = "SELECT * FROM products WHERE tags && ARRAY[:tags]::text[]", nativeQuery = true)
    List<Product> findByAnyTag(@Param("tags") String[] tags);
}
```

**Using JDBC:**
```java
@Service
public class ProductService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    public List<Product> findProductsWithTag(String tag) {
        String sql = "SELECT * FROM products WHERE ? = ANY(tags)";
        return jdbcTemplate.query(sql, new Object[]{tag}, productRowMapper);
    }
}
```

## Enum Types

### Creating Enum Type

**Migration:**
```sql
-- Create enum type
CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- Use in table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    status order_status NOT NULL DEFAULT 'PENDING'
);
```

### Entity Mapping

**Using @Enumerated:**
```java
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "order_status")
    private OrderStatus status;
}

public enum OrderStatus {
    PENDING,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
```

**Custom Type:**
```java
@Type(type = "pgsql_enum")
@Column(name = "status", columnDefinition = "order_status")
private OrderStatus status;
```

### Querying Enums

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(OrderStatus status);
    
    @Query(value = "SELECT * FROM orders WHERE status = CAST(:status AS order_status)", nativeQuery = true)
    List<Order> findByStatusNative(@Param("status") String status);
}
```

## Best Practices

1. ✅ **Use arrays for simple lists** (tags, categories)
2. ✅ **Use enums for fixed sets** (status, type)
3. ✅ **Index array columns** when querying frequently
4. ✅ **Consider JSONB** for complex nested structures
5. ✅ **Use native queries** for complex array operations

## Summary

PostgreSQL arrays and enums provide:
- ✅ Native type support
- ✅ Efficient storage
- ✅ Powerful querying
- ✅ Type safety

Use arrays and enums for efficient data modeling!

