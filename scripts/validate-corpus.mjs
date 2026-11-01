import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { slugify, toLowercaseTr, toUppercaseTr } from "../dist/index.js";
import {
  CORPUS_PATH,
  META_PATH,
  REPORT_PATH,
  ROOT,
  ensureReportDir,
  formatNumber,
  letterCoverage,
  missingLetters,
  sha256,
} from "./corpus-utils.mjs";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TURKISH_CHAR_PATTERN = /[çğıöşüâîû]/u;

async function main() {
  let corpus;
  let meta;
  let packageJson;

  try {
    corpus = await readFile(CORPUS_PATH, "utf8");
    meta = JSON.parse(await readFile(META_PATH, "utf8"));
    packageJson = JSON.parse(
      await readFile(resolve(ROOT, "package.json"), "utf8"),
    );
  } catch (error) {
    throw new Error(
      `Korpus okunamadı. Önce "npm run corpus:build" çalıştırın. (${error.message})`,
    );
  }

  const words = corpus.split("\n").filter(Boolean);
  const checks = {
    ascii: { passed: 0, failed: 0 },
    idempotent: { passed: 0, failed: 0 },
    casing: { passed: 0, failed: 0 },
  };
  const failures = [];
  let passed = 0;
  const startedAt = performance.now();

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    let slug = "";
    let error = "";

    try {
      slug = slugify(word);
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    }

    const ascii =
      error === "" &&
      SLUG_PATTERN.test(slug) &&
      !TURKISH_CHAR_PATTERN.test(slug);
    const idempotent =
      error === "" && slugify(slug) === slug;
    const casing =
      toLowercaseTr(toUppercaseTr(word)) === toLowercaseTr(word);

    if (ascii) {
      checks.ascii.passed += 1;
    } else {
      checks.ascii.failed += 1;
    }

    if (idempotent) {
      checks.idempotent.passed += 1;
    } else {
      checks.idempotent.failed += 1;
    }

    if (casing) {
      checks.casing.passed += 1;
    } else {
      checks.casing.failed += 1;
    }

    if (ascii && idempotent && casing) {
      passed += 1;
    } else if (failures.length < 50) {
      failures.push({ word, slug, error, ascii, idempotent, casing });
    }

    if (index > 0 && index % 100_000 === 0) {
      process.stderr.write(
        `  ${formatNumber(index)} / ${formatNumber(words.length)} checked\n`,
      );
    }
  }

  const durationMs = Math.round(performance.now() - startedAt);
  const coverage = letterCoverage(words);
  const missing = missingLetters(coverage);
  const corpusSha = sha256(corpus);
  const failed = words.length - passed;

  const report = {
    generatedAt: new Date().toISOString(),
    library: {
      name: packageJson.name,
      version: packageJson.version,
    },
    corpus: {
      path: ".cache/corpus.txt",
      total: words.length,
      target: meta.target,
      sha256: corpusSha,
      metaSha256: meta.sha256,
      shaMatchesMeta: corpusSha === meta.sha256,
      sourceStats: meta.sources,
      sourceTotal: meta.sourceTotal,
      letterCoverage: coverage,
      missingLetters: missing,
    },
    checks,
    passed,
    failed,
    failures,
    durationMs,
  };

  await ensureReportDir();
  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("");
  console.log(`corpus: ${formatNumber(words.length)} words`);
  console.log(
    `passed: ${formatNumber(passed)}, failed: ${formatNumber(failed)}`,
  );
  console.log(
    `ascii: ${formatNumber(checks.ascii.passed)} / ${formatNumber(words.length)}`,
  );
  console.log(
    `idempotent: ${formatNumber(checks.idempotent.passed)} / ${formatNumber(words.length)}`,
  );
  console.log(
    `casing: ${formatNumber(checks.casing.passed)} / ${formatNumber(words.length)}`,
  );
  console.log(
    `letters: ${missing.length === 0 ? "all covered" : `missing ${missing.join(", ")}`}`,
  );
  console.log(`duration: ${formatNumber(durationMs)} ms`);
  console.log(`report: reports/corpus-report.json`);

  if (failed > 0 || missing.length > 0 || !report.corpus.shaMatchesMeta) {
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  console.error("");
  console.error("Korpus doğrulanamadı:", error);
  process.exitCode = 1;
}
