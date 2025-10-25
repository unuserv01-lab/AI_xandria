// CONFIGURASI TERPUSAT - AI XANDRIA
const CONFIG = {
    // API Configuration
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : '/api', // Relative path for production
    
    // Blockchain Configuration
    CONTRACT_ADDRESS: "0xd9145CCE52D386f254917e481eB44e9943F39138",
    NETWORK_CONFIG: {
        chainId: '0xc488',
        chainIdDecimal: 50312,
        chainName: 'Somnia Testnet',
        rpcUrls: ['https://dream-rpc.somnia.network/'],
        blockExplorerUrls: ['https://shannon-explorer.somnia.network/'],
        nativeCurrency: {
            name: 'STT',
            symbol: 'STT',
            decimals: 18
        }
    },
    
    // Feature Flags
    FEATURES: {
        MOCK_MODE: false, // Set true for development without backend
        ENABLE_CHAT: true,
        ENABLE_NFT_MINTING: true
    },
    
    // Default Settings
    DEFAULTS: {
        PERSONA_CATEGORY: 'content-creator',
        CHAT_TIMEOUT: 30000,
        MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
