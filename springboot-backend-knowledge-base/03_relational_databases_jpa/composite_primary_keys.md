# Composite Primary Keys in Spring Boot JPA

Composite primary keys use multiple columns to uniquely identify a record. This guide covers implementation patterns and best practices.

## Understanding Composite Keys

### When to Use Composite Keys

**Use cases:**
- Natural business keys (order_id + item_id)
- Many-to-many join tables
- Legacy database schemas
- Domain-specific requirements

**Example:** OrderItems table where (order_id, product_id) uniquely identifies an item.

## Implementation Approaches

### Approach 1: @EmbeddedId (Recommended)

**Create Embeddable Key Class:**

```java
@Embeddable
public class OrderItemId implements Serializable {
    
    @Column(name = "order_id")
    private Long orderId;
    
    @Column(name = "product_id")
    private Long productId;
    
    // Constructors
    public OrderItemId() {}
    
    public OrderItemId(Long orderId, Long productId) {
        this.orderId = orderId;
        this.productId = productId;
    }
    
    // Getters and setters
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    
    // equals() and hashCode() - REQUIRED!
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderItemId that = (OrderItemId) o;
        return Objects.equals(orderId, that.orderId) &&
               Objects.equals(productId, that.productId);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(orderId, productId);
    }
}
```

**Use in Entity:**

```java
@Entity
@Table(name = "order_items")
public class OrderItem {
    
    @EmbeddedId
    private OrderItemId id;
    
    private int quantity;
    
    @Column(name = "unit_price")
    private BigDecimal unitPrice;
    
    // Getters and setters
    public OrderItemId getId() { return id; }
    public void setId(OrderItemId id) { this.id = id; }
    
    // Convenience methods
    public Long getOrderId() {
        return id != null ? id.getOrderId() : null;
    }
    
    public Long getProductId() {
        return id != null ? id.getProductId() : null;
    }
}
```

**Repository:**

```java
public interface OrderItemRepository extends JpaRepository<OrderItem, OrderItemId> {
    List<OrderItem> findByIdOrderId(Long orderId);
    List<OrderItem> findByIdProductId(Long productId);
}
```

**Usage:**

```java
@Service
@Transactional
public class OrderItemService {
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    public OrderItem createOrderItem(Long orderId, Long productId, int quantity, BigDecimal price) {
        OrderItem item = new OrderItem();
        item.setId(new OrderItemId(orderId, productId));
        item.setQuantity(quantity);
        item.setUnitPrice(price);
        
        return orderItemRepository.save(item);
    }
    
    public Optional<OrderItem> findById(Long orderId, Long productId) {
        OrderItemId id = new OrderItemId(orderId, productId);
        return orderItemRepository.findById(id);
    }
}
```

### Approach 2: @IdClass

**Create ID Class:**

```java
public class OrderItemId implements Serializable {
    private Long orderId;
    private Long productId;
    
    // Constructors, equals(), hashCode()
    public OrderItemId() {}
    
    public OrderItemId(Long orderId, Long productId) {
        this.orderId = orderId;
        this.productId = productId;
    }
    
    // Getters, setters, equals, hashCode
}
```

**Use in Entity:**

```java
@Entity
@Table(name = "order_items")
@IdClass(OrderItemId.class)
public class OrderItem {
    
    @Id
    @Column(name = "order_id")
    private Long orderId;
    
    @Id
    @Column(name = "product_id")
    private Long productId;
    
    private int quantity;
    private BigDecimal unitPrice;
}
```

### Approach 3: Multiple @Id Annotations (JPA 2.0+)

```java
@Entity
@Table(name = "order_items")
public class OrderItem {
    
    @Id
    @Column(name = "order_id")
    private Long orderId;
    
    @Id
    @Column(name = "product_id")
    private Long productId;
    
    private int quantity;
}
```

## Relationships with Composite Keys

### Many-to-One Relationship

```java
@Entity
@Table(name = "order_items")
public class OrderItem {
    
    @EmbeddedId
    private OrderItemId id;
    
    @ManyToOne
    @MapsId("orderId")  // Maps to orderId in composite key
    @JoinColumn(name = "order_id")
    private Order order;
    
    @ManyToOne
    @MapsId("productId")  // Maps to productId in composite key
    @JoinColumn(name = "product_id")
    private Product product;
    
    private int quantity;
}
```

## Best Practices

1. ✅ Implement `equals()` and `hashCode()` in key class
2. ✅ Make key class `Serializable`
3. ✅ Use `@EmbeddedId` for cleaner code
4. ✅ Provide convenience methods for key components
5. ✅ Consider performance implications

## Summary

Composite keys:
- Use `@EmbeddedId` (recommended) or `@IdClass`
- Implement `equals()` and `hashCode()`
- Make key class `Serializable`
- Use `@MapsId` for relationships

Implement composite keys when multiple columns uniquely identify records!

