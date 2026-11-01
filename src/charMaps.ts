/**
 * Turkish letters with their ASCII equivalents.
 *
 * The mapping preserves case so slugify can decide later whether to
 * lowercase the result. With the default lowercase option the final
 * output of "Çok" is "cok"; with lowercase disabled it is "Cok".
 */
export const TURKISH_TO_ASCII: Readonly<Record<string, string>> = {
  "Ç": "C",
  "ç": "c",
  "Ğ": "G",
  "ğ": "g",
  "İ": "I",
  "I": "I",
  "ı": "i",
  "i": "i",
  "Ö": "O",
  "ö": "o",
  "Ş": "S",
  "ş": "s",
  "Ü": "U",
  "ü": "u",
  "Â": "A",
  "â": "a",
  "Î": "I",
  "î": "i",
  "Û": "U",
  "û": "u",
};

/**
 * Non-ASCII Turkish letters that need transliteration.
 * Plain "I" and "i" are intentionally excluded: they are already
 * ASCII and are handled by the optional lowercase step.
 */
export const TURKISH_LETTERS = /[ÇçĞğİıÖöŞşÜüÂâÎîÛû]/g;

/**
 * Apostrophes join Turkish suffixes to words and should be removed
 * without creating a word boundary: "İstanbul'da" -> "istanbulda".
 */
export const APOSTROPHES = /['’‘`´]/g;
