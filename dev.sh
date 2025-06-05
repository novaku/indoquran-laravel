#!/bin/bash

# Laravel Development Helper Script
# Provides various development commands for the Quran Laravel application

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to display the menu
show_menu() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${PURPLE}  IndoQuran Laravel Dev Helper  ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    echo "Choose an option:"
    echo -e "${GREEN}1)${NC} Refresh all caches and views"
    echo -e "${GREEN}2)${NC} Start development server (port 8000)"
    echo -e "${GREEN}3)${NC} Start development server (port 8080)"
    echo -e "${GREEN}4)${NC} Run migrations"
    echo -e "${GREEN}5)${NC} Seed database"
    echo -e "${GREEN}6)${NC} Fresh migration with seeding"
    echo -e "${GREEN}7)${NC} Run tests"
    echo -e "${GREEN}8)${NC} Install/Update dependencies"
    echo -e "${GREEN}9)${NC} Build assets (Vite)"
    echo -e "${GREEN}10)${NC} Watch assets (Vite dev)"
    echo -e "${GREEN}11)${NC} Clear all logs"
    echo -e "${GREEN}12)${NC} Show routes"
    echo -e "${GREEN}13)${NC} Tinker (Laravel REPL)"
    echo -e "${RED}0)${NC} Exit"
    echo ""
}

# Function to refresh caches
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
    
    # Rebuild key caches for production-like environment
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
        
        # Rebuild assets
        echo -e "${YELLOW}🔄 Rebuilding frontend assets...${NC}"
        npm run build
        echo -e "${GREEN}✅ Frontend assets rebuilt successfully!${NC}"
    fi
    
    echo -e "${GREEN}✅ All caches have been refreshed successfully!${NC}"
}

# Function to start server
start_server() {
    local port=$1
    echo -e "${YELLOW}🌐 Starting Laravel development server on port ${port}...${NC}"
    php artisan serve --port=$port
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

# Function to install dependencies
install_dependencies() {
    echo -e "${YELLOW}📦 Installing/Updating dependencies...${NC}"
    composer install
    npm install
    echo -e "${GREEN}✅ Dependencies updated!${NC}"
}

# Function to build assets
build_assets() {
    echo -e "${YELLOW}🏗️  Building assets...${NC}"
    npm run build
    echo -e "${GREEN}✅ Assets built successfully!${NC}"
}

# Function to watch assets
watch_assets() {
    echo -e "${YELLOW}👀 Starting asset watcher...${NC}"
    npm run dev
}

# Function to clear logs
clear_logs() {
    echo -e "${YELLOW}🧹 Clearing log files...${NC}"
    > storage/logs/laravel.log
    echo -e "${GREEN}✅ Log files cleared!${NC}"
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

# Main script logic
while true; do
    show_menu
    read -p "Enter your choice: " choice
    
    case $choice in
        1)
            refresh_caches
            ;;
        2)
            start_server 8000
            ;;
        3)
            start_server 8080
            ;;
        4)
            run_migrations
            ;;
        5)
            seed_database
            ;;
        6)
            fresh_migrate_seed
            ;;
        7)
            run_tests
            ;;
        8)
            install_dependencies
            ;;
        9)
            build_assets
            ;;
        10)
            watch_assets
            ;;
        11)
            clear_logs
            ;;
        12)
            show_routes
            ;;
        13)
            start_tinker
            ;;
        0)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid option. Please try again.${NC}"
            ;;
    esac
    
    # Wait for user input before showing menu again (except for server start)
    if [ "$choice" != "2" ] && [ "$choice" != "3" ] && [ "$choice" != "10" ] && [ "$choice" != "13" ]; then
        echo ""
        read -p "Press Enter to continue..."
        clear
    fi
done
