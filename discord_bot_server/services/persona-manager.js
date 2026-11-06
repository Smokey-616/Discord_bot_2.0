/**
 * Persona Manager Service
 * ========================
 * Handles AI-driven persona responses with memory context
 * Supports all customization fields:
 * - Name, Age, Personality, Speech Style, Backstory
 * - Example Dialogue (tone guidance)
 * - Extra Rules & Constraints
 */

const OpenAI = require('openai');  // npm install openai

class PersonaManager {
    constructor(botConfig) {
        this.botConfig = botConfig;
        this.personality = null;
        this.speechStyle = null;
        this.backstory = null;
        this.exampleDialogue = null;
        this.extraRules = null;
        
        // Initialize AI client (for actual deployments)
        this.aiClient = null;
    }
    
    /**
     * Load persona from database configuration
     */
    async loadPersona() {
        const config = this.botConfig;
        
        this.personality = {
            name: config.name || 'Unknown',
            ageRange: config.age_range || null,
            personalityTraits: config.personality ? JSON.parse(config.personality) : [],
            speechStyle: config.speech_style || 'casual',
            backstory: config.backstory || '',
            exampleDialogue: config.example_dialogue || [],
            extraRules: config.extra_rules || []
        };
        
        this.speechStyle = this.personality.speechStyle;
        this.backstory = this.personality.backstory;
        this.exampleDialogue = this.personality.exampleDialogue;
        
        console.log(`Persona loaded:`);
        console.log(`  Name: ${this.personality.name}`);
        console.log(`  Speech Style: ${this.speechStyle}`);
        console.log(`  Age Range: ${this.personality.ageRange || 'N/A'}`);
    }
    
    /**
     * Initialize OpenAI client (for actual deployment)
     */
    async initAI() {
        if (!process.env.OPENAI_API_KEY) {
            console.log('⚠️  No OpenAI API key configured. Using mock responses.');
            return;
        }
        
        try {
            this.aiClient = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
                dangerouslyAllowBrowser: true
            });
            console.log('✓ OpenAI client initialized');
        } catch (error) {
            console.error('❌ Failed to initialize OpenAI:', error.message);
        }
    }
    
    /**
     * Generate AI-driven response with persona context
     */
    async generateResponse(
        userMessage, 
        userId, 
        shortTermMemory = [],
        contentMode = 'fully_filtered'
    ) {
        // 1. Process message with persona context
        const processedInput = await this.processMessage(userMessage);
        
        // 2. Generate response based on persona + memory
        let botResponse;
        
        if (this.aiClient) {
            // Use actual AI (production mode)
            botResponse = await this.callAI(processedInput, contentMode);
        } else {
            // Fallback responses (development/testing)
            botResponse = this.generateFallbackResponse(userMessage);
        }
        
        // 3. Apply content filtering based on mode
        let finalResponse;
        if (contentMode === 'fully_filtered') {
            finalResponse = await this.sfwFilter(botResponse);
        } else if (contentMode === 'mature') {
            finalResponse = await this.adultOrientedFilter(botResponse, userId);
        } else {
            // explicit mode - full freedom, no restrictions
            finalResponse = botResponse;
        }
        
        return finalResponse;
    }
    
    /**
     * Process incoming message with persona context
     */
    processMessage(message) {
        // Check memory for relevant context
        let memoryContext = '';
        
        if (shortTermMemory.length > 0) {
            const recentMemories = shortTermMemory.slice(-10).join('\n');
            memoryContext = `\n\nRecent Context:\n${recentMemories}`;
        }
        
        return {
            message: message,
            memoryContext: memoryContext,
            persona: this.personality
        };
    }
    
    /**
     * Call AI API with full prompt engineering
     */
    async callAI(input, contentMode) {
        const systemPrompt = this.buildSystemPrompt();
        const messages = [{
            role: 'system',
            content: systemPrompt + input.memoryContext || ''
        }, {
            role: 'user',
            content: input.message
        }];
        
        try {
            const response = await this.aiClient.chat.completions.create({
                model: process.env.AI_MODEL || 'gpt-4o',
                messages: messages,
                temperature: 0.7,  // Creative responses
                maxTokens: 512
            });
            
            return response.choices[0].message.content;
        } catch (error) {
            console.error('❌ AI API error:', error.message);
            throw error;
        }
    }
    
    /**
     * Build system prompt with full persona context
     */
    buildSystemPrompt() {
        const lines = [];
        
        // Identity & Core Persona
        lines.push(`You are ${this.personality.name}, a Discord chatbot.`);
        
        if (this.personality.ageRange) {
            lines.push(`Your age range is approximately ${this.personality.ageRange}.`);
        }
        
        // Personality Traits
        if (this.personality.personalityTraits && this.personality.personalityTraits.length > 0) {
            const traits = this.personality.personalityTraits.join(', ');
            lines.push(`Personality: You are ${traits.toLowerCase()}.`);
        }
        
        // Speech Style
        lines.push(`Speech Style: ${this.speechStyle || 'Casual and friendly'}`);
        
        // Backstory
        if (this.backstory) {
            lines.push(`Backstory: ${this.backstory.substring(0, 500)}...`);
        }
        
        // Example Dialogue (Tone Guidance)
        if (this.exampleDialogue && this.exampleDialogue.length > 0) {
            const examples = this.exampleDialogue.slice(-3).map(ex => 
                `User: ${ex.user}\nBot: ${ex.bot}`
            ).join('\n\n');
            lines.push(`Example Dialogue:\n${examples}`);
        }
        
        // Extra Rules & Constraints
        if (this.extraRules && this.extraRules.length > 0) {
            const rules = this.extraRules.map((rule, i) => `${i + 1}. ${rule}`).join('\n');
            lines.push(`Extra Rules:\n${rules}`);
        }
        
        return lines.join('\n\n---\n');
    }
    
    /**
     * Generate fallback response (no AI key / development)
     */
    generateFallbackResponse(message) {
        const responses = [
            `Hey! You said "${message}". Tell me more about that?`,
            `${this.personality.name}: That's interesting! Go on...`,
            `Haha, I love hearing that! What else is on your mind?`,
            `${this.personality.name} responds: ${message.toLowerCase().substring(0, 50)}...`,
            `I'm curious about "${message}". How did that happen?`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * SFW Filter for 'fully_filtered' mode
     */
    async sfwFilter(response) {
        // For fully filtered mode, ensure response is SFW
        const safeResponses = [
            `That's a great point! Tell me more.`,
            `I'm here to chat! What else do you want to talk about?`,
            `Thanks for sharing that with me! 🌟`
        ];
        
        return safeResponses[Math.floor(Math.random() * safeResponses.length)];
    }
    
    /**
     * Adult-oriented filter for 'mature' mode (artistic/contextual)
     */
    async adultOrientedFilter(response, userId) {
        // Mature mode allows artistic/contextual content when appropriate
        const isAdultUser = userId.includes('adult');  // Example flag
        
        if (isAdultUser) {
            // Allow mature themes in appropriate context
            return response;
        }
        
        return this.sfwFilter(response);
    }
    
    /**
     * Get persona configuration for dashboard display
     */
    getPersona() {
        return this.personality;
    }
    
    /**
     * Update persona settings (for editing)
     */
    async updatePersona(settings) {
        // Save to database via API (in production)
        console.log('⚙️  Persona updated:', settings);
        
        // Reload local copy
        await this.loadPersona();
        
        return { success: true };
    }
}

module.exports = { PersonaManager };
