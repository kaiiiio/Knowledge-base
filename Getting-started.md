# FastAPI for Express.js Developers  
### A Production-Grade Migration Guide  
*From Express → FastAPI, with battle-tested patterns*

---

## Table of Contents
1. [Why FastAPI?](#why-fastapi)
2. [Core Concepts: Express vs FastAPI](#core-concepts-express-vs-fastapi)
3. [Project Structure (Production Ready)](#project-structure)
4. [Routing & Request Handling](#routing--request-handling)
5. [Request Validation & Pydantic Models](#request-validation--pydantic-models)
6. **Middleware** (Global + Route-Specific)
7. **Dependency Injection & Reusable Components**
8. **Async/Await & Database Integration (SQLAlchemy + PostgreSQL)**
9. **Authentication & JWT**
10. **Error Handling & Custom Exceptions**
11. **Testing (Pytest + Async)**
12. **Logging & Monitoring**
13. **Docker & Deployment (Uvicorn + Gunicorn)**
14. **Performance & Scalability Tips**
15. [Key Differences Summary](#key-differences-summary)

---

## Why FastAPI?

| Feature               | Express (Node.js)         | FastAPI (Python)             |
|-----------------------|---------------------------|------------------------------|
| Language              | JavaScript/TypeScript     | Python (Typed, async-first)  |
| Type Safety           | Optional (TS)             | **Built-in (Pydantic + mypy)** |
| Validation            | Manual or libraries (Joi) | **Automatic (Pydantic)**     |
| Docs                  | Swagger via 3rd party     | **Auto-generated OpenAPI**   |
| Async Support         | Native                    | Native + **first-class**     |
| Performance           | Fast (V8)                 | **Faster (Starlette + Cython)** |

> ✅ FastAPI gives you TypeScript-like dev experience in Python with auto-validation, serialization, docs, and async—all out of the box.

---

## Core Concepts: Express vs FastAPI

| Express Concept       | FastAPI Equivalent           |
|-----------------------|------------------------------|
| `app = express()`     | `app = FastAPI()`            |
| `app.get('/path', ...)` | `@app.get('/path')`         |
| Middleware (`app.use()`) | `@app.middleware()` or `Depends()` |
| Request body parsing  | Pydantic `BaseModel`         |
| Error handling        | Custom exception handlers    |
| Async routes          | `async def` + `await`        |
| Environment config    | Pydantic `Settings` + `.env` |

---

## Project Structure (Production Ready)

```
my_fastapi_app/
├── app/
│   ├── __init__.py
│   ├── main.py                 # App factory + lifespan
│   ├── core/
│   │   ├── config.py           # Settings, env vars
│   │   ├── security.py         # JWT, hashing
│   │   └── logging.py          # Structured logging
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependency injection
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── routes/
│   │       │   ├── users.py
│   │       │   └── auth.py
│   │       └── schemas/         # Pydantic models
│   │           ├── user.py
│   │           └── token.py
│   ├── models/                 # SQLAlchemy models
│   │   └── user.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py          # DB session + engine
│   │   └── base.py
│   └── utils/
│       └── exceptions.py       # Custom errors
├── tests/
│   ├── conftest.py
│   └── test_users.py
├── alembic/                    # DB migrations
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .env
```

> 💡 **Rule**: Keep logic out of `main.py`. Use dependency injection for clean, testable code.

---

## Routing & Request Handling

### Express
```js
app.get('/users/:id', (req, res) => {
  const id = req.params.id;
  const name = req.query.name;
  res.json({ id, name });
});
```

### FastAPI
```python
from fastapi import FastAPI, Path, Query

app = FastAPI()

@app.get("/users/{user_id}")
async def read_user(
    user_id: int = Path(..., gt=0),      # Path validation
    name: str | None = Query(None, min_length=2, max_length=50)
):
    return {"user_id": user_id, "name": name}
```

✅ **Auto-validation**: FastAPI validates `user_id` is int > 0, `name` length, and returns **422** on error.

---

## Request Validation & Pydantic Models

### Express (manual or Joi)
```js
const schema = Joi.object({ email: Joi.string().email().required() });
const { error, value } = schema.validate(req.body);
```

### FastAPI (Pydantic)
```python
# app/api/v1/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None

# In route
@app.post("/users/")
async def create_user(user: UserCreate):
    # user is auto-validated & typed
    return {"email": user.email, "name": user.full_name}
```

> ✅ **Pydantic = Zod/Joi + TypeScript interface in one**

---

## Middleware

### Express
```js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### FastAPI
```python
# Global middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url} - {process_time:.2f}s")
    return response
```

> 🔒 **For auth, rate-limiting, CORS**: Use **CORSMiddleware**, **TrustedHostMiddleware**, or custom.

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Dependency Injection & Reusable Logic

FastAPI’s **`Depends()`** replaces Express middleware for route-specific logic.

### Example: Get current user from JWT

```python
# app/api/deps.py
from fastapi import Depends, Header, HTTPException
from app.core.security import verify_token

async def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]

# In route
@app.get("/profile")
async def profile(user_id: str = Depends(get_current_user)):
    return {"user_id": user_id}
```

> ✅ **Reusable, testable, and explicit**—no magical `req.user`.

---

## Async/Await & Database (SQLAlchemy + PostgreSQL)

### Setup DB Session (using SQLAlchemy async)

```python
# app/db/session.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with async_session() as session:
        yield session
```

### Use in route

```python
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession

@app.post("/users/")
async def create_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    db_user = User(email=user_in.email)
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user
```

> 🔥 **Async ORM = Non-blocking DB calls**. Use **SQLModel** (by FastAPI author) for simpler syntax.

---

## Authentication & JWT

```python
# app/core/security.py
from jose import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
```

> 📦 Use `python-jose[cryptography]` and `passlib[bcrypt]`.

---

## Error Handling & Custom Exceptions

```python
# app/utils/exceptions.py
from fastapi import HTTPException
from starlette.responses import JSONResponse
from starlette.requests import Request

class UserNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail="User not found")

@app.exception_handler(UserNotFound)
async def user_not_found_handler(request: Request, exc: UserNotFound):
    return JSONResponse(
        status_code=404,
        content={"error": "USER_NOT_FOUND", "message": exc.detail}
    )
```

> ✅ Return consistent error formats across your API.

---

## Testing (Pytest + Async)

```python
# tests/test_users.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_user():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/users/", json={"email": "test@example.com", "password": "123"})
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
```

> Use `httpx` (async HTTP client) + `pytest-asyncio`.

---

## Logging & Monitoring

Use **structlog** or **logging** with JSON format for production.

```python
# app/core/logging.py
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}',
    stream=sys.stdout
)
logger = logging.getLogger("myapp")
```

> Integrate with **Prometheus** (`fastapi-prometheus`) or **OpenTelemetry**.

---

## Docker & Deployment

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run with Uvicorn + Gunicorn for production
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "app.main:app", "--bind", "0.0.0.0:8000"]
```

> ✅ **Never run `uvicorn app:app --reload` in production**  
> ✅ Use **Gunicorn + Uvicorn worker** for multi-process, multi-core scaling

### docker-compose.yml (dev)
```yaml
services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/app
    depends_on:
      - db
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
```

---

## Performance & Scalability Tips

1. **Use `SQLModel` or `Tortoise ORM`** if SQLAlchemy feels heavy.
2. **Enable response_model** to filter output:
   ```python
   @app.get("/users/", response_model=list[UserPublic])
   ```
3. **Add caching** with `aiocache` (Redis/Memory).
4. **Use background tasks** for emails, logs:
   ```python
   from fastapi import BackgroundTasks
   def send_email(email: str): ...
   @app.post("/signup")
   async def signup(bg: BackgroundTasks):
       bg.add_task(send_email, email)
   ```
5. **Rate limiting**: Use `slowapi` (based on Starlette middleware).

---

## Key Differences Summary

| Area                | Express                          | FastAPI                                      |
|---------------------|----------------------------------|----------------------------------------------|
| Typing              | TypeScript optional              | **Pydantic = enforced typing + validation**  |
| Docs                | Swagger via `swagger-ui-express` | **Automatic OpenAPI/Swagger UI (`/docs`)**   |
| Async               | `async/await` (Node 14+)         | **Native + async DB (SQLAlchemy 1.4+)**      |
| Validation          | Manual or Joi/Zod                | **Automatic via Pydantic**                   |
| Middleware          | `app.use()`                      | `@app.middleware()` or `Depends()`           |
| Error Handling      | `next(err)`                      | **Exception handlers + custom classes**      |
| Startup/Shutdown    | `server.listen()` / `server.close()` | **Lifespan events** (`@asynccontextmanager`) |

---

## Final Advice

1. **Embrace Pydantic**: It’s your Zod + TypeScript interface + runtime validator.
2. **Use `Depends()` heavily**: It’s the backbone of clean, decoupled logic.
3. **Never block the event loop**: Use `await` for DB, HTTP calls.
4. **Test with `httpx` + `pytest`**: Async testing is easy and fast.
5. **Deploy with Gunicorn + Uvicorn**: Production-ready out of the box.

---

## Resources

- [FastAPI Official Docs](https://fastapi.tiangolo.com/)
- [Full-stack FastAPI PostgreSQL](https://github.com/tiangolo/full-stack-fastapi-postgresql) (by FastAPI author)
- [Awesome FastAPI](https://github.com/mjhea0/awesome-fastapi)

---

Let me know if you want:
- A GitHub template repo with this structure
- Comparison of specific Express middleware → FastAPI equivalents
- How to do file uploads, WebSockets, or GraphQL in FastAPI

You’ve got this! FastAPI feels like “Express + TypeScript + Zod + Swagger” all in one Python package. 🔥