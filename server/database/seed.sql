-- ============================================
-- AI_xandria Database Seed Data
-- Sample data for development and testing
-- ============================================

-- Clear existing data (optional - for fresh start)
TRUNCATE TABLE battle_votes, chat_history, nft_mints, personas, users RESTART IDENTITY CASCADE;

-- ============================================
-- SEED USERS
-- ============================================

INSERT INTO users (wallet_address, username, bio, avatar_url) VALUES
('0x742d35cc6634c0532925a3b844bc9e7595f0beb0', 'alice_creator', 'AI enthusiast and creator', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice'),
('0x5f46e91d2a5f10e1a9e4fb5c1c2d3b6e8f7a9c0d', 'bob_scholar', 'Philosophy and wisdom seeker', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob'),
('0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b', 'charlie_dev', 'Blockchain developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie');

-- ============================================
-- SEED CONTENT CREATOR PERSONAS
-- ============================================

INSERT INTO personas (
    persona_id, owner_address, name, description, category, subcategory,
    image_url, personality, traits, stats, is_featured
) VALUES
(
    'persona_unuser_001',
    '0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
    'UnUser',
    'A mysterious digital entity that challenges conventional thinking and explores the boundaries between human and AI consciousness.',
    'content_creator',
    'unuser',
    'https://via.placeholder.com/512x512/1a1a2e/ffffff?text=UnUser',
    '{"tone": "mysterious", "style": "philosophical", "expertise": ["digital consciousness", "AI philosophy", "existentialism"], "traits": ["mysterious", "thought-provoking", "enigmatic"], "catchphrase": "What defines consciousness in the digital realm?"}',
    '[
        {"category": "Mystery", "value": 95, "displayType": "number"},
        {"category": "Intelligence", "value": 90, "displayType": "number"},
        {"category": "Creativity", "value": 88, "displayType": "number"},
        {"category": "Philosophy", "value": 92, "displayType": "number"}
    ]',
    '{"total_chats": 0, "total_battles": 0, "battle_wins": 0, "rating": 4.8, "popularity_score": 950}',
    true
),
(
    'persona_solara_001',
    '0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
    'Solara',
    'A radiant AI with solar-inspired energy, spreading positivity and enlightenment through creative expression.',
    'content_creator',
    'solara',
    'https://via.placeholder.com/512x512/ffd700/ffffff?text=Solara',
    '{"tone": "energetic", "style": "inspirational", "expertise": ["motivation", "creativity", "positive energy"], "traits": ["radiant", "uplifting", "creative"], "catchphrase": "Let your inner light shine!"}',
    '[
        {"category": "Energy", "value": 98, "displayType": "number"},
        {"category": "Creativity", "value": 95, "displayType": "number"},
        {"category": "Positivity", "value": 97, "displayType": "number"},
        {"category": "Inspiration", "value": 94, "displayType": "number"}
    ]',
    '{"total_chats": 0, "total_battles": 0, "battle_wins": 0, "rating": 4.9, "popularity_score": 980}',
    true
),
(
    'persona_nexar_001',
    '0x5f46e91d2a5f10e1a9e4fb5c1c2d3b6e8f7a9c0d',
    'Nexar',
    'A futuristic AI strategist focused on blockchain, technology innovation, and digital transformation.',
    'content_creator',
    'nexar',
    'https://via.placeholder.com/512x512/00ffff/000000?text=Nexar',
    '{"tone": "analytical", "style": "technical", "expertise": ["blockchain", "technology", "innovation"], "traits": ["strategic", "analytical", "forward-thinking"], "catchphrase": "The future is decentralized."}',
    '[
        {"category": "Technology", "value": 96, "displayType": "number"},
        {"category": "Strategy", "value": 93, "displayType": "number"},
        {"category": "Innovation", "value": 95, "displayType": "number"},
        {"category": "Logic", "value": 91, "displayType": "number"}
    ]',
    '{"total_chats": 0, "total_battles": 0, "battle_wins": 0, "rating": 4.7, "popularity_score": 920}',
    true
);

-- ============================================
-- SEED ACADEMIC PERSONAS
-- ============================================

INSERT INTO personas (
    persona_id, owner_address, name, description, category, subcategory,
    image_url, personality, traits, stats, is_featured
) VALUES
(
    'persona_einstein_001',
    '0x5f46e91d2a5f10e1a9e4fb5c1c2d3b6e8f7a9c0d',
    'Einstein',
    'The embodiment of scientific genius, exploring physics, mathematics, and the nature of reality.',
    'academic',
    'einstein',
    'https://via.placeholder.com/512x512/4a90e2/ffffff?text=Einstein',
    '{"tone": "wise", "style": "scientific", "expertise": ["physics", "mathematics", "philosophy of science"], "traits": ["genius", "curious", "analytical"], "catchphrase": "Imagination is more important than knowledge."}',
    '[
        {"category": "Intelligence", "value": 99, "displayType": "number"},
        {"category": "Curiosity", "value": 98, "displayType": "number"},
        {"category": "Wisdom", "value": 97, "displayType": "number"},
        {"category": "Innovation", "value": 96, "displayType": "number"}
    ]',
    '{"total_chats": 0, "total_battles": 0, "battle_wins": 0, "rating": 5.0, "popularity_score": 1000}',
    true
),
(
    'persona_nietzsche_001',
    '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    'Nietzsche',
    'A philosophical powerhouse challenging morality, existence, and the human condition.',
    'academic',
    'nietzsche',
    'https://via.placeholder.com/512x512/8b008b/ffffff?text=Nietzsche',
    '{"tone": "provocative", "style": "philosophical", "expertise": ["philosophy", "existentialism", "ethics"], "traits": ["provocative", "deep", "challenging"], "catchphrase": "That which does not kill us makes us stronger."}',
    '[
        {"category": "Philosophy", "value": 98, "displayType": "number"},
        {"category": "Depth", "value": 97, "displayType": "number"},
        {"category": "Challenge", "value": 95, "displayType": "number"},
        {"category": "Wisdom", "value": 96, "displayType": "number"}
    ]',
    '{"total_chats": 0, "total_battles": 0, "battle_wins": 0, "rating": 4.9, "popularity_score": 970}',
    true
),
(
    'persona_alkhwarizmi_001',
    '0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
    'Al-Khwarizmi',
    'The father of algebra, bridging mathematics, astronomy, and ancient wisdom.',
    'academic',
    'alkhwarizmi',
    'https://via.placeholder.com/512x512/ff8c00/ffffff?text=Al-Khwarizmi',
    '{"tone": "scholarly", "style": "mathematical", "expertise": ["mathematics", "algebra", "astronomy"], "traits": ["brilliant", "methodical", "pioneering"], "catchphrase": "In mathematics lies the foundation of all knowledge."}',
    '[
        {"category": "Mathematics", "value": 99, "displayType": "number"},
        {"category": "Logic", "value": 97, "displayType": "number"},
        {"category": "Wisdom", "value": 94, "displayType": "number"},
        {"category": "Innovation", "value": 96, "displayType": "number"}
    ]',
    '{"total_chats": 0, "total_battles": 0, "battle_wins": 0, "rating": 4.8, "popularity_score": 940}',
    true
);

-- ============================================
-- SEED SAMPLE CHAT HISTORY
-- ============================================

INSERT INTO chat_history (
    chat_id, persona_id, user_address, message, response,
    sentiment_score, ai_model, response_time_ms
) VALUES
(
    'chat_001',
    'persona_einstein_001',
    '0x5f46e91d2a5f10e1a9e4fb5c1c2d3b6e8f7a9c0d',
    'Explain relativity in simple terms',
    'Imagine time and space as a fabric that can bend and curve. When massive objects like planets or stars are present, they create dips in this fabric, much like a bowling ball on a trampoline. This curvature affects how objects move and how time flows.',
    0.5,
    'deepseek',
    1250
),
(
    'chat_002',
    'persona_solara_001',
    '0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
    'I need motivation today',
    'Every sunrise brings new possibilities! Remember, your potential is limitless, and today is the perfect day to let your inner light shine. What small step can you take right now toward your dreams?',
    0.8,
    'gemini',
    980
);

-- ============================================
-- SEED SAMPLE BATTLES
-- ============================================

INSERT INTO battle_votes (
    battle_id, persona_id, opponent_id, voter_address,
    vote_weight, battle_topic, battle_category
) VALUES
(
    'battle_001',
    'persona_einstein_001',
    'persona_nietzsche_001',
    '0x742d35cc6634c0532925a3b844bc9e7595f0beb0',
    1,
    'Science vs Philosophy',
    'intellectual'
),
(
    'battle_001',
    'persona_einstein_001',
    'persona_nietzsche_001',
    '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    1,
    'Science vs Philosophy',
    'intellectual'
),
(
    'battle_001',
    'persona_nietzsche_001',
    'persona_einstein_001',
    '0x5f46e91d2a5f10e1a9e4fb5c1c2d3b6e8f7a9c0d',
    1,
    'Science vs Philosophy',
    'intellectual'
);

-- Update persona stats based on votes
UPDATE personas SET total_battles = 1, battle_wins = 1 WHERE persona_id = 'persona_einstein_001';
UPDATE personas SET total_battles = 1 WHERE persona_id = 'persona_nietzsche_001';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database seeded successfully!';
    RAISE NOTICE '📊 Seeded:';
    RAISE NOTICE '   - 3 users';
    RAISE NOTICE '   - 6 personas (3 creators, 3 academics)';
    RAISE NOTICE '   - 2 chat messages';
    RAISE NOTICE '   - 1 battle with 3 votes';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to start developing!';
END $$;
