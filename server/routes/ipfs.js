// ============================================
// IPFS Routes - Pinata Integration
// ============================================

const express = require('express');
const router = express.Router();
const ipfsUpload = require('../utils/ipfs-upload');
const multer = require('multer');

// Configure multer for file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.IPFS_MAX_FILE_SIZE_MB) * 1024 * 1024 || 10 * 1024 * 1024 // 10MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/json'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and JSON allowed.'));
        }
    }
});

// ============================================
// POST /api/ipfs/upload/json
// Upload JSON metadata to IPFS
// ============================================

router.post('/upload/json', async (req, res) => {
    try {
        const { metadata, name } = req.body;
        
        if (!metadata) {
            return res.status(400).json({
                error: 'Missing metadata',
                required: ['metadata']
            });
        }
        
        console.log(`📤 Uploading JSON to IPFS: ${name || 'metadata'}`);
        
        const result = await ipfsUpload.uploadJSON(metadata, name);
        
        console.log(`✅ Uploaded to IPFS: ${result.hash}`);
        
        res.json({
            success: true,
            message: 'JSON uploaded to IPFS',
            data: {
                hash: result.hash,
                uri: `ipfs://${result.hash}`,
                gatewayUrl: `${process.env.PINATA_GATEWAY}${result.hash}`,
                size: result.size,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Error uploading JSON to IPFS:', error);
        res.status(500).json({
            error: 'Failed to upload JSON to IPFS',
            message: error.message
        });
    }
});

// ============================================
// POST /api/ipfs/upload/file
// Upload file (image) to IPFS
// ============================================

router.post('/upload/file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded'
            });
        }
        
        console.log(`📤 Uploading file to IPFS: ${req.file.originalname}`);
        
        const result = await ipfsUpload.uploadFile(req.file.buffer, req.file.originalname);
        
        console.log(`✅ File uploaded to IPFS: ${result.hash}`);
        
        res.json({
            success: true,
            message: 'File uploaded to IPFS',
            data: {
                hash: result.hash,
                uri: `ipfs://${result.hash}`,
                gatewayUrl: `${process.env.PINATA_GATEWAY}${result.hash}`,
                filename: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('❌ Error uploading file to IPFS:', error);
        res.status(500).json({
            error: 'Failed to upload file to IPFS',
            message: error.message
        });
    }
});

// ============================================
// POST /api/ipfs/upload/batch
// Upload multiple files to IPFS
// ============================================

router.post('/upload/batch', upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'No files uploaded'
            });
        }
        
        console.log(`📤 Uploading ${req.files.length} files to IPFS`);
        
        const uploadPromises = req.files.map(file => 
            ipfsUpload.uploadFile(file.buffer, file.originalname)
        );
        
        const results = await Promise.all(uploadPromises);
        
        console.log(`✅ Uploaded ${results.length} files to IPFS`);
        
        res.json({
            success: true,
            message: `${results.length} files uploaded to IPFS`,
            data: results.map((result, index) => ({
                hash: result.hash,
                uri: `ipfs://${result.hash}`,
                gatewayUrl: `${process.env.PINATA_GATEWAY}${result.hash}`,
                filename: req.files[index].originalname,
                size: req.files[index].size,
                mimetype: req.files[index].mimetype
            }))
        });
        
    } catch (error) {
        console.error('❌ Error uploading batch to IPFS:', error);
        res.status(500).json({
            error: 'Failed to upload batch to IPFS',
            message: error.message
        });
    }
});

// ============================================
// GET /api/ipfs/pin/:hash
// Get pin status of IPFS hash
// ============================================

router.get('/pin/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        
        const status = await ipfsUpload.getPinStatus(hash);
        
        res.json({
            success: true,
            data: {
                hash: hash,
                pinned: status.pinned,
                pinSize: status.pinSize,
                timestamp: status.timestamp
            }
        });
        
    } catch (error) {
        console.error('❌ Error checking pin status:', error);
        res.status(500).json({
            error: 'Failed to check pin status',
            message: error.message
        });
    }
});

// ============================================
// DELETE /api/ipfs/unpin/:hash
// Unpin content from IPFS
// ============================================

router.delete('/unpin/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        
        console.log(`🗑️ Unpinning from IPFS: ${hash}`);
        
        await ipfsUpload.unpinFile(hash);
        
        console.log(`✅ Unpinned: ${hash}`);
        
        res.json({
            success: true,
            message: 'Content unpinned from IPFS',
            hash: hash
        });
        
    } catch (error) {
        console.error('❌ Error unpinning from IPFS:', error);
        res.status(500).json({
            error: 'Failed to unpin from IPFS',
            message: error.message
        });
    }
});

// ============================================
// GET /api/ipfs/list
// List all pinned content
// ============================================

router.get('/list', async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        
        const pins = await ipfsUpload.listPinnedFiles({
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({
            success: true,
            data: pins.rows.map(pin => ({
                hash: pin.ipfs_pin_hash,
                size: pin.size,
                timestamp: pin.date_pinned,
                name: pin.metadata?.name
            })),
            pagination: {
                total: pins.count,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });
        
    } catch (error) {
        console.error('❌ Error listing pinned files:', error);
        res.status(500).json({
            error: 'Failed to list pinned files',
            message: error.message
        });
    }
});

// ============================================
// Error handling for multer
// ============================================

router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                message: `Maximum file size is ${process.env.IPFS_MAX_FILE_SIZE_MB || 10}MB`
            });
        }
        return res.status(400).json({
            error: 'File upload error',
            message: error.message
        });
    }
    next(error);
});

module.exports = router;
