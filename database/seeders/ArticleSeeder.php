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
        // Gunakan admin user yang sudah dibuat oleh AdminUserSeeder
        $author = User::where('email', 'kontak@indoquran.web.id')->first();
        
        if (!$author) {
            $this->command->error('❌ Admin user tidak ditemukan! Jalankan AdminUserSeeder terlebih dahulu.');
            $this->command->info('   Jalankan: php artisan db:seed --class=AdminUserSeeder');
            return;
        }
        
        $this->command->info('👤 Menggunakan author: ' . $author->name . ' (' . $author->email . ')');

        $articlesData = [
            [
                'title' => 'Keutamaan Membaca Al-Quran Setiap Hari',
                'slug' => 'keutamaan-membaca-al-quran-setiap-hari',
                'excerpt' => 'Membaca Al-Quran adalah ibadah yang sangat dianjurkan dalam Islam. Setiap huruf yang dibaca akan mendatangkan pahala berlipat ganda dari Allah SWT.',
                'content' => '<p>Membaca Al-Quran adalah salah satu ibadah yang paling mulia dalam Islam. Rasulullah SAW bersabda: "Siapa yang membaca satu huruf dari Kitabullah (Al-Quran), maka baginya satu kebaikan. Dan satu kebaikan akan dilipat gandakan menjadi sepuluh kebaikan." (HR. Tirmidzi)</p><p>Keutamaan membaca Al-Quran sangat banyak, di antaranya:</p><ul><li>Mendapat syafaat di hari kiamat</li><li>Menjadi obat bagi hati yang sakit</li><li>Meningkatkan keimanan dan ketakwaan</li><li>Mendapat berkah dan rahmat Allah SWT</li></ul><p>Mari kita jadikan membaca Al-Quran sebagai rutinitas harian kita.</p>',
                'status' => 'published',
                'published_at' => now()->subDays(7),
                'views_count' => 156,
                'tags' => ['Ibadah', 'Motivasi', 'Akhlak'],
            ],
            [
                'title' => 'Makna Surah Al-Fatihah: Induk Segala Surah',
                'slug' => 'makna-surah-al-fatihah-induk-segala-surah',
                'excerpt' => 'Surah Al-Fatihah disebut sebagai Ummul Quran (Induk Al-Quran) karena mengandung intisari dari seluruh isi Al-Quran.',
                'content' => '<h2>Pengenalan Surah Al-Fatihah</h2><p>Surah Al-Fatihah adalah surah pertama dalam Al-Quran yang terdiri dari 7 ayat. Surah ini memiliki banyak nama, di antaranya Ummul Quran (Induk Al-Quran), As-Sab\'ul Matsani (Tujuh yang Berulang), dan Asy-Syifa (Penyembuh).</p><h3>Kandungan Makna</h3><p>Surah Al-Fatihah mengandung tiga aspek utama:</p><ol><li><strong>Tauhid</strong> - Pengakuan keesaan Allah</li><li><strong>Ibadah</strong> - Hanya kepada Allah kita beribadah</li><li><strong>Do\'a</strong> - Permohonan petunjuk jalan yang lurus</li></ol><p>Kita membaca surah ini minimal 17 kali sehari dalam shalat wajib.</p>',
                'status' => 'published',
                'published_at' => now()->subDays(5),
                'views_count' => 243,
                'tags' => ['Tafsir', 'Sholat', 'Ibadah'],
            ],
            [
                'title' => 'Tadabbur Al-Quran: Merenungkan Ayat-Ayat Allah',
                'slug' => 'tadabbur-al-quran-merenungkan-ayat-ayat-allah',
                'excerpt' => 'Tadabbur Al-Quran bukan sekadar membaca, tetapi merenungkan dan mengambil pelajaran dari setiap ayat yang kita baca.',
                'content' => '<p>Allah SWT berfirman dalam QS. Muhammad ayat 24: "Maka tidakkah mereka menghayati (tadabbur) Al-Quran ataukah hati mereka terkunci?"</p><h3>Apa itu Tadabbur?</h3><p>Tadabbur berasal dari kata "dubur" yang artinya belakang atau akhir. Tadabbur berarti memikirkan akibat atau dampak dari sesuatu. Dalam konteks Al-Quran, tadabbur adalah merenungkan makna ayat-ayat Al-Quran secara mendalam.</p><h3>Cara Melakukan Tadabbur</h3><ol><li>Membaca dengan tartil dan memahami arti</li><li>Merenungkan maksud dan tujuan ayat</li><li>Mencari keterkaitan dengan kehidupan</li><li>Mengambil pelajaran dan mengamalkannya</li></ol><p>Dengan tadabbur, Al-Quran bukan hanya bacaan, tetapi panduan hidup yang nyata.</p>',
                'status' => 'published',
                'published_at' => now()->subDays(3),
                'views_count' => 189,
                'tags' => ['Tafsir', 'Ibadah', 'Akhlak', 'Motivasi'],
            ],
            [
                'title' => 'Surah Yasin: Jantungnya Al-Quran',
                'slug' => 'surah-yasin-jantungnya-al-quran',
                'excerpt' => 'Surah Yasin dijuluki sebagai "Qalbul Quran" atau jantungnya Al-Quran. Pelajari keutamaan dan hikmah dari surah ini.',
                'content' => '<h2>Tentang Surah Yasin</h2><p>Surah Yasin adalah surah ke-36 dalam Al-Quran yang terdiri dari 83 ayat. Rasulullah SAW bersabda: "Sesungguhnya setiap sesuatu itu ada jantungnya, dan jantung Al-Quran adalah Yasin." (HR. Tirmidzi)</p><h3>Keutamaan Surah Yasin</h3><ul><li>Mendapat ampunan dosa</li><li>Memudahkan urusan dunia dan akhirat</li><li>Dianjurkan dibaca untuk orang yang sakaratul maut</li><li>Mendapat syafaat di hari kiamat</li></ul><h3>Kandungan Surah Yasin</h3><p>Surah ini membahas tentang:</p><ul><li>Kerasulan Nabi Muhammad SAW</li><li>Kisah penduduk suatu negeri yang mendustakan para rasul</li><li>Bukti-bukti kekuasaan Allah</li><li>Hari kebangkitan dan pembalasan</li></ul><p>Mari kita amalkan membaca Surah Yasin secara rutin.</p>',
                'status' => 'published',
                'published_at' => now()->subDays(2),
                'views_count' => 312,
                'tags' => ['Tafsir', 'Ibadah', 'Doa', 'Kisah Nabi'],
            ],
            [
                'title' => 'Mengenal Tajwid: Seni Membaca Al-Quran dengan Benar',
                'slug' => 'mengenal-tajwid-seni-membaca-al-quran-dengan-benar',
                'excerpt' => 'Tajwid adalah ilmu yang mengajarkan cara membaca Al-Quran dengan benar sesuai kaidah.',
                'content' => '<h2>Pengertian Tajwid</h2><p>Tajwid berasal dari kata "jawwada" yang artinya membaguskan atau memperbaiki. Ilmu tajwid adalah ilmu yang mempelajari cara membaca Al-Quran dengan baik dan benar sesuai dengan aturan yang telah ditetapkan.</p><h3>Hukum Mempelajari Tajwid</h3><p>Para ulama sepakat bahwa mempelajari ilmu tajwid hukumnya <strong>fardhu kifayah</strong>, sedangkan mengamalkannya dalam membaca Al-Quran hukumnya <strong>fardhu \'ain</strong>.</p><h3>Hukum-Hukum Tajwid Dasar</h3><ol><li><strong>Nun Sukun dan Tanwin</strong> (Idzhar, Idghom, Iqlab, Ikhfa)</li><li><strong>Mim Sukun</strong> (Idzhar Syafawi, Idghom Mimi, Ikhfa Syafawi)</li><li><strong>Mad</strong> (Mad Thobi\'i, Mad Wajib, Mad Jaiz, dll)</li><li><strong>Qolqolah</strong> (Qolqolah Sughra dan Kubra)</li></ol><p>Belajar tajwid adalah investasi terbaik untuk membaca Al-Quran dengan baik.</p>',
                'status' => 'published',
                'published_at' => now()->subDays(1),
                'views_count' => 278,
                'tags' => ['Ibadah', 'Fiqih'],
            ],
            [
                'title' => 'Tips Menghafal Al-Quran untuk Pemula',
                'slug' => 'tips-menghafal-al-quran-untuk-pemula',
                'excerpt' => 'Menghafal Al-Quran adalah impian setiap muslim. Dengan metode yang tepat dan tekad yang kuat, siapa saja bisa menjadi penghafal Al-Quran.',
                'content' => '<h2>Memulai Perjalanan Menghafal Al-Quran</h2><p>Menghafal Al-Quran (tahfidz) adalah salah satu amal ibadah yang sangat mulia. Rasulullah SAW bersabda: "Sebaik-baik kalian adalah yang mempelajari Al-Quran dan mengajarkannya." (HR. Bukhari)</p><h3>Tips Memulai Menghafal</h3><ol><li><strong>Niat yang Ikhlas</strong> - Niatkan hanya karena Allah</li><li><strong>Perbaiki Bacaan</strong> - Kuasai tajwid terlebih dahulu</li><li><strong>Konsisten</strong> - Tetapkan target harian yang realistis</li><li><strong>Pilih Waktu Terbaik</strong> - Subuh adalah waktu terbaik untuk menghafal</li><li><strong>Muraja\'ah Rutin</strong> - Ulang hafalan lama secara berkala</li><li><strong>Cari Guru/Mentor</strong> - Bergabung dengan halaqah tahfidz</li></ol><h3>Metode Menghafal</h3><ul><li><strong>Wahdah</strong> - Mengulang satu ayat berkali-kali</li><li><strong>Kitabah</strong> - Menulis ayat yang akan dihafal</li><li><strong>Sima\'i</strong> - Mendengarkan bacaan berulang-ulang</li></ul><p>Ingat, kunci sukses menghafal Al-Quran adalah <strong>istiqomah</strong> (konsisten) dan <strong>muraja\'ah</strong> (mengulang).</p>',
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
                // Update existing article content
                $existingArticle->update($articleData);
                $this->command->info('🔄 Artikel "' . $articleData['title'] . '" berhasil diupdate');
                $article = $existingArticle;
            } else {
                // Create new article
                $article = Article::create(array_merge($articleData, [
                    'author_id' => $author->id,
                ]));
                $this->command->info('✅ Artikel "' . $articleData['title'] . '" berhasil dibuat');
            }

            // Attach/sync tags
            if (!empty($tags)) {
                $tagIds = [];
                foreach ($tags as $tagName) {
                    $tag = Tag::where('name', $tagName)->first();
                    if ($tag) {
                        $tagIds[] = $tag->id;
                    }
                }
                
                if (!empty($tagIds)) {
                    $article->tags()->sync($tagIds);
                }
            }
        }

        $totalArticles = count($articlesData);
        $publishedCount = collect($articlesData)->where('status', 'published')->count();
        $draftCount = collect($articlesData)->where('status', 'draft')->count();
        
        $this->command->info('');
        $this->command->info('✅ Seeded ' . $totalArticles . ' artikel successfully with tags!');
        $this->command->info('📊 Published: ' . $publishedCount . ' | Draft: ' . $draftCount);
    }
}
