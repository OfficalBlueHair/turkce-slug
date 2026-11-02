import { describe, expect, it } from "vitest";

import { slugify } from "../src/slugify";

describe("slugify", () => {
  it.each([
    ["İSTANBUL", "istanbul"],
    ["IĞDIR", "igdir"],
    ["İstanbul'da Iğdır", "istanbulda-igdir"],
    ["İstanbul’da Iğdır", "istanbulda-igdir"],
    ["Çok Güzel Bir Başlık!", "cok-guzel-bir-baslik"],
    ["  Çok   Güzel!  ", "cok-guzel"],
    ["Hello World 123", "hello-world-123"],
    ["ŞÜKRÜ ÇAĞLAR", "sukru-caglar"],
    ["Mesafe: 100 Km / Gün", "mesafe-100-km-gun"],
    ["Ağrı Dağı 5137m", "agri-dagi-5137m"],
    ["kâğıt", "kagit"],
    ["Merhaba, dünya!", "merhaba-dunya"],
    ["Hello 😍 World", "hello-world"],
    ["C++ & C#", "c-c"],
    ["", ""],
    ["!!!---???", ""],
    ["😍😍😍", ""],
  ])("slugifies %j to %j", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("throws a TypeError for non-string input", () => {
    expect(() => slugify(42 as unknown as string)).toThrow(TypeError);
    expect(() => slugify(null as unknown as string)).toThrow(
      "slugify expects a string",
    );
  });

  it("rejects an empty separator", () => {
    expect(() => slugify("hello world", { separator: "" })).toThrow(
      "separator must be a non-empty string",
    );
  });
});

describe("slugify options", () => {
  it("uses a custom separator", () => {
    expect(slugify("Çok Güzel", { separator: "_" })).toBe("cok_guzel");
    expect(slugify("Çok Güzel", { separator: "__" })).toBe("cok__guzel");
  });

  it("preserves letter case when lowercase is disabled", () => {
    expect(slugify("Çok Güzel", { lowercase: false })).toBe("Cok-Guzel");
    expect(slugify("İSTANBUL", { lowercase: false })).toBe("ISTANBUL");
    expect(slugify("Iğdır", { lowercase: false })).toBe("Igdir");
  });

  it("removes boundary separators by default", () => {
    expect(slugify("  Çok Güzel!  ")).toBe("cok-guzel");
    expect(slugify("  Çok Güzel!  ", { trim: true })).toBe("cok-guzel");
  });

  it("keeps boundary separators when trim is disabled", () => {
    expect(slugify("  Çok Güzel!  ", { trim: false })).toBe("-cok-guzel-");
    expect(slugify("  Çok Güzel  ", { separator: "__", trim: false })).toBe(
      "__cok__guzel__",
    );
    expect(slugify("!!!---???", { trim: false })).toBe("");
  });

  it("keeps numbers by default", () => {
    expect(slugify("123")).toBe("123");
    expect(slugify("Mesafe: 100 Km / Gün")).toBe("mesafe-100-km-gun");
  });

  it("removes numbers when preserveNumbers is disabled", () => {
    expect(slugify("Mesafe: 100 Km / Gün", { preserveNumbers: false })).toBe(
      "mesafe-km-gun",
    );
    expect(slugify("Mesafe: 100 Km", { preserveNumbers: false })).toBe(
      "mesafe-km",
    );
    expect(slugify("abc123def", { preserveNumbers: false })).toBe("abcdef");
    expect(slugify("12345", { preserveNumbers: false })).toBe("");
  });
});

describe("slugify maxLength", () => {
  it("stays within the limit and does not end with a separator", () => {
    const result = slugify("Çok güzel bir başlık örneği", { maxLength: 10 });

    expect(result.length).toBeLessThanOrEqual(10);
    expect(result.endsWith("-")).toBe(false);
    expect(result).toBe("cok-guzel");
  });

  it("cuts at a word boundary when possible", () => {
    expect(slugify("Hello World", { maxLength: 6 })).toBe("hello");
    expect(slugify("Hello World", { maxLength: 5 })).toBe("hello");
  });

  it("hard cuts when the first word is longer than the limit", () => {
    expect(slugify("Hello World", { maxLength: 3 })).toBe("hel");
  });

  it("trims a separator reached by the cut", () => {
    expect(slugify("Çok Güzel", { maxLength: 4 })).toBe("cok");
  });

  it("works with a custom separator", () => {
    expect(slugify("Çok Güzel", { maxLength: 10, separator: "_" })).toBe(
      "cok_guzel",
    );
    expect(slugify("Çok Güzel Bir Başlık", { maxLength: 8, separator: "_" })).toBe(
      "cok",
    );
  });

  it("returns an empty string for non-positive limits", () => {
    expect(slugify("Hello World", { maxLength: 0 })).toBe("");
    expect(slugify("Hello World", { maxLength: -5 })).toBe("");
  });

  it("removes a trailing separator even when trim is disabled", () => {
    expect(slugify("  Çok Güzel  ", { trim: false, maxLength: 10 })).toBe(
      "-cok-guzel",
    );
  });
});
