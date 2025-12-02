#!/bin/bash

echo "🚀 Fleet Management System - Frontend"
echo "======================================"

# Check environment
if [ ! -f .env.local ]; then
  echo "⚠️  .env.local not found. Creating from template..."
  cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start development server
echo "✅ Starting Next.js development server..."
npm run dev
