<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Prayer;
use App\Models\PrayerAmin;
use App\Models\PrayerComment;

class PrayerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some test users if they don't exist
        $users = [];
        
        // Create or get existing users
        for ($i = 1; $i <= 3; $i++) {
            $users[] = User::firstOrCreate([
                'email' => "user{$i}@example.com"
            ], [
                'name' => "Test User {$i}",
                'password' => bcrypt('password')
            ]);
        }

        // Sample prayers data
        $prayersData = [
            [
                'title' => 'Doa untuk Kesehatan Keluarga',
                'content' => 'Ya Allah, kami memohon kepada-Mu kesehatan untuk seluruh keluarga kami. Lindungi kami dari segala penyakit dan berikanlah kekuatan untuk selalu beribadah kepada-Mu. Aamiin.',
                'category' => 'kesehatan',
                'is_anonymous' => false,
            ],
            [
                'title' => 'Doa Mencari Pekerjaan',
                'content' => 'Ya Allah, mudahkanlah kami dalam mencari pekerjaan yang halal dan berkah. Berikanlah rezeki yang baik dan berakhlaq mulia dalam bekerja. Aamiin ya Rabbal alamiin.',
                'category' => 'pekerjaan',
                'is_anonymous' => true,
            ],
            [
                'title' => 'Doa untuk Anak-anak yang Sholeh',
                'content' => 'Ya Allah, jadikanlah anak-anak kami sebagai anak yang sholeh dan sholeha. Berikanlah mereka ilmu yang bermanfaat dan akhlak yang mulia. Lindungi mereka dari pengaruh buruk. Aamiin.',
                'category' => 'keluarga',
                'is_anonymous' => false,
            ],
            [
                'title' => 'Doa untuk Kemudahan dalam Belajar',
                'content' => 'Allahumma la sahla illa ma ja\'altahu sahlan wa anta taj\'alul hazna idza syi\'ta sahlan. Ya Allah, mudahkanlah kami dalam menuntut ilmu dan berikanlah pemahaman yang baik.',
                'category' => 'pendidikan',
                'is_anonymous' => false,
            ],
            [
                'title' => 'Doa untuk Keberkahan Rezeki',
                'content' => 'Ya Allah, berkahilah rezeki yang Engkau berikan kepada kami. Jadikanlah rezeki kami halal dan barokah. Jauhkan kami dari rezeki yang haram dan syubhat.',
                'category' => 'keuangan',
                'is_anonymous' => true,
            ],
            [
                'title' => 'Doa Perjalanan yang Aman',
                'content' => 'Subhanalladzii sakhkhara lana hadza wa ma kunna lahu muqriniin wa inna ila rabbina lamunqalibun. Ya Allah, selamatkanlah perjalanan kami dan kembalikanlah kami dengan selamat.',
                'category' => 'perjalanan',
                'is_anonymous' => false,
            ]
        ];

        foreach ($prayersData as $index => $prayerData) {
            $user = $users[$index % count($users)];
            
            $prayer = Prayer::create([
                'user_id' => $user->id,
                'title' => $prayerData['title'],
                'content' => $prayerData['content'],
                'category' => $prayerData['category'],
                'is_anonymous' => $prayerData['is_anonymous'],
                'amin_count' => rand(1, 25),
                'comment_count' => rand(0, 8),
                'created_at' => now()->subDays(rand(0, 30)),
            ]);

            // Add some amins
            $aminCount = rand(1, 15);
            $aminUsers = $users;
            shuffle($aminUsers);
            
            for ($i = 0; $i < min($aminCount, count($aminUsers)); $i++) {
                PrayerAmin::create([
                    'user_id' => $aminUsers[$i]->id,
                    'prayer_id' => $prayer->id,
                    'created_at' => $prayer->created_at->addMinutes(rand(1, 1440))
                ]);
            }

            // Add some comments
            $commentCount = rand(0, 5);
            for ($i = 0; $i < $commentCount; $i++) {
                $commentUser = $users[array_rand($users)];
                $comments = [
                    'Aamiin ya Rabbal alamiin',
                    'Semoga doanya dikabulkan Allah SWT',
                    'Barakallahu fiik, aamiin',
                    'Ikut mendoakan, semoga dimudahkan',
                    'Aamiin, semoga Allah mengabulkan',
                    'Barakallahu laka, aamiin ya Allah',
                    'Semoga diberkahi Allah SWT'
                ];
                
                PrayerComment::create([
                    'user_id' => $commentUser->id,
                    'prayer_id' => $prayer->id,
                    'content' => $comments[array_rand($comments)],
                    'is_anonymous' => rand(0, 1) == 1,
                    'created_at' => $prayer->created_at->addMinutes(rand(30, 2000))
                ]);
            }

            // Update counts
            $prayer->update([
                'amin_count' => $prayer->amins()->count(),
                'comment_count' => $prayer->comments()->count()
            ]);
        }

        $this->command->info('Prayer seeder completed successfully!');
    }
}
