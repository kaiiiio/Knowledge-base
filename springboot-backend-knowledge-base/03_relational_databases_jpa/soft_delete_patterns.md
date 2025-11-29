# Soft Delete Patterns in Spring Boot

Soft deletes allow you to "delete" records while preserving them in the database. This guide covers implementation patterns, query filtering, and best practices.

## Understanding Soft Deletes

### Hard Delete vs Soft Delete

**Hard Delete:**
```java
userRepository.delete(user);  // Permanently removes from database
```

**Soft Delete:**
```java
user.setDeletedAt(LocalDateTime.now());  // Marks as deleted, keeps in database
userRepository.save(user);
```

**Benefits of Soft Delete:**
- ✅ Audit trail
- ✅ Data recovery
- ✅ Referential integrity
- ✅ Historical analysis

## Implementation Approaches

### Approach 1: Using @SQLDelete and @Where

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

**Usage:**
```java
// Automatically filters deleted records
List<User> users = userRepository.findAll();  // Only active users

// Delete soft deletes
userRepository.delete(user);  // Sets deleted_at, doesn't actually delete

// To find deleted records
@Query("SELECT u FROM User u WHERE u.deletedAt IS NOT NULL")
List<User> findDeletedUsers();
```

### Approach 2: Base Entity with Soft Delete

```java
@MappedSuperclass
public abstract class SoftDeletableEntity {
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @Column(name = "deleted_by")
    private String deletedBy;
    
    public boolean isDeleted() {
        return deletedAt != null;
    }
    
    public void softDelete(String deletedBy) {
        this.deletedAt = LocalDateTime.now();
        this.deletedBy = deletedBy;
    }
    
    public void restore() {
        this.deletedAt = null;
        this.deletedBy = null;
    }
}

// Use in entities
@Entity
@Table(name = "users")
@SQLDelete(sql = "UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class User extends SoftDeletableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    private String name;
}
```

### Approach 3: Custom Repository Filter

```java
public interface SoftDeletableRepository<T, ID> extends JpaRepository<T, ID> {
    
    @Modifying
    @Query("UPDATE #{#entityName} e SET e.deletedAt = CURRENT_TIMESTAMP WHERE e.id = :id")
    void softDelete(@Param("id") ID id);
    
    @Query("SELECT e FROM #{#entityName} e WHERE e.deletedAt IS NOT NULL")
    List<T> findDeleted();
    
    @Query("SELECT e FROM #{#entityName} e WHERE e.deletedAt IS NULL")
    List<T> findActive();
}

public interface UserRepository extends SoftDeletableRepository<User, Long> {
    // Inherits soft delete methods
}
```

## Query Filtering

### Filter Active Records

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Automatically filters if @Where is used
    List<User> findAll();  // Only active users
    
    // Explicit query for active
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    List<User> findActiveUsers();
    
    // Include deleted
    @Query("SELECT u FROM User u")
    List<User> findAllIncludingDeleted();
    
    // Only deleted
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NOT NULL")
    List<User> findDeletedUsers();
}
```

### Filter in Service Layer

```java
@Service
@Transactional(readOnly = true)
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<UserResponse> findAllActive() {
        return userRepository.findAll().stream()  // Already filtered
            .map(this::mapToResponse)
            .toList();
    }
    
    public Optional<UserResponse> findById(Long id) {
        return userRepository.findById(id)  // Automatically filters deleted
            .map(this::mapToResponse);
    }
}
```

## Restoring Soft-Deleted Records

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public UserResponse restoreUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
        
        if (user.getDeletedAt() == null) {
            throw new BusinessException("User is not deleted");
        }
        
        user.setDeletedAt(null);
        user.setDeletedBy(null);
        
        User restored = userRepository.save(user);
        return mapToResponse(restored);
    }
}
```

## Cascading Soft Deletes

### Child Entities

```java
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}

@Service
@Transactional
public class OrderService {
    
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();
        
        // Soft delete order
        order.setDeletedAt(LocalDateTime.now());
        
        // Soft delete related items
        order.getItems().forEach(item -> item.setDeletedAt(LocalDateTime.now()));
        
        orderRepository.save(order);
    }
}
```

## Permanent Deletion

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public void permanentlyDelete(Long id) {
        // First soft delete
        User user = userRepository.findById(id).orElseThrow();
        userRepository.delete(user);  // Soft delete
        
        // Then hard delete after retention period
        // (Implement scheduled job)
    }
    
    @Scheduled(cron = "0 0 2 * * *")  // Daily at 2 AM
    public void purgeOldSoftDeletes() {
        LocalDateTime cutoff = LocalDateTime.now().minusYears(1);
        
        List<User> oldDeletes = userRepository.findDeletedOlderThan(cutoff);
        userRepository.deleteAll(oldDeletes);  // Hard delete
    }
}
```

## Best Practices

1. ✅ Use `@Where` for automatic filtering
2. ✅ Track who deleted and when
3. ✅ Implement restore functionality
4. ✅ Schedule permanent deletion
5. ✅ Document soft delete behavior

## Summary

Soft deletes provide:
- ✅ Data preservation
- ✅ Audit trails
- ✅ Recovery capability

Implement soft deletes for critical data that should be preserved!

