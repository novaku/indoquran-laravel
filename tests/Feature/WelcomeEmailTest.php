<?php

namespace Tests\Feature;

use App\Mail\WelcomeNewUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class WelcomeEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_email_is_sent_on_user_registration()
    {
        Mail::fake();

        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(200);
        $response->assertJson([
            'welcome_email_sent' => true
        ]);

        // Assert welcome email was sent
        Mail::assertSent(WelcomeNewUser::class, function ($mail) use ($userData) {
            return $mail->user->email === $userData['email'] &&
                   $mail->user->name === $userData['name'];
        });
    }

    public function test_welcome_email_contains_correct_user_data()
    {
        $user = User::factory()->create([
            'name' => 'Ahmad Rahman',
            'email' => 'ahmad@example.com'
        ]);

        $mail = new WelcomeNewUser($user);

        $this->assertEquals($user->email, $mail->envelope()->to[0]->address);
        $this->assertStringContainsString('Selamat Datang di IndoQuran', $mail->envelope()->subject);
        $this->assertEquals($user, $mail->user);
    }

    public function test_welcome_email_template_renders_correctly()
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com'
        ]);

        $mail = new WelcomeNewUser($user);
        $rendered = $mail->render();

        // Check if email contains user name
        $this->assertStringContainsString($user->name, $rendered);
        
        // Check if email contains key content
        $this->assertStringContainsString('IndoQuran', $rendered);
        $this->assertStringContainsString('Assalamu\'alaikum', $rendered);
        $this->assertStringContainsString('Bagikan Kebaikan', $rendered);
        $this->assertStringContainsString('pahala', $rendered);
        $this->assertStringContainsString('QS. Al-Isra: 82', $rendered);
        
        // Check if email contains features
        $this->assertStringContainsString('Baca Al-Quran Online', $rendered);
        $this->assertStringContainsString('Bookmark & Catatan', $rendered);
        $this->assertStringContainsString('Pelacakan Progress', $rendered);
        $this->assertStringContainsString('Asmaul Husna', $rendered);
        
        // Check if email contains sharing section
        $this->assertStringContainsString('Share via WhatsApp', $rendered);
        $this->assertStringContainsString('Pahala Jariyah', $rendered);
    }

    public function test_registration_continues_even_if_welcome_email_fails()
    {
        Mail::shouldReceive('to')
            ->andReturnSelf()
            ->shouldReceive('send')
            ->andThrow(new \Exception('Mail server down'));

        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ];

        $response = $this->postJson('/api/register', $userData);

        // Registration should still succeed
        $response->assertStatus(200);
        
        // User should be created
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User'
        ]);
    }
}
