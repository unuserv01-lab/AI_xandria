// assets/js/modules/persona-gallery.js
// Frontend module untuk Persona Gallery

export class PersonaGallery {
    constructor() {
        this.API_BASE = '/api/persona';
        this.currentPage = 1;
        this.currentCategory = 'all';
        this.currentSort = 'popular';
        this.searchQuery = '';
    }

    async init() {
        console.log('🎭 Initializing Persona Gallery...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadFeaturedPersonas();
        await this.loadAllPersonas();
    }

    setupEventListeners() {
        // Search
        const searchInput = document.getElementById('searchInput');
        let searchTimeout;
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.loadAllPersonas();
            }, 500);
        });

        // Category filter
        document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.currentPage = 1;
            this.loadAllPersonas();
        });

        // Sort filter
        document.getElementById('sortFilter')?.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.currentPage = 1;
            this.loadAllPersonas();
        });

        // View toggle
        document.getElementById('gridView')?.addEventListener('click', () => {
            this.switchView('grid');
        });
        document.getElementById('listView')?.addEventListener('click', () => {
            this.switchView('list');
        });
    }

    async loadFeaturedPersonas() {
        try {
            const response = await fetch(`${this.API_BASE}/featured`);
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                this.renderFeaturedPersonas(data.data);
            }
        } catch (error) {
            console.error('Error loading featured personas:', error);
        }
    }

    async loadAllPersonas() {
        const grid = document.getElementById('personasGrid');
        const loading = document.getElementById('loadingState');
        const empty = document.getElementById('emptyState');

        // Show loading
        loading.classList.remove('hidden');
        grid.classList.add('hidden');
        empty.classList.add('hidden');

        try {
            // Build query params
            const params = new URLSearchParams({
                category: this.currentCategory,
                sortBy: this.currentSort,
                page: this.currentPage,
                limit: 12
            });

            const response = await fetch(`${this.API_BASE}/all?${params}`);
            const data = await response.json();

            loading.classList.add('hidden');

            if (data.success && data.data.length > 0) {
                grid.classList.remove('hidden');
                this.renderPersonas(data.data);
                this.renderPagination(data.pagination);
                document.getElementById('totalCount').textContent = data.pagination.total;
            } else {
                empty.classList.remove('hidden');
            }

        } catch (error) {
            console.error('Error loading personas:', error);
            loading.classList.add('hidden');
            empty.classList.remove('hidden');
        }
    }

    renderFeaturedPersonas(personas) {
        const grid = document.getElementById('featuredGrid');
        grid.innerHTML = '';

        personas.slice(0, 6).forEach(persona => {
            const card = this.createPersonaCard(persona, true);
            grid.appendChild(card);
        });
    }

    renderPersonas(personas) {
        const grid = document.getElementById('personasGrid');
        grid.innerHTML = '';

        personas.forEach(persona => {
            const card = this.createPersonaCard(persona, false);
            grid.appendChild(card);
        });
    }

    createPersonaCard(persona, isFeatured = false) {
        const template = document.getElementById('personaCardTemplate');
        const card = template.content.cloneNode(true);

        // Get card element
        const cardEl = card.querySelector('.persona-card');
        cardEl.dataset.personaId = persona._id;

        // Populate data
        card.querySelector('.persona-avatar').src = persona.avatar || this.getDefaultAvatar(persona.category);
        card.querySelector('.persona-avatar').alt = persona.name;
        card.querySelector('.category-badge').textContent = persona.category.toUpperCase();
        card.querySelector('.persona-name').textContent = persona.name;
        card.querySelector('.persona-role').textContent = persona.role;
        card.querySelector('.persona-personality').textContent = persona.personality;
        card.querySelector('.persona-rating').textContent = persona.stats.averageRating.toFixed(1);
        card.querySelector('.persona-interactions').textContent = persona.stats.totalInteractions;
        card.querySelector('.persona-cost').textContent = persona.chatCost;

        // Add featured badge if needed
        if (isFeatured) {
            const badge = document.createElement('span');
            badge.className = 'absolute top-2 left-2 px-3 py-1 bg-yellow-400 text-xs font-bold rounded-full';
            badge.innerHTML = '⭐ FEATURED';
            card.querySelector('.persona-card > div').appendChild(badge);
        }

        // Add click handler
        const interactBtn = card.querySelector('.interact-btn');
        interactBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleInteract(persona);
        });

        cardEl.addEventListener('click', () => {
            this.showPersonaDetail(persona);
        });

        return card;
    }

    renderPagination(pagination) {
        const container = document.getElementById('pagination');
        container.innerHTML = '';

        if (pagination.pages <= 1) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');

        // Previous button
        if (pagination.page > 1) {
            const prevBtn = this.createPaginationButton('‹ Prev', pagination.page - 1);
            container.appendChild(prevBtn);
        }

        // Page numbers
        for (let i = 1; i <= pagination.pages; i++) {
            // Show first, last, current, and adjacent pages
            if (i === 1 || i === pagination.pages || 
                (i >= pagination.page - 1 && i <= pagination.page + 1)) {
                const pageBtn = this.createPaginationButton(i, i, i === pagination.page);
                container.appendChild(pageBtn);
            } else if (i === pagination.page - 2 || i === pagination.page + 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'px-4 py-2 text-gray-500';
                ellipsis.textContent = '...';
                container.appendChild(ellipsis);
            }
        }

        // Next button
        if (pagination.page < pagination.pages) {
            const nextBtn = this.createPaginationButton('Next ›', pagination.page + 1);
            container.appendChild(nextBtn);
        }
    }

    createPaginationButton(text, page, active = false) {
        const btn = document.createElement('button');
        btn.className = active 
            ? 'px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold'
            : 'px-4 py-2 bg-white text-gray-700 rounded-lg border hover:bg-gray-50';
        btn.textContent = text;
        
        if (!active) {
            btn.addEventListener('click', () => {
                this.currentPage = page;
                this.loadAllPersonas();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        return btn;
    }

    switchView(view) {
        const grid = document.getElementById('personasGrid');
        const gridBtn = document.getElementById('gridView');
        const listBtn = document.getElementById('listView');

        if (view === 'grid') {
            grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
            gridBtn.className = 'px-4 py-2 bg-purple-600 text-white rounded-lg';
            listBtn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg';
        } else {
            grid.className = 'space-y-4';
            listBtn.className = 'px-4 py-2 bg-purple-600 text-white rounded-lg';
            gridBtn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg';
        }
    }

    getDefaultAvatar(category) {
        const avatars = {
            spiritual: 'https://api.dicebear.com/7.x/lorelei/svg?seed=spiritual',
            lifestyle: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lifestyle',
            technology: 'https://api.dicebear.com/7.x/bottts/svg?seed=tech',
            culinary: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef',
            arts: 'https://api.dicebear.com/7.x/lorelei/svg?seed=artist',
            education: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
            science: 'https://api.dicebear.com/7.x/bottts/svg?seed=science',
            wellness: 'https://api.dicebear.com/7.x/lorelei/svg?seed=wellness',
            mystery: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mystery'
        };
        return avatars[category] || avatars.lifestyle;
    }

    async handleInteract(persona) {
        // Check if wallet is connected
        const walletAddress = this.getWalletAddress();
        
        if (!walletAddress) {
            this.showWalletPrompt();
            return;
        }

        // Redirect to persona detail page
        window.location.href = `persona-detail.html?id=${persona._id}`;
    }

    showPersonaDetail(persona) {
        window.location.href = `persona-detail.html?id=${persona._id}`;
    }

    getWalletAddress() {
        // TODO: Implement wallet connection check
        // For now, check localStorage
        return localStorage.getItem('walletAddress');
    }

    showWalletPrompt() {
        alert('Please connect your wallet first!');
        // TODO: Implement proper modal with wallet connection
    }
}

// Export for use
export default PersonaGallery;
