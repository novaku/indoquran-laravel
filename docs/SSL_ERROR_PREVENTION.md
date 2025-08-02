# SSL Error Prevention in Local Development

## Overview
This document explains how to prevent and handle SSL-related errors (`Invalid request (Unsupported SSL request)`) in the IndoQuran Laravel development environment.

## Quick Fix
Run the automated fix script:
```bash
./fix-ssl-errors.sh
```

## Start Development Without SSL Errors
Use the SSL-free development server:
```bash
./start-dev-ssl-free.sh
```

## Manual Setup

### 1. Environment Configuration
Ensure your `.env` file has these settings:
```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
FORCE_HTTPS=false
HTTPS_ONLY=false
SSL_VERIFY=false
```

### 2. Start Servers Manually
```bash
# Laravel server
php artisan serve --host=127.0.0.1 --port=8000 --env=local

# Vite development server
npm run dev
```

### 3. Access Your Application
- **Laravel**: http://localhost:8000 (not https)
- **Vite**: http://localhost:5173

## What Was Fixed

### 1. SSL Error Filtering Middleware
- `app/Http/Middleware/ExcludeSSLErrorsMiddleware.php`
- Automatically detects and blocks SSL probe requests
- Only active in local development environment

### 2. Log Filtering
- `app/Logging/FilterSSLErrorsProcessor.php`
- Filters SSL errors from Laravel logs
- Downgrades SSL errors to debug level instead of error level

### 3. Environment Configuration
- Added SSL control variables to prevent HTTPS forcing
- Configured proper local development settings

### 4. Development Scripts
- `start-dev-ssl-free.sh`: Starts development servers without SSL issues
- `fix-ssl-errors.sh`: Comprehensive SSL error cleanup

## Common SSL Error Patterns (Now Filtered)

These error patterns are automatically filtered in local development:
- `Invalid request (Unsupported SSL request)`
- `SSL handshake failed`
- `SSL_ERROR_SSL`
- `SSL connection error`
- `TLS handshake`
- `certificate verify failed`

## Prevention Tips

### ✅ Do This:
- Use `http://localhost:8000` for local development
- Use the provided start scripts
- Keep `APP_ENV=local` in your `.env`
- Access the app through proper ports (8000 for Laravel, 5173 for Vite)

### ❌ Avoid This:
- Don't use `https://` URLs in local development
- Don't use random high ports like `127.0.0.1:51493`
- Don't set `FORCE_HTTPS=true` in local environment
- Don't ignore the error - use the fix scripts instead

## Monitoring

### Check for SSL Errors
```bash
# Monitor logs without SSL noise
tail -f storage/logs/laravel.log | grep -v SSL

# Check recent filtered SSL errors
grep "SSL Error Filtered" storage/logs/laravel.log | tail -10
```

### Server Status
```bash
# Check if ports are available
lsof -i :8000
lsof -i :5173

# Kill processes on specific ports if needed
kill -9 $(lsof -t -i:8000)
kill -9 $(lsof -t -i:5173)
```

## Troubleshooting

### If SSL Errors Persist:
1. Run the fix script: `./fix-ssl-errors.sh`
2. Clear browser cache and cookies
3. Restart your development servers
4. Check that you're using HTTP (not HTTPS) URLs

### If Port Conflicts Occur:
1. The scripts will automatically kill existing processes
2. Use different ports if needed:
   ```bash
   php artisan serve --port=8080
   ```

### If Middleware Doesn't Work:
1. Clear Laravel caches: `php artisan optimize:clear`
2. Restart the development server
3. Check that `APP_ENV=local` in your `.env`

## Files Modified/Created

### New Files:
- `app/Http/Middleware/ExcludeSSLErrorsMiddleware.php`
- `app/Logging/FilterSSLErrorsProcessor.php`
- `start-dev-ssl-free.sh`
- `fix-ssl-errors.sh`
- `docs/SSL_ERROR_PREVENTION.md`

### Modified Files:
- `bootstrap/app.php` - Added SSL filtering middleware
- `config/logging.php` - Added SSL error processor
- `config/app.php` - Added SSL configuration options
- `.env.example` - Added SSL control variables

## Benefits

1. **Cleaner Logs**: SSL errors are filtered and downgraded
2. **Automatic Detection**: Middleware blocks SSL probes automatically  
3. **Easy Recovery**: One-command fix for SSL issues
4. **Development Friendly**: No more SSL noise in local development
5. **Preventive**: Stops SSL errors before they reach Laravel

## Support

If you continue to experience SSL errors after following this guide:
1. Run `./fix-ssl-errors.sh` again
2. Check that all environment variables are set correctly
3. Ensure you're accessing the app via HTTP (not HTTPS)
4. Restart your development environment completely

---

*Last updated: August 2, 2025*
