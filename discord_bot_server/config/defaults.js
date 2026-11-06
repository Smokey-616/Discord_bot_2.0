/**
 * Discord Persona Chatbot Platform
 * ====================================
 * A fully autonomous, 24/7 Discord chatbot that runs on cloud infrastructure
 * NEVER runs on user's computer - deploy to AWS/GCP/DigitalOcean!
 * 
 * Features:
 * - DM-only communication (no public server channels)
 * - Full persona customization via web dashboard
 * - Long-term + short-term memory system
 * - Explicit content mode toggle
 * - AI-driven with self-improvement capabilities
 */

module.exports = {
    // Discord Bot Configuration
    "token": process.env.DISCORD_BOT_TOKEN,  // Encrypted token from database
    
    // Communication Settings
    "dmOnlyMode": true,  // BOT ONLY OPERATES VIA DMs (not public servers)
    
    // Memory Configuration
    "shortTermMemoryWindow": parseInt(process.env.MEMORY_WINDOW_SIZE || "50"),
    "autoExpireHours": parseInt(process.env.AUTO_EXPIRE_HOURS || "72"),
    
    // Content Filter Mode
    "explicitContentMode": process.env.EXPLICIT_CONTENT_MODE || "fully_filtered",
    
    // AI Integration
    "openAiApiKey": process.env.OPENAI_API_KEY,
    "model": process.env.AI_MODEL || "gpt-4o",
    
    // Database (Redis for memory cache + PostgreSQL for persistence)
    "redisUrl": process.env.REDIS_URL || "redis://localhost:6379",
    "postgresqlUrl": process.env.POSTGRES_URL || "postgresql://user:pass@localhost/botdb",
    
    // AI Self-Improvement Settings
    "enableSelfImprovement": true,
    "learningIntervalHours": 24,
    
    // Monitoring
    "heartbeatInterval": 30000,  // Send heartbeat every 30s to Discord
};
