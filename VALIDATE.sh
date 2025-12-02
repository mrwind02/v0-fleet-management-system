#!/bin/bash

echo "=== Fleet Management System - Build Validation ==="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION installed"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm $NPM_VERSION installed"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check backend dependencies
echo ""
echo "Checking backend..."
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} backend/node_modules exists"
else
    echo -e "${YELLOW}!${NC} backend/node_modules not found, installing..."
    cd backend
    npm install
    cd ..
fi

# Check frontend dependencies
echo "Checking frontend..."
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} frontend/node_modules exists"
else
    echo -e "${YELLOW}!${NC} frontend/node_modules not found, installing..."
    cd frontend
    npm install
    cd ..
fi

# Check environment files
echo ""
echo "Checking environment files..."

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env exists"
else
    echo -e "${YELLOW}!${NC} backend/.env not found, creating from example..."
    cp backend/.env.example backend/.env
fi

if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✓${NC} frontend/.env.local exists"
else
    echo -e "${YELLOW}!${NC} frontend/.env.local not found, creating..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api" > frontend/.env.local
fi

# TypeScript check
echo ""
echo "Checking TypeScript..."
cd frontend
npx tsc --noEmit 2>&1 | grep -q "error" && echo -e "${RED}✗${NC} TypeScript errors found" || echo -e "${GREEN}✓${NC} TypeScript OK"
cd ..

echo ""
echo -e "${GREEN}=== Validation Complete ===${NC}"
echo ""
echo "To start development:"
echo "1. Terminal 1: cd backend && npm run dev"
echo "2. Terminal 2: cd frontend && npm run dev"
echo ""
echo "Access: http://localhost:3000"
