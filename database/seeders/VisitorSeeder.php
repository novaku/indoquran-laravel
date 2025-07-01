<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Visitor;
use Carbon\Carbon;

class VisitorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample data for the last 7 days
        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
            'Mozilla/5.0 (Android 11; Mobile; rv:89.0) Gecko/89.0 Firefox/89.0'
        ];

        $pages = [
            '/',
            '/surah/1',
            '/surah/2',
            '/doa-bersama',
            '/contact',
            '/search?q=allah'
        ];

        // Generate data for last 7 days
        for ($days = 6; $days >= 0; $days--) {
            $date = Carbon::now()->subDays($days);
            
            // Generate different amounts of traffic per day
            $dailyVisitors = rand(20, 100);
            
            for ($i = 0; $i < $dailyVisitors; $i++) {
                $hour = rand(6, 23); // Peak hours between 6 AM to 11 PM
                $minute = rand(0, 59);
                $second = rand(0, 59);
                
                $visitTime = $date->copy()->setTime($hour, $minute, $second);
                
                Visitor::create([
                    'ip_address' => $this->generateRandomIp(),
                    'user_agent' => $userAgents[array_rand($userAgents)],
                    'visited_at' => $visitTime,
                    'page_url' => 'https://indoquran.com' . $pages[array_rand($pages)],
                    'referrer' => rand(0, 1) ? 'https://google.com' : null,
                    'session_id' => 'session_' . uniqid()
                ]);
            }
        }

        // Generate hourly data for today
        $today = Carbon::now()->startOfDay();
        for ($hour = 0; $hour < 24; $hour++) {
            $hourlyVisitors = $this->getVisitorsForHour($hour);
            
            for ($i = 0; $i < $hourlyVisitors; $i++) {
                $minute = rand(0, 59);
                $second = rand(0, 59);
                
                $visitTime = $today->copy()->addHours($hour)->addMinutes($minute)->addSeconds($second);
                
                Visitor::create([
                    'ip_address' => $this->generateRandomIp(),
                    'user_agent' => $userAgents[array_rand($userAgents)],
                    'visited_at' => $visitTime,
                    'page_url' => 'https://indoquran.com' . $pages[array_rand($pages)],
                    'referrer' => rand(0, 1) ? 'https://google.com' : null,
                    'session_id' => 'session_' . uniqid()
                ]);
            }
        }
    }

    private function generateRandomIp()
    {
        return rand(1, 255) . '.' . rand(0, 255) . '.' . rand(0, 255) . '.' . rand(1, 255);
    }

    private function getVisitorsForHour($hour)
    {
        // Simulate realistic traffic patterns
        $patterns = [
            0 => 2,   // 12 AM
            1 => 1,   // 1 AM
            2 => 1,   // 2 AM
            3 => 0,   // 3 AM
            4 => 1,   // 4 AM
            5 => 2,   // 5 AM
            6 => 5,   // 6 AM
            7 => 8,   // 7 AM
            8 => 12,  // 8 AM
            9 => 15,  // 9 AM
            10 => 18, // 10 AM
            11 => 20, // 11 AM
            12 => 22, // 12 PM
            13 => 25, // 1 PM
            14 => 23, // 2 PM
            15 => 20, // 3 PM
            16 => 18, // 4 PM
            17 => 16, // 5 PM
            18 => 14, // 6 PM
            19 => 18, // 7 PM
            20 => 20, // 8 PM
            21 => 15, // 9 PM
            22 => 10, // 10 PM
            23 => 5   // 11 PM
        ];

        return $patterns[$hour] + rand(-2, 3); // Add some randomness
    }
}
