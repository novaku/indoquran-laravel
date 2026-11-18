<?php

namespace Tests\Feature;

use App\Helpers\SafeCache;
use App\Models\User;
use App\Services\AdminDashboardCacheService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AdminDashboardResilienceTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create([
            'is_admin' => true,
        ]);
    }

    public function test_safe_cache_returns_callback_result_on_oom_exception(): void
    {
        Cache::shouldReceive('remember')
            ->once()
            ->andThrow(new \Exception("OOM command not allowed when used memory > 'maxmemory'."));

        $result = SafeCache::remember('test_oom_key', 300, function () {
            return 'direct_result_without_crash';
        });

        $this->assertEquals('direct_result_without_crash', $result);
    }

    public function test_safe_cache_get_and_put_do_not_throw_on_oom_exception(): void
    {
        Cache::shouldReceive('get')
            ->once()
            ->andThrow(new \Exception("OOM command not allowed when used memory > 'maxmemory'."));

        $val = SafeCache::get('test_key', 'fallback_default');
        $this->assertEquals('fallback_default', $val);

        Cache::shouldReceive('put')
            ->once()
            ->andThrow(new \Exception("OOM command not allowed when used memory > 'maxmemory'."));

        $success = SafeCache::put('test_key', 'value', 300);
        $this->assertFalse($success);
    }

    public function test_admin_dashboard_service_survives_redis_oom(): void
    {
        Cache::shouldReceive('has')->andReturn(false);
        Cache::shouldReceive('get')->andReturn(null);
        Cache::shouldReceive('put')
            ->andThrow(new \Exception("OOM command not allowed when used memory > 'maxmemory'."));
        Cache::shouldReceive('remember')
            ->andThrow(new \Exception("OOM command not allowed when used memory > 'maxmemory'."));

        $service = app(AdminDashboardCacheService::class);
        $data = $service->getDashboardData();

        $this->assertIsArray($data);
        $this->assertArrayHasKey('stats', $data);
        $this->assertArrayHasKey('total_ayahs', $data['stats']);
        $this->assertEquals(6236, $data['stats']['total_ayahs']);
    }

    public function test_admin_dashboard_endpoint_returns_200_even_with_cache_oom(): void
    {
        Cache::shouldReceive('has')->andReturn(false);
        Cache::shouldReceive('get')->andReturn(null);
        Cache::shouldReceive('put')
            ->andThrow(new \Exception("OOM command not allowed when used memory > 'maxmemory'."));
        Cache::shouldReceive('remember')
            ->andThrow(new \Exception("OOM command not allowed when used memory > 'maxmemory'."));

        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => [
                    'total_users',
                    'total_ayahs',
                    'total_surahs',
                ],
                'recent_activities',
                'traffic_data',
            ]);

        $this->assertEquals(6236, $response->json('stats.total_ayahs'));
    }
}
