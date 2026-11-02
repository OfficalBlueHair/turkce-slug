# turkce-slug

Türkçe metinler için doğru slug üretimi ve Türkçe büyük/küçük harf dönüşümleri.
Sıfır runtime bağımlılığı · ESM + CommonJS · TypeScript tipleri dahil.

Turkish-aware slug generation and Turkish casing utilities.
Zero runtime dependencies · ESM + CommonJS · TypeScript types included.

[![npm version](https://img.shields.io/npm/v/turkce-slug.svg)](https://www.npmjs.com/package/turkce-slug)
[![license](https://img.shields.io/npm/l/turkce-slug.svg)](LICENSE)
[![demo](https://img.shields.io/badge/demo-live-d7202b)](https://officalbluehair.github.io/turkce-slug/)

**npm:** https://www.npmjs.com/package/turkce-slug/v/0.1.0 ·
**Canlı demo:** https://officalbluehair.github.io/turkce-slug/ ·
**GitHub:** https://github.com/OfficalBlueHair/turkce-slug ·
**Dev.to:** https://dev.to/officalbluehair/turkce-slug-uretirken-iiii-sorununu-cozmek-7la

- [Türkçe](#türkçe)
- [English](#english)

---

## Türkçe

### Nedir?

`turkce-slug`, Türkçe metinleri URL dostu ASCII slug'lara çevirir ve Türkçe
büyük/küçük harf kurallarına uygun dönüşümler yapar. Tek bir çalışma zamanı
bağımlılığı yoktur; Node.js ve modern tarayıcılarda çalışır.

### Neden gerekli?

JavaScript'in varsayılan `toLowerCase()` ve `toUpperCase()` davranışı Türkçe
için doğru değildir:

```js
"İSTANBUL".toLowerCase(); // "i̇stanbul" (i + birleşik nokta)
"IĞDIR".toLowerCase();    // "iğdir"  (Türkçede "ığdır" olmalı)
"istanbul".toUpperCase(); // "ISTANBUL" (Türkçede "İSTANBUL" olmalı)
```

Aynı sorun "I", "ı", "İ" ve "i" harflerini işleyen birçok slug
kütüphanesinde de görülür. `turkce-slug` bu dört harfi açık kurallarla
işler ve slug üretiminde sonucu ortamın locale ayarına bırakmaz.

### Kurulum

```bash
npm install turkce-slug
```

### Kullanım

ESM:

```ts
import {
  slugify,
  toLowercaseTr,
  toUppercaseTr,
  capitalizeTr,
  titleCaseTr,
  removePunctuation,
} from "turkce-slug";

slugify("İSTANBUL");                 // "istanbul"
slugify("IĞDIR");                    // "igdir"
slugify("İstanbul'da Iğdır");        // "istanbulda-igdir"
slugify("Çok Güzel Bir Başlık!");    // "cok-guzel-bir-baslik"
slugify("ŞÜKRÜ ÇAĞLAR");             // "sukru-caglar"
slugify("Fiyat: 100 TL / Ay");       // "fiyat-100-tl-ay"

toLowercaseTr("IĞDIR");              // "ığdır"
toUppercaseTr("ışık");               // "IŞIK"
capitalizeTr("iĞDIR");               // "İğdır"
titleCaseTr("istanbul güzel şehir"); // "İstanbul Güzel Şehir"
removePunctuation("Merhaba, dünya!"); // "Merhaba dünya"
```

CommonJS:

```js
const { slugify, toLowercaseTr } = require("turkce-slug");

slugify("Çok Güzel");  // "cok-guzel"
toLowercaseTr("ISIK"); // "ısık"
```

Seçenekler:

```ts
slugify("Çok Güzel", { separator: "_" });          // "cok_guzel"
slugify("Çok Güzel", { lowercase: false });        // "Cok-Guzel"
slugify("Çok güzel bir başlık örneği", {
  maxLength: 10,
});                                                // "cok-guzel"
slugify("Fiyat: 100 TL", { preserveNumbers: false }); // "fiyat-tl"
```

### Demo

**Canlı:** https://officalbluehair.github.io/turkce-slug/

Yerel:

```bash
npm run demo
# http://127.0.0.1:4173
```

Tarayıcıda canlı `slugify`, Türkçe case dönüşümleri ve 4.205 kelimelik
otomatik doğrulama testi. Demo, paketi önce build eder.

### API

| Fonksiyon | Açıklama | Dönüş |
| --- | --- | --- |
| `slugify(text, options?)` | Metni Türkçe farkındalığıyla ASCII slug'a çevirir. | `string` |
| `toLowercaseTr(text)` | Türkçe kurallarına göre küçük harfe çevirir. | `string` |
| `toUppercaseTr(text)` | Türkçe kurallarına göre büyük harfe çevirir. | `string` |
| `capitalizeTr(text)` | İlk karakteri büyütür, kalanını küçültür. | `string` |
| `titleCaseTr(text)` | Her kelimenin ilk harfini büyütür. | `string` |
| `removePunctuation(text)` | Noktalama ve sembolleri temizler, boşlukları normalize eder. | `string` |

`slugify` girdi `string` değilse `TypeError` fırlatır. `separator` boş string
olamaz. Boş string, yalnızca noktalama veya yalnızca emoji içeren girdiler
için `""` döner.

### Türkçe karakter dönüşümü

Varsayılan `lowercase: true` ile slug çıktısındaki karşılıklar:

| Türkçe | ASCII |
| --- | --- |
| `ç`, `Ç` | `c` |
| `ğ`, `Ğ` | `g` |
| `ı`, `I` | `i` |
| `İ`, `i` | `i` |
| `ö`, `Ö` | `o` |
| `ş`, `Ş` | `s` |
| `ü`, `Ü` | `u` |
| `â`, `Â` | `a` |
| `î`, `Î` | `i` |
| `û`, `Û` | `u` |

`lowercase: false` kullanıldığında kaynak harfin büyüklüğü korunur:
`Ç → C`, `Ğ → G`, `İ → I`, `I → I`, `Ö → O`, `Ş → S`, `Ü → U`.
Dotless `ı` için ASCII'de büyük harf karşılığı olmadığından `ı → i` olur.

ASCII dışındaki desteklenmeyen harfler ve emoji slug'a girmez; kelime
sınırı olarak işlenir. Örneğin `"Hello 😍 World"` → `"hello-world"`.

### `slugify` seçenekleri

| Seçenek | Tip | Varsayılan | Açıklama |
| --- | --- | --- | --- |
| `separator` | `string` | `"-"` | Kelimeler arasına konur. Boş string olamaz. |
| `lowercase` | `boolean` | `true` | ASCII'ye çevrilen metni küçültür. |
| `trim` | `boolean` | `true` | Baş ve sondaki separator'ları temizler. |
| `maxLength` | `number` | yok | Maksimum slug uzunluğu. |
| `preserveNumbers` | `boolean` | `true` | Sayıları korur; `false` ise rakamları kaldırır. |

`maxLength` mümkünse kelime sınırından keser ve sonucu separator ile
bitirmez. İlk kelime sınırı aşıyorsa zorunlu sert kesim yapılır.
`trim: false` baş/sondaki separator'ları korur; ancak `maxLength`
uygulandığında sondaki separator yine temizlenir.

### Test ve build

```bash
npm test          # Vitest, tek seferlik
npm run test:watch
npm run typecheck # tsc --noEmit
npm run build     # ESM + CJS + .d.ts / .d.cts
npm run dev       # tsup --watch
```

`prepublishOnly`, yayından önce typecheck, test ve build çalıştırır.

Testler, `tests/fixtures/turkish-words.ts` içindeki 4.205 kelimelik bir
Türkçe korpusunu da kapsar. Korpus, MIT lisanslı FrequencyWords verisinden
türetilmiştir; kaynak ve lisans bilgisi `tests/fixtures/README.md` içindedir.
Slug üretimi harf tabanlıdır ve çalışma zamanında sözlük gerektirmez.

#### Tam korpus doğrulama (616.760 kelime)

Normal testler hızlı kalsın diye 4.205 kelimelik fixture kullanılır. Tam korpus
otonom scriptlerle indirilir, birleştirilir ve doğrulanır:

```bash
npm run corpus           # indir + oluştur + doğrula
npm run corpus:build     # sadece indir/oluştur
npm run corpus:validate  # mevcut korpusu doğrula
```

İki MIT kaynağı (FrequencyWords + Wikipedia tabanlı Turkish Wordlist) kullanılır.
616.760 benzersiz kelime `slugify`, idempotency ve Türkçe case kontrollerinden
geçirilir. Sonuç `reports/corpus-report.json`; doğrulanan tam liste
`data/turkish-words-616760.txt` olarak repoda tutulur. Ham indirmeler `.cache/`
altında kalır. Veri dosyası npm paketine girmez. Kaynak ve lisanslar:
`scripts/corpus-sources.md`.

### Katkı

1. Depoyu fork'layın ve bir dal oluşturun.
2. Davranış değişikliği için test ekleyin.
3. `npm run typecheck && npm test && npm run build` komutlarını çalıştırın.
4. Değişikliği açıklayan bir pull request açın.

Küçük, odaklı değişiklikler ve yeni testler memnuniyetle karşılanır.

### Lisans

[MIT](./LICENSE) © 2026 Officalbluehair

---

## English

### What is it?

`turkce-slug` turns Turkish text into URL-friendly ASCII slugs and applies
correct Turkish casing rules. It has no runtime dependencies and works in
Node.js and modern browsers.

### Why?

JavaScript's default casing is wrong for Turkish:

```js
"İSTANBUL".toLowerCase(); // "i̇stanbul" (i + combining dot)
"IĞDIR".toLowerCase();    // "iğdir"  (should be "ığdır")
"istanbul".toUpperCase(); // "ISTANBUL" (should be "İSTANBUL")
```

Many slug libraries inherit the same problem. `turkce-slug` handles `I`,
`ı`, `İ`, and `i` explicitly instead of relying on the host locale.

### Install

```bash
npm install turkce-slug
```

### Usage

```ts
import {
  slugify,
  toLowercaseTr,
  toUppercaseTr,
  capitalizeTr,
  titleCaseTr,
  removePunctuation,
} from "turkce-slug";

slugify("İSTANBUL");                 // "istanbul"
slugify("IĞDIR");                    // "igdir"
slugify("İstanbul'da Iğdır");        // "istanbulda-igdir"
slugify("Çok Güzel Bir Başlık!");    // "cok-guzel-bir-baslik"
slugify("ŞÜKRÜ ÇAĞLAR");             // "sukru-caglar"

toLowercaseTr("IĞDIR");              // "ığdır"
toUppercaseTr("ışık");               // "IŞIK"
capitalizeTr("iĞDIR");               // "İğdır"
titleCaseTr("istanbul güzel şehir"); // "İstanbul Güzel Şehir"
removePunctuation("Merhaba, dünya!"); // "Merhaba dünya"
```

CommonJS:

```js
const { slugify } = require("turkce-slug");

slugify("Çok Güzel"); // "cok-guzel"
```

### Demo

**Live:** https://officalbluehair.github.io/turkce-slug/

Local:

```bash
npm run demo
# http://127.0.0.1:4173
```

An interactive browser demo with live `slugify`, Turkish casing examples, and
a 4,205-word validation run. The demo builds the package first.

### API

| Function | Description | Returns |
| --- | --- | --- |
| `slugify(text, options?)` | Creates a Turkish-aware ASCII slug. | `string` |
| `toLowercaseTr(text)` | Turkish-aware lowercase. | `string` |
| `toUppercaseTr(text)` | Turkish-aware uppercase. | `string` |
| `capitalizeTr(text)` | Uppercases the first character, lowercases the rest. | `string` |
| `titleCaseTr(text)` | Capitalizes every word. | `string` |
| `removePunctuation(text)` | Removes punctuation and normalizes whitespace. | `string` |

`slugify` throws a `TypeError` for non-string input. `separator` must be a
non-empty string. Empty input, punctuation-only input, and emoji-only input
return `""`.

### Character map

With the default `lowercase: true`:

| Turkish | ASCII |
| --- | --- |
| `ç`, `Ç` | `c` |
| `ğ`, `Ğ` | `g` |
| `ı`, `I` | `i` |
| `İ`, `i` | `i` |
| `ö`, `Ö` | `o` |
| `ş`, `Ş` | `s` |
| `ü`, `Ü` | `u` |
| `â`, `Â` | `a` |
| `î`, `Î` | `i` |
| `û`, `Û` | `u` |

With `lowercase: false`, source case is preserved: `Ç → C`, `Ğ → G`,
`İ → I`, `I → I`, `Ö → O`, `Ş → S`, `Ü → U`. Since ASCII has no uppercase
dotless `ı`, `ı → i`. Unsupported non-ASCII letters and emoji are treated
as word boundaries and omitted from the slug.

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `separator` | `string` | `"-"` | Inserted between words. Must not be empty. |
| `lowercase` | `boolean` | `true` | Lowercases the transliterated text. |
| `trim` | `boolean` | `true` | Removes leading and trailing separators. |
| `maxLength` | `number` | none | Maximum slug length. |
| `preserveNumbers` | `boolean` | `true` | Keeps digits; when `false`, digits are removed. |

`maxLength` prefers a word boundary and never leaves a trailing separator.
If the first word is longer than the limit, a hard cut is used. With
`trim: false`, boundary separators are preserved; a `maxLength` cut still
removes a trailing separator.

### Test and build

```bash
npm test
npm run test:watch
npm run typecheck
npm run build
npm run dev
```

The test suite includes a 4,205-word Turkish corpus in
`tests/fixtures/turkish-words.ts`. It is derived from MIT-licensed
FrequencyWords data; see `tests/fixtures/README.md` for source and license
details. Transliteration is character-based and does not require a runtime
dictionary.

#### Full corpus validation (616,760 words)

The regular suite keeps a fast 4,205-word fixture. The full corpus is
downloaded, merged, and validated by standalone scripts:

```bash
npm run corpus
npm run corpus:build
npm run corpus:validate
```

Two MIT sources (FrequencyWords and a Wikipedia-derived Turkish wordlist) are
used. 616,760 unique words are checked for ASCII output, idempotency, and
Turkish casing. The result is written to `reports/corpus-report.json`; the
validated corpus is committed as `data/turkish-words-616760.txt`, while raw
downloads stay in `.cache/`. The data file is not published in the npm
package. Sources and licenses: `scripts/corpus-sources.md`.

### Contributing

1. Fork the repository and create a branch.
2. Add a test for any behavior change.
3. Run `npm run typecheck && npm test && npm run build`.
4. Open a pull request describing the change.

Small, focused changes and new tests are welcome.

### License

[MIT](./LICENSE) © 2026 Officalbluehair
