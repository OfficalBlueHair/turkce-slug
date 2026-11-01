/**
 * Converts Turkish text to lowercase using Turkish casing rules.
 *
 * JavaScript's default toLowerCase maps "I" to "i", which is wrong in
 * Turkish. The special cases are replaced explicitly before the generic
 * lowercase step so the result does not depend on the host locale.
 */
export function toLowercaseTr(text: string): string {
  return text
    .normalize("NFC")
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase();
}

/**
 * Converts Turkish text to uppercase using Turkish casing rules.
 *
 * "i" becomes "İ" (dotted capital I) and "ı" becomes "I" (dotless
 * capital I). These replacements must happen before the generic
 * uppercase step, otherwise "i" would incorrectly become "I".
 */
export function toUppercaseTr(text: string): string {
  return text
    .normalize("NFC")
    .replace(/i/g, "İ")
    .replace(/ı/g, "I")
    .toUpperCase();
}

/**
 * Uppercases the first character and lowercases the rest.
 *
 * The first character is handled as a Unicode code point, so surrogate
 * pairs such as emoji are not split in half.
 */
export function capitalizeTr(text: string): string {
  const [first, ...rest] = Array.from(text.normalize("NFC"));

  if (first === undefined) {
    return "";
  }

  return toUppercaseTr(first) + toLowercaseTr(rest.join(""));
}

/**
 * Capitalizes every whitespace-separated word using Turkish casing.
 * Existing whitespace is preserved exactly.
 */
export function titleCaseTr(text: string): string {
  return text
    .normalize("NFC")
    .split(/(\s+)/)
    .map((part) => (part.trim() === "" ? part : capitalizeTr(part)))
    .join("");
}
