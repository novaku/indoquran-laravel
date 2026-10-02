<?php

namespace Tests\Unit\Helpers;

use Tests\TestCase;

class AssetHelperTest extends TestCase
{
    public function test_asset_url_in_testing_environment(): void
    {
        $url = asset_url('css/app.css');

        $this->assertStringContainsString('css/app.css', $url);
        $this->assertStringNotContainsString('/public/css/app.css', $url);
    }

    public function test_route_url_in_testing_environment(): void
    {
        $url = route_url('surah/1');

        $this->assertStringContainsString('surah/1', $url);
        $this->assertStringNotContainsString('/public/surah/1', $url);
    }

    public function test_asset_url_in_production_environment(): void
    {
        $this->app['env'] = 'production';

        $url = asset_url('css/app.css');

        $this->assertStringContainsString('/public/css/app.css', $url);
    }

    public function test_route_url_in_production_environment(): void
    {
        $this->app['env'] = 'production';

        $url = route_url('surah/1');

        $this->assertStringContainsString('/public/surah/1', $url);
    }
}
