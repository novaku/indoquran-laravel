-- Fix Juz Values Mapping for Al-Quran (1-30)
-- This SQL script updates the juz column in ayahs table with accurate Quranic divisions

-- Juz 1: Al-Fatihah 1:1-7 + Al-Baqarah 2:1-141
UPDATE ayahs SET juz = 1 WHERE surah_number = 1 AND ayah_number BETWEEN 1 AND 7;
UPDATE ayahs SET juz = 1 WHERE surah_number = 2 AND ayah_number BETWEEN 1 AND 141;

-- Juz 2: Al-Baqarah 2:142-252
UPDATE ayahs SET juz = 2 WHERE surah_number = 2 AND ayah_number BETWEEN 142 AND 252;

-- Juz 3: Al-Baqarah 2:253-286 + Ali 'Imran 3:1-92
UPDATE ayahs SET juz = 3 WHERE surah_number = 2 AND ayah_number BETWEEN 253 AND 286;
UPDATE ayahs SET juz = 3 WHERE surah_number = 3 AND ayah_number BETWEEN 1 AND 92;

-- Juz 4: Ali 'Imran 3:93-200 + An-Nisa' 4:1-23
UPDATE ayahs SET juz = 4 WHERE surah_number = 3 AND ayah_number BETWEEN 93 AND 200;
UPDATE ayahs SET juz = 4 WHERE surah_number = 4 AND ayah_number BETWEEN 1 AND 23;

-- Juz 5: An-Nisa' 4:24-147
UPDATE ayahs SET juz = 5 WHERE surah_number = 4 AND ayah_number BETWEEN 24 AND 147;

-- Juz 6: An-Nisa' 4:148-176 + Al-Ma'idah 5:1-81
UPDATE ayahs SET juz = 6 WHERE surah_number = 4 AND ayah_number BETWEEN 148 AND 176;
UPDATE ayahs SET juz = 6 WHERE surah_number = 5 AND ayah_number BETWEEN 1 AND 81;

-- Juz 7: Al-Ma'idah 5:82-120 + Al-An'am 6:1-110
UPDATE ayahs SET juz = 7 WHERE surah_number = 5 AND ayah_number BETWEEN 82 AND 120;
UPDATE ayahs SET juz = 7 WHERE surah_number = 6 AND ayah_number BETWEEN 1 AND 110;

-- Juz 8: Al-An'am 6:111-165 + Al-A'raf 7:1-87
UPDATE ayahs SET juz = 8 WHERE surah_number = 6 AND ayah_number BETWEEN 111 AND 165;
UPDATE ayahs SET juz = 8 WHERE surah_number = 7 AND ayah_number BETWEEN 1 AND 87;

-- Juz 9: Al-A'raf 7:88-206 + Al-Anfal 8:1-40
UPDATE ayahs SET juz = 9 WHERE surah_number = 7 AND ayah_number BETWEEN 88 AND 206;
UPDATE ayahs SET juz = 9 WHERE surah_number = 8 AND ayah_number BETWEEN 1 AND 40;

-- Juz 10: Al-Anfal 8:41-75 + At-Tawbah 9:1-92
UPDATE ayahs SET juz = 10 WHERE surah_number = 8 AND ayah_number BETWEEN 41 AND 75;
UPDATE ayahs SET juz = 10 WHERE surah_number = 9 AND ayah_number BETWEEN 1 AND 92;

-- Juz 11: At-Tawbah 9:93-129 + Yunus 10:1-109 + Hud 11:1-5
UPDATE ayahs SET juz = 11 WHERE surah_number = 9 AND ayah_number BETWEEN 93 AND 129;
UPDATE ayahs SET juz = 11 WHERE surah_number = 10 AND ayah_number BETWEEN 1 AND 109;
UPDATE ayahs SET juz = 11 WHERE surah_number = 11 AND ayah_number BETWEEN 1 AND 5;

-- Juz 12: Hud 11:6-123 + Yusuf 12:1-52
UPDATE ayahs SET juz = 12 WHERE surah_number = 11 AND ayah_number BETWEEN 6 AND 123;
UPDATE ayahs SET juz = 12 WHERE surah_number = 12 AND ayah_number BETWEEN 1 AND 52;

-- Juz 13: Yusuf 12:53-111 + Ar-Ra'd 13:1-43 + Ibrahim 14:1-52
UPDATE ayahs SET juz = 13 WHERE surah_number = 12 AND ayah_number BETWEEN 53 AND 111;
UPDATE ayahs SET juz = 13 WHERE surah_number = 13 AND ayah_number BETWEEN 1 AND 43;
UPDATE ayahs SET juz = 13 WHERE surah_number = 14 AND ayah_number BETWEEN 1 AND 52;

-- Juz 14: Al-Hijr 15:1-99 + An-Nahl 16:1-128
UPDATE ayahs SET juz = 14 WHERE surah_number = 15 AND ayah_number BETWEEN 1 AND 99;
UPDATE ayahs SET juz = 14 WHERE surah_number = 16 AND ayah_number BETWEEN 1 AND 128;

-- Juz 15: Al-Isra' 17:1-111 + Al-Kahf 18:1-74
UPDATE ayahs SET juz = 15 WHERE surah_number = 17 AND ayah_number BETWEEN 1 AND 111;
UPDATE ayahs SET juz = 15 WHERE surah_number = 18 AND ayah_number BETWEEN 1 AND 74;

-- Juz 16: Al-Kahf 18:75-110 + Maryam 19:1-98 + Ta-Ha 20:1-135
UPDATE ayahs SET juz = 16 WHERE surah_number = 18 AND ayah_number BETWEEN 75 AND 110;
UPDATE ayahs SET juz = 16 WHERE surah_number = 19 AND ayah_number BETWEEN 1 AND 98;
UPDATE ayahs SET juz = 16 WHERE surah_number = 20 AND ayah_number BETWEEN 1 AND 135;

-- Juz 17: Al-Anbiya' 21:1-112 + Al-Hajj 22:1-78
UPDATE ayahs SET juz = 17 WHERE surah_number = 21 AND ayah_number BETWEEN 1 AND 112;
UPDATE ayahs SET juz = 17 WHERE surah_number = 22 AND ayah_number BETWEEN 1 AND 78;

-- Juz 18: Al-Mu'minun 23:1-118 + An-Nur 24:1-64 + Al-Furqan 25:1-20
UPDATE ayahs SET juz = 18 WHERE surah_number = 23 AND ayah_number BETWEEN 1 AND 118;
UPDATE ayahs SET juz = 18 WHERE surah_number = 24 AND ayah_number BETWEEN 1 AND 64;
UPDATE ayahs SET juz = 18 WHERE surah_number = 25 AND ayah_number BETWEEN 1 AND 20;

-- Juz 19: Al-Furqan 25:21-77 + Asy-Syu'ara' 26:1-227 + An-Naml 27:1-55
UPDATE ayahs SET juz = 19 WHERE surah_number = 25 AND ayah_number BETWEEN 21 AND 77;
UPDATE ayahs SET juz = 19 WHERE surah_number = 26 AND ayah_number BETWEEN 1 AND 227;
UPDATE ayahs SET juz = 19 WHERE surah_number = 27 AND ayah_number BETWEEN 1 AND 55;

-- Juz 20: An-Naml 27:56-93 + Al-Qasas 28:1-88 + Al-'Ankabut 29:1-45
UPDATE ayahs SET juz = 20 WHERE surah_number = 27 AND ayah_number BETWEEN 56 AND 93;
UPDATE ayahs SET juz = 20 WHERE surah_number = 28 AND ayah_number BETWEEN 1 AND 88;
UPDATE ayahs SET juz = 20 WHERE surah_number = 29 AND ayah_number BETWEEN 1 AND 45;

-- Juz 21: Al-'Ankabut 29:46-69 + Ar-Rum 30:1-60 + Luqman 31:1-34 + As-Sajdah 32:1-30 + Al-Ahzab 33:1-30
UPDATE ayahs SET juz = 21 WHERE surah_number = 29 AND ayah_number BETWEEN 46 AND 69;
UPDATE ayahs SET juz = 21 WHERE surah_number = 30 AND ayah_number BETWEEN 1 AND 60;
UPDATE ayahs SET juz = 21 WHERE surah_number = 31 AND ayah_number BETWEEN 1 AND 34;
UPDATE ayahs SET juz = 21 WHERE surah_number = 32 AND ayah_number BETWEEN 1 AND 30;
UPDATE ayahs SET juz = 21 WHERE surah_number = 33 AND ayah_number BETWEEN 1 AND 30;

-- Juz 22: Al-Ahzab 33:31-73 + Saba' 34:1-54 + Fatir 35:1-45 + Ya-Sin 36:1-27
UPDATE ayahs SET juz = 22 WHERE surah_number = 33 AND ayah_number BETWEEN 31 AND 73;
UPDATE ayahs SET juz = 22 WHERE surah_number = 34 AND ayah_number BETWEEN 1 AND 54;
UPDATE ayahs SET juz = 22 WHERE surah_number = 35 AND ayah_number BETWEEN 1 AND 45;
UPDATE ayahs SET juz = 22 WHERE surah_number = 36 AND ayah_number BETWEEN 1 AND 27;

-- Juz 23: Ya-Sin 36:28-83 + As-Saffat 37:1-182 + Sad 38:1-88 + Az-Zumar 39:1-31
UPDATE ayahs SET juz = 23 WHERE surah_number = 36 AND ayah_number BETWEEN 28 AND 83;
UPDATE ayahs SET juz = 23 WHERE surah_number = 37 AND ayah_number BETWEEN 1 AND 182;
UPDATE ayahs SET juz = 23 WHERE surah_number = 38 AND ayah_number BETWEEN 1 AND 88;
UPDATE ayahs SET juz = 23 WHERE surah_number = 39 AND ayah_number BETWEEN 1 AND 31;

-- Juz 24: Az-Zumar 39:32-75 + Ghafir 40:1-85 + Fussilat 41:1-46
UPDATE ayahs SET juz = 24 WHERE surah_number = 39 AND ayah_number BETWEEN 32 AND 75;
UPDATE ayahs SET juz = 24 WHERE surah_number = 40 AND ayah_number BETWEEN 1 AND 85;
UPDATE ayahs SET juz = 24 WHERE surah_number = 41 AND ayah_number BETWEEN 1 AND 46;

-- Juz 25: Fussilat 41:47-54 + Asy-Syura 42:1-53 + Az-Zukhruf 43:1-89 + Ad-Dukhan 44:1-59 + Al-Jasiyah 45:1-37
UPDATE ayahs SET juz = 25 WHERE surah_number = 41 AND ayah_number BETWEEN 47 AND 54;
UPDATE ayahs SET juz = 25 WHERE surah_number = 42 AND ayah_number BETWEEN 1 AND 53;
UPDATE ayahs SET juz = 25 WHERE surah_number = 43 AND ayah_number BETWEEN 1 AND 89;
UPDATE ayahs SET juz = 25 WHERE surah_number = 44 AND ayah_number BETWEEN 1 AND 59;
UPDATE ayahs SET juz = 25 WHERE surah_number = 45 AND ayah_number BETWEEN 1 AND 37;

-- Juz 26: Al-Ahqaf 46:1-35 + Muhammad 47:1-38 + Al-Fath 48:1-29 + Al-Hujurat 49:1-18 + Qaf 50:1-45 + Az-Zariyat 51:1-30
UPDATE ayahs SET juz = 26 WHERE surah_number = 46 AND ayah_number BETWEEN 1 AND 35;
UPDATE ayahs SET juz = 26 WHERE surah_number = 47 AND ayah_number BETWEEN 1 AND 38;
UPDATE ayahs SET juz = 26 WHERE surah_number = 48 AND ayah_number BETWEEN 1 AND 29;
UPDATE ayahs SET juz = 26 WHERE surah_number = 49 AND ayah_number BETWEEN 1 AND 18;
UPDATE ayahs SET juz = 26 WHERE surah_number = 50 AND ayah_number BETWEEN 1 AND 45;
UPDATE ayahs SET juz = 26 WHERE surah_number = 51 AND ayah_number BETWEEN 1 AND 30;

-- Juz 27: Az-Zariyat 51:31-60 + At-Tur 52:1-49 + An-Najm 53:1-62 + Al-Qamar 54:1-55 + Ar-Rahman 55:1-78 + Al-Waqi'ah 56:1-96 + Al-Hadid 57:1-29
UPDATE ayahs SET juz = 27 WHERE surah_number = 51 AND ayah_number BETWEEN 31 AND 60;
UPDATE ayahs SET juz = 27 WHERE surah_number = 52 AND ayah_number BETWEEN 1 AND 49;
UPDATE ayahs SET juz = 27 WHERE surah_number = 53 AND ayah_number BETWEEN 1 AND 62;
UPDATE ayahs SET juz = 27 WHERE surah_number = 54 AND ayah_number BETWEEN 1 AND 55;
UPDATE ayahs SET juz = 27 WHERE surah_number = 55 AND ayah_number BETWEEN 1 AND 78;
UPDATE ayahs SET juz = 27 WHERE surah_number = 56 AND ayah_number BETWEEN 1 AND 96;
UPDATE ayahs SET juz = 27 WHERE surah_number = 57 AND ayah_number BETWEEN 1 AND 29;

-- Juz 28: Al-Mujadilah 58 s/d At-Tahrim 66
UPDATE ayahs SET juz = 28 WHERE surah_number = 58 AND ayah_number BETWEEN 1 AND 22;
UPDATE ayahs SET juz = 28 WHERE surah_number = 59 AND ayah_number BETWEEN 1 AND 24;
UPDATE ayahs SET juz = 28 WHERE surah_number = 60 AND ayah_number BETWEEN 1 AND 13;
UPDATE ayahs SET juz = 28 WHERE surah_number = 61 AND ayah_number BETWEEN 1 AND 14;
UPDATE ayahs SET juz = 28 WHERE surah_number = 62 AND ayah_number BETWEEN 1 AND 11;
UPDATE ayahs SET juz = 28 WHERE surah_number = 63 AND ayah_number BETWEEN 1 AND 11;
UPDATE ayahs SET juz = 28 WHERE surah_number = 64 AND ayah_number BETWEEN 1 AND 18;
UPDATE ayahs SET juz = 28 WHERE surah_number = 65 AND ayah_number BETWEEN 1 AND 12;
UPDATE ayahs SET juz = 28 WHERE surah_number = 66 AND ayah_number BETWEEN 1 AND 12;

-- Juz 29: Al-Mulk 67 s/d Al-Mursalat 77
UPDATE ayahs SET juz = 29 WHERE surah_number = 67 AND ayah_number BETWEEN 1 AND 30;
UPDATE ayahs SET juz = 29 WHERE surah_number = 68 AND ayah_number BETWEEN 1 AND 52;
UPDATE ayahs SET juz = 29 WHERE surah_number = 69 AND ayah_number BETWEEN 1 AND 52;
UPDATE ayahs SET juz = 29 WHERE surah_number = 70 AND ayah_number BETWEEN 1 AND 44;
UPDATE ayahs SET juz = 29 WHERE surah_number = 71 AND ayah_number BETWEEN 1 AND 28;
UPDATE ayahs SET juz = 29 WHERE surah_number = 72 AND ayah_number BETWEEN 1 AND 28;
UPDATE ayahs SET juz = 29 WHERE surah_number = 73 AND ayah_number BETWEEN 1 AND 20;
UPDATE ayahs SET juz = 29 WHERE surah_number = 74 AND ayah_number BETWEEN 1 AND 56;
UPDATE ayahs SET juz = 29 WHERE surah_number = 75 AND ayah_number BETWEEN 1 AND 40;
UPDATE ayahs SET juz = 29 WHERE surah_number = 76 AND ayah_number BETWEEN 1 AND 31;
UPDATE ayahs SET juz = 29 WHERE surah_number = 77 AND ayah_number BETWEEN 1 AND 50;

-- Juz 30: An-Naba' 78 s/d An-Nas 114
UPDATE ayahs SET juz = 30 WHERE surah_number = 78 AND ayah_number BETWEEN 1 AND 40;
UPDATE ayahs SET juz = 30 WHERE surah_number = 79 AND ayah_number BETWEEN 1 AND 46;
UPDATE ayahs SET juz = 30 WHERE surah_number = 80 AND ayah_number BETWEEN 1 AND 42;
UPDATE ayahs SET juz = 30 WHERE surah_number = 81 AND ayah_number BETWEEN 1 AND 29;
UPDATE ayahs SET juz = 30 WHERE surah_number = 82 AND ayah_number BETWEEN 1 AND 19;
UPDATE ayahs SET juz = 30 WHERE surah_number = 83 AND ayah_number BETWEEN 1 AND 36;
UPDATE ayahs SET juz = 30 WHERE surah_number = 84 AND ayah_number BETWEEN 1 AND 25;
UPDATE ayahs SET juz = 30 WHERE surah_number = 85 AND ayah_number BETWEEN 1 AND 22;
UPDATE ayahs SET juz = 30 WHERE surah_number = 86 AND ayah_number BETWEEN 1 AND 17;
UPDATE ayahs SET juz = 30 WHERE surah_number = 87 AND ayah_number BETWEEN 1 AND 19;
UPDATE ayahs SET juz = 30 WHERE surah_number = 88 AND ayah_number BETWEEN 1 AND 26;
UPDATE ayahs SET juz = 30 WHERE surah_number = 89 AND ayah_number BETWEEN 1 AND 30;
UPDATE ayahs SET juz = 30 WHERE surah_number = 90 AND ayah_number BETWEEN 1 AND 20;
UPDATE ayahs SET juz = 30 WHERE surah_number = 91 AND ayah_number BETWEEN 1 AND 15;
UPDATE ayahs SET juz = 30 WHERE surah_number = 92 AND ayah_number BETWEEN 1 AND 21;
UPDATE ayahs SET juz = 30 WHERE surah_number = 93 AND ayah_number BETWEEN 1 AND 11;
UPDATE ayahs SET juz = 30 WHERE surah_number = 94 AND ayah_number BETWEEN 1 AND 8;
UPDATE ayahs SET juz = 30 WHERE surah_number = 95 AND ayah_number BETWEEN 1 AND 8;
UPDATE ayahs SET juz = 30 WHERE surah_number = 96 AND ayah_number BETWEEN 1 AND 19;
UPDATE ayahs SET juz = 30 WHERE surah_number = 97 AND ayah_number BETWEEN 1 AND 5;
UPDATE ayahs SET juz = 30 WHERE surah_number = 98 AND ayah_number BETWEEN 1 AND 8;
UPDATE ayahs SET juz = 30 WHERE surah_number = 99 AND ayah_number BETWEEN 1 AND 8;
UPDATE ayahs SET juz = 30 WHERE surah_number = 100 AND ayah_number BETWEEN 1 AND 11;
UPDATE ayahs SET juz = 30 WHERE surah_number = 101 AND ayah_number BETWEEN 1 AND 11;
UPDATE ayahs SET juz = 30 WHERE surah_number = 102 AND ayah_number BETWEEN 1 AND 8;
UPDATE ayahs SET juz = 30 WHERE surah_number = 103 AND ayah_number BETWEEN 1 AND 3;
UPDATE ayahs SET juz = 30 WHERE surah_number = 104 AND ayah_number BETWEEN 1 AND 9;
UPDATE ayahs SET juz = 30 WHERE surah_number = 105 AND ayah_number BETWEEN 1 AND 5;
UPDATE ayahs SET juz = 30 WHERE surah_number = 106 AND ayah_number BETWEEN 1 AND 4;
UPDATE ayahs SET juz = 30 WHERE surah_number = 107 AND ayah_number BETWEEN 1 AND 7;
UPDATE ayahs SET juz = 30 WHERE surah_number = 108 AND ayah_number BETWEEN 1 AND 3;
UPDATE ayahs SET juz = 30 WHERE surah_number = 109 AND ayah_number BETWEEN 1 AND 6;
UPDATE ayahs SET juz = 30 WHERE surah_number = 110 AND ayah_number BETWEEN 1 AND 3;
UPDATE ayahs SET juz = 30 WHERE surah_number = 111 AND ayah_number BETWEEN 1 AND 5;
UPDATE ayahs SET juz = 30 WHERE surah_number = 112 AND ayah_number BETWEEN 1 AND 4;
UPDATE ayahs SET juz = 30 WHERE surah_number = 113 AND ayah_number BETWEEN 1 AND 5;
UPDATE ayahs SET juz = 30 WHERE surah_number = 114 AND ayah_number BETWEEN 1 AND 6;
