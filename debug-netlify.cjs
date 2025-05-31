#!/usr/bin/env node

/**
 * Debug script for Netlify deployment issues
 * Helps identify common problems with asset loading
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Netlify deployment issues...\n');

// Check if dist directory exists
if (!fs.existsSync('dist')) {
  console.log('❌ dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('✅ dist directory found');

// Check index.html
const indexPath = path.join('dist', 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('❌ index.html not found in dist directory');
  process.exit(1);
}

console.log('✅ index.html found');

// Read and analyze index.html
const indexContent = fs.readFileSync(indexPath, 'utf8');
console.log('\n📄 Analyzing index.html...');

// Extract asset references
const cssMatches = indexContent.match(/href="([^"]*\.css)"/g) || [];
const jsMatches = indexContent.match(/src="([^"]*\.js)"/g) || [];

console.log(`\n📦 Found ${cssMatches.length} CSS files:`);
cssMatches.forEach(match => {
  const href = match.match(/href="([^"]*)"/)[1];
  console.log(`  - ${href}`);
  
  // Check if file exists
  const filePath = path.join('dist', href.startsWith('/') ? href.slice(1) : href);
  if (fs.existsSync(filePath)) {
    console.log(`    ✅ File exists: ${filePath}`);
  } else {
    console.log(`    ❌ File missing: ${filePath}`);
  }
});

console.log(`\n📦 Found ${jsMatches.length} JS files:`);
jsMatches.forEach(match => {
  const src = match.match(/src="([^"]*)"/)[1];
  console.log(`  - ${src}`);
  
  // Check if file exists
  const filePath = path.join('dist', src.startsWith('/') ? src.slice(1) : src);
  if (fs.existsSync(filePath)) {
    console.log(`    ✅ File exists: ${filePath}`);
  } else {
    console.log(`    ❌ File missing: ${filePath}`);
  }
});

// Check base tag
const baseMatch = indexContent.match(/<base[^>]*href="([^"]*)"[^>]*>/);
if (baseMatch) {
  console.log(`\n🔗 Base href found: ${baseMatch[1]}`);
} else {
  console.log('\n🔗 No base href found (this is normal for Netlify)');
}

// List all files in dist
console.log('\n📁 All files in dist directory:');
function listFiles(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      console.log(`${prefix}📁 ${file}/`);
      listFiles(filePath, prefix + '  ');
    } else {
      console.log(`${prefix}📄 ${file}`);
    }
  });
}
listFiles('dist');

// Check for common issues
console.log('\n🔧 Common Issue Checks:');

// Check if assets are in root vs assets folder
const assetsDir = path.join('dist', 'assets');
if (fs.existsSync(assetsDir)) {
  console.log('✅ Assets directory exists');
  const assetFiles = fs.readdirSync(assetsDir);
  console.log(`   Contains ${assetFiles.length} files`);
} else {
  console.log('⚠️  No assets directory found');
}

// Check for absolute vs relative paths
if (indexContent.includes('href="/assets/') || indexContent.includes('src="/assets/')) {
  console.log('✅ Using absolute paths (good for Netlify)');
} else if (indexContent.includes('href="./assets/') || indexContent.includes('src="./assets/')) {
  console.log('⚠️  Using relative paths (may cause issues)');
} else {
  console.log('ℹ️  Path format unclear, check manually');
}

// Environment variable suggestions
console.log('\n🌍 Environment Variable Suggestions for Netlify:');
console.log('Add these to your Netlify environment variables:');
console.log('- NETLIFY=true');
console.log('- VITE_NETLIFY=true');
console.log('- NODE_VERSION=18');

// Build command suggestions
console.log('\n🔨 Build Command Verification:');
console.log('Ensure your netlify.toml has:');
console.log('  command = "npm run build"');
console.log('  publish = "dist"');

console.log('\n✨ Next Steps:');
console.log('1. Commit these configuration changes');
console.log('2. Push to your repository');
console.log('3. Trigger a new Netlify deployment');
console.log('4. Check the build logs for any errors');
console.log('5. Verify the deployed site loads correctly');

console.log('\n🔗 Useful Netlify Debug Commands:');
console.log('- Check build logs in Netlify dashboard');
console.log('- Use Netlify CLI: npx netlify dev (for local testing)');
console.log('- Deploy preview: npx netlify deploy --dir=dist');
console.log('- Production deploy: npx netlify deploy --prod --dir=dist');
