# Turkish word corpus snapshot

- **File:** `turkish-words-616760.txt`
- **Words:** 616,760 unique lowercase Turkish words, one per line, UTF-8
- **Size:** 7,043,350 bytes
- **SHA-256:** `9a2fb9b081e9076741ce462c362fb11dbc349301e743ef4f8cfe03823f07f8b1`
- **Validation:** 616,760 / 616,760 passed; 0 failures

## Sources

The corpus is built from two MIT-licensed datasets:

- [FrequencyWords](https://github.com/hermitdave/FrequencyWords), Copyright (c) 2016 Hermit Dave
- [Turkish Wordlist](https://github.com/csariyildiz/turkish-wordlist), Copyright (c) 2024 Çağrı Sarıyıldız

Full source URLs, pinned revisions, selection rules, and license texts:

- [`../scripts/corpus-sources.md`](../scripts/corpus-sources.md)
- [`../scripts/corpus-sources.LICENSE`](../scripts/corpus-sources.LICENSE)

## Reproduce

```bash
npm run corpus:build
```

The generator writes `.cache/corpus.txt`. The committed snapshot is the same
file and can be verified with its SHA-256. `npm run corpus` also validates the
corpus and writes [`../reports/corpus-report.json`](../reports/corpus-report.json).

This snapshot is repository data only. It is not included in the npm package.
