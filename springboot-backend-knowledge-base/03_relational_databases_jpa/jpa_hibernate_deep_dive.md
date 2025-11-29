# JPA Hibernate Deep Dive: Complete Guide

JPA (Java Persistence API) with Hibernate is the standard way to work with relational databases in Spring Boot. This comprehensive guide covers everything from basics to advanced patterns.

## Understanding JPA and Hibernate

### What is JPA?

**JPA (Java Persistence API):** Specification for managing relational data in Java applications.

**Hibernate:** Most popular JPA implementation.

**Relationship:**
- JPA = Interface/specification
- Hibernate = Implementation

### Core Concepts

**Entity:** Java class mapped to database table
**Persistence Context:** Set of managed entity instances
**EntityManager:** Interface for interacting with persistence context
**Repository:** Spring Data abstraction over JPA

## Basic Entity Mapping

### Simple Entity

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "email", nullable = false, unique = true)
    private String email;
    
    @Column(name = "name")
    private String name;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

**Annotations Explained:**
- `@Entity` - Marks class as JPA entity
- `@Table` - Maps to specific table name
- `@Id` - Primary key
- `@GeneratedValue` - Auto-generation strategy
- `@Column` - Column mapping

### Generation Strategies

```java
// IDENTITY - Database auto-increment (MySQL, PostgreSQL)
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

// SEQUENCE - Database sequence (PostgreSQL, Oracle)
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
@SequenceGenerator(name = "user_seq", sequenceName = "user_sequence", allocationSize = 1)
private Long id;

// TABLE - Uses database table to generate IDs
@Id
@GeneratedValue(strategy = GenerationType.TABLE, generator = "user_gen")
@TableGenerator(name = "user_gen", table = "id_generator", pkColumnName = "gen_name", valueColumnName = "gen_value")
private Long id;

// UUID - Application-generated UUID
@Id
@GeneratedValue(generator = "UUID")
@GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
private UUID id;
```

## Relationships

### One-to-Many

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();
}

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private BigDecimal totalAmount;
}
```

### Many-to-Many

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToMany
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
}

@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToMany(mappedBy = "roles")
    private Set<User> users = new HashSet<>();
}
```

### One-to-One

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserProfile profile;
}

@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
    
    private String bio;
}
```

## Spring Data JPA Repositories

### Basic Repository

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA automatically implements:
    // - save(User)
    // - findById(Long)
    // - findAll()
    // - delete(User)
    // - count()
}
```

### Query Methods

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Method name → Query
    Optional<User> findByEmail(String email);
    
    List<User> findByAgeGreaterThan(int age);
    
    List<User> findByNameContainingIgnoreCase(String name);
    
    boolean existsByEmail(String email);
    
    long countByStatus(String status);
    
    List<User> findByEmailAndStatus(String email, String status);
    
    List<User> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
```

### Custom Queries

**JPQL (Java Persistence Query Language):**
```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Query("SELECT u FROM User u WHERE u.age > :minAge")
    List<User> findAdults(@Param("minAge") int minAge);
    
    @Query("SELECT u FROM User u WHERE u.email LIKE %:domain%")
    List<User> findByEmailDomain(@Param("domain") String domain);
    
    @Modifying
    @Query("UPDATE User u SET u.status = :status WHERE u.id = :id")
    void updateStatus(@Param("id") Long id, @Param("status") String status);
}
```

**Native SQL:**
```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Query(value = "SELECT * FROM users WHERE age > :minAge", nativeQuery = true)
    List<User> findAdultsNative(@Param("minAge") int minAge);
    
    @Query(value = "SELECT COUNT(*) FROM users WHERE status = :status", nativeQuery = true)
    long countByStatusNative(@Param("status") String status);
}
```

## Advanced Querying

### Specifications (Dynamic Queries)

```java
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    // Can now use Specifications
}

// Usage
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<User> searchUsers(String email, Integer minAge, String status) {
        Specification<User> spec = Specification.where(null);
        
        if (email != null) {
            spec = spec.and((root, query, cb) -> 
                cb.like(root.get("email"), "%" + email + "%"));
        }
        
        if (minAge != null) {
            spec = spec.and((root, query, cb) -> 
                cb.greaterThan(root.get("age"), minAge));
        }
        
        if (status != null) {
            spec = spec.and((root, query, cb) -> 
                cb.equal(root.get("status"), status));
        }
        
        return userRepository.findAll(spec);
    }
}
```

### Criteria API

```java
@Service
public class UserService {
    
    @Autowired
    private EntityManager entityManager;
    
    public List<User> findUsers(SearchCriteria criteria) {
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
        
        return entityManager.createQuery(query).getResultList();
    }
}
```

## Eager vs Lazy Loading

### Lazy Loading (Default)

```java
@Entity
public class User {
    @OneToMany(fetch = FetchType.LAZY)  // Default
    private List<Order> orders;
}

// Usage
User user = userRepository.findById(1L).orElseThrow();
// Orders not loaded yet

List<Order> orders = user.getOrders();  // Triggers query (if session still open)
```

**Benefits:**
- ✅ Loads only what you need
- ✅ Better performance
- ✅ Less memory usage

**Pitfalls:**
- ⚠️ LazyInitializationException if session closed

### Eager Loading

```java
@Entity
public class User {
    @OneToMany(fetch = FetchType.EAGER)
    private List<Order> orders;  // Always loaded
}

// Usage
User user = userRepository.findById(1L).orElseThrow();
List<Order> orders = user.getOrders();  // Already loaded
```

**Use sparingly** - Can cause N+1 query problems!

### Fetch Joins

```java
@Query("SELECT u FROM User u JOIN FETCH u.orders WHERE u.id = :id")
Optional<User> findByIdWithOrders(@Param("id") Long id);

// Or using entity graph
@EntityGraph(attributePaths = {"orders"})
Optional<User> findById(Long id);
```

## Performance Optimization

### N+1 Query Problem

**Problem:**
```java
List<User> users = userRepository.findAll();
for (User user : users) {
    user.getOrders();  // N queries - one per user!
}
```

**Solution 1: Fetch Join**
```java
@Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.orders")
List<User> findAllWithOrders();
```

**Solution 2: Entity Graph**
```java
@EntityGraph(attributePaths = {"orders"})
List<User> findAll();
```

**Solution 3: Batch Fetching**
```properties
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
```

### Pagination

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Page<User> findByStatus(String status, Pageable pageable);
    
    Slice<User> findByAgeGreaterThan(int age, Pageable pageable);
}

// Usage
@Service
public class UserService {
    
    public Page<UserResponse> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> users = userRepository.findAll(pageable);
        
        return users.map(user -> mapToResponse(user));
    }
}
```

### Projections

**Interface-based Projection:**
```java
public interface UserSummary {
    String getEmail();
    String getName();
    int getOrderCount();
}

public interface UserRepository extends JpaRepository<User, Long> {
    List<UserSummary> findByStatus(String status);
}
```

**DTO Projection:**
```java
public record UserDTO(Long id, String email, String name) {}

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT new com.example.dto.UserDTO(u.id, u.email, u.name) FROM User u")
    List<UserDTO> findAllAsDTO();
}
```

## Best Practices

1. ✅ Use `@Transactional` for write operations
2. ✅ Keep entities simple - business logic in services
3. ✅ Use lazy loading by default
4. ✅ Avoid N+1 queries with fetch joins
5. ✅ Use pagination for large datasets
6. ✅ Index frequently queried columns

## Summary

JPA/Hibernate provides:
- ✅ Object-relational mapping
- ✅ Type-safe queries
- ✅ Relationship management
- ✅ Automatic SQL generation

Master JPA to build efficient data access layers in Spring Boot!

