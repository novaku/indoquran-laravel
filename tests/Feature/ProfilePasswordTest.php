<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPOpenSourceSaver\JWTAuth\JWTGuard;
use Tests\TestCase;

class ProfilePasswordTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_user_initial_default_password_state()
    {
        $user = User::factory()->create([
            'google_id' => '1234567890',
            'password' => Hash::make('indoquran'),
            'password_changed_at' => null,
        ]);

        $this->assertTrue($user->is_default_password);
        $this->assertFalse($user->has_changed_password);

        $json = $user->toArray();
        $this->assertArrayHasKey('is_default_password', $json);
        $this->assertArrayHasKey('has_changed_password', $json);
        $this->assertTrue($json['is_default_password']);
        $this->assertFalse($json['has_changed_password']);
    }

    public function test_google_user_after_changing_password_updates_flags()
    {
        /** @var User $user */
        $user = User::factory()->create([
            'google_id' => '1234567890',
            'password' => Hash::make('indoquran'),
            'password_changed_at' => null,
        ]);

        /** @var JWTGuard $guard */
        $guard = auth('api');
        $token = $guard->login($user);

        $response = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->putJson('/api/profile', [
            'name' => $user->name,
            'email' => $user->email,
            'current_password' => 'indoquran',
            'password' => 'NewSecretPass123!',
            'password_confirmation' => 'NewSecretPass123!',
        ]);

        $response->assertStatus(200);

        $user->refresh();
        $this->assertFalse($user->is_default_password);
        $this->assertTrue($user->has_changed_password);
        $this->assertNotNull($user->password_changed_at);

        $data = $response->json();
        $this->assertFalse($data['user']['is_default_password']);
        $this->assertTrue($data['user']['has_changed_password']);
    }
}
