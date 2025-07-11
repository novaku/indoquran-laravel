#!/bin/bash

echo "=== Deploy Redis Fixes to Production ==="
echo "This script will update the Redis commands on your production server"
echo ""

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Not in Laravel directory. Please run from /home/indoqura/repositories/indoquran-laravel"
    exit 1
fi

echo "1. Backing up current files..."
cp routes/console.php routes/console.php.backup.$(date +%Y%m%d_%H%M%S)
cp app/Console/Commands/TestRedisConnection.php app/Console/Commands/TestRedisConnection.php.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created"

echo ""
echo "2. Please upload the following updated files from your local development:"
echo "   - routes/console.php"
echo "   - app/Console/Commands/TestRedisConnection.php"
echo "   - config/database.php"
echo ""
echo "3. After uploading, run these commands:"
echo ""
echo "   # Clear all caches manually"
echo "   rm -rf bootstrap/cache/*.php"
echo "   rm -rf storage/framework/cache/data/*"
echo "   php artisan config:clear"
echo ""
echo "   # Fix socket permissions"
echo "   chmod 660 /home/indoqura/tmp/redis.sock"
echo ""
echo "   # Test Redis connection"
echo "   php artisan redis:quick-test"
echo ""
echo "4. If you have git access, you can also:"
echo "   git pull origin main"
echo "   ./troubleshoot_redis.sh"

echo ""
echo "The main issue is that your current production code is still using"
echo "Laravel's Redis facade which has cached TCP connections."
echo "The updated code uses direct Predis connections to bypass this."
