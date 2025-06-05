#!/bin/bash

# IndoQuran Laravel - Complete Development Runner
# This script handles everything: refresh, setup, and run the web application

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${CYAN}ℹ️${NC} $1"
}

# Header
echo -e "${PURPLE}================================================${NC}"
echo -e "${CYAN}    IndoQuran Laravel - Development Runner    ${NC}"
echo -e "${PURPLE}================================================${NC}"
echo ""

# Step 1: Check if we're in the right directory
print_step "Checking Laravel project..."
if [ ! -f "artisan" ]; then
    print_error "Laravel artisan file not found. Make sure you're in the Laravel project root."
    exit 1
fi
print_success "Laravel project detected"

# Step 2: Check prerequisites
print_step "Checking prerequisites..."
if ! command -v php >/dev/null 2>&1; then
    print_error "PHP is not installed or not in PATH"
    exit 1
fi

if ! command -v composer >/dev/null 2>&1; then
    print_error "Composer is not installed or not in PATH"
    exit 1
fi
print_success "Prerequisites check passed"

# Step 3: Install dependencies if needed
if [ ! -d "vendor" ]; then
    print_step "Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist
    if [ $? -eq 0 ]; then
        print_success "Composer dependencies installed"
    else
        print_error "Failed to install Composer dependencies"
        exit 1
    fi
else
    print_success "Composer dependencies are ready"
fi

# Step 4: Setup environment
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_step "Creating .env file..."
        cp .env.example .env
        print_success ".env file created"
    else
        print_warning ".env file not found"
    fi
fi

# Step 5: Generate app key if needed
print_step "Checking application key..."
if [ -f ".env" ] && ! grep -q "APP_KEY=base64:" .env; then
    print_step "Generating application key..."
    php artisan key:generate --ansi
    print_success "Application key generated"
else
    print_success "Application key exists"
fi

# Step 6: Setup database
if [ ! -f "database/database.sqlite" ]; then
    print_step "Creating SQLite database..."
    touch database/database.sqlite
    print_success "SQLite database created"
fi

# Step 7: Run migrations
print_step "Running database migrations..."
php artisan migrate --force >/dev/null 2>&1
if [ $? -eq 0 ]; then
    print_success "Database migrations completed"
else
    print_warning "Migration issues detected, continuing..."
fi

# Step 8: Clear all caches
print_step "Clearing all caches..."
php artisan cache:clear >/dev/null 2>&1
php artisan config:clear >/dev/null 2>&1
php artisan view:clear >/dev/null 2>&1
php artisan route:clear >/dev/null 2>&1
php artisan optimize:clear >/dev/null 2>&1
print_success "All caches cleared"

# Step 9: Optimize autoloader
print_step "Optimizing autoloader..."
composer dump-autoload --optimize >/dev/null 2>&1
print_success "Autoloader optimized"

# Step 10: Handle port selection
DEFAULT_PORT=8080
PORT=$DEFAULT_PORT

# Check if port is in use
if lsof -ti:$DEFAULT_PORT >/dev/null 2>&1; then
    print_warning "Port $DEFAULT_PORT is already in use"
    echo ""
    echo "Options:"
    echo "1) Kill existing process and use port $DEFAULT_PORT"
    echo "2) Use port 8000 instead"
    echo "3) Exit"
    echo ""
    read -p "Choose option (1-3): " choice
    
    case $choice in
        1)
            print_step "Killing process on port $DEFAULT_PORT..."
            lsof -ti:$DEFAULT_PORT | xargs kill -9 2>/dev/null
            sleep 2
            PORT=$DEFAULT_PORT
            ;;
        2)
            PORT=8000
            if lsof -ti:$PORT >/dev/null 2>&1; then
                lsof -ti:$PORT | xargs kill -9 2>/dev/null
                sleep 2
            fi
            ;;
        3)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            PORT=8000
            ;;
    esac
fi

# Final summary
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}           🎉 SETUP COMPLETED! 🎉             ${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
print_success "All systems ready!"
print_info "Application URL: http://127.0.0.1:$PORT"
print_info "Available routes:"
echo -e "  ${CYAN}•${NC} Home: http://127.0.0.1:$PORT"
echo -e "  ${CYAN}•${NC} Surahs: http://127.0.0.1:$PORT/surahs"
echo -e "  ${CYAN}•${NC} Surah 1: http://127.0.0.1:$PORT/surah/1"
echo -e "  ${CYAN}•${NC} Search: http://127.0.0.1:$PORT/search"
echo ""
print_info "Press Ctrl+C to stop the server"
echo ""

# Start the server
print_step "Starting Laravel development server on port $PORT..."
echo ""
php artisan serve --port=$PORT --host=127.0.0.1
