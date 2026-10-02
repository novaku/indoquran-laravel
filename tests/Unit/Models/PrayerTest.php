<?php

namespace Tests\Unit\Models;

use App\Models\Prayer;
use App\Models\PrayerAmin;
use App\Models\PrayerComment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrayerTest extends TestCase
{
    use RefreshDatabase;

    public function test_author_name_when_anonymous(): void
    {
        $user = User::factory()->create(['name' => 'Fulan']);
        $prayer = new Prayer([
            'is_anonymous' => true,
            'user_id' => $user->id,
        ]);
        $prayer->setRelation('user', $user);

        $this->assertEquals('Hamba Allah', $prayer->author_name);
    }

    public function test_author_name_when_not_anonymous(): void
    {
        $user = User::factory()->create(['name' => 'Siti Khadijah']);
        $prayer = new Prayer([
            'is_anonymous' => false,
            'user_id' => $user->id,
        ]);
        $prayer->setRelation('user', $user);

        $this->assertEquals('Siti Khadijah', $prayer->author_name);
    }

    public function test_has_amin_from_user(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $prayer = Prayer::create([
            'user_id' => $user1->id,
            'title' => 'Doa Ujian',
            'content' => 'Semoga dimudahkan ujian CPNS',
            'category' => 'study',
        ]);

        PrayerAmin::create([
            'prayer_id' => $prayer->id,
            'user_id' => $user2->id,
        ]);

        $this->assertTrue($prayer->hasAminFromUser($user2->id));
        $this->assertFalse($prayer->hasAminFromUser($user1->id));
    }

    public function test_has_amin_from_guest(): void
    {
        $user = User::factory()->create();
        $prayer = Prayer::create([
            'user_id' => $user->id,
            'title' => 'Doa Kesembuhan',
            'content' => 'Doakan orang tua cepat sembuh',
            'category' => 'health',
        ]);

        PrayerAmin::create([
            'prayer_id' => $prayer->id,
            'user_id' => null,
            'visitor_id' => 'guest-uuid-123',
            'ip_address' => '192.168.1.10',
        ]);

        $this->assertTrue($prayer->hasAminFromGuest('guest-uuid-123', '192.168.1.10'));
        $this->assertTrue($prayer->hasAminFromGuest(null, '192.168.1.10'));
        $this->assertFalse($prayer->hasAminFromGuest('unknown-guest', '10.0.0.1'));
    }

    public function test_scopes_and_relationships(): void
    {
        $user = User::factory()->create();

        $featuredPrayer = Prayer::create([
            'user_id' => $user->id,
            'title' => 'Doa Pilihan',
            'content' => 'Semoga rezeki berkah',
            'category' => 'rizki',
            'is_featured' => true,
        ]);

        $regularPrayer = Prayer::create([
            'user_id' => $user->id,
            'title' => 'Doa Harian',
            'content' => 'Sehat selalu',
            'category' => 'general',
            'is_featured' => false,
        ]);

        PrayerComment::create([
            'prayer_id' => $featuredPrayer->id,
            'user_id' => $user->id,
            'content' => 'Aamiin ya rabbal alamin',
        ]);

        $this->assertCount(1, Prayer::featured()->get());
        $this->assertCount(1, Prayer::byCategory('rizki')->get());
        $this->assertCount(1, $featuredPrayer->comments);
        $this->assertInstanceOf(User::class, $featuredPrayer->user);
    }
}
