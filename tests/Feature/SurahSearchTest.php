<?php

namespace Tests\Feature;

use App\Models\Surah;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;
use Tests\TestCase;

class SurahSearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed sample surahs
        Surah::create([
            'number' => 1,
            'total_ayahs' => 7,
            'name_indonesian' => 'Pembukaan',
            'name_arabic' => 'الفاتحة',
            'name_latin' => 'Al-Fatihah',
            'revelation_place' => 'makkah',
            'description_short' => 'Pembukaan',
            'description_long' => 'Pembukaan'
        ]);

        Surah::create([
            'number' => 2,
            'total_ayahs' => 286,
            'name_indonesian' => 'Sapi Betina',
            'name_arabic' => 'البقرة',
            'name_latin' => 'Al-Baqarah',
            'revelation_place' => 'madinah',
            'description_short' => 'Sapi Betina',
            'description_long' => 'Sapi Betina'
        ]);

        Surah::create([
            'number' => 5,
            'total_ayahs' => 120,
            'name_indonesian' => 'Jamuan (Hidangan Makanan)',
            'name_arabic' => 'المائدة',
            'name_latin' => "Al-Ma'idah",
            'revelation_place' => 'madinah',
            'description_short' => 'Jamuan',
            'description_long' => 'Jamuan'
        ]);

        Surah::create([
            'number' => 18,
            'total_ayahs' => 110,
            'name_indonesian' => 'Para Penghuni Gua',
            'name_arabic' => 'الكهف',
            'name_latin' => 'Al-Kahf',
            'revelation_place' => 'makkah',
            'description_short' => 'Penghuni Gua',
            'description_long' => 'Penghuni Gua'
        ]);

        Surah::create([
            'number' => 36,
            'total_ayahs' => 83,
            'name_indonesian' => 'Yas Sin',
            'name_arabic' => 'يس',
            'name_latin' => 'Ya-Sin',
            'revelation_place' => 'makkah',
            'description_short' => 'Ya-Sin',
            'description_long' => 'Ya-Sin'
        ]);
    }

    private function getAuthToken(): string
    {
        /** @var User $user */
        $user = User::factory()->create();
        /** @var JWTGuard $guard */
        $guard = auth('api');
        return $guard->login($user);
    }

    public function test_search_finds_maidah_without_prefix_or_apostrophe(): void
    {
        $token = $this->getAuthToken();
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/cari?q=maidah');

        $response->assertOk();
        $response->assertJsonPath('surah_matches.0.number', 5);
        $response->assertJsonPath('surah_matches.0.name_latin', "Al-Ma'idah");
    }

    public function test_search_finds_maidah_with_full_latin_name(): void
    {
        $token = $this->getAuthToken();
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/cari?q=al-maidah');

        $response->assertOk();
        $response->assertJsonPath('surah_matches.0.number', 5);
    }

    public function test_search_finds_surah_by_number(): void
    {
        $token = $this->getAuthToken();
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/cari?q=5');

        $response->assertOk();
        $response->assertJsonPath('surah_matches.0.number', 5);
        $response->assertJsonPath('surah_matches.0.name_latin', "Al-Ma'idah");
    }

    public function test_search_finds_surah_by_indonesian_meaning(): void
    {
        $token = $this->getAuthToken();
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/cari?q=hidangan');

        $response->assertOk();
        $response->assertJsonPath('surah_matches.0.number', 5);
    }

    public function test_search_finds_surah_with_spelling_variation_yasiin(): void
    {
        $token = $this->getAuthToken();
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/cari?q=yasiin');

        $response->assertOk();
        $response->assertJsonPath('surah_matches.0.number', 36);
        $response->assertJsonPath('surah_matches.0.name_latin', 'Ya-Sin');
    }

    public function test_search_finds_surah_kahfi_variant(): void
    {
        $token = $this->getAuthToken();
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/cari?q=kahfi');

        $response->assertOk();
        $response->assertJsonPath('surah_matches.0.number', 18);
        $response->assertJsonPath('surah_matches.0.name_latin', 'Al-Kahf');
    }

    public function test_search_finds_surah_with_typo_maydah(): void
    {
        $token = $this->getAuthToken();
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/cari?q=maydah');

        $response->assertOk();
        $response->assertJsonPath('surah_matches.0.number', 5);
    }
}
