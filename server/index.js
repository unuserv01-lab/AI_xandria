// ============================================
// AI_xandria Main Server + Persona Seeder
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { Pool } = require('pg');

const personaTemplates = require('./utils/persona-templates');

// ============================================
// INITIALIZE EXPRESS APP
// ============================================

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// ============================================
// DATABASE CONNECTION
// ============================================

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('railway') 
        ? { rejectUnauthorized: false }  // ✅ Railway butuh SSL!
        : false,
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS) || 5000
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Database connected:', res.rows[0].now);
});

global.db = pool;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(process.env.NODE_ENV === 'development' ? morgan('dev') : morgan('combined'));

// ============================================
// RATE LIMITING
// ============================================

const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: { error: 'Too many requests. Try later.' }
});
const aiLimiter = rateLimit({
    windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS) || 3600000,
    max: parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS) || 20,
    message: { error: 'AI generation limit reached. Try later.' }
});
const chatLimiter = rateLimit({
    windowMs: parseInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS) || 60000,
    max: parseInt(process.env.CHAT_RATE_LIMIT_MAX_REQUESTS) || 30,
    message: { error: 'Too many chats. Slow down.' }
});

app.use('/api/', apiLimiter);
app.use('/api/persona/generate', aiLimiter);
app.use('/api/chat/', chatLimiter);

// ============================================
// REQUEST LOGGING
// ============================================

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/api/health', async (req, res) => {
    try {
        const dbCheck = await pool.query('SELECT NOW()');
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: dbCheck.rows[0] ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ============================================
// SEED PERSONAS ENDPOINT
// ============================================

async function insertPersonas() {
    for (const persona of personaTemplates) {
        try {
            await pool.query(`
                INSERT INTO personas (
                    name, tagline, personality, backstory, avatar_url,
                    price, category, traits, is_featured, created_by
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE,NULL)
            `, [
                persona.name,
                persona.tagline,
                persona.personality,
                persona.backstory,
                persona.avatarUrl,
                persona.price,
                persona.category,
                JSON.stringify(persona.traits)
            ]);
            console.log(`   ✅ ${persona.name} inserted`);
        } catch (err) {
            console.error(`   ❌ Failed ${persona.name}:`, err.message);
        }
    }
}

app.post('/api/seed-personas', async (req, res) => {
    try {
        const existing = await pool.query('SELECT COUNT(*) FROM personas');
        if (parseInt(existing.rows[0].count) > 0 && req.query.force !== 'true') {
            return res.json({ success: false, message: 'Already seeded. Use ?force=true to reseed.' });
        }
        if (req.query.force === 'true') {
            await pool.query('TRUNCATE TABLE personas RESTART IDENTITY CASCADE');
        }
        await insertPersonas();
        res.json({ success: true, message: 'Personas seeded successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error seeding personas', error: err.message });
    }
});

// ============================================
// API ROUTES
// ============================================

const personaRoutes = require('./routes/persona');
const personasRoutes = require('./routes/personas');
const chatRoutes = require('./routes/chat');
const ipfsRoutes = require('./routes/ipfs');
const walletRoutes = require('./routes/wallet');
const battleRoutes = require('./routes/battle');
const marketplaceRoutes = require('./routes/marketplace');

app.use('/api/persona', personaRoutes);
app.use('/api/personas', personasRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/battle', battleRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// ============================================
// STATIC FILES (production)
// ============================================

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => res.sendFile('index.html', { root: 'dist' }));
}

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// ============================================
// START SERVER
// ============================================

const server = app.listen(PORT, HOST, () => {
    console.log('\n🚀 AI_xandria Server Started!');
    console.log(`🌐 http://${HOST}:${PORT}`);
});

// Handle errors
server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
});
