#!/bin/bash

# Quick fix for Redis configuration error in production
# This script fixes the "Failed to parse address ':'" error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to display status messages
log_message() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to display error messages
log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

# Function to display warning messages
log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_message "Fixing Redis configuration issue..."

# Check if .env file exists
if [ ! -f .env ]; then
    log_error ".env file not found!"
    exit 1
fi

# Backup current .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
log_message "✓ Created backup of .env file"

# Show current Redis configuration
log_message "Current Redis configuration:"
grep -E "REDIS_|CACHE_" .env

log_message "Fixing empty REDIS_HOST and REDIS_PORT..."

# Fix empty REDIS_HOST and REDIS_PORT which cause ":" address error
if grep -q "REDIS_HOST=$" .env || grep -q "REDIS_HOST= *$" .env; then
    sed -i 's/REDIS_HOST=.*/REDIS_HOST=127.0.0.1/' .env
    log_message "✓ Fixed empty REDIS_HOST to 127.0.0.1"
fi

if grep -q "REDIS_PORT=$" .env || grep -q "REDIS_PORT= *$" .env; then
    sed -i 's/REDIS_PORT=.*/REDIS_PORT=6379/' .env
    log_message "✓ Fixed empty REDIS_PORT to 6379"
fi

# Ensure REDIS_CLIENT is set to predis for socket support
if ! grep -q "REDIS_CLIENT=" .env; then
    echo "REDIS_CLIENT=predis" >> .env
    log_message "✓ Added REDIS_CLIENT=predis to .env"
else
    sed -i 's/REDIS_CLIENT=.*/REDIS_CLIENT=predis/' .env
    log_message "✓ Updated REDIS_CLIENT to predis in .env"
fi

# Show updated Redis configuration
log_message "Updated Redis configuration:"
grep -E "REDIS_|CACHE_" .env

# Clear Laravel config cache
log_message "Clearing Laravel configuration cache..."
php artisan config:clear

# Test Redis connection
log_message "Testing Redis connection..."

# Create a test script to check Redis connection
cat > test_redis_fix.php << 'EOF'
<?php
try {
    require_once 'vendor/autoload.php';
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
    
    $redisSocket = $_ENV['REDIS_SOCKET'] ?? null;
    $redisHost = $_ENV['REDIS_HOST'] ?? '127.0.0.1';
    $redisPort = $_ENV['REDIS_PORT'] ?? 6379;
    
    echo "Testing Redis configuration:\n";
    echo "REDIS_SOCKET: " . ($redisSocket ?: 'not set') . "\n";
    echo "REDIS_HOST: $redisHost\n";
    echo "REDIS_PORT: $redisPort\n";
    echo "REDIS_CLIENT: " . ($_ENV['REDIS_CLIENT'] ?? 'not set') . "\n\n";
    
    $redis = new Redis();
    $connected = false;
    
    if ($redisSocket && file_exists($redisSocket)) {
        echo "Attempting socket connection to: $redisSocket\n";
        $connected = $redis->connect($redisSocket);
        if ($connected) {
            $response = $redis->ping();
            if ($response === true || $response === 'PONG') {
                echo "SUCCESS: Redis socket connection working\n";
                exit(0);
            }
        }
        echo "Socket connection failed, trying TCP...\n";
    }
    
    echo "Attempting TCP connection to: $redisHost:$redisPort\n";
    $connected = $redis->connect($redisHost, $redisPort, 2);
    if ($connected) {
        $response = $redis->ping();
        if ($response === true || $response === 'PONG') {
            echo "SUCCESS: Redis TCP connection working\n";
            exit(0);
        }
    }
    
    echo "FAILED: Could not connect to Redis\n";
    exit(1);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
EOF

redis_test_result=$(php test_redis_fix.php 2>&1)
redis_test_status=$?
rm -f test_redis_fix.php

echo "$redis_test_result"

if [ $redis_test_status -eq 0 ]; then
    log_message "✓ Redis connection test passed!"
    
    # Test Laravel's Redis connection
    log_message "Testing Laravel's Redis integration..."
    cat > test_laravel_redis_fix.php << 'EOF'
<?php
try {
    require_once 'vendor/autoload.php';
    $app = require_once 'bootstrap/app.php';
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    
    $redis = app('redis');
    $result = $redis->ping();
    
    if ($result === true || $result === 'PONG' || $result === '+PONG') {
        echo "Laravel Redis connection: SUCCESS\n";
        exit(0);
    } else {
        echo "Laravel Redis connection: FAILED - Unexpected response: " . var_export($result, true) . "\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "Laravel Redis connection: ERROR - " . $e->getMessage() . "\n";
    exit(1);
}
EOF
    
    laravel_redis_test=$(php test_laravel_redis_fix.php 2>&1)
    laravel_redis_status=$?
    rm -f test_laravel_redis_fix.php
    
    echo "$laravel_redis_test"
    
    if [ $laravel_redis_status -eq 0 ]; then
        log_message "✓ Laravel Redis integration working!"
        log_message "✓ Redis configuration fix completed successfully!"
        
        # Try to warm up cache if commands are available
        if php artisan list | grep -q "quran:cache"; then
            log_message "Warming up Quran cache..."
            php artisan quran:cache clear >/dev/null 2>&1 || true
            php artisan quran:cache warm-up >/dev/null 2>&1 || true
            log_message "✓ Cache warmed up"
        fi
        
    else
        log_warning "⚠ Laravel Redis integration still has issues"
        log_warning "The application should work but may use fallback cache"
    fi
    
else
    log_warning "⚠ Redis connection test failed"
    log_warning "Switching to database cache as fallback..."
    
    # Switch to database cache as fallback
    sed -i 's/CACHE_STORE=redis/CACHE_STORE=database/' .env
    php artisan config:clear
    
    log_message "✓ Switched to database cache"
    log_message "Application should now work without Redis errors"
fi

log_message "Configuration fix completed!"
log_message ""
log_message "Next steps:"
log_message "1. Check application logs: tail -f storage/logs/laravel.log"
log_message "2. Test application in browser"
log_message "3. If issues persist, check Redis service status"
log_message "4. Consider running full deployment script: ./deploy-production.sh"
