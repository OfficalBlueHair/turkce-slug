import { createHash } from "node:crypto";
import { access, mkdir, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
export const CACHE_DIR = resolve(ROOT, ".cache");
export const CORPUS_PATH = resolve(CACHE_DIR, "corpus.txt");
export const META_PATH = resolve(CACHE_DIR, "corpus-meta.json");
export const REPORT_DIR = resolve(ROOT, "reports");
export const REPORT_PATH = resolve(REPORT_DIR, "corpus-report.json");

export const TARGET = 616_760;
export const TURKISH_LETTERS = "çğıöşüâîû";

export const SOURCES = {
  frequency: {
    name: "FrequencyWords",
    url: "https://raw.githubusercontent.com/hermitdave/FrequencyWords/525f9b560de45753a5ea01069454e72e9aa541c6/content/2018/tr/tr_50k.txt",
    cacheFile: "tr_50k.txt",
    license: "MIT",
    copyright: "Copyright (c) 2016 Hermit Dave",
  },
  wordlist: {
    name: "Turkish Wordlist",
    url: "https://raw.githubusercontent.com/csariyildiz/turkish-wordlist/042c406ebc1536ecbc6eb8c17fb22c0fe3a6507f/tr_wordlist.zip",
    cacheFile: "tr_wordlist.zip",
    entry: "tr_wordlist.csv",
    license: "MIT",
    copyright: "Copyright (c) 2024 Çağrı Sarıyıldız",
  },
};

/**
 * Lowercase Turkish words with an optional internal apostrophe.
 * Source files are already lowercase; uppercase words are intentionally
 * excluded from the full corpus because they would duplicate the casing tests.
 */
export const WORD_PATTERN = /^[a-zçğıöşüâîû]+(?:['’][a-zçğıöşüâîû]+)?$/u;

export const CURATED_WORDS = [
  "kâğıt",
  "îcat",
  "ûfuk",
  "ığdır",
  "istanbul",
  "ışık",
  "çiçek",
  "öğretmen",
  "şüphe",
  "istanbul'da",
  "ığdır'ın",
  "türkiye'nin",
  "izmir'den",
  "ankara'ya",
  "ağaç",
  "değil",
  "göz",
  "güzel",
  "söylemek",
  "yapılmış",
];

const NUMBER_FORMAT = new Intl.NumberFormat("tr-TR");

export function formatNumber(value) {
  return NUMBER_FORMAT.format(value);
}

export function normalizeWord(raw) {
  const word = raw.trim().normalize("NFC");

  if (word.length < 2 || word.length > 30) {
    return null;
  }

  return WORD_PATTERN.test(word) ? word : null;
}

export function parseFrequencyList(text) {
  const words = [];

  for (const line of text.split(/\r?\n/)) {
    const match = line.trim().match(/^(\S+)\s+\d+$/);

    if (!match) {
      continue;
    }

    const word = normalizeWord(match[1]);

    if (word !== null) {
      words.push(word);
    }
  }

  return words;
}

/**
 * Yields valid words without allocating a second array for 2.5M lines.
 */
export function* iterateCsvWords(text) {
  let start = 0;

  while (start < text.length) {
    let end = text.indexOf("\n", start);

    if (end === -1) {
      end = text.length;
    }

    const line = text.slice(start, end);
    const comma = line.lastIndexOf(",");

    if (comma > 0) {
      const word = normalizeWord(line.slice(0, comma));

      if (word !== null) {
        yield word;
      }
    }

    start = end + 1;
  }
}

export function letterCoverage(words) {
  const coverage = Object.fromEntries(
    [...TURKISH_LETTERS].map((letter) => [letter, 0]),
  );

  for (const word of words) {
    for (const character of word) {
      if (character in coverage) {
        coverage[character] += 1;
      }
    }
  }

  return coverage;
}

export function missingLetters(coverage) {
  return [...TURKISH_LETTERS].filter((letter) => coverage[letter] === 0);
}

export function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export async function ensureCacheDir() {
  await mkdir(CACHE_DIR, { recursive: true });
}

export async function ensureReportDir() {
  await mkdir(REPORT_DIR, { recursive: true });
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function download(url, destination, force = false) {
  if (!force && (await exists(destination))) {
    console.log(`cache hit: ${basename(destination)}`);
    return;
  }

  console.log(`download: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `İndirme başarısız: ${response.status} ${response.statusText} (${url})`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, buffer);
  console.log(`saved: ${basename(destination)} (${formatNumber(buffer.length)} bytes)`);
}
