<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Mail\WelcomeNewUser;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestWelcomeEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:welcome-email {email? : The email address to send test email to}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send a test welcome email to a specific email address';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email') ?? 'test@example.com';
        
        // Create a dummy user for testing
        $testUser = new User([
            'name' => 'Test User',
            'email' => $email,
        ]);

        try {
            Mail::to($email)->send(new WelcomeNewUser($testUser));
            $this->info("Welcome email sent successfully to: {$email}");
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Failed to send welcome email: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
