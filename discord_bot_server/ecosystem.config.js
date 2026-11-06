{
    "apps": [
        {
            "name": "discord-persona-bot",
            "script": "./index.js",  // Main entry point
            
            // Cloud deployment settings
            "instances": 1,  // Single instance for chatbot (can scale up if needed)
            "autorestart": true,  // Auto-restart on crash (required for 24/7 uptime)
            "watch": false,  // Don't watch files (use PM2 startup instead)
            
            // Environment variables (set via .env file in production)
            "env": {
                "NODE_ENV": "production",
                "DISCORD_BOT_TOKEN": process.env.DISCORD_BOT_TOKEN,
                "OPENAI_API_KEY": process.env.OPENAI_API_KEY,
                "MEMORY_WINDOW_SIZE": process.env.MEMORY_WINDOW_SIZE || "50",
                "AUTO_EXPIRE_HOURS": process.env.AUTO_EXPIRE_HOURS || "72",
                "EXPLICIT_CONTENT_MODE": process.env.EXPLICIT_CONTENT_MODE || "fully_filtered"
            },
            
            // Error handling (logs to stdout for PM2)
            "error_log": "err.log",
            "out_file": "out.log",
            
            // Restart policy for cloud resilience
            "max_restarts": 10,
            "min_uptime": "1m",
            
            // Resource limits (prevent runaway processes)
            "memory": {
                "hardLimit": "500M"
            }
        }
    ],
    
    // System-wide settings
    "deploy": {
        "predeploy": [],  // Add npm install here if needed
        "postdeploy": [],
        "restart_delay": 1000,
        "restart_mode": "soft"
    }
}
