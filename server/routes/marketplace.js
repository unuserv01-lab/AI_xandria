// ============================================
// Marketplace Routes - NFT Trading Platform
// ============================================

const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');

// ============================================
// GET /api/marketplace/list
// List all NFTs available in marketplace
// ============================================

router.get('/list', async (req, res) => {
    try {
        const { 
            category, 
            priceMin, 
            priceMax,
            sortBy = 'created_at',
            order = 'DESC',
            limit = 20, 
            offset = 0 
        } = req.query;
        
        let query = `
            SELECT 
                n.*,
                p.name,
                p.description,
                p.image_url,
                p.category,
                p.traits,
                p.stats,
                u.username as owner_username,
                u.avatar_url as owner_avatar
            FROM nft_mints n
            JOIN personas p ON n.persona_id = p.persona_id
            LEFT JOIN users u ON n.owner_address = u.wallet_address
            WHERE n.is_listed = true
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (category) {
            query += ` AND p.category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }
        
        if (priceMin) {
            query += ` AND n.listing_price >= $${paramIndex}`;
            params.push(parseFloat(priceMin));
            paramIndex++;
        }
        
        if (priceMax) {
            query += ` AND n.listing_price <= $${paramIndex}`;
            params.push(parseFloat(priceMax));
            paramIndex++;
        }
        
        // Sorting
        const allowedSort = ['created_at', 'listing_price', 'minted_at'];
        const sortColumn = allowedSort.includes(sortBy) ? `n.${sortBy}` : 'n.created_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        
        query += ` ORDER BY ${sortColumn} ${sortOrder}`;
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await global.db.query(query, params);
        
        // Get total count
        let countQuery = `
            SELECT COUNT(*) 
            FROM nft_mints n
            JOIN personas p ON n.persona_id = p.persona_id
            WHERE n.is_listed = true
        `;
        
        if (category) {
            countQuery += ` AND p.category = '${category}'`;
        }
        
        const countResult = await global.db.query(countQuery);
        const totalCount = parseInt(countResult.rows[0].count);
        
        res.json({
            success: true,
            data: result.rows.map(item => ({
                tokenId: item.token_id,
                contractAddress: item.contract_address,
                personaId: item.persona_id,
                name: item.name,
                description: item.description,
                imageUrl: item.image_url,
                category: item.category,
                traits: item.traits,
                stats: item.stats,
                listingPrice: parseFloat(item.listing_price),
                royaltyPercentage: parseFloat(item.royalty_percentage),
                owner: {
                    address: item.owner_address,
                    username: item.owner_username,
                    avatar: item.owner_avatar
                },
                metadataUri: item.metadata_uri,
                mintedAt: item.minted_at,
                listedAt: item.listed_at
            })),
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching marketplace listings:', error);
        res.status(500).json({
            error: 'Failed to fetch marketplace listings',
            message: error.message
        });
    }
});

// ============================================
// GET /api/marketplace/nft/:tokenId
// Get specific NFT details
// ============================================

router.get('/nft/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;
        const { contractAddress } = req.query;
        
        if (!contractAddress) {
            return res.status(400).json({
                error: 'Contract address is required'
            });
        }
        
        const query = `
            SELECT 
                n.*,
                p.name,
                p.description,
                p.image_url,
                p.category,
                p.traits,
                p.stats,
                p.personality,
                u.username as owner_username,
                u.avatar_url as owner_avatar
            FROM nft_mints n
            JOIN personas p ON n.persona_id = p.persona_id
            LEFT JOIN users u ON n.owner_address = u.wallet_address
            WHERE n.token_id = $1 AND n.contract_address = $2
        `;
        
        const result = await global.db.query(query, [
            parseInt(tokenId),
            contractAddress.toLowerCase()
        ]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'NFT not found'
            });
        }
        
        const nft = result.rows[0];
        
        res.json({
            success: true,
            data: {
                tokenId: nft.token_id,
                contractAddress: nft.contract_address,
                personaId: nft.persona_id,
                name: nft.name,
                description: nft.description,
                imageUrl: nft.image_url,
                category: nft.category,
                traits: nft.traits,
                stats: nft.stats,
                personality: nft.personality,
                isListed: nft.is_listed,
                listingPrice: nft.listing_price ? parseFloat(nft.listing_price) : null,
                royaltyPercentage: parseFloat(nft.royalty_percentage),
                owner: {
                    address: nft.owner_address,
                    username: nft.owner_username,
                    avatar: nft.owner_avatar
                },
                metadataUri: nft.metadata_uri,
                txHash: nft.tx_hash,
                blockNumber: nft.block_number,
                mintedAt: nft.minted_at,
                listedAt: nft.listed_at
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching NFT details:', error);
        res.status(500).json({
            error: 'Failed to fetch NFT details',
            message: error.message
        });
    }
});

// ============================================
// POST /api/marketplace/list/:tokenId
// List NFT for sale
// ============================================

router.post('/list/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;
        const { contractAddress, price, ownerAddress } = req.body;
        
        if (!contractAddress || !price || !ownerAddress) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['contractAddress', 'price', 'ownerAddress']
            });
        }
        
        // Verify ownership
        const checkQuery = `
            SELECT * FROM nft_mints 
            WHERE token_id = $1 
            AND contract_address = $2 
            AND owner_address = $3
        `;
        
        const checkResult = await global.db.query(checkQuery, [
            parseInt(tokenId),
            contractAddress.toLowerCase(),
            ownerAddress.toLowerCase()
        ]);
        
        if (checkResult.rows.length === 0) {
            return res.status(403).json({
                error: 'Unauthorized: You do not own this NFT'
            });
        }
        
        // Update listing
        const updateQuery = `
            UPDATE nft_mints
            SET 
                is_listed = true,
                listing_price = $1,
                listed_at = NOW()
            WHERE token_id = $2 AND contract_address = $3
            RETURNING *
        `;
        
        const result = await global.db.query(updateQuery, [
            parseFloat(price),
            parseInt(tokenId),
            contractAddress.toLowerCase()
        ]);
        
        console.log(`✅ NFT listed: Token ID ${tokenId} for ${price} STM`);
        
        res.json({
            success: true,
            message: 'NFT listed successfully',
            data: {
                tokenId: result.rows[0].token_id,
                contractAddress: result.rows[0].contract_address,
                listingPrice: parseFloat(result.rows[0].listing_price),
                listedAt: result.rows[0].listed_at
            }
        });
        
    } catch (error) {
        console.error('❌ Error listing NFT:', error);
        res.status(500).json({
            error: 'Failed to list NFT',
            message: error.message
        });
    }
});

// ============================================
// POST /api/marketplace/delist/:tokenId
// Remove NFT from marketplace
// ============================================

router.post('/delist/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;
        const { contractAddress, ownerAddress } = req.body;
        
        if (!contractAddress || !ownerAddress) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['contractAddress', 'ownerAddress']
            });
        }
        
        // Verify ownership
        const checkQuery = `
            SELECT * FROM nft_mints 
            WHERE token_id = $1 
            AND contract_address = $2 
            AND owner_address = $3
            AND is_listed = true
        `;
        
        const checkResult = await global.db.query(checkQuery, [
            parseInt(tokenId),
            contractAddress.toLowerCase(),
            ownerAddress.toLowerCase()
        ]);
        
        if (checkResult.rows.length === 0) {
            return res.status(403).json({
                error: 'Unauthorized or NFT not listed'
            });
        }
        
        // Update listing
        const updateQuery = `
            UPDATE nft_mints
            SET 
                is_listed = false,
                listing_price = NULL,
                listed_at = NULL
            WHERE token_id = $1 AND contract_address = $2
            RETURNING *
        `;
        
        await global.db.query(updateQuery, [
            parseInt(tokenId),
            contractAddress.toLowerCase()
        ]);
        
        console.log(`✅ NFT delisted: Token ID ${tokenId}`);
        
        res.json({
            success: true,
            message: 'NFT delisted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error delisting NFT:', error);
        res.status(500).json({
            error: 'Failed to delist NFT',
            message: error.message
        });
    }
});

// ============================================
// GET /api/marketplace/stats
// Get marketplace statistics
// ============================================

router.get('/stats', async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_listed,
                AVG(listing_price) as avg_price,
                MIN(listing_price) as floor_price,
                MAX(listing_price) as highest_price,
                SUM(listing_price) as total_value
            FROM nft_mints
            WHERE is_listed = true
        `;
        
        const result = await global.db.query(statsQuery);
        const stats = result.rows[0];
        
        // Get category breakdown
        const categoryQuery = `
            SELECT 
                p.category,
                COUNT(*) as count,
                AVG(n.listing_price) as avg_price
            FROM nft_mints n
            JOIN personas p ON n.persona_id = p.persona_id
            WHERE n.is_listed = true
            GROUP BY p.category
        `;
        
        const categoryResult = await global.db.query(categoryQuery);
        
        res.json({
            success: true,
            data: {
                totalListed: parseInt(stats.total_listed),
                avgPrice: parseFloat(stats.avg_price) || 0,
                floorPrice: parseFloat(stats.floor_price) || 0,
                highestPrice: parseFloat(stats.highest_price) || 0,
                totalValue: parseFloat(stats.total_value) || 0,
                byCategory: categoryResult.rows.map(c => ({
                    category: c.category,
                    count: parseInt(c.count),
                    avgPrice: parseFloat(c.avg_price)
                }))
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching marketplace stats:', error);
        res.status(500).json({
            error: 'Failed to fetch marketplace stats',
            message: error.message
        });
    }
});

// ============================================
// GET /api/marketplace/user/:address
// Get user's NFT collection
// ============================================

router.get('/user/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const { limit = 20, offset = 0 } = req.query;
        
        if (!ethers.isAddress(address)) {
            return res.status(400).json({
                error: 'Invalid wallet address'
            });
        }
        
        const query = `
            SELECT 
                n.*,
                p.name,
                p.description,
                p.image_url,
                p.category,
                p.traits
            FROM nft_mints n
            JOIN personas p ON n.persona_id = p.persona_id
            WHERE n.owner_address = $1
            ORDER BY n.minted_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await global.db.query(query, [
            address.toLowerCase(),
            parseInt(limit),
            parseInt(offset)
        ]);
        
        res.json({
            success: true,
            data: result.rows.map(item => ({
                tokenId: item.token_id,
                contractAddress: item.contract_address,
                personaId: item.persona_id,
                name: item.name,
                description: item.description,
                imageUrl: item.image_url,
                category: item.category,
                traits: item.traits,
                isListed: item.is_listed,
                listingPrice: item.listing_price ? parseFloat(item.listing_price) : null,
                metadataUri: item.metadata_uri,
                mintedAt: item.minted_at
            }))
        });
        
    } catch (error) {
        console.error('❌ Error fetching user NFTs:', error);
        res.status(500).json({
            error: 'Failed to fetch user NFTs',
            message: error.message
        });
    }
});

module.exports = router;
