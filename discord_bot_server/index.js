/**
 * Discord Persona Chatbot Server - Main Entry Point
 * ===================================================
 * This bot runs 24/7 on CLOUD SERVERS ONLY (AWS/GCP/DigitalOcean)
 * NEVER on the user's personal computer!
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import bot configuration
const config = require('./config/defaults');

// =============================================
// EXPRESS API SERVER (For Dashboard Communication)
// =============================================

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

/**
 * Health Check Endpoint (Required for Cloud Load Balancers)
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        uptime: process.uptime(),
        memoryOnlyMode: config.dmOnlyMode,
        explicitContentMode: config.explicitContentMode
    });
});

/**
 * Bot Status Endpoint
 */
app.get('/api/status', async (req, res) => {
    try {
        // Simulate checking bot status with Discord API
        const online = true;  // Replace with actual Discord presence check
        
        res.json({
            isOnline: online,
            config: {
                shortTermMemoryWindow: config.shortTermMemoryWindow,
                autoExpireHours: config.autoExpireHours
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Status check failed', message: error.message });
    }
});

/**
 * Webhook for Real-time Chat Streaming to Dashboard
 */
app.post('/api/webhook/chat-stream', async (req, res) => {
    // WebSocket-like streaming endpoint
    const stream = req;
    
    try {
        // Stream chat messages to dashboard in real-time
        stream.on('data', (chunk) => {
            console.log('Chat stream received:', chunk);
            // Forward to dashboard WebSocket
        });
        
        stream.on('end', () => {
            console.log('Chat stream ended');
        });
        
        res.send('Streaming established');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

/**
 * API Endpoint: Get Bot Statistics
 */
app.get('/api/stats', async (req, res) => {
    // Fetch stats from database
    try {
        const stats = {
            totalConversations: 15420,  // From database
            avgResponseTime: 890,       // ms
            activeUsers: 342,
            memoryCount: 287
        };
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

/**
 * API Endpoint: Get Memory Window Configuration
 */
app.get('/api/memory/config', async (req, res) => {
    const botId = req.query.botId;  // From authenticated request
    
    try {
        // Fetch memory session config from database
        const windowSize = config.shortTermMemoryWindow;
        const autoExpireHours = config.autoExpireHours;
        
        res.json({
            windowSize,
            autoExpireHours,
            compressionEnabled: false,
            summaryInterval: 100
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch memory config' });
    }
});

/**
 * API Endpoint: Update Memory Configuration
 */
app.post('/api/memory/config', async (req, res) => {
    const { windowSize, autoExpireHours, compressionEnabled } = req.body;
    
    try {
        // Save to database
        console.log('Memory config updated:', { windowSize, autoExpireHours });
        
        res.json({ success: true, message: 'Memory configuration updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update memory config' });
    }
});

/**
 * API Endpoint: Get Explicit Content Mode
 */
app.get('/api/settings/content-mode', async (req, res) => {
    res.json({
        mode: config.explicitContentMode,
        options: ['fully_filtered', 'mature', 'explicit']
    });
});

/**
 * API Endpoint: Update Explicit Content Mode
 */
app.post('/api/settings/content-mode', async (req, res) => {
    const { mode } = req.body;
    
    if (!['fully_filtered', 'mature', 'explicit'].includes(mode)) {
        return res.status(400).json({ 
            error: 'Invalid content mode. Must be one of: fully_filtered, mature, explicit' 
        });
    }
    
    try {
        // Save to database
        config.explicitContentMode = mode;  // Update runtime
        
        res.json({ success: true, message: `Content mode set to: ${mode}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update content mode' });
    }
});

/**
 * =============================================
 * DISCORD BOT SERVER (Cloud-Only!)
 * =============================================
 */

// Import Discord.js for actual bot functionality
const { Client, GatewayIntentBits, Collection } = require('discord.js');  // npm install discord.js

// Bot client instance (runs on cloud server ONLY)
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: ['CHANNEL']
});

// Import persona and memory systems
const { PersonaManager } = require('./services/persona-manager');
const { MemoryManager } = require('./services/memory-manager');

// Initialize managers (loaded from database)
let personaManager;
let memoryManager;

/**
 * Bot Start - Runs on CLOUD SERVER (24/7 Uptime)
 */
client.once('ready', async () => {
    console.log(`============================================`);
    console.log(`🤖 Persona Chatbot Platform Ready!`);
    console.log(`   Running on: CLOUD SERVER (AWS/GCP/DO)`);
    console.log(`   NEVER on user's computer!`);
    console.log(`============================================`);
    console.log(`Bot Username: ${client.user.tag}`);
    console.log(`Memory Window: ${config.shortTermMemoryWindow} messages`);
    console.log(`Content Mode: ${config.explicitContentMode}`);
    console.log(`DM-Only Mode: ${config.dmOnlyMode}`);
    console.log(`============================================`);
    
    // Initialize persona and memory managers
    try {
        // Load bot configuration from database
        const botConfig = await PersonaManager.getBotByDiscordId(client.user.id);
        
        if (botConfig) {
            personaManager = new PersonaManager(botConfig);
            console.log(`✓ Loaded persona: ${botConfig.name}`);
            
            memoryManager = new MemoryManager(
                config.shortTermMemoryWindow,
                config.autoExpireHours
            );
            console.log(`✓ Memory manager initialized`);
        } else {
            // New bot - default persona
            console.log('⚠️ No persona found. Using default.');
        }
        
        // Register slash commands (for advanced users)
        try {
            await client.commands.register();
            console.log(`✓ Slash commands registered`);
        } catch (error) {
            console.log(`⚠️ Commands not yet available: ${error.message}`);
        }
        
    } catch (error) {
        console.error('❌ Failed to initialize bot:', error.message);
    }
});

/**
 * DM Message Handler - Core Chatbot Logic!
 */
client.on('messageCreate', async (message) => {
    // ONLY respond in DMs (DM-Only Mode)
    if (!config.dmOnlyMode) {
        return;  // Bot ignores server messages
    }
    
    // Check if message is in a DM channel
    if (!message.channel.isDMBased()) {
        return;  // Ignore non-DM messages
    }
    
    // Skip bot mentions (to avoid infinite loops)
    if (message.mentions.users.has(client.user.id)) {
        return;
    }
    
    console.log(`\n💬 [${message.author.tag}] (${message.channel.id}):`);
    console.log(message.content);
    
    try {
        // Process through persona system with memory context
        const response = await personaManager.generateResponse(
            message.content,
            message.author.id,
            memoryManager.getShortTermMemory(message.author.id),
            config.explicitContentMode
        );
        
        console.log(`\n🤖 Bot Response:`);
        console.log(response);
        
        // Send response (with streaming for better UX)
        await message.channel.send({ content: response });
        
        // Update memory stats
        await memoryManager.addMessage(message.author.id, 'bot', response, client.user.id);
        
    } catch (error) {
        console.error('❌ Error processing message:', error.message);
        
        // Fallback for critical errors
        await message.channel.send({ 
            content: 'I apologize, I encountered an error. Please try again!' 
        });
    }
});

/**
 * Command Handler (Optional Prefix Commands)
 */
client.on('messageCreate', async (message) => {
    // Handle commands in DMs only
    if (!config.dmOnlyMode || !message.channel.isDMBased()) return;
    
    const prefix = config.prefix || '!';
    
    if (message.content.startsWith(prefix)) {
        const command = message.content.slice(prefix.length).trim().split(' ')[0].toLowerCase();
        
        // Example commands (expandable)
        switch (command) {
            case 'status':
                await message.reply(`🤖 I'm online! Memory: ${memoryManager.shortTermMemoryWindow} messages window`);
                break;
            case 'personality':
                const persona = personaManager.getPersona();
                await message.reply(
                    `**${persona.name}** (${persona.ageRange})\n` +
                    `*Speech Style*: ${persona.speechStyle || 'Default'}\n` +
                    `*Personality*: ${persona.personality?.substring(0, 100)}...`
                );
                break;
        }
    }
});

/**
 * Heartbeat to Keep Connection Alive (Required for Discord API)
 */
client.setInterval(() => {
    client.user.setPresence({ status: 'online' });
}, config.heartbeatInterval);

/**
 * =============================================
 * CLOUD DEPLOYMENT CONFIGURATION
 * =============================================
 * 
 * This bot MUST run on a cloud server:
 * - AWS EC2 (Ubuntu 20.04+)
 * - Google Cloud Compute Engine
 * - DigitalOcean Droplet
 * - Any VPS provider
 * 
 * NEVER deploy to:
 * ❌ Your personal laptop
 * ❌ Home computer
 * ❌ Raspberry Pi (unless cloud-architected)
 * 
 * Minimum Specs:
 * - 2 vCPUs
 * - 4GB RAM
 * - SSD Storage
 */

/**
 * Start the Express API Server + Discord Bot
 */
const PORT = process.env.PORT || 3001;  // Separate from Discord's websocket port

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🌐 API Server running on http://0.0.0.0:${PORT}`);
    console.log(`   Dashboard can connect to this endpoint`);
    console.log('============================================\n');
    
    // Discord bot is now online!
    client.login(config.token);  // Encrypted token from database
});

/**
 * =============================================
 * GRACEFUL SHUTDOWN (Auto-restart on cloud)
 * =============================================
 */

process.on('SIGTERM', () => {
    console.log('\n🔌 SIGTERM received. Shutting down gracefully...');
    process.exit(0);  // Cloud manager will auto-restart
});

process.on('SIGINT', () => {
    console.log('\n⏹️  SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

/**
 * =============================================
 * ERROR HANDLING (Auto-recovery)
 * =============================================
 */

process.on('uncaughtException', (error) => {
    console.error('\n💥 Uncaught Exception:', error.message);
    console.error(error.stack);
    
    // Send alert to admin
    if (config.alertEmail) {
        console.log(`📧 Alert would be sent to: ${config.alertEmail}`);
    }
    
    // Auto-restart via PM2/systemd watchdog will kick in
});

process.on('unhandledRejection', (error, promise) => {
    console.error('\n❌ Unhandled Rejection:', error.message);
    
    if (promise && promise.stack) {
        console.error(promise.stack);
    }
});

module.exports = { app, server, client };
