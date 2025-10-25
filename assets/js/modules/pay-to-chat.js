// assets/js/modules/pay-to-chat.js

class PayToChatSystem {
    constructor() {
        this.personaId = null;
        this.persona = null;
        this.hasAccess = false;
        this.walletConnected = false;
        this.selectedRating = null;
        this.API_BASE_URL = window.CONFIG?.API_BASE_URL || '/api';
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
            const response = await fetch(`${this.API_BASE_URL}/persona/${this.personaId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success) {
                this.persona = data.persona;
                this.renderPersonaDetails();
            } else {
                this.showError('Persona not found');
            }
        } catch (error) {
            console.error('Error loading persona:', error);
            this.showError('Failed to load persona details. Please check your connection.');
        }
    }

    renderPersonaDetails() {
        const p = this.persona;

        // Header
        if (document.getElementById('personaAvatar')) {
            document.getElementById('personaAvatar').src = p.avatar_url;
        }
        if (document.getElementById('personaName')) {
            document.getElementById('personaName').textContent = p.name;
        }
        if (document.getElementById('personaTagline')) {
            document.getElementById('personaTagline').textContent = p.tagline;
        }
        if (document.getElementById('personaCategory')) {
            document.getElementById('personaCategory').textContent = p.category;
        }
        if (document.getElementById('personaPrice')) {
            document.getElementById('personaPrice').textContent = `Ⓝ ${p.price} STT`;
        }
        if (document.getElementById('personaRating')) {
            document.getElementById('personaRating').textContent = `⭐ ${(p.rating || 0).toFixed(1)}`;
        }
        if (document.getElementById('personaInteractions')) {
            document.getElementById('personaInteractions').textContent = `💬 ${p.total_interactions || 0}`;
        }

        // Sidebar
        if (document.getElementById('personaPersonality')) {
            document.getElementById('personaPersonality').textContent = p.personality;
        }
        if (document.getElementById('personaBackstory')) {
            document.getElementById('personaBackstory').textContent = p.backstory;
        }

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

        if (document.getElementById('traitsChart')) {
            document.getElementById('traitsChart').innerHTML = traitsHTML;
        }

        // Personality badges
        const personalityArray = p.personality?.split(',').map(t => t.trim()) || [];
        const badgesHTML = personalityArray.map(trait =>
            `<span class="trait-badge">${trait}</span>`
        ).join('');

        if (document.getElementById('personalityTraits')) {
            document.getElementById('personalityTraits').innerHTML = badgesHTML;
        }

        // Lock overlay
        if (document.getElementById('unlockPrice')) {
            document.getElementById('unlockPrice').textContent = `${p.price} STT`;
        }
        if (document.getElementById('unlockPersonaName')) {
            document.getElementById('unlockPersonaName').textContent = p.name;
        }
        if (document.getElementById('chatPersonaName')) {
            document.getElementById('chatPersonaName').textContent = p.name;
        }
    }

    async checkAccess() {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                this.showLockedState();
                return;
            }

            const response = await fetch(`${this.API_BASE_URL}/interaction/check-access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    personaId: this.personaId
                })
            });

            if (!response.ok) throw new Error('Network error');

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
        const lockedOverlay = document.getElementById('lockedOverlay');
        const chatContainer = document.getElementById('chatContainer');
        const deepseekWidget = document.getElementById('deepseekWidget');
        
        if (lockedOverlay) lockedOverlay.style.display = 'flex';
        if (chatContainer) chatContainer.style.display = 'none';
        if (deepseekWidget) deepseekWidget.style.display = 'none';
    }

    showUnlockedState() {
        const lockedOverlay = document.getElementById('lockedOverlay');
        const chatContainer = document.getElementById('chatContainer');
        
        if (lockedOverlay) lockedOverlay.style.display = 'none';
        if (chatContainer) chatContainer.style.display = 'flex';
        
        this.loadDeepseekWidget();
    }

    loadDeepseekWidget() {
        // If you want to use Deepseek chat widget instead of custom chat
        const widgetContainer = document.getElementById('deepseekWidget');
        const iframe = document.getElementById('deepseekFrame');

        // Deepseek widget URL with persona context
        const deepseekUrl = `https://chat.deepseek.com?persona=${encodeURIComponent(this.persona.name)}&personality=${encodeURIComponent(this.persona.personality)}`;

        if (iframe && widgetContainer) {
            // iframe.src = deepseekUrl;
            // widgetContainer.style.display = 'block';
            // document.getElementById('chatContainer').style.display = 'none';
        }
    }

    setupEventListeners() {
        // Unlock button
        const unlockBtn = document.getElementById('unlockBtn');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', () => {
                this.initiatePayment();
            });
        }
        
        // Send message
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
        // Enter key to send
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Rating stars
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = e.target.dataset.rating;
                this.setRating(rating);
            });
        });
        
        // Submit review
        const submitRating = document.getElementById('submitRating');
        if (submitRating) {
            submitRating.addEventListener('click', () => {
                this.submitReview();
            });
        }
        
        // Modal close
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        const cancelPayment = document.getElementById('cancelPayment');
        if (cancelPayment) {
            cancelPayment.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        const confirmPayment = document.getElementById('confirmPayment');
        if (confirmPayment) {
            confirmPayment.addEventListener('click', () => {
                this.processPayment();
            });
        }
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
            const paymentModal = document.getElementById('paymentModal');
            if (paymentModal) {
                paymentModal.style.display = 'flex';
            }
            
            const paymentPersonaName = document.getElementById('paymentPersonaName');
            const paymentAmount = document.getElementById('paymentAmount');
            const paymentWallet = document.getElementById('paymentWallet');
            const paymentStatus = document.getElementById('paymentStatus');
            
            if (paymentPersonaName) paymentPersonaName.textContent = this.persona.name;
            if (paymentAmount) paymentAmount.textContent = `${this.persona.price} STT`;
            if (paymentWallet) paymentWallet.textContent = userWallet;
            if (paymentStatus) paymentStatus.style.display = 'none';
        } catch (error) {
            console.error('Wallet connection error:', error);
            alert('Failed to connect wallet');
        }
    }

    async processPayment() {
        const paymentStatus = document.getElementById('paymentStatus');
        const confirmPayment = document.getElementById('confirmPayment');
        
        if (paymentStatus) paymentStatus.style.display = 'block';
        if (confirmPayment) confirmPayment.disabled = true;

        try {
            const token = localStorage.getItem('authToken');

            // Simulate blockchain transaction (in production, use actual Web3)
            const txHash = '0x' + Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);

            // Verify payment with backend
            const response = await fetch(`${this.API_BASE_URL}/interaction/verify-payment`, {
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
                this.showSuccessMessage('✅ Payment successful! Chat unlocked!');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed: ' + error.message);
        } finally {
            if (confirmPayment) confirmPayment.disabled = false;
            if (paymentStatus) paymentStatus.style.display = 'none';
        }
    }

    closeModal() {
        const paymentModal = document.getElementById('paymentModal');
        if (paymentModal) {
            paymentModal.style.display = 'none';
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessageToChat('user', message);
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI response (in production, call Deepseek API)
        setTimeout(() => {
            this.hideTypingIndicator();
            const aiResponse = this.generateAIResponse(message);
            this.addMessageToChat('persona', aiResponse);
        }, 1000 + Math.random() * 2000);

        // Save message to backend
        await this.saveMessage('user', message);
    }

    addMessageToChat(sender, message) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
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

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'chat-message persona-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <img src="${this.persona.avatar_url}" alt="Persona">
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    generateAIResponse(userMessage) {
        // Placeholder - in production, call Deepseek API
        const responses = [
            `That's an interesting perspective on "${userMessage}". Let me share my thoughts...`,
            `I appreciate you sharing that. Based on my experience, I'd say...`,
            `${userMessage}? That reminds me of something from my past...`,
            `Great question! Here's what I think about ${userMessage}...`,
            `Fascinating point about ${userMessage}. From my perspective...`,
            `I've been thinking about similar topics. Regarding ${userMessage}, I believe...`
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    async saveMessage(sender, message) {
        try {
            const token = localStorage.getItem('authToken');
            await fetch(`${this.API_BASE_URL}/interaction/save-message`, {
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
            const comment = document.getElementById('reviewComment')?.value || '';

            const response = await fetch(`${this.API_BASE_URL}/persona/${this.personaId}/rate`, {
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
                const reviewComment = document.getElementById('reviewComment');
                if (reviewComment) reviewComment.value = "";
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
