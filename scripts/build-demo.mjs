import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { ROOT } from "./corpus-utils.mjs";

const SITE_DIR = resolve(ROOT, "site");

async function main() {
  await mkdir(resolve(SITE_DIR, "dist"), { recursive: true });

  const html = (await readFile(resolve(ROOT, "demo/index.html"), "utf8"))
    .replaceAll("/demo/styles.css", "./styles.css")
    .replaceAll("/demo/app.js", "./app.js");
  await writeFile(resolve(SITE_DIR, "index.html"), html);

  const app = (await readFile(resolve(ROOT, "demo/app.js"), "utf8"))
    .replaceAll("../dist/index.js", "./dist/index.js")
    .replaceAll('fetch("/words.json"', 'fetch("./words.json"');
  await writeFile(resolve(SITE_DIR, "app.js"), app);

  await cp(resolve(ROOT, "demo/styles.css"), resolve(SITE_DIR, "styles.css"));
  await cp(resolve(ROOT, "dist/index.js"), resolve(SITE_DIR, "dist/index.js"));
  await cp(
    resolve(ROOT, "dist/index.js.map"),
    resolve(SITE_DIR, "dist/index.js.map"),
  );

  const fixture = await readFile(
    resolve(ROOT, "tests/fixtures/turkish-words.ts"),
    "utf8",
  );
  const start = fixture.indexOf("[");
  const end = fixture.lastIndexOf("]");

  if (start === -1 || end <= start) {
    throw new Error("Türkçe kelime fixture'ı bulunamadı.");
  }

  const words = JSON.parse(
    fixture.slice(start, end + 1).replace(/,\s*]$/, "]"),
  );

  await writeFile(
    resolve(SITE_DIR, "words.json"),
    `${JSON.stringify(words)}\n`,
    "utf8",
  );
  await writeFile(resolve(SITE_DIR, ".nojekyll"), "");

  console.log(
    `static demo: site/ (${words.length.toLocaleString("tr-TR")} words)`,
  );
}

try {
  await main();
} catch (error) {
  console.error("Statik demo oluşturulamadı:", error);
  process.exitCode = 1;
}
