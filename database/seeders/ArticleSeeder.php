<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Article;
use App\Models\User;
use App\Models\Tag;
use Illuminate\Support\Str;

class ArticleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Pastikan ada user untuk dijadikan author
        $author = User::first();
        
        if (!$author) {
            // Jika belum ada user, buat user admin default
            $author = User::create([
                'name' => 'Admin IndoQuran',
                'email' => 'admin@indoquran.web.id',
                'password' => bcrypt('password123'),
                'is_admin' => true,
            ]);
        }

        $articlesData = [
            [
                'title' => 'Keutamaan Membaca Al-Quran Setiap Hari',
                'slug' => 'keutamaan-membaca-al-quran-setiap-hari',
                'excerpt' => 'Membaca Al-Quran adalah ibadah yang sangat dianjurkan dalam Islam. Setiap huruf yang dibaca akan mendatangkan pahala berlipat ganda dari Allah SWT.',
                'content' => 'Konten artikel tentang keutamaan membaca Al-Quran...',
                'status' => 'published',
                'published_at' => now()->subDays(7),
                'views_count' => 156,
                'tags' => ['Ibadah', 'Motivasi', 'Akhlak'],
            ],
            [
                'title' => 'Makna Surah Al-Fatihah: Induk Segala Surah',
                'slug' => 'makna-surah-al-fatihah-induk-segala-surah',
                'excerpt' => 'Surah Al-Fatihah disebut sebagai Ummul Quran (Induk Al-Quran) karena mengandung intisari dari seluruh isi Al-Quran.',
                'content' => 'Konten artikel tentang surah Al-Fatihah...',
                'status' => 'published',
                'published_at' => now()->subDays(5),
                'views_count' => 243,
                'tags' => ['Tafsir', 'Sholat', 'Ibadah'],
            ],
            [
                'title' => 'Tadabbur Al-Quran: Merenungkan Ayat-Ayat Allah',
                'slug' => 'tadabbur-al-quran-merenungkan-ayat-ayat-allah',
                'excerpt' => 'Tadabbur Al-Quran bukan sekadar membaca, tetapi merenungkan dan mengambil pelajaran dari setiap ayat yang kita baca.',
                'content' => 'Konten artikel tentang tadabbur Al-Quran...',
                'status' => 'published',
                'published_at' => now()->subDays(3),
                'views_count' => 189,
                'tags' => ['Tafsir', 'Ibadah', 'Akhlak', 'Motivasi'],
            ],
            [
                'title' => 'Surah Yasin: Jantungnya Al-Quran',
                'slug' => 'surah-yasin-jantungnya-al-quran',
                'excerpt' => 'Surah Yasin dijuluki sebagai "Qalbul Quran" atau jantungnya Al-Quran. Pelajari keutamaan dan hikmah dari surah ini.',
                'content' => 'Konten artikel tentang Surah Yasin...',
                'status' => 'published',
                'published_at' => now()->subDays(2),
                'views_count' => 312,
                'tags' => ['Tafsir', 'Ibadah', 'Doa', 'Kisah Nabi'],
            ],
            [
                'title' => 'Mengenal Tajwid: Seni Membaca Al-Quran dengan Benar',
                'slug' => 'mengenal-tajwid-seni-membaca-al-quran-dengan-benar',
                'excerpt' => 'Tajwid adalah ilmu yang mengajarkan cara membaca Al-Quran dengan benar sesuai kaidah.',
                'content' => 'Konten artikel tentang tajwid...',
                'status' => 'published',
                'published_at' => now()->subDays(1),
                'views_count' => 278,
                'tags' => ['Ibadah', 'Fiqih'],
            ],
            [
                'title' => 'Tips Menghafal Al-Quran untuk Pemula',
                'slug' => 'tips-menghafal-al-quran-untuk-pemula',
                'excerpt' => 'Menghafal Al-Quran adalah impian setiap muslim. Dengan metode yang tepat dan tekad yang kuat, siapa saja bisa menjadi penghafal Al-Quran.',
                'content' => 'Konten artikel tentang tips menghafal Al-Quran...',
                'status' => 'draft',
                'published_at' => null,
                'views_count' => 0,
                'tags' => ['Ibadah', 'Motivasi', 'Doa'],
            ],
        ];

        foreach ($articlesData as $articleData) {
            // Extract tags before creating article
            $tags = $articleData['tags'] ?? [];
            unset($articleData['tags']);
            
            // Check if article already exists
            $existingArticle = Article::where('slug', $articleData['slug'])->first();
            
            if ($existingArticle) {
                $this->command->warn('⚠️  Artikel "' . $articleData['title'] . '" sudah ada, skip...');
                
                // Update tags for existing article
                if (!empty($tags)) {
                    $tagIds = [];
                    foreach ($tags as $tagName) {
                        $tag = Tag::where('name', $tagName)->first();
                        if ($tag) {
                            $tagIds[] = $tag->id;
                        }
                    }
                    
                    if (!empty($tagIds)) {
                        $existingArticle->tags()->sync($tagIds);
                        $this->command->info('   ↳ Tags updated untuk artikel ini');
                    }
                }
                continue;
            }
            
            // Create article
            $article = Article::create(array_merge($articleData, [
                'author_id' => $author->id,
            ]));

            // Attach tags
            if (!empty($tags)) {
                $tagIds = [];
                foreach ($tags as $tagName) {
                    $tag = Tag::where('name', $tagName)->first();
                    if ($tag) {
                        $tagIds[] = $tag->id;
                    }
                }
                
                if (!empty($tagIds)) {
                    $article->tags()->attach($tagIds);
                }
            }
            
            $this->command->info('✅ Artikel "' . $articleData['title'] . '" berhasil dibuat dengan ' . count($tags) . ' tags');
        }

        $this->command->info('✅ Seeded ' . count($articlesData) . ' artikel successfully with tags!');
        $this->command->info('📊 Published: ' . (count($articlesData) - 1) . ' | Draft: 1');
    }
}
