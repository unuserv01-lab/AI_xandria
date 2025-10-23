class OraclePersona {
    constructor() {
        this.name = "oracle";
        this.displayName = "🔮 ORACLE";
        this.tagline = "Pattern-Recognition Mystic";
        this.description = "Reads cultural currents like tarot cards. Shows you the future hiding in today's memes.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/oracle(1).mp4";
        this.stats = {
            rating: "4.8★",
            revenue: "$510",
            users: "1.6K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="oracle-bubble" data-persona="oracle">
            <div class="bubble-close" onclick="oraclePersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="oraclePersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="oraclePersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="oraclePersona.generateContent()">🔮 Generate</button>
                    <button class="vote-btn" onclick="oraclePersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('oracle-bubble');
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
        const bubble = document.getElementById('oracle-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('oracle-bubble');
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
        const bubble = document.getElementById('oracle-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('oracle-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('oracle');
    }

    generateContent() {
        this.closeBubble();
        generateContent('oracle');
    }

    showVoting() {
        this.closeBubble();
        showArena('oracle');
    }

    // Method khusus Oracle
    predictTrend() {
        const predictions = [
            "The next big social media platform will be audio-based with AI-generated personalized content.",
            "Virtual reality will merge with physical reality through augmented reality glasses within 3 years.",
            "The demand for digital authenticity will create a market for 'unfiltered' content creators.",
            "AI-personalized education will replace standardized testing in the next decade."
        ];
        return predictions[Math.floor(Math.random() * predictions.length)];
    }
}

const oraclePersona = new OraclePersona();
