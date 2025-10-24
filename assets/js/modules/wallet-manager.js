// ============================================
// Wallet Manager Module
// Handles MetaMask connection & Somnia Network
// ============================================

window.currentWalletAddress = null;
window.provider = null;
window.signer = null;
window.contract = null;

// Somnia Network Configuration
const SOMNIA_NETWORK = {
    chainId: '0xC488', // 50312 in hex
    chainIdDecimal: 50312,
    chainName: 'Somnia Testnet',
    rpcUrls: ['https://dream-rpc.somnia.network/'],
    blockExplorerUrls: ['https://shannon-explorer.somnia.network/'],
    nativeCurrency: {
        name: 'STT',
        symbol: 'STT',
        decimals: 18
    }
};

// Smart Contract Configuration
window.CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";
const CONTRACT_ABI = [
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"specialization","type":"string"}],"name":"PersonaMinted","type":"event"},
    {"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"specialization","type":"string"},{"internalType":"string","name":"uri","type":"string"}],"name":"mintMyPersona","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"getPersonasByOwner","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
];

// ============================================
// CHECK AND SWITCH NETWORK
// ============================================

async function checkAndSwitchNetwork() {
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('🔍 Current Chain ID:', chainId, 'Expected:', SOMNIA_NETWORK.chainId);
        
        if (chainId !== SOMNIA_NETWORK.chainId) {
            console.log('🔄 Switching to Somnia Testnet...');
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: SOMNIA_NETWORK.chainId }],
                });
                console.log('✅ Successfully switched to Somnia Testnet');
                return true;
            } catch (switchError) {
                console.log('❌ Switch error:', switchError);
                if (switchError.code === 4902) {
                    console.log('➕ Adding Somnia Testnet to wallet...');
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [SOMNIA_NETWORK]
                        });
                        console.log('✅ Successfully added Somnia Testnet');
                        return true;
                    } catch (addError) {
                        console.error('❌ Failed to add network:', addError);
                        return false;
                    }
                } else {
                    console.error('❌ Failed to switch network:', switchError);
                    return false;
                }
            }
        } else {
            console.log('✅ Already on Somnia Testnet');
            return true;
        }
    } catch (error) {
        console.error('❌ Network check failed:', error);
        return false;
    }
}

// ============================================
// CONNECT WALLET
// ============================================

async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert("❌ Please install MetaMask!\n\nMetaMask is required to interact with this app.");
        window.open('https://metamask.io/download/', '_blank');
        return null;
    }

    try {
        console.log('🔗 Starting wallet connection...');
        
        // Check and switch to Somnia network
        const networkOk = await checkAndSwitchNetwork();
        if (!networkOk) {
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            alert(`❌ Please switch to Somnia Testnet!\n\nCurrent Network: ${currentChainId}\nRequired: ${SOMNIA_NETWORK.chainId}\n\nThe network will be added to your wallet.`);
            return null;
        }

        // Request accounts with timeout
        const accounts = await Promise.race([
            window.ethereum.request({ method: 'eth_requestAccounts' }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 30000)
            )
        ]);
        
        window.currentWalletAddress = accounts[0];
        console.log('✅ Account connected:', window.currentWalletAddress);

        // Wait for ethers.js to load if not already loaded
        if (typeof ethers === 'undefined') {
            console.log('📦 Waiting for ethers.js...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Initialize ethers provider and contract
        window.provider = new ethers.providers.Web3Provider(window.ethereum);
        window.signer = window.provider.getSigner();
        window.contract = new ethers.Contract(
            window.CONTRACT_ADDRESS,
            CONTRACT_ABI,
            window.signer
        );

        // Save to localStorage
        localStorage.setItem('walletAddress', window.currentWalletAddress);
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('connectedTime', Date.now().toString());

        console.log('💾 Wallet state saved to localStorage');

        // Update UI
        updateWalletUI();

        // Get user's personas
        try {
            const personas = await window.contract.getPersonasByOwner(window.currentWalletAddress);
            console.log(`✅ You own ${personas.length} personas`);
            
            showNotification(
                `✅ Connected! You own ${personas.length} personas`,
                'success'
            );
        } catch (personaError) {
            console.warn('Could not fetch personas:', personaError);
            showNotification('✅ Wallet connected to Somnia!', 'success');
        }

        // Notify backend
        await notifyBackendConnection(window.currentWalletAddress);

        return {
            address: window.currentWalletAddress,
            provider: window.provider,
            signer: window.signer,
            contract: window.contract
        };

    } catch (error) {
        console.error("❌ Connection failed:", error);
        
        let errorMsg = "❌ Connection Failed!\n\n";
        if (error.code === 4001) {
            errorMsg += "You rejected the connection request.";
        } else if (error.code === -32002) {
            errorMsg += "Please check your wallet - request pending!";
        } else if (error.message.includes('timeout')) {
            errorMsg += "Connection timeout. Please try again.";
        } else {
            errorMsg += error.message || "Unknown error occurred";
        }
        
        showNotification(errorMsg, 'error');
        return null;
    }
}

// ============================================
// UPDATE WALLET UI
// ============================================

function updateWalletUI() {
    const walletBtn = document.querySelector('.wallet-btn');
    if (walletBtn && window.currentWalletAddress) {
        const shortAddress = `${window.currentWalletAddress.substring(0, 6)}...${window.currentWalletAddress.substring(window.currentWalletAddress.length - 4)}`;
        walletBtn.textContent = `🔗 ${shortAddress}`;
        walletBtn.classList.add('connected');
        walletBtn.title = window.currentWalletAddress;
    }
}

// ============================================
// NOTIFY BACKEND OF CONNECTION
// ============================================

async function notifyBackendConnection(walletAddress) {
    try {
        const API_BASE_URL = 'http://localhost:3000/api';
        const response = await fetch(`${API_BASE_URL}/wallet/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                walletAddress: walletAddress
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend notified:', data);
        } else {
            console.warn('⚠️ Backend notification failed');
        }
    } catch (error) {
        console.warn('⚠️ Could not reach backend:', error);
    }
}

// ============================================
// SETUP WALLET LISTENERS
// ============================================

function setupWalletListeners() {
    if (typeof window.ethereum !== 'undefined') {
        // Account changed
        window.ethereum.on('accountsChanged', (accounts) => {
            console.log('🔄 Accounts changed:', accounts);
            if (accounts.length === 0) {
                console.log('Wallet disconnected');
                localStorage.removeItem('walletAddress');
                localStorage.removeItem('walletConnected');
                showNotification('⚠️ Wallet disconnected', 'error');
                setTimeout(() => location.reload(), 1000);
            } else {
                window.currentWalletAddress = accounts[0];
                localStorage.setItem('walletAddress', window.currentWalletAddress);
                showNotification('🔄 Account changed', 'info');
                setTimeout(() => location.reload(), 1000);
            }
        });

        // Network changed
        window.ethereum.on('chainChanged', (chainId) => {
            console.log('🔄 Network changed:', chainId);
            if (chainId !== SOMNIA_NETWORK.chainId) {
                showNotification('⚠️ Please switch back to Somnia Testnet', 'error');
            }
            setTimeout(() => location.reload(), 1000);
        });
    }
}

// ============================================
// AUTO-CONNECT ON PAGE LOAD
// ============================================

// ============================================
// AUTO-CONNECT ON PAGE LOAD
// ============================================

window.addEventListener('load', async () => {
    const wasConnected = localStorage.getItem('walletConnected');
    const savedAddress = localStorage.getItem('walletAddress');
    
    if (wasConnected === 'true' && savedAddress && typeof window.ethereum !== 'undefined') {
        // Wait a bit for page to load
        setTimeout(async () => {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
                    console.log('🔗 Auto-connecting wallet...');
                    await connectWallet();
                } else {
                    // Clear saved state if account not found
                    localStorage.removeItem('walletConnected');
                    localStorage.removeItem('walletAddress');
                }
            } catch (error) {
                console.log('Auto-connect failed:', error);
            }
        }, 2000);
    }
    
    // Setup event listeners
    setupWalletListeners();
});

// ============================================
// DISCONNECT WALLET
// ============================================

function disconnectWallet() {
    window.currentWalletAddress = null;
    window.provider = null;
    window.signer = null;
    window.contract = null;
    
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('connectedTime');
    
    const walletBtn = document.querySelector('.wallet-btn');
    if (walletBtn) {
        walletBtn.textContent = '🔗 Connect Wallet';
        walletBtn.classList.remove('connected');
        walletBtn.title = '';
    }
    
    showNotification('👋 Wallet disconnected', 'info');
    console.log('👋 Wallet disconnected');
}

// ============================================
// GET WALLET BALANCE
// ============================================

async function getWalletBalance() {
    if (!window.provider || !window.currentWalletAddress) {
        console.warn('⚠️ Wallet not connected');
        return null;
    }
    
    try {
        const balance = await window.provider.getBalance(window.currentWalletAddress);
        const balanceInEther = ethers.utils.formatEther(balance);
        console.log(`💰 Balance: ${balanceInEther} STT`);
        return balanceInEther;
    } catch (error) {
        console.error('❌ Failed to get balance:', error);
        return null;
    }
}

// ============================================
// GET USER PERSONAS
// ============================================

async function getUserPersonas() {
    if (!window.contract || !window.currentWalletAddress) {
        console.warn('⚠️ Contract or wallet not initialized');
        return [];
    }
    
    try {
        const tokenIds = await window.contract.getPersonasByOwner(window.currentWalletAddress);
        console.log(`📦 Found ${tokenIds.length} personas`);
        return tokenIds.map(id => id.toString());
    } catch (error) {
        console.error('❌ Failed to get personas:', error);
        return [];
    }
}

// ============================================
// CHECK IF WALLET IS CONNECTED
// ============================================

function isWalletConnected() {
    return window.currentWalletAddress !== null && window.provider !== null;
}

// ============================================
// GET NETWORK INFO
// ============================================

async function getNetworkInfo() {
    if (!window.provider) {
        return null;
    }
    
    try {
        const network = await window.provider.getNetwork();
        return {
            name: network.name,
            chainId: network.chainId,
            isCorrectNetwork: network.chainId === SOMNIA_NETWORK.chainIdDecimal
        };
    } catch (error) {
        console.error('❌ Failed to get network info:', error);
        return null;
    }
}

// ============================================
// SWITCH TO SOMNIA NETWORK (Manual)
// ============================================

async function switchToSomniaNetwork() {
    if (typeof window.ethereum === 'undefined') {
        alert('❌ MetaMask not installed!');
        return false;
    }
    
    const success = await checkAndSwitchNetwork();
    if (success) {
        showNotification('✅ Switched to Somnia Testnet', 'success');
    } else {
        showNotification('❌ Failed to switch network', 'error');
    }
    return success;
}

// ============================================
// EXPORT WALLET INFO (for debugging)
// ============================================

function getWalletInfo() {
    return {
        address: window.currentWalletAddress,
        isConnected: isWalletConnected(),
        contractAddress: window.CONTRACT_ADDRESS,
        network: SOMNIA_NETWORK.chainName,
        hasProvider: window.provider !== null,
        hasContract: window.contract !== null
    };
}

// ============================================
// UTILITY: FORMAT ADDRESS
// ============================================

function formatAddress(address, startChars = 6, endChars = 4) {
    if (!address) return '';
    return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
}

// ============================================
// UTILITY: COPY ADDRESS TO CLIPBOARD
// ============================================

async function copyAddressToClipboard() {
    if (!window.currentWalletAddress) {
        showNotification('⚠️ No wallet connected', 'error');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(window.currentWalletAddress);
        showNotification('📋 Address copied to clipboard!', 'success');
    } catch (error) {
        console.error('Failed to copy:', error);
        showNotification('❌ Failed to copy address', 'error');
    }
}

// ============================================
// ADD CLICK LISTENER TO WALLET BUTTON FOR COPY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const walletBtn = document.querySelector('.wallet-btn');
    if (walletBtn) {
        // Right-click to copy address
        walletBtn.addEventListener('contextmenu', (e) => {
            if (isWalletConnected()) {
                e.preventDefault();
                copyAddressToClipboard();
            }
        });
        
        // Double-click to disconnect
        let clickCount = 0;
        let clickTimer = null;
        walletBtn.addEventListener('click', (e) => {
            if (isWalletConnected()) {
                clickCount++;
                if (clickCount === 1) {
                    clickTimer = setTimeout(() => {
                        clickCount = 0;
                    }, 300);
                } else if (clickCount === 2) {
                    clearTimeout(clickTimer);
                    clickCount = 0;
                    if (confirm('⚠️ Disconnect wallet?')) {
                        disconnectWallet();
                    }
                }
            }
        });
    }
});

// ============================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================

window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.getWalletBalance = getWalletBalance;
window.getUserPersonas = getUserPersonas;
window.isWalletConnected = isWalletConnected;
window.getNetworkInfo = getNetworkInfo;
window.switchToSomniaNetwork = switchToSomniaNetwork;
window.getWalletInfo = getWalletInfo;
window.formatAddress = formatAddress;
window.copyAddressToClipboard = copyAddressToClipboard;

console.log('✅ Wallet Manager loaded');
console.log('📝 Available functions: connectWallet(), disconnectWallet(), getWalletInfo()');
console.log('💡 Tip: Right-click wallet button to copy address, double-click to disconnect');
