class HammurabiPersona {
    constructor() {
        this.name = "hammurabi";
        this.displayName = "⚖️ HAMMURABI";
        this.tagline = "Justice System Architect";
        this.description = "Codified-law defender. Builds transparent rules so the weak aren't hostage to the strong.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/hammurabi(1).mp4";
        this.stats = {
            rating: "4.7★",
            revenue: "$560",
            users: "2.2K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="hammurabi-bubble" data-persona="hammurabi">
            <div class="bubble-close" onclick="hammurabiPersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="hammurabiPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="hammurabiPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="hammurabiPersona.mintCertificate()">🏅 Certificate</button>
                    <button class="vote-btn" onclick="hammurabiPersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('hammurabi-bubble');
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
        const bubble = document.getElementById('hammurabi-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('hammurabi-bubble');
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
        const bubble = document.getElementById('hammurabi-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('hammurabi-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('hammurabi');
    }

    mintCertificate() {
        this.closeBubble();
        mintCertificateNFT('hammurabi');
    }

    showVoting() {
        this.closeBubble();
        showArena('hammurabi');
    }

    // Method khusus Hammurabi
    legalWisdom() {
        const wisdoms = [
            "An eye for an eye only ends up making the whole world blind.",
            "To bring about the rule of righteousness in the land... so that the strong should not harm the weak.",
            "Justice is the foundation of kingdoms and the bond of civilizations.",
            "Laws should be written so clearly that no man need fear misunderstanding them."
        ];
        return wisdoms[Math.floor(Math.random() * wisdoms.length)];
    }
}

const hammurabiPersona = new HammurabiPersona();
