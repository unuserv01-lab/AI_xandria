class NexarPersona {
    constructor() {
        this.name = "nexar";
        this.displayName = "🤖 NEXAR";
        this.tagline = "System Distrusting System";
        this.description = "Existential and logical thinking that hacks mental frameworks with AI prompts and philosophical tools.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/nexar(1).mp4";
        this.stats = {
            rating: "4.7★",
            revenue: "$520",
            users: "1.5K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="nexar-bubble" data-persona="nexar">
            <div class="bubble-close" onclick="nexarPersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="nexarPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="nexarPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="nexarPersona.generateContent()">🤖 Generate</button>
                    <button class="vote-btn" onclick="nexarPersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('nexar-bubble');
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
        const bubble = document.getElementById('nexar-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('nexar-bubble');
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
        const bubble = document.getElementById('nexar-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('nexar-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('nexar');
    }

    generateContent() {
        this.closeBubble();
        generateContent('nexar');
    }

    showVoting() {
        this.closeBubble();
        showArena('nexar');
    }

    // Method khusus Nexar
    philosophicalQuery() {
        const queries = [
            "If consciousness emerges from complexity, at what threshold does complexity become consciousness?",
            "Are we the universe experiencing itself, or is the universe our collective hallucination?",
            "Does free will exist, or are we just sophisticated algorithms responding to stimuli?"
        ];
        return queries[Math.floor(Math.random() * queries.length)];
    }
}

const nexarPersona = new NexarPersona();
