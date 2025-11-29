# Connection URI and SSL Configuration for PostgreSQL

Secure database connections are essential for production. This guide covers connection URIs and SSL/TLS configuration in Spring Boot.

## Connection URI Format

### Basic URI

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=user
spring.datasource.password=password
```

### Full URI with Parameters

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb?sslmode=require&connectTimeout=30
```

## SSL Configuration

### SSL Modes

**Disable SSL:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb?sslmode=disable
```

**Allow SSL:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb?sslmode=allow
```

**Prefer SSL:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb?sslmode=prefer
```

**Require SSL:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb?sslmode=require
```

**Verify CA:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb?sslmode=verify-ca
```

**Verify Full (Recommended for Production):**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb?sslmode=verify-full
```

### SSL Certificate Configuration

**With Certificate Files:**
```properties
spring.datasource.url=jdbc:postgresql://host:5432/mydb?sslmode=verify-full&sslcert=/path/to/client-cert.pem&sslkey=/path/to/client-key.pem&sslrootcert=/path/to/ca-cert.pem
```

**Java Configuration:**
```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://host:5432/mydb");
        
        // SSL properties
        config.addDataSourceProperty("ssl", "true");
        config.addDataSourceProperty("sslmode", "verify-full");
        config.addDataSourceProperty("sslcert", "/path/to/client-cert.pem");
        config.addDataSourceProperty("sslkey", "/path/to/client-key.pem");
        config.addDataSourceProperty("sslrootcert", "/path/to/ca-cert.pem");
        
        return new HikariDataSource(config);
    }
}
```

## Environment-Specific Configuration

### Development

```properties
# application-dev.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb?sslmode=disable
```

### Production

```properties
# application-prod.properties
spring.datasource.url=jdbc:postgresql://prod-host:5432/mydb?sslmode=verify-full&sslcert=${SSL_CERT_PATH}&sslkey=${SSL_KEY_PATH}&sslrootcert=${SSL_ROOT_CERT_PATH}
```

## Connection Pool Configuration

```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.ssl-mode=verify-full
```

## Best Practices

1. ✅ **Use verify-full** in production
2. ✅ **Store certificates securely** (environment variables, secrets manager)
3. ✅ **Test SSL connection** before deployment
4. ✅ **Use connection pooling** with SSL
5. ✅ **Monitor SSL handshake** performance

## Summary

SSL configuration ensures:
- ✅ Encrypted connections
- ✅ Certificate verification
- ✅ Production security

Configure SSL properly for secure database connections!

