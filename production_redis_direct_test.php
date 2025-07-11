<?php
/**
 * Production Redis Socket Connection Test
 * Run this script on your production server to test Redis connectivity
 */

echo "=== Production Redis Socket Test ===\n";
echo "Date: " . date('Y-m-d H:i:s') . "\n";

$socketPath = '/home/indoqura/tmp/redis.sock';
echo "Socket path: $socketPath\n\n";

// Check if socket file exists
if (file_exists($socketPath)) {
    echo "✅ Socket file exists\n";
    
    if (is_readable($socketPath) && is_writable($socketPath)) {
        echo "✅ Socket has proper permissions\n";
    } else {
        echo "❌ Socket permissions issue\n";
        echo "  Readable: " . (is_readable($socketPath) ? 'Yes' : 'No') . "\n";
        echo "  Writable: " . (is_writable($socketPath) ? 'Yes' : 'No') . "\n";
    }
    
    // Get socket file permissions
    $perms = fileperms($socketPath);
    echo "  File permissions: " . substr(sprintf('%o', $perms), -4) . "\n";
} else {
    echo "❌ Socket file does not exist: $socketPath\n";
    exit(1);
}

echo "\n=== Direct Socket Connection Test ===\n";

try {
    // Create a direct socket connection
    $socket = socket_create(AF_UNIX, SOCK_STREAM, 0);
    if (!$socket) {
        throw new Exception("Could not create socket: " . socket_strerror(socket_last_error()));
    }
    
    $result = socket_connect($socket, $socketPath);
    if (!$result) {
        throw new Exception("Could not connect to socket: " . socket_strerror(socket_last_error()));
    }
    
    // Send PING command
    socket_write($socket, "*1\r\n$4\r\nPING\r\n");
    $response = socket_read($socket, 1024);
    
    socket_close($socket);
    
    if (strpos($response, 'PONG') !== false) {
        echo "✅ Direct socket connection successful\n";
        echo "  Response: " . trim($response) . "\n";
    } else {
        echo "❌ Unexpected response: " . trim($response) . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Direct socket connection failed: " . $e->getMessage() . "\n";
}

echo "\n=== Predis Connection Test ===\n";

// Check if we can load Predis
if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    echo "❌ Composer autoloader not found\n";
    exit(1);
}

require_once __DIR__ . '/vendor/autoload.php';

try {
    $client = new Predis\Client([
        'scheme' => 'unix',
        'path' => $socketPath,
    ]);
    
    $pong = $client->ping();
    echo "✅ Predis connection successful\n";
    echo "  Response: $pong\n";
    
    // Test basic operations
    $testKey = 'production_test_' . time();
    $client->set($testKey, 'Hello from production!');
    $value = $client->get($testKey);
    $client->del($testKey);
    
    if ($value === 'Hello from production!') {
        echo "✅ Basic Redis operations working\n";
    } else {
        echo "❌ Basic operations failed\n";
    }
    
} catch (Exception $e) {
    echo "❌ Predis connection failed: " . $e->getMessage() . "\n";
}

echo "\n=== Laravel Environment Check ===\n";

// Load Laravel environment
if (file_exists(__DIR__ . '/.env')) {
    $envContent = file_get_contents(__DIR__ . '/.env');
    if (preg_match('/REDIS_SOCKET=(.+)/', $envContent, $matches)) {
        $configuredSocket = trim($matches[1]);
        echo "Configured socket in .env: $configuredSocket\n";
        
        if ($configuredSocket === $socketPath) {
            echo "✅ Socket path matches\n";
        } else {
            echo "❌ Socket path mismatch\n";
        }
    } else {
        echo "❌ REDIS_SOCKET not found in .env\n";
    }
} else {
    echo "❌ .env file not found\n";
}

echo "\nTest completed.\n";
