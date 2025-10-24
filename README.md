# AI_xandria
"AI-xandria" = The Library of Alexandria, Reborn with AI on Somnia. An eternal digital library where human knowledge comes to life as AI Personas that compete, learn, and generate value — fully owned by the creator via NFT. Tagline: "Where Dead Knowledge Becomes Living Assets."

# 🌟 AI_xandria.v.1

**AI-Powered Persona Platform with NFT Integration on Somnia Network**

Create, chat with, and mint unique AI personas as NFTs. Battle your personas in competitive arenas and trade them in the marketplace.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://www.postgresql.org/)

---

## ✨ Features

### 🎨 AI Persona Generation
- Generate unique AI personas using **Deepseek**, **Gemini**, or **OpenRouter**
- Customizable personality traits, expertise, and visual styles
- Automatic image generation via **Freepik API**
- IPFS storage for decentralized metadata via **Pinata**

### 💬 Interactive Chat
- Chat with your AI personas in real-time
- Context-aware conversations with personality consistency
- Chat history tracking and sentiment analysis
- Multiple AI model fallback support

### ⚔️ Battle Arena
- Competitive persona battles with community voting
- Real-time leaderboards and win-rate tracking
- Battle history and statistics
- Topic-based competitions

### 🎁 NFT Marketplace
- Mint personas as NFTs on **Somnia Network**
- List and trade persona NFTs
- Royalty system for creators
- ERC-721 compliant smart contracts

### 🌐 3D Interactive Landing
- Stunning 3D globe visualization
- Category-based persona realms
- Smooth animations and transitions

---

## 🏗️ Architecture

```
Frontend (Vite + Vanilla JS)
    ↓
Backend API (Express.js)
    ↓
┌─────────────┬──────────────┬─────────────┐
│   AI APIs   │  PostgreSQL  │  Blockchain │
│  (Deepseek, │   Database   │   (Somnia)  │
│   Gemini)   │              │             │
└─────────────┴──────────────┴─────────────┘
         ↓              ↓            ↓
    IPFS Storage   Data Store   Smart Contracts
    (Pinata)                    (NFT, Arena)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- MetaMask or compatible wallet
- API Keys: Deepseek, Gemini, Pinata, Freepik

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/AI_xandria.v.1.git
cd AI_xandria.v.1

# Install all dependencies
npm run install:all

# Setup environment variables
cp server/.env.example server/.env
cp contracts/.env.example contracts/.env
# Edit .env files with your API keys

# Setup database
createdb ai_xandria
npm run db:migrate
npm run db:seed

# Deploy smart contracts
npm run contracts:deploy

# Start development servers
npm run dev           # Frontend (port 5173)
npm run server:dev    # Backend (port 3000)
```

Visit: `http://localhost:5173`

---

## 📁 Project Structure

```
AI_xandria.v.1/
├── 📄 index.html                     # Landing page dengan 3D globe
├── 📄 view-personas.html           # Realm untuk creator personas
├── 📄 my-collection.html             # Realm coming soon  
├── 📄 battle-arena.html              # Arena kompetisi personas
├── 📄 marketplace.html               # NFT marketplace
│
├── 📁 server/                        # Backend Express
│   ├── index.js                      # Main server
│   ├── routes/
│   │   ├── persona.js               # Generate persona endpoints
│   │   ├── ipfs.js                  # IPFS upload endpoints
│   │   └── wallet.js                # Wallet connection endpoints
│   ├── utils/
│   │   ├── ai-client.js             # Deepseek/Gemini/OpenRouter
│   │   ├── ipfs-upload.js           # Pinata integration
│   │   ├── db-connector.js          # PostgreSQL/MongoDB
│   │   └── somnia-connector.js      # Blockchain interaction
│   └── package.json
│
├── 📁 contracts/                     # Smart contracts
│   ├── SomniaPersonaNFT.sol
│   ├── Marketplace.sol
│   ├── Arena.sol
│   └── hardhat.config.js
│
├── 📁 scripts/
│   └── deploy.js                     # Deploy contracts
│
├── 📁 assets/
│   ├── js/
│   │   ├── modules/
│   │   │   ├── wallet-manager.js    # Wallet connection logic
│   │   │   ├── persona-generator.js # Client-side persona gen
│   │   │   ├── bubble-cards.js      # Bubble card interactions
│   │   │   └── chat-widget.js       # Deepseek chat
│   │   ├── personas/
│   │   │   ├── content-creator/
│   │   │   │   ├── unuser.js
│   │   │   │   ├── solara.js
│   │   │   │   ├── nexar.js
│   │   │   │   ├── mortis.js
│   │   │   │   ├── paradox.js
│   │   │   │   ├── flux.js
│   │   │   │   ├── oracle.js
│   │   │   │   └── volt.js
│   │   │   └── academic/
│   │   │       ├── einstein.js
│   │   │       ├── nietzsche.js
│   │   │       ├── alkhwarizmi.js
│   │   │       ├── darwin.js
│   │   │       ├── confucius.js
│   │   │       ├── galileo.js
│   │   │       ├── davinci.js
│   │   │       └── hammurabi.js
│   │   └── main.js                  # Entry point
│   ├── css/
│   │   ├── global.css               # Global styles
│   │   ├── persona-bubbles.css      # Bubble card styles
│   │   └── chat-widget.css          # Chat widget styles
│   ├── images/
│   └── videos/
│
├── 📁 metadata/                     # NFT metadata templates
│   ├── personas/
│   └── certificates/
│
├── 📁 docs/
│   ├── README.md
│   ├── SETUP.md                     # Setup instructions
│   ├── API.md                       # API documentation
│   └── litepaper.md
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (`server/.env`)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_xandria

# AI Services
DEEPSEEK_API_KEY=your_key
GEMINI_API_KEY=your_key
FREEPIK_API_KEY=your_key

# IPFS
PINATA_API_KEY=your_key
PINATA_SECRET_KEY=your_secret
PINATA_JWT=your_jwt

# Blockchain
SOMNIA_RPC_URL=https://rpc.somnia.network
CONTRACT_ADDRESS=deployed_contract_address
PRIVATE_KEY=your_deployment_key
```

#### Smart Contracts (`contracts/.env`)
```env
SOMNIA_RPC_URL=https://rpc.somnia.network
PRIVATE_KEY=your_wallet_private_key
```

---

## 📡 API Endpoints

### Persona Management
```
POST   /api/persona/generate      Generate new persona
GET    /api/persona/:id           Get persona details
GET    /api/persona/list          List all personas
POST   /api/persona/:id/mint      Update mint status
```

### Chat
```
POST   /api/chat/send             Send message to persona
GET    /api/chat/history/:id      Get chat history
DELETE /api/chat/history/:id      Delete chat history
GET    /api/chat/stats/:id        Get chat statistics
```

### Battle Arena
```
POST   /api/battle/create         Create new battle
POST   /api/battle/:id/vote       Cast vote
GET    /api/battle/:id/results    Get battle results
GET    /api/battle/leaderboard    Get top personas
```

### Wallet
```
POST   /api/wallet/connect        Connect wallet
GET    /api/wallet/:address       Get user profile
PUT    /api/wallet/:address/profile  Update profile
```

### IPFS
```
POST   /api/ipfs/upload/json      Upload JSON metadata
POST   /api/ipfs/upload/file      Upload file
GET    /api/ipfs/pin/:hash        Get pin status
```

Full API documentation: [docs/API.md](./docs/API.md)

---

## 🎮 Usage Examples

### Generate AI Persona

```javascript
const response = await fetch('/api/persona/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        prompt: 'A wise philosopher who loves technology',
        walletAddress: '0x...',
        category: 'academic'
    })
});

const { data } = await response.json();
console.log('Generated persona:', data.name);
```

### Chat with Persona

```javascript
const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        personaId: 'persona_001',
        message: 'What is the meaning of life?',
        userAddress: '0x...'
    })
});

const { data } = await response.json();
console.log('Response:', data.response);
```

### Mint NFT

```javascript
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

const tx = await contract.mintMyPersona(
    'Persona Name',
    'Description',
    'ipfs://metadata_hash'
);

await tx.wait();
console.log('NFT Minted!');
```

---

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Smart contract tests
cd contracts
npx hardhat test

# Frontend tests (coming soon)
npm run test:e2e
```

---

## 🚢 Deployment

### Railway (Backend + Database)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Vercel/Netlify (Frontend)

```bash
# Build frontend
npm run build

# Deploy
vercel deploy
# or
netlify deploy
```

### Smart Contracts (Somnia)

```bash
cd contracts
npx hardhat run scripts/deploy.js --network somniaTestnet
```

---

## 🛠️ Tech Stack

**Frontend:**
- Vite
- Vanilla JavaScript
- Three.js (3D Globe)
- Tailwind CSS
- Ethers.js

**Backend:**
- Node.js + Express
- PostgreSQL
- Axios

**AI Services:**
- Deepseek API
- Google Gemini
- OpenRouter

**Blockchain:**
- Somnia Network
- Solidity
- Hardhat

**Storage:**
- Pinata (IPFS)
- Freepik (Images)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

---

## 🙏 Acknowledgments

- **Somnia Network** - Blockchain infrastructure
- **Deepseek** - AI model provider
- **Pinata** - IPFS storage
- **Freepik** - Image generation

---

## 📞 Support

- 📧 Email: support@aixandria.com
- 💬 Discord: [Join our community](https://discord.gg/xandria)
- 🐦 Twitter: [@AI_xandria](https://twitter.com/AI_xandria)
- 📚 Docs: [docs.aixandria.com](https://docs.aixandria.com)

---

## 🗺️ Roadmap

- [x] Phase 1: Core persona generation
- [x] Phase 2: Chat integration
- [x] Phase 3: NFT minting
- [ ] Phase 4: Marketplace launch
- [ ] Phase 5: Voice chat
- [ ] Phase 6: Mobile app
- [ ] Phase 7: DAO governance

---

**Built with ❤️ by the AI_xandria Team**

⭐ Star us on GitHub if you like this project!
