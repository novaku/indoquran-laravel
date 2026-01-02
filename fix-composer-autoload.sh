#!/bin/bash

# Fix Composer Autoload Error
# Fixes: "Failed to open stream: No such file or directory" errors in vendor/

set -e  # Exit on error

echo "================================================"
echo "  Composer Autoload Error Fix"
echo "================================================"
echo ""

# Find composer in common locations
COMPOSER=""
if command -v composer &> /dev/null; then
    COMPOSER="composer"
elif [ -f "/usr/local/bin/composer" ]; then
    COMPOSER="/usr/local/bin/composer"
elif [ -f "/usr/bin/composer" ]; then
    COMPOSER="/usr/bin/composer"
elif [ -f "$HOME/.composer/composer.phar" ]; then
    COMPOSER="php $HOME/.composer/composer.phar"
elif [ -f "composer.phar" ]; then
    COMPOSER="php composer.phar"
else
    echo "❌ Composer not found! Please install Composer first."
    echo "   Tried: composer, /usr/local/bin/composer, /usr/bin/composer"
    exit 1
fi

echo "✅ Found Composer: $COMPOSER"
echo ""

# Check if we're in Laravel project root
if [ ! -f "artisan" ]; then
    echo "❌ Not in Laravel project root! Please run from project directory."
    exit 1
fi

# Prompt for confirmation
read -p "⚠️  This will remove vendor/ and composer.lock. Continue? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted."
    exit 1
fi

echo ""
echo "🔧 Step 1: Putting site in maintenance mode..."
php artisan down --message="Fixing dependencies" --retry=60 || echo "⚠️  Could not enable maintenance mode (might not be production)"

echo ""
echo "🔧 Step 2: Clearing Composer cache..."
$COMPOSER clear-cache

echo ""
echo "🔧 Step 3: Removing corrupted vendor directory..."
rm -rf vendor/

echo ""
echo "🔧 Step 4: Removing composer.lock..."
rm -f composer.lock

echo ""
echo "🔧 Step 5: Reinstalling dependencies (this may take a few minutes)..."
$COMPOSER install --no-scripts --no-dev --prefer-dist

echo ""
echo "🔧 Step 6: Verifying Laravel framework installation..."
if [ -f "vendor/laravel/framework/src/Illuminate/Reflection/helpers.php" ]; then
    echo "   ✅ Laravel framework files verified"
else
    echo "   ❌ Laravel framework still incomplete! Trying to reinstall..."
    rm -rf vendor/laravel/framework
    $COMPOSER require laravel/framework --no-scripts --no-dev --prefer-dist
fi

echo ""
echo "🔧 Step 7: Generating optimized autoload..."
$COMPOSER dump-autoload --optimize

echo ""
echo "🔧 Step 8: Running post-install scripts..."
$COMPOSER run-script post-autoload-dump 2>/dev/null || echo "   ⚠️  Post-autoload scripts had issues (continuing)"

echo ""
echo "🔧 Step 9: Clearing Laravel caches..."
php artisan optimize:clear 2>/dev/null || echo "   ⚠️  Some cache clearing failed (non-critical)"

echo ""
echo "🔧 Step 10: Rebuilding Laravel caches..."
php artisan config:cache 2>/dev/null || echo "   ⚠️  Config cache failed"
php artisan route:cache 2>/dev/null || echo "   ⚠️  Route cache failed"
php artisan view:cache 2>/dev/null || echo "   ⚠️  View cache failed"

echo ""
echo "🔧 Step 11: Bringing site back online..."
php artisan up 2>/dev/null || echo "   ⚠️  Could not disable maintenance mode"

echo ""
echo "================================================"
echo "✅ Fix completed!"
echo "================================================"
echo ""
echo "🔍 Verifying installation..."
echo ""
$COMPOSER validate
echo ""
echo "Laravel version:"
php artisan --version
echo ""
echo "✅ All done! Your application should be working now."
echo ""
echo "💡 If issues persist:"
echo "   1. Check PHP version: $(php -v | head -n 1)"
echo "   2. Verify storage permissions: chmod -R 775 storage bootstrap/cache"
echo "   3. Check composer.json for conflicts"
