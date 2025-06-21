#!/bin/bash

# Test script untuk search logging functionality
echo "Testing Search Logging Functionality..."

# Base URL
BASE_URL="http://127.0.0.1:8000/api"

echo -e "\n1. Testing search logging dengan beberapa terms..."

# Test multiple search terms
search_terms=("Allah" "Al-Fatihah" "Ya-Sin" "Ar-Rahman" "Allah" "Al-Fatihah" "Doa" "Rezeki")

for term in "${search_terms[@]}"; do
    echo "  - Logging search term: $term"
    curl -s -X POST "$BASE_URL/search/log" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -d "{\"term\": \"$term\"}" | jq '.data.search_count' 2>/dev/null || echo "Error"
done

echo -e "\n2. Getting popular searches..."
curl -s "$BASE_URL/search/popular?limit=8" \
    -H "Accept: application/json" | jq '.data' 2>/dev/null || echo "Error fetching popular searches"

echo -e "\n3. Testing search API with one of the popular terms..."
curl -s "$BASE_URL/cari?q=Allah&per_page=3" \
    -H "Accept: application/json" | jq '.pagination.total' 2>/dev/null || echo "Error fetching search results"

echo -e "\nTest completed!"
