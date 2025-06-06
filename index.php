<?php

/**
 * Laravel - A PHP Framework For Web Artisans
 * 
 * This file redirects all requests to the public directory
 * where the main Laravel index.php file is located.
 */

// Define the path to the Laravel public directory
$publicPath = __DIR__ . '/public';

// Check if the public directory exists
if (!is_dir($publicPath)) {
    die('The public directory does not exist. Please ensure your Laravel application is set up correctly.');
}

// Define the request URI
$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

// Check if a file exists in the public directory
if ($uri !== '/' && file_exists($publicPath . $uri)) {
    // Serve the file directly
    $pathInfo = pathinfo($uri);
    $extension = $pathInfo['extension'] ?? '';
    
    // Set the appropriate content type
    switch ($extension) {
        case 'css':
            header('Content-Type: text/css');
            break;
        case 'js':
            header('Content-Type: application/javascript');
            break;
        case 'json':
            header('Content-Type: application/json');
            break;
        case 'svg':
            header('Content-Type: image/svg+xml');
            break;
        case 'png':
            header('Content-Type: image/png');
            break;
        case 'jpg':
        case 'jpeg':
            header('Content-Type: image/jpeg');
            break;
        case 'gif':
            header('Content-Type: image/gif');
            break;
    }
    
    // Output the file content
    readfile($publicPath . $uri);
    exit;
}

// Include the Laravel public index.php file
require_once $publicPath . '/index.php';
