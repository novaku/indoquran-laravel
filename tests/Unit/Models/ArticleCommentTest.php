<?php

namespace Tests\Unit\Models;

use App\Models\Article;
use App\Models\ArticleComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleCommentTest extends TestCase
{
    use RefreshDatabase;

    public function test_author_name_when_anonymous(): void
    {
        $comment = new ArticleComment([
            'is_anonymous' => true,
            'name' => 'Budi',
        ]);

        $this->assertEquals('Hamba Allah', $comment->author_name);
    }

    public function test_author_name_from_user(): void
    {
        $user = User::factory()->create(['name' => 'Ustadz Abdullah']);

        $comment = new ArticleComment([
            'user_id' => $user->id,
            'is_anonymous' => false,
        ]);
        $comment->setRelation('user', $user);

        $this->assertEquals('Ustadz Abdullah', $comment->author_name);
    }

    public function test_author_name_from_guest_input_name(): void
    {
        $comment = new ArticleComment([
            'name' => 'Siti Nurhaliza',
            'is_anonymous' => false,
            'user_id' => null,
        ]);

        $this->assertEquals('Siti Nurhaliza', $comment->author_name);
    }

    public function test_author_name_fallback_to_hamba_allah(): void
    {
        $comment = new ArticleComment([
            'name' => '   ',
            'is_anonymous' => false,
            'user_id' => null,
        ]);

        $this->assertEquals('Hamba Allah', $comment->author_name);
    }

    public function test_relationships_and_time_ago(): void
    {
        $user = User::factory()->create();
        $article = Article::create([
            'title' => 'Judul Artikel',
            'content' => 'Konten',
            'author_id' => $user->id,
        ]);

        $comment = ArticleComment::create([
            'article_id' => $article->id,
            'user_id' => $user->id,
            'content' => 'Komentar bermanfaat',
            'is_anonymous' => false,
        ]);

        $this->assertInstanceOf(Article::class, $comment->article);
        $this->assertInstanceOf(User::class, $comment->user);
        $this->assertNotEmpty($comment->time_ago);
    }
}
