#!/bin/bash

echo "🚀 Setting up AI_xandria in Codespaces..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd server && npm install && cd ..

# Setup PostgreSQL
echo "🗄️ Setting up PostgreSQL..."
sudo service postgresql start

# Wait for PostgreSQL to start
sleep 5

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE ai_xandria;" || true
sudo -u postgres psql -c "CREATE USER xandria_user WITH PASSWORD 'codespace_pass';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ai_xandria TO xandria_user;" || true

# Run migrations
echo "📊 Running database migrations..."
PGPASSWORD=codespace_pass psql -U xandria_user -d ai_xandria -f server/database/schema.sql || true
PGPASSWORD=codespace_pass psql -U xandria_user -d ai_xandria -f server/database/seed.sql || true

# Copy env files if not exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server/.env..."
    cp server/.env.example server/.env
    
    # Update database URL for Codespaces
    sed -i 's|DATABASE_URL=.*|DATABASE_URL=postgresql://xandria_user:codespace_pass@localhost:5432/ai_xandria|g' server/.env
    sed -i 's|DB_USER=.*|DB_USER=xandria_user|g' server/.env
    sed -i 's|DB_PASSWORD=.*|DB_PASSWORD=codespace_pass|g' server/.env
fi

# Create assets directories if not exist
mkdir -p assets/js/modules
mkdir -p assets/css
mkdir -p assets/images

echo ""
echo "✅ Setup completed!"
echo ""
echo "🎯 Next steps:"
echo "   1. Edit server/.env and add your API keys:"
echo "      - DEEPSEEK_API_KEY"
echo "      - GEMINI_API_KEY"
echo "      - PINATA_API_KEY, PINATA_SECRET_KEY, PINATA_JWT"
echo ""
echo "   2. Start development servers:"
echo "      Terminal 1: npm run server:dev"
echo "      Terminal 2: npm run dev"
echo ""
echo "   3. Open ports 3000 (backend) and 5173 (frontend)"
echo ""
echo "🔥 Happy coding!"
