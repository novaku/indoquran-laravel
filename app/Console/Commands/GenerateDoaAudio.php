<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SelectedPrayer;
use Illuminate\Support\Facades\File;

class GenerateDoaAudio extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'doa:generate-audio {--force : Overwrite existing audio files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate MP3 audio files for all SelectedPrayers (doa pilihan) using Arabic TTS';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $force = $this->option('force');
        $dir = storage_path('app/public/audio/doa');
        File::ensureDirectoryExists($dir);

        $prayers = SelectedPrayer::orderBy('order')->get();
        $total = $prayers->count();

        $this->info("Starting audio generation for {$total} selected prayers...");

        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $success = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($prayers as $prayer) {
            $filePath = "{$dir}/doa_{$prayer->id}.mp3";

            if (file_exists($filePath) && !$force) {
                $skipped++;
                $bar->advance();
                continue;
            }

            $mp3 = $this->generateArabicAudio($prayer->arabic);
            if (!empty($mp3)) {
                file_put_contents($filePath, $mp3);
                $success++;
            } else {
                $failed++;
                $this->error("\nFailed to generate audio for prayer #{$prayer->id} ({$prayer->title})");
            }

            $bar->advance();
            // Small sleep to prevent rate limiting
            usleep(50000); // 50ms
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("Audio generation completed!");
        $this->info("Summary: {$success} generated, {$skipped} skipped (already exists), {$failed} failed.");

        return Command::SUCCESS;
    }

    /**
     * Generate chunked Arabic MP3 audio from Google Translate TTS
     */
    private function generateArabicAudio(string $arabicText): ?string
    {
        $words = preg_split('/([،,.؟?!\s]+)/u', $arabicText, -1, PREG_SPLIT_DELIM_CAPTURE);
        $chunks = [];
        $current = '';
        foreach ($words as $part) {
            if (mb_strlen($current . $part) > 80 && trim($current) !== '') {
                $chunks[] = trim($current);
                $current = $part;
            } else {
                $current .= $part;
            }
        }
        if (trim($current) !== '') {
            $chunks[] = trim($current);
        }

        $mp3 = '';
        foreach ($chunks as $chunk) {
            $url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=' . urlencode($chunk);
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $data = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            if ($code == 200 && $data) {
                $mp3 .= $data;
            }
        }

        return !empty($mp3) ? $mp3 : null;
    }
}
