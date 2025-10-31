<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample regular users for testing/development
        $users = [
            [
                'name' => 'Ahmad Abdullah',
                'email' => 'ahmad@example.com',
                'phone' => '081234567890',
                'password' => Hash::make('password123'),
                'is_admin' => false,
            ],
            [
                'name' => 'Fatimah Zahra',
                'email' => 'fatimah@example.com',
                'phone' => '081234567891',
                'password' => Hash::make('password123'),
                'is_admin' => false,
            ],
            [
                'name' => 'Muhammad Yusuf',
                'email' => 'yusuf@example.com',
                'phone' => '081234567892',
                'password' => Hash::make('password123'),
                'is_admin' => false,
            ],
            [
                'name' => 'Khadijah Siti',
                'email' => 'khadijah@example.com',
                'phone' => '081234567893',
                'password' => Hash::make('password123'),
                'is_admin' => false,
            ],
            [
                'name' => 'Ibrahim Hassan',
                'email' => 'ibrahim@example.com',
                'phone' => '081234567894',
                'password' => Hash::make('password123'),
                'is_admin' => false,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info('✅ ' . count($users) . ' regular users created successfully!');
    }
}
