# Reactive vs Imperative Backends in Spring Boot

Understanding reactive programming and when to use it in Spring Boot is crucial for building high-performance, scalable applications. This guide explains the differences, trade-offs, and when to choose each approach.

## Understanding the Fundamental Difference

### Imperative (Traditional) Programming

In imperative programming, code executes **sequentially** - one operation at a time, blocking until completion:

```java
@RestController
public class UserController {
    @Autowired
    private UserService userService;
    
    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        // This blocks the thread until database responds
        User user = userService.findById(id);
        return user;
    }
}
```

**What happens:**
1. Request comes in
2. Thread is assigned to handle it
3. Thread **blocks** waiting for database query
4. Thread sits idle during database round-trip
5. Database responds
6. Thread continues and returns response

**Problem:** Each request needs a thread, and threads are expensive (memory per thread).

### Reactive Programming

In reactive programming, operations are **non-blocking** - the thread can handle other work while waiting:

```java
@RestController
public class ReactiveUserController {
    @Autowired
    private ReactiveUserService userService;
    
    @GetMapping("/users/{id}")
    public Mono<User> getUser(@PathVariable Long id) {
        // Returns immediately, doesn't block
        return userService.findById(id);
    }
}
```

**What happens:**
1. Request comes in
2. Thread starts the database query (non-blocking)
3. Thread is **freed** to handle other requests
4. When database responds, a thread picks up the result
5. Response is sent

**Benefit:** One thread can handle thousands of concurrent requests!

## Key Concepts

### Imperative Model: Thread-Per-Request

```
Request 1 → Thread 1 → [Blocking DB Call] → Response 1
Request 2 → Thread 2 → [Blocking DB Call] → Response 2
Request 3 → Thread 3 → [Blocking DB Call] → Response 3
...
Request 1000 → Thread 1000 → [Blocking DB Call] → Response 1000

Problem: Need 1000 threads = High memory usage
```

### Reactive Model: Event Loop

```
Request 1 → Event Loop → Start DB Call (non-blocking)
Request 2 → Event Loop → Start DB Call (non-blocking)
Request 3 → Event Loop → Start DB Call (non-blocking)
...
Request 1000 → Event Loop → Start DB Call (non-blocking)

[All threads freed, handle other work]

DB Response 1 → Event Loop → Complete Request 1
DB Response 2 → Event Loop → Complete Request 2
...

Benefit: Need only ~10-20 threads total!
```

## Spring Boot Reactive Stack

### Reactive Types in Spring

Spring uses **Project Reactor** for reactive programming:

**Mono<T>** - Represents 0 or 1 result
```java
Mono<User> user = userService.findById(1L);
// Like Optional<User> but asynchronous
```

**Flux<T>** - Represents 0 to N results (stream)
```java
Flux<User> users = userService.findAll();
// Like List<User> but asynchronous stream
```

### Imperative Example

```java
@RestController
@RequestMapping("/users")
public class ImperativeUserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        // Blocking operation
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
        return ResponseEntity.ok(user);
    }
    
    @GetMapping
    public List<User> getAllUsers() {
        // Blocking operation - loads all into memory
        return userRepository.findAll();
    }
    
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        // Blocking operation
        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
```

### Reactive Example

```java
@RestController
@RequestMapping("/users")
public class ReactiveUserController {
    
    @Autowired
    private ReactiveUserRepository userRepository;
    
    @GetMapping("/{id}")
    public Mono<ResponseEntity<User>> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    public Flux<User> getAllUsers() {
        // Streams results as they come
        return userRepository.findAll();
    }
    
    @PostMapping
    public Mono<ResponseEntity<User>> createUser(@RequestBody Mono<User> userMono) {
        return userMono
            .flatMap(userRepository::save)
            .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
    }
}
```

## When to Use Each Approach

### ✅ Use Imperative When:

1. **Simple CRUD Applications**
   - Standard business applications
   - Predictable load patterns
   - Team unfamiliar with reactive

2. **CPU-Bound Operations**
   - Complex calculations
   - Data processing
   - Image manipulation

3. **Synchronous Dependencies**
   - Legacy systems that block
   - Libraries without reactive support
   - Simple database queries

4. **Easier Debugging Needed**
   - Stack traces are clearer
   - Traditional debugging tools work
   - Team prefers sequential thinking

### ✅ Use Reactive When:

1. **High Concurrency Requirements**
   - Thousands of concurrent connections
   - Real-time applications
   - Chat applications, gaming backends

2. **I/O-Bound Operations**
   - Multiple external API calls
   - Stream processing
   - WebSocket connections

3. **Backpressure Handling Needed**
   - Producer faster than consumer
   - Stream control required
   - Rate limiting

4. **Resource Efficiency Critical**
   - Limited memory/CPU
   - Microservices
   - Serverless environments

## Performance Comparison

### Scenario: 10,000 Concurrent Requests

**Imperative (Thread-Per-Request):**
```
- Threads needed: ~10,000
- Memory per thread: ~1MB
- Total memory: ~10GB just for threads!
- Context switching overhead: High
- Throughput: Limited by thread pool size
```

**Reactive (Event Loop):**
```
- Threads needed: ~10-20 (event loop threads)
- Memory per thread: ~1MB
- Total memory: ~20MB for threads
- Context switching overhead: Minimal
- Throughput: Much higher
```

## Practical Examples

### Example 1: Multiple Database Queries

**Imperative (Sequential):**
```java
@GetMapping("/users/{id}/profile")
public UserProfile getUserProfile(@PathVariable Long id) {
    // Blocking calls - executed sequentially
    User user = userRepository.findById(id).orElseThrow();
    List<Order> orders = orderRepository.findByUserId(id);
    List<Payment> payments = paymentRepository.findByUserId(id);
    
    // Total time = time1 + time2 + time3
    return new UserProfile(user, orders, payments);
}
```

**Reactive (Parallel):**
```java
@GetMapping("/users/{id}/profile")
public Mono<UserProfile> getUserProfile(@PathVariable Long id) {
    Mono<User> userMono = userRepository.findById(id);
    Flux<Order> ordersFlux = orderRepository.findByUserId(id);
    Flux<Payment> paymentsFlux = paymentRepository.findByUserId(id);
    
    // All queries start in parallel
    return Mono.zip(userMono, ordersFlux.collectList(), paymentsFlux.collectList())
        .map(tuple -> new UserProfile(tuple.getT1(), tuple.getT2(), tuple.getT3()));
    
    // Total time ≈ max(time1, time2, time3)
}
```

### Example 2: External API Calls

**Imperative:**
```java
@GetMapping("/users/{id}/enriched")
public EnrichedUser getEnrichedUser(@PathVariable Long id) {
    User user = userService.findById(id);
    
    // Blocking HTTP calls
    String address = addressService.getAddress(user.getAddressId());
    String profilePic = imageService.getProfilePic(user.getId());
    
    return new EnrichedUser(user, address, profilePic);
}
```

**Reactive:**
```java
@GetMapping("/users/{id}/enriched")
public Mono<EnrichedUser> getEnrichedUser(@PathVariable Long id) {
    return userService.findById(id)
        .flatMap(user -> {
            Mono<String> addressMono = addressService.getAddress(user.getAddressId());
            Mono<String> profilePicMono = imageService.getProfilePic(user.getId());
            
            // Both calls happen in parallel
            return Mono.zip(addressMono, profilePicMono)
                .map(tuple -> new EnrichedUser(user, tuple.getT1(), tuple.getT2()));
        });
}
```

## Database Support

### Imperative Databases

```java
// Spring Data JPA (Blocking)
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
}
```

### Reactive Databases

```java
// Spring Data R2DBC (Reactive)
public interface ReactiveUserRepository extends ReactiveCrudRepository<User, Long> {
    Mono<User> findByEmail(String email);
}
```

**Supported Reactive Databases:**
- PostgreSQL (R2DBC)
- MySQL (R2DBC)
- MongoDB (Reactive MongoDB Driver)
- Redis (Reactive Redis)

## Hybrid Approach

You can mix reactive and imperative:

```java
@RestController
public class HybridController {
    
    @Autowired
    private UserService userService;  // Imperative
    
    @Autowired
    private ReactiveNotificationService notificationService;  // Reactive
    
    @PostMapping("/users")
    public User createUser(@RequestBody User user) {
        // Imperative save
        User saved = userService.save(user);
        
        // Reactive notification (non-blocking)
        notificationService.sendWelcomeEmail(saved.getId())
            .subscribe();  // Fire and forget
        
        return saved;
    }
}
```

## Migration Path

### Step 1: Start with Imperative
```java
// Simple, works for most cases
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return userRepository.findById(id).orElseThrow();
}
```

### Step 2: Identify Bottlenecks
- High concurrent request counts
- Multiple blocking I/O operations
- Resource constraints

### Step 3: Migrate Incrementally
```java
// Convert one endpoint at a time
@GetMapping("/users/{id}")
public Mono<User> getUser(@PathVariable Long id) {
    return reactiveUserRepository.findById(id);
}
```

## Best Practices

### Imperative Best Practices

1. **Use Connection Pooling**
   ```properties
   spring.datasource.hikari.maximum-pool-size=20
   ```

2. **Configure Thread Pool**
   ```properties
   server.tomcat.threads.max=200
   server.tomcat.threads.min-spare=10
   ```

3. **Use Async for Background Tasks**
   ```java
   @Async
   public void sendEmail(User user) {
       // Runs in background thread
   }
   ```

### Reactive Best Practices

1. **Don't Block in Reactive Code**
   ```java
   // ❌ Bad
   Mono<User> userMono = Mono.just(userRepository.findById(1L));
   
   // ✅ Good
   Mono<User> userMono = reactiveUserRepository.findById(1L);
   ```

2. **Handle Errors Properly**
   ```java
   return userRepository.findById(id)
       .onErrorResume(UserNotFoundException.class, 
           e -> Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)));
   ```

3. **Use Backpressure**
   ```java
   return userRepository.findAll()
       .limitRate(100)  // Control throughput
       .buffer(10)      // Batch processing
   ```

## Summary

**Imperative (Traditional):**
- ✅ Simpler to understand and debug
- ✅ Better for CPU-bound work
- ✅ Works with all Spring libraries
- ❌ Limited by thread pool size
- ❌ Higher memory usage

**Reactive:**
- ✅ Handles high concurrency efficiently
- ✅ Better for I/O-bound operations
- ✅ Lower memory footprint
- ❌ Steeper learning curve
- ❌ More complex debugging

**Recommendation:**
- Start with **imperative** for most applications
- Use **reactive** when you need to handle thousands of concurrent connections
- Consider **reactive** for real-time applications (WebSockets, SSE)
- Use **hybrid** approach - reactive where it matters, imperative elsewhere

For most Spring Boot applications, the imperative approach is sufficient and easier to maintain. Only move to reactive when you have specific performance requirements that justify the added complexity.

