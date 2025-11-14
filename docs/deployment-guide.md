# 🚀 Deployment Guide - Mira AI

## 📋 Overview

Mira AI is deployed on AWS EC2 using a fully automated CI/CD pipeline with Docker containerization. Every push to the `main` branch triggers an automatic build and deployment process.

**Live URL:** https://mira.gksage.com

---

## 🏗️ Architecture Overview

```mermaid
graph TB
    User[👤 User] -->|HTTPS| Nginx[🌐 Nginx Reverse Proxy<br/>Port 443/80]
    Nginx -->|Proxy Pass| Docker[🐳 Docker Container<br/>Port 3001]
    Docker -->|Internal| App[⚛️ Node.js + React App<br/>Port 3001]
    App -->|Query| MongoDB[(🍃 MongoDB Atlas<br/>Vector Store)]
    App -->|API Call| Gemini[🤖 Google Gemini AI]
    
    GitHub[📦 GitHub Repository] -->|Push to main| Actions[⚙️ GitHub Actions]
    Actions -->|Build| DockerHub[🐋 Docker Hub]
    Actions -->|Deploy via SSH| EC2[☁️ AWS EC2 Instance]
    EC2 -->|Pull Image| DockerHub
    
    style User fill:#e1f5ff
    style Nginx fill:#90ee90
    style Docker fill:#87ceeb
    style App fill:#ffd700
    style MongoDB fill:#98fb98
    style Gemini fill:#ffb6c1
    style GitHub fill:#f0f0f0
    style Actions fill:#ffa07a
    style DockerHub fill:#4da6ff
    style EC2 fill:#ff9999
```

---

## 🔄 CI/CD Pipeline Flow

### Step-by-Step Process

```mermaid
graph LR
    A[📝 Code Push to main] --> B[🔨 Build Docker Image]
    B --> C[📤 Push to Docker Hub]
    C --> D[🔐 SSH to EC2]
    D --> E[📥 Pull Latest Image]
    E --> F[🛑 Stop Old Container]
    F --> G[🧹 Cleanup Resources]
    G --> H[⚙️ Configure Environment]
    H --> I[🚀 Start New Container]
    I --> J[✅ Verify Deployment]
    
    style A fill:#e1f5ff
    style B fill:#ffd700
    style C fill:#4da6ff
    style D fill:#ff9999
    style E fill:#90ee90
    style F fill:#ffb6c1
    style G fill:#dda0dd
    style H fill:#f0e68c
    style I fill:#98fb98
    style J fill:#7fffd4
```

### Detailed Workflow

1. **Developer pushes code** to `main` branch
2. **GitHub Actions triggered** automatically
3. **Build Job:**
   - Checkout code
   - Set up Docker Buildx
   - Login to Docker Hub
   - Build multi-stage Docker image (Frontend + Backend)
   - Push to Docker Hub with tags: `latest`, `main-<sha>`, `main`
   - Uses layer caching for faster builds

4. **Deploy Job:**
   - SSH into EC2 instance
   - Pull latest Docker image
   - Configure environment (set PORT=3001)
   - Stop existing container gracefully (10s timeout)
   - Remove old container (all states: running/stopped/created)
   - Verify port 3001 is free
   - Start new container with:
     - Environment variables from `.env` file
     - Volume mount for persistent data
     - Port mapping: `3001:3001`
     - Auto-restart policy
   - Clean up old Docker images
   - Display logs for verification

---

## 🐳 Docker Architecture

### Multi-Stage Build

```dockerfile
# Stage 1: Build Frontend (Vite/React)
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=frontend-builder /app/dist ./dist
COPY server ./server
EXPOSE 3001
CMD ["node", "server/server.js"]
```

**Benefits:**
- ✅ Smaller final image size (~200MB vs ~800MB)
- ✅ Only production dependencies included
- ✅ Built frontend assets served by Node.js
- ✅ Single container for simplicity

---

## 🌐 Nginx Reverse Proxy Setup

### Configuration (`/etc/nginx/sites-available/mira-ai`)

```nginx
server {
    server_name mira.gksage.com;

    # Proxy all requests to Docker container
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Forwarding headers
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SSL Configuration (Let's Encrypt)
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/mira.gksage.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mira.gksage.com/privkey.pem;
}

# HTTP to HTTPS redirect
server {
    if ($host = mira.gksage.com) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name mira.gksage.com;
    return 404;
}
```

**What Nginx Does:**
- 🔒 SSL/TLS termination (HTTPS encryption)
- 🔄 HTTP → HTTPS redirect
- 🌐 Reverse proxy to Docker container
- 🔌 WebSocket support for real-time features
- 📊 Access logging and error tracking

---

## 🔐 Environment Configuration

### Production Environment Variables

Located at `/home/ubuntu/mira-ai/.env` on EC2:

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/

# AI API Key
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=3001
NODE_ENV=production
```

**Important:** The deployment script automatically ensures `PORT=3001` to match:
- Docker port mapping: `-p 3001:3001`
- Nginx proxy: `proxy_pass http://localhost:3001`
- Application listening port: `app.listen(3001)`

---

## 🛠️ Deployment Components

### 1. GitHub Actions Workflow

**File:** `.github/workflows/docker-deploy.yml`

**Key Features:**
- Automated on push to `main`
- Parallel job execution (build → deploy)
- Secrets management for credentials
- Build caching for speed
- Multi-platform support

### 2. Docker Container

**Features:**
- Node.js 18 Alpine (minimal size)
- Environment variable injection via `--env-file`
- Volume mount: `/home/ubuntu/mira-ai/data:/app/data`
- Auto-restart policy: `unless-stopped`
- Health check via `/api/health` endpoint

### 3. EC2 Instance

**Specifications:**
- Ubuntu Server
- Docker installed
- Nginx installed
- SSL certificates (Let's Encrypt)
- Security group: Ports 80, 443, 22 open

### 4. MongoDB Atlas

**Configuration:**
- Cluster: Cloud-hosted
- IP Whitelist: EC2 instance IP
- Database: `mira_real_estate`
- Collection: `properties` (30 documents)
- Vector Search Index: Active on `embedding` field

---

## 🔧 Deployment Challenges & Solutions

### 1. Port Already Allocated Error

**Problem:** New container couldn't bind to port 3001

**Solution:**
```bash
# Graceful shutdown with timeout
docker stop -t 10 $CONTAINER_NAME

# Remove container in ANY state (running/stopped/created)
docker ps -aq -f name=$CONTAINER_NAME | xargs docker rm -f

# Verify port is free
docker ps -q --filter "publish=3001" | xargs docker rm -f

# Brief pause for OS to release port
sleep 2
```

### 2. Container Name Conflict

**Problem:** Container existed in "Created" state, blocking new deployment

**Solution:**
```bash
# Check ALL container states (not just running)
docker ps -aq -f name=$CONTAINER_NAME
```

### 3. Missing Environment Variables

**Problem:** `MONGODB_URI` was undefined in container

**Solution:**
```bash
# Use --env-file instead of individual -e flags
docker run --env-file /home/ubuntu/mira-ai/.env ...
```

### 4. Port Mismatch (App vs Nginx)

**Problem:** App listened on 7070, but Nginx proxied to 3001

**Solution:**
```bash
# Automatically set PORT=3001 in deployment script
sed -i 's/^PORT=.*/PORT=3001/' /home/ubuntu/mira-ai/.env
```

---

## 📊 Request Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Nginx
    participant Docker
    participant App
    participant MongoDB
    participant Gemini

    User->>Nginx: HTTPS Request (443)
    Nginx->>Nginx: SSL Termination
    Nginx->>Docker: HTTP Proxy (3001)
    Docker->>App: Forward Request
    App->>MongoDB: Vector Search Query
    MongoDB-->>App: Property Results
    App->>Gemini: Generate AI Response
    Gemini-->>App: Natural Language Reply
    App-->>Docker: JSON Response
    Docker-->>Nginx: HTTP Response
    Nginx-->>User: HTTPS Response (encrypted)
```

---

## 🚀 Manual Deployment Steps (If Needed)

### On EC2 Instance:

```bash
# 1. Pull latest image
docker pull ankitkj199/mira-ai:latest

# 2. Stop and remove old container
docker stop mira-ai-app 2>/dev/null || true
docker rm -f mira-ai-app 2>/dev/null || true

# 3. Start new container
docker run -d \
  --name mira-ai-app \
  --restart unless-stopped \
  -p 3001:3001 \
  -v /home/ubuntu/mira-ai/data:/app/data \
  --env-file /home/ubuntu/mira-ai/.env \
  ankitkj199/mira-ai:latest

# 4. Check logs
docker logs -f mira-ai-app
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Container is running: `docker ps | grep mira-ai-app`
- [ ] Logs show "Server running": `docker logs mira-ai-app`
- [ ] MongoDB connected: Check logs for "✅ MongoDB Connected"
- [ ] Health endpoint: `curl http://localhost:3001/api/health`
- [ ] Website accessible: https://mira.gksage.com
- [ ] SSL certificate valid (green lock icon)
- [ ] Chat interface working
- [ ] Property filtering functional

---

## 🔍 Monitoring & Debugging

### Check Container Status
```bash
docker ps -a | grep mira-ai
```

### View Live Logs
```bash
docker logs -f mira-ai-app
```

### Check Recent Logs
```bash
docker logs --tail 100 mira-ai-app
```

### Inspect Container
```bash
docker inspect mira-ai-app
```

### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/mira-ai_access.log

# Error logs
sudo tail -f /var/log/nginx/mira-ai_error.log
```

### Restart Container
```bash
docker restart mira-ai-app
```

---

## 🎯 Zero-Downtime Deployment Strategy

Current implementation ensures minimal downtime:

1. **New image pulled** while old container runs
2. **Graceful shutdown** with 10-second timeout
3. **Quick cleanup** (< 2 seconds)
4. **New container starts** immediately
5. **Total downtime:** ~12-15 seconds

**Future Enhancement:** Blue-Green deployment for true zero-downtime.

---

## 📝 Required Secrets (GitHub Repository)

Configure these in **Settings → Secrets and variables → Actions**:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `DOCKER_USERNAME` | Docker Hub username | `ankitkj199` |
| `DOCKER_PASSWORD` | Docker Hub access token | `dckr_pat_xxx...` |
| `EC2_HOST` | EC2 instance public IP/domain | `ec2-xx-xx-xx-xx.compute.amazonaws.com` |
| `EC2_USERNAME` | SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Private SSH key for EC2 | `-----BEGIN RSA PRIVATE KEY-----...` |

---

## 🌟 Best Practices Implemented

- ✅ Multi-stage Docker builds (smaller images)
- ✅ Automated CI/CD pipeline
- ✅ Graceful container shutdown
- ✅ Environment-based configuration
- ✅ SSL/TLS encryption
- ✅ Health check endpoints
- ✅ Automated cleanup of old images
- ✅ Port conflict resolution
- ✅ Container state verification
- ✅ Deployment logging and verification

---

## 🆘 Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker logs mira-ai-app
```

**Common issues:**
- Missing environment variables
- Port already in use
- MongoDB connection failure

### Website Not Accessible

**Check Nginx:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

**Check SSL:**
```bash
sudo certbot certificates
```

### Database Connection Error

**Verify:**
- MongoDB Atlas IP whitelist includes EC2 IP
- `MONGODB_URI` is correct in `.env`
- Network connectivity: `ping cluster.mongodb.net`

---

## 📞 Support

For deployment issues, check:
1. GitHub Actions logs: Repository → Actions tab
2. Docker container logs: `docker logs mira-ai-app`
3. Nginx error logs: `/var/log/nginx/mira-ai_error.log`

---

**Last Updated:** November 2025  
**Deployment Status:** ✅ Production Ready
