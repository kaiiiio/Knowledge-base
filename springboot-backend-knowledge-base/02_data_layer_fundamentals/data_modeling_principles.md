# Data Modeling Principles for Spring Boot Applications

Effective data modeling is crucial for building maintainable, scalable Spring Boot applications. This guide covers fundamental principles, patterns, and best practices.

## Understanding Data Modeling

**What is Data Modeling?**
The process of designing database structures that efficiently store and retrieve data while maintaining integrity and supporting business requirements.

**Key Goals:**
- Represent business entities accurately
- Ensure data integrity
- Optimize for performance
- Maintain flexibility for future changes

## Core Principles

### 1. Normalization vs Denormalization

#### Normalization (Eliminate Redundancy)

**Principle:** Store each piece of information once.

**Example: Normalized Design**

```java
// Users table
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    private String name;
}

// Orders table (references user)
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private BigDecimal totalAmount;
}
```

**Benefits:**
- ✅ No data duplication
- ✅ Single source of truth
- ✅ Easier updates
- ✅ Less storage

**Drawbacks:**
- ⚠️ More joins needed
- ⚠️ Potential performance impact

#### Denormalization (Optimize Reads)

**Principle:** Store redundant data to optimize read performance.

**Example: Denormalized Design**

```java
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private Long userId;
    
    // Denormalized: Store user name for quick access
    @Column(name = "user_name")
    private String userName;
    
    private BigDecimal totalAmount;
}
```

**Benefits:**
- ✅ Faster reads (fewer joins)
- ✅ Better query performance

**Drawbacks:**
- ❌ Data duplication
- ❌ Update complexity
- ❌ Storage overhead

**When to Denormalize:**
- Read-heavy workloads
- Reporting/analytics tables
- Materialized views
- Search optimization

### 2. Idempotency Keys

**Problem:** Prevent duplicate processing of the same operation.

**Solution:** Use idempotency keys.

```java
@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Idempotency key - unique constraint
    @Column(name = "idempotency_key", unique = true, nullable = false)
    private String idempotencyKey;
    
    private BigDecimal amount;
    private String status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

**Usage:**
```java
@Service
@Transactional
public class PaymentService {
    
    public Payment processPayment(PaymentRequest request) {
        // Check if already processed
        Optional<Payment> existing = paymentRepository
            .findByIdempotencyKey(request.getIdempotencyKey());
        
        if (existing.isPresent()) {
            return existing.get();  // Return existing, don't duplicate
        }
        
        // Create new payment
        Payment payment = new Payment();
        payment.setIdempotencyKey(request.getIdempotencyKey());
        payment.setAmount(request.getAmount());
        payment.setStatus("PENDING");
        
        return paymentRepository.save(payment);
    }
}
```

### 3. Soft Deletes

**Problem:** Need to "delete" records but maintain history and referential integrity.

**Solution:** Soft delete pattern.

```java
@Entity
@Table(name = "users")
@SQLDelete(sql = "UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    private String name;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    public boolean isDeleted() {
        return deletedAt != null;
    }
}
```

**Benefits:**
- ✅ Maintains referential integrity
- ✅ Audit trail
- ✅ Can restore deleted records
- ✅ Historical data preservation

### 4. Audit Fields

Track who created/modified records and when.

```java
@Entity
@Table(name = "products")
@EntityListeners(AuditingEntityListener.class)
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private BigDecimal price;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @CreatedBy
    @Column(name = "created_by")
    private String createdBy;
    
    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;
}
```

**Enable Auditing:**

```java
@Configuration
@EnableJpaAuditing
public class JpaConfig {
    @Bean
    public AuditorAware<String> auditorProvider() {
        return new SecurityAuditorAware();  // Get current user from security context
    }
}
```

## Common Patterns

### 1. Timestamps Pattern

```java
@Entity
public abstract class BaseEntity {
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

@Entity
@Table(name = "users")
public class User extends BaseEntity {
    @Id
    private Long id;
    // ... other fields
}
```

### 2. Versioning Pattern

```java
@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String content;
    
    @Version  // Optimistic locking
    private Long version;
}
```

**Usage:**
```java
// First update
Document doc = documentRepository.findById(1L).orElseThrow();
doc.setContent("Updated content");
documentRepository.save(doc);  // version = 1

// Concurrent update
Document doc2 = documentRepository.findById(1L).orElseThrow();
doc2.setContent("Different content");
// Throws OptimisticLockingFailureException if version changed
```

### 3. Status Pattern

```java
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;
    
    @Column(name = "status_changed_at")
    private LocalDateTime statusChangedAt;
}

public enum OrderStatus {
    PENDING,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
```

### 4. Polymorphic Associations

```java
// Base class
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "payments")
public abstract class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private BigDecimal amount;
}

// Credit card payment
@Entity
@Table(name = "credit_card_payments")
@PrimaryKeyJoinColumn(name = "payment_id")
public class CreditCardPayment extends Payment {
    private String cardNumber;
    private String cardHolderName;
}

// Bank transfer payment
@Entity
@Table(name = "bank_transfer_payments")
@PrimaryKeyJoinColumn(name = "payment_id")
public class BankTransferPayment extends Payment {
    private String accountNumber;
    private String bankName;
}
```

## Best Practices

### 1. Use Appropriate Data Types

```java
@Entity
public class User {
    // ✅ Good
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Use Long for IDs
    
    @Column(length = 255)  // Explicit length
    private String email;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal balance;  // For money
    
    private LocalDateTime createdAt;  // For timestamps
    private LocalDate birthDate;  // For dates only
    
    // ❌ Bad
    private Integer id;  // Can overflow
    private String balance;  // Not appropriate for money
    private Date createdAt;  // Old API, use LocalDateTime
}
```

### 2. Use Indexes Strategically

```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true),
    @Index(name = "idx_user_created_at", columnList = "created_at"),
    @Index(name = "idx_user_status", columnList = "status")
})
public class User {
    @Column(nullable = false, unique = true)
    private String email;  // Unique index
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;  // Indexed for sorting
    
    private String status;  // Indexed for filtering
}
```

### 3. Naming Conventions

```java
@Entity
@Table(name = "user_profiles")  // Snake case for table names
public class UserProfile {
    
    @Column(name = "first_name")  // Snake case for column names
    private String firstName;  // Camel case for Java fields
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### 4. Relationship Modeling

**One-to-Many:**
```java
@Entity
public class User {
    @Id
    private Long id;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders = new ArrayList<>();
}

@Entity
public class Order {
    @Id
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
```

**Many-to-Many:**
```java
@Entity
public class User {
    @Id
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
public class Role {
    @Id
    private Long id;
    
    @ManyToMany(mappedBy = "roles")
    private Set<User> users = new HashSet<>();
}
```

## Summary

Data modeling principles:

1. **Normalize for integrity**, denormalize for performance
2. **Use idempotency keys** for duplicate prevention
3. **Implement soft deletes** for data preservation
4. **Add audit fields** for tracking changes
5. **Use appropriate data types** and indexes
6. **Follow naming conventions** consistently

Following these principles leads to:
- ✅ Better data integrity
- ✅ Improved performance
- ✅ Easier maintenance
- ✅ Scalable architecture

Good data modeling is the foundation of robust Spring Boot applications!

