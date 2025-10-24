class CarouselSystem {
  constructor(containerId, personaType = 'content-creator') {
    this.container = document.getElementById(containerId);
    this.personaType = personaType;
    this.currentIndex = 0;
    this.personas = [];
    this.isAnimating = false;
  }

  init() {
    // ✅ Ambil data langsung dari personaLoader
    if (typeof personaLoader !== 'undefined') {
      this.personas = personaLoader.getCarouselPersonas(this.personaType);
    } else {
      console.error('personaLoader not found');
      return;
    }

    this.createCarousel();
    this.updateCarousel();
    this.setupEventListeners();
    this.showCarousel();
  }

  createCarousel() {
    this.container.innerHTML = '';

    this.personas.forEach((persona, index) => {
      const carouselItem = document.createElement('div');
      carouselItem.className = 'carousel-item';
      carouselItem.setAttribute('data-index', index);
      carouselItem.setAttribute('data-persona', persona.id);

      carouselItem.innerHTML = `
        <div class="carousel-avatar" style="background: linear-gradient(135deg, ${persona.color}, #000000)">
          <span class="avatar-emoji">${persona.name.split(' ')[0]}</span>
        </div>
        <div class="carousel-content">
          <h3 class="carousel-name">${persona.name}</h3>
          <p class="carousel-tagline">${persona.tagline}</p>
          <p class="carousel-description">${persona.description}</p>
        </div>
      `;

      this.container.appendChild(carouselItem);
    });
  }

class CarouselSystem {
  constructor(containerId, personaType = 'content-creator') {
    this.container = document.getElementById(containerId);
    this.personaType = personaType;
    this.currentIndex = 0;
    this.personas = [];
    this.isAnimating = false;
  }

  init() {
    // ✅ Ambil data langsung dari personaLoader
    if (typeof personaLoader !== 'undefined') {
      this.personas = personaLoader.getCarouselPersonas(this.personaType);
    } else {
      console.error('personaLoader not found');
      return;
    }

    this.createCarousel();
    this.updateCarousel();
    this.setupEventListeners();
    this.showCarousel();
  }

  createCarousel() {
    this.container.innerHTML = '';

    this.personas.forEach((persona, index) => {
      const carouselItem = document.createElement('div');
      carouselItem.className = 'carousel-item';
      carouselItem.setAttribute('data-index', index);
      carouselItem.setAttribute('data-persona', persona.id);

      carouselItem.innerHTML = `
        <div class="carousel-avatar" style="background: linear-gradient(135deg, ${persona.color}, #000000)">
          <span class="avatar-emoji">${persona.name.split(' ')[0]}</span>
        </div>
        <div class="carousel-content">
          <h3 class="carousel-name">${persona.name}</h3>
          <p class="carousel-tagline">${persona.tagline}</p>
          <p class="carousel-description">${persona.description}</p>
        </div>
      `;

      this.container.appendChild(carouselItem);
    });
  }

  // ... (fungsi updateCarousel, next, prev, selectPersona dll sama kayak aslinya)
}

// Global carousel instance
let carousel = null;
document.addEventListener('DOMContentLoaded', () => {
  const carouselContainer = document.getElementById('gameCarousel');
  if (carouselContainer) {
    carousel = new CarouselSystem('gameCarousel', 'content-creator');
    carousel.init();
  }
});
}

// Global carousel instance
let carousel = null;
document.addEventListener('DOMContentLoaded', () => {
  const carouselContainer = document.getElementById('gameCarousel');
  if (carouselContainer) {
    carousel = new CarouselSystem('gameCarousel', 'content-creator');
    carousel.init();
  }
});
