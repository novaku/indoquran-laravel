#!/bin/bash

# Script untuk menambahkan AdSense ke semua halaman
# Menambahkan import AdSenseVertical ke file-file yang belum memilikinya

PAGES_DIR="resources/js/react/pages"

# Daftar file yang akan ditambahkan AdSense
FILES=(
    "ArticlesPage.jsx"
    "ArticleDetailPage.jsx"
    "AsmaulHusnaPage.jsx"
    "TafsirMaudhuiPage.jsx"
    "QuranSearchPage.jsx"
    "AboutProjectPage.jsx"
    "PrivacyPage.jsx"
    "PrayerPage.jsx"
    "JuzIndexPage.jsx"
)

echo "🎯 Adding AdSense import to pages..."
echo ""

for file in "${FILES[@]}"; do
    filepath="$PAGES_DIR/$file"
    
    if [ -f "$filepath" ]; then
        # Check if AdSenseVertical is already imported
        if grep -q "AdSenseVertical" "$filepath"; then
            echo "⏭️  $file - Already has AdSense import"
        else
            # Check if file has imports
            if grep -q "^import" "$filepath"; then
                # Find the last import line
                last_import_line=$(grep -n "^import" "$filepath" | tail -1 | cut -d: -f1)
                
                # Add AdSense import after last import
                sed -i.bak "${last_import_line}a\\
import AdSenseVertical from '../components/AdSenseVertical';
" "$filepath"
                
                echo "✅ $file - Added AdSense import"
                rm "${filepath}.bak" 2>/dev/null
            else
                echo "⚠️  $file - No imports found, skipping"
            fi
        fi
    else
        echo "❌ $file - File not found"
    fi
done

echo ""
echo "✨ Done! Import AdSenseVertical added to pages"
echo ""
echo "📝 Next steps:"
echo "   1. Manually add <AdSenseVertical /> component to each page layout"
echo "   2. Test in development: ./dev-env.sh"
echo "   3. Commit changes: git add -A && git commit -m 'feat: add AdSense to all pages'"
echo "   4. Deploy: ./deploy-production.sh"
