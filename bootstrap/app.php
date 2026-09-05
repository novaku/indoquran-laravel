<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        api: __DIR__.'/../routes/api.php',
        health: '/up'
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->redirectGuestsTo('/masuk');

        // Add SSL error filtering for local development (highest priority)
        $middleware->web(prepend: [
            \App\Http\Middleware\ExcludeSSLErrorsMiddleware::class,
            \App\Http\Middleware\DomainRedirectMiddleware::class,
            \App\Http\Middleware\CanonicalUrlRedirect::class, // Canonical URL enforcement
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        $middleware->web(append: [
            \App\Http\Middleware\ContentSecurityPolicy::class,
            \App\Http\Middleware\TrackVisitor::class,
            \App\Http\Middleware\SEOMiddleware::class,
            \App\Http\Middleware\SetProperHttpStatus::class, // Prevent soft 404 errors
        ]);
        
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        $middleware->api([
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
        
        // Register the InternalAccessOnly middleware
        $middleware->alias([
            'domain.redirect' => \App\Http\Middleware\DomainRedirectMiddleware::class,
            'internal.only' => \App\Http\Middleware\InternalAccessOnly::class,
            'simple.auth' => \App\Http\Middleware\SimpleAuthMiddleware::class,
            'api.cache' => \App\Http\Middleware\ApiCacheMiddleware::class,
            'cors.proxy' => \App\Http\Middleware\CorsProxyMiddleware::class, // Add our CORS proxy middleware
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'seo' => \App\Http\Middleware\SEOMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
