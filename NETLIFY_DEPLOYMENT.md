# Netlify Deployment Guide

This guide explains how to deploy the CAMU Course Compass Planner to Netlify.

## Prerequisites

- A Netlify account (free tier available)
- Your repository pushed to GitHub/GitLab/Bitbucket
- Node.js 18+ installed locally (for testing)

## Quick Deployment Steps

### 1. Connect Repository to Netlify

1. Log in to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Choose the `refactor/schedule-functionality` branch

### 2. Configure Build Settings

Netlify should automatically detect the settings from `netlify.toml`, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node.js version**: `18` (from `.nvmrc`)

### 3. Deploy

Click "Deploy site" - Netlify will:
- Install dependencies
- Build the application
- Deploy to a unique URL
- Set up automatic deployments for future commits

## Configuration Files

The following files have been configured for optimal Netlify deployment:

### `netlify.toml`
- Build configuration
- SPA routing redirects
- Security headers
- Caching rules
- Environment-specific builds

### `public/_redirects`
- Backup SPA routing configuration
- Ensures React Router works correctly

### `.nvmrc`
- Specifies Node.js version 18
- Ensures consistent build environment

### Updated `vite.config.ts`
- Automatic base path detection
- Netlify-specific optimizations
- Code splitting for better performance

### Updated `package.json`
- Netlify-specific build scripts
- Cross-platform environment variable support

## Environment Variables

The application automatically detects Netlify deployment and adjusts:
- Base path (root `/` for Netlify vs `/camu-course-compass-planner/` for GitHub Pages)
- Router basename configuration
- Build optimizations

## Performance Optimizations

The Netlify configuration includes:
- **Code splitting**: Vendor, UI, charts, and utils bundles
- **Caching headers**: Long-term caching for static assets
- **Security headers**: XSS protection, content type sniffing prevention
- **Compression**: Automatic gzip/brotli compression

## Custom Domain (Optional)

After deployment, you can:
1. Go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS settings
4. Enable HTTPS (automatic with Netlify)

## Branch Deployments

- **Production**: Deploys from `refactor/schedule-functionality` branch
- **Preview**: Automatic deploy previews for pull requests
- **Branch deploys**: Deploy any branch for testing

## Troubleshooting

### Build Fails
1. Check build logs in Netlify dashboard
2. Verify Node.js version compatibility
3. Ensure all dependencies are in `package.json`

### Routing Issues
1. Verify `_redirects` file is in `public/` directory
2. Check `netlify.toml` redirect rules
3. Ensure React Router basename is correct

### Performance Issues
1. Check bundle size in build logs
2. Verify code splitting is working
3. Monitor Core Web Vitals in Netlify Analytics

## Local Testing

Test the Netlify build locally:

```bash
# Install dependencies
npm install

# Build for Netlify
npm run build:netlify

# Preview the build
npm run preview
```

## Support

- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
- [React Router Deployment](https://reactrouter.com/en/main/guides/deploying)
