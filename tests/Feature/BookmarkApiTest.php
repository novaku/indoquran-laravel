<?php

namespace Tests\Feature;

use App\Models\Ayah;
use App\Models\Surah;
use App\Models\User;
use App\Models\UserAyahBookmark;
use App\Models\UserHaditsBookmark;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;
use Tests\TestCase;

class BookmarkApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected string $token;
    protected Surah $surah;
    protected Ayah $ayah;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        /** @var JWTGuard $guard */
        $guard = auth('api');
        $this->token = $guard->tokenById($this->user->id);
        $guard->logout();

        $this->surah = Surah::create([
            'number' => 1,
            'name_latin' => 'Al-Fatihah',
            'name_arabic' => 'الفاتحة',
            'name_indonesian' => 'Pembukaan',
            'total_ayahs' => 7,
            'revelation_place' => 'Mekah',
            'description_long' => 'Deskripsi',
        ]);

        $this->ayah = Ayah::create([
            'surah_number' => 1,
            'ayah_number' => 1,
            'text_arabic' => 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            'text_latin' => 'Bismillaahir Rahmaanir Rahiim',
            'text_indonesian' => 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang',
            'juz' => 1,
            'page' => 1,
        ]);

        DB::table('hadits_shahih_bukhari')->insert([
            'id' => 1,
            'kitab' => 'Shahih Bukhari',
            'arab' => 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
            'terjemah' => 'Niat',
        ]);
    }

    public function test_get_bookmarks_empty(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/penanda');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data', []);
    }

    public function test_toggle_ayah_bookmark(): void
    {
        // First toggle: adds bookmark
        $response1 = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/penanda/surah/ayah/{$this->ayah->id}/toggle");

        $response1->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.is_bookmarked', true);

        $this->assertDatabaseHas('user_ayah_bookmarks', [
            'user_id' => $this->user->id,
            'ayah_id' => $this->ayah->id,
        ]);

        // Second toggle: removes bookmark
        $response2 = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/penanda/surah/ayah/{$this->ayah->id}/toggle");

        $response2->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.is_bookmarked', false);

        $this->assertDatabaseMissing('user_ayah_bookmarks', [
            'user_id' => $this->user->id,
            'ayah_id' => $this->ayah->id,
        ]);
    }

    public function test_toggle_favorite_ayah(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson("/api/penanda/surah/ayah/{$this->ayah->id}/favorite");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.is_favorite', true);

        $this->assertDatabaseHas('user_ayah_bookmarks', [
            'user_id' => $this->user->id,
            'ayah_id' => $this->ayah->id,
            'is_favorite' => true,
        ]);
    }

    public function test_hadits_bookmark_toggle_and_list(): void
    {
        // Toggle hadits bookmark
        $response = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->postJson('/api/penanda/hadits/shahih_bukhari/1/toggle');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        // Check list
        $listResponse = $this->withHeader('Authorization', 'Bearer ' . $this->token)
            ->getJson('/api/penanda/hadits');

        $listResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }
}
