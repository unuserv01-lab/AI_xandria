// ============================================
// Persona Gallery - Frontend Controller
// FIXED VERSION
// ============================================

class PersonaGallery {
  constructor() {
    this.personas = [];
    this.filteredPersonas = [];
    this.isLoading = false;
  }

  async init() {
    console.log('🚀 Initializing Persona Gallery...');
    await this.loadPersonas();
    this.setupEventListeners();
  }

  async loadPersonas() {
    try {
      this.isLoading = true;
      this.showLoadingState();
      
      const category = document.getElementById('categoryFilter')?.value || '';
      const sort = document.getElementById('sortFilter')?.value || 'newest';
      
      console.log(`📡 Fetching personas - Category: ${category || 'all'}, Sort: ${sort}`);
      
      // FIX: Changed from /api/persona to /api/personas
      const response = await fetch(`/api/personas/featured?category=${category}&sort=${sort}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      console.log('✅ Response received:', data);
      
      if (data.success && data.personas) {
        this.personas = data.personas;
        this.filteredPersonas = [...this.personas];
        console.log(`✅ Loaded ${this.personas.length} personas`);
        this.renderPersonas();
      } else {
        throw new Error(data.message || 'Failed to load personas');
      }
      
    } catch (error) {
      console.error('❌ Error loading personas:', error);
      this.showError(`Failed to load personas: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  renderPersonas() {
    const grid = document.getElementById('personasGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!grid) {
      console.error('❌ Personas grid element not found');
      return;
    }
    
    // Hide loading/empty states
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'none';
    
    if (this.filteredPersonas.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }
    
    console.log(`🎨 Rendering ${this.filteredPersonas.length} personas`);
    
    // Render each persona card
    this.filteredPersonas.forEach(persona => {
      const card = this.createPersonaCard(persona);
      grid.appendChild(card);
    });
  }

  createPersonaCard(persona) {
    const card = document.createElement('div');
    card.className = 'persona-card';
    card.dataset.personaId = persona.id;
    
    // Parse traits if it's a string
    let traits = persona.traits;
    if (typeof traits === 'string') {
      try {
        traits = JSON.parse(traits);
      } catch (e) {
        traits = { empathy: 7, wisdom: 7, humor: 7, energy: 7 };
      }
    }
    
    const avgTrait = Object.values(traits).reduce((sum, val) => sum + val, 0) / Object.keys(traits).length;
    
    card.innerHTML = `
      <div class="persona-card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <img src="${persona.avatar_url || this.getDefaultAvatar(persona.name)}" 
             alt="${persona.name}" 
             class="persona-avatar"
             onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(persona.name)}'">
        <div class="persona-badge">${this.getCategoryEmoji(persona.category)}</div>
      </div>
      
      <div class="persona-card-body">
        <h3 class="persona-name">${persona.name}</h3>
        <p class="persona-tagline">${persona.tagline || 'Your AI Companion'}</p>
        
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
            <span class="stat-icon">🎯</span>
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
          <span class="price-value">💎 ${persona.price} STT</span>
        </div>
        <button class="btn btn-primary btn-small">
          Chat Now →
        </button>
      </div>
    `;
    
    // Add click event
    card.addEventListener('click', () => {
      window.location.href = `/persona-detail.html?id=${persona.id}`;
    });
    
    return card;
  }

  renderMiniTraits(traits) {
    const traitIcons = {
      empathy: '❤️',
      wisdom: '🧠',
      humor: '😄',
      energy: '⚡'
    };
    
    return Object.entries(traits)
      .slice(0, 4)
      .map(([key, value]) => `
        <span class="mini-trait" title="${key}: ${value}/10">
          ${traitIcons[key] || '✨'} ${value}
        </span>
      `).join('');
  }

  getCategoryEmoji(category) {
    const emojis = {
      mystical: '🔮',
      motivation: '💪',
      tech: '💻',
      wellness: '🧘',
      creative: '🎨',
      education: '📚',
      science: '🔬',
      psychology: '🧠',
      arts: '🎭',
      fitness: '🏋️',
      therapy: '💚',
      business: '💼',
      literature: '📖',
      lifecoach: '🌟',
      futurism: '🚀',
      relationships: '💕'
    };
    return emojis[category] || '✨';
  }

  getDefaultAvatar(name) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&size=512`;
  }

  setupEventListeners() {
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => {
        console.log('🔄 Category changed:', categoryFilter.value);
        this.loadPersonas();
      });
    }
    
    // Sort filter
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
      sortFilter.addEventListener('change', () => {
        console.log('🔄 Sort changed:', sortFilter.value);
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
          console.log('🔍 Search:', e.target.value);
          this.filterBySearch(e.target.value);
        }, 300);
      });
    }
  }

  filterBySearch(query) {
    const searchLower = query.toLowerCase().trim();
    
    if (!searchLower) {
      this.filteredPersonas = [...this.personas];
    } else {
      this.filteredPersonas = this.personas.filter(persona =>
        persona.name.toLowerCase().includes(searchLower) ||
        persona.tagline?.toLowerCase().includes(searchLower) ||
        persona.personality?.toLowerCase().includes(searchLower) ||
        persona.category.toLowerCase().includes(searchLower)
      );
    }
    
    console.log(`🔍 Filtered: ${this.filteredPersonas.length} of ${this.personas.length} personas`);
    this.renderPersonas();
  }

  showLoadingState() {
    const grid = document.getElementById('personasGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading personas...</p>
        </div>
      `;
    }
  }

  showError(message) {
    const grid = document.getElementById('personasGrid');
    if (grid) {
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
}

// ============================================
// Initialize when DOM is ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM loaded, initializing gallery...');
  const gallery = new PersonaGallery();
  gallery.init();
});
