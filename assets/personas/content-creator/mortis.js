class MortisPersona {
    constructor() {
        this.name = "mortis";
        this.displayName = "💀 MORTIS";
        this.tagline = "Death Philosophy Comedian";
        this.description = "Makes mortality funny. Stoic punch-lines that free you from death-anxiety one joke at a time.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/mortis(1).mp4";
        this.stats = {
            rating: "4.7★",
            revenue: "$390",
            users: "1.9K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="mortis-bubble" data-persona="mortis">
            <div class="bubble-close" onclick="mortisPersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="mortisPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="mortisPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="mortisPersona.generateContent()">💀 Generate</button>
                    <button class="vote-btn" onclick="mortisPersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('mortis-bubble');
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
        const bubble = document.getElementById('mortis-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('mortis-bubble');
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
        const bubble = document.getElementById('mortis-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('mortis-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('mortis');
    }

    generateContent() {
        this.closeBubble();
        generateContent('mortis');
    }

    showVoting() {
        this.closeBubble();
        showArena('mortis');
    }

    // Method khusus Mortis
    deathJoke() {
        const jokes = [
            "They say you can't take it with you when you die. But have you seen coffin prices? You're taking a luxury box!",
            "My therapist told me I have death anxiety. I said, 'We all do, that's why we're here!'",
            "The good news about death? No more deadlines. The bad news? The ultimate deadline."
        ];
        return jokes[Math.floor(Math.random() * jokes.length)];
    }
}

const mortisPersona = new MortisPersona();
