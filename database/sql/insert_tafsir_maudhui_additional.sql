-- ============================================================================
-- IndoQuran - Additional Tafsir Maudhu'i Topics & Verses Data
-- Total New Topics: 54
-- Total New Verses : 514
-- Generated at     : 2026-08-29 21:25:11
-- ============================================================================

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------------------------------------------------------
-- Topik: Kisah Nabi Adam AS dan Asal Mula Manusia (kisah-nabi-adam-as-dan-asal-mula-manusia)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Nabi Adam AS dan Asal Mula Manusia', 'Penciptaan manusia pertama dari tanah, kemuliaan ilmu yang dianugerahkan Allah, godaan iblis karena kesombongan, hikmah ujian pohon terlarang, serta teladan istighfar dan taubat yang diterima Allah SWT.', 'kisah-nabi-adam-as-dan-asal-mula-manusia', 1, 250, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-nabi-adam-as-dan-asal-mula-manusia' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 30, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 31, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 34, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 35, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 36, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 37, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 7, 11, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 7, 19, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 7, 22, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 7, 23, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 15, 28, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 15, 29, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 115, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 121, 14, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 122, 15, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kisah Nabi Nuh AS dan Bahtera Penyelamat (kisah-nabi-nuh-as-dan-bahtera-penyelamat)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Nabi Nuh AS dan Bahtera Penyelamat', 'Ketabahan dan keteguhan Nabi Nuh AS dalam berdakwah selama 950 tahun, perintah pembuatan bahtera di atas bukit, peristiwa banjir besar, serta kisah kepedihan seorang ayah atas anaknya yang ingkar.', 'kisah-nabi-nuh-as-dan-bahtera-penyelamat', 1, 251, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-nabi-nuh-as-dan-bahtera-penyelamat' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 7, 59, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 11, 25, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 11, 36, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 11, 37, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 11, 40, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 11, 42, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 11, 43, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 11, 44, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 11, 45, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 11, 47, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 23, 27, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 26, 105, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 71, 1, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 71, 10, 14, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 71, 28, 15, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kisah Nabi Ibrahim AS dan Ketauhidan Sejati (kisah-nabi-ibrahim-as-dan-ketauhidan-sejati)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Nabi Ibrahim AS dan Ketauhidan Sejati', 'Perjalanan pencarian kebenaran melalui perenungan akal, keberanian menghancurkan berhala, mukjizat selamat dari kobaran api, keikhlasan berkurban, serta pembangunan Ka\'bah bersama Nabi Ismail AS.', 'kisah-nabi-ibrahim-as-dan-ketauhidan-sejati', 1, 252, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-nabi-ibrahim-as-dan-ketauhidan-sejati' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 124, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 127, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 128, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 6, 74, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 6, 76, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 6, 77, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 6, 78, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 6, 79, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 14, 35, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 14, 37, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 16, 120, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 51, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 69, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 100, 14, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 102, 15, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 107, 16, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kisah Nabi Yusuf AS: Sabar, Integritas, dan Kejayaan (kisah-nabi-yusuf-as-sabar-integritas-dan-kejayaan)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Nabi Yusuf AS: Sabar, Integritas, dan Kejayaan', 'Kisah terbaik (Ahsanul Qashash) tentang kecemburuan saudara, keteguhan menjaga kesucian dari godaan syahwat, kesabaran dalam penjara, serta kemampuan manajemen ekonomi menghadapi krisis pangan.', 'kisah-nabi-yusuf-as-sabar-integritas-dan-kejayaan', 1, 253, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-nabi-yusuf-as-sabar-integritas-dan-kejayaan' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 12, 3, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 4, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 15, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 23, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 24, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 33, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 47, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 48, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 55, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 56, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 87, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 90, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 92, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 100, 14, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 101, 15, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kisah Nabi Musa AS dan Perlawanan terhadap Tirani Fir'aun (kisah-nabi-musa-as-dan-perlawanan-terhadap-tirani-firaun)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Nabi Musa AS dan Perlawanan terhadap Tirani Fir\'aun', 'Perjuangan menegakkan keadilan melawan penguasa tiran yang menindas kaum lemah, mukjizat tongkat dan laut merah terbelah, serta dialog ketauhidan dan dialog hukum di Bukit Sinai.', 'kisah-nabi-musa-as-dan-perlawanan-terhadap-tirani-firaun', 1, 254, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-nabi-musa-as-dan-perlawanan-terhadap-tirani-firaun' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 50, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 7, 104, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 7, 143, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 9, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 25, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 43, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 44, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 77, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 26, 61, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 26, 62, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 26, 63, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 28, 4, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 28, 7, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 28, 26, 14, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 28, 30, 15, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kisah Maryam dan Kelahiran Mukjizat Nabi Isa AS (kisah-maryam-dan-kelahiran-mukjizat-nabi-isa-as)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Maryam dan Kelahiran Mukjizat Nabi Isa AS', 'Kesucian dan ketaatan ibadah Sayyidah Maryam, kabar gembira dari Malaikat Jibril, mukjizat kelahiran Nabi Isa AS tanpa ayah, serta dakwah tauhid dan mukjizat menyembuhkan orang sakit atas izin Allah.', 'kisah-maryam-dan-kelahiran-mukjizat-nabi-isa-as', 1, 255, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-maryam-dan-kelahiran-mukjizat-nabi-isa-as' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 3, 42, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 3, 45, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 3, 49, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 3, 59, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 157, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 5, 110, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 5, 116, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 19, 16, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 19, 19, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 19, 20, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 19, 29, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 19, 30, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 19, 31, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 19, 32, 14, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 19, 33, 15, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kisah Nabi Sulaiman AS: Kekuasaan, Kebijaksanaan, dan Rasa Syukur (kisah-nabi-sulaiman-as-kekuasaan-kebijaksanaan-dan-rasa-syukur)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Nabi Sulaiman AS: Kekuasaan, Kebijaksanaan, dan Rasa Syukur', 'Karunia kerajaan agung yang tidak pernah dimiliki siapapun, mukjizat memahami bahasa hewan dan mengendalikan angin, ketundukan Ratu Balqis, serta keteladanan rasa syukur di puncak kekuasaan.', 'kisah-nabi-sulaiman-as-kekuasaan-kebijaksanaan-dan-rasa-syukur', 1, 256, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-nabi-sulaiman-as-kekuasaan-kebijaksanaan-dan-rasa-syukur' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 21, 78, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 79, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 81, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 27, 15, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 27, 16, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 27, 17, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 27, 18, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 27, 19, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 27, 20, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 27, 30, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 27, 40, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 27, 44, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 34, 12, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 38, 30, 14, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 38, 35, 15, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kisah Nabi Daud AS: Keadilan Pemimpin dan Keberanian (kisah-nabi-daud-as-keadilan-pemimpin-dan-keberanian)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Nabi Daud AS: Keadilan Pemimpin dan Keberanian', 'Keberanian Daud muda mengalahkan Jalut, karunia kitab Zabur, kebijaksanaan dalam memutus perkara secara adil, serta mukjizat melunakkan besi dan bertasbihnya gunung dan burung bersamanya.', 'kisah-nabi-daud-as-keadilan-pemimpin-dan-keberanian', 1, 257, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-nabi-daud-as-keadilan-pemimpin-dan-keberanian' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 251, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 163, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 17, 55, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 78, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 80, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 34, 10, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 34, 11, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 38, 17, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 38, 18, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 38, 19, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 38, 24, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 38, 26, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kisah Nabi Ayyub AS: Ketabahan Menghadapi Sakit dan Ujian (kisah-nabi-ayyub-as-ketabahan-menghadapi-sakit-dan-ujian)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Nabi Ayyub AS: Ketabahan Menghadapi Sakit dan Ujian', 'Teladan puncak kesabaran manusia menghadapi ujian hilangnya harta, wafatnya keturunan, dan derita penyakit bertahun-tahun tanpa sekalipun berburuk sangka kepada Allah hingga datang kesembuhan mukjizat.', 'kisah-nabi-ayyub-as-ketabahan-menghadapi-sakit-dan-ujian', 1, 258, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-nabi-ayyub-as-ketabahan-menghadapi-sakit-dan-ujian' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 4, 163, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 6, 84, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 83, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 84, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 38, 41, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 38, 42, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 38, 43, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 38, 44, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kisah Nabi Yunus AS: Doa di Dalam Tiga Kegelapan (kisah-nabi-yunus-as-doa-di-dalam-tiga-kegelapan)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Nabi Yunus AS: Doa di Dalam Tiga Kegelapan', 'Pelajaran pentingnya kesabaran dalam berdakwah, penyesalan dan pengakuan kelemahan diri di dalam perut ikan paus (Dzun Nun), serta dahsyatnya pertolongan Allah berkat doa tauhid dan tasbih.', 'kisah-nabi-yunus-as-doa-di-dalam-tiga-kegelapan', 1, 259, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-nabi-yunus-as-doa-di-dalam-tiga-kegelapan' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 4, 163, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 6, 86, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 10, 98, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 87, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 88, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 139, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 140, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 141, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 142, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 143, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 144, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 145, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 146, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 68, 48, 14, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 68, 49, 15, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 68, 50, 16, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kisah Ashabul Kahfi: Pemuda Penjaga Aqidah (kisah-ashabul-kahfi-pemuda-penjaga-aqidah)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Ashabul Kahfi: Pemuda Penjaga Aqidah', 'Keteladanan para pemuda beriman yang berani mengambil sikap tegas mempertahankan iman dari penguasa tiran, perlindungan mukjizat tidur 309 tahun di dalam gua, serta bukti kebangkitan setelah mati.', 'kisah-ashabul-kahfi-pemuda-penjaga-aqidah', 1, 260, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-ashabul-kahfi-pemuda-penjaga-aqidah' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 18, 9, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 10, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 13, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 14, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 16, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 17, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 18, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 19, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 21, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 25, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kisah Luqman Al-Hakim: Fondasi Pendidikan Karakter Anak (kisah-luqman-al-hakim-fondasi-pendidikan-karakter-anak)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Luqman Al-Hakim: Fondasi Pendidikan Karakter Anak', 'Wasiat agung Luqman kepada putranya yang memuat kurikulum pendidikan anak lengkap: larangan syirik, berbakti kepada orang tua, kewajiban shalat, amar ma\'ruf nahi munkar, serta adab sopan santun dan rendah hati.', 'kisah-luqman-al-hakim-fondasi-pendidikan-karakter-anak', 1, 261, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-luqman-al-hakim-fondasi-pendidikan-karakter-anak' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 31, 12, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 31, 13, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 31, 14, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 31, 15, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 31, 16, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 31, 17, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 31, 18, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 31, 19, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kisah Dzulkarnain dan Tembok Pelindung Ya'juj Ma'juj (kisah-dzulkarnain-dan-tembok-pelindung-yajuj-majuj)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Dzulkarnain dan Tembok Pelindung Ya\'juj Ma\'juj', 'Keteladanan pemimpin berilmu yang memanfaatkan kekuasaan untuk melindungi rakyat tertindas, bepergian ke timur dan barat bumi, serta keahlian metalurgi mendirikan benteng besi kokoh.', 'kisah-dzulkarnain-dan-tembok-pelindung-yajuj-majuj', 1, 262, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-dzulkarnain-dan-tembok-pelindung-yajuj-majuj' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 18, 83, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 84, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 86, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 87, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 88, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 90, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 93, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 94, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 95, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 96, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 97, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 98, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 96, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kisah Qarun dan Bahaya Kesombongan Harta (kisah-qarun-dan-bahaya-kesombongan-harta)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kisah Qarun dan Bahaya Kesombongan Harta', 'Peringatan keras bagi orang yang mabuk kekayaan, menganggap hartanya adalah hasil kepintaran diri semata, enggan berbagi kepada kaum dhuafa, hingga akhirnya ditelan bumi beserta seluruh perbendaharaannya.', 'kisah-qarun-dan-bahaya-kesombongan-harta', 1, 263, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kisah-qarun-dan-bahaya-kesombongan-harta' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 28, 76, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 28, 77, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 28, 78, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 28, 79, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 28, 80, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 28, 81, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 28, 82, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Penciptaan Alam Semesta dan Teori Kosmologi (penciptaan-alam-semesta-dan-teori-kosmologi)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Penciptaan Alam Semesta dan Teori Kosmologi', 'Ayat-ayat kauniyah tentang asal mula penciptaan langit dan bumi dari satu kesatuan yang padu (Big Bang), perluasan alam semesta yang terus berlangsung, serta rotasi dan orbit benda-benda antariksa.', 'penciptaan-alam-semesta-dan-teori-kosmologi', 1, 264, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'penciptaan-alam-semesta-dan-teori-kosmologi' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 21, 30, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 33, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 41, 11, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 51, 47, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 36, 38, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 36, 39, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 36, 40, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 39, 5, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 67, 3, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 67, 4, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Tahapan Embriologi dan Penciptaan Manusia (tahapan-embriologi-dan-penciptaan-manusia)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Tahapan Embriologi dan Penciptaan Manusia', 'Deskripsi ilmiah akurat dalam Al-Qur\'an mengenai tahapan perkembangan janin dalam rahim ibu: dari setetes mani (nuthfah), segumpal darah (\'alaqah), segumpal daging (mudghah), pembentukan tulang belulang dan otot, hingga peniupan ruh.', 'tahapan-embriologi-dan-penciptaan-manusia', 1, 265, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'tahapan-embriologi-dan-penciptaan-manusia' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 22, 5, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 23, 12, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 23, 13, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 23, 14, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 32, 7, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 32, 8, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 32, 9, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 39, 6, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 75, 37, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 75, 38, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 75, 39, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 96, 1, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 96, 2, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Siklus Air dan Proses Terjadinya Hujan (siklus-air-dan-proses-terjadinya-hujan)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Siklus Air dan Proses Terjadinya Hujan', 'Penjelasan Al-Qur\'an tentang mekanisme penguapan, pergerakan angin pengangkut awan, pembentukan tetesan hujan dari awan bertingkat (kumulonimbus), serta peran vital air bagi kehidupan seluruh makhluk di bumi.', 'siklus-air-dan-proses-terjadinya-hujan', 1, 266, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'siklus-air-dan-proses-terjadinya-hujan' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 15, 22, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 23, 18, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 24, 43, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 30, 48, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 35, 9, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 39, 21, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 50, 9, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 56, 68, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 56, 69, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 56, 70, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Gunung sebagai Pasak dan Penstabil Bumi (gunung-sebagai-pasak-dan-penstabil-bumi)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Gunung sebagai Pasak dan Penstabil Bumi', 'Fungsi geologis gunung-gunung tinggi yang memiliki akar menghujam ke dalam mantel bumi (isostasi) untuk meredam guncangan kerak bumi dan menjaga kestabilan permukaan planet.', 'gunung-sebagai-pasak-dan-penstabil-bumi', 1, 267, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'gunung-sebagai-pasak-dan-penstabil-bumi' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 16, 15, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 31, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 27, 88, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 31, 10, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 78, 6, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 78, 7, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 79, 32, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 88, 19, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Pertemuan Dua Lautan dan Dinding Pemisah Alami (pertemuan-dua-lautan-dan-dinding-pemisah-alami)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Pertemuan Dua Lautan dan Dinding Pemisah Alami', 'Fenomena hidrologi bertemunya dua perairan (asin dan tawar) yang tidak saling mendominasi karena perbedaan massa jenis, suhu, dan salinitas, menjadi tanda keagungan kuasa Allah Sang Pencipta.', 'pertemuan-dua-lautan-dan-dinding-pemisah-alami', 1, 268, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'pertemuan-dua-lautan-dan-dinding-pemisah-alami' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 25, 53, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 27, 61, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 35, 12, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 55, 19, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 55, 20, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 55, 21, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 55, 22, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Dunia Hewan dan Serangga sebagai Inspirasi Kehidupan (dunia-hewan-dan-serangga-sebagai-inspirasi-kehidupan)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Dunia Hewan dan Serangga sebagai Inspirasi Kehidupan', 'Keteraturan koloni dan manfaat madu lebah sebagai obat, kecerdasan dan sistem komunikasi semut, laba-laba dan kerapuhan sarangnya, serta burung yang terbang dengan sayap terkembang.', 'dunia-hewan-dan-serangga-sebagai-inspirasi-kehidupan', 1, 269, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'dunia-hewan-dan-serangga-sebagai-inspirasi-kehidupan' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 6, 38, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 16, 68, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 16, 69, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 24, 41, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 27, 18, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 29, 41, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 67, 19, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Tumbuh-tumbuhan, Fotosintesis, dan Keragaman Hayati (tumbuh-tumbuhan-fotosintesis-dan-keragaman-hayati)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Tumbuh-tumbuhan, Fotosintesis, dan Keragaman Hayati', 'Keajaiban butir klorofil yang memproses cahaya, tumbuhnya aneka ragam tanaman dan buah-buahan berpasang-pasangan yang disiram dengan air yang sama namun memiliki rasa yang berbeda.', 'tumbuh-tumbuhan-fotosintesis-dan-keragaman-hayati', 1, 270, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'tumbuh-tumbuhan-fotosintesis-dan-keragaman-hayati' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 6, 95, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 6, 99, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 13, 4, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 53, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 36, 33, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 36, 34, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 36, 35, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 36, 36, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 50, 7, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 50, 8, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Atmosfer Bumi dan Lapisan Langit Pelindung (atmosfer-bumi-dan-lapisan-langit-pelindung)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Atmosfer Bumi dan Lapisan Langit Pelindung', 'Lapisan atmosfer bumi sebagai pelindung (saqfan mahfuzhan) dari benda-benda luar angkasa dan radiasi sinar berbahaya, serta fenomena berkurangnya oksigen dan sesaknya dada di ketinggian.', 'atmosfer-bumi-dan-lapisan-langit-pelindung', 1, 271, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'atmosfer-bumi-dan-lapisan-langit-pelindung' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 22, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 6, 125, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 32, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 41, 12, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 67, 3, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 86, 11, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Mengatasi Stres, Kesedihan, dan Kecemasan (mengatasi-stres-kesedihan-dan-kecemasan)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Mengatasi Stres, Kesedihan, dan Kecemasan', 'Terapi spiritual Al-Qur\'an saat menghadapi duka lara mendalam, rasa khawatir akan masa depan, kesedihan atas masa lalu, serta janji Allah bahwa bersama kesulitan selalu ada kemudahan ganda.', 'mengatasi-stres-kesedihan-dan-kecemasan', 1, 272, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'mengatasi-stres-kesedihan-dan-kecemasan' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 155, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 156, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 157, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 3, 139, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 9, 40, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 12, 86, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 16, 127, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 94, 1, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 94, 5, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 94, 6, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 94, 7, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 94, 8, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Konsep Jiwa Tenang dan Ketenangan Hati (Thuma'ninah) (konsep-jiwa-tenang-dan-ketenangan-hati-thumaninah)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Konsep Jiwa Tenang dan Ketenangan Hati (Thuma\'ninah)', 'Hakikat ketenteraman batin yang diraih dengan mengingat Allah (Dzikrullah), membaca dan mentadabburi wahyu, hingga mencapai tingkatan jiwa yang tenang (An-Nafs Al-Muthma\'innah) yang diridhai Allah.', 'konsep-jiwa-tenang-dan-ketenangan-hati-thumaninah', 1, 273, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'konsep-jiwa-tenang-dan-ketenangan-hati-thumaninah' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 3, 126, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 8, 2, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 13, 28, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 48, 4, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 48, 18, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 89, 27, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 89, 28, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 89, 29, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 89, 30, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Manajemen Amarah dan Pengendalian Emosi Diri (manajemen-amarah-dan-pengendalian-emosi-diri)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Manajemen Amarah dan Pengendalian Emosi Diri', 'Ciri orang bertakwa yang mampu menahan amarah (Al-Kazhiminal Ghaizh), memaafkan kesalahan orang lain dengan lapang dada, serta menolak perlakuan buruk dengan kebaikan yang jauh lebih indah.', 'manajemen-amarah-dan-pengendalian-emosi-diri', 1, 274, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'manajemen-amarah-dan-pengendalian-emosi-diri' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 3, 133, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 3, 134, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 7, 199, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 7, 200, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 23, 96, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 41, 34, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 41, 35, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 42, 37, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Bahaya Keputusasaan dan Menjaga Optimisme Hidup (bahaya-keputusasaan-dan-menjaga-optimisme-hidup)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Bahaya Keputusasaan dan Menjaga Optimisme Hidup', 'Larangan keras berputus asa dari rahmat Allah betapapun besarnya dosa atau beratnya ujian, serta perintah untuk senantiasa memelihara harapan (raja\') dan berprasangka baik kepada ketetapan Allah.', 'bahaya-keputusasaan-dan-menjaga-optimisme-hidup', 1, 275, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'bahaya-keputusasaan-dan-menjaga-optimisme-hidup' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 12, 87, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 15, 56, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 39, 53, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 40, 55, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 65, 2, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 65, 3, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Al-Qur'an sebagai Syifa' (Obat Penyembuh Hati dan Fisik) (al-quran-sebagai-syifa-obat-penyembuh-hati-dan-fisik)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Al-Qur\'an sebagai Syifa\' (Obat Penyembuh Hati dan Fisik)', 'Keutamaan ayat-ayat suci Al-Qur\'an sebagai penyembuh dari penyakit keraguan aqidah, iri dengki, kemunafikan, kegundahan jiwa, serta rahmat penyejuk bagi orang-orang yang beriman.', 'al-quran-sebagai-syifa-obat-penyembuh-hati-dan-fisik', 1, 276, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'al-quran-sebagai-syifa-obat-penyembuh-hati-dan-fisik' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 10, 57, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 16, 69, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 17, 82, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 26, 80, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 41, 44, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Prinsip Tabayyun: Verifikasi Informasi dan Melawan Hoaks (prinsip-tabayyun-verifikasi-informasi-dan-melawan-hoaks)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Prinsip Tabayyun: Verifikasi Informasi dan Melawan Hoaks', 'Kewajiban meneliti dan memverifikasi kebenaran setiap informasi dari sumber yang tidak jelas sebelum disebarluaskan, agar tidak menimpakan bahaya atau fitnah kepada orang lain tanpa disadari.', 'prinsip-tabayyun-verifikasi-informasi-dan-melawan-hoaks', 1, 277, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'prinsip-tabayyun-verifikasi-informasi-dan-melawan-hoaks' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 4, 83, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 94, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 17, 36, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 24, 12, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 24, 15, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 49, 6, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Etika Berkomunikasi: Kaidah Perkataan Mulia dalam Islam (etika-berkomunikasi-kaidah-perkataan-mulia-dalam-islam)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Etika Berkomunikasi: Kaidah Perkataan Mulia dalam Islam', 'Enam kaidah komunikasi Al-Qur\'an: perkataan yang benar (qawlan sadida), perkataan lemah lembut (qawlan layyina), perkataan yang pantas (qawlan ma\'rufa), perkataan yang mulia (qawlan karima), perkataan yang membekas (qawlan baligha), dan perkataan yang mudah dipahami (qawlan maysura).', 'etika-berkomunikasi-kaidah-perkataan-mulia-dalam-islam', 1, 278, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'etika-berkomunikasi-kaidah-perkataan-mulia-dalam-islam' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 83, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 9, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 63, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 17, 23, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 17, 28, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 17, 53, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 44, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 33, 70, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Larangan Cyberbullying, Mencela, dan Panggilan Buruk (larangan-cyberbullying-mencela-dan-panggilan-buruk)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Larangan Cyberbullying, Mencela, dan Panggilan Buruk', 'Larangan menghina, merendahkan, mengolok-olok fisik atau latar belakang orang lain, mencari-cari keburukan (tajassus), serta memanggil sesama manusia dengan julukan-julukan yang merendahkan martabat.', 'larangan-cyberbullying-mencela-dan-panggilan-buruk', 1, 279, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'larangan-cyberbullying-mencela-dan-panggilan-buruk' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 49, 11, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 49, 12, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 104, 1, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 68, 10, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 68, 11, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Menjaga Pandangan, Privasi, dan Adab Meminta Izin (Isti'dzan) (menjaga-pandangan-privasi-dan-adab-meminta-izin-istidzan)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Menjaga Pandangan, Privasi, dan Adab Meminta Izin (Isti\'dzan)', 'Kewajiban menundukkan pandangan (ghadhul bashar) bagi pria dan wanita beriman, menjaga kehormatan, serta adab menghormati privasi ruang pribadi dan rumah orang lain.', 'menjaga-pandangan-privasi-dan-adab-meminta-izin-istidzan', 1, 280, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'menjaga-pandangan-privasi-dan-adab-meminta-izin-istidzan' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 24, 27, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 24, 28, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 24, 29, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 24, 30, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 24, 31, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 24, 58, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 33, 53, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Etika Transaksi Finansial dan Pencatatan Akad Hutang (etika-transaksi-finansial-dan-pencatatan-akad-hutang)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Etika Transaksi Finansial dan Pencatatan Akad Hutang', 'Panduan terpanjang dalam Al-Qur\'an (Ayat Mudayanah) mengenai pencatatan transaksi kredit/hutang secara tertulis, kehadiran saksi yang adil, serta prinsip transparansi dalam berniaga.', 'etika-transaksi-finansial-dan-pencatatan-akad-hutang', 1, 281, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'etika-transaksi-finansial-dan-pencatatan-akad-hutang' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 282, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 283, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 29, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 5, 1, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kelonggaran Finansial bagi yang Kesulitan Membayar Hutang (kelonggaran-finansial-bagi-yang-kesulitan-membayar-hutang)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kelonggaran Finansial bagi yang Kesulitan Membayar Hutang', 'Anjuran kemanusiaan tingkat tinggi dalam Islam untuk memberikan penundaan waktu bagi debitur yang sungguh-sungguh kesulitan, atau menyedekahkan pokok hutang sebagai amal kebajikan utama.', 'kelonggaran-finansial-bagi-yang-kesulitan-membayar-hutang', 1, 282, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kelonggaran-finansial-bagi-yang-kesulitan-membayar-hutang' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 280, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 281, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 114, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Larangan Kecurangan Timbangan, Monopoli, dan Manipulasi Pasar (larangan-kecurangan-timbangan-monopoli-dan-manipulasi-pasar)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Larangan Kecurangan Timbangan, Monopoli, dan Manipulasi Pasar', 'Peringatan keras bagi para pelaku bisnis yang curang dalam takaran dan timbangan (Al-Muthaffifin), memanipulasi kualitas barang dagangan, atau menimbun barang untuk mempermainkan harga.', 'larangan-kecurangan-timbangan-monopoli-dan-manipulasi-pasar', 1, 283, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'larangan-kecurangan-timbangan-monopoli-dan-manipulasi-pasar' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 6, 152, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 11, 84, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 11, 85, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 17, 35, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 26, 181, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 26, 182, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 26, 183, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 55, 9, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 83, 1, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 83, 2, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 83, 3, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Larangan Suap Meny menyuap dan Memakan Harta secara Batil (larangan-suap-meny-menyuap-dan-memakan-harta-secara-batil)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Larangan Suap Meny menyuap dan Memakan Harta secara Batil', 'Haramnya praktik suap (risywah) kepada para penegak hukum atau pejabat berwenang, korupsi uang publik, penipuan investasi, dan memakan hak milik orang lain dengan jalan yang melanggar syariat.', 'larangan-suap-meny-menyuap-dan-memakan-harta-secara-batil', 1, 284, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'larangan-suap-meny-menyuap-dan-memakan-harta-secara-batil' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 188, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 29, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 30, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 161, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 5, 42, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 9, 34, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Adab Berinfak: Menghindari Riya' dan Menyakiti Penerima (adab-berinfak-menghindari-riya-dan-menyakiti-penerima)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Adab Berinfak: Menghindari Riya\' dan Menyakiti Penerima', 'Etika memberikan bantuan sosial dan sedekah tanpa mengungkit-ungkit budi (mannan) dan tanpa melukai martabat penerima, serta keharusan ikhlas semata-mata mengharapkan ridha Allah.', 'adab-berinfak-menghindari-riya-dan-menyakiti-penerima', 1, 285, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'adab-berinfak-menghindari-riya-dan-menyakiti-penerima' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 261, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 262, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 263, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 264, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 265, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 271, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 76, 8, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 76, 9, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Penegakan Hukum Adil Universal Tanpa Pandang Bulu (penegakan-hukum-adil-universal-tanpa-pandang-bulu)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Penegakan Hukum Adil Universal Tanpa Pandang Bulu', 'Kewajiban mutlak menegakkan keadilan sejati dalam setiap putusan hukum, tanpa terpengaruh oleh rasa benci terhadap suatu kaum, ikatan kekerabatan, ataupun status kekayaan dan kekuasaan.', 'penegakan-hukum-adil-universal-tanpa-pandang-bulu', 1, 286, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'penegakan-hukum-adil-universal-tanpa-pandang-bulu' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 4, 58, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 105, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 135, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 5, 8, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 5, 42, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 6, 152, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 16, 90, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Prinsip Musyawarah (Syura) dalam Pengambilan Kebijakan (prinsip-musyawarah-syura-dalam-pengambilan-kebijakan)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Prinsip Musyawarah (Syura) dalam Pengambilan Kebijakan', 'Sistem tata kelola pemerintahan dan organisasi Islam yang mengedepankan musyawarah terbuka, menghormati aspirasi bersama, serta bertekad bulat dan bertawakal setelah keputusan ditetapkan.', 'prinsip-musyawarah-syura-dalam-pengambilan-kebijakan', 1, 287, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'prinsip-musyawarah-syura-dalam-pengambilan-kebijakan' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 233, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 3, 159, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 42, 38, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Larangan Merusak Lingkungan dan Ekosistem Bumi (Fasad) (larangan-merusak-lingkungan-dan-ekosistem-bumi-fasad)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Larangan Merusak Lingkungan dan Ekosistem Bumi (Fasad)', 'Tanggung jawab manusia sebagai pemakmur bumi (khalifah), larangan mencemari dan merusak alam daratan dan lautan akibat keserakahan, serta peringatan bencana akibat ulah tangan manusia.', 'larangan-merusak-lingkungan-dan-ekosistem-bumi-fasad', 1, 288, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'larangan-merusak-lingkungan-dan-ekosistem-bumi-fasad' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 60, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 205, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 7, 56, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 7, 85, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 11, 61, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 28, 77, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 30, 41, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Menghargai Keberagaman Bangsa, Suku, dan Budaya (menghargai-keberagaman-bangsa-suku-dan-budaya)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Menghargai Keberagaman Bangsa, Suku, dan Budaya', 'Hikmah penciptaan manusia dalam berbagai suku, bangsa, dan ras adalah untuk saling mengenal, berinteraksi, dan bersinergi, di mana tolok ukur kemuliaan di hadapan Allah hanyalah ketakwaan.', 'menghargai-keberagaman-bangsa-suku-dan-budaya', 1, 289, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'menghargai-keberagaman-bangsa-suku-dan-budaya' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 10, 19, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 30, 22, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 49, 13, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Perlindungan Kaum Dhuafa, Yatim, dan Kelompok Rentan (perlindungan-kaum-dhuafa-yatim-dan-kelompok-rentan)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Perlindungan Kaum Dhuafa, Yatim, dan Kelompok Rentan', 'Perintah memberi perhatian khusus kepada anak-anak yatim, janda, orang miskin, musafir yang kehabisan bekal, serta ancaman keras bagi mereka yang menghardik peminta-minta dan mendustakan agama.', 'perlindungan-kaum-dhuafa-yatim-dan-kelompok-rentan', 1, 290, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'perlindungan-kaum-dhuafa-yatim-dan-kelompok-rentan' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 83, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 220, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 2, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 6, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 10, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 70, 24, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 70, 25, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 93, 9, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 93, 10, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 107, 1, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 107, 2, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 107, 3, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Mewujudkan Keluarga Sakinah, Mawaddah, wa Rahmah (mewujudkan-keluarga-sakinah-mawaddah-wa-rahmah)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Mewujudkan Keluarga Sakinah, Mawaddah, wa Rahmah', 'Pernikahan sebagai tanda kebesaran Allah untuk menciptakan ketenangan jiwa pasangan, membangun jalinan cinta mendalam (mawaddah) dan kasih sayang tulus (rahmah) sepanjang usia.', 'mewujudkan-keluarga-sakinah-mawaddah-wa-rahmah', 1, 291, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'mewujudkan-keluarga-sakinah-mawaddah-wa-rahmah' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 4, 1, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 7, 189, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 16, 72, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 25, 74, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 30, 21, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Pergaulan Suami Istri yang Makruf (Mu'asyarah bil Ma'ruf) (pergaulan-suami-istri-yang-makruf-muasyarah-bil-maruf)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Pergaulan Suami Istri yang Makruf (Mu\'asyarah bil Ma\'ruf)', 'Tuntunan Al-Qur\'an dalam memperlakukan pasangan hidup secara santun, memelihara hak-hak istri, saling memahami kelebihan dan kekurangan, serta menyelesaikan riak rumah tangga dengan hikmah.', 'pergaulan-suami-istri-yang-makruf-muasyarah-bil-maruf', 1, 292, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'pergaulan-suami-istri-yang-makruf-muasyarah-bil-maruf' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 187, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 228, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 229, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 19, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 34, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 128, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 65, 6, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Mendidik Generasi Shalih dan Penyejuk Hati (Qurrota A'yun) (mendidik-generasi-shalih-dan-penyejuk-hati-qurrota-ayun)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Mendidik Generasi Shalih dan Penyejuk Hati (Qurrota A\'yun)', 'Ikhtiar dan doa para orang tua untuk mendidik anak-anak agar mencintai Allah dan Rasul-Nya, mendirikan shalat tepat waktu, menjauhi perbuatan tercela, dan menjadi pionir bagi orang-orang bertakwa.', 'mendidik-generasi-shalih-dan-penyejuk-hati-qurrota-ayun', 1, 293, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'mendidik-generasi-shalih-dan-penyejuk-hati-qurrota-ayun' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 14, 40, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 19, 55, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 132, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 25, 74, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 46, 15, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 66, 6, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Tanggung Jawab Nafkah Keluarga dan Rezeki Halal (tanggung-jawab-nafkah-keluarga-dan-rezeki-halal)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Tanggung Jawab Nafkah Keluarga dan Rezeki Halal', 'Kewajiban kepala rumah tangga dalam memberikan nafkah lahiriah dari rezeki yang halal dan thoyyib sesuai dengan kelapangan rezekinya, tanpa melalaikan hak asuh dan bimbingan batin.', 'tanggung-jawab-nafkah-keluarga-dan-rezeki-halal', 1, 294, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'tanggung-jawab-nafkah-keluarga-dan-rezeki-halal' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 233, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 34, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 65, 7, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Doa Memohon Keteguhan Hati di Atas Hidayah (doa-memohon-keteguhan-hati-di-atas-hidayah)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Doa Memohon Keteguhan Hati di Atas Hidayah', 'Munajat agung para ahli ilmu agar hati tidak dicondongkan kepada kesesatan setelah Allah memberikan cahaya hidayah, serta permohonan karunia rahmat yang melimpah dari sisi Allah Al-Wahhab.', 'doa-memohon-keteguhan-hati-di-atas-hidayah', 1, 295, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'doa-memohon-keteguhan-hati-di-atas-hidayah' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 3, 8, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 3, 9, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 3, 193, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 3, 194, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 7, 126, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Doa Sapu Jagat: Kebaikan Dunia dan Keselamatan Akhirat (doa-sapu-jagat-kebaikan-dunia-dan-keselamatan-akhirat)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Doa Sapu Jagat: Kebaikan Dunia dan Keselamatan Akhirat', 'Doa yang paling sering dipanjatkan Rasulullah SAW memohon kebaikan hidup di dunia, kebahagiaan sejati di akhirat, serta perlindungan dari siksaan dahsyat api neraka.', 'doa-sapu-jagat-kebaikan-dunia-dan-keselamatan-akhirat', 1, 296, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'doa-sapu-jagat-kebaikan-dunia-dan-keselamatan-akhirat' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 201, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 2, 286, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 7, 156, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 28, 22, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Doa Memohon Keturunan Shalih dan Pemimpin Kebaikan (doa-memohon-keturunan-shalih-dan-pemimpin-kebaikan)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Doa Memohon Keturunan Shalih dan Pemimpin Kebaikan', 'Untaian doa para nabi mulia (Nabi Ibrahim, Nabi Zakariya) memohon dianugerahi keturunan yang berbakti, berakhlak mulia, dan istiqamah mendirikan shalat.', 'doa-memohon-keturunan-shalih-dan-pemimpin-kebaikan', 1, 297, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'doa-memohon-keturunan-shalih-dan-pemimpin-kebaikan' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 3, 38, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 14, 40, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 19, 4, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 19, 5, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 19, 6, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 89, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 25, 74, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 100, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Doa Menghadapi Tugas Berat dan Kelapangan Dada (doa-menghadapi-tugas-berat-dan-kelapangan-dada)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Doa Menghadapi Tugas Berat dan Kelapangan Dada', 'Doa Nabi Musa AS saat diutus menghadapi kekejaman Fir\'aun, memohon agar dilapangkan dadanya, dimudahkan segala urusannya, dan dilepaskan kekakuan lidahnya agar ucapannya dipahami dengan baik.', 'doa-menghadapi-tugas-berat-dan-kelapangan-dada', 1, 298, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'doa-menghadapi-tugas-berat-dan-kelapangan-dada' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 20, 25, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 26, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 27, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 28, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 29, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 30, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 31, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 20, 32, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Doa Ampunan dan Curahan Rahmat bagi Orang Tua (doa-ampunan-dan-curahan-rahmat-bagi-orang-tua)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Doa Ampunan dan Curahan Rahmat bagi Orang Tua', 'Munajat bakti seorang anak kepada ayah dan ibunya, memohon agar Allah mengasihi dan mengampuni keduanya sebagaimana mereka telah merawat dan mendidik dengan penuh cinta di masa kecil.', 'doa-ampunan-dan-curahan-rahmat-bagi-orang-tua', 1, 299, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'doa-ampunan-dan-curahan-rahmat-bagi-orang-tua' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 14, 41, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 17, 24, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 27, 19, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 46, 15, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 71, 28, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Peristiwa Kedahsyatan Hari Kiamat (Al-Zalzalah dan Al-Qari'ah) (peristiwa-kedahsyatan-hari-kiamat-al-zalzalah-dan-al-qariah)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Peristiwa Kedahsyatan Hari Kiamat (Al-Zalzalah dan Al-Qari\'ah)', 'Gambaran runtuhnya tatanan kosmik semesta saat sangkakala ditiup: bumi diguncangkan sehebat-hebatnya, langit terbelah, bintang berjatuhan, lautan meluap, dan manusia seperti anai-anai berhamburan.', 'peristiwa-kedahsyatan-hari-kiamat-al-zalzalah-dan-al-qariah', 1, 300, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'peristiwa-kedahsyatan-hari-kiamat-al-zalzalah-dan-al-qariah' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 22, 1, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 22, 2, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 56, 1, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 56, 2, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 56, 3, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 56, 4, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 56, 5, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 56, 6, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 81, 1, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 81, 2, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 81, 3, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 82, 1, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 82, 2, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 82, 3, 14, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 82, 4, 15, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 82, 5, 16, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 99, 1, 17, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 99, 2, 18, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 99, 3, 19, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 101, 1, 20, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 101, 2, 21, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 101, 3, 22, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 101, 4, 23, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 101, 5, 24, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Pengadilan Padang Mahsyar dan Timbangan Amal (Mizan) (pengadilan-padang-mahsyar-dan-timbangan-amal-mizan)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Pengadilan Padang Mahsyar dan Timbangan Amal (Mizan)', 'Sidang hisab akbar di mana setiap lembaran catatan amal dibuka, saksi dari anggota tubuh berbicara, dan timbangan keadilan (Mizan) diletakkan tanpa ada kezaliman sedikit pun seberat biji zarrah.', 'pengadilan-padang-mahsyar-dan-timbangan-amal-mizan', 1, 301, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'pengadilan-padang-mahsyar-dan-timbangan-amal-mizan' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 17, 13, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 17, 14, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 21, 47, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 23, 102, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 23, 103, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 36, 65, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 39, 68, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 39, 69, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 39, 70, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 69, 19, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 69, 25, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 99, 7, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 99, 8, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Kenikmatan Surga dan Tingkatannya (Jannatun Na'im) (kenikmatan-surga-dan-tingkatannya-jannatun-naim)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Kenikmatan Surga dan Tingkatannya (Jannatun Na\'im)', 'Balasan agung bagi orang-orang mukmin yang istiqamah: taman-taman indah yang dialiri sungai-sungai jernih, jamuan buah-buahan dan hidangan lezat, pakaian sutra halus, serta puncak kenikmatan memandang wajah Allah SWT.', 'kenikmatan-surga-dan-tingkatannya-jannatun-naim', 1, 302, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'kenikmatan-surga-dan-tingkatannya-jannatun-naim' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 25, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 3, 15, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 13, 23, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 13, 24, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 18, 31, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 47, 15, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 55, 46, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 55, 48, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 56, 10, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 56, 11, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 56, 12, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 76, 12, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 76, 13, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 76, 14, 14, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 76, 21, 15, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 88, 10, 16, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 88, 11, 17, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 88, 12, 18, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

-- ----------------------------------------------------------------------------
-- Topik: Peringatan Dahsyatnya Azab Neraka Jahannam (peringatan-dahsyatnya-azab-neraka-jahannam)
-- ----------------------------------------------------------------------------
INSERT INTO `tafsir_maudhui_topics` (`topic`, `description`, `slug`, `is_active`, `sort_order`, `created_at`, `updated_at`)
VALUES ('Peringatan Dahsyatnya Azab Neraka Jahannam', 'Peringatan agar manusia menjauhi kekufuran, kesombongan, dan kemaksiatan: gambaran siksaan api neraka yang bergejolak, makanan pohon zaqqum yang berduri dan mendidih di perut, serta penyesalan mendalam para penghuninya.', 'peringatan-dahsyatnya-azab-neraka-jahannam', 1, 303, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`), `updated_at` = VALUES(`updated_at`);

SET @current_topic_id = (SELECT `id` FROM `tafsir_maudhui_topics` WHERE `slug` = 'peringatan-dahsyatnya-azab-neraka-jahannam' LIMIT 1);

INSERT INTO `tafsir_maudhui_verses` (`topic_id`, `surah_number`, `ayah_number`, `sort_order`, `created_at`, `updated_at`)
VALUES
(@current_topic_id, 2, 24, 1, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 4, 56, 2, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 14, 16, 3, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 14, 17, 4, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 22, 19, 5, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 22, 20, 6, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 22, 21, 7, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 22, 22, 8, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 25, 65, 9, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 25, 66, 10, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 62, 11, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 63, 12, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 64, 13, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 65, 14, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 37, 66, 15, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 44, 43, 16, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 44, 44, 17, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 44, 45, 18, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 44, 46, 19, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 67, 6, 20, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 67, 7, 21, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 67, 8, 22, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 78, 21, 23, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 78, 22, 24, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 78, 23, 25, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 78, 24, 26, '2026-08-29 21:25:11', '2026-08-29 21:25:11'),
(@current_topic_id, 78, 25, 27, '2026-08-29 21:25:11', '2026-08-29 21:25:11')
ON DUPLICATE KEY UPDATE `sort_order` = VALUES(`sort_order`), `updated_at` = VALUES(`updated_at`);

SET FOREIGN_KEY_CHECKS=1;

-- Done inserting additional tafsir maudhui data.