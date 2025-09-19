#!/bin/bash

# Build script for Rajdhani ERP System
echo "🚀 Starting build process for Rajdhani ERP System..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf node_modules/.vite

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Clear npm cache
echo "🗑️ Clearing npm cache..."
npm cache clean --force

# Reinstall sonner specifically
echo "🔧 Reinstalling sonner package..."
npm uninstall sonner
npm install sonner@1.4.0

# Build the project
echo "🏗️ Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build files are in the 'dist' directory"
    echo "🌐 Ready for deployment!"
else
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi
