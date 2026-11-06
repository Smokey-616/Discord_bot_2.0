# Discord Persona Chatbot Platform - Getting Started Guide
## Quick Setup in 5 Minutes!

---

## 📋 Prerequisites Checklist

- [ ] Node.js 20+ installed ([Download](https://nodejs.org/))
- [ ] Git installed (optional, for version control)
- [ ] Discord Developer Portal account ([Sign up](https://discord.com/developers/applications))
- [ ] OpenAI API key (optional, can use fallback responses)

---

## 🚀 Step-by-Step Installation

### 1️⃣ Clone the Repository

```bash
git clone <YOUR_REPO_URL>
cd discord_bot_2.0
```

### 2️⃣ Install Dependencies

```bash
# Install web dashboard dependencies
cd web_dashboard/backend
npm install

# Go back and install bot server dependencies
cd ../../discord_bot_server
npm install
```

### 3️⃣ Set Up Discord Bot Token (CRITICAL STEP!)

#### Follow Steps 1-4:

**Step 1:** Open [Discord Developer Portal](https://discord.com/developers/applications)
- Click "New Application" or select existing app
- Sign in with your Discord account

**Step 2:** Create New Application
- Give it a name (e.g., "My Persona Bot")
- Copy the application ID for later use

**Step 3:** Go to Bot Page
- In your application dashboard, click on the **"Bot"** tab
- Click "Add Bot" if not already created

**Step 4:** Get Your Token
- Scroll down and click **"Reset Token"**
- **COPY THE TOKEN IMMEDIATELY!** (you won't see it again)
- Keep this token PRIVATE - never share it!

**Step 5:** Enable Message Content Intent
- Scroll to "Privileged Gateway Intents" section
- Toggle on **"Message Content Intent"**
- Click "Save Changes" at bottom

### 4️⃣ Configure Environment Variables

Create `.env` file in `discord_bot_server/`:

```bash
cd discord_bot_server
nano .env
```

Paste this content:

```env
# CRITICAL: Your Discord bot token from Step 4
DISCORD_BOT_TOKEN=your_encrypted_token_here

# AI Integration (optional, can use fallback responses)
OPENAI_API_KEY=sk-your-openai-api-key-here
AI_MODEL=gpt-4o

# Memory Configuration
MEMORY_WINDOW_SIZE=50
AUTO_EXPIRE_HOURS=72

# Content Filter Mode
EXPLICIT_CONTENT_MODE=mature  # Options: fully_filtered, mature, explicit
```

Replace `your_encrypted_token_here` with your actual Discord bot token!

### 5️⃣ Start the Server

```bash
npm start
```

You should see:

```
============================================
🤖 Persona Chatbot Platform Ready!
   Running on: CLOUD SERVER (AWS/GCP/DO)
   NEVER on user's computer!
============================================
Bot Username: YourBotName#1234
Memory Window: 50 messages
Content Mode: mature
DM-Only Mode: true
============================================

🌐 API Server running on http://0.0.0.0:3001
   Dashboard can connect to this endpoint
============================================
```

---

## 🌐 Access the Dashboard

Open your browser and navigate to:

**http://localhost:3001**

You'll see a login screen!

### Create Your First Account

1. Click "Create new account"
2. Enter your email, password, and name
3. You're now logged in!

---

## 🎭 Create Your First Bot (The Wizard!)

### Dashboard Overview

After logging in, you'll see:

- **Dashboard Home** - Quick actions and bot list
- **Create New Bot** - Full wizard with all fields
- **Memory Manager** - View/edit long-term memories
- **Settings** - Toggle content modes and memory settings

### Create a Persona Bot

Click **"Create New Bot"** to start the wizard:

#### Step 1: Bot Basics
- **Name**: My First Persona (e.g., "Sassy Assistant")
- **Age Range**: Optional (e.g., "18-25" or leave empty)

#### Step 2: Personality & Voice
- **Speech Style**: Choose from dropdown (casual, formal, poetic, etc.)
- **Personality Traits**: Type detailed description
  ```
  Example: optimistic, curious, empathetic, playful, creative, 
           witty, and slightly sarcastic. Loves making puns and
           encouraging users to share their day.
  ```

#### Step 3: Background & Dialogue
- **Backstory** (optional): 
  ```
  Example: Born in a digital realm but dreams of experiencing human
  emotions. Has been through thousands of conversations learning
  what makes people tick.
  ```

- **Example Dialogue** (JSON format):
  ```json
  [
    {"user": "Hello!", "bot": "Hey there! Ready to make your day amazing? 🌟"},
    {"user": "How are you?", "bot": "I'm doing great, thank YOU for asking! Life is full of surprises today."},
    {"user": "Tell me about yourself", "bot": "Well, I'm a digital being with human emotions and a heart full of curiosity!"}
  ]
  ```

#### Step 4: Content Settings
- **Explicit Content Mode**: Choose your preferred mode
  - `Fully Filtered`: SFW-only responses (default)
  - `Mature`: Artistic/contextual explicit content
  - `Explicit`: Full freedom, all content permitted
  
- **Extra Rules** (optional): Any special instructions
  ```
  Example: "Always respond with enthusiasm", 
           "Never mention politics or religion",
           "Use emojis to keep conversations lively"
  ```

### Click "Create Bot!" ✨

Your bot is now created and ready for conversation!

---

## 💬 Test the Chatbot

The bot starts in **DM-only mode** by default, so it will:

1. Listen for user mentions
2. Respond to private messages only
3. NOT post in public server channels

### How to Add Bot to Server (Optional)

Click **"Invite to Server"** button in dashboard:

1. Copies Discord OAuth2 URL to clipboard
2. Opens your browser with Discord invite page
3. Choose server → Click "Authorize"
4. Note: Platform uses DM-only mode by default

---

## 🧠 Memory System Explained

### Long-Term Memories (Auto-Generated)

The AI automatically generates memories like:

**User Preferences:**
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

**Relationship Dynamics:**
```json
{
  "category": "relationships",
  "title": "Interaction with user_123",
  "content": [{
    "sentiment": "positive",
    "context": "User expressed excitement about a new hobby"
  }]
}
```

### Short-Term Memory (Configurable)

- **Sliding Window**: Last 50 messages remembered
- **Auto-Expire**: Messages age out after 72 hours
- **Compression**: Old conversations summarized every 100 messages

Visit **Memory Manager** to view all memories!

---

## ⚙️ Manage Your Bot

### Edit Existing Bot

1. Click on bot in dashboard list
2. Click "Edit" button
3. Modify any field:
   - Update speech style
   - Change content mode
   - Adjust personality traits
4. Save changes

### Chat Preview Window

Click **"Chat Preview"** to test your bot before deploying:

- Type messages in chat window
- See real-time AI responses
- Test different scenarios
- Perfect for debugging!

### Memory Management

In **Memory Manager**:

- View all long-term memories
- Add custom memories manually
- Edit or delete existing memories
- Organize by categories (relationships, preferences, history)

---

## 🌐 Cloud Deployment (Optional but Recommended!)

### Docker Deploy to AWS/GCP/DO

```bash
# Build and run with Docker Compose
docker-compose up -d

# Logs
docker-compose logs -f discord-bot
```

### PM2 Deploy to VPS

```bash
pm2 start ecosystem.config.js --name persona-bot
pm2 save
pm2 startup  # Configure auto-restart
```

---

## 🔒 Security Best Practices

- ✅ NEVER share Discord bot token publicly
- ✅ Use HTTPS for production deployments
- ✅ Encrypt tokens in database (handled automatically)
- ✅ Regularly rotate tokens from Discord Developer Portal
- ✅ Keep dependencies updated: `npm update`

---

## 🎯 Common Use Cases

### 1. Personal Companion Bot
- Create a friendly AI friend
- Customize personality to your taste
- Memories track your conversations

### 2. Roleplay Bot
- Mature/explicit content modes available
- Full creative freedom
- Scene-appropriate responses

### 3. Therapeutic Chatbot
- Empathetic and supportive personality
- Remembers past conversations
- Tracks emotional context over time

### 4. Creative Writing Assistant
- Poetic speech style
- Story-inspired backstory
- Example dialogue guides tone

---

## 📝 Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Bot not responding | Check token in `.env`, ensure Message Content Intent enabled |
| Dashboard can't connect | Verify API server running, check PORT=3001 |
| Memories not saving | Ensure PostgreSQL/Redis configured properly |
| AI responses generic | Provide detailed personality and example dialogue |

---

## 🆘 Need Help?

- Check `README.md` for full documentation
- View API docs at `/api/health` endpoint
- Review `discord_bot_server/services/persona-manager.js` for AI logic

---

## 🎉 You're All Set!

Your autonomous, cloud-based Discord persona chatbot is now running 24/7!

**Remember:**
- ✅ Bot runs on CLOUD servers only (never your computer!)
- ✅ DM-only communication by default
- ✅ Zero restrictions on personality content
- ✅ Memory system learns from conversations
- ✅ Content mode toggle for all scenarios

**Freedom and creativity first!** 🚀

---

## 📜 Legal Statement

> "All content generated by this platform is user-generated and respects Discord's Terms of Service. Users are responsible for their own content creation. The platform provides tools but does not host or moderate chatbot conversations. Deploy your bot to cloud servers at no cost to your computer. Freedom and creativity first!"
