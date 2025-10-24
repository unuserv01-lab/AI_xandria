// ============================================
// Battle Routes - Persona Battle Arena
// ============================================

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// ============================================
// POST /api/battle/create
// Create new battle between two personas
// ============================================

router.post('/create', async (req, res) => {
    try {
        const { persona1Id, persona2Id, topic, category } = req.body;
        
        if (!persona1Id || !persona2Id) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['persona1Id', 'persona2Id']
            });
        }
        
        if (persona1Id === persona2Id) {
            return res.status(400).json({
                error: 'Cannot battle same persona'
            });
        }
        
        // Verify both personas exist
        const personasQuery = `
            SELECT persona_id, name, image_url, traits 
            FROM personas 
            WHERE persona_id IN ($1, $2) AND is_active = true
        `;
        
        const personasResult = await global.db.query(personasQuery, [persona1Id, persona2Id]);
        
        if (personasResult.rows.length !== 2) {
            return res.status(404).json({
                error: 'One or both personas not found'
            });
        }
        
        const battleId = uuidv4();
        
        console.log(`⚔️ Creating battle: ${battleId}`);
        console.log(`   Persona 1: ${persona1Id}`);
        console.log(`   Persona 2: ${persona2Id}`);
        
        // Return battle data (votes will be stored separately)
        res.status(201).json({
            success: true,
            message: 'Battle created',
            data: {
                battleId: battleId,
                topic: topic || 'General Battle',
                category: category || 'general',
                personas: personasResult.rows.map(p => ({
                    personaId: p.persona_id,
                    name: p.name,
                    imageUrl: p.image_url,
                    traits: p.traits
                })),
                createdAt: new Date().toISOString(),
                status: 'active'
            }
        });
        
    } catch (error) {
        console.error('❌ Error creating battle:', error);
        res.status(500).json({
            error: 'Failed to create battle',
            message: error.message
        });
    }
});

// ============================================
// POST /api/battle/:battleId/vote
// Cast vote in battle
// ============================================

router.post('/:battleId/vote', async (req, res) => {
    try {
        const { battleId } = req.params;
        const { personaId, opponentId, voterAddress, voteWeight, reason } = req.body;
        
        if (!personaId || !voterAddress) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['personaId', 'voterAddress']
            });
        }
        
        console.log(`🗳️ Vote cast in battle: ${battleId} for persona: ${personaId}`);
        
        // Check if user already voted in this battle
        const checkQuery = `
            SELECT id FROM battle_votes
            WHERE battle_id = $1 AND voter_address = $2
        `;
        
        const existing = await global.db.query(checkQuery, [battleId, voterAddress.toLowerCase()]);
        
        if (existing.rows.length > 0) {
            return res.status(400).json({
                error: 'Already voted in this battle'
            });
        }
        
        // Insert vote
        const insertQuery = `
            INSERT INTO battle_votes (
                battle_id, persona_id, opponent_id, voter_address,
                vote_weight, vote_reason
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const result = await global.db.query(insertQuery, [
            battleId,
            personaId,
            opponentId || null,
            voterAddress.toLowerCase(),
            voteWeight || 1,
            reason || null
        ]);
        
        // Update persona battle stats
        await global.db.query(
            'UPDATE personas SET total_battles = total_battles + 1 WHERE persona_id = $1',
            [personaId]
        );
        
        console.log(`✅ Vote recorded`);
        
        res.json({
            success: true,
            message: 'Vote recorded',
            data: {
                voteId: result.rows[0].id,
                battleId: battleId,
                personaId: personaId,
                voterAddress: voterAddress,
                voteWeight: voteWeight || 1,
                timestamp: result.rows[0].created_at
            }
        });
        
    } catch (error) {
        console.error('❌ Error casting vote:', error);
        res.status(500).json({
            error: 'Failed to cast vote',
            message: error.message
        });
    }
});

// ============================================
// GET /api/battle/:battleId/results
// Get battle results and vote counts
// ============================================

router.get('/:battleId/results', async (req, res) => {
    try {
        const { battleId } = req.params;
        
        const query = `
            SELECT 
                persona_id,
                COUNT(*) as vote_count,
                SUM(vote_weight) as total_weight
            FROM battle_votes
            WHERE battle_id = $1
            GROUP BY persona_id
            ORDER BY total_weight DESC
        `;
        
        const result = await global.db.query(query, [battleId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'No votes found for this battle'
            });
        }
        
        // Get persona details
        const personaIds = result.rows.map(r => r.persona_id);
        const personasQuery = `
            SELECT persona_id, name, image_url 
            FROM personas 
            WHERE persona_id = ANY($1)
        `;
        
        const personasResult = await global.db.query(personasQuery, [personaIds]);
        const personasMap = {};
        personasResult.rows.forEach(p => {
            personasMap[p.persona_id] = p;
        });
        
        const results = result.rows.map(r => ({
            personaId: r.persona_id,
            name: personasMap[r.persona_id]?.name,
            imageUrl: personasMap[r.persona_id]?.image_url,
            voteCount: parseInt(r.vote_count),
            totalWeight: parseInt(r.total_weight)
        }));
        
        // Determine winner
        const winner = results[0];
        
        // Update winner's battle_wins count
        if (winner) {
            await global.db.query(
                'UPDATE personas SET battle_wins = battle_wins + 1 WHERE persona_id = $1',
                [winner.personaId]
            );
        }
        
        res.json({
            success: true,
            data: {
                battleId: battleId,
                totalVotes: results.reduce((sum, r) => sum + r.voteCount, 0),
                results: results,
                winner: winner
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching battle results:', error);
        res.status(500).json({
            error: 'Failed to fetch battle results',
            message: error.message
        });
    }
});

// ============================================
// GET /api/battle/active
// List active battles
// ============================================

router.get('/active', async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        
        // Get unique battle IDs with recent activity
        const query = `
            SELECT DISTINCT 
                battle_id,
                battle_topic,
                battle_category,
                MAX(created_at) as last_activity
            FROM battle_votes
            WHERE created_at > NOW() - INTERVAL '7 days'
            GROUP BY battle_id, battle_topic, battle_category
            ORDER BY last_activity DESC
            LIMIT $1 OFFSET $2
        `;
        
        const result = await global.db.query(query, [
            parseInt(limit),
            parseInt(offset)
        ]);
        
        // Get vote counts for each battle
        const battles = await Promise.all(result.rows.map(async (battle) => {
            const votesQuery = `
                SELECT 
                    persona_id,
                    COUNT(*) as votes
                FROM battle_votes
                WHERE battle_id = $1
                GROUP BY persona_id
            `;
            
            const votesResult = await global.db.query(votesQuery, [battle.battle_id]);
            
            // Get persona details
            const personaIds = votesResult.rows.map(v => v.persona_id);
            const personasQuery = `
                SELECT persona_id, name, image_url
                FROM personas
                WHERE persona_id = ANY($1)
            `;
            
            const personasResult = await global.db.query(personasQuery, [personaIds]);
            
            return {
                battleId: battle.battle_id,
                topic: battle.battle_topic,
                category: battle.battle_category,
                lastActivity: battle.last_activity,
                totalVotes: votesResult.rows.reduce((sum, v) => sum + parseInt(v.votes), 0),
                personas: personasResult.rows.map((p, i) => ({
                    personaId: p.persona_id,
                    name: p.name,
                    imageUrl: p.image_url,
                    votes: parseInt(votesResult.rows[i]?.votes || 0)
                }))
            };
        }));
        
        res.json({
            success: true,
            data: battles,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching active battles:', error);
        res.status(500).json({
            error: 'Failed to fetch active battles',
            message: error.message
        });
    }
});

// ============================================
// GET /api/battle/leaderboard
// Get battle leaderboard
// ============================================

router.get('/leaderboard', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        
        const query = `
            SELECT 
                p.persona_id,
                p.name,
                p.image_url,
                p.category,
                p.total_battles,
                p.battle_wins,
                CASE 
                    WHEN p.total_battles > 0 
                    THEN ROUND((p.battle_wins::decimal / p.total_battles * 100), 2)
                    ELSE 0
                END as win_rate,
                p.rating
            FROM personas p
            WHERE p.is_active = true AND p.total_battles > 0
            ORDER BY p.battle_wins DESC, p.rating DESC
            LIMIT $1
        `;
        
        const result = await global.db.query(query, [parseInt(limit)]);
        
        res.json({
            success: true,
            data: result.rows.map((p, index) => ({
                rank: index + 1,
                personaId: p.persona_id,
                name: p.name,
                imageUrl: p.image_url,
                category: p.category,
                totalBattles: p.total_battles,
                wins: p.battle_wins,
                winRate: parseFloat(p.win_rate),
                rating: parseFloat(p.rating)
            }))
        });
        
    } catch (error) {
        console.error('❌ Error fetching leaderboard:', error);
        res.status(500).json({
            error: 'Failed to fetch leaderboard',
            message: error.message
        });
    }
});

// ============================================
// GET /api/battle/persona/:personaId/history
// Get battle history for specific persona
// ============================================

router.get('/persona/:personaId/history', async (req, res) => {
    try {
        const { personaId } = req.params;
        const { limit = 20, offset = 0 } = req.query;
        
        const query = `
            SELECT 
                battle_id,
                battle_topic,
                battle_category,
                COUNT(*) as votes_received,
                MAX(created_at) as battle_date
            FROM battle_votes
            WHERE persona_id = $1
            GROUP BY battle_id, battle_topic, battle_category
            ORDER BY battle_date DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await global.db.query(query, [
            personaId,
            parseInt(limit),
            parseInt(offset)
        ]);
        
        res.json({
            success: true,
            data: result.rows.map(b => ({
                battleId: b.battle_id,
                topic: b.battle_topic,
                category: b.battle_category,
                votesReceived: parseInt(b.votes_received),
                battleDate: b.battle_date
            })),
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching battle history:', error);
        res.status(500).json({
            error: 'Failed to fetch battle history',
            message: error.message
        });
    }
});

module.exports = router;
