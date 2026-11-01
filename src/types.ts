export interface SlugifyOptions {
  /**
   * String inserted between words.
   * @default "-"
   */
  separator?: string;

  /**
   * Converts the transliterated text to lowercase.
   * When disabled, original letter case is preserved.
   * @default true
   */
  lowercase?: boolean;

  /**
   * Removes separators from the beginning and end of the slug.
   * @default true
   */
  trim?: boolean;

  /**
   * Maximum slug length. Truncation prefers a word boundary and never
   * leaves a trailing separator.
   */
  maxLength?: number;

  /**
   * Keeps digits in the slug. When disabled, digits are removed.
   * @default true
   */
  preserveNumbers?: boolean;
}
