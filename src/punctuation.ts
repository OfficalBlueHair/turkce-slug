import { APOSTROPHES } from "./charMaps";

/**
 * Removes punctuation and symbols while keeping letters and numbers.
 *
 * Apostrophes are deleted rather than replaced with a space because they
 * connect suffixes in Turkish: "İstanbul'da" -> "İstanbulda". All other
 * punctuation and symbols become a single space, and whitespace is
 * normalized. Turkish letters such as ç, ğ, ı, İ, ö, ş and ü are kept.
 */
export function removePunctuation(text: string): string {
  return text
    .normalize("NFC")
    .replace(APOSTROPHES, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
