<?php

use App\Http\Controllers\CaptchaAssetController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/captcha/{path}', [CaptchaAssetController::class, 'show'])
    ->where('path', '.*');
