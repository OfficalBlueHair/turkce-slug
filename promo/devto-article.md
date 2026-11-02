# Türkçe Slug Üretirken I/ı/İ/i Sorununu Çözmek

> Kısa özet: JavaScript'in varsayılan `toLowerCase()` davranışı Türkçede
> `İSTANBUL` kelimesini `i̇stanbul`, `IĞDIR` kelimesini `iğdir` yapar.
> `turkce-slug`, Türkçe harfleri açık kurallarla işleyen, sıfır runtime
> bağımlılıklı bir TypeScript paketi. 616.760 kelimede 0 hata.

## Sorun

Türkçede dört I harfi vardır ve JavaScript'in locale'den bağımsız
`toLowerCase()` / `toUpperCase()` davranışı bunları doğru yönetmez:

```js
"İSTANBUL".toLowerCase(); // "i̇stanbul" (i + combining dot)
"IĞDIR".toLowerCase();    // "iğdir"  (Türkçede "ığdır" olmalı)
"istanbul".toUpperCase(); // "ISTANBUL" (Türkçede "İSTANBUL" olmalı)
```

Bu yüzden birçok slug kütüphanesi Türkçe başlıkları bozar:

- `İSTANBUL` → `istanbul` yerine `i̇stanbul` (i + birleşik nokta)
- `İstanbul'da Iğdır` → `istanbulda-igdir` yerine `i̇stanbul'da-iğdir`
  veya `i-stanbul-da-igdir`
- `ŞÜKRÜ ÇAĞLAR` → `sukru-caglar` yerine `şükrü-çağlar`
- Case dönüşümünde `IĞDIR` → `ığdır` yerine `iğdir`

Türkçe kuralları açıktır:

| Girdi | Doğru çıktı |
| --- | --- |
| `İ` | `i` |
| `I` | `ı` |
| `i` | `İ` |
| `ı` | `I` |

Slug üretiminde ise bu harflerin ASCII karşılıkları gerekir.

## Çözüm: açık harf eşlemesi

`turkce-slug`, `I/ı/İ/i` için locale'e güvenmek yerine harfleri açıkça
eşler. Bu hem tarayıcıda hem Node.js'te aynı sonucu verir.

```ts
import { slugify } from "turkce-slug";

slugify("İSTANBUL");              // "istanbul"
slugify("IĞDIR");                 // "igdir"
slugify("İstanbul'da Iğdır");     // "istanbulda-igdir"
slugify("Çok Güzel Bir Başlık!"); // "cok-guzel-bir-baslik"
slugify("ŞÜKRÜ ÇAĞLAR");          // "sukru-caglar"
slugify("Mesafe: 100 Km / Gün");  // "mesafe-100-km-gun"
```

Kurulum:

```bash
npm install turkce-slug
```

Paket ESM ve CommonJS çıktılarını, ayrıca TypeScript tiplerini birlikte
sunar. Runtime bağımlılığı yoktur.

## Türkçe büyük/küçük harf dönüşümleri

Slug dışında Türkçe case dönüşümleri de doğru çalışır:

```ts
import {
  toLowercaseTr,
  toUppercaseTr,
  capitalizeTr,
  titleCaseTr,
  removePunctuation,
} from "turkce-slug";

toLowercaseTr("İSTANBUL"); // "istanbul"
toLowercaseTr("IĞDIR");    // "ığdır"
toLowercaseTr("ISIK");     // "ısık"

toUppercaseTr("istanbul"); // "İSTANBUL"
toUppercaseTr("ışık");     // "IŞIK"

capitalizeTr("iĞDIR");     // "İğdır"
titleCaseTr("ışık ırmak"); // "Işık Irmak"

removePunctuation("Merhaba, dünya!"); // "Merhaba dünya"
```

## Slug seçenekleri

```ts
slugify("Çok Güzel", { separator: "_" });       // "cok_guzel"
slugify("Çok Güzel", { lowercase: false });     // "Cok-Guzel"
slugify("Çok güzel bir başlık örneği", {
  maxLength: 10,
});                                             // "cok-guzel"
slugify("Mesafe: 100 Km", { preserveNumbers: false }); // "mesafe-km"
```

- `separator` varsayılan `"-"`.
- `lowercase` varsayılan `true`; kapatınca `Ç → C`, `İ → I` gibi
  kaynak büyüklüğü korunur.
- `trim` baş/son separator temizliğini kontrol eder.
- `maxLength` mümkünse kelime sınırından keser ve sonucu separator ile
  bitirmez.
- `preserveNumbers` varsayılan `true`; `false` iken rakamlar kaldırılır.

## 616.760 kelimelik doğrulama

Kütüphanenin gerçekten kapsamlı çalıştığını göstermek için iki MIT lisanslı
kaynaktan oluşturulan **616.760 kelimelik** bir doğrulama korpusu
kullanıyorum:

- [FrequencyWords](https://github.com/hermitdave/FrequencyWords)
- [Turkish Wordlist](https://github.com/csariyildiz/turkish-wordlist)

Her kelime için üç kontrol yapılıyor:

1. Slug yalnızca ASCII karakterler içeriyor mu?
2. Slug idempotent mi? (`slugify(slug) === slug`)
3. Türkçe büyük/küçük harf round-trip tutarlı mı?

Sonuç: **616.760 / 616.760 geçti, 0 hata.** Tüm Türkçe özel harfler
(`ç ğ ı ö ş ü â î û`) korpusta yer alıyor. Rapor ve korpus GitHub'da:

- [Doğrulama raporu](https://github.com/OfficalBlueHair/turkce-slug/blob/main/reports/corpus-report.json)
- [Korpus snapshot](https://github.com/OfficalBlueHair/turkce-slug/blob/main/data/turkish-words-616760.txt)

## Canlı demo

Tarayıcıda canlı `slugify`, Türkçe case dönüşümleri ve kelime doğrulaması:

**https://officalbluehair.github.io/turkce-slug/**

Demo, 4.205 kelimelik hızlı test setini çalıştırır. Tam 616.760 kelimelik
korpus ve rapor GitHub deposunda bulunur.

## Kaynaklar

- npm: https://www.npmjs.com/package/turkce-slug/v/0.1.0
- GitHub: https://github.com/OfficalBlueHair/turkce-slug
- Lisans: MIT

Türkçe slug veya case dönüşümüyle ilgili bir hata görürsen issue açabilirsin.
Geri bildirim ve katkılar memnuniyetle karşılanır.
