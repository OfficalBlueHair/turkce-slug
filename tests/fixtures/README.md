# Turkish word corpus

`turkish-words.ts` is a test-only sample of Turkish words used to check
slug generation and Turkish casing across real vocabulary.

## Source

- Repository: https://github.com/hermitdave/FrequencyWords
- File: `content/2018/tr/tr_50k.txt`
- Pinned revision: [525f9b560de45753a5ea01069454e72e9aa541c6](https://github.com/hermitdave/FrequencyWords/commit/525f9b560de45753a5ea01069454e72e9aa541c6)
- License: MIT, Copyright (c) 2016 Hermit Dave. See
  [`turkish-words.LICENSE`](./turkish-words.LICENSE).

## Selection

The sample was generated once from the source file:

1. Keep words that consist only of Turkish letters and an optional internal
   apostrophe.
2. Keep words between 2 and 20 characters.
3. Take the first 1,500 valid words in frequency order.
4. Add up to 500 words containing Turkish-specific letters.
5. Add a small curated set of edge cases (`İ`, `I`, `ı`, `â`, `î`, `û`,
   apostrophes, mixed case).
6. Deduplicate while keeping frequency order.

The result contains 1,519 unique words and covers every Turkish-specific
letter.

This directory is test data only. It is excluded from the published npm
package by the `files` field in `package.json`.
