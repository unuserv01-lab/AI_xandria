// ============================================
// AI_xandria Main Server
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { Pool } = require('pg');

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
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS) || 2000
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
    console.log('✅ Database connected:', res.rows[0].now);
});

// Make pool available globally
global.db = pool;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Security headers
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ============================================
// RATE LIMITING
// ============================================

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// AI generation rate limiter (stricter)
const aiLimiter = rateLimit({
    windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS) || 3600000, // 1 hour
    max: parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS) || 20,
    message: {
        error: 'AI generation limit reached. Please try again later.',
        retryAfter: '1 hour'
    }
});

// Chat rate limiter
const chatLimiter = rateLimit({
    windowMs: parseInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    max: parseInt(process.env.CHAT_RATE_LIMIT_MAX_REQUESTS) || 30,
    message: {
        error: 'Too many chat messages. Please slow down.',
        retryAfter: '1 minute'
    }
});

// Apply rate limiters
app.use('/api/', apiLimiter);
app.use('/api/persona/generate', aiLimiter);
app.use('/api/chat/', chatLimiter);

// ============================================
// REQUEST LOGGING MIDDLEWARE
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
            environment: process.env.NODE_ENV,
            database: dbCheck.rows[0] ? 'connected' : 'disconnected',
            features: {
                nft_minting: process.env.FEATURE_NFT_MINTING === 'true',
                battle_arena: process.env.FEATURE_BATTLE_ARENA === 'true',
                marketplace: process.env.FEATURE_MARKETPLACE === 'true',
                chat: process.env.FEATURE_CHAT === 'true'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ============================================
// API ROUTES
// ============================================

// Import route modules
const personaRoutes = require('./routes/persona');
const chatRoutes = require('./routes/chat');
const ipfsRoutes = require('./routes/ipfs');
const walletRoutes = require('./routes/wallet');
const battleRoutes = require('./routes/battle');
const marketplaceRoutes = require('./routes/marketplace');

// Mount routes
app.use('/api/persona', personaRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/battle', battleRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// ============================================
// STATIC FILES (for production)
// ============================================

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    
    app.get('*', (req, res) => {
        res.sendFile('index.html', { root: 'dist' });
    });
}

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    
    // Don't leak error details in production
    const errorResponse = {
        error: err.name || 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    };
    
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }
    
    res.status(err.status || 500).json(errorResponse);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    
    // Close database connections
    await pool.end();
    console.log('Database connections closed');
    
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    
    await pool.end();
    console.log('Database connections closed');
    
    process.exit(0);
});

// ============================================
// START SERVER
// ============================================

const server = app.listen(PORT, HOST, () => {
    console.log('\n🚀 AI_xandria Server Started!');
    console.log('================================');
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server: http://${HOST}:${PORT}`);
    console.log(`💾 Database: ${process.env.DB_NAME || 'ai_xandria'}`);
    console.log(`🤖 AI Services: ${process.env.AI_PRIORITY || 'deepseek,gemini'}`);
    console.log(`🔗 Blockchain: ${process.env.SOMNIA_NETWORK_NAME || 'Somnia Testnet'}`);
    console.log('================================\n');
    console.log('Available endpoints:');
    console.log('  GET  /api/health           - Health check');
    console.log('  POST /api/persona/generate - Generate AI persona');
    console.log('  POST /api/chat/send        - Chat with persona');
    console.log('  POST /api/ipfs/upload      - Upload to IPFS');
    console.log('  POST /api/wallet/connect   - Connect wallet');
    console.log('  POST /api/battle/create    - Create battle');
    console.log('  GET  /api/marketplace/list - List NFTs');
    console.log('\n✨ Ready to accept requests!\n');
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', error);
        process.exit(1);
    }
});

module.exports = app;
