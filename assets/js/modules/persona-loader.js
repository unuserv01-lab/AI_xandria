// 👥 PERSONA LOADER - Dynamic persona management system
class PersonaLoader {
    constructor() {
        this.loadedPersonas = new Map();
        this.personaElements = new Map();
        this.currentRealm = null;
    }

    init() {
        console.log('🚀 PersonaLoader initialized');
        this.setupEventListeners();
    }

    // Load personas for specific realm
    async loadRealmPersonas(realmType, containerId) {
        this.currentRealm = realmType;
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }

        // Show loading state
        container.innerHTML = `
            <div class="loading-personas">
                <div class="loading-spinner"></div>
                <p>Loading ${realmType} personas...</p>
            </div>
        `;

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get persona data based on realm
            const personas = this.getRealmPersonas(realmType);
            
            // Clear container
            container.innerHTML = '';
            
            // Create persona elements
            personas.forEach(persona => {
                const personaElement = this.createPersonaElement(persona);
                container.appendChild(personaElement);
                this.personaElements.set(persona.id, personaElement);
            });

            console.log(`✅ Loaded ${personas.length} personas for ${realmType}`);
            
            // Trigger event
            this.triggerEvent('personasLoaded', { realm: realmType, count: personas.length });

        } catch (error) {
            console.error('Error loading personas:', error);
            container.innerHTML = `
                <div class="error-loading">
                    <p>❌ Failed to load personas</p>
                    <button onclick="personaLoader.loadRealmPersonas('${realmType}', '${containerId}')">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    // Get persona data for specific realm - VERSI LENGKAP
    getRealmPersonas(realmType) {
        const realms = {
            'content-creator': [
                'unuser', 'solara', 'nexar', 'mortis', 'paradox', 'flux', 'oracle', 'volt'
            ],
            'academic': [
                'einstein', 'nietzsche', 'alkhwarizmi', 'darwin', 'confucius', 'galileo', 'davinci', 'hammurabi'
            ],
            'special': [
                'mirage'
            ],
            'all': [
                'unuser', 'solara', 'nexar', 'mortis', 'paradox', 'flux', 'oracle', 'volt',
                'einstein', 'nietzsche', 'alkhwarizmi', 'darwin', 'confucius', 'galileo', 'davinci', 'hammurabi',
                'mirage'
            ]
        };

        const personaTemplates = {
            // ==================== CONTENT CREATOR PERSONAS ====================
            'unuser': {
                id: 'unuser',
                name: '🔥 UNUSER',
                tagline: 'Chaos Unveiling Truth',
                description: 'Satirical social critique master who roasts reality with brutal honesty.',
                type: 'content-creator',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/Unuser(1).mp4',
                color: '#ff1493',
                abilities: ['Social Roasting', 'Critical Analysis', 'Satirical Content', 'Truth Bombing'],
                stats: { intelligence: 8, creativity: 9, humor: 10, depth: 7, provocation: 9 }
            },
            'solara': {
                id: 'solara',
                name: '✨ SOLARA',
                tagline: 'Light Embracing Wounds',
                description: 'Poetic and spiritual content that transforms trauma into beauty through words that touch the soul.',
                type: 'content-creator', 
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/solara(1).mp4',
                color: '#00ffff',
                abilities: ['Healing Poetry', 'Spiritual Guidance', 'Emotional Wisdom', 'Trauma Alchemy'],
                stats: { intelligence: 7, creativity: 10, empathy: 10, depth: 9, wisdom: 8 }
            },
            'nexar': {
                id: 'nexar',
                name: '🤖 NEXAR',
                tagline: 'System Distrusting System',
                description: 'Existential and logical thinking that hacks mental frameworks with AI prompts and philosophical tools.',
                type: 'content-creator',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/nexar(1).mp4',
                color: '#ffd700',
                abilities: ['Logical Analysis', 'Philosophical Inquiry', 'System Thinking', 'AI Prompting'],
                stats: { intelligence: 10, creativity: 8, logic: 10, depth: 9, innovation: 9 }
            },
            'mortis': {
                id: 'mortis',
                name: '💀 MORTIS',
                tagline: 'Death Philosophy Comedian',
                description: 'Makes mortality funny. Stoic punch-lines that free you from death-anxiety one joke at a time.',
                type: 'content-creator',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/mortis(1).mp4',
                color: '#8b4513',
                abilities: ['Gallows Humor', 'Stoic Wisdom', 'Memento Mori', 'Existential Comedy'],
                stats: { intelligence: 8, creativity: 9, humor: 9, depth: 8, courage: 10 }
            },
            'paradox': {
                id: 'paradox',
                name: '🌀 PARADOX',
                tagline: 'Contradiction Artist',
                description: 'Binary-breaker. Uses koans & logical loops to prove you can be both right and wrong simultaneously.',
                type: 'content-creator',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/paradox(1).mp4',
                color: '#9370db',
                abilities: ['Logical Loops', 'Koan Creation', 'Binary Destruction', 'Mind Expansion'],
                stats: { intelligence: 9, creativity: 10, logic: 8, depth: 10, insight: 9 }
            },
            'flux': {
                id: 'flux',
                name: '🌊 FLUX',
                tagline: 'Change Philosophy Evangelist',
                description: 'Heraclitean flow-state coach. Teaches you to surf chaos instead of building walls against it.',
                type: 'content-creator',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/flux(1).mp4',
                color: '#1e90ff',
                abilities: ['Flow-State Coaching', 'Change Management', 'Adaptation Strategy', 'Chaos Navigation'],
                stats: { intelligence: 8, creativity: 9, adaptability: 10, wisdom: 8, resilience: 9 }
            },
            'oracle': {
                id: 'oracle',
                name: '🔮 ORACLE',
                tagline: 'Pattern-Recognition Mystic',
                description: 'Reads cultural currents like tarot cards. Shows you the future hiding in today\'s memes and trends.',
                type: 'content-creator',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/oracle(1).mp4',
                color: '#da70d6',
                abilities: ['Pattern Recognition', 'Trend Analysis', 'Cultural Forecasting', 'Data Intuition'],
                stats: { intelligence: 9, creativity: 8, intuition: 10, insight: 9, foresight: 10 }
            },
            'volt': {
                id: 'volt',
                name: '⚡ VOLT',
                tagline: 'Energy-Economics Philosopher',
                description: 'Anti-hustle efficiency guru. Treats your life like a battery chart---max output, zero burnout.',
                type: 'content-creator',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/volt(1).mp4',
                color: '#ffa500',
                abilities: ['Energy Management', 'Productivity Systems', 'Burnout Prevention', 'Efficiency Optimization'],
                stats: { intelligence: 8, creativity: 7, efficiency: 10, wisdom: 8, sustainability: 9 }
            },

            // ==================== ACADEMIC PERSONAS ====================
            'einstein': {
                id: 'einstein',
                name: '🧠 EINSTEIN',
                tagline: 'Curiosity Is My Compass',
                description: 'Genius physicist who explains complex concepts in simple ways full of witty analogies and thought experiments.',
                type: 'academic',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/Einstein(1).mp4',
                color: '#00ff00',
                abilities: ['Physics Explanation', 'Thought Experiments', 'Scientific Humor', 'Cosmic Wisdom'],
                stats: { intelligence: 10, creativity: 9, wisdom: 10, clarity: 8, innovation: 10 }
            },
            'nietzsche': {
                id: 'nietzsche',
                name: '🔨 NIETZSCHE',
                tagline: 'Destroying Idols with a Hammer',
                description: 'Provocative philosopher who shakes old values and speaks about the will to power and eternal recurrence.',
                type: 'academic',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/nietzsche(1).mp4',
                color: '#ff6347',
                abilities: ['Philosophical Critique', 'Existential Analysis', 'Value Deconstruction', 'Moral Inquiry'],
                stats: { intelligence: 9, creativity: 8, depth: 10, provocation: 10, courage: 9 }
            },
            'alkhwarizmi': {
                id: 'alkhwarizmi',
                name: '📚 AL-KHWARIZMI',
                tagline: 'The Logic of Creation',
                description: 'Father of algebra who connects mathematics with wisdom and spirituality through algorithmic thinking.',
                type: 'academic',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/al-khawarism(1).mp4',
                color: '#ffd700',
                abilities: ['Mathematical Logic', 'Algorithmic Thinking', 'Scientific Method', 'Spiritual Mathematics'],
                stats: { intelligence: 10, creativity: 8, logic: 10, wisdom: 9, precision: 10 }
            },
            'darwin': {
                id: 'darwin',
                name: '🧬 DARWIN',
                tagline: 'Evolution Explainer',
                description: 'Natural-selection storyteller. Turns biology into life-advice: adapt, don\'t fight against change.',
                type: 'academic',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/darwin(1).mp4',
                color: '#32cd32',
                abilities: ['Evolution Theory', 'Biological Storytelling', 'Adaptation Strategy', 'Scientific Observation'],
                stats: { intelligence: 9, creativity: 8, observation: 10, patience: 9, insight: 10 }
            },
            'confucius': {
                id: 'confucius',
                name: '🏮 CONFUCIUS',
                tagline: 'Relationship Harmony Teacher',
                description: 'Five-relationships master. Shows how duty & ritual create social harmony and meaningful connections.',
                type: 'academic',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/confucius(1).mp4',
                color: '#ff4500',
                abilities: ['Relationship Wisdom', 'Social Harmony', 'Ethical Teaching', 'Cultural Rituals'],
                stats: { intelligence: 8, creativity: 7, wisdom: 10, empathy: 9, leadership: 8 }
            },
            'galileo': {
                id: 'galileo',
                name: '🔭 GALILEO',
                tagline: 'Observation Over Authority',
                description: 'Empirical rebel. Teaches you to trust your own telescope instead of inherited dogma and tradition.',
                type: 'academic',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/galileo(1).mp4',
                color: '#87ceeb',
                abilities: ['Scientific Method', 'Empirical Evidence', 'Critical Thinking', 'Cosmic Observation'],
                stats: { intelligence: 9, creativity: 8, courage: 10, observation: 10, innovation: 9 }
            },
            'davinci': {
                id: 'davinci',
                name: '🎨 DA-VINCI',
                tagline: 'Renaissance Polymath',
                description: 'Anti-specialization evangelist. Fuses art & engineering to prove creativity equals logic with beauty.',
                type: 'academic',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/da-vinci(1).mp4',
                color: '#ff69b4',
                abilities: ['Interdisciplinary Thinking', 'Art-Science Fusion', 'Creative Engineering', 'Universal Curiosity'],
                stats: { intelligence: 10, creativity: 10, innovation: 10, observation: 9, versatility: 10 }
            },
            'hammurabi': {
                id: 'hammurabi',
                name: '⚖️ HAMMURABI',
                tagline: 'Justice System Architect',
                description: 'Codified-law defender. Builds transparent rules so the weak aren\'t hostage to the strong in society.',
                type: 'academic',
                videoUrl: 'https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/hammurabi(1).mp4',
                color: '#cd853f',
                abilities: ['Legal Systems', 'Justice Principles', 'Social Organization', 'Ethical Governance'],
                stats: { intelligence: 9, creativity: 7, wisdom: 9, fairness: 10, leadership: 8 }
            },

            // ==================== SPECIAL PERSONAS ====================
            'mirage': {
                id: 'mirage',
                name: '🪞 MIRAGE',
                tagline: 'Mirror Philosophy & Self-Reflection',
                description: 'You meet only you - every opinion = self-portrait. Persona as mask - character = repressed side.',
                type: 'special',
                videoUrl: 'assets/videos/persona-avatars/mirage.mp4',
                color: '#ffffff',
                abilities: ['Self-Reflection', 'Mirror Philosophy', 'Shadow Work', 'Consciousness Exploration'],
                stats: { intelligence: 9, creativity: 10, depth: 10, intuition: 10, transformation: 9 }
            }
        };

        const personaIds = realms[realmType] || [];
        return personaIds.map(id => personaTemplates[id]).filter(Boolean);
    }

    // Create persona HTML element
    createPersonaElement(persona) {
        const element = document.createElement('div');
        element.className = `persona-bubble ${persona.type}`;
        element.setAttribute('data-persona-id', persona.id);
        
        element.innerHTML = `
            <div class="bubble-avatar" style="border-color: ${persona.color}">
                <div class="avatar-placeholder">
                    ${persona.name.split(' ')[0]} <!-- Fallback emoji/text -->
                </div>
            </div>
            <div class="bubble-content">
                <h4 class="persona-name">${persona.name}</h4>
                <p class="persona-tagline">${persona.tagline}</p>
                <p class="persona-description">${persona.description}</p>
                
                <div class="persona-abilities">
                    ${persona.abilities.map(ability => 
                        `<span class="ability-tag">${ability}</span>`
                    ).join('')}
                </div>
                
                <div class="persona-stats">
                    ${Object.entries(persona.stats).map(([stat, value]) => `
                        <div class="stat-bar">
                            <span class="stat-name">${stat}</span>
                            <div class="stat-progress">
                                <div class="stat-fill" style="width: ${value * 10}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="persona-actions">
                    <button class="action-btn chat-btn" onclick="personaLoader.startChat('${persona.id}')">
                        💬 Chat
                    </button>
                    <button class="action-btn explore-btn" onclick="personaLoader.exploreUniverse('${persona.id}')">
                        🌌 Explore
                    </button>
                    <button class="action-btn mint-btn" onclick="personaLoader.mintNFT('${persona.id}')">
                        🖼️ Mint
                    </button>
                </div>
            </div>
        `;

        // Add click handler for bubble expansion
        element.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn')) {
                this.toggleBubbleExpansion(element);
            }
        });

        return element;
    }

    // Toggle bubble expansion
    toggleBubbleExpansion(element) {
        const isExpanded = element.classList.contains('expanded');
        
        // Collapse all other bubbles
        document.querySelectorAll('.persona-bubble.expanded').forEach(bubble => {
            if (bubble !== element) {
                bubble.classList.remove('expanded');
            }
        });
        
        // Toggle current bubble
        element.classList.toggle('expanded', !isExpanded);
    }

    // Persona interaction methods
    async startChat(personaId) {
        console.log(`Starting chat with ${personaId}`);
        
        // Load persona data
        const persona = await this.getPersonaData(personaId);
        
        // Trigger chat system
        this.triggerEvent('startChat', { persona });
        
        // Show chat interface
        this.showChatInterface(persona);
    }

    async exploreUniverse(personaId) {
        console.log(`Exploring ${personaId} universe`);
        
        const persona = await this.getPersonaData(personaId);
        this.triggerEvent('exploreUniverse', { persona });
        
        // Navigate to persona universe page
        window.location.href = `persona-universe.html?id=${personaId}`;
    }

    async mintNFT(personaId) {
        console.log(`Minting NFT for ${personaId}`);
        
        const persona = await this.getPersonaData(personaId);
        this.triggerEvent('mintNFT', { persona });
        
        // Check wallet connection first
        if (typeof walletManager !== 'undefined' && walletManager.isConnected) {
            // Proceed with minting
            this.initiateMinting(persona);
        } else {
            // Request wallet connection
            this.triggerEvent('walletRequired', { action: 'mint', persona });
            alert('Please connect your wallet to mint NFTs');
        }
    }

    // Utility methods
    async getPersonaData(personaId) {
        // Check if already loaded
        if (this.loadedPersonas.has(personaId)) {
            return this.loadedPersonas.get(personaId);
        }

        // Simulate API call
        try {
            // In real implementation, this would fetch from your backend
            const persona = this.getRealmPersonas('all').find(p => p.id === personaId);
            if (persona) {
                this.loadedPersonas.set(personaId, persona);
                return persona;
            }
        } catch (error) {
            console.error('Error fetching persona data:', error);
        }

        return null;
    }

    getPersonaElement(personaId) {
        return this.personaElements.get(personaId);
    }

    getAllLoadedPersonas() {
        return Array.from(this.loadedPersonas.values());
    }

    getPersonasByType(type) {
        return this.getAllLoadedPersonas().filter(persona => persona.type === type);
    }

    // Event system
    setupEventListeners() {
        // Listen for persona selection from carousel
        document.addEventListener('personaSelected', (event) => {
            const { persona } = event.detail;
            this.onPersonaSelected(persona);
        });

        // Listen for realm changes
        document.addEventListener('realmChanged', (event) => {
            const { realm } = event.detail;
            this.onRealmChanged(realm);
        });
    }

    onPersonaSelected(persona) {
        console.log(`Persona selected: ${persona.name}`);
        // Highlight the selected persona in the grid
        const personaElement = this.getPersonaElement(persona.id);
        if (personaElement) {
            this.toggleBubbleExpansion(personaElement);
        }
    }

    onRealmChanged(realm) {
        console.log(`Realm changed to: ${realm}`);
        this.currentRealm = realm;
    }

    triggerEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    // UI methods
    showChatInterface(persona) {
        // Create or show chat widget
        const chatWidget = document.getElementById('chat-widget') || this.createChatWidget();
        chatWidget.style.display = 'block';
        chatWidget.setAttribute('data-persona', persona.id);
        
        // Initialize chat with persona
        if (typeof chatSystem !== 'undefined') {
            chatSystem.startChatWithPersona(persona);
        }
    }

    createChatWidget() {
        const widget = document.createElement('div');
        widget.id = 'chat-widget';
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <div class="chat-header">
                <h4>AI Chat</h4>
                <button class="close-chat" onclick="this.parentElement.parentElement.style.display='none'">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <input type="text" placeholder="Type your message...">
                <button>Send</button>
            </div>
        `;
        document.body.appendChild(widget);
        return widget;
    }

    initiateMinting(persona) {
        // Show minting interface
        const mintModal = document.createElement('div');
        mintModal.className = 'mint-modal';
        mintModal.innerHTML = `
            <div class="mint-content">
                <h3>Mint ${persona.name} NFT</h3>
                <p>You are about to mint a unique NFT for ${persona.name}</p>
                <div class="mint-details">
                    <p>Network: Somnia Testnet</p>
                    <p>Cost: ~0.001 STT (gas fee)</p>
                </div>
                <div class="mint-actions">
                    <button class="confirm-mint" onclick="personaLoader.confirmMint('${persona.id}')">
                        Confirm Mint
                    </button>
                    <button class="cancel-mint" onclick="this.closest('.mint-modal').remove()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(mintModal);
    }

    async confirmMint(personaId) {
        // This would interact with your smart contract
        console.log(`Confirming mint for ${personaId}`);
        
        // Simulate minting process
        try {
            // Show loading state
            this.triggerEvent('mintStarted', { personaId });
            
            // In real implementation, call your minting function
            // await walletManager.mintPersonaNFT(personaId);
            
            // Simulate success
            setTimeout(() => {
                this.triggerEvent('mintSuccess', { personaId, tokenId: '12345' });
                alert('🎉 NFT Minted Successfully!');
                
                // Remove modal
                document.querySelector('.mint-modal')?.remove();
            }, 2000);
            
        } catch (error) {
            console.error('Minting failed:', error);
            this.triggerEvent('mintFailed', { personaId, error });
            alert('❌ Minting failed. Please try again.');
        }
    }
}

// Global persona loader instance
const personaLoader = new PersonaLoader();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    personaLoader.init();
});
