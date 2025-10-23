class AlkhwarizmiPersona {
    constructor() {
        this.name = "alkhwarizmi";
        this.displayName = "📚 AL-KHWARIZMI";
        this.tagline = "The Logic of Creation";
        this.description = "Father of algebra who connects mathematics with wisdom and spirituality.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/al-khawarism(1).mp4";
        this.stats = {
            rating: "4.7★",
            revenue: "$480",
            users: "2.1K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="alkhwarizmi-bubble" data-persona="alkhwarizmi">
            <div class="bubble-close" onclick="alkhwarizmiPersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="alkhwarizmiPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="alkhwarizmiPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="alkhwarizmiPersona.mintCertificate()">🏅 Certificate</button>
                    <button class="vote-btn" onclick="alkhwarizmiPersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('alkhwarizmi-bubble');
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
        const bubble = document.getElementById('alkhwarizmi-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('alkhwarizmi-bubble');
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
        const bubble = document.getElementById('alkhwarizmi-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('alkhwarizmi-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('alkhwarizmi');
    }

    mintCertificate() {
        this.closeBubble();
        mintCertificateNFT('alkhwarizmi');
    }

    showVoting() {
        this.closeBubble();
        showArena('alkhwarizmi');
    }

    // Method khusus Al-Khwarizmi
    mathematicalWisdom() {
        const wisdoms = [
            "Algebra is the reunion of broken parts, the balancing of equations in life and numbers.",
            "Every problem has a solution, if you approach it with systematic thinking.",
            "Numbers speak the universal language of the cosmos.",
            "The algorithm is but a path to truth, step by logical step."
        ];
        return wisdoms[Math.floor(Math.random() * wisdoms.length)];
    }
}

const alkhwarizmiPersona = new AlkhwarizmiPersona();
