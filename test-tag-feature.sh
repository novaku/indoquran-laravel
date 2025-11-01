#!/bin/bash

# Test Tag Feature for Articles

echo "======================================"
echo "Testing Tag Feature Implementation"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8000/api"

echo -e "${BLUE}1. Testing GET /api/tags${NC}"
echo "Getting all tags..."
curl -s "$BASE_URL/tags?all=true" | jq '.data[] | {id, name, slug, articles_count}'
echo ""

echo -e "${BLUE}2. Testing GET /api/tags/popular${NC}"
echo "Getting popular tags (top 5)..."
curl -s "$BASE_URL/tags/popular?limit=5" | jq '.[] | {name, articles_count}'
echo ""

echo -e "${BLUE}3. Testing GET /api/tags/{slug}${NC}"
echo "Getting tag 'ibadah'..."
curl -s "$BASE_URL/tags/ibadah" | jq '{id, name, slug, description, articles_count}'
echo ""

echo -e "${BLUE}4. Testing GET /api/articles (all articles with tags)${NC}"
echo "Getting articles (should include tags)..."
curl -s "$BASE_URL/articles" | jq '.data[0] | {id, title, tags}'
echo ""

echo -e "${BLUE}5. Testing GET /api/articles?tag=ibadah${NC}"
echo "Filtering articles by tag 'ibadah'..."
curl -s "$BASE_URL/articles?tag=ibadah" | jq '.data[] | {id, title, tags: (.tags | map(.name))}'
echo ""

echo ""
echo -e "${GREEN}======================================"
echo "Tag Feature Tests Completed!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo "1. Test creating article with tags (requires auth)"
echo "2. Test updating article tags (requires auth)"
echo "3. Test admin tag management endpoints"
echo "4. Integrate tags in frontend React components"
