# Configuration Management with Properties in Spring Boot

Spring Boot provides powerful configuration management through properties files, environment variables, and programmatic configuration. This guide covers comprehensive configuration strategies.

## Basic Configuration Setup

### Using application.properties

**File: `src/main/resources/application.properties`**

```properties
# Application Information
spring.application.name=my-spring-boot-app
spring.application.version=1.0.0

# Server Configuration
server.port=8080
server.servlet.context-path=/api
server.error.whitelabel.enabled=false

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=user
spring.datasource.password=password
spring.datasource.driver-class-name=org.postgresql.Driver

# Connection Pool Settings
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000

# JPA Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Logging
logging.level.root=INFO
logging.level.com.example.myapp=DEBUG
logging.level.org.springframework.web=DEBUG

# Custom Properties
app.feature.enabled=true
app.max.retry.attempts=3
```

### Using application.yml (Alternative)

**File: `src/main/resources/application.yml`**

```yaml
spring:
  application:
    name: my-spring-boot-app
    version: 1.0.0
  
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: user
    password: password
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

server:
  port: 8080
  servlet:
    context-path: /api

logging:
  level:
    root: INFO
    com.example.myapp: DEBUG

app:
  feature:
    enabled: true
  max:
    retry:
      attempts: 3
```

## Accessing Configuration Properties

### 1. Using @Value Annotation

```java
@Component
public class AppConfig {
    
    @Value("${app.feature.enabled:false}")  // Default value if not set
    private boolean featureEnabled;
    
    @Value("${app.max.retry.attempts}")
    private int maxRetryAttempts;
    
    @Value("${spring.application.name}")
    private String applicationName;
}
```

### 2. Using @ConfigurationProperties (Recommended)

```java
@ConfigurationProperties(prefix = "app")
@Data  // Lombok - generates getters/setters
public class AppProperties {
    private Feature feature = new Feature();
    private Max max = new Max();
    
    @Data
    public static class Feature {
        private boolean enabled = false;
    }
    
    @Data
    public static class Max {
        private Retry retry = new Retry();
        
        @Data
        public static class Retry {
            private int attempts = 3;
        }
    }
}
```

**Enable Configuration Properties:**

```java
@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**Usage:**

```java
@Service
public class MyService {
    private final AppProperties appProperties;
    
    public MyService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }
    
    public void doSomething() {
        if (appProperties.getFeature().isEnabled()) {
            // Feature logic
        }
    }
}
```

### 3. Using Environment Bean

```java
@Service
public class ConfigService {
    private final Environment environment;
    
    public ConfigService(Environment environment) {
        this.environment = environment;
    }
    
    public String getDatabaseUrl() {
        return environment.getProperty("spring.datasource.url");
    }
    
    public int getServerPort() {
        return environment.getProperty("server.port", Integer.class, 8080);
    }
}
```

## Profile-Based Configuration

### Creating Profile-Specific Files

**application-dev.properties:**
```properties
spring.datasource.url=jdbc:h2:mem:devdb
spring.jpa.show-sql=true
logging.level.root=DEBUG
app.feature.enabled=true
```

**application-prod.properties:**
```properties
spring.datasource.url=${DATABASE_URL}
spring.jpa.show-sql=false
logging.level.root=WARN
app.feature.enabled=false
```

**application-test.properties:**
```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop
logging.level.root=WARN
```

### Activating Profiles

**Method 1: Command Line**
```bash
java -jar app.jar --spring.profiles.active=prod
```

**Method 2: Environment Variable**
```bash
export SPRING_PROFILES_ACTIVE=prod
```

**Method 3: application.properties**
```properties
spring.profiles.active=dev
```

**Method 4: Programmatically**
```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        app.setAdditionalProfiles("prod");
        app.run(args);
    }
}
```

### Multiple Active Profiles

```properties
spring.profiles.active=prod,monitoring,audit
```

## Property Resolution Order

Spring Boot loads properties in this order (later overrides earlier):

```
1. application.properties (lowest priority)
2. application-{profile}.properties
3. Environment variables
4. System properties
5. Command line arguments (highest priority)
```

**Example:**

```properties
# application.properties
server.port=8080

# application-prod.properties
server.port=8443

# Environment variable (overrides both)
export SERVER_PORT=9000
```

## Advanced Configuration Patterns

### 1. Type-Safe Configuration Classes

```java
@ConfigurationProperties(prefix = "database")
@Validated  // Enable validation
public class DatabaseProperties {
    
    @NotBlank
    private String url;
    
    @Min(1)
    @Max(100)
    private int maxPoolSize = 10;
    
    @NotNull
    private Duration connectionTimeout = Duration.ofSeconds(30);
    
    // Nested configuration
    private Credentials credentials = new Credentials();
    
    @Data
    public static class Credentials {
        @NotBlank
        private String username;
        
        @NotBlank
        private String password;
    }
    
    // Getters and setters
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    // ... more getters/setters
}
```

**Properties file:**
```properties
database.url=jdbc:postgresql://localhost/mydb
database.max-pool-size=20
database.connection-timeout=60s
database.credentials.username=user
database.credentials.password=pass
```

### 2. Configuration with Validation

```java
@ConfigurationProperties(prefix = "mail")
@Validated
public class MailProperties {
    
    @Email
    @NotBlank
    private String from;
    
    @Valid
    @NotNull
    private Smtp smtp = new Smtp();
    
    @Data
    public static class Smtp {
        @NotBlank
        private String host;
        
        @Min(1)
        @Max(65535)
        private int port = 587;
        
        @NotNull
        private boolean auth = true;
    }
}
```

### 3. List and Map Configuration

**Properties:**
```properties
app.servers[0].name=server1
app.servers[0].url=http://server1.com
app.servers[1].name=server2
app.servers[1].url=http://server2.com

app.features.new-feature.enabled=true
app.features.old-feature.enabled=false
```

**Java Class:**
```java
@ConfigurationProperties(prefix = "app")
public class AppConfig {
    private List<Server> servers = new ArrayList<>();
    private Map<String, Feature> features = new HashMap<>();
    
    @Data
    public static class Server {
        private String name;
        private String url;
    }
    
    @Data
    public static class Feature {
        private boolean enabled;
    }
}
```

**YAML Alternative:**
```yaml
app:
  servers:
    - name: server1
      url: http://server1.com
    - name: server2
      url: http://server2.com
  features:
    new-feature:
      enabled: true
    old-feature:
      enabled: false
```

## External Configuration

### 1. External Properties File

```bash
# Run with external config
java -jar app.jar --spring.config.location=file:/path/to/application.properties
```

### 2. Environment Variables

Spring Boot automatically maps environment variables:

```bash
# Environment variable
export SPRING_DATASOURCE_URL=jdbc:postgresql://prod-server/db

# Or use UPPER_CASE with dots
export SPRING_DATASOURCE_USERNAME=prod_user
```

**Naming Convention:**
- Properties: `spring.datasource.url`
- Environment: `SPRING_DATASOURCE_URL` or `spring.datasource.url`

### 3. Command Line Arguments

```bash
java -jar app.jar --server.port=9090 --spring.profiles.active=prod
```

### 4. Configuration from Database

```java
@Configuration
public class DatabaseConfig {
    
    @Bean
    @Primary
    public PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        PropertySourcesPlaceholderConfigurer configurer = new PropertySourcesPlaceholderConfigurer();
        Map<String, Object> properties = loadPropertiesFromDatabase();
        configurer.setProperties(PropertiesLoaderUtils.propertiesFromMap(properties));
        return configurer;
    }
}
```

## Conditional Configuration

### Conditional on Property

```java
@Configuration
@ConditionalOnProperty(name = "app.feature.enabled", havingValue = "true")
public class FeatureConfiguration {
    
    @Bean
    public FeatureService featureService() {
        return new FeatureService();
    }
}
```

### Conditional on Class

```java
@Configuration
@ConditionalOnClass(RedisTemplate.class)
public class RedisConfiguration {
    // Only loads if Redis is on classpath
}
```

### Conditional on Missing Bean

```java
@Bean
@ConditionalOnMissingBean(CacheManager.class)
public CacheManager defaultCacheManager() {
    return new NoOpCacheManager();
}
```

## Configuration Properties Best Practices

### 1. Use Type-Safe Configuration

```java
// ✅ Good - Type-safe
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private int maxRetries;
    private Duration timeout;
}

// ⚠️ Less preferred - String-based
@Component
public class Config {
    @Value("${app.max-retries}")
    private String maxRetries;  // Need manual conversion
}
```

### 2. Group Related Properties

```java
@ConfigurationProperties(prefix = "app.database")
public class DatabaseProperties {
    // All database-related config in one place
}
```

### 3. Provide Sensible Defaults

```java
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private int maxRetries = 3;  // Default value
    private boolean enabled = true;  // Default value
}
```

### 4. Document Configuration Properties

```java
@ConfigurationProperties(prefix = "app")
@ConfigurationPropertiesBinding
public class AppProperties {
    
    /**
     * Maximum number of retry attempts for failed operations.
     * Default: 3
     */
    private int maxRetries = 3;
    
    /**
     * Enable experimental features.
     * Default: false
     */
    private boolean experimentalFeaturesEnabled = false;
}
```

### 5. Validate Configuration

```java
@ConfigurationProperties(prefix = "app")
@Validated
public class AppProperties {
    
    @Min(1)
    @Max(100)
    private int maxRetries;
    
    @NotBlank
    private String apiKey;
}
```

## Secrets Management

### 1. Environment Variables (Simple)

```bash
export DATABASE_PASSWORD=secret123
export API_KEY=sk-1234567890
```

**Access in properties:**
```properties
spring.datasource.password=${DATABASE_PASSWORD}
app.api.key=${API_KEY}
```

### 2. External Secrets Files

```properties
# secrets.properties (not in git)
database.password=secret123
api.key=sk-1234567890
```

```java
@PropertySource("file:${SECRETS_PATH}/secrets.properties")
@Configuration
public class SecretsConfig {
}
```

### 3. Integration with Vault/AWS Secrets Manager

```java
@Configuration
public class VaultConfig {
    
    @Bean
    public PropertySource vaultPropertySource() {
        // Load from HashiCorp Vault
        VaultTemplate vaultTemplate = new VaultTemplate(...);
        Map<String, Object> secrets = vaultTemplate.read("secret/myapp").getData();
        return new MapPropertySource("vault", secrets);
    }
}
```

## Configuration for Different Environments

### Development

```properties
# application-dev.properties
spring.datasource.url=jdbc:h2:mem:devdb
spring.jpa.show-sql=true
logging.level.root=DEBUG
management.endpoints.web.exposure.include=*
```

### Staging

```properties
# application-staging.properties
spring.datasource.url=jdbc:postgresql://staging-db/mydb
spring.jpa.show-sql=false
logging.level.root=INFO
management.endpoints.web.exposure.include=health,metrics
```

### Production

```properties
# application-prod.properties
spring.datasource.url=${DATABASE_URL}
spring.jpa.show-sql=false
logging.level.root=WARN
management.endpoints.web.exposure.include=health
server.error.whitelabel.enabled=false
```

## Configuration Refresh (Spring Cloud)

```java
@RefreshScope  // Reloads when /actuator/refresh is called
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    // Properties can be refreshed without restart
}
```

## Summary

Spring Boot Configuration provides:

- ✅ **Multiple formats** - Properties, YAML, environment variables
- ✅ **Profile support** - Environment-specific configurations
- ✅ **Type safety** - @ConfigurationProperties
- ✅ **Validation** - Bean validation integration
- ✅ **Flexibility** - Multiple property sources
- ✅ **Externalization** - Easy to configure per environment

Best practices:
1. Use `@ConfigurationProperties` for type-safe config
2. Group related properties together
3. Use profiles for different environments
4. Provide sensible defaults
5. Validate configuration values
6. Keep secrets external

Proper configuration management is essential for maintainable Spring Boot applications!

