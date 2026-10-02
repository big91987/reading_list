# Book state and storage commits

## 1. Scope / Trigger

List writes span DOM events, in-memory books and browser localStorage. A failed rename must not contaminate later add/read/delete writes. This spec records executable seams in `app/app.js`; business rules remain in the approved task contracts.

## 2. Signatures

- `loadBooks(): Book[]` retains the existing valid-record loader without writeback.
- `persist(candidate: Book[]): boolean` serializes and calls setItem before assigning books; false means memory is untouched.
- `validateTitle(rawTitle: string, target: Book): string` returns empty string on success or a user-facing validation error.
- `createEditor(book: Book, index: number): HTMLFormElement` binds the target by reference. index labels DOM only.
- `focusControl(book: Book | null, kind: "edit" | "editor" | "checkbox")` focuses a live control or current filter.

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

## 7. Wrong vs Correct

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

## 8. Filter-count projection

`render(): void` derives all/read/unread from the successfully loaded or committed full `books`, never from `getVisibleBooks()`. Reuse the summary's readCount and compute unread as `books.length - readCount`. Update each existing button's `.filter-count` textContent; don't replace button nodes, change focus, add a fixed aria-label hiding numbers, store counts or increment counters in command handlers.

```javascript
const counts = { all: books.length, unread: books.length - readCount, read: readCount };
button.querySelector(".filter-count").textContent = counts[button.dataset.filter];
```

Good: changing filters preserves all three counts and the saved JSON. Base: empty effective collection displays three selectable zeros. Bad: a failed Storage.setItem changes counts, or invalid legacy records are counted using the raw saved array length. Existing load/persist error contracts remain unchanged. The reason for one render-time projection is to prevent stale counters and divergent summary values.

Required tests: initial/filtered counts, successful add/delete/bidirectional read with individual reload, invalid input and Storage write failures with full snapshot equality plus recovery retry, legacy invalid subsets, edit/cancel unchanged counts, native keyboard focus/names, 320px four-digit whole-button wrap and no overflow. Physical touch and screen readers require human evidence. Issue74 executable fixtures live under docs/05-validation/tasks/74/tests/ and are temporarily staged then restored; no fault controls belong in the shipped app. Product-owned regression locators live in `tests/browser/core.json`: retain all core business actions/assertions and synchronize only changed accessible names. The Runner prefers this nonempty plan; legacy `.harness/reading-core.json` is fallback and remains protected. Never hide approved count text to satisfy stale tests.
