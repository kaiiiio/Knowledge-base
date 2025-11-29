# Transactions in Spring: Complete Guide

Understanding transactions in Spring Boot is crucial for maintaining data integrity and consistency. This guide covers transaction management, propagation, isolation levels, and best practices.

## Understanding Transactions

### What is a Transaction?

A transaction is a sequence of operations that either:
- **All succeed** (commit) - Changes are saved
- **All fail** (rollback) - Changes are discarded

**ACID Properties:**
- **Atomicity** - All or nothing
- **Consistency** - Valid state transitions
- **Isolation** - Concurrent transactions don't interfere
- **Durability** - Committed changes persist

### The Problem Without Transactions

```java
@Service
public class OrderService {
    
    public void createOrder(Order order, List<OrderItem> items) {
        // Save order
        orderRepository.save(order);
        
        // If this fails, order exists but items don't!
        for (OrderItem item : items) {
            itemRepository.save(item);
        }
        
        // Inconsistent state if item save fails!
    }
}
```

### Solution: Declarative Transactions

```java
@Service
@Transactional  // All methods transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository itemRepository;
    
    public void createOrder(Order order, List<OrderItem> items) {
        // All operations in one transaction
        orderRepository.save(order);
        
        for (OrderItem item : items) {
            item.setOrder(order);
            itemRepository.save(item);
        }
        
        // If any save fails, all changes rolled back
    }
}
```

## Spring Transaction Management

### 1. Declarative Transactions (@Transactional)

**Most common approach - declarative:**

```java
@Service
public class UserService {
    
    @Transactional  // Method-level transaction
    public User createUser(UserCreateRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        User saved = userRepository.save(user);
        
        // If this fails, user creation is rolled back
        createUserProfile(saved);
        
        return saved;
    }
    
    @Transactional(rollbackFor = Exception.class)
    public void updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id).orElseThrow();
        user.setName(request.getName());
        userRepository.save(user);
    }
}
```

### 2. Programmatic Transactions

**Less common - programmatic control:**

```java
@Service
public class UserService {
    
    @Autowired
    private TransactionTemplate transactionTemplate;
    
    public User createUser(UserCreateRequest request) {
        return transactionTemplate.execute(status -> {
            User user = new User();
            user.setEmail(request.getEmail());
            User saved = userRepository.save(user);
            
            if (saved.getEmail().contains("test")) {
                status.setRollbackOnly();  // Manual rollback
            }
            
            return saved;
        });
    }
}
```

## Transaction Propagation

### Understanding Propagation Levels

**Propagation defines transaction behavior when method calls another transactional method.**

### Propagation Types

#### REQUIRED (Default)

```java
@Service
public class UserService {
    
    @Transactional(propagation = Propagation.REQUIRED)
    public void method1() {
        method2();  // Uses same transaction
    }
    
    @Transactional(propagation = Propagation.REQUIRED)
    public void method2() {
        // Part of method1's transaction
    }
}
```

**Behavior:**
- If transaction exists → Join it
- If no transaction → Create new one

#### REQUIRES_NEW

```java
@Service
public class UserService {
    
    @Transactional(propagation = Propagation.REQUIRED)
    public void method1() {
        // Transaction 1
        method2();  // Starts NEW transaction
    }
    
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void method2() {
        // Transaction 2 (independent)
        // Can commit even if method1 rolls back
    }
}
```

**Use case:** Audit logging that should persist even if main transaction fails

#### SUPPORTS

```java
@Transactional(propagation = Propagation.SUPPORTS)
public void method() {
    // Uses existing transaction if present
    // No transaction if none exists
}
```

#### NOT_SUPPORTED

```java
@Transactional(propagation = Propagation.NOT_SUPPORTED)
public void method() {
    // Suspends current transaction
    // Runs without transaction
}
```

#### MANDATORY

```java
@Transactional(propagation = Propagation.MANDATORY)
public void method() {
    // Requires existing transaction
    // Throws exception if no transaction
}
```

#### NEVER

```java
@Transactional(propagation = Propagation.NEVER)
public void method() {
    // Must NOT be called within transaction
    // Throws exception if transaction exists
}
```

#### NESTED

```java
@Transactional(propagation = Propagation.NESTED)
public void method() {
    // Creates savepoint
    // Can rollback to savepoint
    // Only works with JDBC (not JPA)
}
```

## Isolation Levels

### Understanding Isolation

**Isolation controls how transactions see each other's changes.**

### Isolation Levels

#### READ_UNCOMMITTED (Lowest)

```java
@Transactional(isolation = Isolation.READ_UNCOMMITTED)
public void readUncommitted() {
    // Can see uncommitted changes
    // Dirty reads possible
}
```

**Problems:**
- Dirty reads
- Non-repeatable reads
- Phantom reads

#### READ_COMMITTED (PostgreSQL Default)

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public void readCommitted() {
    // Only sees committed changes
    // No dirty reads
}
```

**Still possible:**
- Non-repeatable reads
- Phantom reads

#### REPEATABLE_READ (MySQL Default)

```java
@Transactional(isolation = Isolation.REPEATABLE_READ)
public void repeatableRead() {
    // Consistent reads within transaction
    // No non-repeatable reads
}
```

**Still possible:**
- Phantom reads

#### SERIALIZABLE (Highest)

```java
@Transactional(isolation = Isolation.SERIALIZABLE)
public void serializable() {
    // Fully isolated
    // No concurrency issues
    // Slower performance
}
```

**Trade-off:** Best isolation, worst performance

### Isolation Example

```java
@Service
public class AccountService {
    
    // Transaction 1
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void transferMoney(Long fromId, Long toId, BigDecimal amount) {
        Account from = accountRepository.findById(fromId).orElseThrow();
        Account to = accountRepository.findById(toId).orElseThrow();
        
        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));
        
        accountRepository.save(from);
        accountRepository.save(to);
    }
}
```

## Transaction Best Practices

### 1. Keep Transactions Short

```java
// ✅ Good - Transaction only around database operations
@Transactional
public User createUser(UserCreateRequest request) {
    User user = new User();
    user.setEmail(request.getEmail());
    return userRepository.save(user);
}

// ❌ Bad - Long-running operations in transaction
@Transactional
public User createUser(UserCreateRequest request) {
    User user = new User();
    user.setEmail(request.getEmail());
    User saved = userRepository.save(user);
    
    // Bad: External API call in transaction
    sendWelcomeEmail(saved.getEmail());  // Blocks transaction!
    
    // Bad: File I/O in transaction
    writeLogFile(saved.getId());
    
    return saved;
}
```

### 2. Use Read-Only Transactions

```java
@Transactional(readOnly = true)
public List<User> findAllUsers() {
    return userRepository.findAll();
}
```

**Benefits:**
- Better performance
- No write locks
- Clear intent

### 3. Specify Rollback Conditions

```java
@Transactional(rollbackFor = {Exception.class})
public void processOrder(Order order) {
    // Rolls back on any exception
}

@Transactional(noRollbackFor = {ValidationException.class})
public void createUser(UserCreateRequest request) {
    // Doesn't rollback on ValidationException
}
```

### 4. Transaction Boundaries

```java
// ✅ Good - Service layer defines transaction boundaries
@Service
@Transactional
public class OrderService {
    public Order createOrder(OrderRequest request) {
        // Transaction boundary here
        Order order = new Order();
        // ... save order and items
        return order;
    }
}

// ✅ Good - Repository operations are transactional
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Spring Data JPA methods are transactional
}
```

### 5. Handle Transaction Failures

```java
@Service
public class PaymentService {
    
    @Transactional
    public PaymentResult processPayment(PaymentRequest request) {
        try {
            Payment payment = createPayment(request);
            processWithGateway(payment);
            return PaymentResult.success(payment);
        } catch (PaymentException e) {
            // Transaction automatically rolls back
            log.error("Payment failed", e);
            throw e;
        }
    }
}
```

## Common Patterns

### Pattern 1: Multi-Repository Transaction

```java
@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    public Order createOrder(OrderRequest request) {
        // All in one transaction
        Order order = orderRepository.save(new Order());
        
        inventoryRepository.reduceStock(request.getProductId(), request.getQuantity());
        paymentRepository.createPayment(order.getId(), request.getAmount());
        
        return order;
        // All succeed or all fail
    }
}
```

### Pattern 2: Conditional Rollback

```java
@Service
public class OrderService {
    
    @Transactional
    public Order createOrder(OrderRequest request) {
        Order order = orderRepository.save(new Order());
        
        try {
            processPayment(order);
        } catch (PaymentException e) {
            // Manually rollback
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            throw new OrderCreationException("Payment failed", e);
        }
        
        return order;
    }
}
```

### Pattern 3: Transaction with Retry

```java
@Service
public class OrderService {
    
    @Retryable(value = {OptimisticLockingFailureException.class}, maxAttempts = 3)
    @Transactional
    public Order updateOrder(Long id, OrderUpdateRequest request) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setStatus(request.getStatus());
        return orderRepository.save(order);
    }
}
```

## Testing Transactions

### Unit Test with Mock

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    
    @Mock
    private OrderRepository orderRepository;
    
    @InjectMocks
    private OrderService orderService;
    
    @Test
    void shouldCreateOrder() {
        // Test transaction logic
    }
}
```

### Integration Test with Real Transaction

```java
@SpringBootTest
@Transactional  // Rolls back after test
class OrderServiceIntegrationTest {
    
    @Autowired
    private OrderService orderService;
    
    @Test
    @Transactional
    @Rollback  // Explicit rollback
    void shouldCreateOrderInTransaction() {
        OrderRequest request = new OrderRequest(...);
        Order order = orderService.createOrder(request);
        
        assertThat(order).isNotNull();
        // Changes rolled back after test
    }
}
```

## Summary

Transaction best practices:

1. ✅ **Use @Transactional** - Declarative approach
2. ✅ **Keep transactions short** - Only database operations
3. ✅ **Use read-only** - For read operations
4. ✅ **Specify rollback** - Control rollback behavior
5. ✅ **Understand propagation** - How transactions interact
6. ✅ **Choose isolation** - Balance consistency and performance

Proper transaction management ensures:
- ✅ Data integrity
- ✅ Consistency
- ✅ Reliable operations
- ✅ Error handling

Transactions are essential for maintaining data integrity in Spring Boot applications!

