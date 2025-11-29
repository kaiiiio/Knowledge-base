# Entity Manager Lifecycle in Spring Boot

Understanding the Entity Manager lifecycle is crucial for effective JPA usage. This guide explains how entities move through different states and how Spring manages them.

## Entity States

### 1. Transient

**State:** Entity not associated with any persistence context.

```java
// New entity - not managed
User user = new User();
user.setEmail("test@example.com");
user.setName("Test User");
// Entity is in TRANSIENT state
```

**Characteristics:**
- Not tracked by EntityManager
- Not in database
- No identifier assigned

### 2. Managed (Persistent)

**State:** Entity associated with persistence context.

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User createUser(UserCreateRequest request) {
        User user = new User();  // TRANSIENT
        user.setEmail(request.email());
        
        User saved = userRepository.save(user);  // MANAGED
        // Changes to 'saved' will be tracked and persisted
        saved.setName("Updated Name");  // Will be saved automatically
        
        return saved;  // Still MANAGED
    }
}
```

**Characteristics:**
- Tracked by EntityManager
- Changes automatically persisted
- Dirty checking enabled
- Relationship management active

### 3. Detached

**State:** Entity no longer associated with persistence context.

```java
@Service
public class UserService {
    
    @Transactional
    public User getUser(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        // user is MANAGED here
        return user;  // Returns DETACHED (transaction ends)
    }
    
    public void updateDetachedUser(User user) {
        // user is DETACHED here
        user.setName("New Name");  // Changes won't be persisted!
    }
}
```

**Characteristics:**
- No longer tracked
- Changes not automatically persisted
- Can be merged back

### 4. Removed

**State:** Entity marked for deletion.

```java
@Service
@Transactional
public class UserService {
    
    public void deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        // user is MANAGED
        
        userRepository.delete(user);  // user is REMOVED
        // Will be deleted from database on commit
    }
}
```

## State Transitions

```
TRANSIENT → (persist) → MANAGED → (remove) → REMOVED
                ↓                              ↓
                ↓                         (commit)
                ↓                              ↓
           (commit)                        DELETED
                ↓
           PERSISTED
                ↓
         (transaction ends)
                ↓
           DETACHED → (merge) → MANAGED
```

## Working with Entity States

### Making Entity Managed

**Method 1: Save (Persist)**
```java
@Transactional
public User createUser(UserCreateRequest request) {
    User user = new User();  // TRANSIENT
    user.setEmail(request.email());
    
    return userRepository.save(user);  // MANAGED
}
```

**Method 2: Merge (Reattach Detached)**
```java
@Transactional
public User updateUser(User user) {
    // user is DETACHED (passed from outside transaction)
    return userRepository.save(user);  // Merged back to MANAGED
}
```

### Detaching Entities

**Automatic Detaching:**
```java
@Transactional(readOnly = true)
public User getUser(Long id) {
    User user = userRepository.findById(id).orElseThrow();
    return user;  // Detached when transaction ends
}
```

**Manual Detaching:**
```java
@Autowired
private EntityManager entityManager;

@Transactional
public void detachUser(User user) {
    entityManager.detach(user);  // Manually detach
}
```

**Detach All:**
```java
@Transactional
public void clearPersistenceContext() {
    entityManager.clear();  // Detach all entities
}
```

### Refreshing Managed Entities

```java
@Transactional
public User refreshUser(Long id) {
    User user = userRepository.findById(id).orElseThrow();
    
    // Refresh from database (overwrites any changes)
    entityManager.refresh(user);
    
    return user;
}
```

## Persistence Context

### Understanding Persistence Context

**Persistence Context:**
- Set of managed entity instances
- One per transaction (by default)
- Tracks entity state
- Manages entity lifecycle

### Scope

**Transaction-Scoped (Default):**
```java
@Transactional
public void method() {
    User user1 = userRepository.findById(1L).orElseThrow();  // Managed
    User user2 = userRepository.findById(1L).orElseThrow();  // Same instance (cached)
    
    assert user1 == user2;  // True - same instance from persistence context
}
```

**Extended Scope:**
```java
@Component
@Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class ExtendedPersistenceContext {
    
    @PersistenceContext(type = PersistenceContextType.EXTENDED)
    private EntityManager entityManager;
    
    // Persistence context lives for entire request
}
```

## Flush Modes

### Automatic Flush

**Default behavior:**
```java
@Transactional
public void method() {
    User user = new User();
    userRepository.save(user);  // Not flushed yet
    
    // Flush happens automatically before:
    // - Query execution
    // - Transaction commit
    
    List<User> users = userRepository.findAll();  // Flush happens here
}
```

### Manual Flush

```java
@Autowired
private EntityManager entityManager;

@Transactional
public void method() {
    User user = new User();
    userRepository.save(user);
    
    entityManager.flush();  // Force flush to database
    
    // User is now in database (but transaction not committed)
}
```

### Flush Mode Settings

```java
@PersistenceContext
private EntityManager entityManager;

public void setFlushMode() {
    entityManager.setFlushMode(FlushModeType.COMMIT);  // Flush only on commit
}
```

## Best Practices

### 1. Use @Transactional Appropriately

```java
// ✅ Good - Entity managed in transaction
@Transactional
public User createUser(UserCreateRequest request) {
    User user = new User();
    return userRepository.save(user);  // Managed, changes tracked
}

// ❌ Bad - Entity detached immediately
public User createUser(UserCreateRequest request) {
    User user = new User();
    User saved = userRepository.save(user);  // Saved but immediately detached
    saved.setName("Updated");  // Won't be persisted!
    return saved;
}
```

### 2. Handle Detached Entities

```java
// ✅ Good - Merge detached entity
@Transactional
public User updateUser(User user) {
    return userRepository.save(user);  // Merge if detached
}

// ✅ Better - Load fresh and update
@Transactional
public User updateUser(Long id, UserUpdateRequest request) {
    User user = userRepository.findById(id).orElseThrow();  // Managed
    user.setName(request.name());  // Changes tracked
    return user;  // Automatically saved
}
```

### 3. Avoid Detaching Unnecessarily

```java
// ✅ Good - Return DTO
@Transactional(readOnly = true)
public UserResponse getUser(Long id) {
    User user = userRepository.findById(id).orElseThrow();
    return mapToResponse(user);  // Return DTO, not entity
}

// ⚠️ Less preferred - Return entity (will be detached)
@Transactional(readOnly = true)
public User getUser(Long id) {
    return userRepository.findById(id).orElseThrow();  // Detached after return
}
```

## Summary

Entity states:
- **TRANSIENT** - New, not managed
- **MANAGED** - Tracked, changes persisted
- **DETACHED** - No longer tracked
- **REMOVED** - Marked for deletion

Understanding entity lifecycle helps you:
- ✅ Manage entity state correctly
- ✅ Avoid unexpected behavior
- ✅ Optimize performance
- ✅ Handle detached entities properly

Master the entity lifecycle for effective JPA usage!

