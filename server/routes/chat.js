// ============================================
// Chat Routes - AI Persona Chat Interface
// ============================================

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const aiClient = require('../utils/ai-client');

// ============================================
// POST /api/chat/send
// Send message to AI persona
// ============================================

router.post('/send', async (req, res) => {
    try {
        const { personaId, message, userAddress, chatId } = req.body;
        
        // Validate input
        if (!personaId || !message || !userAddress) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['personaId', 'message', 'userAddress']
            });
        }
        
        console.log(`💬 Chat request for persona: ${personaId}`);
        
        // Step 1: Get persona data
        const personaQuery = `
            SELECT * FROM personas WHERE persona_id = $1 AND is_active = true
        `;
        const personaResult = await global.db.query(personaQuery, [personaId]);
        
        if (personaResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Persona not found or inactive',
                personaId: personaId
            });
        }
        
        const persona = personaResult.rows[0];
        
        // Step 2: Get recent chat history for context (last 10 messages)
        const currentChatId = chatId || uuidv4();
        const historyQuery = `
            SELECT message, response
            FROM chat_history
            WHERE persona_id = $1 AND user_address = $2
            ORDER BY created_at DESC
            LIMIT 10
        `;
        const historyResult = await global.db.query(historyQuery, [personaId, userAddress]);
        const chatHistory = historyResult.rows.reverse(); // Chronological order
        
        // Step 3: Build context for AI
        const personality = persona.personality;
        const context = {
            personaName: persona.name,
            personaDescription: persona.description,
            personality: personality,
            traits: persona.traits,
            previousMessages: chatHistory.map(h => ({
                user: h.message,
                assistant: h.response
            }))
        };
        
        // Step 4: Generate AI response
        const startTime = Date.now();
        const aiResponse = await aiClient.chat({
            message: message,
            context: context,
            personaId: personaId
        });
        const responseTime = Date.now() - startTime;
        
        console.log(`✅ AI response generated in ${responseTime}ms`);
        
        // Step 5: Calculate sentiment (simple implementation)
        const sentiment = calculateSentiment(message);
        
        // Step 6: Save to database
        const insertQuery = `
            INSERT INTO chat_history (
                chat_id, persona_id, user_address, message, response,
                conversation_context, sentiment_score, tokens_used,
                ai_model, response_time_ms
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
        `;
        
        const contextData = {
            previousMessages: chatHistory.slice(-5), // Last 5 for context
            personaPersonality: personality
        };
        
        await global.db.query(insertQuery, [
            currentChatId,
            personaId,
            userAddress,
            message,
            aiResponse.text,
            JSON.stringify(contextData),
            sentiment,
            aiResponse.tokensUsed || 0,
            aiResponse.model || 'deepseek',
            responseTime
        ]);
        
        console.log(`✅ Chat saved to history`);
        
        // Step 7: Return response
        res.json({
            success: true,
            data: {
                chatId: currentChatId,
                personaId: personaId,
                personaName: persona.name,
                message: message,
                response: aiResponse.text,
                sentiment: sentiment,
                timestamp: new Date().toISOString(),
                responseTime: responseTime,
                model: aiResponse.model
            }
        });
        
    } catch (error) {
        console.error('❌ Error in chat:', error);
        res.status(500).json({
            error: 'Failed to process chat',
            message: error.message
        });
    }
});

// ============================================
// GET /api/chat/history/:personaId
// Get chat history for a persona
// ============================================

router.get('/history/:personaId', async (req, res) => {
    try {
        const { personaId } = req.params;
        const { userAddress, limit = 50, offset = 0 } = req.query;
        
        if (!userAddress) {
            return res.status(400).json({
                error: 'userAddress is required'
            });
        }
        
        const query = `
            SELECT 
                id, chat_id, message, response, sentiment_score,
                created_at, response_time_ms
            FROM chat_history
            WHERE persona_id = $1 AND user_address = $2
            ORDER BY created_at DESC
            LIMIT $3 OFFSET $4
        `;
        
        const result = await global.db.query(query, [
            personaId,
            userAddress,
            parseInt(limit),
            parseInt(offset)
        ]);
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) FROM chat_history
            WHERE persona_id = $1 AND user_address = $2
        `;
        const countResult = await global.db.query(countQuery, [personaId, userAddress]);
        const totalCount = parseInt(countResult.rows[0].count);
        
        res.json({
            success: true,
            data: result.rows.map(row => ({
                id: row.id,
                chatId: row.chat_id,
                message: row.message,
                response: row.response,
                sentiment: row.sentiment_score,
                timestamp: row.created_at,
                responseTime: row.response_time_ms
            })),
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching chat history:', error);
        res.status(500).json({
            error: 'Failed to fetch chat history',
            message: error.message
        });
    }
});

// ============================================
// DELETE /api/chat/history/:chatId
// Delete specific chat conversation
// ============================================

router.delete('/history/:chatId', async (req, res) => {
    try {
        const { chatId } = req.params;
        const { userAddress } = req.body;
        
        if (!userAddress) {
            return res.status(400).json({
                error: 'userAddress is required'
            });
        }
        
        const query = `
            DELETE FROM chat_history
            WHERE chat_id = $1 AND user_address = $2
            RETURNING id
        `;
        
        const result = await global.db.query(query, [chatId, userAddress]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Chat conversation not found or unauthorized'
            });
        }
        
        res.json({
            success: true,
            message: 'Chat history deleted',
            deletedCount: result.rows.length
        });
        
    } catch (error) {
        console.error('❌ Error deleting chat history:', error);
        res.status(500).json({
            error: 'Failed to delete chat history',
            message: error.message
        });
    }
});

// ============================================
// GET /api/chat/stats/:personaId
// Get chat statistics for a persona
// ============================================

router.get('/stats/:personaId', async (req, res) => {
    try {
        const { personaId } = req.params;
        
        const query = `
            SELECT 
                COUNT(*) as total_messages,
                COUNT(DISTINCT user_address) as unique_users,
                AVG(sentiment_score) as avg_sentiment,
                AVG(response_time_ms) as avg_response_time,
                MIN(created_at) as first_message,
                MAX(created_at) as last_message
            FROM chat_history
            WHERE persona_id = $1
        `;
        
        const result = await global.db.query(query, [personaId]);
        const stats = result.rows[0];
        
        res.json({
            success: true,
            data: {
                personaId: personaId,
                totalMessages: parseInt(stats.total_messages),
                uniqueUsers: parseInt(stats.unique_users),
                avgSentiment: parseFloat(stats.avg_sentiment) || 0,
                avgResponseTime: parseInt(stats.avg_response_time) || 0,
                firstMessage: stats.first_message,
                lastMessage: stats.last_message
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching chat stats:', error);
        res.status(500).json({
            error: 'Failed to fetch chat stats',
            message: error.message
        });
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateSentiment(message) {
    // Simple sentiment analysis (you can use a library like 'sentiment' for better results)
    const positiveWords = ['good', 'great', 'awesome', 'excellent', 'love', 'happy', 'wonderful', 'amazing', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'horrible', 'worst', 'disappointing'];
    
    const lowerMessage = message.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
        if (lowerMessage.includes(word)) score += 0.1;
    });
    
    negativeWords.forEach(word => {
        if (lowerMessage.includes(word)) score -= 0.1;
    });
    
    // Normalize between -1 and 1
    return Math.max(-1, Math.min(1, score));
}

module.exports = router;
