/**
 * Converts western numerals (0-9) to Arabic numerals (٠-٩)
 * @param {number|string} number - The number to convert
 * @returns {string} - The number in Arabic numerals
 */
export const toArabicNumeral = (number) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return number.toString().replace(/[0-9]/g, match => arabicNumerals[parseInt(match, 10)]);
};

/**
 * Converts Arabic numerals (٠-٩) to western numerals (0-9)
 * @param {string} str - The string containing Arabic numerals
 * @returns {string} - The string with Arabic numerals converted to western numerals
 */
export const fromArabicNumeral = (str) => {
    if (!str) return '';
    return str
        .replace(/[٠]/g, '0')
        .replace(/[١]/g, '1')
        .replace(/[٢]/g, '2')
        .replace(/[٣]/g, '3')
        .replace(/[٤]/g, '4')
        .replace(/[٥]/g, '5')
        .replace(/[٦]/g, '6')
        .replace(/[٧]/g, '7')
        .replace(/[٨]/g, '8')
        .replace(/[٩]/g, '9');
};