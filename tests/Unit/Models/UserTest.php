<?php

namespace Tests\Unit\Models;

use App\Models\Ayah;
use App\Models\Prayer;
use App\Models\Surah;
use App\Models\User;
use App\Models\UserAyahBookmark;
use App\Models\UserHaditsBookmark;
use App\Models\UserReadingProgress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_admin(): void
    {
        $regularUser = User::factory()->create(['is_admin' => false]);
        $this->assertFalse($regularUser->isAdmin());

        $adminUser = User::factory()->create(['is_admin' => true]);
        $this->assertTrue($adminUser->isAdmin());
    }

    public function test_jwt_identifier_and_custom_claims(): void
    {
        $user = User::factory()->create([
            'name' => 'Fulan bin Fulan',
            'email' => 'fulan@example.com',
            'is_admin' => true,
        ]);

        $this->assertEquals($user->id, $user->getJWTIdentifier());

        $claims = $user->getJWTCustomClaims();
        $this->assertTrue($claims['is_admin']);
        $this->assertEquals('Fulan bin Fulan', $claims['name']);
        $this->assertEquals('fulan@example.com', $claims['email']);
    }

    public function test_relationships_and_bookmarks(): void
    {
        $user = User::factory()->create();

        $surah = Surah::create([
            'number' => 1,
            'name_latin' => 'Al-Fatihah',
            'name_arabic' => 'الفاتحة',
            'name_indonesian' => 'Pembukaan',
            'total_ayahs' => 7,
            'revelation_place' => 'Mekah',
            'description_long' => 'Deskripsi panjang Al-Fatihah',
        ]);

        $ayah1 = Ayah::create([
            'surah_number' => 1,
            'ayah_number' => 1,
            'text_arabic' => 'بِسْمِ اللَّهِ',
            'text_latin' => 'Bismillah',
            'text_indonesian' => 'Dengan nama Allah',
            'juz' => 1,
            'page' => 1,
        ]);

        $ayah2 = Ayah::create([
            'surah_number' => 1,
            'ayah_number' => 2,
            'text_arabic' => 'الْحَمْدُ لِلَّهِ',
            'text_latin' => 'Alhamdulillah',
            'text_indonesian' => 'Segala puji bagi Allah',
            'juz' => 1,
            'page' => 1,
        ]);

        UserAyahBookmark::create([
            'user_id' => $user->id,
            'ayah_id' => $ayah1->id,
            'is_favorite' => true,
        ]);

        UserAyahBookmark::create([
            'user_id' => $user->id,
            'ayah_id' => $ayah2->id,
            'is_favorite' => false,
        ]);

        UserHaditsBookmark::create([
            'user_id' => $user->id,
            'kitab_slug' => 'bukhari',
            'hadits_number' => 1,
            'is_favorite' => true,
        ]);

        Prayer::create([
            'user_id' => $user->id,
            'title' => 'Doa Keselamatan',
            'content' => 'Ya Allah berikan keselamatan',
            'category' => 'general',
            'is_anonymous' => false,
        ]);

        UserReadingProgress::create([
            'user_id' => $user->id,
            'surah_number' => 1,
            'ayah_number' => 1,
            'page' => 1,
            'juz' => 1,
            'last_read_at' => now(),
        ]);

        $this->assertCount(2, $user->ayahBookmarks);
        $this->assertCount(1, $user->haditsBookmarks);
        $this->assertCount(1, $user->favoriteAyahs);
        $this->assertCount(2, $user->bookmarkedAyahs);
        $this->assertCount(1, $user->prayers);
        $this->assertInstanceOf(UserReadingProgress::class, $user->readingProgress);
    }
}
