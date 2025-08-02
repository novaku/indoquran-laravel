<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use App\Models\TafsirMaudhuiTopic;
use App\Models\TafsirMaudhuiVerse;
use Illuminate\Support\Str;

class TafsirMaudhuiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing data safely (respect foreign key constraints)
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        TafsirMaudhuiVerse::truncate();
        TafsirMaudhuiTopic::truncate();
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Load JSON data
        $jsonPath = resource_path('js/tafsir_maudhui_full.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error("File tafsir_maudhui_full.json tidak ditemukan di {$jsonPath}");
            return;
        }

        $jsonContent = File::get($jsonPath);
        $data = json_decode($jsonContent, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error('Error parsing JSON file: ' . json_last_error_msg());
            return;
        }

        if (!isset($data['topics']) || !is_array($data['topics'])) {
            $this->command->error('Invalid JSON structure: topics array not found');
            return;
        }

        $this->command->info('Starting to seed tafsir maudhui data...');
        
        $topicCount = 0;
        $verseCount = 0;

        foreach ($data['topics'] as $index => $topicData) {
            try {
                // Create topic
                $topic = TafsirMaudhuiTopic::create([
                    'topic' => $topicData['topic'],
                    'description' => $topicData['description'],
                    'slug' => Str::slug($topicData['topic']),
                    'is_active' => true,
                    'sort_order' => $index + 1
                ]);

                $topicCount++;
                
                // Create verses for this topic
                if (isset($topicData['verses']) && is_array($topicData['verses'])) {
                    foreach ($topicData['verses'] as $verseIndex => $verse) {
                        if (isset($verse['surah']) && isset($verse['ayah'])) {
                            TafsirMaudhuiVerse::create([
                                'topic_id' => $topic->id,
                                'surah_number' => $verse['surah'],
                                'ayah_number' => $verse['ayah'],
                                'sort_order' => $verseIndex + 1
                            ]);
                            
                            $verseCount++;
                        }
                    }
                }

                $this->command->info("Seeded topic: {$topicData['topic']} with " . count($topicData['verses'] ?? []) . " verses");
                
            } catch (\Exception $e) {
                $this->command->error("Error seeding topic '{$topicData['topic']}': " . $e->getMessage());
            }
        }

        $this->command->info("Seeding completed! Created {$topicCount} topics and {$verseCount} verses.");
    }
}
