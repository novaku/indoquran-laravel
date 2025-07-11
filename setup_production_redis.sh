#!/bin/bash

echo "=== Production Redis Setup Script ==="
echo "This script will help configure Redis with Unix socket on production"
echo ""

# Check if running as the correct user
if [ "$USER" != "indoqura" ]; then
    echo "⚠️  Warning: You should run this as the 'indoqura' user"
    echo "Current user: $USER"
fi

# Navigate to the Laravel directory
cd /home/indoqura/indoquran-laravel || {
    echo "❌ Could not navigate to Laravel directory"
    exit 1
}

echo "1. Updating .env file for Redis socket configuration..."

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Created backup of current .env file"

# Update Redis configuration in .env
sed -i 's/^CACHE_STORE=.*/CACHE_STORE=redis/' .env
sed -i 's/^CACHE_DRIVER=.*/CACHE_DRIVER=redis/' .env

# Remove existing Redis lines
sed -i '/^REDIS_/d' .env

# Add new Redis configuration
cat >> .env << EOL

REDIS_CLIENT=predis
REDIS_HOST=
REDIS_PASSWORD=null
REDIS_PORT=
REDIS_SOCKET=/home/indoqura/tmp/redis.sock
EOL

echo "✅ Updated .env with Redis socket configuration"

echo ""
echo "2. Clearing Laravel caches..."
php artisan config:clear
php artisan cache:clear
php artisan config:cache
echo "✅ Laravel caches cleared"

echo ""
echo "3. Checking Redis socket configuration..."

# Check if Redis socket directory exists
if [ ! -d "/home/indoqura/tmp" ]; then
    echo "Creating /home/indoqura/tmp directory..."
    mkdir -p /home/indoqura/tmp
    chown indoqura:indoqura /home/indoqura/tmp
fi

# Check Redis configuration
if [ -f "/etc/redis/redis.conf" ]; then
    REDIS_CONF="/etc/redis/redis.conf"
elif [ -f "/etc/redis.conf" ]; then
    REDIS_CONF="/etc/redis.conf"
else
    echo "❌ Could not find Redis configuration file"
    exit 1
fi

echo "Found Redis config at: $REDIS_CONF"

# Check if socket is configured
if grep -q "^unixsocket /home/indoqura/tmp/redis.sock" "$REDIS_CONF"; then
    echo "✅ Redis socket is already configured"
else
    echo "⚠️  Redis socket configuration needs to be updated"
    echo "Please add these lines to $REDIS_CONF:"
    echo "unixsocket /home/indoqura/tmp/redis.sock"
    echo "unixsocketperm 666"
    echo ""
    echo "Then restart Redis: sudo systemctl restart redis"
fi

echo ""
echo "4. Testing Redis connection..."
php artisan redis:test

echo ""
echo "Setup completed!"
echo "If there are still issues, check:"
echo "1. Redis server is running: sudo systemctl status redis"
echo "2. Socket file exists: ls -la /home/indoqura/tmp/redis.sock"
echo "3. Socket permissions are correct (should be srw-rw-rw-)"
