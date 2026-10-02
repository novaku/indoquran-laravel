<?php

namespace Tests\Unit\Services;

use App\Services\PerformanceOptimizationService;
use PHPUnit\Framework\TestCase;

class PerformanceOptimizationServiceTest extends TestCase
{
    public function test_get_critical_css(): void
    {
        $css = PerformanceOptimizationService::getCriticalCSS();

        $this->assertIsString($css);
        $this->assertStringContainsString('<style>', $css);
        $this->assertStringContainsString('box-sizing: border-box;', $css);
        $this->assertStringContainsString('.loading-screen', $css);
        $this->assertStringContainsString('.loader', $css);
        $this->assertStringContainsString('</style>', $css);
    }

    public function test_get_resource_hints(): void
    {
        $hints = PerformanceOptimizationService::getResourceHints();

        $this->assertIsArray($hints);
        $this->assertArrayHasKey('preconnect', $hints);
        $this->assertArrayHasKey('dns-prefetch', $hints);
        $this->assertArrayHasKey('preload', $hints);
        $this->assertContains('https://fonts.googleapis.com', $hints['preconnect']);
        $this->assertContains('https://api.indoquran.web.id', $hints['dns-prefetch']);
    }

    public function test_minify_html(): void
    {
        $input = "  <div>\n    <!-- This is a comment -->\n    <p>Hello   World</p>  \n  </div>  ";
        $minified = PerformanceOptimizationService::minifyHTML($input);

        $this->assertStringNotContainsString('This is a comment', $minified);
        $this->assertStringNotContainsString("\n", $minified);
        $this->assertEquals('<div><p>Hello World</p></div>', $minified);
    }

    public function test_get_performance_monitoring_script(): void
    {
        $script = PerformanceOptimizationService::getPerformanceMonitoringScript();

        $this->assertIsString($script);
        $this->assertStringContainsString('<script>', $script);
        $this->assertStringContainsString('getCLS', $script);
        $this->assertStringContainsString('getFCP', $script);
        $this->assertStringContainsString('getLCP', $script);
        $this->assertStringContainsString('</script>', $script);
    }

    public function test_get_loading_screen(): void
    {
        $html = PerformanceOptimizationService::getLoadingScreen();

        $this->assertIsString($html);
        $this->assertStringContainsString('id="loading-screen"', $html);
        $this->assertStringContainsString('class="loader"', $html);
        $this->assertStringContainsString('<script>', $html);
    }
}
