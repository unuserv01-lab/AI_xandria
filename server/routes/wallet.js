// ============================================
// Wallet Routes - Blockchain Wallet Integration
// ============================================

const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');

// ============================================
// POST /api/wallet/connect
// Register/update user wallet
// ============================================

router.post('/connect', async (req, res) => {
    try {
        const { walletAddress, signature, message } = req.body;
        
        if (!walletAddress) {
            return res.status(400).json({
                error: 'Missing wallet address'
            });
        }
        
        // Validate Ethereum address format
        if (!ethers.isAddress(walletAddress)) {
            return res.status(400).json({
                error: 'Invalid wallet address format'
            });
        }
        
        console.log(`🔗 Wallet connection: ${walletAddress}`);
        
        // Optional: Verify signature if provided
        if (signature && message) {
            try {
                const recoveredAddress = ethers.verifyMessage(message, signature);
                if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
                    return res.status(401).json({
                        error: 'Signature verification failed'
                    });
                }
                console.log(`✅ Signature verified`);
            } catch (error) {
                return res.status(401).json({
                    error: 'Invalid signature'
                });
            }
        }
        
        // Check if user exists
        const checkQuery = 'SELECT * FROM users WHERE wallet_address = $1';
        const existing = await global.db.query(checkQuery, [walletAddress.toLowerCase()]);
        
        let user;
        
        if (existing.rows.length === 0) {
            // Create new user
            const insertQuery = `
                INSERT INTO users (wallet_address, last_login)
                VALUES ($1, NOW())
                RETURNING *
            `;
            const result = await global.db.query(insertQuery, [walletAddress.toLowerCase()]);
            user = result.rows[0];
            console.log(`✅ New user created: ${walletAddress}`);
        } else {
            // Update last login
            const updateQuery = `
                UPDATE users
                SET last_login = NOW()
                WHERE wallet_address = $1
                RETURNING *
            `;
            const result = await global.db.query(updateQuery, [walletAddress.toLowerCase()]);
            user = result.rows[0];
            console.log(`✅ User login updated: ${walletAddress}`);
        }
        
        // Get user stats
        const statsQuery = `
            SELECT 
                COUNT(DISTINCT p.persona_id) as total_personas,
                COUNT(DISTINCT c.id) as total_chats,
                COUNT(DISTINCT n.id) as total_nfts
            FROM users u
            LEFT JOIN personas p ON u.wallet_address = p.owner_address
            LEFT JOIN chat_history c ON u.wallet_address = c.user_address
            LEFT JOIN nft_mints n ON u.wallet_address = n.owner_address
            WHERE u.wallet_address = $1
            GROUP BY u.wallet_address
        `;
        
        const statsResult = await global.db.query(statsQuery, [walletAddress.toLowerCase()]);
        const stats = statsResult.rows[0] || {
            total_personas: 0,
            total_chats: 0,
            total_nfts: 0
        };
        
        res.json({
            success: true,
            message: existing.rows.length === 0 ? 'User registered' : 'User connected',
            data: {
                walletAddress: user.wallet_address,
                username: user.username,
                avatar: user.avatar_url,
                bio: user.bio,
                isActive: user.is_active,
                stats: {
                    totalPersonas: parseInt(stats.total_personas),
                    totalChats: parseInt(stats.total_chats),
                    totalNFTs: parseInt(stats.total_nfts)
                },
                createdAt: user.created_at,
                lastLogin: user.last_login
            }
        });
        
    } catch (error) {
        console.error('❌ Error connecting wallet:', error);
        res.status(500).json({
            error: 'Failed to connect wallet',
            message: error.message
        });
    }
});

// ============================================
// GET /api/wallet/:address
// Get user profile by wallet address
// ============================================

router.get('/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        if (!ethers.isAddress(address)) {
            return res.status(400).json({
                error: 'Invalid wallet address'
            });
        }
        
        const query = `
            SELECT * FROM users WHERE wallet_address = $1
        `;
        
        const result = await global.db.query(query, [address.toLowerCase()]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        
        const user = result.rows[0];
        
        // Get user stats
        const statsQuery = `
            SELECT 
                COUNT(DISTINCT p.persona_id) as total_personas,
                COUNT(DISTINCT c.id) as total_chats,
                COUNT(DISTINCT n.id) as total_nfts
            FROM users u
            LEFT JOIN personas p ON u.wallet_address = p.owner_address
            LEFT JOIN chat_history c ON u.wallet_address = c.user_address
            LEFT JOIN nft_mints n ON u.wallet_address = n.owner_address
            WHERE u.wallet_address = $1
            GROUP BY u.wallet_address
        `;
        
        const statsResult = await global.db.query(statsQuery, [address.toLowerCase()]);
        const stats = statsResult.rows[0] || {
            total_personas: 0,
            total_chats: 0,
            total_nfts: 0
        };
        
        res.json({
            success: true,
            data: {
                walletAddress: user.wallet_address,
                username: user.username,
                avatar: user.avatar_url,
                bio: user.bio,
                isActive: user.is_active,
                stats: {
                    totalPersonas: parseInt(stats.total_personas),
                    totalChats: parseInt(stats.total_chats),
                    totalNFTs: parseInt(stats.total_nfts),
                    battlesWon: user.total_battles_won
                },
                createdAt: user.created_at,
                lastLogin: user.last_login
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching user:', error);
        res.status(500).json({
            error: 'Failed to fetch user',
            message: error.message
        });
    }
});

// ============================================
// PUT /api/wallet/:address/profile
// Update user profile
// ============================================

router.put('/:address/profile', async (req, res) => {
    try {
        const { address } = req.params;
        const { username, bio, avatarUrl } = req.body;
        
        if (!ethers.isAddress(address)) {
            return res.status(400).json({
                error: 'Invalid wallet address'
            });
        }
        
        // Build dynamic update query
        const updates = [];
        const values = [];
        let paramIndex = 1;
        
        if (username !== undefined) {
            updates.push(`username = $${paramIndex}`);
            values.push(username);
            paramIndex++;
        }
        
        if (bio !== undefined) {
            updates.push(`bio = $${paramIndex}`);
            values.push(bio);
            paramIndex++;
        }
        
        if (avatarUrl !== undefined) {
            updates.push(`avatar_url = $${paramIndex}`);
            values.push(avatarUrl);
            paramIndex++;
        }
        
        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No fields to update'
            });
        }
        
        updates.push(`updated_at = NOW()`);
        values.push(address.toLowerCase());
        
        const query = `
            UPDATE users
            SET ${updates.join(', ')}
            WHERE wallet_address = $${paramIndex}
            RETURNING *
        `;
        
        const result = await global.db.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'User not found'
            });
        }
        
        const user = result.rows[0];
        
        console.log(`✅ Profile updated: ${address}`);
        
        res.json({
            success: true,
            message: 'Profile updated',
            data: {
                walletAddress: user.wallet_address,
                username: user.username,
                avatar: user.avatar_url,
                bio: user.bio,
                updatedAt: user.updated_at
            }
        });
        
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        res.status(500).json({
            error: 'Failed to update profile',
            message: error.message
        });
    }
});

// ============================================
// GET /api/wallet/:address/personas
// Get all personas owned by wallet
// ============================================

router.get('/:address/personas', async (req, res) => {
    try {
        const { address } = req.params;
        const { limit = 20, offset = 0 } = req.query;
        
        if (!ethers.isAddress(address)) {
            return res.status(400).json({
                error: 'Invalid wallet address'
            });
        }
        
        const query = `
            SELECT * FROM personas
            WHERE owner_address = $1 AND is_active = true
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await global.db.query(query, [
            address.toLowerCase(),
            parseInt(limit),
            parseInt(offset)
        ]);
        
        res.json({
            success: true,
            data: result.rows.map(p => ({
                personaId: p.persona_id,
                name: p.name,
                description: p.description,
                category: p.category,
                imageUrl: p.image_url,
                isMinted: p.is_minted,
                tokenId: p.token_id,
                createdAt: p.created_at
            }))
        });
        
    } catch (error) {
        console.error('❌ Error fetching user personas:', error);
        res.status(500).json({
            error: 'Failed to fetch personas',
            message: error.message
        });
    }
});

module.exports = router;
