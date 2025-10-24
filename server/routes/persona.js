// ============================================
// Persona Routes - AI Persona Generation & Management
// ============================================

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const aiClient = require('../utils/ai-client');
const ipfsUpload = require('../utils/ipfs-upload');
const freepikClient = require('../utils/freepik-client');

// ============================================
// POST /api/persona/generate
// Generate new AI persona from user prompt
// ============================================

router.post('/generate', async (req, res) => {
    try {
        const { prompt, walletAddress, category } = req.body;
        
        // Validate input
        if (!prompt || !walletAddress) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['prompt', 'walletAddress']
            });
        }
        
        console.log(`🎨 Generating persona for: ${walletAddress}`);
        console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
        
        // Step 1: Generate persona with AI
        const aiPersona = await aiClient.generatePersona(prompt, category);
        console.log(`✅ AI generated persona: ${aiPersona.name}`);
        
        // Step 2: Generate/fetch image
        let imageUrl;
        try {
            imageUrl = await freepikClient.generateImage(aiPersona.visualPrompt);
            console.log(`✅ Image generated: ${imageUrl}`);
        } catch (imgError) {
            console.warn('⚠️ Image generation failed, using fallback');
            imageUrl = process.env.FALLBACK_IMAGE_URL || 'https://via.placeholder.com/512x512';
        }
        
        // Step 3: Build NFT metadata
        const personaId = uuidv4();
        const metadata = {
            name: aiPersona.name,
            description: aiPersona.description,
            image: imageUrl,
            external_url: `https://aixandria.com/persona/${personaId}`,
            attributes: aiPersona.traits.map(t => ({
                trait_type: t.category,
                value: t.value,
                display_type: t.displayType || 'string'
            })),
            properties: {
                category: category || 'custom',
                personality: aiPersona.personality,
                created_by: walletAddress,
                created_at: new Date().toISOString(),
                generation_model: aiPersona.model,
                rarity: calculateRarity(aiPersona.traits)
            }
        };
        
        // Step 4: Upload to IPFS
        let ipfsResult;
        try {
            ipfsResult = await ipfsUpload.uploadJSON(metadata);
            console.log(`✅ Uploaded to IPFS: ${ipfsResult.hash}`);
        } catch (ipfsError) {
            console.error('❌ IPFS upload failed:', ipfsError.message);
            // Continue without IPFS if it fails
            ipfsResult = { hash: null, uri: null };
        }
        
        // Step 5: Store in database
        const insertQuery = `
            INSERT INTO personas (
                persona_id, owner_address, name, description, category,
                image_url, ipfs_hash, metadata_uri, personality, traits,
                generation_prompt, ai_model_used, stats
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;
        
        const stats = {
            total_chats: 0,
            total_battles: 0,
            battle_wins: 0,
            rating: 0.0,
            popularity_score: 0
        };
        
        const result = await global.db.query(insertQuery, [
            personaId,
            walletAddress,
            aiPersona.name,
            aiPersona.description,
            category || 'custom',
            imageUrl,
            ipfsResult.hash,
            ipfsResult.uri ? `ipfs://${ipfsResult.hash}` : null,
            JSON.stringify(aiPersona.personality),
            JSON.stringify(aiPersona.traits),
            prompt,
            aiPersona.model,
            JSON.stringify(stats)
        ]);
        
        console.log(`✅ Persona saved to database: ${personaId}`);
        
        // Step 6: Return to frontend
        res.status(201).json({
            success: true,
            message: 'Persona generated successfully',
            data: {
                personaId: personaId,
                name: aiPersona.name,
                description: aiPersona.description,
                imageUrl: imageUrl,
                category: category || 'custom',
                traits: aiPersona.traits,
                personality: aiPersona.personality,
                ipfsHash: ipfsResult.hash,
                metadataUri: ipfsResult.uri ? `ipfs://${ipfsResult.hash}` : null,
                createdAt: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Error generating persona:', error);
        res.status(500).json({
            error: 'Failed to generate persona',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// ============================================
// GET /api/persona/:id
// Get persona details
// ============================================

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT p.*, u.username as owner_username
            FROM personas p
            LEFT JOIN users u ON p.owner_address = u.wallet_address
            WHERE p.persona_id = $1
        `;
        
        const result = await global.db.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Persona not found',
                personaId: id
            });
        }
        
        const persona = result.rows[0];
        
        res.json({
            success: true,
            data: {
                personaId: persona.persona_id,
                name: persona.name,
                description: persona.description,
                category: persona.category,
                imageUrl: persona.image_url,
                traits: persona.traits,
                personality: persona.personality,
                stats: persona.stats,
                isMinted: persona.is_minted,
                tokenId: persona.token_id,
                metadataUri: persona.metadata_uri,
                owner: {
                    address: persona.owner_address,
                    username: persona.owner_username
                },
                createdAt: persona.created_at
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching persona:', error);
        res.status(500).json({
            error: 'Failed to fetch persona',
            message: error.message
        });
    }
});

// ============================================
// GET /api/persona/list
// List personas with filters
// ============================================

router.get('/list', async (req, res) => {
    try {
        const { 
            category, 
            owner, 
            minted, 
            featured,
            limit = 20, 
            offset = 0,
            sortBy = 'created_at',
            order = 'DESC'
        } = req.query;
        
        let query = `
            SELECT p.*, u.username as owner_username
            FROM personas p
            LEFT JOIN users u ON p.owner_address = u.wallet_address
            WHERE p.is_active = true
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (category) {
            query += ` AND p.category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }
        
        if (owner) {
            query += ` AND p.owner_address = $${paramIndex}`;
            params.push(owner);
            paramIndex++;
        }
        
        if (minted !== undefined) {
            query += ` AND p.is_minted = $${paramIndex}`;
            params.push(minted === 'true');
            paramIndex++;
        }
        
        if (featured !== undefined) {
            query += ` AND p.is_featured = $${paramIndex}`;
            params.push(featured === 'true');
            paramIndex++;
        }
        
        // Sorting
        const allowedSort = ['created_at', 'rating', 'total_chats', 'total_battles', 'name'];
        const sortColumn = allowedSort.includes(sortBy) ? sortBy : 'created_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        
        query += ` ORDER BY p.${sortColumn} ${sortOrder}`;
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await global.db.query(query, params);
        
        // Get total count
        let countQuery = `SELECT COUNT(*) FROM personas WHERE is_active = true`;
        const countParams = [];
        
        if (category) {
            countQuery += ` AND category = $1`;
            countParams.push(category);
        }
        
        const countResult = await global.db.query(countQuery, countParams);
        const totalCount = parseInt(countResult.rows[0].count);
        
        res.json({
            success: true,
            data: result.rows.map(p => ({
                personaId: p.persona_id,
                name: p.name,
                description: p.description,
                category: p.category,
                imageUrl: p.image_url,
                traits: p.traits,
                stats: p.stats,
                isMinted: p.is_minted,
                isFeatured: p.is_featured,
                owner: {
                    address: p.owner_address,
                    username: p.owner_username
                },
                createdAt: p.created_at
            })),
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
            }
        });
        
    } catch (error) {
        console.error('❌ Error listing personas:', error);
        res.status(500).json({
            error: 'Failed to list personas',
            message: error.message
        });
    }
});

// ============================================
// POST /api/persona/:id/mint
// Update persona after NFT minting
// ============================================

router.post('/:id/mint', async (req, res) => {
    try {
        const { id } = req.params;
        const { tokenId, txHash, contractAddress } = req.body;
        
        if (!tokenId || !txHash || !contractAddress) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['tokenId', 'txHash', 'contractAddress']
            });
        }
        
        const query = `
            UPDATE personas
            SET 
                is_minted = true,
                token_id = $1,
                mint_tx_hash = $2,
                contract_address = $3,
                minted_at = NOW()
            WHERE persona_id = $4
            RETURNING *
        `;
        
        const result = await global.db.query(query, [tokenId, txHash, contractAddress, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Persona not found'
            });
        }
        
        // Also insert into nft_mints table
        const mintQuery = `
            INSERT INTO nft_mints (persona_id, owner_address, token_id, contract_address, tx_hash, metadata_uri)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        
        const persona = result.rows[0];
        await global.db.query(mintQuery, [
            id,
            persona.owner_address,
            tokenId,
            contractAddress,
            txHash,
            persona.metadata_uri
        ]);
        
        console.log(`✅ Persona minted: ${id} (Token ID: ${tokenId})`);
        
        res.json({
            success: true,
            message: 'Persona minted successfully',
            data: {
                personaId: id,
                tokenId: tokenId,
                txHash: txHash,
                contractAddress: contractAddress,
                mintedAt: persona.minted_at
            }
        });
        
    } catch (error) {
        console.error('❌ Error updating mint status:', error);
        res.status(500).json({
            error: 'Failed to update mint status',
            message: error.message
        });
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateRarity(traits) {
    // Simple rarity calculation based on trait values
    const avgValue = traits.reduce((sum, t) => sum + (t.value || 50), 0) / traits.length;
    
    if (avgValue >= 90) return 'Legendary';
    if (avgValue >= 80) return 'Epic';
    if (avgValue >= 70) return 'Rare';
    if (avgValue >= 60) return 'Uncommon';
    return 'Common';
}

module.exports = router;
