/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-ignore
import arabicReshaper from 'arabic-persian-reshaper';

/**
 * Re-shapes Arabic text and formats it for RTL rendering in @react-pdf/renderer.
 * Handles mixed numbers, English, and Arabic RTL word/character order seamlessly.
 */
export function fixArabicText(text: string | number | null | undefined): string {
    if (text === null || text === undefined) return '';
    const str = String(text).trim();
    if (!str) return '';

    try {
        // 1. Reshape Arabic letters to connected glyph forms (Isolated, Initial, Medial, Final)
        const reshaped = arabicReshaper.convertArabic(str);

        // 2. Tokenize by words
        const words = reshaped.split(' ');

        // 3. Process each word:
        // Reverse character order of Arabic words so LTR PDF engine draws RTL correctly.
        // Preserve internal character order of Latin/number tokens (e.g. WB-001, 100.00, 15%).
        const processedWords = words.map((word: string) => {
            const containsArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(word);
            if (containsArabic) {
                return word.split('').reverse().join('');
            }
            return word;
        });

        // 4. Reverse the order of words so the entire line reads Right-to-Left
        return processedWords.reverse().join(' ');
    } catch (err) {
        console.warn('Arabic reshaping error:', err);
        return str;
    }
}
