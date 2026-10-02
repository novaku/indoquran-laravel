<?php

namespace Tests\Unit\Models;

use App\Models\Article;
use App\Models\ArticleComment;
use App\Models\Tag;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleTest extends TestCase
{
    use RefreshDatabase;

    public function test_auto_generates_slug_on_create(): void
    {
        $user = User::factory()->create();

        $article = Article::create([
            'title' => 'Keutamaan Membaca Al-Quran di Bulan Ramadhan',
            'content' => 'Al-Quran adalah pedoman hidup...',
            'author_id' => $user->id,
            'status' => 'published',
            'published_at' => now(),
        ]);

        $this->assertEquals('keutamaan-membaca-al-quran-di-bulan-ramadhan', $article->slug);
    }

    public function test_reading_time_calculation(): void
    {
        $user = User::factory()->create();

        // 400 words should be 2 minutes (ceil(400/200))
        $content = str_repeat('kata ', 400);

        $article = Article::create([
            'title' => 'Artikel Panjang',
            'content' => $content,
            'author_id' => $user->id,
        ]);

        $this->assertEquals(2, $article->reading_time);
    }

    public function test_featured_image_url_accessor(): void
    {
        $user = User::factory()->create();

        $article1 = Article::create([
            'title' => 'Artikel 1',
            'content' => 'Konten',
            'author_id' => $user->id,
            'featured_image' => 'https://example.com/image.jpg',
        ]);
        $this->assertEquals('https://example.com/image.jpg', $article1->featured_image_url);

        $article2 = Article::create([
            'title' => 'Artikel 2',
            'content' => 'Konten',
            'author_id' => $user->id,
            'featured_image' => 'articles/cover.png',
        ]);
        $this->assertStringContainsString('storage/articles/cover.png', $article2->featured_image_url);

        $article3 = Article::create([
            'title' => 'Artikel 3',
            'content' => 'Konten',
            'author_id' => $user->id,
            'featured_image' => null,
        ]);
        $this->assertNull($article3->featured_image_url);
    }

    public function test_formatted_date_accessor(): void
    {
        $user = User::factory()->create();

        $article = Article::create([
            'title' => 'Artikel Bersejarah',
            'content' => 'Konten',
            'author_id' => $user->id,
            'published_at' => Carbon::create(2026, 10, 1, 10, 0, 0),
        ]);

        $this->assertEquals('1 Oktober 2026', $article->formatted_date);
    }

    public function test_published_and_draft_scopes(): void
    {
        $user = User::factory()->create();

        Article::create([
            'title' => 'Artikel Terbit',
            'content' => 'Konten',
            'author_id' => $user->id,
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        Article::create([
            'title' => 'Artikel Masa Depan',
            'content' => 'Konten',
            'author_id' => $user->id,
            'status' => 'published',
            'published_at' => now()->addDays(5),
        ]);

        Article::create([
            'title' => 'Artikel Draft',
            'content' => 'Konten',
            'author_id' => $user->id,
            'status' => 'draft',
        ]);

        $this->assertCount(1, Article::published()->get());
        $this->assertCount(1, Article::draft()->get());
    }

    public function test_relationships_and_increment_views(): void
    {
        $user = User::factory()->create();

        $article = Article::create([
            'title' => 'Artikel Dengan Relasi',
            'content' => 'Konten',
            'author_id' => $user->id,
            'views_count' => 0,
        ]);

        $tag = Tag::create(['name' => 'Tafsir']);
        $article->tags()->attach($tag->id);

        ArticleComment::create([
            'article_id' => $article->id,
            'name' => 'Ahmad',
            'content' => 'MasyaAllah artikel bagus',
        ]);

        $this->assertInstanceOf(User::class, $article->author);
        $this->assertCount(1, $article->tags);
        $this->assertCount(1, $article->comments);

        $article->incrementViews();
        $this->assertEquals(1, $article->fresh()->views_count);
    }
}
