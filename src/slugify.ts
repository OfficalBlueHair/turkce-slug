import { APOSTROPHES, TURKISH_LETTERS, TURKISH_TO_ASCII } from "./charMaps";
import type { SlugifyOptions } from "./types";

const NON_ALPHANUMERIC = /[^A-Za-z0-9]+/;
const DIGITS = /\d+/g;

/**
 * Converts text into a Turkish-aware ASCII slug.
 */
export function slugify(text: string, options: SlugifyOptions = {}): string {
  if (typeof text !== "string") {
    throw new TypeError("slugify expects a string");
  }

  const {
    separator = "-",
    lowercase = true,
    trim = true,
    maxLength,
    preserveNumbers = true,
  } = options;

  if (typeof separator !== "string" || separator.length === 0) {
    throw new TypeError("separator must be a non-empty string");
  }

  let value = text
    .normalize("NFC")
    .replace(
      TURKISH_LETTERS,
      (character) => TURKISH_TO_ASCII[character] ?? character,
    );

  if (lowercase) {
    value = value.toLowerCase();
  }

  value = value.replace(APOSTROPHES, "");

  if (!preserveNumbers) {
    value = value.replace(DIGITS, "");
  }

  const parts = value.split(NON_ALPHANUMERIC);

  if (!parts.some((part) => part.length > 0)) {
    return "";
  }

  let slug = parts.join(separator);

  if (trim) {
    slug = stripSeparators(slug, separator);
  }

  if (maxLength !== undefined) {
    slug = truncateSlug(slug, separator, maxLength);
  }

  return slug;
}

function stripSeparators(value: string, separator: string): string {
  let start = 0;
  let end = value.length;

  while (value.startsWith(separator, start)) {
    start += separator.length;
  }

  while (end > start && value.endsWith(separator, end)) {
    end -= separator.length;
  }

  return value.slice(start, end);
}

function stripTrailingSeparators(value: string, separator: string): string {
  let end = value.length;

  while (end > 0 && value.endsWith(separator, end)) {
    end -= separator.length;
  }

  return value.slice(0, end);
}

function truncateSlug(
  value: string,
  separator: string,
  maxLength: number,
): string {
  const limit = Math.floor(maxLength);

  if (!Number.isFinite(limit)) {
    return stripTrailingSeparators(value, separator);
  }

  if (limit <= 0) {
    return "";
  }

  if (value.length <= limit) {
    return stripTrailingSeparators(value, separator);
  }

  let truncated = value.slice(0, limit);

  if (!value.startsWith(separator, limit)) {
    const lastSeparator = truncated.lastIndexOf(separator);

    if (lastSeparator > 0) {
      truncated = truncated.slice(0, lastSeparator);
    }
  }

  return stripTrailingSeparators(truncated, separator);
}
