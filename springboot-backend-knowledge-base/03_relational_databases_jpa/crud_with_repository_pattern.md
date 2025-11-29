# CRUD with Repository Pattern in Spring Boot

The repository pattern provides a clean abstraction over data access. This guide shows you how to implement comprehensive CRUD operations using Spring Data JPA repositories.

## Understanding the Repository Pattern

**What is the Repository Pattern?**
A design pattern that abstracts data access, providing a collection-like interface for accessing domain objects.

**Benefits:**
- ✅ Clean separation of concerns
- ✅ Easy to test (mock repositories)
- ✅ Consistent data access interface
- ✅ Database-agnostic code

## Basic Repository Setup

### Entity Definition

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String name;
    
    private boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### Repository Interface

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data JPA provides:
    // - save(User entity)
    // - findById(Long id)
    // - findAll()
    // - delete(User entity)
    // - count()
    // - existsById(Long id)
}
```

## Complete CRUD Operations

### Create (Insert)

**Single Entity:**
```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public UserResponse create(UserCreateRequest request) {
        User user = new User();
        user.setEmail(request.email());
        user.setName(request.name());
        
        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }
}
```

**Batch Insert:**
```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<UserResponse> createBatch(List<UserCreateRequest> requests) {
        List<User> users = requests.stream()
            .map(request -> {
                User user = new User();
                user.setEmail(request.email());
                user.setName(request.name());
                return user;
            })
            .toList();
        
        List<User> saved = userRepository.saveAll(users);
        return saved.stream().map(this::mapToResponse).toList();
    }
}
```

### Read (Select)

**Find by ID:**
```java
@Service
@Transactional(readOnly = true)
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
        return mapToResponse(user);
    }
}
```

**Find All:**
```java
public List<UserResponse> findAll() {
    List<User> users = userRepository.findAll();
    return users.stream()
        .map(this::mapToResponse)
        .toList();
}
```

**Find with Conditions:**
```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    List<User> findByIsActiveTrue();
    
    List<User> findByNameContainingIgnoreCase(String name);
    
    List<User> findByCreatedAtAfter(LocalDateTime date);
}
```

### Update

**Update Existing:**
```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
        
        if (request.name() != null) {
            user.setName(request.name());
        }
        
        if (request.email() != null) {
            user.setEmail(request.email());
        }
        
        User updated = userRepository.save(user);  // Updates existing
        return mapToResponse(updated);
    }
}
```

**Partial Update:**
```java
@Modifying
@Query("UPDATE User u SET u.name = :name WHERE u.id = :id")
void updateName(@Param("id") Long id, @Param("name") String name);
```

### Delete

**Delete by Entity:**
```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public void delete(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
        userRepository.delete(user);
    }
}
```

**Delete by ID:**
```java
public void deleteById(Long id) {
    if (!userRepository.existsById(id)) {
        throw new UserNotFoundException(id);
    }
    userRepository.deleteById(id);
}
```

**Batch Delete:**
```java
public void deleteAll(List<Long> ids) {
    List<User> users = userRepository.findAllById(ids);
    userRepository.deleteAll(users);
}
```

## Advanced Repository Methods

### Custom Query Methods

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Derived queries
    List<User> findByEmailContaining(String email);
    List<User> findByAgeBetween(int min, int max);
    List<User> findByIsActiveTrueAndCreatedAtAfter(LocalDateTime date);
    
    // Count queries
    long countByIsActiveTrue();
    boolean existsByEmail(String email);
    
    // Delete queries
    void deleteByIsActiveFalse();
    
    // Sort
    List<User> findTop10ByOrderByCreatedAtDesc();
}
```

### JPQL Queries

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findByEmailQuery(@Param("email") String email);
    
    @Query("SELECT u FROM User u WHERE u.age > :minAge ORDER BY u.createdAt DESC")
    List<User> findAdults(@Param("minAge") int minAge);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    long countActiveUsers();
}
```

### Native Queries

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Query(value = "SELECT * FROM users WHERE age > :minAge", nativeQuery = true)
    List<User> findAdultsNative(@Param("minAge") int minAge);
    
    @Query(value = "SELECT COUNT(*) FROM users WHERE status = :status", nativeQuery = true)
    long countByStatus(@Param("status") String status);
}
```

## Repository Implementation Examples

### Complete User Repository

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find methods
    Optional<User> findByEmail(String email);
    List<User> findByIsActiveTrue();
    List<User> findByNameContainingIgnoreCase(String name);
    
    // Exists and count
    boolean existsByEmail(String email);
    long countByIsActiveTrue();
    
    // Custom JPQL
    @Query("SELECT u FROM User u WHERE u.createdAt >= :startDate AND u.createdAt <= :endDate")
    List<User> findCreatedBetween(@Param("startDate") LocalDateTime start, 
                                  @Param("endDate") LocalDateTime end);
    
    // Custom native query
    @Query(value = "SELECT * FROM users WHERE email LIKE %:domain%", nativeQuery = true)
    List<User> findByEmailDomain(@Param("domain") String domain);
}
```

### Complete User Service

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Create
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException(request.email());
        }
        
        User user = new User();
        user.setEmail(request.email());
        user.setName(request.name());
        
        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }
    
    // Read
    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
        return mapToResponse(user);
    }
    
    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
            .map(this::mapToResponse)
            .toList();
    }
    
    @Transactional(readOnly = true)
    public Optional<UserResponse> findByEmail(String email) {
        return userRepository.findByEmail(email)
            .map(this::mapToResponse);
    }
    
    // Update
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
        
        if (request.name() != null) {
            user.setName(request.name());
        }
        
        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }
    
    // Delete
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException(id);
        }
        userRepository.deleteById(id);
    }
}
```

## Best Practices

1. ✅ **Use `@Transactional`** for write operations
2. ✅ **Use `readOnly = true`** for read operations
3. ✅ **Handle Optional** properly (use orElseThrow)
4. ✅ **Use DTOs** for responses (don't expose entities)
5. ✅ **Validate before save** (check constraints)

## Summary

Repository pattern provides:
- ✅ Clean data access abstraction
- ✅ Type-safe queries
- ✅ Easy testing
- ✅ Consistent interface

Master repositories to build maintainable data layers!

