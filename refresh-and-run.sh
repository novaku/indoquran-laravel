#!/bin/bash

# IndoQuran Laravel - Refresh and Run Script
# This script refreshes all caches and starts the application server

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
echo -e "${CYAN}   IndoQuran Laravel - Refresh and Run   ${NC}"
echo -e "${PURPLE}================================================${NC}"
echo ""

# Step 1: Check if we're in the right directory
print_step "Checking Laravel project..."
if [ ! -f "artisan" ]; then
    print_error "Laravel artisan file not found. Make sure you're in the Laravel project root."
    exit 1
fi
print_success "Laravel project detected"

# Step 2: Clear all caches
print_step "Refreshing application caches..."
php artisan cache:clear
print_success "Application cache cleared"

print_step "Clearing config cache..."
php artisan config:clear
print_success "Config cache cleared"

print_step "Clearing view cache..."
php artisan view:clear
print_success "View cache cleared"

print_step "Clearing route cache..."
php artisan route:clear
print_success "Route cache cleared"

print_step "Clearing optimizations..."
php artisan optimize:clear
print_success "Optimizations cleared"

print_step "Clearing compiled class files..."
php artisan clear-compiled
print_success "Compiled files cleared"

print_step "Refreshing composer autoload..."
composer dump-autoload --quiet
print_success "Composer autoload refreshed"

# Step 3: Rebuild frontend assets
print_step "Rebuilding frontend assets with npm..."
if [ ! -f "package.json" ]; then
    print_warning "package.json not found. Skipping npm build."
else
    npm run build
    print_success "Frontend assets rebuilt successfully"
fi

# Step 4: Handle port selection
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
echo -e "${GREEN}       🎉 REFRESH COMPLETED! STARTING SERVER 🎉   ${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
print_success "All caches refreshed!"
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
