// ============================================
// AI Client - Multi-Provider AI Integration
// Supports: Deepseek, Gemini, OpenRouter
// ============================================

const axios = require('axios');

class AIClient {
    constructor() {
        this.providers = {
            deepseek: {
                apiKey: process.env.DEEPSEEK_API_KEY,
                url: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
                model: process.env.DEEPSEEK_MODEL || 'deepseek-chat'
            },
            gemini: {
                apiKey: process.env.GEMINI_API_KEY,
                url: 'https://generativelanguage.googleapis.com/v1beta',
                model: process.env.GEMINI_MODEL || 'gemini-pro'
            },
            openrouter: {
                apiKey: process.env.OPENROUTER_API_KEY,
                url: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1',
                model: 'anthropic/claude-3-sonnet'
            }
        };
        
        // Priority order from env or default
        this.priority = (process.env.AI_PRIORITY || 'deepseek,gemini,openrouter').split(',');
    }
    
    // ============================================
    // Generate AI Persona from Prompt
    // ============================================
    
    async generatePersona(prompt, category = 'custom') {
        const systemPrompt = `You are an AI persona generator. Create a unique, engaging AI persona based on the user's description.

Generate a JSON response with this EXACT structure:
{
    "name": "Persona Name",
    "description": "Detailed 2-3 sentence description of the persona",
    "personality": {
        "tone": "friendly/professional/witty/etc",
        "style": "conversational/formal/poetic/etc",
        "expertise": ["area1", "area2", "area3"],
        "traits": ["trait1", "trait2", "trait3"],
        "catchphrase": "A memorable phrase this persona would say"
    },
    "traits": [
        { "category": "Creativity", "value": 85, "displayType": "number" },
        { "category": "Intelligence", "value": 90, "displayType": "number" },
        { "category": "Humor", "value": 75, "displayType": "number" },
        { "category": "Wisdom", "value": 80, "displayType": "number" },
        { "category": "Energy", "value": 70, "displayType": "number" }
    ],
    "visualPrompt": "Detailed prompt for image generation describing appearance, style, colors, mood"
}

Make the persona interesting, unique, and engaging. Values should be 1-100.`;

        const userPrompt = `Create an AI persona: ${prompt}. Category: ${category}`;
        
        try {
            const response = await this.callAI(systemPrompt, userPrompt);
            const personaData = this.parseJSON(response.text);
            
            // Validate and add defaults if needed
            return {
                name: personaData.name || 'Unnamed Persona',
                description: personaData.description || 'A unique AI persona',
                personality: personaData.personality || this.getDefaultPersonality(),
                traits: personaData.traits || this.getDefaultTraits(),
                visualPrompt: personaData.visualPrompt || this.generateDefaultVisualPrompt(personaData.name),
                model: response.model
            };
            
        } catch (error) {
            console.error('❌ Error generating persona:', error.message);
            throw error;
        }
    }
    
    // ============================================
    // Chat with Persona
    // ============================================
    
    async chat({ message, context, personaId }) {
        const { personaName, personaDescription, personality, previousMessages } = context;
        
        const systemPrompt = `You are ${personaName}, an AI persona with the following characteristics:

Description: ${personaDescription}

Personality:
- Tone: ${personality.tone}
- Style: ${personality.style}
- Expertise: ${personality.expertise?.join(', ')}
- Key Traits: ${personality.traits?.join(', ')}
- Catchphrase: "${personality.catchphrase}"

IMPORTANT: Respond in character as ${personaName}. Be consistent with the personality traits. Keep responses conversational and engaging.`;

        // Build conversation history
        let conversationHistory = '';
        if (previousMessages && previousMessages.length > 0) {
            conversationHistory = '\n\nPrevious conversation:\n';
            previousMessages.forEach(msg => {
                conversationHistory += `User: ${msg.user}\nYou: ${msg.assistant}\n`;
            });
        }
        
        const userPrompt = conversationHistory + `\n\nUser: ${message}\n\nRespond as ${personaName}:`;
        
        try {
            const response = await this.callAI(systemPrompt, userPrompt, 2000);
            return response;
        } catch (error) {
            console.error('❌ Error in chat:', error.message);
            throw error;
        }
    }
    
    // ============================================
    // Call AI Provider (with fallback)
    // ============================================
    
    async callAI(systemPrompt, userPrompt, maxTokens = 1000) {
        let lastError;
        
        // Try each provider in priority order
        for (const provider of this.priority) {
            try {
                console.log(`🤖 Trying AI provider: ${provider}`);
                
                const result = await this[`call${this.capitalize(provider)}`](
                    systemPrompt,
                    userPrompt,
                    maxTokens
                );
                
                console.log(`✅ Success with ${provider}`);
                return {
                    text: result.text,
                    model: provider,
                    tokensUsed: result.tokensUsed
                };
                
            } catch (error) {
                console.warn(`⚠️ ${provider} failed:`, error.message);
                lastError = error;
                continue; // Try next provider
            }
        }
        
        // All providers failed
        throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
    }
    
    // ============================================
    // Provider-Specific Implementations
    // ============================================
    
    async callDeepseek(systemPrompt, userPrompt, maxTokens) {
        const config = this.providers.deepseek;
        
        if (!config.apiKey) {
            throw new Error('Deepseek API key not configured');
        }
        
        const response = await axios.post(
            `${config.url}/chat/completions`,
            {
                model: config.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: maxTokens,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        return {
            text: response.data.choices[0].message.content,
            tokensUsed: response.data.usage?.total_tokens || 0
        };
    }
    
    async callGemini(systemPrompt, userPrompt, maxTokens) {
        const config = this.providers.gemini;
        
        if (!config.apiKey) {
            throw new Error('Gemini API key not configured');
        }
        
        const response = await axios.post(
            `${config.url}/models/${config.model}:generateContent?key=${config.apiKey}`,
            {
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\n${userPrompt}`
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: maxTokens,
                    temperature: 0.7
                }
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );
        
        return {
            text: response.data.candidates[0].content.parts[0].text,
            tokensUsed: response.data.usageMetadata?.totalTokenCount || 0
        };
    }
    
    async callOpenrouter(systemPrompt, userPrompt, maxTokens) {
        const config = this.providers.openrouter;
        
        if (!config.apiKey) {
            throw new Error('OpenRouter API key not configured');
        }
        
        const response = await axios.post(
            `${config.url}/chat/completions`,
            {
                model: config.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: maxTokens,
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
                    'X-Title': 'AI_xandria'
                },
                timeout: 30000
            }
        );
        
        return {
            text: response.data.choices[0].message.content,
            tokensUsed: response.data.usage?.total_tokens || 0
        };
    }
    
    // ============================================
    // Helper Functions
    // ============================================
    
    parseJSON(text) {
        try {
            // Try to extract JSON if wrapped in markdown code blocks
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                            text.match(/```\n([\s\S]*?)\n```/);
            
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1]);
            }
            
            return JSON.parse(text);
        } catch (error) {
            console.error('❌ Failed to parse JSON:', error.message);
            throw new Error('Invalid JSON response from AI');
        }
    }
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    getDefaultPersonality() {
        return {
            tone: 'friendly',
            style: 'conversational',
            expertise: ['general knowledge', 'assistance', 'conversation'],
            traits: ['helpful', 'curious', 'engaging'],
            catchphrase: 'How can I help you today?'
        };
    }
    
    getDefaultTraits() {
        return [
            { category: 'Creativity', value: 70, displayType: 'number' },
            { category: 'Intelligence', value: 75, displayType: 'number' },
            { category: 'Humor', value: 60, displayType: 'number' },
            { category: 'Wisdom', value: 70, displayType: 'number' },
            { category: 'Energy', value: 65, displayType: 'number' }
        ];
    }
    
    generateDefaultVisualPrompt(name) {
        return `A stylized digital avatar representing ${name}, modern design, vibrant colors, professional look, centered composition, high quality`;
    }
}

// Export singleton instance
module.exports = new AIClient();
