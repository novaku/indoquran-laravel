# Nominatim API CORS and 403 Error Fix

## Problem

The application was experiencing CORS policy errors and 403 Forbidden responses when trying to access the OpenStreetMap Nominatim API directly from the client-side:

```
Access to fetch at 'https://nominatim.openstreetmap.org/reverse?format=json&lat=-6.249242370629829&lon=106.78487601483026&zoom=10' from origin 'http://127.0.0.1:8000' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

To solve this issue, we implemented a backend proxy approach that:

1. Prevents CORS issues by making the request from our server instead of the client
2. Properly includes User-Agent and other required headers to comply with Nominatim's usage policy
3. Provides better error handling and request validation

### Files Modified:

1. Created a new controller:
   - `app/Http/Controllers/Api/GeocodingController.php`

2. Added a new API route:
   - Modified `routes/api.php` to add the `/api/geocode/reverse` endpoint

3. Updated the client-side utility:
   - Updated `resources/js/react/utils/geolocationUtils.js` to use our proxy API instead of directly calling Nominatim

## Benefits

- No more CORS issues
- Improved error handling
- Better compliance with Nominatim's usage policy (proper User-Agent headers)
- Reduced exposure of external API calls in client-side code
- Centralized control over external API requests

## Usage

The API can be used the same way as before, but calling our own endpoint:

```javascript
const getLocationData = async (latitude, longitude) => {
  const response = await fetch(`/api/geocode/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
  const data = await response.json();
  // ... process data
};
```
