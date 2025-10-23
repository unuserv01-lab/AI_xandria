class UnuserPersona {
    constructor() {
        this.name = "unuser";
        this.displayName = "🔥 UNUSER";
        this.tagline = "Chaos Unveiling Truth";
        this.description = "Satirical, sarcastic social critique. Roasting reality with brutal honesty that makes you think twice about modern society.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/Unuser(1).mp4";
        this.stats = {
            rating: "4.8★",
            revenue: "$450",
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
        <div class="persona-bubble-card" id="unuser-bubble" data-persona="unuser">
            <div class="bubble-close" onclick="unuserPersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="unuserPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="unuserPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="unuserPersona.generateContent()">🎯 Generate</button>
                    <button class="vote-btn" onclick="unuserPersona.showVoting()">⚡ Vote</button>
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
        // Event listener akan ditambahkan setelah DOM ready
        setTimeout(() => {
            const bubble = document.getElementById('unuser-bubble');
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
        const bubble = document.getElementById('unuser-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        // Close all other bubbles first
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('unuser-bubble');
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
        const bubble = document.getElementById('unuser-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    // Fungsi-fungsi interaksi
    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('unuser-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('unuser');
    }

    generateContent() {
        this.closeBubble();
        generateContent('unuser');
    }

    showVoting() {
        this.closeBubble();
        showArena('unuser');
    }

    // Method khusus Unuser
    roastTopic(topic) {
        const roasts = {
            politics: "Politicians are like diapers - they should be changed frequently, and for the same reason.",
            socialMedia: "Social media: where we carefully curate highlight reels of our mediocre lives.",
            modernLife: "We have smart phones, dumb people, and the attention span of a goldfish with ADHD."
        };
        
        return roasts[topic] || "That topic is so absurd it roasts itself. But fine, let me add some fire...";
    }
}

// Inisialisasi
const unuserPersona = new UnuserPersona();
