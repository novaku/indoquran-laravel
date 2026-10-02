<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\AdminMiddleware;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class AdminMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected AdminMiddleware $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new AdminMiddleware();
    }

    public function test_unauthenticated_user_gets_401(): void
    {
        $request = Request::create('/api/admin/dashboard', 'GET');

        $response = $this->middleware->handle($request, function () {
            return new Response('ok');
        });

        $this->assertEquals(401, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertEquals('Unauthenticated', $data['message']);
    }

    public function test_non_admin_user_gets_403(): void
    {
        $user = User::factory()->create(['is_admin' => false]);
        Auth::login($user);

        $request = Request::create('/api/admin/dashboard', 'GET');

        $response = $this->middleware->handle($request, function () {
            return new Response('ok');
        });

        $this->assertEquals(403, $response->getStatusCode());
        $data = json_decode($response->getContent(), true);
        $this->assertEquals('Unauthorized. Admin access required.', $data['message']);
    }

    public function test_admin_user_passes(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        Auth::login($admin);

        $request = Request::create('/api/admin/dashboard', 'GET');

        $response = $this->middleware->handle($request, function () {
            return new Response('admin content', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertEquals('admin content', $response->getContent());
    }
}
