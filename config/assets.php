<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Asset URL
    |--------------------------------------------------------------------------
    |
    | This value determines the "asset" URL for your application.
    | For local development, we ensure this is relative to allow proper font loading.
    |
    */
    'asset_url' => config('app.asset_url'),
    
    /*
    |--------------------------------------------------------------------------
    | Force Local Assets
    |--------------------------------------------------------------------------
    |
    | When this is true, assets will always be loaded locally,
    | regardless of ASSET_URL. This is useful for development.
    |
    */
    'force_local_assets' => true,
];
