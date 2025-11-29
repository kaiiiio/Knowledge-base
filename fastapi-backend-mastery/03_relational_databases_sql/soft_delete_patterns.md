# Soft Delete Patterns

Soft deletes mark records as deleted without actually removing them from the database, enabling recovery and audit trails.

## Basic Soft Delete Implementation

### Model with Soft Delete

```python
from sqlalchemy import Column, DateTime, Boolean
from datetime import datetime

class BaseModel(Base):
    __abstract__ = True
    
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)  # NULL = not deleted
    
    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String, unique=True)
    name = Column(String)
    deleted_at = Column(DateTime, nullable=True)
```

### Query Filtering

```python
from sqlalchemy import select

# Only get non-deleted records
async def get_active_users(session: AsyncSession):
    result = await session.execute(
        select(User).where(User.deleted_at.is_(None))
    )
    return list(result.scalars().all())

# Get all including deleted
async def get_all_users(session: AsyncSession):
    result = await session.execute(select(User))
    return list(result.scalars().all())

# Get only deleted
async def get_deleted_users(session: AsyncSession):
    result = await session.execute(
        select(User).where(User.deleted_at.isnot(None))
    )
    return list(result.scalars().all())
```

## Repository Pattern with Soft Delete

```python
class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def get_by_id(self, user_id: int, include_deleted: bool = False):
        stmt = select(User).where(User.id == user_id)
        if not include_deleted:
            stmt = stmt.where(User.deleted_at.is_(None))
        
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
    
    async def soft_delete(self, user_id: int):
        user = await self.get_by_id(user_id)
        if user:
            user.deleted_at = datetime.utcnow()
            await self.session.commit()
        return user
    
    async def restore(self, user_id: int):
        user = await self.get_by_id(user_id, include_deleted=True)
        if user and user.is_deleted:
            user.deleted_at = None
            await self.session.commit()
        return user
    
    async def hard_delete(self, user_id: int):
        """Permanently delete (use with caution)"""
        user = await self.get_by_id(user_id, include_deleted=True)
        if user:
            await self.session.delete(user)
            await self.session.commit()
        return user
```

## Base Query Mixin

### Reusable Soft Delete Filter

```python
from sqlalchemy.ext.declarative import declared_attr

class SoftDeleteMixin:
    deleted_at = Column(DateTime, nullable=True)
    
    @declared_attr
    def __table_args__(cls):
        return (
            Index(f'idx_{cls.__tablename__}_deleted_at', 'deleted_at'),
        )
    
    def soft_delete(self):
        self.deleted_at = datetime.utcnow()
    
    def restore(self):
        self.deleted_at = None
    
    @classmethod
    def active_filter(cls):
        return cls.deleted_at.is_(None)
    
    @classmethod
    def deleted_filter(cls):
        return cls.deleted_at.isnot(None)

# Usage
class User(Base, SoftDeleteMixin):
    __tablename__ = "users"
    email = Column(String)

# Query with mixin
active_users = await session.execute(
    select(User).where(User.active_filter())
)
```

## Cascade Soft Deletes

### Related Records

```python
class Order(Base, SoftDeleteMixin):
    __tablename__ = "orders"
    user_id = Column(Integer, ForeignKey("users.id"))
    items = relationship("OrderItem")

class OrderItem(Base):
    __tablename__ = "order_items"
    order_id = Column(Integer, ForeignKey("orders.id"))

# Soft delete order and related items
async def soft_delete_order(order_id: int, session: AsyncSession):
    order = await session.get(Order, order_id)
    
    # Option 1: Cascade soft delete
    order.soft_delete()
    for item in order.items:
        item.deleted_at = datetime.utcnow()
    
    await session.commit()
```

## Unique Constraints with Soft Delete

### Handling Unique Constraints

```python
# Problem: Unique constraint conflicts with soft-deleted records
# Solution: Partial unique index

# Migration
from alembic import op

def upgrade():
    # Regular unique constraint (allows duplicates if deleted)
    op.create_unique_constraint(
        'uq_user_email',
        'users',
        ['email']
    )
    
    # PostgreSQL: Partial unique index (only for non-deleted)
    op.execute("""
        CREATE UNIQUE INDEX uq_user_email_active
        ON users (email)
        WHERE deleted_at IS NULL
    """)

# In application
async def create_user(email: str, session: AsyncSession):
    # Check for active user with email
    existing = await session.execute(
        select(User).where(
            User.email == email,
            User.deleted_at.is_(None)
        )
    )
    if existing.scalar_one_or_none():
        raise ValueError("Email already in use")
    
    # Can create even if deleted user exists
    user = User(email=email)
    session.add(user)
    await session.commit()
```

## Automatic Filtering

### Query Filter Mixin

```python
from sqlalchemy import event
from sqlalchemy.orm import Query

class SoftDeleteQuery(Query):
    def __new__(cls, *args, **kwargs):
        obj = super().__new__(cls)
        return obj.filter_by(deleted_at=None)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._with_deleted = False
    
    def with_deleted(self):
        self._with_deleted = True
        return self
    
    def filter(self, *args, **kwargs):
        if not self._with_deleted:
            # Auto-filter deleted records
            return super().filter(*args, **kwargs).filter(
                self._mapper_zero().class_.deleted_at.is_(None)
            )
        return super().filter(*args, **kwargs)

# Configure session
Session = sessionmaker(query_cls=SoftDeleteQuery)
```

## Best Practices

### 1. Index deleted_at Column

```python
# Migration
Index('idx_users_deleted_at', User.deleted_at)
```

### 2. Cleanup Old Deleted Records

```python
# Scheduled job to permanently delete old soft-deleted records
async def cleanup_old_deleted(days: int = 90, session: AsyncSession):
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    old_deleted = await session.execute(
        select(User).where(
            User.deleted_at < cutoff_date
        )
    )
    
    for user in old_deleted.scalars().all():
        await session.delete(user)  # Hard delete
    
    await session.commit()
```

### 3. Audit Trail

```python
class User(Base):
    deleted_at = Column(DateTime, nullable=True)
    deleted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    def soft_delete(self, deleted_by: Optional[int] = None):
        self.deleted_at = datetime.utcnow()
        self.deleted_by = deleted_by
```

### 4. API Endpoints

```python
@app.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = UserRepository(db)
    user = await repo.soft_delete(user_id, deleted_by=current_user.id)
    return {"message": "User deleted", "user_id": user_id}

@app.post("/users/{user_id}/restore")
async def restore_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    repo = UserRepository(db)
    user = await repo.restore(user_id)
    return {"message": "User restored", "user": user}
```

## Tradeoffs

**Pros:**
- ✅ Recovery possible
- ✅ Audit trail
- ✅ Referential integrity maintained
- ✅ Data retention for compliance

**Cons:**
- ❌ More complex queries
- ❌ Storage overhead
- ❌ Need cleanup jobs
- ❌ Unique constraints more complex

## Summary

Soft deletes provide:
- Data recovery capability
- Audit trails
- Maintained relationships
- Compliance with data retention

Use soft deletes when:
- Data recovery is important
- Audit requirements exist
- Relationships must be preserved
- Compliance requires data retention

Hard deletes when:
- Performance is critical
- Storage is limited
- Data sensitivity requires removal
- No recovery needed

