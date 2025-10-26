// assets/js/modules/persona-gallery.js - UPDATED VERSION

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
            this.showLoadingState();
            
            const category = document.getElementById('categoryFilter')?.value || '';
            const sort = document.getElementById('sortFilter')?.value || 'newest';

            const response = await fetch(
                `${this.API_BASE_URL}/personas/featured?category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}`
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
            
            // Fallback: Use persona-loader data
            if (typeof personaLoader !== 'undefined') {
                console.log('Using personaLoader fallback data');
                this.personas = personaLoader.getRealmPersonas('all');
                this.filteredPersonas = [...this.personas];
                this.renderPersonas();
            } else {
                this.showError('Failed to load personas. Please check your connection.');
            }
        }
    }

    renderPersonas() {
        const grid = document.getElementById('personasGrid');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');

        if (!grid) return;

        // Hide loading
        if (loadingState) loadingState.style.display = 'none';

        if (this.filteredPersonas.length === 0) {
            grid.innerHTML = "";
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        
        // Render personas
        grid.innerHTML = this.filteredPersonas.map(persona => this.createPersonaCard(persona)).join('');

        // Add click listeners
        document.querySelectorAll('.persona-card').forEach(card => {
            card.addEventListener('click', () => {
                const personaId = card.dataset.personaId;
                window.location.href = `persona-detail.html?id=${personaId}`;
            });
        });
    }

    createPersonaCard(persona) {
        // Handle both backend and frontend persona formats
        const personaData = this.normalizePersonaData(persona);
        
        return `
            <div class="persona-card" data-persona-id="${personaData.id}">
                <div class="persona-card-header">
                    ${this.getAvatarHTML(personaData)}
                    <div class="persona-badge">${this.getCategoryEmoji(personaData.category)}</div>
                </div>
                <div class="persona-card-body">
                    <h3 class="persona-name">${personaData.name}</h3>
                    <p class="persona-tagline">${personaData.tagline}</p>
                    <div class="persona-stats">
                        <span class="stat">
                            <span class="stat-icon">⭐</span>
                            <span class="stat-value">${personaData.rating}</span>
                        </span>
                        <span class="stat">
                            <span class="stat-icon">💬</span>
                            <span class="stat-value">${personaData.interactions}</span>
                        </span>
                        <span class="stat">
                            <span class="stat-icon">👥</span>
                            <span class="stat-value">${personaData.users}</span>
                        </span>
                    </div>
                </div>
                <div class="persona-card-footer">
                    <div class="persona-price">
                        <span class="price-label">Unlock for</span>
                        <span class="price-value">${personaData.price}</span>
                    </div>
                    <button class="btn btn-primary btn-small" 
                            onclick="event.stopPropagation(); window.location.href='persona-detail.html?id=${personaData.id}'">
                        Chat Now →
                    </button>
                </div>
            </div>
        `;
    }

    normalizePersonaData(persona) {
        // Normalize data from different sources (backend vs frontend)
        return {
            id: persona.id || persona.name?.toLowerCase(),
            name: persona.name || persona.displayName,
            tagline: persona.tagline || 'AI Persona',
            category: persona.category || persona.type || 'content-creator',
            avatar_url: persona.avatar_url || persona.videoUrl || 
                       `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.name}`,
            rating: (persona.rating || persona.stats?.rating || '4.5').replace('★', '').replace('%', ''),
            interactions: persona.total_interactions || persona.stats?.users || '1.2K',
            users: persona.users || persona.stats?.users || '1.5K',
            price: persona.price || '5 STT'
        };
    }

    getAvatarHTML(persona) {
        if (persona.avatar_url.includes('.mp4')) {
            return `
                <video class="persona-avatar" autoplay loop muted playsinline>
                    <source src="${persona.avatar_url}" type="video/mp4">
                </video>
            `;
        } else {
            return `<img src="${persona.avatar_url}" alt="${persona.name}" class="persona-avatar">`;
        }
    }

    getCategoryEmoji(category) {
        const emojis = {
            'content-creator': '🎭',
            'academic': '🎓', 
            'mystical': '🔮',
            'motivation': '💪',
            'tech': '💻',
            'special': '⭐'
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
        const searchLower = query.toLowerCase().trim();
        
        if (!query) {
            this.filteredPersonas = [...this.personas];
        } else {
            this.filteredPersonas = this.personas.filter(persona => {
                const normalized = this.normalizePersonaData(persona);
                return (
                    normalized.name.toLowerCase().includes(searchLower) ||
                    normalized.tagline.toLowerCase().includes(searchLower) ||
                    normalized.category.toLowerCase().includes(searchLower)
                );
            });
        }
        
        this.renderPersonas();
    }

    showLoadingState() {
        const grid = document.getElementById('personasGrid');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        
        if (grid) grid.innerHTML = '';
        if (loadingState) loadingState.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
    }

    showError(message) {
        const grid = document.getElementById('personasGrid');
        const loadingState = document.getElementById('loadingState');
        
        if (loadingState) loadingState.style.display = 'none';
        
        if (!grid) return;

        grid.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="personaGallery.loadPersonas()">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.personaGallery = new PersonaGallery();
});
