<?php

namespace Tests\Unit\Models;

use App\Models\Article;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TagTest extends TestCase
{
    use RefreshDatabase;

    public function test_auto_generates_slug_on_create_and_update(): void
    {
        $tag = Tag::create([
            'name' => 'Tafsir Ibnu Katsir',
            'description' => 'Kajian tafsir',
        ]);

        $this->assertEquals('tafsir-ibnu-katsir', $tag->slug);

        $tag->name = 'Tafsir Al-Azhar';
        $tag->slug = null;
        $tag->save();

        $this->assertEquals('tafsir-al-azhar', $tag->slug);
    }

    public function test_published_articles_count(): void
    {
        $user = User::factory()->create();
        $tag = Tag::create(['name' => 'Akidah']);

        $publishedArticle = Article::create([
            'title' => 'Pelajaran Akidah 1',
            'content' => 'Konten akidah',
            'author_id' => $user->id,
            'status' => 'published',
            'published_at' => now(),
        ]);

        $draftArticle = Article::create([
            'title' => 'Pelajaran Akidah 2',
            'content' => 'Draft',
            'author_id' => $user->id,
            'status' => 'draft',
        ]);

        $tag->articles()->attach([$publishedArticle->id, $draftArticle->id]);

        $this->assertEquals(2, $tag->articles()->count());
        $this->assertEquals(1, $tag->publishedArticlesCount());
    }
}
