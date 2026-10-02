<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\StaticApiKeyMiddleware;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Tests\TestCase;

class StaticApiKeyMiddlewareTest extends TestCase
{
    protected StaticApiKeyMiddleware $middleware;
    protected string $validKey = 'test-secret-api-key-12345';

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.article_api.key' => $this->validKey]);
        $this->middleware = new StaticApiKeyMiddleware();
    }

    public function test_missing_api_key_returns_401(): void
    {
        $request = Request::create('/api/articles/create', 'POST');

        $response = $this->middleware->handle($request, function () {
            return new Response('ok');
        });

        $this->assertEquals(401, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertEquals('error', $data['status']);
    }

    public function test_invalid_api_key_returns_401(): void
    {
        $request = Request::create('/api/articles/create', 'POST');
        $request->headers->set('X-API-Key', 'wrong-key');

        $response = $this->middleware->handle($request, function () {
            return new Response('ok');
        });

        $this->assertEquals(401, $response->getStatusCode());
    }

    public function test_valid_api_key_in_header_passes(): void
    {
        $request = Request::create('/api/articles/create', 'POST');
        $request->headers->set('X-API-Key', $this->validKey);

        $response = $this->middleware->handle($request, function () {
            return new Response('success', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('success', $response->getContent());
    }

    public function test_valid_api_key_in_query_param_passes(): void
    {
        $request = Request::create('/api/articles/create?api_key=' . $this->validKey, 'GET');

        $response = $this->middleware->handle($request, function () {
            return new Response('success', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_valid_api_key_in_bearer_token_passes(): void
    {
        $request = Request::create('/api/articles/create', 'POST');
        $request->headers->set('Authorization', 'Bearer ' . $this->validKey);

        $response = $this->middleware->handle($request, function () {
            return new Response('success', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }
}
