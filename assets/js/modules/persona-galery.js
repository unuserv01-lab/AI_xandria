// assets/js/modules/persona-gallery.js

class PersonaGallery {
    constructor() {
        this.personas = [];
        this.filteredPersonas = [];
        this.API_BASE_URL = window.CONFIG?.API_BASE_URL || '/api';
        this.init();
    }

    async init() {
        await this.loadPersonas();
        this.setupEventListeners();
    }

    async loadPersonas() {
        try {
            const category = document.getElementById('categoryFilter')?.value || '';
            const sort = document.getElementById('sortFilter')?.value || 'newest';

            const response = await fetch(
                `${this.API_BASE_URL}/persona/featured?category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}`
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                this.personas = data.personas;
                this.filteredPersonas = [...this.personas];
                this.renderPersonas();
            } else {
                this.showError('Failed to load personas: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error loading personas:', error);
            
            if (error.message.includes('Failed to fetch')) {
                this.showError('Network error. Please check if the backend server is running.');
            } else {
                this.showError('Failed to load personas. Please try again.');
            }
            
            // Fallback to empty state
            this.personas = [];
            this.filteredPersonas = [];
            this.renderPersonas();
        }
    }

    renderPersonas() {
        const grid = document.getElementById('personasGrid');
        const emptyState = document.getElementById('emptyState');

        if (!grid) return;

        if (this.filteredPersonas.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        grid.innerHTML = this.filteredPersonas.map(persona => this.createPersonaCard(persona)).join('');

        // Add click listeners
        document.querySelectorAll('.persona-card').forEach(card => {
            card.addEventListener('click', () => {
                const personaId = card.dataset.personaId;
                window.location.href = `/persona-detail.html?id=${personaId}`;
            });
        });
    }

    createPersonaCard(persona) {
        const traits = persona.traits || {};
        const avgTrait = Object.values(traits).length > 0 
            ? Object.values(traits).reduce((a, b) => a + b, 0) / Object.values(traits).length 
            : 0;

        return `
            <div class="persona-card" data-persona-id="${persona.id}">
                <div class="persona-card-header">
                    <img src="${persona.avatar_url}" alt="${persona.name}" class="persona-avatar">
                    <div class="persona-badge">${this.getCategoryEmoji(persona.category)}</div>
                </div>

                <div class="persona-card-body">
                    <h3 class="persona-name">${persona.name}</h3>
                    <p class="persona-tagline">${persona.tagline}</p>

                    <div class="persona-stats">
                        <span class="stat">
                            <span class="stat-icon">⭐</span>
                            <span class="stat-value">${(persona.rating || 0).toFixed(1)}</span>
                        </span>
                        <span class="stat">
                            <span class="stat-icon">💬</span>
                            <span class="stat-value">${persona.total_interactions || 0}</span>
                        </span>
                        <span class="stat">
                            <span class="stat-icon">⚡</span>
                            <span class="stat-value">${avgTrait.toFixed(0)}/10</span>
                        </span>
                    </div>

                    <div class="persona-traits-mini">
                        ${this.renderMiniTraits(traits)}
                    </div>
                </div>

                <div class="persona-card-footer">
                    <div class="persona-price">
                        <span class="price-label">Unlock for</span>
                        <span class="price-value">Ⓝ ${persona.price} STT</span>
                    </div>
                    <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); window.location.href='/persona-detail.html?id=${persona.id}'">
                        Chat Now →
                    </button>
                </div>
            </div>
        `;
    }

    renderMiniTraits(traits) {
        const traitIcons = {
            empathy: '❤️',
            wisdom: '🧠',
            humor: '😄',
            energy: '⚡',
            creativity: '🎨',
            intelligence: '🌟',
            logic: '🔍',
            intuition: '🔮'
        };

        return Object.entries(traits)
            .slice(0, 4)
            .map(([key, value]) => `
                <span class="mini-trait" title="${key}: ${value}/10">
                    ${traitIcons[key] || '⭐'} ${value}
                </span>
            `).join('');
    }

    getCategoryEmoji(category) {
        const emojis = {
            'content-creator': '🎬',
            'academic': '🎓',
            'mystical': '🔮',
            'motivation': '💪',
            'tech': '💻',
            'wellness': '🌿',
            'creative': '🎨',
            'education': '📚',
            'science': '🔬',
            'psychology': '🧠',
            'arts': '🎭',
            'fitness': '🏋️',
            'therapy': '💆',
            'business': '💼',
            'literature': '📖',
            'lifecoach': '🌟',
            'futurism': '🚀',
            'relationships': '💑'
        };

        return emojis[category] || '🤖';
    }

    setupEventListeners() {
        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.loadPersonas();
            });
        }

        // Sort filter
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', () => {
                this.loadPersonas();
            });
        }

        // Search
        let searchTimeout;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filterBySearch(e.target.value);
                }, 300);
            });
        }
    }

    filterBySearch(query) {
        const searchLower = query.toLowerCase();
        if (!query) {
            this.filteredPersonas = [...this.personas];
        } else {
            this.filteredPersonas = this.personas.filter(persona =>
                persona.name.toLowerCase().includes(searchLower) ||
                persona.tagline.toLowerCase().includes(searchLower) ||
                (persona.personality && persona.personality.toLowerCase().includes(searchLower)) ||
                persona.category.toLowerCase().includes(searchLower)
            );
        }
        this.renderPersonas();
    }

    showError(message) {
        const grid = document.getElementById('personasGrid');
        if (!grid) return;
        
        grid.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Oops!</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PersonaGallery();
});
