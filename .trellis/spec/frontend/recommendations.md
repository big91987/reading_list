# Public catalogue and private snapshots

## Scope / Signatures

Issue100 C-01..05 is the authority. `verifiedCatalogue(value)` validates schema, safe origins and canonical SHA256 before public replacement. `refreshCatalogue()` GETs absolute `/__recommendations/catalogue.json`, credentials omitted, bounded 1MiB/10s, independent cache key. `persist(candidate)` compares current private raw storage with `storageSnapshot`, writes before memory assignment; invalid originals never become empty successes.

`catalogueInformation(record)` copies adopted identity/origins. `appendBookInformation(item, book)` exposes editing and explicit candidates. `markInformationForReview(replacement)` preserves metadata and changes only link verification after rename. An old-version rename is detected at rendering by titleAtAdoption mismatch without a loading write.

## Error Matrix / Cases

- Good: explicit adoption fills only absent types/summary/author/edition; manual and unknown fields retained; source snapshot does not track public refresh.
- Base: no metadata legacy record loads unchanged; manual add optionally records schemaVersion1 information.
- Bad: incompatible **present** bookInfo including null/0 must not be overwritten. Check `Object.hasOwn`, not truthiness.
- Invalid revision/version/unsafe link/oversize: preserve last public cache and private data. Cache storage failure retains memory and reports a separate warning.
- Concurrent raw change: preserve external latest bytes and local draft; ask refresh/retry, no silent overwrite.
- Delete: deep snapshot of full object at original index; failed restoration keeps opportunity.

## Required Tests

Run existing Node tests, recommendations.test.cjs, Python recommendations_test.py, tests/browser/core.json and Issue100 feature/browser plans through registered check. HTTP route/scheduler/collector tests are distinct from browser fixture tests; neither implies installed launchd or deployed release. Native 200% zoom and hasTouch context provide their own evidence; AX tree is not spoken screen-reader certification.

## Wrong vs Correct

Wrong: `if (book.bookInfo)` permits clobbering an existing null namespace; assigning memory before setItem or trusting an unverified cache permits data corruption.

Correct: `Object.hasOwn(book, "bookInfo") && !validInformation(book.bookInfo)` refuses metadata edits, and raw conflict comparison occurs inside every private commit. All untrusted titles/summaries are textContent, and origin anchors are validated HTTPS with noopener/noreferrer.

The product remains one static app.js script with isolated functions rather than undeclared cross-script globals; do not waive Owner ESLint no-undef or ship test controls/debug APIs. `[hidden]` must override display:grid panels so closed views are actually absent from pointer/keyboard/AX flows.
