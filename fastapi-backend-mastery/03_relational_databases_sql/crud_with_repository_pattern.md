# CRUD with Repository Pattern

The Repository pattern abstracts data access logic, making code more maintainable, testable, and independent of the ORM.

## What is the Repository Pattern?

The Repository pattern provides a collection-like interface for accessing domain objects while hiding the details of data access.

**Benefits:**
- Separation of concerns (business logic vs data access)
- Easier testing (mock repositories)
- Flexibility to change data sources
- Consistent interface for data operations

## Basic Repository Implementation

### Interface Definition

```python
from abc import ABC, abstractmethod
from typing import Optional, List
from app.models import User

class UserRepositoryInterface(ABC):
    @abstractmethod
    async def get_by_id(self, user_id: int) -> Optional[User]:
        pass
    
    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        pass
    
    @abstractmethod
    async def create(self, user_data: dict) -> User:
        pass
    
    @abstractmethod
    async def update(self, user_id: int, updates: dict) -> User:
        pass
    
    @abstractmethod
    async def delete(self, user_id: int) -> bool:
        pass
    
    @abstractmethod
    async def list(self, skip: int = 0, limit: int = 100) -> List[User]:
        pass
```

### SQLAlchemy Implementation

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import Optional, List
from app.models import User

class UserRepository(UserRepositoryInterface):
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def create(self, user_data: dict) -> User:
        user = User(**user_data)
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user
    
    async def update(self, user_id: int, updates: dict) -> User:
        user = await self.get_by_id(user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
        
        for key, value in updates.items():
            setattr(user, key, value)
        
        await self.session.flush()
        await self.session.refresh(user)
        return user
    
    async def delete(self, user_id: int) -> bool:
        result = await self.session.execute(
            delete(User).where(User.id == user_id)
        )
        return result.rowcount > 0
    
    async def list(self, skip: int = 0, limit: int = 100) -> List[User]:
        result = await self.session.execute(
            select(User)
            .offset(skip)
            .limit(limit)
            .order_by(User.created_at.desc())
        )
        return list(result.scalars().all())
```

## Generic Repository Base

### Reusable Base Repository

```python
from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete

ModelType = TypeVar("ModelType")

class BaseRepository(Generic[ModelType]):
    def __init__(self, session: AsyncSession, model: Type[ModelType]):
        self.session = session
        self.model = model
    
    async def get_by_id(self, id: int) -> Optional[ModelType]:
        return await self.session.get(self.model, id)
    
    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        **filters
    ) -> List[ModelType]:
        stmt = select(self.model)
        
        # Apply filters
        for key, value in filters.items():
            if hasattr(self.model, key):
                stmt = stmt.where(getattr(self.model, key) == value)
        
        stmt = stmt.offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def create(self, **kwargs) -> ModelType:
        instance = self.model(**kwargs)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance
    
    async def update(self, id: int, **updates) -> Optional[ModelType]:
        instance = await self.get_by_id(id)
        if not instance:
            return None
        
        for key, value in updates.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        
        await self.session.flush()
        await self.session.refresh(instance)
        return instance
    
    async def delete(self, id: int) -> bool:
        instance = await self.get_by_id(id)
        if not instance:
            return False
        
        await self.session.delete(instance)
        await self.session.flush()
        return True
    
    async def exists(self, **filters) -> bool:
        stmt = select(self.model)
        for key, value in filters.items():
            if hasattr(self.model, key):
                stmt = stmt.where(getattr(self.model, key) == value)
        
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

# Usage
class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, User)
    
    # Add custom methods
    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
```

## Using Repositories in Services

### Service Layer with Repository

```python
from app.repositories.user_repository import UserRepository
from app.core.exceptions import NotFoundError, ValidationError

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo
    
    async def get_user(self, user_id: int) -> User:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError(f"User {user_id} not found")
        return user
    
    async def create_user(self, user_data: dict) -> User:
        # Business validation
        if await self.user_repo.get_by_email(user_data["email"]):
            raise ValidationError("Email already exists")
        
        # Create user
        return await self.user_repo.create(user_data)
    
    async def update_user(
        self,
        user_id: int,
        updates: dict
    ) -> User:
        user = await self.get_user(user_id)  # Raises if not found
        
        # Business validation
        if "email" in updates:
            existing = await self.user_repo.get_by_email(updates["email"])
            if existing and existing.id != user_id:
                raise ValidationError("Email already in use")
        
        return await self.user_repo.update(user_id, updates)
```

## Dependency Injection Setup

### FastAPI Dependency

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db

def get_user_repository(
    session: AsyncSession = Depends(get_db)
) -> UserRepository:
    return UserRepository(session)

def get_user_service(
    repo: UserRepository = Depends(get_user_repository)
) -> UserService:
    return UserService(repo)

# Usage in routes
@app.get("/users/{user_id}")
async def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service)
):
    return await service.get_user(user_id)
```

## Advanced Repository Patterns

### Repository with Relationships

```python
class OrderRepository(BaseRepository[Order]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Order)
    
    async def get_with_items(self, order_id: int) -> Optional[Order]:
        result = await self.session.execute(
            select(Order)
            .options(selectinload(Order.items))
            .where(Order.id == order_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_user_id(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Order]:
        result = await self.session.execute(
            select(Order)
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
```

### Repository with Complex Queries

```python
class UserRepository(BaseRepository[User]):
    async def search(
        self,
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        stmt = select(User).where(
            or_(
                User.email.ilike(f"%{query}%"),
                User.name.ilike(f"%{query}%")
            )
        ).offset(skip).limit(limit)
        
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
    
    async def get_active_users(self) -> List[User]:
        result = await self.session.execute(
            select(User).where(User.is_active == True)
        )
        return list(result.scalars().all())
```

## Testing Repositories

### Mock Repository for Testing

```python
from unittest.mock import AsyncMock

class MockUserRepository:
    def __init__(self):
        self.users = {}
        self.next_id = 1
    
    async def get_by_id(self, user_id: int) -> Optional[User]:
        return self.users.get(user_id)
    
    async def create(self, user_data: dict) -> User:
        user = User(id=self.next_id, **user_data)
        self.users[self.next_id] = user
        self.next_id += 1
        return user

# Usage in tests
@pytest.mark.asyncio
async def test_user_service():
    mock_repo = MockUserRepository()
    service = UserService(mock_repo)
    
    user_data = {"email": "test@example.com", "name": "Test User"}
    user = await service.create_user(user_data)
    
    assert user.email == "test@example.com"
    assert await service.get_user(user.id) == user
```

## Best Practices

1. **Keep repositories focused** - One repository per entity
2. **Use base repository** - Reduce code duplication
3. **Business logic in services** - Not in repositories
4. **Return domain objects** - Not raw database rows
5. **Handle not found** - Return Optional or raise exceptions
6. **Test with mocks** - Easy to test services

## Summary

The Repository pattern provides:
- ✅ Clean separation of data access
- ✅ Easy testing with mocks
- ✅ Flexibility to change data sources
- ✅ Consistent interface for CRUD operations

Use repositories to abstract data access while keeping business logic in services.

