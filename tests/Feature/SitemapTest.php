<?php

namespace Tests\Feature;

use App\Http\Controllers\HaditsController;
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

    public function test_hadits_route_returns_404_for_out_of_bounds_number(): void
    {
        $response = $this->get('/hadits/shahih_bukhari/999999');
        $response->assertStatus(404);
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
}

