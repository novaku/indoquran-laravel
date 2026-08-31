-- ==============================================================================
-- Script SQL untuk Fix Migrasi 'add_phone_to_users_table' di phpMyAdmin
-- Database: indoqura_db
-- ==============================================================================

-- 1. Pastikan index 'users_phone_index' terpasang pada kolom `phone`
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @indexname = 'users_phone_index';

SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = @dbname
          AND TABLE_NAME = @tablename
          AND INDEX_NAME = @indexname
    ) > 0,
    'SELECT "Index users_phone_index already exists" AS status;',
    'ALTER TABLE `users` ADD INDEX `users_phone_index` (`phone`);'
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. Daftarkan migrasi ke tabel `migrations` Laravel
-- Agar saat 'php artisan migrate' dijalankan, Laravel tidak mencoba mengeksekusinya lagi
INSERT INTO `migrations` (`migration`, `batch`)
SELECT '2025_08_02_232334_add_phone_to_users_table', COALESCE(MAX(`batch`), 0) + 1
FROM `migrations`
WHERE NOT EXISTS (
    SELECT 1 FROM `migrations` WHERE `migration` = '2025_08_02_232334_add_phone_to_users_table'
);
