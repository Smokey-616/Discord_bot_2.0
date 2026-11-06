# Discord Persona Chatbot Platform - Cloud Deployment Guide
## Complete Guide to Deploy on AWS/GCP/DigitalOcean

---

## ☁️ Overview

This platform is designed to run **exclusively on cloud infrastructure**. Never deploy to:
- ❌ Your personal laptop
- ❌ Home computer
- ❌ Raspberry Pi (unless in a cloud container)

**Minimum Cloud Specs:**
- 2 vCPUs
- 4GB RAM
- SSD Storage (20GB+)

---

## 🎯 Quick Deployment Options

### Option 1: Docker Compose (Recommended for beginners)

```bash
# Pull latest code
git clone <YOUR_REPO_URL>
cd discord_bot_2.0

# Build and run with Docker
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 2: PM2 on VPS (Recommended for production)

```bash
# SSH into your cloud server
ssh -i key.pem ec2-user@YOUR_SERVER_IP

# Install dependencies
cd /var/www/discord_bot_2.0
npm install

# Configure environment
nano .env  # Add Discord token from developer portal

# Start with PM2
pm2 start ecosystem.config.js --name persona-bot
pm2 save
pm2 startup  # Auto-restart on reboot
```

---

## 📦 AWS EC2 Deployment (Detailed)

### Step 1: Launch EC2 Instance

1. **Open AWS Console** → EC2 → Launch Instance
2. **Instance Type:** t2.medium or t3.medium (2 vCPUs, 4GB RAM)
3. **AMI:** Amazon Linux 2023 or Ubuntu 20.04 LTS
4. **Key Pair:** Upload your SSH key
5. **Security Group:** Allow ports 22 (SSH), 3001 (API), 57299 (Discord)

### Step 2: Configure Instance

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# Update system
sudo yum update -y

# Install Node.js 20+ and PM2
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs pm2

# Install Git for deployment
sudo yum install -y git
```

### Step 3: Deploy Application

```bash
# Clone repository (replace with your actual repo URL)
git clone https://github.com/YOUR_USERNAME/discord_bot_2.0.git /var/www/discord-bot

# Change ownership to current user
cd /var/www/discord-bot
sudo chown -R ec2-user:ec2-user .

# Install dependencies
npm install

# Configure environment variables
nano .env
```

**Add to `.env`:**
```env
DISCORD_BOT_TOKEN=your_encrypted_token_here
OPENAI_API_KEY=sk-your-openai-key-here
MEMORY_WINDOW_SIZE=50
AUTO_EXPIRE_HOURS=72
EXPLICIT_CONTENT_MODE=mature
NODE_ENV=production
PORT=3001
```

### Step 4: Start with PM2

```bash
# Start bot server
pm2 start ecosystem.config.js --name persona-bot

# Save configuration
pm2 save

# Set up auto-restart on system reboot
pm2 startup systemd -u ec2-user --prefix "/app/prefix"
```

### Step 5: Configure Firewall

```bash
# Allow necessary ports
sudo firewall-cmd --zone=public --add-port=22/tcp --permanent
sudo firewall-cmd --zone=public --add-port=3001/tcp --permanent
sudo firewall-cmd --zone=public --add-port=57299/tcp --permanent
sudo firewall-cmd --reload

# Or use AWS Security Group:
# Edit security group rules in AWS Console to allow ports 22, 3001, 57299
```

### Step 6: Verify Deployment

```bash
# Check PM2 status
pm2 status persona-bot

# View logs
pm2 logs persona-bot --lines 50

# Test API endpoint
curl http://localhost:3001/api/health

# Expected response:
# {
#   "status": "online",
#   "uptime": 123456,
#   "memoryOnlyMode": true,
#   "explicitContentMode": "mature"
# }
```

---

## 🏠 Google Cloud Compute Engine Deployment

### Step 1: Launch VM Instance

```bash
gcloud compute instances create discord-bot \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --machine-type=e2-standard-2 \
  --boot-disk-size=50GB \
  --zone=us-central1-a

# Create SSH key and allow access
gcloud compute ssh YOUR_INSTANCE_NAME
```

### Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20+ and PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs pm2 git

# Clone repository
git clone https://github.com/YOUR_USERNAME/discord_bot_2.0.git /var/www/discord-bot
cd /var/www/discord-bot
npm install
```

### Step 3: Configure and Deploy

```bash
# Create .env file
nano .env

# Add environment variables (same as AWS example above)

# Start with PM2
pm2 start ecosystem.config.js --name persona-bot
pm2 save
pm2 startup

# Test deployment
pm2 logs persona-bot
```

---

## 💸 DigitalOcean Droplet Deployment

### Step 1: Create Droplet

1. **Open DigitalOcean Console** → Create Droplet
2. **App Platform:** Ubuntu 20.04 LTS
3. **Size:** $10/mo (droplet-2vcpu-4gb) - 2 vCPUs, 4GB RAM
4. **Add SSH Key:** Upload your private key
5. **Create Droplet**

### Step 2: Connect via Terminal App

1. Click "Console" to access droplet directly
2. OR use SSH from your terminal:

```bash
ssh root@YOUR_DO_IP
# Or for specific user (add DigitalOcean account during creation)
sudo su - appuser
```

### Step 3: Deploy

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs pm2

# Clone repository
git clone https://github.com/YOUR_USERNAME/discord_bot_2.0.git /var/www/discord-bot
cd /var/www/discord-bot
npm install

# Configure environment
nano .env
# (Add your Discord token and other variables)

# Start with PM2
pm2 start ecosystem.config.js --name persona-bot
pm2 save
pm2 startup
```

### Step 4: Configure Firewall

```bash
# Install UFW firewall
sudo apt install -y ufw

# Allow SSH, API, and Discord ports
sudo ufw allow OpenSSH
sudo ufw allow 3001/tcp
sudo ufw allow 57299/tcp

# Enable firewall
sudo ufw enable
```

---

## 🔧 Docker Compose Deployment (Any Cloud Provider)

### Option A: Standalone Docker Containers

```bash
# Clone and configure
git clone https://github.com/YOUR_USERNAME/discord_bot_2.0.git
cd discord_bot_2.0
nano docker-compose.yml  # Configure environment variables

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f persona-bot-discord
```

### Option B: Deploy to Container Services

**AWS ECS/ElastiCache:**
```bash
# Build Docker images
cd web_dashboard/backend
docker build -t persona-dashboard .

cd ../discord_bot_server
docker build -t persona-bot .

# Push to ECR (Amazon Elastic Container Registry)
docker tag persona-dashboard:latest YOUR_AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/persona-dashboard
docker push YOUR_AWS_ACCOUNT.dkr.ecr.REGION.amazonaws.com/persona-dashboard
```

**Google Cloud Run:**
```bash
cd web_dashboard/backend
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT/persona-dashboard

# Deploy to Cloud Run
gcloud run deploy persona-dashboard \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT/persona-dashboard \
  --platform managed \
  --allow-unauthenticated
```

---

## 🧹 Maintenance & Monitoring

### Check System Status

```bash
# PM2 status
pm2 status

# View logs
pm2 logs persona-bot --lines 100

# Restart bot
pm2 restart persona-bot

# Stop and start
pm2 stop all
pm2 start ecosystem.config.js
```

### Monitor Resources

```bash
# Check memory usage
free -h

# Check CPU usage
top

# Check disk space
df -h
```

### Backup Strategy

```bash
# Database backup (PostgreSQL)
pg_dump -U botuser -h localhost botdb > /backups/botdb-$(date +%Y%m%d).sql.gz

# Application logs rotation
pm2 logrotate --name persona-bot 30d
```

---

## 🆘 Troubleshooting Common Issues

### Issue: Bot not responding to messages

**Solution:**
```bash
# Check PM2 status
pm2 status

# Restart bot
pm2 restart persona-bot

# View error logs
pm2 logs persona-bot --lines 50

# Verify Discord token in .env
cat .env | grep DISCORD_BOT_TOKEN
```

### Issue: Dashboard can't connect

**Solution:**
```bash
# Check API server is running
pm2 status persona-bot-dashboard

# Test endpoint
curl http://localhost:3001/api/health

# View logs
pm2 logs persona-bot-dashboard
```

### Issue: Memory errors

**Solution:**
```bash
# Increase memory limit in ecosystem.config.js
"memory": {
    "hardLimit": "512M"  # Increase if needed
}

# Restart bot
pm2 restart persona-bot
```

---

## 📊 Cost Optimization Tips

### AWS EC2 Savings:
- Use Spot Instances (up to 90% savings)
- Choose t3.medium instead of t2 for same performance at lower cost
- Enable Auto Scaling with minimum 1 instance
- Use Savings Plans or Reserved Instances for long-term deployments

### Google Cloud Savings:
- Use e2-micro for development, e2-standard-2 for production
- Set up preemptible VMs for batch processing
- Use committed use discounts

### DigitalOcean Savings:
- Droplets scale automatically with usage
- Use droplet blocks (5% discount)
- Take advantage of referral credits

---

## 🎉 Success Checklist

After deployment, verify all features work:

- [ ] Bot responds in DMs only
- [ ] Dashboard loads at PORT 3001
- [ ] Can create/edit bots via dashboard
- [ ] Memories auto-generate correctly
- [ ] Content mode toggle works
- [ ] Chat preview window functional
- [ ] PM2 auto-restart on crash
- [ ] System survives reboot

**Your cloud-based Discord persona chatbot is now live!** 🚀
