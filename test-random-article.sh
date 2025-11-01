#!/bin/bash

echo "🧪 Testing Random Article Feature"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if article table exists
echo "1️⃣ Checking article table..."
ARTICLE_COUNT=$(php artisan tinker --execute="echo \App\Models\Article::count();" 2>/dev/null)
if [ "$ARTICLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $ARTICLE_COUNT articles in database${NC}"
else
    echo -e "${RED}❌ No articles found. Running seeder...${NC}"
    php artisan db:seed --class=ArticleSeeder
fi
echo ""

# Check published articles
echo "2️⃣ Checking published articles..."
PUBLISHED_COUNT=$(php artisan tinker --execute="echo \App\Models\Article::published()->count();" 2>/dev/null)
echo -e "${GREEN}✅ Found $PUBLISHED_COUNT published articles${NC}"
echo ""

# Start Laravel server in background if not running
echo "3️⃣ Starting Laravel server (if not running)..."
if ! lsof -ti:8000 > /dev/null 2>&1; then
    php artisan serve > /dev/null 2>&1 &
    SERVER_PID=$!
    sleep 3
    echo -e "${GREEN}✅ Laravel server started on port 8000 (PID: $SERVER_PID)${NC}"
else
    echo -e "${GREEN}✅ Laravel server already running on port 8000${NC}"
fi
echo ""

# Test API endpoint
echo "4️⃣ Testing /api/articles/random endpoint..."
RESPONSE=$(curl -s http://localhost:8000/api/articles/random)
STATUS=$(echo $RESPONSE | jq -r '.status' 2>/dev/null)
TITLE=$(echo $RESPONSE | jq -r '.data.title' 2>/dev/null)

if [ "$STATUS" = "success" ]; then
    echo -e "${GREEN}✅ API response successful${NC}"
    echo -e "   Article: ${GREEN}$TITLE${NC}"
else
    echo -e "${RED}❌ API failed${NC}"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
fi
echo ""

echo "5️⃣ Testing multiple random calls..."
for i in {1..3}; do
    TITLE=$(curl -s http://localhost:8000/api/articles/random | jq -r '.data.title' 2>/dev/null)
    echo "   Call $i: $TITLE"
done
echo ""

echo "=================================="
echo "✨ Random Article Feature Test Complete!"
echo ""
echo "📝 Files Modified:"
echo "   - app/Http/Controllers/ArticleController.php (added random() method)"
echo "   - routes/api.php (added /api/articles/random route)"
echo "   - resources/js/react/pages/QuranHomePage.jsx (added article section)"
echo ""
echo "🌐 To see the article on homepage:"
echo "   1. Run: npm run dev"
echo "   2. Open: http://localhost:5173"
echo "   3. Look for 'Artikel Pilihan' section"
