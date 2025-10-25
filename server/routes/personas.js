// ============================================
// Personas Routes - Gallery & Featured Personas
// Path: /api/personas/*
// ============================================
const express = require('express');
const router = express.Router();

// ============================================
// GET /api/personas/featured
// Get all featured personas for gallery
// ============================================
router.get('/featured', async (req, res) => {
  try {
    const { category, sort } = req.query;
    
    console.log(`🔍 Fetching featured personas - Category: ${category || 'all'}, Sort: ${sort || 'newest'}`);
    
    let query = `
      SELECT 
        persona_id as id,
        name,
        tagline,
        personality,
        description as backstory,
        image_url as avatar_url,
        price,
        category,
        traits,
        is_featured,
        rating,
        total_chats as total_interactions,
        created_at
      FROM personas 
      WHERE is_featured = TRUE AND is_active = TRUE
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Filter by category
    if (category && category !== '') {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    // Apply sorting
    if (sort === 'popular') {
      query += ' ORDER BY total_chats DESC, rating DESC';
    } else if (sort === 'price_low') {
      query += ' ORDER BY price ASC';
    } else if (sort === 'price_high') {
      query += ' ORDER BY price DESC';
    } else if (sort === 'rating') {
      query += ' ORDER BY rating DESC, total_chats DESC';
    } else {
      // Default: newest first
      query += ' ORDER BY created_at DESC';
    }
    
    const result = await global.db.query(query, params);
    
    console.log(`✅ Found ${result.rows.length} featured personas`);
    
    // Return in expected format
    res.json({
      success: true,
      personas: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching featured personas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch personas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// GET /api/personas/:id
// Get single persona detail
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Fetching persona: ${id}`);
    
    const result = await global.db.query(
      `SELECT 
        persona_id as id,
        name,
        tagline,
        personality,
        description as backstory,
        image_url as avatar_url,
        price,
        category,
        traits,
        rating,
        total_chats as total_interactions,
        is_featured,
        created_at
      FROM personas 
      WHERE persona_id = $1 OR id::text = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Persona not found'
      });
    }
    
    console.log(`✅ Persona found: ${result.rows[0].name}`);
    
    res.json({
      success: true,
      persona: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error fetching persona:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch persona',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// GET /api/personas/search
// Search personas by name or description
// ============================================
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    console.log(`🔍 Searching personas: "${q}"`);
    
    const query = `
      SELECT 
        persona_id as id,
        name,
        tagline,
        image_url as avatar_url,
        category,
        price,
        rating
      FROM personas 
      WHERE is_active = TRUE
        AND (
          name ILIKE $1 
          OR tagline ILIKE $1 
          OR description ILIKE $1
          OR category ILIKE $1
        )
      ORDER BY rating DESC
      LIMIT $2
    `;
    
    const result = await global.db.query(query, [`%${q}%`, parseInt(limit)]);
    
    console.log(`✅ Found ${result.rows.length} matching personas`);
    
    res.json({
      success: true,
      personas: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('❌ Error searching personas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search personas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
