<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Contact;
use App\Mail\ContactNotification;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    /**
     * Store a newly created contact message in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Log request content type and details for debugging
        Log::info('Content-Type: ' . $request->header('Content-Type'));
        Log::info('Request is multipart: ' . ($request->isMethod('post') && strpos($request->header('Content-Type'), 'multipart/form-data') !== false ? 'Yes' : 'No'));
        
        // Check if this is a multipart form data request or JSON request
        $isMultipart = strpos($request->header('Content-Type'), 'multipart/form-data') !== false;
        
        // Log request parameters (excluding file content for security)
        $logParams = $request->except(['attachment']);
        if ($request->hasFile('attachment')) {
            $logParams['has_attachment'] = true;
            $logParams['attachment_original_name'] = $request->file('attachment')->getClientOriginalName();
            $logParams['attachment_size'] = $request->file('attachment')->getSize();
            $logParams['attachment_mime'] = $request->file('attachment')->getMimeType();
        }
        Log::info('Contact request parameters: ', $logParams);
        
        // All file uploads are optional now
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100',
            'subject' => 'required|string|max:150',
            'message' => 'required|string|max:2000',
            'attachment' => 'nullable|file|mimes:jpeg,jpg,png,pdf,doc,docx|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $attachmentPath = null;
        $attachmentOriginalName = null;

        // Handle file upload if present
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            
            // Additional validation for the file
            if (!$file->isValid()) {
                return response()->json(['errors' => ['attachment' => 'File upload failed']], 422);
            }
            
            $originalName = $file->getClientOriginalName();
            $filename = time() . '_' . $originalName;
            $attachmentPath = $file->storeAs('contact-attachments', $filename, 'public');
            $attachmentOriginalName = $originalName;
        }

        $contact = Contact::create([
            'name' => $request->name,
            'email' => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
            'attachment_path' => $attachmentPath,
            'attachment_original_name' => $attachmentOriginalName,
            'is_read' => false,
        ]);

        // Send email notification to admin
        try {
            Mail::to('kontak@indoquran.web.id')->send(new ContactNotification($contact));
        } catch (\Exception $e) {
            // Log the error but don't fail the contact submission
            Log::error('Failed to send contact notification email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Pesan telah berhasil dikirim. Terima kasih telah menghubungi kami.',
            'contact' => $contact
        ], 201);
    }
}
