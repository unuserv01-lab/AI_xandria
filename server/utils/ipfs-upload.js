// ============================================
// IPFS Upload - Pinata Integration
// ============================================

const axios = require('axios');
const FormData = require('form-data');

class IPFSUpload {
    constructor() {
        this.apiKey = process.env.PINATA_API_KEY;
        this.secretKey = process.env.PINATA_SECRET_KEY;
        this.jwt = process.env.PINATA_JWT;
        this.gatewayUrl = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
        
        if (!this.apiKey || !this.secretKey) {
            console.warn('⚠️ Pinata credentials not configured');
        }
    }
    
    // ============================================
    // Upload JSON to IPFS
    // ============================================
    
    async uploadJSON(metadata, name = 'metadata') {
        try {
            const data = JSON.stringify({
                pinataContent: metadata,
                pinataMetadata: {
                    name: `${name}.json`,
                    keyvalues: {
                        type: 'persona_metadata',
                        timestamp: new Date().toISOString()
                    }
                },
                pinataOptions: {
                    cidVersion: 1
                }
            });
            
            const response = await axios.post(
                'https://api.pinata.cloud/pinning/pinJSONToIPFS',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.jwt}`,
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.secretKey
                    },
                    timeout: 30000
                }
            );
            
            return {
                hash: response.data.IpfsHash,
                uri: `ipfs://${response.data.IpfsHash}`,
                size: response.data.PinSize,
                timestamp: response.data.Timestamp
            };
            
        } catch (error) {
            console.error('❌ Failed to upload JSON to IPFS:', error.message);
            throw new Error(`IPFS upload failed: ${error.message}`);
        }
    }
    
    // ============================================
    // Upload File (Buffer) to IPFS
    // ============================================
    
    async uploadFile(fileBuffer, filename) {
        try {
            const formData = new FormData();
            formData.append('file', fileBuffer, filename);
            
            const metadata = JSON.stringify({
                name: filename,
                keyvalues: {
                    type: 'file',
                    timestamp: new Date().toISOString()
                }
            });
            formData.append('pinataMetadata', metadata);
            
            const options = JSON.stringify({
                cidVersion: 1
            });
            formData.append('pinataOptions', options);
            
            const response = await axios.post(
                'https://api.pinata.cloud/pinning/pinFileToIPFS',
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        'Authorization': `Bearer ${this.jwt}`,
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.secretKey
                    },
                    maxBodyLength: Infinity,
                    timeout: 60000
                }
            );
            
            return {
                hash: response.data.IpfsHash,
                uri: `ipfs://${response.data.IpfsHash}`,
                size: response.data.PinSize,
                timestamp: response.data.Timestamp
            };
            
        } catch (error) {
            console.error('❌ Failed to upload file to IPFS:', error.message);
            throw new Error(`IPFS file upload failed: ${error.message}`);
        }
    }
    
    // ============================================
    // Get Pin Status
    // ============================================
    
    async getPinStatus(hash) {
        try {
            const response = await axios.get(
                `https://api.pinata.cloud/data/pinList?hashContains=${hash}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.jwt}`,
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.secretKey
                    }
                }
            );
            
            if (response.data.rows.length === 0) {
                return {
                    pinned: false,
                    hash: hash
                };
            }
            
            const pin = response.data.rows[0];
            return {
                pinned: true,
                hash: pin.ipfs_pin_hash,
                pinSize: pin.size,
                timestamp: pin.date_pinned
            };
            
        } catch (error) {
            console.error('❌ Failed to get pin status:', error.message);
            throw new Error(`Failed to get pin status: ${error.message}`);
        }
    }
    
    // ============================================
    // Unpin File
    // ============================================
    
    async unpinFile(hash) {
        try {
            await axios.delete(
                `https://api.pinata.cloud/pinning/unpin/${hash}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.jwt}`,
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.secretKey
                    }
                }
            );
            
            return {
                success: true,
                hash: hash
            };
            
        } catch (error) {
            console.error('❌ Failed to unpin file:', error.message);
            throw new Error(`Failed to unpin: ${error.message}`);
        }
    }
    
    // ============================================
    // List Pinned Files
    // ============================================
    
    async listPinnedFiles({ limit = 50, offset = 0 } = {}) {
        try {
            const response = await axios.get(
                `https://api.pinata.cloud/data/pinList?pageLimit=${limit}&pageOffset=${offset}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.jwt}`,
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.secretKey
                    }
                }
            );
            
            return {
                rows: response.data.rows,
                count: response.data.count
            };
            
        } catch (error) {
            console.error('❌ Failed to list pinned files:', error.message);
            throw new Error(`Failed to list pins: ${error.message}`);
        }
    }
    
    // ============================================
    // Get IPFS Gateway URL
    // ============================================
    
    getGatewayUrl(hash) {
        return `${this.gatewayUrl}${hash}`;
    }
    
    // ============================================
    // Test Connection
    // ============================================
    
    async testConnection() {
        try {
            const response = await axios.get(
                'https://api.pinata.cloud/data/testAuthentication',
                {
                    headers: {
                        'Authorization': `Bearer ${this.jwt}`,
                        'pinata_api_key': this.apiKey,
                        'pinata_secret_api_key': this.secretKey
                    }
                }
            );
            
            return {
                success: true,
                message: response.data.message
            };
            
        } catch (error) {
            console.error('❌ Pinata connection test failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Export singleton instance
module.exports = new IPFSUpload();
