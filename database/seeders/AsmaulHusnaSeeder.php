<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AsmaulHusnaName;
use App\Models\AsmaulHusnaVerse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AsmaulHusnaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting Asmaul Husna data seeding...');

        // Load JSON data
        $jsonPath = resource_path('js/asmaul_husna.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error('Asmaul Husna JSON file not found at: ' . $jsonPath);
            return;
        }

        $jsonContent = File::get($jsonPath);
        $asmaulHusnaData = json_decode($jsonContent, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error('Error parsing JSON: ' . json_last_error_msg());
            return;
        }

        // Safely truncate existing data
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        AsmaulHusnaVerse::truncate();
        AsmaulHusnaName::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $this->command->info('Processing ' . count($asmaulHusnaData) . ' Asmaul Husna names...');

        $processedNames = 0;
        $processedVerses = 0;

        foreach ($asmaulHusnaData as $nameData) {
            try {
                // Create the name
                $name = AsmaulHusnaName::create([
                    'original_id' => $nameData['id'],
                    'arabic' => $nameData['arabic'],
                    'latin' => $nameData['latin'],
                    'meaning' => $nameData['meaning'],
                    'description' => $nameData['description'],
                    'slug' => Str::slug($nameData['latin']),
                    'is_active' => true,
                    'sort_order' => $nameData['id']
                ]);

                $processedNames++;

                // Create verses for this name
                if (isset($nameData['verses']) && is_array($nameData['verses'])) {
                    $verseOrder = 1;
                    foreach ($nameData['verses'] as $verseData) {
                        try {
                            AsmaulHusnaVerse::create([
                                'name_id' => $name->id,
                                'surah_number' => $verseData['surah'],
                                'ayah_number' => $verseData['ayah'],
                                'text' => $verseData['text'],
                                'sort_order' => $verseOrder
                            ]);
                            
                            $processedVerses++;
                            $verseOrder++;
                        } catch (\Exception $e) {
                            $this->command->warn("Warning: Could not create verse {$verseData['surah']}:{$verseData['ayah']} for name {$nameData['latin']}: " . $e->getMessage());
                        }
                    }
                }

                if ($processedNames % 10 == 0) {
                    $this->command->info("Processed {$processedNames} names so far...");
                }

            } catch (\Exception $e) {
                $this->command->error("Error processing name {$nameData['latin']}: " . $e->getMessage());
            }
        }

        $this->command->info("✅ Asmaul Husna seeding completed!");
        $this->command->info("📊 Summary:");
        $this->command->info("   • Names processed: {$processedNames}");
        $this->command->info("   • Verses processed: {$processedVerses}");
        $this->command->info("   • Database records created successfully");
    }
}
