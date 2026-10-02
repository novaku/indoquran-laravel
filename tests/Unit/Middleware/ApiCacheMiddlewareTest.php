<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\ApiCacheMiddleware;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Tests\TestCase;

class ApiCacheMiddlewareTest extends TestCase
{
    protected ApiCacheMiddleware $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new ApiCacheMiddleware();
    }

    public function test_testing_environment_disables_browser_cache(): void
    {
        $request = Request::create('/api/surah', 'GET');

        $response = $this->middleware->handle($request, function () {
            return new Response('{"data": "test"}', 200, ['Content-Type' => 'application/json']);
        });

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertStringContainsString('no-cache', $response->headers->get('Cache-Control'));
        $this->assertEquals('no-cache', $response->headers->get('Pragma'));
        $this->assertEquals('0', $response->headers->get('Expires'));
    }

    public function test_production_environment_sets_cache_headers_and_etag(): void
    {
        $this->app['env'] = 'production';

        $request = Request::create('/api/surah', 'GET');

        $content = '{"data": "production test"}';
        $response = $this->middleware->handle($request, function () use ($content) {
            return new Response($content, 200, ['Content-Type' => 'application/json']);
        }, '2h');

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertStringContainsString('public', $response->headers->get('Cache-Control'));
        $this->assertStringContainsString('max-age=7200', $response->headers->get('Cache-Control'));
        $this->assertEquals('"' . md5($content) . '"', $response->headers->get('ETag'));
        $this->assertFalse($response->headers->has('pragma'));
    }

    public function test_production_returns_304_when_etag_matches(): void
    {
        $this->app['env'] = 'production';

        $content = '{"data": "cached content"}';
        $etag = '"' . md5($content) . '"';

        $request = Request::create('/api/surah', 'GET');
        $request->headers->set('If-None-Match', $etag);

        $response = $this->middleware->handle($request, function () use ($content) {
            return new Response($content, 200, ['Content-Type' => 'application/json']);
        }, '1d');

        $this->assertEquals(304, $response->getStatusCode());
        $this->assertEquals('', $response->getContent());
        $this->assertEquals($etag, $response->headers->get('ETag'));
    }

    public function test_post_requests_are_not_cached(): void
    {
        $this->app['env'] = 'production';

        $request = Request::create('/api/surah', 'POST');

        $response = $this->middleware->handle($request, function () {
            return new Response('{"status": "created"}', 201);
        });

        $this->assertEquals(201, $response->getStatusCode());
        $this->assertFalse($response->headers->has('ETag'));
    }
}
