<?php

namespace Tests\Feature;

use App\Models\Prayer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;
use Tests\TestCase;

class PrayerApiTest extends TestCase
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
    }

    public function test_get_prayers_list(): void
    {
        Prayer::create([
            'user_id' => $this->user->id,
            'title' => 'Doa Keselamatan Dunia Akhirat',
            'content' => 'Ya Rabb berikan kami keselamatan',
            'category' => 'general',
            'is_anonymous' => false,
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/doa-bersama');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Doa Keselamatan Dunia Akhirat', $data[0]['title']);
    }

    public function test_store_prayer(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/doa-bersama', [
                'title' => 'Doa Mohon Kesembuhan Ibu',
                'content' => 'Mohon doanya untuk kesembuhan ibu saya yang sedang dirawat',
                'category' => 'kesehatan',
                'is_anonymous' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('prayers', [
            'title' => 'Doa Mohon Kesembuhan Ibu',
            'is_anonymous' => true,
        ]);
    }

    public function test_toggle_amin_on_prayer(): void
    {
        $prayer = Prayer::create([
            'user_id' => $this->user->id,
            'title' => 'Doa Lulus Kuliah',
            'content' => 'Bismillah semoga sidang lancar',
            'category' => 'pendidikan',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/doa-bersama/{$prayer->id}/amin");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_add_comment_to_prayer(): void
    {
        $prayer = Prayer::create([
            'user_id' => $this->user->id,
            'title' => 'Doa Rezeki',
            'content' => 'Semoga dimudahkan usaha warung',
            'category' => 'keuangan',
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/doa-bersama/{$prayer->id}/comments", [
                'content' => 'Aamiin ya Mujibad da\'awat',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('prayer_comments', [
            'prayer_id' => $prayer->id,
            'content' => 'Aamiin ya Mujibad da\'awat',
        ]);
    }
}
