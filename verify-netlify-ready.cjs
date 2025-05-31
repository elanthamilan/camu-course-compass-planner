#!/usr/bin/env node

/**
 * Netlify Deployment Readiness Verification Script
 * Checks if all required files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Netlify deployment readiness...\n');

const checks = [
  {
    name: 'netlify.toml configuration',
    check: () => fs.existsSync('netlify.toml'),
    fix: 'Create netlify.toml file with build configuration'
  },
  {
    name: 'SPA redirects file',
    check: () => fs.existsSync('public/_redirects'),
    fix: 'Create public/_redirects file for SPA routing'
  },
  {
    name: 'Node.js version file',
    check: () => fs.existsSync('.nvmrc'),
    fix: 'Create .nvmrc file specifying Node.js version'
  },
  {
    name: 'Package.json exists',
    check: () => fs.existsSync('package.json'),
    fix: 'Ensure package.json exists with proper dependencies'
  },
  {
    name: 'Vite config exists',
    check: () => fs.existsSync('vite.config.ts'),
    fix: 'Ensure vite.config.ts exists with Netlify configuration'
  },
  {
    name: 'Source directory exists',
    check: () => fs.existsSync('src'),
    fix: 'Ensure src directory exists with application code'
  },
  {
    name: 'Public directory exists',
    check: () => fs.existsSync('public'),
    fix: 'Ensure public directory exists with static assets'
  },
  {
    name: 'Build script in package.json',
    check: () => {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        return pkg.scripts && pkg.scripts.build;
      } catch {
        return false;
      }
    },
    fix: 'Add "build" script to package.json'
  },
  {
    name: 'Netlify build script in package.json',
    check: () => {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        return pkg.scripts && pkg.scripts['build:netlify'];
      } catch {
        return false;
      }
    },
    fix: 'Add "build:netlify" script to package.json'
  },
  {
    name: 'React and dependencies',
    check: () => {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        return pkg.dependencies && pkg.dependencies.react;
      } catch {
        return false;
      }
    },
    fix: 'Install React and required dependencies'
  }
];

let allPassed = true;
let passedCount = 0;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  const message = passed ? 'PASS' : 'FAIL';
  
  console.log(`${status} ${check.name}: ${message}`);
  
  if (!passed) {
    console.log(`   💡 Fix: ${check.fix}`);
    allPassed = false;
  } else {
    passedCount++;
  }
});

console.log(`\n📊 Results: ${passedCount}/${checks.length} checks passed`);

if (allPassed) {
  console.log('\n🎉 All checks passed! Your project is ready for Netlify deployment.');
  console.log('\n📋 Next steps:');
  console.log('1. Commit and push your changes');
  console.log('2. Connect your repository to Netlify');
  console.log('3. Deploy your site');
  console.log('\n🔗 Netlify: https://netlify.com');
} else {
  console.log('\n⚠️  Some checks failed. Please fix the issues above before deploying.');
  process.exit(1);
}

// Additional configuration checks
console.log('\n🔧 Configuration Details:');

try {
  const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
  console.log('✅ netlify.toml found and readable');
  
  if (netlifyConfig.includes('publish = "dist"')) {
    console.log('✅ Publish directory set to "dist"');
  } else {
    console.log('⚠️  Publish directory may not be set correctly');
  }
  
  if (netlifyConfig.includes('command = "npm run build"')) {
    console.log('✅ Build command set to "npm run build"');
  } else {
    console.log('⚠️  Build command may not be set correctly');
  }
} catch {
  console.log('❌ Could not read netlify.toml');
}

try {
  const nvmrc = fs.readFileSync('.nvmrc', 'utf8').trim();
  console.log(`✅ Node.js version: ${nvmrc}`);
} catch {
  console.log('❌ Could not read .nvmrc');
}

console.log('\n📚 Documentation available:');
console.log('- NETLIFY_DEPLOYMENT.md - Comprehensive deployment guide');
console.log('- DEPLOYMENT_CHECKLIST.md - Pre-deployment checklist');
console.log('- NETLIFY_READY_SUMMARY.md - Summary of preparations');
