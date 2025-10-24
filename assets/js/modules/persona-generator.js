// ============================================
// Persona Generator Module
// Handles AI persona generation and preview
// ============================================

let generatedPersonaData = null;
const API_BASE_URL = 'http://localhost:3000/api';

// ============================================
// GENERATE PERSONA
// ============================================

async function generatePersona() {
    // Get form values
    const name = document.getElementById('personaName').value.trim();
    const category = document.getElementById('personaCategory').value;
    const specialization = document.getElementById('personaSpecialization').value.trim();
    const traits = document.getElementById('personaTraits').value.trim();
    const visualPrompt = document.getElementById('visualPrompt').value.trim();
    
    // Validation
    if (!name || !category || !specialization) {
        showNotification('❌ Please fill all required fields (Name, Category, Specialization)', 'error');
        return;
    }
    
    // Check wallet connection
    if (!window.currentWalletAddress) {
        showNotification('⚠️ Please connect your wallet first!', 'error');
        setTimeout(() => connectWallet(), 1000);
        return;
    }
    
    const generateBtn = document.getElementById('generateBtn');
    const originalText = generateBtn.textContent;
    generateBtn.textContent = '⏳ Generating...';
    generateBtn.disabled = true;
    
    // Show loading in preview
    document.getElementById('previewArea').innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">🤖</div>
            <p style="color: #ff00ff;">Generating your AI persona...</p>
            <p style="color: #888; font-size: 0.8rem; margin-top: 0.5rem;">This may take a few seconds</p>
        </div>
    `;
    
    try {
        // Build prompt for AI
        const prompt = buildPersonaPrompt(name, specialization, traits, visualPrompt);
        
        // Call backend API
        const response = await fetch(`${API_BASE_URL}/persona/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                walletAddress: window.currentWalletAddress,
                category: category
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            generatedPersonaData = result.data;
            displayPersonaPreview(result.data);
            document.getElementById('mintBtn').disabled = false;
            showNotification('✅ Persona generated successfully!', 'success');
        } else {
            throw new Error(result.message || 'Failed to generate persona');
        }
        
    } catch (error) {
        console.error('❌ Generation error:', error);
        
        // Fallback to mock data for testing
        console.log('⚠️ Using mock data for testing...');
        const mockData = generateMockPersona(name, category, specialization, traits);
        generatedPersonaData = mockData;
        displayPersonaPreview(mockData);
        document.getElementById('mintBtn').disabled = false;
        
        showNotification('⚠️ Using test mode (backend not connected)', 'error');
    } finally {
        generateBtn.textContent = originalText;
        generateBtn.disabled = false;
    }
}

// ============================================
// BUILD PROMPT
// ============================================

function buildPersonaPrompt(name, specialization, traits, visualPrompt) {
    let prompt = `Create an AI persona named "${name}" with specialization in "${specialization}".`;
    
    if (traits) {
        prompt += ` Personality traits: ${traits}.`;
    }
    
    if (visualPrompt) {
        prompt += ` Visual appearance: ${visualPrompt}.`;
    }
    
    return prompt;
}

// ============================================
// DISPLAY PREVIEW
// ============================================

function displayPersonaPreview(data) {
    const previewArea = document.getElementById('previewArea');
    
    const traitsHTML = data.traits ? data.traits.map(t => 
        `<span class="trait-tag">${t.category}: ${t.value}</span>`
    ).join('') : '';
    
    previewArea.innerHTML = `
        <div class="persona-preview">
            <div style="text-align: center; margin-bottom: 1rem;">
                ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.name}" style="width: 100%; max-width: 300px; border-radius: 15px; border: 2px solid #ff00ff;">` : '<div style="width: 100%; height: 200px; background: rgba(255, 0, 255, 0.1); border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 3rem;">🤖</div>'}
            </div>
            
            <h4>🎭 ${data.name}</h4>
            <p style="color: #00ffff; font-size: 0.9rem; margin-bottom: 0.5rem;">
                <strong>Category:</strong> ${data.category}
            </p>
            <p>${data.description}</p>
            
            ${traitsHTML ? `<div class="persona-traits">${traitsHTML}</div>` : ''}
            
            <div style="margin-top: 1rem; padding: 1rem; background: rgba(0, 0, 0, 0.3); border-radius: 10px; border: 1px solid rgba(255, 0, 255, 0.2);">
                <p style="font-size: 0.85rem; color: #cbd5e1;">
                    <strong style="color: #ff00ff;">Personality:</strong><br>
                    ${formatPersonality(data.personality)}
                </p>
            </div>
            
            ${data.ipfsHash ? `
                <div style="margin-top: 1rem; font-size: 0.8rem; color: #888;">
                    <p>📦 IPFS Hash: <code style="color: #00ffff;">${data.ipfsHash.substring(0, 20)}...</code></p>
                </div>
            ` : ''}
        </div>
    `;
}

function formatPersonality(personality) {
    if (typeof personality === 'string') {
        return personality;
    }
    
    if (typeof personality === 'object') {
        return Object.entries(personality)
            .map(([key, value]) => `<strong>${key}:</strong> ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('<br>');
    }
    
    return 'Unique AI personality';
}

// ============================================
// MINT PERSONA NFT
// ============================================

async function mintPersona() {
    if (!generatedPersonaData) {
        showNotification('❌ No persona data to mint!', 'error');
        return;
    }
    
    if (!window.currentWalletAddress) {
        showNotification('❌ Please connect your wallet first!', 'error');
        await connectWallet();
        return;
    }
    
    if (!window.contract) {
        showNotification('❌ Smart contract not initialized!', 'error');
        return;
    }
    
    const mintBtn = document.getElementById('mintBtn');
    const originalText = mintBtn.textContent;
    mintBtn.textContent = '⏳ Minting...';
    mintBtn.disabled = true;
    
    try {
        console.log('🎨 Minting persona:', generatedPersonaData);
        
        // Prepare metadata URI
        const metadataUri = generatedPersonaData.metadataUri || 
            generatedPersonaData.ipfsHash ? `ipfs://${generatedPersonaData.ipfsHash}` : 
            `ipfs://QmPlaceholder/${Date.now()}`;
        
        // Call smart contract
        const tx = await window.contract.mintMyPersona(
            generatedPersonaData.name,
            generatedPersonaData.category || 'custom',
            metadataUri
        );
        
        showNotification('⏳ Transaction sent! Waiting for confirmation...', 'info');
        console.log('📤 Transaction hash:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed:', receipt);
        
        // Extract token ID from event
        const event = receipt.events?.find(e => e.event === 'PersonaMinted');
        const tokenId = event?.args?.tokenId?.toString();
        
        // Update backend with mint info
        if (generatedPersonaData.personaId) {
            await updateMintStatus(generatedPersonaData.personaId, tokenId, tx.hash);
        }
        
        showNotification(`🎉 Persona minted! Token ID: ${tokenId}`, 'success');
        
        // Show success dialog
        setTimeout(() => {
            if (confirm(`🎉 SUCCESS! Your persona has been minted!\n\n🎫 Token ID: ${tokenId}\n📜 Transaction: ${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}\n\nView on Somnia Explorer?`)) {
                window.open(`https://shannon-explorer.somnia.network/tx/${tx.hash}`, '_blank');
            }
        }, 1000);
        
        // Reset form after successful mint
        setTimeout(() => {
            closePersonaForm();
        }, 3000);
        
    } catch (error) {
        console.error('❌ Minting failed:', error);
        
        let errorMsg = 'Failed to mint persona: ';
        if (error.code === 4001) {
            errorMsg += 'You rejected the transaction.';
        } else if (error.message?.includes('insufficient funds')) {
            errorMsg += 'Insufficient STT tokens for gas fees.';
        } else {
            errorMsg += error.message || 'Unknown error';
        }
        
        showNotification(`❌ ${errorMsg}`, 'error');
        alert(`❌ ${errorMsg}`);
    } finally {
        mintBtn.textContent = originalText;
        mintBtn.disabled = false;
    }
}

// ============================================
// UPDATE MINT STATUS IN BACKEND
// ============================================

async function updateMintStatus(personaId, tokenId, txHash) {
    try {
        const response = await fetch(`${API_BASE_URL}/persona/${personaId}/mint`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tokenId: tokenId,
                txHash: txHash,
                contractAddress: window.CONTRACT_ADDRESS
            })
        });
        
        if (response.ok) {
            console.log('✅ Backend updated with mint status');
        } else {
            console.warn('⚠️ Failed to update backend mint status');
        }
    } catch (error) {
        console.warn('⚠️ Could not update backend:', error);
    }
}

// ============================================
// MOCK DATA GENERATOR (for testing without backend)
// ============================================

function generateMockPersona(name, category, specialization, traits) {
    const traitsList = traits ? traits.split(',').map(t => t.trim()) : ['Creative', 'Intelligent', 'Innovative'];
    
    return {
        personaId: `persona_${Date.now()}`,
        name: name,
        description: `An AI persona specializing in ${specialization}. ${traitsList.join(', ')}.`,
        category: category,
        imageUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        traits: traitsList.map((trait, i) => ({
            category: trait,
            value: 70 + Math.floor(Math.random() * 30),
            displayType: 'number'
        })),
        personality: {
            tone: 'Professional',
            style: 'Analytical',
            expertise: [specialization],
            traits: traitsList,
            catchphrase: `Master of ${specialization}`
        },
        ipfsHash: null,
        metadataUri: `ipfs://QmMock${Date.now()}`,
        createdAt: new Date().toISOString()
    };
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Enter key to generate
    const inputs = ['personaName', 'personaSpecialization', 'personaTraits', 'visualPrompt'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    generatePersona();
                }
            });
        }
    });
});
