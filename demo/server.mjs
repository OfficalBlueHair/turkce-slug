import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const fixturePath = resolve(root, "tests", "fixtures", "turkish-words.ts");
const port = Number(process.env.PORT ?? 4173);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

async function loadWords() {
  const source = await readFile(fixturePath, "utf8");
  const start = source.indexOf("[");
  const end = source.lastIndexOf("]");

  if (start === -1 || end <= start) {
    throw new Error("Kelime korpusu bulunamadı.");
  }

  const json = source.slice(start, end + 1).replace(/,\s*]$/, "]");

  return JSON.parse(json);
}

let words;

try {
  words = await loadWords();
} catch (error) {
  console.error("Demo verisi yüklenemedi:", error);
  process.exit(1);
}

const wordsJson = JSON.stringify(words);

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", "http://localhost");
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === "/") {
      pathname = "/demo/index.html";
    }

    if (pathname === "/words.json") {
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(wordsJson);
      return;
    }

    const filePath = resolve(root, `.${pathname}`);

    if (!filePath.startsWith(`${root}${sep}`)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const data = await readFile(filePath);

    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`turkce-slug demo: http://127.0.0.1:${port}/`);
  console.log(`corpus: ${words.length} words`);
});
