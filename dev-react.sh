#!/bin/bash

# Development script for Laravel + React with Hot Reload
echo "🚀 Starting IndoQuran Laravel + React Development Environment..."
echo ""
echo "📋 This will start:"
echo "   • Laravel server on http://localhost:8000"
echo "   • Vite dev server on http://localhost:5173"
echo "   • Hot Module Replacement (HMR) for React"
echo ""
echo "🌐 Access your app at: http://localhost:8000/react"
echo ""

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Check if vendor exists
if [ ! -d "vendor" ]; then
    echo "🎼 Installing composer dependencies..."
    composer install
fi

echo "🔥 Starting development servers..."
echo "   Press Ctrl+C to stop both servers"
echo ""

# Start Laravel server and Vite dev server concurrently
npm run react:dev
