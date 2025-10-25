// assets/js/modules/pay-to-chat.js

class PayToChatSystem {
  constructor() {
    this.personaId = null;
    this.persona = null;
    this.hasAccess = false;
    this.walletConnected = false;
    this.init();
  }

  async init() {
    // Get persona ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.personaId = urlParams.get('id');

    if (!this.personaId) {
      window.location.href = '/view-personas.html';
      return;
    }

    await this.loadPersonaDetails();
    await this.checkAccess();
    this.setupEventListeners();
  }

  async loadPersonaDetails() {
    try {
      const response = await fetch(`/api/persona/${this.personaId}`);
      const data = await response.json();

      if (data.success) {
        this.persona = data.persona;
        this.renderPersonaDetails();
      } else {
        this.showError('Persona not found');
      }
    } catch (error) {
      console.error('Error loading persona:', error);
      this.showError('Failed to load persona details');
    }
  }

  renderPersonaDetails() {
    const p = this.persona;

    // Header
    document.getElementById('personaAvatar').src = p.avatar_url;
    document.getElementById('personaName').textContent = p.name;
    document.getElementById('personaTagline').textContent = p.tagline;
    document.getElementById('personaCategory').textContent = p.category;
    document.getElementById('personaPrice').textContent = `💎 ${p.price} STT`;
    document.getElementById('personaRating').textContent = `⭐ ${(p.rating || 0).toFixed(1)}`;
    document.getElementById('personaInteractions').textContent = `👥 ${p.total_interactions || 0}`;

    // Sidebar
    document.getElementById('personaPersonality').textContent = p.personality;
    document.getElementById('personaBackstory').textContent = p.backstory;

    // Personality traits
    const traits = p.traits || {};
    const traitsHTML = Object.entries(traits).map(([key, value]) => `
      <div class="trait-item">
        <div class="trait-label">${key}</div>
        <div class="trait-bar">
          <div class="trait-fill" style="width: ${value * 10}%"></div>
        </div>
        <div class="trait-value">${value}/10</div>
      </div>
    `).join('');
    document.getElementById('traitsChart').innerHTML = traitsHTML;

    // Personality badges
    const personalityArray = p.personality.split(',').map(t => t.trim());
    const badgesHTML = personalityArray.map(trait => 
      `<span class="trait-badge">${trait}</span>`
    ).join('');
    document.getElementById('personalityTraits').innerHTML = badgesHTML;

    // Lock overlay
    document.getElementById('unlockPrice').textContent = `${p.price} STT`;
    document.getElementById('unlockPersonaName').textContent = p.name;
    document.getElementById('chatPersonaName').textContent = p.name;
  }

  async checkAccess() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        this.showLockedState();
        return;
      }

      const response = await fetch('/api/interaction/check-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ personaId: this.personaId })
      });

      const data = await response.json();

      if (data.success && data.hasAccess) {
        this.hasAccess = true;
        this.showUnlockedState();
      } else {
        this.showLockedState();
      }
    } catch (error) {
      console.error('Error checking access:', error);
      this.showLockedState();
    }
  }

  showLockedState() {
    document.getElementById('lockedOverlay').style.display = 'flex';
    document.getElementById('chatContainer').style.display = 'none';
    document.getElementById('deepseekWidget').style.display = 'none';
  }

  showUnlockedState() {
    document.getElementById('lockedOverlay').style.display = 'none';
    document.getElementById('chatContainer').style.display = 'flex';
    
    // Optional: Load Deepseek widget
    this.loadDeepseekWidget();
  }

  loadDeepseekWidget() {
    // If you want to use Deepseek chat widget instead of custom chat
    const widgetContainer = document.getElementById('deepseekWidget');
    const iframe = document.getElementById('deepseekFrame');
    
    // Deepseek widget URL with persona context
    const deepseekUrl = `https://chat.deepseek.com?persona=${encodeURIComponent(this.persona.name)}&personality=${encodeURIComponent(this.persona.personality)}`;
    
    // iframe.src = deepseekUrl;
    // widgetContainer.style.display = 'block';
    // document.getElementById('chatContainer').style.display = 'none';
  }

  setupEventListeners() {
    // Unlock button
    document.getElementById('unlockBtn')?.addEventListener('click', () => {
      this.initiatePayment();
    });

    // Send message
    document.getElementById('sendBtn')?.addEventListener('click', () => {
      this.sendMessage();
    });

    // Enter key to send
    document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Rating stars
    document.querySelectorAll('.star').forEach(star => {
      star.addEventListener('click', (e) => {
        const rating = e.target.dataset.rating;
        this.setRating(rating);
      });
    });

    // Submit review
    document.getElementById('submitRating')?.addEventListener('click', () => {
      this.submitReview();
    });

    // Modal close
    document.querySelector('.close-modal')?.addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('cancelPayment')?.addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('confirmPayment')?.addEventListener('click', () => {
      this.processPayment();
    });
  }

  async initiatePayment() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('Please login first');
      window.location.href = '/login.html';
      return;
    }

    // Check wallet connection
    if (!window.ethereum) {
      alert('Please install MetaMask to continue');
      return;
    }

    try {
      // Connect wallet if not connected
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userWallet = accounts[0];

      // Show payment modal
      document.getElementById('paymentModal').style.display = 'flex';
      document.getElementById('paymentPersonaName').textContent = this.persona.name;
      document.getElementById('paymentAmount').textContent = `${this.persona.price} STT`;
      document.getElementById('paymentWallet').textContent = userWallet;
      document.getElementById('paymentStatus').style.display = 'none';
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet');
    }
  }

  async processPayment() {
    document.getElementById('paymentStatus').style.display = 'block';
    document.getElementById('confirmPayment').disabled = true;

    try {
      const token = localStorage.getItem('authToken');
      
      // Simulate blockchain transaction (in production, use actual Web3)
      const txHash = '0x' + Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);

      // Verify payment with backend
      const response = await fetch('/api/interaction/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          personaId: this.personaId,
          transactionHash: txHash,
          amount: this.persona.price
        })
      });

      const data = await response.json();

      if (data.success) {
        this.closeModal();
        this.hasAccess = true;
        this.showUnlockedState();
        this.showSuccessMessage('🎉 Payment successful! Chat unlocked!');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      document.getElementById('confirmPayment').disabled = false;
      document.getElementById('paymentStatus').style.display = 'none';
    }
  }

  closeModal() {
    document.getElementById('paymentModal').style.display = 'none';
  }

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message to chat
    this.addMessageToChat('user', message);
    input.value = '';

    // Simulate AI response (in production, call Deepseek API)
    setTimeout(() => {
      const aiResponse = this.generateAIResponse(message);
      this.addMessageToChat('persona', aiResponse);
    }, 1000);

    // Save message to backend
    await this.saveMessage('user', message);
  }

  addMessageToChat(sender, message) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    const avatar = sender === 'user' ? '👤' : this.persona.avatar_url;
    
    messageDiv.innerHTML = `
      <div class="message-avatar">
        ${sender === 'user' ? avatar : `<img src="${avatar}" alt="Persona">`}
      </div>
      <div class="message-content">
        <div class="message-text">${message}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  generateAIResponse(userMessage) {
    // Placeholder - in production, call Deepseek API
    const responses = [
      `That's an interesting perspective on "${userMessage}". Let me share my thoughts...`,
      `I appreciate you sharing that. Based on my experience, I'd say...`,
      `${userMessage}? That reminds me of something from my past...`,
      `Great question! Here's what I think about ${userMessage}...`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async saveMessage(sender, message) {
    try {
      const token = localStorage.getItem('authToken');
      await fetch('/api/interaction/save-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          personaId: this.personaId,
          sender,
          message
        })
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  setRating(rating) {
    this.selectedRating = rating;
    document.querySelectorAll('.star').forEach((star, index) => {
      star.style.opacity = index < rating ? '1' : '0.3';
    });
  }

  async submitReview() {
    if (!this.selectedRating) {
      alert('Please select a rating');
      return;
    }

    if (!this.hasAccess) {
      alert('You must unlock the chat first');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const comment = document.getElementById('reviewComment').value;

      const response = await fetch(`/api/persona/${this.personaId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: this.selectedRating,
          comment
        })
      });

      const data = await response.json();

      if (data.success) {
        this.showSuccessMessage('Thank you for your review!');
        document.getElementById('reviewComment').value = '';
      } else {
        alert('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  }

  showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification success';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showError(message) {
    alert(message);
    setTimeout(() => {
      window.location.href = '/view-personas.html';
    }, 2000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PayToChatSystem();
});
