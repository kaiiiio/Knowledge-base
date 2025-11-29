# Recommended Project Layout for Spring Boot Applications

A well-organized project structure is crucial for maintainability, scalability, and team collaboration. This guide presents production-ready layouts for Spring Boot applications.

## Standard Production Layout

```
my-spring-boot-app/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── myapp/
│   │   │               ├── Application.java              # Application entry point
│   │   │               │
│   │   │               ├── config/                      # Configuration classes
│   │   │               │   ├── DatabaseConfig.java
│   │   │               │   ├── SecurityConfig.java
│   │   │               │   ├── SwaggerConfig.java
│   │   │               │   └── RedisConfig.java
│   │   │               │
│   │   │               ├── controller/                  # REST controllers
│   │   │               │   ├── UserController.java
│   │   │               │   ├── AuthController.java
│   │   │               │   └── ProductController.java
│   │   │               │
│   │   │               ├── service/                     # Business logic layer
│   │   │               │   ├── UserService.java
│   │   │               │   ├── AuthService.java
│   │   │               │   └── ProductService.java
│   │   │               │
│   │   │               ├── repository/                  # Data access layer
│   │   │               │   ├── UserRepository.java
│   │   │               │   └── ProductRepository.java
│   │   │               │
│   │   │               ├── model/                       # Domain entities
│   │   │               │   ├── User.java
│   │   │               │   └── Product.java
│   │   │               │
│   │   │               ├── dto/                         # Data Transfer Objects
│   │   │               │   ├── request/
│   │   │               │   │   ├── UserCreateRequest.java
│   │   │               │   │   └── UserUpdateRequest.java
│   │   │               │   └── response/
│   │   │               │       └── UserResponse.java
│   │   │               │
│   │   │               ├── mapper/                      # Entity-DTO mappers
│   │   │               │   └── UserMapper.java
│   │   │               │
│   │   │               └── exception/                   # Exception handling
│   │   │                   ├── GlobalExceptionHandler.java
│   │   │                   └── CustomException.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties                   # Main configuration
│   │       ├── application-dev.properties               # Dev environment
│   │       ├── application-prod.properties              # Prod environment
│   │       ├── db/
│   │       │   └── migration/                          # Flyway/Liquibase migrations
│   │       │       ├── V1__Initial_schema.sql
│   │       │       └── V2__Add_indexes.sql
│   │       └── logback-spring.xml                      # Logging configuration
│   │
│   └── test/
│       ├── java/
│       │   └── com/
│       │       └── example/
│       │           └── myapp/
│       │               ├── controller/
│       │               │   └── UserControllerTest.java
│       │               ├── service/
│       │               │   └── UserServiceTest.java
│       │               ├── repository/
│       │               │   └── UserRepositoryTest.java
│       │               └── integration/
│       │                   └── UserIntegrationTest.java
│       └── resources/
│           └── application-test.properties
│
├── pom.xml                                              # Maven build file
├── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Detailed Breakdown

### 1. Application Entry Point

**`Application.java`** - The main class that bootstraps Spring Boot:

```java
package com.example.myapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**What `@SpringBootApplication` includes:**
- `@Configuration` - Marks class as configuration
- `@EnableAutoConfiguration` - Enables auto-configuration
- `@ComponentScan` - Scans for components in package and sub-packages

### 2. Configuration Package (`config/`)

Configuration classes for setting up various aspects:

```java
package com.example.myapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;

@Configuration
public class DatabaseConfig {
    
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }
}
```

**Common Configuration Classes:**
- `DatabaseConfig.java` - Database connection settings
- `SecurityConfig.java` - Spring Security configuration
- `SwaggerConfig.java` - API documentation setup
- `RedisConfig.java` - Redis cache configuration
- `JpaConfig.java` - JPA/Hibernate settings

### 3. Controller Package (`controller/`)

REST controllers handle HTTP requests:

```java
package com.example.myapp.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        UserResponse user = userService.findById(id);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @RequestBody @Valid UserCreateRequest request) {
        UserResponse user = userService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
}
```

**Best Practices:**
- Keep controllers thin (delegate to services)
- Use `@RestController` for REST APIs
- Use `@RequestMapping` for base paths
- Validate input with `@Valid`

### 4. Service Package (`service/`)

Business logic layer:

```java
package com.example.myapp.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    
    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }
    
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
        return userMapper.toResponse(user);
    }
    
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }
        
        User user = userMapper.toEntity(request);
        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }
}
```

**Responsibilities:**
- Business logic
- Transaction management
- Orchestrating multiple repositories
- Domain rules validation

### 5. Repository Package (`repository/`)

Data access layer using Spring Data JPA:

```java
package com.example.myapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE u.age > :minAge")
    List<User> findAdults(@Param("minAge") int minAge);
    
    @Query(value = "SELECT * FROM users WHERE created_at > :date", nativeQuery = true)
    List<User> findRecentUsers(@Param("date") LocalDateTime date);
}
```

**Benefits:**
- Spring Data JPA generates implementations automatically
- Custom queries when needed
- Pagination and sorting support

### 6. Model Package (`model/`)

Domain entities (JPA entities):

```java
package com.example.myapp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

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
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Getters and setters
    // Constructors
    // equals() and hashCode()
}
```

### 7. DTO Package (`dto/`)

Data Transfer Objects for API contracts:

```java
package com.example.myapp.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    String email,
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    String name,
    
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password
) {}
```

```java
package com.example.myapp.dto.response;

import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String email,
    String name,
    LocalDateTime createdAt
) {}
```

### 8. Mapper Package (`mapper/`)

Mappers convert between entities and DTOs:

```java
package com.example.myapp.mapper;

import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    
    public UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getCreatedAt()
        );
    }
    
    public User toEntity(UserCreateRequest request) {
        User user = new User();
        user.setEmail(request.email());
        user.setName(request.name());
        // Set password (hashed)
        return user;
    }
}
```

**Alternative:** Use MapStruct for compile-time mapping:
```java
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
    User toEntity(UserCreateRequest request);
}
```

## Package Structure Patterns

### Pattern 1: By Feature (Recommended for Large Apps)

```
com.example.myapp/
├── user/
│   ├── UserController.java
│   ├── UserService.java
│   ├── UserRepository.java
│   ├── User.java
│   └── UserDTO.java
├── product/
│   ├── ProductController.java
│   ├── ProductService.java
│   └── ...
└── order/
    └── ...
```

**Benefits:**
- Related code grouped together
- Easier to find code for a feature
- Better encapsulation

### Pattern 2: By Layer (Current Structure)

```
com.example.myapp/
├── controller/
├── service/
├── repository/
└── model/
```

**Benefits:**
- Clear separation of concerns
- Easy to understand architecture
- Works well for medium-sized apps

### Pattern 3: Hybrid (Best for Enterprise Apps)

```
com.example.myapp/
├── shared/
│   ├── config/
│   ├── exception/
│   └── util/
├── user/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   └── model/
└── product/
    └── ...
```

## Configuration Files

### application.properties

```properties
# Server configuration
server.port=8080
server.servlet.context-path=/api

# Database configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=user
spring.datasource.password=password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Logging
logging.level.com.example.myapp=INFO
logging.level.org.springframework.web=DEBUG
```

### Profile-Specific Configuration

**application-dev.properties:**
```properties
spring.datasource.url=jdbc:h2:mem:devdb
spring.jpa.show-sql=true
logging.level.root=DEBUG
```

**application-prod.properties:**
```properties
spring.datasource.url=${DATABASE_URL}
spring.jpa.show-sql=false
logging.level.root=WARN
```

## Testing Structure

```
src/test/java/
├── controller/
│   └── UserControllerTest.java
├── service/
│   └── UserServiceTest.java
├── repository/
│   └── UserRepositoryTest.java
└── integration/
    └── UserIntegrationTest.java
```

**Example Test:**
```java
@WebMvcTest(UserController.class)
class UserControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private UserService userService;
    
    @Test
    void shouldGetUser() throws Exception {
        UserResponse user = new UserResponse(1L, "test@example.com", "Test User", null);
        when(userService.findById(1L)).thenReturn(user);
        
        mockMvc.perform(get("/api/v1/users/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("test@example.com"));
    }
}
```

## Build Configuration

### Maven (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>my-spring-boot-app</artifactId>
    <version>1.0.0</version>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

## Best Practices

### 1. Use Records for DTOs (Java 14+)

```java
// ✅ Good - Immutable, concise
public record UserResponse(Long id, String email, String name) {}

// ⚠️ Old way - More boilerplate
public class UserResponse {
    private Long id;
    private String email;
    private String name;
    // Getters, setters, constructors, equals, hashCode...
}
```

### 2. Keep Controllers Thin

```java
// ✅ Good
@RestController
public class UserController {
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }
}

// ❌ Bad - Business logic in controller
@RestController
public class UserController {
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElseThrow();
        if (user.getStatus().equals("inactive")) {
            throw new RuntimeException("User is inactive");
        }
        return ResponseEntity.ok(mapToResponse(user));
    }
}
```

### 3. Use Constructor Injection

```java
// ✅ Good - Immutable, testable
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

### 4. Separate Request/Response DTOs

```java
// ✅ Good - Clear separation
dto/
├── request/
│   └── UserCreateRequest.java
└── response/
    └── UserResponse.java

// ❌ Bad - Reusing entity
@RestController
public class UserController {
    @PostMapping
    public User createUser(@RequestBody User user) {
        // Exposes internal structure
    }
}
```

### 5. Use Mappers for Entity-DTO Conversion

```java
// ✅ Good - Clear separation
UserResponse response = userMapper.toResponse(user);

// ❌ Bad - Direct entity exposure
@GetMapping("/{id}")
public User getUser(@PathVariable Long id) {
    return userRepository.findById(id).orElseThrow();
    // Exposes all entity fields, including internal ones
}
```

## Summary

A well-organized Spring Boot project should have:

- ✅ **Clear package structure** - Organized by layer or feature
- ✅ **Separation of concerns** - Controllers, Services, Repositories
- ✅ **DTOs for API contracts** - Separate from entities
- ✅ **Configuration classes** - Externalized config
- ✅ **Test structure** - Mirrors main structure
- ✅ **Build configuration** - Maven or Gradle

This structure provides:
- Easy navigation
- Clear responsibilities
- Testable components
- Scalable architecture
- Team collaboration friendly

Adapt the structure based on your project size and team preferences, but maintain clear boundaries between layers!

