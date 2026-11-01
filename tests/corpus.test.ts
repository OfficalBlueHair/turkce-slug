import { describe, expect, it } from "vitest";

import {
  toLowercaseTr,
  toUppercaseTr,
} from "../src/case";
import { slugify } from "../src/slugify";
import { TURKISH_WORDS } from "./fixtures/turkish-words";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TURKISH_LETTERS = "çğıöşüâîû";

describe("Turkish word corpus", () => {
  it("contains a large, unique word sample", () => {
    expect(TURKISH_WORDS.length).toBeGreaterThanOrEqual(4000);
    expect(new Set(TURKISH_WORDS).size).toBe(TURKISH_WORDS.length);
  });

  it("covers every Turkish-specific letter", () => {
    const letters = new Set(TURKISH_WORDS.join("").toLowerCase());
    const missing = [...TURKISH_LETTERS].filter(
      (letter) => !letters.has(letter),
    );

    expect(missing).toEqual([]);
  });

  it("produces valid ASCII slugs for every word", () => {
    const invalid = TURKISH_WORDS.map((word) => ({
      word,
      slug: slugify(word),
    })).filter(({ slug }) => !SLUG_PATTERN.test(slug));

    expect(invalid).toEqual([]);
  });

  it("produces idempotent slugs for every word", () => {
    const unstable = TURKISH_WORDS.map((word) => {
      const slug = slugify(word);

      return { word, slug, again: slugify(slug) };
    }).filter(({ slug, again }) => slug !== again);

    expect(unstable).toEqual([]);
  });

  it("round-trips Turkish casing for every word", () => {
    const mismatches = TURKISH_WORDS.map((word) => ({
      word,
      expected: toLowercaseTr(word),
      actual: toLowercaseTr(toUppercaseTr(word)),
    })).filter(({ expected, actual }) => expected !== actual);

    expect(mismatches).toEqual([]);
  });

  it("keeps tricky Turkish words accurate", () => {
    const cases = [
      ["İSTANBUL", "istanbul"],
      ["IĞDIR", "igdir"],
      ["ışık", "isik"],
      ["çiçek", "cicek"],
      ["öğretmen", "ogretmen"],
      ["şüphe", "suphe"],
      ["kâğıt", "kagit"],
      ["îcat", "icat"],
      ["ûfuk", "ufuk"],
      ["İstanbul'da", "istanbulda"],
      ["Iğdır'ın", "igdirin"],
      ["Türkiye'nin", "turkiyenin"],
      ["Ankara'ya", "ankaraya"],
      ["İzmir'den", "izmirden"],
      ["Ağrı Dağı", "agri-dagi"],
    ] as const;

    for (const [input, expected] of cases) {
      expect(slugify(input)).toBe(expected);
    }
  });
});
