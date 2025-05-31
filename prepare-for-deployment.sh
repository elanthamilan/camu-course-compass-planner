#!/bin/bash

# Netlify Deployment Preparation Script
# This script prepares the refactor/schedule-functionality branch for Netlify deployment

echo "🚀 Preparing CAMU Course Compass Planner for Netlify deployment..."
echo ""

# Check if we're on the correct branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "refactor/schedule-functionality" ]; then
    echo "⚠️  Warning: You're not on the refactor/schedule-functionality branch"
    echo "Current branch: $current_branch"
    echo "Switching to refactor/schedule-functionality..."
    git checkout refactor/schedule-functionality
fi

echo "✅ On correct branch: refactor/schedule-functionality"
echo ""

# Run verification
echo "🔍 Running deployment readiness verification..."
node verify-netlify-ready.cjs

if [ $? -ne 0 ]; then
    echo "❌ Verification failed. Please fix the issues above."
    exit 1
fi

echo ""
echo "📋 Files prepared for Netlify deployment:"
echo "  ✅ netlify.toml - Main Netlify configuration"
echo "  ✅ public/_redirects - SPA routing configuration"
echo "  ✅ .nvmrc - Node.js version specification"
echo "  ✅ vite.config.ts - Updated with Netlify detection"
echo "  ✅ src/App.tsx - Updated router configuration"
echo "  ✅ package.json - Added Netlify build scripts"
echo ""

echo "📚 Documentation created:"
echo "  ✅ NETLIFY_DEPLOYMENT.md - Comprehensive deployment guide"
echo "  ✅ DEPLOYMENT_CHECKLIST.md - Pre-deployment checklist"
echo "  ✅ NETLIFY_READY_SUMMARY.md - Summary of preparations"
echo ""

# Check git status
echo "📝 Checking git status..."
git_status=$(git status --porcelain)

if [ -n "$git_status" ]; then
    echo "📦 Changes ready to commit:"
    git status --short
    echo ""
    
    read -p "🤔 Do you want to commit these changes? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📝 Committing changes..."
        git add .
        git commit -m "feat: prepare for Netlify deployment

- Add netlify.toml with build configuration and SPA routing
- Add public/_redirects for React Router compatibility
- Add .nvmrc to specify Node.js version 18
- Update vite.config.ts with Netlify environment detection
- Update App.tsx router basename for multi-platform deployment
- Add Netlify-specific build scripts to package.json
- Add comprehensive deployment documentation
- Add deployment verification script

Ready for Netlify deployment with optimized configuration."
        
        echo "✅ Changes committed successfully!"
        echo ""
        
        read -p "🚀 Do you want to push to remote repository? (y/N): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "📤 Pushing to remote repository..."
            git push origin refactor/schedule-functionality
            echo "✅ Pushed to remote repository!"
        else
            echo "⏸️  Skipped pushing. You can push later with:"
            echo "   git push origin refactor/schedule-functionality"
        fi
    else
        echo "⏸️  Skipped committing. You can commit later with:"
        echo "   git add ."
        echo "   git commit -m \"feat: prepare for Netlify deployment\""
    fi
else
    echo "✅ No changes to commit. All files are already tracked."
fi

echo ""
echo "🎉 Netlify deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://netlify.com and sign in"
echo "2. Click 'New site from Git'"
echo "3. Connect your repository"
echo "4. Select the 'refactor/schedule-functionality' branch"
echo "5. Verify build settings (should auto-detect from netlify.toml):"
echo "   - Build command: npm run build"
echo "   - Publish directory: dist"
echo "   - Node.js version: 18"
echo "6. Click 'Deploy site'"
echo ""
echo "📖 For detailed instructions, see NETLIFY_DEPLOYMENT.md"
echo "📋 For a complete checklist, see DEPLOYMENT_CHECKLIST.md"
echo ""
echo "🔗 Netlify: https://netlify.com"
echo "🔗 Documentation: https://docs.netlify.com/"
