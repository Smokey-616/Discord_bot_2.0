-- =============================================
-- DISCORD PERSONA CHATBOT PLATFORM - DATABASE SCHEMA
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- BOTS / PERSONAS (One user can create multiple bots)
-- =============================================

CREATE TABLE bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Core Persona Settings
    name VARCHAR(100) NOT NULL,
    age_range VARCHAR(50),
    personality TEXT,  -- JSON or text - detailed traits, archetypes, quirks
    speech_style VARCHAR(100),  -- formal, casual, poetic, sarcastic, etc.
    backstory TEXT,
    
    -- Example Dialogue (guides tone)
    example_dialogue JSONB DEFAULT '[{"user": "Hello!", "bot": "Hey there! How's it going?"}]',
    
    -- Content Restrictions
    explicit_content_mode VARCHAR(20) DEFAULT 'fully_filtered' CHECK (explicit_content_mode IN ('fully_filtered', 'mature', 'explicit')),
    
    -- Discord Integration
    discord_bot_token_encrypted TEXT,  -- Encrypted token from Discord Developer Portal
    application_id VARCHAR(100),
    redirect_uris JSONB DEFAULT '[]',
    
    -- Communication Mode
    dm_only_mode BOOLEAN DEFAULT TRUE,  -- Bot operates via DMs only (not public channels)
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bots_user_id ON bots(user_id);
CREATE INDEX idx_bots_is_active ON bots(is_active);
CREATE INDEX idx_bots_name ON bots(name);

-- =============================================
-- LONG-TERM MEMORIES (Auto-generated + User-managed)
-- =============================================

CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    
    -- Memory Content
    category VARCHAR(50),  -- relationships, preferences, history, system_notes
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL,  -- Flexible structure for any memory type
    
    -- Auto-generation tracking
    is_auto_generated BOOLEAN DEFAULT FALSE,
    auto_generation_reason TEXT,  -- Why was this memory auto-generated?
    
    -- User management
    can_be_deleted_by_user BOOLEAN DEFAULT TRUE,  -- System memories may be immutable
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_memories_bot_id ON memories(bot_id);
CREATE INDEX idx_memories_category ON memories(category);
CREATE INDEX idx_memories_created_at ON memories(created_at);

-- =============================================
-- SHORT-TERM MEMORY (Sliding Window + Configurable)
-- =============================================

CREATE TABLE memory_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    
    -- Session Configuration
    window_size INTEGER DEFAULT 50,  -- Number of recent messages to remember
    auto_expiry_hours INTEGER DEFAULT 72,
    
    -- Session state
    message_count INTEGER DEFAULT 0,
    last_message_processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Compression settings
    compression_enabled BOOLEAN DEFAULT FALSE,
    summary_interval INTEGER DEFAULT 100,  -- Summarize every N messages
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_memory_sessions_bot_id ON memory_sessions(bot_id);

-- =============================================
-- CHAT HISTORY (Short-term memory storage)
-- =============================================

CREATE TABLE chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    
    -- Message Data
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'bot')),
    content TEXT NOT NULL,
    
    -- Context tracking
    is_mention BOOLEAN DEFAULT FALSE,  -- User mentioned the bot
    processing_latency_ms INTEGER,  -- For AI self-improvement
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_history_bot_id ON chat_history(bot_id);
CREATE INDEX idx_chat_history_created_at ON chat_history(created_at DESC);

-- =============================================
-- BOT STATISTICS (For Dashboard Overview)
-- =============================================

CREATE TABLE bot_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    
    -- Stats
    total_conversations INTEGER DEFAULT 0,
    avg_response_time_ms DECIMAL(10,2),
    successful_interactions INTEGER DEFAULT 0,
    
    -- Learning data (AI self-improvement)
    last_learning_analysis_at TIMESTAMP WITH TIME ZONE,
    learning_suggestions JSONB DEFAULT '[]',
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bot_statistics_bot_id ON bot_statistics(bot_id);

-- =============================================
-- USER-DEFINED SETTINGS (Per-bot preferences)
-- =============================================

CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    
    -- Dashboard settings
    show_memory_management BOOLEAN DEFAULT TRUE,
    allow_manual_memory_edit BOOLEAN DEFAULT FALSE,  -- For advanced users
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_settings_bot_id ON user_settings(bot_id);

-- =============================================
-- TRIGGERS & FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bots_updated_at BEFORE UPDATE ON bots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memory_sessions_updated_at BEFORE UPDATE ON memory_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS (Dashboard Queries)
-- =============================================

CREATE VIEW bot_overview AS
SELECT 
    b.id,
    b.name,
    b.explicit_content_mode,
    b.dm_only_mode,
    b.is_active,
    COUNT(m.id) as memory_count,
    COUNT(ch.id) as recent_messages_count,
    MAX(ch.created_at) as last_activity,
    (SELECT COALESCE(AVG(bs.avg_response_time_ms), 0) FROM bot_statistics bs WHERE bs.bot_id = b.id) as avg_response_time_ms
FROM bots b
LEFT JOIN memories m ON b.id = m.bot_id
LEFT JOIN chat_history ch ON b.id = ch.bot_id AND ch.created_at > NOW() - INTERVAL '24 hours'
WHERE b.is_active = TRUE
GROUP BY b.id, b.name, b.explicit_content_mode, b.dm_only_mode;
