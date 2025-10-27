-- AI_xandria PostgreSQL Database Schema
-- Version: 1.0
-- Description: Complete database schema for AI persona platform

-- ============================================
-- DROP EXISTING TABLES (for clean migration)
-- ============================================

DROP TABLE IF EXISTS battle_votes CASCADE;
DROP TABLE IF EXISTS chat_history CASCADE;
DROP TABLE IF EXISTS nft_mints CASCADE;
DROP TABLE IF EXISTS personas CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- ENABLE EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50),
    email VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    total_personas INTEGER DEFAULT 0,
    total_battles_won INTEGER DEFAULT 0
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_created ON users(created_at DESC);

-- ============================================
-- PERSONAS TABLE
-- ============================================

CREATE TABLE personas (
    id SERIAL PRIMARY KEY,
    persona_id VARCHAR(255) UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
    owner_address VARCHAR(42) NOT NULL,
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'content_creator', 'academic', 'custom'
    subcategory VARCHAR(50), -- 'unuser', 'solara', 'einstein', etc.
    
    -- Visual Assets
    image_url TEXT,
    avatar_url TEXT,
    background_color VARCHAR(7) DEFAULT '#000000',
    
    -- IPFS & Blockchain
    ipfs_hash VARCHAR(255),
    metadata_uri TEXT,
    token_id INTEGER,
    contract_address VARCHAR(42),
    is_minted BOOLEAN DEFAULT false,
    mint_tx_hash VARCHAR(66),
    minted_at TIMESTAMP,
    
    -- Personality Data (JSONB for flexible storage)
    personality JSONB NOT NULL, -- { tone, style, expertise, traits, etc. }
    traits JSONB, -- [{ trait_type: "Creativity", value: 95 }, ...]
    stats JSONB, -- { battles_won, total_chats, rating, etc. }
    
    -- AI Generation Metadata
    generation_prompt TEXT,
    ai_model_used VARCHAR(50), -- 'deepseek', 'gemini', 'openrouter'
    generation_timestamp TIMESTAMP DEFAULT NOW(),
    
    -- Engagement Metrics
    total_chats INTEGER DEFAULT 0,
    total_battles INTEGER DEFAULT 0,
    battle_wins INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    popularity_score INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_personas_owner ON personas(owner_address);
CREATE INDEX idx_personas_category ON personas(category);
CREATE INDEX idx_personas_created ON personas(created_at DESC);
CREATE INDEX idx_personas_minted ON personas(is_minted);
CREATE INDEX idx_personas_featured ON personas(is_featured);
CREATE INDEX idx_personas_rating ON personas(rating DESC);
CREATE INDEX idx_personas_personality ON personas USING GIN(personality);

-- Full-text search index
CREATE INDEX idx_personas_name_search ON personas USING gin(to_tsvector('english', name));
CREATE INDEX idx_personas_description_search ON personas USING gin(to_tsvector('english', description));

-- ============================================
-- CHAT HISTORY TABLE
-- ============================================

CREATE TABLE chat_history (
    id SERIAL PRIMARY KEY,
    chat_id VARCHAR(255) NOT NULL DEFAULT gen_random_uuid()::text,
    persona_id VARCHAR(255) REFERENCES personas(persona_id) ON DELETE CASCADE,
    user_address VARCHAR(42) NOT NULL,
    
    -- Message Content
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'voice', 'command'
    
    -- Context & Metadata
    conversation_context JSONB, -- Previous messages context
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    tokens_used INTEGER,
    
    -- AI Model Info
    ai_model VARCHAR(50),
    response_time_ms INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_persona ON chat_history(persona_id);
CREATE INDEX idx_chat_user ON chat_history(user_address);
CREATE INDEX idx_chat_created ON chat_history(created_at DESC);
CREATE INDEX idx_chat_conversation ON chat_history(chat_id);

-- ============================================
-- BATTLE VOTES TABLE
-- ============================================

CREATE TABLE battle_votes (
    id SERIAL PRIMARY KEY,
    battle_id VARCHAR(255) NOT NULL,
    persona_id VARCHAR(255) REFERENCES personas(persona_id) ON DELETE CASCADE,
    opponent_id VARCHAR(255) REFERENCES personas(persona_id) ON DELETE CASCADE,
    voter_address VARCHAR(42) NOT NULL,
    
    -- Vote Details
    vote_weight INTEGER DEFAULT 1,
    vote_reason TEXT,
    
    -- Battle Context
    battle_topic VARCHAR(255),
    battle_category VARCHAR(50),
    round_number INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Prevent duplicate votes
    UNIQUE(battle_id, voter_address)
);

CREATE INDEX idx_votes_battle ON battle_votes(battle_id);
CREATE INDEX idx_votes_persona ON battle_votes(persona_id);
CREATE INDEX idx_votes_voter ON battle_votes(voter_address);
CREATE INDEX idx_votes_created ON battle_votes(created_at DESC);

-- ============================================
-- NFT MINTS TABLE
-- ============================================

CREATE TABLE nft_mints (
    id SERIAL PRIMARY KEY,
    persona_id VARCHAR(255) REFERENCES personas(persona_id) ON DELETE CASCADE,
    owner_address VARCHAR(42) NOT NULL,
    
    -- Blockchain Data
    token_id INTEGER NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    block_number INTEGER,
    
    -- Mint Details
    mint_price DECIMAL(20,8), -- in STM
    gas_used INTEGER,
    metadata_uri TEXT NOT NULL,
    
    -- NFT Properties
    is_listed BOOLEAN DEFAULT false,
    listing_price DECIMAL(20,8),
    royalty_percentage DECIMAL(5,2) DEFAULT 5.0,
    
    -- Timestamps
    minted_at TIMESTAMP DEFAULT NOW(),
    listed_at TIMESTAMP,
    
    UNIQUE(contract_address, token_id)
);

CREATE INDEX idx_mints_persona ON nft_mints(persona_id);
CREATE INDEX idx_mints_owner ON nft_mints(owner_address);
CREATE INDEX idx_mints_token ON nft_mints(contract_address, token_id);
CREATE INDEX idx_mints_listed ON nft_mints(is_listed);

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Top Personas by Rating
CREATE VIEW top_personas AS
SELECT 
    p.persona_id,
    p.name,
    p.category,
    p.rating,
    p.total_battles,
    p.battle_wins,
    p.total_chats,
    u.username as owner_username
FROM personas p
LEFT JOIN users u ON p.owner_address = u.wallet_address
WHERE p.is_active = true
ORDER BY p.rating DESC, p.popularity_score DESC
LIMIT 100;

-- Active Battles Summary
CREATE VIEW battle_summary AS
SELECT 
    b.battle_id,
    b.persona_id,
    p.name as persona_name,
    COUNT(b.id) as total_votes,
    SUM(b.vote_weight) as total_weight
FROM battle_votes b
LEFT JOIN personas p ON b.persona_id = p.persona_id
GROUP BY b.battle_id, b.persona_id, p.name;

-- User Statistics
CREATE VIEW user_stats AS
SELECT 
    u.wallet_address,
    u.username,
    COUNT(DISTINCT p.persona_id) as total_personas,
    COUNT(DISTINCT c.id) as total_chats,
    COUNT(DISTINCT b.id) as total_votes,
    COUNT(DISTINCT n.id) as total_nfts_minted
FROM users u
LEFT JOIN personas p ON u.wallet_address = p.owner_address
LEFT JOIN chat_history c ON u.wallet_address = c.user_address
LEFT JOIN battle_votes b ON u.wallet_address = b.voter_address
LEFT JOIN nft_mints n ON u.wallet_address = n.owner_address
GROUP BY u.wallet_address, u.username;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at for personas
CREATE TRIGGER update_personas_updated_at
BEFORE UPDATE ON personas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at for users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function: Increment persona stats
CREATE OR REPLACE FUNCTION increment_persona_chats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE personas
    SET total_chats = total_chats + 1
    WHERE persona_id = NEW.persona_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-increment chat count
CREATE TRIGGER increment_chat_count
AFTER INSERT ON chat_history
FOR EACH ROW
EXECUTE FUNCTION increment_persona_chats();

-- Function: Update battle stats
CREATE OR REPLACE FUNCTION update_battle_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE personas
    SET total_battles = total_battles + 1
    WHERE persona_id = NEW.persona_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update battle count
CREATE TRIGGER update_battle_count
AFTER INSERT ON battle_votes
FOR EACH ROW
EXECUTE FUNCTION update_battle_stats();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert default admin user
INSERT INTO users (wallet_address, username, bio) VALUES
('0x0000000000000000000000000000000000000000', 'admin', 'Platform Administrator');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Tables: users, personas, chat_history, battle_votes, nft_mints';
    RAISE NOTICE 'Views: top_personas, battle_summary, user_stats';
    RAISE NOTICE 'Run seed.sql to populate with sample data.';
END $$;
