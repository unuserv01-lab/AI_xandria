// server/routes/interaction.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { ethers } = require('ethers');

// POST /api/interaction/initiate - Initiate payment for persona chat
router.post('/initiate', authenticateToken, async (req, res) => {
  try {
    const { personaId } = req.body;
    const userId = req.user.id;
    
    // Check if already unlocked
    const existing = await db.query(
      'SELECT * FROM persona_interactions WHERE user_id = $1 AND persona_id = $2',
      [userId, personaId]
    );
    
    if (existing.rows.length > 0 && existing.rows[0].chat_unlocked) {
      return res.json({
        success: true,
        alreadyUnlocked: true,
        message: 'Chat already unlocked'
      });
    }
    
    // Get persona price
    const personaResult = await db.query(
      'SELECT price, name FROM personas WHERE id = $1',
      [personaId]
    );
    
    if (personaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Persona not found'
      });
    }
    
    const price = personaResult.rows[0].price;
    
    res.json({
      success: true,
      personaId,
      price,
      personaName: personaResult.rows[0].name
    });
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment'
    });
  }
});

// POST /api/interaction/verify-payment - Verify blockchain transaction
router.post('/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { personaId, transactionHash, amount } = req.body;
    const userId = req.user.id;
    
    // Verify transaction on blockchain (simplified - you need actual Web3 verification)
    // In production, verify:
    // 1. Transaction exists on blockchain
    // 2. Transaction is confirmed
    // 3. Amount matches persona price
    // 4. Recipient address is correct
    
    // For demo purposes, we'll simulate verification
    const isValid = await verifyTransaction(transactionHash, amount);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction'
      });
    }
    
    // Create or update interaction record
    const result = await db.query(`
      INSERT INTO persona_interactions 
        (user_id, persona_id, transaction_hash, amount_paid, status, chat_unlocked)
      VALUES ($1, $2, $3, $4, 'confirmed', TRUE)
      ON CONFLICT (user_id, persona_id) 
      DO UPDATE SET 
        transaction_hash = $3,
        amount_paid = $4,
        status = 'confirmed',
        chat_unlocked = TRUE,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [userId, personaId, transactionHash, amount]);
    
    // Update persona total interactions
    await db.query(
      'UPDATE personas SET total_interactions = total_interactions + 1 WHERE id = $1',
      [personaId]
    );
    
    res.json({
      success: true,
      message: 'Payment verified! Chat unlocked',
      interaction: result.rows[0]
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
});

// POST /api/interaction/check-access - Check if user has access to persona
router.post('/check-access', authenticateToken, async (req, res) => {
  try {
    const { personaId } = req.body;
    const userId = req.user.id;
    
    const result = await db.query(
      'SELECT * FROM persona_interactions WHERE user_id = $1 AND persona_id = $2 AND chat_unlocked = TRUE',
      [userId, personaId]
    );
    
    res.json({
      success: true,
      hasAccess: result.rows.length > 0,
      interaction: result.rows[0] || null
    });
  } catch (error) {
    console.error('Error checking access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check access'
    });
  }
});

// POST /api/interaction/save-message - Save chat message
router.post('/save-message', authenticateToken, async (req, res) => {
  try {
    const { personaId, sender, message } = req.body;
    const userId = req.user.id;
    
    // Get interaction ID
    const interactionResult = await db.query(
      'SELECT id FROM persona_interactions WHERE user_id = $1 AND persona_id = $2',
      [userId, personaId]
    );
    
    if (interactionResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No active interaction found'
      });
    }
    
    const interactionId = interactionResult.rows[0].id;
    
    // Save message
    await db.query(
      'INSERT INTO chat_messages (interaction_id, sender, message) VALUES ($1, $2, $3)',
      [interactionId, sender, message]
    );
    
    // Update interaction stats
    await db.query(`
      UPDATE persona_interactions 
      SET interaction_count = interaction_count + 1,
          last_chat_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [interactionId]);
    
    res.json({
      success: true,
      message: 'Message saved'
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save message'
    });
  }
});

// Helper function to verify blockchain transaction
async function verifyTransaction(txHash, expectedAmount) {
  try {
    // In production, connect to actual blockchain
    // const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    // const tx = await provider.getTransaction(txHash);
    // const receipt = await provider.getTransactionReceipt(txHash);
    
    // For demo: simulate validation
    // Check if txHash format is valid
    if (!txHash || txHash.length < 10) {
      return false;
    }
    
    // In production: verify amount, recipient, confirmations
    return true;
  } catch (error) {
    console.error('Transaction verification error:', error);
    return false;
  }
}

module.exports = router;
