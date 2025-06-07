# Production Deployment Guide

## URL Structure in Production

In production, IndoQuran uses a URL structure with `/public` prefix to accommodate shared hosting environments. This means:

- API endpoints: `https://indoquran.web.id/public/api/...`
- Static assets: `https://indoquran.web.id/public/build/assets/...`
- Frontend routes: `https://indoquran.web.id/public/surah/1`
- Audio resources: `https://indoquran.web.id/public/audio/...`

## Deployment Process

### 1. Local Setup (Development Machine)

1. Build the frontend assets for production:
   ```bash
   ./build-for-production.sh
   ```
   This script will:
   - Install Node.js dependencies
   - Build optimized assets with Vite
   - Create a `build.zip` in the public directory for easy transfer

2. Upload the built assets to your production server:
   - Transfer the entire `public/build` directory to your server
   - Alternatively, upload `public/build.zip` and extract it on the server

### 2. Server Setup (Production Server)

1. Set the appropriate environment in `.env`:
   ```
   APP_ENV=production
   APP_DEBUG=false
   ```

2. Run the deployment script:
   ```bash
   ./deploy-production.sh
   ```
   This script will:
   - Pull the latest changes from Git
   - Install PHP dependencies
   - Optimize Laravel configuration
   - Migrate the database
   - Set proper file permissions
   - Configure production .htaccess
   - Clear caches

3. Verify the deployment:
   ```bash
   ./test-production-urls.sh
   ```
   This will check if important URLs are correctly structured and accessible.

## URL Handling Implementation

IndoQuran automatically handles the `/public` prefix in production through utility functions:

1. Backend PHP:
   ```php
   // app/Helpers/AssetHelper.php
   function asset_url($path) {
       if (app()->environment('production')) {
           $path = ltrim($path, '/');
           return url("/public/{$path}");
       }
       return url($path);
   }
   ```

2. Frontend JavaScript:
   ```javascript
   // resources/js/react/utils/assets.js
   export const getAssetUrl = (path) => {
       const baseUrl = window.Laravel?.baseUrl || '';
       const normalizedPath = path.startsWith('/') ? path : `/${path}`;
       return `${baseUrl}${normalizedPath}`;
   };
   ```

3. Laravel exposes the environment to React:
   ```php
   // resources/views/react.blade.php
   window.Laravel = {
       baseUrl: '{{ app()->environment('production') ? '/public' : '' }}'
   };
   ```

## Apache Configuration

The production environment requires specific Apache configuration in `.htaccess`:

```apache
# Support React client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api
RewriteCond %{REQUEST_URI} !^/storage
RewriteCond %{REQUEST_URI} !^/build
RewriteRule ^(.*)$ /public/index.php [L]
```

This configuration is automatically applied during deployment.
