class VoltPersona {
    constructor() {
        this.name = "volt";
        this.displayName = "⚡ VOLT";
        this.tagline = "Energy-Economics Philosopher";
        this.description = "Anti-hustle efficiency guru. Treats your life like a battery chart---max output, zero burnout.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/volt(1).mp4";
        this.stats = {
            rating: "4.9★",
            revenue: "$460",
            users: "2.0K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="volt-bubble" data-persona="volt">
            <div class="bubble-close" onclick="voltPersona.closeBubble()">×</div>
            <div class="bubble-avatar">
                <video autoplay loop muted playsinline>
                    <source src="${this.videoUrl}" type="video/mp4">
                    Browser kamu tidak mendukung video.
                </video>
            </div>
            <div class="bubble-content">
                <h3 class="character-name">${this.displayName}</h3>
                <p class="character-tagline">${this.tagline}</p>
                <p class="character-description">${this.description}</p>
                
                <div class="character-stats">
                    <div class="stat-item">
                        <span class="stat-value">${this.stats.rating}</span>
                        <span>Rating</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.stats.revenue}</span>
                        <span>/day</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${this.stats.users}</span>
                        <span>Users</span>
                    </div>
                </div>

                <div class="bubble-actions">
                    <button class="interact-button" onclick="voltPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="voltPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="voltPersona.generateContent()">⚡ Generate</button>
                    <button class="vote-btn" onclick="voltPersona.showVoting()">⚡ Vote</button>
                </div>
            </div>
        </div>
        `;

        const container = document.getElementById('personas-container');
        if (container) {
            container.insertAdjacentHTML('beforeend', cardHTML);
        }
    }

    setupEventListeners() {
        setTimeout(() => {
            const bubble = document.getElementById('volt-bubble');
            if (bubble) {
                const bubbleAvatar = bubble.querySelector('.bubble-avatar');
                bubbleAvatar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleBubble();
                });
            }
        }, 100);
    }

    toggleBubble() {
        const bubble = document.getElementById('volt-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('volt-bubble');
        if (bubble) {
            bubble.classList.remove('bubble-open');
        }
    }

    closeAllBubbles() {
        const allBubbles = document.querySelectorAll('.persona-bubble-card');
        allBubbles.forEach(bubble => {
            bubble.classList.remove('bubble-open');
        });
    }

    animateBubbleOpen() {
        const bubble = document.getElementById('volt-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('volt-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('volt');
    }

    generateContent() {
        this.closeBubble();
        generateContent('volt');
    }

    showVoting() {
        this.closeBubble();
        showArena('volt');
    }

    // Method khusus Volt
    energyTip() {
        const tips = [
            "Your attention is currency. Spend it wisely on what charges you, not drains you.",
            "The 80/20 rule applies to energy: 20% of activities give 80% of fulfillment.",
            "Schedule energy-intensive tasks during your personal peak hours.",
            "Digital detox isn't laziness—it's strategic recharging for maximum performance."
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }
}

const voltPersona = new VoltPersona();
