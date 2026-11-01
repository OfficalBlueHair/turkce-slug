import { describe, expect, it } from "vitest";

import {
  capitalizeTr,
  titleCaseTr,
  toLowercaseTr,
  toUppercaseTr,
} from "../src/case";

describe("toLowercaseTr", () => {
  it.each([
    ["İSTANBUL", "istanbul"],
    ["IĞDIR", "ığdır"],
    ["ISIK", "ısık"],
    ["I", "ı"],
    ["İ", "i"],
    ["i", "i"],
    ["ı", "ı"],
    ["ÇĞİÖŞÜ", "çğiöşü"],
    ["I\u0307STANBUL", "istanbul"],
    ["", ""],
  ])("converts %j to %j", (input, expected) => {
    expect(toLowercaseTr(input)).toBe(expected);
  });
});

describe("toUppercaseTr", () => {
  it.each([
    ["istanbul", "İSTANBUL"],
    ["ışık", "IŞIK"],
    ["ırmak", "IRMAK"],
    ["i", "İ"],
    ["ı", "I"],
    ["iı", "İI"],
    ["çğöşü", "ÇĞÖŞÜ"],
    ["", ""],
  ])("converts %j to %j", (input, expected) => {
    expect(toUppercaseTr(input)).toBe(expected);
  });
});

describe("capitalizeTr", () => {
  it.each([
    ["istanbul", "İstanbul"],
    ["ışık", "Işık"],
    ["iĞDIR", "İğdır"],
    ["ığdır", "Iğdır"],
    ["iSTANBUL", "İstanbul"],
    ["😀ABC", "😀abc"],
    ["", ""],
  ])("converts %j to %j", (input, expected) => {
    expect(capitalizeTr(input)).toBe(expected);
  });
});

describe("titleCaseTr", () => {
  it.each([
    ["istanbul güzel şehir", "İstanbul Güzel Şehir"],
    ["ışık ırmak", "Işık Irmak"],
    ["iSTANBUL  güzel", "İstanbul  Güzel"],
    ["  istanbul  ", "  İstanbul  "],
    ["istanbul'da güzel", "İstanbul'da Güzel"],
    ["", ""],
  ])("converts %j to %j", (input, expected) => {
    expect(titleCaseTr(input)).toBe(expected);
  });
});
