class FluxPersona {
    constructor() {
        this.name = "flux";
        this.displayName = "🌊 FLUX";
        this.tagline = "Change Philosophy Evangelist";
        this.description = "Heraclitean flow-state coach. Teaches you to surf chaos instead of building walls against it.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/flux(1).mp4";
        this.stats = {
            rating: "4.9★",
            revenue: "$370",
            users: "2.3K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="flux-bubble" data-persona="flux">
            <div class="bubble-close" onclick="fluxPersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="fluxPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="fluxPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="fluxPersona.generateContent()">🌊 Generate</button>
                    <button class="vote-btn" onclick="fluxPersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('flux-bubble');
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
        const bubble = document.getElementById('flux-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('flux-bubble');
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
        const bubble = document.getElementById('flux-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('flux-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('flux');
    }

    generateContent() {
        this.closeBubble();
        generateContent('flux');
    }

    showVoting() {
        this.closeBubble();
        showArena('flux');
    }

    // Method khusus Flux
    flowWisdom() {
        const wisdoms = [
            "You cannot step into the same river twice, for new waters are always flowing.",
            "The obstacle in the path becomes the path. Never forget, within every obstacle is an opportunity.",
            "What you resist persists. What you accept transforms.",
            "Be like water making its way through cracks. Adjust to the object, and you shall find a way around or through it."
        ];
        return wisdoms[Math.floor(Math.random() * wisdoms.length)];
    }
}

const fluxPersona = new FluxPersona();
