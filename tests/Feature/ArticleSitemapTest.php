<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\User;
use App\Services\ArticleSitemapService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class ArticleSitemapTest extends TestCase
{
    use RefreshDatabase;

    protected ?string $originalSitemapArtikelContent = null;

    protected ?string $originalSitemapIndexContent = null;

    protected string $sitemapArtikelPath;

    protected string $sitemapIndexPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->sitemapArtikelPath = public_path('sitemap-artikel.xml');
        $this->sitemapIndexPath = public_path('sitemap-index.xml');

        // Backup existing sitemap files to prevent polluting working tree
        if (File::exists($this->sitemapArtikelPath)) {
            $this->originalSitemapArtikelContent = File::get($this->sitemapArtikelPath);
        }
        if (File::exists($this->sitemapIndexPath)) {
            $this->originalSitemapIndexContent = File::get($this->sitemapIndexPath);
        }
    }

    protected function tearDown(): void
    {
        // Restore backed up files
        if ($this->originalSitemapArtikelContent !== null) {
            File::put($this->sitemapArtikelPath, $this->originalSitemapArtikelContent);
        } elseif (File::exists($this->sitemapArtikelPath)) {
            File::delete($this->sitemapArtikelPath);
        }

        if ($this->originalSitemapIndexContent !== null) {
            File::put($this->sitemapIndexPath, $this->originalSitemapIndexContent);
        } elseif (File::exists($this->sitemapIndexPath)) {
            File::delete($this->sitemapIndexPath);
        }

        parent::tearDown();
    }

    public function test_creating_draft_article_does_not_add_to_sitemap(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->postJson('/api/admin/articles', [
            'title' => 'Artikel Masih Draf Baru',
            'content' => '<p>Konten artikel draf yang belum terbit.</p>',
            'status' => 'draft',
        ]);

        $response->assertStatus(201);
        $article = Article::where('title', 'Artikel Masih Draf Baru')->first();
        $this->assertNotNull($article);

        $sitemapContent = File::get($this->sitemapArtikelPath);
        $this->assertStringNotContainsString('/artikel/artikel-masih-draf-baru', $sitemapContent);
    }

    public function test_creating_published_article_updates_sitemap_file(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->postJson('/api/admin/articles', [
            'title' => 'Panduan Belajar Tajwid Lengkap',
            'content' => '<p>Panduan membaca Al-Quran dengan baik dan benar.</p>',
            'status' => 'published',
        ]);

        $response->assertStatus(201);
        $article = Article::where('title', 'Panduan Belajar Tajwid Lengkap')->first();
        $this->assertNotNull($article);
        $this->assertEquals('published', $article->status);
        $this->assertNotNull($article->published_at);

        $this->assertTrue(File::exists($this->sitemapArtikelPath));
        $sitemapContent = File::get($this->sitemapArtikelPath);
        $this->assertStringContainsString('/artikel/panduan-belajar-tajwid-lengkap', $sitemapContent);
        $this->assertStringContainsString('<priority>0.85</priority>', $sitemapContent);
    }

    public function test_updating_article_status_from_draft_to_published_updates_sitemap(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        $article = Article::create([
            'title' => 'Keutamaan Surah Al-Kahfi di Hari Jumat',
            'content' => '<p>Membaca surat Al Kahfi di hari jumat bercahaya hingga jumat berikutnya.</p>',
            'author_id' => $admin->id,
            'status' => 'draft',
        ]);

        // Initially ensure not in sitemap
        app(ArticleSitemapService::class)->updateSitemapFile();
        $initialContent = File::get($this->sitemapArtikelPath);
        $this->assertStringNotContainsString('keutamaan-surah-al-kahfi-di-hari-jumat', $initialContent);

        // Edit and publish the article
        $response = $this->actingAs($admin)->putJson("/api/admin/articles/{$article->id}", [
            'title' => 'Keutamaan Surah Al-Kahfi di Hari Jumat',
            'content' => '<p>Membaca surat Al Kahfi di hari jumat bercahaya hingga jumat berikutnya.</p>',
            'status' => 'published',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('published', $article->fresh()->status);

        $updatedContent = File::get($this->sitemapArtikelPath);
        $this->assertStringContainsString('/artikel/keutamaan-surah-al-kahfi-di-hari-jumat', $updatedContent);
    }

    public function test_updating_published_article_retains_and_updates_sitemap(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        $article = Article::create([
            'title' => 'Judul Awal Artikel',
            'slug' => 'judul-awal-artikel',
            'content' => '<p>Konten awal artikel.</p>',
            'author_id' => $admin->id,
            'status' => 'published',
            'published_at' => now(),
        ]);

        app(ArticleSitemapService::class)->updateSitemapFile();
        $initialContent = File::get($this->sitemapArtikelPath);
        $this->assertStringContainsString('/artikel/judul-awal-artikel', $initialContent);

        // Update article title and slug
        $response = $this->actingAs($admin)->putJson("/api/admin/articles/{$article->id}", [
            'title' => 'Judul Baru Artikel Setelah Diedit',
            'slug' => 'judul-baru-artikel-setelah-diedit',
            'content' => '<p>Konten baru artikel yang sudah diperbarui.</p>',
            'status' => 'published',
        ]);

        $response->assertStatus(200);

        $updatedContent = File::get($this->sitemapArtikelPath);
        $this->assertStringNotContainsString('/artikel/judul-awal-artikel', $updatedContent);
        $this->assertStringContainsString('/artikel/judul-baru-artikel-setelah-diedit', $updatedContent);
    }

    public function test_changing_published_article_to_draft_removes_it_from_sitemap(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        $article = Article::create([
            'title' => 'Artikel Mau Ditarik Kembali',
            'content' => '<p>Konten artikel yang akan ditarik ke draf.</p>',
            'author_id' => $admin->id,
            'status' => 'published',
            'published_at' => now(),
        ]);

        app(ArticleSitemapService::class)->updateSitemapFile();
        $initialContent = File::get($this->sitemapArtikelPath);
        $this->assertStringContainsString('/artikel/artikel-mau-ditarik-kembali', $initialContent);

        // Change status to draft
        $response = $this->actingAs($admin)->putJson("/api/admin/articles/{$article->id}", [
            'title' => 'Artikel Mau Ditarik Kembali',
            'content' => '<p>Konten artikel yang akan ditarik ke draf.</p>',
            'status' => 'draft',
        ]);

        $response->assertStatus(200);

        $updatedContent = File::get($this->sitemapArtikelPath);
        $this->assertStringNotContainsString('/artikel/artikel-mau-ditarik-kembali', $updatedContent);
    }

    public function test_deleting_published_article_removes_it_from_sitemap(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['is_admin' => true]);

        $article = Article::create([
            'title' => 'Artikel Yang Mau Dihapus',
            'content' => '<p>Konten akan dihapus.</p>',
            'author_id' => $admin->id,
            'status' => 'published',
            'published_at' => now(),
        ]);

        app(ArticleSitemapService::class)->updateSitemapFile();
        $initialContent = File::get($this->sitemapArtikelPath);
        $this->assertStringContainsString('/artikel/artikel-yang-mau-dihapus', $initialContent);

        // Delete article
        $response = $this->actingAs($admin)->deleteJson("/api/admin/articles/{$article->id}");
        $response->assertStatus(200);

        $updatedContent = File::get($this->sitemapArtikelPath);
        $this->assertStringNotContainsString('/artikel/artikel-yang-mau-dihapus', $updatedContent);
    }

    public function test_sitemap_artikel_endpoint_returns_xml_with_published_articles(): void
    {
        $user = User::factory()->create();

        Article::create([
            'title' => 'Artikel Tes Endpoint',
            'content' => '<p>Konten tes endpoint.</p>',
            'author_id' => $user->id,
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->get('/sitemap-artikel.xml');

        $response->assertStatus(200);
        $this->assertStringContainsString('application/xml', $response->headers->get('Content-Type') ?? '');

        $content = $response->getContent();
        $this->assertStringContainsString('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', $content);
        $this->assertStringContainsString('/artikel', $content);
        $this->assertStringContainsString('/artikel/artikel-tes-endpoint', $content);
    }

    public function test_sitemap_index_lastmod_is_updated_when_article_sitemap_changes(): void
    {
        // Setup a dummy sitemap-index.xml
        $dummyIndex = <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://indoquran.web.id/sitemap-artikel.xml</loc>
    <lastmod>2020-01-01T00:00:00Z</lastmod>
  </sitemap>
</sitemapindex>
XML;
        File::put($this->sitemapIndexPath, $dummyIndex);

        $service = app(ArticleSitemapService::class);
        $service->updateSitemapIndexEntry();

        $updatedIndex = File::get($this->sitemapIndexPath);
        $this->assertStringNotContainsString('2020-01-01T00:00:00Z', $updatedIndex);
        $this->assertStringContainsString(Carbon::now()->format('Y-m-d'), $updatedIndex);
    }
}
