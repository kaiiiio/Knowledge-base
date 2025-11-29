# Pagination Strategies in Spring Boot

Pagination is essential for handling large datasets efficiently. This guide covers all pagination strategies in Spring Boot with JPA.

## Why Pagination?

**Problems without pagination:**
- Loading thousands of records into memory
- Slow API responses
- Poor user experience
- Database performance issues

**Benefits of pagination:**
- ✅ Efficient memory usage
- ✅ Faster responses
- ✅ Better user experience
- ✅ Reduced database load

## Spring Data JPA Pagination

### Using Page and Pageable

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Page<User> findByStatus(String status, Pageable pageable);
}

// Usage
@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public Page<UserResponse> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userRepository.findAll(pageable);
        
        return users.map(this::mapToResponse);
    }
}
```

### Controller Implementation

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id") String sortBy) {
        
        Page<UserResponse> users = userService.getUsers(page, size, sortBy);
        return ResponseEntity.ok(users);
    }
}
```

## Pagination Types

### 1. Offset-Based Pagination

**How it works:** Skip N records, take M records

```java
Pageable pageable = PageRequest.of(page, size);
Page<User> users = userRepository.findAll(pageable);

// Returns:
// - Page content
// - Total elements
// - Total pages
// - Current page number
```

**Pros:**
- ✅ Simple to implement
- ✅ Works with any sorting
- ✅ Easy to navigate pages

**Cons:**
- ⚠️ Slower on large offsets
- ⚠️ Inconsistent if data changes

### 2. Cursor-Based Pagination

**How it works:** Use last item's ID as cursor

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Page<User> findByIdGreaterThan(Long cursor, Pageable pageable);
}

// Usage
public Page<UserResponse> getUsersAfter(Long cursor, int size) {
    Pageable pageable = PageRequest.of(0, size);
    Page<User> users = userRepository.findByIdGreaterThan(cursor, pageable);
    return users.map(this::mapToResponse);
}
```

**Pros:**
- ✅ Consistent results
- ✅ Fast performance
- ✅ Works with real-time data

**Cons:**
- ⚠️ Can't jump to specific page
- ⚠️ Requires ordered ID

### 3. Slice-Based Pagination

**How it works:** Returns slice without total count

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Slice<User> findByStatus(String status, Pageable pageable);
}

// Usage
public Slice<UserResponse> getUsersSlice(int page, int size) {
    Pageable pageable = PageRequest.of(page, size);
    Slice<User> users = userRepository.findAll(pageable);
    return users.map(this::mapToResponse);
}
```

**Benefits:**
- ✅ Faster (no count query)
- ✅ Better for large datasets
- ✅ Use hasNext() for pagination

## Sorting

### Single Field Sort

```java
Pageable pageable = PageRequest.of(
    page, 
    size, 
    Sort.by("createdAt").descending()
);
Page<User> users = userRepository.findAll(pageable);
```

### Multiple Field Sort

```java
Sort sort = Sort.by("status")
    .and(Sort.by("createdAt").descending());
Pageable pageable = PageRequest.of(page, size, sort);
```

### Dynamic Sorting

```java
@GetMapping("/users")
public ResponseEntity<Page<UserResponse>> getUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "id") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDir) {
    
    Sort sort = sortDir.equalsIgnoreCase("desc") 
        ? Sort.by(sortBy).descending() 
        : Sort.by(sortBy).ascending();
    
    Pageable pageable = PageRequest.of(page, size, sort);
    Page<UserResponse> users = userService.getUsers(pageable);
    return ResponseEntity.ok(users);
}
```

## Custom Pagination Queries

### JPQL with Pagination

```java
public interface UserRepository extends JpaRepository<User, Long> {
    
    @Query("SELECT u FROM User u WHERE u.status = :status")
    Page<User> findByStatus(@Param("status") String status, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.createdAt >= :startDate")
    Page<User> findRecentUsers(@Param("startDate") LocalDateTime startDate, Pageable pageable);
}
```

### Native Query with Pagination

```java
@Query(
    value = "SELECT * FROM users WHERE status = :status",
    countQuery = "SELECT COUNT(*) FROM users WHERE status = :status",
    nativeQuery = true
)
Page<User> findByStatusNative(@Param("status") String status, Pageable pageable);
```

## Response Format

### Standard Page Response

```java
{
  "content": [
    {"id": 1, "email": "user1@example.com"},
    {"id": 2, "email": "user2@example.com"}
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false,
  "numberOfElements": 20
}
```

### Custom Response Format

```java
public record PaginatedResponse<T>(
    List<T> data,
    PaginationInfo pagination
) {
    public record PaginationInfo(
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext,
        boolean hasPrevious
    ) {}
}

// Mapper
public PaginatedResponse<UserResponse> toPaginatedResponse(Page<User> page) {
    return new PaginatedResponse<>(
        page.getContent().stream().map(this::mapToResponse).toList(),
        new PaginationInfo(
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.hasNext(),
            page.hasPrevious()
        )
    );
}
```

## Best Practices

1. ✅ Use appropriate page size (10-50 typically)
2. ✅ Implement cursor-based for large datasets
3. ✅ Use Slice when total count not needed
4. ✅ Add indexes on sorted columns
5. ✅ Limit maximum page size

## Summary

Pagination strategies:
- **Offset-based** - Simple, flexible
- **Cursor-based** - Fast, consistent
- **Slice-based** - Efficient, no count

Choose based on your use case and performance requirements!

