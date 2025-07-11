#!/bin/bash

echo "=== Production Redis Troubleshooting Script ==="
echo "Date: $(date)"
echo ""

echo "1. Checking .env file Redis configuration..."
echo "Current Redis settings in .env:"
grep "^REDIS_" .env || echo "No REDIS_ settings found in .env"
echo ""

echo "2. Clearing all Laravel caches safely..."
php artisan redis:safe-clear
echo "✅ All caches cleared safely"
echo ""

echo "3. Running Redis debug command..."
php artisan redis:debug
echo ""

echo "4. Checking Redis process..."
if pgrep redis-server > /dev/null; then
    echo "✅ Redis server is running"
    echo "Redis processes:"
    ps aux | grep redis-server | grep -v grep
else
    echo "❌ Redis server is not running"
    echo "Try starting Redis: sudo systemctl start redis"
    exit 1
fi
echo ""

echo "5. Checking socket file..."
SOCKET_PATH="/home/indoqura/tmp/redis.sock"
if [ -S "$SOCKET_PATH" ]; then
    echo "✅ Socket file exists and is a socket"
    echo "Socket details:"
    ls -la "$SOCKET_PATH"
    echo "Socket owner: $(stat -c '%U:%G' $SOCKET_PATH)"
    CURRENT_PERMS=$(stat -c '%a' $SOCKET_PATH)
    echo "Socket permissions: $CURRENT_PERMS"
    
    # Check if permissions need fixing
    if [ "$CURRENT_PERMS" = "700" ]; then
        echo "⚠️  Socket permissions are too restrictive (700)"
        echo "Attempting to fix permissions to 660..."
        chmod 660 "$SOCKET_PATH" 2>/dev/null && echo "✅ Permissions updated to 660" || echo "❌ Failed to update permissions"
        ls -la "$SOCKET_PATH"
    else
        echo "✅ Socket permissions look good"
    fi
else
    echo "❌ Socket file issue:"
    if [ -e "$SOCKET_PATH" ]; then
        echo "File exists but is not a socket:"
        ls -la "$SOCKET_PATH"
        file "$SOCKET_PATH"
    else
        echo "Socket file does not exist: $SOCKET_PATH"
        echo "Check Redis configuration and restart Redis"
    fi
fi
echo ""

echo "6. Testing direct socket connection..."
if command -v redis-cli &> /dev/null; then
    echo "Testing with redis-cli:"
    redis-cli -s "$SOCKET_PATH" ping 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ redis-cli connection successful"
    else
        echo "❌ redis-cli connection failed"
    fi
else
    echo "⚠️  redis-cli not available"
fi
echo ""

echo "7. Checking Redis configuration file..."
for CONF_FILE in /etc/redis/redis.conf /etc/redis.conf /usr/local/etc/redis.conf; do
    if [ -f "$CONF_FILE" ]; then
        echo "Found Redis config: $CONF_FILE"
        echo "Socket configuration:"
        grep -E "^unixsocket|^# unixsocket" "$CONF_FILE" | head -5
        echo ""
        break
    fi
done

echo "8. Final Laravel Redis test..."
php artisan redis:quick-test

echo ""
echo "=== Troubleshooting completed ==="
echo "If issues persist:"
echo "1. Check Redis logs: sudo journalctl -u redis"
echo "2. Verify Redis config includes: unixsocket /home/indoqura/tmp/redis.sock"
echo "3. Restart Redis: sudo systemctl restart redis"
echo "4. Check file permissions on /home/indoqura/tmp/"
