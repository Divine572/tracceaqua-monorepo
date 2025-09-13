#!/bin/bash

# TracceAqua Backend Railway Deployment Script


set -e

echo "🚂 =============================================="
echo "🚂 TracceAqua Backend Railway Deployment"
echo "🚂 =============================================="

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    print_error "Error: Must run from backend directory (packages/backend/)"
    echo "Current directory: $(pwd)"
    echo "Expected files: package.json, prisma/, src/"
    exit 1
fi

print_info "Current directory: $(pwd)"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_warning "Railway CLI not found. Installing..."
    bash <(curl -fsSL https://railway.app/install.sh)
    
    # Check if installation was successful
    if ! command -v railway &> /dev/null; then
        print_error "Failed to install Railway CLI"
        exit 1
    fi
    print_status "Railway CLI installed successfully"
else
    print_status "Railway CLI found"
fi

# Check Railway login status
if ! railway whoami &> /dev/null; then
    print_warning "Not logged in to Railway. Please login..."
    railway login
fi

# Show current Railway user
RAILWAY_USER=$(railway whoami 2>/dev/null || echo "Unknown")
print_info "Logged in as: $RAILWAY_USER"

# Check if Railway project is linked
if [ ! -f ".railway" ] && [ ! -d ".railway" ]; then
    print_warning "No Railway project linked. Linking to project..."
    echo "Please select your TracceAqua backend project from the list:"
    railway link
    
    if [ ! -f ".railway" ] && [ ! -d ".railway" ]; then
        print_error "Failed to link Railway project"
        exit 1
    fi
    print_status "Railway project linked successfully"
else
    print_status "Railway project already linked"
fi

# Show current Railway project
print_info "Railway project: $(railway status 2>/dev/null | grep 'Project:' | cut -d':' -f2 | xargs || echo 'Not found')"

# Install dependencies
print_info "Installing dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install --frozen-lockfile --production=false
    print_status "Dependencies installed with pnpm"
elif command -v yarn &> /dev/null; then
    yarn install --frozen-lockfile
    print_status "Dependencies installed with yarn"
else
    npm ci
    print_status "Dependencies installed with npm"
fi

# Generate Prisma client
print_info "Generating Prisma client..."
npx prisma generate
print_status "Prisma client generated"

# Build the application
print_info "Building the application..."
if command -v pnpm &> /dev/null; then
    pnpm build
elif command -v yarn &> /dev/null; then
    yarn build
else
    npm run build
fi
print_status "Application built successfully"

# Check if environment variables are set in Railway
print_info "Checking environment variables..."
ENV_VARS=$(railway variables 2>/dev/null || echo "")

# List of required environment variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET"
    "PINATA_JWT"
    "CONTRACT_ADDRESS"
    "SEPOLIA_RPC_URL"
)

print_info "Required environment variables:"
for var in "${REQUIRED_VARS[@]}"; do
    if echo "$ENV_VARS" | grep -q "$var"; then
        print_status "$var is set"
    else
        print_warning "$var is NOT set - you'll need to set this in Railway dashboard"
    fi
done

# Run database migrations (only if DATABASE_URL is available)
if echo "$ENV_VARS" | grep -q "DATABASE_URL"; then
    print_info "Running database migrations..."
    railway run npx prisma migrate deploy
    print_status "Database migrations completed"
else
    print_warning "DATABASE_URL not set, skipping migrations"
    print_warning "Run 'railway run npx prisma migrate deploy' after setting up the database"
fi

# Deploy to Railway
print_info "Deploying to Railway..."
railway up --detach

# Wait a moment for deployment to start
sleep 3

# Get deployment status
print_info "Deployment initiated. Checking status..."
DEPLOYMENT_URL=$(railway domain 2>/dev/null || echo "Not available")

print_status "Deployment completed successfully!"

echo ""
echo "🎉 =============================================="
echo "🎉 DEPLOYMENT SUMMARY"
echo "🎉 =============================================="
echo "✅ Application built and deployed"
echo "✅ Prisma client generated"
if echo "$ENV_VARS" | grep -q "DATABASE_URL"; then
    echo "✅ Database migrations applied"
else
    echo "⚠️  Database migrations pending (set DATABASE_URL first)"
fi

echo ""
echo "🔗 USEFUL LINKS:"
echo "📊 Railway Dashboard: https://railway.app/dashboard"
echo "🚀 Application URL: $DEPLOYMENT_URL"
echo "📈 Logs: railway logs"
echo "🔧 Shell: railway shell"

echo ""
echo "📝 NEXT STEPS:"
echo "1. Set any missing environment variables in Railway dashboard"
echo "2. Run database migrations if DATABASE_URL wasn't set: railway run npx prisma migrate deploy"
echo "3. Update your frontend environment variables with the new backend URL"
echo "4. Test the API endpoints: curl $DEPLOYMENT_URL/health"

echo ""
echo "💡 USEFUL COMMANDS:"
echo "🔍 Check logs: railway logs"
echo "🔧 Open shell: railway shell"
echo "📊 Check status: railway status"
echo "🌐 Open in browser: railway open"

print_status "TracceAqua backend deployment script completed!"