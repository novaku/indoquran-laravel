<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a default admin user if it doesn't exist
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password')
            ]
        );
        
        // Run the Quran data seeder
        $this->call([
            QuranDataSeeder::class,
            AdminUserSeeder::class,
            TafsirMaudhuiSeeder::class,
            AsmaulHusnaSeeder::class,
        ]);
    }
}
