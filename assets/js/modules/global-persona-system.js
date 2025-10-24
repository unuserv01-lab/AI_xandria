// assets/js/modules/global-persona-system.js
class GlobalPersonaSystem {
  constructor() {
    this.personas = {};
    this.init();
  }

  async init() {
    // Load persona data dari JSON atau backend
    await this.loadPersonaData();
    this.renderAllPersonas();
  }

  async loadPersonaData() {
    // Option 1: Static JSON (CEPAT)
    this.personas = await fetch('./assets/data/personas-data.json').then(r => r.json());
    
    // Option 2: Dari backend (jika sudah ready)
    // this.personas = await fetch('/api/personas/featured').then(r => r.json());
  }

  renderAllPersonas() {
    const container = document.getElementById('personaGrid');
    
    Object.values(this.personas).forEach(persona => {
      container.innerHTML += this.createPersonaCard(persona);
    });
  }

  createPersonaCard(persona) {
    return `
      <div class="persona-card ${persona.theme}" data-persona="${persona.id}">
        <div class="persona-avatar">
          ${persona.avatarUrl ? 
            `<img src="${persona.avatarUrl}" alt="${persona.name}" />` :
            `<video autoplay loop muted playsinline>
              <source src="${persona.videoUrl}" type="video/mp4">
             </video>`
          }
        </div>
        
        <div class="persona-info">
          <h3>${persona.emoji} ${persona.name}</h3>
          <p class="tagline">${persona.tagline}</p>
          <p class="description">${persona.description}</p>
          
          <div class="persona-stats">
            <span>⭐ ${persona.stats.rating}</span>
            <span>👥 ${persona.stats.users}</span>
            <span>💰 ${persona.chatCost} STT</span>
          </div>
          
          <button class="btn-chat" onclick="globalPersonaSystem.startChat('${persona.id}')">
            💬 Chat (${persona.chatCost} STT)
          </button>
          
          <button class="btn-nft" onclick="globalPersonaSystem.mintNFT('${persona.id}')">
            🖼️ Mint NFT
          </button>
        </div>
      </div>
    `;
  }

  async startChat(personaId) {
    const persona = this.personas[personaId];
    const confirmed = confirm(`Chat dengan ${persona.name}?\n\nBiaya: ${persona.chatCost} STT`);
    
    if (confirmed) {
      // Process payment sederhana dulu
      const paymentSuccess = await this.processPayment(persona.chatCost);
      if (paymentSuccess) {
        this.openChat(persona);
      }
    }
  }

  async processPayment(amount) {
    // Gunakan wallet system yang sudah ada
    if (!window.ethereum) {
      alert('Please connect wallet!');
      return false;
    }
    
    try {
      // Sementara return true dulu untuk demo
      return true;
    } catch (error) {
      console.error('Payment error:', error);
      return false;
    }
  }

  openChat(persona) {
    // Integrasi dengan Deepseek chat yang sudah ada
    if (window.DeepSeekChat) {
      window.DeepSeekChat.open({
        persona: persona.name,
        systemPrompt: persona.personality
      });
    } else {
      // Fallback
      alert(`💬 Chat dengan ${persona.name} siap!\n\nPersonality: ${persona.personality}`);
    }
  }

  async mintNFT(personaId) {
    const persona = this.personas[personaId];
    const confirmed = confirm(`Mint ${persona.name} NFT?`);
    
    if (confirmed) {
      // Gunakan mint function yang sudah ada
      if (window.mintPersonaNFT) {
        await window.mintPersonaNFT(personaId);
      } else {
        alert('NFT minting ready!');
      }
    }
  }
}

// Initialize
window.globalPersonaSystem = new GlobalPersonaSystem();
