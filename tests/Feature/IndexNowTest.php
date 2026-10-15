<?php

namespace Tests\Feature;

use App\Services\IndexNowService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class IndexNowTest extends TestCase
{
    /**
     * Test that IndexNow verification txt endpoint serves the configured key.
     */
    public function test_indexnow_key_endpoint_serves_valid_key(): void
    {
        $key = config('services.indexnow.key');
        $this->assertNotEmpty($key);

        $response = $this->get("/{$key}.txt");
        $response->assertStatus(200);
        $this->assertStringContainsString($key, $response->getContent());
    }

    /**
     * Test that IndexNow verification endpoint returns 404 for wrong key.
     */
    public function test_indexnow_key_endpoint_returns_404_for_invalid_key(): void
    {
        $response = $this->get("/invalidkey12345678.txt");
        $response->assertStatus(404);
    }

    /**
     * Test that IndexNowService priority URLs generate valid list of URLs.
     */
    public function test_indexnow_service_priority_urls(): void
    {
        $service = new IndexNowService();
        $urls = $service->getPriorityUrls('core');

        $this->assertIsArray($urls);
        $this->assertContains('https://indoquran.web.id', $urls);
        $this->assertContains('https://indoquran.web.id/surah', $urls);
        $this->assertContains('https://indoquran.web.id/hadits', $urls);
    }

    /**
     * Test artisan indexnow:submit command dry-run.
     */
    public function test_artisan_indexnow_submit_dry_run(): void
    {
        $this->artisan('indexnow:submit --scope=core --dry-run')
            ->expectsOutputToContain('DRY RUN MODE')
            ->assertExitCode(0);
    }

    /**
     * Test artisan indexnow:submit with HTTP mock.
     */
    public function test_artisan_indexnow_submit_with_mock(): void
    {
        Http::fake([
            'https://api.indexnow.org/indexnow' => Http::response('', 200),
        ]);

        $this->artisan('indexnow:submit --scope=core')
            ->expectsOutputToContain('SUCCESS')
            ->assertExitCode(0);
    }
}
