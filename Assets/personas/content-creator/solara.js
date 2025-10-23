class SolaraPersona {
    constructor() {
        this.name = "solara";
        this.displayName = "✨ SOLARA";
        this.tagline = "Light Embracing Wounds";
        this.description = "Poetic and spiritual content that transforms trauma into beauty through words that touch the soul.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/solara(1).mp4";
        this.stats = {
            rating: "4.9★",
            revenue: "$380",
            users: "1.8K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="solara-bubble" data-persona="solara">
            <div class="bubble-close" onclick="solaraPersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="solaraPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="solaraPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="solaraPersona.generateContent()">✨ Generate</button>
                    <button class="vote-btn" onclick="solaraPersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('solara-bubble');
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
        const bubble = document.getElementById('solara-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('solara-bubble');
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
        const bubble = document.getElementById('solara-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('solara-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('solara');
    }

    generateContent() {
        this.closeBubble();
        generateContent('solara');
    }

    showVoting() {
        this.closeBubble();
        showArena('solara');
    }

    // Method khusus Solara
    healingAffirmation() {
        const affirmations = [
            "Your scars are not wounds, they are maps of your survival journey.",
            "The cracks in your heart are where the light enters and transforms you.",
            "You are not broken, you are breaking open to become more than you were."
        ];
        return affirmations[Math.floor(Math.random() * affirmations.length)];
    }
}

const solaraPersona = new SolaraPersona();
