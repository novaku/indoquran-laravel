<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            [
                'name' => 'Ibadah',
                'slug' => 'ibadah',
                'description' => 'Artikel tentang ibadah dalam Islam'
            ],
            [
                'name' => 'Akhlak',
                'slug' => 'akhlak',
                'description' => 'Artikel tentang akhlak dan karakter mulia'
            ],
            [
                'name' => 'Fiqih',
                'slug' => 'fiqih',
                'description' => 'Artikel tentang hukum-hukum dalam Islam'
            ],
            [
                'name' => 'Tafsir',
                'slug' => 'tafsir',
                'description' => 'Artikel tentang tafsir Al-Quran'
            ],
            [
                'name' => 'Kisah Nabi',
                'slug' => 'kisah-nabi',
                'description' => 'Artikel tentang kisah para nabi dan rasul'
            ],
            [
                'name' => 'Ramadan',
                'slug' => 'ramadan',
                'description' => 'Artikel seputar bulan Ramadan'
            ],
            [
                'name' => 'Doa',
                'slug' => 'doa',
                'description' => 'Artikel tentang doa-doa dan dzikir'
            ],
            [
                'name' => 'Sejarah Islam',
                'slug' => 'sejarah-islam',
                'description' => 'Artikel tentang sejarah peradaban Islam'
            ],
            [
                'name' => 'Motivasi',
                'slug' => 'motivasi',
                'description' => 'Artikel motivasi Islami'
            ],
            [
                'name' => 'Keluarga',
                'slug' => 'keluarga',
                'description' => 'Artikel tentang keluarga dalam Islam'
            ],
            [
                'name' => 'Muamalah',
                'slug' => 'muamalah',
                'description' => 'Artikel tentang hubungan sosial dalam Islam'
            ],
            [
                'name' => 'Sholat',
                'slug' => 'sholat',
                'description' => 'Artikel tentang tata cara dan keutamaan sholat'
            ],
            [
                'name' => 'Zakat',
                'slug' => 'zakat',
                'description' => 'Artikel tentang zakat dan sedekah'
            ],
            [
                'name' => 'Haji & Umroh',
                'slug' => 'haji-umroh',
                'description' => 'Artikel tentang ibadah haji dan umroh'
            ],
            [
                'name' => 'Puasa',
                'slug' => 'puasa',
                'description' => 'Artikel tentang puasa dan hikmahnya'
            ]
        ];

        foreach ($tags as $tag) {
            Tag::firstOrCreate(
                ['slug' => $tag['slug']],
                $tag
            );
        }

        $this->command->info('Tag berhasil ditambahkan!');
    }
}
