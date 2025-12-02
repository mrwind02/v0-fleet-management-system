#!/bin/bash

echo "🚀 Fleet Management System - Backend"
echo "======================================"

# Check environment
if [ ! -f .env ]; then
  echo "❌ .env file not found. Please create it from .env.example"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run migrations
echo "🗄️  Running database migrations..."
npm run db:migrate

# Seed database (optional)
echo "🌱 Seeding database with test data..."
npm run db:seed

# Start server
echo "✅ Starting server..."
npm run dev
