<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Tag $tag;
    protected Article $article;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->tag = Tag::create([
            'name' => 'Tafsir',
            'slug' => 'tafsir',
            'description' => 'Artikel tafsir Al-Quran',
        ]);

        $this->article = Article::create([
            'title' => 'Tafsir Surat Al-Fatihah',
            'slug' => 'tafsir-surat-al-fatihah',
            'content' => 'Konten tafsir Al-Fatihah lengkap',
            'author_id' => $this->user->id,
            'status' => 'published',
            'published_at' => now(),
        ]);

        $this->article->tags()->attach($this->tag->id);
    }

    public function test_get_tags_publicly_without_authentication(): void
    {
        $response = $this->getJson('/api/tags');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data',
                'total',
            ]);
    }

    public function test_get_tags_with_all_query_returns_array(): void
    {
        $response = $this->getJson('/api/tags?all=true');

        $response->assertStatus(200)
            ->assertJsonIsArray()
            ->assertJsonFragment([
                'name' => 'Tafsir',
                'slug' => 'tafsir',
            ]);
    }

    public function test_get_popular_tags_publicly(): void
    {
        $response = $this->getJson('/api/tags/popular');

        $response->assertStatus(200)
            ->assertJsonIsArray();
    }

    public function test_get_tag_by_slug_publicly(): void
    {
        $response = $this->getJson("/api/tags/{$this->tag->slug}");

        $response->assertStatus(200)
            ->assertJsonPath('name', 'Tafsir')
            ->assertJsonPath('slug', 'tafsir');
    }

    public function test_get_articles_by_tag_publicly(): void
    {
        $response = $this->getJson("/api/tags/{$this->tag->slug}/articles");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'tag',
                'articles',
            ]);
    }

    public function test_get_articles_publicly(): void
    {
        $response = $this->getJson('/api/articles');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'current_page',
                'data',
                'total',
            ]);
    }

    public function test_get_article_by_slug_publicly(): void
    {
        $response = $this->getJson("/api/articles/{$this->article->slug}");

        $response->assertStatus(200)
            ->assertJsonPath('title', 'Tafsir Surat Al-Fatihah')
            ->assertJsonPath('slug', 'tafsir-surat-al-fatihah');
    }
}
