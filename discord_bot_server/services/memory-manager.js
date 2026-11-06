/**
 * Memory Manager Service
 * =======================
 * Handles:
 * - Long-term memories (auto-generated + user-managed)
 * - Short-term sliding window memory
 * - Memory compression & auto-expiry
 */

class MemoryManager {
    constructor(windowSize = 50, autoExpireHours = 72) {
        this.shortTermMemoryWindow = windowSize;
        this.autoExpireHours = autoExpireHours;
        this.memoryCache = new Map();  // In-memory cache (replace with Redis in production)
    }
    
    /**
     * Initialize memory session for a bot/user combination
     */
    async initSession(botId, userId) {
        const sessionId = `${botId}-${userId}`;
        
        if (!this.memoryCache.has(sessionId)) {
            this.memoryCache.set(sessionId, []);
            console.log(`🧠 New memory session created for user ${userId}`);
        }
        
        return this.memoryCache.get(sessionId);
    }
    
    /**
     * Add message to short-term memory (sliding window)
     */
    async addMessage(userId, role, content, oppositeRole) {
        const sessionId = `session-${role}-${userId}`;  // User or bot side
        
        let session = this.memoryCache.get(sessionId);
        
        if (!session) {
            session = [];
            this.memoryCache.set(sessionId, session);
        }
        
        // Add new message with context
        const message = {
            id: Date.now() + Math.random(),
            role: role === 'user' ? 'user' : 'assistant',
            content: content,
            oppositeRole: oppositeRole,
            timestamp: new Date().toISOString()
        };
        
        session.push(message);
        
        // Maintain sliding window (remove oldest if over limit)
        if (session.length > this.shortTermMemoryWindow) {
            const removed = session.shift();
            console.log(`⏭️  Sliding window: removed oldest message (${removed.content.substring(0, 50)}...)`);
        }
        
        return { success: true, currentCount: session.length };
    }
    
    /**
     * Get short-term memory for user (with context)
     */
    getShortTermMemory(userId) {
        const sessionId = `session-user-${userId}`;
        const memories = this.memoryCache.get(sessionId) || [];
        
        // Return messages in readable format
        return memories.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp).toLocaleTimeString()
        }));
    }
    
    /**
     * Auto-generate long-term memory from interactions
     */
    async generateLongTermMemory(userId, recentMessages) {
        // Analyze conversations to auto-generate memories
        
        const patterns = [];
        
        // Pattern 1: User preferences
        const preferenceMatches = this.extractPreferences(recentMessages);
        if (preferenceMatches.length > 0) {
            patterns.push({
                category: 'preferences',
                title: `User Likes/Dislikes`,
                content: preferenceMatches.map(m => ({
                    type: m.type,
                    item: m.item,
                    strength: m.strength || 'medium'
                }))
            });
        }
        
        // Pattern 2: Relationship dynamics
        const relationshipMatches = this.extractRelationships(recentMessages);
        if (relationshipMatches.length > 0) {
            patterns.push({
                category: 'relationships',
                title: `Interaction with ${userId}`,
                content: relationshipMatches.map(m => ({
                    sentiment: m.sentiment,
                    context: m.context.substring(0, 200)
                }))
            });
        }
        
        // Pattern 3: Emotional context tracking
        const emotionMatches = this.extractEmotions(recentMessages);
        if (emotionMatches.length > 0) {
            patterns.push({
                category: 'history',
                title: `Emotional Context`,
                content: emotionMatches.map(e => ({
                    emotion: e.emotion,
                    intensity: e.intensity || 'mild',
                    timestamp: e.timestamp
                }))
            });
        }
        
        // Auto-generate memory entries
        for (const pattern of patterns) {
            await this.createLongTermMemoryEntry(pattern);
        }
        
        return patterns;
    }
    
    /**
     * Extract user preferences from messages
     */
    extractPreferences(messages) {
        const preferences = [];
        const likesKeywords = ['love', 'like', 'enjoy', 'favorite', 'prefer', 'best'];
        const dislikesKeywords = ['hate', 'dislike', 'dont like', 'avoid', 'never', 'worst'];
        
        for (const msg of messages) {
            const lowerMsg = msg.content.toLowerCase();
            
            for (const keyword of likesKeywords) {
                if (lowerMsg.includes(keyword)) {
                    // Extract what they like
                    const match = lowerMsg.match(/love|like|enjoy|favorite\s+(.+?)(?:\.$|\.!|,|$)/);
                    if (match) {
                        preferences.push({
                            type: 'likes',
                            item: match[1].trim(),
                            strength: this.getPreferenceStrength(keyword)
                        });
                        break;
                    }
                }
            }
            
            for (const keyword of dislikesKeywords) {
                if (lowerMsg.includes(keyword)) {
                    const match = lowerMsg.match(/hate|dislike|dont like\s+(.+?)(?:\.$|\.!|,|$)/);
                    if (match) {
                        preferences.push({
                            type: 'dislikes',
                            item: match[1].trim(),
                            strength: this.getPreferenceStrength(keyword)
                        });
                        break;
                    }
                }
            }
        }
        
        return preferences.slice(-5);  // Limit to top 5
    }
    
    /**
     * Extract relationship dynamics
     */
    extractRelationships(messages) {
        const relationships = [];
        const positiveWords = ['happy', 'joyful', 'excited', 'grateful', 'amazing', 'awesome'];
        const negativeWords = ['sad', 'angry', 'frustrated', 'bored', 'annoying', 'stressful'];
        
        for (const msg of messages) {
            const lowerMsg = msg.content.toLowerCase();
            let sentiment = 'neutral';
            
            // Check for positive sentiment
            if (positiveWords.some(word => lowerMsg.includes(word))) {
                sentiment = 'positive';
            } else if (negativeWords.some(word => lowerMsg.includes(word))) {
                sentiment = 'negative';
            }
            
            if (sentiment !== 'neutral') {
                relationships.push({
                    sentiment,
                    context: msg.content.substring(0, 200)
                });
            }
        }
        
        return relationships.slice(-3);  // Limit to top 3
    }
    
    /**
     * Extract emotional context
     */
    extractEmotions(messages) {
        const emotions = [];
        const emotionMap = {
            'excited': 'excitement',
            'happy': 'happiness',
            'sad': 'sadness',
            'angry': 'anger',
            'tired': 'fatigue'
        };
        
        for (const msg of messages) {
            const lowerMsg = msg.content.toLowerCase();
            
            for (const [word, emotion] of Object.entries(emotionMap)) {
                if (lowerMsg.includes(word)) {
                    emotions.push({
                        emotion: emotion,
                        intensity: this.getIntensity(lowerMsg),
                        timestamp: new Date().toISOString()
                    });
                    break;
                }
            }
        }
        
        return emotions.slice(-3);
    }
    
    /**
     * Get preference strength based on keyword
     */
    getPreferenceStrength(keyword) {
        const strongKeywords = ['love', 'hate', 'adore'];
        if (strongKeywords.includes(keyword)) return 'strong';
        
        const mediumKeywords = ['like', 'dislike', 'prefer'];
        if (mediumKeywords.includes(keyword)) return 'moderate';
        
        return 'mild';
    }
    
    /**
     * Get emotional intensity
     */
    getIntensity(text) {
        const intensityWords = {
            'very': 3,
            'extremely': 4,
            'so': 2,
            'really': 2,
            'highly': 3,
            'pretty': 1,
            'kinda': 0.5
        };
        
        for (const [word, score] of Object.entries(intensityWords)) {
            if (text.includes(word.toLowerCase())) {
                return score;
            }
        }
        
        return 1;  // Default mild intensity
    }
    
    /**
     * Create long-term memory entry in database
     */
    async createLongTermMemoryEntry(pattern) {
        console.log(`🧠 Auto-generating long-term memory:`);
        console.log(JSON.stringify(pattern, null, 2));
        
        // In production, this would insert into PostgreSQL memories table
        const memoryData = {
            botId: pattern.botId || 'current_bot',
            category: pattern.category,
            title: pattern.title,
            content: JSON.stringify(pattern.content),
            isAutoGenerated: true,
            autoGenerationReason: `Extracted from conversation patterns with ${pattern.category} focus`,
            createdAt: new Date().toISOString(),
            canBeDeletedByUser: true  // Users can edit/delete their memories
        };
        
        return memoryData;
    }
    
    /**
     * Add user-managed memory (dashboard feature)
     */
    async addMemory(botId, category, title, content, isAutoGenerated = false) {
        const memoryData = {
            id: Date.now() + Math.random(),
            botId,
            category,
            title,
            content: JSON.stringify(content),
            isAutoGenerated,
            canBeDeletedByUser: !isAutoGenerated,  // Auto-generated can be deleted by user
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('💾 Memory saved to database:', memoryData);
        
        return memoryData;
    }
    
    /**
     * Delete memory entry (user management)
     */
    async deleteMemory(memoryId) {
        const sessionId = `session-memory-${memoryId}`;
        const memories = this.memoryCache.get(sessionId);
        
        if (memories) {
            const index = memories.findIndex(m => m.id === memoryId);
            if (index !== -1) {
                memories.splice(index, 1);
                console.log(`🗑️  Memory deleted: ${memoryId}`);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Update memory entry
     */
    async updateMemory(memoryId, updates) {
        const sessionId = `session-memory-${memoryId}`;
        const memories = this.memoryCache.get(sessionId);
        
        if (memories) {
            const index = memories.findIndex(m => m.id === memoryId);
            if (index !== -1) {
                memories[index] = { ...memories[index], ...updates };
                console.log(`✏️  Memory updated: ${memoryId}`);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Apply memory compression (summary older conversations)
     */
    async compressMemory(sessionId, threshold = 100) {
        const memories = this.memoryCache.get(sessionId);
        
        if (!memories || memories.length <= threshold) {
            return;  // Nothing to compress
        }
        
        console.log(`📦 Memory compression enabled for session ${sessionId}`);
        
        // Compress messages beyond threshold
        const summaryInterval = this.shortTermMemoryWindow / 2;
        const compressedMessages = [];
        
        for (let i = 0; i < memories.length - threshold; i += summaryInterval) {
            const chunk = memories.slice(i, Math.min(i + summaryInterval, memories.length));
            
            // Generate summary (in production, use AI to summarize)
            const summary = this.generateSummary(chunk);
            
            compressedMessages.push({
                role: 'compressed_summary',
                content: summary,
                timestamp: new Date().toISOString()
            });
        }
        
        // Replace with summaries
        memories.splice(0, threshold + compressedMessages.length, ...compressedMessages);
        
        console.log(`✅ Compressed ${threshold + compressedMessages.length} messages into summaries`);
    }
    
    /**
     * Generate summary for message chunk
     */
    generateSummary(messages) {
        const topics = [];
        
        for (const msg of messages) {
            const lowerContent = msg.content.toLowerCase();
            
            // Extract topic keywords
            if (lowerContent.includes('game')) topics.push('Gaming');
            else if (lowerContent.includes('music')) topics.push('Music');
            else if (lowerContent.includes('work')) topics.push('Work');
            else if (lowerContent.includes('study')) topics.push('Study');
            else if (lowerContent.includes('travel')) topics.push('Travel');
        }
        
        return `Summary of recent conversation covering: ${topics.join(', ') || 'General chat'}`;
    }
    
    /**
     * Clear all memory sessions
     */
    clearAllMemory() {
        this.memoryCache.clear();
        console.log('🗑️  All memory cleared');
    }
}

module.exports = { MemoryManager };
