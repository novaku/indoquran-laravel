#!/bin/bash

# Test script untuk memverifikasi TinyMCE loading
# Usage: ./test-tinymce.sh

echo "🧪 Testing TinyMCE Implementation..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if TinyMCE CDN script exists in blade template
echo "1️⃣  Checking TinyMCE CDN script in react.blade.php..."
if grep -q "cdn.tiny.cloud" resources/views/react.blade.php; then
    echo -e "${GREEN}✅ TinyMCE CDN script found${NC}"
else
    echo -e "${RED}❌ TinyMCE CDN script NOT found${NC}"
    exit 1
fi

# 2. Check if DNS prefetch exists
echo "2️⃣  Checking DNS prefetch for TinyMCE CDN..."
if grep -q "dns-prefetch.*cdn.tiny.cloud" resources/views/react.blade.php; then
    echo -e "${GREEN}✅ DNS prefetch configured${NC}"
else
    echo -e "${YELLOW}⚠️  DNS prefetch not found (not critical)${NC}"
fi

# 3. Check if TinyMCE verification script exists
echo "3️⃣  Checking TinyMCE verification script..."
if grep -q "TINYMCE_READY" resources/views/react.blade.php; then
    echo -e "${GREEN}✅ TinyMCE verification script found${NC}"
else
    echo -e "${RED}❌ TinyMCE verification script NOT found${NC}"
    exit 1
fi

# 4. Check if TinyMCEEditor component exists
echo "4️⃣  Checking TinyMCEEditor component..."
if [ -f "resources/js/react/components/TinyMCEEditor.jsx" ]; then
    echo -e "${GREEN}✅ TinyMCEEditor component exists${NC}"
else
    echo -e "${RED}❌ TinyMCEEditor component NOT found${NC}"
    exit 1
fi

# 5. Check if component has loading state
echo "5️⃣  Checking TinyMCEEditor loading state..."
if grep -q "isLoading" resources/js/react/components/TinyMCEEditor.jsx; then
    echo -e "${GREEN}✅ Loading state implemented${NC}"
else
    echo -e "${RED}❌ Loading state NOT implemented${NC}"
    exit 1
fi

# 6. Check if component has error handling
echo "6️⃣  Checking TinyMCEEditor error handling..."
if grep -q "loadError" resources/js/react/components/TinyMCEEditor.jsx; then
    echo -e "${GREEN}✅ Error handling implemented${NC}"
else
    echo -e "${RED}❌ Error handling NOT implemented${NC}"
    exit 1
fi

# 7. Check if vendor-tinymce chunk exists in build
echo "7️⃣  Checking vendor-tinymce chunk in build..."
if ls public/build/assets/vendor-tinymce-*.js 1> /dev/null 2>&1; then
    TINYMCE_FILE=$(ls public/build/assets/vendor-tinymce-*.js | head -n 1)
    SIZE=$(du -h "$TINYMCE_FILE" | cut -f1)
    echo -e "${GREEN}✅ vendor-tinymce chunk found: $SIZE${NC}"
else
    echo -e "${RED}❌ vendor-tinymce chunk NOT found${NC}"
    echo -e "${YELLOW}   Run 'npm run build' to create build assets${NC}"
fi

# 8. Check if AdminArticleEditorPage uses TinyMCEEditor
echo "8️⃣  Checking AdminArticleEditorPage integration..."
if grep -q "TinyMCEEditor" resources/js/react/pages/AdminArticleEditorPage.jsx; then
    echo -e "${GREEN}✅ TinyMCEEditor imported in AdminArticleEditorPage${NC}"
else
    echo -e "${RED}❌ TinyMCEEditor NOT imported${NC}"
    exit 1
fi

# 9. Check API key configuration
echo "9️⃣  Checking TinyMCE API key configuration..."
if grep -q "apiKey:" resources/js/react/config/tinymce.config.js; then
    API_KEY=$(grep "apiKey:" resources/js/react/config/tinymce.config.js | cut -d "'" -f 2)
    if [ -n "$API_KEY" ] && [ "$API_KEY" != "no-api-key" ]; then
        echo -e "${GREEN}✅ API key configured: ${API_KEY:0:20}...${NC}"
    else
        echo -e "${YELLOW}⚠️  API key not set or using self-hosted mode${NC}"
    fi
else
    echo -e "${RED}❌ API key configuration NOT found${NC}"
    exit 1
fi

# 10. Check Vite configuration for TinyMCE chunk
echo "🔟 Checking Vite configuration..."
if grep -q "vendor-tinymce" vite.config.js; then
    echo -e "${GREEN}✅ TinyMCE manual chunk configured in Vite${NC}"
else
    echo -e "${YELLOW}⚠️  TinyMCE manual chunk not found in Vite config${NC}"
fi

echo ""
echo -e "${GREEN}✅ All TinyMCE checks passed!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Start dev server: ./dev-env.sh (option 1)"
echo "2. Open browser: http://localhost:8000"
echo "3. Login as admin"
echo "4. Go to: http://localhost:8000/admin/artikel/edit/9"
echo "5. Check browser console for TinyMCE loading messages"
echo ""
echo "Expected console messages:"
echo "  ✅ TinyMCE loaded successfully from CDN"
echo "  ✅ TinyMCE ready for React component"
echo "  ✅ TinyMCE Editor initialized"
echo ""
echo "🚀 For production deployment:"
echo "   Run: ./deploy-production.sh (on production server)"
echo ""
