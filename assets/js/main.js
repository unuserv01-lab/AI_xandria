// ============================================
// AI_xandria Main JavaScript
// Core 3D Globe & Application Logic
// ============================================

let globe, controls, renderer, scene, camera, pulseGroup, raycaster, mouse;

// ============================================
// GLOBE INITIALIZATION
// ============================================

function initializeGlobe() {
    const container = document.getElementById('globe-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 14);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 25;
    controls.enablePan = false;

    const globeRadius = 5;
    const globeGeom = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMat = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.15 
    });
    globe = new THREE.Mesh(globeGeom, globeMat);
    scene.add(globe);

    // Lighting
    const light1 = new THREE.PointLight(0xff00ff, 1.5, 50);
    light1.position.set(10, 10, 10);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xa020f0, 1, 50);
    light2.position.set(-10, -10, -10);
    scene.add(light2);

    // Stars
    addStars();

    // Load World Map
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(res => res.json())
        .then(data => {
            const countries = topojson.feature(data, data.objects.countries).features;
            drawWorldOutline(countries);
            addCityLights(countries);
        });

    // Pulse Points (Persona Locations)
    addPulsePoints(globeRadius);

    // Raycaster for interactions
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Start animation
    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function addStars() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 5000;
    const starPos = [];
    
    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starPos.push(x, y, z);
    }
    
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.3, 
        transparent: true, 
        opacity: 0.8 
    });
    scene.add(new THREE.Points(starGeo, starMat));
}

function latLonToVector3(lat, lon, r) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = (r * Math.sin(phi) * Math.sin(theta));
    const y = (r * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
}

function drawWorldOutline(features) {
    const lineMat = new THREE.LineBasicMaterial({
        color: 0xFF00FF,
        transparent: true,
        opacity: 0.9,
        linewidth: 1.5
    });
    
    features.forEach(feature => {
        const coords = feature.geometry.coordinates;
        const type = feature.geometry.type;
        
        if (type === "Polygon") {
            coords.forEach(ring => addLine(ring, lineMat)); 
        } else if (type === "MultiPolygon") {
            coords.forEach(polygon => polygon.forEach(ring => addLine(ring, lineMat)));
        }
    });
}

function addLine(ring, material) {
    const points = [];
    const globeRadius = 5;
    
    ring.forEach(coord => {
        const lon = coord[0];
        const lat = coord[1];
        points.push(latLonToVector3(lat, lon, globeRadius + 0.005));
    });
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    globe.add(line);
}

function addCityLights(countries) {
    const cityLightGroup = new THREE.Group();
    globe.add(cityLightGroup);
    
    countries.forEach(country => {
        const coords = country.geometry.coordinates;
        const type = country.geometry.type;
        let numPoints = Math.floor(Math.random() * 6) + 5;
        
        if (type === "Polygon") {
            const outerRing = coords[0];
            for (let i = 0; i < numPoints; i++) {
                const point = getRandomPointInPolygon(outerRing);
                if (point) {
                    addCityLight(point.lat, point.lon, cityLightGroup);
                }
            }
        } else if (type === "MultiPolygon") {
            coords.forEach(polygon => {
                const outerRing = polygon[0];
                for (let i = 0; i < numPoints; i++) {
                    const point = getRandomPointInPolygon(outerRing);
                    if (point) {
                        addCityLight(point.lat, point.lon, cityLightGroup);
                    }
                }
            });
        }
    });
}

function getRandomPointInPolygon(ring) {
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
    
    ring.forEach(coord => {
        const lon = coord[0], lat = coord[1];
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
    });
    
    let attempts = 0;
    while (attempts < 100) {
        const lon = minLon + Math.random() * (maxLon - minLon);
        const lat = minLat + Math.random() * (maxLat - minLat);
        if (pointInPolygon([lon, lat], ring)) {
            return { lat, lon };
        }
        attempts++;
    }
    return null;
}

function pointInPolygon(point, vs) {
    const x = point[0], y = point[1];
    let inside = false;
    
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];
        
        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function addCityLight(lat, lon, group) {
    const globeRadius = 5;
    const pos = latLonToVector3(lat, lon, globeRadius + 0.01);
    
    const cityLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        new THREE.MeshBasicMaterial({ 
            color: 0xffff00, 
            transparent: true,
            opacity: 0.8
        })
    );
    
    cityLight.position.copy(pos);
    cityLight.userData = { 
        originalScale: 1,
        pulseSpeed: 0.5 + Math.random() * 1.5, 
        baseOpacity: 0.5 + Math.random() * 0.4 
    };
    group.add(cityLight);
}

function addPulsePoints(globeRadius) {
    const islandData = [
        { lat: -7.25, lon: 112.75, name: "AI Xandria Core", desc: "Central Hub (Surabaya)", link: "https://aixandria.com/core" },
        { lat: 35.68, lon: 139.69, name: "Neural Nexus", desc: "AI Intelligence Center (Tokyo)", link: "https://aixandria.com/neural" },
        { lat: 48.85, lon: 2.35, name: "Quantum Thinker", desc: "Advanced Reasoning (Paris)", link: "https://aixandria.com/quantum" },
        { lat: 40.71, lon: -74.00, name: "Crypto Strategist", desc: "Blockchain Expert (New York)", link: "https://aixandria.com/crypto" },
        { lat: 51.50, lon: -0.12, name: "Digital Historian", desc: "AI Knowledge Keeper (London)", link: "https://aixandria.com/historian" }
    ];

    pulseGroup = new THREE.Group();
    globe.add(pulseGroup);

    islandData.forEach(island => {
        const { lat, lon } = island;
        const pos = latLonToVector3(lat, lon, globeRadius + 0.01);

        const pulse = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 16, 16),
            new THREE.MeshBasicMaterial({ 
                color: 0xff00ff,
                transparent: true,
                opacity: 0.9 
            })
        );
        pulse.position.copy(pos);
        pulse.userData = island;
        pulseGroup.add(pulse);
    });
}

// ============================================
// ANIMATION LOOP
// ============================================

function animate() {
    requestAnimationFrame(animate);
    
    if (controls) controls.update();
    if (globe) globe.rotation.y += 0.0005;

    const time = Date.now() * 0.003;
    
    // Animate pulse points
    if (pulseGroup) {
        pulseGroup.children.forEach((p, i) => {
            const scale = 1 + Math.sin(time + i) * 0.3;
            p.scale.setScalar(scale);
            p.material.opacity = 0.5 + Math.abs(Math.sin(time + i)) * 0.5;
        });
    }

    // Animate city lights
    if (globe && globe.children.length > 0) {
        const cityLights = globe.children.filter(child => 
            child.children && child.children.some(c => c.material && c.material.color.getHex() === 0xffff00)
        );
        
        if (cityLights.length > 0) {
            cityLights[0].children.forEach((light, i) => {
                const userData = light.userData;
                const scale = userData.originalScale + Math.sin(time * userData.pulseSpeed + i) * 0.2;
                light.scale.setScalar(scale);
                light.material.opacity = userData.baseOpacity + Math.sin(time * userData.pulseSpeed * 2 + i) * 0.3;
            });
        }
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// ============================================
// LOADING SCREEN
// ============================================

window.addEventListener('load', function() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingProgress = document.getElementById('loadingProgress');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    initializeGlobe();
                }, 800);
            }, 500);
        }
        loadingProgress.style.width = progress + '%';
    }, 200);
});

// ============================================
// MODAL FUNCTIONS
// ============================================

function openPersonaForm() {
    const modal = document.getElementById('personaModal');
    modal.classList.add('active');
    
    setTimeout(() => {
        const nameInput = document.getElementById('personaName');
        if (nameInput) nameInput.focus();
    }, 300);
}

function closePersonaForm() {
    const modal = document.getElementById('personaModal');
    modal.classList.remove('active');
    
    // Reset form
    document.getElementById('personaName').value = '';
    document.getElementById('personaCategory').value = '';
    document.getElementById('personaSpecialization').value = '';
    document.getElementById('personaTraits').value = '';
    document.getElementById('visualPrompt').value = '';
    
    // Reset preview
    document.getElementById('previewArea').innerHTML = `
        <div class="preview-placeholder">
            <p>🎭 Your AI persona will appear here...</p>
            <p style="font-size: 0.8rem; margin-top: 1rem;">Fill the form and click "Generate" to create your unique persona!</p>
        </div>
    `;
    
    document.getElementById('mintBtn').disabled = true;
}

function exploreSomnia() {
    window.open('https://shannon-explorer.somnia.network/address/0xd9145CCE52D386f254917e481eB44e9943F39138', '_blank');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(0, 255, 0, 0.9)' : type === 'error' ? 'rgba(255, 0, 0, 0.9)' : 'rgba(255, 0, 255, 0.9)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        font-family: 'Orbitron', sans-serif;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export for use in other modules
window.showNotification = showNotification;
