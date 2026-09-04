<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SelectedPrayer;
use Illuminate\Support\Facades\File;

class SelectedPrayerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = database_path('data/selected_prayers.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("File {$jsonPath} not found!");
            return;
        }

        $jsonContent = File::get($jsonPath);
        $prayers = json_decode($jsonContent, true);

        if (empty($prayers)) {
            $this->command->error("No prayers found in {$jsonPath}!");
            return;
        }

        $count = 0;
        foreach ($prayers as $item) {
            SelectedPrayer::updateOrCreate(
                [
                    'order' => $item['order']
                ],
                [
                    'title' => $item['title'],
                    'category' => $item['category'],
                    'category_name' => $item['category_name'],
                    'arabic' => $item['arabic'],
                    'latin' => $item['latin'],
                    'translation' => $item['translation'],
                    'source' => $item['source'] ?? null,
                    'fadhilah' => $item['fadhilah'] ?? null,
                ]
            );
            $count++;
        }

        $this->command->info("SelectedPrayerSeeder successfully seeded {$count} selected prayers!");
    }
}
