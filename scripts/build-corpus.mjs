import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { unzipSync } from "fflate";

import {
  CACHE_DIR,
  CORPUS_PATH,
  CURATED_WORDS,
  META_PATH,
  SOURCES,
  TARGET,
  download,
  ensureCacheDir,
  formatNumber,
  iterateCsvWords,
  letterCoverage,
  missingLetters,
  normalizeWord,
  parseFrequencyList,
  sha256,
} from "./corpus-utils.mjs";

const force = process.argv.includes("--force");
const targetArgument = process.argv.find((argument) =>
  argument.startsWith("--target="),
);
const target = targetArgument
  ? Number(targetArgument.slice("--target=".length))
  : TARGET;

if (!Number.isInteger(target) || target <= 0) {
  throw new Error("--target pozitif bir tam sayı olmalı.");
}

async function main() {
  await ensureCacheDir();

  const frequencyPath = resolve(CACHE_DIR, SOURCES.frequency.cacheFile);
  const wordlistPath = resolve(CACHE_DIR, SOURCES.wordlist.cacheFile);

  await download(SOURCES.frequency.url, frequencyPath, force);
  await download(SOURCES.wordlist.url, wordlistPath, force);

  const frequencyWords = parseFrequencyList(
    await readFile(frequencyPath, "utf8"),
  );
  const frequencyUnique = new Set(frequencyWords);

  const zipEntries = unzipSync(new Uint8Array(await readFile(wordlistPath)));
  const csvEntry =
    zipEntries[SOURCES.wordlist.entry] ??
    Object.entries(zipEntries).find(([name]) => name.endsWith(".csv"))?.[1];

  if (!csvEntry) {
    throw new Error("Wordlist zip içinde CSV dosyası bulunamadı.");
  }

  const csvText = new TextDecoder("utf-8").decode(csvEntry);
  const selected = new Set();

  let curatedAdded = 0;
  let frequencyAdded = 0;
  let wordlistAdded = 0;
  let wordlistValidLines = 0;

  for (const rawWord of CURATED_WORDS) {
    const word = normalizeWord(rawWord);

    if (word !== null && !selected.has(word)) {
      selected.add(word);
      curatedAdded += 1;
    }
  }

  for (const word of frequencyUnique) {
    if (selected.size >= target) {
      break;
    }

    if (!selected.has(word)) {
      selected.add(word);
      frequencyAdded += 1;
    }
  }

  for (const word of iterateCsvWords(csvText)) {
    wordlistValidLines += 1;

    if (selected.size < target && !selected.has(word)) {
      selected.add(word);
      wordlistAdded += 1;
    }
  }

  if (selected.size < target) {
    throw new Error(
      `Yeterli kelime yok: ${formatNumber(selected.size)} / ${formatNumber(target)}`,
    );
  }

  const words = [...selected].slice(0, target);
  const corpus = `${words.join("\n")}\n`;
  const coverage = letterCoverage(words);
  const missing = missingLetters(coverage);

  await writeFile(CORPUS_PATH, corpus, "utf8");

  const meta = {
    target,
    total: words.length,
    generatedAt: new Date().toISOString(),
    corpusPath: ".cache/corpus.txt",
    sha256: sha256(corpus),
    sources: {
      frequency: {
        name: SOURCES.frequency.name,
        url: SOURCES.frequency.url,
        license: SOURCES.frequency.license,
        copyright: SOURCES.frequency.copyright,
        valid: frequencyWords.length,
        unique: frequencyUnique.size,
        used: frequencyAdded,
      },
      wordlist: {
        name: SOURCES.wordlist.name,
        url: SOURCES.wordlist.url,
        license: SOURCES.wordlist.license,
        copyright: SOURCES.wordlist.copyright,
        validLines: wordlistValidLines,
        used: wordlistAdded,
      },
      curated: {
        declared: CURATED_WORDS.length,
        used: curatedAdded,
      },
    },
    sourceTotal: curatedAdded + frequencyAdded + wordlistAdded,
    letterCoverage: coverage,
    missingLetters: missing,
  };

  await writeFile(META_PATH, `${JSON.stringify(meta, null, 2)}\n`, "utf8");

  console.log("");
  console.log(`target: ${formatNumber(target)}`);
  console.log(
    `frequency: ${formatNumber(frequencyWords.length)} valid, ${formatNumber(frequencyUnique.size)} unique, ${formatNumber(frequencyAdded)} used`,
  );
  console.log(
    `wordlist: ${formatNumber(wordlistValidLines)} valid lines, ${formatNumber(wordlistAdded)} used`,
  );
  console.log(
    `corpus: ${formatNumber(words.length)} words, ${formatNumber(corpus.length)} chars`,
  );
  console.log(`sha256: ${meta.sha256}`);
  console.log(
    `letters: ${missing.length === 0 ? "all covered" : `missing ${missing.join(", ")}`}`,
  );
  console.log(`meta: .cache/corpus-meta.json`);

  if (missing.length > 0) {
    process.exitCode = 1;
    throw new Error(`Eksik Türkçe harfler: ${missing.join(", ")}`);
  }
}

try {
  await main();
} catch (error) {
  console.error("");
  console.error("Korpus oluşturulamadı:", error);
  process.exitCode = 1;
}
