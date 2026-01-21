#!/bin/bash

# BookMaster Deployment Script for GitHub Pages
# This script helps you deploy the BookMaster app to GitHub Pages

echo "🚀 BookMaster Deployment to GitHub Pages"
echo "=========================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    echo "   Visit: https://git-scm.com/downloads"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "index.html" ] || [ ! -f "styles.css" ] || [ ! -f "script.js" ]; then
    echo "❌ Required files not found. Please run this script from the BookMaster directory."
    exit 1
fi

echo "✅ All required files found!"

# Initialize git repository if not already done
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "📝 Adding files..."
    git add index.html styles.css script.js README.md deploy.sh
    git commit -m "Initial commit: BookMaster Court Booking System"
    echo "✅ Git repository initialized!"
else
    echo "📁 Git repository already exists."
fi

echo ""
echo "🌐 Next Steps for GitHub Pages Deployment:"
echo "=========================================="
echo "1. Create a GitHub account at https://github.com (if you don't have one)"
echo "2. Create a new repository named 'bookmaster'"
echo "3. Add this repository as remote:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/bookmaster.git"
echo "4. Push to GitHub:"
echo "   git push -u origin main"
echo "5. Go to repository Settings → Pages"
echo "6. Select 'Deploy from a branch' → 'main' → '/ (root)'"
echo "7. Your site will be live at: https://YOUR_USERNAME.github.io/bookmaster"
echo ""
echo "🎉 Your BookMaster app will be live and free forever!"
