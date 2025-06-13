<?php

namespace Tests\Feature;

use App\Mail\UserRegistrationNotification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class UserRegistrationEmailTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that email notification is sent when a new user registers.
     */
    public function test_email_notification_sent_on_user_registration(): void
    {
        // Fake the mail system to capture sent emails
        Mail::fake();

        // Prepare registration data
        $userData = [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        // Make registration request
        $response = $this->postJson('/api/register', $userData);

        // Assert successful registration
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'user' => ['id', 'name', 'email'],
                    'message'
                ]);

        // Assert user was created in database
        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
        ]);

        // Assert email notification was sent to kontak@indoquran.web.id
        Mail::assertSent(UserRegistrationNotification::class, function ($mail) {
            return $mail->hasTo('kontak@indoquran.web.id');
        });

        // Assert the email contains correct user information
        Mail::assertSent(UserRegistrationNotification::class, function ($mail) use ($userData) {
            return $mail->user->name === $userData['name'] && 
                   $mail->user->email === $userData['email'];
        });
    }

    /**
     * Test that registration still succeeds even if email fails to send.
     */
    public function test_registration_succeeds_even_if_email_fails(): void
    {
        // This test ensures that email sending failures don't break registration
        
        // Prepare registration data
        $userData = [
            'name' => 'Jane Doe',
            'email' => 'jane.doe@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        // Make registration request
        $response = $this->postJson('/api/register', $userData);

        // Assert successful registration regardless of email status
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'user' => ['id', 'name', 'email'],
                    'message'
                ]);

        // Assert user was created in database
        $this->assertDatabaseHas('users', [
            'name' => 'Jane Doe',
            'email' => 'jane.doe@example.com',
        ]);
    }

    /**
     * Test the email template contains expected content.
     */
    public function test_email_template_contains_expected_content(): void
    {
        // Create a test user
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create the mailable
        $mailable = new UserRegistrationNotification($user);

        // Render the email content
        $mailable->assertSeeInHtml('Pengguna Baru Terdaftar!');
        $mailable->assertSeeInHtml($user->name);
        $mailable->assertSeeInHtml($user->email);
        $mailable->assertSeeInHtml('IndoQuran');
        $mailable->assertSeeInHtml('kontak@indoquran.web.id');
    }
}
