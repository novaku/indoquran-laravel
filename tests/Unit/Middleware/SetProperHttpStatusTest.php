<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\SetProperHttpStatus;
use App\Models\Surah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Tests\TestCase;

class SetProperHttpStatusTest extends TestCase
{
    use RefreshDatabase;

    protected SetProperHttpStatus $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new SetProperHttpStatus();
    }

    public function test_api_routes_are_bypassed(): void
    {
        $request = Request::create('/api/surah/999', 'GET');

        $response = $this->middleware->handle($request, function () {
            return new Response('API content', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_invalid_surah_number_sets_404(): void
    {
        $request = Request::create('/surah/115', 'GET');

        $response = $this->middleware->handle($request, function () {
            return new Response('Surah content', 200);
        });

        $this->assertEquals(404, $response->getStatusCode());
    }

    public function test_non_existent_surah_in_db_sets_404(): void
    {
        // Surah 10 does not exist in DB
        $request = Request::create('/surah/10', 'GET');

        $response = $this->middleware->handle($request, function () {
            return new Response('Surah content', 200);
        });

        $this->assertEquals(404, $response->getStatusCode());
    }

    public function test_existing_surah_stays_200(): void
    {
        Surah::create([
            'number' => 1,
            'name_latin' => 'Al-Fatihah',
            'name_arabic' => 'الفاتحة',
            'name_indonesian' => 'Pembukaan',
            'total_ayahs' => 7,
            'revelation_place' => 'Mekah',
            'description_long' => 'Deskripsi',
        ]);

        $request = Request::create('/surah/1', 'GET');

        $response = $this->middleware->handle($request, function () {
            return new Response('Surah content', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_invalid_juz_number_sets_404(): void
    {
        $request = Request::create('/juz/31', 'GET');

        $response = $this->middleware->handle($request, function () {
            return new Response('Juz content', 200);
        });

        $this->assertEquals(404, $response->getStatusCode());
    }

    public function test_invalid_page_number_sets_404(): void
    {
        $request = Request::create('/halaman/605', 'GET');

        $response = $this->middleware->handle($request, function () {
            return new Response('Page content', 200);
        });

        $this->assertEquals(404, $response->getStatusCode());
    }

    public function test_malicious_or_scanner_paths_set_404(): void
    {
        $request = Request::create('/wp-admin/login.php', 'GET');

        $response = $this->middleware->handle($request, function () {
            return new Response('Malicious probe', 200);
        });

        $this->assertEquals(404, $response->getStatusCode());
    }
}
