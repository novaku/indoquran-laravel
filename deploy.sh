#!/bin/bash

# Laravel deployment script for cPanel environments
# This script is designed to be run on cPanel shared hosting

# Enable strict error handling
set -e

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

log_message "Starting cPanel deployment process..."

# Check if composer is available
if ! command -v composer &> /dev/null; then
    log_warning "Composer command not found. Trying to locate composer.phar..."
    if [ -f composer.phar ]; then
        COMPOSER_CMD="php composer.phar"
        log_message "Using ./composer.phar"
    elif [ -f ~/composer.phar ]; then
        COMPOSER_CMD="php ~/composer.phar"
        log_message "Using ~/composer.phar"
    else
        log_error "composer.phar not found. Please install composer or upload composer.phar to your server."
        log_message "You can download it with: curl -sS https://getcomposer.org/installer | php"
        exit 1
    fi
else
    COMPOSER_CMD="composer"
    log_message "Using system composer"
fi

# Check for environment file
if [ ! -f .env ]; then
    log_warning ".env file not found. Creating from example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        log_message "Created .env from .env.example"
    else
        log_error ".env.example file not found. Please upload a proper .env file."
        exit 1
    fi
    log_message "Please edit .env file with your production settings after deployment"
fi

# Install PHP dependencies
log_message "Installing PHP dependencies..."
$COMPOSER_CMD install --no-dev --optimize-autoloader || { log_error "Failed to install PHP dependencies"; exit 1; }

# Generate application key if not set
if grep -q "APP_KEY=" .env && ! grep -q "APP_KEY=base64:" .env; then
    log_message "Generating application key..."
    php artisan key:generate
fi

# Clear and recache Laravel configs
log_message "Optimizing Laravel..."
php artisan config:clear
php artisan config:cache
php artisan route:clear
php artisan route:cache
php artisan view:clear
php artisan view:cache

# Migrate database if needed (ask for confirmation)
read -p "Do you want to run database migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_message "Running database migrations..."
    php artisan migrate --force
else
    log_message "Skipping database migrations."
fi

# Set proper permissions for cPanel
log_message "Setting permissions for cPanel environment..."
find storage bootstrap/cache -type d -exec chmod 755 {} \;
find storage bootstrap/cache -type f -exec chmod 644 {} \;

# Handle symbolic links required in cPanel
log_message "Handling storage symlink..."
if [ -L "public/storage" ]; then
    log_message "Storage symlink already exists."
else
    php artisan storage:link || {
        log_warning "Failed to create storage symlink. This might be due to cPanel limitations."
        log_message "You might need to manually copy the storage/app/public directory contents to public/storage."
    }
fi

# Create or update .htaccess for cPanel
log_message "Configuring .htaccess for cPanel..."
cat > public/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
EOF

# Create an .htaccess file in the root to redirect to public folder
log_message "Creating root .htaccess for cPanel..."
cat > .htaccess << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine on
    RewriteCond %{REQUEST_URI} !^public
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
EOF

# Clear OPcache if available
log_message "Clearing OPcache..."
php -r "if(function_exists('opcache_reset')) { opcache_reset(); echo 'OPcache cleared'; } else { echo 'OPcache not available'; }"

log_message "Deployment completed successfully!"
log_message "Important reminders for cPanel hosting:"
log_message "1. Ensure your domain points to the root directory (not the public directory)"
log_message "2. Check that storage/ and bootstrap/cache/ directories are writable"
log_message "3. Verify that your database credentials in .env are correct"
log_message "4. If you encounter 500 errors, check the error logs in cPanel"
log_message "5. Some cPanel servers might have memory limits - if you encounter issues, contact your hosting provider"