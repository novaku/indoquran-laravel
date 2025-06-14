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
