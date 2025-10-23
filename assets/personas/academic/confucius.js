class ConfuciusPersona {
    constructor() {
        this.name = "confucius";
        this.displayName = "🏮 CONFUCIUS";
        this.tagline = "Relationship Harmony Teacher";
        this.description = "Five-relationships master. Shows how duty & ritual create social harmony---and juicy networking.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/confucius(1).mp4";
        this.stats = {
            rating: "4.7★",
            revenue: "$520",
            users: "2.4K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="confucius-bubble" data-persona="confucius">
            <div class="bubble-close" onclick="confuciusPersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="confuciusPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="confuciusPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="confuciusPersona.mintCertificate()">🏅 Certificate</button>
                    <button class="vote-btn" onclick="confuciusPersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('confucius-bubble');
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
        const bubble = document.getElementById('confucius-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('confucius-bubble');
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
        const bubble = document.getElementById('confucius-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('confucius-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('confucius');
    }

    mintCertificate() {
        this.closeBubble();
        mintCertificateNFT('confucius');
    }

    showVoting() {
        this.closeBubble();
        showArena('confucius');
    }

    // Method khusus Confucius
    wisdomQuote() {
        const quotes = [
            "It does not matter how slowly you go as long as you do not stop.",
            "Our greatest glory is not in never falling, but in rising every time we fall.",
            "Everything has beauty, but not everyone sees it.",
            "Wherever you go, go with all your heart."
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
}

const confuciusPersona = new ConfuciusPersona();
