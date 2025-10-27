// assets/js/modules/persona-detail.js
// Frontend module untuk Persona Detail & Pay-to-Chat

export class PersonaDetail {
    constructor() {
        this.API_BASE = '/api';
        this.persona = null;
        this.sessionId = null;
        this.currentTab = 'about';
        this.isUnlocked = false;
    }

    async init() {
        console.log('🎯 Initializing Persona Detail...');
        
        // Get persona ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const personaId = urlParams.get('id');

        if (!personaId) {
            alert('No persona specified');
            window.location.href = 'view-personas.html';
            return;
        }

        // Load persona data
        await this.loadPersona(personaId);
        
        // Setup event listeners
        this.setupEventListeners();
    }

    async loadPersona(personaId) {
        try {
            const response = await fetch(`${this.API_BASE}/persona/${personaId}`);
            const data = await response.json();

            if (data.success) {
                this.persona = data.data;
                this.renderPersona();
                
                // Check if user already has session
                await this.checkExistingSession();
            } else {
                throw new Error('Persona not found');
            }

        } catch (error) {
            console.error('Error loading persona:', error);
            alert('Failed to load persona');
            window.location.href = 'view-personas.html';
        }
    }

    renderPersona() {
        // Hide loading, show content
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');

        // Header section
        document.getElementById('personaAvatar').src = this.persona.avatar || this.getDefaultAvatar();
        document.getElementById('personaAvatar').alt = this.persona.name;
        document.getElementById('personaName').textContent = this.persona.name;
        document.getElementById('personaRole').textContent = this.persona.role;
        document.getElementById('personaPersonality').textContent = this.persona.personality;
        document.getElementById('personaRating').textContent = this.persona.stats.averageRating.toFixed(1);
        document.getElementById('personaInteractions').textContent = this.persona.stats.totalInteractions;
        document.getElementById('personaCost').textContent = this.persona.chatCost;

        // Cost displays
        document.getElementById('costDisplay').textContent = this.persona.chatCost;
        document.getElementById('costDisplay2').textContent = this.persona.chatCost;
        document.getElementById('modalCost').textContent = this.persona.chatCost;

        // Traits
        const traitsContainer = document.getElementById('personaTraits');
        traitsContainer.innerHTML = '';
        this.persona.traits.forEach(trait => {
            const badge = document.createElement('span');
            badge.className = 'px-3 py-1 bg-white/20 rounded-full text-sm';
            badge.textContent = trait;
            traitsContainer.appendChild(badge);
        });

        // About tab content
        document.getElementById('personaBackstory').textContent = this.persona.backstory;
        document.getElementById('personaAppearance').textContent = this.persona.appearance;
        document.getElementById('personaStyle').textContent = this.persona.interactionStyle;

        // Interests
        const interestsContainer = document.getElementById('personaInterests');
        interestsContainer.innerHTML = '';
        this.persona.interests.forEach(interest => {
            const badge = document.createElement('span');
            badge.className = 'px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm';
            badge.textContent = interest;
            interestsContainer.appendChild(badge);
        });

        // Chat avatar
        document.getElementById('chatAvatar').src = this.persona.avatar || this.getDefaultAvatar();
        
        // Welcome message
        const welcomeMsg = `Hello! I'm ${this.persona.name}, ${this.persona.role}. ${this.persona.interactionStyle}`;
        document.getElementById('welcomeMessage').textContent = welcomeMsg;
    }

    setupEventListeners() {
        // Tab switching
        document.getElementById('tabAbout').addEventListener('click', () => this.switchTab('about'));
        document.getElementById('tabChat').addEventListener('click', () => this.switchTab('chat'));
        document.getElementById('tabReviews').addEventListener('click', () => this.switchTab('reviews'));

        // Unlock chat button
        document.getElementById('unlockChatBtn').addEventListener('click', () => this.initiatePayment());

        // Payment modal
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closePaymentModal());
        document.getElementById('confirmPaymentBtn').addEventListener('click', () => this.processPayment());
        document.getElementById('startChatBtn').addEventListener('click', () => {
            this.closePaymentModal();
            this.switchTab('chat');
        });

        // Chat functionality
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.getElementById('endSessionBtn').addEventListener('click', () => this.endSession());
    }

    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('border-b-2', 'border-purple-600', 'text-purple-600');
            btn.classList.add('text-gray-600');
        });
        document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('border-b-2', 'border-purple-600', 'text-purple-600');
        document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.remove('text-gray-600');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`content${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.remove('hidden');

        this.currentTab = tab;
    }

    async checkExistingSession() {
        const walletAddress = this.getWalletAddress();
        if (!walletAddress) return;

        try {
            const response = await fetch(`${this.API_BASE}/interaction/user/${walletAddress}?status=confirmed`);
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                // Check if user has active session with this persona
                const activeSession = data.data.find(int => 
                    int.personaId._id === this.persona._id && 
                    int.isActive && 
                    int.paymentStatus === 'confirmed'
                );

                if (activeSession) {
                    this.sessionId = activeSession.sessionId;
                    this.unlockChat();
                }
            }
        } catch (error) {
            console.error('Error checking existing session:', error);
        }
    }

    async initiatePayment() {
        const walletAddress = this.getWalletAddress();
        
        if (!walletAddress) {
            alert('Please connect your wallet first!');
            return;
        }

        // Show payment modal
        document.getElementById('paymentModal').classList.remove('hidden');
        document.getElementById('paymentStep1').classList.remove('hidden');
        document.getElementById('paymentStep2').classList.add('hidden');
        document.getElementById('paymentStep3').classList.add('hidden');

        try {
            // Create pending interaction
            const response = await fetch(`${this.API_BASE}/interaction/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personaId: this.persona._id,
                    userId: walletAddress
                })
            });

            const data = await response.json();

            if (data.success) {
                if (data.alreadyUnlocked) {
                    this.sessionId = data.data.sessionId;
                    this.showPaymentSuccess();
                } else {
                    this.interactionId = data.data.interactionId;
                    this.sessionId = data.data.sessionId;
                }
            } else {
                throw new Error(data.error);
            }

        } catch (error) {
            console.error('Error initiating payment:', error);
            alert('Failed to initiate payment');
            this.closePaymentModal();
        }
    }

    async processPayment() {
        // Show processing state
        document.getElementById('paymentStep1').classList.add('hidden');
        document.getElementById('paymentStep2').classList.remove('hidden');

        try {
            // TODO: Implement actual Somnia testnet payment
            // For now, simulate payment with random transaction hash
            const txHash = this.generateMockTransactionHash();
            
            // Simulate payment delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Verify payment
            const response = await fetch(`${this.API_BASE}/interaction/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interactionId: this.interactionId,
                    transactionHash: txHash,
                    userId: this.getWalletAddress()
                })
            });

            const data = await response.json();

            if (data.success) {
                this.sessionId = data.data.sessionId;
                this.showPaymentSuccess();
            } else {
                throw new Error(data.error);
            }

        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
            this.closePaymentModal();
        }
    }

    showPaymentSuccess() {
        document.getElementById('paymentStep2').classList.add('hidden');
        document.getElementById('paymentStep3').classList.remove('hidden');
        this.unlockChat();
    }

    unlockChat() {
        this.isUnlocked = true;
        document.getElementById('chatLocked').classList.add('hidden');
        document.getElementById('chatActive').classList.remove('hidden');
        document.getElementById('sessionDisplay').textContent = this.sessionId.substring(0, 8) + '...';
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        // Display user message
        this.addMessageToChat('user', message);
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // TODO: Send to Deepseek API
            // For now, simulate AI response
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const aiResponse = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessageToChat('persona', aiResponse);

            // Update message count
            await this.updateInteractionStats();

        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.addMessageToChat('persona', 'Sorry, I encountered an error. Please try again.');
        }
    }

    addMessageToChat(sender, text) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex gap-3 ' + (sender === 'user' ? 'justify-end' : '');

        if (sender === 'persona') {
            messageDiv.innerHTML = `
                <img src="${this.persona.avatar}" alt="" class="w-10 h-10 rounded-full">
                <div class="message-persona max-w-xs p-4 rounded-lg">
                    <p>${text}</p>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-user max-w-xs p-4 rounded-lg">
                    <p>${text}</p>
                </div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const indicator = document.createElement('div');
        indicator.id = 'typingIndicator';
        indicator.className = 'flex gap-3';
        indicator.innerHTML = `
            <img src="${this.persona.avatar}" alt="" class="w-10 h-10 rounded-full">
            <div class="message-persona p-4 rounded-lg">
                <div class="typing-indicator flex gap-1">
                    <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }

    async getAIResponse(userMessage) {
        // TODO: Integrate with Deepseek API
        // For now, return simulated responses based on persona style
        
        const responses = [
            `That's an interesting perspective! As a ${this.persona.role}, I think...`,
            `I appreciate you sharing that. From my experience...`,
            `${this.persona.name} here - let me think about that...`,
            `Based on my understanding of ${this.persona.interests[0]}, I would say...`
        ];

        return responses[Math.floor(Math.random() * responses.length)] + ' ' + 
               this.generateContextualResponse(userMessage);
    }

    generateContextualResponse(message) {
        // Simple contextual responses
        const lowercaseMsg = message.toLowerCase();
        
        if (lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi')) {
            return `Hello! It's wonderful to connect with you. What would you like to explore today?`;
        }
        if (lowercaseMsg.includes('how are you')) {
            return `I'm doing wonderfully, thank you for asking! How about you?`;
        }
        if (lowercaseMsg.includes('help')) {
            return `Of course! I'm here to help. Could you tell me more about what you need?`;
        }
        
        return `That's a great question about "${message}". Let me share my thoughts on that...`;
    }

    async updateInteractionStats() {
        // TODO: Increment message count in backend
        console.log('Updating interaction stats...');
    }

    async endSession() {
        if (!confirm('Are you sure you want to end this session?')) {
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE}/interaction/end-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    userId: this.getWalletAddress()
                })
            });

            const data = await response.json();

            if (data.success) {
                alert(`Session ended. Duration: ${data.data.duration} minutes, Messages: ${data.data.messageCount}`);
                this.showRatingPrompt();
            }

        } catch (error) {
            console.error('Error ending session:', error);
            alert('Failed to end session');
        }
    }

    showRatingPrompt() {
        // TODO: Show rating modal
        const rating = prompt('Rate your experience (0-5):');
        if (rating !== null) {
            this.submitRating(parseFloat(rating));
        }
    }

    async submitRating(rating) {
        try {
            const response = await fetch(`${this.API_BASE}/interaction/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interactionId: this.interactionId,
                    userId: this.getWalletAddress(),
                    rating: rating,
                    feedback: null
                })
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Thank you for your feedback!');
                window.location.href = 'view-personas.html';
            }

        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    }

    closePaymentModal() {
        document.getElementById('paymentModal').classList.add('hidden');
    }

    getWalletAddress() {
        // TODO: Implement proper wallet connection
        // For now, check localStorage or generate mock address
        let address = localStorage.getItem('walletAddress');
        if (!address) {
            address = this.generateMockWalletAddress();
            localStorage.setItem('walletAddress', address);
        }
        return address;
    }

    generateMockWalletAddress() {
        return 'wallet_' + Math.random().toString(36).substring(2, 15);
    }

    generateMockTransactionHash() {
        return 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    }

    getDefaultAvatar() {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.persona.name}`;
    }
}

export default PersonaDetail;
