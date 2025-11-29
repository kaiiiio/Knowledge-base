# Advanced Querying in Spring Boot JPA

This guide covers advanced querying techniques for complex data retrieval using Spring Data JPA and native queries.

## Join Queries

### Inner Join

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Query("SELECT u, o FROM User u INNER JOIN u.orders o")
    List<Object[]> findUsersWithOrders();
    
    @Query("SELECT u FROM User u JOIN u.orders o WHERE o.totalAmount > :minAmount")
    List<User> findUsersWithLargeOrders(@Param("minAmount") BigDecimal minAmount);
}
```

### Left Outer Join

```java
@Query("SELECT u, o FROM User u LEFT JOIN u.orders o")
List<Object[]> findAllUsersWithOrders();

@Query("SELECT u FROM User u LEFT JOIN u.orders o WHERE o IS NULL")
List<User> findUsersWithoutOrders();
```

### Multiple Joins

```java
@Query("""
    SELECT u, o, oi, p 
    FROM User u 
    JOIN u.orders o 
    JOIN o.items oi 
    JOIN oi.product p
    WHERE p.price > :minPrice
    """)
List<Object[]> findUsersWithExpensiveProducts(@Param("minPrice") BigDecimal minPrice);
```

## Aggregations

### Group By

```java
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    @Query("""
        SELECT u.email, COUNT(o.id) as orderCount, SUM(o.totalAmount) as totalSpent
        FROM User u
        JOIN u.orders o
        GROUP BY u.id, u.email
        """)
    List<Object[]> getUserOrderStatistics();
}

// Using Projection
public interface UserOrderStats {
    String getEmail();
    Long getOrderCount();
    BigDecimal getTotalSpent();
}

@Query("""
    SELECT u.email as email, 
           COUNT(o.id) as orderCount, 
           SUM(o.totalAmount) as totalSpent
    FROM User u
    JOIN u.orders o
    GROUP BY u.id, u.email
    """)
List<UserOrderStats> getUserOrderStatisticsProjection();
```

### Having Clause

```java
@Query("""
    SELECT u.email, COUNT(o.id) as orderCount
    FROM User u
    JOIN u.orders o
    GROUP BY u.id, u.email
    HAVING COUNT(o.id) > :minOrders
    """)
List<Object[]> findUsersWithManyOrders(@Param("minOrders") long minOrders);
```

## Subqueries

### Scalar Subquery

```java
@Query("""
    SELECT u, 
           (SELECT MAX(o.totalAmount) FROM Order o WHERE o.user = u) as maxOrderAmount
    FROM User u
    """)
List<Object[]> findUsersWithMaxOrderAmount();
```

### Correlated Subquery

```java
@Query("""
    SELECT u FROM User u
    WHERE (SELECT COUNT(o) FROM Order o WHERE o.user = u) > :minOrderCount
    """)
List<User> findUsersWithManyOrders(@Param("minOrderCount") long minOrderCount);
```

## Common Table Expressions (CTEs)

### Using Native Query with CTE

```java
@Query(value = """
    WITH monthly_stats AS (
        SELECT 
            DATE_TRUNC('month', created_at) as month,
            COUNT(*) as order_count,
            SUM(total_amount) as revenue
        FROM orders
        GROUP BY DATE_TRUNC('month', created_at)
    )
    SELECT month, order_count, revenue
    FROM monthly_stats
    ORDER BY month
    """, nativeQuery = true)
List<Object[]> getMonthlyStatistics();
```

## Window Functions

### Using Native Query

```java
@Query(value = """
    SELECT 
        u.id,
        u.email,
        o.total_amount,
        ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY o.total_amount DESC) as order_rank
    FROM users u
    JOIN orders o ON u.id = o.user_id
    """, nativeQuery = true)
List<Object[]> getUserOrdersRanked();
```

## Dynamic Queries with Specifications

```java
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
}

// Service layer
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<User> searchUsers(SearchCriteria criteria) {
        Specification<User> spec = Specification.where(null);
        
        if (criteria.getEmail() != null) {
            spec = spec.and((root, query, cb) -> 
                cb.like(root.get("email"), "%" + criteria.getEmail() + "%"));
        }
        
        if (criteria.getMinAge() != null) {
            spec = spec.and((root, query, cb) -> 
                cb.greaterThan(root.get("age"), criteria.getMinAge()));
        }
        
        if (criteria.getStatus() != null) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("status"), criteria.getStatus()));
        }
        
        return userRepository.findAll(spec);
    }
}
```

## Criteria API

```java
@Service
public class UserService {
    
    @Autowired
    private EntityManager entityManager;
    
    public List<User> findUsers(Criteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<User> query = cb.createQuery(User.class);
        Root<User> root = query.from(User.class);
        
        List<Predicate> predicates = new ArrayList<>();
        
        if (criteria.getEmail() != null) {
            predicates.add(cb.like(root.get("email"), "%" + criteria.getEmail() + "%"));
        }
        
        if (criteria.getMinAge() != null) {
            predicates.add(cb.greaterThan(root.get("age"), criteria.getMinAge()));
        }
        
        query.where(predicates.toArray(new Predicate[0]));
        query.orderBy(cb.desc(root.get("createdAt")));
        
        return entityManager.createQuery(query).getResultList();
    }
}
```

## Best Practices

1. ✅ Use JPQL for type-safe queries
2. ✅ Use native queries only when necessary
3. ✅ Use Specifications for dynamic queries
4. ✅ Use projections for read-only data
5. ✅ Index frequently queried columns
6. ✅ Avoid N+1 queries with fetch joins

## Summary

Advanced querying techniques:
- Joins for related data
- Aggregations and grouping
- Subqueries for complex logic
- CTEs for readability
- Window functions for rankings
- Specifications for dynamic queries

Use these techniques for efficient, complex data retrieval!

