<?php

namespace Tests\Feature;

use App\Http\Controllers\HaditsController;
use App\Models\Ayah;
use App\Models\Surah;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed sample data in hadits table for testing
        DB::table('hadits_shahih_al_bukhari')->insert([
            [
                'id' => 1,
                'no' => 1,
                'kitab' => 'Shahih Al-Bukhari',
                'kategori' => 'Kitab Permulaan Wahyu',
                'arab' => 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
                'indonesia' => 'Sesungguhnya amal perbuatan itu tergantung niatnya.',
                'penjelasan' => '<p>Penjelasan hadits niat.</p>',
            ],
            [
                'id' => 2,
                'no' => 2,
                'kitab' => 'Shahih Al-Bukhari',
                'kategori' => 'Kitab Iman',
                'arab' => 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ',
                'indonesia' => 'Islam dibangun di atas lima perkara.',
                'penjelasan' => '<p>Penjelasan rukun Islam.</p>',
            ],
        ]);
    }

    public function test_sitemap_index_endpoint_returns_xml_with_all_7_hadits_books(): void
    {
        $response = $this->get('/sitemap-index.xml');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/xml');

        $content = $response->getContent();
        $this->assertStringContainsString('sitemap-hadits-main.xml', $content);

        foreach (HaditsController::getKitabCatalog() as $slug => $kitab) {
            $this->assertStringContainsString("sitemap-hadits-{$slug}.xml", $content);
        }
    }

    public function test_hadits_index_sitemap_endpoint_returns_all_7_books(): void
    {
        $response = $this->get('/sitemap-hadits.xml');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/xml');

        $content = $response->getContent();
        $this->assertStringContainsString('sitemap-hadits-main.xml', $content);

        foreach (HaditsController::getKitabCatalog() as $slug => $kitab) {
            $this->assertStringContainsString("sitemap-hadits-{$slug}.xml", $content);
        }
    }

    public function test_hadits_main_sitemap_contains_all_7_book_pages(): void
    {
        $response = $this->get('/sitemap-hadits-main.xml');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/xml');

        $content = $response->getContent();
        $this->assertStringContainsString('/hadits', $content);

        foreach (HaditsController::getKitabCatalog() as $slug => $kitab) {
            $this->assertStringContainsString("/hadits/{$slug}", $content);
        }
    }

    public function test_individual_hadits_kitab_sitemap_returns_urls(): void
    {
        $response = $this->get('/sitemap-hadits-shahih_bukhari.xml');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/xml');

        $content = $response->getContent();
        $this->assertStringContainsString('/hadits/shahih_bukhari/1', $content);
        $this->assertStringContainsString('/hadits/shahih_bukhari/2', $content);
    }

    public function test_individual_hadits_kitab_sitemap_returns_404_for_invalid_kitab(): void
    {
        $response = $this->get('/sitemap-hadits-kitab_tidak_ada.xml');
        $response->assertStatus(404);
    }

    public function test_hadits_alias_redirects_to_canonical_url(): void
    {
        $response = $this->get('/hadits/bukhari');
        $response->assertStatus(301);
        $response->assertRedirect(url('/hadits/shahih_bukhari'));

        $responseWithNumber = $this->get('/hadits/bukhari/1');
        $responseWithNumber->assertStatus(301);
        $responseWithNumber->assertRedirect(url('/hadits/shahih_bukhari/1'));
    }

    public function test_hadits_route_redirects_out_of_bounds_number_to_kitab_page(): void
    {
        $response = $this->get('/hadits/shahih_bukhari/999999');
        $response->assertStatus(301);
        $response->assertRedirect(url('/hadits/shahih_bukhari'));

        // Test out of bounds for Musnad Ahmad (reported in GSC 404 validation)
        $responseAhmad = $this->get('/hadits/musnad_ahmad/14908');
        $responseAhmad->assertStatus(301);
        $responseAhmad->assertRedirect(url('/hadits/musnad_ahmad'));
    }

    public function test_deprecated_hadits_kitabs_redirect_to_hadits_hub(): void
    {
        // Deprecated hadith books previously in sitemaps / index
        $responseSyafii = $this->get('/hadits/musnad_syafii');
        $responseSyafii->assertStatus(301);
        $responseSyafii->assertRedirect(url('/hadits'));

        $responseRiyadhus = $this->get('/hadits/riyadhus_shalihin');
        $responseRiyadhus->assertStatus(301);
        $responseRiyadhus->assertRedirect(url('/hadits'));

        $responseMalik = $this->get('/hadits/muwatho_malik');
        $responseMalik->assertStatus(301);
        $responseMalik->assertRedirect(url('/hadits'));

        $responseDarimi = $this->get('/hadits/musnad_darimi');
        $responseDarimi->assertStatus(301);
        $responseDarimi->assertRedirect(url('/hadits'));
    }

    public function test_legacy_view_ayat_with_trailing_punctuation_redirects(): void
    {
        $response = $this->get('/quran/viewAyat/1264,');
        $response->assertStatus(301);
    }

    public function test_invalid_hadits_routes_return_404(): void
    {
        // Non-numeric hadith number should return 404
        $responseNonNumeric = $this->get('/hadits/shahih_bukhari/abc');
        $responseNonNumeric->assertStatus(404);

        // Unknown book that was never part of catalog should return 404
        $responseUnknown = $this->get('/hadits/unknown_book_slug');
        $responseUnknown->assertStatus(404);
    }

    public function test_generate_comprehensive_sitemap_command(): void
    {
        $this->artisan('sitemap:generate-comprehensive', ['--production' => true])
            ->assertExitCode(0);

        $this->assertTrue(File::exists(public_path('sitemap-hadits.xml')));
        $this->assertTrue(File::exists(public_path('sitemap-hadits-main.xml')));

        foreach (HaditsController::getKitabCatalog() as $slug => $kitab) {
            $this->assertTrue(File::exists(public_path("sitemap-hadits-{$slug}.xml")));
        }

        // Validate that obsolete sitemaps are not present
        $this->assertFalse(File::exists(public_path('sitemap-hadits-musnad_darimi.xml')));
        $this->assertFalse(File::exists(public_path('sitemap-hadits-musnad_syafii.xml')));
        $this->assertFalse(File::exists(public_path('sitemap-hadits-muwatho_malik.xml')));
        $this->assertFalse(File::exists(public_path('sitemap-hadits-riyadhus_shalihin.xml')));
    }

    public function test_validate_sitemap_command_passes(): void
    {
        $this->artisan('sitemap:validate', ['--production' => true])
            ->assertExitCode(0);
    }

    public function test_homepage_seo_and_faq_schema(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('Al Quran Online Indonesia - Baca Al-Quran Digital 30 Juz & Hadits | IndoQuran');
        $response->assertSee('FAQPage');
        $response->assertSee('Bagaimana cara membaca Al-Quran online di IndoQuran?');
        $response->assertSee('Surah Populer Paling Sering Dibaca');
        $response->assertSee('Surat Yasin');
        $response->assertSee('Surat Al-Kahfi');
        $response->assertSee('Surat Al-Mulk');
        $response->assertSee('Juz 30');
    }

    public function test_surah_seo_and_structured_data(): void
    {
        Surah::create([
            'number' => 1,
            'name_latin' => 'Al-Fatihah',
            'name_arabic' => 'الفاتحة',
            'name_indonesian' => 'Pembukaan',
            'total_ayahs' => 7,
            'revelation_place' => 'Mekah',
            'description_short' => 'Surah pembukaan Al-Quran',
            'description_long' => 'Deskripsi lengkap Surah Al-Fatihah'
        ]);

        $response = $this->get('/surah/1');
        $response->assertStatus(200);
        $response->assertSee('FAQPage');
        $response->assertSee('Book');
        $response->assertSee('Berapa jumlah ayat Surah Al-Fatihah');
    }

    public function test_juz_30_seo(): void
    {
        $response = $this->get('/juz/30');
        $response->assertStatus(200);
        $response->assertSee('Juz 30 (Juz Amma) Lengkap Teks Arab, Latin & Terjemahan | IndoQuran');
    }

    public function test_topic_sitemap_endpoint(): void
    {
        $response = $this->get('/sitemap-hadits-topik.xml');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/xml');
        $content = $response->getContent();
        $this->assertStringContainsString('/hadits/tentang/takdir', $content);
        $this->assertStringContainsString('/hadits/tentang/shalat', $content);
    }

    public function test_juz_15_seo_content_and_faq_schema(): void
    {
        $response = $this->get('/juz/15');
        $response->assertStatus(200);
        $response->assertSee('Juz 15');
        $response->assertSee('Al-Isra');
        $response->assertSee('Al-Kahf');
        $response->assertSee('halaman 282');
        $response->assertSee('FAQPage');
    }

    public function test_juz_index_seo_answers_search_queries(): void
    {
        $response = $this->get('/juz');
        $response->assertStatus(200);
        $response->assertSee('Daftar 30 Juz Al-Quran Lengkap');
        $response->assertSee('30 juz berapa halaman?');
        $response->assertSee('1 juz berapa halaman');
        $response->assertSee('FAQPage');
    }

    public function test_halaman_seo_and_muka_surat(): void
    {
        $response = $this->get('/halaman/295');
        $response->assertStatus(200);
        $response->assertSee('Al Quran Halaman 295');
        $response->assertSee('Muka Surat 295');
        $response->assertSee('FAQPage');
    }

    public function test_halaman_index_seo(): void
    {
        $response = $this->get('/halaman');
        $response->assertStatus(200);
        $response->assertSee('Daftar 604 Halaman');
        $response->assertSee('FAQPage');
    }

    public function test_ayah_detail_has_self_canonical_and_structured_data(): void
    {
        $surah = Surah::create([
            'number' => 14,
            'name_latin' => 'Ibrahim',
            'name_arabic' => 'إبراهيم',
            'name_indonesian' => 'Ibrahim',
            'total_ayahs' => 52,
            'revelation_place' => 'Mekah',
            'description_short' => 'Surah Ibrahim',
            'description_long' => 'Deskripsi lengkap Surah Ibrahim'
        ]);

        Ayah::create([
            'surah_number' => 14,
            'ayah_number' => 9,
            'text_arabic' => 'أَلَمْ يَأْتِكُمْ نَبَؤُا۟ ٱلَّذِينَ مِن قَبْلِكُمْ',
            'text_latin' => 'Alam ya\'tikum naba\'ul ladhina min qablikum',
            'text_indonesian' => 'Apakah belum sampai kepadamu berita orang-orang sebelum kamu',
            'juz' => 13,
            'page' => 256,
        ]);

        $response = $this->get('/surah/14/9');
        $response->assertStatus(200);
        // Canonical must point directly to /surah/14/9 (not parent /surah/14)
        $response->assertSee('<link rel="canonical" href="' . url('/surah/14/9') . '"', false);
        $response->assertSee('Surat Ibrahim Ayat 9');
        $response->assertSee('FAQPage');
        $response->assertSee('Apakah belum sampai kepadamu berita orang-orang sebelum kamu');
    }

    public function test_seo_keyword_redirects(): void
    {
        $this->get('/al-quran-halaman-295')->assertRedirect('/halaman/295');
        $this->get('/muka-surat-295')->assertRedirect('/halaman/295');
        $this->get('/al-quran-juz-15')->assertRedirect('/juz/15');
        $this->get('/surat-14-ayat-9')->assertRedirect('/surah/14/9');
    }

    public function test_daftar_lengkap_seo(): void
    {
        $response = $this->get('/daftar-lengkap');
        $response->assertStatus(200);
        $response->assertSee('<link rel="canonical" href="' . url('/daftar-lengkap') . '"', false);
        $response->assertSee('Daftar Lengkap Al-Quran Indonesia');
    }

    public function test_robots_txt_allows_cari(): void
    {
        $controller = new \App\Http\Controllers\SitemapController();
        $response = $controller->robots();
        $content = $response->getContent();

        $this->assertStringContainsString("Allow: /cari\n", $content);
        $this->assertStringNotContainsString("Disallow: /cari?\n", $content);
        $this->assertStringNotContainsString("Disallow: /cari/*\n", $content);
    }

    public function test_cari_search_query_sets_noindex_and_canonical(): void
    {
        $response = $this->get('/cari?q=az+zukhruf');
        $response->assertStatus(200);
        $response->assertSee('<meta name="robots" content="noindex, follow">', false);
        $response->assertSee('<link rel="canonical" href="' . url('/cari') . '">', false);
    }

    public function test_cari_index_sets_index_follow(): void
    {
        $response = $this->get('/cari');
        $response->assertStatus(200);
        $response->assertSee('index, follow', false);
        $response->assertSee('<link rel="canonical" href="' . url('/cari') . '">', false);
    }

    public function test_no_erroneous_hreflang_x_default_pointing_to_root(): void
    {
        Surah::create([
            'number' => 9,
            'name_latin' => 'At-Taubah',
            'name_arabic' => 'التوبة',
            'name_indonesian' => 'Pengampunan',
            'total_ayahs' => 129,
            'revelation_place' => 'Madinah',
            'description_short' => 'Surah At-Taubah',
            'description_long' => 'Deskripsi lengkap Surah At-Taubah'
        ]);

        $response = $this->get('/surah/9');
        $response->assertStatus(200);
        $response->assertDontSee('hreflang="x-default"', false);
        $response->assertSee('<link rel="canonical" href="' . url('/surah/9') . '">', false);
    }

    public function test_halaman_detail_reflects_exact_juz_arabic_numeral_and_last_page(): void
    {
        Surah::create([
            'number' => 18,
            'name_latin' => 'Al-Kahfi',
            'name_arabic' => 'الكهف',
            'name_indonesian' => 'Gua',
            'total_ayahs' => 110,
            'revelation_place' => 'Mekah',
            'description_short' => 'Surah Al-Kahfi',
            'description_long' => 'Deskripsi Surah Al-Kahfi'
        ]);

        Ayah::create([
            'surah_number' => 18,
            'ayah_number' => 1,
            'text_arabic' => 'ٱلْحَمْدُ لِلَّهِ ٱلَّذِىٓ أَنزَلَ عَلَىٰ عَبْدِهِ ٱلْكِتَـٰبَ',
            'text_latin' => 'Alhamdu lillahil ladhi anzala ala abdihil kitab',
            'text_indonesian' => 'Segala puji bagi Allah yang telah menurunkan Kitab (Al-Quran)',
            'juz' => 15,
            'page' => 293,
        ]);

        $response293 = $this->get('/halaman/293');
        $response293->assertStatus(200);
        $response293->assertSee('Juz 15');
        $response293->assertSee('٢٩٣');
        $response293->assertSee('Lembar ke-147');
        $response293->assertSee('Al-Kahfi');

        $response604 = $this->get('/halaman/604');
        $response604->assertStatus(200);
        $response604->assertSee('Halaman Terakhir Al-Quran');
        $response604->assertSee('Lembar ke-302');
    }

    public function test_surah_index_and_asy_syura_and_juz_1_seo(): void
    {
        Surah::create([
            'number' => 42,
            'name_latin' => 'Asy-Syura',
            'name_arabic' => 'الشورى',
            'name_indonesian' => 'Musyawarah',
            'total_ayahs' => 53,
            'revelation_place' => 'Mekah',
            'description_short' => 'Surah Asy-Syura',
            'description_long' => 'Deskripsi Surah Asy-Syura'
        ]);

        $indexResp = $this->get('/surah');
        $indexResp->assertStatus(200);
        $indexResp->assertSee('Daftar Nama-Nama Surah Al-Quran dan Artinya (114 Surah)');

        $syuraResp = $this->get('/surah/42');
        $syuraResp->assertStatus(200);
        $syuraResp->assertSee('Ha Mim');
        $syuraResp->assertSee('Juz 25');

        $juz1Resp = $this->get('/juz/1');
        $juz1Resp->assertStatus(200);
        $juz1Resp->assertSee('Juz 1 berapa surat dan sampai ayat berapa?');
        $juz1Resp->assertSee('148 ayat');

        $juzIndexResp = $this->get('/juz');
        $juzIndexResp->assertStatus(200);
        $juzIndexResp->assertSee('2 juz');
        $juzIndexResp->assertSee('5 juz');
        $juzIndexResp->assertSee('جُزْء');
    }

    public function test_tafsir_maudhui_and_hadits_topic_and_expanded_redirects(): void
    {
        $topic = \App\Models\TafsirMaudhuiTopic::create([
            'topic' => 'Larangan Berjudi dan Minum Khamar',
            'description' => 'Dalil Al-Quran tentang larangan khamar dan minuman keras.',
            'slug' => 'larangan-berjudi-dan-minum-khamar',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        Surah::create([
            'number' => 5,
            'name_latin' => 'Al-Maidah',
            'name_arabic' => 'المائدة',
            'name_indonesian' => 'Hidangan',
            'total_ayahs' => 120,
            'revelation_place' => 'Madinah',
            'description_short' => 'Surah Al-Maidah',
            'description_long' => 'Deskripsi Surah Al-Maidah'
        ]);

        Ayah::create([
            'surah_number' => 5,
            'ayah_number' => 90,
            'text_arabic' => 'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوٓا۟ إِنَّمَا ٱلْخَمْرُ',
            'text_latin' => 'Ya ayyuhal ladhina amanu innamal khamru',
            'text_indonesian' => 'Wahai orang-orang yang beriman! Sesungguhnya minuman keras (khamar)...',
            'juz' => 7,
            'page' => 123,
        ]);

        \App\Models\TafsirMaudhuiVerse::create([
            'topic_id' => $topic->id,
            'surah_number' => 5,
            'ayah_number' => 90,
            'sort_order' => 1,
        ]);

        $tafsirIndex = $this->get('/tafsir-maudhui');
        $tafsirIndex->assertStatus(200);
        $tafsirIndex->assertSee('Larangan Berjudi dan Minum Khamar');

        $tafsirDetail = $this->get('/tafsir-maudhui/larangan-berjudi-dan-minum-khamar');
        $tafsirDetail->assertStatus(200);
        $tafsirDetail->assertSee('Wahai orang-orang yang beriman! Sesungguhnya minuman keras (khamar)');
        $tafsirDetail->assertSee('FAQPage');

        $haditsKhamr = $this->get('/hadits/tentang/khamr');
        $haditsKhamr->assertStatus(200);
        $haditsKhamr->assertSee('Khamr / Khamar &amp; Minuman Keras (Miras)', false);
        $haditsKhamr->assertSee('FAQPage');

        $this->get('/ms-309')->assertRedirect('/halaman/309');
        $this->get('/page-255')->assertRedirect('/halaman/255');
        $this->get('/juz-15-lengkap')->assertRedirect('/juz/15');
        $this->get('/bacaan-juz-3')->assertRedirect('/juz/3');
    }
}

