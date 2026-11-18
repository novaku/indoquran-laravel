<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Redis;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;
use Tests\TestCase;

class OnlineUsersApiTest extends TestCase
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

    public function test_track_online_visitor_endpoint_succeeds(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/online-users/track');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Visitor tracked')
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'online_count',
                    'visitor_id',
                ],
            ]);

        $this->assertGreaterThanOrEqual(1, $response->json('data.online_count'));
    }

    public function test_get_online_users_count_endpoint_succeeds(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/online-users/count');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'online_count',
                    'last_updated',
                ],
            ]);

        $this->assertGreaterThanOrEqual(0, $response->json('data.online_count'));
    }

    public function test_track_multiple_visitors_increments_count(): void
    {
        $response1 = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withServerVariables([
                'REMOTE_ADDR' => '192.168.1.10',
                'HTTP_USER_AGENT' => 'TestBrowser/1.0',
            ])->postJson('/api/online-users/track');

        $response1->assertStatus(200);
        $count1 = $response1->json('data.online_count');

        $response2 = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->withServerVariables([
                'REMOTE_ADDR' => '192.168.1.20',
                'HTTP_USER_AGENT' => 'TestBrowser/2.0',
            ])->postJson('/api/online-users/track');

        $response2->assertStatus(200);
        $count2 = $response2->json('data.online_count');

        $this->assertGreaterThanOrEqual($count1, $count2);
    }

    public function test_redis_failure_falls_back_gracefully_without_500(): void
    {
        Redis::shouldReceive('zadd')
            ->andThrow(new \Exception('Connection refused [tcp://127.0.0.1:6379]'));

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/online-users/track');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Visitor tracked');

        $this->assertGreaterThanOrEqual(1, $response->json('data.online_count'));
    }

    public function test_redis_failure_on_count_falls_back_gracefully_without_500(): void
    {
        Redis::shouldReceive('zremrangebyscore')
            ->andThrow(new \Exception('Redis connection down'));

        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/online-users/count');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    'online_count',
                    'last_updated',
                ],
            ]);
    }
}
