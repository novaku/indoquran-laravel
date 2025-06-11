<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pesan Kontak Baru</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border: 1px solid #ddd;
            border-top: none;
        }
        .field {
            margin-bottom: 15px;
        }
        .field strong {
            color: #4CAF50;
            display: inline-block;
            width: 100px;
        }
        .message-content {
            background-color: white;
            padding: 15px;
            border-left: 4px solid #4CAF50;
            margin-top: 10px;
        }
        .footer {
            background-color: #333;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 0 0 5px 5px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Pesan Kontak Baru</h1>
        <p>IndoQuran.web.id</p>
    </div>
    
    <div class="content">
        <p>Anda menerima pesan kontak baru dari website IndoQuran.web.id:</p>
        
        <div class="field">
            <strong>Nama:</strong> {{ $contact->name }}
        </div>
        
        <div class="field">
            <strong>Email:</strong> {{ $contact->email }}
        </div>
        
        <div class="field">
            <strong>Subjek:</strong> {{ $contact->subject }}
        </div>
        
        <div class="field">
            <strong>Waktu:</strong> {{ $contact->created_at->format('d M Y, H:i') }} WIB
        </div>
        
        <div class="field">
            <strong>Pesan:</strong>
            <div class="message-content">
                {{ $contact->message }}
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>Email ini dikirim secara otomatis dari sistem IndoQuran.web.id</p>
        <p>Untuk membalas pesan ini, silakan kirim email langsung ke: {{ $contact->email }}</p>
    </div>
</body>
</html>
