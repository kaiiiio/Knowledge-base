# Connection Pooling and Lifecycles in Spring Boot

Understanding database connection pooling and lifecycle management is essential for building performant Spring Boot applications. This guide covers connection pool configuration, lifecycle management, and best practices.

## Understanding Connection Pooling

### The Problem Without Connection Pools

**Without pooling:**
```java
// Every request creates new connection
Connection conn = DriverManager.getConnection(url, user, pass);
// Use connection
conn.close();  // Close connection
```

**Problems:**
- Connection creation is expensive (network handshake, authentication)
- High latency for each request
- Resource exhaustion with many concurrent requests

### Solution: Connection Pool

**With pooling:**
```java
// Pool provides pre-created connections
Connection conn = pool.getConnection();  // Fast - reuse existing
// Use connection
conn.close();  // Returns to pool, doesn't actually close
```

**Benefits:**
- ✅ Reuses connections
- ✅ Fast connection acquisition
- ✅ Resource management
- ✅ Better performance

## Spring Boot Connection Pooling

### Default Connection Pool: HikariCP

Spring Boot automatically configures HikariCP (fastest Java connection pool).

**Auto-configuration:**
```properties
# application.properties
spring.datasource.url=jdbc:postgresql://localhost/mydb
spring.datasource.username=user
spring.datasource.password=pass
```

**Spring Boot automatically:**
- Creates HikariCP DataSource
- Configures sensible defaults
- Manages connection lifecycle

### HikariCP Configuration

```properties
# Connection pool settings
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.leak-detection-threshold=60000
```

**Configuration Explained:**

| Property | Default | Description |
|----------|---------|-------------|
| `maximum-pool-size` | 10 | Maximum connections in pool |
| `minimum-idle` | Same as max | Minimum idle connections |
| `connection-timeout` | 30000ms | Max wait time for connection |
| `idle-timeout` | 600000ms | Max idle time before removal |
| `max-lifetime` | 1800000ms | Max connection lifetime |
| `leak-detection-threshold` | 0 | Detect connection leaks (ms) |

### Custom HikariCP Configuration

```java
@Configuration
public class DataSourceConfig {
    
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.hikari")
    public HikariDataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://localhost/mydb");
        config.setUsername("user");
        config.setPassword("pass");
        
        // Pool settings
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(10);
        config.setConnectionTimeout(30000);
        
        // Connection lifecycle
        config.setIdleTimeout(600000);  // 10 minutes
        config.setMaxLifetime(1800000);  // 30 minutes
        
        // Leak detection
        config.setLeakDetectionThreshold(60000);  // 1 minute
        
        return new HikariDataSource(config);
    }
}
```

## Connection Lifecycle

### Lifecycle Stages

```
1. Connection Creation
   ↓
2. Connection Validation (pool_pre_ping)
   ↓
3. Connection Usage
   ↓
4. Connection Return to Pool
   ↓
5. Connection Idle Timeout (if idle too long)
   ↓
6. Connection Max Lifetime Reached
   ↓
7. Connection Closure
```

### Connection Validation

**Problem:** Database might close stale connections.

**Solution:** Validate connections before use.

```properties
# Enable connection validation
spring.datasource.hikari.connection-test-query=SELECT 1
# Or use JDBC4+ (automatic validation)
spring.datasource.hikari.connection-init-sql=SELECT 1
```

**Or use HikariCP's built-in validation:**
```java
config.setConnectionTestQuery("SELECT 1");
config.setConnectionInitSql("SELECT 1");
```

### Connection Leak Detection

```properties
# Detect connections not returned within 60 seconds
spring.datasource.hikari.leak-detection-threshold=60000
```

**Monitoring:**
```java
@Component
public class ConnectionPoolMonitor {
    
    @Autowired
    private DataSource dataSource;
    
    @Scheduled(fixedRate = 60000)  // Every minute
    public void monitorPool() {
        if (dataSource instanceof HikariDataSource) {
            HikariDataSource hikari = (HikariDataSource) dataSource;
            HikariPoolMXBean pool = hikari.getHikariPoolMXBean();
            
            log.info("Active connections: {}", pool.getActiveConnections());
            log.info("Idle connections: {}", pool.getIdleConnections());
            log.info("Total connections: {}", pool.getTotalConnections());
        }
    }
}
```

## Alternative Connection Pools

### 1. Tomcat JDBC Pool

```properties
# Exclude HikariCP, use Tomcat pool
spring.datasource.type=org.apache.tomcat.jdbc.pool.DataSource

spring.datasource.tomcat.max-active=10
spring.datasource.tomcat.max-idle=5
spring.datasource.tomcat.min-idle=2
```

### 2. Commons DBCP2

```properties
spring.datasource.type=org.apache.commons.dbcp2.BasicDataSource

spring.datasource.dbcp2.max-total=10
spring.datasource.dbcp2.max-idle=5
```

### 3. C3P0

```properties
spring.datasource.type=com.mchange.v2.c3p0.ComboPooledDataSource

spring.datasource.c3p0.max-pool-size=10
spring.datasource.c3p0.min-pool-size=5
```

**Recommendation:** Stick with HikariCP (default) - it's the fastest and most efficient.

## Tuning Connection Pool Size

### Formula for Pool Size

```
connections = ((core_count * 2) + effective_spindle_count)
```

**For I/O-bound applications:**
```
connections = CPU cores × 2 + 1
```

**Example:**
```java
int cpuCores = Runtime.getRuntime().availableProcessors();
int poolSize = (cpuCores * 2) + 1;  // 4 cores = 9 connections
```

### Configuration Example

```java
@Configuration
public class DynamicPoolConfig {
    
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.hikari")
    public HikariDataSource dataSource() {
        HikariConfig config = new HikariConfig();
        
        // Calculate pool size based on CPU cores
        int cpuCores = Runtime.getRuntime().availableProcessors();
        int poolSize = Math.max(10, (cpuCores * 2) + 1);
        
        config.setMaximumPoolSize(poolSize);
        config.setMinimumIdle(poolSize / 2);
        
        return new HikariDataSource(config);
    }
}
```

### Monitoring Pool Metrics

```java
@Component
public class PoolMetrics {
    
    @Autowired
    private MeterRegistry meterRegistry;
    
    @Autowired
    private DataSource dataSource;
    
    @PostConstruct
    public void registerMetrics() {
        if (dataSource instanceof HikariDataSource) {
            HikariDataSource hikari = (HikariDataSource) dataSource;
            
            Gauge.builder("db.pool.active", hikari, ds -> 
                ds.getHikariPoolMXBean().getActiveConnections())
                .register(meterRegistry);
            
            Gauge.builder("db.pool.idle", hikari, ds -> 
                ds.getHikariPoolMXBean().getIdleConnections())
                .register(meterRegistry);
        }
    }
}
```

## Connection Lifecycle Events

### Listening to Connection Events

```java
@Configuration
public class ConnectionEventConfig {
    
    @EventListener
    public void handleConnectionAcquired(ConnectionAcquiredEvent event) {
        log.debug("Connection acquired: {}", event.getConnectionId());
    }
    
    @EventListener
    public void handleConnectionReleased(ConnectionReleasedEvent event) {
        log.debug("Connection released: {}", event.getConnectionId());
    }
}
```

## Best Practices

### 1. Size Pool Appropriately

```properties
# Too small - connection wait times
spring.datasource.hikari.maximum-pool-size=5  # ❌

# Too large - resource waste
spring.datasource.hikari.maximum-pool-size=100  # ❌

# Just right - based on workload
spring.datasource.hikari.maximum-pool-size=20  # ✅
```

### 2. Enable Leak Detection in Development

```properties
# Development
spring.datasource.hikari.leak-detection-threshold=60000

# Production
spring.datasource.hikari.leak-detection-threshold=0  # Disabled for performance
```

### 3. Set Appropriate Timeouts

```properties
# Connection timeout - fail fast if pool exhausted
spring.datasource.hikari.connection-timeout=30000  # 30 seconds

# Idle timeout - remove unused connections
spring.datasource.hikari.idle-timeout=600000  # 10 minutes

# Max lifetime - refresh connections periodically
spring.datasource.hikari.max-lifetime=1800000  # 30 minutes
```

### 4. Monitor Pool Metrics

```java
// Use Actuator to expose metrics
management.endpoints.web.exposure.include=metrics
management.metrics.export.prometheus.enabled=true
```

### 5. Handle Connection Failures

```java
@Retryable(value = {SQLException.class}, maxAttempts = 3)
public User findById(Long id) {
    return userRepository.findById(id).orElseThrow();
}
```

## Production Configuration

```properties
# Production-ready HikariCP configuration
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.leak-detection-threshold=0  # Disabled in prod
spring.datasource.hikari.connection-test-query=SELECT 1
spring.datasource.hikari.auto-commit=false
```

## Summary

Connection pooling best practices:

1. ✅ **Use HikariCP** - Default, fastest pool
2. ✅ **Size appropriately** - CPU cores × 2 + 1
3. ✅ **Enable validation** - Detect stale connections
4. ✅ **Set timeouts** - Connection, idle, max lifetime
5. ✅ **Monitor metrics** - Track pool usage
6. ✅ **Detect leaks** - In development

Proper connection pooling ensures:
- ✅ Better performance
- ✅ Resource efficiency
- ✅ Reliable database access
- ✅ Scalable applications

Connection pooling is critical for production Spring Boot applications!

