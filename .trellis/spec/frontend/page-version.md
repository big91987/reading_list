# Static product version

Issue #97 defines the product version in one `span#app-version` in app/index.html:

```html
<p class="app-version">版本 <span id="app-version">0.1.0 rc2</span></p>
```

Preserve exact case and internal whitespace. The maintainer updates this node through ordinary reviewed product changes, and updates the test expectation. Do not read deploy/release.json: it declares data compatibility, not the visible product version. Do not add JS, API, network, persistent fields, duplicate ARIA text, live regions or tab stops. Keep the original footer motto and use normal document flow with muted 0.875rem text, 1.5 line height and 8px top margin.

Keep `footer { max-width: 100vw; }`: the existing body has min-width:320px, while a 320px window at native 200% zoom has a 160 CSS px layout viewport. An unconstrained footer would center its version outside that viewport. Limit only the footer rather than refactoring unrelated business layout. Compare baseline document width to prove no new horizontal overflow; do not claim pre-existing main overflow at160 CSS px is fixed.

Good: a static version remains visible when storage fails. Bad: dynamically derive it from saved book data, or call a version endpoint. Static tests assert the unique node and no interactive attributes; real-browser plans assert visibility across states, unchanged raw storage and zero additional writes, core/edit/undo, desktop/320px, keyboard and touch-capable activation. Use native `zoom` plus task `page_script` bounds assertions and `accessibility` AX capture. The label and value can appear as separate StaticText nodes because of the span; validate both and their common paragraph. CSS zoom simulation and DOM attribute checks are not native browser zoom or AX evidence, and an AX tree is not screen-reader audio. Shared tool failures must remain failed; do not suppress trusted checks or patch the Harness from product tasks.
