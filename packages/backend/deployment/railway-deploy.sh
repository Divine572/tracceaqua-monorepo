#!/bin/bash

# TracceAqua Railway Deployment Script
echo "🚂 Starting TracceAqua backend deployment to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    curl -fsSL https://railway.app/install.sh | sh
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from backend directory"
    exit 1
fi

# Check if Railway project is linked
if [ ! -f ".railway" ]; then
    echo "🔗 Linking to Railway project..."
    railway login
    railway link
fi

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🏗️ Building the application..."
pnpm build

echo "🗄️ Running database migrations..."
railway run pnpm prisma:deploy

echo "🚀 Deploying to Railway..."
railway up

echo "✅ Backend deployment completed successfully!"
echo "📝 Don't forget to set environment variables in Railway dashboard"
