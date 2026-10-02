# Book state and storage commits

## 1. Scope / Trigger

List writes span DOM events, in-memory books and browser localStorage. A failed rename must not contaminate later add/read/delete writes. This spec records executable seams in `app/app.js`; business rules remain in the approved task contracts.

## 2. Signatures

- `loadBooks(): Book[]` retains the existing valid-record loader without writeback.
- `persist(candidate: Book[]): boolean` serializes and calls setItem before assigning books; false means memory is untouched.
- `validateTitle(rawTitle: string, target: Book): string` returns empty string on success or a user-facing validation error.
- `createEditor(book: Book, index: number): HTMLFormElement` binds the target by reference. index labels DOM only.
- `focusControl(book: Book | null, kind: "edit" | "editor" | "checkbox")` focuses a live control or current filter.
- `deleteBook(book: Book): void` commits a saved shallow snapshot and full-array index to the latest ephemeral undo only after persistence succeeds.
- `undoLatestDelete(): void` checks whole-list title collision before building and persisting a restored candidate; consumes the record only after success.

## 3. Contracts

Key `page-between-reading-list`: ordered JSON array of `{title: string, read: boolean}`. Preserve unknown legacy fields with target spread and non-target references. No persisted identity, draft, filter or migration. `editor = null | {book, draft, error}` is ephemeral. A read replacement rebinds editor.book only after persistence succeeds; removing another book must not shift the target identity.

## 4. Validation / Error Matrix

| Input/boundary | Expected behavior |
|---|---|
| trim empty | reject with EMPTY_TITLE message; keep raw input |
| raw UTF-16 length >80 | reject; do not set editor maxlength or silently truncate |
| lowercase collision with another saved book, including hidden rows | reject; exclude target reference only |
| own title/case-only title, <=80 | persist then exit |
| setItem/stringify throws | false; preserve books, saved snapshot, editor/filter; focus error input; no success |
| target deleted | terminate stale edit; never append or revive it |
| composing/isComposing/229 Enter | suppress implicit submit; composing Escape does not cancel |

## 5. Good / Base / Bad Cases

- Good: rename second duplicate historical title by its object reference; all fields/order of the first remain unchanged.
- Base: save ` Dune ` or `DUNE` on the same object, preserving read and position.
- Bad: filtered unread row renamed to hidden read `Dune`; reject based on the entire books array.

## 6. Tests Required

Use actual product DOM and Storage boundary in an isolated registered browser. Assert saved JSON and memory on write failure, extension-field/duplicate/long-title legacy fixtures, read rebind, other-book delete, stale target, unchanged filters/counts, retry/revisit, length boundaries and safe textContent. Separate real Tab/Enter/Escape paths from synthesized CompositionEvent/isComposing/229 checks. System IME and screen-reader claims require their own human evidence, not fill or screenshots.

Reproducible Issue 71 fixture and plans live under `docs/05-validation/tasks/71/`; no testing entrypoint is shipped in app/index.html. Tests may read lexical state from the child frame, but product code must not export a debug API.

Issue 82 uses the actual `app/` root with registered check's `storage_write_failure`, `snapshot_storage` and `unchanged_storage`, public UI retry and reload. Do not reuse the earlier iframe fixture or require internal deep comparison as a user acceptance gate. `tests/undo.test.cjs` independently checks internal guards, order, references and legacy extension fields; these are unit checks, not real-browser journeys.

## 7. Latest deletion contract (Issue 82)

`undoRecord = null | {book: savedSnapshot, index: fullArrayIndex}` and `undoError` exist only in memory. Existing adds, renames, read/filter changes and validation failures do not clear them. The persistent key and JSON shape stay unchanged.

Use a copied array and `candidate.splice(Math.min(index, candidate.length), 0, book)`; never splice the live array. A missing delete target or absent record is a no-op. Whole-list case-insensitive conflict rejects without writing. Failed writes retain the opportunity, current books, editor draft/error and filter. Successful delete replaces the record; successful undo clears it. Restore editor input focus first, otherwise restored edit control/current filter. Keep the undo button node stable on failure so focus stays live.

Good: delete B from A/B/C, add D, restore A/B/C/D with B's saved read flag. Base: delete C then A, restore only A/B. Bad: restore A while hidden saved title `a` exists; reject and explain renaming before retry. Unit tests assert exact order/fields; real plans cover add/rename conflicts, hidden restoration, draft continuation and storage failures.

Rendering untrusted long titles must also wrap feedback (`.form-message { overflow-wrap: anywhere; }`), not just list and undo text. Otherwise the add-panel grid's min-content width can overflow a 320px viewport. Keep the failing and corrected screenshots as regression evidence.

## 8. Wrong vs Correct

Wrong: mutate saved state before calling a potentially failing write:

```javascript
book.title = rawTitle.trim();
localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
```

Correct: preserve non-target records and commit only after actual write success:

```javascript
const replacement = { ...book, title: rawTitle.trim() };
const candidate = books.map((entry) => entry === book ? replacement : entry);
if (!persist(candidate)) {
  return;
}
```

The caller must render the approved failure message and retain editor.draft on false; never clear localStorage or perform a second rollback write. Use textContent/value for untrusted title; don't use title as a key or index into the saved array using filtered-row positions.
