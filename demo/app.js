const $ = (id) => {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Demo element bulunamadı: #${id}`);
  }

  return element;
};

function showFatal(error) {
  const main = document.querySelector("main");

  if (!main) {
    return;
  }

  const banner = document.createElement("div");
  banner.className = "fatal";
  banner.textContent =
    'Paket yüklenemedi. Önce "npm run build" çalıştırın, sonra sayfayı yenileyin.';

  const detail = document.createElement("div");
  detail.style.marginTop = "6px";
  detail.style.fontSize = "0.78rem";
  detail.textContent = String(error);

  banner.append(detail);
  main.prepend(banner);
}

let lib;

try {
  lib = await import("../dist/index.js");
} catch (error) {
  showFatal(error);
  throw error;
}

const {
  capitalizeTr,
  removePunctuation,
  slugify,
  titleCaseTr,
  toLowercaseTr,
  toUppercaseTr,
} = lib;

const els = {
  input: $("input"),
  separator: $("separator"),
  maxLength: $("max-length"),
  lowercase: $("lowercase"),
  trim: $("trim"),
  preserveNumbers: $("preserve-numbers"),
  randomWord: $("random-word"),
  slugOutput: $("slug-output"),
  slugError: $("slug-error"),
  copy: $("copy"),
  caseLower: $("case-lower"),
  caseUpper: $("case-upper"),
  caseCapitalize: $("case-capitalize"),
  caseTitle: $("case-title-output"),
  casePunctuation: $("case-punctuation"),
  corpusStatus: $("corpus-status"),
  corpusProgress: $("corpus-progress"),
  statTotal: $("stat-total"),
  statPassed: $("stat-passed"),
  statFailed: $("stat-failed"),
  corpusChecks: $("corpus-checks"),
  corpusFailures: $("corpus-failures"),
  sampleBody: $("sample-body"),
  runCorpus: $("run-corpus"),
  phraseBody: $("phrase-body"),
  phraseStatus: $("phrase-status"),
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TURKISH_CHAR_PATTERN = /[çğıöşüâîû]/;
const NUMBER_FORMAT = new Intl.NumberFormat("tr-TR");
const CHUNK_SIZE = 256;

const PHRASES = [
  ["İSTANBUL", "istanbul"],
  ["IĞDIR", "igdir"],
  ["İstanbul'da Iğdır", "istanbulda-igdir"],
  ["Çok Güzel Bir Başlık!", "cok-guzel-bir-baslik"],
  ["ŞÜKRÜ ÇAĞLAR", "sukru-caglar"],
  ["Mesafe: 100 Km / Gün", "mesafe-100-km-gun"],
  ["Ağrı Dağı 5137m", "agri-dagi-5137m"],
  ["😍😍😍", ""],
];

const state = {
  words: [],
  running: false,
};

const formatNumber = (value) => NUMBER_FORMAT.format(value);
const nextFrame = () =>
  new Promise((resolve) => window.requestAnimationFrame(() => resolve()));

function readOptions() {
  const options = {
    separator: els.separator.value,
    lowercase: els.lowercase.checked,
    trim: els.trim.checked,
    preserveNumbers: els.preserveNumbers.checked,
  };

  const rawMaxLength = els.maxLength.value.trim();

  if (rawMaxLength !== "") {
    const maxLength = Number(rawMaxLength);

    if (Number.isFinite(maxLength)) {
      options.maxLength = maxLength;
    }
  }

  return options;
}

function render() {
  const text = els.input.value;
  let slug = "";
  let error = "";

  try {
    slug = slugify(text, readOptions());
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  }

  els.slugOutput.textContent = error ? "—" : slug || "(boş)";
  els.slugOutput.classList.toggle("is-empty", error === "" && slug.length === 0);
  els.slugError.hidden = error === "";
  els.slugError.textContent = error;
  els.copy.disabled = error !== "" || slug.length === 0;

  els.caseLower.textContent = toLowercaseTr(text) || "(boş)";
  els.caseUpper.textContent = toUppercaseTr(text) || "(boş)";
  els.caseCapitalize.textContent = capitalizeTr(text) || "(boş)";
  els.caseTitle.textContent = titleCaseTr(text) || "(boş)";
  els.casePunctuation.textContent = removePunctuation(text) || "(boş)";
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();

    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  }
}

function setCorpusStatus(message, kind) {
  els.corpusStatus.textContent = message;
  els.corpusStatus.className = `status status-${kind}`;
}

function updateStats(total, passed, failed) {
  els.statTotal.textContent = formatNumber(total);
  els.statPassed.textContent = formatNumber(passed);
  els.statFailed.textContent = formatNumber(failed);
}

function renderChecks(total, asciiPassed, idempotentPassed, casingPassed) {
  const checks = [
    ["ASCII çıktı", asciiPassed],
    ["Idempotent slug", idempotentPassed],
    ["Türkçe case round-trip", casingPassed],
  ];

  const items = checks.map(([label, count]) => {
    const item = document.createElement("div");
    item.className = `check ${count === total ? "ok" : "bad"}`;

    const icon = document.createElement("span");
    icon.className = "check-icon";
    icon.textContent = count === total ? "✓" : "✕";

    const name = document.createElement("span");
    name.textContent = label;

    const value = document.createElement("b");
    value.textContent = `${formatNumber(count)} / ${formatNumber(total)}`;

    item.append(icon, name, value);
    return item;
  });

  els.corpusChecks.replaceChildren(...items);
}

function renderSample(words) {
  const rows = words.map((word) => {
    const row = document.createElement("tr");
    const wordCell = document.createElement("td");
    wordCell.textContent = word;

    const slugCell = document.createElement("td");
    const code = document.createElement("code");
    code.textContent = slugify(word) || "(boş)";
    slugCell.append(code);

    row.append(wordCell, slugCell);
    return row;
  });

  els.sampleBody.replaceChildren(...rows);
}

function renderFailures(failures) {
  if (failures.length === 0) {
    els.corpusFailures.hidden = true;
    els.corpusFailures.replaceChildren();
    return;
  }

  const title = document.createElement("h3");
  title.textContent = `İlk ${Math.min(failures.length, 12)} sorun`;

  const list = document.createElement("ul");

  for (const failure of failures.slice(0, 12)) {
    const item = document.createElement("li");
    const code = document.createElement("code");
    code.textContent = failure.word;

    const failedChecks = [
      failure.ascii ? "" : "ASCII",
      failure.idempotent ? "" : "idempotent",
      failure.casing ? "" : "case",
    ].filter(Boolean);

    const detail = document.createElement("span");
    detail.textContent = `${failure.slug || "(boş)"} · ${failedChecks.join(", ")}`;

    item.append(code, detail);
    list.append(item);
  }

  els.corpusFailures.replaceChildren(title, list);
  els.corpusFailures.hidden = false;
}

async function runCorpus() {
  if (state.running) {
    return;
  }

  state.running = true;
  els.runCorpus.disabled = true;
  els.corpusProgress.style.width = "0%";
  els.corpusProgress.className = "";
  els.corpusFailures.hidden = true;
  els.corpusFailures.replaceChildren();
  els.corpusChecks.replaceChildren();
  setCorpusStatus("Kelime listesi hazırlanıyor…", "running");

  try {
    const words = state.words.length > 0 ? state.words : await loadWords();
    let passed = 0;
    let asciiPassed = 0;
    let idempotentPassed = 0;
    let casingPassed = 0;
    const failures = [];

    for (let start = 0; start < words.length; start += CHUNK_SIZE) {
      const end = Math.min(start + CHUNK_SIZE, words.length);

      for (let index = start; index < end; index += 1) {
        const word = words[index];
        const slug = slugify(word);
        const ascii = SLUG_PATTERN.test(slug) && !TURKISH_CHAR_PATTERN.test(slug);
        const idempotent = slugify(slug) === slug;
        const casing = toLowercaseTr(toUppercaseTr(word)) === toLowercaseTr(word);

        if (ascii) {
          asciiPassed += 1;
        }

        if (idempotent) {
          idempotentPassed += 1;
        }

        if (casing) {
          casingPassed += 1;
        }

        if (ascii && idempotent && casing) {
          passed += 1;
        } else {
          failures.push({ word, slug, ascii, idempotent, casing });
        }
      }

      els.corpusProgress.style.width = `${(end / words.length) * 100}%`;
      updateStats(words.length, passed, failures.length);
      setCorpusStatus(
        `${formatNumber(end)} / ${formatNumber(words.length)} kelime test edildi…`,
        "running",
      );

      await nextFrame();
    }

    renderChecks(words.length, asciiPassed, idempotentPassed, casingPassed);
    renderSample(words.slice(0, 8));
    renderFailures(failures);
    els.corpusProgress.classList.add(failures.length === 0 ? "is-pass" : "is-fail");

    setCorpusStatus(
      failures.length === 0
        ? `${formatNumber(words.length)} kelimenin tamamı geçti. Bozuk çıktı yok.`
        : `${formatNumber(failures.length)} kelimede sorun bulundu.`,
      failures.length === 0 ? "pass" : "fail",
    );
  } catch (error) {
    setCorpusStatus(
      `Test çalıştırılamadı: ${error instanceof Error ? error.message : String(error)}`,
      "fail",
    );
  } finally {
    state.running = false;
    els.runCorpus.disabled = false;
  }
}

async function loadWords() {
  const response = await fetch("/words.json", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Kelime listesi alınamadı (${response.status}).`);
  }

  const words = await response.json();

  if (!Array.isArray(words) || words.length === 0) {
    throw new Error("Kelime listesi boş.");
  }

  state.words = words;
  els.randomWord.disabled = false;
  return words;
}

function renderPhrases() {
  const results = PHRASES.map(([input, expected]) => {
    const actual = slugify(input);
    return { input, expected, actual, ok: actual === expected };
  });

  const rows = results.map(({ input, expected, actual, ok }) => {
    const row = document.createElement("tr");

    const inputCell = document.createElement("td");
    inputCell.textContent = input || "(boş)";

    const expectedCell = document.createElement("td");
    const expectedCode = document.createElement("code");
    expectedCode.textContent = expected || "(boş)";
    expectedCell.append(expectedCode);

    const actualCell = document.createElement("td");
    const actualCode = document.createElement("code");
    actualCode.textContent = actual || "(boş)";

    if (!ok) {
      actualCode.classList.add("bad-code");
    }

    actualCell.append(actualCode);

    const statusCell = document.createElement("td");
    statusCell.className = ok ? "ok" : "bad";
    statusCell.textContent = ok ? "✓" : "✕";

    row.append(inputCell, expectedCell, actualCell, statusCell);
    return row;
  });

  els.phraseBody.replaceChildren(...rows);

  const failures = results.filter((result) => !result.ok).length;
  els.phraseStatus.textContent =
    failures === 0
      ? `${PHRASES.length} / ${PHRASES.length} örnek geçti`
      : `${failures} örnek başarısız`;
  els.phraseStatus.className = `status status-${failures === 0 ? "pass" : "fail"}`;
}

els.input.addEventListener("input", render);
els.separator.addEventListener("input", render);
els.maxLength.addEventListener("input", render);
els.lowercase.addEventListener("change", render);
els.trim.addEventListener("change", render);
els.preserveNumbers.addEventListener("change", render);

for (const chip of document.querySelectorAll(".chip")) {
  chip.addEventListener("click", () => {
    els.input.value = chip.dataset.example ?? "";
    render();
    els.input.focus();
  });
}

els.randomWord.addEventListener("click", () => {
  if (state.words.length === 0) {
    return;
  }

  const word = state.words[Math.floor(Math.random() * state.words.length)];
  els.input.value = word;
  render();
  els.input.focus();
});

els.copy.addEventListener("click", async () => {
  const text = els.slugOutput.textContent ?? "";

  if (text === "" || text === "(boş)" || text === "—") {
    return;
  }

  if (!(await copyText(text))) {
    return;
  }

  els.copy.textContent = "Kopyalandı ✓";
  els.copy.classList.add("is-copied");

  window.setTimeout(() => {
    els.copy.textContent = "Kopyala";
    els.copy.classList.remove("is-copied");
  }, 1200);
});

els.runCorpus.addEventListener("click", () => {
  void runCorpus();
});

render();
renderPhrases();

try {
  await loadWords();
  await runCorpus();
} catch (error) {
  setCorpusStatus(
    `Kelime listesi yüklenemedi: ${error instanceof Error ? error.message : String(error)}. "npm run demo" ile sunucuyu başlatın.`,
    "fail",
  );
}
