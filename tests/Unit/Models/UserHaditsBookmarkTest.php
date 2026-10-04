<?php

namespace Tests\Unit\Models;

use App\Models\User;
use App\Models\UserHaditsBookmark;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class UserHaditsBookmarkTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_enriched_data_with_existing_hadith(): void
    {
        $user = User::factory()->create();

        // Insert mock hadith row in hadits_shahih_al_bukhari
        DB::table('hadits_shahih_al_bukhari')->insert([
            'id' => 1,
            'no' => 1,
            'kitab' => 'Shahih Al-Bukhari',
            'kategori' => 'Kitab Permulaan Wahyu',
            'arab' => 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
            'indonesia' => 'Sesungguhnya amal perbuatan itu tergantung niatnya',
            'penjelasan' => '<p>Penjelasan niat</p>',
        ]);

        $bookmark = UserHaditsBookmark::create([
            'user_id' => $user->id,
            'kitab_slug' => 'shahih_bukhari',
            'hadits_number' => 1,
            'is_favorite' => true,
            'notes' => 'Hadits tentang niat',
        ]);

        $enriched = $bookmark->getEnrichedData();

        $this->assertEquals('hadits_shahih_bukhari_1', $enriched['id']);
        $this->assertEquals($bookmark->id, $enriched['db_id']);
        $this->assertEquals('shahih_bukhari', $enriched['kitab_slug']);
        $this->assertEquals('Shahih Bukhari', $enriched['kitab_name']);
        $this->assertEquals(1, $enriched['number']);
        $this->assertStringContainsString('الأَعْمَالُ', $enriched['arab']);
        $this->assertStringContainsString('niatnya', $enriched['indonesia']);
        $this->assertTrue($enriched['is_favorite']);
        $this->assertEquals('Hadits tentang niat', $enriched['notes']);
        $this->assertNotNull($enriched['created_at']);
    }

    public function test_get_enriched_data_with_unknown_kitab(): void
    {
        $user = User::factory()->create();

        $bookmark = UserHaditsBookmark::create([
            'user_id' => $user->id,
            'kitab_slug' => 'kitab_tidak_ada',
            'hadits_number' => 999,
            'is_favorite' => false,
        ]);

        $enriched = $bookmark->getEnrichedData();

        $this->assertEquals('hadits_kitab_tidak_ada_999', $enriched['id']);
        $this->assertEquals('', $enriched['arab']);
        $this->assertEquals('', $enriched['indonesia']);
        $this->assertFalse($enriched['is_favorite']);
    }

    public function test_user_relationship(): void
    {
        $user = User::factory()->create();
        $bookmark = UserHaditsBookmark::create([
            'user_id' => $user->id,
            'kitab_slug' => 'muslim',
            'hadits_number' => 5,
        ]);

        $this->assertInstanceOf(User::class, $bookmark->user);
        $this->assertEquals($user->id, $bookmark->user->id);
    }
}
