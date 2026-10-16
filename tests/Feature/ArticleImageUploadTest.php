<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ArticleImageUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_upload_article_image(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['is_admin' => true]);

        $file = UploadedFile::fake()->image('test-article.jpg', 600, 400);

        $response = $this->actingAs($admin)
            ->post('/api/admin/articles/upload-image', [
                'image' => $file,
            ], [
                'Accept' => 'application/json',
                'X-Requested-With' => 'XMLHttpRequest',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'url',
                'path',
            ]);

        $path = $response->json('path');
        Storage::disk('public')->assertExists($path);
    }

    public function test_admin_upload_with_invalid_bearer_token(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['is_admin' => true]);
        $file = UploadedFile::fake()->image('test-article.jpg', 600, 400);

        $response = $this->actingAs($admin)
            ->withHeader('Authorization', 'Bearer invalid-or-expired-token')
            ->post('/api/admin/articles/upload-image', [
                'image' => $file,
            ], [
                'Accept' => 'application/json',
                'X-Requested-With' => 'XMLHttpRequest',
            ]);

        $response->assertStatus(200);
        $this->assertNotEmpty($response->json('path'));
    }

    public function test_upload_fails_when_no_image_provided(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)
            ->post('/api/admin/articles/upload-image', [], [
                'Accept' => 'application/json',
                'X-Requested-With' => 'XMLHttpRequest',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }
}
