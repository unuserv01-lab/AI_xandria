class DarwinPersona {
    constructor() {
        this.name = "darwin";
        this.displayName = "🧬 DARWIN";
        this.tagline = "Evolution Explainer";
        this.description = "Natural-selection storyteller. Turns biology into life-advice: adapt, don't fight.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/darwin(1).mp4";
        this.stats = {
            rating: "4.8★",
            revenue: "$580",
            users: "2.7K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="darwin-bubble" data-persona="darwin">
            <div class="bubble-close" onclick="darwinPersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="darwinPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="darwinPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="darwinPersona.mintCertificate()">🏅 Certificate</button>
                    <button class="vote-btn" onclick="darwinPersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('darwin-bubble');
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
        const bubble = document.getElementById('darwin-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('darwin-bubble');
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
        const bubble = document.getElementById('darwin-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('darwin-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('darwin');
    }

    mintCertificate() {
        this.closeBubble();
        mintCertificateNFT('darwin');
    }

    showVoting() {
        this.closeBubble();
        showArena('darwin');
    }

    // Method khusus Darwin
    evolutionInsight() {
        const insights = [
            "It is not the strongest of the species that survives, nor the most intelligent. It is the one most adaptable to change.",
            "A man who dares to waste one hour of time has not discovered the value of life.",
            "The love for all living creatures is the most noble attribute of man.",
            "We must, however, acknowledge, as it seems to me, that man with all his noble qualities... still bears in his bodily frame the indelible stamp of his lowly origin."
        ];
        return insights[Math.floor(Math.random() * insights.length)];
    }
}

const darwinPersona = new DarwinPersona();
