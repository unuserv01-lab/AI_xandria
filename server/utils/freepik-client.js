// ============================================
// Freepik Client - Image Generation
// ============================================

const axios = require('axios');

class FreepikClient {
    constructor() {
        this.apiKey = process.env.FREEPIK_API_KEY;
        this.apiUrl = process.env.FREEPIK_API_URL || 'https://api.freepik.com/v1';
        this.fallbackUrl = process.env.FALLBACK_IMAGE_URL || 'https://via.placeholder.com/512x512';
    }
    
    // ============================================
    // Generate Image from Prompt
    // ============================================
    
    async generateImage(prompt, options = {}) {
        try {
            // Check if API key is configured
            if (!this.apiKey) {
                console.warn('⚠️ Freepik API key not configured, using placeholder');
                return this.getPlaceholderImage(prompt);
            }
            
            console.log(`🎨 Generating image with Freepik: ${prompt.substring(0, 50)}...`);
            
            const requestData = {
                prompt: prompt,
                num_images: options.numImages || 1,
                image: {
                    size: options.size || '512x512',
                    style: options.style || process.env.IMAGE_STYLE || 'digital_art',
                    quality: options.quality || process.env.IMAGE_QUALITY || 'high'
                }
            };
            
            // Note: Adjust endpoint based on Freepik's actual API documentation
            const response = await axios.post(
                `${this.apiUrl}/ai/image-generation`,
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 60000 // Image generation can take time
                }
            );
            
            // Extract image URL from response
            const imageUrl = response.data.data?.[0]?.url || response.data.url;
            
            if (!imageUrl) {
                throw new Error('No image URL in response');
            }
            
            console.log(`✅ Image generated successfully`);
            return imageUrl;
            
        } catch (error) {
            console.error('❌ Freepik image generation failed:', error.message);
            
            // Fallback to placeholder
            console.warn('⚠️ Using fallback placeholder image');
            return this.getPlaceholderImage(prompt);
        }
    }
    
    // ============================================
    // Search Freepik Stock Images (Alternative)
    // ============================================
    
    async searchStockImage(query, options = {}) {
        try {
            if (!this.apiKey) {
                return this.getPlaceholderImage(query);
            }
            
            console.log(`🔍 Searching Freepik stock: ${query}`);
            
            const response = await axios.get(
                `${this.apiUrl}/resources`,
                {
                    params: {
                        term: query,
                        filters: {
                            content_type: 'photo',
                            order: 'popular'
                        },
                        limit: 1
                    },
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    timeout: 30000
                }
            );
            
            const image = response.data.data?.[0];
            
            if (!image) {
                throw new Error('No images found');
            }
            
            // Get the image URL (adjust based on actual API response structure)
            const imageUrl = image.image?.source?.url || image.url;
            
            console.log(`✅ Stock image found`);
            return imageUrl;
            
        } catch (error) {
            console.error('❌ Freepik search failed:', error.message);
            return this.getPlaceholderImage(query);
        }
    }
    
    // ============================================
    // Get Placeholder Image (Fallback)
    // ============================================
    
    getPlaceholderImage(description) {
        // Generate a unique color based on description
        const hash = this.hashString(description);
        const hue = hash % 360;
        const color = this.hslToHex(hue, 70, 60);
        
        // Use placeholder service with custom color
        const size = '512x512';
        const text = encodeURIComponent(description.substring(0, 20));
        
        return `https://via.placeholder.com/${size}/${color.substring(1)}/ffffff?text=${text}`;
    }
    
    // ============================================
    // Generate Avatar with DiceBear (Backup)
    // ============================================
    
    generateAvatar(name, style = 'avataaars') {
        // Use DiceBear API for generating unique avatars
        // Styles: avataaars, bottts, pixel-art, identicon, etc.
        const seed = encodeURIComponent(name);
        return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=512`;
    }
    
    // ============================================
    // Generate Gradient Background
    // ============================================
    
    generateGradientBackground(name) {
        const hash = this.hashString(name);
        const color1 = this.hslToHex((hash % 360), 70, 50);
        const color2 = this.hslToHex(((hash + 180) % 360), 70, 60);
        
        // Return CSS gradient as data URL
        const svg = `
            <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="512" height="512" fill="url(#grad)" />
            </svg>
        `;
        
        return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    }
    
    // ============================================
    // Helper Functions
    // ============================================
    
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
    
    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }
    
    // ============================================
    // Validate Image URL
    // ============================================
    
    async validateImageUrl(url) {
        try {
            const response = await axios.head(url, { timeout: 5000 });
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }
}

// Export singleton instance
module.exports = new FreepikClient();
