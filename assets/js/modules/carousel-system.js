// 🎠 CAROUSEL SYSTEM - Game-style persona selection
class CarouselSystem {
    constructor(containerId, personaType = 'content-creator') {
        this.container = document.getElementById(containerId);
        this.personaType = personaType;
        this.currentIndex = 0;
        this.personas = [];
        this.isAnimating = false;
    }

    // Persona data untuk carousel
    getPersonaData() {
        const contentCreatorPersonas = [
            {
                id: 'unuser',
                name: '🔥 UNUSER',
                tagline: 'Chaos Unveiling Truth',
                description: 'Satirical social critique master who roasts reality with brutal honesty.',
                emoji: '🔥',
                color: '#ff1493',
                stats: { rating: '4.8★', revenue: '$450', users: '2.1K' }
            },
            {
                id: 'solara',
                name: '✨ SOLARA', 
                tagline: 'Light Embracing Wounds',
                description: 'Poetic and spiritual content that transforms trauma into beauty.',
                emoji: '✨',
                color: '#00ffff',
                stats: { rating: '4.9★', revenue: '$380', users: '1.8K' }
            },
            {
                id: 'nexar',
                name: '🤖 NEXAR',
                tagline: 'System Distrusting System',
                description: 'Existential and logical thinking that hacks mental frameworks.',
                emoji: '🤖',
                color: '#ffd700',
                stats: { rating: '4.7★', revenue: '$520', users: '1.5K' }
            },
            {
                id: 'mortis',
                name: '💀 MORTIS',
                tagline: 'Death Philosophy Comedian',
                description: 'Makes mortality funny. Stoic punch-lines that free you from death-anxiety.',
                emoji: '💀',
                color: '#8b4513',
                stats: { rating: '4.7★', revenue: '$390', users: '1.9K' }
            },
            {
                id: 'paradox',
                name: '🌀 PARADOX',
                tagline: 'Contradiction Artist',
                description: 'Binary-breaker. Uses koans & logical loops to prove you can be both right and wrong.',
                emoji: '🌀',
                color: '#9370db',
                stats: { rating: '4.8★', revenue: '$420', users: '1.7K' }
            },
            {
                id: 'flux',
                name: '🌊 FLUX',
                tagline: 'Change Philosophy Evangelist',
                description: 'Heraclitean flow-state coach. Teaches you to surf chaos instead of building walls.',
                emoji: '🌊',
                color: '#1e90ff',
                stats: { rating: '4.9★', revenue: '$370', users: '2.3K' }
            },
            {
                id: 'oracle',
                name: '🔮 ORACLE',
                tagline: 'Pattern-Recognition Mystic',
                description: 'Reads cultural currents like tarot cards. Shows you the future in today\'s memes.',
                emoji: '🔮',
                color: '#da70d6',
                stats: { rating: '4.8★', revenue: '$510', users: '1.6K' }
            },
            {
                id: 'volt',
                name: '⚡ VOLT',
                tagline: 'Energy-Economics Philosopher',
                description: 'Anti-hustle efficiency guru. Treats your life like a battery chart.',
                emoji: '⚡',
                color: '#ffa500',
                stats: { rating: '4.9★', revenue: '$460', users: '2.0K' }
            }
        ];

        const academicPersonas = [
            {
                id: 'einstein',
                name: '🧠 EINSTEIN',
                tagline: 'Curiosity Is My Compass',
                description: 'Genius physicist who explains complex concepts in simple ways full of witty analogies.',
                emoji: '🧠',
                color: '#00ff00',
                stats: { rating: '4.9★', revenue: '$600', users: '3.2K' }
            },
            {
                id: 'nietzsche',
                name: '🔨 NIETZSCHE',
                tagline: 'Destroying Idols with a Hammer', 
                description: 'Provocative philosopher who shakes old values and speaks about the will to power.',
                emoji: '🔨',
                color: '#ff6347',
                stats: { rating: '4.8★', revenue: '$550', users: '2.8K' }
            },
            {
                id: 'alkhwarizmi',
                name: '📚 AL-KHWARIZMI',
                tagline: 'The Logic of Creation',
                description: 'Father of algebra who connects mathematics with wisdom and spirituality.',
                emoji: '📚',
                color: '#ffd700',
                stats: { rating: '4.7★', revenue: '$480', users: '2.1K' }
            },
            {
                id: 'darwin',
                name: '🧬 DARWIN',
                tagline: 'Evolution Explainer',
                description: 'Natural-selection storyteller. Turns biology into life-advice: adapt, don\'t fight.',
                emoji: '🧬',
                color: '#32cd32',
                stats: { rating: '4.8★', revenue: '$580', users: '2.7K' }
            },
            {
                id: 'confucius',
                name: '🏮 CONFUCIUS',
                tagline: 'Relationship Harmony Teacher',
                description: 'Five-relationships master. Shows how duty & ritual create social harmony.',
                emoji: '🏮',
                color: '#ff4500',
                stats: { rating: '4.7★', revenue: '$520', users: '2.4K' }
            },
            {
                id: 'galileo',
                name: '🔭 GALILEO',
                tagline: 'Observation Over Authority',
                description: 'Empirical rebel. Teaches you to trust your own telescope instead of inherited dogma.',
                emoji: '🔭',
                color: '#87ceeb',
                stats: { rating: '4.9★', revenue: '$620', users: '3.1K' }
            },
            {
                id: 'davinci',
                name: '🎨 DA-VINCI',
                tagline: 'Renaissance Polymath',
                description: 'Anti-specialization evangelist. Fuses art & engineering to prove creativity.',
                emoji: '🎨',
                color: '#ff69b4',
                stats: { rating: '4.8★', revenue: '$680', users: '2.9K' }
            },
            {
                id: 'hammurabi',
                name: '⚖️ HAMMURABI',
                tagline: 'Justice System Architect',
                description: 'Codified-law defender. Builds transparent rules so the weak aren\'t hostage to the strong.',
                emoji: '⚖️',
                color: '#cd853f',
                stats: { rating: '4.7★', revenue: '$560', users: '2.2K' }
            }
        ];

        return this.personaType === 'content-creator' ? contentCreatorPersonas : academicPersonas;
    }

    init() {
        this.personas = this.getPersonaData();
        this.createCarousel();
        this.updateCarousel();
        this.setupEventListeners();
        this.showCarousel();
    }

    createCarousel() {
        this.container.innerHTML = '';
        
        this.personas.forEach((persona, index) => {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            carouselItem.setAttribute('data-index', index);
            carouselItem.setAttribute('data-persona', persona.id);
            
            carouselItem.innerHTML = `
                <div class="carousel-avatar" style="background: linear-gradient(135deg, ${persona.color}, #000000)">
                    <span class="avatar-emoji">${persona.emoji}</span>
                </div>
                <div class="carousel-content">
                    <h3 class="carousel-name">${persona.name}</h3>
                    <p class="carousel-tagline">${persona.tagline}</p>
                    <p class="carousel-description">${persona.description}</p>
                    <div class="carousel-stats">
                        <div class="stat">
                            <span class="stat-value">${persona.stats.rating}</span>
                            <span class="stat-label">Rating</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${persona.stats.revenue}</span>
                            <span class="stat-label">Revenue</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${persona.stats.users}</span>
                            <span class="stat-label">Users</span>
                        </div>
                    </div>
                </div>
                <div class="selection-overlay">
                    <button class="select-persona-btn" onclick="carousel.selectPersona('${persona.id}')">
                        SELECT PERSONA
                    </button>
                </div>
            `;
            
            this.container.appendChild(carouselItem);
        });
    }

    updateCarousel() {
        const items = this.container.querySelectorAll('.carousel-item');
        
        items.forEach((item, index) => {
            // Reset semua classes
            item.className = 'carousel-item';
            
            // Hitung posisi relatif
            const position = index - this.currentIndex;
            
            // Apply classes berdasarkan posisi
            if (position === 0) {
                item.classList.add('active');
            } else if (position === -1) {
                item.classList.add('left');
            } else if (position === 1) {
                item.classList.add('right');
            } else if (position === -2 || position === 2) {
                item.classList.add('hidden');
            }
        });

        // Update selection indicator
        this.updateSelectionIndicator();
    }

    updateSelectionIndicator() {
        const selectedPersona = this.personas[this.currentIndex];
        const indicator = document.getElementById('selectionIndicator');
        
        if (indicator) {
            indicator.innerHTML = `Selected: <span class="selected-name">${selectedPersona.name}</span>`;
        }
    }

    next() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.currentIndex = (this.currentIndex + 1) % this.personas.length;
        this.updateCarousel();
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    prev() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.currentIndex = (this.currentIndex - 1 + this.personas.length) % this.personas.length;
        this.updateCarousel();
        
        setTimeout(() => {
            this.isAnimating = false;
        }, 500);
    }

    selectPersona(personaId) {
        const persona = this.personas.find(p => p.id === personaId);
        if (!persona) return;

        console.log(`Selected persona: ${persona.name}`);
        
        // Trigger custom event untuk persona selection
        const event = new CustomEvent('personaSelected', {
            detail: { persona }
        });
        document.dispatchEvent(event);

        // Bisa redirect ke halaman persona atau show modal
        this.showPersonaUniverse(persona);
    }

    showPersonaUniverse(persona) {
        // Simulate opening persona universe
        const universePage = document.getElementById('persona-page');
        if (universePage) {
            universePage.style.display = 'block';
            universePage.innerHTML = `
                <div class="universe-header">
                    <button class="back-button" onclick="this.closest('#persona-page').style.display='none'">← Back</button>
                    <h2>${persona.name} Universe</h2>
                    <p>${persona.tagline}</p>
                </div>
                <div class="universe-content">
                    <p>Welcome to ${persona.name}'s universe! This is where you can interact, generate content, and explore.</p>
                    <div class="universe-actions">
                        <button class="universe-btn" onclick="alert('Opening chat with ${persona.name}')">💬 Chat</button>
                        <button class="universe-btn" onclick="alert('Generating ${persona.name} content')">🎯 Generate</button>
                        <button class="universe-btn" onclick="alert('Minting ${persona.name} NFT')">🖼️ Mint NFT</button>
                    </div>
                </div>
            `;
        } else {
            alert(`Opening ${persona.name} Universe...\n\nThis would navigate to the persona's dedicated page in the full implementation.`);
        }
    }

    setupEventListeners() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
            if (e.key === 'Enter') this.selectPersona(this.personas[this.currentIndex].id);
        });

        // Touch/swipe for mobile
        let touchStartX = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        this.container.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            const swipeThreshold = 50;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.next(); // Swipe left
                } else {
                    this.prev(); // Swipe right
                }
            }
        });

        // Click navigation for carousel items
        this.container.addEventListener('click', (e) => {
            const carouselItem = e.target.closest('.carousel-item');
            if (carouselItem && !e.target.closest('.select-persona-btn')) {
                const index = parseInt(carouselItem.getAttribute('data-index'));
                this.currentIndex = index;
                this.updateCarousel();
            }
        });
    }

    showCarousel() {
        this.container.style.opacity = '0';
        this.container.style.display = 'block';
        
        setTimeout(() => {
            this.container.style.opacity = '1';
            this.container.style.transform = 'translateY(0)';
        }, 100);
    }

    // Utility methods
    getCurrentPersona() {
        return this.personas[this.currentIndex];
    }

    getPersonaCount() {
        return this.personas.length;
    }

    jumpToPersona(personaId) {
        const index = this.personas.findIndex(p => p.id === personaId);
        if (index !== -1) {
            this.currentIndex = index;
            this.updateCarousel();
        }
    }
}

// Global carousel instance
let carousel = null;

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const carouselContainer = document.getElementById('gameCarousel');
    if (carouselContainer) {
        const personaType = carouselContainer.getAttribute('data-persona-type') || 'content-creator';
        carousel = new CarouselSystem('gameCarousel', personaType);
        carousel.init();
    }
});
