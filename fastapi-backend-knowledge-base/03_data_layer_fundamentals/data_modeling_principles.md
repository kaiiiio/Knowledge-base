# Data Modeling Principles

Effective data modeling is the foundation of a robust backend. This guide covers core principles for designing data models in FastAPI applications.

## Core Principles

### 1. **Normalization vs Denormalization**

Normalization reduces data redundancy, while denormalization improves read performance.

**Normalized Approach (3NF):** Separate tables with foreign keys.

```python
# Separate tables: Each entity in its own table.
class User(Base):
    id: int
    email: str

class UserProfile(Base):
    user_id: int  # Foreign key: Links to users table
    first_name: str
    last_name: str
    bio: str

class UserPreferences(Base):
    user_id: int  # Foreign key: Links to users table
    theme: str
    language: str
```

**Denormalized Approach:** Single table with embedded data.

```python
# Single document/table: All data in one place (faster reads).
class User(Base):
    id: int
    email: str
    profile: JSON  # Embedded data: No joins needed
    preferences: JSON  # Embedded data: Faster access
```

**When to Use:** **Normalize** when data integrity is critical, writes are frequent, and relationships are complex. **Denormalize** when read performance is critical, data doesn't change often, and relationships are simple.

### 2. **Idempotency Keys**

Ensure operations can be safely retried.

```python
class Payment(Base):
    id: int
    idempotency_key: str = Field(unique=True, index=True)
    amount: float
    status: str

# Usage: Idempotent payment processing.
async def process_payment(
    idempotency_key: str,
    amount: float,
    db: AsyncSession
):
    # Check if already processed: Look for existing payment with same key.
    existing = await db.execute(
        select(Payment).where(
            Payment.idempotency_key == idempotency_key  # Unique key prevents duplicates
        )
    )
    if existing.scalar_one_or_none():
        return existing  # Return existing result: Safe to retry
    
    # Process payment: Only process if not already done.
    payment = Payment(
        idempotency_key=idempotency_key,
        amount=amount,
        status="pending"
    )
    db.add(payment)
    await db.commit()
    return payment
```

### 3. **Soft Deletes**

Keep records for audit trails while making them invisible to normal queries.

```python
# Soft delete: Mark as deleted instead of removing record.
class User(Base):
    id: int
    email: str
    deleted_at: Optional[datetime] = None  # NULL = active, timestamp = deleted
    
    @hybrid_property
    def is_deleted(self):
        return self.deleted_at is not None  # Check if deleted

# Query filter: Only return active (non-deleted) users.
def get_active_users():
    return select(User).where(User.deleted_at.is_(None))  # Filter out deleted records
```

### 4. **Audit Fields**

Track creation and modification times.

```python
# Base model: Audit fields for all tables.
class BaseModel(Base):
    __abstract__ = True  # Abstract base - not a real table
    
    id: int = Field(primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)  # Auto-set on create
    updated_at: datetime = Field(default_factory=datetime.utcnow)  # Auto-set on create
    created_by: Optional[int] = None  # User who created
    updated_by: Optional[int] = None  # User who last updated
    
    # Event listener: Auto-update updated_at on every update.
    @event.listens_for(BaseModel, "before_update")
    def receive_before_update(mapper, connection, target):
        target.updated_at = datetime.utcnow()  # Update timestamp automatically
```

### 5. **Immutable Primary Keys**

Use immutable, stable identifiers.

```python
# ✅ Good: UUID or auto-incrementing integer - immutable and stable.
class User(Base):
    id: UUID = Field(default_factory=uuid4, primary_key=True)  # UUID: Unique, immutable

# ❌ Bad: Email or name as primary key - can change, not stable.
class User(Base):
    email: str = Field(primary_key=True)  # Can change! - Breaks foreign keys if email changes
```

## Common Patterns

### 1. **Polymorphic Associations**

Handle different entity types in relationships.

```python
# Polymorphic association: One table for multiple entity types.
class Event(Base):
    id: int
    event_type: str  # "user_created", "payment_processed"
    entity_type: str  # "User", "Payment" - Type of entity
    entity_id: int  # ID of the entity (can be User.id or Payment.id)
    metadata: JSON  # Additional event data
```

### 2. **Versioned Entities**

Track changes over time.

```python
class UserVersion(Base):
    id: int
    user_id: int
    version: int
    data: JSON  # Snapshot of user data
    created_at: datetime

class User(Base):
    id: int
    email: str
    version: int = 1
    
    # Versioned save: Create snapshot before updating.
    async def save_with_version(self, db: AsyncSession):
        # Save version before update: Create snapshot of current state.
        version = UserVersion(
            user_id=self.id,
            version=self.version,  # Current version number
            data=self.to_dict()  # Snapshot of user data
        )
        db.add(version)
        self.version += 1  # Increment version
        await db.commit()
```

### 3. **Status State Machines**

Model state transitions explicitly.

```python
from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class Order(Base):
    id: int
    status: OrderStatus = OrderStatus.PENDING
    status_history: List[JSON] = Field(default_factory=list)
    
    # State transition: Validate and record state change.
    def transition_to(self, new_status: OrderStatus):
        # Valid transitions: Define allowed state changes.
        valid_transitions = {
            OrderStatus.PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            OrderStatus.CONFIRMED: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
            # ...
        }
        # Validate transition: Check if transition is allowed.
        if new_status not in valid_transitions.get(self.status, []):
            raise ValueError(f"Invalid transition: {self.status} -> {new_status}")
        
        # Record history: Track state changes for audit.
        self.status_history.append({
            "from": self.status,
            "to": new_status,
            "at": datetime.utcnow()
        })
        self.status = new_status  # Update status
```

## Best Practices

### 1. **Use Appropriate Data Types**

```python
# ✅ Good: Use appropriate types with validation.
class User(Base):
    email: EmailStr  # Validated email: Pydantic validates format
    age: int = Field(ge=0, le=150)  # Constrained: Must be between 0 and 150
    balance: Decimal = Field(decimal_places=2)  # Precise: No floating point errors

# ❌ Bad: Weak types without validation.
class User(Base):
    email: str  # No validation: Could be invalid email
    age: str  # Wrong type: Should be int
    balance: float  # Precision issues: Use Decimal for money
```

### 2. **Index Strategically**

```python
# Strategic indexing: Index frequently queried columns.
class User(Base):
    id: int = Field(primary_key=True)
    email: str = Field(index=True, unique=True)  # Frequently queried: Index for fast lookups
    created_at: datetime = Field(index=True)  # Range queries: Index for date range queries
    status: str = Field(index=True)  # Filtered queries: Index for WHERE status = ...
    
    # Composite index: Index multiple columns together (for multi-column queries).
    __table_args__ = (
        Index('idx_user_status_created', 'status', 'created_at'),  # For queries filtering by status and date
    )
```

### 3. **Handle Relationships Properly**

```python
# One-to-Many: One user has many orders.
class User(Base):
    id: int
    orders: List["Order"] = relationship("Order", back_populates="user")  # One-to-many relationship

class Order(Base):
    id: int
    user_id: int = Field(foreign_key="users.id")  # Foreign key to users
    user: User = relationship("User", back_populates="orders")  # Many-to-one relationship

# Many-to-Many: Orders can have many items, items can be in many orders.
order_items = Table(
    'order_items',  # Junction table for many-to-many
    Base.metadata,
    Column('order_id', Integer, ForeignKey('orders.id')),  # Foreign key to orders
    Column('item_id', Integer, ForeignKey('items.id'))  # Foreign key to items
)
```

### 4. **Consider Query Patterns**

Design models based on how data is accessed:

```python
# If you always fetch user with profile: Use eager loading (joined).
class User(Base):
    id: int
    profile: UserProfile = relationship(
        "UserProfile",
        lazy="joined"  # Always fetch together: Single query with JOIN
    )

# If profile is rarely needed: Use lazy loading (select).
class User(Base):
    id: int
    profile: UserProfile = relationship(
        "UserProfile",
        lazy="select"  # Lazy load when accessed: Separate query when needed
    )
```

## Summary

Effective data modeling requires: Balancing normalization with performance needs, using idempotency for safe retries, implementing audit trails, choosing appropriate data types, strategic indexing, and modeling relationships correctly.

