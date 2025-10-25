// server/routes/persona.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/persona/featured - Get all featured personas
router.get('/featured', async (req, res) => {
  try {
    const { category, sort } = req.query;
    
    let query = 'SELECT * FROM personas WHERE is_featured = TRUE';
    const params = [];
    
    if (category) {
      query += ' AND category = $1';
      params.push(category);
    }
    
    // Sorting options
    if (sort === 'popular') {
      query += ' ORDER BY total_interactions DESC';
    } else if (sort === 'price_low') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'price_high') {
      query += ' ORDER BY price DESC';
    } else if (sort === 'rating') {
      query += ' ORDER BY rating DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      personas: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personas'
    });
  }
});

// GET /api/persona/:id - Get single persona detail
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT * FROM personas WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Persona not found'
      });
    }
    
    res.json({
      success: true,
      persona: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching persona:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch persona'
    });
  }
});

// POST /api/persona/generate - Generate custom persona (existing)
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.id;
    
    // Call AI API (Deepseek/Gemini) untuk generate persona
    // ... existing generate logic ...
    
    res.json({
      success: true,
      message: 'Persona generated successfully'
    });
  } catch (error) {
    console.error('Error generating persona:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate persona'
    });
  }
});

// GET /api/persona/my-interactions - Get user's unlocked personas
router.get('/my-interactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(`
      SELECT 
        p.*,
        pi.chat_unlocked,
        pi.interaction_count,
        pi.last_chat_at,
        pi.amount_paid
      FROM personas p
      INNER JOIN persona_interactions pi ON p.id = pi.persona_id
      WHERE pi.user_id = $1 AND pi.chat_unlocked = TRUE
      ORDER BY pi.last_chat_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      interactions: result.rows
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interactions'
    });
  }
});

// POST /api/persona/:id/rate - Rate a persona
router.post('/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    
    // Check if user has unlocked this persona
    const hasAccess = await db.query(
      'SELECT * FROM persona_interactions WHERE user_id = $1 AND persona_id = $2 AND chat_unlocked = TRUE',
      [userId, id]
    );
    
    if (hasAccess.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You must unlock this persona before rating'
      });
    }
    
    // Insert or update review
    await db.query(`
      INSERT INTO persona_reviews (user_id, persona_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, persona_id) 
      DO UPDATE SET rating = $3, comment = $4
    `, [userId, id, rating, comment]);
    
    // Update persona average rating
    const avgResult = await db.query(
      'SELECT AVG(rating) as avg_rating FROM persona_reviews WHERE persona_id = $1',
      [id]
    );
    
    await db.query(
      'UPDATE personas SET rating = $1 WHERE id = $2',
      [avgResult.rows[0].avg_rating, id]
    );
    
    res.json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('Error rating persona:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating'
    });
  }
});

module.exports = router;
