# Spring Data MongoDB Setup

This guide covers setting up Spring Data MongoDB from scratch, including configuration, connection, and basic operations.

## Setup

### Add Dependencies

**Maven:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency>
```

**Gradle:**
```groovy
implementation 'org.springframework.boot:spring-boot-starter-data-mongodb'
```

### Configuration

**application.properties:**
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/mydb
spring.data.mongodb.database=mydb
```

**With Authentication:**
```properties
spring.data.mongodb.uri=mongodb://username:password@localhost:27017/mydb?authSource=admin
```

**MongoDB Atlas:**
```properties
spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/mydb
```

## Entity Mapping

### Basic Document

```java
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    private String email;
    private String name;
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    // Getters and setters
}
```

### Embedded Documents

```java
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    private String email;
    
    @Embedded
    private Profile profile;
    
    @Embedded
    private List<Address> addresses;
}

public class Profile {
    private String bio;
    private String phone;
    private String avatarUrl;
}

public class Address {
    private String street;
    private String city;
    private String zipCode;
}
```

## Repository Setup

### Basic Repository

```java
public interface UserRepository extends MongoRepository<User, String> {
    // Spring Data MongoDB provides:
    // - save(User)
    // - findById(String)
    // - findAll()
    // - delete(User)
}
```

### Custom Query Methods

```java
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    
    List<User> findByNameContainingIgnoreCase(String name);
    
    List<User> findByCreatedAtAfter(LocalDateTime date);
    
    boolean existsByEmail(String email);
}
```

## Configuration Class

```java
@Configuration
@EnableMongoRepositories(basePackages = "com.example.repository")
public class MongoConfig {
    
    @Bean
    public MongoClient mongoClient() {
        return MongoClients.create("mongodb://localhost:27017");
    }
    
    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoClient(), "mydb");
    }
}
```

## Best Practices

1. ✅ Use `@Document` for entity classes
2. ✅ Use `@Id` for primary key
3. ✅ Use `@Field` for custom field names
4. ✅ Use `@Embedded` for nested documents
5. ✅ Configure connection pooling

## Summary

Spring Data MongoDB provides:
- ✅ Easy setup and configuration
- ✅ Repository pattern support
- ✅ Type-safe queries
- ✅ Automatic mapping

Get started with MongoDB in Spring Boot!

