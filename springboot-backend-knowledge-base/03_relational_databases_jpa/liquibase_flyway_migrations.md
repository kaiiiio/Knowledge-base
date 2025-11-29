# Database Migrations with Liquibase and Flyway

Database migrations manage schema changes version control. This guide covers using Liquibase and Flyway with Spring Boot.

## Why Database Migrations?

**Problems without migrations:**
- Manual schema changes
- Inconsistent database states
- Hard to track changes
- Difficult to rollback

**Benefits of migrations:**
- ✅ Version control for schema
- ✅ Consistent environments
- ✅ Automated deployment
- ✅ Easy rollback

## Liquibase

### Setup

**Add Dependency:**
```xml
<dependency>
    <groupId>org.liquibase</groupId>
    <artifactId>liquibase-core</artifactId>
</dependency>
```

**Configuration:**
```properties
spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.xml
spring.liquibase.enabled=true
```

### Changelog Structure

**db/changelog/db.changelog-master.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.8.xsd">
    
    <include file="db/changelog/changes/001-initial-schema.xml"/>
    <include file="db/changelog/changes/002-add-indexes.xml"/>
    <include file="db/changelog/changes/003-add-soft-delete.xml"/>
</databaseChangeLog>
```

### Creating Changesets

**001-initial-schema.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.8.xsd">
    
    <changeSet id="001-create-users-table" author="developer">
        <createTable tableName="users">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true" nullable="false"/>
            </column>
            <column name="email" type="VARCHAR(255)">
                <constraints nullable="false" unique="true"/>
            </column>
            <column name="name" type="VARCHAR(200)">
                <constraints nullable="false"/>
            </column>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
        </createTable>
    </changeSet>
    
    <changeSet id="001-create-orders-table" author="developer">
        <createTable tableName="orders">
            <column name="id" type="BIGINT" autoIncrement="true">
                <constraints primaryKey="true" nullable="false"/>
            </column>
            <column name="user_id" type="BIGINT">
                <constraints nullable="false"/>
            </column>
            <column name="total_amount" type="DECIMAL(10,2)">
                <constraints nullable="false"/>
            </column>
            <column name="created_at" type="TIMESTAMP" defaultValueComputed="CURRENT_TIMESTAMP">
                <constraints nullable="false"/>
            </column>
        </createTable>
        
        <addForeignKeyConstraint
            baseTableName="orders"
            baseColumnNames="user_id"
            constraintName="fk_orders_user"
            referencedTableName="users"
            referencedColumnNames="id"/>
    </changeSet>
</databaseChangeLog>
```

**002-add-indexes.xml:**
```xml
<databaseChangeLog>
    <changeSet id="002-add-email-index" author="developer">
        <createIndex indexName="idx_users_email" tableName="users">
            <column name="email"/>
        </createIndex>
    </changeSet>
    
    <changeSet id="002-add-created-at-index" author="developer">
        <createIndex indexName="idx_orders_created_at" tableName="orders">
            <column name="created_at"/>
        </createIndex>
    </changeSet>
</databaseChangeLog>
```

**003-add-soft-delete.xml:**
```xml
<databaseChangeLog>
    <changeSet id="003-add-deleted-at-column" author="developer">
        <addColumn tableName="users">
            <column name="deleted_at" type="TIMESTAMP"/>
        </addColumn>
    </changeSet>
</databaseChangeLog>
```

### SQL Changesets

**Alternative - SQL format:**
```xml
<changeSet id="004-add-status-column" author="developer">
    <sql>
        ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE';
        CREATE INDEX idx_users_status ON users(status);
    </sql>
</changeSet>
```

## Flyway

### Setup

**Add Dependency:**
```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
```

**Configuration:**
```properties
spring.flyway.locations=classpath:db/migration
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
```

### Migration Files

**Naming Convention:** `V{version}__{description}.sql`

**db/migration/V1__Initial_schema.sql:**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**db/migration/V2__Add_indexes.sql:**
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

**db/migration/V3__Add_soft_delete.sql:**
```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
```

**db/migration/V4__Add_user_status.sql:**
```sql
ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE';
CREATE INDEX idx_users_status ON users(status);
```

### Repeatable Migrations

**R__Update_functions.sql:**
```sql
-- Repeatable migration - runs every time it changes
CREATE OR REPLACE FUNCTION calculate_order_total(order_id BIGINT)
RETURNS DECIMAL AS $$
    SELECT SUM(quantity * unit_price)
    FROM order_items
    WHERE order_id = calculate_order_total.order_id;
$$ LANGUAGE SQL;
```

## Comparing Liquibase vs Flyway

| Feature | Liquibase | Flyway |
|---------|-----------|--------|
| Format | XML, YAML, JSON, SQL | SQL only |
| Version Control | Changesets | File versioning |
| Rollback | Built-in | Manual scripts |
| Database Support | Extensive | Extensive |
| Learning Curve | Steeper | Simpler |

## Best Practices

### 1. Versioning

**Liquibase:**
```xml
<changeSet id="001" author="dev1"/>
<changeSet id="002" author="dev2"/>
```

**Flyway:**
```sql
-- V1__Initial.sql
-- V2__Add_indexes.sql
```

### 2. Never Modify Applied Migrations

```sql
-- ❌ Bad - Don't modify after deployment
-- V1__Initial.sql (already applied)

-- ✅ Good - Create new migration
-- V2__Fix_initial_schema.sql
```

### 3. Test Migrations

```java
@SpringBootTest
@TestPropertySource(properties = {
    "spring.flyway.locations=classpath:db/migration"
})
class MigrationTest {
    
    @Test
    void testMigrationsRunSuccessfully() {
        // Migrations run automatically on startup
        // Test that schema is correct
    }
}
```

### 4. Rollback Strategy

**Liquibase Rollback:**
```xml
<changeSet id="001" author="developer">
    <createTable tableName="users">
        <!-- columns -->
    </createTable>
    <rollback>
        <dropTable tableName="users"/>
    </rollback>
</changeSet>
```

**Flyway Rollback:**
```sql
-- V1__Create_users.sql (up migration)
-- V1.1__Drop_users.sql (down migration - manual)
```

## Summary

Both tools provide:
- ✅ Version control for schema
- ✅ Automated migrations
- ✅ Consistency across environments

**Choose Flyway if:** You prefer SQL and simplicity
**Choose Liquibase if:** You need XML/YAML or complex rollback strategies

Use migrations to manage database schema changes effectively!

