<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selamat Datang di IndoQuran</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #2E8B57 0%, #228B22 50%, #1e7b1e 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="mosque" patternUnits="userSpaceOnUse" width="100" height="100"><circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/></pattern></defs><rect width="100" height="100" fill="url(%23mosque)"/></svg>') repeat;
            opacity: 0.3;
        }
        .header .content {
            position: relative;
            z-index: 1;
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header .icon {
            font-size: 60px;
            margin-bottom: 15px;
            display: block;
        }
        .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-message {
            text-align: center;
            margin-bottom: 30px;
        }
        .welcome-message h2 {
            color: #2E8B57;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .user-greeting {
            background: linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%);
            border-left: 4px solid #2E8B57;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
            text-align: center;
        }
        .user-greeting .name {
            font-size: 20px;
            font-weight: 600;
            color: #2E8B57;
            margin-bottom: 5px;
        }
        .features {
            margin: 30px 0;
        }
        .feature-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 3px solid #2E8B57;
        }
        .feature-icon {
            background: #2E8B57;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            flex-shrink: 0;
            font-size: 18px;
        }
        .feature-text h3 {
            margin: 0 0 5px 0;
            color: #2E8B57;
            font-size: 16px;
        }
        .feature-text p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        .cta-section {
            background: linear-gradient(135deg, #2E8B57 0%, #228B22 100%);
            color: white;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border-radius: 8px;
        }
        .cta-section h3 {
            margin: 0 0 15px 0;
            font-size: 20px;
        }
        .cta-button {
            display: inline-block;
            background: white;
            color: #2E8B57;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            margin: 10px;
            transition: all 0.3s ease;
        }
        .sharing-section {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border: 1px solid #ffeaa7;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
        }
        .sharing-section h3 {
            color: #856404;
            margin: 0 0 15px 0;
            font-size: 18px;
        }
        .sharing-section .icon {
            font-size: 40px;
            margin-bottom: 10px;
        }
        .sharing-benefits {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .benefit-item {
            background: white;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            border: 1px solid #ffeaa7;
        }
        .benefit-item .icon {
            font-size: 24px;
            margin-bottom: 8px;
        }
        .benefit-item h4 {
            margin: 0 0 5px 0;
            color: #856404;
            font-size: 14px;
        }
        .benefit-item p {
            margin: 0;
            color: #6c757d;
            font-size: 12px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            color: #6c757d;
            font-size: 14px;
        }
        .social-links {
            margin: 15px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #2E8B57;
            text-decoration: none;
            font-weight: 500;
        }
        .website-link {
            display: inline-block;
            color: #2E8B57;
            text-decoration: none;
            font-weight: 600;
            margin: 10px 0;
        }
        .ayat-quote {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-left: 4px solid #2E8B57;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
            font-style: italic;
            text-align: center;
        }
        .ayat-text {
            font-size: 16px;
            color: #495057;
            margin-bottom: 10px;
        }
        .ayat-reference {
            font-size: 14px;
            color: #2E8B57;
            font-weight: 600;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .content {
                padding: 20px 15px;
            }
            .header {
                padding: 30px 20px;
            }
            .cta-section {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="content">
                <div class="icon">🕌</div>
                <h1>IndoQuran</h1>
                <p class="subtitle">Platform Al-Quran Digital Indonesia</p>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content">
            <!-- Welcome Message -->
            <div class="welcome-message">
                <h2>Assalamu'alaikum Warahmatullahi Wabarakatuh</h2>
                <p>Selamat datang di keluarga besar IndoQuran!</p>
            </div>

            <!-- User Greeting -->
            <div class="user-greeting">
                <div class="name">{{ $user->name }}</div>
                <p>Terima kasih telah bergabung dengan IndoQuran. Semoga perjalanan spiritual Anda bersama Al-Quran semakin bermakna!</p>
            </div>

            <!-- Ayat Quote -->
            <div class="ayat-quote">
                <div class="ayat-text">
                    "Dan Kami turunkan dari Al-Quran suatu yang menjadi penawar dan rahmat bagi orang-orang yang beriman"
                </div>
                <div class="ayat-reference">QS. Al-Isra: 82</div>
            </div>

            <!-- Features -->
            <div class="features">
                <h3 style="text-align: center; color: #2E8B57; margin-bottom: 20px;">Fitur-fitur Yang Dapat Anda Nikmati:</h3>
                
                <div class="feature-item">
                    <div class="feature-icon">📖</div>
                    <div class="feature-text">
                        <h3>Baca Al-Quran Online</h3>
                        <p>Akses seluruh Al-Quran dengan terjemahan Bahasa Indonesia yang mudah dipahami</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">🔖</div>
                    <div class="feature-text">
                        <h3>Bookmark & Catatan</h3>
                        <p>Simpan ayat favorit dan buat catatan pribadi untuk refleksi lebih dalam</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-text">
                        <h3>Pelacakan Progress Baca</h3>
                        <p>Pantau kemajuan bacaan Al-Quran Anda dan tetap konsisten</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">🔍</div>
                    <div class="feature-text">
                        <h3>Pencarian Ayat</h3>
                        <p>Temukan ayat dengan mudah berdasarkan kata kunci atau tema tertentu</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">🕐</div>
                    <div class="feature-text">
                        <h3>Jadwal Sholat</h3>
                        <p>Dapatkan informasi waktu sholat akurat berdasarkan lokasi Anda</p>
                    </div>
                </div>

                <div class="feature-item">
                    <div class="feature-icon">📿</div>
                    <div class="feature-text">
                        <h3>Asmaul Husna</h3>
                        <p>Pelajari dan renungkan 99 nama-nama indah Allah SWT</p>
                    </div>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="cta-section">
                <h3>Mulai Perjalanan Spiritual Anda Sekarang!</h3>
                <p>Jangan tunggu lagi, mari mulai membaca Al-Quran bersama IndoQuran</p>
                <a href="https://indoquran.web.id" class="cta-button">Mulai Membaca</a>
                <a href="https://indoquran.web.id/asmaul-husna" class="cta-button">Pelajari Asmaul Husna</a>
            </div>

            <!-- Sharing Section -->
            <div class="sharing-section">
                <div class="icon">🌟</div>
                <h3>Bagikan Kebaikan, Raih Pahala Berlipat!</h3>
                <p style="margin-bottom: 20px;">
                    "Barangsiapa yang menunjukkan kepada suatu kebaikan, maka baginya pahala seperti orang yang mengerjakannya" - HR. Muslim
                </p>
                
                <div class="sharing-benefits">
                    <div class="benefit-item">
                        <div class="icon">💝</div>
                        <h4>Pahala Jariyah</h4>
                        <p>Setiap orang yang membaca karena ajakan Anda</p>
                    </div>
                    <div class="benefit-item">
                        <div class="icon">🤝</div>
                        <h4>Dakwah Digital</h4>
                        <p>Menyebarkan kebaikan melalui teknologi</p>
                    </div>
                    <div class="benefit-item">
                        <div class="icon">🌍</div>
                        <h4>Dampak Luas</h4>
                        <p>Membantu umat Islam di seluruh Indonesia</p>
                    </div>
                    <div class="benefit-item">
                        <div class="icon">📈</div>
                        <h4>Keberkahan</h4>
                        <p>Semakin dibagikan, semakin berkah</p>
                    </div>
                </div>

                <p style="margin-top: 20px;">
                    <strong>Mari bagikan IndoQuran kepada keluarga, teman, dan saudara muslimmu!</strong><br>
                    Ajak mereka bergabung dan rasakan manfaatnya bersama-sama.
                </p>
                
                <div style="margin-top: 15px;">
                    <a href="https://wa.me/?text=Assalamu'alaikum%2C%20aku%20mau%20share%20website%20keren%20nih%20buat%20baca%20Al-Quran%20online%20:%20https://indoquran.web.id%20%F0%9F%95%8C%20Lengkap%20banget%20dan%20gratis!" class="cta-button">Share via WhatsApp</a>
                </div>
            </div>

            <!-- Tips -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #2E8B57; margin-bottom: 15px;">💡 Tips Menggunakan IndoQuran:</h3>
                <ul style="color: #495057; padding-left: 20px;">
                    <li>Mulai dengan membaca Surah Al-Fatihah setiap hari</li>
                    <li>Gunakan fitur bookmark untuk menyimpan ayat yang menyentuh hati</li>
                    <li>Manfaatkan fitur pencarian untuk menemukan ayat tentang tema tertentu</li>
                    <li>Jadikan membaca Al-Quran sebagai rutinitas harian</li>
                    <li>Bagikan ayat favorit Anda kepada orang-orang terdekat</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>IndoQuran - Platform Al-Quran Digital Indonesia</strong></p>
            <a href="https://indoquran.web.id" class="website-link">🌐 indoquran.web.id</a>
            
            <div class="social-links">
                <a href="mailto:kontak@indoquran.web.id">📧 Kontak Kami</a>
            </div>
            
            <p style="margin-top: 15px; font-size: 12px; color: #6c757d;">
                Email ini dikirim secara otomatis. Jika Anda tidak mendaftar di IndoQuran, 
                silakan abaikan email ini.
            </p>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e9ecef;">
                <p style="color: #2E8B57; font-weight: 600; margin: 0;">
                    Barakallahu fiikum wa jazakumullahu khairan 🤲
                </p>
            </div>
        </div>
    </div>
</body>
</html>
