# Full corpus sources

The full validation corpus targets **616,760 unique Turkish words**. It is
generated locally; it is not committed to git and it is not included in the
published npm package.

## Sources

| Source | Role | License | Pinned file |
| --- | --- | --- | --- |
| [FrequencyWords](https://github.com/hermitdave/FrequencyWords) | Common word frequency list | MIT, Copyright (c) 2016 Hermit Dave | `content/2018/tr/tr_50k.txt` at `525f9b5` |
| [Turkish Wordlist](https://github.com/csariyildiz/turkish-wordlist) | 2.5M Wikipedia-derived Turkish tokens | MIT, Copyright (c) 2024 Çağrı Sarıyıldız | `tr_wordlist.zip` at `042c406` |

MIT license texts for both datasets are in
[`corpus-sources.LICENSE`](./corpus-sources.LICENSE).

TDK-derived repositories were not used because they do not expose a clear
data license. The two sources above are explicitly MIT-licensed.

## Selection

1. Add a curated set of edge-case words (`İ`, `I`, `ı`, `â`, `î`, `û`,
   apostrophes) so every Turkish-specific letter is covered.
2. Add valid unique words from the FrequencyWords list.
3. Add valid unique words from the Wikipedia-derived list in its pinned file
   order until the target is reached.
4. Filter to lowercase words containing only the Turkish alphabet and an
   optional internal apostrophe, with a length of 2–30 characters.
5. Deduplicate and stop at exactly **616,760** words.

The resulting selection is deterministic for the pinned source revisions.

## Commands

```bash
npm run corpus           # build the package, download, build, validate
npm run corpus:build     # download and build .cache/corpus.txt
npm run corpus:validate  # validate an existing .cache/corpus.txt
```

`npm run corpus:build -- --force` re-downloads both sources.
`npm run corpus:build -- --target=10000` builds a smaller corpus for a quick
check.

## Output

- `.cache/tr_50k.txt` and `.cache/tr_wordlist.zip` — cached downloads
- `.cache/corpus.txt` — 616,760 words, one per line
- `.cache/corpus-meta.json` — source, target, letter coverage and SHA-256
- `reports/corpus-report.json` — validation result

The `.cache/` directory is ignored by git. The report is committed so the
validation result can be reviewed without downloading the sources.
