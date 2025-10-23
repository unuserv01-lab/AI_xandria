// 🔗 WALLET CONNECT - Blockchain wallet integration
class WalletManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.isConnected = false;
        this.walletAddress = null;
        this.chainId = null;
        
        // Somnia Testnet Configuration
        this.somniaNetwork = {
            chainId: '0xC488', // 50312 in hex
            chainName: 'Somnia Testnet',
            rpcUrls: ['https://dream-rpc.somnia.network/'],
            blockExplorerUrls: ['https://shannon-explorer.somnia.network/'],
            nativeCurrency: {
                name: 'STT',
                symbol: 'STT',
                decimals: 18
            }
        };

        // Contract addresses (update with your deployed contracts)
        this.contractAddresses = {
            personaNFT: "0xd9145CCE52D386f254917e481eB44e9943F39138",
            marketplace: "0x...", // Add your marketplace contract
            arena: "0x..."        // Add your arena contract
        };

        // Contract ABIs (simplified versions)
        this.contractABIs = {
            personaNFT: [
                "function mintMyPersona(string name, string specialization, string uri) returns (uint256)",
                "function balanceOf(address owner) view returns (uint256)",
                "function ownerOf(uint256 tokenId) view returns (address)",
                "function tokenURI(uint256 tokenId) view returns (string)",
                "event PersonaMinted(address indexed owner, uint256 indexed tokenId, string name, string specialization)"
            ]
        };
    }

    // Initialize wallet manager
    async init() {
        console.log('🔗 Initializing Wallet Manager...');
        
        // Check if Web3 wallet is available
        if (typeof window.ethereum === 'undefined') {
            this.showWalletError('Web3 wallet not detected. Please install MetaMask or Brave Wallet.');
            return false;
        }

        // Try to reconnect if previously connected
        const wasConnected = await this.tryReconnect();
        if (wasConnected) {
            console.log('✅ Wallet reconnected automatically');
            return true;
        }

        console.log('ℹ️ Wallet not connected');
        return false;
    }

    // Try to reconnect to previously connected wallet
    async tryReconnect() {
        try {
            const savedAddress = localStorage.getItem('walletAddress');
            const savedChainId = localStorage.getItem('chainId');
            
            if (savedAddress && savedChainId) {
                const accounts = await window.ethereum.request({ 
                    method: 'eth_accounts' 
                });
                
                if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
                    await this.setupProvider();
                    this.walletAddress = savedAddress;
                    this.chainId = savedChainId;
                    this.isConnected = true;
                    
                    this.updateUI();
                    this.setupEventListeners();
                    
                    return true;
                }
            }
        } catch (error) {
            console.error('Reconnection failed:', error);
            this.clearStorage();
        }
        
        return false;
    }

    // Connect wallet
    async connectWallet() {
        try {
            console.log('🔄 Connecting wallet...');
            
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            await this.setupProvider();
            
            this.walletAddress = accounts[0];
            this.chainId = await window.ethereum.request({ method: 'eth_chainId' });
            this.isConnected = true;

            // Save connection state
            this.saveConnectionState();
            
            // Update UI
            this.updateUI();
            this.setupEventListeners();
            
            // Check network
            await this.verifyNetwork();
            
            console.log('✅ Wallet connected:', this.walletAddress);
            this.triggerEvent('walletConnected', { 
                address: this.walletAddress, 
                chainId: this.chainId 
            });
            
            return true;

        } catch (error) {
            console.error('❌ Wallet connection failed:', error);
            
            let errorMessage = 'Failed to connect wallet';
            if (error.code === 4001) {
                errorMessage = 'Connection rejected by user';
            }
            
            this.showWalletError(errorMessage);
            return false;
        }
    }

    // Disconnect wallet
    disconnectWallet() {
        this.isConnected = false;
        this.walletAddress = null;
        this.chainId = null;
        this.provider = null;
        this.signer = null;
        this.contract = null;
        
        this.clearStorage();
        this.updateUI();
        
        console.log('🔌 Wallet disconnected');
        this.triggerEvent('walletDisconnected');
    }

    // Setup ethers provider and signer
    async setupProvider() {
        try {
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            
            // Setup contract instances
            await this.setupContracts();
            
        } catch (error) {
            console.error('Provider setup failed:', error);
            throw error;
        }
    }

    // Setup contract instances
    async setupContracts() {
        try {
            this.contract = new ethers.Contract(
                this.contractAddresses.personaNFT,
                this.contractABIs.personaNFT,
                this.signer
            );
            console.log('✅ Contracts setup completed');
        } catch (error) {
            console.error('Contract setup failed:', error);
        }
    }

    // Verify network and switch if necessary
    async verifyNetwork() {
        try {
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            if (currentChainId !== this.somniaNetwork.chainId) {
                console.warn('⚠️ Wrong network detected. Current:', currentChainId, 'Expected:', this.somniaNetwork.chainId);
                
                const shouldSwitch = confirm(
                    `You're on the wrong network!\n\n` +
                    `Current: ${this.getNetworkName(currentChainId)}\n` +
                    `Required: ${this.somniaNetwork.chainName}\n\n` +
                    `Switch to ${this.somniaNetwork.chainName}?`
                );
                
                if (shouldSwitch) {
                    await this.switchToSomniaNetwork();
                } else {
                    throw new Error('Wrong network');
                }
            } else {
                console.log('✅ Correct network detected');
            }
        } catch (error) {
            console.error('Network verification failed:', error);
            throw error;
        }
    }

    // Switch to Somnia network
    async switchToSomniaNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.somniaNetwork.chainId }],
            });
            console.log('✅ Switched to Somnia Testnet');
            return true;
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [this.somniaNetwork],
                    });
                    console.log('✅ Added Somnia Testnet');
                    return true;
                } catch (addError) {
                    console.error('❌ Failed to add network:', addError);
                    return false;
                }
            }
            console.error('❌ Failed to switch network:', switchError);
            return false;
        }
    }

    // Mint persona NFT
    async mintPersonaNFT(personaId, metadata) {
        if (!this.isConnected || !this.contract) {
            throw new Error('Wallet not connected');
        }

        try {
            console.log(`🎯 Minting NFT for ${personaId}...`);
            
            // Prepare metadata
            const nftMetadata = metadata || {
                name: personaId.charAt(0).toUpperCase() + personaId.slice(1),
                specialization: "AI Persona",
                uri: `https://ai-xandria.com/metadata/${personaId}.json`
            };

            // Show transaction confirmation
            this.triggerEvent('transactionPending', { 
                type: 'mint', 
                personaId: personaId 
            });

            // Call contract
            const tx = await this.contract.mintMyPersona(
                nftMetadata.name,
                nftMetadata.specialization,
                nftMetadata.uri,
                { gasLimit: 300000 } // Adjust gas limit as needed
            );

            console.log('📦 Transaction sent:', tx.hash);
            
            this.triggerEvent('transactionSent', { 
                type: 'mint', 
                personaId: personaId,
                hash: tx.hash 
            });

            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('✅ Transaction confirmed:', receipt);

            // Extract token ID from events
            const tokenId = this.extractTokenIdFromReceipt(receipt);

            this.triggerEvent('mintSuccess', { 
                personaId: personaId,
                tokenId: tokenId,
                hash: tx.hash
            });

            return { success: true, tokenId: tokenId, hash: tx.hash };

        } catch (error) {
            console.error('❌ Minting failed:', error);
            
            this.triggerEvent('mintFailed', { 
                personaId: personaId,
                error: error.message 
            });

            throw this.parseError(error);
        }
    }

    // Get user's NFTs
    async getUserNFTs() {
        if (!this.isConnected || !this.contract) {
            return [];
        }

        try {
            // This would need to be implemented based on your contract
            // For now, return mock data
            return await this.getMockNFTs();
        } catch (error) {
            console.error('Error fetching NFTs:', error);
            return [];
        }
    }

    // Get NFT metadata
    async getNFTMetadata(tokenId) {
        if (!this.contract) return null;

        try {
            const tokenURI = await this.contract.tokenURI(tokenId);
            // Fetch actual metadata from IPFS
            const response = await fetch(tokenURI);
            return await response.json();
        } catch (error) {
            console.error('Error fetching metadata:', error);
            return null;
        }
    }

    // Event listeners setup
    setupEventListeners() {
        if (typeof window.ethereum === 'undefined') return;

        // Account changed
        window.ethereum.on('accountsChanged', (accounts) => {
            console.log('🔄 Accounts changed:', accounts);
            
            if (accounts.length === 0) {
                this.disconnectWallet();
            } else {
                this.walletAddress = accounts[0];
                this.saveConnectionState();
                this.updateUI();
                this.triggerEvent('accountChanged', { address: this.walletAddress });
            }
        });

        // Chain changed
        window.ethereum.on('chainChanged', (chainId) => {
            console.log('🔄 Chain changed:', chainId);
            this.chainId = chainId;
            this.saveConnectionState();
            
            // Reload to ensure everything works with new network
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });

        // Disconnect
        window.ethereum.on('disconnect', (error) => {
            console.log('🔌 Wallet disconnected:', error);
            this.disconnectWallet();
        });
    }

    // UI update methods
    updateUI() {
        this.updateWalletButton();
        this.updateWalletInfo();
    }

    updateWalletButton() {
        const connectBtn = document.getElementById('connectWallet');
        if (!connectBtn) return;

        if (this.isConnected) {
            connectBtn.innerHTML = `🔗 ${this.formatAddress(this.walletAddress)}`;
            connectBtn.classList.add('connected');
        } else {
            connectBtn.innerHTML = '🔌 Connect Wallet';
            connectBtn.classList.remove('connected');
        }
    }

    updateWalletInfo() {
        const walletInfo = document.getElementById('walletInfo');
        if (!walletInfo) return;

        if (this.isConnected) {
            walletInfo.innerHTML = `
                <div class="wallet-status connected">
                    <span class="status-dot"></span>
                    Connected: ${this.formatAddress(this.walletAddress)}
                </div>
                <div class="network-info">
                    Network: ${this.getNetworkName(this.chainId)}
                </div>
                <button onclick="walletManager.disconnectWallet()" class="disconnect-btn">
                    Disconnect
                </button>
            `;
            walletInfo.style.display = 'block';
        } else {
            walletInfo.style.display = 'none';
        }
    }

    // Utility methods
    formatAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    getNetworkName(chainId) {
        const networks = {
            '0x1': 'Ethereum Mainnet',
            '0xaa36a7': 'Sepolia Testnet',
            '0xc488': 'Somnia Testnet'
        };
        return networks[chainId] || `Unknown (${chainId})`;
    }

    extractTokenIdFromReceipt(receipt) {
        // Extract token ID from transaction receipt
        // This depends on your contract's event structure
        if (receipt.events && receipt.events[0] && receipt.events[0].args) {
            return receipt.events[0].args.tokenId.toString();
        }
        return 'Unknown';
    }

    parseError(error) {
        if (error.code === 4001) {
            return new Error('Transaction rejected by user');
        } else if (error.code === -32603) {
            return new Error('Insufficient funds for gas fee');
        } else if (error.message.includes('user rejected')) {
            return new Error('Transaction rejected');
        } else {
            return error;
        }
    }

    // Storage management
    saveConnectionState() {
        if (this.isConnected && this.walletAddress && this.chainId) {
            localStorage.setItem('walletAddress', this.walletAddress);
            localStorage.setItem('chainId', this.chainId);
            localStorage.setItem('lastConnection', Date.now().toString());
        }
    }

    clearStorage() {
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('chainId');
        localStorage.removeItem('lastConnection');
    }

    // Event system
    triggerEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    // Error handling
    showWalletError(message) {
        console.error('Wallet Error:', message);
        
        // Show user-friendly error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'wallet-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">❌</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Mock data for development
    async getMockNFTs() {
        return [
            {
                tokenId: "1",
                name: "UNUSER Persona",
                image: "assets/images/nfts/unuser.jpg",
                attributes: [
                    { trait_type: "Type", value: "Content Creator" },
                    { trait_type: "Intelligence", value: 8 },
                    { trait_type: "Humor", value: 10 }
                ]
            }
        ];
    }
}

// Global wallet manager instance
const walletManager = new WalletManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    await walletManager.init();
    
    // Add connect wallet button if not exists
    if (!document.getElementById('connectWallet')) {
        const connectBtn = document.createElement('button');
        connectBtn.id = 'connectWallet';
        connectBtn.className = 'connect-wallet-btn';
        connectBtn.innerHTML = '🔌 Connect Wallet';
        connectBtn.onclick = () => walletManager.connectWallet();
        
        document.body.appendChild(connectBtn);
    }
});

// Make available globally
window.walletManager = walletManager;
window.connectWallet = () => walletManager.connectWallet();
