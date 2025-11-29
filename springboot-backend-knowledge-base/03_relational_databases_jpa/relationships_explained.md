# Relationships Explained: Complete Guide A-Z

Understanding database relationships is fundamental to effective data modeling. This guide explains relationships from scratch using a consistent e-commerce example.

## What Are Relationships?

**Simple definition:**
A relationship connects two database tables, showing how records in one table relate to records in another.

**Real-world analogy:**
- A **User** places **Orders** (one user can have many orders)
- An **Order** contains **OrderItems** (one order has many items)
- Products belong to **Categories** (many products, one category)

## Types of Relationships

### 1. One-to-Many (Most Common)

**Concept:** One record in Table A relates to many records in Table B.

**Example:** One User has many Orders

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    private String name;
    
    // One user has many orders
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders = new ArrayList<>();
}

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Foreign key - links to users table
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private BigDecimal totalAmount;
}
```

**Database Structure:**
```
users table:
  id | email           | name
  1  | john@example.com| John Doe
  2  | jane@example.com| Jane Smith

orders table:
  id | user_id | total_amount
  1  | 1       | 99.99
  2  | 1       | 149.99
  3  | 2       | 49.99
```

### 2. Many-to-Many

**Concept:** Many records in Table A relate to many records in Table B.

**Example:** Products can belong to many Categories, Categories have many Products

```java
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private BigDecimal price;
    
    // Many products, many categories
    @ManyToMany
    @JoinTable(
        name = "product_categories",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();
}

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @ManyToMany(mappedBy = "categories")
    private Set<Product> products = new HashSet<>();
}
```

**Database Structure:**
```
products table:
  id | name      | price
  1  | Laptop    | 999.99
  2  | Mouse     | 29.99

categories table:
  id | name
  1  | Electronics
  2  | Accessories

product_categories table (join table):
  product_id | category_id
  1          | 1
  1          | 2
  2          | 1
  2          | 2
```

### 3. One-to-One

**Concept:** One record in Table A relates to exactly one record in Table B.

**Example:** One User has one UserProfile

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserProfile profile;
}

@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
    
    private String bio;
    private String avatarUrl;
}
```

## Complete E-Commerce Example

### Entity Definitions

```java
// User Entity
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String name;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders = new ArrayList<>();
}

// Order Entity
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private BigDecimal totalAmount;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items = new ArrayList<>();
}

// OrderItem Entity
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    private int quantity;
    private BigDecimal price;
}

// Product Entity
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private BigDecimal price;
    
    @ManyToMany
    @JoinTable(
        name = "product_categories",
        joinColumns = @JoinColumn(name = "product_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();
}
```

## Working with Relationships

### Creating Related Entities

```java
@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    public Order createOrder(Long userId, List<OrderItemRequest> items) {
        // Load user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));
        
        // Create order
        Order order = new Order();
        order.setUser(user);  // Set relationship
        
        BigDecimal total = BigDecimal.ZERO;
        
        // Create order items
        for (OrderItemRequest itemRequest : items) {
            Product product = productRepository.findById(itemRequest.productId())
                .orElseThrow();
            
            OrderItem item = new OrderItem();
            item.setOrder(order);  // Set relationship
            item.setProduct(product);  // Set relationship
            item.setQuantity(itemRequest.quantity());
            item.setPrice(product.getPrice());
            
            order.getItems().add(item);  // Add to collection
            total = total.add(product.getPrice()
                .multiply(BigDecimal.valueOf(itemRequest.quantity())));
        }
        
        order.setTotalAmount(total);
        
        return orderRepository.save(order);
    }
}
```

### Fetching Related Data

**Lazy Loading:**
```java
Order order = orderRepository.findById(orderId).orElseThrow();
List<OrderItem> items = order.getItems();  // Lazy load - triggers query
```

**Eager Loading:**
```java
@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id")
Optional<Order> findByIdWithItems(@Param("id") Long id);
```

### Cascade Operations

```java
@Entity
public class Order {
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items;
    
    // Cascade types:
    // ALL - All operations cascade
    // PERSIST - Save cascades
    // MERGE - Update cascades
    // REMOVE - Delete cascades
    // REFRESH - Refresh cascades
}
```

## Best Practices

1. ✅ Use `mappedBy` on inverse side
2. ✅ Use `@JoinColumn` on owning side
3. ✅ Consider cascade operations carefully
4. ✅ Use lazy loading by default
5. ✅ Fetch related data when needed

## Summary

Relationships connect tables:
- **One-to-Many** - Most common (User → Orders)
- **Many-to-Many** - Join table needed (Products ↔ Categories)
- **One-to-One** - Rare (User → Profile)

Understanding relationships is essential for effective data modeling!

