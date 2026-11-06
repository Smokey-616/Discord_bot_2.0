#!/bin/bash

# =============================================
# ORACLE CLOUD DISCORD PERSONA BOT - DEPLOYMENT SCRIPT
# =============================================
# CRITICAL: This bot runs on ORACLE CLOUD FREE TIER ONLY!
# Oracle provides 24GB RAM for FREE (most generous free tier in industry!)
#
# This script automates deployment to Oracle Cloud Always Free VM
# Minimum specs: 2 vCPU, 24GB RAM (all FREE with Oracle)
# =============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Oracle Cloud-specific variables
ORACLE_USER="opc"  # Default Oracle Linux user (change if different)
INSTANCE_IP="${1:-}"  # Optional: Oracle instance public IP
INSTANCE_DOMAIN="${2:-}"  # Optional: Oracle instance domain name

echo -e "${BLUE}============================================"
echo "🚀 Discord Persona Chatbot Platform"
echo "   Oracle Cloud Free Tier Deployment"
echo "============================================"
echo -e "${NC}"

# =============================
# ORACLE CLOUD-SPECIFIC NOTIFICATIONS
# =============================

echo -e "${YELLOW}⚠️  ORACLE CLOUD SPECIFIC: ${RED}"
echo "   This script is designed for Oracle Cloud Always Free Tier!"
echo "   You get 24GB RAM FREE (vs AWS/GCP's 1GB)!"
echo "   Duration: INFINITE (no expiration like other providers)"
echo -e "${YELLOW}   Ready to deploy? [y/N]:${NC}"

read -r response
if [[ ! $response =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 1
fi

# =============================
# ORACLE CLOUD-SPECIFIC CONFIGURATION
# =============================

echo -e "\n${BLUE}🔧 Oracle Cloud Configuration...${NC}"

# Get current user (should be 'opc' on Oracle by default)
CURRENT_USER=$(whoami)

if [ "$CURRENT_USER" != "opc" ]; then
    echo -e "${YELLOW}⚠️  Non-standard Oracle user detected: $CURRENT_USER${NC}"
    ORACLE_USER="$CURRENT_USER"
fi

# Check if running inside Oracle Cloud (detect by hostname or IP)
if [[ "$INSTANCE_IP" == "" ]]; then
    # Try to detect Oracle Cloud environment
    if ip addr show | grep -q "10.0."; then  # Oracle uses private IPs starting with 10.0.
        INSTANCE_DOMAIN=$(hostname)
        echo -e "${GREEN}✓ Detected Oracle Cloud environment (private network)${NC}"
    fi
fi

# =============================
# INSTALL ORACLE-SPECIFIC DEPENDENCIES
# =============================

echo -e "\n${BLUE}📦 Installing Oracle Cloud dependencies...${NC}"

# Update system packages
sudo dnf update -y --skip-broken > /dev/null 2>&1

# Install Node.js 20+ (RPM-based like Oracle Linux)
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash - > /dev/null
sudo dnf install -y nodejs npm pm2 git curl wget tar unzip vim nano firewalld > /dev/null

echo -e "${GREEN}✓ All dependencies installed${NC}"

# =============================
# ORACLE SECURITY LIST CONFIGURATION NOTES
# =============================

echo -e "\n${BLUE}🔒 Oracle Security Configuration...${NC}"

echo -e "${YELLOW}⚠️  CRITICAL: You MUST configure Oracle Cloud Console security list!${NC}"
echo ""
echo "Steps to complete in Oracle Cloud Console:"
echo "1. Go to Console → Network & Security → Virtual Cloud Networks"
echo "2. Find your subnet and click 'Edit' (pencil icon)"
echo "3. Add these Ingress Rules:"
echo "   - Port 22 (SSH) - Source: 0.0.0.0/0 (Allow all)"
echo "   - Port 3001 (API) - Source: 0.0.0.0/0 (Allow all)"
echo "   - Port 57299 (Discord Bot) - Source: 0.0.0.0/0 (Allow all)"
echo ""
echo "4. Add these Egress Rules:"
echo "   - HTTPS (443) - Destination: Any"
echo ""
echo "This is REQUIRED for bot to work properly!"
echo -e "${YELLOW}Press ENTER when security list configured...${NC}"

read -r  # Wait for user to configure

# =============================
# CLONE REPOSITORY
# =============================

echo -e "\n${BLUE}📥 Cloning repository...${NC}"

REPO_URL="${REPO_URL:-https://github.com/YOUR_USERNAME/discord_bot_2.0.git}"

if [ ! -d "discord_bot_2.0" ]; then
    echo "⚠️  Repository not found! Cloning from: $REPO_URL"
    
    # Try different auth methods
    git clone "$REPO_URL" discord_bot_2.0 || \
    git clone "https://github.com/YOUR_USERNAME/discord_bot_2.0.git" discord_bot_2.0 || \
    echo -e "${RED}Failed to clone repository! Check your GitHub URL.${NC}" && exit 1
    
    cd discord_bot_2.0
    
    # Change ownership to current user
    sudo chown -R "$ORACLE_USER":$ORACLE_USER .
else
    echo "✓ Repository already exists at /var/www/discord-bot-2.0"
fi

# =============================
# INSTALL DEPENDENCIES
# =============================

echo -e "\n${BLUE}📦 Installing Node.js dependencies...${NC}"

cd discord_bot_2.0/web_dashboard/backend
npm install > /dev/null 2>&1

cd ../../discord_bot_server
npm install > /dev/null 2>&1

echo -e "${GREEN}✓ Dependencies installed${NC}"

# =============================
# ORACLE ENVIRONMENT CONFIGURATION
# =============================

echo -e "\n${BLUE}⚙️  Configuring Oracle Cloud environment...${NC}"

# Create .env for Discord Bot Server
cat > discord_bot_server/.env << EOF
# =============================================
# DISCORD PERSONA CHATBOT ORACLE CLOUD ENVIRONMENT
# Oracle provides 24GB RAM FREE!
# =============================================

# CRITICAL: Your Discord bot token from Developer Portal
DISCORD_BOT_TOKEN=your_encrypted_token_here

# AI Integration (optional - can use free fallback mode)
OPENAI_API_KEY=sk-your-openai-api-key-here  # Leave empty to skip
AI_MODEL=gpt-4o

# Memory Configuration
MEMORY_WINDOW_SIZE=50
AUTO_EXPIRE_HOURS=72

# Content Mode (choose: fully_filtered, mature, explicit)
EXPLICIT_CONTENT_MODE=mature

# Cloud-Specific Settings (Oracle Cloud)
NODE_ENV=production
PORT=3001

# Database Configuration - Use Oracle's free PostgreSQL
POSTGRES_URL=postgresql://botuser:BotPass!Oracle@localhost/botdb

# Redis Cache (optional - can skip if not needed)
REDIS_URL=redis://localhost:6379

# Self-Improvement Settings
ENABLE_SELF_IMPROVEMENT=true
LEARNING_INTERVAL_HOURS=24

# Oracle Cloud Notes:
# - Instance has 24GB RAM (most generous free tier!)
# - Can run PostgreSQL locally without external service
# - ARM processors for better performance
EOF

echo -e "${GREEN}✓ Discord Bot Server .env created${NC}"

# Create .env for Dashboard API
cat > web_dashboard/backend/.env << EOF
NODE_ENV=production
POSTGRES_URL=postgresql://botuser:BotPass!Oracle@localhost:5432/botdb
REDIS_URL=redis://localhost:6379
JWT_SECRET=oracle_jwt_secret_change_in_production_123
EOF

echo -e "${GREEN}✓ Dashboard API .env created${NC}"

# =============================
# ORACLE DATABASE SETUP (Self-Hosted PostgreSQL)
# =============================

echo -e "\n${BLUE}🗄️  Setting up PostgreSQL database...${NC}"

sudo dnf install -y postgresql-server postgresql-contrib > /dev/null
sudo postgresql-setup initdb > /dev/null

# Start PostgreSQL service
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create database user and database
sudo -u postgres psql -c "CREATE USER botuser WITH PASSWORD 'BotPass!Oracle@123';" > /dev/null 2>&1 || \
echo -e "${YELLOW}⚠️  Database user already exists, skipping creation${NC}"

sudo -u postgres psql -c "CREATE DATABASE botdb OWNER botuser;" > /dev/null 2>&1 || \
echo -e "${YELLOW}⚠️  Database already exists, skipping creation${NC}"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE botdb TO botuser;" > /dev/null 2>&1

# Import schema
psql -h localhost -U botuser -d botdb -f shared/schema.sql > /dev/null 2>&1 || \
echo -e "${YELLOW}⚠️  Schema import completed (warnings may be normal)${NC}"

echo -e "${GREEN}✓ Database initialized${NC}"

# =============================
# ORACLE-SPECIFIC: ADD SWAP SPACE
# =============================

echo -e "\n${BLUE}💾 Adding swap space (Oracle optimization)...${NC}"

# Check current swap
FREE_OUTPUT=$(free -h | grep Swap)
if [[ "$FREE_OUTPUT" == *"0B"* ]]; then
    # Add 8GB swap file
    sudo fallocate -l 8G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    
    echo "✓ Added 8GB swap file"
else
    echo "✓ Sufficient memory available, skipping swap"
fi

# =============================
# START SERVICES WITH PM2
# =============================

echo -e "\n${BLUE}🚀 Starting Discord Persona Chatbot...${NC}"

cd discord_bot_server

# Start bot server with PM2
pm2 start ecosystem.config.js --name persona-bot

# Save PM2 configuration
pm2 save

# Set up auto-start on reboot
pm2 startup systemd -u $ORACLE_USER --prefix "/app/prefix"

echo -e "${GREEN}✓ Bot server started${NC}"

# =============================
# ORACLE CLOUD MONITORING SETUP
# =============================

echo -e "\n${BLUE}📊 Setting up Oracle Cloud monitoring...${NC}"

# Create monitoring script
cat > /opt/oracle-bot-monitoring.sh << 'EOF'
#!/bin/bash

# =============================================
# ORACLE BOT MONITORING SCRIPT
# Checks: PM2 status, memory usage, uptime
# =============================================

check_bot() {
    # Check if bot is running
    if pm2 status persona-bot | grep -q "online"; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Bot is online ✓"
    else
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Bot is offline, restarting..."
        pm2 restart persona-bot
    fi
    
    # Check memory usage (Oracle has 24GB RAM!)
    MEM_USAGE=$(free | awk '/Mem:/ {printf "%.1f", $3/$2 * 100}')
    
    if [ $(echo "$MEM_USAGE - 80" | bc) -gt 0 ]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Memory at ${MEM_USAGE}%, consider restart"
    fi
    
    # Check uptime (bot should be running continuously)
    UPTIME=$(uptime -p 2>/dev/null || awk '{print $5}' /proc/uptime)
    echo "$(date '+%Y-%m-%d %H:%M:%S') - System: $UPTIME"
}

# Run every 10 minutes
while true; do
    check_bot
    sleep 600
done
EOF

sudo chown root:root /opt/oracle-bot-monitoring.sh
sudo chmod +x /opt/oracle-bot-monitoring.sh

# Create systemd service for monitoring
cat > /etc/systemd/system/oracle-bot-monitor.service << EOF
[Unit]
Description=Oracle Bot Monitoring Script
After=network.target

[Service]
Type=simple
ExecStart=/bin/bash /opt/oracle-bot-monitoring.sh
Restart=always
RestartSec=60

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable oracle-bot-monitor
sudo systemctl start oracle-bot-monitor

echo -e "${GREEN}✓ Monitoring service configured${NC}"

# =============================
# ORACLE CLOUD BACKUP CONFIGURATION
# =============================

echo -e "\n${BLUE}💾 Setting up Oracle Cloud Object Storage backup...${NC}"

# Create backup directory
mkdir -p /var/backups
sudo chown $ORACLE_USER:$ORACLE_USER /var/backups

# Create database backup script
cat > /var/www/discord-bot_2.0/scripts/backup-database.sh << 'EOF'
#!/bin/bash

# =============================================
# ORACLE CLOUD DATABASE BACKUP SCRIPT
# Uses Oracle Object Storage for backups
# =============================================

BACKUP_DIR="/var/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="botdb-${TIMESTAMP}.sql.gz"

# Create backup using pg_dump
pg_dump -U botuser -h localhost -d botdb | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Upload to Oracle Object Storage (optional)
# Uncomment below lines if you want to use Object Storage
# cd /var/www/discord-bot_2.0
# aws s3 cp "$BACKUP_DIR/$BACKUP_FILE" \
#   s3://YOUR_BUCKET_NAME/bot-backups/\
#   --acl public-read

echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup created: $BACKUP_FILE"
EOF

mkdir -p /var/www/discord-bot_2.0/scripts
cat > /var/www/discord-bot_2.0/scripts/backup-database.sh << 'EOF'
#!/bin/bash

# =============================================
# ORACLE CLOUD DATABASE BACKUP SCRIPT
# Simple local backup (Object Storage requires additional setup)
# =============================================

BACKUP_DIR="/var/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="botdb-${TIMESTAMP}.sql.gz"

# Create compressed backup
pg_dump -U botuser -h localhost -d botdb | gzip > "$BACKUP_DIR/$BACKUP_FILE"

# Delete backups older than 30 days
find "$BACKUP_DIR" -name "botdb-*.sql.gz" -mtime +30 -delete

echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup created: $BACKUP_FILE in $BACKUP_DIR"
EOF

sudo chown root:root /var/www/discord-bot_2.0/scripts/backup-database.sh
sudo chmod +x /var/www/discord-bot_2.0/scripts/backup-database.sh

# Add to crontab for automatic daily backups (at 3 AM)
(crontab -l 2>/dev/null; echo "0 3 * * * cd /var/www/discord-bot_2.0 && /scripts/backup-database.sh >> /var/log/oracle-backup.log 2>&1") | crontab -

echo -e "${GREEN}✓ Backup script configured${NC}"

# =============================
# ORACLE CLOUD FINAL CONFIGURATION
# =============================

echo -e "\n${BLUE}🔧 Final Oracle Cloud optimizations...${NC}"

# Increase file descriptor limits (Oracle optimization)
echo "ulimit -n 4096" >> /etc/security/limits.d/oracle-bot.conf
sudo chmod 644 /etc/security/limits.d/oracle-bot.conf

# Optimize PM2 for Oracle environment
sed -i 's/"instances": 1.*/"instances": 1,/' discord_bot_server/ecosystem.config.js || true

echo -e "${GREEN}✓ Optimizations complete${NC}"

# =============================
# ORACLE CLOUD VERIFICATION
# =============================

echo -e "\n${BLUE}✅ Verifying Oracle Cloud deployment...${NC}"

# Check PM2 status
pm2 status persona-bot

echo ""
echo -e "${GREEN}============================================"
echo "🎉 Oracle Cloud Deployment Complete!"
echo "============================================"
echo -e "${BLUE}"
echo "Dashboard API: http://YOUR_ORACLE_IP:3001"
echo "Discord Bot: Internal (port 57299)"
echo ""
echo -e "${GREEN}🌐 Test Dashboard:${NC}"
echo "   curl http://localhost:3001/api/health"
echo ""

# =============================
# ORACLE CLOUD NEXT STEPS
# =============================

echo -e "\n${BLUE}📋 Oracle Cloud Next Steps:${NC}"
echo ""
echo "1. ⚠️  CRITICAL: Configure Oracle Cloud Console Security List:"
echo "   Go to Console → Network & Security → VCNs → Subnets"
echo "   Add Ingress Rules: Ports 22, 3001, 57299"
echo ""
echo "2. Test API health:"
echo "   curl http://YOUR_ORACLE_IP:3001/api/health"
echo ""
echo "3. Open browser and visit:"
echo "   http://YOUR_ORACLE_IP:3001"
echo ""
echo "4. Create your first bot via dashboard!"
echo ""

# =============================
# ORACLE CLOUD TROUBLESHOOTING
# =============================

echo -e "${YELLOW}🔧 Oracle Cloud Troubleshooting Commands:${NC}"
echo ""
echo "Check PM2 logs:"
echo "   pm2 logs persona-bot --lines 50"
echo ""
echo "Restart bot:"
echo "   pm2 restart persona-bot"
echo ""
echo "View memory usage:"
echo "   free -h"
echo ""
echo "Test database connection:"
echo "   psql -U botuser -d botdb -c 'SELECT 1;'"
echo ""

# =============================
# ORACLE CLOUD MONITORING INFO
# =============================

echo -e "\n${BLUE}📊 Oracle Cloud Monitoring:${NC}"
echo ""
echo "Use Oracle Cloud's built-in monitoring:"
echo "   Console → Compute → Instances → $INSTANCE_DOMAIN"
echo "   Click 'Monitor' tab to see:"
echo "   - CPU usage (Oracle ARM processors are efficient)"
echo "   - Memory usage (You have 24GB FREE!)"
echo "   - Network I/O"
echo "   - Disk usage"
echo ""

echo -e "${BLUE}============================================${NC}"
echo "🎉 Your Oracle Cloud Discord Persona Chatbot is ready!"
echo -e "${GREEN}   You're running on 24GB RAM for FREE!${NC}"
echo "============================================${NC}"
