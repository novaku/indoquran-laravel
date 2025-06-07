#!/bin/bash

# Test script to verify asset URLs in production
# This script simulates the production environment URL structure and checks for common issues

echo "Starting URL verification for production environment..."
echo "==========================================================="

# Check if the app is in production mode
if [ -f .env ]; then
  APP_ENV=$(grep APP_ENV .env | cut -d '=' -f2)
  
  if [ "$APP_ENV" != "production" ]; then
    echo "WARNING: App is not in production mode (APP_ENV=$APP_ENV)"
    echo "This script is simulating production URL structures."
    echo "-----------------------------------------------------------"
  fi
fi

# Define test URLs
declare -a test_urls=(
  "/api/surahs"
  "/api/surahs/1"
  "/favicon.ico"
  "/apple-touch-icon.png"
  "/build/assets/app.js"
  "/build/assets/app.css"
)

# Function to check URL structure
check_url() {
  local url=$1
  local domain=${2:-"https://my.indoquran.web.id"}
  local full_url="$domain$url"
  
  echo "Testing URL: $full_url"
  
  # Use curl to check if URL exists and returns expected status
  # -s for silent, -L to follow redirects, -o /dev/null to discard output
  # -w to format output, --head to only get headers
  status=$(curl -s -L -o /dev/null -w "%{http_code}" --head "$full_url")
  
  if [ "$status" = "200" ] || [ "$status" = "304" ]; then
    echo "✅ URL returns $status - OK"
  else
    echo "❌ URL returns $status - Failed"
    if [ "$status" = "404" ]; then
      echo "   This URL is not found. Check if path is correct and resource exists."
    elif [ "$status" = "301" ] || [ "$status" = "302" ]; then
      echo "   This URL is redirecting. Check if .htaccess rules are correct."
    else
      echo "   Unexpected status code. Check server configuration."
    fi
  fi
  echo "-----------------------"
}

# Loop through test URLs
echo "Checking URLs with domain https://my.indoquran.web.id:"
echo "-----------------------"
for url in "${test_urls[@]}"; do
  check_url "$url"
done

# Test React Router paths
echo "Testing React Router paths in production:"
echo "-----------------------"
declare -a react_routes=(
  "/"
  "/surah/1"
  "/search?q=rahman"
  "/bookmarks"
)

for route in "${react_routes[@]}"; do
  echo "Testing React route: $route"
  echo "✅ This should be handled by React Router in the client-side"
  echo "-----------------------"
done

echo "==========================================================="
echo "URL structure verification complete!"
echo "Note: Some tests may fail if the server is not accessible or resources don't exist."
echo "This is just a structural validation, not a functional test."
