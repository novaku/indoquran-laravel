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
        // Add CORS middleware globally
        $middleware->web(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        $middleware->web(append: [
            \App\Http\Middleware\ContentSecurityPolicy::class,
        ]);
        
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        $middleware->api([
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
        
        // Register the InternalAccessOnly middleware
        $middleware->alias([
            'internal.only' => \App\Http\Middleware\InternalAccessOnly::class,
            'simple.auth' => \App\Http\Middleware\SimpleAuthMiddleware::class,
            'api.cache' => \App\Http\Middleware\ApiCacheMiddleware::class,
            'cors.proxy' => \App\Http\Middleware\CorsProxyMiddleware::class, // Add our CORS proxy middleware
        ]);
        
        // Configure authentication redirects
        $middleware->redirectUsersTo(fn () => route('login'));
        $middleware->redirectGuestsTo(fn () => route('login'));
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
