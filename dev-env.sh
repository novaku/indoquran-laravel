#!/bin/bash

# IndoQuran Laravel + React Development Environment Script
# Comprehensive development helper with all essential commands

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Global variables for process tracking
LARAVEL_PID=""
VITE_PID=""

# Function to display the main menu
show_menu() {
    clear
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${PURPLE}  IndoQuran Development Environment v2.0  ${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo ""
    echo -e "${CYAN}🚀 Server Management:${NC}"
    echo -e "${GREEN}1)${NC}  Start development servers (Laravel + Vite)"
    echo -e "${GREEN}2)${NC}  Start Laravel server only (port 8000)"
    echo -e "${GREEN}3)${NC}  Start Laravel server only (port 8080)"
    echo -e "${GREEN}4)${NC}  Restart development servers"
    echo -e "${GREEN}5)${NC}  Stop all development servers"
    echo ""
    echo -e "${CYAN}🔧 Cache & Optimization:${NC}"
    echo -e "${GREEN}6)${NC}  Refresh all caches and views"
    echo -e "${GREEN}7)${NC}  Clear logs"
    echo -e "${GREEN}8)${NC}  Optimize for development"
    echo ""
    echo -e "${CYAN}📦 Dependencies & Assets:${NC}"
    echo -e "${GREEN}9)${NC}  Install/Update dependencies"
    echo -e "${GREEN}10)${NC} Build assets for production"
    echo -e "${GREEN}11)${NC} Watch assets (Vite dev mode)"
    echo ""
    echo -e "${CYAN}🗄️  Database:${NC}"
    echo -e "${GREEN}12)${NC} Run migrations"
    echo -e "${GREEN}13)${NC} Seed database"
    echo -e "${GREEN}14)${NC} Fresh migration with seeding"
    echo ""
    echo -e "${CYAN}🛠️  Development Tools:${NC}"
    echo -e "${GREEN}15)${NC} Run tests"
    echo -e "${GREEN}16)${NC} Show routes"
    echo -e "${GREEN}17)${NC} Laravel Tinker (REPL)"
    echo -e "${GREEN}18)${NC} Generate sitemap"
    echo ""
    echo -e "${CYAN}📋 Status & Info:${NC}"
    echo -e "${GREEN}19)${NC} Check server status"
    echo -e "${GREEN}20)${NC} Show Laravel info"
    echo ""
    echo -e "${RED}0)${NC}  Exit"
    echo ""
}

# Function to stop all development servers
stop_servers() {
    echo -e "${YELLOW}🛑 Stopping development servers...${NC}"
    
    # Kill specific process IDs if we have them
    if [ ! -z "$LARAVEL_PID" ]; then
        kill $LARAVEL_PID 2>/dev/null && echo -e "${GREEN}✅ Laravel server stopped${NC}"
    fi
    
    if [ ! -z "$VITE_PID" ]; then
        kill $VITE_PID 2>/dev/null && echo -e "${GREEN}✅ Vite server stopped${NC}"
    fi
    
    # Kill any remaining Laravel and Vite processes
    pkill -f "php artisan serve" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    pkill -f "npm run dev" 2>/dev/null
    
    echo -e "${GREEN}✅ All development servers stopped${NC}"
}

# Function to start both development servers
start_dev_servers() {
    echo -e "${YELLOW}🚀 Starting development environment...${NC}"
    
    # Stop any existing processes first
    stop_servers
    
    # Clear Laravel caches
    echo -e "${BLUE}Clearing Laravel caches...${NC}"
    php artisan cache:clear > /dev/null 2>&1
    php artisan config:clear > /dev/null 2>&1
    php artisan route:clear > /dev/null 2>&1
    php artisan view:clear > /dev/null 2>&1
    
    echo -e "${YELLOW}🌐 Starting Laravel development server on port 8000...${NC}"
    php artisan serve &
    LARAVEL_PID=$!
    
    echo -e "${YELLOW}⏳ Waiting for Laravel to start...${NC}"
    sleep 3
    
    echo -e "${YELLOW}⚡ Starting Vite development server on port 5173...${NC}"
    npm run dev &
    VITE_PID=$!
    
    echo -e "${GREEN}✅ Development servers started successfully!${NC}"
    echo ""
    echo -e "${CYAN}📝 Server URLs:${NC}"
    echo -e "${GREEN}   Laravel Backend: ${NC}http://127.0.0.1:8000"
    echo -e "${GREEN}   Vite Frontend:   ${NC}http://127.0.0.1:5173"
    echo ""
    echo -e "${CYAN}🎯 Access your React app at: ${NC}http://127.0.0.1:5173"
    echo -e "${CYAN}🔧 API calls will be proxied to Laravel backend automatically${NC}"
    echo ""
    echo -e "${YELLOW}💡 Press Ctrl+C to stop servers, or use menu option 5${NC}"
    
    # Set up trap to handle interruption
    trap "stop_servers; exit" INT
    
    # Wait for user input to return to menu
    echo ""
    read -p "Press Enter to return to menu (servers will continue running)..."
}

# Function to start Laravel server only
start_laravel_server() {
    local port=$1
    echo -e "${YELLOW}🌐 Starting Laravel development server on port ${port}...${NC}"
    
    # Clear Laravel caches first
    php artisan cache:clear > /dev/null 2>&1
    php artisan config:clear > /dev/null 2>&1
    php artisan route:clear > /dev/null 2>&1
    php artisan view:clear > /dev/null 2>&1
    
    php artisan serve --port=$port
}

# Function to restart development servers
restart_servers() {
    echo -e "${YELLOW}🔄 Restarting development servers...${NC}"
    stop_servers
    sleep 2
    start_dev_servers
}

# Function to refresh all caches
refresh_caches() {
    echo -e "${YELLOW}🚀 Starting Laravel refresh process...${NC}"
    
    # Clear Laravel caches
    echo -e "${BLUE}Clearing Laravel caches...${NC}"
    php artisan cache:clear
    php artisan config:clear
    php artisan view:clear
    php artisan route:clear
    php artisan event:clear
    php artisan optimize:clear
    
    # Remove Bootstrap cache files
    echo -e "${BLUE}Clearing bootstrap cache files...${NC}"
    php artisan clear-compiled
    
    # Clear actual cache files from storage
    echo -e "${BLUE}Removing cached files from storage...${NC}"
    if [ -d "storage/framework/cache/data" ]; then
        find storage/framework/cache/data -type f -not -name '.gitignore' -delete
    fi
    
    # Regenerate autoload files
    echo -e "${BLUE}Regenerating autoload files...${NC}"
    composer dump-autoload
    
    # Rebuild key caches for development
    echo -e "${BLUE}Rebuilding essential caches...${NC}"
    php artisan config:cache
    php artisan route:cache
    
    # Frontend cache clearing
    if [ -f "package.json" ]; then
        echo -e "${YELLOW}🔄 Clearing frontend caches...${NC}"
        
        # Clear node_modules/.vite directory if it exists
        if [ -d "node_modules/.vite" ]; then
            echo -e "${BLUE}Removing Vite cache...${NC}"
            rm -rf node_modules/.vite
        fi
        
        # Clear any React/JS build caches
        if [ -d "public/build" ]; then
            echo -e "${BLUE}Removing previous builds...${NC}"
            rm -rf public/build/*
        fi
    fi
    
    echo -e "${GREEN}✅ All caches have been refreshed successfully!${NC}"
}

# Function to clear logs
clear_logs() {
    echo -e "${YELLOW}🧹 Clearing log files...${NC}"
    > storage/logs/laravel.log
    echo -e "${GREEN}✅ Log files cleared!${NC}"
}

# Function to optimize for development
optimize_dev() {
    echo -e "${YELLOW}⚡ Optimizing for development...${NC}"
    php artisan optimize:clear
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    composer dump-autoload
    echo -e "${GREEN}✅ Development optimization completed!${NC}"
}

# Function to install dependencies
install_dependencies() {
    echo -e "${YELLOW}📦 Installing/Updating dependencies...${NC}"
    
    echo -e "${BLUE}Installing PHP dependencies...${NC}"
    composer install
    
    echo -e "${BLUE}Installing Node.js dependencies...${NC}"
    npm install
    
    echo -e "${GREEN}✅ Dependencies updated!${NC}"
}

# Function to build assets for production
build_assets() {
    echo -e "${YELLOW}🏗️  Building assets for production...${NC}"
    npm run build
    echo -e "${GREEN}✅ Assets built successfully!${NC}"
}

# Function to watch assets
watch_assets() {
    echo -e "${YELLOW}👀 Starting asset watcher...${NC}"
    npm run dev
}

# Function to run migrations
run_migrations() {
    echo -e "${YELLOW}🗄️  Running migrations...${NC}"
    php artisan migrate
    echo -e "${GREEN}✅ Migrations completed!${NC}"
}

# Function to seed database
seed_database() {
    echo -e "${YELLOW}🌱 Seeding database...${NC}"
    php artisan db:seed
    echo -e "${GREEN}✅ Database seeding completed!${NC}"
}

# Function to fresh migrate and seed
fresh_migrate_seed() {
    echo -e "${YELLOW}🔄 Running fresh migration with seeding...${NC}"
    php artisan migrate:fresh --seed
    echo -e "${GREEN}✅ Fresh migration and seeding completed!${NC}"
}

# Function to run tests
run_tests() {
    echo -e "${YELLOW}🧪 Running tests...${NC}"
    php artisan test
}

# Function to show routes
show_routes() {
    echo -e "${YELLOW}🛣️  Listing all routes...${NC}"
    php artisan route:list
}

# Function to start tinker
start_tinker() {
    echo -e "${YELLOW}🔧 Starting Laravel Tinker...${NC}"
    php artisan tinker
}

# Function to generate sitemap
generate_sitemap() {
    echo -e "${YELLOW}🗺️  Generating sitemap.xml for IndoQuran website...${NC}"
    php artisan sitemap:generate
    echo -e "${GREEN}✅ Sitemap generated successfully!${NC}"
}

# Function to check server status
check_status() {
    echo -e "${YELLOW}📊 Checking server status...${NC}"
    echo ""
    
    # Check Laravel server
    if curl -s http://127.0.0.1:8000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Laravel server is running on port 8000${NC}"
    else
        echo -e "${RED}❌ Laravel server is not running${NC}"
    fi
    
    # Check Vite server
    if curl -s http://127.0.0.1:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Vite server is running on port 5173${NC}"
    else
        echo -e "${RED}❌ Vite server is not running${NC}"
    fi
    
    # Check processes
    echo ""
    echo -e "${CYAN}Active PHP processes:${NC}"
    ps aux | grep "php artisan serve" | grep -v grep || echo "No Laravel servers running"
    
    echo ""
    echo -e "${CYAN}Active Node processes:${NC}"
    ps aux | grep "vite\|npm run dev" | grep -v grep || echo "No Vite servers running"
}

# Function to show Laravel info
show_laravel_info() {
    echo -e "${YELLOW}ℹ️  Laravel Application Information...${NC}"
    echo ""
    php artisan about
}

# Cleanup function for script exit
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    stop_servers
    echo -e "${GREEN}👋 Development environment script terminated${NC}"
    exit 0
}

# Set up trap for script termination
trap cleanup EXIT INT TERM

# Main script logic
while true; do
    show_menu
    read -p "Enter your choice [0-20]: " choice
    
    case $choice in
        1)
            start_dev_servers
            ;;
        2)
            start_laravel_server 8000
            ;;
        3)
            start_laravel_server 8080
            ;;
        4)
            restart_servers
            ;;
        5)
            stop_servers
            ;;
        6)
            refresh_caches
            ;;
        7)
            clear_logs
            ;;
        8)
            optimize_dev
            ;;
        9)
            install_dependencies
            ;;
        10)
            build_assets
            ;;
        11)
            watch_assets
            ;;
        12)
            run_migrations
            ;;
        13)
            seed_database
            ;;
        14)
            fresh_migrate_seed
            ;;
        15)
            run_tests
            ;;
        16)
            show_routes
            ;;
        17)
            start_tinker
            ;;
        18)
            generate_sitemap
            ;;
        19)
            check_status
            ;;
        20)
            show_laravel_info
            ;;
        0)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option. Please choose 0-20.${NC}"
            ;;
    esac
    
    # Wait for user input before showing menu again (except for certain options)
    if [[ ! "$choice" =~ ^(1|2|3|4|11|17)$ ]]; then
        echo ""
        read -p "Press Enter to continue..."
    fi
done
