#!/bin/bash

# =============================================
# DISCORD PERSONA CHATBOT - DEPLOYMENT SCRIPT
# =============================================
# CRITICAL: This bot MUST run on CLOUD SERVERS ONLY!
# NEVER run this on your personal computer!
#
# Usage: ./deploy.sh [environment]
#   environment: dev | staging | production
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================
# CONFIGURATION
# =============================

ENVIRONMENT=${1:-dev}  # Default to dev if not specified

echo -e "${BLUE}"
echo "============================================"
echo "🚀 Discord Persona Chatbot Platform"
echo "   Deployment Script"
echo "============================================"
echo -e "${NC}"

echo -e "${YELLOW}⚠️  CRITICAL WARNING: ${RED}"
echo "   This bot MUST run on CLOUD SERVERS ONLY!"
echo "   NEVER deploy to your personal computer!"
echo -e "${YELLOW}   Proceed? [y/N]:${NC}"

read -r response
if [[ ! $response =~ ^[Yy]$ ]]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 1
fi

# =============================
# ENVIRONMENT-SPECIFIC SETUP
# =============================

case $ENVIRONMENT in
    dev)
        NODE_ENV="development"
        POSTGRES_USER="botuser"
        POSTGRES_PASSWORD="botpassword123"
        JWT_SECRET="dev_jwt_secret_change_in_production"
        EXPLICIT_CONTENT_MODE="mature"
        ;;
    staging)
        NODE_ENV="staging"
        POSTGRES_USER="botuser"
        POSTGRES_PASSWORD="BotPass!Staging@456"
        JWT_SECRET="staging_jwt_secret_abc123"
        EXPLICIT_CONTENT_MODE="mature"
        ;;
    production)
        NODE_ENV="production"
        # These should be set via environment variables in production!
        POSTGRES_USER="${POSTGRES_USER:-botuser_prod}"
        POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-ChangeMeInProduction}"
        JWT_SECRET="${JWT_SECRET:-YourSecretJwtKey123!@#$}"
        EXPLICIT_CONTENT_MODE="${EXPLICIT_CONTENT_MODE:-fully_filtered}"
        ;;
    *)
        echo -e "${RED}Invalid environment. Use: dev, staging, production${NC}"
        exit 1
        ;;
esac

# =============================
# INSTALL DEPENDENCIES
# =============================

echo -e "\n${BLUE}📦 Installing dependencies...${NC}"
npm install

# =============================
# CONFIGURE ENVIRONMENT FILES
# =============================

echo -e "\n${BLUE}⚙️  Configuring environment files...${NC}"

# Create .env for Discord Bot Server
cat > .env << EOF
NODE_ENV=${NODE_ENV}
DISCORD_BOT_TOKEN=your_encrypted_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
MEMORY_WINDOW_SIZE=50
AUTO_EXPIRE_HOURS=72
EXPLICIT_CONTENT_MODE=${EXPLICIT_CONTENT_MODE}
EOF

echo -e "${GREEN}✓ Discord Bot Server .env created${NC}"

# Create .env for Dashboard API
cat > backend/.env << EOF
NODE_ENV=${NODE_ENV}
POSTGRES_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/botdb
REDIS_URL=redis://localhost:6379
JWT_SECRET=${JWT_SECRET}
EOF

echo -e "${GREEN}✓ Dashboard API .env created${NC}"

# =============================
# START SERVICES
# =============================

echo -e "\n${BLUE}🚀 Starting services...${NC}"

# Start PostgreSQL (if using Docker Compose)
if [ -f "docker-compose.yml" ]; then
    docker-compose up -d postgres redis
    echo -e "${GREEN}✓ Database and Redis started${NC}"
else
    echo -e "${YELLOW}⚠️  Using standalone database configuration${NC}"
fi

# Start services (in development)
npm start &

echo -e "\n${GREEN}============================================"
echo "✅ Deployment complete!"
echo "============================================"
echo -e "${BLUE}"
echo "Dashboard API: http://localhost:3001"
echo "Discord Bot Server: Running on port 57299"
echo -e "${NC}"
echo "${GREEN}🌐 Open dashboard at: http://localhost:3001${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Update .env files with your Discord bot token!${NC}"
echo "   See discord_bot_server/.env.example for required variables"
echo -e "${BLUE}============================================${NC}"

# =============================
# NEXT STEPS
# =============================

echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo "1. Create your Discord bot at https://discord.com/developers/applications"
echo "2. Copy your bot token to discord_bot_server/.env"
echo "3. Enable 'Message Content Intent' in Bot settings"
echo "4. Visit http://localhost:3001 to create your first bot!"
echo ""
