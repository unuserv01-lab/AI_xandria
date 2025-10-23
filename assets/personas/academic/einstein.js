class EinsteinPersona {
    constructor() {
        this.name = "einstein";
        this.displayName = "🧠 EINSTEIN";
        this.tagline = "Curiosity Is My Compass";
        this.description = "Genius physicist who explains complex concepts in simple ways full of witty analogies.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/Einstein(1).mp4";
        this.stats = {
            rating: "4.9★",
            revenue: "$600",
            users: "3.2K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="einstein-bubble" data-persona="einstein">
            <div class="bubble-close" onclick="einsteinPersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="einsteinPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="einsteinPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="einsteinPersona.mintCertificate()">🏅 Certificate</button>
                    <button class="vote-btn" onclick="einsteinPersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('einstein-bubble');
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
        const bubble = document.getElementById('einstein-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('einstein-bubble');
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
        const bubble = document.getElementById('einstein-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('einstein-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('einstein');
    }

    mintCertificate() {
        this.closeBubble();
        mintCertificateNFT('einstein');
    }

    showVoting() {
        this.closeBubble();
        showArena('einstein');
    }

    // Method khusus Einstein
    scienceQuote() {
        const quotes = [
            "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.",
            "The important thing is not to stop questioning. Curiosity has its own reason for existence.",
            "Anyone who has never made a mistake has never tried anything new.",
            "Reality is merely an illusion, albeit a very persistent one."
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
}

const einsteinPersona = new EinsteinPersona();
