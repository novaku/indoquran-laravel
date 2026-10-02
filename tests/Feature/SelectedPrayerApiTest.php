<?php

namespace Tests\Feature;

use App\Models\SelectedPrayer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;
use Tests\TestCase;

class SelectedPrayerApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        /** @var JWTGuard $guard */
        $guard = auth('api');
        $this->token = $guard->tokenById($this->user->id);
        $guard->logout();

        SelectedPrayer::create([
            'title' => 'Doa Bangun Tidur',
            'category' => 'sehari-hari',
            'category_name' => 'Sehari-hari',
            'arabic' => 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا',
            'latin' => 'Alhamdulillahilladzi ahyana',
            'translation' => 'Segala puji bagi Allah yang telah menghidupkan kami',
            'order' => 1,
        ]);

        SelectedPrayer::create([
            'title' => 'Doa Mohon Ampunan',
            'category' => 'taubat',
            'category_name' => 'Taubat',
            'arabic' => 'رَبِّ اغْفِرْ لِي',
            'latin' => 'Rabbighfir lii',
            'translation' => 'Wahai Tuhanku ampunilah aku',
            'order' => 2,
        ]);
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $response = $this->getJson('/api/doa-pilihan');

        $response->assertStatus(401);
    }

    public function test_get_selected_prayers_paginated(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/doa-pilihan');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data',
                    'current_page',
                    'total',
                ],
                'message',
            ]);

        $this->assertEquals(2, $response->json('data.total'));
    }

    public function test_get_selected_prayers_all(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/doa-pilihan?all=true');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('total', 2);

        $this->assertCount(2, $response->json('data'));
    }

    public function test_get_selected_prayers_filtered_by_category(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/doa-pilihan?category=sehari-hari');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Doa Bangun Tidur', $data[0]['title']);
    }

    public function test_get_selected_prayers_searched(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/doa-pilihan?search=Ampunan');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Doa Mohon Ampunan', $data[0]['title']);
    }

    public function test_get_categories(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/doa-pilihan/categories');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $categories = $response->json('data');
        $this->assertNotEmpty($categories);

        // First item is 'all'
        $this->assertEquals('all', $categories[0]['slug']);
        $this->assertEquals(2, $categories[0]['count']);
    }

    public function test_show_selected_prayer(): void
    {
        $prayer = SelectedPrayer::first();

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson("/api/doa-pilihan/{$prayer->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', $prayer->title);
    }
}
