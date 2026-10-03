# Static filter explanations

## Scope and executable contract

Issue #94 adds only visual explanations to the existing three filter buttons. Keep the business click handlers and storage contract in [book-state.md](book-state.md) unchanged.

HTML: one `.filter-tooltip[aria-hidden="true"]` span inside each existing native button. Exact text is all→显示所有书籍, unread→只显示未读书籍, read→只显示已读书籍. Do not add title, tab stops, interactive children or user-provided content.

CSS: default display:none; absolute bottom:100%, left:0 inside the existing position:relative button. Show only under `(hover: hover) and (pointer: fine)` using `.filter-button:hover:not(.tooltip-dismissed) .filter-tooltip`. The contiguous child tooltip keeps parent :hover while the pointer enters it; no gap or pointer-events:none. Do not change button padding or normal layout to fit the explanation.

Events: document keydown Escape adds tooltip-dismissed only to currently :hover buttons; pointerleave removes it. Neither listener may consume the event, render, change currentFilter/editor/books or call persist. Good: Escape hides one current explanation, leave/reenter restores it. Base: non-Escape has no side effects. Bad: dismissal lasts across visits, cancels filtering, or modifies storage.

## Required verification and evidence limits

Run `node --test tests/filter-tooltip.test.cjs` for ephemeral dismissal and the selected-filter×entry matrix, full book/extension-field equality and zero writes. Run registered browser check on actual app for visible explanations, Escape, leave/reentry, keyboard filtering, storage snapshots, empty/no-result and existing core/edit/undo journeys. These unit and click-based checks do not prove pure hover dwell, movement into the tooltip, real no-hover touch activation, cross-engine support or screen-reader announcements; record missing capabilities separately and never label them passed. Desktop viewport resizing is not touch emulation.

The official check now supports `hover` with duration_ms, `pointer`, `tap`, first-step `device`, selector locators, geometry snapshots and storage write observations. Use Issue #94 browser-plan.json plus browser-hover-read/unread and empty-state plans for actual no-click hover, browser-layout/button-geometry for unchanged bounds, and browser-touch for a separate hasTouch/isMobile context. Pair unchanged_storage with unchanged_storage_writes after snapshot_storage, including across reload: equal saved bytes alone do not exclude redundant writes. Fixture setup may legitimately write before the snapshot; report zero additional calls, not zero calls for the whole plan. State touch emulation and untested physical devices/other engines explicitly.
