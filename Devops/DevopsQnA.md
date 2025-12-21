# 📘 DevOps Interview Q&A — End‑to‑End Guide

> **Audience**: MERN / FastAPI / Backend developers preparing for **DevOps, SRE, Backend interviews**
> **Scope**: From **containers → CI/CD → AWS → production architecture**
> **Level**: Junior → Senior → Staff mindset

---

## 🧠 HOW TO USE THIS DOC

* Read **conceptually**, not memorization
* Focus on **WHY before HOW**
* System diagrams are **interview gold**

---

# 1️⃣ CORE DEVOPS CONCEPTS

### Q1. What is DevOps?

**Answer:**
DevOps is a culture and set of practices that ensure **software can be built, deployed, monitored, and scaled reliably**.

It focuses on:

* Automation
* Reliability
* Faster feedback
* Ownership of production

> DevOps is not tools — it is confidence in production systems.

---

### Q2. What problems does DevOps solve?

* "Works on my machine"
* Manual deployments
* Downtime during releases
* No visibility into failures

---

# 2️⃣ LINUX & SERVERS

### Q3. Why is Linux important for DevOps?


**Answer:**

* All cloud servers run Linux
* Docker uses Linux kernel features
* CI/CD runners are Linux-based

You must understand:

* Processes
* Networking
* File permissions
* Logs


Linux is the **foundational backbone** of modern DevOps infrastructure. It's not just important—it's **absolutely essential** for every DevOps engineer.

**Why Linux dominates the DevOps landscape:**

* **All cloud servers run Linux** - AWS EC2, Google Cloud, Azure VMs all default to Linux distributions (Ubuntu, CentOS, Amazon Linux)
* **Docker uses Linux kernel features** - Containers leverage powerful Linux primitives like namespaces and cgroups
* **CI/CD runners are Linux-based** - GitHub Actions, GitLab CI, Jenkins agents predominantly run on Linux
* **Open-source and free** - No licensing costs, massive community support
* **Lightweight and efficient** - Minimal resource overhead compared to Windows servers
* **Powerful command-line tools** - Automation-friendly, scriptable, and incredibly versatile

---

### Q4. What Linux concepts must you master?

You must develop a **deep, intuitive understanding** of these critical Linux fundamentals:

#### 1️⃣ **Processes** - The Heartbeat of Your System

**What are processes?**
A process is a **running instance** of a program. Every application, service, and command you execute becomes a process with its own unique identifier (PID).

**Why processes matter:**

* **System resource management** - Each process consumes memory, CPU, and disk space
* **Inter-process communication** - Services often communicate using inter-process communication (IPC)
* **Resource isolation** - Each process runs in its own memory space, preventing conflicts
* **Process management** - Understanding PID, PPID, and process tree is crucial for debugging and system administration

**Essential Commands:**

```bash
# View all running processes with detailed information
ps aux
# Output shows: USER, PID, CPU%, MEM%, COMMAND

# Real-time, interactive process monitoring (like Windows Task Manager)
top
# Press 'q' to quit, 'k' to kill a process

# Enhanced, colorful alternative to top
htop
# More user-friendly, shows CPU cores, memory bars

# Find specific process by name
ps aux | grep nginx
# Example output: root  1234  0.0  0.5  nginx: master process

# View process tree (parent-child relationships)
pstree
# Shows hierarchical structure of processes

# Kill a misbehaving process gracefully
kill 1234
# Sends SIGTERM (polite request to terminate)

# Force kill a stubborn process
kill -9 1234
# Sends SIGKILL (immediate termination, no cleanup)

# Kill all processes matching a name
pkill nginx
# Terminates all nginx processes

# View processes for specific user
ps -u username

# Monitor process in real-time
watch -n 1 'ps aux | grep node'
# Updates every 1 second
```

**Real-world scenario:**
```bash
# Your Node.js app is consuming 100% CPU
# Step 1: Find the culprit
ps aux | grep node
# Output: user  5678  99.8  2.3  node server.js

# Step 2: Kill it gracefully
kill 5678

# Step 3: Restart with PM2 or systemd
pm2 restart server
```

---

#### 2️⃣ **Networking** - Connecting Your Distributed Systems

**Why networking matters:**
In microservices architecture, services constantly communicate. You need to **diagnose connection issues**, **debug API calls**, and **secure network traffic**.

**Essential Commands:**

```bash
# Check if a port is open and listening
netstat -tulpn
# -t: TCP, -u: UDP, -l: listening, -p: program, -n: numeric
# Example output: tcp  0  0  0.0.0.0:3000  LISTEN  1234/node

# Modern alternative to netstat
ss -tulpn
# Faster and more detailed

# Test if you can reach a server
ping google.com
# Sends ICMP packets, checks connectivity

# Trace the network path to a server
traceroute google.com
# Shows every hop (router) your packet travels through

# Check DNS resolution
nslookup google.com
# Resolves domain to IP address

# More detailed DNS lookup
dig google.com
# Shows authoritative nameservers, TTL, etc.

# Test if a specific port is open on remote server
telnet api.example.com 443
# Or use modern alternative:
nc -zv api.example.com 443
# -z: scan, -v: verbose

# Download file from URL (useful in scripts)
curl https://api.example.com/data
# -X POST: specify method
# -H "Authorization: Bearer token": add headers
# -d '{"key":"value"}': send JSON data

# Alternative to curl
wget https://example.com/file.zip
# Downloads file to current directory

# View network interfaces and IP addresses
ip addr show
# Shows all network interfaces (eth0, wlan0, docker0)

# Check routing table
ip route show
# Shows how packets are routed

# Capture network traffic (requires root)
tcpdump -i eth0 port 80
# Captures all HTTP traffic on eth0 interface

# View active network connections
lsof -i
# Shows which processes are using network
```

**Real-world debugging scenario:**
```bash
# Your API is not responding
# Step 1: Check if service is running
ps aux | grep node

# Step 2: Check if port is listening
netstat -tulpn | grep 3000
# If nothing shows, service isn't listening

# Step 3: Check if firewall is blocking
sudo iptables -L
# Or on modern systems:
sudo ufw status

# Step 4: Test connection locally
curl http://localhost:3000/health
# If this works, problem is external

# Step 5: Test from outside
curl http://your-server-ip:3000/health
# If this fails, firewall/security group issue

# Step 6: Check logs
tail -f /var/log/app.log
```

---

#### 3️⃣ **File Permissions** - Securing Your System

**Why permissions matter:**
Incorrect permissions can **expose sensitive data** or **prevent services from running**. Understanding `rwx` is crucial for security.

**Permission Breakdown:**
```
-rwxr-xr--  1 user group  4096 Dec 15 10:30 script.sh
│││││││││
│││││││││
│││││││└└─ Others: r-- (read only)
││││││└──── Group: r-x (read, execute)
│││││└───── Owner: rwx (read, write, execute)
││││└────── Number of hard links
│││└─────── Owner username
││└──────── Group name
│└───────── File size in bytes
└────────── File type: - (file), d (directory), l (symlink)
```

**Essential Commands:**

```bash
# View file permissions in detail
ls -lah
# -l: long format, -a: show hidden, -h: human-readable sizes

# Change permissions using symbolic notation
chmod u+x script.sh
# u: user, g: group, o: others, a: all
# +: add, -: remove, =: set exactly
# r: read, w: write, x: execute

# Change permissions using numeric notation
chmod 755 script.sh
# 7 (rwx) for owner
# 5 (r-x) for group
# 5 (r-x) for others

# Common permission patterns:
chmod 644 file.txt      # -rw-r--r-- (files)
chmod 755 script.sh     # -rwxr-xr-x (executables)
chmod 600 secret.key    # -rw------- (sensitive files)
chmod 700 ~/.ssh        # drwx------ (SSH directory)

# Change ownership
chown user:group file.txt
# Changes both user and group

# Change only owner
chown user file.txt

# Change only group
chgrp group file.txt

# Recursive permission change (careful!)
chmod -R 755 /var/www/html
# -R: recursive, applies to all files/folders inside

# Find files with specific permissions
find /var/www -type f -perm 777
# Finds all files with 777 (dangerous!)

# Fix common permission issues
# SSH key too open:
chmod 600 ~/.ssh/id_rsa

# Script not executable:
chmod +x deploy.sh

# Web files not readable:
chmod 644 index.html
```

**Real-world security scenario:**
```bash
# Deploying a Node.js app
# Step 1: Set correct ownership
sudo chown -R www-data:www-data /var/www/myapp

# Step 2: Set directory permissions
sudo find /var/www/myapp -type d -exec chmod 755 {} \;
# Directories: rwxr-xr-x (need execute to enter)

# Step 3: Set file permissions
sudo find /var/www/myapp -type f -exec chmod 644 {} \;
# Files: rw-r--r-- (no execute needed)

# Step 4: Protect sensitive files
sudo chmod 600 /var/www/myapp/.env
# Only owner can read/write

# Step 5: Make scripts executable
sudo chmod 755 /var/www/myapp/start.sh
```

---

#### 4️⃣ **Logs** - Your System's Black Box Recorder

**Why logs are critical:**
Logs are your **primary debugging tool** in production. When things break (and they will), logs tell you **what happened, when, and why**.

**Essential Log Locations:**

```bash
# System logs
/var/log/syslog          # General system messages (Ubuntu/Debian)
/var/log/messages        # General system messages (CentOS/RHEL)
/var/log/auth.log        # Authentication attempts (SSH, sudo)
/var/log/kern.log        # Kernel messages

# Application logs
/var/log/nginx/access.log    # NGINX access logs
/var/log/nginx/error.log     # NGINX error logs
/var/log/apache2/error.log   # Apache errors
/var/log/mysql/error.log     # MySQL errors

# Application-specific
/var/log/myapp/app.log       # Your custom app logs
```

**Essential Log Commands:**

```bash
# View last 50 lines of a log
tail -n 50 /var/log/syslog

# Follow log in real-time (like watching live TV)
tail -f /var/log/nginx/access.log
# Press Ctrl+C to stop

# View first 20 lines
head -n 20 /var/log/syslog

# Search logs for specific term
grep "error" /var/log/app.log
# Case-insensitive search:
grep -i "error" /var/log/app.log

# Search with context (show 3 lines before/after)
grep -C 3 "error" /var/log/app.log

# Count occurrences
grep -c "404" /var/log/nginx/access.log
# Output: 127 (number of 404 errors)

# Search multiple files
grep "error" /var/log/*.log

# Search recursively in directory
grep -r "database connection failed" /var/log/

# View logs with pagination
less /var/log/syslog
# Press 'q' to quit, '/' to search, 'n' for next match

# View compressed logs
zcat /var/log/syslog.1.gz | grep "error"

# Systemd logs (modern Linux)
journalctl
# View all logs

journalctl -u nginx
# Logs for specific service

journalctl -u nginx --since "1 hour ago"
# Recent logs

journalctl -u nginx -f
# Follow logs in real-time

journalctl -p err
# Only error-level logs

journalctl --disk-usage
# Check log disk usage

# Rotate logs manually
logrotate /etc/logrotate.conf
```

**Real-world debugging scenario:**
```bash
# Your website is down, users reporting 502 errors
# Step 1: Check NGINX error logs
sudo tail -f /var/log/nginx/error.log
# Output: "upstream timed out (110: Connection timed out)"

# Step 2: Check if backend is running
ps aux | grep node
# No node process found!

# Step 3: Check application logs
sudo tail -100 /var/log/myapp/app.log
# Output: "FATAL: Out of memory"

# Step 4: Check system logs
sudo journalctl -u myapp --since "10 minutes ago"
# Shows service crashed due to memory

# Step 5: Check memory usage
free -h
# Shows available memory

# Step 6: Restart service
sudo systemctl restart myapp

# Step 7: Monitor logs
sudo journalctl -u myapp -f
# Watch for successful startup
```

**Advanced Log Analysis:**

```bash
# Find top 10 IP addresses hitting your server
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -rn | head -10

# Count HTTP status codes
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -rn
# Output:
#   5432 200
#   234 404
#   12 500

# Find slowest requests
awk '{print $NF, $7}' /var/log/nginx/access.log | sort -rn | head -10
# Shows response time and URL

# Monitor error rate in real-time
watch -n 1 'grep -c "error" /var/log/app.log'
# Updates every second
```

---

### Q5. How do you access a production server?

**Answer:**
You connect to production servers using **SSH (Secure Shell)**, which provides an **encrypted, secure terminal session** over the network.

**Basic SSH Connection:**

```bash
# Connect to server with username and IP
ssh ubuntu@54.123.45.67
# Format: ssh <username>@<server-ip-or-domain>

# Connect on custom port
ssh -p 2222 ubuntu@54.123.45.67
# Default SSH port is 22, but often changed for security

# Connect with specific private key
ssh -i ~/.ssh/my-key.pem ubuntu@54.123.45.67
# AWS EC2 uses .pem keys

# Connect with verbose output (debugging)
ssh -v ubuntu@54.123.45.67
# Shows connection details, useful for troubleshooting
```

**Once Connected, You Can:**

```bash
# 1. Inspect logs for errors
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u myapp -n 100

# 2. Restart crashed services
sudo systemctl restart nginx
sudo systemctl restart myapp
sudo pm2 restart all

# 3. Check service status
sudo systemctl status nginx
sudo systemctl status myapp

# 4. Monitor resource usage
htop                    # Interactive process viewer
df -h                   # Disk usage
free -h                 # Memory usage
uptime                  # System uptime and load

# 5. Run Docker commands
docker ps               # List running containers
docker logs -f myapp    # View container logs
docker restart myapp    # Restart container

# 6. Deploy new code
cd /var/www/myapp
git pull origin main
npm install
pm2 reload all

# 7. Check network connectivity
curl http://localhost:3000/health
netstat -tulpn | grep 3000

# 8. Edit configuration files
sudo nano /etc/nginx/sites-available/myapp
sudo vim /etc/systemd/system/myapp.service

# 9. Run database queries
psql -U postgres -d mydb
mongo

# 10. Create backups
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/myapp
```

**SSH Best Practices:**

```bash
# 1. Use SSH keys instead of passwords
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# Generates public/private key pair

# 2. Copy public key to server
ssh-copy-id ubuntu@54.123.45.67
# Or manually:
cat ~/.ssh/id_rsa.pub | ssh ubuntu@54.123.45.67 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# 3. Create SSH config for easy access
# Edit ~/.ssh/config:
Host production
    HostName 54.123.45.67
    User ubuntu
    IdentityFile ~/.ssh/my-key.pem
    Port 22

# Now connect with just:
ssh production

# 4. Use SSH agent for key management
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

# 5. Secure your SSH server (on server side)
sudo nano /etc/ssh/sshd_config
# Disable root login: PermitRootLogin no
# Disable password auth: PasswordAuthentication no
# Change default port: Port 2222
sudo systemctl restart sshd
```

**Advanced SSH Usage:**

```bash
# Port forwarding (access remote database locally)
ssh -L 5432:localhost:5432 ubuntu@server
# Now connect to localhost:5432 on your machine

# Run command without interactive session
ssh ubuntu@server "sudo systemctl restart nginx"

# Copy files to/from server
scp local-file.txt ubuntu@server:/var/www/
scp ubuntu@server:/var/log/app.log ./

# Recursive copy
scp -r ./dist ubuntu@server:/var/www/myapp/

# Keep connection alive
ssh -o ServerAliveInterval=60 ubuntu@server

# Multiple SSH sessions with tmux
ssh ubuntu@server
tmux new -s deploy
# Detach: Ctrl+B, then D
# Reattach: tmux attach -t deploy
```

---

## 🔧 WORKING WITH DEPLOYED SYSTEMS

### Q6. How do you find and fix errors in a deployed application?

**Answer:**
Debugging production issues requires a **systematic, methodical approach**. Follow this battle-tested workflow:

#### Step-by-Step Debugging Process:

```bash
# STEP 1: Check if the service is running
sudo systemctl status myapp
# Look for: "active (running)" or "failed"

# Alternative for Docker:
docker ps | grep myapp
# If not listed, container crashed

# Alternative for PM2:
pm2 list
# Check status column

# STEP 2: Check recent logs (last 100 lines)
sudo journalctl -u myapp -n 100 --no-pager
# For Docker:
docker logs --tail 100 myapp
# For PM2:
pm2 logs myapp --lines 100

# STEP 3: Follow logs in real-time
sudo journalctl -u myapp -f
# Watch for errors as they happen

# STEP 4: Check error logs specifically
sudo tail -f /var/log/myapp/error.log
sudo tail -f /var/log/nginx/error.log

# STEP 5: Check system resources
htop                    # CPU and memory usage
df -h                   # Disk space
free -h                 # Available memory
iostat                  # Disk I/O

# STEP 6: Check network connectivity
curl http://localhost:3000/health
netstat -tulpn | grep 3000
# Is the port listening?

# STEP 7: Check database connectivity
# For PostgreSQL:
psql -U postgres -d mydb -c "SELECT 1;"
# For MongoDB:
mongo --eval "db.adminCommand('ping')"
# For Redis:
redis-cli ping

# STEP 8: Check environment variables
sudo systemctl show myapp --property=Environment
# Or for Docker:
docker inspect myapp | grep -A 20 Env

# STEP 9: Check file permissions
ls -la /var/www/myapp
# Ensure app can read/write necessary files

# STEP 10: Restart service and monitor
sudo systemctl restart myapp
sudo journalctl -u myapp -f
# Watch startup process
```

**Common Error Patterns:**

```bash
# Error: "Port already in use"
# Find what's using the port:
sudo lsof -i :3000
# Kill the process:
sudo kill -9 <PID>

# Error: "Permission denied"
# Check file ownership:
ls -l /var/www/myapp
# Fix ownership:
sudo chown -R www-data:www-data /var/www/myapp

# Error: "Cannot connect to database"
# Check if database is running:
sudo systemctl status postgresql
# Check connection string in env:
cat /etc/systemd/system/myapp.service | grep DATABASE

# Error: "Out of memory"
# Check memory usage:
free -h
# Check which process is consuming memory:
ps aux --sort=-%mem | head -10
# Increase memory or optimize app

# Error: "Disk full"
# Check disk usage:
df -h
# Find large files:
sudo du -sh /var/* | sort -rh | head -10
# Clean up logs:
sudo journalctl --vacuum-time=7d
```

---

### Q7. Where are secrets and environment variables stored in production?

**Answer:**
Secrets should **NEVER** be hardcoded in code or committed to Git. Here's where they're properly stored:

#### 1. Environment Variables (Systemd Service)

```bash
# Location: /etc/systemd/system/myapp.service
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/myapp
ExecStart=/usr/bin/node server.js

# Environment variables (NOT recommended for secrets)
Environment="NODE_ENV=production"
Environment="PORT=3000"

# Better: Use EnvironmentFile
EnvironmentFile=/etc/myapp/secrets.env

[Install]
WantedBy=multi-user.target

# Then create: /etc/myapp/secrets.env
# DATABASE_URL=postgresql://user:pass@localhost/db
# API_KEY=secret-key-here
# JWT_SECRET=super-secret-jwt-key

# Secure the secrets file:
sudo chmod 600 /etc/myapp/secrets.env
sudo chown root:root /etc/myapp/secrets.env
```

#### 2. Docker Secrets

```bash
# Create a secret
echo "my-db-password" | docker secret create db_password -

# Use in docker-compose.yml:
version: '3.8'
services:
  app:
    image: myapp
    secrets:
      - db_password
    environment:
      - DATABASE_PASSWORD_FILE=/run/secrets/db_password

secrets:
  db_password:
    external: true

# Access in app:
const fs = require('fs');
const dbPassword = fs.readFileSync('/run/secrets/db_password', 'utf8');
```

**Best Practices:**

```bash
# ✅ DO:
# - Use environment variables or secret management systems
# - Encrypt secrets at rest
# - Rotate secrets regularly
# - Use different secrets for dev/staging/prod
# - Limit access with file permissions (600)

# ❌ DON'T:
# - Commit secrets to Git
# - Hardcode secrets in code
# - Share secrets via email/Slack
# - Use same secrets across environments
# - Store secrets in plain text files with 644 permissions
```

---

### Q8. What is the standard folder structure for deployed applications?

**Answer:**
Production servers follow **well-established conventions** for organizing applications, logs, and configurations.

#### Standard Linux Directory Structure:

```bash
/var/www/                    # Web applications
├── myapp/                   # Your application
│   ├── current/             # Current release (symlink)
│   ├── releases/            # Previous releases
│   │   ├── 20251215120000/
│   │   └── 20251214100000/
│   ├── shared/              # Shared across releases
│   │   ├── logs/
│   │   ├── uploads/
│   │   └── node_modules/
│   └── .env                 # Environment variables

/etc/                        # Configuration files
├── nginx/
│   ├── nginx.conf           # Main NGINX config
│   └── sites-available/
│       └── myapp.conf       # Your app's NGINX config
├── systemd/system/
│   └── myapp.service        # Systemd service file
└── myapp/
    └── secrets.env          # Application secrets

/var/log/                    # Log files
├── nginx/
│   ├── access.log
│   └── error.log
├── myapp/
│   ├── app.log
│   ├── error.log
│   └── access.log
└── syslog                   # System logs

/opt/                        # Optional software
└── myapp/                   # Alternative app location

/home/deploy/                # Deployment user
├── .ssh/
│   ├── id_rsa               # Private key
│   ├── id_rsa.pub           # Public key
│   └── authorized_keys      # Allowed keys
└── deploy-scripts/
    └── deploy.sh

/tmp/                        # Temporary files
└── myapp-uploads/           # Temp uploads (cleared on reboot)

/usr/local/bin/              # Custom scripts
└── myapp-backup.sh          # Backup script
```

#### Viewing Folder Structure:

```bash
# Install tree command
sudo apt install tree

# View directory structure
tree -L 3 /var/www/myapp
# -L 3: limit depth to 3 levels

# View with file sizes
tree -h /var/www/myapp

# View only directories
tree -d /var/www/myapp

# View with permissions
ls -laR /var/www/myapp

# Check disk usage by directory
du -sh /var/www/myapp/*
# Shows size of each subdirectory
```

---

### Q9. Where are SSH keys and certificates stored?

**Answer:**
SSH keys and SSL certificates have **specific, secure locations** on Linux systems.

#### SSH Keys Location:

```bash
# User SSH keys (most common)
~/.ssh/                      # User's SSH directory
├── id_rsa                   # Private key (NEVER share!)
├── id_rsa.pub               # Public key (safe to share)
├── authorized_keys          # Keys allowed to login as this user
├── known_hosts              # Fingerprints of known servers
└── config                   # SSH client configuration

# System-wide SSH configuration
/etc/ssh/
├── sshd_config              # SSH server configuration
├── ssh_config               # SSH client configuration
├── ssh_host_rsa_key         # Server's private key
└── ssh_host_rsa_key.pub     # Server's public key

# Checking SSH key permissions (CRITICAL!)
ls -la ~/.ssh/
# id_rsa should be: -rw------- (600)
# id_rsa.pub should be: -rw-r--r-- (644)
# authorized_keys should be: -rw------- (600)
# .ssh directory should be: drwx------ (700)

# Fix SSH key permissions:
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/authorized_keys
```

#### SSL/TLS Certificates Location:

```bash
# Let's Encrypt certificates
/etc/letsencrypt/
├── live/
│   └── example.com/
│       ├── fullchain.pem    # Certificate + chain
│       ├── privkey.pem      # Private key
│       ├── cert.pem         # Certificate only
│       └── chain.pem        # Chain only
└── renewal/
    └── example.com.conf     # Renewal configuration

# Custom SSL certificates
/etc/ssl/
├── certs/                   # Public certificates
│   └── myapp.crt
└── private/                 # Private keys
    └── myapp.key

# NGINX SSL configuration
/etc/nginx/sites-available/myapp.conf
server {
    listen 443 ssl;
    server_name example.com;
    
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
}

# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/example.com/cert.pem -noout -dates
# Output:
# notBefore=Dec 15 00:00:00 2025 GMT
# notAfter=Mar 15 23:59:59 2026 GMT

# Renew Let's Encrypt certificate
sudo certbot renew
# Or force renewal:
sudo certbot renew --force-renewal
```

---

### Q4. How do you access a production server?

```bash
ssh ubuntu@<public-ip>
```

From there you:

* Inspect logs
* Restart services
* Run Docker / PM2

---

# 3️⃣ DOCKER & CONTAINERS

### Q5. What is Docker?

Docker is a **containerization platform** that packages application + dependencies into a **portable unit**.

---

### Q6. Docker vs Virtual Machine?

| VM        | Docker        |
| --------- | ------------- |
| Full OS   | Shared kernel |
| Heavy     | Lightweight   |
| Slow boot | Fast          |

---

### Q7. Explain Docker architecture

```
Dockerfile
   ↓ build
Docker Image
   ↓ run
Docker Container
```

---

### Q8. What is a Dockerfile?

A recipe to build an image.

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm","start"]
```

---

### Q9. Common Docker mistakes in production?

* Running DB inside container
* No health checks
* No volume mounts
* No .dockerignore

---

# 4️⃣ NGINX & TRAFFIC FLOW

### Q10. What is NGINX used for?

* Reverse proxy
* SSL termination
* Load balancing
* Static file serving

---

### Q11. Why not expose Node/FastAPI directly?

* No SSL handling
* No buffering
* No rate limiting

---

### Q12. System diagram with NGINX

```
Client
  ↓ HTTPS
NGINX
  ↓ HTTP
Backend (Node / FastAPI)
```

---

# 5️⃣ CACHING & REDIS

### Q13. Why caching is required?

Databases are:

* Slow
* Expensive

Caching improves:

* Latency
* Throughput

---

### Q14. Redis vs In‑Memory Cache?

| Feature    | In‑Memory | Redis    |
| ---------- | --------- | -------- |
| Shared     | ❌         | ✅        |
| Persistent | ❌         | Optional |
| Scalable   | ❌         | ✅        |

---

### Q15. Redis real‑world usage?

* API response caching
* Sessions
* Rate limiting
* Queues

---

# 6️⃣ QUEUES & ASYNC PROCESSING

### Q16. Why queues are needed?

Without queues:

```
API → Email → PDF → Payment → Response
```

With queues:

```
API → Queue → Worker
```

---

### Q17. What is BullMQ?

BullMQ is a **Redis‑based job queue** for Node.js.

Use cases:

* Emails
* Notifications
* Cron jobs

---

### Q18. BullMQ vs RabbitMQ vs Kafka?

| Tool     | Purpose         |
| -------- | --------------- |
| BullMQ   | Background jobs |
| RabbitMQ | Message broker  |
| Kafka    | Event streaming |

---

# 7️⃣ CI / CD PIPELINES

### Q19. What is CI/CD?

```
Code Push
 → Test
 → Build
 → Deploy
```

---

### Q20. GitHub Actions vs Jenkins?

| GitHub Actions | Jenkins     |
| -------------- | ----------- |
| Managed        | Self‑hosted |
| YAML           | UI + Groovy |
| Easy           | Powerful    |

---

### Q21. Typical CI/CD flow

```
GitHub
 ↓
CI Runner
 ↓
Docker Build
 ↓
Deploy to Server
```

---

# 8️⃣ AWS & CLOUD DEPLOYMENT

### Q22. What is EC2?

EC2 is a **virtual Linux server** in AWS.

---

### Q23. How do you deploy a Node/FastAPI app on EC2?

1. Create EC2
2. SSH into server
3. Install Docker / Node
4. Run container or PM2
5. Configure NGINX

---

### Q24. What is S3?

S3 is **object storage** used for:

* Images
* Videos
* Backups

---

### Q25. AWS architecture diagram

```
User
 ↓
CloudFront (optional)
 ↓
NGINX (EC2)
 ↓
App Container
 ↓
RDS / Redis
```

---

# 9️⃣ MONITORING & OBSERVABILITY

### Q26. Why monitoring is critical?

Without monitoring:

* You find bugs from users

---

### Q27. Prometheus & Grafana

* Prometheus → metrics
* Grafana → dashboards

---

### Q28. What should you monitor?

* CPU / Memory
* Response time
* Error rate
* Queue length

---

# 🔟 PM2 vs DOCKER vs KUBERNETES

### Q29. PM2 vs Docker?

| PM2       | Docker       |
| --------- | ------------ |
| Simple    | Standard     |
| Node‑only | Any language |

---

### Q30. When Kubernetes?

Use Kubernetes when:

* Many services
* Auto‑scaling needed
* High availability required

---

# 1️⃣1️⃣ PRODUCTION FAILURES & SENIOR MINDSET

### Q31. Why systems fail in production?

* No retries
* No timeouts
* No backpressure

---

### Q32. What makes a senior engineer?

* Designs for failure
* Thinks async
* Cares about cost
* Owns production

---

# 🧩 FULL PRODUCTION SYSTEM DIAGRAM

```
Client
  ↓
CDN
  ↓
NGINX
  ↓
API Containers
  ↓
Redis (Cache / Queue)
  ↓
Database
```

---

# ✅ FINAL INTERVIEW TIP

> Interviewers look for **clarity of thought**, not buzzwords.

If you can explain:

* Why a queue exists
* Why Redis is used
* How deployment happens

You are already ahead 🚀

---

## NEXT (If You Want)

* Convert this into **PDF / Notion format**
* Add **real AWS diagrams (icons)**
* Create **mock interview Q&A**
* Build **one real project mapped to these answers**

Just tell me 👋
