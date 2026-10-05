<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\NotificationSeeder::class);
    }

    public function test_get_notifications_returns_success_and_recent_features(): void
    {
        $response = $this->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'source' => 'database',
            ])
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'id',
                        'title',
                        'message',
                        'link',
                        'time_ago',
                        'timestamp',
                        'category',
                        'type',
                        'badge_icon',
                        'badge_color',
                        'image',
                        'section',
                        'is_featured',
                    ],
                ],
                'total',
                'source',
            ]);

        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(10, count($data));

        $ids = array_column($data, 'id');
        $this->assertContains('notif-hadits-kategori-filter', $ids);
        $this->assertContains('notif-seo-rich-snippets', $ids);
        $this->assertContains('notif-penanda-hadits-baru', $ids);
        $this->assertContains('notif-hadits-7-kitab', $ids);
        $this->assertContains('notif-version-2-32-0', $ids);
    }

    public function test_new_notification_in_database_is_immediately_served_without_rebuild(): void
    {
        // Insert a brand new notification directly in database
        $created = Notification::create([
            'identifier' => 'notif-live-insert-test',
            'title' => 'Pembaruan Khusus Langsung dari Database',
            'message' => 'Notifikasi ini ditambahkan langsung ke tabel database tanpa re-build kode frontend maupun backend.',
            'link' => '/surah',
            'category' => 'Live Update',
            'section' => 'new',
            'badge_icon' => 'sparkles',
            'badge_color' => 'bg-purple-600',
            'is_active' => true,
            'is_featured' => true,
            'sort_order' => 0,
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/notifications');
        $response->assertStatus(200);

        $data = $response->json('data');
        $firstItem = $data[0];

        // Should appear first because of sort_order 0
        $this->assertEquals('notif-live-insert-test', $firstItem['id']);
        $this->assertEquals('Pembaruan Khusus Langsung dari Database', $firstItem['title']);
        $this->assertEquals('Live Update', $firstItem['category']);
    }

    public function test_inactive_notification_is_hidden(): void
    {
        Notification::where('identifier', 'notif-hadits-kategori-filter')->update(['is_active' => false]);

        $response = $this->getJson('/api/notifications');
        $data = $response->json('data');
        $ids = array_column($data, 'id');

        $this->assertNotContains('notif-hadits-kategori-filter', $ids);
    }

    public function test_admin_can_manage_notifications_via_api(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        // 1. List
        $response = $this->actingAs($admin)->getJson('/api/admin/notifications');
        $response->assertStatus(200)
            ->assertJsonStructure(['status', 'data', 'pagination']);

        // 2. Create
        $createResponse = $this->actingAs($admin)->postJson('/api/admin/notifications', [
            'identifier' => 'notif-admin-created',
            'title' => 'Judul Admin Test',
            'message' => 'Deskripsi pesan notifikasi dari admin panel',
            'link' => '/doa-bersama',
            'category' => 'Pengumuman',
            'section' => 'new',
            'badge_icon' => 'prayer',
            'badge_color' => 'bg-rose-600',
        ]);
        $createResponse->assertStatus(201);
        $newId = $createResponse->json('data.id');

        // 3. Toggle
        $toggleResponse = $this->actingAs($admin)->postJson("/api/admin/notifications/{$newId}/toggle-active");
        $toggleResponse->assertStatus(200)
            ->assertJson(['status' => 'success', 'data' => ['is_active' => false]]);

        // 4. Update
        $updateResponse = $this->actingAs($admin)->putJson("/api/admin/notifications/{$newId}", [
            'title' => 'Judul Admin Diperbarui',
        ]);
        $updateResponse->assertStatus(200)
            ->assertJson(['status' => 'success', 'data' => ['title' => 'Judul Admin Diperbarui']]);

        // 5. Delete
        $deleteResponse = $this->actingAs($admin)->deleteJson("/api/admin/notifications/{$newId}");
        $deleteResponse->assertStatus(200);
        $this->assertDatabaseMissing('notifications', ['id' => $newId]);
    }

    public function test_artisan_notification_manage_command(): void
    {
        $this->artisan('notification:manage', ['action' => 'list'])
            ->assertExitCode(0);

        $this->artisan('notification:manage', ['action' => 'toggle', '--id' => 'notif-seo-rich-snippets'])
            ->assertExitCode(0);

        $notif = Notification::where('identifier', 'notif-seo-rich-snippets')->first();
        $this->assertFalse($notif->is_active);
    }
}
