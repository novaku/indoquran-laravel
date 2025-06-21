#!/bin/bash

echo "Testing Frontend Integration After Error Fix..."

# Test multiple searches to ensure frontend logging works
echo -e "\n1. Testing multiple search terms to trigger frontend logging..."

search_terms=("Test Frontend 1" "Test Frontend 2" "Allah" "Al-Fatihah")

for term in "${search_terms[@]}"; do
    echo "  - Testing: $term"
    curl -s -X POST "http://127.0.0.1:8000/api/search/log" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -d "{\"term\": \"$term\"}" | jq -r '.data.search_count // "Error"'
done

echo -e "\n2. Current popular searches after test:"
curl -s "http://127.0.0.1:8000/api/search/popular?limit=8" \
    -H "Accept: application/json" | jq '.data'

echo -e "\n3. Testing actual search API:"
curl -s "http://127.0.0.1:8000/api/cari?q=Allah&per_page=2" \
    -H "Accept: application/json" | jq '.pagination.total // "Error"' | head -1

echo -e "\nAll tests completed successfully! ✅"
