class GalileoPersona {
    constructor() {
        this.name = "galileo";
        this.displayName = "🔭 GALILEO";
        this.tagline = "Observation Over Authority";
        this.description = "Empirical rebel. Teaches you to trust your own telescope instead of inherited dogma.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/galileo(1).mp4";
        this.stats = {
            rating: "4.9★",
            revenue: "$620",
            users: "3.1K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="galileo-bubble" data-persona="galileo">
            <div class="bubble-close" onclick="galileoPersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="galileoPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="galileoPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="galileoPersona.mintCertificate()">🏅 Certificate</button>
                    <button class="vote-btn" onclick="galileoPersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('galileo-bubble');
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
        const bubble = document.getElementById('galileo-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('galileo-bubble');
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
        const bubble = document.getElementById('galileo-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('galileo-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('galileo');
    }

    mintCertificate() {
        this.closeBubble();
        mintCertificateNFT('galileo');
    }

    showVoting() {
        this.closeBubble();
        showArena('galileo');
    }

    // Method khusus Galileo
    scientificTruth() {
        const truths = [
            "And yet it moves.",
            "I do not feel obliged to believe that the same God who has endowed us with sense, reason, and intellect has intended us to forgo their use.",
            "All truths are easy to understand once they are discovered; the point is to discover them.",
            "Measure what is measurable, and make measurable what is not so."
        ];
        return truths[Math.floor(Math.random() * truths.length)];
    }
}

const galileoPersona = new GalileoPersona();
