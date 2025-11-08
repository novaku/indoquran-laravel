#!/bin/bash

# Bulk Add AdSense Sidebar to Multiple Pages
# This script adds AdSense vertical ads to specified pages

echo "========================================="
echo "Adding AdSense Sidebar to Pages"
echo "========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Pages to modify with their file paths
declare -A PAGES=(
    ["QuranSearchPage"]="resources/js/react/pages/QuranSearchPage.jsx"
    ["StatistikPage"]="resources/js/react/pages/StatistikPage.jsx"
    ["RiwayatVersiPage"]="resources/js/react/pages/RiwayatVersiPage.jsx"
    ["PageListPage"]="resources/js/react/pages/PageListPage.jsx"
    ["TafsirMaudhuiPage"]="resources/js/react/pages/TafsirMaudhuiPage.jsx"
    ["ArticlesPage"]="resources/js/react/pages/ArticlesPage.jsx"
    ["ArticleDetailPage"]="resources/js/react/pages/ArticleDetailPage.jsx"
    ["DonationSupportPage"]="resources/js/react/pages/DonationSupportPage.jsx"
    ["MemberBenefitsPage"]="resources/js/react/pages/MemberBenefitsPage.jsx"
    ["UserAuthPage"]="resources/js/react/pages/UserAuthPage.jsx"
)

# Check if AdSenseVertical import exists, if not add it
check_and_add_import() {
    local file=$1
    local page_name=$2
    
    if ! grep -q "import AdSenseVertical" "$file"; then
        echo -e "${YELLOW}Adding AdSenseVertical import to $page_name${NC}"
        # Find the last import line and add after it
        sed -i '' '/^import.*from/a\
import AdSenseVertical from '\''../components/AdSenseVertical'\'';
' "$file"
        echo -e "${GREEN}✅ Import added to $page_name${NC}"
    else
        echo -e "${GREEN}✅ Import already exists in $page_name${NC}"
    fi
}

echo "Step 1: Checking and adding imports..."
echo "---------------------------------------"
for page_name in "${!PAGES[@]}"; do
    file="${PAGES[$page_name]}"
    if [ -f "$file" ]; then
        check_and_add_import "$file" "$page_name"
    else
        echo -e "${RED}❌ File not found: $file${NC}"
    fi
done

echo ""
echo "========================================="
echo "Import Phase Complete"
echo "========================================="
echo ""
echo -e "${YELLOW}Note:${NC} Imports have been added to all pages."
echo "Manual sidebar integration required for each page."
echo ""
echo "Use ADSENSE_INTEGRATION_TEMPLATE.md as reference."
echo ""
echo "Pages to integrate:"
for page_name in "${!PAGES[@]}"; do
    echo "  - $page_name"
done
