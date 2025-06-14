<?php
/**
 * SEO Health Check for IndoQuran
 * Comprehensive SEO validation script
 */

echo "🔍 IndoQuran SEO Health Check\n";
echo "=============================\n\n";

// Check if server is running
$baseUrl = 'http://127.0.0.1:8000';
$context = stream_context_create([
    'http' => [
        'timeout' => 10,
        'user_agent' => 'SEO-Health-Check/1.0'
    ]
]);

function checkUrl($url, $context) {
    $headers = @get_headers($url, 1, $context);
    return $headers !== false;
}

function getContent($url, $context) {
    return @file_get_contents($url, false, $context);
}

function checkMetaTag($content, $name, $property = null) {
    if ($property) {
        $pattern = '/content=["\']([^"\']*)["\'].*property=["\']' . preg_quote($property, '/') . '["\']|property=["\']' . preg_quote($property, '/') . '["\'].*content=["\']([^"\']*)["\']/' ;
    } else {
        $pattern = '/name=["\']' . preg_quote($name, '/') . '["\'].*content=["\']([^"\']*)["\']|content=["\']([^"\']*)["\'].*name=["\']' . preg_quote($name, '/') . '["\']/' ;
    }
    
    if (preg_match($pattern, $content, $matches)) {
        return $matches[1] ?: $matches[2];
    }
    return false;
}

// 1. Check if server is running
echo "🌐 Server Connectivity\n";
echo "---------------------\n";
if (checkUrl($baseUrl, $context)) {
    echo "✅ Server is accessible at $baseUrl\n";
} else {
    echo "❌ Server is not accessible at $baseUrl\n";
    echo "Please run: php artisan serve\n";
    exit(1);
}

// 2. Check robots.txt
echo "\n🤖 Robots.txt Validation\n";
echo "-----------------------\n";
$robotsContent = getContent("$baseUrl/robots.txt", $context);
if ($robotsContent) {
    echo "✅ robots.txt is accessible\n";
    if (strpos($robotsContent, 'my.indoquran.web.id') !== false) {
        echo "✅ Correct domain in robots.txt\n";
    } else {
        echo "⚠️  Domain not found in robots.txt\n";
    }
    if (strpos($robotsContent, 'Sitemap:') !== false) {
        echo "✅ Sitemap reference found\n";
    } else {
        echo "❌ Sitemap reference missing\n";
    }
} else {
    echo "❌ robots.txt not accessible\n";
}

// 3. Check sitemap.xml
echo "\n🗺️  Sitemap Validation\n";
echo "--------------------\n";
$sitemapContent = getContent("$baseUrl/sitemap.xml", $context);
if ($sitemapContent) {
    echo "✅ sitemap.xml is accessible\n";
    if (strpos($sitemapContent, 'my.indoquran.web.id') !== false) {
        echo "✅ Correct domain in sitemap\n";
    } else {
        echo "⚠️  Domain not found in sitemap\n";
    }
    $urlCount = substr_count($sitemapContent, '<url>');
    echo "✅ Sitemap contains $urlCount URLs\n";
} else {
    echo "❌ sitemap.xml not accessible\n";
}

// 4. Check PWA manifest
echo "\n📱 PWA Manifest Validation\n";
echo "-------------------------\n";
$manifestContent = getContent("$baseUrl/site.webmanifest", $context);
if ($manifestContent) {
    echo "✅ site.webmanifest is accessible\n";
    $manifest = json_decode($manifestContent, true);
    if ($manifest) {
        if (isset($manifest['name']) && $manifest['name'] === 'IndoQuran - Al-Quran Digital Indonesia') {
            echo "✅ Correct app name in manifest\n";
        } else {
            echo "⚠️  App name not found or incorrect\n";
        }
        if (isset($manifest['theme_color'])) {
            echo "✅ Theme color defined: {$manifest['theme_color']}\n";
        }
    }
} else {
    echo "❌ site.webmanifest not accessible\n";
}

// 5. Check homepage SEO
echo "\n🏠 Homepage SEO Validation\n";
echo "-------------------------\n";
$homepageContent = getContent($baseUrl, $context);
if ($homepageContent) {
    echo "✅ Homepage is accessible\n";
    
    // Check title
    if (preg_match('/<title[^>]*>([^<]+)<\/title>/', $homepageContent, $matches)) {
        echo "✅ Title tag found: " . trim($matches[1]) . "\n";
    } else {
        echo "❌ Title tag missing\n";
    }
    
    // Check meta description
    $description = checkMetaTag($homepageContent, 'description');
    if ($description) {
        echo "✅ Meta description found (" . strlen($description) . " chars)\n";
    } else {
        echo "❌ Meta description missing\n";
    }
    
    // Check Open Graph
    $ogTitle = checkMetaTag($homepageContent, null, 'og:title');
    if ($ogTitle) {
        echo "✅ Open Graph title found\n";
    } else {
        echo "❌ Open Graph title missing\n";
    }
    
    // Check structured data
    if (strpos($homepageContent, 'application/ld+json') !== false) {
        echo "✅ Structured data found\n";
    } else {
        echo "❌ Structured data missing\n";
    }
    
    // Check canonical URL
    if (preg_match('/<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']*)["\']/', $homepageContent, $matches)) {
        echo "✅ Canonical URL found: " . $matches[1] . "\n";
    } else {
        echo "⚠️  Canonical URL not found\n";
    }
} else {
    echo "❌ Homepage not accessible\n";
}

// 6. Check specific surah page
echo "\n📖 Surah Page SEO Validation\n";
echo "----------------------------\n";
$surahContent = getContent("$baseUrl/surah/1", $context);
if ($surahContent) {
    echo "✅ Surah page is accessible\n";
    
    // Check dynamic title
    if (preg_match('/<title[^>]*>([^<]+)<\/title>/', $surahContent, $matches)) {
        $title = trim($matches[1]);
        if (strpos($title, 'Al-Fatihah') !== false) {
            echo "✅ Dynamic title found: $title\n";
        } else {
            echo "⚠️  Dynamic title may not be working: $title\n";
        }
    }
    
    // Check dynamic meta description
    $surahDesc = checkMetaTag($surahContent, 'description');
    if ($surahDesc && strpos($surahDesc, 'Al-Fatihah') !== false) {
        echo "✅ Dynamic meta description found\n";
    } else {
        echo "⚠️  Dynamic meta description may not be working\n";
    }
} else {
    echo "❌ Surah page not accessible\n";
}

// 7. Performance checks
echo "\n⚡ Performance Indicators\n";
echo "-----------------------\n";

// Check gzip compression (look for headers)
$headers = get_headers("$baseUrl", 1, $context);
if ($headers && isset($headers['Content-Encoding']) && strpos($headers['Content-Encoding'], 'gzip') !== false) {
    echo "✅ Gzip compression enabled\n";
} else {
    echo "⚠️  Gzip compression not detected\n";
}

// Check if critical resources are accessible
$criticalResources = [
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/apple-touch-icon.png',
    '/favicon.ico'
];

echo "\n🎯 Critical Resources\n";
echo "--------------------\n";
foreach ($criticalResources as $resource) {
    if (checkUrl("$baseUrl$resource", $context)) {
        echo "✅ $resource is accessible\n";
    } else {
        echo "❌ $resource is missing\n";
    }
}

// SEO Score calculation
echo "\n📊 SEO Health Score\n";
echo "==================\n";

$checks = [
    'Server accessible' => checkUrl($baseUrl, $context),
    'Robots.txt accessible' => (bool)getContent("$baseUrl/robots.txt", $context),
    'Sitemap.xml accessible' => (bool)getContent("$baseUrl/sitemap.xml", $context),
    'PWA manifest accessible' => (bool)getContent("$baseUrl/site.webmanifest", $context),
    'Homepage accessible' => (bool)getContent($baseUrl, $context),
    'Surah page accessible' => (bool)getContent("$baseUrl/surah/1", $context),
    'Homepage has title' => preg_match('/<title[^>]*>([^<]+)<\/title>/', $homepageContent ?? ''),
    'Homepage has meta description' => (bool)checkMetaTag($homepageContent ?? '', 'description'),
    'Homepage has Open Graph' => (bool)checkMetaTag($homepageContent ?? '', null, 'og:title'),
    'Homepage has structured data' => strpos($homepageContent ?? '', 'application/ld+json') !== false,
];

$passed = array_sum($checks);
$total = count($checks);
$score = round(($passed / $total) * 100);

echo "Score: $passed/$total checks passed ($score%)\n";

if ($score >= 90) {
    echo "🎉 Excellent! Your SEO setup is in great shape.\n";
} elseif ($score >= 70) {
    echo "👍 Good! Minor improvements needed.\n";
} elseif ($score >= 50) {
    echo "⚠️  Fair. Several improvements needed.\n";
} else {
    echo "❌ Poor. Major SEO issues need attention.\n";
}

echo "\n✨ SEO Recommendations:\n";
echo "----------------------\n";
echo "1. Validate structured data with Google's Rich Results Test\n";
echo "2. Test social media previews with Facebook Sharing Debugger\n";
echo "3. Check page speed with Google PageSpeed Insights\n";
echo "4. Submit sitemap to Google Search Console\n";
echo "5. Monitor Core Web Vitals\n";
echo "6. Test mobile-friendliness\n";
echo "7. Check HTTPS implementation in production\n";

echo "\nValidation completed! ✅\n";
?>
