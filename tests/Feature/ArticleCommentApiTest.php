<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\ArticleComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;
use Tests\TestCase;

class ArticleCommentApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Article $article;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->article = Article::create([
            'title' => 'Keutamaan Membaca Al-Quran',
            'slug' => 'keutamaan-membaca-al-quran',
            'content' => 'Konten artikel tentang keutamaan Al-Quran',
            'author_id' => $this->user->id,
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    public function test_get_comments_empty(): void
    {
        $response = $this->getJson("/api/articles/{$this->article->slug}/comments");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('count', 0)
            ->assertJsonPath('data', []);
    }

    public function test_store_comment_as_guest_with_name(): void
    {
        $response = $this->postJson("/api/articles/{$this->article->slug}/comments", [
            'content' => 'Tulisan yang sangat bermanfaat, terima kasih.',
            'name' => 'Ahmad Fauzi',
            'email' => 'ahmad@example.com',
            'is_anonymous' => false,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.author_name', 'Ahmad Fauzi')
            ->assertJsonPath('data.is_anonymous', false);

        $this->assertDatabaseHas('article_comments', [
            'article_id' => $this->article->id,
            'name' => 'Ahmad Fauzi',
        ]);
    }

    public function test_store_comment_as_anonymous(): void
    {
        $response = $this->postJson("/api/articles/{$this->article->slug}/comments", [
            'content' => 'MasyaAllah barakallahu fiik.',
            'is_anonymous' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.author_name', 'Hamba Allah')
            ->assertJsonPath('data.is_anonymous', true);
    }

    public function test_store_comment_as_authenticated_user(): void
    {
        $member = User::factory()->create(['name' => 'Zaid bin Tsabit']);
        /** @var JWTGuard $guard */
        $guard = auth('api');
        $token = $guard->tokenById($member->id);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/articles/{$this->article->slug}/comments", [
                'content' => 'Komentar dari member terdaftar.',
                'is_anonymous' => false,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.author_name', 'Zaid bin Tsabit')
            ->assertJsonPath('data.user_id', $member->id);
    }

    public function test_store_comment_validation_failure(): void
    {
        $response = $this->postJson("/api/articles/{$this->article->slug}/comments", [
            'content' => 'a', // too short, min is 2
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    public function test_admin_delete_comment(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        $comment = ArticleComment::create([
            'article_id' => $this->article->id,
            'name' => 'Spammer',
            'content' => 'Komentar spam',
        ]);

        $response = $this->actingAs($admin)
            ->deleteJson("/api/admin/article-comments/{$comment->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('article_comments', ['id' => $comment->id]);
    }
}
