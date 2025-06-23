<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(
            ['email' => 'kontak@indoquran.web.id'],
            [
                'name' => 'IndoQuran Admin',
                'email' => 'kontak@indoquran.web.id',
                'password' => Hash::make('Admin@IndoQuran2024!'),
                'is_admin' => true,
            ]
        );
    }
}
