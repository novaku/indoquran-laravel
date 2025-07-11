#!/bin/bash

echo "=== Production Redis Socket Test ==="
echo "Date: $(date)"
echo "Socket path: /home/indoqura/tmp/redis.sock"
echo ""

# Check if socket file exists
if [ -S "/home/indoqura/tmp/redis.sock" ]; then
    echo "✅ Socket file exists"
    echo "File permissions: $(stat -c '%a' /home/indoqura/tmp/redis.sock)"
    echo "Owner: $(stat -c '%U:%G' /home/indoqura/tmp/redis.sock)"
else
    echo "❌ Socket file does not exist or is not a socket"
    echo "Checking if file exists at all:"
    ls -la /home/indoqura/tmp/redis.sock 2>/dev/null || echo "File not found"
    exit 1
fi

# Test Redis connection using redis-cli with socket
echo ""
echo "=== Testing redis-cli connection ==="
if command -v redis-cli &> /dev/null; then
    echo "Testing: redis-cli -s /home/indoqura/tmp/redis.sock ping"
    redis-cli -s /home/indoqura/tmp/redis.sock ping
    if [ $? -eq 0 ]; then
        echo "✅ redis-cli connection successful"
    else
        echo "❌ redis-cli connection failed"
    fi
else
    echo "⚠️  redis-cli not found"
fi

# Check Redis process
echo ""
echo "=== Redis Process Check ==="
if pgrep redis-server > /dev/null; then
    echo "✅ Redis server is running"
    echo "Redis processes:"
    ps aux | grep redis-server | grep -v grep
else
    echo "❌ Redis server is not running"
fi

echo ""
echo "=== Redis Socket Configuration Check ==="
if [ -f "/etc/redis/redis.conf" ]; then
    echo "Checking Redis configuration for socket settings:"
    grep -E "^unixsocket|^unixsocketperm" /etc/redis/redis.conf || echo "No socket configuration found in /etc/redis/redis.conf"
elif [ -f "/etc/redis.conf" ]; then
    echo "Checking Redis configuration for socket settings:"
    grep -E "^unixsocket|^unixsocketperm" /etc/redis.conf || echo "No socket configuration found in /etc/redis.conf"
else
    echo "Redis configuration file not found in standard locations"
fi

echo ""
echo "=== Laravel Config Test ==="
echo "Testing Laravel configuration:"
cd /home/indoqura/indoquran-laravel
php artisan config:show database.redis.default
