# Dokumentasi Fitur Tagging untuk Artikel

## Overview
Fitur tagging memungkinkan setiap artikel memiliki banyak tag, dan setiap tag dapat digunakan oleh banyak artikel (many-to-many relationship).

## Database Structure

### Tabel `tags`
```sql
- id (primary key)
- name (string, unique)
- slug (string, unique)
- description (text, nullable)
- created_at
- updated_at
```

### Tabel `article_tag` (pivot table)
```sql
- id (primary key)
- article_id (foreign key to articles)
- tag_id (foreign key to tags)
- created_at
- updated_at
- unique constraint: (article_id, tag_id)
```

## API Endpoints

### Public Endpoints (Tag)

#### 1. Get All Tags
```
GET /api/tags
```
Query Parameters:
- `search` (optional) - Search by tag name
- `all=true` (optional) - Get all tags without pagination

Response:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Ibadah",
      "slug": "ibadah",
      "description": "Artikel tentang ibadah dalam Islam",
      "articles_count": 5,
      "created_at": "2025-10-31T16:28:22.000000Z",
      "updated_at": "2025-10-31T16:28:22.000000Z"
    }
  ],
  "links": {...},
  "meta": {...}
}
```

#### 2. Get Popular Tags
```
GET /api/tags/popular?limit=10
```
Response: Array of most used tags

#### 3. Get Single Tag
```
GET /api/tags/{slug}
```
Response: Tag detail with articles count

#### 4. Get Articles by Tag
```
GET /api/tags/{slug}/articles
```
Response:
```json
{
  "tag": {
    "id": 1,
    "name": "Ibadah",
    "slug": "ibadah",
    "description": "...",
    "articles_count": 5
  },
  "articles": {
    "data": [...],
    "links": {...},
    "meta": {...}
  }
}
```

### Public Endpoints (Article with Tags)

#### 1. Get Articles (with tag filter)
```
GET /api/articles?tag=ibadah
```
Query Parameters:
- `tag` (optional) - Filter by tag slug
- `search` (optional) - Search in title, excerpt, content

#### 2. Get Single Article (includes tags)
```
GET /api/articles/{slug}
```
Response includes `tags` array:
```json
{
  "id": 1,
  "title": "...",
  "tags": [
    {
      "id": 1,
      "name": "Ibadah",
      "slug": "ibadah"
    },
    {
      "id": 2,
      "name": "Sholat",
      "slug": "sholat"
    }
  ]
}
```

### Admin Endpoints (Tag Management)

Requires: `auth` + `admin` middleware

#### 1. Get All Tags (Admin)
```
GET /api/admin/tags
```
Query Parameters:
- `search` (optional)

#### 2. Create Tag
```
POST /api/admin/tags
```
Body:
```json
{
  "name": "Puasa",
  "slug": "puasa",  // optional, auto-generated
  "description": "Artikel tentang puasa"  // optional
}
```

#### 3. Update Tag
```
PUT /api/admin/tags/{id}
```
Body: Same as create

#### 4. Delete Tag
```
DELETE /api/admin/tags/{id}
```

### Admin Endpoints (Article with Tags)

#### 1. Create Article with Tags
```
POST /api/admin/articles
```
Body:
```json
{
  "title": "Judul Artikel",
  "slug": "judul-artikel",  // optional
  "excerpt": "Ringkasan artikel",  // optional
  "content": "Konten artikel...",
  "featured_image": "path/to/image.jpg",  // optional
  "status": "published",  // or "draft"
  "published_at": "2025-10-31 10:00:00",  // optional
  "tags": ["Ibadah", "Sholat", "Motivasi"]  // array of tag names
}
```

#### 2. Update Article with Tags
```
PUT /api/admin/articles/{id}
```
Body: Same as create

**Note**: Tag array will completely replace existing tags (sync behavior)

## Model Relationships

### Article Model
```php
// Get all tags for this article
$article->tags

// Attach tags when creating
$article->tags()->attach([1, 2, 3]);

// Sync tags (replace all)
$article->tags()->sync([1, 2, 3]);

// Detach all tags
$article->tags()->detach();
```

### Tag Model
```php
// Get all articles with this tag
$tag->articles

// Get published articles count
$tag->publishedArticlesCount()
```

## Usage Examples

### Frontend: Display Article with Tags
```javascript
// Get article with tags
const article = await getWithAuth(`/api/articles/${slug}`);

// Display tags
article.tags.forEach(tag => {
  console.log(`Tag: ${tag.name} (${tag.slug})`);
});
```

### Frontend: Filter Articles by Tag
```javascript
// Get articles by tag
const articles = await getWithAuth(`/api/articles?tag=ibadah`);
```

### Frontend: Create/Update Article with Tags
```javascript
// When creating/updating article
const formData = {
  title: "Judul Artikel",
  content: "Konten...",
  status: "published",
  tags: ["Ibadah", "Sholat", "Doa"]  // Array of tag names (strings)
};

await postWithAuth('/api/admin/articles', formData);
```

### Backend: Auto-create Tags
The system automatically creates tags if they don't exist when saving an article:

```php
// In ArticleController::store() and update()
$tagIds = $this->getOrCreateTags(['Ibadah', 'Sholat', 'New Tag']);
$article->tags()->sync($tagIds);
```

## Tag Management Best Practices

1. **Tag Naming**: Use singular form (e.g., "Ibadah" not "Ibadah-Ibadah")
2. **Tag Consistency**: Before creating new tags, check if similar tags exist
3. **Tag Cleanup**: Periodically review and merge similar tags
4. **Tag Limit**: Recommend 3-5 tags per article for better organization
5. **Tag Descriptions**: Add meaningful descriptions for better UX

## Database Seeder

To seed initial tags:
```bash
php artisan db:seed --class=TagSeeder
```

This will create 15 default tags:
- Ibadah
- Akhlak
- Fiqih
- Tafsir
- Kisah Nabi
- Ramadan
- Doa
- Sejarah Islam
- Motivasi
- Keluarga
- Muamalah
- Sholat
- Zakat
- Haji & Umroh
- Puasa

## Frontend Integration Checklist

- [ ] Article list page: Show tags below each article
- [ ] Article detail page: Display article tags with links
- [ ] Tag filter: Add tag filter dropdown/chips in article list
- [ ] Tag page: Create page to show all articles by tag
- [ ] Tag cloud: Display popular tags in sidebar
- [ ] Admin article form: Add tag input (multi-select or autocomplete)
- [ ] Admin tag management: CRUD interface for tags

## Cache Considerations

When implementing caching:
- Cache popular tags list
- Cache tag-article relationships
- Invalidate cache when article tags are updated
- Consider using Redis tags for granular cache invalidation

## Future Enhancements

1. Tag hierarchy (parent-child tags)
2. Tag suggestions based on article content
3. Tag analytics (trending tags, most viewed by tag)
4. User-facing tag subscriptions
5. Tag-based content recommendations
