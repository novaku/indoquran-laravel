<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ArticleAutoClearCacheTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_published_article_automatically_clears_cache(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        // Pre-populate caches with fake old data
        Cache::put('seo_articles_list_home', ['old_article_1'], 600);
        Cache::put('article_api_random_single', ['old_random'], 600);
        Cache::put('popular_tags_count_20', ['old_tags'], 600);

        $response = $this->actingAs($admin)->postJson('/api/admin/articles', [
            'title' => 'Artikel Mukjizat Al-Quran Terbaru',
            'content' => '<p>Konten artikel penting baru terbit.</p>',
            'status' => 'published',
        ]);

        $response->assertStatus(201);

        // Verify caches were invalidated
        $this->assertFalse(Cache::has('seo_articles_list_home'));
        $this->assertFalse(Cache::has('article_api_random_single'));
        $this->assertFalse(Cache::has('popular_tags_count_20'));
    }

    public function test_updating_draft_to_published_automatically_clears_cache(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        $article = Article::create([
            'title' => 'Artikel Menunggu Terbit',
            'slug' => 'artikel-menunggu-terbit',
            'content' => '<p>Draf konten.</p>',
            'author_id' => $admin->id,
            'status' => 'draft',
        ]);

        // Populate list cache
        Cache::put('seo_articles_list_home', ['old_list'], 600);

        $response = $this->actingAs($admin)->putJson("/api/admin/articles/{$article->id}", [
            'title' => 'Artikel Menunggu Terbit',
            'content' => '<p>Draf konten sekarang sudah dipublish.</p>',
            'status' => 'published',
        ]);

        $response->assertStatus(200);

        // Verify cache was cleared
        $this->assertFalse(Cache::has('seo_articles_list_home'));
    }

    public function test_updating_published_article_clears_cache(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        $article = Article::create([
            'title' => 'Artikel Sudah Terbit Lama',
            'slug' => 'artikel-sudah-terbit-lama',
            'content' => '<p>Konten lama.</p>',
            'author_id' => $admin->id,
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        Cache::put('seo_articles_list_home', ['old_list'], 600);
        Cache::put("seo_article_model_{$article->slug}", ['cached_article'], 3600);

        $response = $this->actingAs($admin)->putJson("/api/admin/articles/{$article->id}", [
            'title' => 'Artikel Sudah Terbit Lama (Revisi)',
            'content' => '<p>Konten revisi.</p>',
            'status' => 'published',
        ]);

        $response->assertStatus(200);

        // Verify cache was cleared
        $this->assertFalse(Cache::has('seo_articles_list_home'));
        $this->assertFalse(Cache::has("seo_article_model_artikel-sudah-terbit-lama"));
    }

    public function test_deleting_published_article_clears_cache(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        $article = Article::create([
            'title' => 'Artikel Akan Dihapus',
            'slug' => 'artikel-akan-dihapus',
            'content' => '<p>Konten akan dihapus.</p>',
            'author_id' => $admin->id,
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        Cache::put('seo_articles_list_home', ['cached_list'], 600);

        $response = $this->actingAs($admin)->deleteJson("/api/admin/articles/{$article->id}");

        $response->assertStatus(200);
        $this->assertFalse(Cache::has('seo_articles_list_home'));
    }

    public function test_minor_clock_skew_published_at_is_adjusted_to_now(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        // Simulated date 2 minutes in the future (typical clock skew or browser offset)
        $futureSkewDate = now()->addMinutes(2)->format('Y-m-d H:i:s');

        $response = $this->actingAs($admin)->postJson('/api/admin/articles', [
            'title' => 'Artikel Jam Skew',
            'content' => '<p>Konten artikel dengan waktu jam sedikit di masa depan.</p>',
            'status' => 'published',
            'published_at' => $futureSkewDate,
        ]);

        $response->assertStatus(201);

        $article = Article::where('title', 'Artikel Jam Skew')->first();
        $this->assertNotNull($article);
        // published_at should have been normalized so it is immediately visible in published scope
        $this->assertTrue($article->published_at <= now());
        $this->assertTrue(Article::published()->where('id', $article->id)->exists());
    }

    public function test_admin_can_manually_clear_article_cache(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        Cache::put('seo_articles_list_home', ['cached_list'], 600);

        $response = $this->actingAs($admin)->postJson('/api/admin/articles/clear-cache');

        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);

        $this->assertFalse(Cache::has('seo_articles_list_home'));
    }
}

