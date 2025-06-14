# Vite Manifest Error Fix Documentation

## Problem
**Error**: `Illuminate\Foundation\ViteManifestNotFoundException: Vite manifest not found at: /home/indoqura/repositories/indoquran-laravel/public/build/manifest.json`

## Root Cause
The Vite build artifacts (manifest.json and assets) are missing from the production server. This happens when:
1. The frontend assets haven't been built for production
2. The build files weren't included in the deployment
3. The build directory was accidentally deleted or not properly synced

**Important**: Your production server only has PHP (no Node.js/npm), so all frontend builds must happen locally and be deployed via git.

## Immediate Solution

### Step 1: Build Assets Locally (Your Machine)
Run the quick fix script on your local machine:
```bash
./fix-vite-manifest.sh
```

### Step 2: Deploy to Production Server
```bash
# Commit the build files
git add public/build/
git commit -m "Fix: Add Vite build files to resolve manifest error"
git push origin main
```

### Step 3: Update Production Server
On your production server (PHP-only environment):
```bash
# Pull the new build files
git pull origin main

# Clear Laravel caches
php artisan config:clear
php artisan view:clear

# Verify assets are properly deployed
./check-vite-assets.sh
```

## Long-term Solution

### 1. Development Workflow (Local Machine)
Your local machine has Node.js/npm for development and building:

```bash
# For development
npm run dev

# For production builds
./build-for-production.sh
```

### 2. Production Deployment (PHP-only Server)
Your production server only needs PHP - no Node.js required:

```bash
# On production server
git pull origin main
php artisan config:clear
php artisan view:clear
./check-vite-assets.sh  # Verify assets are deployed
```

### 3. Recommended Workflow
1. **Local development**: Use `npm run dev` for development
2. **Before deployment**: Run `./build-for-production.sh` locally
3. **Commit build files**: `git add public/build/ && git commit -m "Add production build"`
4. **Deploy**: Push and pull on production server (PHP-only)

## Architecture Overview

### Local Environment (Development)
- Node.js + npm installed
- Vite dev server for hot reloading
- Build tools for asset compilation

### Production Environment (PHP-only)
- Only PHP and web server required
- Pre-built assets served from `public/build/`
- No Node.js dependencies needed

## Why This Happens

### Laravel Vite Integration
Laravel uses Vite for asset compilation. The `@vite()` directive in Blade templates looks for:
- `public/build/manifest.json` - Maps source files to built assets
- `public/build/assets/` - Contains the actual compiled CSS/JS files

### Development vs Production
- **Development**: Vite dev server serves assets directly
- **Production**: Pre-built assets are served from `public/build/`

## Prevention

### 1. Include Build Files in Git
The build files should be committed to your repository for production deployments:
```bash
# Add to .gitignore exceptions if needed
!public/build/
!public/build/manifest.json
!public/build/assets/
```

### 2. Automated Build Process
Consider setting up automated builds in your CI/CD pipeline:
```yaml
# Example GitHub Actions step
- name: Build assets
  run: |
    npm ci
    npm run build
```

### 3. Pre-deployment Checklist
Before each deployment, verify:
- [ ] `public/build/manifest.json` exists
- [ ] `public/build/assets/` contains files
- [ ] Build files are committed to git

## Troubleshooting

### Build Fails
If the build process fails:
1. Check Node.js version compatibility
2. Clear node_modules: `rm -rf node_modules && npm ci`
3. Check for syntax errors in JS/React files

### Assets Not Loading
If build succeeds but assets don't load:
1. Check file permissions on server
2. Verify web server configuration
3. Check browser developer tools for 404 errors

### Performance Impact
Large build files can slow down your application:
- Monitor build sizes in the build output
- Consider code splitting for large applications
- Use CDN for static assets if needed

## Files Added/Modified

### New Scripts
- `build-for-production.sh` - Production build script (LOCAL machine only)
- `fix-vite-manifest.sh` - Quick fix for immediate resolution (LOCAL machine only)
- `check-vite-assets.sh` - Asset verification script (PRODUCTION server)

### Modified Scripts  
- `deploy-production.sh` - Enhanced build verification for PHP-only servers

### Environment-Specific Usage
- **Local Machine** (with Node.js): Use build scripts to create assets
- **Production Server** (PHP-only): Use check script to verify deployment

## Contact
If you continue experiencing issues, check:
1. Laravel logs: `storage/logs/laravel.log`
2. Web server error logs
3. Browser developer console for client-side errors
