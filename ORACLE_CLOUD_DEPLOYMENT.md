# 🚀 Complete Oracle Cloud Deployment Guide
## Discord Persona Chatbot Platform - Step-by-Step Tutorial

---

## ✨ Why Oracle Cloud is BEST for Free Hosting

| Feature | Oracle Cloud Free Tier | Google Cloud | AWS Free Tier |
|---------|------------------------|--------------|---------------|
| **RAM** | 24GB FREE 🏆 | 1GB (limited) | 1GB (limited) |
| **CPU** | 2 vCPU (ARM Ampere) | e2-micro (0.5 vCPU) | t3.micro (0.5 vCPU) |
| **Storage** | 10 TB FREE | 30 GB | 30 GB |
| **Duration** | INFINITE 🏆 | 90 days credits | 12 months |
| **Best For** | Production hosting | Testing (90 days) | Learning only |

---

## 🎯 Quick Start Summary

### Total Cost: **$0.00/MONTH** (Forever FREE!)

Oracle Cloud's "Always Free" tier has **no expiration date**, unlike AWS/GCP which expire after 90-12 months!

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] A GitHub account with repository access
- [ ] Your Discord Developer Portal account
- [ ] An Oracle Cloud Free Tier account
- [ ] SSH key for Oracle (generated automatically during signup)
- [ ] At least 5GB of local storage (temporary download space)

---

## 🚀 Step-by-Step Deployment (45 minutes total!)

### ⏱️ **Part 1: Oracle Cloud Console Setup** (10 minutes)

#### Step 1: Sign Up for Oracle Cloud
```
1. Go to: https://www.oracle.com/cloud/free/
2. Click "Start For Free" button
3. Fill in your information:
   - Email address
   - Company name (optional, can use personal email)
4. Choose payment method (required for verification):
   - Credit/Debit card (Oracle will NOT charge unless you exceed free tier!)
   - Phone number for verification
5. Complete CAPTCHA challenges
6. Wait for account approval (~1-2 minutes)
```

**⚠️ Important Notes:**
- Oracle may require phone verification during signup
- You won't be charged unless you use more than 24GB RAM (impossible in free tier)
- Keep payment method valid until deployment is working

---

#### Step 2: Create Your Always Free VM Instance
```
1. Login to Oracle Cloud Console: https://console.oraclecloud.com
2. Navigate to "Compute" → "Instances"
3. Click "Create Instance" button
4. Select region (choose closest to Discord servers for best ping):
   - Frankfurt, DE-EU-1 (Europe)
   - Sydney, AU-SYD-1 (Australia/Pacific)
   - Virginia, US-ASH-1 (Americas)
5. Scroll down to "Always Free Tier" section
6. Select: "ARM Ampere A1 Compute Instance"
   - 2 OCPUs (vCPUs)
   - 24 GB Memory (RAM)
   - 320 GB Local NVMe Storage
7. Click "Next"
```

**⚠️ Critical:** If ARM instance option is not available:
1. Click "Cancel" on current creation
2. Choose region again
3. Some regions support ARM better than others
4. Try Frankfurt or Sydney first

---

#### Step 3: Configure VM Details
```
1. Name: "discord-persona-bot" (or any name you prefer)
2. Image/Operating System: Oracle Linux 8
3. Shape: Select from Always Free options
4. Network Configuration:
   - Public IP: YES (important for accessing dashboard!)
5. Click "Create" button
6. Wait for instance to provision (~3-5 minutes)
```

---

#### Step 4: Configure Security List (CRITICAL STEP!)
This step is REQUIRED for bot to work!

```
1. In Oracle Console, navigate to:
   Network & Security → Virtual Cloud Networks
2. Find your VCN and subnet
3. Click "Edit" button (pencil icon)
4. Scroll to "Ingress Rules" section
5. Add these rules (click "+"):
   
   Rule 1:
   - Port/Service: 22
   - Description: SSH Access
   - Source CIDR Block: 0.0.0.0/0
   
   Rule 2:
   - Port/Service: 3001
   - Description: Dashboard API
   - Source CIDR Block: 0.0.0.0/0
   
   Rule 3:
   - Port/Service: 57299
   - Description: Discord Bot Websocket
   - Source CIDR Block: 0.0.0.0/0

6. Scroll to "Egress Rules" section
7. Add these rules (click "+"):
   
   Rule 4:
   - Port/Service: 443
   - Description: HTTPS Outbound (Discord API)
   - Destination CIDR Block: 0.0.0.0/0

8. Click "Save Changes" button
```

**⚠️ Critical:** Without these rules, the bot will NOT connect to Discord!

---

### ⏱️ **Part 2: Deploy Application** (25 minutes)

#### Step 5: SSH Into Your Instance
```
1. In Oracle Console → Compute → Instances
2. Click on your instance "discord-persona-bot"
3. Find "Connect via SSH" section
4. Copy the connection command:
   
   ssh -i /path/to/your-oracle-key.pem opc@YOUR_ORACLE_IP

5. Replace with your actual values:
   - /path/to/your-oracle-key.pem = path to Oracle's SSH key file
   - YOUR_ORACLE_IP = the public IP shown in console
6. Open terminal or SSH client (Terminal, iTerm2, PuTTY)
7. Paste and press Enter

Example:
ssh -i ~/.ssh/oracle-cloud-key.pem opc@203.0.113.0

⚠️ First time connecting, accept the authenticity warning!
```

**If SSH doesn't work:**
1. Download Oracle's SSH key: Console → Instances → [Your Instance] → Connect → SSH Connection Key
2. Copy both private and public keys
3. Upload public key to your local system
4. Use: `ssh -i <your-key-file> opc@<instance-ip>`

---

#### Step 6: Install Dependencies (Automated!)
```bash
# Run the automated deployment script
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/discord_bot_2.0/main/oracle-deploy.sh | bash

# If that fails, run it manually:
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/discord_bot_2.0/main/oracle-deploy.sh > /tmp/oracle-deploy.sh
bash /tmp/oracle-deploy.sh
```

**Script will:**
✅ Update system packages  
✅ Install Node.js 20+ and PM2  
✅ Clone repository from GitHub  
✅ Install npm dependencies  
✅ Configure database  
✅ Start bot with PM2  
✅ Set up monitoring  
✅ Create backup scripts  

---

#### Step 7: Configure Your Discord Bot Token (CRITICAL!)
```bash
# SSH into instance (if not already)
ssh -i your-key opc@YOUR_ORACLE_IP

# Navigate to bot server directory
cd /var/www/discord-bot-2.0/discord_bot_server

# Edit environment file
nano .env
```

**Replace in `.env` file:**
```env
# =============================================
# CRITICAL: Update these values!
# =============================================

DISCORD_BOT_TOKEN=your_actual_token_here  ← GET FROM DISCORD DEVELOPER PORTAL!
OPENAI_API_KEY=sk-your-openai-key-here    ← Optional (can leave empty)
```

**How to get Discord bot token:**
1. Go to: https://discord.com/developers/applications
2. Click "New Application" or select existing one
3. Name your app (e.g., "My Persona Bot")
4. Go to "Bot" page in application dashboard
5. Click "Add Bot" if not already created
6. Scroll down and click "Reset Token"
7. **COPY THE TOKEN IMMEDIATELY!** (won't see it again)
8. Scroll to "Privileged Gateway Intents"
9. Toggle on "Message Content Intent"
10. Save changes

**Paste your token in `.env` file, save:**
```bash
Ctrl+O  ← Then Enter
Ctrl+X  ← Exit nano
```

---

#### Step 8: Configure Dashboard API (Optional)
```bash
# Navigate to dashboard directory
cd /var/www/discord-bot-2.0/web_dashboard/backend

# Edit environment file
nano .env
```

**Add these lines:**
```env
JWT_SECRET=change_me_in_production_abc123xyz
NODE_ENV=production
```

Save and exit (Ctrl+O, Enter, Ctrl+X).

---

### ⏱️ **Part 3: Verify Deployment** (10 minutes)

#### Step 9: Check PM2 Status
```bash
# SSH into instance
ssh -i your-key opc@YOUR_ORACLE_IP

# Change to bot directory
cd /var/www/discord-bot-2.0/discord_bot_server

# Check if bot is running
pm2 status persona-bot
```

**Expected output:**
```
Name                 id               Status    Memory
persona-bot          0                online    128MB
```

If you see "offline":
```bash
pm2 restart persona-bot
pm2 logs persona-bot --lines 20
```

---

#### Step 10: Test Dashboard API
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Expected response:
{
  "status": "online",
  "uptime": 123456,
  "databaseConnected": true
}
```

If this works, dashboard is ready! 🎉

---

#### Step 11: Access Dashboard in Browser
```
Open your browser and go to:
http://YOUR_ORACLE_IP:3001
```

You'll see a login screen! Click "Create new account" or use existing credentials.

---

#### Step 12: Create Your First Bot (The Wizard!)

Follow the dashboard wizard:

**Step 1:** Basic Info
- Name: "Sassy Assistant" (or your choice)
- Age Range: Optional (e.g., "18-25")

**Step 2:** Personality & Speech Style
- Speech Style: Choose from dropdown
- Personality Traits: Type detailed description

**Step 3:** Background & Dialogue  
- Backstory: Add history and motivations
- Example Dialogue: Provide conversation samples

**Step 4:** Content Mode
- Choose: fully_filtered (SFW) / mature / explicit

Click "Create Bot!" ✨

---

### ⏱️ **Part 4: Post-Deployment Configuration** (10 minutes)

#### Step 13: Get Discord Invite Link Ready
```bash
# SSH into instance
ssh -i your-key opc@YOUR_ORACLE_IP

# Change to dashboard directory
cd /var/www/discord-bot-2.0/web_dashboard/backend

# Start API server in background (for Discord integration)
pm2 start ecosystem.config.js --name persona-bot-dashboard

# Or use the existing dashboard
# (Already running on port 3001)
```

**To invite bot to server:**
1. In dashboard, click your bot
2. Click "Invite to Server" button
3. Copies OAuth2 URL to clipboard
4. Opens Discord browser window with invite page
5. Choose server → Click "Authorize"

---

#### Step 14: Create Database Backup
```bash
# SSH into instance
ssh -i your-key opc@YOUR_ORACLE_IP

# Navigate to scripts directory
cd /var/www/discord-bot-2.0/scripts

# Run manual backup (first time only)
./backup-database.sh

# View backup location
ls -lh /var/backups/
```

---

#### Step 15: Test End-to-End Chat
```bash
# Get your bot's Discord username from dashboard
# OR check logs for it

# In Discord, search for your bot in DMs
# Send a test message: "Hello!"

# Expected response (with OpenAI): Sophisticated AI response
# Expected response (fallback mode): Simple friendly reply
```

**If bot responds:** 🎉 SUCCESS! Your deployment is complete!

---

## 🔧 Troubleshooting Common Issues

### Issue 1: Can't SSH into Instance
```bash
# Solution 1: Check security list
# Console → Network & Security → VCNs → Edit Subnet
# Ensure port 22 (SSH) is allowed from 0.0.0.0/0

# Solution 2: Use Oracle Console to connect
# Console → Compute → Instances → Your Instance → Connect → Console
```

### Issue 2: Dashboard Won't Load
```bash
# Check if API is running
pm2 status persona-bot

# If offline, restart
cd /var/www/discord-bot-2.0/discord_bot_server
pm2 restart persona-bot

# Check for errors in logs
pm2 logs persona-bot --lines 50
```

### Issue 3: Database Connection Error
```bash
# Test database connection
psql -h localhost -U botuser -d botdb -c "SELECT 1;"

# If fails, check PostgreSQL service
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql
```

### Issue 4: Bot Not Responding on Discord
```bash
# Check Discord token in .env file
cd /var/www/discord-bot-2.0/discord_bot_server
nano .env

# Ensure DISCORD_BOT_TOKEN is set correctly
# And that Message Content Intent is enabled in Discord Developer Portal

# Restart bot
pm2 restart persona-bot

# View logs
pm2 logs persona-bot --lines 30
```

### Issue 5: Port 3001 Already in Use
```bash
# Check what's using port 3001
sudo lsof -i :3001

# If needed, stop other service and restart bot
sudo systemctl stop <other-service-name>
pm2 restart persona-bot
```

---

## 💰 Cost Summary (Oracle Cloud)

| Resource | Cost | Notes |
|----------|------|-------|
| **Compute Instance** | $0/mo | 2 vCPU, 24GB RAM FREE |
| **Block Storage** | $0/mo | Up to 10 TB FREE |
| **Load Balancer** | $0/mo | Up to 64 vCPUs FREE |
| **Object Storage** | $0/mo | Up to 10 TB FREE |
| **Database Proxy** | $0/mo | Included in compute |
| **Monitoring** | $0/mo | Included in Oracle services |

**Total Monthly Cost: $0.00 (Forever Free!)** 🎉

---

## 📊 Monitoring Your Deployment

### Oracle Cloud Built-in Dashboard:
```
Console → Compute → Instances → Your Instance → Monitor
```

Shows:
- CPU usage (ARM Ampere processors are efficient)
- Memory usage (You have 24GB FREE!)
- Network I/O
- Disk space

### Check PM2 Logs:
```bash
pm2 logs persona-bot --lines 50
```

### Check System Health:
```bash
free -h                    # Memory usage
df -h                      # Disk space
uptime                     # System uptime
```

---

## 🔄 Maintenance Tasks

### Daily: Database Backup (Automated!)
```bash
# Already configured in deployment script to run at 3 AM daily
# View backup logs
tail -f /var/log/oracle-backup.log
```

### Weekly: Check PM2 Status
```bash
pm2 status
pm2 list
```

### Monthly: Update System Packages
```bash
sudo dnf update -y
```

---

## 📜 Security Best Practices

1. **Change Database Password** in `.env` file:
   ```env
   POSTGRES_PASSWORD=YourStrongPasswordHere123!@#
   ```

2. **Rotate Discord Bot Token** from Developer Portal every 30 days:
   - Console → Applications → Your App → Bot → Reset Token

3. **Enable Oracle Cloud Monitoring Alerts:**
   - Console → Compute → Instances → Your Instance → Monitor → Create Alert

4. **Restrict SSH Access** (optional):
   ```bash
   # Edit security list to only allow your IP range
   ```

---

## 🎉 Success Checklist

After deployment, verify all features work:

- [ ] ✅ Can SSH into Oracle instance
- [ ] ✅ Dashboard loads at `http://YOUR_IP:3001`
- [ ] ✅ Can login/create account
- [ ] ✅ Can create bot via wizard
- [ ] ✅ Bot appears in Discord (searchable)
- [ ] ✅ Bot responds to DMs
- [ ] ✅ Memories auto-generate correctly
- [ ] ✅ Content mode toggle works
- [ ] ✅ PM2 auto-restarts on crash
- [ ] ✅ System survives Oracle reboot

---

## 📚 Additional Resources

### Oracle Cloud Documentation:
- **Getting Started:** https://docs.oracle.com/en-us/iaas/getting-started/compute-free-tier/index.html
- **Always Free List:** https://www.oracle.com/cloud/free/pricing
- **Networking Guide:** https://docs.oracle.com/en-us/iaas/Content/Network/Tasks/overview.htm

### Discord Developer Portal:
- **Bot Setup:** https://discord.com/developers/docs/getting-started
- **OAuth2 Tokens:** https://discord.com/developers/docs/topics/oauth2
- **Privileged Intents:** https://discord.com/developers/docs/reference#privileged-gateway-intents

---

## 🆘 Getting Help

### Common Issues & Solutions:

**Q: Bot not responding on Discord?**
A: Check `.env` has correct token, ensure Message Content Intent enabled

**Q: Dashboard shows login screen but can't create account?**
A: Check PostgreSQL is running: `sudo systemctl status postgresql`

**Q: Can't access dashboard from outside Oracle network?**
A: Configure security list to allow inbound traffic on ports 22, 3001, 57299

### Community Support:
- **Oracle Cloud Forums:** https://forums.oracle.com/
- **Discord Developer Discord:** https://discord.gg/discorddev
- **General Help:** Check documentation in repository README.md

---

## 🎯 Summary

✅ **Total Deployment Time:** 45 minutes  
✅ **Monthly Cost:** $0.00 (Forever FREE!)  
✅ **Free Resources:** 2 vCPU, 24GB RAM, 10 TB storage  
✅ **Duration:** Infinite (no expiration)  
✅ **Best-in-Class Free Tier:** Most generous in industry  

**Your cloud-based Discord persona chatbot is now running on Oracle Cloud FREE!** 🚀

---

## ⚡ Quick Commands Reference

```bash
# SSH into instance
ssh -i your-key opc@YOUR_ORACLE_IP

# Check bot status
pm2 status persona-bot

# View logs
pm2 logs persona-bot --lines 50

# Restart bot
pm2 restart persona-bot

# Test API health
curl http://localhost:3001/api/health

# Create database backup
cd /var/www/discord-bot-2.0/scripts && ./backup-database.sh

# View Oracle Cloud monitoring
Console → Compute → Instances → Monitor
```

---

**You now have a production-grade, 24/7 Discord persona chatbot running on cloud infrastructure for FREE!** 🎉

Enjoy your autonomous AI companion! 🤖✨
