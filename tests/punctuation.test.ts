import { describe, expect, it } from "vitest";

import { removePunctuation } from "../src/punctuation";

describe("removePunctuation", () => {
  it.each([
    ["Merhaba, dünya!", "Merhaba dünya"],
    ["  Merhaba,   dünya!  ", "Merhaba dünya"],
    ["İstanbul'da yaşıyorum.", "İstanbulda yaşıyorum"],
    ["İstanbul’da yaşıyorum.", "İstanbulda yaşıyorum"],
    ["Fiyat: 100 TL / Ay", "Fiyat 100 TL Ay"],
    ["Türkçe: ç, ğ, ı, İ, ö, ş, ü.", "Türkçe ç ğ ı İ ö ş ü"],
    ["Çağrı ışık öğüt şüphe", "Çağrı ışık öğüt şüphe"],
    ["e-posta", "e posta"],
    ["test_deneme", "test deneme"],
    ["a\tb\nc", "a b c"],
    ["“Tırnak” içinde", "Tırnak içinde"],
    ["!!!---???", ""],
    ["😀😍", ""],
    ["", ""],
  ])("cleans %j to %j", (input, expected) => {
    expect(removePunctuation(input)).toBe(expected);
  });
});
