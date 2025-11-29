# Data Validation vs Business Validation in Spring Boot

Understanding the difference between data validation and business validation is crucial for building robust Spring Boot applications. This guide explains both concepts and how to implement them effectively.

## Understanding the Difference

### Data Validation

**What:** Validates the **format and structure** of data.

**Examples:**
- Email format is valid
- String length is within range
- Number is positive
- Required fields are present

**Where:** Input layer (DTOs, request models)

**When:** Before data reaches business logic

### Business Validation

**What:** Validates **business rules** and constraints.

**Examples:**
- Email is unique (check database)
- User has sufficient balance
- Order is within business hours
- Age meets minimum requirement for feature

**Where:** Service layer (business logic)

**When:** After data validation, before processing

## Data Validation Implementation

### Using Bean Validation (Jakarta Validation)

**Step 1: Add Validation Dependencies**

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

**Step 2: Annotate DTOs**

```java
public record UserCreateRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    String email,
    
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    String name,
    
    @NotNull(message = "Age is required")
    @Min(value = 18, message = "Age must be at least 18")
    @Max(value = 150, message = "Age must be at most 150")
    Integer age,
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).*$", 
             message = "Password must contain uppercase, lowercase, and number")
    String password
) {}
```

**Step 3: Enable Validation in Controller**

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserCreateRequest request) {
        // @Valid triggers validation
        // Returns 400 if validation fails
        UserResponse user = userService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
}
```

### Custom Validators

**Create Custom Validation Annotation:**

```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = EmailNotBlacklistedValidator.class)
public @interface EmailNotBlacklisted {
    String message() default "Email is blacklisted";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

**Implement Validator:**

```java
public class EmailNotBlacklistedValidator implements ConstraintValidator<EmailNotBlacklisted, String> {
    
    private static final Set<String> BLACKLISTED_DOMAINS = Set.of(
        "tempmail.com", "throwaway.email"
    );
    
    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null) {
            return true;  // Let @NotNull handle null checks
        }
        
        String domain = email.substring(email.indexOf("@") + 1);
        return !BLACKLISTED_DOMAINS.contains(domain.toLowerCase());
    }
}
```

**Usage:**

```java
public record UserCreateRequest(
    @EmailNotBlacklisted
    String email
) {}
```

## Business Validation Implementation

### Service Layer Validation

**Example: Email Uniqueness Check**

```java
@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public UserResponse create(UserCreateRequest request) {
        // Business validation: Check email uniqueness
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email already exists");
        }
        
        // Business validation: Check age requirement
        if (request.age() < 18 && request.requiresAdultAccount()) {
            throw new BusinessException("Must be 18 or older for this account type");
        }
        
        // Create user after business validation passes
        User user = new User();
        user.setEmail(request.email());
        user.setName(request.name());
        user.setAge(request.age());
        
        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }
}
```

### Custom Business Exception

```java
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}

// Global exception handler
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        ErrorResponse error = new ErrorResponse(
            "BUSINESS_RULE_VIOLATION",
            e.getMessage()
        );
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        
        ErrorResponse error = new ErrorResponse(
            "VALIDATION_ERROR",
            "Validation failed",
            errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
```

### Complex Business Rules

```java
@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Order createOrder(OrderCreateRequest request) {
        // Business validation: User exists and is active
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new BusinessException("User not found"));
        
        if (!user.isActive()) {
            throw new BusinessException("User account is inactive");
        }
        
        // Business validation: Product exists and is in stock
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new BusinessException("Product not found"));
        
        if (product.getStock() < request.getQuantity()) {
            throw new BusinessException("Insufficient stock");
        }
        
        // Business validation: User has sufficient balance
        BigDecimal totalAmount = product.getPrice()
            .multiply(BigDecimal.valueOf(request.getQuantity()));
        
        if (user.getBalance().compareTo(totalAmount) < 0) {
            throw new BusinessException("Insufficient balance");
        }
        
        // Business validation: Order limit per day
        long todayOrderCount = orderRepository.countByUserIdAndCreatedAtAfter(
            request.getUserId(),
            LocalDate.now().atStartOfDay()
        );
        
        if (todayOrderCount >= 10) {
            throw new BusinessException("Daily order limit exceeded");
        }
        
        // All validations passed - create order
        Order order = new Order();
        order.setUser(user);
        order.setProduct(product);
        order.setQuantity(request.getQuantity());
        order.setTotalAmount(totalAmount);
        
        return orderRepository.save(order);
    }
}
```

## Separation of Concerns

### Clear Separation

**Data Validation Layer (DTOs):**
```java
public record UserCreateRequest(
    @NotBlank
    @Email
    String email,
    
    @NotBlank
    @Size(min = 2, max = 100)
    String name,
    
    @NotNull
    @Min(18)
    @Max(150)
    Integer age
) {}
```

**Business Validation Layer (Services):**
```java
@Service
public class UserService {
    
    public UserResponse create(UserCreateRequest request) {
        // Business rules
        validateEmailUniqueness(request.email());
        validateAgeRequirement(request.age());
        validateAccountLimits(request.email());
        
        // Create user
        User user = mapToEntity(request);
        return mapToResponse(userRepository.save(user));
    }
    
    private void validateEmailUniqueness(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("Email already exists");
        }
    }
    
    private void validateAgeRequirement(Integer age) {
        if (age < 18) {
            throw new BusinessException("Must be 18 or older");
        }
    }
    
    private void validateAccountLimits(String email) {
        // Complex business logic
        long accountCount = userRepository.countByEmailDomain(
            email.substring(email.indexOf("@"))
        );
        
        if (accountCount >= 5) {
            throw new BusinessException("Too many accounts from this domain");
        }
    }
}
```

## Validation Strategies

### Strategy 1: Validate Early (DTO Level)

```java
@PostMapping("/users")
public ResponseEntity<UserResponse> createUser(
        @Valid @RequestBody UserCreateRequest request) {
    // Data validation happens automatically (400 if fails)
    return ResponseEntity.ok(userService.create(request));
}
```

### Strategy 2: Validate in Service Layer

```java
@Service
public class UserService {
    
    public UserResponse create(UserCreateRequest request) {
        // Data validation already passed
        
        // Business validation
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email exists");
        }
        
        // Process
        return createUserInternal(request);
    }
}
```

### Strategy 3: Validation Groups

```java
public interface CreateGroup {}
public interface UpdateGroup {}

public class UserRequest {
    @Null(groups = CreateGroup.class, message = "ID must be null on create")
    @NotNull(groups = UpdateGroup.class, message = "ID is required on update")
    private Long id;
    
    @NotBlank(groups = {CreateGroup.class, UpdateGroup.class})
    private String email;
}

// Usage
@PostMapping("/users")
public ResponseEntity<UserResponse> create(
        @Validated(CreateGroup.class) @RequestBody UserRequest request) {
    // Only CreateGroup validations applied
}

@PutMapping("/users/{id}")
public ResponseEntity<UserResponse> update(
        @PathVariable Long id,
        @Validated(UpdateGroup.class) @RequestBody UserRequest request) {
    // Only UpdateGroup validations applied
}
```

## Error Handling

### Structured Error Response

```java
public record ErrorResponse(
    String code,
    String message,
    Map<String, String> details
) {
    public ErrorResponse(String code, String message) {
        this(code, message, null);
    }
}

@ControllerAdvice
public class GlobalExceptionHandler {
    
    // Data validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error -> {
            errors.put(error.getField(), error.getDefaultMessage());
        });
        
        ErrorResponse response = new ErrorResponse(
            "VALIDATION_ERROR",
            "Data validation failed",
            errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    // Business validation errors
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessErrors(BusinessException e) {
        ErrorResponse response = new ErrorResponse(
            "BUSINESS_RULE_VIOLATION",
            e.getMessage()
        );
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response);
    }
}
```

## Best Practices

### 1. Validate at Multiple Layers

```java
// Layer 1: Data validation (DTO)
public record UserCreateRequest(
    @Email String email
) {}

// Layer 2: Business validation (Service)
@Service
public class UserService {
    public User create(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Email exists");
        }
        // ...
    }
}
```

### 2. Use Appropriate HTTP Status Codes

```java
// 400 Bad Request - Data validation failed
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<?> handleValidation() {
    return ResponseEntity.badRequest().body(...);
}

// 422 Unprocessable Entity - Business validation failed
@ExceptionHandler(BusinessException.class)
public ResponseEntity<?> handleBusiness() {
    return ResponseEntity.unprocessableEntity().body(...);
}
```

### 3. Provide Clear Error Messages

```java
// ✅ Good - Clear message
@NotBlank(message = "Email is required and cannot be blank")
String email;

// ❌ Bad - Vague message
@NotBlank
String email;
```

### 4. Don't Mix Validation Types

```java
// ❌ Bad - Business validation in DTO validator
@Constraint(validatedBy = EmailUniqueValidator.class)
public @interface UniqueEmail {
    // This requires database access - should be business validation
}

// ✅ Good - Data validation in DTO
@Email
String email;

// ✅ Good - Business validation in service
if (userRepository.existsByEmail(email)) {
    throw new BusinessException("Email exists");
}
```

## Summary

**Data Validation:**
- ✅ Format and structure
- ✅ DTO/Request level
- ✅ Bean Validation annotations
- ✅ Returns 400 Bad Request

**Business Validation:**
- ✅ Business rules
- ✅ Service layer
- ✅ Database checks
- ✅ Returns 422 Unprocessable Entity

**Best Practices:**
1. Validate data format first (DTO)
2. Validate business rules second (Service)
3. Use appropriate status codes
4. Provide clear error messages
5. Separate concerns clearly

Proper validation ensures:
- ✅ Data integrity
- ✅ Business rule enforcement
- ✅ Better error messages
- ✅ Maintainable code

Understanding and implementing both validation types correctly leads to robust Spring Boot applications!

