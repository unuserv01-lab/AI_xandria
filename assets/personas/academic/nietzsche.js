class NietzschePersona {
    constructor() {
        this.name = "nietzsche";
        this.displayName = "🔨 NIETZSCHE";
        this.tagline = "Destroying Idols with a Hammer";
        this.description = "Provocative philosopher who shakes old values and speaks about the will to power.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/nietzsche(1).mp4";
        this.stats = {
            rating: "4.8★",
            revenue: "$550",
            users: "2.8K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="nietzsche-bubble" data-persona="nietzsche">
            <div class="bubble-close" onclick="nietzschePersona.closeBubble()">×</div>
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
                        <span>Students</span>
                    </div>
                </div>

                <div class="bubble-actions">
                    <button class="interact-button" onclick="nietzschePersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="nietzschePersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="nietzschePersona.mintCertificate()">🏅 Certificate</button>
                    <button class="vote-btn" onclick="nietzschePersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('nietzsche-bubble');
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
        const bubble = document.getElementById('nietzsche-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('nietzsche-bubble');
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
        const bubble = document.getElementById('nietzsche-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('nietzsche-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('nietzsche');
    }

    mintCertificate() {
        this.closeBubble();
        mintCertificateNFT('nietzsche');
    }

    showVoting() {
        this.closeBubble();
        showArena('nietzsche');
    }

    // Method khusus Nietzsche
    philosophicalHammer() {
        const hammers = [
            "What does not kill me makes me stronger.",
            "He who has a why to live can bear almost any how.",
            "In heaven, all the interesting people are missing.",
            "Without music, life would be a mistake."
        ];
        return hammers[Math.floor(Math.random() * hammers.length)];
    }
}
