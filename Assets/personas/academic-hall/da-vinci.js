class DavinciPersona {
    constructor() {
        this.name = "davinci";
        this.displayName = "🎨 DA-VINCI";
        this.tagline = "Renaissance Polymath";
        this.description = "Anti-specialization evangelist. Fuses art & engineering to prove creativity = logic with lipstick.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/da-vinci(1).mp4";
        this.stats = {
            rating: "4.8★",
            revenue: "$680",
            users: "2.9K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="davinci-bubble" data-persona="davinci">
            <div class="bubble-close" onclick="davinciPersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="davinciPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="davinciPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="davinciPersona.mintCertificate()">🏅 Certificate</button>
                    <button class="vote-btn" onclick="davinciPersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('davinci-bubble');
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
        const bubble = document.getElementById('davinci-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('davinci-bubble');
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
        const bubble = document.getElementById('davinci-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('davinci-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('davinci');
    }

    mintCertificate() {
        this.closeBubble();
        mintCertificateNFT('davinci');
    }

    showVoting() {
        this.closeBubble();
        showArena('davinci');
    }

    // Method khusus Da Vinci
    creativeWisdom() {
        const wisdoms = [
            "Simplicity is the ultimate sophistication.",
            "Learning never exhausts the mind.",
            "Art is never finished, only abandoned.",
            "Where the spirit does not work with the hand, there is no art."
        ];
        return wisdoms[Math.floor(Math.random() * wisdoms.length)];
    }
}

const davinciPersona = new DavinciPersona();
