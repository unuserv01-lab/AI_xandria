# 🚀 AI_xandria.v.1 Setup Guide

Complete installation and configuration guide for AI_xandria platform.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **PostgreSQL** v14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **MetaMask** or compatible wallet ([Install](https://metamask.io/))
- **Code Editor** (VS Code recommended)

### Required API Keys

You'll need to obtain:

1. **Deepseek API Key** - [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. **Google Gemini API Key** - [https://makersuite.google.com/](https://makersuite.google.com/)
3. **Pinata API Keys** (IPFS) - [https://pinata.cloud/](https://pinata.cloud/)
4. **Freepik API Key** - [https://www.freepik.com/api](https://www.freepik.com/api)
5. **OpenRouter API Key** (Optional) - [https://openrouter.ai/](https://openrouter.ai/)

---

## 🔧 Installation Steps

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/AI_xandria.v.1.git
cd AI_xandria.v.1
```

### 2️⃣ Install Dependencies

#### Root Dependencies (Frontend)
```bash
npm install
```

#### Server Dependencies (Backend)
```bash
cd server
npm install
cd ..
```

#### Smart Contracts Dependencies
```bash
cd contracts
npm install
cd ..
```

---

## 🗄️ Database Setup

### Step 1: Create PostgreSQL Database

#### On macOS/Linux:
```bash
# Start PostgreSQL service
sudo service postgresql start

# Access PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ai_xandria;

# Create user (optional)
CREATE USER xandria_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ai_xandria TO xandria_admin;

# Exit
\q
```

#### On Windows:
```bash
# Open SQL Shell (psql)
# Then run:
CREATE DATABASE ai_xandria;
```

### Step 2: Run Migration Scripts

```bash
# From project root
psql -U postgres -d ai_xandria -f server/database/schema.sql
psql -U postgres -d ai_xandria -f server/database/seed.sql
```

Or use the migration script:
```bash
npm run db:migrate
```

### Step 3: Verify Database

```bash
psql -U postgres -d ai_xandria

# Check tables
\dt

# Should show:
# personas
# chat_history
# battle_votes
# nft_mints
# users
```

---

## ⚙️ Environment Configuration

### 1️⃣ Backend Environment (.env)

Create `server/.env`:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ai_xandria
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_xandria
DB_USER=postgres
DB_PASSWORD=your_password

# AI Services
DEEPSEEK_API_KEY=your_deepseek_key_here
GEMINI_API_KEY=your_gemini_key_here
OPENROUTER_API_KEY=your_openrouter_key_here

# Image Generation
FREEPIK_API_KEY=your_freepik_key_here

# IPFS Storage
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt

# Blockchain (Somnia)
SOMNIA_RPC_URL=https://rpc.somnia.network
SOMNIA_CHAIN_ID=50312
CONTRACT_ADDRESS=will_be_filled_after_deploy
PRIVATE_KEY=your_deployment_private_key

# Security
JWT_SECRET=your_jwt_secret_here_min_32_chars
SESSION_SECRET=your_session_secret_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2️⃣ Smart Contracts Environment

Create `contracts/.env`:

```bash
cp contracts/.env.example contracts/.env
```

Edit `contracts/.env`:

```env
# Somnia Testnet
SOMNIA_RPC_URL=https://rpc.somnia.network
PRIVATE_KEY=your_wallet_private_key_for_deployment

# Contract Verification
ETHERSCAN_API_KEY=not_needed_for_somnia

# Deployment
DEPLOY_NETWORK=somniaTestnet
```

---

## 🏃 Running the Application

### Development Mode (Recommended)

#### Terminal 1 - Backend Server:
```bash
cd server
npm run dev
```
Server runs on: `http://localhost:3000`

#### Terminal 2 - Frontend:
```bash
npm run dev
```
Frontend runs on: `http://localhost:5173`

### Production Mode:

```bash
# Build frontend
npm run build

# Start backend
cd server
npm start
```

---

## 🔗 Smart Contract Deployment

### 1️⃣ Compile Contracts

```bash
cd contracts
npx hardhat compile
```

### 2️⃣ Deploy to Somnia Testnet

```bash
npx hardhat run scripts/deploy.js --network somniaTestnet
```

**Save the output:**
```
✅ SomniaPersonaNFT deployed to: 0x123...abc
✅ Marketplace deployed to: 0x456...def
✅ Arena deployed to: 0x789...ghi
```

### 3️⃣ Update Environment Variables

Update `server/.env`:
```env
CONTRACT_ADDRESS=0x123...abc
MARKETPLACE_ADDRESS=0x456...def
ARENA_ADDRESS=0x789...ghi
```

Update `assets/js/config.js`:
```javascript
export const CONTRACTS = {
    PERSONA_NFT: '0x123...abc',
    MARKETPLACE: '0x456...def',
    ARENA: '0x789...ghi'
};
```

### 4️⃣ Verify Contracts (Optional)

```bash
npx hardhat verify --network somniaTestnet 0x123...abc
```

---

## 🧪 Testing

### Backend API Tests:
```bash
cd server
npm test
```

### Smart Contract Tests:
```bash
cd contracts
npx hardhat test
```

### Frontend E2E Tests:
```bash
npm run test:e2e
```

---

## 🔍 Verification Checklist

After setup, verify everything works:

- [ ] PostgreSQL database created and tables exist
- [ ] Backend server running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can connect MetaMask to Somnia testnet
- [ ] API endpoints responding (test with: `curl http://localhost:3000/api/health`)
- [ ] Smart contracts deployed successfully
- [ ] Environment variables configured correctly

### Test API Endpoint:

```bash
# Health check
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-10-23T...",
  "database": "connected"
}
```

---

## 🚀 Deployment to Railway

### 1️⃣ Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2️⃣ Login to Railway

```bash
railway login
```

### 3️⃣ Initialize Project

```bash
railway init
```

### 4️⃣ Add PostgreSQL

In Railway dashboard:
- Click "New" → "Database" → "PostgreSQL"
- Copy the connection URL

### 5️⃣ Set Environment Variables

```bash
railway variables set DATABASE_URL="your_railway_postgres_url"
railway variables set DEEPSEEK_API_KEY="your_key"
railway variables set PINATA_API_KEY="your_key"
# ... set all other variables
```

### 6️⃣ Deploy

```bash
railway up
```

Your app will be live at: `https://your-app.railway.app`

---

## 📱 MetaMask Configuration

### Add Somnia Testnet to MetaMask:

1. Open MetaMask
2. Click network dropdown → "Add Network"
3. Enter details:

```
Network Name: Somnia Testnet
RPC URL: https://rpc.somnia.network
Chain ID: 50312
Currency Symbol: STT
Block Explorer: https://shanon.explorer.somnia.network
```

### Get Testnet Tokens:

Visit faucet: `https://faucet.somnia.network`

---

## 🐛 Troubleshooting

### Database Connection Error:
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Restart if needed
sudo service postgresql restart
```

### Port Already in Use:
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port in .env
PORT=3001
```

### Smart Contract Deployment Failed:
```bash
# Clear cache and retry
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy.js --network somniaTestnet
```

### API Keys Not Working:
- Verify keys are active in respective platforms
- Check for typos in .env file
- Ensure .env file is in correct directory
- Restart server after changing .env

---

## 📚 Next Steps

After successful setup:

1. ✅ Read [API Documentation](./API.md)
2. ✅ Explore [Smart Contracts](../contracts/README.md)
3. ✅ Check [Frontend Architecture](./FRONTEND.md)
4. ✅ Review [Litepaper](./litepaper.md)

---

## 🆘 Support

Having issues? 

- 📖 Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- 💬 Join our [Discord](https://discord.gg/xandria)
- 🐛 Report bugs on [GitHub Issues](https://github.com/your-username/AI_xandria.v.1/issues)

---

**Happy Building! 🚀✨**
