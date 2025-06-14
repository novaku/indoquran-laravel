<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EnctypeDebugController extends Controller
{
    /**
     * Show the enctype debug page.
     *
     * @return \Illuminate\View\View
     */
    public function index()
    {
        return view('enctype-debug');
    }

    /**
     * Process test form submissions and echo back the data.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function testSubmit(Request $request)
    {
        // Log the content type
        Log::info('Enctype Debug - Content-Type: ' . $request->header('Content-Type'));
        
        // Check if this is a multipart form
        $isMultipart = strpos($request->header('Content-Type'), 'multipart/form-data') !== false;
        Log::info('Enctype Debug - Is Multipart: ' . ($isMultipart ? 'Yes' : 'No'));
        
        // Collect all input data except files
        $data = $request->except(['file']);
        
        // Add file information if present
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $data['file_info'] = [
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'extension' => $file->getClientOriginalExtension()
            ];
        }
        
        // Return the data as JSON
        return response()->json([
            'success' => true,
            'message' => 'Form data received successfully',
            'data' => $data,
            'content_type' => $request->header('Content-Type'),
            'is_multipart' => $isMultipart,
            'has_file' => $request->hasFile('file')
        ]);
    }
}
