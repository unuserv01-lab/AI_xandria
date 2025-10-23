class ParadoxPersona {
    constructor() {
        this.name = "paradox";
        this.displayName = "🌀 PARADOX";
        this.tagline = "Contradiction Artist";
        this.description = "Binary-breaker. Uses koans & logical loops to prove you can be both right and wrong.";
        this.videoUrl = "https://unuserv01-lab.github.io/RivalismeUniverse-SomniaHybrid/assets/videos/paradox(1).mp4";
        this.stats = {
            rating: "4.8★",
            revenue: "$420",
            users: "1.7K"
        };
        this.init();
    }

    init() {
        this.createBubbleCard();
        this.setupEventListeners();
    }

    createBubbleCard() {
        const cardHTML = `
        <div class="persona-bubble-card" id="paradox-bubble" data-persona="paradox">
            <div class="bubble-close" onclick="paradoxPersona.closeBubble()">×</div>
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
                    <button class="interact-button" onclick="paradoxPersona.openUniverse()">ENTER UNIVERSE</button>
                    <button class="nft-persona-btn" onclick="paradoxPersona.mintNFT()">🖼️ Mint NFT</button>
                    <button class="generate-btn" onclick="paradoxPersona.generateContent()">🌀 Generate</button>
                    <button class="vote-btn" onclick="paradoxPersona.showVoting()">⚡ Vote</button>
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
            const bubble = document.getElementById('paradox-bubble');
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
        const bubble = document.getElementById('paradox-bubble');
        if (!bubble) return;

        const isOpen = bubble.classList.contains('bubble-open');
        
        this.closeAllBubbles();
        
        if (!isOpen) {
            bubble.classList.add('bubble-open');
            this.animateBubbleOpen();
        }
    }

    closeBubble() {
        const bubble = document.getElementById('paradox-bubble');
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
        const bubble = document.getElementById('paradox-bubble');
        bubble.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bubble.style.transform = 'scale(1)';
        }, 300);
    }

    openUniverse() {
        this.closeBubble();
        hideAllPages();
        document.getElementById('persona-page').style.display = 'block';
        document.getElementById('paradox-page').style.display = 'block';
    }

    mintNFT() {
        mintPersonaNFT('paradox');
    }

    generateContent() {
        this.closeBubble();
        generateContent('paradox');
    }

    showVoting() {
        this.closeBubble();
        showArena('paradox');
    }

    // Method khusus Paradox
    createParadox() {
        const paradoxes = [
            "This statement is false.",
            "The only constant is change, which means this statement will eventually be wrong.",
            "I always lie. Am I telling the truth now?",
            "To find yourself, you must first lose yourself. But if you're lost, how do you know what to find?"
        ];
        return paradoxes[Math.floor(Math.random() * paradoxes.length)];
    }
}

const paradoxPersona = new ParadoxPersona();
