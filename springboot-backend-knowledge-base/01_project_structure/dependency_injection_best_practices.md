# Dependency Injection Best Practices in Spring Boot

Spring Boot's dependency injection is one of its core features, enabling clean, testable, and maintainable code. This guide covers best practices for using dependency injection effectively.

## Understanding Spring Dependency Injection

Dependency Injection (DI) is the process where objects define their dependencies, and Spring provides them automatically. This enables loose coupling and better testability.

### Basic Concept

**Without DI (Tight Coupling):**
```java
public class UserService {
    private UserRepository userRepository;
    
    public UserService() {
        // Creating dependency directly - hard to test, hard to change
        this.userRepository = new UserRepositoryImpl();
    }
}
```

**With DI (Loose Coupling):**
```java
@Service
public class UserService {
    private final UserRepository userRepository;
    
    // Spring provides the dependency
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

## Injection Methods

### 1. Constructor Injection (Recommended)

```java
@Service
public class UserService {
    private final UserRepository userRepository;
    private final EmailService emailService;
    
    // Constructor injection - preferred method
    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }
}
```

**Benefits:**
- ✅ Immutable dependencies (final fields)
- ✅ Required dependencies enforced (can't create without them)
- ✅ Easy to test (just pass mocks in constructor)
- ✅ Clear dependencies

### 2. Field Injection (Not Recommended)

```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;  // Not recommended
}
```

**Drawbacks:**
- ❌ Hard to test (need reflection or Spring context)
- ❌ Not immutable
- ❌ Hidden dependencies
- ❌ Can't use final fields

### 3. Setter Injection (Use Sparingly)

```java
@Service
public class UserService {
    private UserRepository userRepository;
    
    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

**Use when:**
- Optional dependencies
- Circular dependencies (better to redesign)

## Best Practices

### 1. Prefer Constructor Injection

```java
// ✅ Good - Constructor injection
@Service
public class UserService {
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}

// ⚠️ Less preferred - Field injection
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
}
```

### 2. Use Interfaces for Dependencies

```java
// ✅ Good - Interface allows easy swapping
@Service
public class UserService {
    private final UserRepository userRepository;  // Interface
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}

// Repository interface
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
```

### 3. Qualify Beans When Multiple Implementations

```java
// Multiple implementations
@Component("jpaUserRepository")
public class JpaUserRepository implements UserRepository {
    // ...
}

@Component("mongoUserRepository")
public class MongoUserRepository implements UserRepository {
    // ...
}

// Inject specific implementation
@Service
public class UserService {
    private final UserRepository userRepository;
    
    public UserService(@Qualifier("jpaUserRepository") UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

### 4. Use @Primary for Default Implementation

```java
@Primary
@Component
public class JpaUserRepository implements UserRepository {
    // Default implementation when no qualifier specified
}

@Component
public class MongoUserRepository implements UserRepository {
    // Alternative implementation
}

@Service
public class UserService {
    // Gets JpaUserRepository by default (no qualifier needed)
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
```

### 5. Lazy Initialization for Optional Dependencies

```java
@Service
public class UserService {
    private final UserRepository userRepository;
    
    @Lazy  // Only initialized when first used
    @Autowired(required = false)  // Optional dependency
    private OptionalEmailService emailService;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public void sendWelcomeEmail(User user) {
        emailService.ifPresent(service -> service.send(user));
    }
}
```

## Advanced Patterns

### 1. Dependency Injection in Configuration Classes

```java
@Configuration
public class AppConfig {
    
    @Bean
    public DataSource dataSource() {
        // Create and configure DataSource
        return DataSourceBuilder.create().build();
    }
    
    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        // Inject DataSource bean
        return new JdbcTemplate(dataSource);
    }
}
```

### 2. Factory Pattern with DI

```java
@Component
public class UserRepositoryFactory {
    
    private final DataSource dataSource;
    
    public UserRepositoryFactory(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    public UserRepository create(String type) {
        return switch (type) {
            case "jpa" -> new JpaUserRepository();
            case "jdbc" -> new JdbcUserRepository(dataSource);
            default -> throw new IllegalArgumentException("Unknown type: " + type);
        };
    }
}
```

### 3. Conditional Bean Creation

```java
@Configuration
public class CacheConfig {
    
    @Bean
    @ConditionalOnProperty(name = "cache.enabled", havingValue = "true")
    public CacheManager cacheManager() {
        return new RedisCacheManager();
    }
    
    @Bean
    @ConditionalOnMissingBean(CacheManager.class)
    public CacheManager noOpCacheManager() {
        return new NoOpCacheManager();  // Fallback
    }
}
```

### 4. Method Injection (Advanced)

```java
@Component
public class UserService {
    
    private UserRepository getUserRepository() {
        // Get repository from application context
        return ApplicationContextProvider.getBean(UserRepository.class);
    }
}
```

## Scopes

### Understanding Bean Scopes

```java
@Component
@Scope(ConfigurableBeanFactory.SCOPE_SINGLETON)  // Default
public class SingletonService {
    // One instance per application
}

@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class PrototypeService {
    // New instance each time
}

@Component
@Scope(WebApplicationContext.SCOPE_REQUEST)
public class RequestScopedService {
    // One instance per HTTP request
}

@Component
@Scope(WebApplicationContext.SCOPE_SESSION)
public class SessionScopedService {
    // One instance per HTTP session
}
```

## Circular Dependencies

### The Problem

```java
@Service
public class ServiceA {
    private final ServiceB serviceB;
    
    public ServiceA(ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}

@Service
public class ServiceB {
    private final ServiceA serviceA;  // Circular dependency!
    
    public ServiceB(ServiceA serviceA) {
        this.serviceA = serviceA;
    }
}
```

### Solutions

**Solution 1: Redesign (Best)**
```java
// Extract common functionality
@Service
public class CommonService {
    // Shared functionality
}

@Service
public class ServiceA {
    private final CommonService commonService;
    // No circular dependency
}

@Service
public class ServiceB {
    private final CommonService commonService;
    // No circular dependency
}
```

**Solution 2: Use @Lazy**
```java
@Service
public class ServiceA {
    private final ServiceB serviceB;
    
    public ServiceA(@Lazy ServiceB serviceB) {
        this.serviceB = serviceB;  // Lazy initialization breaks cycle
    }
}
```

**Solution 3: Setter Injection**
```java
@Service
public class ServiceA {
    private ServiceB serviceB;
    
    @Autowired
    public void setServiceB(ServiceB serviceB) {
        this.serviceB = serviceB;
    }
}
```

## Testing with Dependency Injection

### Unit Testing with Mocks

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private UserService userService;
    
    @Test
    void shouldFindUser() {
        // Given
        User user = new User(1L, "test@example.com", "Test");
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        
        // When
        User result = userService.findById(1L);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("test@example.com");
    }
}
```

### Integration Testing with Real Beans

```java
@SpringBootTest
class UserServiceIntegrationTest {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Test
    @Transactional
    @Rollback
    void shouldCreateUser() {
        // Given
        UserCreateRequest request = new UserCreateRequest("test@example.com", "Test");
        
        // When
        UserResponse response = userService.create(request);
        
        // Then
        assertThat(response).isNotNull();
        assertThat(userRepository.findById(response.id())).isPresent();
    }
}
```

## Common Patterns

### 1. Service Layer Pattern

```java
@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    
    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }
    
    @Transactional
    public UserResponse create(UserCreateRequest request) {
        User user = userMapper.toEntity(request);
        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }
}
```

### 2. Repository Pattern

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

// Spring automatically creates implementation
// No need for @Repository annotation when extending JpaRepository
```

### 3. Facade Pattern

```java
@Service
public class OrderFacade {
    private final UserService userService;
    private final ProductService productService;
    private final OrderService orderService;
    
    public OrderFacade(
            UserService userService,
            ProductService productService,
            OrderService orderService) {
        this.userService = userService;
        this.productService = productService;
        this.orderService = orderService;
    }
    
    public OrderResponse createOrder(OrderCreateRequest request) {
        // Orchestrate multiple services
        User user = userService.findById(request.userId());
        Product product = productService.findById(request.productId());
        return orderService.create(user, product, request);
    }
}
```

## Anti-Patterns to Avoid

### ❌ Don't: Create Dependencies Manually

```java
// ❌ Bad
@Service
public class UserService {
    public User findById(Long id) {
        UserRepository repo = new UserRepositoryImpl();  // Manual creation
        return repo.findById(id);
    }
}
```

### ❌ Don't: Use Static Methods for Services

```java
// ❌ Bad
public class UserService {
    public static User findById(Long id) {
        // Can't inject dependencies
    }
}
```

### ❌ Don't: Mix Business Logic with DI Setup

```java
// ❌ Bad
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @PostConstruct
    public void init() {
        // Business logic here - wrong place!
        userRepository.save(new User());
    }
}
```

## Summary

Dependency Injection Best Practices:

1. ✅ **Use constructor injection** - Preferred method
2. ✅ **Use interfaces** - Enable easy swapping
3. ✅ **Keep dependencies minimal** - Only inject what you need
4. ✅ **Avoid circular dependencies** - Redesign when possible
5. ✅ **Use qualifiers** - When multiple implementations exist
6. ✅ **Test with mocks** - Easy when using constructor injection

Following these practices leads to:
- ✅ Cleaner code
- ✅ Better testability
- ✅ Easier maintenance
- ✅ Flexible architecture

Spring Boot's dependency injection is powerful - use it wisely!

