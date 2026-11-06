# Discord Persona Chatbot Platform
## 🤖 Autonomous 24/7 Cloud-Deployed Chatbot with Full AI Memory System

**CRITICAL:** This bot MUST run on CLOUD SERVERS ONLY (AWS/GCP/DigitalOcean/Oracle Cloud). NEVER on your personal computer!

---

## ☁️ **BEST FREE DEPLOYMENT: Oracle Cloud Always Free Tier!** 🏆

### Why Oracle is BEST for FREE hosting:
- ✅ **24GB RAM FREE** (vs AWS/GCP's 1GB free tier!)
- ✅ **INFINITE duration** (no expiration like other providers)
- ✅ **ARM processors** (better performance, more efficient)
- ✅ **Total cost: $0.00/month forever!**

See **[ORACLE_CLOUD_DEPLOYMENT.md](ORACLE_CLOUD_DEPLOYMENT.md)** for complete step-by-step guide!

---

## ✨ Features

### 🎭 Full Persona Customization
- **Name** - Discord persona name
- **Age Range** - Character age (optional, any age allowed)
- **Personality** - Detailed traits, archetypes, quirks
- **Speech Style** - Formal, casual, poetic, sarcastic, energetic, mysterious
- **Backstory** - Full character history and motivations
- **Example Dialogue** - Sample conversations to guide tone
- **Extra Rules** - Special instructions or constraints

### 🚫 ZERO Content Restrictions!
> No restrictions on what users can add as personality! Examples include:
> - Seductive/romantic personas ✓
> - Mature roleplay scenarios ✓
> - Explicit content when scene-appropriate ✓
> - Any creative persona imaginable ✓

### 🔒 Three Content Modes (Dashboard Toggle)
1. **Fully Filtered** - SFW-only responses
2. **Mature** - Artistic/contextual explicit content
3. **Explicit** - Full freedom, all content permitted

### 🧠 Advanced AI Memory System
#### Long-Term Memories (Auto-Generated)
- Automatically learns user preferences ("likes X", "dislikes Y")
- Tracks relationship dynamics
- Builds character growth history
- User can manually add/edit memories via dashboard

#### Short-Term Memory (Configurable)
- Sliding window size: 50, 100, 500+ recent messages
- Auto-expiry settings for each conversation context
- Memory compression to summarize older conversations

### 💬 DM-Only Communication
- Operates exclusively through Discord Direct Messages
- NOT public server channels (can be changed if needed)
- Auto-reply to user mentions
- Command prefix support in DMs (/command, !command)

### 🌐 Beautiful Web Dashboard
- User authentication (email/password + OAuth ready)
- Full bot creation wizard with all customization fields
- Real-time chat preview window
- Memory management system
- Settings panel with explicit content toggle
- Discord integration guide (1-click invite!)
- Live statistics and analytics

### 🤖 AI Self-Improvement (Optional)
- Learns from successful interactions
- Suggests memory updates based on conversation patterns
- Adapts speech style over time within user-defined bounds

### ☁️ Cloud Deployment Ready
- Docker Compose configuration
- PM2/systemd for auto-restart protection
- Health check endpoints for load balancers
- Minimum spec: 2 vCPU, 4GB RAM (cloud servers only!)

---

## 🚀 Quick Start Guide

### Option 1: Oracle Cloud FREE (RECOMMENDED! 🏆)

**Total Cost: $0.00/mo FOREVER!**

```bash
# 1. Sign up for Oracle Cloud Free Tier:
https://www.oracle.com/cloud/free/

# 2. Create Always Free VM (ARM Ampere A1, 2 vCPU, 24GB RAM)

# 3. Configure Security List in Console:
#    - Ingress Rules: Ports 22, 3001, 57299 → 0.0.0.0/0
#    - Egress Rules: Port 443 → 0.0.0.0/0

# 4. Deploy with automated script:
ssh -i your-key opc@YOUR_ORACLE_IP
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/discord_bot_2.0/main/oracle-deploy.sh | bash

# 5. Access dashboard:
http://YOUR_ORACLE_IP:3001
```

**See full guide:** [ORACLE_CLOUD_DEPLOYMENT.md](ORACLE_CLOUD_DEPLOYMENT.md)

### Option 2: Other Cloud Providers

| Provider | Minimum Specs | Monthly Cost | Best For |
|----------|--------------|--------------|----------|
| **DigitalOcean** | Droplet-2vcpu-4gb | $10/mo | Easiest deployment |
| **AWS EC2** | t3.medium (2 vCPU/4GB) | $15-35/mo | Industry standard |
| **Google Cloud** | e2-standard-2 | ~$15/mo | Good documentation |

**See full guide:** [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md)

### Option 3: Docker Compose (Any Provider)

```bash
# Build and run with Docker Compose
docker-compose up -d
```

---

## 📁 Project Structure

```
discord_bot_2.0/
├── web_dashboard/
│   ├── backend/              # Express API Server
│   │   ├── server.js         # REST API endpoints
│   │   └── package.json      # Dependencies
│   └── frontend/             # React Dashboard UI
│       └── index.html        # All-in-one dashboard
│
├── discord_bot_server/
│   ├── index.js             # Discord bot + Express server
│   ├── config/
│   │   └── defaults.js      # Bot configuration
│   ├── services/
│   │   ├── persona-manager.js  # AI response engine
│   │   └── memory-manager.js   # Memory system
│   ├── ecosystem.config.js  # PM2 process manager
│   ├── Dockerfile           # Container deployment
│   └── package.json         # Dependencies
│
├── shared/
│   ├── schema.sql           # PostgreSQL database schema
│   └── example-persona.json # Persona template
│
├── 📝 Oracle Cloud (Recommended FREE option!)
│   ├── oracle-deploy.sh         # Automated deployment script
│   ├── ORACLE_CLOUD_DEPLOYMENT.md# Full Oracle guide
│   └── ORACLE_QUICK_REFERENCE.txt  # Quick command reference
│
├── .env.example             # Environment variable template
├── docker-compose.yml       # Container orchestration
├── deploy.sh                # General deployment script
├── README.md                # This file
├── DISCORD_SETUP_GUIDE.md   # Discord setup guide
└── CLOUD_DEPLOYMENT_GUIDE.md# AWS/GCP/DO deployment guides
```

---

## 🔐 Security & Privacy

- ✅ All Discord bot tokens stored securely in database (encrypted at rest)
- ✅ User persona data private and isolated per bot instance
- ✅ Memory data NEVER shared between users
- ✅ GDPR/privacy compliance ready structure
- ✅ Health check endpoints for cloud load balancers

**Legal Statement:**
> "All content generated by this platform is user-generated and respects Discord's Terms of Service. Users are responsible for their own content creation. The platform provides tools but does not host or moderate chatbot conversations. Deploy your bot to cloud servers at no cost to your computer. Freedom and creativity first!"

---

## 🧠 API Endpoints Overview

### Authentication
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login user
GET    /api/auth/me          # Get current user profile
PUT    /api/auth/profile     # Update user profile
```

### Bots CRUD
```
GET    /api/bots             # List all bots
POST   /api/bots             # Create new bot
PUT    /api/bots/:id         # Edit existing bot
DELETE /api/bots/:id         # Delete bot
```

### Memory Management
```
GET    /api/bots/:id/memories          # List memories
POST   /api/bots/:id/memories          # Add memory
PUT    /api/bots/:id/memories/:id      # Edit memory
DELETE /api/bots/:id/memories/:id      # Delete memory
GET    /api/bots/:id/memory/preview    # Get chat preview
```

### Settings & Content Mode
```
GET    /api/bots/:id/settings/content-mode    # Get content mode
POST   /api/bots/:id/settings/content-mode    # Update content mode
```

### Discord Integration
```
GET    /api/discord/setup     # Setup guide steps
GET    /api/discord/invite-link/:botId  # Generate invite link
```

### Health & Status
```
GET    /api/health            # Health check (required for load balancers)
```

---

## 📊 Oracle Cloud FREE Tier Benefits

| Resource | Free Limit | Your Usage | Cost |
|----------|-----------|------------|------|
| **ARM Ampere Compute** | 2 vCPU, 24GB RAM | ✓ Within limits | $0 |
| **Block Volume** | Up to 10 TB | ~32 GB used | $0 |
| **Object Storage** | Up to 10 TB/month | Optional (backups) | $0 |
| **Load Balancer** | 64 vCPUs free tier | Not needed | $0 |
| **Total Monthly Cost** | **INFINITE FREE** | - | **$0.00!** 🎉 |

**Why Oracle beats AWS/GCP for FREE hosting:**
- ✅ 24GB RAM (vs AWS/GCP's 1GB for free tier!)
- ✅ INFINITE duration (no expiration like other providers)
- ✅ ARM processors (better performance per dollar)
- ✅ Most generous free tier in entire cloud industry

---

## 🎯 Quick Deployment Commands

### Oracle Cloud (FREE - Recommended!):
```bash
# SSH into Oracle instance:
ssh -i your-key opc@YOUR_ORACLE_IP

# Automated deployment:
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/discord_bot_2.0/main/oracle-deploy.sh | bash

# Check status:
pm2 status persona-bot

# Access dashboard:
http://YOUR_ORACLE_IP:3001
```

### DigitalOcean ($10/mo):
```bash
cd /var/www/discord-bot_2.0
npm install
nano .env  # Add Discord token
pm2 start ecosystem.config.js --name persona-bot
pm2 save && pm2 startup
```

### Docker Compose (Any Provider):
```bash
docker-compose up -d
```

---

## 🛠️ Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Bot not responding | Check token in `.env`, ensure Message Content Intent enabled |
| Dashboard can't connect | Verify API server running, check PORT=3001 |
| Memories not working | Ensure PostgreSQL/Redis configured properly |
| AI responses generic | Provide detailed personality and example dialogue |

**Oracle-specific:**
- Configure Security List in Console (ports 22, 3001, 57299)
- Allow outbound HTTPS (443) for Discord API
- Use provided `oracle-deploy.sh` script with Oracle optimizations

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **ORACLE_CLOUD_DEPLOYMENT.md** | Complete Oracle Cloud deployment guide (FREE!) |
| **CLOUD_DEPLOYMENT_GUIDE.md** | AWS/GCP/DigitalOcean deployment guides |
| **DISCORD_SETUP_GUIDE.md** | Quick start with Discord setup steps |
| **README.md** | Main documentation and architecture overview |
| **QUICK_START_SUMMARY.md** | Complete feature summary |

---

## ⚙️ Configuration Options

### Memory Settings:
- **windowSize**: Number of recent messages (default: 50)
- **autoExpireHours**: Hours before auto-expiry (default: 72)
- **compressionEnabled**: Enable memory summarization (false)
- **summaryInterval**: Summarize every N messages (default: 100)

### Content Mode Options:
- **fully_filtered**: SFW-only responses
- **mature**: Artistic/contextual explicit content
- **explicit**: Full freedom, all content permitted

### AI Integration:
- **Model**: gpt-4o, gpt-3.5-turbo, claude-3, llama-3
- **Temperature**: 0.7 (creative responses)
- **Max Tokens**: 512 per response

---

## 🎨 Customization Guide

### Creating Engaging Personas:
1. **Name**: Unique persona name (avoid generic names)
2. **Personality Traits**: Specific adjectives + descriptions
3. **Speech Style**: Match tone to personality
4. **Backstory**: Add depth with history and motivations
5. **Example Dialogue**: Show, don't tell - provide samples

### Memory Examples:
```json
{
  "category": "preferences",
  "title": "User Likes Coffee",
  "content": [{
    "type": "likes",
    "item": "morning coffee with oat milk",
    "strength": "strong"
  }]
}
```

---

## 📜 License & Legal

MIT License - Feel free to use and modify!

All content generated by this platform is user-generated. The platform provides tools but does not host or moderate chatbot conversations. Deploy to cloud servers at no cost to your computer. Freedom and creativity first!

---

## 💬 Summary

You now have a **complete, production-ready Discord Persona Chatbot Platform** that:

✅ Runs 24/7 on CLOUD INFRASTRUCTURE ONLY (never your computer!)  
✅ Has ZERO restrictions on personality/explicit content  
✅ Includes beautiful web dashboard with all features  
✅ Auto-generates long-term memories from conversations  
✅ Supports configurable short-term memory windows  
✅ Operates DM-only by default (can be changed)  
✅ Offers three content modes: SFW, Mature, Explicit  
✅ Deploys easily to Oracle Cloud FREE, AWS, GCP, or DigitalOcean  
✅ **Oracle Cloud offers 24GB RAM for FREE FOREVER!** 🏆

**Deploy now and free up your computer!** 🚀

---

## 🎉 Get Started in 5 Minutes!

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/discord_bot_2.0.git

# 2. Choose deployment method:
#    Option A (FREE): Oracle Cloud - see ORACLE_CLOUD_DEPLOYMENT.md
#    Option B ($10/mo): DigitalOcean - see CLOUD_DEPLOYMENT_GUIDE.md

# 3. Deploy and access dashboard at PORT 3001

# 4. Create your first bot via wizard!
```

**Total setup time: 5 minutes on Oracle Cloud!** 🎯
