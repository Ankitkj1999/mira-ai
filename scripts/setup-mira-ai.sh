#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Mira AI Deployment Setup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Configuration
DOMAIN="mira.gksage.com"
APP_PORT=3001
CONTAINER_NAME="mira-ai-app"
IMAGE_NAME="ankitkj199/mira-ai"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root. Run as ubuntu user.${NC}"
   exit 1
fi

# 1. Create Nginx configuration
echo -e "${YELLOW}[1/7] Creating Nginx configuration for ${DOMAIN}...${NC}"
sudo tee /etc/nginx/sites-available/mira-ai > /dev/null <<EOF
server {
    server_name ${DOMAIN};

    # Logging
    access_log /var/log/nginx/mira-ai_access.log;
    error_log /var/log/nginx/mira-ai_error.log;

    # Client body size limit
    client_max_body_size 50M;

    # For Certbot challenges
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Proxy settings
    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Proxy headers
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:${APP_PORT}/health;
        access_log off;
    }

    # API endpoints
    location /api {
        proxy_pass http://localhost:${APP_PORT}/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    listen 80;
    listen [::]:80;
}
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx configuration created${NC}"
else
    echo -e "${RED}✗ Failed to create Nginx configuration${NC}"
    exit 1
fi

# 2. Enable the site
echo -e "${YELLOW}[2/7] Enabling Nginx site...${NC}"
sudo ln -sf /etc/nginx/sites-available/mira-ai /etc/nginx/sites-enabled/
echo -e "${GREEN}✓ Site enabled${NC}"

# 3. Test Nginx configuration
echo -e "${YELLOW}[3/7] Testing Nginx configuration...${NC}"
sudo nginx -t
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "${RED}✗ Nginx configuration has errors${NC}"
    exit 1
fi

# 4. Reload Nginx
echo -e "${YELLOW}[4/7] Reloading Nginx...${NC}"
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}✗ Failed to reload Nginx${NC}"
    exit 1
fi

# 5. Create data directory with proper permissions
echo -e "${YELLOW}[5/7] Creating data directory...${NC}"
mkdir -p /home/ubuntu/mira-ai/data
chmod 755 /home/ubuntu/mira-ai/data
echo -e "${GREEN}✓ Data directory created${NC}"

# 6. Add user to docker group (if not already)
echo -e "${YELLOW}[6/7] Checking Docker permissions...${NC}"
if groups $USER | grep &>/dev/null '\bdocker\b'; then
    echo -e "${GREEN}✓ User already in docker group${NC}"
else
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ User added to docker group${NC}"
    echo -e "${YELLOW}Note: You may need to log out and back in for group changes to take effect${NC}"
fi

# 7. Get SSL certificate with Certbot
echo -e "${YELLOW}[7/7] Setting up SSL certificate with Certbot...${NC}"
echo ""
echo -e "${BLUE}Certbot will now request an SSL certificate for ${DOMAIN}${NC}"
echo -e "${BLUE}Please follow the prompts...${NC}"
echo ""
sleep 2

sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --register-unsafely-without-email || \
sudo certbot --nginx -d ${DOMAIN}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSL certificate obtained and configured${NC}"
else
    echo -e "${YELLOW}! SSL setup failed or was skipped. You can run it manually later with:${NC}"
    echo -e "${YELLOW}  sudo certbot --nginx -d ${DOMAIN}${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Configuration Summary:${NC}"
echo -e "  Domain: ${DOMAIN}"
echo -e "  App Port: ${APP_PORT}"
echo -e "  Container: ${CONTAINER_NAME}"
echo -e "  Image: ${IMAGE_NAME}"
echo -e "  Data Dir: /home/ubuntu/mira-ai/data"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Add these GitHub Secrets to your repository:"
echo -e "   - EC2_HOST: $(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo 'YOUR_EC2_IP')"
echo -e "   - EC2_USERNAME: ubuntu"
echo -e "   - EC2_SSH_KEY: (contents of your .pem file)"
echo ""
echo -e "2. Push to main branch to trigger automatic deployment"
echo ""
echo -e "${YELLOW}Manual Deployment Commands:${NC}"
echo -e "  ${BLUE}# Pull latest image${NC}"
echo -e "  docker pull ${IMAGE_NAME}:latest"
echo ""
echo -e "  ${BLUE}# Stop and remove old container${NC}"
echo -e "  docker stop ${CONTAINER_NAME} 2>/dev/null || true"
echo -e "  docker rm ${CONTAINER_NAME} 2>/dev/null || true"
echo ""
echo -e "  ${BLUE}# Run new container${NC}"
echo -e "  docker run -d \\"
echo -e "    --name ${CONTAINER_NAME} \\"
echo -e "    --restart unless-stopped \\"
echo -e "    -p ${APP_PORT}:3001 \\"
echo -e "    -v /home/ubuntu/mira-ai/data:/app/data \\"
echo -e "    -e NODE_ENV=production \\"
echo -e "    ${IMAGE_NAME}:latest"
echo ""
echo -e "${YELLOW}Check Status:${NC}"
echo -e "  docker ps | grep ${CONTAINER_NAME}"
echo -e "  docker logs -f ${CONTAINER_NAME}"
echo -e "  curl http://localhost:${APP_PORT}/health"
echo ""
echo -e "${GREEN}Access your app at: https://${DOMAIN}${NC}"
echo ""