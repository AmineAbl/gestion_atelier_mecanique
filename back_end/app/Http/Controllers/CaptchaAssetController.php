<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CaptchaAssetController extends Controller
{
    private function widgetRoot(): string
    {
        return realpath(base_path('../../notAbot/widget')) ?: '';
    }

    public function show(Request $request, string $path): BinaryFileResponse|\Illuminate\Http\Response
    {
        $root = $this->widgetRoot();
        if ($root === '') {
            return response('Captcha assets not found', 404);
        }

        $safePath = str_replace(['..', '\\'], ['', '/'], $path);
        $file = realpath($root.'/'.$safePath);

        if ($file === false || ! str_starts_with($file, $root) || ! is_file($file)) {
            return response('Not found', 404);
        }

        return response()->file($file);
    }
}
