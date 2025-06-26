# IndoQuran Laravel - Test Files

This directory contains various test scripts and utilities for testing different aspects of the IndoQuran Laravel application.

## JavaScript Tests (Frontend)

### `test-audio-implementation.js`
- **Purpose**: Tests audio player implementation
- **Features**: Audio playback, error handling, basic player functionality

### `test-audio-fix.js`
- **Purpose**: Tests audio player bug fixes and edge cases
- **Features**: Error handling, fallback mechanisms, audio source validation

### `test-share-ayah.js`
- **Purpose**: Tests ayah sharing functionality
- **Features**: URL generation, social sharing, ayah extraction

## Shell Scripts (System/Integration)

### `test-frontend-fix.sh`
- **Purpose**: Tests frontend build and deployment fixes
- **Usage**: `./test-frontend-fix.sh`
- **Features**: Build validation, asset checking, production readiness

### `test-search-logging.sh`
- **Purpose**: Tests search functionality and logging system
- **Usage**: `./test-search-logging.sh`
- **Features**: Search API testing, log validation, performance metrics

## PHP Tests (Backend)

### `test-laravel-redis.php`
- **Purpose**: Tests Laravel Redis integration
- **Usage**: `php test-laravel-redis.php`
- **Features**: Redis connection, caching, session management

### `test-redis.php`
- **Purpose**: Basic Redis functionality testing
- **Usage**: `php test-redis.php`
- **Features**: Raw Redis operations, connection validation

## Running Tests

### Prerequisites
- Laravel application running locally
- Redis server running (for Redis tests)
- Node.js/npm installed (for frontend builds)

### JavaScript Tests
```bash
# Open browser console on http://localhost:8000
# Copy and paste the test file content
# Run the main test function
```

### Shell Script Tests
```bash
cd /path/to/indoquran-laravel/tests
chmod +x test-*.sh
./test-frontend-fix.sh
./test-search-logging.sh
```

### PHP Tests
```bash
cd /path/to/indoquran-laravel/tests
php test-laravel-redis.php
php test-redis.php
```

## Test Results and Documentation

Each test provides detailed console output with:
- ✅ Success indicators
- ❌ Failure indicators  
- 📊 Performance metrics
- 🔍 Detailed debugging information

## Contributing

When adding new tests:
1. Follow the naming convention: `test-[feature-name].[extension]`
2. Include comprehensive console logging
3. Add documentation to this README
4. Ensure tests are independent and can run standalone

## Related Documentation

- `/docs/SURAH_AUDIO_PLAYER_IMPLEMENTATION.md` - Audio player testing checklist
- `/docs/SEARCH_LOGGING_IMPLEMENTATION_SUMMARY.md` - Search logging tests
- `/docs/PRODUCTION_DEPLOYMENT_FIX.md` - Production testing procedures
